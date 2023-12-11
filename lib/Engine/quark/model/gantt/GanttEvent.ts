import { ProposedOrPrevious, ProposedOrPreviousValueOf, Reject } from "../../../../ChronoGraph/chrono/Effect.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculateProposed, FormulaId } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js"
import { prototypeValue } from "../../../../ChronoGraph/util/Helpers.js"
import Base from "../../../../Core/Base.js"
import Model from "../../../../Core/data/Model.js"
import DateHelper from "../../../../Core/helper/DateHelper.js"
import Localizable from "../../../../Core/localization/Localizable.js"
import { ConflictEffect, ConflictResolution, ConstraintInterval } from "../../../chrono/Conflict.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js"
import { ConstraintIntervalSide, Direction, Duration, EffectiveDirection, ProjectConstraintResolution } from "../../../scheduling/Types.js"
import { format } from "../../../util/Functions.js"
import { DurationVar, EndDateVar, StartDateVar, durationFormula } from "../scheduler_basic/BaseEventDispatcher.js"
import { SchedulerProEvent } from "../scheduler_pro/SchedulerProEvent.js"
import { ConstrainedByParentMixin } from "./ConstrainedByParentMixin.js"
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js"
import { GanttProjectMixin, ProjectConstraintInterval } from "./GanttProjectMixin.js"
import { InactiveEventMixin } from "./InactiveEventMixin.js"
import { ScheduledByDependenciesLateEventMixin } from "./ScheduledByDependenciesLateEventMixin.js"
import { FixedEffortMixin } from "./scheduling_modes/FixedEffortMixin.js"
import { FixedUnitsMixin } from "./scheduling_modes/FixedUnitsMixin.js"

/**
 * This is an event class, [[GanttProjectMixin]] is working with.
 * It is constructed as [[SchedulerProEvent]], enhanced with extra functionality.
 */
