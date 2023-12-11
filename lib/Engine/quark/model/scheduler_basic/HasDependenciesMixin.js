var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { generic_field } from "../../../../ChronoGraph/replica/Entity.js";
import { ModelBucketField } from "../../../chrono/ModelFieldAtom.js";
import { BaseEventMixin } from "./BaseEventMixin.js";
/**
 * This is a mixin, providing dependencies "awareness" for the event.
 *
 * Doesn't affect scheduling.
 */
export class HasDependenciesMixin extends Mixin([BaseEventMixin], (base) => {
    const superProto = base.prototype;
    class HasDependenciesMixin extends base {
        leaveProject() {
            // if the model is in the graph, so we are able to read its identifiers
            if (this.isInActiveTransaction) {
                const activeTransaction = this.graph.activeTransaction;
                const dependencyStore = this.getDependencyStore();
                const toRemove = [];
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
                    if (dependencyStore.includes(dep))
                        toRemove.push(dep);
                for (const dep of activeTransaction.readCurrentOrProposedOrPrevious(this.$.incomingDeps) ?? [])
                    if (dependencyStore.includes(dep))
                        toRemove.push(dep);
                this.project.dependencyStore.remove(toRemove);
            }
            superProto.leaveProject.call(this);
        }
    }
    __decorate([
        generic_field({}, ModelBucketField)
    ], HasDependenciesMixin.prototype, "outgoingDeps", void 0);
    __decorate([
        generic_field({}, ModelBucketField)
    ], HasDependenciesMixin.prototype, "incomingDeps", void 0);
    return HasDependenciesMixin;
}) {
}
