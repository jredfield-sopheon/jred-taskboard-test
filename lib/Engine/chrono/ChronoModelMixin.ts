import { AnyConstructor, Mixin } from "../../ChronoGraph/class/BetterMixin.js"
import { Entity } from "../../ChronoGraph/replica/Entity.js"
import { ModelId } from "../quark/Types.js"
import Model from "../../Core/data/Model.js"
import ObjectHelper from "../../Core/helper/ObjectHelper.js"
import { CalculationIterator } from "../../ChronoGraph/primitives/Calculation.js"
import { ProposedOrPrevious } from "../../ChronoGraph/chrono/Effect.js"
import { ChronoModelReferenceBucketFieldIdentifier, ChronoModelReferenceFieldIdentifier } from "./ModelFieldAtom.js"

/**
 * This is a base mixin, which mixes together the ChronoGraph's [Entity](https://bryntum.com/products/gantt/docs/engine/modules/_lib_chronograph_replica_entity_.html)
 * and the Bryntum Core [Model](https://bryntum.com/products/grid/docs/api/Core/data/Model)
 *
 * It is used as a very base mixin for all other entities in the project.
 */
export class ChronoModelMixin extends Mixin(
    [ Entity, Model ],
    (base : AnyConstructor<Model & Entity, typeof Model & typeof Entity>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ChronoModelMixin extends base {
        // This is a marker for Models which have the Engine API available.
        get isEntity () : boolean {
            return true
        }

        construct (config, ...args : any[]) {
            // this is to force the fields creation, because we need all fields to be created
            // for the `this.getFieldDefinition()` to return correct result
            // @ts-ignore
            this.constructor.exposeProperties()

            // Cache original data before we recreate the incoming data here.
            this.originalData       = (config = config || {})

            // Populate record with all data, it will sort the configs out.
            // By doing this first, we can feed engine the converted values right away. Needed to satisfy tests that
            // use standalone stores, otherwise they will be getting the unconverted values since there is no graph.
            superProto.construct.call(this, config, ...args)

            // assign Chronograph fields that are not Model fields
            for (const fieldName in this.originalData) {
                if (this.$[fieldName] && !this.getFieldDefinition(fieldName)) {
                    this[ fieldName ] = config[ fieldName ]
                }
            }
        }


        /**
         * Calculation function that simply returns current ([[ProposedOrPrevious|proposed or previous]]) value of
         * an identifier.
         */
        * userProvidedValue () : CalculationIterator<any> {
            return yield ProposedOrPrevious
        }


        copy (newId : ModelId = null, deep = null) : this {
            const copy = superProto.copy.call(this, newId, deep)
            const { creatingOccurrence } = deep ?? {}

            // If deep is everything but object - use default behavior, which is to invoke accessors
            // If deep is an object, check if it has certain field disabled
            if ((ObjectHelper.isObject(deep) && !deep.skipFieldIdentifiers) || !ObjectHelper.isObject(deep)) {
                this.forEachFieldIdentifier((identifier, fieldName, field) => {
                    if (
                        !field.lazy &&
                        // @ts-ignore
                        this.getFieldDefinition(fieldName)?.type !== 'store' && (
                            // Do not copy buckets for non-occurrences (for example task.incomingDeps, since it contains
                            // records related to the original, not the copy)
                            (!creatingOccurrence && !(identifier instanceof ChronoModelReferenceBucketFieldIdentifier))
                            // Only include buckets and references for occurrences, they will not be part of graph and
                            // will handle their own dates etc
                            || (creatingOccurrence && (identifier instanceof ChronoModelReferenceBucketFieldIdentifier
                                || identifier instanceof ChronoModelReferenceFieldIdentifier))
                        )
                    ) {
                        copy[fieldName] = this[fieldName]
                    }
                })
            }

            return copy
        }


        _data           : object


        applyValue (useProp : boolean, key : string, value : any, skipAccessors : boolean, field : any) {
            // key is the dataSource, we need to check for the field name instead
            const chronoField   = this.$entity.getField(field?.name || key)

            if (chronoField) useProp = true
            if (skipAccessors) useProp = false

            superProto.applyValue.call(this, useProp, useProp ? field?.name ?? key : key, value, skipAccessors, field)
        }


        get isInActiveTransaction () : boolean {
            // Might not have joined graph when using delayed calculation
            const activeTransaction     = this.graph?.activeTransaction

            return Boolean(activeTransaction?.getLatestEntryFor(this.$$))
        }


        get data () : object {
            return this._data
        }


        set data (data : object) {
            this._data  = data

            // Have to iterate over defined fields and not keys in supplied data, in case nested mappings are used

            const { fields, $, graph, generation } = this

            for (let i = 0; i < fields.length; i++)  {
                const { name, dataSource, complexMapping }      = fields[ i ]
                const identifier                                = $[ name ]

                if (identifier) {
                    const value = complexMapping
                        ? ObjectHelper.getPath(data, dataSource)
                        : data[ dataSource ]

                    // Avoid hitting setter for fields that have no value in supplied data, or are undefined on initial set
                    if ((complexMapping || dataSource in data) && (generation != null || value !== undefined)) {
                        // Use the predefined name for engine (name, startDate)
                        identifier.writeToGraph(graph, value)
                    }
                }
            }
        }


        get $entityName () : string {
            const className     = this.constructor.name || this.$entity.name

            const id            = this.id

            return `${className}${ id != null ? '-' + String(id) : '' }`
        }
    }

    return ChronoModelMixin
}){}
