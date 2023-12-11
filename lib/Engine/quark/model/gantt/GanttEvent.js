var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious, ProposedOrPreviousValueOf, Reject } from "../../../../ChronoGraph/chrono/Effect.js";
import { MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js";
import { CalculateProposed } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js";
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js";
import { prototypeValue } from "../../../../ChronoGraph/util/Helpers.js";
import Base from "../../../../Core/Base.js";
import DateHelper from "../../../../Core/helper/DateHelper.js";
import Localizable from "../../../../Core/localization/Localizable.js";
import { ConflictEffect, ConflictResolution } from "../../../chrono/Conflict.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js";
import { ConstraintIntervalSide, Direction, ProjectConstraintResolution } from "../../../scheduling/Types.js";
import { format } from "../../../util/Functions.js";
import { DurationVar, EndDateVar, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js";
import { SchedulerProEvent } from "../scheduler_pro/SchedulerProEvent.js";
import { ConstrainedByParentMixin } from "./ConstrainedByParentMixin.js";
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js";
import { InactiveEventMixin } from "./InactiveEventMixin.js";
import { ScheduledByDependenciesLateEventMixin } from "./ScheduledByDependenciesLateEventMixin.js";
import { FixedEffortMixin } from "./scheduling_modes/FixedEffortMixin.js";
import { FixedUnitsMixin } from "./scheduling_modes/FixedUnitsMixin.js";
/**
 * This is an event class, [[GanttProjectMixin]] is working with.
 * It is constructed as [[SchedulerProEvent]], enhanced with extra functionality.
 */
export class GanttEvent extends MixinAny([
    SchedulerProEvent,
    ConstrainedByParentMixin,
    ConstrainedLateEventMixin,
    ScheduledByDependenciesLateEventMixin,
    FixedEffortMixin,
    FixedUnitsMixin,
    InactiveEventMixin
], (base) => {
    class GanttEvent extends base {
        *calculateCheckProjectConstraint() {
            let value = yield ProposedOrPrevious;
            if (value) {
                yield* this.validateProjectConstraint();
                value = false;
            }
            return value;
        }
        *calculateStartDate() {
            // project border should be validated before we report final start date value
            yield this.$.checkProjectConstraint;
            return yield* super.calculateStartDate();
        }
        *calculateEndDate() {
            // project border should be validated before we report final end date value
            yield this.$.checkProjectConstraint;
            return yield* super.calculateEndDate();
        }
        writeStartDate(me, transaction, quark, date, keepDuration = true) {
            const fieldName = this.constructor.getFieldDataSource('projectConstraintResolution');
            // If writing a date (not caused by STM changes undoing/redoing)
            // and if that's and initial task processing check if projectConstraintResolution has "conflict"
            // to not add extra work to initial data loading
            if (date && !this.stm?.isRestoring && (transaction.graph.hasIdentifier(this.$.effectiveDirection) ||
                (this.projectConstraintResolution || this.data[fieldName]) === ProjectConstraintResolution.Conflict)) {
                // raise a flag causing provided date validation
                this.checkProjectConstraint = true;
            }
            return super.writeStartDate(me, transaction, quark, date, keepDuration);
        }
        writeEndDate(me, transaction, quark, date, keepDuration = false) {
            const fieldName = this.constructor.getFieldDataSource('projectConstraintResolution');
            // If writing a date (not caused by STM changes undoing/redoing)
            // and if that's and initial task processing check if projectConstraintResolution has "conflict"
            // to not add extra work to initial data loading
            if (date && !this.stm?.isRestoring && (transaction.graph.hasIdentifier(this.$.effectiveDirection) ||
                (this.projectConstraintResolution || this.data[fieldName]) === ProjectConstraintResolution.Conflict)) {
                // raise a flag causing provided date validation
                this.checkProjectConstraint = true;
            }
            return super.writeEndDate(me, transaction, quark, date, keepDuration);
        }
        *calculateEarlyStartDateConstraintIntervals() {
            const result = yield* super.calculateEarlyStartDateConstraintIntervals();
            const projectConstraintResolution = yield this.$.projectConstraintResolution;
            // If the event is not configured to honor the project constraint
            // and it's configured to ignore the constraint or we are moving the event
            if (projectConstraintResolution === ProjectConstraintResolution.Ignore) {
                // skip the project constraint for it so we could calculate the event start/end dates w/o that constraint effect
                return result.filter(interval => !interval.isProjectConstraintInterval);
            }
            return result;
        }
        *calculateLateEndDateConstraintIntervals() {
            const result = yield* super.calculateLateEndDateConstraintIntervals();
            const projectConstraintResolution = yield this.$.projectConstraintResolution;
            // If the event is not configured to honor the project constraint
            // and it's configured to ignore the constraint or we are moving the event
            if (projectConstraintResolution === ProjectConstraintResolution.Ignore) {
                // skip the project constraint for it so we could calculate the event start/end dates w/o that constraint effect
                return result.filter(interval => !interval.isProjectConstraintInterval);
            }
            return result;
        }
        *validateProjectConstraint() {
            const project = this.getProject();
            const direction = yield project.$.effectiveDirection;
            const projectConstraintResolution = yield this.$.projectConstraintResolution;
            const manuallyScheduled = yield this.$.manuallyScheduled;
            // the constraint should be checked
            if (projectConstraintResolution === ProjectConstraintResolution.Conflict && !manuallyScheduled) {
                const dispatcher = yield this.$.dispatcher;
                const startDateResolution = dispatcher.resolution.get(StartDateVar);
                const endDateResolution = dispatcher.resolution.get(EndDateVar);
                const durationResolution = dispatcher.resolution.get(DurationVar);
                const proposedStartDate = yield ProposedOrPreviousValueOf(this.$.startDate);
                const proposedEndDate = yield ProposedOrPreviousValueOf(this.$.endDate);
                // event is scheduled
                if (proposedEndDate || proposedStartDate) {
                    let projectDate, eventDate, passed, side;
                    // it's scheduled forward so is constrained by the project start
                    if (direction.direction === Direction.Forward) {
                        if (startDateResolution === CalculateProposed) {
                            eventDate = proposedStartDate;
                        }
                        else {
                            let effectiveDuration = yield* (durationResolution === CalculateProposed
                                ? this.calculateDurationProposed()
                                : this.calculateDurationPure());
                            if (effectiveDuration != null) {
                                eventDate = yield* this.calculateProjectedXDateWithDuration(proposedEndDate, false, effectiveDuration);
                            }
                        }
                        projectDate = yield project.$.startDate;
                        // event start should be >= project start
                        passed = !projectDate || !eventDate || eventDate >= projectDate;
                        side = ConstraintIntervalSide.Start;
                    }
                    else if (direction.direction === Direction.Backward) {
                        if (endDateResolution === CalculateProposed) {
                            eventDate = proposedEndDate;
                        }
                        else {
                            let effectiveDuration = yield* (durationResolution === CalculateProposed
                                ? this.calculateDurationProposed()
                                : this.calculateDurationPure());
                            if (effectiveDuration != null) {
                                eventDate = yield* this.calculateProjectedXDateWithDuration(proposedStartDate, true, effectiveDuration);
                            }
                        }
                        projectDate = yield project.$.endDate;
                        passed = !projectDate || !eventDate || eventDate <= projectDate;
                        side = ConstraintIntervalSide.End;
                    }
                    if (!passed) {
                        const conflict = ProjectConstraintConflictEffect.new({
                            event: this,
                            projectDate,
                            eventDate,
                            side
                        });
                        if ((yield conflict) === EffectResolutionResult.Cancel) {
                            yield Reject(conflict);
                        }
                    }
                }
            }
        }
    }
    GanttEvent.usesDelayFromParent = false;
    __decorate([
        model_field({ defaultValue: ProjectConstraintResolution.Honor })
    ], GanttEvent.prototype, "projectConstraintResolution", void 0);
    __decorate([
        field()
    ], GanttEvent.prototype, "checkProjectConstraint", void 0);
    __decorate([
        calculate('checkProjectConstraint')
    ], GanttEvent.prototype, "calculateCheckProjectConstraint", null);
    return GanttEvent;
}) {
}
/**
 * Class implements resolving a project border violation conflict.
 * It resolves the conflict by ignoring the project border.
 */
export class IgnoreProjectConstraintResolution extends Localizable(ConflictResolution) {
    static get $name() {
        return 'IgnoreProjectConstraintResolution';
    }
    getDescription() {
        return this.L('L{descriptionTpl}');
    }
    resolve() {
        this.event.projectConstraintResolution = ProjectConstraintResolution.Ignore;
    }
}
/**
 * Class implements resolving a project border violation conflict.
 * It resolves the conflict by rescheduling the event to respect the project border.
 */
export class HonorProjectConstraintResolution extends Localizable(ConflictResolution) {
    static get $name() {
        return 'HonorProjectConstraintResolution';
    }
    getDescription() {
        return this.L('L{descriptionTpl}');
    }
    resolve() {
        this.event.projectConstraintResolution = ProjectConstraintResolution.Honor;
    }
}
/**
 * Description builder for a [[ProjectConstraintConflictEffect|project border scheduling conflict]].
 */
export class ProjectConstraintConflictEffectDescription extends Localizable(Base) {
    static get $name() {
        return 'ProjectConstraintConflictEffectDescription';
    }
    static getDescription(conflict) {
        const dateFormat = this.dateFormat || DateHelper.defaultFormat;
        return format(this.L(conflict.side === ConstraintIntervalSide.Start ? 'L{startDescriptionTpl}' : 'L{endDescriptionTpl}'), conflict.event.name, DateHelper.format(conflict.eventDate, dateFormat), DateHelper.format(conflict.projectDate, dateFormat));
    }
}
ProjectConstraintConflictEffectDescription.dateFormat = 'lll';
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
    // we don't need this method and intervals in general
    filterConflictingIntervals(intervals) {
        return;
    }
    /**
     * Returns possible resolutions for the _conflict_.
     */
    getResolutions() {
        if (!this._resolutions) {
            this._resolutions = [
                this.ignoreProjectConstraintConflictResolutionClass.new({ event: this.event }),
                this.honorProjectConstraintConflictResolutionClass.new({ event: this.event })
            ];
        }
        return this._resolutions;
    }
}
__decorate([
    prototypeValue(IgnoreProjectConstraintResolution)
], ProjectConstraintConflictEffect.prototype, "ignoreProjectConstraintConflictResolutionClass", void 0);
__decorate([
    prototypeValue(HonorProjectConstraintResolution)
], ProjectConstraintConflictEffect.prototype, "honorProjectConstraintConflictResolutionClass", void 0);
__decorate([
    prototypeValue(ProjectConstraintConflictEffectDescription)
], ProjectConstraintConflictEffect.prototype, "_descriptionBuilderClass", void 0);
