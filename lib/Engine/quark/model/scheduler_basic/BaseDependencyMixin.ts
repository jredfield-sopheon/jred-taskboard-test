import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { generic_field } from '../../../../ChronoGraph/replica/Entity.js'
import { model_field, ModelReferenceField, isSerializableEqual } from '../../../chrono/ModelFieldAtom.js'
import { DependencyType } from '../../../scheduling/Types.js'
import { ModelId } from '../../Types.js'
import { ChronoPartOfProjectModelMixin } from '../mixin/ChronoPartOfProjectModelMixin.js'
import { HasDependenciesMixin } from './HasDependenciesMixin.js'
import { SchedulerBasicProjectMixin } from "./SchedulerBasicProjectMixin.js"

/**
 * Base dependency entity mixin type
 */
export class BaseDependencyMixin extends Mixin(
    [ ChronoPartOfProjectModelMixin ],
    (base : AnyConstructor<ChronoPartOfProjectModelMixin, typeof ChronoPartOfProjectModelMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class BaseDependencyMixin extends base {
        project                 : SchedulerBasicProjectMixin

        /**
         * The [[HasDependenciesMixin|event]] at which the dependency starts
         */
        @generic_field(
            {
                bucket : 'outgoingDeps',
                resolver : function (id : ModelId) { return this.getEventById(id) },
                modelFieldConfig : {
                    persist   : true,
                    serialize : event => event?.id,
                    isEqual   : isSerializableEqual
                },
            },
            ModelReferenceField
        )
        fromEvent           : HasDependenciesMixin

        /**
         * The [[HasDependenciesMixin|event]] at which the dependency ends
         */
        @generic_field(
            {
                bucket : 'incomingDeps',
                resolver : function (id : ModelId) { return this.getEventById(id) },
                modelFieldConfig : {
                    persist   : true,
                    serialize : event => event?.id,
                    isEqual   : isSerializableEqual
                },
            },
            ModelReferenceField
        )
        toEvent             : HasDependenciesMixin

        /**
         * The type of the dependency
         */
        @model_field({ type : 'int', defaultValue : DependencyType.EndToStart})
        type                : DependencyType

        /**
         * The from side
         */
        @model_field({ type : 'string' })
        fromSide                : string

        /**
         * The to side
         */
        @model_field({ type : 'string' })
        toSide                : string

        get isValid () : boolean {
            const { $, graph } = this

            // In case the dependency is added but causes a conflict, fromEvent/toEvent are not in the graph. Thus
            // reading them causes an exception which we want to avoid.
            // This is caught sporadically by 10_handling.t.js in SchedulerPro
            if (graph && (!graph.hasIdentifier($.fromEvent) || !graph.hasIdentifier($.toEvent))) {
                return false
            }

            return super.isValid
        }
    }

    return BaseDependencyMixin
}){}
