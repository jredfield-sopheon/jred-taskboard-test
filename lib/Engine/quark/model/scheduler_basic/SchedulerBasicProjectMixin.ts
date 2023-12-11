import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { AnyConstructor, MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js"
import { AnyFunction } from "../../../../ChronoGraph/class/Mixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { ReadMode, Replica } from "../../../../ChronoGraph/replica/Replica.js"
import { Schema } from "../../../../ChronoGraph/schema/Schema.js"
import { delay } from "../../../../ChronoGraph/util/Helpers.js"
import StateTrackingManager from "../../../../Core/data/stm/StateTrackingManager.js"
import Store from "../../../../Core/data/Store.js"
import { model_field, ModelReferenceField, ChronoModelFieldIdentifier, IsChronoModelSymbol, ModelBucketField } from "../../../chrono/ModelFieldAtom.js"
import { EngineReplica, CycleEffect } from "../../../chrono/Replica.js"
import { DurationConverterMixin } from "../../../scheduling/DurationConverterMixin.js"
import { Direction, ProjectType } from "../../../scheduling/Types.js"
import { ChronoAssignmentStoreMixin } from "../../store/ChronoAssignmentStoreMixin.js"
import { ChronoCalendarManagerStoreMixin } from "../../store/ChronoCalendarManagerStoreMixin.js"
import { ChronoDependencyStoreMixin } from "../../store/ChronoDependencyStoreMixin.js"
import { ChronoEventStoreMixin } from "../../store/ChronoEventStoreMixin.js"
import { ChronoPartOfProjectStoreMixin } from "../../store/mixin/ChronoPartOfProjectStoreMixin.js"
import { ChronoResourceStoreMixin } from "../../store/ChronoResourceStoreMixin.js"
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js"
import { ChronoAbstractProjectMixin } from "./ChronoAbstractProjectMixin.js"
import { BaseAssignmentMixin } from "./BaseAssignmentMixin.js"
import { BaseCalendarMixin } from "./BaseCalendarMixin.js"
import { BaseDependencyMixin } from "./BaseDependencyMixin.js"
import { BaseEventMixin } from "./BaseEventMixin.js"
import { BaseResourceMixin } from "./BaseResourceMixin.js"
import { CanCombineCalendarsMixin, HasCalendarMixin } from "./HasCalendarMixin.js"
import { HasSubEventsMixin } from "./HasSubEventsMixin.js"
import { SchedulerBasicEvent } from "./SchedulerBasicEvent.js"
import ObjectHelper from "../../../../Core/helper/ObjectHelper.js"
import { AbstractPartOfProjectStoreMixin } from "../../store/mixin/AbstractPartOfProjectStoreMixin.js"
import { ChronoModelMixin } from "../../../chrono/ChronoModelMixin.js"
import { TransactionCommitResult } from "../../../../ChronoGraph/chrono/Transaction.js"
import { EntityIdentifier } from "../../../../ChronoGraph/replica/Identifier.js"
import Queue from "../../../util/Queue.js"

/**
 * The data package format describing project data
 */
export type ProjectDataPackage = {
    eventsData?             : any[]
    dependenciesData?       : any[]
    resourcesData?          : any[]
    assignmentsData?        : any[]
    calendarsData?          : any[]
    tasksData?              : any[]
    project?                : any
}

/**
 * Basic Scheduler project mixin type. At this level, events have assignments and dependencies, which both are, however,
 * only visual and do not affect the scheduling.
 */
export class SchedulerBasicProjectMixin extends MixinAny(
    [
        ChronoAbstractProjectMixin,
        BaseEventMixin,
        HasSubEventsMixin,
        HasCalendarMixin,
        DurationConverterMixin,
        CanCombineCalendarsMixin
    ],
    (base : AnyConstructor<
        ChronoAbstractProjectMixin &
        BaseEventMixin &
        HasSubEventsMixin &
        HasCalendarMixin &
        DurationConverterMixin &
        CanCombineCalendarsMixin
        ,
        typeof ChronoAbstractProjectMixin &
        typeof BaseEventMixin &
        typeof HasSubEventsMixin &
        typeof HasCalendarMixin &
        typeof DurationConverterMixin &
        typeof CanCombineCalendarsMixin
    >) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class SchedulerBasicProjectMixin extends base {

        project                     : this

        /**
         * The constructor for the "Event" entity of the project.
         */
        eventModelClass             : typeof SchedulerBasicEvent

        /**
         * The constructor for the "Dependency" entity of the project
         */
        dependencyModelClass        : typeof BaseDependencyMixin

        /**
         * The constructor for the "Resource" entity of the project
         */
        resourceModelClass          : typeof BaseResourceMixin

        /**
         * The constructor for the "Assignment" entity of the project
         */
        assignmentModelClass        : typeof BaseAssignmentMixin

        /**
         * The constructor for the "Calendar" entity of the project
         */
        calendarModelClass          : typeof BaseCalendarMixin

        /**
         * The constructor for the "Events" collection of the project
         */
        eventStoreClass             : typeof ChronoEventStoreMixin

        /**
         * The constructor for the "Dependencies" collection of the project
         */
        dependencyStoreClass        : typeof ChronoDependencyStoreMixin

        /**
         * The constructor for the "Resources" collection of the project
         */
        resourceStoreClass          : typeof ChronoResourceStoreMixin

        /**
         * The constructor for the "Assignments" collection of the project
         */
        assignmentStoreClass        : typeof ChronoAssignmentStoreMixin

        /**
         * The constructor for the "Calendars" collection of the project
         */
        calendarManagerStoreClass   : typeof ChronoCalendarManagerStoreMixin

        /**
         * The constructor for the _cycle effect_ - the effect indicating a computation cycle.
         */
        cycleEffectClass            : typeof CycleEffect

        /**
         * State tracking manager instance the project relies on
         */
        stm                         : StateTrackingManager

        /**
         * The instance of the "Events" collection of the project
         */
        eventStore                  : ChronoEventStoreMixin

        /**
         * The instance of the "Dependencies" collection of the project
         */
        dependencyStore             : ChronoDependencyStoreMixin

        /**
         * The instance of the "Resources" collection of the project
         */
        resourceStore               : ChronoResourceStoreMixin

        /**
         * The instance of the "Assignments" collection of the project
         */
        assignmentStore             : ChronoAssignmentStoreMixin

        /**
         * The instance of the "Calendars" collection of the project
         */
        calendarManagerStore        : ChronoCalendarManagerStoreMixin

        /**
         * The events data - can be provided during project instantiation and will be loaded with [[loadInlineData]].
         *
         * ```typescript
         * const project    = new SchedulerBasicProjectMixin({
         *     eventsData   : [ { name : 'Task 1' } ]
         * })
         * ```
         */
        eventsData                  : any[]
        /**
         * The dependencies data - can be provided during project instantiation and will be loaded with [[loadInlineData]].
         *
         * ```typescript
         * const project    = new SchedulerBasicProjectMixin({
         *     eventsData       : [
         *         { id : 1, name : 'Predecessor' },
         *         { id : 2, name : 'Successor' }
         *     ],
         *     dependenciesData : [ { fromEvent : 1, toEvent : 2 } ]
         *     resourcesData   : [
         *         { name : 'Bulldozer' }
         *     ]
         * })
         * ```
         */
        dependenciesData            : any[]
        /**
         * The resources data - can be provided during project instantiation and will be loaded with [[loadInlineData]].
         *
         * ```typescript
         * const project    = new SchedulerBasicProjectMixin({
         *     resourcesData   : [
         *         { name : 'John' },
         *         { name : 'Mary' },
         *         { name : 'Sarah' },
         *         { name : 'Robert' }
         *     ]
         * })
         * ```
         */
        resourcesData               : any[]
        /**
         * The assignments data - can be provided during project instantiation and will be loaded with [[loadInlineData]].
         *
         * ```typescript
         * const project    = new SchedulerBasicProjectMixin({
         *     eventsData       : [
         *         { id : 1, name : 'Predecessor' },
         *         { id : 2, name : 'Successor' }
         *     ],
         *     assignmentsData : [
         *         { event : 1, resource : 101 },
         *         { event : 2, resource : 101 },
         *         { event : 2, resource : 102 }
         *     ]
         *     resourcesData   : [
         *         { id : 100, name : 'John' },
         *         { id : 101, name : 'Mary' },
         *         { id : 102, name : 'Gabriel' }
         *     ]
         * })
         * ```
         */
        assignmentsData             : any[]
        /**
         * The calendars data - can be provided during project instantiation and will be loaded with [[loadInlineData]].
         *
         * ```typescript
         * const project    = new SchedulerBasicProjectMixin({
         *     calendar      : 1,
         *     calendarsData : [
         *         {
         *             id        : 1,
         *             name      : 'Default',
         *             intervals : [
         *                 {
         *                     recurrentStartDate : 'on Sat at 0:00',
         *                     recurrentEndDate   : 'on Mon at 0:00',
         *                     isWorking          : false
         *                 }
         *             ]
         *         }
         *     ]
         * })
         * ```
         */
        calendarsData               : any[]

        /**
         * Set to `true` to reset the undo/redo queues of the internal [StateTrackingManager](https://bryntum.com/products/scheduler/docs/api/Core/data/stm/StateTrackingManager)
         * after the Project has loaded. Defaults to `false`
         */
        resetUndoRedoQueuesAfterLoad : boolean

        defaultCalendar             : BaseCalendarMixin

        /**
         * This property is used when instantiating the default calendar of the project. This calendar will have no availability intervals,
         * so this setting will either turn the whole timespan into working time or non-working.
         *
         * Default value is `true`
         */
        @model_field({ type : 'boolean', defaultValue : true })
        unspecifiedTimeIsWorking     : boolean

        /**
         * When `true` the project manually scheduled tasks adjust their proposed start/end dates
         * to skip non working time.
         *
         * Default value is `false`
         */
        @model_field({ type : 'boolean', defaultValue : false })
        skipNonWorkingTimeWhenSchedulingManually : boolean

        /**
         * When `true` the project's manually scheduled tasks adjust their duration by excluding the non-working time from it,
         * according to the calendar.
         *
         * Default value is `true`
         */
        @model_field({ type : 'boolean', defaultValue : true })
        skipNonWorkingTimeInDurationWhenSchedulingManually : boolean

        _enableProgressNotifications : boolean

        // Stores whose dataset has been replaced. Records of those stores can be excluded from graph -> DATA update
        // since they are brand new
        repopulateStores             : Set<AbstractPartOfProjectStoreMixin>

        repopulateOnDataset          : boolean

        ignoreInitialCommitComputationCycles : boolean

        _stmDisabled                         : boolean

        _stmAutoRecord                       : boolean

        delayCalculation                     : boolean

        _queue                               : Queue

        // overriding the default value of the `direction` field to forward scheduling
        @model_field({ type : 'string', defaultValue : Direction.Forward }, { sync : true })
        direction       : Direction


        construct (config : Partial<this> = {}) {
            this.delayCalculation               = config.delayCalculation !== false
            this.enableProgressNotifications    = config.enableProgressNotifications || config.delayCalculation !== false

            this._queue = new Queue()

            // Expand project by default to make getRange to work
            if (!('expanded' in config)) {
                // @ts-ignore
                config.expanded = true
            }

            if (this.delayCalculation) {
                this.delayEnteringReplica = true
            }

            if (!('skipNonWorkingTimeWhenSchedulingManually' in config)) {
                config.skipNonWorkingTimeWhenSchedulingManually = false
            }

            superProto.construct.call(this, config)

            this.repopulateStores = new Set<AbstractPartOfProjectStoreMixin>()

            this.ignoreInitialCommitComputationCycles = ('ignoreInitialCommitComputationCycles' in config) ? config.ignoreInitialCommitComputationCycles : false

            if (this.ignoreInitialCommitComputationCycles) {
                console.warn('Project "ignoreInitialCommitComputationCycles" option is deprecated and will be dropped in the next major release')
            }

            if (!this.eventModelClass) this.eventModelClass = this.getDefaultEventModelClass()
            if (!this.eventStoreClass) this.eventStoreClass = this.getDefaultEventStoreClass()

            if (!this.dependencyModelClass) this.dependencyModelClass = this.getDefaultDependencyModelClass()
            if (!this.dependencyStoreClass) this.dependencyStoreClass = this.getDefaultDependencyStoreClass()

            if (!this.resourceModelClass) this.resourceModelClass = this.getDefaultResourceModelClass()
            if (!this.resourceStoreClass) this.resourceStoreClass = this.getDefaultResourceStoreClass()

            if (!this.assignmentModelClass) this.assignmentModelClass = this.getDefaultAssignmentModelClass()
            if (!this.assignmentStoreClass) this.assignmentStoreClass = this.getDefaultAssignmentStoreClass()

            if (!this.calendarModelClass) this.calendarModelClass = this.getDefaultCalendarModelClass()
            if (!this.calendarManagerStoreClass) this.calendarManagerStoreClass = this.getDefaultCalendarManagerStoreClass()

            if (!this.cycleEffectClass) this.cycleEffectClass = this.getDefaultCycleEffectClass()

            this.initializeStm()

            // NOTE, default calendar is assumed to be 24/7/365, because it is used for manually scheduled events
            // not part of the CalendarManagerStore intentionally, not persisted
            this.defaultCalendar = new this.calendarModelClass({
                unspecifiedTimeIsWorking: this.unspecifiedTimeIsWorking
            })

            this.defaultCalendar.project = this

            if (!this.delayEnteringReplica) this.enterReplica(false)

            this.setCalendarManagerStore(this.calendarManagerStore)

            this.setEventStore(this.eventStore)

            this.setDependencyStore(this.dependencyStore)

            this.setResourceStore(this.resourceStore)

            this.setAssignmentStore(this.assignmentStore)

            const hasInlineData = Boolean(this.calendarsData || this.eventsData || this.dependenciesData || this.resourcesData || this.assignmentsData)

            if (hasInlineData) {
                // this branch has `scheduleDelayedCalculation` call inside `loadInlineData`
                this.loadInlineData({
                    calendarsData       : this.calendarsData,
                    eventsData          : this.eventsData,
                    dependenciesData    : this.dependenciesData,
                    resourcesData       : this.resourcesData,
                    assignmentsData     : this.assignmentsData
                })

                delete this.calendarsData
                delete this.eventsData
                delete this.dependenciesData
                delete this.resourcesData
                delete this.assignmentsData
            } else {
                // on this branch need to call it manually
                // avoid calling `scheduleDelayedCalculation` unless absolutely necessary
                // this is to avoid having 2 commits in the project - 1st with empty data
                // 2nd with real data
                // we have special behavior tied to the 1st commit, like state restoring (previously selected record)
                if (this.delayCalculation && this.hasDataInStores) this.scheduleDelayedCalculation()
            }
        }


        get hasDataInStores () : boolean {
            return [
                this.calendarManagerStore,
                this.eventStore,
                this.dependencyStore,
                this.resourceStore,
                this.assignmentStore
            ].some(store => store.allCount > 0)
        }


        enterReplica (enterRecords : boolean) {
            const me = this

            if (!me.replica) {
                me.replica = me.createReplica()

                me.replica.addEntity(me)
                me.replica.addEntity(me.defaultCalendar)

                me.trigger('graphReady')
            }

            // In delayCalculation mode no records entered the graph on construction,
            // instead we enter them now after first draw
            if (enterRecords && !me.isRepopulatingStores) {
                // Only enter "new" records, we are called when records are added later on
                me.calendarManagerStore.forEach(r => { !r.graph && r.joinProject() }, undefined, { includeFilteredOutRecords : true })
                me.eventStore.forEach(r => { !r.graph && r.joinProject() }, undefined, { includeFilteredOutRecords : true })
                me.resourceStore.forEach(r => { !r.graph && r.joinProject() }, undefined, { includeFilteredOutRecords : true })
                me.dependencyStore.forEach(r => { !r.graph && r.joinProject() }, undefined, { includeFilteredOutRecords : true })
                me.assignmentStore.forEach(r => { !r.graph && r.joinProject() }, undefined, { includeFilteredOutRecords : true })
            }
        }

        resetStmQueue () {
            const wasDisabled = this.stm.disabled

            this.stm.disable()
            this.stm.resetQueue()

            if (!wasDisabled) {
                this.stm.enable()
            }
        }

        doDestroy () {
            const me = this

            me.eventStore?.destroy()
            me.dependencyStore?.destroy()
            me.assignmentStore?.destroy()
            me.resourceStore?.destroy()
            me.calendarManagerStore?.destroy()
            me.defaultCalendar?.destroy()

            me.replica?.clear()

            me.stm?.destroy()

            superProto.doDestroy.call(this)
        }


        getReplicaConfig () : Partial<Replica & EngineReplica> {
            return {
                project                              : this,
                schema                               : Schema.new(),
                enableProgressNotifications          : this.enableProgressNotifications,
                silenceInitialCommit                 : this.silenceInitialCommit,
                ignoreInitialCommitComputationCycles : this.ignoreInitialCommitComputationCycles,
                cycleEffectClass                     : this.cycleEffectClass,
                onWriteDuringCommit                  : 'ignore',
                readMode                             : ReadMode.CurrentOrProposedOrPrevious
            }
        }


        // Creates a new Replica, used during construction and when repopulating
        createReplica () {
            return EngineReplica.mix(Replica).new(this.getReplicaConfig())
        }


        * hasSubEvents () : CalculationIterator<boolean> {
            return this.getEventStore().count > 0
        }


        * subEventsIterable () : CalculationIterator<Iterable<BaseEventMixin>> {
            return this.getEventStore().getRange()
        }


        getType () : ProjectType {
            return ProjectType.SchedulerBasic
        }

        get enableProgressNotifications () : boolean {
            return this._enableProgressNotifications
        }

        /**
         * Enables/disables the calculation progress notifications.
         */
        set enableProgressNotifications (value : boolean) {
            this._enableProgressNotifications   = value

            if (this.replica) this.replica.enableProgressNotifications  = value
        }

        getDefaultCycleEffectClass () : this['cycleEffectClass'] {
            return CycleEffect
        }

        /**
         * Returns the default event model class to use
         */
        getDefaultEventModelClass () : this[ 'eventModelClass' ] {
            return SchedulerBasicEvent
        }


        /**
         * Returns the default event store class to use
         */
        getDefaultEventStoreClass () : this[ 'eventStoreClass' ] {
            return ChronoEventStoreMixin
        }


        /**
         * Returns the default dependency model class to use
         */
        getDefaultDependencyModelClass () : this[ 'dependencyModelClass' ] {
            return BaseDependencyMixin
        }


        /**
         * Returns the default dependency store class to use
         */
        getDefaultDependencyStoreClass () : this[ 'dependencyStoreClass' ] {
            return ChronoDependencyStoreMixin
        }


        /**
         * Returns the default resource model class to use
         */
        getDefaultResourceModelClass () : this[ 'resourceModelClass' ] {
            return BaseResourceMixin
        }


        /**
         * Returns the default resource store class to use
         */
        getDefaultResourceStoreClass () : this[ 'resourceStoreClass' ] {
            return ChronoResourceStoreMixin
        }


        /**
         * Returns the default assignment model class to use
         */
        getDefaultAssignmentModelClass () : this[ 'assignmentModelClass' ] {
            return BaseAssignmentMixin
        }


        /**
         * Returns the default assignment store class to use
         */
        getDefaultAssignmentStoreClass () : this[ 'assignmentStoreClass' ] {
            return ChronoAssignmentStoreMixin
        }


        /**
         * Returns the default calendar model class to use
         */
        getDefaultCalendarModelClass () : this[ 'calendarModelClass' ] {
            return BaseCalendarMixin
        }


        /**
         * Returns the default calendar manager store class to use
         */
        getDefaultCalendarManagerStoreClass () : this[ 'calendarManagerStoreClass' ] {
            return ChronoCalendarManagerStoreMixin
        }

        usingSyncDataOnLoad () : boolean {
            return [this.eventStore, this.resourceStore, this.dependencyStore, this.assignmentStore].some(s => s.syncDataOnLoad)
        }


        /**
         * This method loads the "raw" data into the project. The loading is basically happening by
         * assigning the individual data entries to the `data` property of the corresponding store.
         *
         * @param data
         */
        async loadInlineData (data : ProjectDataPackage) : Promise<CommitResult> {
            const { calendarManagerStore, eventStore, dependencyStore, assignmentStore, resourceStore, replica } = this

            if (!this.isInitialCommitPerformed) {
                // Prevent initial commit from happening before inline data is loaded
                replica?.unScheduleAutoCommit()
            }
            else {
                // We want to be very sure that calculations are complete before we plug new data in.
                // For a scenario where a client plugged new datasets in on every store change, thus multiple times
                // during a single commit()
                while (this.replica.isCommitting) {
                    await this.commitAsync()
                }
            }

            if (replica?.enableProgressNotifications && !this.delayCalculation) {
                // First delay needed to allow assignment of Project -> Gantt to happen before carrying on,
                // to make sure progress listener is in place
                await delay(0)

                // wait till the current propagation completes (if any)
                // otherwise the mask shown due to the next line call will be
                // destroyed as the propagation gets done
                await this.commitAsync()

                replica.onPropagationProgressNotification({ total : 0, remaining : 0, phase : 'storePopulation' })
                // Second delay needed to allow mask to appear, not clear why delay(0) is not enough, it works in other
                // places
                await delay(50)
            }

            this.isInitialCommitPerformed = false
            this.isLoadingInlineData = true

            if (globalThis.DEBUG) {
                console.log(`%cInitializing project`, 'font-weight:bold;color:darkgreen;text-transform:uppercase;margin-top: 2em')
                console.time('Time to visible')
                console.time('Populating project')
            }

            // Prevent records from entering replica on reload, schedule delayed entering / calculation
            if (this.delayCalculation && !this.delayedCalculationPromise && !this.usingSyncDataOnLoad()) {
                this.scheduleDelayedCalculation()
            }

            if (data.calendarsData) {
                this.repopulateStore(calendarManagerStore)

                calendarManagerStore.data    = data.calendarsData
            }
            if (data.eventsData || data.tasksData) {
                this.repopulateStore(eventStore)

                eventStore.data              = data.eventsData || data.tasksData
            }
            if (data.dependenciesData) {
                this.repopulateStore(dependencyStore)

                dependencyStore.data         = data.dependenciesData
            }
            if (data.resourcesData) {
                this.repopulateStore(resourceStore)

                resourceStore.data           = data.resourcesData
            }
            if (data.assignmentsData) {
                this.repopulateStore(assignmentStore)

                assignmentStore.data         = data.assignmentsData
            }
            if (data.project) {
                //@ts-ignore
                this.applyProjectResponse(data.project)
            }

            if (globalThis.DEBUG) console.timeEnd('Populating project')

            const result = await this.commitLoad()

            this.isLoadingInlineData = false

            return result
        }


        // Called from scheduleDelayedCalculation() & setAssignmentStore to set up indices used to look events and
        // resources up before calculations has finished
        setupTemporaryIndices () {
            const { storage }                   = this.assignmentStore || {}

            // First delayed calculation starts before assignmentStore is created => no storage
            if (storage) {
                // Set up indices to mimic buckets (removed again in below)
                storage.addIndex({property: 'event', unique: false})
                storage.addIndex({property: 'resource', unique: false})
            }
        }


        removeTemporaryIndices () {
            const { storage }                   = this.assignmentStore
            // Indices mimicking buckets are no longer needed now, get rid of them
            storage.removeIndex('event')
            storage.removeIndex('resource')
        }


        async internalDelayCalculation (resolve : Function) {
            const me = this

            me.delayEnteringReplica             = true

            me.setupTemporaryIndices()

            // If listeners are defined on project, we have to wait until after construction before they can
            // catch any events
            await delay(0)

            if (me.isDestroyed) {
                resolve()
                return
            }

            me.trigger('delayCalculationStart')

            // In delayCalculation mode, we trigger refresh before calculating to let UI draw early
            me.trigger('refresh', { isCalculated: false })

            await delay(0)

            if (me.isDestroyed) {
                resolve()
                return
            }

            me.delayEnteringReplica             = false

            // After triggering (and thus drawing) we let everything enter the graph, either by repopulating
            // a new replica or by entering the existing (or a new from scratch the first time)
            if (me.isRepopulatingStores) {
                // @ts-ignore
                me.repopulateReplica.now()
            }
            else {
                // this triggers the re-application of the `responseData.project`
                // to the project instance, which might be delayed due to the
                // `delayEnteringReplica` flag
                me.trigger('recordsUnlinked')
                me.enterReplica(true)
            }

            const result                        = await me.replica.commitAsync()

            if (me.isDestroyed) {
                resolve()
                return
            }

            resolve(result)

            me.delayedCalculationPromise        = null

            me.trigger('delayCalculationEnd')

            me.removeTemporaryIndices()
        }

        // NOTE: NEVER AWAIT FOR THIS METHOD inside `queue` method call chain. Or it will create a chain of promises
        // which depends on itself and never resolves
        scheduleDelayedCalculation () {
            if (this.delayedCalculationPromise) {
                return this.delayedCalculationPromise
            }

            if (this.delayCalculation !== false) {
                return this.delayedCalculationPromise     = new Promise(resolve =>
                    // Cannot use async code directly in Promise executor, because it hides errors
                    this.internalDelayCalculation(resolve).then()
                )
            }
        }


        async commitLoad () : Promise<CommitResult> {
            // if (globalThis.DEBUG) console.time('Initial propagation')

            const result                 = await this.commitAsync()

            // Might have been destroyed during the async operation above
            if (!this.isDestroyed) this.trigger('load')

            return result
        }

        stmClass : typeof StateTrackingManager

        initializeStm () : void {
            const stmClass = this.stmClass || StateTrackingManager

            // @ts-ignore
            if (!(this.stm instanceof StateTrackingManager)) this.setStm(stmClass.new({ disabled : true }, this.stm))

            if (this.resetUndoRedoQueuesAfterLoad) {
                this.ion({
                    load    : this.resetStmQueue,
                    thisObj : this
                })
            }

            this.ion({
                beforeCommit    : this.onCommitInitialization,
                commitFinalized : this.onCommitFinalization,
                commitRejected  : this.onCommitRejection,
                thisObj         : this
            })
        }


        removeRejectedRecordsAdd ({ transactionResult, silenceCommit } : { transactionResult : TransactionCommitResult, silenceCommit : boolean }) : void {
            const recordsToDrop = new Map<ChronoPartOfProjectStoreMixin, Set<ChronoModelMixin>>()

            for (const quark of transactionResult.entries.values()) {
                const identifier = quark.identifier as ChronoModelFieldIdentifier & EntityIdentifier
                const { field }  = identifier

                if (quark.isShadow() || !identifier[IsChronoModelSymbol] || field instanceof ModelBucketField) continue

                const record : ChronoModelMixin             = identifier.self
                const store : ChronoPartOfProjectStoreMixin = record.firstStore as ChronoPartOfProjectStoreMixin

                // collect records w/ atoms not having a previous value
                if (store && !quark.previous && !transactionResult.transaction.getLatestStableEntryFor(record.$$)?.previous)
                {
                    if (!recordsToDrop.has(store)) {
                        recordsToDrop.set(store, new Set([ record ]))
                    }
                    else if (!recordsToDrop.get(store).has(record)) {
                        recordsToDrop.get(store).add(record)
                    }
                }
            }

            // @ts-ignore
            this.suspendChangeTracking?.()

            const stores    = Array.from(recordsToDrop.keys()).sort((a, b) => a.removalOrder - b.removalOrder)

            // remove the collected records
            stores.forEach(store => store.remove(recordsToDrop.get(store)))

            // @ts-ignore
            this.resumeChangeTracking?.(silenceCommit)

            if (silenceCommit) {
                this.eventStore.acceptChanges()
                this.dependencyStore.acceptChanges()
                this.resourceStore.acceptChanges()
                this.assignmentStore.acceptChanges()
                this.calendarManagerStore.acceptChanges()
            }
        }


        onCommitRejection (event : { transactionResult : TransactionCommitResult, silenceCommit : boolean }) : void {
            // if STM is disabled we're trying to revert changes w/o it
            if (this._stmDisabled) {

                this.replica.isWritingPreviousData = true
                this.isRestoringData = true
                this.removeRejectedRecordsAdd(event)
                this.isRestoringData = false
                this.replica.isWritingPreviousData = false
            }
            // reject last transaction STM has
            else {
                this.rejectStmTransaction()
            }
        }


        // https://github.com/bryntum/support/issues/1270
        onCommitInitialization () {
            const { stm }       = this

            this._stmDisabled = stm.disabled

            if (stm.isRecording && stm.autoRecord) {
                this._stmAutoRecord = true
                // If auto recording is enabled when we are entering a commit, we need to move autoRecording
                // state to Recording in order to make sure all changes from the project will become a single
                // transaction
                stm.autoRecord = false
            }
        }


        onCommitFinalization () {
            if (this._stmAutoRecord) {
                // This will restore autoRecording state and trigger timer to stop transaction after a delay
                this.stm.autoRecord = true
                this._stmAutoRecord = false
            }
        }


        onSTMRestoringStart ({ source : stm } : { source : StateTrackingManager }) {
            if (this.replica) this.replica.isWritingPreviousData = true
        }


        // Propagate on undo/redo
        async onSTMRestoringStop ({ source }) {
            if (this.replica) this.replica.isWritingPreviousData = false

            const stm =  source as StateTrackingManager

            // Disable STM meanwhile to not pick it up as a new STM transaction
            stm.disable()

            await this.commitAsync()

            if (!this.isDestroyed) {
                stm.enable()
                this.trigger('stateRestoringDone')
            }
        }

        //region Repopulate

        // defers the call to given function with given arguments until the `repopulateReplica` event
        // (if replica is scheduled for repopulation, otherwise calls immediately)
        // between the multiple defers with the same `deferId`, only the latest one is called
        deferUntilRepopulationIfNeeded (deferId : string, func : AnyFunction, args : any[]) {
            if (this.isRepopulatingStores) {
                this.detachListeners(deferId)
                this.ion({
                    name                : deferId,
                    repopulateReplica   : {
                        fn : async () => {
                            await this.commitAsync()

                            if (!this.isDestroyed) {
                                func(...args)
                            }
                        },
                        once : true
                    }
                })
            }
            else {
                func(...args)
            }
        }


        get isRepopulatingStores () : boolean {
            return Boolean(this.repopulateStores?.size)
        }


        // Remember which stores are being repopulated, they don't have to care about un-joining the graph later
        repopulateStore (store : AbstractPartOfProjectStoreMixin) {
            const me = this

            if (me.repopulateOnDataset && store.allCount && !store.syncDataOnLoad) {
                me.replica?.activeTransaction.stop()

                if (!me.repopulateStores) me.repopulateStores = new Set<AbstractPartOfProjectStoreMixin>()

                me.repopulateStores.add(store)

                // Trigger buffered repopulate of replica
                me.repopulateReplica()
            }
        }


        // Creates a new replica, populating it with data from the stores
        repopulateReplica () {
            const me = this

            // Will repopulate as part of scheduled delayed calculations
            if (me.delayEnteringReplica) {
                return
            }

            const {
                calendarManagerStore,
                eventStore,
                dependencyStore,
                assignmentStore,
                resourceStore,
                replica : oldReplica
            } = me

            if (oldReplica) {
                // Unlink all old records that are going to be re-entered into new replica
                me.unlinkStoreRecords(calendarManagerStore, eventStore, dependencyStore, resourceStore, assignmentStore)
                me.unlinkRecord(me)
                me.unlinkRecord(me.defaultCalendar)

                me.trigger('recordsUnlinked')

                oldReplica.clear()
            } else {
                me.trigger('recordsUnlinked')
            }

            const replica = me.replica = me.createReplica()

            // Now enter all new and old reused records into the new replica
            replica.addEntity(me)
            replica.addEntity(me.defaultCalendar)

            me.joinStoreRecords(calendarManagerStore, true)
            me.joinStoreRecords(eventStore, true)
            me.joinStoreRecords(dependencyStore, true)
            me.joinStoreRecords(resourceStore, true)
            me.joinStoreRecords(assignmentStore, true)

            me.repopulateStores.clear()

            me.trigger('repopulateReplica')
        }


        // If there is a commit when we are supposed to replace the replica, we hijack that and commit the new replica
        beforeCommitAsync () : Promise<CommitResult> {
            //@ts-ignore
            if (this.repopulateReplica.isPending && !this.isDelayingCalculation) {
                //@ts-ignore
                this.repopulateReplica.now()

                return this.replica.commitAsync()
            }

            return null
        }


        // Unlinks a single record from the graph, writing back identifiers values from the graph to DATA to allow them
        // to enter another replica
        unlinkRecord (record : ChronoPartOfProjectModelMixin) {
            // Might not have entered replica yet when using delayed calculation
            if (record?.graph) {
                const { activeTransaction } = this.replica
                const { $ }                 = record
                const keys                  = Object.keys($)

                // Write current values to identifier.DATA, to have correct value entering new replica later
                for (let i = 0; i < keys.length; i++) {
                    const key           = keys[ i ]
                    const identifier    = $[ key ]

                    const entry         = activeTransaction.getLatestEntryFor(identifier)

                    if (entry) {
                        let value       = entry.getValue()

                        if (value === undefined) value = entry.proposedValue

                        if (value !== undefined) {
                            identifier.DATA = identifier.field instanceof ModelReferenceField
                                ? value?.id ?? value
                                : value
                        }
                    }
                }

                // Cut the link, to enable joining another replica
                record.graph = null
            }
        }


        // Unlinks all records from a store, unless the store has been repopulated
        unlinkStoreRecords (...stores : ChronoPartOfProjectStoreMixin[]) {
            stores.forEach(store => {
                // Unlink records only in stores that are not repopulated
                // or if store has syncDataOnLoad (in this case records stay in the store so need to unlink them)
                if (!this.repopulateStores.has(store) || store.syncDataOnLoad) {
                    store.traverse((record : ChronoPartOfProjectModelMixin) => {
                        this.unlinkRecord(record)
                    }, false, false, {
                        // Must pass includeFilteredOutRecords and includeCollapsedGroupRecords as true
                        // so that we work on full, unfiltered dataset
                        includeFilteredOutRecords: true,
                        includeCollapsedGroupRecords: true
                    })
                }
            })
        }


        //endregion


        getGraph () : EngineReplica {
            return this.replica
        }


        // keep this private
        async addEvents (events : InstanceType<this[ 'eventModelClass' ]>[]) : Promise<CommitResult> {
            this.eventStore.add(events)

            return this.commitAsync()
        }


        // keep this private
        async addEvent (event : InstanceType<this[ 'eventModelClass' ]>) : Promise<CommitResult> {
            this.eventStore.add(event)

            return this.commitAsync()
        }


        // keep this private
        includeEvent (event : InstanceType<this[ 'eventModelClass' ]>) {
            this.eventStore.add(event)
        }


        // keep this private
        async removeEvents (events : InstanceType<this[ 'eventModelClass' ]>[]) : Promise<CommitResult> {
            this.eventStore.remove(events)

            return this.commitAsync()
        }


        // keep this private
        excludeEvent (event : InstanceType<this[ 'eventModelClass' ]>) {
            this.eventStore.remove(event)
        }


        // keep this private
        async removeEvent (event : InstanceType<this[ 'eventModelClass' ]>) : Promise<CommitResult> {
            this.eventStore.remove(event)

            return this.commitAsync()
        }


        getStm () : StateTrackingManager {
            return this.stm
        }


        setStm (stm : StateTrackingManager) : void {
            this.stm = stm

            this.stm.ion({
                restoringStart : this.onSTMRestoringStart,
                restoringStop : this.onSTMRestoringStop,
                thisObj : this
            })
        }


        calculateProject () : this {
            return this
        }


        * calculateEffectiveDataOrVisualCalendar (purpose : 'data' | 'visual') : CalculationIterator<BaseCalendarMixin> {
            let calendar : BaseCalendarMixin  = yield this.$.calendar

            if (calendar) {
                // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update
                yield calendar.$.version
            }
            else {
                calendar    = this.defaultCalendar
            }

            return calendar
        }


        joinStoreRecords (store : ChronoPartOfProjectStoreMixin, skipRoot = false) {
            const fn = (record : ChronoPartOfProjectModelMixin) => {
                record.setProject(this)
                record.joinProject()
            }

            // Both iteration methods must pass includeFilteredOutRecords as true
            // so that we work on full, unfiltered dataset
            if (store.rootNode) {
                store.rootNode.traverse(fn, skipRoot, true)
            } else {
                store.forEach(fn, null, {
                    includeFilteredOutRecords    : true,
                    includeCollapsedGroupRecords : true
                })
            }
        }


        unjoinStoreRecords (store : ChronoPartOfProjectStoreMixin) {
            const fn = (record : ChronoPartOfProjectModelMixin) => {
                record.leaveProject()
                record.setProject(this)
            }

            // Both iteration methods must pass includeFilteredOutRecords as true
            // so that we work on full, unfiltered dataset
            if (store.rootNode) {
                (store.rootNode as ChronoPartOfProjectModelMixin).traverse(node => {
                    // do not unjoin/leave project for the root node, which is the project itself
                    if (node !== store.rootNode) fn(node)
                }, false, true)
            } else {
                store.forEach(fn, null, {
                    includeFilteredOutRecords    : true,
                    includeCollapsedGroupRecords : true
                })
            }
        }


        /**
         * This method sets the event store instance for the project.
         * @param store
         */
        setEventStore (store : ChronoEventStoreMixin) {
            const oldEventStore = this.eventStore

            if (oldEventStore && this.stm.hasStore(oldEventStore)) {
                this.stm.removeStore(oldEventStore)
                this.unjoinStoreRecords(oldEventStore)
                this.detachStore(oldEventStore)

                const assignmentsForRemoval = oldEventStore.assignmentsForRemoval

                // remap the assignment
                assignmentsForRemoval.forEach(assignment => {
                    const oldEvent  = assignment.event

                    if (oldEvent) {
                        const newEvent  = store.getById(oldEvent.id)

                        if (newEvent) {
                            assignment.event    = newEvent
                            // keep the assignment
                            assignmentsForRemoval.delete(assignment)
                        }
                    }
                })

                oldEventStore.afterEventRemoval()
            }

            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.eventStoreClass

                this.eventStore = new storeClass(ObjectHelper.assign({
                    modelClass  : this.eventModelClass,

                    project     : this,

                    stm         : this.stm
                }, store || {}))
            }
            else {
                this.eventStore = store

                store.setProject(this)
                this.stm.addStore(store)

                // we've been given an event store from the outside
                // need to change its root node to be the project
                if (store.tree && store.rootNode !== this) {
                    this.appendChild(store.rootNode.children || [])
                    // Assigning a new root will make all children join store
                    store.rootNode = this
                }

                else {
                    this.joinStoreRecords(store)
                }
            }

            this.attachStore(this.eventStore)

            this.trigger('eventStoreChange', { store : this.eventStore })
        }


        /**
         * This method sets the dependency store instance for the project.
         * @param store
         */
        setDependencyStore (store : ChronoDependencyStoreMixin) {
            const oldDependencyStore = this.dependencyStore

            if (oldDependencyStore && this.stm.hasStore(oldDependencyStore)) {
                this.stm.removeStore(oldDependencyStore)
                this.detachStore(oldDependencyStore)
            }

            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.dependencyStoreClass

                this.dependencyStore = new storeClass(ObjectHelper.assign({
                    modelClass  : this.dependencyModelClass,

                    project     : this,

                    stm         : this.stm
                }, store || {}))
            }
            else {
                this.dependencyStore = store

                store.setProject(this)
                this.stm.addStore(store)
                this.joinStoreRecords(store)
            }

            this.attachStore(this.dependencyStore)

            this.trigger('dependencyStoreChange', { store : this.dependencyStore })
        }


        /**
         * This method sets the resource store instance for the project.
         * @param store
         */
        setResourceStore (store : ChronoResourceStoreMixin) {
            const oldResourceStore = this.resourceStore

            if (oldResourceStore && this.stm.hasStore(oldResourceStore)) {
                this.stm.removeStore(oldResourceStore)
                this.unjoinStoreRecords(oldResourceStore)
                this.detachStore(oldResourceStore)

                const assignmentsForRemoval = oldResourceStore.assignmentsForRemoval

                // remap the assignment
                assignmentsForRemoval.forEach(assignment => {
                    const oldResource  = assignment.resource

                    if (oldResource) {
                        const newResource  = store.getById(oldResource.id)

                        if (newResource) {
                            assignment.resource    = newResource
                            // keep the assignment
                            assignmentsForRemoval.delete(assignment)
                        }
                    }
                })

                oldResourceStore.afterResourceRemoval()
            }

            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.resourceStoreClass

                this.resourceStore = new storeClass(ObjectHelper.assign({
                    modelClass  : this.resourceModelClass,

                    project     : this,

                    stm     : this.stm
                }, store || {}))
            }
            else {
                this.resourceStore = store

                store.setProject(this)
                this.stm.addStore(store)
                this.joinStoreRecords(store)
            }

            this.attachStore(this.resourceStore)

            this.trigger('resourceStoreChange', { store : this.resourceStore })
        }


        /**
         * This method sets the assignment store instance for the project.
         * @param store
         */
        setAssignmentStore (store : ChronoAssignmentStoreMixin) {
            const oldAssignmentStore = this.assignmentStore

            if (oldAssignmentStore && this.stm.hasStore(oldAssignmentStore)) {
                this.stm.removeStore(oldAssignmentStore)
                this.unjoinStoreRecords(oldAssignmentStore)
                this.detachStore(oldAssignmentStore)
            }

            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.assignmentStoreClass

                this.assignmentStore = new storeClass(ObjectHelper.assign({

                    modelClass  : this.assignmentModelClass,

                    project     : this,

                    stm         : this.stm
                }, store || {}))
            }
            else {
                this.assignmentStore = store

                store.setProject(this)
                this.stm.addStore(store)
                this.joinStoreRecords(store)
            }

            this.isDelayingCalculation && this.setupTemporaryIndices()

            this.attachStore(this.assignmentStore)

            this.trigger('assignmentStoreChange', { store : this.assignmentStore })
        }


        /**
         * This method sets the calendar manager store instance for the project.
         * @param store
         */
        setCalendarManagerStore (store : ChronoCalendarManagerStoreMixin) {
            const oldCalendarManagerStore = this.calendarManagerStore

            if (oldCalendarManagerStore && this.stm.hasStore(oldCalendarManagerStore)) {
                this.stm.removeStore(oldCalendarManagerStore)
                this.detachStore(oldCalendarManagerStore)
            }

            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.calendarManagerStoreClass

                this.calendarManagerStore = new storeClass(ObjectHelper.assign({

                    modelClass  : this.calendarModelClass,

                    project     : this,

                    stm         : this.stm
                }, store || {}))
            }
            else {
                this.calendarManagerStore = store

                if (store) {
                    store.setProject(this)
                    this.stm.addStore(store)
                    this.joinStoreRecords(store)
                }
            }

            this.attachStore(this.calendarManagerStore)

            this.trigger('calendarManagerStoreChange', { store : this.calendarManagerStore })
        }


        // this does not account for possible scheduling conflicts
        async isValidDependency (...args) : Promise<boolean> {
            return true
        }


        rejectStmTransaction (stm? : StateTrackingManager) : void {
            stm     = stm || this.stm

            if (stm.transaction) {
                if (stm.transaction.length) {

                    stm.forEachStore(s => s.beginBatch())

                    stm.rejectTransaction()

                    stm.forEachStore(s => s.endBatch())
                }
                else {
                    stm.stopTransaction()
                }
            }
        }

        /**
         * Tries to calculate project with changes. If project does not calculate, changes are reverted.
         * @param changerFn
         * @internal
         * @on-queue
         */
        async tryPropagateWithChanges (changerFn : Function) : Promise<boolean> {
            const
                stm                                 = this.stm,
                // remember STM initial settings
                stmInitiallyDisabled : boolean      = stm.disabled,
                stmInitiallyAutoRecord : boolean    = stm.autoRecord

            return this.queue(async () => {
                // if STM is disabled we turn it on, so we could revert changes later
                if (stmInitiallyDisabled) {
                    stm.enable()
                }
                // if it's enabled
                else {
                    // if auto-recording is enabled - disable it
                    if (stmInitiallyAutoRecord) {
                        stm.autoRecord = false
                    }

                    // stop the current transaction to not mess it
                    if (stm.isRecording) {
                        stm.stopTransaction()
                    }
                }

                // start a new transaction
                stm.startTransaction()

                // In case anything in, or called by the changerFn attempts to propagate.
                // We must only propagate after the changes have been made.
                // this.suspendPropagate()

                changerFn()

                // Resume propagation, but do *not* propagate if any propagate calls were attempted during suspension.
                // this.resumePropagate(false)

                let result = true

                try {
                    const commitResult = await this.commitAsync()

                    // setting "result" to false if the propagation was rejected
                    result  = !commitResult.rejectedWith

                } catch (e) {
                    // rethrow non-cycle exception
                    if (!/cycle/i.test(e)) throw e

                    result      = false
                }

                // if the transaction succeed
                if (result) {
                    stm.stopTransaction()

                    // if STM is not used - reset its queue
                    if (stmInitiallyDisabled) {
                        stm.resetQueue()
                    }
                }
                // reject the failed transaction changes
                else {
                    this.replica.reject()
                    this.rejectStmTransaction(stm)
                }

                // restore STM settings
                stm.disabled = stmInitiallyDisabled
                stm.autoRecord = stmInitiallyAutoRecord

                return result
            })
        }

        /**
         * Use this method to organize project changes into transactions. Every queue call will create a sequential
         * promise which cannot be interrupted by other queued functions. You can use async functions and await for
         * any promises (including commitAsync) with one exception - you cannot await for other queued calls and any
         * other function/promise which awaits queued function. Otherwise, an unresolvable chain of promises may be
         * created.
         *
         * **NOTE**: Functions which call this method inside are marked with `on-queue` tag.
         *
         * Examples:
         * ```javascript
         * // Invalid queue call which hangs promise chain
         * project.queue(async () => {
         *     const event = project.getEventStore().getById(1);
         *     await project.queue(() => {
         *         event.duration = 2;
         *         return project.commitAsync();
         *     })
         * })
         *
         * // Valid queue call
         * project.queue(() => {
         *     const event = project.getEventStore().getById(1);
         *
         *     // Consequent queue call will be chained after the current function in the next microtask.
         *     project.queue(() => {
         *         event.duration = 2;
         *         return project.commitAsync();
         *     })
         *
         *     // Event duration is not yet changed - this condition is true
         *     if (event.duration !== 2) { }
         * })
         * ```
         *
         *
         * @param {Function} fn
         * @param {Function} handleReject
         * @internal
         * @on-queue
         */
        queue (fn : () => any, handleReject? : (error : Error | any) => any) : Promise<any> {
            const me = this

            // Use named function for more informative reports in profiler
            return me._queue.queue(function runQueueStep () {
                // Design was changed to allow transfer of control from one feature to another (drag create to task edit)
                // there is a single transaction being recorded. Therefore, queue no longer stops the current transaction
                // // If we're in the auto recording state, stop transaction before running passed function
                // // Project may have been destroyed, use optional chaining to skip STM logic in that case
                // if (me.stm?.isRecording && me.stm.autoRecord) {
                //     me.stm.stopTransaction()
                // }

                return fn()
            }, handleReject)
        }

        isEngineReady () : boolean {
            const { replica } = this

            return this.delayEnteringReplica
                || (
                    !this.isRepopulatingStores
                    && (
                        replica
                            ? !(replica.dirty && (replica.hasPendingAutoCommit() || replica.isCommitting))
                            : true
                    )
                )
        }

        // Needed to separate configs from data, for tests to pass. Normally handled in ProjectModel outside of engine
        static get defaultConfig () : object {
            return {
                assignmentsData      : null,
                calendarsData        : null,
                dependenciesData     : null,
                eventsData           : null,
                resourcesData        : null,

                // need to distinguish the stores from fields
                // https://bryntum.com/products/gantt/examples/advanced/
                // bryntum.gantt.ObjectHelper.isEqual({}, new bryntum.gantt.Store()) // true
                eventStore           : null,
                resourceStore        : null,
                assignmentStore      : null,
                dependencyStore      : null,
                calendarManagerStore : null,

                eventModelClass      : null,
                resourceModelClass   : null,
                assignmentModelClass : null,
                dependencyModelClass : null,
                calendarModelClass   : null,

                repopulateOnDataset  : true
            }
        }

        static get delayable () : object {
            return {
                repopulateReplica : 10
            }
        }

        static applyConfigs : boolean = true
    }

    return SchedulerBasicProjectMixin
}){}
