import { CommitResult } from '../../../../ChronoGraph/chrono/Graph.js'
import { Transaction } from '../../../../ChronoGraph/chrono/Transaction.js'
import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { isAtomicValue, prototypeValue } from '../../../../ChronoGraph/util/Helpers.js'
import DateHelper from '../../../../Core/helper/DateHelper.js'
import Localizable from '../../../../Core/localization/Localizable.js'
import { ConflictResolution, ConstraintInterval, ConstraintIntervalDescription } from '../../../chrono/Conflict.js'
import { model_field } from '../../../chrono/ModelFieldAtom.js'
import "../../../localization/En.js"
import { DateInterval } from '../../../scheduling/DateInterval.js'
import {
    ConstraintType,
    DependencyType,
    Direction,
    Duration,
    EffectiveDirection,
    TimeUnit
} from '../../../scheduling/Types.js'
import { format } from '../../../util/Functions.js'
import { BaseCalendarMixin } from '../scheduler_basic/BaseCalendarMixin.js'
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js"
import { HasDependenciesMixin } from "../scheduler_basic/HasDependenciesMixin.js"
import { ConstrainedEarlyEventMixin } from './ConstrainedEarlyEventMixin.js'
import { HasDateConstraintMixin } from "./HasDateConstraintMixin.js"
import { SchedulerProDependencyMixin } from './SchedulerProDependencyMixin.js'
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin adds support for scheduling event ASAP, by dependencies. All it does is
 * create the constraint interval for every incoming dependency. See [[ConstrainedEarlyEventMixin]] for
 * more details about constraint-based scheduling.
 *
 * The supported dependency types are listed in this enum: [[DependencyType]]
 */
