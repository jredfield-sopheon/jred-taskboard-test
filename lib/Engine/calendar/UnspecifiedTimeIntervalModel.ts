import { AnyConstructor, Mixin } from "../../ChronoGraph/class/BetterMixin.js"
import { CalendarIntervalMixin } from "./CalendarIntervalMixin.js"
import { AbstractCalendarMixin } from "../quark/model/AbstractCalendarMixin.js"



// Calendar interval model denoting unspecified interval
export class UnspecifiedTimeIntervalModel extends Mixin(
    [ CalendarIntervalMixin ],
    (base : AnyConstructor<CalendarIntervalMixin, typeof CalendarIntervalMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class UnspecifiedTimeIntervalModel extends base {
        calendar        : AbstractCalendarMixin


        // @model_field({ type : 'number', defaultValue : 10 })
        priority        : number


        getCalendar () : AbstractCalendarMixin {
            return this.calendar
        }

        // NOTE: See parent class implementation for further comments
        getPriorityField () {
            if (this.priorityField != null) return this.priorityField

            return this.priorityField = this.getCalendar().getDepth()
        }
    }

    return UnspecifiedTimeIntervalModel
}) {}
