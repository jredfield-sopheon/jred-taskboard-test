var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { HasSubEventsMixin } from "../scheduler_basic/HasSubEventsMixin.js";
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js";
import { DateConstraintInterval, HasDateConstraintMixin } from "./HasDateConstraintMixin.js";
import { PreviousValueOf, ProposedOrPrevious, ProposedOrPreviousValueOf, ProposedValueOf } from "../../../../ChronoGraph/chrono/Effect.js";
import { intersectIntervals } from "../../../scheduling/DateInterval.js";
import { ConstraintIntervalSide, TimeUnit } from "../../../scheduling/Types.js";
import { calculate } from "../../../../ChronoGraph/replica/Entity.js";
/**
 * This mixin implements scheduling children by a delay from their parent event.
 */
export class DelayFromParentMixin extends Mixin([
    HasChildrenMixin,
    HasSubEventsMixin,
    HasDateConstraintMixin
], (base) => {
    const superProto = base.prototype;
    class DelayFromParentMixin extends base {
        get usesDelayFromParent() {
            return this.constructor.usesDelayFromParent;
        }
        isTaskPinnableWithConstraint() {
            // Nested events are pinned by delayFromParent, which is updated when child is moved
            if (this.usesDelayFromParent && (this.parent && !this.parent.isRoot)) {
                return false;
            }
            return superProto.isTaskPinnableWithConstraint.call(this);
        }
        // Since we shrink wrap, min delay should be 0. If moving this nested event lead to it being
        // something else, update it and all siblings relatively so that the min delay is 0
        updateDelaysAfterShrinkWrap() {
            const minDelay = Math.min(...this.children.map(child => child.delayFromParent || 0));
            if (minDelay !== 0) {
                for (const child of this.children) {
                    this.graph.write(child.$.delayFromParent, child.delayFromParent - minDelay);
                }
            }
        }
        // When moved to a new parent, our delay from parent should be updated + the delays of all previous siblings
        // (since old parent might get rescheduled by the move)
        updateParentEvent(newParent, oldParent) {
            // oldParent is not set for initial add to parent, which we want to ignore
            if (oldParent && this.usesDelayFromParent && newParent.usesDelayFromParent) {
                // Might move from root (ProjectModel)
                oldParent.usesDelayFromParent && oldParent.updateDelaysAfterShrinkWrap();
                for (const child of newParent.children) {
                    this.graph.write(child.$.delayFromParent, null);
                }
            }
        }
        *calculateDelayFromParent() {
            let delayFromParent = yield ProposedOrPrevious;
            const parentEvent = yield this.$.parentEvent;
            // This only works initially...
            if (this.usesDelayFromParent && parentEvent && !parentEvent.isRoot && delayFromParent == null) {
                let parentStart = yield ProposedOrPreviousValueOf(parentEvent.$.startDate);
                // No date supplied for the parent, use the earliest child (if available)
                if (!parentStart) {
                    const dates = parentEvent.children.flatMap(child => child.getData('startDate')?.getTime() ?? []);
                    parentStart = new Date(Math.min(...dates));
                }
                const startDate = yield ProposedOrPreviousValueOf(this.$.startDate);
                delayFromParent = yield* this.calculateProjectedDuration(parentStart, startDate);
            }
            return delayFromParent;
        }
        writeStartDate(me, transaction, quark, date, keepDuration = true) {
            const { parent, children } = this;
            if (this.usesDelayFromParent && !this.project.isInitialTransaction) {
                // Moved a child, need to update others if it was or became the earliest child
                // (no graph yet when moving to another scheduler)
                if (parent && !parent.isRoot && parent.graph) {
                    // Have to let parent calculate duration, crashes for new events otherwise
                    const delayFromParent = parent.run('calculateProjectedDuration', parent.startDate, date);
                    this.graph.write(this.$.delayFromParent, delayFromParent);
                    !parent.manuallyScheduled && parent.updateDelaysAfterShrinkWrap();
                }
                // Special handling when resizing a manually scheduled parent event in Pro, to keep the children in place
                if (!keepDuration && children?.length && this.manuallyScheduled) {
                    const currentDate = this.startDate;
                    const extension = this.project.convertDuration(date.getTime() - currentDate.getTime(), TimeUnit.Millisecond, this.durationUnit);
                    for (const child of children) {
                        this.graph.write(child.$.delayFromParent, child.delayFromParent - extension);
                    }
                }
            }
            return superProto.writeStartDate.call(this, me, transaction, quark, date, keepDuration);
        }
        *calculateStartDateConstraintIntervals() {
            const intervals = yield* superProto.calculateStartDateConstraintIntervals.call(this);
            let delayFromParent = yield this.$.delayFromParent;
            if (delayFromParent != null) {
                let parentEvent = yield this.$.parentEvent;
                let startDate;
                // When parent is scheduled by a constraint, we have to use the constraint date since the proposed value
                // is likely wrong (and we cannot query for the correct date, that would be a circular dependency)
                const parentEarlyStartConstraints = yield parentEvent.$.earlyStartDateConstraintIntervals;
                const parentStartConstraints = yield parentEvent.$.startDateConstraintIntervals;
                if (parentEarlyStartConstraints.length || parentStartConstraints.length) {
                    const parentConstraintInterval = intersectIntervals([...parentEarlyStartConstraints, ...parentStartConstraints]);
                    startDate = parentConstraintInterval.startDate;
                }
                // Otherwise we try using the proposed value
                else {
                    startDate = yield ProposedValueOf(parentEvent.$.startDate);
                }
                // Nested parent has no date here on move of its parent
                if (!startDate && parentEvent.parent && !parentEvent.parent.isRoot) {
                    startDate = yield PreviousValueOf(parentEvent.$.startDate);
                }
                if (startDate) {
                    intervals.push(DateConstraintInterval.new({
                        owner: this,
                        side: ConstraintIntervalSide.Start,
                        startDate: yield* this.skipWorkingTime(startDate, true, delayFromParent),
                        endDate: null
                    }));
                }
            }
            return intervals;
        }
        *calculateEarlyEndDateConstraintIntervals() {
            const intervals = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this);
            if (this.delayFromParent !== null) {
                const parentEvent = yield this.$.parentEvent;
                const parentEarlyEndConstraints = yield parentEvent.$.earlyEndDateConstraintIntervals;
                intervals.push(...parentEarlyEndConstraints);
            }
            return intervals;
        }
        *calculateStartDate() {
            const startDate = yield* superProto.calculateStartDate.call(this);
            if (this.usesDelayFromParent) {
                if (this.children?.length) {
                    // HACK to force the constraint intervals to be calculated
                    for (const child of this.children) {
                        yield child.$.startDateConstraintIntervals;
                    }
                }
                // Manually scheduled events usually ignore constraints, but we must respect the delay from parent one
                if (yield this.$.manuallyScheduled) {
                    const constraints = yield this.$.startDateConstraintIntervals;
                    // DelayFromParent constraint is always the last one
                    if (constraints.length) {
                        return constraints[constraints.length - 1].startDate;
                    }
                }
            }
            return startDate;
        }
    }
    DelayFromParentMixin.usesDelayFromParent = true;
    __decorate([
        model_field({ type: 'number' })
    ], DelayFromParentMixin.prototype, "delayFromParent", void 0);
    __decorate([
        calculate('delayFromParent')
    ], DelayFromParentMixin.prototype, "calculateDelayFromParent", null);
    return DelayFromParentMixin;
}) {
}
