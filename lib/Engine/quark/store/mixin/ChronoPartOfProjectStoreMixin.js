import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { ChronoPartOfProjectGenericMixin } from "../../ChronoPartOfProjectGenericMixin.js";
import { ChronoStoreMixin } from "./ChronoStoreMixin.js";
import { AbstractPartOfProjectStoreMixin } from "./AbstractPartOfProjectStoreMixin.js";
/**
 * This a base mixin for every Store, that belongs to a ChronoGraph powered project.
 */
export class ChronoPartOfProjectStoreMixin extends Mixin([
    AbstractPartOfProjectStoreMixin,
    ChronoPartOfProjectGenericMixin,
    ChronoStoreMixin
], (base) => {
    const superProto = base.prototype;
    class ChronoPartOfProjectStoreMixin extends base {
        constructor() {
            super(...arguments);
            this.removalOrder = 0;
        }
        setStoreData(data) {
            // Inform project that a store is being repopulated, to avoid expensive unjoins.
            // Should not repopulate when using syncDataOnLoad
            this.project?.repopulateStore(this);
            superProto.setStoreData.call(this, data);
        }
        register(record) {
            superProto.register.call(this, record);
            // NOTE: Remove check for `this.project.graph` if we want records added after the initial calculations to also have
            //       delayed entry into the replica
            // @ts-ignore
            !record.isRoot && !this.project?.graph && this.project?.scheduleDelayedCalculation();
        }
        onModelChange(record, toSet, wasSet, silent, fromRelationUpdate, skipAccessors) {
            // 1. call will forward value to the chrono, leaving model.data intact
            // 2. value was changed, so model.afterChange is called too, triggering `update` event on store
            // 3. autoCommit is scheduled
            // 4. autoCommit finalizes, calling endBatch
            // 5. endBatch calls `set` again, passing argument `skipAccessors = true`, which means data will be set to
            // the `model.data` now
            // 6. since value differs in chrono and in model.data, `afterChange` will be called once again
            // Naturally this leads to two identical events being fired for this call:
            // `dependency.set('type', 0)`
            //
            // Idea of the fix is to mute events for the first call IF chrono field is in the `wasSet` object
            // Covered by DependencyEdit.t.js
            if (!skipAccessors
                && !(this.syncDataOnLoad && this.isLoadingData)
                && Object.keys(wasSet).some(key => key !== 'intervals' && record.$entity.getField(key))
                // https://github.com/bryntum/support/issues/6347
                // it seems this workaround with `silent = true` was purposed for the change initiated by user
                // the comment above suggest `dependency.set('type', 0)` call
                // It is probably not applicable for the crudmanager "sync" phase
                // @ts-ignore
                && !this.project?.applyingSyncResponse) {
                silent = true;
            }
            //@ts-ignore
            super.onModelChange(record, toSet, wasSet, silent, fromRelationUpdate, skipAccessors);
        }
    }
    return ChronoPartOfProjectStoreMixin;
}) {
}
