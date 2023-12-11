import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, field, generic_field, write } from "../../../../ChronoGraph/replica/Entity.js"
import { CalendarCacheMultiple } from "../../../calendar/CalendarCacheMultiple.js"
import { injectStaticFieldsProperty, isSerializableEqual, ModelReferenceField } from '../../../chrono/ModelFieldAtom.js'
import { stripDuplicates } from "../../../util/StripDuplicates.js"
import { ModelId } from "../../Types.js"
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js"
import { BaseCalendarMixin } from "./BaseCalendarMixin.js"
import { ChronoAbstractProjectMixin } from "./ChronoAbstractProjectMixin.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"

/**
 * This mixin provides the calendar to any [[ChronoPartOfProjectModelMixin]] it is mixed in.
 *
 * If user provides no calendar, the calendar is taken from the project.
 */
export class HasCalendarMixin extends Mixin(
    [ ChronoPartOfProjectModelMixin ],
    (base : AnyConstructor<ChronoPartOfProjectModelMixin, typeof ChronoPartOfProjectModelMixin>) => {

    class HasCalendarMixin extends base {
        project                 : ChronoAbstractProjectMixin & HasCalendarMixin

        /**
         * The effective calendar used by this entity (either its own [[calendar]] if provided or the project calendar)
         * for data calculation purposes.
         */
        @field({
            equality : () => false
        })
        effectiveCalendar       : BaseCalendarMixin

        /**
         * The effective calendar used by this entity (either its own [[calendar]] if provided or the project calendar)
         * for data visualizing purposes.
         */
        @field({
            equality : () => false
        })
        effectiveVisualCalendar : BaseCalendarMixin

        /**
         * The calendar of this entity.
         *
         * **Please use** [[effectiveCalendar]] to get the calendar that is actually used by the entity.
         * The [[calendar]] reflects only the value provided to **this entity** while [[effectiveCalendar]]
         * returns the calendar that is really used (falls back to the project calendar in case the own
         * [[calendar]] is not provided).
         */
        @generic_field(
            {
                modelFieldConfig : {
                    persist   : true,
                    // we don't use calendar?.id here since we need to preserve calendar==null value
                    // while optional chaining will result undefined in this case
                    serialize : calendar => calendar === undefined ? undefined : (calendar?.id || null),
                    isEqual   : isSerializableEqual
                },
                resolver : function (locator) {
                    return this.resolveCalendar(locator)
                },
                sync     : true
            },
            ModelReferenceField
        )
        calendar            : BaseCalendarMixin

        /**
         * Sets the [[calendar]]. The method triggers schedule change propagation and returns a `Promise`:
         *
         * ```typescript
         * // set calendar
         * model.setCalendar(calendar1).then(() => {
         *     // some code to run after schedule got updated
         *     ...
         * })
         *
         * ```
         *
         * It also adds the calendar to the project calendar manager.
         */
        setCalendar : (calendar : BaseCalendarMixin | ModelId) => Promise<CommitResult>
        /**
         * Gets the [[calendar]].
         */
        getCalendar : () => BaseCalendarMixin

        @write('calendar')
        writeCalendar (me : Identifier, transaction : Transaction, quark : Quark, calendar : BaseCalendarMixin) {
            const calendarManagerStore      = this.getCalendarManagerStore()
            const cal                       = calendar as any

            // add calendar to the calendar manager - if the calendar is not there yet
            if (calendar && calendarManagerStore && calendar instanceof BaseCalendarMixin && !calendarManagerStore.includes(cal)) {
                calendarManagerStore.add(calendar as any)
            }

            me.constructor.prototype.write.call(this, me, transaction, quark, calendar)
        }

        resolveCalendar (locator : string) {
            return this.getCalendarManagerStore()?.getById(locator)
        }


        * calculateEffectiveDataOrVisualCalendar (purpose : 'data' | 'visual') : CalculationIterator<BaseCalendarMixin> {
            let calendar : BaseCalendarMixin  = yield this.$.calendar

            if (!calendar) {
                const project   = this.getProject()

                calendar        = yield project.$.effectiveCalendar
            }

            // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update
            yield calendar.$.version

            return calendar
        }


        /**
         * Calculation method of the [[effectiveCalendar]]. Takes the calendar from the project, if not provided to the entity explicitly.
         */
        @calculate('effectiveCalendar')
        * calculateEffectiveCalendar () : CalculationIterator<BaseCalendarMixin> {
            return yield* this.calculateEffectiveDataOrVisualCalendar('data')
        }


        /**
         * Calculation method of the [[effectiveCalendar]]. Takes the calendar from the project, if not provided to the entity explicitly.
         */
        @calculate('effectiveVisualCalendar')
        * calculateEffectiveVisualCalendar () : CalculationIterator<BaseCalendarMixin> {
            return yield* this.calculateEffectiveDataOrVisualCalendar('visual')
        }

        //region STM hooks

        shouldRecordFieldChange (fieldName : string, oldValue, newValue) : boolean {
            if (!super.shouldRecordFieldChange(fieldName, oldValue, newValue)) {
                return false
            }

            const { project } = this

            // If that's a "calendar" field change - make sure it does refer to some other record
            // and not just reacts to old record idChange
            if (fieldName === 'calendar' && project) {
                const { calendarManagerStore } = project

                return calendarManagerStore.oldIdMap[oldValue] !== calendarManagerStore.getById(newValue)
            }

            return true
        }

        //endregion
    }

    // inject "fields" getter override to apply "modelFieldConfig" to "event" & "resource" fields
    injectStaticFieldsProperty(HasCalendarMixin)

    return HasCalendarMixin
}){}


