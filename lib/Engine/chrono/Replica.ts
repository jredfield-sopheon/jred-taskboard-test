import { ProgressNotificationEffect, Reject, RejectEffect, RejectSymbol } from "../../ChronoGraph/chrono/Effect.js"
import { CommitArguments, CommitResult } from "../../ChronoGraph/chrono/Graph.js"
import { Identifier } from "../../ChronoGraph/chrono/Identifier.js"
import { Quark, TombStone } from "../../ChronoGraph/chrono/Quark.js"
import { Revision } from "../../ChronoGraph/chrono/Revision.js"
import { Transaction, TransactionCommitResult } from "../../ChronoGraph/chrono/Transaction.js"
import { ComputationCycle } from "../../ChronoGraph/chrono/TransactionCycleDetectionWalkContext.js"
import { AnyConstructor, Mixin } from "../../ChronoGraph/class/BetterMixin.js"
import { Context } from "../../ChronoGraph/primitives/Calculation.js"
import { EntityIdentifier, FieldIdentifier } from "../../ChronoGraph/replica/Identifier.js"
import { Replica } from "../../ChronoGraph/replica/Replica.js"
import { prototypeValue, delay } from "../../ChronoGraph/util/Helpers.js"
import Base from "../../Core/Base.js"
import Store from "../../Core/data/Store.js"
import Localizable from "../../Core/localization/Localizable.js"
import { EmptyCalendarEffect, EmptyCalendarSymbol } from "../quark/model/scheduler_basic/BaseCalendarMixin.js"
import { BaseDependencyMixin } from "../quark/model/scheduler_basic/BaseDependencyMixin.js"
import { BaseEventMixin } from "../quark/model/scheduler_basic/BaseEventMixin.js"
import { ChronoAbstractProjectMixin } from "../quark/model/scheduler_basic/ChronoAbstractProjectMixin.js"
import { format } from "../util/Functions.js"
import { ChronoModelMixin } from "./ChronoModelMixin.js"
import { ConflictEffect, ConflictSymbol } from "./Conflict.js"
import { ChronoModelFieldIdentifier, IsChronoModelSymbol, ModelField, ModelBucketField } from "./ModelFieldAtom.js"
import {
    EffectResolutionResult,
    SchedulingIssueEffect,
    SchedulingIssueEffectResolution
} from "./SchedulingIssueEffect.js"

export const CycleSymbol    = Symbol('CycleSymbol')

//---------------------------------------------------------------------------------------------------------------------
export class EngineRevision extends Revision {
    failedResolutionReferences      : Map<Identifier, any> = new Map()
}


//---------------------------------------------------------------------------------------------------------------------
export class EngineTransaction extends Transaction {
    graph                           : EngineReplica

    candidateClass                  : typeof Revision   = EngineRevision

    baseRevision                    : EngineRevision
    candidate                       : EngineRevision


    initialize (props) {
        // Emit progress earlier and more frequently when using delayCalculation mode, to not lock up UI as much and to
        // have smoother progress bar updates.
        // Transactions created to validate deps does not reference project
        if (props.graph.project?.delayCalculation) {
            props.startProgressNotificationsAfterMs          = 0
            props.emitProgressNotificationsEveryMs           = 100
        }

        super.initialize(props)

        this.candidate.failedResolutionReferences            = new Map(this.baseRevision.failedResolutionReferences)
    }


    addIdentifier (identifier : Identifier, proposedValue? : any, ...args) : Quark {
        if (this.candidate.failedResolutionReferences.size) {
            this.candidate.failedResolutionReferences.forEach((failedResolutionValue, identifier : Identifier) => {
                this.write(identifier, failedResolutionValue)
            })

            this.candidate.failedResolutionReferences.clear()
        }

        return super.addIdentifier(identifier, proposedValue, ...args)
    }

}


//---------------------------------------------------------------------------------------------------------------------
/**
 * An extension of [[Replica]], specialized for interaction with [[AbstractProjectMixin|project]].
 */
