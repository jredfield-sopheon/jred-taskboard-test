import { HasProposedValue, PreviousValueOf, ProposedArgumentsOf, ProposedOrPrevious, ProposedOrPreviousValueOf, ProposedValueOf } from "../../../../ChronoGraph/chrono/Effect.js"
import { CalculatedValueGen, Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { SyncEffectHandler, Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculateProposed, CycleDescription, CycleResolution, Formula, FormulaId } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, field, write } from "../../../../ChronoGraph/replica/Entity.js"
import { FieldIdentifier } from "../../../../ChronoGraph/replica/Identifier.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { Duration, TimeUnit } from "../../../scheduling/Types.js"
import { DurationVar, EndDateVar, SEDDispatcher, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js"
import { BaseEventMixin } from "../scheduler_basic/BaseEventMixin.js"
import { SplitEventMixin } from "./SplitEventMixin.js"

export const MasterStartDateVar = Symbol('MasterStartDateVar')
export const MasterEndDateVar   = Symbol('MasterEndDateVar')
export const MasterDurationVar  = Symbol('MasterDurationVar')
export const MasterTotalDurationVar  = Symbol('MasterTotalDurationVar')
export const StartOffsetVar     = Symbol('StartOffsetVar')
export const EndOffsetVar       = Symbol('EndOffsetVar')

export const durationByOffsetsFormula = Formula.new({
    output      : DurationVar,
    inputs      : new Set([ StartOffsetVar, EndOffsetVar ])
})

export const startDateByMasterStartAndStartOffsetFormula = Formula.new({
    output      : StartDateVar,
    inputs      : new Set([ StartOffsetVar, MasterStartDateVar ])
})

export const endDateByMasterStartAndEndOffsetFormula = Formula.new({
    output      : EndDateVar,
    inputs      : new Set([ EndOffsetVar, MasterStartDateVar ])
})

export const startOffsetByMasterStartAndStartDateFormula = Formula.new({
    output      : StartOffsetVar,
    inputs      : new Set([ StartDateVar, MasterStartDateVar ])
})

export const endOffsetByMasterStartAndEndDateFormula = Formula.new({
    output      : EndOffsetVar,
    inputs      : new Set([ EndDateVar, MasterStartDateVar ])
})

export const startOffsetByEndOffsetAndDurationFormula = Formula.new({
    output      : StartOffsetVar,
    inputs      : new Set([ EndOffsetVar, DurationVar ])
})

export const endOffsetByStartOffsetAndDurationFormula = Formula.new({
    output      : EndOffsetVar,
    inputs      : new Set([ StartOffsetVar, DurationVar ])
})

export const endOffsetByMasterTotalDurationAndStartOffsetFormula = Formula.new({
    output      : EndOffsetVar,
    inputs      : new Set([ StartOffsetVar, MasterTotalDurationVar ])
})

export const endOffsetByMasterDurationAndStartOffsetFormula = Formula.new({
    output      : EndOffsetVar,
    inputs      : new Set([ StartOffsetVar, MasterDurationVar ])
})

// export const endOffsetByMasterEndDateAndStartOffsetFormula = Formula.new({
//     output      : EndOffsetVar,
//     inputs      : new Set([ StartOffsetVar, MasterEndDateVar ])
// })

export const durationByMasterEndDateFormula = Formula.new({
    output      : DurationVar,
    inputs      : new Set([ StartOffsetVar, MasterEndDateVar ])
})


export const segmentCycleDescription = CycleDescription.new({
    variables   : new Set([
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
    formulas    : new Set([
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
})

export const segmentCycleResolution = CycleResolution.new({
    description                 : segmentCycleDescription,
    defaultResolutionFormulas   : new Set([
        endDateByMasterStartAndEndOffsetFormula,
        endOffsetByMasterStartAndEndDateFormula,
        endOffsetByStartOffsetAndDurationFormula
    ])
})

export class SegmentSEDDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {
    ValueT                  : SEDDispatcher

    equality (v1 : SEDDispatcher, v2 : SEDDispatcher) : boolean {
        const resolution1       = v1.resolution
        const resolution2       = v2.resolution

        return resolution1.get(StartDateVar) === resolution2.get(StartDateVar)
            && resolution1.get(EndDateVar) === resolution2.get(EndDateVar)
            && resolution1.get(DurationVar) === resolution2.get(DurationVar)
            && resolution1.get(MasterStartDateVar) === resolution2.get(MasterStartDateVar)
            && resolution1.get(MasterEndDateVar) === resolution2.get(MasterEndDateVar)
            && resolution1.get(MasterDurationVar) === resolution2.get(MasterDurationVar)
            && resolution1.get(MasterTotalDurationVar) === resolution2.get(MasterTotalDurationVar)
            && resolution1.get(StartOffsetVar) === resolution2.get(StartOffsetVar)
            && resolution1.get(EndOffsetVar) === resolution2.get(EndOffsetVar)
    }
}

/**
 * This is the segment class [[SchedulerProProjectMixin]] works with.
 */
export class SchedulerProEventSegment extends Mixin(
    [ BaseEventMixin ],
    (base : AnyConstructor<BaseEventMixin, typeof BaseEventMixin>) => {


    class SchedulerProEventSegment extends base {

        @field({ identifierCls : SegmentSEDDispatcherIdentifier })
        dispatcher          : SEDDispatcher

        event               : SplitEventMixin

        previousSegment     : this

        nextSegment         : this

        /**
         * Zero-based index of the segment.
         */
        segmentIndex        : number

        @model_field({ persist : false })
        startOffset         : Duration

        @model_field({ persist : false })
        endOffset           : Duration

        @field()
        percentDone         : number

        @field()
        startPercentDone    : number

        @field()
        endPercentDone      : number

        get isEventSegment () {
            return true
        }

        get stm () {
            // use main event StateTrackingManager
            return this.event?.stm
        }

        set stm (value) {
        }

        @write('startDate')
        writeStartDate (me : Identifier, transaction : Transaction, quark : Quark, date : Date, keepDuration : boolean = true) {
            const event     = this.event
            const project   = this.getProject()

            // if it's the very first segment and it's not data loading or part of STM undo/redo
            if (event && !this.previousSegment && transaction.baseRevision.hasIdentifier(me) && !(project && project.getStm().isRestoring)) {
                event.$.startDate.constructor.prototype.write.call(this, event.$.startDate, transaction, null, date, keepDuration)
            }
            else {
                me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration)
            }

            // if we have next segment(s) and we have to respect and not overlap them
            if (keepDuration && this.nextSegment) {
                const shift = this.endOffset - this.nextSegment.startOffset

                if (shift > 0) {
                    let segment = this

                    // push next segments forward by the lag duration
                    while ((segment = segment.nextSegment)) {
                        segment.startOffset   += shift
                        segment.endOffset     += shift
                    }
                }
            }
        }


        shouldRecordFieldChange (fieldName, oldValue, newValue) {
            return (fieldName === 'startOffset' || fieldName === 'endOffset') || super.shouldRecordFieldChange(fieldName, oldValue, newValue)
        }


        @calculate('startOffset')
        * calculateStartOffset () : CalculationIterator<Duration> {
            const dispatcher                        = yield this.$.dispatcher
            const resolution : FormulaId            = dispatcher.resolution.get(StartOffsetVar)

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            let result : Duration

            if (resolution === CalculateProposed) {
                result = yield ProposedOrPrevious
            }
            else if (resolution === startOffsetByEndOffsetAndDurationFormula.formulaId) {
                result = yield* this.calculateStartOffsetByEndOffsetAndDuration()
            }
            else if (resolution === startOffsetByMasterStartAndStartDateFormula.formulaId) {
                const masterStartDate : Date  = yield ProposedOrPreviousValueOf(this.event.$.startDate)
                const startDate : Date        = yield ProposedOrPreviousValueOf(this.$.startDate)

                result = yield* this.event.calculateProjectedDuration(masterStartDate, startDate, TimeUnit.Millisecond, { ignoreSegments : true })
            }

            return result
        }


        @calculate('endOffset')
        * calculateEndOffset () : CalculationIterator<Duration> {
            const dispatcher              = yield this.$.dispatcher
            const resolution : FormulaId  = dispatcher.resolution.get(EndOffsetVar)

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            let result : Duration

            if (resolution === CalculateProposed) {
                result = yield ProposedOrPrevious
            }
            else if (resolution === endOffsetByStartOffsetAndDurationFormula.formulaId) {
                result = yield* this.calculateEndOffsetByStartOffsetAndDuration()
            }
            else if (resolution === endOffsetByMasterStartAndEndDateFormula.formulaId) {
                const masterStartDate : Date  = yield ProposedOrPreviousValueOf(this.event.$.startDate)
                const endDate : Date          = yield ProposedOrPreviousValueOf(this.$.endDate)

                result = yield* this.event.calculateProjectedDuration(masterStartDate, endDate, TimeUnit.Millisecond, { ignoreSegments : true })
            }
            else if (resolution === endOffsetByMasterDurationAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateEndOffsetByMasterDurationAndStartOffset()
            }
            else if (resolution === endOffsetByMasterTotalDurationAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateEndOffsetByMasterTotalDurationAndStartOffset()
            }

            return result
        }


        * calculateStartDate () : CalculationIterator<Date> {
            const dispatcher : SEDDispatcher  = yield this.$.dispatcher
            const formula : FormulaId         = dispatcher.resolution.get(StartDateVar)

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            let result

            if (formula === startDateByMasterStartAndStartOffsetFormula.formulaId) {
                result = yield* this.calculateStartDateByMasterStartAndStartOffset()
            }
            else {
                result = yield* super.calculateStartDate()
            }

            return result
        }


        * calculateEndDate () : CalculationIterator<Date> {
            const dispatcher : SEDDispatcher  = yield this.$.dispatcher
            const formula : FormulaId         = dispatcher.resolution.get(EndDateVar)

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            let result

            if (formula === endDateByMasterStartAndEndOffsetFormula.formulaId) {
                result = yield* this.calculateEndDateByMasterStartAndEndOffset()
            }
            else {
                result = yield* super.calculateEndDate()
            }

            return result
        }


        * calculateDuration () : CalculationIterator<Duration> {
            const dispatcher : SEDDispatcher    = yield this.$.dispatcher
            const formula : FormulaId           = dispatcher.resolution.get(DurationVar)

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            let result

            if (formula === durationByOffsetsFormula.formulaId) {
                result = yield* this.calculateDurationByOffsets()
            }
            else if (formula === durationByMasterEndDateFormula.formulaId) {
                result = yield* this.calculateDurationByOffsets()
            }
            else {
                result = yield* super.calculateDuration()
            }

            return result
        }


        buildProposedDispatcher (me : Identifier, quark : Quark, transaction : Transaction) : SEDDispatcher {
            const dispatcher = super.buildProposedDispatcher(me, quark, transaction)

            dispatcher.addPreviousValueFlag(MasterStartDateVar)
            dispatcher.addPreviousValueFlag(StartOffsetVar)
            dispatcher.addPreviousValueFlag(EndOffsetVar)

            return dispatcher
        }


        * prepareDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            const dispatcher        = yield* super.prepareDispatcher(YIELD)

            // return last value if the segment is detached
            if (!this.event) {
                return dispatcher//yield ProposedOrPrevious
            }

            // ProposedValueOf(this.event.$.startDate)
            if (YIELD(PreviousValueOf(this.event.$.startDate)) != null) dispatcher.addPreviousValueFlag(MasterStartDateVar)

            if (YIELD(HasProposedValue(this.event.$.startDate))) dispatcher.addProposedValueFlag(MasterStartDateVar)

            if (!YIELD(HasProposedValue(this.event.$.segments))) {
                dispatcher.collectInfo(YIELD, this.event.$.duration, MasterDurationVar)

                if (YIELD(HasProposedValue(this.event.$.endDate))) {
                    const masterEndDateArgs = YIELD(ProposedArgumentsOf(this.event.$.endDate))

                    if (!masterEndDateArgs?.[0]) {
                        dispatcher.addProposedValueFlag(MasterEndDateVar)
                    }
                }

                const masterDispatcher  = YIELD(this.event.$.dispatcher)

                if (
                    masterDispatcher.resolution.get(StartDateVar) === CalculateProposed &&
                    masterDispatcher.resolution.get(EndDateVar) === CalculateProposed
                ) {
                    dispatcher.addProposedValueFlag(MasterTotalDurationVar)
                }
            }

            dispatcher.collectInfo(YIELD, this.$.startOffset, StartOffsetVar)
            dispatcher.collectInfo(YIELD, this.$.endOffset, EndOffsetVar)

            return dispatcher
        }


        cycleResolutionContext (Y) : CycleResolution {
            return segmentCycleResolution
        }


        // endOffsetByMasterDurationAndStartOffsetFormula
        * calculateEndOffsetByMasterDurationAndStartOffset () : CalculationIterator<Duration> {
            const masterDuration : Duration     = yield ProposedOrPreviousValueOf(this.event.$.duration) //yield this.event.$.duration
            const masterDurationUnit : TimeUnit = yield this.event.$.durationUnit
            const startOffset : Duration        = yield this.$.startOffset
            const nextSegment : this            = this.nextSegment

            let result : Duration

            let masterDurationMs : Duration   = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond)

            const segments : Array<this> = []

            let segment = this

            while ((segment = segment.previousSegment)) {
                segments.push(segment)
            }

            for (let i = segments.length - 1; i >= 0; i--) {
                const segment               = segments[i]
                const segmentStartOffset    = yield ProposedOrPreviousValueOf(segment.$.startOffset)
                const segmentEndOffset      = yield ProposedOrPreviousValueOf(segment.$.endOffset)
                const segmentDurationMs     = segmentEndOffset - segmentStartOffset

                masterDurationMs -= segmentDurationMs
            }

            if (masterDurationMs > 0) {
                if (!nextSegment) {
                    result = startOffset + masterDurationMs
                }
                else {
                    result = startOffset + Math.min(masterDurationMs, (yield ProposedOrPreviousValueOf(this.$.endOffset)) - startOffset)
                }
            }
            // return start offset in case we have no duration left for this segment
            // then it will have start offset === end offset
            else {
                result = startOffset
            }

            return result
        }


        // endOffsetByMasterDurationAndStartOffsetFormula
        * calculateEndOffsetByMasterTotalDurationAndStartOffset () : CalculationIterator<Duration> {
            const masterStartDate : Date        = yield ProposedOrPreviousValueOf(this.event.$.startDate)
            const masterEndDate : Date          = yield ProposedOrPreviousValueOf(this.event.$.endDate)

            const masterTotalDurationMs : Duration = yield* this.event.calculateProjectedDuration(masterStartDate, masterEndDate, TimeUnit.Millisecond, { ignoreSegments : true })

            const startOffset   = yield ProposedOrPreviousValueOf(this.$.startOffset)
            let endOffset       = yield ProposedOrPreviousValueOf(this.$.endOffset)
            let nextSegment     = this.nextSegment

            if (startOffset <= masterTotalDurationMs) {

                // if the segment is inside master event time span
                if (endOffset <= masterTotalDurationMs) {

                    // if that's the last one (either by index or by the fact the next segment is ouside of the event range)
                    // make its end === master end
                    if (!nextSegment || (yield ProposedOrPreviousValueOf(nextSegment.$.startOffset)) >= masterTotalDurationMs) {
                        return masterTotalDurationMs
                    }

                    // otherwise keep existing value
                    return endOffset
                }
                // if the segment finishes later than the master event - make its end === master end
                else {
                    return masterTotalDurationMs
                }
            }

            // if the segment is outside of the master event - make its duration zero
            return yield this.$.startOffset
        }


        // startOffsetByEndOffsetAndDurationFormula
        * calculateStartOffsetByEndOffsetAndDuration () : CalculationIterator<Duration> {
            const duration : Duration       = yield this.$.duration
            const durationUnit : TimeUnit   = yield this.$.durationUnit
            const endOffset : Duration      = yield this.$.endOffset

            return endOffset - (yield* this.event.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond))
        }


        // endOffsetByStartOffsetAndDurationFormula
        * calculateEndOffsetByStartOffsetAndDuration () : CalculationIterator<Duration> {
            const duration : Duration       = yield this.$.duration
            const durationUnit : TimeUnit   = yield this.$.durationUnit
            const startOffset : Duration    = yield this.$.startOffset

            return startOffset + (yield* this.event.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond))
        }


        // endDateByMasterStartAndEndOffsetFormula
        * calculateEndDateByMasterStartAndEndOffset () : CalculationIterator<Date> {
            const masterStartDate : Date    = yield this.event.$.startDate
            const endOffset : Duration      = yield this.$.endOffset

            const rawDate : Date            = yield* this.event.calculateProjectedXDateWithDuration(masterStartDate, true, endOffset, TimeUnit.Millisecond, { ignoreSegments : true })

            const manuallyScheduled : boolean = yield this.$.manuallyScheduled

            return manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                ? rawDate
                : yield* this.event.skipNonWorkingTime(rawDate, false)
        }


        // startDateByMasterStartAndStartOffsetFormula
        * calculateStartDateByMasterStartAndStartOffset () : CalculationIterator<Date> {
            const masterStartDate : Date    = yield this.event.$.startDate
            const startOffset : Duration    = yield this.$.startOffset

            const rawDate : Date            = yield* this.event.calculateProjectedXDateWithDuration(masterStartDate, true, startOffset, TimeUnit.Millisecond, { ignoreSegments : true })

            const manuallyScheduled : boolean = yield this.$.manuallyScheduled

            return manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                ? rawDate
                : yield* this.event.skipNonWorkingTime(rawDate)
        }


        // durationByOffsetsFormula
        * calculateDurationByOffsets () : CalculationIterator<Duration> {
            const startOffset : Duration    = yield this.$.startOffset
            const endOffset : Duration      = yield this.$.endOffset
            const durationUnit : TimeUnit   = yield this.$.durationUnit

            return yield* this.getProject().$convertDuration(endOffset - startOffset, TimeUnit.Millisecond, durationUnit)
        }


        @calculate('percentDone')
        * calculatePercentDone () : CalculationIterator<number> {
            let result : number = 0

            // return last value if the segment is detached
            if (!this.event) {
                return yield ProposedOrPrevious
            }


            const segments : Array<this> = yield this.event.$.segments

            if (segments) {
                const masterPercentDone : number    = yield this.event.$.percentDone
                const masterDuration : Duration     = yield this.event.$.duration
                const masterDurationUnit : TimeUnit = yield this.event.$.durationUnit

                let masterDurationMs : Duration     = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond)

                let completeMasterDurationMs : Duration = masterPercentDone * 0.01 * masterDurationMs

                for (const segment of segments) {
                    const segmentStartOffset : Duration = segment.startOffset
                    const segmentEndOffset : Duration   = segment.endOffset
                    const segmentDurationMs : Duration  = segmentEndOffset - segmentStartOffset

                    if (segment === this) {
                        if (completeMasterDurationMs >= segmentDurationMs)
                            return 100
                        else if (completeMasterDurationMs > 0)
                            return 100 * completeMasterDurationMs / segmentDurationMs
                        else
                            return 0
                    }

                    completeMasterDurationMs -= segmentDurationMs
                }
            }

            return result
        }

        @calculate('startPercentDone')
        * calculateMinPercent () : CalculationIterator<number> {
            const previousSegment : this        = this.previousSegment

            if (!this.event) {
                return yield ProposedOrPrevious
            }

            if (previousSegment) {
                return yield previousSegment.$.endPercentDone
            }

            return 0
        }

        @calculate('endPercentDone')
        * calculateMaxPercent () : CalculationIterator<number> {
            if (!this.event) {
                return yield ProposedOrPrevious
            }

            const masterDuration : Duration     = yield this.event.$.duration
            const masterDurationUnit : TimeUnit = yield this.event.$.durationUnit
            let masterDurationMs : Duration     = yield* this.getProject().$convertDuration(masterDuration, masterDurationUnit, TimeUnit.Millisecond)

            const startOffset : Duration        = yield this.$.startOffset
            const endOffset : Duration          = yield this.$.endOffset
            const minPercent : number           = yield this.$.startPercentDone

            return minPercent + 100 * (endOffset - startOffset) / masterDurationMs
        }

        // @override
        * calculateProjectedXDateWithDuration (baseDate : Date, isForward : boolean, duration : Duration, durationUnit? : TimeUnit) : CalculationIterator<Date> {
            if (!durationUnit) durationUnit = yield this.$.durationUnit

            return yield* this.event.calculateProjectedXDateWithDuration(baseDate, isForward, duration, durationUnit, { ignoreSegments : true })
        }


        // @override
        * calculateProjectedDuration (startDate : Date, endDate : Date, durationUnit? : TimeUnit) : CalculationIterator<Duration> {
            if (!durationUnit) durationUnit = yield this.$.durationUnit

            return yield* this.event.calculateProjectedDuration(startDate, endDate, durationUnit, { ignoreSegments : true })
        }

        @calculate('manuallyScheduled')
        * calculateManuallyScheduled () : CalculationIterator<boolean> {
            if (this.event) {
                return yield this.event.$.manuallyScheduled
            } else {
                return yield ProposedOrPrevious
            }
        }
    }

    return SchedulerProEventSegment
}){}