/**
 * This mixin provides the consuming class with the [[combineCalendars]] method, which can combine several calendars.
 */
export class CanCombineCalendarsMixin extends Mixin([], (base : AnyConstructor) => {

    class CanCombineCalendars extends base {

        combinedCalendarsCache  : Map<string, { versionsHash : string, cache : CalendarCacheMultiple }>     = new Map()

        combinationsByCalendar  : Map<BaseCalendarMixin, Set<string>>                                       = new Map()

        /**
         * Combines an array of calendars into a single [[CalendarCacheMultiple]], which provides an API similar (but not exactly the same) to [[BaseCalendarMixin]]
         *
         * @param calendars
         */
        combineCalendars (calendars : BaseCalendarMixin[]) : CalendarCacheMultiple {
            const uniqueOnly    = stripDuplicates(calendars)

            if (uniqueOnly.length === 0) throw new Error("No calendars to combine")

            uniqueOnly.sort(( calendar1, calendar2 ) => {
                if (calendar1.internalId < calendar2.internalId)
                    return -1
                else
                    return 1
            })

            const hash          = uniqueOnly.map(calendar => calendar.internalId + '/').join('')
            const versionsHash  = uniqueOnly.map(calendar => calendar.version + '/').join('')

            const cached        = this.combinedCalendarsCache.get(hash)

            let res : CalendarCacheMultiple

            if (cached && cached.versionsHash === versionsHash)
                res             = cached.cache
            else {
                res             = new CalendarCacheMultiple({ calendarCaches : uniqueOnly.map(calendar => calendar.calendarCache ) })

                this.combinedCalendarsCache.set(hash, {
                    versionsHash    : versionsHash,
                    cache           : res
                })

                uniqueOnly.forEach(calendar => {
                    let combinationsByCalendar = this.combinationsByCalendar.get(calendar)

                    if (!combinationsByCalendar) {
                        combinationsByCalendar = new Set()

                        this.combinationsByCalendar.set(calendar, combinationsByCalendar)
                    }

                    combinationsByCalendar.add(hash)
                })
            }

            return res
        }


        clearCombinationsWith (calendar : BaseCalendarMixin) {
            const calendarCombinations = this.combinationsByCalendar.get(calendar)

            if (calendarCombinations) {
                for (const hash of calendarCombinations) {
                    // strip the hash from all involved calendars caches
                    for (const calendarCache of this.combinedCalendarsCache.get(hash).cache.calendarCaches) {
                        const combinations = this.combinationsByCalendar.get(calendarCache.calendar as BaseCalendarMixin)

                        combinations.delete(hash)
                    }

                    this.combinedCalendarsCache.delete(hash)
                }

                this.combinationsByCalendar.delete(calendar)
            }
        }
    }

    return CanCombineCalendars
}){}
