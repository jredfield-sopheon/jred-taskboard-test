import { HasProposedValue } from "../../../../ChronoGraph/chrono/Effect.js"
import { Reject } from "../../../../ChronoGraph/chrono/Effect.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js"
import { CalendarIteratorResult } from "../../../calendar/CalendarCache.js"
import { CalendarCacheIntervalMultiple } from "../../../calendar/CalendarCacheIntervalMultiple.js"
import { CalendarCacheMultiple } from "../../../calendar/CalendarCacheMultiple.js"
import { Duration, TimeUnit } from "../../../scheduling/Types.js"
import { SchedulerProAssignmentMixin } from "./SchedulerProAssignmentMixin.js"
import { BaseCalendarMixin, EmptyCalendarEffect } from "../scheduler_basic/BaseCalendarMixin.js"
import { BaseResourceMixin } from "../scheduler_basic/BaseResourceMixin.js"
import { BaseHasAssignmentsMixin } from "../scheduler_basic/BaseHasAssignmentsMixin.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"

//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixins enhances the purely visual [[BaseHasAssignmentsMixin]] with scheduling according
 * to the calendars of the assigned resources.
 *
 * A time interval will be "counted" into the event duration, only if at least one assigned
 * resource has that interval as working time, and the event's own calendar also has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 */
