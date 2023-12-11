var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { calculate } from '../../../../ChronoGraph/replica/Entity.js';
import { isAtomicValue } from '../../../../ChronoGraph/util/Helpers.js';
import { ConstraintType, DependencyType, Direction, TimeUnit } from '../../../scheduling/Types.js';
import { ScheduledByDependenciesEarlyEventMixin } from "../scheduler_pro/ScheduledByDependenciesEarlyEventMixin.js";
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin adds support for scheduling event ALAP, by dependencies. All it does is
 * create the "late" constraint interval for every outgoing dependency.
 *
 * See [[ConstrainedEarlyEventMixin]] for more details about constraint-based scheduling.
 * See also [[ScheduledByDependenciesEarlyEventMixin]].
 */
export class ScheduledByDependenciesLateEventMixin extends Mixin([ScheduledByDependenciesEarlyEventMixin, ConstrainedLateEventMixin], (base) => {
    const superProto = base.prototype;
    class ScheduledByDependenciesLateEventMixin extends base {
        *shouldSuccessorAffectScheduling(dependency) {
            const toEvent = yield dependency.$.toEvent;
            // ignore missing target events and inactive dependencies
            return toEvent && !isAtomicValue(toEvent) && (yield dependency.$.active)
                // and inactive target events (unless this event is also inactive)
                && (!(yield toEvent.$.inactive) || (yield this.$.inactive));
        }
        *calculateLateStartDateConstraintIntervals() {
            const intervals = yield* superProto.calculateLateStartDateConstraintIntervals.call(this);
            const project = this.getProject();
            const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;
            let dependency;
            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency)))
                    continue;
                const successor = yield dependency.$.toEvent;
                const manuallyScheduled = yield successor.$.manuallyScheduled;
                let successorDate;
                switch (yield dependency.$.type) {
                    case DependencyType.StartToStart:
                        successorDate = manuallyScheduled
                            ? yield successor.$.startDate
                            : yield successor.$.lateStartDateRaw;
                        break;
                    case DependencyType.StartToEnd:
                        successorDate = manuallyScheduled
                            ? yield successor.$.endDate
                            : yield successor.$.lateEndDateRaw;
                        break;
                }
                if (successorDate) {
                    const lag = yield dependency.$.lag;
                    const lagUnit = yield dependency.$.lagUnit;
                    const lagMS = yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond);
                    const calendar = yield dependency.$.calendar;
                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version;
                    let endDate = successorDate;
                    // Take lag into account
                    if (lagMS) {
                        // Skip non-wroking time forward to constrain the event as late as possible
                        // (could affect if the event and successor use different calendars)
                        endDate = calendar.skipNonWorkingTime(calendar.calculateStartDate(successorDate, lagMS));
                    }
                    const interval = dependencyConstraintIntervalClass.new({
                        owner: dependency,
                        startDate: null,
                        endDate,
                    });
                    intervals.unshift(interval);
                }
            }
            return intervals;
        }
        *calculateLateEndDateConstraintIntervals() {
            const intervals = yield* superProto.calculateLateEndDateConstraintIntervals.call(this);
            const project = this.getProject();
            const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;
            let dependency;
            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency)))
                    continue;
                const successor = yield dependency.$.toEvent;
                const manuallyScheduled = yield successor.$.manuallyScheduled;
                let successorDate;
                switch (yield dependency.$.type) {
                    case DependencyType.EndToEnd:
                        successorDate = manuallyScheduled
                            ? yield successor.$.endDate
                            : yield successor.$.lateEndDateRaw;
                        break;
                    case DependencyType.EndToStart:
                        successorDate = manuallyScheduled
                            ? yield successor.$.startDate
                            : yield successor.$.lateStartDateRaw;
                        break;
                }
                if (successorDate) {
                    const lag = yield dependency.$.lag;
                    const lagUnit = yield dependency.$.lagUnit;
                    const lagMS = yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond);
                    const calendar = yield dependency.$.calendar;
                    // this "subscribes" on the calendar's `version` field (which is incremented
                    // every time when the intervals of the calendar changes)
                    yield calendar.$.version;
                    let endDate = successorDate;
                    // Take lag into account
                    if (lagMS) {
                        // Skip non-wroking time forward to constrain the event as late as possible
                        // (could affect if the event and successor use different calendars)
                        endDate = calendar.skipNonWorkingTime(calendar.calculateStartDate(successorDate, lagMS));
                    }
                    const interval = dependencyConstraintIntervalClass.new({
                        owner: dependency,
                        startDate: null,
                        endDate,
                    });
                    intervals.unshift(interval);
                }
            }
            return intervals;
        }
        *calculateEffectiveDirection() {
            const projectDirection = yield this.getProject().$.effectiveDirection;
            const ownConstraintType = yield this.$.constraintType;
            if (projectDirection.direction === Direction.Backward
                && !(yield this.$.manuallyScheduled)
                && !((ownConstraintType === ConstraintType.MustStartOn || ownConstraintType === ConstraintType.MustFinishOn)
                    && Boolean(yield this.$.constraintDate))) {
                for (const dependency of (yield this.$.outgoingDeps)) {
                    const successor = yield dependency.$.toEvent;
                    const hasSuccessor = successor != null && !isAtomicValue(successor);
                    const constraintType = hasSuccessor ? yield successor.$.constraintType : undefined;
                    // ignore missing from events, unresolved from events (id given but not resolved),
                    // inactive dependencies and manually scheduled successors
                    if (!hasSuccessor || !(yield dependency.$.active) || (yield successor.$.manuallyScheduled)
                        || ((constraintType === ConstraintType.MustStartOn || constraintType === ConstraintType.MustFinishOn)
                            && Boolean(yield successor.$.constraintDate)))
                        continue;
                    // pick the direction of the successor from the right side
                    const dependencyType = yield dependency.$.type;
                    const successorDirection = dependencyType === DependencyType.EndToEnd || dependencyType === DependencyType.StartToEnd
                        ? yield successor.$.endDateDirection
                        : yield successor.$.startDateDirection;
                    if (successorDirection.direction === Direction.Forward)
                        return {
                            // our TS version is a bit too old
                            kind: 'enforced',
                            direction: Direction.Forward,
                            enforcedBy: successorDirection.kind === 'enforced'
                                ? successorDirection.enforcedBy
                                : successorDirection.kind === 'own'
                                    ? successor
                                    : successorDirection.inheritedFrom
                        };
                }
            }
            return yield* super.calculateEffectiveDirection();
        }
    }
    __decorate([
        calculate('lateStartDateIntervals')
    ], ScheduledByDependenciesLateEventMixin.prototype, "calculateLateStartDateConstraintIntervals", null);
    return ScheduledByDependenciesLateEventMixin;
}) {
}
