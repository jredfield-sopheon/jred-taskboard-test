import {
    HasProposedValue,
    PreviousValueOf,
    ProposedArgumentsOf,
    ProposedOrPrevious,
    ProposedOrPreviousValueOf,
    ProposedValueOf,
    WriteInfo,
    WriteSeveral
} from "../../../../ChronoGraph/chrono/Effect.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { CalculatedValueGen, Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark, TombStone } from "../../../../ChronoGraph/chrono/Quark.js"
import { SyncEffectHandler, Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/Mixin.js'
import { CycleDescription, CycleResolution, Formula } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from '../../../../ChronoGraph/primitives/Calculation.js'
import { calculate, field, write } from '../../../../ChronoGraph/replica/Entity.js'
import { FieldIdentifier } from "../../../../ChronoGraph/replica/Identifier.js"
import DateHelper from "../../../../Core/helper/DateHelper.js"
import { CalendarIteratorResult } from "../../../calendar/CalendarCache.js"
import { CalendarCacheIntervalMultiple } from "../../../calendar/CalendarCacheIntervalMultiple.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { Direction, Duration, EffectiveDirection, TimeUnit } from '../../../scheduling/Types.js'
import { MAX_DATE } from "../../../util/Constants.js"
import { ModelId } from "../../Types.js"
import { AbstractCalendarMixin } from "../AbstractCalendarMixin.js"
import { BaseCalendarMixin } from '../scheduler_basic/BaseCalendarMixin.js'
import {
    durationFormula,
    DurationVar,
    endDateFormula,
    EndDateVar,
    SEDDispatcher,
    startDateFormula,
    StartDateVar
} from "../scheduler_basic/BaseEventDispatcher.js"
import { HasPercentDoneMixin } from "./HasPercentDoneMixin.js"
import { SchedulerProEventSegment } from './SchedulerProEventSegment.js'
import { SchedulerProHasAssignmentsMixin } from "./SchedulerProHasAssignmentsMixin.js"
import ObjectHelper from "../../../../Core/helper/ObjectHelper.js"

export const SegmentsVar = Symbol('SegmentsVar')

export const segmentsConverter = (value : Partial<SchedulerProEventSegment>[], data : Object, record : SplitEventMixin) => record.processSegmentsValue(value)

export const startDateByEndDateAndSegmentsFormula = Formula.new({
    output      : StartDateVar,
    inputs      : new Set([ EndDateVar, SegmentsVar ])
})

export const endDateByStartDateAndSegmentsFormula = Formula.new({
    output      : EndDateVar,
    inputs      : new Set([ StartDateVar, SegmentsVar ])
})

export const durationByStartDateAndEndDateAndSegmentsFormula = Formula.new({
    output      : DurationVar,
    inputs      : new Set([ StartDateVar, EndDateVar, SegmentsVar ])
})

export const SEDSGGraphDescription = CycleDescription.new({
    variables   : new Set([ StartDateVar, EndDateVar, DurationVar, SegmentsVar ]),
    formulas    : new Set([
        endDateByStartDateAndSegmentsFormula,
        startDateByEndDateAndSegmentsFormula,
        // durationByStartDateAndEndDateAndSegmentsFormula,
        startDateFormula,
        endDateFormula,
        durationFormula
    ])
})

export const SEDSGForwardCycleResolution = CycleResolution.new({
    description                 : SEDSGGraphDescription,
    defaultResolutionFormulas   : new Set([ endDateFormula, endDateByStartDateAndSegmentsFormula ])
})

export const SEDSGBackwardCycleResolution = CycleResolution.new({
    description                 : SEDSGGraphDescription,
    defaultResolutionFormulas   : new Set([ startDateFormula, startDateByEndDateAndSegmentsFormula ])
})

export class SEDSGDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {

    ValueT  : SEDDispatcher

    equality (v1 : SEDDispatcher, v2 : SEDDispatcher) : boolean {
        const resolution1       = v1.resolution
        const resolution2       = v2.resolution

        return resolution1.get(StartDateVar) === resolution2.get(StartDateVar)
            && resolution1.get(EndDateVar) === resolution2.get(EndDateVar)
            && resolution1.get(DurationVar) === resolution2.get(DurationVar)
            && resolution1.get(SegmentsVar) === resolution2.get(SegmentsVar)
    }
}

export function compareSegmentsArray (a : SchedulerProEventSegment[], b : SchedulerProEventSegment[]) : boolean {
    if (!a && !b) return true

    if (this._skipSegmentsIsEqual) return false

    if (!a && b || a && !b) return false

    if (a.length !== b.length) return false

    return a.every((segment, index) => compareSegments(segment, b[ index ]))
}

export const compareSegments = (a : SchedulerProEventSegment, b : SchedulerProEventSegment) : boolean => {
    if (a === b) return true

    const segmentModel  = a.isModel ? a : b
    const fieldMap      = segmentModel.fieldMap

    const aStart = a.startDate instanceof Date ? a.startDate.getTime() : fieldMap.startDate.convert(a.startDate).getTime()
    const bStart = b.startDate instanceof Date ? b.startDate.getTime() : fieldMap.startDate.convert(b.startDate).getTime()

    const aEnd = a.endDate instanceof Date ? a.endDate.getTime() : fieldMap.endDate.convert(a.endDate).getTime()
    const bEnd = b.endDate instanceof Date ? b.endDate.getTime() : fieldMap.endDate.convert(b.endDate).getTime()

    return aStart === bStart && aEnd === bEnd
}

export class SplitEventMixin extends Mixin(
    [ SchedulerProHasAssignmentsMixin, HasPercentDoneMixin ],
    (base : AnyConstructor<SchedulerProHasAssignmentsMixin & HasPercentDoneMixin, typeof SchedulerProHasAssignmentsMixin & typeof HasPercentDoneMixin>) => {


    class SplitEventMixin extends base {

        static get $name () {
            return 'SplitEventMixin'
        }

        @field({ identifierCls : SEDSGDispatcherIdentifier })
        dispatcher       : SEDDispatcher

        segmentModelClass : typeof SchedulerProEventSegment

        @model_field({
            type    : 'array',
            isEqual : compareSegmentsArray,
            convert : segmentsConverter as (value : any, data : Object, record : any) => any,
            // @ts-ignore
            _skipSegmentsIsEqual : 0
        })
        segments : InstanceType<this['segmentModelClass']>[]

        @field()
        adjustedSegments : boolean

        /**
         * Indicates whether the event is segmented or not. Is set to `true` if the event is segmented and `false` otherwise.
         */
        @field()
        isSegmented : boolean

        _segmentGeneration : object = {}

        _lastSegmentsSnapshot : string

        construct () {
            this.segmentModelClass = this.getDefaultSegmentModelClass()

            super.construct(...arguments)
        }

        get rawModifications () {
            let data = super.rawModifications

            // include segment changes
            if (this.segments && (!data || !('segments' in data))) {
                for (const segment of this.segments) {
                    if (segment.rawModifications) {
                        data            = data || {}
                        data.segments   = this.getFieldPersistentValue('segments')
                        break
                    }
                }
            }

            return data
        }

        clearChanges (includeDescendants : boolean, removeFromStoreChanges : boolean, changes : object) {
            for (const segment of this.segments || []) {
                segment.clearChanges(includeDescendants, removeFromStoreChanges, null)
            }

            super.clearChanges(includeDescendants, removeFromStoreChanges, changes)
        }

        getDefaultSegmentModelClass () : this['segmentModelClass'] {
            return SchedulerProEventSegment
        }


        * prepareDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {

            const dispatcher : SEDDispatcher   = yield* super.prepareDispatcher(YIELD)

            if (yield* this.hasSegmentChangesProposed()) {
                dispatcher.addProposedValueFlag(SegmentsVar)
            }

            return dispatcher
        }


        cycleResolutionContext (Y) : CycleResolution {
            const direction : EffectiveDirection    = Y(this.$.effectiveDirection)

            return direction.direction === Direction.Forward || direction.direction === Direction.None ? SEDSGForwardCycleResolution : SEDSGBackwardCycleResolution
        }


        * hasSegmentChangesProposed () : CalculationIterator<boolean> {
            const proposedSegments : InstanceType<this['segmentModelClass']>[] = yield ProposedValueOf(this.$.segments)

            let result      = false

            if (yield HasProposedValue(this.$.segments)) {
                result      = Boolean(proposedSegments)
            }

            const segments : InstanceType<this['segmentModelClass']>[] = yield ProposedOrPreviousValueOf(this.$.segments)

            if (!segments) return false

            for (const segment of segments) {

                const startDateProposed = yield HasProposedValue(segment.$.startDate)
                const endDateProposed   = yield HasProposedValue(segment.$.endDate)
                const durationProposed  = yield HasProposedValue(segment.$.duration)

                if (startDateProposed || endDateProposed || durationProposed)
                    result = true
            }

            return result
        }


        @write('segments')
        writeSegments (me : Identifier, transaction : Transaction, quark : Quark, value : InstanceType<this['segmentModelClass']>[]) {
            // if (!transaction.baseRevision.hasIdentifier(me) && value == null) return

            const oldSegmentsQuarkValue = transaction.getLatestEntryFor(me)?.getValue()

            const oldSegments       = oldSegmentsQuarkValue !== TombStone ? oldSegmentsQuarkValue ?? [] : []
            const oldSegmentsSet    = new Set(oldSegments)

            const newSegments       = value ?? []
            const newSegmentsSet    = new Set(newSegments)

            this.project.ion({
                // remove them from the graph, only the ones not listed in the new segments array,
                // and only after commit finalization, otherwise test fails
                // we don't know why, possibly because in the `calculateSegments` we use `previousValue` of `segments` atom
                commitFinalized : () => graph.removeEntities(oldSegments.filter(segment => !newSegmentsSet.has(segment))),
                once            : true
            })

            me.constructor.prototype.write.call(this, me, transaction, quark, value)

            this.$.isSegmented.write.call(this, this.$.isSegmented, transaction, null, Boolean(value?.length))

            const project           = this.project
            const graph             = project.replica

            for (const newSegment of newSegments) {
                if (!oldSegmentsSet.has(newSegment) && newSegment.graph !== graph) {
                    newSegment.setProject(project)
                    graph.addEntity(newSegment)
                }
            }
        }


        * doWriteSegments (segments : InstanceType<this[ 'segmentModelClass' ]>[], writes? : WriteInfo[]) {
            writes = writes || []

            // if one or zero segments left after above merging
            if (segments.length <= 1) {
                // calculate the segment duration
                const duration = segments.length
                    ? yield* this.getProject().$convertDuration(segments[0].endOffset - segments[0].startOffset, TimeUnit.Millisecond, yield this.$.durationUnit)
                    : 0

                // Apply the event "duration" taken from the segment and "segments" field as NULL
                // (w/o pushing the duration value the code will tend to recalculate end date instead
                // using exiting duration value on the event)
                writes.push({
                    identifier      : this.$.duration,
                    proposedArgs    : [duration, null]
                })

                segments = null
            }

            writes.push({
                identifier      : this.$.segments,
                proposedArgs    : [segments]
            })

            yield WriteSeveral(writes)
        }


        @calculate('segments')
        * calculateSegments () : CalculationIterator<this['segments']> {
            const dispatcher : SEDDispatcher    = yield this.$.dispatcher

            const { graph, project }            = this

            const previousValue : InstanceType<this['segmentModelClass']>[] = yield PreviousValueOf(this.$.segments)

            let segments : InstanceType<this['segmentModelClass']>[]        = yield ProposedOrPrevious

            const toRemove : InstanceType<this['segmentModelClass']>[]      = []

            let hasChanges : boolean                                        = false

            if (segments) {
                const result : Set<InstanceType<this['segmentModelClass']>>     = new Set()

                let previousSegment : InstanceType<this['segmentModelClass']>   = null
                let keepDuration : Boolean = false

                const { baseRevision } = graph.$activeTransaction

                for (const segment of segments) {
                    const startOffset : Duration    = yield segment.$.startOffset
                    const endOffset : Duration      = yield segment.$.endOffset

                    // detect segment moving ..but ignore data loading stage
                    const startDateProposedArgs     = baseRevision.hasIdentifier(segment.$.startDate)
                        && (yield ProposedArgumentsOf(segment.$.startDate))
                    const endDateProposedArgs       = baseRevision.hasIdentifier(segment.$.endDate)
                        && (yield ProposedArgumentsOf(segment.$.endDate))

                    keepDuration                    = keepDuration || startDateProposedArgs?.[0] || endDateProposedArgs?.[0]

                    // get rid of zero duration segment
                    if (startOffset === endOffset) {

                        toRemove.push(segment)
                    }
                    // if a segment overlaps the previous one
                    else if (previousSegment && startOffset <= (previousSegment.endOffset)) {
                        const prevEndOffset : number = previousSegment.endOffset

                        // remove the segment we'll make a new one representing the segments union
                        toRemove.push(segment)

                        // if previous one is in the graph (not a "union" we just made)
                        if (previousSegment.graph) {
                            // remove it
                            toRemove.push(previousSegment)

                            const previousSegmentStartOffset = previousSegment.startOffset
                            const previousSegmentEndOffset   = keepDuration
                                // if moving a segment then move its further neighbours
                                ? endOffset + prevEndOffset - startOffset
                                // otherwise just combine intersected segments by building a new [min start, max end] segment
                                : Math.max(endOffset, prevEndOffset)


                            // @ts-ignore
                            const cls                        = previousSegment.cls

                            // make a new segment
                            previousSegment = this.segmentModelClass.new({
                                event       : this,
                                cls         : cls,
                                startOffset : previousSegmentStartOffset,
                                endOffset   : previousSegmentEndOffset
                            }) as InstanceType<this['segmentModelClass']>

                        }
                        else {
                            previousSegment.endOffset = keepDuration
                                // if moving a segment then move its further neighbours
                                ? endOffset + previousSegment.endOffset - startOffset
                                // otherwise just combine intersected segments by building a new [min start, max end] segment
                                : Math.max(endOffset, previousSegment.endOffset)
                        }

                    }
                    // a valid segment
                    else {
                        if (previousSegment) {
                            result.add(previousSegment)
                        }

                        previousSegment = segment
                    }
                }

                if (previousSegment) {
                    result.add(previousSegment)
                }

                if (result.size === 1) {
                    toRemove.push(...result)
                }

                hasChanges  = toRemove.length > 0

                if (hasChanges) {
                    segments = Array.from(result)
                }

                // fill previousSegment/nextSegment properties
                segments.reduce((previousSegment, segment, index) => {
                    if (previousSegment) {
                        previousSegment.nextSegment = segment
                    }

                    segment.previousSegment = previousSegment

                    segment.segmentIndex = index

                    return segment
                }, null)

                if (segments.length) {
                    segments[segments.length - 1].nextSegment = null
                }
            }
            // If we used to have segments - need to remove them from the graph
            else if (previousValue) {
                toRemove.push(...previousValue)
            }

            // if we got segments to cleanup
            if (toRemove.length) {
                // detach segments that are meant to get removed from the graph
                toRemove.forEach(segment => segment.event = null)

                project.ion({
                    commitFinalized : () => graph.removeEntities(toRemove),
                    once            : true
                })
            }

            // If we have changed segments
            if (hasChanges) {
                yield* this.doWriteSegments(segments)
            }

            segments = segments?.length > 1 ? segments : null

            return segments
        }


        @calculate('adjustedSegments')
        * calculateAdjustedSegments () {
            const dispatcher    = yield this.$.dispatcher
            let segments : InstanceType<this['segmentModelClass']>[] = yield this.$.segments
            const startDate     = yield this.$.startDate
            const endDate       = yield this.$.endDate
            const duration      = yield this.$.duration

            let value           = yield ProposedOrPrevious

            if (segments) {
                const project = this.project
                const graph   = this.graph

                const toRemove : InstanceType<this['segmentModelClass']>[] = []
                const toWrite = []

                let spliceIndex = -1

                // Iterate segments starting from trailing ones
                for (let i = segments.length - 1; i >= 0; i--) {
                    const segment : InstanceType<this['segmentModelClass']> = segments[i]

                    const segmentStartDate : Date   = yield segment.$.startDate
                    const segmentEndDate : Date     = yield segment.$.endDate

                    // If the segment starts after the event finishes - cut the segment
                    if (segmentStartDate > endDate) {
                        toRemove.push(segment)
                        spliceIndex = i
                    }
                    else {
                        // If last segment end is not aligned with the event end - adjust it
                        if (segmentEndDate.getTime() !== endDate.getTime()) {
                            const durationMs = segment.endOffset + (endDate.getTime() - segmentEndDate.getTime()) - segment.startOffset

                            const duration = yield* project.$convertDuration(durationMs, TimeUnit.Millisecond, yield segment.$.durationUnit)

                            // write new duration, endDate and endOffset to the segment
                            toWrite.push(
                                {
                                    identifier      : segment.$.duration,
                                    proposedArgs    : [duration, null]
                                },
                                {
                                    identifier      : segment.$.endDate,
                                    proposedArgs    : [endDate, false]
                                },
                                {
                                    identifier      : segment.$.endOffset,
                                    proposedArgs    : [segment.endOffset + (endDate.getTime() - segmentEndDate.getTime())]
                                }
                            )
                        }

                        // stop iteration
                        break
                    }
                }

                let hasChanges : boolean    = false

                // if we have trailing segment(s) to cut
                if (spliceIndex > -1) {
                    hasChanges      = true

                    segments.splice(spliceIndex)

                    if (segments.length) {
                        segments[segments.length - 1].nextSegment = null
                    }

                    // Will remove the segment(s) from the graph later ..to avoid exceptions
                    project.ion({
                        commitFinalized : () => graph.removeEntities(toRemove),
                        once : true
                    })
                }

                let segmentsSnapshot = ''

                if (segments) {
                    segmentsSnapshot = this.getSegmentsSnapshot(segments)
                }

                if (/*this._lastSegmentsSnapshot &&*/ segmentsSnapshot !== this._lastSegmentsSnapshot) {
                    hasChanges                  = true

                    segments                    = segments ? segments.slice() : segments

                    this._lastSegmentsSnapshot  = segmentsSnapshot
                }

                // this._lastSegmentsSnapshot  = segmentsSnapshot

                // If we have changes to write
                if (hasChanges) {
                    yield* this.doWriteSegments(segments, toWrite)
                }
            }

            return value
        }


        getSegmentsSnapshot (segments?) {
            segments = segments || this.segments

            return segments?.map(segment => '' + segment.startOffset + '-' + segment.startDate?.getTime() + '-' + segment.endOffset + '-' + segment.endDate?.getTime()).join(';')
        }


        processSegmentsValue (value : Partial<InstanceType<this['segmentModelClass']>>[]) : InstanceType<this['segmentModelClass']>[] | null {
            // by default return the value as is
            let result : InstanceType<this['segmentModelClass']>[] = value as any

            // if segments are specified for the task
            if (value) {
                // for (let segment of value) {
                for (let i = 0; i < value.length; i++) {
                    const segment = value[i]

                    const record : InstanceType<this['segmentModelClass']> = (segment.isModel ? segment : this.segmentModelClass.new(segment)) as InstanceType<this['segmentModelClass']>

                    // don't overwrite the existing property, because this method
                    // is called as part of the `copy()` call, where
                    //     copy['segments'] = this['segments']
                    // happens and `copy` event is assigned back to segments from the source
                    if (!record.event) record.event = this

                    value[i] = record
                }
            }

            return result
        }


        * calculateStartDate () : CalculationIterator<Date> {
            const dispatcher = yield this.$.dispatcher
            const resolution = dispatcher.resolution.get(StartDateVar)

            let result

            if (resolution === startDateByEndDateAndSegmentsFormula.formulaId) {
                result = yield* this.calculateStartDateBySegments()
            }
            else {
                result = yield* super.calculateStartDate()
            }

            return result
        }


        * calculateStartDateBySegments () : CalculationIterator<Date> {
            const dispatcher : SEDDispatcher                                = yield this.$.dispatcher
            const segments : InstanceType<this['segmentModelClass']>[]      = yield this.$.segments
            const endDate : Date                                            = yield this.$.endDate

            let result

            if (segments) {
                const lastSegment : InstanceType<this['segmentModelClass']> = segments[segments.length - 1]
                const lastSegmentEndOffset : Duration                       = yield lastSegment.$.endOffset

                const rawDate : Date        = yield* this.calculateProjectedXDateWithDuration(endDate, false, lastSegmentEndOffset, TimeUnit.Millisecond, { ignoreSegments : true })
                const manuallyScheduled : boolean = yield this.$.manuallyScheduled

                result                      = manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                    ? rawDate
                    : yield* this.skipNonWorkingTime(rawDate, true)
            }

            return result
        }


        * calculateEndDateBySegments () : CalculationIterator<Date> {
            const dispatcher : SEDDispatcher                                = yield this.$.dispatcher
            const segments : InstanceType<this['segmentModelClass']>[]      = yield this.$.segments
            const startDate : Date                                          = yield this.$.startDate

            let result

            if (segments) {
                const lastSegment : InstanceType<this['segmentModelClass']> = segments[segments.length - 1]
                const lastSegmentEndOffset : Duration                       = yield lastSegment.$.endOffset

                const rawDate : Date        = yield* this.calculateProjectedXDateWithDuration(startDate, true, lastSegmentEndOffset, TimeUnit.Millisecond, { ignoreSegments : true })
                const manuallyScheduled : boolean = yield this.$.manuallyScheduled

                result                      = manuallyScheduled && !this.getProject().skipNonWorkingTimeWhenSchedulingManually
                    ? rawDate
                    : yield* this.skipNonWorkingTime(rawDate, false)
            }

            return result
        }


        * calculateEndDate () : CalculationIterator<Date> {
            const dispatcher : SEDDispatcher    = yield this.$.dispatcher
            const resolution : number           = dispatcher.resolution.get(EndDateVar)

            let result

            if (resolution === endDateByStartDateAndSegmentsFormula.formulaId) {
                result = yield* this.calculateEndDateBySegments()
            }
            else {
                result = yield* super.calculateEndDate()
            }

            return result
        }


        * calculateDurationProposed () : CalculationIterator<Duration> {
            let result

            if (yield* this.hasSegmentChangesProposed()) {
                result = yield* this.calculateDurationBySegments()
            }
            else {
                result = yield* super.calculateDurationProposed()
            }

            return result
        }


        * skipNonWorkingTime (date : Date, isForward : boolean = true, iteratorOptions? : Object) : CalculationIterator<Date> {
            if (!date) return null

            iteratorOptions = Object.assign({ ignoreSegments : true }, iteratorOptions)

            return yield* super.skipNonWorkingTime(date, isForward, iteratorOptions)
        }


        * calculateDurationBySegments () : CalculationIterator<Duration> {
            let duration : Duration

            const dispatcher : SEDDispatcher  = yield this.$.dispatcher
            const durationUnit : TimeUnit     = yield this.$.durationUnit
            const segments : this['segments'] = yield this.$.segments

            if (segments) {
                let durationMs : Duration   = 0

                // collect segments duration in milliseconds
                for (const segment of segments) {
                    durationMs += segment.endOffset - segment.startOffset
                }

                duration = yield* this.getProject().$convertDuration(durationMs, TimeUnit.Millisecond, durationUnit)
            }

            return duration
        }


        * forEachAvailabilityInterval (
            options     : {
                startDate?                          : Date,
                endDate?                            : Date,
                isForward?                          : boolean,
                ignoreResourceCalendar?             : boolean,
                ignoreSegments                      : boolean
            },
            func        : (
                startDate                           : Date,
                endDate                             : Date,
                calendarCacheIntervalMultiple       : CalendarCacheIntervalMultiple
            ) => false | void
        )
            : CalculationIterator<CalendarIteratorResult>
        {
            const calendar : this['effectiveCalendar']                                  = yield this.$.effectiveCalendar
            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]               = yield this.$.assignmentsByCalendar
            const effectiveCalendarsCombination : this['effectiveCalendarsCombination'] = yield this.$.effectiveCalendarsCombination
            const isForward : boolean                                                   = options.isForward !== false
            const ignoreResourceCalendar : boolean                                      = (yield this.$.ignoreResourceCalendar) || options.ignoreResourceCalendar || !assignmentsByCalendar.size
            const maxRange                                                              = this.getProject().maxCalendarRange

            let ignoreSegments : boolean    = options.ignoreSegments
            let sign : number               = 1

            let
                currentSegment : InstanceType<this['segmentModelClass']>,
                currentOffsetMs : Duration,
                currentSegmentDurationMs : Duration,
                segments : InstanceType<this['segmentModelClass']>[],
                currentSegmentEndOffset : Duration

            if (!ignoreSegments) {
                segments        = yield this.$.segments

                ignoreSegments  = ignoreSegments || !segments

                if (!ignoreSegments) {
                    // clone segment array since we're going to call shift()/pop() on it
                    segments = segments.slice()

                    if (isForward) {
                        currentSegment  = segments.shift()
                        currentOffsetMs = 0
                        sign            = 1
                        // open the last segment end border
                        currentSegmentEndOffset = currentSegment.nextSegment ? currentSegment.endOffset : MAX_DATE.getTime()
                    }
                    else {
                        currentSegment  = segments.pop()
                        currentOffsetMs = currentSegment.endOffset
                        sign            = -1
                        currentSegmentEndOffset = currentSegment.endOffset
                    }

                    currentSegmentDurationMs = currentSegmentEndOffset - currentSegment.startOffset
                }
            }

            const manuallyScheduled : boolean = yield this.$.manuallyScheduled
            const project = this.getProject()

            return effectiveCalendarsCombination.forEachAvailabilityInterval(
                Object.assign({ maxRange }, options),
                (intervalStartDate : Date, intervalEndDate : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                    const calendarsStatus : Map<AbstractCalendarMixin, boolean> = calendarCacheIntervalMultiple.getCalendarsWorkStatus()
                    const workCalendars : AbstractCalendarMixin[]               = calendarCacheIntervalMultiple.getCalendarsWorking()

                    if (
                        calendarsStatus.get(calendar)
                        && (
                            ignoreResourceCalendar
                            || workCalendars.some((calendar : BaseCalendarMixin) => assignmentsByCalendar.has(calendar))
                            || (manuallyScheduled && !project.skipNonWorkingTimeInDurationWhenSchedulingManually)
                        )
                    ) {
                        if (ignoreSegments) {
                            return func(intervalStartDate, intervalEndDate, calendarCacheIntervalMultiple)
                        }
                        // take segments into account while iterating
                        else {
                            const startDateN : number = intervalStartDate.getTime()

                            let intervalDuration : Duration = intervalEndDate.getTime() - intervalStartDate.getTime()


                            if (this.getProject().adjustDurationToDST) {
                                const dstDiff       = intervalStartDate.getTimezoneOffset() - intervalEndDate.getTimezoneOffset()
                                intervalDuration    += dstDiff * 60 * 1000
                            }

                            let
                                intervalStartOffset,
                                intervalEndOffset

                            if (isForward) {
                                intervalStartOffset = currentOffsetMs
                                intervalEndOffset   = currentOffsetMs + intervalDuration
                            }
                            else {
                                intervalStartOffset = currentOffsetMs - intervalDuration
                                intervalEndOffset   = currentOffsetMs
                            }

                            while (currentSegment && intervalStartOffset <= currentSegmentEndOffset && intervalEndOffset > currentSegment.startOffset) {
                                // get the intersection of the current segment w/ the current interval
                                const callStartOffset : Duration    = Math.max(intervalStartOffset, currentSegment.startOffset)
                                const callEndOffset : Duration      = Math.min(intervalEndOffset, currentSegmentEndOffset)
                                const callStartDate : Date          = new Date(startDateN + callStartOffset - intervalStartOffset)
                                const callEndDate : Date            = new Date(startDateN + callEndOffset - intervalStartOffset)

                                const callResult = func(callStartDate, callEndDate, calendarCacheIntervalMultiple)

                                if (callResult === false) return false

                                // reduce the segment duration left by the intersection duration
                                currentSegmentDurationMs -= callEndDate.getTime() - callStartDate.getTime()

                                // if no segment duration left
                                if (!currentSegmentDurationMs) {
                                    // get next segment
                                    currentSegment      = isForward ? segments.shift() : segments.pop()

                                    if (currentSegment) {
                                        // the last segment end border should not be taken into account (in forward mode)
                                        currentSegmentEndOffset = !isForward || currentSegment.nextSegment ? currentSegment.endOffset : MAX_DATE.getTime()

                                        // get its duration to distribute
                                        currentSegmentDurationMs  = currentSegmentEndOffset - currentSegment.startOffset
                                    }
                                }
                                // if there is undistributed duration left of the current segment => iterate to the next interval
                                else {
                                    break
                                }
                            }

                            currentOffsetMs += sign * intervalDuration
                        }
                    }
                }
            )
        }


        * useEventAvailabilityIterator () : CalculationIterator<boolean> {
            const isSegmented : boolean = yield this.$.isSegmented

            if (isSegmented) return true

            const manuallyScheduled : boolean = yield this.$.manuallyScheduled

            // always use availability iterator, unless the event is manually scheduled
            return !manuallyScheduled
        }


        getSegments : () => InstanceType<this['segmentModelClass']>[]
        setSegments : (segments : InstanceType<this['segmentModelClass']>[] | Partial<InstanceType<this['segmentModelClass']>>[]) => Promise<CommitResult>


        /**
         * Returns a segment that is ongoing on the provided date.
         * @param  date Date to find an ongoing segment on
         * @param  [segments] List of segments to check. When not provided the event segments is used
         * @return Ongoing segment
         */
        getSegmentByDate (date : Date, segments? : InstanceType<this['segmentModelClass']>[]) : InstanceType<this['segmentModelClass']> {
            segments    = segments || this.getSegments()

            if (segments) {
                const index : number = this.getSegmentIndexByDate(date, segments)

                return segments[index]
            }
        }


        getSegmentIndexByDate (date : Date, segments? : InstanceType<this['segmentModelClass']>[]) : number {
            segments    = segments || this.getSegments()

            return segments ? segments.findIndex(segment => date >= segment.startDate && date < segment.endDate) : -1
        }


        /**
         * The event first segment or null if the event is not segmented.
         */
        get firstSegment () : InstanceType<this['segmentModelClass']> {
            const segments : InstanceType<this['segmentModelClass']>[] = this.getSegments()

            return segments ? segments[0] : null
        }


        /**
         * The event last segment or null if the event is not segmented.
         */
        get lastSegment () : InstanceType<this['segmentModelClass']> {
            const segments : InstanceType<this['segmentModelClass']>[] = this.getSegments()

            return segments ? segments[segments.length - 1] : null
        }


        /**
         * Returns a segment by its index.
         * @param index The segment index (zero based value).
         * @return The segment matching the provided index.
         */
        getSegment (index) : InstanceType<this['segmentModelClass']> {
            const segments : InstanceType<this['segmentModelClass']>[] = this.getSegments()

            return segments?.[index]
        }


        /**
         * Splits the event.
         * @param from The date to split this event at.
         * @param [lag=1] Split duration.
         * @param [lagUnit] Split duration unit.
         */
        async splitToSegments (from : Date, lag : Duration = 1, lagUnit? : TimeUnit) {

            const project = this.getProject()

            await project.commitAsync()

            const me : this = this

            // cannot split:
            // - if no split date specified
            // - a summary event

            // @ts-ignore
            if (!from || (me.isHasSubEventsMixin && me.childEvents?.size)) return

            const duration : Duration     = me.duration
            const durationUnit : TimeUnit = me.durationUnit
            const startDate : Date        = me.startDate
            const endDate : Date          = me.endDate

            lagUnit = lagUnit ? DateHelper.normalizeUnit(lagUnit) as TimeUnit : durationUnit

            // - not scheduled event
            // - provided date violates the event interval
            // - a zero duration event
            if (!startDate || !endDate || (startDate >= from) || (from >= endDate) || !duration) return

            const isSegmented : boolean                                 = me.isSegmented

            let segments : InstanceType<this['segmentModelClass']>[]    = me.segments || []

            let
                segmentToSplit : InstanceType<this['segmentModelClass']>,
                segmentToSplitIndex : number

            if (isSegmented) {
                segmentToSplitIndex = me.getSegmentIndexByDate(from, segments)

                segmentToSplit      = segments[segmentToSplitIndex]

                if (!segmentToSplit) return
            }

            const splitTarget                         = segmentToSplit || me
            const splitTargetStart : Date             = segmentToSplit ? splitTarget.startDate : startDate
            const splitTargetDuration : Duration      = splitTarget.duration
            const splitTargetDurationUnit : TimeUnit  = splitTarget.durationUnit

            const prevSegmentDuration : Duration      = me.run('calculateProjectedDuration', splitTargetStart, from, splitTargetDurationUnit, { ignoreSegments : true })
            const nextSegmentDuration : Duration      = splitTargetDuration - prevSegmentDuration

            const lagInMs : Duration                  = project.run('$convertDuration', lag, lagUnit, TimeUnit.Millisecond)
            const nextSegmentStartOffset : Duration   = lagInMs + me.run('calculateProjectedDuration', startDate, from, TimeUnit.Millisecond, { ignoreSegments : true })

            // split existing segment
            if (segmentToSplit) {
                // adjust its duration
                segmentToSplit.duration = prevSegmentDuration

                const newSegment = this.segmentModelClass.new({
                    duration        : nextSegmentDuration,
                    durationUnit    : splitTargetDurationUnit,
                    startOffset     : nextSegmentStartOffset
                }) as InstanceType<this['segmentModelClass']>

                segments = segments.slice(0)
                segments.splice(segmentToSplitIndex + 1, 0, newSegment)

                me.segments = segments
                me.duration = duration

                // push next segments forward by the lag duration
                for (let i = segmentToSplitIndex + 2, l = segments.length; i < l; i++) {
                    const segment   = segments[i]

                    if (segment) {
                        segment.startOffset   += lagInMs
                        segment.endOffset     += lagInMs
                    }
                }
            }
            // split not segmented event
            else {
                const previousSegment = this.segmentModelClass.new({
                    duration        : prevSegmentDuration,
                    durationUnit    : splitTargetDurationUnit,
                    startOffset     : 0
                }) as InstanceType<this['segmentModelClass']>

                const newSegment = this.segmentModelClass.new({
                    duration        : duration - prevSegmentDuration,
                    durationUnit    : splitTargetDurationUnit,
                    startOffset     : nextSegmentStartOffset
                }) as InstanceType<this['segmentModelClass']>

                me.duration = duration
                me.segments = [previousSegment, newSegment]
            }

            return project.commitAsync()
        }


        /**
         * Merges the event segments.
         * The method merges two provided event segments (and all the segment between them if any).
         * @param [segment1] First segment to merge.
         * @param [segment2] Second segment to merge.
         */
        async mergeSegments (segment1 : InstanceType<this['segmentModelClass']>, segment2 : InstanceType<this['segmentModelClass']>) {

            if (!this.isSegmented) return

            segment1 = segment1 || this.firstSegment
            segment2 = segment2 || this.lastSegment

            if (segment1.startOffset > segment2.startOffset) {
                let tmp = segment2

                segment2    = segment1
                segment1    = tmp
            }

            // merging itself will be done automatically inside `calculateSegments`
            segment1.endDate = segment2.startDate

            return this.getProject().commitAsync()
        }


        // Override storeFieldChange to support revertChanges for segments field
        storeFieldChange (key, oldValue) {
            // if we store segments old value
            if (key === 'segments' && oldValue) {
                const result = []

                for (const segment of oldValue) {
                    // get the segment persistable data
                    const segmentData = segment.toJSON()

                    // if the segment was changes since the last time we stored segment oldValue
                    if (!this._segmentGeneration[segment.internalId] || segment.generation > this._segmentGeneration[segment.internalId]) {
                        // let's use the segment old values
                        Object.assign(segmentData, segment.meta.modified)
                    }

                    result.push(segmentData)

                    // keep the version of the segment
                    this._segmentGeneration[segment.internalId] = segment.generation
                }

                oldValue = result
            }

            super.storeFieldChange(key, oldValue)
        }


        leaveProject () {
            const segments = this.segments

            if (segments) {
                this.graph.removeEntities(segments)
            }

            super.leaveProject()
        }


        endBatch (...args) {
            this.fieldMap.segments._skipSegmentsIsEqual++

            super.endBatch(...args)

            this.fieldMap.segments._skipSegmentsIsEqual--
        }


        copy (newId : ModelId = null, deep = null) : this {
            const copy = super.copy(newId, deep)

            // need to clean the `segments` in `data`, otherwise it will be
            // picked up as "old value" by STM during set to `segments`
            // @ts-ignore
            copy.data.segments = undefined

            if (copy.segments) {
                copy.segments = copy.segments.map(seg => Object.assign(seg.copy(), { event : copy }))
            }

            return copy
        }


        toJSON() : object {
            const
                data        = super.toJSON(),
                field       = this.getFieldDefinition('segments'),
                // @ts-ignore
                { persist, dataSource, complexMapping } = field

            // if "segments" field is persistable
            if (persist) {
                let value = ObjectHelper.getPath(data, dataSource)

                if (value) {
                    value = value.map(s => s.toJSON())

                    ObjectHelper.setPath(data, dataSource, value)
                }
            }

            return data
        }

    }

    return SplitEventMixin
}){}
