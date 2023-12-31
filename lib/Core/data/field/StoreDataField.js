import DataField from './DataField.js';
import ObjectHelper from '../../helper/ObjectHelper.js';
import StringHelper from '../../helper/StringHelper.js';

/**
 * @module Core/data/field/StoreDataField
 */

const isIdAutoGenerated = id => typeof id === 'string' && id.startsWith('_generated');

/**
 * This field class handles fields that accepts an array that is then converted to a store.
 *
 * ```javascript
 * class Task extends Model {
 *     static fields = [
 *         'name',
 *         // Store field
 *         { name : 'subTasks', type : 'store', storeClass : Store }
 *     ];
 * }
 * ```
 *
 * A record can be constructed like this:
 *
 * ```javascript
 * const task = new Task({
 *     name : 'Task 1',
 *     subTasks : [
 *         { text : 'Something', done : false },
 *         { text : 'Some other thing', done : true }
 *     ]
 * };
 * ```
 *
 * Or by populating a store:
 *
 * ```javascript
 * const store = new Store({
 *     modelClass : Task,
 *     data : [
 *         {
 *             name : 'Task 1',
 *             subTasks : [
 *                 { text : 'Something', done : false },
 *                 { text : 'Some other thing', done : true }
 *             ]
 *         },
 *         ...
 *     ]
 * });
 * ```
 *
 * Whenever the store or its records are manipulated, the field will be marked as modified:
 *
 * ```javascript
 * // These will all be detected as modifications
 * task.subTasks.first.done = true;
 * task.subTasks.last.remove();
 * task.subTasks.add({ text : 'New task', done : false });
 * ```
 *
 * <div class="note">Note that the underlying store by default will be configured with <code>syncDataOnLoad</code> set
 * to <code>true</code></div>
 *
 * @extends Core/data/field/DataField
 * @classtype store
 * @datafield
 */
export default class StoreDataField extends DataField {
    static $name = 'StoreDataField';

    static type = 'store';

    /**
     * Store class to use when creating the store.
     *
     * ```javascript
     * class TodoStore extends Store {
     *     ...
     * }
     *
     * const task = new Store({
     *     static fields = [
     *         { type : 'store', name: 'todoItems', storeClass : TodoStore }
     *     ]
     * });
     * ```
     *
     * @config {Class} storeClass
     * @typings {typeof Store}
     */

    /**
     * Model class to use for the store (can also be configured as usual on the store class, this config is for
     * convenience).
     *
     * ```javascript
     * class TodoItem extends Model {
     *   ...
     * }
     *
     * const task = new Store({
     *     static fields = [
     *         { type : 'store', name: 'todoItems', storeClass : Store, modelClass : TodoItem }
     *     ]
     * });
     * ```
     *
     * @config {Class} modelClass
     * @typings {typeof Model}
     */

    /**
     * Optional store configuration object to apply when creating the store.
     *
     * ```javascript
     * const task = new Store({
     *     static fields = [
     *         {
     *             type       : 'store',
     *             name       : 'todoItems',
     *             storeClass : Store
     *             store      : {
     *                  syncDataOnLoad : false
     *             }
     *         }
     *     ]
     * });
     * ```
     *
     * @config {StoreConfig} store
     */

    // Initializer, called when creating a record. Sets up the store and populates it with any initial data
    init(data, record) {
        const
            me        = this,
            storeName = `${me.name}Store`,
            config    = { skipStack : true, syncDataOnLoad : true }; // Optimization when used from sources, don't create a stack in Base

        if (me.store) {
            ObjectHelper.assign(config, me.store);
        }

        // Optionally apply modelClass, for convenient configuration
        if (me.modelClass) {
            config.modelClass = me.modelClass;
        }

        // Call optional initializer (initSubTasksStore for subTasks field) on the record, letting it manipulate the
        // config before creating a store
        record[`init${StringHelper.capitalize(storeName)}`]?.(config);

        if (!config.storeClass && !me.storeClass) {
            throw new Error(`Field '${me.name}' with type 'store' must have a storeClass configured`);
        }

        // Store has to be assigned on the record, field is shared
        const store = record.meta[storeName] = new (config.storeClass || me.storeClass)(config);

        if (me.complexMapping) {
            ObjectHelper.setPath(data, me.dataSource, store);
        }
        else {
            data[me.dataSource] = store;
        }

        // Don't warn about generated ids, responsibility lies elsewhere
        store.verifyNoGeneratedIds = false;
        // Keep track of if id should be included when serializing or not
        store.usesId = !store.count || !store.every(record => record.hasGeneratedId);
        // Cache value
        store.$currentValue = me.getValue(store);

        // Track changes to the store, applying them to the record and caching current value to be used when
        // serializing and in comparisons (required, otherwise we would be comparing to already updated store
        store.ion({
            change : ({ action }) => {
                const value = me.getValue(store);

                if (!store.$isSettingStoreFieldData) {
                    const oldPreserveCurrentDataset = store.$preserveCurrentDataset;

                    store.$preserveCurrentDataset = me.subStore && (
                        action === 'update' || action === 'remove' || action === 'add'
                    );

                    me.$isUpdatingRecord = true;
                    record.set(me.name, value);
                    me.$isUpdatingRecord = false;

                    store.$preserveCurrentDataset = oldPreserveCurrentDataset;
                }
                // cache the field current value
                store.$currentValue = value;
            }
        });
    }