export class EngineReplica extends Mixin(
    [ Replica ],
    (base : AnyConstructor<Replica, typeof Replica>) => {

    const superProto : InstanceType<typeof base> = base.prototype

    class EngineReplica extends base {
        baseRevision            : Revision      = EngineRevision.new()

        transactionClass        : typeof Transaction = EngineTransaction

        project                 : ChronoAbstractProjectMixin

        autoCommitMode          : 'sync' | 'async'  = 'async'

        onComputationCycle      : 'throw' | 'warn' | 'reject' | 'ignore' | 'effect' = 'effect'

        cycleEffectClass        : typeof CycleEffect = CycleEffect

        _onComputationCycle     : this['onComputationCycle']

        silenceInitialCommit    : boolean = true

        ignoreInitialCommitComputationCycles : boolean = false


        get dirty () : boolean {
            const activeTransaction         = this.activeTransaction

            return activeTransaction.entries.size > 0 && (activeTransaction.hasVariableEntry || activeTransaction.hasEntryWithProposedValue)
        }


        onPropagationProgressNotification (notification : ProgressNotificationEffect) {
            if (this.enableProgressNotifications && this.project) this.project.trigger?.('progress', notification)
        }


        async commitAsync (args? : CommitArguments) : Promise<CommitResult> {
            if (!this.project || this.project.isDestroyed) return

            this.project.trigger('beforeCommit')

            if (this.isInitialCommit && this.ignoreInitialCommitComputationCycles) {
                // backup onComputationCycle value to restore it after the commit
                this._onComputationCycle    = this._onComputationCycle || this.onComputationCycle
                // toggle onComputationCycle to ignore cycles to let the data get into the graph
                this.onComputationCycle     = 'ignore'
            }

            const replacedReplicaResult = this.project.beforeCommitAsync()

            if (replacedReplicaResult) return replacedReplicaResult

            return superProto.commitAsync.call(this, args)
        }


        get isInitialCommit () : boolean {
            // let the project defined which commit is "initial"
            return this.project.isInitialCommit || super.isInitialCommit
        }


        set isInitialCommit (value : boolean) {
            super.isInitialCommit = value
        }


        write<T> (identifier : Identifier<T, Context>, proposedValue : T, ...args : any[]) {
            const fieldName : string    = (identifier as FieldIdentifier).field?.name
            const record                = (identifier as FieldIdentifier).self

            if (fieldName && record) {
                // @ts-ignore
                const beforeHookResult = record.beforeChronoFieldSet?.(fieldName, proposedValue)

                superProto.write.call(this, identifier, proposedValue, ...args)

                // @ts-ignore
                record.afterChronoFieldSet?.(fieldName, proposedValue, beforeHookResult)
            }
            else {
                superProto.write.call(this, identifier, proposedValue, ...args)
            }
        }

        transactionChainEntries = new Set<Quark>()

        async finalizeCommitAsync (transactionResult : TransactionCommitResult) {
            // the `this.project` may be empty for the branch, where we validate the dependency
            // because if asyncness project might be destroyed when we get here
            const { project }                        = this

            if (!project || project.isDestroyed) return

            const { entries, transaction }           = transactionResult
            const autoCommitStores                   = new Set<Store>()

            if (globalThis.DEBUG) console.timeEnd('Time to visible')

            const { isInitialCommit, silenceInitialCommit } = this

            const inTransactionChain = project.finalizeCommitHook(isInitialCommit) === true

            // If finalizeCommitHook leads to a chain of transactions, collect affected quarks here and use them when
            // finalizing the last transaction in the chain
            if (inTransactionChain) {
                for (const quark of entries.values()) {
                    this.transactionChainEntries.add(quark)
                }



                // Bail out to not trigger multiple refreshes etc. for the chain
                return
            }

            // apply changes silently if this is initial commit and "silenceInitialCommit" option is enabled
            const silenceCommit                             = isInitialCommit && silenceInitialCommit

            if (isInitialCommit) {
                project.isInitialCommitPerformed = true

                // restore onComputationCycle back if we toggled it before committing
                if (this.ignoreInitialCommitComputationCycles) this.onComputationCycle = this._onComputationCycle
            }

            project.isWritingData = true
            project.hasLoadedDataToCommit = false

            // Let progress listeners know we are finalizing
            if (this.enableProgressNotifications) {
                project.trigger('progress', {
                    total     : entries.size,
                    remaining : 0,
                    phase     : 'finalizing'
                })
            }

            // need to reject the data before the `refresh` event, otherwise
            // the UI will try to refresh the stale data
            if (transaction.rejectedWith) {
                project.trigger('commitRejected', { transactionResult, isInitialCommit, silenceCommit })
            }

            // It is triggered earlier because on that stage engine is ready and UI can be drawn.
            // dataReady happens up to like a second later in big datasets. We do not want to wait that long
            project.trigger('refresh', { isInitialCommit, isCalculated : true })

            // console.timeEnd('rendered')


            await delay(0)

            if (!project.isDestroyed) {
                if (!transactionResult.transaction.rejectedWith) {
                    // @ts-ignore
                    project.suspendChangeTracking?.()

                    if (globalThis.DEBUG) console.time('Finalize propagation')

                    const records = new Set<ChronoModelMixin>()

                    // Use quarks from transaction chain if we are at the end of it, or from this transaction
                    // if not part of chain
                    const quarks = this.transactionChainEntries.size ? this.transactionChainEntries : entries.values()

                    for (const quark of quarks) {
                        const identifier = quark.identifier as ChronoModelFieldIdentifier & EntityIdentifier
                        const quarkValue = quark.getValue()
                        const { field }  = identifier

                        if (quark.isShadow() || !identifier[IsChronoModelSymbol] || quarkValue === TombStone || field instanceof ModelBucketField || (field as ModelField).ignore) continue

                        const record : ChronoModelMixin   = identifier.self
                        const store : Store               = record.firstStore

                        // Begin batch once
                        if (!records.has(record)) {
                            record.beginBatch(true)
                            records.add(record)
                        }

                        // Avoid committing changes during refresh, commit below instead. Suspend once
                        if (store?.autoCommit && !autoCommitStores.has(store)) {
                            store.suspendAutoCommit()
                            autoCommitStores.add(store)
                        }

                        // Cheapest possible set
                        // @ts-ignore
                        record.meta.batchChanges[field.name] = quarkValue
                    }

                    let prevented = false
                    for (const record of records) {
                       if (!record.triggerBeforeUpdate({ ...record.meta.batchChanges })) {
                           prevented = true
                           break
                       }
                    }

                    if (prevented) {
                        for (const record of records) {
                            record.cancelBatch()
                        }
                        transactionResult.transaction.reject()

                        project.trigger('commitRejected', { transactionResult, isInitialCommit, silenceCommit })
                        project.trigger('refresh', { isInitialCommit, isCalculated : true })
                    }
                    else {
                        for (const record of records) {
                            //@ts-ignore
                            record.ignoreBag = silenceCommit || project.ignoreRecordChanges
                            record.generation++
                            record.endBatch(silenceCommit, true, true)
                            //@ts-ignore
                            record.ignoreBag = false
                        }
                    }

                    project.ignoreRecordChanges = false

                    if (globalThis.DEBUG) console.timeEnd('Finalize propagation')

                    // Calendar expects flag to be cleared before dataReady, was mismatch with engine stub
                    project.isWritingData = false

                    if (!prevented) {
                        project.trigger('dataReady', { records, isInitialCommit })
                    }

                    // @ts-ignore
                    project.resumeChangeTracking?.(silenceCommit)

                    autoCommitStores.forEach(store => store.resumeAutoCommit())

                    // clear all changes of the first graph commit
                    if (silenceCommit) {
                        project.eventStore.acceptChanges()
                        project.dependencyStore.acceptChanges()
                        project.resourceStore.acceptChanges()
                        project.assignmentStore.acceptChanges()
                        project.calendarManagerStore.acceptChanges()
                        project.acceptChanges()
                    }
                }
                // transaction rejected
                else {
                    project.isWritingData = false
                }

                this.transactionChainEntries.clear()

                project.trigger('commitFinalized', { isInitialCommit, transactionResult })
            }
        }


        * onComputationCycleHandler (cycle : ComputationCycle) : Generator<any, IteratorResult<any>> {
            if (this.onComputationCycle === 'effect') {
                const effect    = this.project.cycleEffectClass.new({ cycle })

                if ((yield effect) === EffectResolutionResult.Cancel) {
                    yield Reject(effect)
                }
            }
            else {
                return yield* super.onComputationCycleHandler(cycle)
            }
        }


        onComputationCycleHandlerSync (cycle : ComputationCycle, transaction : Transaction) : IteratorResult<any> {
            if (this.onComputationCycle === 'effect') {
                const effect    = this.project.cycleEffectClass.new({ cycle })

                // `entry.cleanupCalculation()` is not called after throwing
                // the rest of the processing happens in the `runGeneratorAsyncWithEffect` in `chronograph/src/primitives/Calculation.ts`
                throw effect
            }
            else {
                return super.onComputationCycleHandlerSync(cycle, transaction)
            }
        }


        async [CycleSymbol] (effect : CycleEffect, transaction : Transaction) {
            // delegate to project
            return this.project.onCycleSchedulingIssue(effect, transaction)
        }

        async [EmptyCalendarSymbol] (effect : EmptyCalendarEffect, transaction : Transaction) {
            transaction.walkContext.startNewEpoch()
            // delegate to project
            return this.project.onEmptyCalendarSchedulingIssue(effect, transaction)
        }

        async [ConflictSymbol] (effect : ConflictEffect, transaction : Transaction) {
            transaction.walkContext.startNewEpoch()
            // delegate to project
            return this.project.onConflictSchedulingIssue(effect, transaction)
        }


        [RejectSymbol] (effect : RejectEffect<any>, transaction : Transaction) : any {
            return super[RejectSymbol](effect, transaction)
        }

    }

    return EngineReplica

}){}


