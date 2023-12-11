var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HasProposedValue, PreviousValueOf, ProposedArgumentsOf, ProposedOrPrevious, ProposedOrPreviousValueOf, ProposedValueOf, WriteSeveral } from "../../../../ChronoGraph/chrono/Effect.js";
import { CalculatedValueGen } from "../../../../ChronoGraph/chrono/Identifier.js";
import { TombStone } from "../../../../ChronoGraph/chrono/Quark.js";
import { Mixin } from '../../../../ChronoGraph/class/Mixin.js';
import { CycleDescription, CycleResolution, Formula } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js";
import { calculate, field, write } from '../../../../ChronoGraph/replica/Entity.js';
import { FieldIdentifier } from "../../../../ChronoGraph/replica/Identifier.js";
import DateHelper from "../../../../Core/helper/DateHelper.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { Direction, TimeUnit } from '../../../scheduling/Types.js';
import { MAX_DATE } from "../../../util/Constants.js";
import { durationFormula, DurationVar, endDateFormula, EndDateVar, startDateFormula, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js";
import { HasPercentDoneMixin } from "./HasPercentDoneMixin.js";
import { SchedulerProEventSegment } from './SchedulerProEventSegment.js';
import { SchedulerProHasAssignmentsMixin } from "./SchedulerProHasAssignmentsMixin.js";
import ObjectHelper from "../../../../Core/helper/ObjectHelper.js";
export const SegmentsVar = Symbol('SegmentsVar');
export const segmentsConverter = (value, data, record) => record.processSegmentsValue(value);
export const startDateByEndDateAndSegmentsFormula = Formula.new({
    output: StartDateVar,
    inputs: new Set([EndDateVar, SegmentsVar])
});
export const endDateByStartDateAndSegmentsFormula = Formula.new({
    output: EndDateVar,
    inputs: new Set([StartDateVar, SegmentsVar])
});
export const durationByStartDateAndEndDateAndSegmentsFormula = Formula.new({
    output: DurationVar,
    inputs: new Set([StartDateVar, EndDateVar, SegmentsVar])
});
export const SEDSGGraphDescription = CycleDescription.new({
    variables: new Set([StartDateVar, EndDateVar, DurationVar, SegmentsVar]),
    formulas: new Set([
        endDateByStartDateAndSegmentsFormula,
        startDateByEndDateAndSegmentsFormula,
        // durationByStartDateAndEndDateAndSegmentsFormula,
        startDateFormula,
        endDateFormula,
        durationFormula
    ])
});
export const SEDSGForwardCycleResolution = CycleResolution.new({
    description: SEDSGGraphDescription,
    defaultResolutionFormulas: new Set([endDateFormula, endDateByStartDateAndSegmentsFormula])
});
export const SEDSGBackwardCycleResolution = CycleResolution.new({
    description: SEDSGGraphDescription,
    defaultResolutionFormulas: new Set([startDateFormula, startDateByEndDateAndSegmentsFormula])
});
export class SEDSGDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {
    equality(v1, v2) {
        const resolution1 = v1.resolution;
        const resolution2 = v2.resolution;
        return resolution1.get(StartDateVar) === resolution2.get(StartDateVar)
            && resolution1.get(EndDateVar) === resolution2.get(EndDateVar)
            && resolution1.get(DurationVar) === resolution2.get(DurationVar)
            && resolution1.get(SegmentsVar) === resolution2.get(SegmentsVar);
    }
}
export function compareSegmentsArray(a, b) {
    if (!a && !b)
        return true;
    if (this._skipSegmentsIsEqual)
        return false;
    if (!a && b || a && !b)
        return false;
    if (a.length !== b.length)
        return false;
    return a.every((segment, index) => compareSegments(segment, b[index]));
}
export const compareSegments = (a, b) => {
    if (a === b)
        return true;
    const segmentModel = a.isModel ? a : b;
    const fieldMap = segmentModel.fieldMap;
    const aStart = a.startDate instanceof Date ? a.startDate.getTime() : fieldMap.startDate.convert(a.startDate).getTime();
    const bStart = b.startDate instanceof Date ? b.startDate.getTime() : fieldMap.startDate.convert(b.startDate).getTime();
    const aEnd = a.endDate instanceof Date ? a.endDate.getTime() : fieldMap.endDate.convert(a.endDate).getTime();
    const bEnd = b.endDate instanceof Date ? b.endDate.getTime() : fieldMap.endDate.convert(b.endDate).getTime();
    return aStart === bStart && aEnd === bEnd;
};
export class SplitEventMixin extends Mixin([SchedulerProHasAssignmentsMixin, HasPercentDoneMixin], (base) => {
    class SplitEventMixin extends base {
        constructor() {
            super(...arguments);
            this._segmentGeneration = {};
        }
        static get $name() {
            return 'SplitEventMixin';
        }
        construct() {
            this.segmentModelClass = this.getDefaultSegmentModelClass();
            super.construct(...arguments);
        }
        get rawModifications() {
            let data = super.rawModifications;
            // include segment changes
            if (this.segments && (!data || !('segments' in data))) {
                for (const segment of this.segments) {
                    if (segment.rawModifications) {
                        data = data || {};
                        data.segments = this.getFieldPersistentValue('segments');
                        break;
                    }
                }
            }
            return data;
        }
        clearChanges(includeDescendants, removeFromStoreChanges, changes) {
            for (const segment of this.segments || []) {
                segment.clearChanges(includeDescendants, removeFromStoreChanges, null);
            }
            super.clearChanges(includeDescendants, removeFromStoreChanges, changes);
        }
        getDefaultSegmentModelClass() {
            return SchedulerProEventSegment;
        }
        *prepareDispatcher(YIELD) {
            const dispatcher = yield* super.prepareDispatcher(YIELD);
            if (yield* this.hasSegmentChangesProposed()) {
                dispatcher.addProposedValueFlag(SegmentsVar);
            }
            return dispatcher;
        }
        cycleResolutionContext(Y) {
            const direction = Y(this.$.effectiveDirection);
            return direction.direction === Direction.Forward || direction.direction === Direction.None ? SEDSGForwardCycleResolution : SEDSGBackwardCycleResolution;
        }
        *hasSegmentChangesProposed() {
            const proposedSegments = yield ProposedValueOf(this.$.segments);
            let result = false;
            if (yield HasProposedValue(this.$.segments)) {
                result = Boolean(proposedSegments);
            }
            const segments = yield ProposedOrPreviousValueOf(this.$.segments);
            if (!segments)
                return false;
            for (const segment of segments) {

                const startDateProposed = yield HasProposedValue(segment.$.startDate);
                const endDateProposed = yield HasProposedValue(segment.$.endDate);
                const durationProposed = yield HasProposedValue(segment.$.duration);
                if (startDateProposed || endDateProposed || durationProposed)
                    result = true;
            }
            return result;
        }
        writeSegments(me, transaction, quark, value) {
            // if (!transaction.baseRevision.hasIdentifier(me) && value == null) return
            const oldSegmentsQuarkValue = transaction.getLatestEntryFor(me)?.getValue();
            const oldSegments = oldSegmentsQuarkValue !== TombStone ? oldSegmentsQuarkValue ?? [] : [];
            const oldSegmentsSet = new Set(oldSegments);
            const newSegments = value ?? [];
            const newSegmentsSet = new Set(newSegments);
            this.project.ion({
                // remove them from the graph, only the ones not listed in the new segments array,
                // and only after commit finalization, otherwise test fails
                // we don't know why, possibly because in the `calculateSegments` we use `previousValue` of `segments` atom
                commitFinalized: () => graph.removeEntities(oldSegments.filter(segment => !newSegmentsSet.has(segment))),
                once: true
            });
            me.constructor.prototype.write.call(this, me, transaction, quark, value);
            this.$.isSegmented.write.call(this, this.$.isSegmented, transaction, null, Boolean(value?.length));
            const project = this.project;
            const graph = project.replica;
            for (const newSegment of newSegments) {
                if (!oldSegmentsSet.has(newSegment) && newSegment.graph !== graph) {
                    newSegment.setProject(project);
                    graph.addEntity(newSegment);
                }
            }
        }
        *doWriteSegments(segments, writes) {
            writes = writes || [];
            // if one or zero segments left after above merging
            if (segments.length <= 1) {
                // calculate the segment duration
                const duration = segments.length
                    ? yield* this.getProject().$convertDuration(segments[0].endOffset - segments[0].startOffset, TimeUnit.Millisecond, yield this.$.durationUnit)
                    : 0;
                // Apply the event "duration" taken from the segment and "segments" field as NULL
                // (w/o pushing the duration value the code will tend to recalculate end date instead
                // using exiting duration value on the event)
                writes.push({
                    identifier: this.$.duration,
                    proposedArgs: [duration, null]
                });
                segments = null;
            }
            writes.push({
                identifier: this.$.segments,
                proposedArgs: [segments]
            });
            yield WriteSeveral(writes);
        }
        *calculateSegments() {
            const dispatcher = yield this.$.dispatcher;
            const { graph, project } = this;
            const previousValue = yield PreviousValueOf(this.$.segments);
            let segments = yield ProposedOrPrevious;
            const toRemove = [];
            let hasChanges = false;
            if (segments) {
                const result = new Set();
                let previousSegment = null;
                let keepDuration = false;
                const { baseRevision } = graph.$activeTransaction;
                for (const segment of segments) {
                    const startOffset = yield segment.$.startOffset;
                    const endOffset = yield segment.$.endOffset;
                    // detect segment moving ..but ignore data loading stage
                    const startDateProposedArgs = baseRevision.hasIdentifier(segment.$.startDate)
                        && (yield ProposedArgumentsOf(segment.$.startDate));
                    const endDateProposedArgs = baseRevision.hasIdentifier(segment.$.endDate)
                        && (yield ProposedArgumentsOf(segment.$.endDate));
                    keepDuration = keepDuration || startDateProposedArgs?.[0] || endDateProposedArgs?.[0];
                    // get rid of zero duration segment
                    if (startOffset === endOffset) {

                        toRemove.push(segment);
                    }
                    // if a segment overlaps the previous one
                    else if (previousSegment && startOffset <= (previousSegment.endOffset)) {
                        const prevEndOffset = previousSegment.endOffset;
                        // remove the segment we'll make a new one representing the segments union
                        toRemove.push(segment);
                        // if previous one is in the graph (not a "union" we just made)
                        if (previousSegment.graph) {
                            // remove it
                            toRemove.push(previousSegment);
                            const previousSegmentStartOffset = previousSegment.startOffset;
                            const previousSegmentEndOffset = keepDuration
                                // if moving a segment then move its further neighbours
                                ? endOffset + prevEndOffset - startOffset
                                // otherwise just combine intersected segments by building a new [min start, max end] segment
                                : Math.max(endOffset, prevEndOffset);

                            // @ts-ignore
                            const cls = previousSegment.cls;
                            // make a new segment
                            previousSegment = this.segmentModelClass.new({
                                event: this,
                                cls: cls,
                                startOffset: previousSegmentStartOffset,
                                endOffset: previousSegmentEndOffset
                            });
                        }
                        else {
                            previousSegment.endOffset = keepDuration
                                // if moving a segment then move its further neighbours
                                ? endOffset + previousSegment.endOffset - startOffset
                                // otherwise just combine intersected segments by building a new [min start, max end] segment
                                : Math.max(endOffset, previousSegment.endOffset);
                        }
                    }
                    // a valid segment
                    else {
                        if (previousSegment) {
                            result.add(previousSegment);
                        }
                        previousSegment = segment;
                    }
                }
                if (previousSegment) {
                    result.add(previousSegment);
                }
                if (result.size === 1) {
                    toRemove.push(...result);
                }
                hasChanges = toRemove.length > 0;
                if (hasChanges) {
                    segments = Array.from(result);
                }
                // fill previousSegment/nextSegment properties
                segments.reduce((previousSegment, segment, index) => {
                    if (previousSegment) {
                        previousSegment.nextSegment = segment;
                    }
                    segment.previousSegment = previousSegment;
                    segment.segmentIndex = index;
                    return segment;
                }, null);
                if (segments.length) {
                    segments[segments.length - 1].nextSegment = null;
                }
            }
            // If we used to have segments - need to remove them from the graph
            else if (previousValue) {
                toRemove.push(...previousValue);
            }
            // if we got segments to cleanup
            if (toRemove.length) {
                // detach segments that are meant to get removed from the graph
                toRemove.forEach(segment => segment.event = null);
                project.ion({
                    commitFinalized: () => graph.removeEntities(toRemove),
                    once: true
                });
            }
            // If we have changed segments
            if (hasChanges) {
                yield* this.doWriteSegments(segments);
            }
            segments = segments?.length > 1 ? segments : null;
            return segments;
        }
        *calculateAdjustedSegments() {
            const dispatcher = yield this.$.dispatcher;
            let segments = yield this.$.segments;
            const startDate = yield this.$.startDate;
            const endDate = yield this.$.endDate;
            const duration = yield this.$.duration;
            let value = yield ProposedOrPrevious;
            if (segments) {
                const project = this.project;
                const graph = this.graph;
                const toRemove = [];
                const toWrite = [];
                let spliceIndex = -1;
                // Iterate segments starting from trailing ones
                for (let i = segments.length - 1; i >= 0; i--) {
                    const segment = segments[i];
                    const segmentStartDate = yield segment.$.startDate;
                    const segmentEndDate = yield segment.$.endDate;
                    // If the segment starts after the event finishes - cut the segment
                    if (segmentStartDate > endDate) {
                        toRemove.push(segment);
                        spliceIndex = i;
                    }
                    else {
                        // If last segment end is not aligned with the event end - adjust it
                        if (segmentEndDate.getTime() !== endDate.getTime()) {
                            const durationMs = segment.endOffset + (endDate.getTime() - segmentEndDate.getTime()) - segment.startOffset;
                            const duration = yield* project.$convertDuration(durationMs, TimeUnit.Millisecond, yield segment.$.durationUnit);
                            // write new duration, endDate and endOffset to the segment
                            toWrite.push({
                                identifier: segment.$.duration,
                                proposedArgs: [duration, null]
                            }, {
                                identifier: segment.$.endDate,
                                proposedArgs: [endDate, false]
                            }, {
                                identifier: segment.$.endOffset,
                                proposedArgs: [segment.endOffset + (endDate.getTime() - segmentEndDate.getTime())]
                            });
                        }
                        // stop iteration
                        break;
                    }
                }
                let hasChanges = false;
                // if we have trailing segment(s) to cut
                if (spliceIndex > -1) {
                    hasChanges = true;
                    segments.splice(spliceIndex);
                    if (segments.length) {
                        segments[segments.length - 1].nextSegment = null;
                    }
                    // Will remove the segment(s) from the graph later ..to avoid exceptions
                    project.ion({
                        commitFinalized: () => graph.removeEntities(toRemove),
                        once: true
                    });
                }
                let segmentsSnapshot = '';
                if (segments) {
                    segmentsSnapshot = this.getSegmentsSnapshot(segments);
                }
                if ( /*this._lastSegmentsSnapshot &&*/segmentsSnapshot !== this._lastSegmentsSnapshot) {
                    hasChanges = true;
                    segments = segments ? segments.slice() : segments;
                    this._lastSegmentsSnapshot = segmentsSnapshot;
                }
                // this._lastSegmentsSnapshot  = segmentsSnapshot
                // If we have changes to write
                if (hasChanges) {
                    yield* this.doWriteSegments(segments, toWrite);
                }
            }
            return value;
        }
        getSegmentsSnapshot(segments) {
            segments = segments || this.segments;
            return segments?.map(segment => '' + segment.startOffset + '-' + segment.startDate?.getTime() + '-' + segment.endOffset + '-' + segment.endDate?.getTime()).join(';');
        }
        processSegmentsValue(value) {
            // by default return the value as is
            let result = value;
            // if segments are specified for the task
            if (value) {
                // for (let segment of value) {
                for (let i = 0; i < value.length; i++) {
                    const segment = value[i];
                    const record = (segment.isModel ? segment : this.segmentModelClass.new(segment));
                    // don't overwrite the existing property, because this method
                    // is called as part of the `copy()` call, where
                    //     copy['segments'] = this['segments']
                    // happens and `copy` event is assigned back to segments from the source
                    if (!record.event)
                        record.event = this;
                    value[i] = record;
                }
            }
            return result;
        }
        *calculateStartDate() {
            const dispatcher = yield this.$.dispatcher;
            const resolution = dispatcher.resolution.get(StartDateVar);
            let result;
            if (resolution === startDateByEndDateAndSegmentsFormula.formulaId) {
                result = yield* this.calculateStartDateBySegments();
            }
            else {
                result = yield* super.calculateStartDate();
            }
            return result;
        }
        *calculateStartDateBySegments() {
            const dispatcher = yield this.$.dispatcher;
            const segments = yield this.$.segments;
            const endDate = yield this.$.endDate;
            let result;
            if (segments) {
                const lastSegment = segments[segments.length - 1];
                const lastSegmentEndOffset = yield lastSegment.$.endOffset;
                const rawDate = yield* this.calculateProjectedXDateWithDuration(endDate, false, lastSegmentEndOffset, TimeUnit.Millisecond, { ignoreSegments: true });
                const manuallyScheduled = yield this.$.manuallyScheduled;
                result = manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                    ? rawDate
                    : yield* this.skipNonWorkingTime(rawDate, true);
            }
            return result;
        }
        *calculateEndDateBySegments() {
            const dispatcher = yield this.$.dispatcher;
            const segments = yield this.$.segments;
            const startDate = yield this.$.startDate;
            let result;
            if (segments) {
                const lastSegment = segments[segments.length - 1];
                const lastSegmentEndOffset = yield lastSegment.$.endOffset;
                const rawDate = yield* this.calculateProjectedXDateWithDuration(startDate, true, lastSegmentEndOffset, TimeUnit.Millisecond, { ignoreSegments: true });
                const manuallyScheduled = yield this.$.manuallyScheduled;
                result = manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                    ? rawDate
                    : yield* this.skipNonWorkingTime(rawDate, false);
            }
            return result;
        }
        *calculateEndDate() {
            const dispatcher = yield this.$.dispatcher;
            const resolution = dispatcher.resolution.get(EndDateVar);
            let result;
            if (resolution === endDateByStartDateAndSegmentsFormula.formulaId) {
                result = yield* this.calculateEndDateBySegments();
            }
            else {
                result = yield* super.calculateEndDate();
            }
            return result;
        }
        *calculateDurationProposed() {
            let result;
            if (yield* this.hasSegmentChangesProposed()) {
                result = yield* this.calculateDurationBySegments();
            }
            else {
                result = yield* super.calculateDurationProposed();
            }
            return result;
        }
        *skipNonWorkingTime(date, isForward = true, iteratorOptions) {
            if (!date)
                return null;
            iteratorOptions = Object.assign({ ignoreSegments: true }, iteratorOptions);
            return yield* super.skipNonWorkingTime(date, isForward, iteratorOptions);
        }
        *calculateDurationBySegments() {
            let duration;
            const dispatcher = yield this.$.dispatcher;
            const durationUnit = yield this.$.durationUnit;
            const segments = yield this.$.segments;
            if (segments) {
                let durationMs = 0;
                // collect segments duration in milliseconds
                for (const segment of segments) {
                    durationMs += segment.endOffset - segment.startOffset;
                }
                duration = yield* this.getProject().$convertDuration(durationMs, TimeUnit.Millisecond, durationUnit);
            }
            return duration;
        }
        *forEachAvailabilityInterval(options, func) {
            const calendar = yield this.$.effectiveCalendar;
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            const effectiveCalendarsCombination = yield this.$.effectiveCalendarsCombination;
            const isForward = options.isForward !== false;
            const ignoreResourceCalendar = (yield this.$.ignoreResourceCalendar) || options.ignoreResourceCalendar || !assignmentsByCalendar.size;
            const maxRange = this.getProject().maxCalendarRange;
            let ignoreSegments = options.ignoreSegments;
            let sign = 1;
            let currentSegment, currentOffsetMs, currentSegmentDurationMs, segments, currentSegmentEndOffset;
            if (!ignoreSegments) {
                segments = yield this.$.segments;
                ignoreSegments = ignoreSegments || !segments;
                if (!ignoreSegments) {
                    // clone segment array since we're going to call shift()/pop() on it
                    segments = segments.slice();
                    if (isForward) {
                        currentSegment = segments.shift();
                        currentOffsetMs = 0;
                        sign = 1;
                        // open the last segment end border
                        currentSegmentEndOffset = currentSegment.nextSegment ? currentSegment.endOffset : MAX_DATE.getTime();
                    }
                    else {
                        currentSegment = segments.pop();
                        currentOffsetMs = currentSegment.endOffset;
                        sign = -1;
                        currentSegmentEndOffset = currentSegment.endOffset;
                    }
                    currentSegmentDurationMs = currentSegmentEndOffset - currentSegment.startOffset;
                }
            }
            const manuallyScheduled = yield this.$.manuallyScheduled;
            const project = this.getProject();
            return effectiveCalendarsCombination.forEachAvailabilityInterval(Object.assign({ maxRange }, options), (intervalStartDate, intervalEndDate, calendarCacheIntervalMultiple) => {
                const calendarsStatus = calendarCacheIntervalMultiple.getCalendarsWorkStatus();
                const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
                if (calendarsStatus.get(calendar)
                    && (ignoreResourceCalendar
                        || workCalendars.some((calendar) => assignmentsByCalendar.has(calendar))
                        || (manuallyScheduled && !project.skipNonWorkingTimeInDurationWhenSchedulingManually))) {
                    if (ignoreSegments) {
                        return func(intervalStartDate, intervalEndDate, calendarCacheIntervalMultiple);
                    }
                    // take segments into account while iterating
                    else {
                        const startDateN = intervalStartDate.getTime();
                        let intervalDuration = intervalEndDate.getTime() - intervalStartDate.getTime();

                        if (this.getProject().adjustDurationToDST) {
                            const dstDiff = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset();
                            intervalDuration += dstDiff * 60 * 1000;
                        }
                        let intervalStartOffset, intervalEndOffset;
                        if (isForward) {
                            intervalStartOffset = currentOffsetMs;
                            intervalEndOffset = currentOffsetMs + intervalDuration;
                        }
                        else {
                            intervalStartOffset = currentOffsetMs - intervalDuration;
                            intervalEndOffset = currentOffsetMs;
                        }
                        while (currentSegment && intervalStartOffset <= currentSegmentEndOffset && intervalEndOffset > currentSegment.startOffset) {
                            // get the intersection of the current segment w/ the current interval
                            const callStartOffset = Math.max(intervalStartOffset, currentSegment.startOffset);
                            const callEndOffset = Math.min(intervalEndOffset, currentSegmentEndOffset);
                            const callStartDate = new Date(startDateN + callStartOffset - intervalStartOffset);
                            const callEndDate = new Date(startDateN + callEndOffset - intervalStartOffset);
                            const callResult = func(callStartDate, callEndDate, calendarCacheIntervalMultiple);
                            if (callResult === false)
                                return false;
                            // reduce the segment duration left by the intersection duration
                            currentSegmentDurationMs -= callEndDate.getTime() - callStartDate.getTime();
                            // if no segment duration left
                            if (!currentSegmentDurationMs) {
                                // get next segment
                                currentSegment = isForward ? segments.shift() : segments.pop();
                                if (currentSegment) {
                                    // the last segment end border should not be taken into account (in forward mode)
                                    currentSegmentEndOffset = !isForward || currentSegment.nextSegment ? currentSegment.endOffset : MAX_DATE.getTime();
                                    // get its duration to distribute
                                    currentSegmentDurationMs = currentSegmentEndOffset - currentSegment.startOffset;
                                }
                            }
                            // if there is undistributed duration left of the current segment => iterate to the next interval
                            else {
                                break;
                            }
                        }
                        currentOffsetMs += sign * intervalDuration;
                    }
                }
            });
        }
        *useEventAvailabilityIterator() {
            const isSegmented = yield this.$.isSegmented;
            if (isSegmented)
                return true;
            const manuallyScheduled = yield this.$.manuallyScheduled;
            // always use availability iterator, unless the event is manually scheduled
            return !manuallyScheduled;
        }
        /**
         * Returns a segment that is ongoing on the provided date.
         * @param  date Date to find an ongoing segment on
         * @param  [segments] List of segments to check. When not provided the event segments is used
         * @return Ongoing segment
         */
        getSegmentByDate(date, segments) {
            segments = segments || this.getSegments();
            if (segments) {
                const index = this.getSegmentIndexByDate(date, segments);
                return segments[index];
            }
        }
        getSegmentIndexByDate(date, segments) {
            segments = segments || this.getSegments();
            return segments ? segments.findIndex(segment => date >= segment.startDate && date < segment.endDate) : -1;
        }
        /**
         * The event first segment or null if the event is not segmented.
         */
        get firstSegment() {
            const segments = this.getSegments();
            return segments ? segments[0] : null;
        }
        /**
         * The event last segment or null if the event is not segmented.
         */
        get lastSegment() {
            const segments = this.getSegments();
            return segments ? segments[segments.length - 1] : null;
        }
        /**
         * Returns a segment by its index.
         * @param index The segment index (zero based value).
         * @return The segment matching the provided index.
         */
        getSegment(index) {
            const segments = this.getSegments();
            return segments?.[index];
        }
        /**
         * Splits the event.
         * @param from The date to split this event at.
         * @param [lag=1] Split duration.
         * @param [lagUnit] Split duration unit.
         */
        async splitToSegments(from, lag = 1, lagUnit) {
            const project = this.getProject();
            await project.commitAsync();
            const me = this;
            // cannot split:
            // - if no split date specified
            // - a summary event
            // @ts-ignore
            if (!from || (me.isHasSubEventsMixin && me.childEvents?.size))
                return;
            const duration = me.duration;
            const durationUnit = me.durationUnit;
            const startDate = me.startDate;
            const endDate = me.endDate;
            lagUnit = lagUnit ? DateHelper.normalizeUnit(lagUnit) : durationUnit;
            // - not scheduled event
            // - provided date violates the event interval
            // - a zero duration event
            if (!startDate || !endDate || (startDate >= from) || (from >= endDate) || !duration)
                return;
            const isSegmented = me.isSegmented;
            let segments = me.segments || [];
            let segmentToSplit, segmentToSplitIndex;
            if (isSegmented) {
                segmentToSplitIndex = me.getSegmentIndexByDate(from, segments);
                segmentToSplit = segments[segmentToSplitIndex];
                if (!segmentToSplit)
                    return;
            }
            const splitTarget = segmentToSplit || me;
            const splitTargetStart = segmentToSplit ? splitTarget.startDate : startDate;
            const splitTargetDuration = splitTarget.duration;
            const splitTargetDurationUnit = splitTarget.durationUnit;
            const prevSegmentDuration = me.run('calculateProjectedDuration', splitTargetStart, from, splitTargetDurationUnit, { ignoreSegments: true });
            const nextSegmentDuration = splitTargetDuration - prevSegmentDuration;
            const lagInMs = project.run('$convertDuration', lag, lagUnit, TimeUnit.Millisecond);
            const nextSegmentStartOffset = lagInMs + me.run('calculateProjectedDuration', startDate, from, TimeUnit.Millisecond, { ignoreSegments: true });
            // split existing segment
            if (segmentToSplit) {
                // adjust its duration
                segmentToSplit.duration = prevSegmentDuration;
                const newSegment = this.segmentModelClass.new({
                    duration: nextSegmentDuration,
                    durationUnit: splitTargetDurationUnit,
                    startOffset: nextSegmentStartOffset
                });
                segments = segments.slice(0);
                segments.splice(segmentToSplitIndex + 1, 0, newSegment);
                me.segments = segments;
                me.duration = duration;
                // push next segments forward by the lag duration
                for (let i = segmentToSplitIndex + 2, l = segments.length; i < l; i++) {
                    const segment = segments[i];
                    if (segment) {
                        segment.startOffset += lagInMs;
                        segment.endOffset += lagInMs;
                    }
                }
            }
            // split not segmented event
            else {
                const previousSegment = this.segmentModelClass.new({
                    duration: prevSegmentDuration,
                    durationUnit: splitTargetDurationUnit,
                    startOffset: 0
                });
                const newSegment = this.segmentModelClass.new({
                    duration: duration - prevSegmentDuration,
                    durationUnit: splitTargetDurationUnit,
                    startOffset: nextSegmentStartOffset
                });
                me.duration = duration;
                me.segments = [previousSegment, newSegment];
            }
            return project.commitAsync();
        }
        /**
         * Merges the event segments.
         * The method merges two provided event segments (and all the segment between them if any).
         * @param [segment1] First segment to merge.
         * @param [segment2] Second segment to merge.
         */
        async mergeSegments(segment1, segment2) {
            if (!this.isSegmented)
                return;
            segment1 = segment1 || this.firstSegment;
            segment2 = segment2 || this.lastSegment;
            if (segment1.startOffset > segment2.startOffset) {
                let tmp = segment2;
                segment2 = segment1;
                segment1 = tmp;
            }
            // merging itself will be done automatically inside `calculateSegments`
            segment1.endDate = segment2.startDate;
            return this.getProject().commitAsync();
        }
        // Override storeFieldChange to support revertChanges for segments field
        storeFieldChange(key, oldValue) {
            // if we store segments old value
            if (key === 'segments' && oldValue) {
                const result = [];
                for (const segment of oldValue) {
                    // get the segment persistable data
                    const segmentData = segment.toJSON();
                    // if the segment was changes since the last time we stored segment oldValue
                    if (!this._segmentGeneration[segment.internalId] || segment.generation > this._segmentGeneration[segment.internalId]) {
                        // let's use the segment old values
                        Object.assign(segmentData, segment.meta.modified);
                    }
                    result.push(segmentData);
                    // keep the version of the segment
                    this._segmentGeneration[segment.internalId] = segment.generation;
                }
                oldValue = result;
            }
            super.storeFieldChange(key, oldValue);
        }
        leaveProject() {
            const segments = this.segments;
            if (segments) {
                this.graph.removeEntities(segments);
            }
            super.leaveProject();
        }
        endBatch(...args) {
            this.fieldMap.segments._skipSegmentsIsEqual++;
            super.endBatch(...args);
            this.fieldMap.segments._skipSegmentsIsEqual--;
        }
        copy(newId = null, deep = null) {
            const copy = super.copy(newId, deep);
            // need to clean the `segments` in `data`, otherwise it will be
            // picked up as "old value" by STM during set to `segments`
            // @ts-ignore
            copy.data.segments = undefined;
            if (copy.segments) {
                copy.segments = copy.segments.map(seg => Object.assign(seg.copy(), { event: copy }));
            }
            return copy;
        }
        toJSON() {
            const data = super.toJSON(), field = this.getFieldDefinition('segments'), 
            // @ts-ignore
            { persist, dataSource, complexMapping } = field;
            // if "segments" field is persistable
            if (persist) {
                let value = ObjectHelper.getPath(data, dataSource);
                if (value) {
                    value = value.map(s => s.toJSON());
                    ObjectHelper.setPath(data, dataSource, value);
                }
            }
            return data;
        }
    }
    __decorate([
        field({ identifierCls: SEDSGDispatcherIdentifier })
    ], SplitEventMixin.prototype, "dispatcher", void 0);
    __decorate([
        model_field({
            type: 'array',
            isEqual: compareSegmentsArray,
            convert: segmentsConverter,
            // @ts-ignore
            _skipSegmentsIsEqual: 0
        })
    ], SplitEventMixin.prototype, "segments", void 0);
    __decorate([
        field()
    ], SplitEventMixin.prototype, "adjustedSegments", void 0);
    __decorate([
        field()
    ], SplitEventMixin.prototype, "isSegmented", void 0);
    __decorate([
        write('segments')
    ], SplitEventMixin.prototype, "writeSegments", null);
    __decorate([
        calculate('segments')
    ], SplitEventMixin.prototype, "calculateSegments", null);
    __decorate([
        calculate('adjustedSegments')
    ], SplitEventMixin.prototype, "calculateAdjustedSegments", null);
    return SplitEventMixin;
}) {
}
