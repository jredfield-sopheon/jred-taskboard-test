import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { generic_field } from "../../../../ChronoGraph/replica/Entity.js"
import { ModelBucketField } from "../../../chrono/ModelFieldAtom.js"
import { BaseDependencyMixin } from "./BaseDependencyMixin.js"
import { BaseEventMixin } from "./BaseEventMixin.js"
import { SchedulerBasicProjectMixin } from "./SchedulerBasicProjectMixin.js"


/**
 * This is a mixin, providing dependencies "awareness" for the event.
 *
 * Doesn't affect scheduling.
 */
export class HasDependenciesMixin extends Mixin(
    [ BaseEventMixin ],
    (base : AnyConstructor<BaseEventMixin, typeof BaseEventMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasDependenciesMixin extends base {
        project         : SchedulerBasicProjectMixin

        // currently the prototype must have at least one field declared with @model_field decorator,
        // for the `injectStaticFieldsProperty` function to be called
        // otherwise, the "common" fields won't be created on the model
        // this behavior should be contained in the `ModelField` itself somehow

        /**
         * A set of outgoing dependencies from this task (dependencies which starts at this task)
         */
        @generic_field({}, ModelBucketField)
        outgoingDeps    : Set<InstanceType<this[ 'project' ][ 'dependencyModelClass' ]>>

        /**
         * A set of incoming dependencies for this task (dependencies which ends at this task)
         */
        @generic_field({}, ModelBucketField)
        incomingDeps    : Set<InstanceType<this[ 'project' ][ 'dependencyModelClass' ]>>


        leaveProject () {
            // if the model is in the graph, so we are able to read its identifiers
            if (this.isInActiveTransaction) {
                const activeTransaction     = this.graph.activeTransaction
                const dependencyStore       = this.getDependencyStore()

                const toRemove : BaseDependencyMixin[] = []

                // https://github.com/bryntum/support/issues/6099
                // use only calculated values, avoid triggering calculations
                // (if calculation is needed, that probably means, that a dependency from the opposite side
                // has been removed earlier in this transaction)
                // trigger calculation will start a new epoch in the graph walker
                // so large part of the graph will be repeatedly marked as dirty

                // also filter to only existing, not yet removed records, otherwise STM records those as
                // valid removes(?) and "excessive rendering" appears in the "examples/advanced.t.js" Gantt test
                // (also not clear how that is related)
                for (const dep of activeTransaction.readCurrentOrProposedOrPrevious(this.$.outgoingDeps) ?? [])
                    if (dependencyStore.includes(dep)) toRemove.push(dep)

                for (const dep of activeTransaction.readCurrentOrProposedOrPrevious(this.$.incomingDeps) ?? [])
                    if (dependencyStore.includes(dep)) toRemove.push(dep)

                this.project.dependencyStore.remove(toRemove)
            }

            superProto.leaveProject.call(this)
        }
    }

    return HasDependenciesMixin
}){}

