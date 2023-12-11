import TimeZoneHelper from '../../../Core/helper/TimeZoneHelper.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';

/**
 * @module Scheduler/model/mixin/TimeZonedDatesMixin
 */

const dateFieldsToConvert = {
    startDate      : 1,
    endDate        : 1,
    constraintDate : 1,
    deadlineDate   : 1
};

/**
 * This mixin class overrides default Model functionality to provide support for time zone converted dates
 * @mixin
 */
export default Target => class TimeZonedDatesMixin extends Target {

    static $name = 'TimeZonedDatesMixin';

    static fields  = [
        /**
         * The current timeZone this record is converted to. Used internally to keep track of time zone conversions.
         *
         * Can also be used to create a new record with dates in a specific non-local timezone. That is useful for
         * example when replacing a store dataset. That would be interpreted as a new load, and all dates would be
         * converted to the configured timezone.
         *
         * If specifically set to `null` when adding a new record to a Store, the new record's dates will be converted
         * to the Project's configured timezone.
         *
         * For more information about timezone conversion, se {@link Scheduler.model.ProjectModel#config-timeZone}.
         *
         * This field will not {@link Core.data.field.DataField#config-persist} by default.
         *
         * @field {String|Number|null} timeZone
         * @category Advanced
         */
        {
            name    : 'timeZone',
            persist : false
        }
    ];

    get timeZone() {
        return this.getData('timeZone');
    }

    set timeZone(timeZone) {
        this.setData('timeZone', timeZone);
    }

    setLocalDate(field, date) {
        const me = this;

        me.set(field, me.timeZone != null ? TimeZoneHelper.toTimeZone(date, me.timeZone) : date, true);
        // Need to set data to fool engine that the dates haven't change
        me.setData(field, me[field]);
    }

    getLocalDate(field) {
        if (this.timeZone != null && this[field]) {
            return TimeZoneHelper.fromTimeZone(this[field], this.timeZone);
        }
        return this[field];
    }

    applyChangeset(rawChanges) {
        // When a sync response arrives from backend, the data will need to be converted to time zone before applied.
        if (this.timeZone != null) {
            for (const field in dateFieldsToConvert) {
                if (rawChanges[field]) {
                    this.setLocalDate(field, new Date(rawChanges[field]));
                    delete rawChanges[field];
                }
            }
        }
        return super.applyChangeset(...arguments);
    }

    getFieldPersistentValue(field) {
        if (this.timeZone != null) {
            const fieldName = field?.field ?? field?.name ?? field;

            // Used when saving/syncing. Returns local system dates
            if (dateFieldsToConvert[fieldName]) {
                return this.getLocalDate(fieldName);
            }
        }

        return super.getFieldPersistentValue(field);
    }

    // Converts current record into a timeZone
    convertToTimeZone(timeZone) {
        const
            me            = this,
            metaModified  = { ...me.meta.modified },
            convertFields = { ...dateFieldsToConvert };

        // Do not convert start and end dates on task unless manually scheduled
        if (me.isTask && !me.manuallyScheduled) {
            delete convertFields.startDate;
            delete convertFields.endDate;
        }

        // Collect values
        for (const field in convertFields) {
            // Only convert if field has value
            if (me[field] != null) {
                convertFields[field] = me[field];

                // If already converted, restore to local system time zone
                if (me.timeZone != null) {
                    convertFields[field] = me.getLocalDate(field);

                    // Restore value in meta modified as well
                    if (metaModified[field]) {
                        metaModified[field] = TimeZoneHelper.fromTimeZone(metaModified[field], me.timeZone);
                    }
                }
            }
            else {
                delete convertFields[field];
            }
        }

        // Change time zone
        me.timeZone = timeZone;

        // Set values
        for (const field in convertFields) {
            // Convert and set field date silently
            me.setLocalDate(field, convertFields[field], false);
            convertFields[field] = 1; // For clearing changes below

            // Convert value in meta modified as well
            if (me.timeZone != null && metaModified[field]) {
                metaModified[field] = TimeZoneHelper.toTimeZone(metaModified[field], me.timeZone);
            }
        }

        // Clear modification metadata
        me.clearChanges(true, true, convertFields);

        // If old modification metadata, restore them to record and store
        if (!ObjectHelper.isEmpty(metaModified)) {
            me.meta.modified = metaModified;
            me.stores.forEach(store => store.modified.add(me));
        }
    }
};