export class ScheduledByDependenciesEarlyEventMixin extends Mixin(
    // This mixin's `calculateEffectiveDirection` method should override the one of the `HasChildrenMixin`
    // thus the dependency on it (not strictly needed)
    [ ConstrainedEarlyEventMixin, HasDependenciesMixin, HasChildrenMixin, HasDateConstraintMixin ],
    (base : AnyConstructor<
        ConstrainedEarlyEventMixin & HasDependenciesMixin & HasChildrenMixin & HasDateConstraintMixin,
        typeof ConstrainedEarlyEventMixin & typeof HasDependenciesMixin & typeof HasChildrenMixin & typeof HasDateConstraintMixin
    >) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ScheduledByDependenciesEarlyEventMixin extends base {

        project             : SchedulerProProjectMixin


        /**
         * Inactive events do not affect successors nor rollup their attributes to parent events.
         */
        @model_field({ type : 'boolean' })
        inactive            : Boolean


        setInactive : (value : boolean) => Promise<CommitResult>

        /**
         * The method defines wether the provided dependency should constrain the successor or not.
         * If the method returns `true` the dependency constrains the successor and does not do that when `false` returned.
         * By default the method returns `true` if the dependency is [[SchedulerProDependencyMixin.active|active]]
         * and if this event is [[inactive|active]] (or both this event and the successor are [[inactive]]).
         *
         * This is used when calculating [[earlyStartDateConstraintIntervals]].
         * @param dependency Dependency to consider.
         * @returns `true` if the dependency should constrain successor, `false` if not.
         */
        * shouldPredecessorAffectScheduling (dependency : SchedulerProDependencyMixin) : CalculationIterator<boolean> {
            const fromEvent : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent

            // ignore missing from events and inactive dependencies
            return fromEvent && !isAtomicValue(fromEvent) && (yield dependency.$.active)
                // ignore inactive predecessor (unless we both are inactive)
                && (!(yield fromEvent.$.inactive) || (yield this.$.inactive))
        }


        * calculateEarlyStartDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[]    = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            for (const dependency of (yield this.$.incomingDeps)) {
                // ignore missing from events and inactive predecessors/dependencies
                if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue

                const predecessor : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent
                const manuallyScheduled : boolean   = yield predecessor.$.manuallyScheduled

                let predecessorDate : Date

                switch (yield dependency.$.type) {
                    case DependencyType.EndToStart:
                        predecessorDate           = manuallyScheduled
                            ? yield predecessor.$.endDate
                            : yield predecessor.$.earlyEndDateRaw
                        break

                    case DependencyType.StartToStart:
                        predecessorDate        = manuallyScheduled
                            ? yield predecessor.$.startDate
                            : yield predecessor.$.earlyStartDateRaw
                        break
                }

                if (predecessorDate) {
                    const lag : Duration                = yield dependency.$.lag
                    const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                    const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version

                    const interval : DateInterval       = dependencyConstraintIntervalClass.new({
                        owner       : dependency,
                        startDate   : calendar.calculateEndDate(
                            predecessorDate,
                            yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                        ),
                        endDate     : null
                    })

                    intervals.unshift(interval)
                }
            }

            return intervals
        }


        * calculateEarlyEndDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[]    = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            for (const dependency of (yield this.$.incomingDeps)) {
                // ignore missing from events and inactive dependencies
                if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue

                const predecessor : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent
                const manuallyScheduled : boolean   = yield predecessor.$.manuallyScheduled

                let predecessorDate : Date

                switch (yield dependency.$.type) {
                    case DependencyType.EndToEnd:
                        predecessorDate = manuallyScheduled
                            ? yield predecessor.$.endDate
                            : yield predecessor.$.earlyEndDateRaw
                        break

                    case DependencyType.StartToEnd:
                        predecessorDate = manuallyScheduled
                            ? yield predecessor.$.startDate
                            : yield predecessor.$.earlyStartDateRaw
                        break
                }

                if (predecessorDate) {
                    const lag : Duration                = yield dependency.$.lag
                    const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                    const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version

                    const interval : DateInterval       = dependencyConstraintIntervalClass.new({
                        owner       : dependency,
                        startDate   : calendar.calculateEndDate(
                            predecessorDate,
                            yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                        ),
                        endDate     : null
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
                projectDirection.direction === Direction.Forward
                && !(yield this.$.manuallyScheduled)
                && !(
                    (ownConstraintType === ConstraintType.MustStartOn || ownConstraintType === ConstraintType.MustFinishOn)
                    && Boolean(yield this.$.constraintDate)
                )
            ) {
                for (const dependency of (yield this.$.incomingDeps) as Set<SchedulerProDependencyMixin>) {
                    const predecessor : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent

                    const hasPredecessor = predecessor != null && !isAtomicValue(predecessor)

                    const constraintType : ConstraintType = hasPredecessor ? yield predecessor.$.constraintType : undefined

                    // ignore:
                    // - missing "from" events,
                    // - unresolved "from" events (id given but not resolved, remains as atomic value),
                    // - inactive dependencies,
                    // - manually scheduled predecessors
                    // - predecessors with valid "must start/finish on" constraints
                    if (
                        !hasPredecessor || !(yield dependency.$.active) || (yield predecessor.$.manuallyScheduled)
                        || (
                            (constraintType === ConstraintType.MustStartOn || constraintType === ConstraintType.MustFinishOn)
                            && Boolean(yield predecessor.$.constraintDate)
                        )
                    ) continue

                    // pick the direction of the predecessor from the right side
                    const dependencyType : DependencyType               = yield dependency.$.type
                    const predecessorDirection : EffectiveDirection     =
                        dependencyType === DependencyType.EndToEnd || dependencyType === DependencyType.EndToStart
                            ? yield predecessor.$.endDateDirection
                            : yield predecessor.$.startDateDirection

                    if (predecessorDirection.direction === Direction.Backward) return {
                        // our TS version is a bit too old
                        kind        : 'enforced' as 'enforced',
                        direction   : Direction.Backward,
                        enforcedBy  : predecessorDirection.kind === 'enforced'
                            ? predecessorDirection.enforcedBy
                            : predecessorDirection.kind === 'own'
                                ? predecessor
                                : predecessorDirection.inheritedFrom
                    }
                }
            }

            return yield* super.calculateEffectiveDirection()
        }
    }

    return ScheduledByDependenciesEarlyEventMixin
}){}

/**
 * Base class for dependency interval resolutions.
 */
export class BaseDependencyResolution extends Localizable(ConflictResolution) {

    static get $name () {
        return 'BaseDependencyResolution'
    }

    /**
     * Dependency to resolve.
     */
    dependency          : SchedulerProDependencyMixin

