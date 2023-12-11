import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate } from '../../../../ChronoGraph/replica/Entity.js'
import { isAtomicValue } from '../../../../ChronoGraph/util/Helpers.js'
import { DateInterval } from '../../../scheduling/DateInterval.js'
import { ConstraintType, DependencyType, Direction, EffectiveDirection, TimeUnit } from '../../../scheduling/Types.js'
import { BaseCalendarMixin } from '../scheduler_basic/BaseCalendarMixin.js'
import { ScheduledByDependenciesEarlyEventMixin } from "../scheduler_pro/ScheduledByDependenciesEarlyEventMixin.js"
import { SchedulerProDependencyMixin } from "../scheduler_pro/SchedulerProDependencyMixin.js"
import { SchedulerProProjectMixin } from "../scheduler_pro/SchedulerProProjectMixin.js"
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin adds support for scheduling event ALAP, by dependencies. All it does is
 * create the "late" constraint interval for every outgoing dependency.
 *
 * See [[ConstrainedEarlyEventMixin]] for more details about constraint-based scheduling.
 * See also [[ScheduledByDependenciesEarlyEventMixin]].
 */
export class ScheduledByDependenciesLateEventMixin extends Mixin(
    [ ScheduledByDependenciesEarlyEventMixin, ConstrainedLateEventMixin ],
    (base : AnyConstructor<ScheduledByDependenciesEarlyEventMixin & ConstrainedLateEventMixin, typeof ScheduledByDependenciesEarlyEventMixin & typeof ConstrainedLateEventMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ScheduledByDependenciesLateEventMixin extends base {

        project             : SchedulerProProjectMixin


        * shouldSuccessorAffectScheduling (dependency : SchedulerProDependencyMixin) : CalculationIterator<boolean> {
            const toEvent : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.toEvent

            // ignore missing target events and inactive dependencies
            return toEvent && !isAtomicValue(toEvent) && (yield dependency.$.active)
                // and inactive target events (unless this event is also inactive)
                && (!(yield toEvent.$.inactive) || (yield this.$.inactive))
        }


        @calculate('lateStartDateIntervals')
        * calculateLateStartDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[] = yield* superProto.calculateLateStartDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            let dependency : SchedulerProDependencyMixin

            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency))) continue

                const successor : ScheduledByDependenciesLateEventMixin = yield dependency.$.toEvent
                const manuallyScheduled : boolean   = yield successor.$.manuallyScheduled

                let successorDate : Date

                switch (yield dependency.$.type) {
                    case DependencyType.StartToStart:
                        successorDate = manuallyScheduled
                            ? yield successor.$.startDate
                            : yield successor.$.lateStartDateRaw
                        break

                    case DependencyType.StartToEnd :
                        successorDate = manuallyScheduled
                            ? yield successor.$.endDate
                            : yield successor.$.lateEndDateRaw
                        break
                }

                if (successorDate) {
                    const lag : number                  = yield dependency.$.lag
                    const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                    const lagMS : number                = yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)

                    const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version

                    let endDate : Date                  = successorDate

                    // Take lag into account
                    if (lagMS) {
                        // Skip non-wroking time forward to constrain the event as late as possible
                        // (could affect if the event and successor use different calendars)
                        endDate = calendar.skipNonWorkingTime(calendar.calculateStartDate(successorDate, lagMS)) as Date
                    }

                    const interval : DateInterval  = dependencyConstraintIntervalClass.new({
                        owner       : dependency,
                        startDate   : null,
                        endDate,
                    })

                    intervals.unshift(interval)
                }

            }

            return intervals
        }


        * calculateLateEndDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[] = yield* superProto.calculateLateEndDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            let dependency : SchedulerProDependencyMixin

            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency))) continue

                const successor : ScheduledByDependenciesLateEventMixin = yield dependency.$.toEvent
                const manuallyScheduled : boolean   = yield successor.$.manuallyScheduled

                let successorDate : Date

                switch (yield dependency.$.type) {
                    case DependencyType.EndToEnd:
                        successorDate = manuallyScheduled
                            ? yield successor.$.endDate
                            : yield successor.$.lateEndDateRaw
                        break

                    case DependencyType.EndToStart:
                        successorDate = manuallyScheduled
                            ? yield successor.$.startDate
                            : yield successor.$.lateStartDateRaw
                        break
                }

                if (successorDate) {
                    const lag : number                  = yield dependency.$.lag
                    const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                    const lagMS : number                = yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)

                    const calendar : BaseCalendarMixin  = yield dependency.$.calendar
                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version

                    let endDate : Date                  = successorDate

                    // Take lag into account
                    if (lagMS) {
                        // Skip non-wroking time forward to constrain the event as late as possible
                        // (could affect if the event and successor use different calendars)
                        endDate = calendar.skipNonWorkingTime(calendar.calculateStartDate(successorDate, lagMS)) as Date
                    }

                    const interval : DateInterval   = dependencyConstraintIntervalClass.new({
                        owner               : dependency,
                        startDate           : null,
                        endDate,
                    })

                    intervals.unshift(interval)
                }
            }

            return intervals
        }


        * calculateEffectiveDirection () : CalculationIterator<EffectiveDirection> {
            const projectDirection : EffectiveDirection     = yield this.getProject().$.effectiveDirection
            const ownConstraintType : ConstraintType        = yield this.$.constraintType

            if (
                projectDirection.direction === Direction.Backward
                && !(yield this.$.manuallyScheduled)
                && !(
                    (ownConstraintType === ConstraintType.MustStartOn || ownConstraintType === ConstraintType.MustFinishOn)
                    && Boolean(yield this.$.constraintDate)
                )
            ) {
                for (const dependency of (yield this.$.outgoingDeps) as Set<SchedulerProDependencyMixin>) {
                    const successor : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.toEvent

                    const hasSuccessor = successor != null && !isAtomicValue(successor)

                    const constraintType : ConstraintType = hasSuccessor ? yield successor.$.constraintType : undefined

                    // ignore missing from events, unresolved from events (id given but not resolved),
                    // inactive dependencies and manually scheduled successors
                    if (
                        !hasSuccessor || !(yield dependency.$.active) || (yield successor.$.manuallyScheduled)
                        || (
                            (constraintType === ConstraintType.MustStartOn || constraintType === ConstraintType.MustFinishOn)
                            && Boolean(yield successor.$.constraintDate)
                        )
                    ) continue

                    // pick the direction of the successor from the right side
                    const dependencyType : DependencyType           = yield dependency.$.type
                    const successorDirection : EffectiveDirection   =
                        dependencyType === DependencyType.EndToEnd || dependencyType === DependencyType.StartToEnd
                            ? yield successor.$.endDateDirection
                            : yield successor.$.startDateDirection

                    if (successorDirection.direction === Direction.Forward) return {
                        // our TS version is a bit too old
                        kind        : 'enforced' as 'enforced',
                        direction   : Direction.Forward,
                        enforcedBy  : successorDirection.kind === 'enforced'
                            ? successorDirection.enforcedBy
                            : successorDirection.kind === 'own'
                                ? successor
                                : successorDirection.inheritedFrom
                    }
                }
            }

            return yield* super.calculateEffectiveDirection()
        }
    }

    return ScheduledByDependenciesLateEventMixin
}){}
