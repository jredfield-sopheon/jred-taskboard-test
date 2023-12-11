import { AnyConstructor, Base, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, Entity, field } from "../../../../ChronoGraph/replica/Entity.js"
import { Replica } from "../../../../ChronoGraph/replica/Replica.js"
import { CalendarCacheIntervalMultiple } from "../../../calendar/CalendarCacheIntervalMultiple.js"
import { CalendarCacheMultiple } from "../../../calendar/CalendarCacheMultiple.js"
import { CalendarIntervalMixin } from "../../../calendar/CalendarIntervalMixin.js"
import { CalendarIntervalStore } from "../../../calendar/CalendarIntervalStore.js"
import { CalendarIteratorResult } from "../../../calendar/CalendarCache.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { BaseCalendarMixin } from "../scheduler_basic/BaseCalendarMixin.js"
import { BaseResourceMixin } from "../scheduler_basic/BaseResourceMixin.js"
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"
import { SchedulerProAssignmentMixin } from "./SchedulerProAssignmentMixin.js"
import { CalculatedValueGen, Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { SchedulerProEvent } from "./SchedulerProEvent.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { SchedulerProEventSegment } from "./SchedulerProEventSegment.js"
import { SchedulerProHasAssignmentsMixin } from "./SchedulerProHasAssignmentsMixin.js"

export class ResourceAllocationEventRangeCalendarIntervalMixin extends CalendarIntervalMixin {

    // @model_field({ type : 'boolean', defaultValue : true })
    // isWorking : boolean

    // Calendar classes not entering graph, thus not using @model_field
    static get fields () {
        return [
            { name : 'isWorking', type : 'boolean', defaultValue : true }
        ]
    }

    assignment : SchedulerProAssignmentMixin
}

export class ResourceAllocationEventRangeCalendarIntervalStore extends CalendarIntervalStore {

    modelClass : typeof ResourceAllocationEventRangeCalendarIntervalMixin

    static get defaultConfig () {
        return {
            modelClass      : ResourceAllocationEventRangeCalendarIntervalMixin
        }
    }
}

export class ResourceAllocationEventRangeCalendar extends BaseCalendarMixin {

    intervalStore               : ResourceAllocationEventRangeCalendarIntervalStore

    get intervalStoreClass () : typeof ResourceAllocationEventRangeCalendarIntervalStore {
        return ResourceAllocationEventRangeCalendarIntervalStore
    }

    @model_field({ type : 'boolean', defaultValue : false })
    unspecifiedTimeIsWorking : boolean
}

export class BaseAllocationInterval extends Base {
    /**
     * Tick (time interval) the allocation is collected for.
     */
    tick                : CalendarIntervalMixin

    /**
     * Effort in the [[tick|interval]] in milliseconds.
     */
    effort              : number = 0

    /**
     * Utilization level of the resource (or the assignment if the interval represents the one) in percent.
     */
    units               : number = 0
}

export class AssignmentAllocationInterval extends BaseAllocationInterval {

    /**
     * The assignment.
     */
    assignment          : SchedulerProAssignmentMixin

    /**
     * Indicates if the interval is in the middle of the event timespan.
     */
    inEventTimeSpan     : boolean = false
}

/**
 * Resource allocation information for a certain tick.
 */
export class ResourceAllocationInterval extends BaseAllocationInterval {

    /**
     * The allocated resource.
     */
    resource            : BaseResourceMixin

    /**
     * Maximum possible effort in the [[tick|interval]] in milliseconds.
     */
    maxEffort           : number = 0

    /**
     * Indicates that the resource (or the assignment if the interval represents the one) is over-allocated in the [[tick|interval]].
     * So `true` when [[effort]] is more than [[maxEffort|possible maximum]].
     */
    isOverallocated     : boolean = false

     /**
      * Indicates that the resource (or assignment if the interval represents the one) is under-allocated in the [[tick|interval]].
      * So `true` when [[effort]] is less than [[maxEffort|possible maximum]].
      */
    isUnderallocated    : boolean = false

    /**
     * Indicates if the interval is in the middle of the event timespan.
     */
    inEventTimeSpan     : boolean = false

    /**
     * Resource assignments ingoing in the [[tick|interval]].
     */
    assignments         : Set<SchedulerProAssignmentMixin> = null

    assignmentIntervals : Map<SchedulerProAssignmentMixin, AssignmentAllocationInterval> = null

}

export type Allocation = BaseAllocationInterval[]

/**
 * Resource allocation information.
 */
export type ResourceAllocation = {
    resource      : SchedulerProResourceMixin,
    owner         : ResourceAllocationInfo,
    total         : ResourceAllocationInterval[],
    byAssignments : Map<SchedulerProAssignmentMixin, Allocation>
}

export class BaseAllocationInfo extends Entity.mix(Base) {

    /**
     * Ticks to group allocation by.
     * This also specifies the time period to collect allocation for.
     * So the first tick `startDate` is treated as the period start and the last tick `endDate` is the period end.
     */
    ticks                   : CalculatedValueGen<BaseCalendarMixin>

    /**
     * Set to `true` to include inactive events allocation and `false` to skip inactive events (default).
     */
    @field()
    includeInactiveEvents   : boolean

    setIncludeInactiveEvents : (value : boolean) => Promise<CommitResult>

    /**
     * The collected allocation info.
     */
    @field()
    allocation              : any


    allocationIntervalClass : typeof BaseAllocationInterval


    getDefaultAllocationIntervalClass () : this['allocationIntervalClass'] {
        return BaseAllocationInterval
    }


    initialize (props? : Partial<BaseAllocationInfo>) {
        props       = Object.assign({
            includeInactiveEvents   : false,
            allocationIntervalClass : this.getDefaultAllocationIntervalClass()
        }, props)

        super.initialize(props)
    }

}

/**
 * Class implementing _resource allocation report_ - a data representing the provided [[resource]]
 * utilization in the provided period of time.
 * The data is grouped by the provided [[ticks|time intervals]]
 */
export class ResourceAllocationInfo extends BaseAllocationInfo {

    /**
     * Resource to build collect the utilization info of.
     */
    @field()
    resource                : SchedulerProResourceMixin


    allocation              : ResourceAllocation

    eventRangesCalendar     : ResourceAllocationEventRangeCalendar

    allocationIntervalClass : typeof ResourceAllocationInterval


    enterGraph (graph) {
        super.enterGraph(graph)
    }


    leaveGraph (graph) {
        if (this.eventRangesCalendar) {
            this.resource?.getProject().clearCombinationsWith(this.eventRangesCalendar)
        }

        super.leaveGraph(graph)

        this.resource?.entities.delete(this)
    }


    getDefaultAllocationIntervalClass () : this['allocationIntervalClass'] {
        return ResourceAllocationInterval
    }


    * shouldIncludeAssignmentInAllocation (assignment : SchedulerProAssignmentMixin) : CalculationIterator<boolean> {
        const
            event : SchedulerProEvent   = yield assignment.$.event,
            includeInactiveEvents       = yield this.$.includeInactiveEvents,
            inactive                    = event && (yield event.$.inactive), // includeInactiveEvents
            startDate : Date            = event && (yield event.$.startDate),
            endDate : Date              = event && (yield event.$.endDate)

        return Boolean(event && startDate && endDate && (includeInactiveEvents || !inactive))
    }

    @calculate('allocation')
    * calculateAllocation () : CalculationIterator<this[ 'allocation' ]> {
        const
            total : this[ 'allocation' ]['total']                                                                               = [],
            ticksCalendar : BaseCalendarMixin                                                                                   = yield this.ticks,
            resource : SchedulerProResourceMixin                                                                                = yield this.$.resource,
            includeInactiveEvents : boolean                                                                                     = yield this.$.includeInactiveEvents,
            assignments : Set<SchedulerProAssignmentMixin>                                                                      = yield resource.$.assigned,
            calendar : BaseCalendarMixin                                                                                        = yield resource.$.effectiveCalendar,
            assignmentsByCalendar : Map<BaseCalendarMixin, SchedulerProAssignmentMixin[]>                                       = new Map(),
            eventRanges : Partial<ResourceAllocationEventRangeCalendarIntervalMixin>[]                                          = [],
            assignmentTicksData : Map<SchedulerProAssignmentMixin, Map<CalendarIntervalMixin, AssignmentAllocationInterval>>    = new Map(),
            byAssignments : Map<SchedulerProAssignmentMixin, Allocation>                                                        = new Map()

        let
            hasIgnoreResourceCalendarEvent : boolean = false,
            weightedUnitsSum : number,
            weightsSum : number,
            lastTick : CalendarIntervalMixin


        // collect the resource assignments into assignmentsByCalendar map
        for (const assignment of assignments) {
            // skip missing or unscheduled event assignments
            if (!(yield * this.shouldIncludeAssignmentInAllocation(assignment))) continue

            // we're going to need up-to-date assignment "units" below in this method ..so we yield it here
            yield assignment.$.units

            const event : SchedulerProEvent             = yield assignment.$.event
            const ignoreResourceCalendar : boolean      = yield event.$.ignoreResourceCalendar
            const startDate : Date                      = yield event.$.startDate
            const endDate : Date                        = yield event.$.endDate
            const segments : SchedulerProEventSegment[] = yield event.$.segments
            const eventCalendar : BaseCalendarMixin     = yield event.$.effectiveCalendar

            hasIgnoreResourceCalendarEvent = hasIgnoreResourceCalendarEvent || ignoreResourceCalendar

            // if the event is segmented collect segment ranges
            if (segments) {
                for (const segment of segments) {
                    const startDate : Date              = yield segment.$.startDate
                    const endDate : Date                = yield segment.$.endDate

                    eventRanges.push({ startDate, endDate, assignment })
                }
            }
            else {
                eventRanges.push({ startDate, endDate, assignment })
            }

            let assignments     = assignmentsByCalendar.get(eventCalendar)

            if (!assignments) {
                assignments     = []
                assignmentsByCalendar.set(eventCalendar, assignments)
            }

            assignmentTicksData.set(assignment, new Map())
            byAssignments.set(assignment, [])

            assignments.push(assignment)
        }

        if (this.eventRangesCalendar) {
            this.resource?.getProject().clearCombinationsWith(this.eventRangesCalendar)
        }

        const eventRangesCalendar : ResourceAllocationEventRangeCalendar = this.eventRangesCalendar = new ResourceAllocationEventRangeCalendar({ intervals : eventRanges })

        // Provide extra calendars:
        // 1) a calendar containing list of ticks to group the resource allocation by
        // 2) a calendar containing list of assigned event start/end ranges
        // 3) assigned task calendars
        const calendars : BaseCalendarMixin[]   = [ ticksCalendar, eventRangesCalendar, ...assignmentsByCalendar.keys() ]

        const ticksData : Map<CalendarIntervalMixin, ResourceAllocationInterval> = new Map()

        // Initialize the resulting array with empty items

        ticksCalendar.intervalStore.forEach(tick => {
            const tickData : ResourceAllocationInterval   = ResourceAllocationInterval.new({ tick, resource })

            ticksData.set(tick, tickData)
            total.push(tickData)

            assignmentTicksData.forEach((ticksData, assignment) => {
                const assignmentTickData : AssignmentAllocationInterval   = AssignmentAllocationInterval.new({ tick, assignment })

                ticksData.set(tick, assignmentTickData)
                byAssignments.get(assignment).push(assignmentTickData)
            })

        })

        const
            startDate               = total[0].tick.startDate,
            endDate                 = total[total.length - 1].tick.endDate,
            iterationOptions : any  = {
                startDate,
                endDate,
                calendars,
                includeNonWorkingIntervals : hasIgnoreResourceCalendarEvent,
            },
            ticksTotalDuration  = endDate.getTime() - startDate.getTime()

        // provide extended maxRange if total ticks duration is greater than it
        if (ticksTotalDuration > resource.getProject().maxCalendarRange) {
            iterationOptions.maxRange   = ticksTotalDuration
        }

        yield* resource.forEachAvailabilityInterval(iterationOptions,
            (intervalStartDate, intervalEndDate, intervalData) => {
                const isWorkingCalendar = intervalData.getCalendarsWorkStatus()

                // We are inside a tick interval and it's a working time according
                // to a resource calendar

                if (isWorkingCalendar.get(ticksCalendar)) {

                    const
                        tick                                                                                        = intervalData.intervalsByCalendar.get(ticksCalendar)[0],
                        intervalDuration : number                                                                   = intervalEndDate.getTime() - intervalStartDate.getTime(),
                        tickData : ResourceAllocationInterval                                                       = ticksData.get(tick),
                        tickAssignments : Set<SchedulerProAssignmentMixin>                                          = tickData.assignments || new Set(),
                        tickAssignmentIntervals : Map<SchedulerProAssignmentMixin, AssignmentAllocationInterval>    = tickData.assignmentIntervals || new Map()

                    // Check previous tick
                    if (lastTick && lastTick !== tick) {
                        const lastTicksData = ticksData.get(lastTick)

                        // last attempt to detect underallocation in the tick - check if its collected effort is less than its maxEffort
                        lastTicksData.isUnderallocated = lastTicksData.isUnderallocated || (lastTicksData.effort && lastTicksData.effort < lastTicksData.maxEffort)
                    }

                    // remember last tick processed
                    lastTick = tick

                    if (!tickData.assignments) {
                        weightedUnitsSum        = 0
                        weightsSum              = 0
                    }

                    let
                        units : number          = 0,
                        intervalHasAssignments  = false,
                        duration : number,
                        intervalEffort = 0

                    // for each event intersecting the interval
                    intervalData.intervalsByCalendar.get(eventRangesCalendar).forEach((interval : ResourceAllocationEventRangeCalendarIntervalMixin) => {
                        const assignment : SchedulerProAssignmentMixin  = interval.assignment



                        const event : SchedulerProHasAssignmentsMixin       = assignment?.event as SchedulerProHasAssignmentsMixin

                        // if event is performing in the interval
                        if (event &&
                            isWorkingCalendar.get(event.effectiveCalendar) &&
                            (/* !hasIgnoreResourceCalendarEvent || */ event.ignoreResourceCalendar || isWorkingCalendar.get(calendar)))
                        {
                            // constrain the event start/end with the tick borders
                            const workingStartDate      = Math.max(intervalStartDate.getTime(), assignment.event.startDate.getTime())
                            const workingEndDate        = Math.min(intervalEndDate.getTime(), assignment.event.endDate.getTime())

                            intervalHasAssignments      = true

                            duration                    = workingEndDate - workingStartDate

                            const assignmentInterval        = assignmentTicksData.get(assignment).get(tick)

                            const assignmentEffort : number = duration * assignment.units / 100

                            assignmentInterval.effort   += assignmentEffort
                            assignmentInterval.units    = assignment.units
                            assignmentInterval.inEventTimeSpan = true

                            intervalEffort              += assignmentEffort

                            // collect total resource usage percent in the current interval
                            units                       += assignment.units

                            tickAssignments.add(assignment)

                            tickAssignmentIntervals.set(assignment, assignmentInterval)
                        }
                    })

                    tickData.inEventTimeSpan = tickData.inEventTimeSpan || intervalHasAssignments

                    // maxEffort represents the resource calendar intervals
                    if (isWorkingCalendar.get(calendar)) {
                        tickData.maxEffort          += intervalDuration
                    }

                    // if we have assignments running in the interval - calculate average allocation %
                    if (units) {
                        if (duration) {
                            // keep weightedUnitsSum & weightsSum since there might be another intervals in the tick
                            weightedUnitsSum            += duration * units
                            weightsSum                  += duration
                            // "units" weighted arithmetic mean w/ duration values as weights
                            tickData.units              = weightedUnitsSum / weightsSum
                        } else if (!weightedUnitsSum) {
                            tickData.units              = units
                        }
                    }

                    if (intervalHasAssignments) {
                        tickData.effort                 += intervalEffort
                        tickData.assignments            = tickAssignments
                        tickData.assignmentIntervals    = tickAssignmentIntervals
                        tickData.isOverallocated        = tickData.isOverallocated || tickData.effort > tickData.maxEffort || tickData.units > 100
                        tickData.isUnderallocated       = tickData.isUnderallocated || intervalEffort < intervalDuration || tickData.units < 100
                    }
                }
            }
        )

        if (lastTick) {
            const lastTicksData = ticksData.get(lastTick)

            // last attempt to detect underallocation in the tick - check if its collected effort is less than its maxEffort
            lastTicksData.isUnderallocated = lastTicksData.isUnderallocated || (lastTicksData.effort && lastTicksData.effort < lastTicksData.maxEffort)
        }

        return {
            owner : this,
            resource,
            total,
            byAssignments
        }
    }

}


/**
 * A mixin for the resource entity at the Scheduler Pro level.
 */
export class SchedulerProResourceMixin extends Mixin(
    [ BaseResourceMixin ],
    (base : AnyConstructor<BaseResourceMixin, typeof BaseResourceMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class SchedulerProResourceMixin extends base {

        // w/o this `Omit` incremental compilation report false compilation error
        project                             : Omit<SchedulerProProjectMixin, 'resourceModelClass'> & { resourceModelClass : typeof SchedulerProResourceMixin }

        observers                           : Set<Identifier> = new Set()

        entities                            : Set<Entity> = new Set()

        addObserver (observer) {
            this.graph.addIdentifier(observer)

            this.observers.add(observer)
        }

        removeObserver (observer) {
            if (this.graph) {
                this.graph.removeIdentifier(observer)
            }

            this.observers.delete(observer)
        }

        addEntity (entity) {
            this.graph.addEntity(entity)

            this.entities.add(entity)
        }

        removeEntity (entity) {
            if (this.graph) {
                this.graph.removeEntity(entity)
            }

            this.entities.delete(entity)
        }

        leaveGraph (replica : Replica) {
            const { graph } = this

            for (const observer of this.observers) {
                this.removeObserver(observer)
            }

            for (const entity of this.entities) {
                this.removeEntity(entity)
            }

            superProto.leaveGraph.call(this, replica)
        }

        * forEachAvailabilityInterval (
            options     : {
                startDate?                          : Date,
                endDate?                            : Date,
                isForward?                          : boolean,
                calendars?                          : BaseCalendarMixin[],
                maxRange?                           : number,
                includeNonWorkingIntervals?         : boolean,
            },
            func        : (
                startDate                           : Date,
                endDate                             : Date,
                calendarCacheIntervalMultiple       : CalendarCacheIntervalMultiple
            ) => false | void
        ) : CalculationIterator<CalendarIteratorResult>
        {
            const project = this.getProject()

            const calendar : BaseCalendarMixin                          = yield this.$.effectiveCalendar

            const effectiveCalendarsCombination : CalendarCacheMultiple = project.combineCalendars([ calendar ].concat(options.calendars || []))

            const maxRange : number                                     = project.maxCalendarRange

            const includeNonWorkingIntervals : boolean                  = options.includeNonWorkingIntervals

            if (maxRange) {
                options     = Object.assign({ maxRange }, options)
            }

            return effectiveCalendarsCombination.forEachAvailabilityInterval(
                options,
                (startDate : Date, endDate : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                    const calendarsStatus   = calendarCacheIntervalMultiple.getCalendarsWorkStatus()

                    if (includeNonWorkingIntervals || calendarsStatus.get(calendar)) {
                        return func(startDate, endDate, calendarCacheIntervalMultiple)
                    }
                }
            )
        }

    }

    return SchedulerProResourceMixin
}){}
