import { ProposedOrPrevious } from '../../../../ChronoGraph/chrono/Effect.js'
import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { model_field } from '../../../chrono/ModelFieldAtom.js'
import { BaseAssignmentMixin } from '../scheduler_basic/BaseAssignmentMixin.js'
import { CommitResult } from '../../../../ChronoGraph/chrono/Graph.js'
import { calculate, field } from '../../../../ChronoGraph/replica/Entity.js'
import { CalculationIterator } from '../../../../ChronoGraph/primitives/Calculation.js'
import { HasEffortMixin } from './HasEffortMixin.js'
import { Duration } from '../../../scheduling/Types.js'

//---------------------------------------------------------------------------------------------------------------------
/**
 * A mixin for the assignment entity at the Scheduler Pro level.
 */
export class SchedulerProAssignmentMixin extends Mixin(
    [ BaseAssignmentMixin ],
    (base : AnyConstructor<BaseAssignmentMixin, typeof BaseAssignmentMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class SchedulerProAssignmentMixin extends base {

        event               : HasEffortMixin

        /**
         * A numeric, percent-like value, indicating the "contribution level"
         * of the resource availability on the event.
         * Number 100 means that the assigned resource spends 100% of its working time on the event.
         * And number 50 means that the resource spends only half of its available time on the event.
         * @field {Number} units
         */
        @model_field({ type : 'number', defaultValue : 100 })
        units               : number

        /**
         * Generated getter for the [[units]] field
         */
        getUnits : () => Number

        /**
         * Generated setter for the [[units]] field
         */
        setUnits : (units : number) => Promise<CommitResult>

        @calculate('units')
        * calculateUnits () : CalculationIterator<number> {
            const event : HasEffortMixin   = yield this.$.event

            // if event of assignment presents - we always delegate to it
            // (so that various assignment logic can be overridden by single event mixin)
            if (event) return yield* event.calculateAssignmentUnits(this)

            // otherwise use proposed or current consistent value
            return yield ProposedOrPrevious
        }

        @field({ lazy : true })
        effort          : number

        @field({ lazy : true })
        actualDate      : Date

        @field({ lazy : true })
        actualEffort    : number

        @calculate('effort')
        * calculateEffort () : CalculationIterator<Duration> {
            const event         = yield this.$.event

            if (event) {
                const startDate     = yield event.$.startDate
                const endDate       = yield event.$.endDate
                const calendar      = yield event.$.effectiveCalendar

                if (startDate && endDate) {
                    const map  = new Map()

                    map.set(calendar, [this])

                    return yield* event.calculateProjectedEffort(startDate, endDate, map)
                }
            }

            return null
        }


        @calculate('actualDate')
        * calculateActualDate () : CalculationIterator<Date> {
            const event         = yield this.$.event

            if (event) {
                const startDate : Date      = yield event.$.startDate
                const duration : Duration   = yield event.$.duration
                const percentDone : number  = yield event.$.percentDone

                return yield* event.calculateProjectedXDateWithDuration(startDate, true, duration * 0.01 * percentDone)
            }

            return null
        }


        @calculate('actualEffort')
        * calculateActualEffort () : CalculationIterator<Duration> {
            const event             = yield this.$.event

            if (event) {
                const startDate     = yield event.$.startDate
                const calendar      = yield event.$.effectiveCalendar
                const actualDate    = yield this.$.actualDate

                const assignmentsByCalendar = new Map()

                assignmentsByCalendar.set(calendar, [this])

                return yield* event.calculateProjectedEffort(startDate, actualDate, assignmentsByCalendar)
            }

            return null
        }
    }

    return SchedulerProAssignmentMixin
}){}
