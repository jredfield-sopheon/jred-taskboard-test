import Base from '../../../Core/Base.js';
import ArrayHelper from '../../../Core/helper/ArrayHelper.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import ProjectModel from '../../model/ProjectModel.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardStores
 */

/**
 * Mixin that handles TaskBoards stores, managed by a {@link TaskBoard.model.ProjectModel project}.
 *
 * @mixin
 */
export default Target => class TaskBoardStores extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardStores';

    static configurable = {
        projectModelClass : ProjectModel,

        /**
         * The {@link TaskBoard.model.ProjectModel} instance, containing the data visualized by the TaskBoard.
         * @member {TaskBoard.model.ProjectModel} project
         * @accepts {TaskBoard.model.ProjectModel|ProjectModelConfig} project
         * @category Common
         */
        /**
         * A {@link TaskBoard.model.ProjectModel#configs project config object} or an instance that holds all stores and
         * data used by the TaskBoard.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     project : {
         *         // Use a custom task model
         *         taskModelClass : MyTaskModel,
         *
         *         // Supply inline data
         *         tasksData : [
         *             { id : 1, name: 'Task 1', ... },
         *             ...
         *         ]
         * });
         * ```
         *
         * Project has built-in crud manager functionality to handle syncing with a backend:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     project : {
         *         transport : {
         *             load : {
         *                 url : 'data/data.json'
         *             }
         *     },
         *     autoLoad : true
         * });
         *
         * Also has built-in state tracking manager functionality to handle undo/redo:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     stm : {
         *         autoRecord : true,
         *         disabled   : false
         *     }
         * });
         *
         * @config {TaskBoard.model.ProjectModel|ProjectModelConfig}
         * @category Data
         */
        project : {},

        /**
         * Inline {@link Scheduler.model.AssignmentModel assignments}, will be loaded into an internally created
         * {@link Scheduler.data.AssignmentStore}  as a part of a {@link TaskBoard.model.ProjectModel project}.
         * @prp {Scheduler.model.AssignmentModel[]|Object[]} assignments
         * @category Data
         */
        assignments : null,

        /**
         * Inline {@link Scheduler.model.ResourceModel resources}, will be loaded into an internally created
         * {@link Scheduler.data.ResourceStore} as a part of a {@link TaskBoard.model.ProjectModel project}.
         * @prp {Scheduler.model.ResourceModel[]|Object[]} resources
         * @category Data
         */
        resources : null,

        /**
         * Inline {@link TaskBoard.model.TaskModel tasks}, will be loaded into an internally created
         * {@link TaskBoard.store.TaskStore} as a part of a {@link TaskBoard.model.ProjectModel project}.
         * @prp {TaskBoard.model.TaskModel[]|Object[]} tasks
         * @category Data
         */
        tasks : null,

        /**
         * Default values to apply to task records created by task boards features (such as the column header menu and
         * the column toolbar)
         *
         * @config {TaskModelConfig}
         * @category Data
         */
        newTaskDefaults : {},

        loadMaskDefaults : {
            useTransition : true,
            showDelay     : 100
        },

        /**
         * TaskBoard does not use a sync mask by default. If you want one, see
         * {@link Core.mixin.LoadMaskable#config-syncMask} for configuration options.
         *
         * @config {String|Object|null}
         * @default null
         * @category Masking
         */
        syncMask : null
    };

    get widgetClass() {}

    //endregion

    //#region Inline data

    get assignments() {
        return this.project.assignmentStore.records;
    }

    updateAssignments(records) {
        this.project.assignmentStore.data = records;
    }

    get resources() {
        return this.project.resourceStore.records;
    }

    updateResources(records) {
        this.project.resourceStore.data = records;
    }

    get tasks() {
        return this.project.taskStore.records;
    }

    updateTasks(records) {
        this.project.taskStore.data = records;
    }

    //#endregion

    //region Type assertions

    changeNewTaskDefaults(newTaskDefaults) {
        ObjectHelper.assertObject(newTaskDefaults, 'newTaskDefaults');

        return newTaskDefaults;
    }

    //endregion

    //region Project

    changeProject(project) {
        if (project && !project.isModel) {
            project = this.projectModelClass.new(project);
        }

        this.attachToProject(project);

        return project;
    }

    attachToProject(project) {
        const me = this;

        // Enable masking with CrudManagerView
        me.bindCrudManager(project);

        if (project) {
            const { taskStore } = project;

            // Set up indices for the configured columnField & optional swimlaneField, for faster lookups
            if (taskStore) {
                const { storage } = taskStore;

                storage.addIndex({ property : me.columnField, unique : false });

                if (me.swimlaneField) {
                    storage.addIndex({ property : me.swimlaneField, unique : false });
                }

                // For quicker lookup of tasks in a swimlane/column intersection
                Reflect.defineProperty(taskStore.$master.modelClass.prototype, 'columnSwimlaneIntersection', {
                    get() {
                        return this.buildIndexKey({
                            [me.columnField]   : this[me.columnField],
                            [me.swimlaneField] : this[me.swimlaneField]
                        });
                    }
                });

                taskStore.$master.modelClass.prototype.buildIndexKey = function(data) {
                    return `${data[me.columnField]}-/-${(me.swimlanes?.count && data[me.swimlaneField]) || 'default'}`;
                };

                storage.addIndex({ property : 'columnSwimlaneIntersection', unique : false, dependentOn : { [me.swimlaneField] : true, [me.columnField] : true } });
            }

            // Setup store listeners, mostly just recompose
            me.attachToProjectStore(project.taskStore, {
                change          : 'onTaskStoreChange',
                changePreCommit : 'onTaskStoreEarlyChange',
                refresh         : 'onTaskStoreRefresh'
            });
            me.attachToProjectStore(project.assignmentStore);
            me.attachToProjectStore(project.resourceStore);
        }
    }

    // Most store changes leads to a recompose, with exception of some TaskStore changes that are transitioned
    attachToProjectStore(store, listenersConfig = {}) {
        this.detachListeners(store.$name);

        store?.ion({
            name    : store.$name,
            change  : 'recompose',
            refresh : 'recompose',
            thisObj : this,

            ...listenersConfig
        });
    }

    //endregion

    //region Listeners

    onTaskStoreEarlyChange({ action }) {
        if (action === 'add') {
            this.recomposeWithDomTransition({
                addTransition : {
                    height  : 1,
                    opacity : 1
                }
            });
        }
    }

    onTaskStoreChange({ action, changes }) {
        const { columnField, swimlaneField } = this;

        // Task removal and column/swimlane changes are transitioned
        if (
            action === 'remove' ||
            action === 'filter' ||
            (action === 'update' && (changes[columnField] || (swimlaneField && changes[swimlaneField])))
        ) {
            this.recomposeWithDomTransition({
                removeTransition : {
                    height  : 1,
                    opacity : 1
                }
            });
        }
        else {
            this.recompose();
        }
    }

    onTaskStoreRefresh({ action }) {
        if (action === 'sort') {
            // Ignore sort if we override it anyway
            !this.taskSorterFn && this.recomposeWithDomTransition();
        }
        else {
            this.recompose();
        }
    }

    //endregion

    //region Utility

    /**
     * Add a new task to the specified column / swimlane intersection (swimlane is optional), scroll it into view and
     * start editing it (if an editing feature is enabled).
     *
     * By default the task is created using the data defined in the {@link #config-newTaskDefaults} combined with values
     * for the `columnField`, the `swimlaneField` and a generated `weight` to place it last. To override these or to
     * supply your own values for any field, pass the `taskData` argument.
     *
     * If project is configured to auto sync changes to backend, the sync request will be awaited before editing starts.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord Column to add the task to
     * @param {TaskBoard.model.ColumnModel} [swimlaneRecord] Swimlane to add the task to
     * @param {Object} [taskData] Data for the new task
     * @category Common
     */
    async addTask(columnRecord, swimlaneRecord = null, taskData = {}) {
        const
            me         = this,
            {
                swimlaneField,
                swimlanes,
                project
            }          = me,
            columnBody = me.getColumnElement(columnRecord).syncIdMap.body,
            lastCard   = columnBody.lastElementChild,
            data       = {
                [me.columnField] : columnRecord.id,
                name             : me.L('L{TaskBoard.newTaskName}'),
                weight           : (project.taskStore.max('weight') ?? 0) + 100,
                ...me.newTaskDefaults,
                ...taskData
            };

        let suspended = false;

        if (swimlaneField) {
            if (swimlaneRecord) {
                data[swimlaneField] = swimlaneRecord.id;
            }
            else if (swimlanes?.count) {
                data[swimlaneField] = swimlanes.first.id;
            }
        }

        // If add is likely to cause a scroll, opt out of add transition and only animated the scroll
        if (lastCard && lastCard.offsetTop + lastCard.offsetHeight > columnBody.clientHeight - 100) {
            me.suspendDomTransition();
            suspended = true;
        }

        const
            // A sync will be scheduled on the add below if using autoSync, catch that
            synced       = project.autoSync && project.await('sync', false),
            [taskRecord] = project.taskStore.add(data);

        // To have new tasks element available when trying to scroll to it
        me.recompose.now();

        // Await transition used when adding tasks, to be certain task is at correct pos
        if (me.useDomTransition && !me.domTransitionSuspended) {
            await me.await('transitionedRecompose', false);
        }

        if (me.isDestroyed) {
            return;
        }

        // Await scroll to make sure inline editing works as expected
        await me.scrollToTask(taskRecord, ObjectHelper.assign({}, me.scrollOptions, { highlight : false, block : 'nearest' }));

        if (me.isDestroyed) {
            return;
        }

        // Await any autoSync that we caught above
        if (synced) {
            await synced;

            if (me.isDestroyed) {
                return;
            }

            // Sync likely assigned a new id, make sure we are using that in DOM right away
            me.recompose.now();
        }

        suspended && me.resumeDomTransition();

        if (me.features.simpleTaskEdit) {
            me.editTask(taskRecord);
        }

        return taskRecord;
    }

    /**
     * Removes one or more tasks from the linked task store (and thus the TaskBoard).
     *
     * First fires a `'beforeTaskRemove'` event, which is preventable and async. Return `false` or a promise that
     * resolves to `false` from a listener to prevent the operation.
     *
     * ```javascript
     * taskBoard.on({
     *     async beforeRemoveTask() {
     *         const result = await askForConfirmation();
     *         return result;
     *     }
     * });
     *
     * taskBoard.remove(myTask);
     * ```
     *
     * @param {TaskBoard.model.TaskModel|TaskBoard.model.TaskModel[]} taskRecord A single task or an array thereof to
     * remove from the task store.
     * @returns {Boolean} Returns `true` if the tasks were removed, `false` if the operation was prevented.
     * @category Common
     */
    async removeTask(taskRecord) {
        const taskRecords = ArrayHelper.asArray(taskRecord);

        /**
         * Triggered when one or more tasks are to be removed by a call to `removeTask()`.
         *
         * The UI routes through `removeTask()` (currently only the task menu offers task removal), this event can be
         * used to add a confirmation flow or similar to those actions.
         *
         * Return `false` or a promise that resolves to `false` in a listener to prevent removal.
         *
         * ```javascript
         * taskBoard.on({
         *     async beforeRemoveTask() {
         *         const result = await askForConfirmation();
         *         return result;
         *     }
         * });
         * ```
         *
         * @event beforeTaskRemove
         * @param {TaskBoard.view.TaskBoard} source This TaskBoard
         * @param {TaskBoard.model.TaskModel[]} taskRecords Task records to be removed
         * @preventable
         * @async
         */
        if (await this.trigger('beforeTaskRemove', { taskRecords }) !== false) {
            this.project.taskStore.remove(taskRecords);
            return true;
        }

        return false;
    }

    //endregion
};
