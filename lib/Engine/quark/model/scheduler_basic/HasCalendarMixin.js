var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, field, generic_field, write } from "../../../../ChronoGraph/replica/Entity.js";
import { CalendarCacheMultiple } from "../../../calendar/CalendarCacheMultiple.js";
import { injectStaticFieldsProperty, isSerializableEqual, ModelReferenceField } from '../../../chrono/ModelFieldAtom.js';
import { stripDuplicates } from "../../../util/StripDuplicates.js";
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js";
import { BaseCalendarMixin } from "./BaseCalendarMixin.js";
/**
 * This mixin provides the calendar to any [[ChronoPartOfProjectModelMixin]] it is mixed in.
 *
 * If user provides no calendar, the calendar is taken from the project.
 */
export class HasCalendarMixin extends Mixin([ChronoPartOfProjectModelMixin], (base) => {
    class HasCalendarMixin extends base {
        writeCalendar(me, transaction, quark, calendar) {
            const calendarManagerStore = this.getCalendarManagerStore();
            const cal = calendar;
            // add calendar to the calendar manager - if the calendar is not there yet
            if (calendar && calendarManagerStore && calendar instanceof BaseCalendarMixin && !calendarManagerStore.includes(cal)) {
                calendarManagerStore.add(calendar);
            }
            me.constructor.prototype.write.call(this, me, transaction, quark, calendar);
        }
        resolveCalendar(locator) {
            return this.getCalendarManagerStore()?.getById(locator);
        }
        *calculateEffectiveDataOrVisualCalendar(purpose) {
            let calendar = yield this.$.calendar;
            if (!calendar) {
                const project = this.getProject();
                calendar = yield project.$.effectiveCalendar;
            }
            // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update
            yield calendar.$.version;
            return calendar;
        }
        /**
         * Calculation method of the [[effectiveCalendar]]. Takes the calendar from the project, if not provided to the entity explicitly.
         */
        *calculateEffectiveCalendar() {
            return yield* this.calculateEffectiveDataOrVisualCalendar('data');
        }
        /**
         * Calculation method of the [[effectiveCalendar]]. Takes the calendar from the project, if not provided to the entity explicitly.
         */
        *calculateEffectiveVisualCalendar() {
            return yield* this.calculateEffectiveDataOrVisualCalendar('visual');
        }
        //region STM hooks
        shouldRecordFieldChange(fieldName, oldValue, newValue) {
            if (!super.shouldRecordFieldChange(fieldName, oldValue, newValue)) {
                return false;
            }
            const { project } = this;
            // If that's a "calendar" field change - make sure it does refer to some other record
            // and not just reacts to old record idChange
            if (fieldName === 'calendar' && project) {
                const { calendarManagerStore } = project;
                return calendarManagerStore.oldIdMap[oldValue] !== calendarManagerStore.getById(newValue);
            }
            return true;
        }
    }
    __decorate([
        field({
            equality: () => false
        })
    ], HasCalendarMixin.prototype, "effectiveCalendar", void 0);
    __decorate([
        field({
            equality: () => false
        })
    ], HasCalendarMixin.prototype, "effectiveVisualCalendar", void 0);
    __decorate([
        generic_field({
            modelFieldConfig: {
                persist: true,
                // we don't use calendar?.id here since we need to preserve calendar==null value
                // while optional chaining will result undefined in this case
                serialize: calendar => calendar === undefined ? undefined : (calendar?.id || null),
                isEqual: isSerializableEqual
            },
            resolver: function (locator) {
                return this.resolveCalendar(locator);
            },
            sync: true
        }, ModelReferenceField)
    ], HasCalendarMixin.prototype, "calendar", void 0);
    __decorate([
        write('calendar')
    ], HasCalendarMixin.prototype, "writeCalendar", null);
    __decorate([
        calculate('effectiveCalendar')
    ], HasCalendarMixin.prototype, "calculateEffectiveCalendar", null);
    __decorate([
        calculate('effectiveVisualCalendar')
    ], HasCalendarMixin.prototype, "calculateEffectiveVisualCalendar", null);
    // inject "fields" getter override to apply "modelFieldConfig" to "event" & "resource" fields
    injectStaticFieldsProperty(HasCalendarMixin);
    return HasCalendarMixin;
}) {
}

/**
 * This mixin provides the consuming class with the [[combineCalendars]] method, which can combine several calendars.
 */
export class CanCombineCalendarsMixin extends Mixin([], (base) => {
    class CanCombineCalendars extends base {
        constructor() {
            super(...arguments);
            this.combinedCalendarsCache = new Map();
            this.combinationsByCalendar = new Map();
        }
        /**
         * Combines an array of calendars into a single [[CalendarCacheMultiple]], which provides an API similar (but not exactly the same) to [[BaseCalendarMixin]]
         *
         * @param calendars
         */
        combineCalendars(calendars) {
            const uniqueOnly = stripDuplicates(calendars);
            if (uniqueOnly.length === 0)
                throw new Error("No calendars to combine");
            uniqueOnly.sort((calendar1, calendar2) => {
                if (calendar1.internalId < calendar2.internalId)
                    return -1;
                else
                    return 1;
            });
            const hash = uniqueOnly.map(calendar => calendar.internalId + '/').join('');
            const versionsHash = uniqueOnly.map(calendar => calendar.version + '/').join('');
            const cached = this.combinedCalendarsCache.get(hash);
            let res;
            if (cached && cached.versionsHash === versionsHash)
                res = cached.cache;
            else {
                res = new CalendarCacheMultiple({ calendarCaches: uniqueOnly.map(calendar => calendar.calendarCache) });
                this.combinedCalendarsCache.set(hash, {
                    versionsHash: versionsHash,
                    cache: res
                });
                uniqueOnly.forEach(calendar => {
                    let combinationsByCalendar = this.combinationsByCalendar.get(calendar);
                    if (!combinationsByCalendar) {
                        combinationsByCalendar = new Set();
                        this.combinationsByCalendar.set(calendar, combinationsByCalendar);
                    }
                    combinationsByCalendar.add(hash);
                });
            }
            return res;
        }
        clearCombinationsWith(calendar) {
            const calendarCombinations = this.combinationsByCalendar.get(calendar);
            if (calendarCombinations) {
                for (const hash of calendarCombinations) {
                    // strip the hash from all involved calendars caches
                    for (const calendarCache of this.combinedCalendarsCache.get(hash).cache.calendarCaches) {
                        const combinations = this.combinationsByCalendar.get(calendarCache.calendar);
                        combinations.delete(hash);
                    }
                    this.combinedCalendarsCache.delete(hash);
                }
                this.combinationsByCalendar.delete(calendar);
            }
        }
    }
    return CanCombineCalendars;
}) {
}
