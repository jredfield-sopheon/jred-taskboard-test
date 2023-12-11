import InstancePlugin from '../../../Core/mixin/InstancePlugin.js';

/**
 * @module Scheduler/data/plugin/ProjectModelMixin
 */

/**
 * Plugs in to a time zone convertable Store to affect and add some functionality.
 * @plugin
 * @private
 */
export default class StoreTimeZonePlugin extends InstancePlugin {
    static $name = 'storeTimeZonePlugin';

    static pluginConfig = {
        before : ['processRecord'],
        assign : ['beforeSyncRecord', 'afterSyncRecord']
    };

    get timeZone() {
        return this.client.project.timeZone;
    }

    // Overrides a Store's processRecord function to be able to convert records added by a dataset
    // before they are processed by the engine
    processRecord(record, isDataSet) {
        if (isDataSet || this.client.isLoadingData || record.timeZone !== undefined) {
            // When loading or changing dataset, de data is treated as local dates and need to be converted
            // Also convert when adding a record with a timeZone specified (null means local time zone)
            this.convertRecordToTimeZone(record);
        }
    }

    convertRecordToTimeZone(record, timeZone = this.timeZone) {
        if (record.timeZone !== timeZone) {
            record.$ignoreChange = true; // Used to ignore changes in NestedEvents feature
            // Convert baselines if exists
            if (record.baselines?.count) {
                for (const bl of record.baselines) {
                    // The baseline records is not marked with a timezone when they are created
                    if (record.timeZone !== bl.timeZone) {
                        bl.timeZone = record.timeZone;
                    }
                    bl.convertToTimeZone(timeZone);
                }
            }
            if (record.occurrences?.length) {
                for (const o of record.occurrences) {
                    if (record.timeZone !== o.timeZone) {
                        o.timeZone = record.timeZone;
                    }
                    o.convertToTimeZone(timeZone);
                }
            }

            record.convertToTimeZone(timeZone);

            record.$ignoreChange = false;
        }
    }

    beforeSyncRecord({ record }) {
        if (record.timeZone != null) {
            record.$restoreTimeZone = record.timeZone;
            record.convertToTimeZone();
        }
    }

    afterSyncRecord({ record }) {
        if (record.$restoreTimeZone) {
            record.convertToTimeZone(record.$restoreTimeZone);
            record.$restoreTimeZone = null;
        }
    }

}
