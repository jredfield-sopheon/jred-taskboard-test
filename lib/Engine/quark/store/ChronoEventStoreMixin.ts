import { AnyConstructor, Mixin } from "../../../ChronoGraph/class/BetterMixin.js"
import { SchedulerBasicEvent } from "../model/scheduler_basic/SchedulerBasicEvent.js"
import { SchedulerBasicProjectMixin } from "../model/scheduler_basic/SchedulerBasicProjectMixin.js"
import { ChronoPartOfProjectStoreMixin } from "./mixin/ChronoPartOfProjectStoreMixin.js"
import { AbstractEventStoreMixin } from "./AbstractEventStoreMixin.js"


/**
 * A store mixin class, that represent collection of all events in the [[SchedulerBasicProjectMixin|project]].
 */
export class ChronoEventStoreMixin extends Mixin(
    [ AbstractEventStoreMixin, ChronoPartOfProjectStoreMixin ],
    (base : AnyConstructor<AbstractEventStoreMixin & ChronoPartOfProjectStoreMixin, typeof AbstractEventStoreMixin & typeof ChronoPartOfProjectStoreMixin>) => {

    class ChronoEventStoreMixin extends base {
        removalOrder        : number            = 400

        project             : SchedulerBasicProjectMixin

        modelClass          : this[ 'project' ][ 'eventModelClass' ]

        static get defaultConfig () : object {
            return {
                modelClass  : SchedulerBasicEvent
            }
        }


        // this method has to be in the code for the "plain" store, because it might be
        // suddenly upgraded to the "tree", based on the data
        buildRootNode () : object {
            return this.getProject() || {}
        }


        set data (value) {
            super.data = value

            this.afterEventRemoval()
        }
    }

    return ChronoEventStoreMixin
}){}


/**
 * The tree store version of [[ChronoEventStoreMixin]].
 */
export class ChronoEventTreeStoreMixin extends Mixin(
    [ ChronoEventStoreMixin ],
    (base : AnyConstructor<ChronoEventStoreMixin, typeof ChronoEventStoreMixin>) => {

    class ChronoEventTreeStoreMixin extends base {
        rootNode            : SchedulerBasicProjectMixin

        static get defaultConfig () : object {
            return {
                tree        : true
            }
        }
    }

    return ChronoEventTreeStoreMixin
}){}

