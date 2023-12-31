import StateBase, { throwInvalidMethodCall } from './StateBase.js';
import Transaction from '../Transaction.js';
import { STATE_PROP, QUEUE_PROP, POS_PROP, TRANSACTION_PROP, AUTO_RECORD_PROP } from '../Props.js';
import Registry from './Registry.js';
import { resetQueue } from '../Helpers.js';

/**
 * @module Core/data/stm/state/ReadyState
 */

/**
 * STM ready state class.
 *
 * @internal
 */
export class ReadyStateClass extends StateBase {

    canUndo(stm) {
        //      v
        // |*|*|
        return 0 < stm.position && stm.position <= stm.length;
    }

    canRedo(stm) {
        //  v
        // |*|*|
        return 0 <= stm.position && stm.position < stm.length;
    }

    onUndo(stm, steps) {
        let curPos = stm.position;

        const
            queue  = stm[QUEUE_PROP],
            newPos = Math.max(0, curPos - steps),
            next = () => {
                stm.notifyStoresAboutStateRestoringStart();

                const undoneTransactions = [];
                while (curPos !== newPos) {
                    const transaction = queue[--curPos];
                    transaction.undo();
                    undoneTransactions.push(transaction);
                }

                return [stm.autoRecord ? 'autoreadystate' : 'readystate', () => {
                    stm.notifyStoresAboutStateRestoringStop({ cause : 'undo', transactions : undoneTransactions });
                }];
            };

        return [{
            [STATE_PROP] : 'restoringstate',
            [POS_PROP]   : newPos
        }, next];
    }

    onRedo(stm, steps) {
        let curPos = stm.position;

        const
            queue  = stm[QUEUE_PROP],
            newPos = Math.min(queue.length, curPos + steps);

        const next = () => {
            stm.notifyStoresAboutStateRestoringStart();

            const redoneTransactions = [];
            do {
                const transaction = queue[curPos++];
                transaction.redo();
                redoneTransactions.push(transaction);
            }
            while (curPos !== newPos);

            return [stm.autoRecord ? 'autoreadystate' : 'readystate', () => {
                stm.notifyStoresAboutStateRestoringStop({ cause : 'redo', transactions : redoneTransactions });
            }];
        };

        return [{
            [STATE_PROP] : 'restoringstate',
            [POS_PROP]   : newPos
        }, next];
    }

    onEnable() {
        throwInvalidMethodCall();
    }

    onDisable() {
        return 'disabledstate';
    }

    onAutoRecordOn() {
        return {
            [STATE_PROP]       : 'autoreadystate',
            [AUTO_RECORD_PROP] : true
        };
    }

    onAutoRecordOff() {
        throwInvalidMethodCall();
    }

    onStartTransaction(stm, title) {
        const transaction = new Transaction({ title });

        return [{
            [STATE_PROP]       : 'recordingstate',
            [TRANSACTION_PROP] : transaction
        }, () => {
            stm.notifyStoresAboutStateRecordingStart(transaction);
        }];
    }

    onStopTransaction() {
        throwInvalidMethodCall();
    }

    onStopTransactionDelayed() {
        throwInvalidMethodCall();
    }

    onRejectTransaction() {
        throwInvalidMethodCall();
    }

    onResetQueue(stm, options) {
        return resetQueue(stm, options);
    }

    onModelUpdate()      {}
    onModelInsertChild() {}
    onModelRemoveChild() {}
    onStoreModelAdd()    {}
    onStoreModelInsert() {}
    onStoreModelRemove() {}
    onStoreRemoveAll()   {}
}

/**
 * STM ready state.
 *
 * @internal
 */
const ReadyState = new ReadyStateClass();
export default ReadyState;

Registry.registerStmState('readystate', ReadyState);
