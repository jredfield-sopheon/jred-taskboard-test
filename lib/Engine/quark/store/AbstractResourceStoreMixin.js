import { Mixin } from "../../../ChronoGraph/class/Mixin.js";
import { AbstractPartOfProjectStoreMixin } from "./mixin/AbstractPartOfProjectStoreMixin.js";
const dataAddRemoveActions = {
    splice: 1,
    clear: 1
};
// Shared functionality for CoreResourceStore & ChronoResourceStore
export class AbstractResourceStoreMixin extends Mixin([AbstractPartOfProjectStoreMixin], (base) => {
    const superProto = base.prototype;
    class AbstractResourceStoreMixin extends base {
        constructor() {
            super(...arguments);
            this.assignmentsForRemoval = new Set();
        }
        // we need `onDataChange` for `syncDataOnLoad` option to work
        onDataChange(event) {
            // remove from a filter action must be ignored.
            const isAddRemove = dataAddRemoveActions[event.action];
            super.onDataChange(event);
            if (isAddRemove && event.removed?.length)
                this.afterResourceRemoval();
        }
        // it seems `onDataChange` is not triggered for `remove` with `silent` flag
        remove(records, silent) {
            const res = superProto.remove.call(this, records, silent);
            this.afterResourceRemoval();
            return res;
        }
        // it seems `onDataChange` is not triggered for `TreeStore#removeAll()`
        removeAll(silent) {
            const res = superProto.removeAll.call(this, silent);
            this.afterResourceRemoval();
            return res;
        }
        afterResourceRemoval() {

            const assignmentStore = this.getAssignmentStore();
            if (assignmentStore && !assignmentStore.allAssignmentsForRemoval) {
                const assignmentsForRemoval = [...this.assignmentsForRemoval].filter(assignment => !assignmentStore.assignmentsForRemoval.has(assignment));
                assignmentsForRemoval.length > 0 && assignmentStore.remove(assignmentsForRemoval);
            }
            this.assignmentsForRemoval.clear();
        }
        processRecord(resourceRecord, isDataset = false) {
            const existingRecord = this.getById(resourceRecord.id);
            const isReplacing = existingRecord && existingRecord !== resourceRecord;
            if (isReplacing) {

                //@ts-ignore
                for (const assignment of existingRecord.assigned || []) {
                    assignment.resource = resourceRecord;
                }
            }
            return resourceRecord;
        }
    }
    return AbstractResourceStoreMixin;
}) {
}
