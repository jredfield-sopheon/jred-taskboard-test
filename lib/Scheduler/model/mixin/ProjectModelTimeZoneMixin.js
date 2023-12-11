import Model from '../../../Core/data/Model.js';
import TimeZoneHelper from '../../../Core/helper/TimeZoneHelper.js';
import StoreTimeZonePlugin from '../../data/plugin/StoreTimeZonePlugin.js';

/**
 * @module Scheduler/model/mixin/ProjectModelTimeZoneMixin
 */

/**
 * Mixin that holds TimeZone functionality shared between projects in Scheduler, Scheduler Pro, Gantt and Calendar
 * @mixin
 */
export default Target => class ProjectModelTimeZoneMixin extends (Target || Model) {
    static $name = 'ProjectModelTimeZoneMixin';

    static configurable = {
        /**
         * Set to a IANA time zone (i.e. `Europe/Stockholm`) or a UTC offset in minutes (i.e. `-120`). This will
         * convert all events, tasks and time ranges to the specified time zone or offset. It will also affect the
         * displayed timeline's headers as well at the start and end date of it.
         *
         * There is currently no built-in time zone support in JavaScript which means that the converted dates
         * technically still are in the local system time zone, but adjusted to match the configured time zone.
         *
         * ### DST
         * If a IANA time zone is provided, there will be support for DST. But if local system time zone has DST that
         * will affect the time zone conversion at the exact hour when the local system time zone switches DST on and
         * off.
         *
         * *For example:*
         * 1. The local system time zone is `Europe/Stockholm` (which is UTC+1 or UTC+2 when DST).
         * 2. The date `2022-03-27T07:00:00Z` (which is UTC) is converted to `America/Chicago` (which is UTC-6 or UTC-5
         *    when DST).
         * 3. The converted JS date will be created from `2022-03-27T02:00:00` which is exactly the hour when
         *    `Europe/Stockholm` adds an DST hour. This has the effect that the converted date shows up incorrectly as
         *    `2022-03-27T03:00` instead.
         *
         * If a UTC offset is provided, there is no DST support at all.
         *
         * ### Editing
         * If creating new records or editing existing record dates, the dates will be interpreted as in the selected
         * time zone.
         *
         * If you want to create new records with dates that either should be interpreted as local system time zone or
         * from any other time zone, specify the {@link Scheduler.model.mixin.TimeZonedDatesMixin#field-timeZone} field
         * on the record.
         *
         * ### Saving
         * When saving or syncing data, the dates will be restored to local system time and converted to JSON
         * ISO formatted.
         *
         * @prp {String|Number} [timeZone]
         * @category Advanced
         */
        timeZone : {
            // Don't ingest the config eagerly because it relies on project being present.
            // Lazy means it waits for ingestion until timeZone property is referenced.
            $config : 'lazy',
            value   : null
        }
    };

    get _storesWithDates() {
        return [this.taskStore, this.timeRangeStore, this.resourceTimeRangeStore].filter(s => s);
    }

    plugStore(store) {
        if (!store.hasPlugin(StoreTimeZonePlugin)) {
            store.addPlugins(StoreTimeZonePlugin);
        }
    }

    unplugStore(store) {
        store.plugins.storeTimeZonePlugin?.destroy();
    }

    attachStore(store) {
        super.attachStore(store);

        // If a new store is attached, convert it to the configured timezone
        if (store && this.timeZone != null && this._storesWithDates.includes(store)) {
            this.plugStore(store);
            this.convertStoresToTimeZone([store]);
        }
    }

    detachStore(store) {
        super.detachStore(store);

        // When a store is detached, the records isn't timezone converted anymore
        if (store && !store.isDestroyed && this.timeZone != null) {
            // Convert records back to local system timezone
            this.convertStoresToTimeZone([store], null);

            // Removes the plugin
            this.unplugStore(store);
        }
    }

    relayStoreChange({ source, action, records, replaced }) {
        const me = this;

        if (me.timeZone != null && me._storesWithDates.includes(source)) {
            // When a record is added or replaced, it is treated as in current configured timezone
            if (['add', 'replace'].includes(action)) {
                if (!records?.length && replaced?.length) {
                    records = replaced;
                }
                if (records.length) {
                    records.forEach(record => record.timeZone = me.timeZone);
                }
            }
        }
    }

    convertStoresToTimeZone(stores, timeZone = this.timeZone) {
        const
            me            = this,
            stmAutoRecord = me.stm?.autoRecord;

        // Disable STM while updating timezone values
        if (stmAutoRecord) {
            me.stm.autoRecord = false;
        }

        for (const store of stores) {
            store?.forEach(r => store.plugins.storeTimeZonePlugin.convertRecordToTimeZone(r, timeZone));
        }

        if (stmAutoRecord) {
            // Restore original value
            me.stmAutoRecord = stmAutoRecord;
        }
    }

    updateTimeZone(timeZone, oldTimeZone) {
        const
            me            = this,
            isConfiguring = me._isConfiguringTimeZone || me.isConfiguring;

        me.trigger('beforeTimeZoneChange', {
            timeZone,
            oldTimeZone,
            isConfiguring
        });

        me.calendarManagerStore.forEach(calendar => calendar.bumpVersion());

        me._storesWithDates.forEach(store => me.plugStore(store));

        // Convert data to time zone
        me.convertStoresToTimeZone(me._storesWithDates);

        // Convert project startdate
        if (me.startDate) {
            const startDate = oldTimeZone != null ? TimeZoneHelper.fromTimeZone(me.startDate, oldTimeZone) : me.startDate;
            me.startDate = timeZone != null ? TimeZoneHelper.toTimeZone(startDate, timeZone) : startDate;
        }

        me.ignoreRecordChanges = true;
        me.commitAsync().then(() => {
            if (!me.isDestroyed) {
                me.trigger('timeZoneChange', {
                    timeZone,
                    oldTimeZone,
                    isConfiguring
                });
            }
            delete me._isConfiguringTimeZone;
        });
    }

};
