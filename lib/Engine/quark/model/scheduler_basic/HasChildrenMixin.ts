import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { reference } from "../../../../ChronoGraph/replica/Reference.js"
import { bucket } from "../../../../ChronoGraph/replica/ReferenceBucket.js"
import { Direction, EffectiveDirection } from "../../../scheduling/Types.js"
import { HasSubEventsMixin } from "./HasSubEventsMixin.js"
import { ModelReferenceField } from "../../../chrono/ModelFieldAtom.js"
import { generic_field } from "../../../../ChronoGraph/replica/Entity.js"

/**
 * Specialized version of the [[HasSubEventsMixin]]. The event becomes part of the tree structure.
 * It now has reference to the [[parentEvent]] and a collection of [[childEvents]].
 *
 * The abstract methods from the [[HasSubEventsMixin]] are defined to operate on the [[childEvents]] collection.
 */
export class HasChildrenMixin extends Mixin(
    [ HasSubEventsMixin ],
    (base : AnyConstructor<HasSubEventsMixin, typeof HasSubEventsMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasChildrenMixin extends base {
        // we should have declared a proper type for the `project` property (and remove `@ts-ignore`s in
        // `calculateStart/EndDateDirection`, however this messes things up and TS gives
        //     'resource' is referenced directly or indirectly in its own type annotation.
        // in SchedulerProHasAssignmentsMixin.ts

        // project : SchedulerBasicProjectMixin

        /**
         * A reference to the parent event
         */
        @generic_field(
            {
                bucket           : 'childEvents',
                resolver         : function (id) { return this.getEventById(id) },
                ignore           : true,
                modelFieldConfig : {
                    persist   : false
                }
            },
            ModelReferenceField
        )
        parentEvent      : HasChildrenMixin

        /**
         * A set of references to child events
         */
        @bucket()
        childEvents     : Set<HasChildrenMixin>

        // our override for the `parent` property, which is needed to update the `parentEvent` property
        private _parent : this


        /**
         * Returns `true` if the event has nested sub-events.
         */
        * hasSubEvents () : CalculationIterator<boolean> {
            const childEvents   = yield this.$.childEvents

            return childEvents.size > 0
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
        * subEventsIterable () : CalculationIterator<Iterable<HasChildrenMixin>> {
            return yield this.$.childEvents
        }


        get parent () : this {
            return this._parent
        }


        set parent (value : this) {
            this._parent        = value

            this.parentEvent    = value
        }


        * calculateEffectiveDirection () : CalculationIterator<EffectiveDirection> {
            const direction : Direction  = yield this.$.direction

            if (direction) return { kind : 'own' as 'own', direction }

            const parentEvent   = yield this.$.parentEvent

            if (parentEvent) {
                const parentEffectiveDirection : EffectiveDirection = yield parentEvent.$.effectiveDirection

                return {
                    kind : 'inherited' as 'inherited',
                    direction : parentEffectiveDirection.direction,
                    inheritedFrom : parentEffectiveDirection.kind === 'own'
                        ? parentEvent
                        : parentEffectiveDirection.kind === 'inherited'
                            ? parentEffectiveDirection.inheritedFrom
                            : parentEvent
                }
            } else
                return yield* super.calculateEffectiveDirection()
        }


        * calculateStartDateDirection () : CalculationIterator<EffectiveDirection> {
            // @ts-ignore
            const projectDirection : EffectiveDirection                = yield this.getProject().$.effectiveDirection

            let direction : EffectiveDirection                         = null

            if (!(yield this.$.manuallyScheduled)) {
                const children : Iterable<HasChildrenMixin>            = yield* this.subEventsIterable()

                for (const child of children) {
                    const childStartDateDirection : EffectiveDirection = yield child.$.startDateDirection

                    if (projectDirection.direction !== childStartDateDirection.direction) {
                        direction                                      = {
                            kind        : 'enforced',
                            direction   : childStartDateDirection.direction,
                            enforcedBy  : childStartDateDirection.kind === 'own'
                                ? child
                                : childStartDateDirection.kind === 'enforced'
                                    ? childStartDateDirection.enforcedBy
                                    : childStartDateDirection.inheritedFrom
                        } as EffectiveDirection
                        break
                    }
                }
            }

            return direction ?? (yield* super.calculateStartDateDirection())
        }


        * calculateEndDateDirection () : CalculationIterator<EffectiveDirection> {
            // @ts-ignore
            const projectDirection : EffectiveDirection              = yield this.getProject().$.effectiveDirection

            let direction : EffectiveDirection                       = null

            if (!(yield this.$.manuallyScheduled)) {
                const children : Iterable<HasChildrenMixin>          = yield* this.subEventsIterable()

                for (const child of children) {
                    const childEndDateDirection : EffectiveDirection = yield child.$.endDateDirection

                    if (projectDirection.direction !== childEndDateDirection.direction) {
                        direction                                    = {
                            kind        : 'enforced',
                            direction   : childEndDateDirection.direction,
                            enforcedBy  : childEndDateDirection.kind === 'own'
                                ? child
                                : childEndDateDirection.kind === 'enforced'
                                    ? childEndDateDirection.enforcedBy
                                    : childEndDateDirection.inheritedFrom
                        } as EffectiveDirection
                        break
                    }
                }
            }

            return direction ?? (yield* super.calculateStartDateDirection())
        }
    }

    return HasChildrenMixin
}){}