export class GanttEvent extends MixinAny(
    [
        SchedulerProEvent,
        ConstrainedByParentMixin,
        ConstrainedLateEventMixin,
        ScheduledByDependenciesLateEventMixin,
        FixedEffortMixin,
        FixedUnitsMixin,
        InactiveEventMixin
    ],
    (base : AnyConstructor<
        SchedulerProEvent
        & ConstrainedByParentMixin
        & ConstrainedLateEventMixin
        & ScheduledByDependenciesLateEventMixin
        & FixedEffortMixin
        & FixedUnitsMixin
        & InactiveEventMixin,
        typeof SchedulerProEvent
        & typeof ConstrainedByParentMixin
        & typeof ConstrainedLateEventMixin
        & typeof ScheduledByDependenciesLateEventMixin
        & typeof FixedEffortMixin
        & typeof FixedUnitsMixin
        & typeof InactiveEventMixin
    >) => {

    class GanttEvent extends base {
        // surprisingly this seems to be fine (see the comment in the SchedulerProEvent)
        project                 : GanttProjectMixin


        static usesDelayFromParent             = false


        /**
         * Specifies how the event should treat the project border (the project start or end depending
         * if it's scheduled forward or backwards respectively).
         *
         * The event can either respect the project border which for example means it cannot be placed
         * before its forward scheduled project start.
         * Or the event can ignore the project border and be scheduled regardless of that constraint.
         *
         * Possible values are:
         *
         * - `honor` - event respects the project border.
         * - `ignore` - event ignores the project border.
         * - `conflict` - project triggers `schedulingConflict` event when the event attempts to violate
         * the project border. In such cases an application can track the event and provide some appropriate
         * logic (like asking user to choose a way to resolve the conflict).
         */
        @model_field({ defaultValue : ProjectConstraintResolution.Honor })
        projectConstraintResolution : ProjectConstraintResolution

        @field()
        checkProjectConstraint      : boolean

        @calculate('checkProjectConstraint')
        * calculateCheckProjectConstraint () : CalculationIterator<boolean> {
            let value = yield ProposedOrPrevious

            if (value) {
                yield * this.validateProjectConstraint()
                value = false
            }

            return value
        }

        * calculateStartDate () : CalculationIterator<Date> {
            // project border should be validated before we report final start date value
            yield this.$.checkProjectConstraint

            return yield * super.calculateStartDate()
        }

        * calculateEndDate () : CalculationIterator<Date> {
            // project border should be validated before we report final end date value
            yield this.$.checkProjectConstraint

            return yield * super.calculateEndDate()
        }

        writeStartDate (me : Identifier, transaction : Transaction, quark : Quark, date : Date, keepDuration : boolean = true) {
            const fieldName = (this.constructor as typeof Model).getFieldDataSource('projectConstraintResolution')

            // If writing a date (not caused by STM changes undoing/redoing)
            // and if that's and initial task processing check if projectConstraintResolution has "conflict"
            // to not add extra work to initial data loading
            if (date && !this.stm?.isRestoring && (
                transaction.graph.hasIdentifier(this.$.effectiveDirection) ||
                (this.projectConstraintResolution || this.data[fieldName]) === ProjectConstraintResolution.Conflict
            )) {
                // raise a flag causing provided date validation
                this.checkProjectConstraint = true
            }

            return super.writeStartDate(me, transaction, quark, date, keepDuration)
        }

        writeEndDate (me : Identifier, transaction : Transaction, quark : Quark, date : Date, keepDuration : boolean = false) {
            const fieldName = (this.constructor as typeof Model).getFieldDataSource('projectConstraintResolution')

            // If writing a date (not caused by STM changes undoing/redoing)
            // and if that's and initial task processing check if projectConstraintResolution has "conflict"
            // to not add extra work to initial data loading
            if (date && !this.stm?.isRestoring && (
                transaction.graph.hasIdentifier(this.$.effectiveDirection) ||
                (this.projectConstraintResolution || this.data[fieldName]) === ProjectConstraintResolution.Conflict
            )) {
                // raise a flag causing provided date validation
                this.checkProjectConstraint = true
            }

            return super.writeEndDate(me, transaction, quark, date, keepDuration)
        }

        * calculateEarlyStartDateConstraintIntervals() : CalculationIterator<this[ 'earlyStartDateConstraintIntervals' ]> {
            const result : this[ 'earlyStartDateConstraintIntervals' ]                = yield * super.calculateEarlyStartDateConstraintIntervals()
            const projectConstraintResolution : this['projectConstraintResolution']   = yield this.$.projectConstraintResolution

            // If the event is not configured to honor the project constraint
            // and it's configured to ignore the constraint or we are moving the event
            if (projectConstraintResolution === ProjectConstraintResolution.Ignore) {
                // skip the project constraint for it so we could calculate the event start/end dates w/o that constraint effect
                return result.filter(interval => !(interval as ProjectConstraintInterval).isProjectConstraintInterval)
            }

            return result
        }

        * calculateLateEndDateConstraintIntervals() : CalculationIterator<this[ 'lateEndDateConstraintIntervals' ]> {
            const result : this[ 'lateEndDateConstraintIntervals' ]                   = yield * super.calculateLateEndDateConstraintIntervals()
            const projectConstraintResolution : this['projectConstraintResolution']   = yield this.$.projectConstraintResolution

            // If the event is not configured to honor the project constraint
            // and it's configured to ignore the constraint or we are moving the event
            if (projectConstraintResolution === ProjectConstraintResolution.Ignore) {
                // skip the project constraint for it so we could calculate the event start/end dates w/o that constraint effect
                return result.filter(interval => !(interval as ProjectConstraintInterval).isProjectConstraintInterval)
            }

            return result
        }

        * validateProjectConstraint () {
            const project : GanttProjectMixin                                         = this.getProject()
            const direction : EffectiveDirection                                      = yield project.$.effectiveDirection
            const projectConstraintResolution : this['projectConstraintResolution']   = yield this.$.projectConstraintResolution
            const manuallyScheduled : boolean                                         = yield this.$.manuallyScheduled

            // the constraint should be checked
            if (projectConstraintResolution === ProjectConstraintResolution.Conflict && !manuallyScheduled) {

                const dispatcher                        = yield this.$.dispatcher
                const startDateResolution : FormulaId   = dispatcher.resolution.get(StartDateVar)
                const endDateResolution : FormulaId     = dispatcher.resolution.get(EndDateVar)
                const durationResolution : FormulaId    = dispatcher.resolution.get(DurationVar)

                const proposedStartDate : Date          = yield ProposedOrPreviousValueOf(this.$.startDate)
                const proposedEndDate : Date            = yield ProposedOrPreviousValueOf(this.$.endDate)

                // event is scheduled
                if (proposedEndDate || proposedStartDate) {
                    let projectDate : Date, eventDate : Date, passed : boolean, side : ConstraintIntervalSide

                    // it's scheduled forward so is constrained by the project start
                    if (direction.direction === Direction.Forward) {

                        if (startDateResolution === CalculateProposed) {
                            eventDate = proposedStartDate
                        }
                        else {
                            let effectiveDuration : Duration = yield* (durationResolution === CalculateProposed
                                ? this.calculateDurationProposed()
                                : this.calculateDurationPure()
                            )

                            if (effectiveDuration != null) {
                                eventDate = yield* this.calculateProjectedXDateWithDuration(proposedEndDate, false, effectiveDuration)
                            }
                        }

                        projectDate = yield project.$.startDate
                        // event start should be >= project start
                        passed      = !projectDate || !eventDate || eventDate >= projectDate
                        side        = ConstraintIntervalSide.Start
                    }
                    else if (direction.direction === Direction.Backward) {

                        if (endDateResolution === CalculateProposed) {
                            eventDate = proposedEndDate
                        }
                        else {
                            let effectiveDuration : Duration = yield* (durationResolution === CalculateProposed
                                ? this.calculateDurationProposed()
                                : this.calculateDurationPure()
                            )

                            if (effectiveDuration != null) {
                                eventDate = yield* this.calculateProjectedXDateWithDuration(proposedStartDate, true, effectiveDuration)
                            }
                        }

                        projectDate = yield project.$.endDate
                        passed      = !projectDate || !eventDate || eventDate <= projectDate
                        side        = ConstraintIntervalSide.End
                    }

                    if (!passed) {
                        const conflict = ProjectConstraintConflictEffect.new({
                            event : this,
                            projectDate,
                            eventDate,
                            side
                        })

                        if ((yield conflict) === EffectResolutionResult.Cancel) {
                            yield Reject(conflict)
                        }
                    }
                }
            }
        }

    }

    return GanttEvent
}){}

