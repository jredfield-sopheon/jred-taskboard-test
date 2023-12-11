import { Mixin } from "../../ChronoGraph/class/BetterMixin.js";
import { CalendarIntervalMixin } from "./CalendarIntervalMixin.js";

// Calendar interval model denoting unspecified interval
export class UnspecifiedTimeIntervalModel extends Mixin([CalendarIntervalMixin], (base) => {
    const superProto = base.prototype;
    class UnspecifiedTimeIntervalModel extends base {

        getCalendar() {
            return this.calendar;
        }
        // NOTE: See parent class implementation for further comments
        getPriorityField() {
            if (this.priorityField != null)
                return this.priorityField;
            return this.priorityField = this.getCalendar().getDepth();
        }
    }
    return UnspecifiedTimeIntervalModel;
}) {
}