export class SchedulerProHasAssignmentsMixin extends Mixin(
    [ BaseHasAssignmentsMixin ],
    (base : AnyConstructor<BaseHasAssignmentsMixin, typeof BaseHasAssignmentsMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class SchedulerProHasAssignmentsMixin extends base {

        // w/o this `Omit` incremental compilation report false compilation error
        project                             : Omit<SchedulerProProjectMixin, 'assignmentModelClass'> & { assignmentModelClass : typeof SchedulerProAssignmentMixin }

        @field()
        effectiveCalendarsCombination       : CalendarCacheMultiple

        @field()
        assignmentsByCalendar               : Map<BaseCalendarMixin, SchedulerProAssignmentMixin[]>

        /**
         * Ignore assigned resource calendars when scheduling the event.
         * If setting this to `true` the event dates/duration will be calculated based on
         * the event [[effectiveCalendar|calendar]] only.
         */
        @model_field({ type : 'boolean' })
        ignoreResourceCalendar              : boolean

        setIgnoreResourceCalendar : (value : boolean) => Promise<CommitResult>
        getIgnoreResourceCalendar : () => Date
        putIgnoreResourceCalendar : (value : boolean) => void

        * hasProposedValueForUnits () : CalculationIterator<boolean> {
            const assignments : Set<SchedulerProAssignmentMixin>      = yield this.$.assigned

            for (const assignment of assignments) {
                const resource : BaseResourceMixin              = yield assignment.$.resource

                if (resource && (yield HasProposedValue(assignment.$.units))) return true
            }

            return false
        }

        /**
         * A method which assigns a resource to the current event
         */
        async assign (resource : InstanceType<this[ 'project' ][ 'resourceModelClass' ]>, units : number = 100) : Promise<CommitResult> {


            const assignmentCls = this.getProject().assignmentStore.modelClass as any

            this.addAssignment(new assignmentCls({
                event           : this,
                resource        : resource,
                units           : units
            }))

            return this.commitAsync()
        }


        * forEachAvailabilityInterval (
            options     : {
                startDate?                          : Date,
                endDate?                            : Date,
                isForward?                          : boolean,
                ignoreResourceCalendar?            : boolean
            },
            func        : (
                startDate                           : Date,
                endDate                             : Date,
                calendarCacheIntervalMultiple       : CalendarCacheIntervalMultiple
            ) => false | void
        ) : CalculationIterator<CalendarIteratorResult>
        {
            const calendar : BaseCalendarMixin                              = yield this.$.effectiveCalendar
            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar
            const effectiveCalendarsCombination                             = yield this.$.effectiveCalendarsCombination

            const ignoreResourceCalendar : boolean = (yield this.$.ignoreResourceCalendar) || options.ignoreResourceCalendar || !assignmentsByCalendar.size

            const maxRange  = this.getProject().maxCalendarRange

            if (maxRange) {
                options     = Object.assign({ maxRange }, options)
            }

            return effectiveCalendarsCombination.forEachAvailabilityInterval(
                options,
                (startDate : Date, endDate : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                    const calendarsStatus   = calendarCacheIntervalMultiple.getCalendarsWorkStatus()
                    const workCalendars     = calendarCacheIntervalMultiple.getCalendarsWorking()

                    if (
                        calendarsStatus.get(calendar)
                        &&
                        (ignoreResourceCalendar || workCalendars.some((calendar : BaseCalendarMixin) => assignmentsByCalendar.has(calendar)))
                    ) {
                        return func(startDate, endDate, calendarCacheIntervalMultiple)
                    }
                }
            )
        }


        @calculate('effectiveCalendarsCombination')
        * calculateEffectiveCalendarsCombination () : CalculationIterator<this[ 'effectiveCalendarsCombination' ]> {
            const manuallyScheduled : boolean            = yield this.$.manuallyScheduled
            const project : this[ 'project' ]           = this.getProject()

            const calendars : BaseCalendarMixin[]       = [ yield this.$.effectiveCalendar ]

            if (!manuallyScheduled || project.skipNonWorkingTimeInDurationWhenSchedulingManually) {
                const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]       = yield this.$.assignmentsByCalendar

                calendars.push(...assignmentsByCalendar.keys())
            }

            return this.getProject().combineCalendars(calendars)
        }


        @calculate('assignmentsByCalendar')
        * calculateAssignmentsByCalendar  () : CalculationIterator<this[ 'assignmentsByCalendar' ]> {
            const assignments : Set<SchedulerProAssignmentMixin>              = yield this.$.assigned

            const result : Map<BaseCalendarMixin, SchedulerProAssignmentMixin[]> = new Map()

            for (const assignment of assignments) {
                const resource : BaseResourceMixin              = yield assignment.$.resource

                if (resource) {
                    const resourceCalendar : BaseCalendarMixin  = yield resource.$.effectiveCalendar

                    let assignments                             = result.get(resourceCalendar)

                    if (!assignments) {
                        assignments                             = []

                        result.set(resourceCalendar, assignments)
                    }

                    assignments.push(assignment)
                }
            }

            return result
        }


        * getBaseOptionsForDurationCalculations () : CalculationIterator<{ ignoreResourceCalendar : boolean }> {
            return { ignoreResourceCalendar : false }
        }


        * useEventAvailabilityIterator () : CalculationIterator<boolean> {
            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar

            return assignmentsByCalendar.size > 0
        }


        * skipNonWorkingTime (date : Date, isForward : boolean = true, iteratorOptions? : Object) : CalculationIterator<Date> {
            if (!date) return null

            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar
            const ignoreResourceCalendar : this[ 'ignoreResourceCalendar' ] = yield this.$.ignoreResourceCalendar

            if (yield* this.useEventAvailabilityIterator()) {
                const options   = Object.assign(
                    yield* this.getBaseOptionsForDurationCalculations(),
                    isForward ? { startDate : date, isForward } : { endDate : date, isForward },
                    iteratorOptions
                )

                let workingDate : Date

                const skipRes = yield* this.forEachAvailabilityInterval(
                    options,
                    (startDate : Date, endDate : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                        workingDate         = isForward ? startDate : endDate

                        return false
                    }
                )

                if (skipRes === CalendarIteratorResult.MaxRangeReached || skipRes === CalendarIteratorResult.FullRangeIterated) {
                    const calendars : BaseCalendarMixin[]   = [yield this.$.effectiveCalendar]

                    // if we take resource calendars into account collect them
                    // and provide to EmptyCalendarEffect instance
                    if (!options.ignoreResourceCalendar && !ignoreResourceCalendar) {
                        calendars.push(...assignmentsByCalendar.keys())
                    }

                    const effect = EmptyCalendarEffect.new({
                        event     : this,
                        calendars,
                        date,
                        isForward
                    })

                    if ((yield effect) === EffectResolutionResult.Cancel) {
                        yield Reject(effect)
                    } else {
                        return null
                    }
                }

                return new Date(workingDate)
            } else {
                return yield* superProto.skipNonWorkingTime.call(this, date, isForward)
            }
        }


        * calculateProjectedDuration (startDate : Date, endDate : Date, durationUnit? : TimeUnit, iteratorOptions?) : CalculationIterator<Duration> {
            if (!startDate || !endDate) {
                return null
            }

            if (yield* this.useEventAvailabilityIterator()) {
                const options   = Object.assign(
                    yield* this.getBaseOptionsForDurationCalculations(),
                    { startDate, endDate, isForward : true },
                    iteratorOptions
                )

                const adjustDurationToDST   = this.getProject().adjustDurationToDST

                let result : Duration = 0

                yield* this.forEachAvailabilityInterval(
                    options,
                    (startDate : Date, endDate : Date) => {
                        result              += endDate.getTime() - startDate.getTime()

                        if (adjustDurationToDST) {
                            const dstDiff   = startDate.getTimezoneOffset() - endDate.getTimezoneOffset()
                            result          += dstDiff * 60 * 1000
                        }
                    }
                )

                if (!durationUnit) durationUnit = yield this.$.durationUnit

                return yield* this.getProject().$convertDuration(result, TimeUnit.Millisecond, durationUnit)
            } else {
                return yield* superProto.calculateProjectedDuration.call(this, startDate, endDate, durationUnit)
            }
        }


        * calculateProjectedXDateWithDuration (baseDate : Date, isForward : boolean = true, duration : Duration, durationUnit? : TimeUnit, iteratorOptions?) : CalculationIterator<Date> {
            if (duration == null || isNaN(duration) || baseDate == null) return null

            if (duration == 0) return baseDate

            durationUnit                            = durationUnit || (yield this.$.durationUnit)

            const durationMS : number               = yield* this.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond)

            let resultN : number                    = baseDate.getTime()
            let leftDuration : number               = durationMS

            const calendar : BaseCalendarMixin          = yield this.$.effectiveCalendar

            if (yield* this.useEventAvailabilityIterator()) {
                const options   = Object.assign(
                    yield* this.getBaseOptionsForDurationCalculations(),
                    isForward ? { startDate : baseDate, isForward } : { endDate : baseDate, isForward },
                    iteratorOptions
                )

                const adjustDurationToDST = this.getProject().adjustDurationToDST

                const iterationRes = yield* this.forEachAvailabilityInterval(
                    options,

                    (intervalStart : Date, intervalEnd : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                        const intervalStartN : number   = intervalStart.getTime(),
                            intervalEndN : number       = intervalEnd.getTime(),
                            intervalDuration : Duration = intervalEndN - intervalStartN

                        if (intervalDuration >= leftDuration) {
                            if (adjustDurationToDST) {
                                const dstDiff           = isForward
                                    ? intervalStart.getTimezoneOffset() - (new Date(intervalStartN + leftDuration)).getTimezoneOffset()
                                    : (new Date(intervalEndN - leftDuration)).getTimezoneOffset() - intervalEnd.getTimezoneOffset()

                                leftDuration            -= dstDiff * 60 * 1000
                            }

                            resultN                     = isForward ? intervalStartN + leftDuration : intervalEndN - leftDuration

                            return false
                        } else {
                            leftDuration                -= intervalDuration

                            if (adjustDurationToDST) {
                                const dstDiff           = intervalStart.getTimezoneOffset() - intervalEnd.getTimezoneOffset()
                                leftDuration            -= dstDiff * 60 * 1000
                            }
                        }
                    }
                )

                // this will cause the method to return `null` if there's some problem with iterator
                // easier to debug than a wrong number
                return iterationRes === CalendarIteratorResult.StoppedByIterator ? new Date(resultN) : null
            }
            else {
                return calendar.accumulateWorkingTime(baseDate, durationMS, isForward).finalDate
            }
        }
    }

    return SchedulerProHasAssignmentsMixin
}){}