    // Called when setting a new value to the field on a record
    set(value, data, record) {
        const
            me        = this,
            storeName = `${me.name}Store`,
            { [storeName] : store } = record.meta;

        // Lazy store might not be created yet, gets created on first access. Returning false keeps the value for later
        // if called during init
        if (!store) {
            // Missing store suggests value was not yet initialized and future value resides
            // in a special meta property. In which case we need to update it there
            record.meta.initableValues.set(me, value);

            return false;
        }

        // Prevent changes from leading to recursive calls
        if (store.$isSettingStoreFieldData) {
            return;
        }

        store.$isSettingStoreFieldData = true;

        // Call optional processing fn (processSubTasksStoreData for subTasks field) on the record, letting it
        // manipulate the data before creating records
        value = record[`process${StringHelper.capitalize(storeName)}Data`]?.(value, record) ?? value;

        // Apply incoming array to store
        if (!store.$preserveCurrentDataset) {
            store.data = value;
        }

        store.$isSettingStoreFieldData = false;

        // Keep track of if id should be included when serializing or not
        store.usesId = !store.count || !store.every(record => record.hasGeneratedId);
    }

    serialize(value, record) {
        const store = record.meta[`${this.name}Store`];
        return this.$isUpdatingRecord ? this.getValue(store) : store.$currentValue;
    }

    // Extract persistable values, optionally including id depending on if ids are used
    getValue(store) {
        return store.allRecords.map(r => {
            const data = r.persistableData;

            if (!store.usesId) {
                delete data.id;
            }

            return data;
        });
    }

    isEqual(a, b) {
        if (a == null && b == null) {
            return true;
        }
        else if (a == null && b != null || a != null && b == null) {
            return false;
        }
        // here both `a` and `b` are not empty
        else {
            if (a.isStore && b.isStore) {
                return ObjectHelper.isDeeplyEqual(a.$currentValue, b.$currentValue);
            }
            else if (a.isStore && b.isStore || !a.isStore && !b.isStore) {
                return ObjectHelper.isEqual(a, b, true);
            }
            else {
                // here either `a` or `b` is a store, but not both
                const
                    store = a.isStore ? a : b,
                    modelClass = store.modelClass,
                    fields = modelClass.$meta.fields.defs,
                    storeEntries = a.isStore ? a.$currentValue : b.$currentValue,
                    arrayEntries = a.isStore ? b : a;

                if (storeEntries.length !== arrayEntries.length) {
                    return false;
                }
                else {
                    for (let i = 0; i < fields.length; i++) {
                        const field = fields[i];

                        if (!field.persist) {
                            continue;
                        }

                        for (let k = 0; k < storeEntries.length; k++) {
                            const storeValue = storeEntries[k][field.dataSource];
                            const arrayValue = arrayEntries[k][field.dataSource];

                            // few special cases for a value present in store, but missing in the array
                            if (storeValue !== undefined && arrayValue === undefined) {
                                // if id is missing in the array and is auto-generated in store - that is considered as equality
                                if (field.dataSource === modelClass.idField && isIdAutoGenerated(storeValue)) {
                                    continue;
                                }
                                // if there's no value in the array, but it presents in the store
                                // that still might be an equality case - if the store value is
                                // equal to the default field value
                                if (field.defaultValue !== undefined && ObjectHelper.isEqual(field.defaultValue, storeValue, true)) {
                                    continue;
                                }
                            }

                            if (!ObjectHelper.isEqual(storeValue, arrayValue, true)) {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
        }
    }

    // Cloned value to be able to restore it later using STM
    getOldValue(record) {
        const store = record.meta[`${this.name}Store`];
        return store ? ObjectHelper.clone(store.$currentValue) : null;
    }

    getAt(record, index) {
        const store = record.meta[`${this.name}Store`];
        return store?.getAt(index);
    }
}

StoreDataField.initClass();
