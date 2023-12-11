import Base from '../../../Core/Base.js';
import Store from '../../../Core/data/Store.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';
import SwimlaneModel from '../../model/SwimlaneModel.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardSwimlanes
 */

/**
 * Mixin that handles swimlanes for the TaskBoard.
 *
 * @mixin
 */
export default Target => class TaskBoardSwimlanes extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardSwimlanes';

    static configurable = {
        /**
         * Store containing the TaskBoard swimlanes.
         *
         * @member {Core.data.Store} swimlanes
         * @category Common
         */
        /**
         * Store containing the TaskBoard swimlanes. A tasks {@link #config-swimlaneField} is matched against the `id`
         * of a swimlane to determine in which swimlane it is displayed.
         *
         * Accepts an array of swimlane records/objects, a store instance, a store id or a store config object used to
         * create a new store.
         *
         * When supplying an array, a store configured with {@link Core.data.mixin.StoreProxy#config-objectify} is
         * automatically created. Using that config allows for a nicer interaction syntax with the swimlanes:
         *
         * ```javascript
         * // Without objectify:
         * taskBoard.swimlanes.getById('highprio').text = 'Important!';
         *
         * // With objectify:
         * taskBoard.swimlanes.done.text = 'Finished';
         * ```
         *
         * When supplying strings, the raw string will be used as the swimlanes `id` and a capitalized version of it is
         * used as the swimlanes text:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *    swimlanes : [
         *        'high',
         *        'low'
         *    ]
         * });
         * ```
         *
         * Is equivalent to:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *    swimlanes : [
         *        { id : 'high', text : 'High' },
         *        { id : 'low', text : 'Low' }
         *    ]
         * });
         * ```
         *
         * @config {TaskBoard.model.SwimlaneModel[]|SwimlaneModelConfig[]|Core.data.Store|String|StoreConfig}
         * @category Common
         */
        swimlanes : {},

        /**
         * Set to `true` to auto generate swimlanes when {@link #config-swimlanes} is undefined.
         *
         * A swimlane will be created for each distinct value of {@link #config-swimlaneField} on the tasks. The
         * swimlanes will be sorted in alphabetical order. The following snippet will yield two swimlanes, Q1 and Q2:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    swimlaneField : 'quarter',
         *
         *    autoGenerateSwimlanes : true,
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
        autoGenerateSwimlanes : false,

        /**
         * Field on a task record used to determine which swimlane the task belongs to.
         *
         * ```javascript
         * taskBoard.swimlaneField = 'category';
         * ```
         *
         * @member {String} swimlaneField
         * @category Common
         */
        /**
         * Field on a task record used to determine which swimlane the task belongs to.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    // Use the "prio" field of tasks to determie which swimlane a task belongs to
         *    swimlaneField : 'prio',
         *
         *    swimlanes : [
         *        'high',
         *        'low'
         *    ],
         *
         *    project : {
         *        tasksData : [
         *            // Linked using the prio field, to the high swimlane
         *            { id : 1, name : 'Fun task', prio : 'high' }
         *        ]
         *    }
         * });
         * ```
         *
         * @config {String}
         * @category Common
         */
        swimlaneField : null
    };

    static properties = {
        shouldAutoGenerateSwimlanes : false
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeAutoGenerateSwimlanes(autoGenerateSwimlanes) {
        ObjectHelper.assertBoolean(autoGenerateSwimlanes, 'autoGenerateSwimlanes');

        return autoGenerateSwimlanes;
    }

    changeSwimlaneField(swimlaneField) {
        ObjectHelper.assertString(swimlaneField, 'swimlaneField');

        return swimlaneField;
    }

    //endregion

    //region Config - swimlaneField

    updateSwimlaneField(field, old) {
        if (!this.isConfiguring) {
            const { storage } = this.project.taskStore;

            if (old && old !== this.columnField) {
                storage.removeIndex(old);
            }

            storage.addIndex({ property : field, unique : false });
        }
        this.shouldAutoGenerateSwimlanes = field && this.autoGenerateSwimlanes;
    }

    //endregion

    //region Config - swimlanes

    changeSwimlanes(swimlanes) {
        return Store.from(swimlanes, { objectify : true, modelClass : SwimlaneModel }, lane => {
            if (typeof lane === 'string') {
                return { id : lane, text : StringHelper.capitalize(lane) };
            }

            return lane;
        });
    }

    updateSwimlanes(swimlanes) {
        this.detachListeners('swimlanes');

        if (swimlanes) {
            // Link to us to be able to retrieve tasks in visual order
            // $store is the store instance of an objectified store
            (swimlanes.$store || swimlanes).taskBoard = this;

            swimlanes.ion({
                change  : 'onSwimlanesChange',
                refresh : 'onSwimlanesChange',
                thisObj : this
            });
        }
    }

    get swimlanes() {
        const
            me            = this,
            { taskStore } = me.project;

        // If there are no swimlanes defined but we have a swimlane field configured and we have tasks loaded, generate
        // swimlanes from the tasks
        if (me.shouldAutoGenerateSwimlanes && taskStore.count) {
            me.swimlanes = taskStore.getDistinctValues(me.swimlaneField).sort();
            me.shouldAutoGenerateSwimlanes = false;
        }

        return me._swimlanes;
    }

    onSwimlanesChange({ action }) {
        // CRUD invalidates column/swimlane intersection index
        if (action === 'add' || action === 'remove' || action === 'removeAll' || action === 'update') {
            this.project.taskStore.storage.invalidateIndices();
        }

        if (action === 'remove' ||  action === 'update' || action === 'filter') {
            const options = {};

            if (action === 'update') {
                options.addTransition = { height : 1, opacity : 1 };
                options.removeTransition = { height : 1, opacity : 1 };
            }

            this.recomposeWithDomTransition(options);
            return;
        }

        this.recompose();
    }

    //endregion

    //region Data

    get hasSwimlanes() {
        return Boolean(this.swimlaneField && this.swimlanes?.count);
    }

    getSwimlaneTasks(swimlaneRecord) {
        return this.project.taskStore.storage.findItem(this.swimlaneField, swimlaneRecord.id);
    }

    getSwimlane(taskRecord) {
        return this.swimlaneField && this.swimlanes?.getById(taskRecord.getValue(this.swimlaneField));
    }

    //endregion

};
