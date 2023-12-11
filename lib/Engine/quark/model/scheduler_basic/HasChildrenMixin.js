var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { bucket } from "../../../../ChronoGraph/replica/ReferenceBucket.js";
import { HasSubEventsMixin } from "./HasSubEventsMixin.js";
import { ModelReferenceField } from "../../../chrono/ModelFieldAtom.js";
import { generic_field } from "../../../../ChronoGraph/replica/Entity.js";
/**
 * Specialized version of the [[HasSubEventsMixin]]. The event becomes part of the tree structure.
 * It now has reference to the [[parentEvent]] and a collection of [[childEvents]].
 *
 * The abstract methods from the [[HasSubEventsMixin]] are defined to operate on the [[childEvents]] collection.
 */
export class HasChildrenMixin extends Mixin([HasSubEventsMixin], (base) => {
    const superProto = base.prototype;
    class HasChildrenMixin extends base {
        /**
         * Returns `true` if the event has nested sub-events.
         */
        *hasSubEvents() {
            const childEvents = yield this.$.childEvents;
            return childEvents.size > 0;
        }
        /**
         * Returns iterable object listing the event nested sub-events.
         * ```typescript
         * const subEventsIterator : Iterable<HasChildrenMixin> = yield* event.subEventsIterable()
         *
         * for (let childEvent of subEventsIterator) {
         *     // ..do something..
         * }
         * ```
         */
        *subEventsIterable() {
            return yield this.$.childEvents;
        }
        get parent() {
            return this._parent;
        }
        set parent(value) {
            this._parent = value;
            this.parentEvent = value;
        }
        *calculateEffectiveDirection() {
            const direction = yield this.$.direction;
            if (direction)
                return { kind: 'own', direction };
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                const parentEffectiveDirection = yield parentEvent.$.effectiveDirection;
                return {
                    kind: 'inherited',
                    direction: parentEffectiveDirection.direction,
                    inheritedFrom: parentEffectiveDirection.kind === 'own'
                        ? parentEvent
                        : parentEffectiveDirection.kind === 'inherited'
                            ? parentEffectiveDirection.inheritedFrom
                            : parentEvent
                };
            }
            else
                return yield* super.calculateEffectiveDirection();
        }
        *calculateStartDateDirection() {
            // @ts-ignore
            const projectDirection = yield this.getProject().$.effectiveDirection;
            let direction = null;
            if (!(yield this.$.manuallyScheduled)) {
                const children = yield* this.subEventsIterable();
                for (const child of children) {
                    const childStartDateDirection = yield child.$.startDateDirection;
                    if (projectDirection.direction !== childStartDateDirection.direction) {
                        direction = {
                            kind: 'enforced',
                            direction: childStartDateDirection.direction,
                            enforcedBy: childStartDateDirection.kind === 'own'
                                ? child
                                : childStartDateDirection.kind === 'enforced'
                                    ? childStartDateDirection.enforcedBy
                                    : childStartDateDirection.inheritedFrom
                        };
                        break;
                    }
                }
            }
            return direction ?? (yield* super.calculateStartDateDirection());
        }
        *calculateEndDateDirection() {
            // @ts-ignore
            const projectDirection = yield this.getProject().$.effectiveDirection;
            let direction = null;
            if (!(yield this.$.manuallyScheduled)) {
                const children = yield* this.subEventsIterable();
                for (const child of children) {
                    const childEndDateDirection = yield child.$.endDateDirection;
                    if (projectDirection.direction !== childEndDateDirection.direction) {
                        direction = {
                            kind: 'enforced',
                            direction: childEndDateDirection.direction,
                            enforcedBy: childEndDateDirection.kind === 'own'
                                ? child
                                : childEndDateDirection.kind === 'enforced'
                                    ? childEndDateDirection.enforcedBy
                                    : childEndDateDirection.inheritedFrom
                        };
                        break;
                    }
                }
            }
            return direction ?? (yield* super.calculateStartDateDirection());
        }
    }
    __decorate([
        generic_field({
            bucket: 'childEvents',
            resolver: function (id) { return this.getEventById(id); },
            ignore: true,
            modelFieldConfig: {
                persist: false
            }
        }, ModelReferenceField)
    ], HasChildrenMixin.prototype, "parentEvent", void 0);
    __decorate([
        bucket()
    ], HasChildrenMixin.prototype, "childEvents", void 0);
    return HasChildrenMixin;
}) {
}
