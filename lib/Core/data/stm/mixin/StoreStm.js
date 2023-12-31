/**
 * @module Core/data/stm/mixin/StoreStm
 */
import Base from '../../../Base.js';
import Model from '../../../data/Model.js';

const STM_PROP = Symbol('STM_PROP');

/**
 * Store mixin to make it compatible with {@link Core/data/stm/StateTrackingManager}.
 * @mixin
 */
export default Target => class StoreStm extends (Target || Base) {
    static get $name() {
        return 'StoreStm';
    }

    static get defaultConfig() {
        return {
            /**
             * Reference to STM manager
             *
             * @config {Core.data.stm.StateTrackingManager}
             * @default
             * @category Advanced
             */
            stm : null,

            /**
             * Set to `false` to not record transaction during `applyChangeset` call
             *
             * @prp {Boolean}
             * @default
             * @category Advanced
             */
            ignoreRemoteChangesInSTM : false
        };
    }



    get stm() {
        return this[STM_PROP];
    }

    set stm(stm) {
        const me = this;

        if (me.stm !== stm) {
            if (me.stm?.hasStore(me)) {
                me.stm.removeStore(me);
            }

            me[STM_PROP] = stm;

            if (me.stm && !me.stm.hasStore(me)) {
                me.stm.addStore(me);
            }
        }
    }

    // Overridden to notify STM about flat add action
    add(records, silent = false, options = {}) {
        let result;

        const { stm } = this;

        // Tree adding is routed via rootNode.appendChild() it has it's own
        // STM override thus if the store is tree we ignore the action
        if (!this.tree && stm?.enabled) {
            // Flat adding here only, the only data needed to undo/redo the action
            // is the list of records added.
            result = super.add(records, silent);
            // If adding wasn't vetoed and something has been added then
            // notifying the STM about the fact.
            if (result?.length) {
                stm.onStoreModelAdd(this, result, silent);
            }
        }
        else {
            result = super.add(records, silent, options);
        }

        return result;
    }

    // Overridden to notify STM about flat insert action
    insert(index, records, silent = false) {
        let result;

        const { stm } = this;

        // Tree inserting is routed via rootNode.insertChild() it has it's own
        // STM override thus if the store is tree we ignore the action
        if (!this.tree && stm?.enabled) {
            // Flat inserting here only, the only data needed to undo/redo the action is:
            // - the list of record inserted
            // - index they are inserted at
            // - index they have been at if they are part of this store already and are moved

            // Here we are getting indices of records which are in this store already
            // not all records might be from this store, some might be new or from another store
            const context = (Array.isArray(records) ? records : [records]).reduce(
                (context, r) => {
                    const index = r instanceof Model ? this.indexOf(r) : undefined;

                    if (index !== undefined && index !== -1) {
                        context.set(r, index);
                    }

                    return context;
                },
                new Map()
            );

            // Result here is the array of Models inserted or undefined,
            // and it might be different from `records` we received as argument.
            result = super.insert(index, records);

            // Here we check if anything has been actually inserted.
            // The insertion action might be vetoed by event handler or something
            if (result?.length) {
                // We can't rely on `index` we've got as argument since `result` might
                // differ from records.
                index = this.indexOf(result[0]);
                // Notifying STM manager about the insertion action providing all
                // the required data to undo/redo.
                stm.onStoreModelInsert(this, index, result, context, silent);
            }
        }
        else {
            result = super.insert(index, records, silent);
        }

        return result;
    }

    // Overridden to notify STM about flat removing action
    remove(recordsOrIds, silent = false, fromRemoveChild) {

        let result;

        const { stm } = this;

        // Tree removing is routed via rootNode.removeChild() it has it's own
        // STM override thus if the store is tree we ignore the action
        if (!this.tree && stm?.enabled) {
            // Flat removing here only, the only date needed to undo/redo the actions is:
            // - the list of records removed
            // - their original index to re-insert them back correctly
            const recordsOrIdsNormalized = (Array.isArray(recordsOrIds) ? recordsOrIds : [recordsOrIds]).map(r => this.getById(r)).filter(r => !!r);

            const context = recordsOrIdsNormalized.reduce(
                (context, r) => {
                    const index = this.indexOf(r);

                    if (index !== undefined && index !== -1) {
                        context.set(r, index);
                    }

                    return context;
                },
                new Map()
            );

            // Calling original store method
            result = super.remove(recordsOrIds, silent, fromRemoveChild);

            // Here we check if anything has been actually removed.
            // The removing action might be vetoed by event handler or something
            if (result?.length) {
                stm.onStoreModelRemove(this, result, context, silent);
            }
        }
        else {
            result = super.remove(recordsOrIds, silent, fromRemoveChild);
        }

        return result;
    }

    // Overridden to notify STM about flat clear action
    removeAll(silent) {
        const { stm } = this;

        let result;

        if (stm?.enabled) {
            // Here we are to detect if anything has been removed
            // the only way is to check if store has anything before removing all
            // and has nothing after.
            const
                { tree, rootNode, allRecords } = this,
                wasNotEmpty                    = allRecords.length,
                // need to store children/records before super method call, otherwise those would report empty list
                records                        = tree ? rootNode.children.slice() : allRecords.slice();

            result = super.removeAll(silent);

            // The trick here is to distinguish tree and flat case
            // For the flat case it's simple we just store all records
            // For the tree we are to store root node children only
            // Upon restoring store.add() will do the right thing for the flat case and tree case regardless.
            if (wasNotEmpty && this.count === 0) {
                stm.onStoreRemoveAll(this, records, silent);
            }
        }
        else {
            result = super.removeAll(silent);
        }

        return result;
    }

    beforeApplyChangeset() {
        const { stm, crudManager } = this;

        let shouldResume  = false,
            transactionId = null;

        if (!crudManager?.applyingChangeset && stm?.enabled) {
            shouldResume = true;

            // If stm is recording at the moment, we need to stash changes and reject them
            if (stm.isRecording) {
                transactionId = stm.stash();
            }

            if (this.ignoreRemoteChangesInSTM) {
                stm.disable();
            }
            else {
                stm.startTransaction();
            }
        }

        return { shouldResume, transactionId };
    }

    // When applying changes while STM is in the recording state, first we need to discard local changes, then apply
    // changes from remote, then try to apply local changes. This would emulate starting transaction as if data was
    // already in the correct state
    applyChangeset(changes, transformFn, phantomIdField, remote, logChanges) {
        const
            {
                shouldResume,
                transactionId
            }   = this.beforeApplyChangeset(),
            log = super.applyChangeset(changes, transformFn, phantomIdField, remote, logChanges);

        this.afterApplyChangeset(shouldResume, transactionId);

        return log;
    }

    afterApplyChangeset(shouldResume, transactionId) {
        if (shouldResume) {
            const { stm } = this;

            if (this.ignoreRemoteChangesInSTM) {
                stm.enable();
            }
            else {
                stm.stopTransaction();
            }

            stm.applyStash(transactionId);
        }
    }
};
