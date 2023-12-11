var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HasProposedValue, PreviousValueOf, ProposedArgumentsOf, ProposedOrPrevious, ProposedOrPreviousValueOf } from "../../../../ChronoGraph/chrono/Effect.js";
import { CalculatedValueGen } from "../../../../ChronoGraph/chrono/Identifier.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { CalculateProposed, CycleDescription, CycleResolution, Formula } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js";
import { calculate, field, write } from "../../../../ChronoGraph/replica/Entity.js";
import { FieldIdentifier } from "../../../../ChronoGraph/replica/Identifier.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { TimeUnit } from "../../../scheduling/Types.js";
import { DurationVar, EndDateVar, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js";
import { BaseEventMixin } from "../scheduler_basic/BaseEventMixin.js";
export const MasterStartDateVar = Symbol('MasterStartDateVar');
export const MasterEndDateVar = Symbol('MasterEndDateVar');
export const MasterDurationVar = Symbol('MasterDurationVar');
export const MasterTotalDurationVar = Symbol('MasterTotalDurationVar');
export const StartOffsetVar = Symbol('StartOffsetVar');
export const EndOffsetVar = Symbol('EndOffsetVar');
export const durationByOffsetsFormula = Formula.new({
    output: DurationVar,
    inputs: new Set([StartOffsetVar, EndOffsetVar])
});
export const startDateByMasterStartAndStartOffsetFormula = Formula.new({
    output: StartDateVar,
    inputs: new Set([StartOffsetVar, MasterStartDateVar])
});
export const endDateByMasterStartAndEndOffsetFormula = Formula.new({
    output: EndDateVar,
    inputs: new Set([EndOffsetVar, MasterStartDateVar])
});
export const startOffsetByMasterStartAndStartDateFormula = Formula.new({
    output: StartOffsetVar,
    inputs: new Set([StartDateVar, MasterStartDateVar])
});
export const endOffsetByMasterStartAndEndDateFormula = Formula.new({
    output: EndOffsetVar,
    inputs: new Set([EndDateVar, MasterStartDateVar])
});
export const startOffsetByEndOffsetAndDurationFormula = Formula.new({
    output: StartOffsetVar,
    inputs: new Set([EndOffsetVar, DurationVar])
});
export const endOffsetByStartOffsetAndDurationFormula = Formula.new({
    output: EndOffsetVar,
    inputs: new Set([StartOffsetVar, DurationVar])
});
export const endOffsetByMasterTotalDurationAndStartOffsetFormula = Formula.new({
    output: EndOffsetVar,
    inputs: new Set([StartOffsetVar, MasterTotalDurationVar])
});
export const endOffsetByMasterDurationAndStartOffsetFormula = Formula.new({
    output: EndOffsetVar,
    inputs: new Set([StartOffsetVar, MasterDurationVar])
});
// export const endOffsetByMasterEndDateAndStartOffsetFormula = Formula.new({
//     output      : EndOffsetVar,
//     inputs      : new Set([ StartOffsetVar, MasterEndDateVar ])
// })
export const durationByMasterEndDateFormula = Formula.new({
    output: DurationVar,
    inputs: new Set([StartOffsetVar, MasterEndDateVar])
});
export const segmentCycleDescription = CycleDescription.new({
    variables: new Set([
        StartDateVar,
        EndDateVar,
        DurationVar,
        MasterStartDateVar,
        MasterEndDateVar,
        MasterDurationVar,
        MasterTotalDurationVar,
        StartOffsetVar,
        EndOffsetVar
    ]),
    formulas: new Set([
        // the order of formulas is important here - the earlier ones are preferred
        durationByOffsetsFormula,
        startDateByMasterStartAndStartOffsetFormula,
        endDateByMasterStartAndEndOffsetFormula,
        startOffsetByEndOffsetAndDurationFormula,
        startOffsetByMasterStartAndStartDateFormula,
        endOffsetByStartOffsetAndDurationFormula,
        endOffsetByMasterTotalDurationAndStartOffsetFormula,
        endOffsetByMasterDurationAndStartOffsetFormula,
        // endOffsetByMasterEndDateAndStartOffsetFormula,
        endOffsetByMasterStartAndEndDateFormula,
        durationByMasterEndDateFormula
    ])
});
export const segmentCycleResolution = CycleResolution.new({
    description: segmentCycleDescription,
    defaultResolutionFormulas: new Set([
        endDateByMasterStartAndEndOffsetFormula,
        endOffsetByMasterStartAndEndDateFormula,
        endOffsetByStartOffsetAndDurationFormula
    ])
});
export class SegmentSEDDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {
    equality(v1, v2) {
        const resolution1 = v1.resolution;
        const resolution2 = v2.resolution;
        return resolution1.get(StartDateVar) === resolution2.get(StartDateVar)
            && resolution1.get(EndDateVar) === resolution2.get(EndDateVar)
            && resolution1.get(DurationVar) === resolution2.get(DurationVar)
            && resolution1.get(MasterStartDateVar) === resolution2.get(MasterStartDateVar)
            && resolution1.get(MasterEndDateVar) === resolution2.get(MasterEndDateVar)
            && resolution1.get(MasterDurationVar) === resolution2.get(MasterDurationVar)
            && resolution1.get(MasterTotalDurationVar) === resolution2.get(MasterTotalDurationVar)
            && resolution1.get(StartOffsetVar) === resolution2.get(StartOffsetVar)
            && resolution1.get(EndOffsetVar) === resolution2.get(EndOffsetVar);
    }
}
/**
 * This is the segment class [[SchedulerProProjectMixin]] works with.
 */
export class SchedulerProEventSegment extends Mixin([BaseEventMixin], (base) => {
    class SchedulerProEventSegment extends base {
        get isEventSegment() {
            return true;
        }
        get stm() {
            // use main event StateTrackingManager
            return this.event?.stm;
        }
        set stm(value) {
        }
        writeStartDate(me, transaction, quark, date, keepDuration = true) {
            const event = this.event;
            const project = this.getProject();
            // if it's the very first segment and it's not data loading or part of STM undo/redo
            if (event && !this.previousSegment && transaction.baseRevision.hasIdentifier(me) && !(project && project.getStm().isRestoring)) {
                event.$.startDate.constructor.prototype.write.call(this, event.$.startDate, transaction, null, date, keepDuration);
            }
            else {
                me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration);
            }
            // if we have next segment(s) and we have to respect and not overlap them
            if (keepDuration && this.nextSegment) {
                const shift = this.endOffset - this.nextSegment.startOffset;
                if (shift > 0) {
                    let segment = this;
                    // push next segments forward by the lag duration
                    while ((segment = segment.nextSegment)) {
                        segment.startOffset += shift;
                        segment.endOffset += shift;
                    }
                }
            }
        }
        shouldRecordFieldChange(fieldName, oldValue, newValue) {
            return (fieldName === 'startOffset' || fieldName === 'endOffset') || super.shouldRecordFieldChange(fieldName, oldValue, newValue);
        }
        *calculateStartOffset() {
            const dispatcher = yield this.$.dispatcher;
            const resolution = dispatcher.resolution.get(StartOffsetVar);
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            let result;
            if (resolution === CalculateProposed) {
                result = yield ProposedOrPrevious;
            }
            else if (resolution === startOffsetByEndOffsetAndDurationFormula.formulaId) {
                result = yield* this.calculateStartOffsetByEndOffsetAndDuration();
            }
            else if (resolution === startOffsetByMasterStartAndStartDateFormula.formulaId) {
                const masterStartDate = yield ProposedOrPreviousValueOf(this.event.$.startDate);
                const startDate = yield ProposedOrPreviousValueOf(this.$.startDate);
                result = yield* this.event.calculateProjectedDuration(masterStartDate, startDate, TimeUnit.Millisecond, { ignoreSegments: true });
            }
            return result;
        }
        *calculateEndOffset() {
            const dispatcher = yield this.$.dispatcher;
            const resolution = dispatcher.resolution.get(EndOffsetVar);
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            let result;
            if (resolution === CalculateProposed) {
                result = yield ProposedOrPrevious;
            }
            else if (resolution === endOffsetByStartOffsetAndDurationFormula.formulaId) {
                result = yield* this.calculateEndOffsetByStartOffsetAndDuration();
            }
            else if (resolution === endOffsetByMasterStartAndEndDateFormula.formulaId) {
                const masterStartDate = yield ProposedOrPreviousValueOf(this.event.$.startDate);
                const endDate = yield ProposedOrPreviousValueOf(this.$.endDate);
                result = yield* this.event.calculateProjectedDuration(masterStartDate, endDate, TimeUnit.Millisecond, { ignoreSegments: true });
            }
            else if (resolution === endOffsetByMasterDurationAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateEndOffsetByMasterDurationAndStartOffset();
            }
            else if (resolution === endOffsetByMasterTotalDurationAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateEndOffsetByMasterTotalDurationAndStartOffset();
            }
            return result;
        }
        *calculateStartDate() {
            const dispatcher = yield this.$.dispatcher;
            const formula = dispatcher.resolution.get(StartDateVar);
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            let result;
            if (formula === startDateByMasterStartAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateStartDateByMasterStartAndStartOffset();
            }
            else {
                result = yield* super.calculateStartDate();
            }
            return result;
        }
        *calculateEndDate() {
            const dispatcher = yield this.$.dispatcher;
            const formula = dispatcher.resolution.get(EndDateVar);
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            let result;
            if (formula === endDateByMasterStartAndEndOffsetFormula.formulaId) {
                result = yield* this.calculateEndDateByMasterStartAndEndOffset();
            }
            else {
                result = yield* super.calculateEndDate();
            }
            return result;
        }
        *calculateDuration() {
            const dispatcher = yield this.$.dispatcher;
            const formula = dispatcher.resolution.get(DurationVar);
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            let result;
            if (formula === durationByOffsetsFormula.formulaId) {
                result = yield* this.calculateDurationByOffsets();
            }
            else if (formula === durationByMasterEndDateFormula.formulaId) {
                result = yield* this.calculateDurationByOffsets();
            }
            else {
                result = yield* super.calculateDuration();
            }
            return result;
        }
        buildProposedDispatcher(me, quark, transaction) {
            const dispatcher = super.buildProposedDispatcher(me, quark, transaction);
            dispatcher.addPreviousValueFlag(MasterStartDateVar);
            dispatcher.addPreviousValueFlag(StartOffsetVar);
            dispatcher.addPreviousValueFlag(EndOffsetVar);
            return dispatcher;
        }
        *prepareDispatcher(YIELD) {
            const dispatcher = yield* super.prepareDispatcher(YIELD);
            // return last value if the segment is detached
            if (!this.event) {
                return dispatcher; //yield ProposedOrPrevious
            }
            // ProposedValueOf(this.event.$.startDate)
            if (YIELD(PreviousValueOf(this.event.$.startDate)) != null)
                dispatcher.addPreviousValueFlag(MasterStartDateVar);
            if (YIELD(HasProposedValue(this.event.$.startDate)))
                dispatcher.addProposedValueFlag(MasterStartDateVar);
            if (!YIELD(HasProposedValue(this.event.$.segments))) {
                dispatcher.collectInfo(YIELD, this.event.$.duration, MasterDurationVar);
                if (YIELD(HasProposedValue(this.event.$.endDate))) {
                    const masterEndDateArgs = YIELD(ProposedArgumentsOf(this.event.$.endDate));
                    if (!masterEndDateArgs?.[0]) {
                        dispatcher.addProposedValueFlag(MasterEndDateVar);
                    }
                }
                const masterDispatcher = YIELD(this.event.$.dispatcher);
                if (masterDispatcher.resolution.get(StartDateVar) === CalculateProposed &&
                    masterDispatcher.resolution.get(EndDateVar) === CalculateProposed) {
                    dispatcher.addProposedValueFlag(MasterTotalDurationVar);
                }
            }
            dispatcher.collectInfo(YIELD, this.$.startOffset, StartOffsetVar);
            dispatcher.collectInfo(YIELD, this.$.endOffset, EndOffsetVar);
            return dispatcher;
        }
        cycleResolutionContext(Y) {
            return segmentCycleResolution;
        }
        // endOffsetByMasterDurationAndStartOffsetFormula
        *calculateEndOffsetByMasterDurationAndStartOffset() {
            const masterDuration = yield ProposedOrPreviousValueOf(this.event.$.duration); //yield this.event.$.duration
            const masterDurationUnit = yield this.event.$.durationUnit;
            const startOffset = yield this.$.startOffset;
            const nextSegment = this.nextSegment;
            let result;
            let masterDurationMs = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond);
            const segments = [];
            let segment = this;
            while ((segment = segment.previousSegment)) {
                segments.push(segment);
            }
            for (let i = segments.length - 1; i >= 0; i--) {
                const segment = segments[i];
                const segmentStartOffset = yield ProposedOrPreviousValueOf(segment.$.startOffset);
                const segmentEndOffset = yield ProposedOrPreviousValueOf(segment.$.endOffset);
                const segmentDurationMs = segmentEndOffset - segmentStartOffset;
                masterDurationMs -= segmentDurationMs;
            }
            if (masterDurationMs > 0) {
                if (!nextSegment) {
                    result = startOffset + masterDurationMs;
                }
                else {
                    result = startOffset + Math.min(masterDurationMs, (yield ProposedOrPreviousValueOf(this.$.endOffset)) - startOffset);
                }
            }
            // return start offset in case we have no duration left for this segment
            // then it will have start offset === end offset
            else {
                result = startOffset;
            }
            return result;
        }
        // endOffsetByMasterDurationAndStartOffsetFormula
        *calculateEndOffsetByMasterTotalDurationAndStartOffset() {
            const masterStartDate = yield ProposedOrPreviousValueOf(this.event.$.startDate);
            const masterEndDate = yield ProposedOrPreviousValueOf(this.event.$.endDate);
            const masterTotalDurationMs = yield* this.event.calculateProjectedDuration(masterStartDate, masterEndDate, TimeUnit.Millisecond, { ignoreSegments: true });
            const startOffset = yield ProposedOrPreviousValueOf(this.$.startOffset);
            let endOffset = yield ProposedOrPreviousValueOf(this.$.endOffset);
            let nextSegment = this.nextSegment;
            if (startOffset <= masterTotalDurationMs) {
                // if the segment is inside master event time span
                if (endOffset <= masterTotalDurationMs) {
                    // if that's the last one (either by index or by the fact the next segment is ouside of the event range)
                    // make its end === master end
                    if (!nextSegment || (yield ProposedOrPreviousValueOf(nextSegment.$.startOffset)) >= masterTotalDurationMs) {
                        return masterTotalDurationMs;
                    }
                    // otherwise keep existing value
                    return endOffset;
                }
                // if the segment finishes later than the master event - make its end === master end
                else {
                    return masterTotalDurationMs;
                }
            }
            // if the segment is outside of the master event - make its duration zero
            return yield this.$.startOffset;
        }
        // startOffsetByEndOffsetAndDurationFormula
        *calculateStartOffsetByEndOffsetAndDuration() {
            const duration = yield this.$.duration;
            const durationUnit = yield this.$.durationUnit;
            const endOffset = yield this.$.endOffset;
            return endOffset - (yield* this.event.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
        }
        // endOffsetByStartOffsetAndDurationFormula
        *calculateEndOffsetByStartOffsetAndDuration() {
            const duration = yield this.$.duration;
            const durationUnit = yield this.$.durationUnit;
            const startOffset = yield this.$.startOffset;
            return startOffset + (yield* this.event.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
        }
        // endDateByMasterStartAndEndOffsetFormula
        *calculateEndDateByMasterStartAndEndOffset() {
            const masterStartDate = yield this.event.$.startDate;
            const endOffset = yield this.$.endOffset;
            const rawDate = yield* this.event.calculateProjectedXDateWithDuration(masterStartDate, true, endOffset, TimeUnit.Millisecond, { ignoreSegments: true });
            const manuallyScheduled = yield this.$.manuallyScheduled;
            return manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                ? rawDate
                : yield* this.event.skipNonWorkingTime(rawDate, false);
        }
        // startDateByMasterStartAndStartOffsetFormula
        *calculateStartDateByMasterStartAndStartOffset() {
            const masterStartDate = yield this.event.$.startDate;
            const startOffset = yield this.$.startOffset;
            const rawDate = yield* this.event.calculateProjectedXDateWithDuration(masterStartDate, true, startOffset, TimeUnit.Millisecond, { ignoreSegments: true });
            const manuallyScheduled = yield this.$.manuallyScheduled;
            return manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                ? rawDate
                : yield* this.event.skipNonWorkingTime(rawDate);
        }
        // durationByOffsetsFormula
        *calculateDurationByOffsets() {
            const startOffset = yield this.$.startOffset;
            const endOffset = yield this.$.endOffset;
            const durationUnit = yield this.$.durationUnit;
            return yield* this.getProject().$convertDuration(endOffset - startOffset, TimeUnit.Millisecond, durationUnit);
        }
        *calculatePercentDone() {
            let result = 0;
            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious;
            }

            const segments = yield this.event.$.segments;
            if (segments) {
                const masterPercentDone = yield this.event.$.percentDone;
                const masterDuration = yield this.event.$.duration;
                const masterDurationUnit = yield this.event.$.durationUnit;
                let masterDurationMs = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond);
                let completeMasterDurationMs = masterPercentDone * 0.01 * masterDurationMs;
                for (const segment of segments) {
                    const segmentStartOffset = segment.startOffset;
                    const segmentEndOffset = segment.endOffset;
                    const segmentDurationMs = segmentEndOffset - segmentStartOffset;
                    if (segment === this) {
                        if (completeMasterDurationMs >= segmentDurationMs)
                            return 100;
                        else if (completeMasterDurationMs > 0)
                            return 100 * completeMasterDurationMs / segmentDurationMs;
                        else
                            return 0;
                    }
                    completeMasterDurationMs -= segmentDurationMs;
                }
            }
            return result;
        }
        *calculateMinPercent() {
            const previousSegment = this.previousSegment;
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            if (previousSegment) {
                return yield previousSegment.$.endPercentDone;
            }
            return 0;
        }
        *calculateMaxPercent() {
            if (!this.event) {
                return yield ProposedOrPrevious;
            }
            const masterDuration = yield this.event.$.duration;
            const masterDurationUnit = yield this.event.$.durationUnit;
            let masterDurationMs = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond);
            const startOffset = yield this.$.startOffset;
            const endOffset = yield this.$.endOffset;
            const minPercent = yield this.$.startPercentDone;
            return minPercent + 100 * (endOffset - startOffset) / masterDurationMs;
        }
        // @override
        *calculateProjectedXDateWithDuration(baseDate, isForward, duration, durationUnit) {
            if (!durationUnit)
                durationUnit = yield this.$.durationUnit;
            return yield* this.event.calculateProjectedXDateWithDuration(baseDate, isForward, duration, durationUnit, { ignoreSegments: true });
        }
        // @override
        *calculateProjectedDuration(startDate, endDate, durationUnit) {
            if (!durationUnit)
                durationUnit = yield this.$.durationUnit;
            return yield* this.event.calculateProjectedDuration(startDate, endDate, durationUnit, { ignoreSegments: true });
        }
        *calculateManuallyScheduled() {
            if (this.event) {
                return yield this.event.$.manuallyScheduled;
            }
            else {
                return yield ProposedOrPrevious;
            }
        }
    }
    __decorate([
        field({ identifierCls: SegmentSEDDispatcherIdentifier })
    ], SchedulerProEventSegment.prototype, "dispatcher", void 0);
    __decorate([
        model_field({ persist: false })
    ], SchedulerProEventSegment.prototype, "startOffset", void 0);
    __decorate([
        model_field({ persist: false })
    ], SchedulerProEventSegment.prototype, "endOffset", void 0);
    __decorate([
        field()
    ], SchedulerProEventSegment.prototype, "percentDone", void 0);
    __decorate([
        field()
    ], SchedulerProEventSegment.prototype, "startPercentDone", void 0);
    __decorate([
        field()
    ], SchedulerProEventSegment.prototype, "endPercentDone", void 0);
    __decorate([
        write('startDate')
    ], SchedulerProEventSegment.prototype, "writeStartDate", null);
    __decorate([
        calculate('startOffset')
    ], SchedulerProEventSegment.prototype, "calculateStartOffset", null);
    __decorate([
        calculate('endOffset')
    ], SchedulerProEventSegment.prototype, "calculateEndOffset", null);
    __decorate([
        calculate('percentDone')
    ], SchedulerProEventSegment.prototype, "calculatePercentDone", null);
    __decorate([
        calculate('startPercentDone')
    ], SchedulerProEventSegment.prototype, "calculateMinPercent", null);
    __decorate([
        calculate('endPercentDone')
    ], SchedulerProEventSegment.prototype, "calculateMaxPercent", null);
    __decorate([
        calculate('manuallyScheduled')
    ], SchedulerProEventSegment.prototype, "calculateManuallyScheduled", null);
    return SchedulerProEventSegment;
}) {
}
