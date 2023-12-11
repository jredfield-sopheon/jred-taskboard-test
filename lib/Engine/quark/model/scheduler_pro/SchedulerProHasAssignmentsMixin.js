var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HasProposedValue } from "../../../../ChronoGraph/chrono/Effect.js";
import { Reject } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js";
import { CalendarIteratorResult } from "../../../calendar/CalendarCache.js";
import { TimeUnit } from "../../../scheduling/Types.js";
import { EmptyCalendarEffect } from "../scheduler_basic/BaseCalendarMixin.js";
import { BaseHasAssignmentsMixin } from "../scheduler_basic/BaseHasAssignmentsMixin.js";
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixins enhances the purely visual [[BaseHasAssignmentsMixin]] with scheduling according
 * to the calendars of the assigned resources.
 *
 * A time interval will be "counted" into the event duration, only if at least one assigned
 * resource has that interval as working time, and the event's own calendar also has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 */
export class SchedulerProHasAssignmentsMixin extends Mixin([BaseHasAssignmentsMixin], (base) => {
    const superProto = base.prototype;
    class SchedulerProHasAssignmentsMixin extends base {
        *hasProposedValueForUnits() {
            const assignments = yield this.$.assigned;
            for (const assignment of assignments) {
                const resource = yield assignment.$.resource;
                if (resource && (yield HasProposedValue(assignment.$.units)))
                    return true;
            }
            return false;
        }
        /**
         * A method which assigns a resource to the current event
         */
        async assign(resource, units = 100) {

            const assignmentCls = this.getProject().assignmentStore.modelClass;
            this.addAssignment(new assignmentCls({
                event: this,
                resource: resource,
                units: units
            }));
            return this.commitAsync();
        }
        *forEachAvailabilityInterval(options, func) {
            const calendar = yield this.$.effectiveCalendar;
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            const effectiveCalendarsCombination = yield this.$.effectiveCalendarsCombination;
            const ignoreResourceCalendar = (yield this.$.ignoreResourceCalendar) || options.ignoreResourceCalendar || !assignmentsByCalendar.size;
            const maxRange = this.getProject().maxCalendarRange;
            if (maxRange) {
                options = Object.assign({ maxRange }, options);
            }
            return effectiveCalendarsCombination.forEachAvailabilityInterval(options, (startDate, endDate, calendarCacheIntervalMultiple) => {
                const calendarsStatus = calendarCacheIntervalMultiple.getCalendarsWorkStatus();
                const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
                if (calendarsStatus.get(calendar)
                    &&
                        (ignoreResourceCalendar || workCalendars.some((calendar) => assignmentsByCalendar.has(calendar)))) {
                    return func(startDate, endDate, calendarCacheIntervalMultiple);
                }
            });
        }

        *calculateEffectiveCalendarsCombination() {
            const manuallyScheduled = yield this.$.manuallyScheduled;
            const project = this.getProject();
            const calendars = [yield this.$.effectiveCalendar];
            if (!manuallyScheduled || project.skipNonWorkingTimeInDurationWhenSchedulingManually) {
                const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
                calendars.push(...assignmentsByCalendar.keys());
            }
            return this.getProject().combineCalendars(calendars);
        }
        *calculateAssignmentsByCalendar() {
            const assignments = yield this.$.assigned;
            const result = new Map();
            for (const assignment of assignments) {
                const resource = yield assignment.$.resource;
                if (resource) {
                    const resourceCalendar = yield resource.$.effectiveCalendar;
                    let assignments = result.get(resourceCalendar);
                    if (!assignments) {
                        assignments = [];
                        result.set(resourceCalendar, assignments);
                    }
                    assignments.push(assignment);
                }
            }
            return result;
        }
        *getBaseOptionsForDurationCalculations() {
            return { ignoreResourceCalendar: false };
        }
        *useEventAvailabilityIterator() {
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            return assignmentsByCalendar.size > 0;
        }
        *skipNonWorkingTime(date, isForward = true, iteratorOptions) {
            if (!date)
                return null;
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            const ignoreResourceCalendar = yield this.$.ignoreResourceCalendar;
            if (yield* this.useEventAvailabilityIterator()) {
                const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? { startDate: date, isForward } : { endDate: date, isForward }, iteratorOptions);
                let workingDate;
                const skipRes = yield* this.forEachAvailabilityInterval(options, (startDate, endDate, calendarCacheIntervalMultiple) => {
                    workingDate = isForward ? startDate : endDate;
                    return false;
                });
                if (skipRes === CalendarIteratorResult.MaxRangeReached || skipRes === CalendarIteratorResult.FullRangeIterated) {
                    const calendars = [yield this.$.effectiveCalendar];
                    // if we take resource calendars into account collect them
                    // and provide to EmptyCalendarEffect instance
                    if (!options.ignoreResourceCalendar && !ignoreResourceCalendar) {
                        calendars.push(...assignmentsByCalendar.keys());
                    }
                    const effect = EmptyCalendarEffect.new({
                        event: this,
                        calendars,
                        date,
                        isForward
                    });
                    if ((yield effect) === EffectResolutionResult.Cancel) {
                        yield Reject(effect);
                    }
                    else {
                        return null;
                    }
                }
                return new Date(workingDate);
            }
            else {
                return yield* superProto.skipNonWorkingTime.call(this, date, isForward);
            }
        }
        *calculateProjectedDuration(startDate, endDate, durationUnit, iteratorOptions) {
            if (!startDate || !endDate) {
                return null;
            }
            if (yield* this.useEventAvailabilityIterator()) {
                const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), { startDate, endDate, isForward: true }, iteratorOptions);
                const adjustDurationToDST = this.getProject().adjustDurationToDST;
                let result = 0;
                yield* this.forEachAvailabilityInterval(options, (startDate, endDate) => {
                    result += endDate.getTime() - startDate.getTime();
                    if (adjustDurationToDST) {
                        const dstDiff = startDate.getTimezoneOffset() - endDate.getTimezoneOffset();
                        result += dstDiff * 60 * 1000;
                    }
                });
                if (!durationUnit)
                    durationUnit = yield this.$.durationUnit;
                return yield* this.getProject().$convertDuration(result, TimeUnit.Millisecond, durationUnit);
            }
            else {
                return yield* superProto.calculateProjectedDuration.call(this, startDate, endDate, durationUnit);
            }
        }
        *calculateProjectedXDateWithDuration(baseDate, isForward = true, duration, durationUnit, iteratorOptions) {
            if (duration == null || isNaN(duration) || baseDate == null)
                return null;
            if (duration == 0)
                return baseDate;
            durationUnit = durationUnit || (yield this.$.durationUnit);
            const durationMS = yield* this.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond);
            let resultN = baseDate.getTime();
            let leftDuration = durationMS;
            const calendar = yield this.$.effectiveCalendar;
            if (yield* this.useEventAvailabilityIterator()) {
                const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? { startDate: baseDate, isForward } : { endDate: baseDate, isForward }, iteratorOptions);
                const adjustDurationToDST = this.getProject().adjustDurationToDST;
                const iterationRes = yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
                    const intervalStartN = intervalStart.getTime(), intervalEndN = intervalEnd.getTime(), intervalDuration = intervalEndN - intervalStartN;
                    if (intervalDuration >= leftDuration) {
                        if (adjustDurationToDST) {
                            const dstDiff = isForward
                                ? intervalStart.getTimezoneOffset() - (new Date(intervalStartN + leftDuration)).getTimezoneOffset()
                                : (new Date(intervalEndN - leftDuration)).getTimezoneOffset() - intervalEnd.getTimezoneOffset();
                            leftDuration -= dstDiff * 60 * 1000;
                        }
                        resultN = isForward ? intervalStartN + leftDuration : intervalEndN - leftDuration;
                        return false;
                    }
                    else {
                        leftDuration -= intervalDuration;
                        if (adjustDurationToDST) {
                            const dstDiff = intervalStart.getTimezoneOffset() - intervalEnd.getTimezoneOffset();
                            leftDuration -= dstDiff * 60 * 1000;
                        }
                    }
                });
                // this will cause the method to return `null` if there's some problem with iterator
                // easier to debug than a wrong number
                return iterationRes === CalendarIteratorResult.StoppedByIterator ? new Date(resultN) : null;
            }
            else {
                return calendar.accumulateWorkingTime(baseDate, durationMS, isForward).finalDate;
            }
        }
    }
    __decorate([
        field()
    ], SchedulerProHasAssignmentsMixin.prototype, "effectiveCalendarsCombination", void 0);
    __decorate([
        field()
    ], SchedulerProHasAssignmentsMixin.prototype, "assignmentsByCalendar", void 0);
    __decorate([
        model_field({ type: 'boolean' })
    ], SchedulerProHasAssignmentsMixin.prototype, "ignoreResourceCalendar", void 0);
    __decorate([
        calculate('effectiveCalendarsCombination')
    ], SchedulerProHasAssignmentsMixin.prototype, "calculateEffectiveCalendarsCombination", null);
    __decorate([
        calculate('assignmentsByCalendar')
    ], SchedulerProHasAssignmentsMixin.prototype, "calculateAssignmentsByCalendar", null);
    return SchedulerProHasAssignmentsMixin;
}) {
}