/**
 * A cycle resolution removing one of the [[getDependencies|related dependencies]].
 * The dependency instance should be passed to [[resolve]] method:
 *
 * ```typescript
 * // this call will remove dependencyRecord
 * removalResolution.resolve(dependencyRecord)
 * ```
 */
 export class RemoveDependencyCycleEffectResolution extends Localizable(SchedulingIssueEffectResolution) {

    static get $name () {
        return 'RemoveDependencyCycleEffectResolution'
    }

    getDescription () : string {
        return this.L('L{descriptionTpl}')
    }

    resolve (dependency : BaseDependencyMixin) {
        dependency.remove()
    }
}

/**
 * Class providing a human readable localized description ofr a [[CycleEffect]] instance.
 */
export class CycleEffectDescription extends Localizable(Base) {

    static get $name () {
        return 'CycleEffectDescription'
    }

    static getDescription (effect : CycleEffect) : string {
        return format(this.L('L{descriptionTpl}'), this.getShortDescription(effect))
    }

    static getShortDescription (effect : CycleEffect) : string {
        const events    = effect.getEvents().slice()

        events.push(events[0])

        return '"' + events.map(event => event.name || '#' + event.id).join('" -> "') + '"'
    }

}

/**
 * Class implementing a special effect signalizing of a computation cycle.
 * The class suggests the only [[getResolutions|resolution]] option - removing one of the
 * [[getDependencies|related dependencies]].
 */