    getDescription () : string {
        const
            { dependency }                  = this,
            { type, fromEvent, toEvent }    = dependency

        return format(this.L('L{descriptionTpl}'),
            this.L('L{DependencyType.long}')[type],
            fromEvent.name || fromEvent.id,
            toEvent.name || toEvent.id
        )
    }
}

/**
 * Dependency resolution removing the dependency.
 */
export class RemoveDependencyResolution extends BaseDependencyResolution {

    static get $name () {
        return 'RemoveDependencyResolution'
    }

    /**
     * Resolves the conflict by removing the dependency.
     */
    resolve () {
        this.dependency.remove()
    }
}

/**
 * Dependency resolution deactivating the dependency.
 */
export class DeactivateDependencyResolution extends BaseDependencyResolution {

    static get $name () {
        return 'DeactivateDependencyResolution'
    }

    /**
     * Resolves the conflict by deactivating the dependency.
     */
    resolve () {
        this.dependency.active = false
    }
}

/**
 * Description builder for a [[DependencyConstraintInterval|dependency constraint interval]].
 */
export class DependencyConstraintIntervalDescription extends ConstraintIntervalDescription {

    static get $name () {
        return 'DependencyConstraintIntervalDescription'
    }

    static getDescriptionParameters (interval : DependencyConstraintInterval) : any[] {
        const dependency = interval.owner

        return [
            DateHelper.format(interval.startDate, this.L('L{dateFormat}')),
            DateHelper.format(interval.endDate, this.L('L{dateFormat}')),

            this.L('L{DependencyType.long}')[dependency.type],
            dependency.fromEvent.name,
            dependency.toEvent.name
        ]
    }

}

/**
 * Constraint interval applied by a dependency.
 *
 * In case for a conflict the class [[getResolutions|suggests]] two resolution options:
 * either [[RemoveDependencyResolution|removing]] or [[DeactivateDependencyResolution|deactivating]] the dependency.
 */
export class DependencyConstraintInterval extends ConstraintInterval {

    get isDependencyConstraintInterval() : boolean {
        return true
    }

    /**
     * The dependency applying the constraint interval.
     */
    owner                                       : SchedulerProDependencyMixin

    /**
     * Class implementing "removing the dependency" resolution
     */
    @prototypeValue(RemoveDependencyResolution)
    removeDependencyConflictResolutionClass     : typeof RemoveDependencyResolution

    /**
     * Class implementing "deactivating the dependency" resolution
     */
    @prototypeValue(DeactivateDependencyResolution)
    deactivateDependencyConflictResolutionClass : typeof DeactivateDependencyResolution

    /**
     * Class implementing the interval description builder.
     */
    @prototypeValue(DependencyConstraintIntervalDescription)
    descriptionBuilderClass                     : typeof DependencyConstraintIntervalDescription

    isAffectedByTransaction (transaction? : Transaction) : boolean {
        const dependency = this.owner

        transaction = transaction || dependency.graph.activeTransaction

        const
            { entries }     = transaction,
            // dependency identifiers to check
            {
                fromEvent,
                toEvent,
                lag,
                lagUnit,
                type
            }               = dependency.$,
            fromEventQuark  = entries.get(fromEvent),
            toEventQuark    = entries.get(toEvent),
            lagQuark        = entries.get(lag),
            lagUnitQuark    = entries.get(lagUnit),
            typeQuark       = entries.get(type)

        // new or modified dependency
        return !transaction.baseRevision.hasIdentifier(dependency.$$) ||
            fromEventQuark && !fromEventQuark.isShadow() ||
            toEventQuark && !toEventQuark.isShadow() ||
            lagQuark && !lagQuark.isShadow() ||
            lagUnitQuark && !lagUnitQuark.isShadow() ||
            typeQuark && !typeQuark.isShadow()
    }

    /**
     * Returns the interval resolution options.
     * There are two resolutions:
     * - [[RemoveDependencyResolution|removing the dependency]]
     * - [[DeactivateDependencyResolution|deactivating the dependency]].
     */
    getResolutions () : ConflictResolution[] {
        return this.resolutions || (this.resolutions = [
            this.deactivateDependencyConflictResolutionClass.new({ dependency : this.owner }),
            this.removeDependencyConflictResolutionClass.new({ dependency : this.owner })
        ])
    }

}
