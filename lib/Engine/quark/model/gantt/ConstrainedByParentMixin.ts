import { Transaction } from '../../../../ChronoGraph/chrono/Transaction.js'
import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/Mixin.js'
import { CalculationIterator } from '../../../../ChronoGraph/primitives/Calculation.js'
import { prototypeValue } from '../../../../ChronoGraph/util/Helpers.js'
import DateHelper from '../../../../Core/helper/DateHelper.js'
import Localizable from '../../../../Core/localization/Localizable.js'
import { ConflictResolution, ConstraintInterval, ConstraintIntervalDescription } from '../../../chrono/Conflict.js'
import { DateInterval } from '../../../scheduling/DateInterval.js'
import { ConstraintIntervalSide, Direction } from "../../../scheduling/Types.js"
import { format } from '../../../util/Functions.js'
import { BaseEventMixin } from '../scheduler_basic/BaseEventMixin.js'
import { HasChildrenMixin } from '../scheduler_basic/HasChildrenMixin.js'
import { ConstrainedEarlyEventMixin } from '../scheduler_pro/ConstrainedEarlyEventMixin.js'
import "../../../localization/En.js"

//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin makes the event to "inherit" the constraints from its parent event.
 */
export class ConstrainedByParentMixin extends Mixin(
    [
        BaseEventMixin,
        HasChildrenMixin,
        ConstrainedEarlyEventMixin
    ],
    (base : AnyConstructor<
        BaseEventMixin &
        HasChildrenMixin &
        ConstrainedEarlyEventMixin
        ,
        typeof BaseEventMixin &
        typeof HasChildrenMixin &
        typeof ConstrainedEarlyEventMixin
    >) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ConstrainedByParentMixin extends base {

        * maybeSkipNonWorkingTime (date : Date, isForward : boolean = true) : CalculationIterator<Date> {
            const childEvents : Set<HasChildrenMixin>   = yield this.$.childEvents

            // summary tasks are simply aligned by their children so they should not skip non-working time at all
            if (childEvents.size > 0) return date

            return yield* superProto.maybeSkipNonWorkingTime.call(this, date, isForward)
        }


        * calculateStartDateConstraintIntervals () : CalculationIterator<this[ 'startDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateStartDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent?.graph) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.startDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }


        * calculateEndDateConstraintIntervals () : CalculationIterator<this[ 'endDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEndDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent?.graph) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.endDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }


        * calculateEarlyStartDateConstraintIntervals () : CalculationIterator<this[ 'earlyStartDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent?.graph) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyStartDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)

                // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
                // so we append an artificial constraining interval
                if ((yield parentEvent.$.manuallyScheduled) && (yield this.$.effectiveDirection).direction === Direction.Forward) {
                    intervals.push(ManuallyScheduledParentConstraintInterval.new({
                        owner       : parentEvent,
                        side        : ConstraintIntervalSide.Start,
                        startDate   : yield parentEvent.$.startDate
                    }))
                }
            }

            return intervals
        }


        * calculateEarlyEndDateConstraintIntervals () : CalculationIterator<this[ 'earlyEndDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent?.graph) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyEndDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }
    }

    return ConstrainedByParentMixin
}){}

/**
 * Class implements resolving a scheduling conflict happened due to a parent event
 * [[ConstrainedByParentMixin.manuallyScheduled|manually scheduled state]].
 * It resolves the conflict by setting the event [[ConstrainedByParentMixin.manuallyScheduled|manuallyScheduled]] to `false`.
 */
export class DisableManuallyScheduledConflictResolution extends Localizable(ConflictResolution) {

    static get $name () {
        return 'RemoveManuallyScheduledParentConstraintConflictResolution'
    }

    event           : ConstrainedByParentMixin

    construct () {
        super.construct(...arguments)
        this.event = this.interval.owner as ConstrainedByParentMixin
    }

    getDescription () : string {
        const { event } = this

        return format(this.L('L{descriptionTpl}'), event.name || event.id)
    }

    /**
     * Resolves the conflict by setting the event [[ConstrainedByParentMixin.manuallyScheduled|manuallyScheduled]] to `false`.
     */
    resolve () {
        this.event.manuallyScheduled = false
    }
}

/**
 * Description builder for an [[ManuallyScheduledParentConstraintInterval|manual parent constraint interval]].
 */
export class ManuallyScheduledParentConstraintIntervalDescription extends ConstraintIntervalDescription {

    static get $name () {
        return 'ManuallyScheduledParentConstraintIntervalDescription'
    }

    /**
     * Returns description for the provided event constraint interval.
     * @param interval Constraint interval
     */
    static getDescription (interval : ManuallyScheduledParentConstraintInterval) : string {
        let tpl : string

        switch (interval.side) {
            case ConstraintIntervalSide.Start :
                tpl = this.L('L{startDescriptionTpl}')
                break

            case ConstraintIntervalSide.End :
                tpl = this.L('L{endDescriptionTpl}')
                break
        }

        return format(tpl, ...this.getDescriptionParameters(interval))
    }

    static getDescriptionParameters (interval : ManuallyScheduledParentConstraintInterval) : any[] {
        const event         = interval.owner

        return [
            DateHelper.format(interval.startDate, this.L('L{dateFormat}')),
            DateHelper.format(interval.endDate, this.L('L{dateFormat}')),
            event.name || event.id
        ]
    }

}

/**
 * Class implements an interval applied by a [[ConstrainedByParentMixin.manuallyScheduled|manually scheduled]] parent event.
 * The interval suggests the only resolution option - disabling [[ConstrainedByParentMixin.manuallyScheduled|manually scheduled]] mode.
 */
export class ManuallyScheduledParentConstraintInterval extends ConstraintInterval {

    get isManuallyScheduledParentConstraintInterval() : boolean {
        return true
    }

    /**
     * The event applying the interval.
     */
    owner                                       : ConstrainedByParentMixin

    /**
     * Class implementing "Disable manual scheduling" resolution.
     */
    @prototypeValue(DisableManuallyScheduledConflictResolution)
    resetManuallyScheduledConflictResolutionClass : typeof DisableManuallyScheduledConflictResolution

    /**
     * Class implementing the interval description builder.
     */
    @prototypeValue(ManuallyScheduledParentConstraintIntervalDescription)
    descriptionBuilderClass                     : typeof ManuallyScheduledParentConstraintIntervalDescription

    getDescription () : string {
        return this.descriptionBuilderClass.getDescription(this)
    }

    isAffectedByTransaction (transaction? : Transaction) : boolean {
        const event = this.owner

        transaction = transaction || event.graph.activeTransaction

        const manuallyScheduledQuark = transaction.entries.get(event.$.manuallyScheduled)

        // new constrained event or modified constraint
        return !transaction.baseRevision.hasIdentifier(event.$$) ||
            manuallyScheduledQuark && !manuallyScheduledQuark.isShadow()
    }

    /**
     * Returns possible resolution options for cases when
     * the interval takes part in a conflict.
     *
     * The interval suggests the only resolution option - disabling manual scheduling.
     */
    getResolutions () : ConflictResolution[] {
        return this.resolutions || (this.resolutions = [
            this.resetManuallyScheduledConflictResolutionClass.new({ interval : this })
        ])
    }
}