/**
 * Class implements resolving a project border violation conflict.
 * It resolves the conflict by ignoring the project border.
 */
export class IgnoreProjectConstraintResolution extends Localizable(ConflictResolution) {

    static get $name () {
        return 'IgnoreProjectConstraintResolution'
    }

    event           : GanttEvent

    getDescription () : string {
        return this.L('L{descriptionTpl}')
    }

    resolve () {
        this.event.projectConstraintResolution = ProjectConstraintResolution.Ignore
    }

}

/**
 * Class implements resolving a project border violation conflict.
 * It resolves the conflict by rescheduling the event to respect the project border.
 */
export class HonorProjectConstraintResolution extends Localizable(ConflictResolution) {

    static get $name () {
        return 'HonorProjectConstraintResolution'
    }

    event           : GanttEvent

    getDescription () : string {
        return this.L('L{descriptionTpl}')
    }

    resolve () {
        this.event.projectConstraintResolution = ProjectConstraintResolution.Honor
    }

}

/**
 * Description builder for a [[ProjectConstraintConflictEffect|project border scheduling conflict]].
 */
export class ProjectConstraintConflictEffectDescription extends Localizable(Base) {

    static get $name () {
        return 'ProjectConstraintConflictEffectDescription'
    }

    static dateFormat : string = 'lll'

    static getDescription (conflict : ProjectConstraintConflictEffect) : string {

        const dateFormat : string   = this.dateFormat || DateHelper.defaultFormat

        return format(
            this.L(conflict.side === ConstraintIntervalSide.Start ? 'L{startDescriptionTpl}' : 'L{endDescriptionTpl}'),
            conflict.event.name,
            DateHelper.format(conflict.eventDate, dateFormat),
            DateHelper.format(conflict.projectDate, dateFormat)
        )
    }

}

/**
 * Special [[Effect|effect]] indicating an event gets scheduled violating the project fixed border
 * (before the project start date if the project is scheduled forwards and after the project end date otherwise).
 *
 * By default the conflict suggests two ways to resolve it:
 *
 * - ignore the project border and proceed with the suggested event changes
 * - honor the project border and adjust the event start/end dates to not violate it
 */
export class ProjectConstraintConflictEffect extends ConflictEffect {

    /**
     * Class implementing "ignore the project border" resolution.
     */
    @prototypeValue(IgnoreProjectConstraintResolution)
    ignoreProjectConstraintConflictResolutionClass  : typeof IgnoreProjectConstraintResolution

    /**
     * Class implementing "respect the project border" resolution.
     */
    @prototypeValue(HonorProjectConstraintResolution)
    honorProjectConstraintConflictResolutionClass   : typeof HonorProjectConstraintResolution

    @prototypeValue(ProjectConstraintConflictEffectDescription)
    _descriptionBuilderClass    : typeof ProjectConstraintConflictEffectDescription

    event                       : GanttEvent

    eventDate                   : Date

    projectDate                 : Date

    side                        : ConstraintIntervalSide

    // we don't need this method and intervals in general
    filterConflictingIntervals (intervals : ConstraintInterval[]) : ConstraintInterval[] {
        return
    }

    /**
     * Returns possible resolutions for the _conflict_.
     */
    getResolutions () {
        if (!this._resolutions) {
            this._resolutions = [
                this.ignoreProjectConstraintConflictResolutionClass.new({ event : this.event }),
                this.honorProjectConstraintConflictResolutionClass.new({ event : this.event })
            ]
        }

        return this._resolutions
    }

}
