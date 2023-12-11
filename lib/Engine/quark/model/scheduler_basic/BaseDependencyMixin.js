var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { generic_field } from '../../../../ChronoGraph/replica/Entity.js';
import { model_field, ModelReferenceField, isSerializableEqual } from '../../../chrono/ModelFieldAtom.js';
import { DependencyType } from '../../../scheduling/Types.js';
import { ChronoPartOfProjectModelMixin } from '../mixin/ChronoPartOfProjectModelMixin.js';
/**
 * Base dependency entity mixin type
 */
export class BaseDependencyMixin extends Mixin([ChronoPartOfProjectModelMixin], (base) => {
    const superProto = base.prototype;
    class BaseDependencyMixin extends base {
        get isValid() {
            const { $, graph } = this;
            // In case the dependency is added but causes a conflict, fromEvent/toEvent are not in the graph. Thus
            // reading them causes an exception which we want to avoid.
            // This is caught sporadically by 10_handling.t.js in SchedulerPro
            if (graph && (!graph.hasIdentifier($.fromEvent) || !graph.hasIdentifier($.toEvent))) {
                return false;
            }
            return super.isValid;
        }
    }
    __decorate([
        generic_field({
            bucket: 'outgoingDeps',
            resolver: function (id) { return this.getEventById(id); },
            modelFieldConfig: {
                persist: true,
                serialize: event => event?.id,
                isEqual: isSerializableEqual
            },
        }, ModelReferenceField)
    ], BaseDependencyMixin.prototype, "fromEvent", void 0);
    __decorate([
        generic_field({
            bucket: 'incomingDeps',
            resolver: function (id) { return this.getEventById(id); },
            modelFieldConfig: {
                persist: true,
                serialize: event => event?.id,
                isEqual: isSerializableEqual
            },
        }, ModelReferenceField)
    ], BaseDependencyMixin.prototype, "toEvent", void 0);
    __decorate([
        model_field({ type: 'int', defaultValue: DependencyType.EndToStart })
    ], BaseDependencyMixin.prototype, "type", void 0);
    __decorate([
        model_field({ type: 'string' })
    ], BaseDependencyMixin.prototype, "fromSide", void 0);
    __decorate([
        model_field({ type: 'string' })
    ], BaseDependencyMixin.prototype, "toSide", void 0);
    return BaseDependencyMixin;
}) {
}