export class CycleEffect extends SchedulingIssueEffect<any> {

    @prototypeValue('cycle')
    type            : string

    handler         : symbol    = CycleSymbol

    cycle           : ComputationCycle

    @prototypeValue(CycleEffectDescription)
    _descriptionBuilderClass

    @prototypeValue(RemoveDependencyCycleEffectResolution)
    removeDependencyCycleEffectResolutionClass : typeof RemoveDependencyCycleEffectResolution

    _events         : BaseEventMixin[]

    _dependencies   : BaseDependencyMixin[]

    /**
     * Returns list of events building the cycle.
     */
    getEvents () : BaseEventMixin[] {
        if (!this._events) {
            const result : Set<BaseEventMixin> = new Set()

            this.cycle.cycle.forEach(({ context }) => result.add(context))

            this._events = [...result]
        }

        return this._events
    }

    matchDependencyBySourceAndTargetEvent (dependency : BaseDependencyMixin, from : BaseEventMixin, to : BaseEventMixin) : boolean {
        return dependency.fromEvent === from && dependency.toEvent === to
    }

    getDependencyForSourceAndTargetEvents (from : BaseEventMixin, to : BaseEventMixin) : BaseDependencyMixin {
        const events            = this.getEvents()
        const project           = events[0].project
        const dependencyStore   = project.getDependencyStore()

        return dependencyStore.find((dependency : BaseDependencyMixin) => this.matchDependencyBySourceAndTargetEvent(dependency, from, to)) as BaseDependencyMixin
    }

    /**
     * Returns list of dependencies building the cycle.
     */
    getDependencies () : BaseDependencyMixin[] {
        if (!this._dependencies) {
            const result : Set<BaseDependencyMixin> = new Set()

            const events            = this.getEvents()
            const numberOfEvents    = events.length

            let prevEvent           = events[0],
                dependency

            if (numberOfEvents === 1) {
                if ((dependency = this.getDependencyForSourceAndTargetEvents(prevEvent, prevEvent))) {
                    result.add(dependency)
                }
            }
            else {
                for (const event1 of events) {
                    for (const event2 of events) {

                        if ((dependency = this.getDependencyForSourceAndTargetEvents(event1, event2))) {
                            result.add(dependency)
                        }

                        if ((dependency = this.getDependencyForSourceAndTargetEvents(event2, event1))) {
                            result.add(dependency)
                        }
                    }
                }
            }

            this._dependencies      = [...result]
        }

        return this._dependencies
    }

    /**
     * Returns list of the cycle possible resolutions.
     *
     * The class provides a single parameterized [[RemoveDependencyCycleEffectResolution]] resolution
     * which implement removal of one of the [[getDependencies|dependencies]].
     */
    getResolutions () : SchedulingIssueEffectResolution[] {
        if (!this._resolutions) {
            this._resolutions = [this.removeDependencyCycleEffectResolutionClass.new()]
        }

        return this._resolutions
    }
}
