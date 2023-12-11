import later from "../vendor/later/later.js"
import { CalendarCache } from "./CalendarCache.js"
import { CalendarCacheInterval } from "./CalendarCacheInterval.js"
import { CalendarIntervalMixin } from "./CalendarIntervalMixin.js"
import { CalendarIntervalStore } from "./CalendarIntervalStore.js"
import { IntervalCache } from "./IntervalCache.js"
import { UnspecifiedTimeIntervalModel } from "./UnspecifiedTimeIntervalModel.js"
import { AbstractCalendarMixin } from "../quark/model/AbstractCalendarMixin.js"
import DateHelper from "../../Core/helper/DateHelper.js"
import TimeZoneHelper from "../../Core/helper/TimeZoneHelper.js"


export class CalendarCacheSingle extends CalendarCache<CalendarCacheInterval, CalendarCacheInterval> {
    parentCache                     : CalendarCacheSingle

    unspecifiedTimeInterval         : UnspecifiedTimeIntervalModel

    calendar                        : AbstractCalendarMixin

    intervalStore                   : CalendarIntervalStore

    staticIntervalsCached           : boolean   = false


    constructor (config? : Partial<CalendarCacheSingle>) {
        super(config)

        if (!this.unspecifiedTimeInterval) throw new Error("Required attribute `unspecifiedTimeInterval` is missing")

        this.intervalCache = new IntervalCache({

            emptyInterval   : new CalendarCacheInterval({
                intervals       : [  this.unspecifiedTimeInterval ],

                calendar        : this.calendar
            }),

            combineIntervalsFn  : (interval1, interval2) => {
                return interval1.combineWith(interval2)
            }
        })
    }


    fillCache (startDate : Date, endDate : Date) {
        if (!this.staticIntervalsCached) {
            this.cacheStaticIntervals()

            this.staticIntervalsCached  = true
        }

        if (this.parentCache) this.includeWrappingRangeFrom(this.parentCache, startDate, endDate)

        const startDateN     = startDate.getTime()
        const endDateN       = endDate.getTime()
        const timeZone       = this.calendar.ignoreTimeZone ? null : this.calendar.project?.timeZone

        if (startDateN > endDateN) throw new Error("Invalid cache fill interval")

        const NEVER         = later.NEVER

        this.forEachRecurrentInterval(interval => {
            const startSchedule             = interval.getStartDateSchedule()
            const endSchedule               = interval.getEndDateSchedule()

            let wrappingStartDate           = startSchedule.prev(1, startDate)

            let wrappingEndDate

            if (endSchedule === 'EOD') {
                const nextEndDate           = startSchedule.next(1, endDate)

                if (nextEndDate !== NEVER) {
                    wrappingEndDate             = DateHelper.getStartOfNextDay(nextEndDate, true)
                }
                else {
                    wrappingEndDate             = NEVER
                }
            }
            else {
                wrappingEndDate             = endSchedule.next(1, endDate)
            }

            // if the `startDate` is an occurrence in the interval's schedule, we need to advance one point prior
            // this is to provide the backward-scheduling information for the `startDate` point
            if (wrappingStartDate !== NEVER && wrappingStartDate.getTime() === startDateN) {
                const wrappingStartDates    = startSchedule.prev(2, startDate)

                if (wrappingStartDates !== NEVER && wrappingStartDates.length === 2) wrappingStartDate = wrappingStartDates[ 1 ]
            }

            if (wrappingEndDate !== NEVER && wrappingEndDate.getTime() === endDateN) {
                const wrappingEndDates      = endSchedule.next(2, endDate)

                if (wrappingEndDates !== NEVER && wrappingEndDates.length === 2) wrappingEndDate = wrappingEndDates[ 1 ]
            }

            const startDates : Date[]       = startSchedule.next(
                Infinity,
                wrappingStartDate !== NEVER ? wrappingStartDate : startDate,
                wrappingEndDate !== NEVER ? new Date(wrappingEndDate.getTime() - 1) : endDate
            )

            // schedule is empty for the interval of interest, do nothing
            if (startDates === NEVER) return

            // at this point `startDates` is a non-empty array

            const endDates : Date[]         = endSchedule === 'EOD'
                ? startDates.map(date => DateHelper.getStartOfNextDay(date, true))
                : endSchedule.next(
                    Infinity,
                    new Date(startDates[ 0 ].getTime() + 1),
                    wrappingEndDate !== NEVER ? wrappingEndDate : endDate
                )

            if (endDates === NEVER) return

            if (endDates.length > startDates.length) {
                // safe to ignore "extra" end dates
                endDates.length = startDates.length
            }
            else if (endDates.length < startDates.length) {
                // monkey patch
                startDates.length = endDates.length
                // throw new Error("Recurrent interval inconsistency: " + interval + ", caching startDate: " + startDate + ", caching endDate: " + endDate)
            }

            startDates.forEach((startDate, index) => {
                let recStartDate = startDate
                let recEndDate   = endDates[ index ]

                // Adjust calendar intervals when changing time zone
                if (timeZone != null) {
                    recStartDate = TimeZoneHelper.toTimeZone(recStartDate, timeZone)
                    recEndDate = TimeZoneHelper.toTimeZone(recEndDate, timeZone)
                }

                // if (recStartDate.getTime() > recEndDate.getTime())
                //     throw new Error("Recurrent interval inconsistency: " + interval + ", startDate: " + startDate + ", endDate: " + endDates[ index ])

                this.intervalCache.addInterval(recStartDate, recEndDate, existingCacheInterval => existingCacheInterval.includeInterval(interval))
            })
        })
    }


    clear () {
        this.staticIntervalsCached = false

        super.clear()
    }


    cacheStaticIntervals () {
        this.forEachStaticInterval(interval => {
            const timeZone = this.calendar.project?.timeZone

            let { startDate, endDate } = interval

            // Adjust calendar intervals when changing time zone
            if (timeZone != null) {
                startDate = TimeZoneHelper.toTimeZone(startDate, timeZone)
                endDate = TimeZoneHelper.toTimeZone(endDate, timeZone)
            }

            this.intervalCache.addInterval(
                startDate,
                endDate,
                existingCacheInterval => existingCacheInterval.includeInterval(interval)
            )
        })
    }


    forEachStaticInterval (func : (interval : CalendarIntervalMixin) => any) {
        this.intervalStore.forEach((interval : CalendarIntervalMixin) => {
            if (interval.isStatic()) func(interval)
        })
    }


    forEachRecurrentInterval (func : (interval : any) => any) {
        this.intervalStore.forEach((interval : CalendarIntervalMixin) => {
            if (interval.isRecurrent()) func(interval)
        })
    }

}
