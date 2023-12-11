import Base from '../../../Core/Base.js';
import Store from '../../../Core/data/Store.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';
import ColumnModel from '../../model/ColumnModel.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardColumns
 */

const transitionChangeActions = {
    remove : 1,
    move   : 1,
    update : 1,
    filter : 1
};

/**
 * Mixin that handles columns for the TaskBoard.
 *
 * @mixin
 */
export default Target => class TaskBoardColumns extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardColumns';

    static configurable = {
        /**
         * Store containing the TaskBoard columns.
         *
         * @member {Core.data.Store} columns
         * @category Common
         */
        /**
         * Store containing the TaskBoard columns. A tasks {@link #config-columnField} is matched against the `id` of a
         * column to determine in which column it is displayed.
         *
         * Accepts an array of column records/objects/strings, a store instance, a store id or a store config object
         * used to create a new store.
         *
         * When supplying an array, a store configured with {Core.data.mixin.StoreProxy#config-objectify} is
         * automatically created. Using that config allows for a nicer interaction syntax with the columns:
         *
         * ```javascript
         * // Without objectify:
         * taskBoard.columns.getById('done').text = 'Finished';
         *
         * // With objectify:
         * taskBoard.columns.done.text = 'Finished';
         * ```
         *
         * When supplying strings, the raw string will be used as the columns `id` and a capitalized version of it is
         * used as the columns text:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *    columns : [
         *        'doing',
         *        'done'
         *    ]
         * });
         * ```
         *
         * Is equivalent to:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *    columns : [
         *        { id : 'doing', text : 'Doing' },
         *        { id : 'done', text : 'Done' }
         *    ]
         * });
         * ```
         *
         * @config {TaskBoard.model.ColumnModel[]|ColumnModelConfig[]|String[]|Core.data.Store|String|StoreConfig}
         * @category Common
         */
        columns : {},

        /**
         * Set to `true` to auto generate columns when {@link #config-columns} is undefined.
         *
         * A column will be created for each distinct value of {@link #config-columnField} on the tasks. The columns
         * will be sorted in alphabetical order. The following snippet will yield two columns, Q1 and Q2:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    columnField : 'quarter',
         *
         *    autoGenerateColumns : true,
         *
         *    project : {
         *        tasksData : [
         *            { id : 1, name : 'Inform tenants', quarter : 'Q1' },
         *            { id : 2, name : 'Renovate roofs', quarter : 'Q2' }
         *        ]
         *    }
         * });
         * ```
         *
         * @config {Boolean}
         * @category Advanced
         */
        autoGenerateColumns : false,

        /**
         * Field on a task record used to determine which column the task belongs to.
         *
         * ```javascript
         * taskBoard.columnField = 'category';
         * ```
         *
         * @member {String} columnField
         * @category Common
         */
        /**
         * Field on a task record used to determine which column the task belongs to.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    columnField : 'status',
         *
         *    columns : [
         *        'todo',
         *        'done'
         *    ],
         *
         *    project : {
         *        tasksData : [
         *            // Linked using the status field, to the done column
         *            { id : 1, name : 'Fun task', status : 'done' }
         *        ]
         *    }
         * });
         * ```
         *
         * @config {String}
         * @category Common
         */
        columnField : null
    };

    static properties = {
        shouldAutoGenerateColumns : false
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeAutoGenerateColumns(autoGenerateColumns) {
        ObjectHelper.assertBoolean(autoGenerateColumns, 'autoGenerateColumns');

        return autoGenerateColumns;
    }

    changeColumnField(columnField) {
        ObjectHelper.assertString(columnField, 'columnField');

        return columnField;
    }

    //endregion

    //region Config - columnField

    updateColumnField(field, old) {
        if (old) {
            const { storage } = this.project.taskStore;

            if (old !== this.swimlaneField) {
                storage.removeIndex(old);
            }
            storage.addIndex({ property : field, unique : false });
        }

        this.shouldAutoGenerateColumns = field && this.autoGenerateColumns;
    }

    //endregion

    //region Config - columns

    changeColumns(columns) {
        return Store.from(columns, { objectify : true, modelClass : ColumnModel }, column => {
            if (typeof column === 'string') {
                return { id : column, text : StringHelper.capitalize(column) };
            }

            return column;
        });
    }

    updateColumns(columns) {
        this.detachListeners('columns');

        if (columns) {
            // Link to us to be able to retrieve tasks in visual order
            // $store is the store instance of an objectified store
            (columns.$store || columns).taskBoard = this;

            columns.ion({
                change  : 'onColumnsChange',
                refresh : 'onColumnsChange',
                thisObj : this
            });
        }
    }

    get columns() {
        const
            me            = this,
            { taskStore } = me.project;

        // If there are no columns defined but we have a column field configured and we have tasks loaded, generate
        // columns from the tasks
        if (me.shouldAutoGenerateColumns && taskStore.count) {
            me.columns = taskStore.getDistinctValues(me.columnField).sort();
            me.shouldAutoGenerateColumns = false;
        }

        return me._columns;
    }

    onColumnsChange({ action }) {
        // CRUD invalidates column/swimlane intersection index
        if (action === 'add' || action === 'remove' || action === 'removeAll' || action === 'update') {
            this.project.taskStore.storage.invalidateIndices();
        }

        if (transitionChangeActions[action]) {
            const options = {};

            if (action === 'update' || action === 'remove') {
                options.addTransition = { width : 1, opacity : 1 };
                options.removeTransition = { width : 1, opacity : 1 };
            }

            this.recomposeWithDomTransition(options);
        }
        else {
            this.recompose();
        }
    }

    //endregion

    //region Data


    getColumnTasks(columnRecord, inVisualOrder = false) {
        const
            me            = this,
            { taskStore } = me.project,
            set           = taskStore.storage.findItem(me.columnField, columnRecord.id),
            tasks         = set ? [...set] : [];

        if (inVisualOrder && set) {
            if (me.swimlanes) {
                const
                    { swimlaneField } = me,
                    swimlanes         = me.swimlanes.map(r => r.id);

                tasks.sort((a, b) => {
                    // First sort by swimlane
                    const swimlaneDelta = swimlanes.indexOf(a[swimlaneField]) - swimlanes.indexOf(b[swimlaneField]);

                    if (swimlaneDelta !== 0) {
                        return swimlaneDelta;
                    }

                    // And within a swimlane sort by weight order
                    if (a.weight != null || b.weight != null) {
                        return a.weight - b.weight;
                    }

                    // Fall back to store order
                    return taskStore.indexOf(a) - taskStore.indexOf(b);
                });

                // Only include tasks for available swimlanes, if used
                if (swimlanes.length && swimlaneField) {
                    return tasks.filter(task => swimlanes.includes(task[swimlaneField]));
                }
            }
            else {
                // Sort by weight within column
                tasks.sort((a, b) => a.weight - b.weight);
            }
        }

        return tasks;
    }

    getColumn(taskRecord) {
        return this.columns.getById(taskRecord.getValue(this.columnField));
    }

    // Next task in the same column as supplied task
    getNextTask(taskRecord, wrap = true) {
        const
            columnRecord = this.getColumn(taskRecord),
            columnTasks  = columnRecord.tasks;

        let nextTaskIndex = columnTasks.indexOf(taskRecord) + 1;

        if (nextTaskIndex === columnTasks.length) {
            if (wrap) {
                nextTaskIndex = 0;
            }
            else {
                return null;
            }
        }

        return columnTasks[nextTaskIndex];
    }

    // Prev task in the same column as supplied task
    getPreviousTask(taskRecord, wrap = true) {
        const
            columnRecord = this.getColumn(taskRecord),
            columnTasks  = columnRecord.tasks;

        let prevTaskIndex = columnTasks.indexOf(taskRecord) - 1;

        if (prevTaskIndex < 0) {
            if (wrap) {
                prevTaskIndex = columnTasks.length - 1;
            }
            else {
                return null;
            }
        }

        return columnTasks[prevTaskIndex];
    }

    //endregion

};
