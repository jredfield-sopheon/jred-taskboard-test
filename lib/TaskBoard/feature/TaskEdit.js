import Widget from '../../Core/widget/Widget.js';
import BrowserHelper from '../../Core/helper/BrowserHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import TaskBoardFeature from './TaskBoardFeature.js';
import Scroller from '../../Core/helper/util/Scroller.js';
import '../widget/TaskEditor.js';
// Ensure SlideToggle is present so that type : 'checkbox' can be switched out on mobile
import '../../Core/widget/SlideToggle.js';

/**
 * @module TaskBoard/feature/TaskEdit
 */

/**
 * This features allows the user to edit tasks in a popup editor that can either be shown centered on screen (the
 * default, double click a task to show the editor):
 *
 * {@inlineexample TaskBoard/feature/TaskEdit.js}
 *
 * Or anchored to a task:
 *
 * {@inlineexample TaskBoard/feature/TaskEditAnchored.js}
 *
 * ## Default items
 *
 * By default it displays the following items:
 *
 * | Ref           | Type                                                   | Weight | Comment                                                                   |
 * |---------------|--------------------------------------------------------|--------|---------------------------------------------------------------------------|
 * | `name`        | {@link Core.widget.TextField text}                     | 100    | Task {@link TaskBoard.model.TaskModel#field-name}                         |
 * | `description` | {@link Core.widget.TextAreaField textarea}             | 200    | Task {@link TaskBoard.model.TaskModel#field-description}                  |
 * | `resources`*  | {@link TaskBoard.widget.ResourcesCombo resourcescombo} | 300    | Assigned resources                                                        |
 * | `color`       | {@link TaskBoard.widget.TaskColorCombo taskcolorcombo} | 400    | Task {@link TaskBoard.model.TaskModel#field-eventColor}                   |
 * | `column`      | {@link TaskBoard.widget.ColumnCombo columncombo}       | 500    | Bound to configured {@link TaskBoard.view.TaskBoard#config-columnField}   |
 * | `swimlane`*   | {@link TaskBoard.widget.SwimlaneCombo swimlanecombo}   | 600    | Bound to configured {@link TaskBoard.view.TaskBoard#config-swimlaneField} |
 * <sup>*</sup> Only shown when using resources / swimlanes respectively
 *
 * You can modify or remove the default items and add new custom items to the editor either at config time by using the
 * {@link #config-items items config} or at runtime by using the {@link #config-processItems processItems config}.
 *
 * ## Customize when configuring
 *
 * The {@link #config-items items config} accepts an object keyed by item ref (as listed in the table above). This
 * object will be merged with default items and the end result will determine which items are shown and how they are
 * configured.
 *
 * ### To remove a default item
 *
 * Set a ref to `null` to remove the item from the editor:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    features : {
 *        taskEdit : {
 *            items : {
 *                // Remove the color field
 *                color : null
 *            }
 *        }
 *    }
 * });
 * ```
 *
 * {@inlineexample TaskBoard/feature/TaskEditRemove.js}
 *
 * ### To modify a default item
 *
 * Supply an object with the configs you want to change for a ref to modify the corresponding field:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    features : {
 *        taskEdit : {
 *            items : {
 *                // Change label of the description field and move it to the bottom
 *                description : {
 *                    label : 'Comment',
 *                    weight : 700
 *                }
 *            }
 *        }
 *    }
 * });
 * ```
 *
 * {@inlineexample TaskBoard/feature/TaskEditModify.js}
 *
 * ### To add a custom item
 *
 * Supply a config object for the new item, using a ref that is not used by any default item:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    features : {
 *        taskEdit : {
 *            items : {
 *                // Change label of the description field and move it to the bottom
 *                deadline : {
 *                    type   : 'date',
 *                    label  : 'Deadline',
 *                    weight : 300,
 *                    name   : 'deadline' // Bound field. If it matches the ref (key) for the field, it can be left out
 *                }
 *            }
 *        }
 *    }
 * });
 * ```
 *
 * {@inlineexample TaskBoard/feature/TaskEditAdd.js}
 *
 * ## Customize at runtime
 *
 * By supplying a function to {@link #config-processItems} you gain runtime control over which items are shown and how
 * they are configured:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    features : {
 *        taskEdit : {
 *            processItems({ taskRecord, items }) {
 *                // Hide description for tasks that are done
 *                if (taskRecord.status === 'done') {
 *                    items.description = null;
 *                }
 *
 *                // Modify the label for the name field
 *                items.name.label = 'Title';
 *
 *                // Add a custom item for high prio tasks
 *                if (taskRecord.prio === 'high') {
 *                    items.severity = { type : 'number', name : 'severity', label : 'Severity' }
 *                }
 *            }
 *        }
 *    }
 * });
 * ```
 *
 * You can also use `processItems` to prevent the editor from being shown for certain tasks, by returning `false` from
 * the function.
 *
 * {@inlineexample TaskBoard/feature/TaskEditProcessItems.js}
 *
 * ## Customizing other aspects of the editor
 *
 * By supplying an {@link #config-editorConfig} you can customize other aspects of the editor, such as its size, how
 * it is anchored, its title etc.
 *
 * {@inlineexample TaskBoard/feature/TaskEditEditorConfig.js}
 *
 * This feature is **enabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype taskEdit
 * @feature
 */
export default class TaskEdit extends TaskBoardFeature {
    static $name = 'TaskEdit';

    static type = 'taskEdit';

    static configurable = {
        /**
         * Type of widget to use as the editor. Should point to a subclass of {@link TaskBoard.widget.TaskEditor} or
         * a widget mimicking its API.
         * @config {String}
         * @default
         * @category Customization
         */
        editorType : 'taskboardtaskeditor',

        /**
         * Config object merged with the default configuration of the editor (by default a
         * {@link TaskBoard.widget.TaskEditor}).
         *
         * Can be used to configure any aspect of the editor:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     features : {
         *         taskEdit : {
         *             editorConfig : {
         *                 modal    : false,
         *                 centered : false
         *             }
         *         }
         *     }
         * });
         * ```
         * To customize the items in the editor, using {@link #config-items} is preferable.
         * @config {TaskEditorConfig}
         * @category Customization
         */
        editorConfig : {},

        /**
         * Items definition passed on to the configured editor (by default a {@link TaskBoard.widget.TaskEditor}).
         *
         * Can be used to add new items or modify and remove predefined items. To remove, supply `null` as the value.
         *
         * @config {Object<String,ContainerItemConfig|Boolean|null>}
         * @category Customization
         */
        items : {},

        /**
         * A function called before displaying the editor that allows manipulation of its items.
         * Returning `false` from this function prevents the editor from being shown.
         *
         * ```javascript
         * features         : {
         *    taskEdit : {
         *         processItems({ items, taskRecord, columnRecord, swimlaneRecord }) {
         *             // Manipulate existing items here as needed
         *             items.name.label = taskRecord.type === 'task' ? 'Task' : 'Issue';
         *
         *            // Remove column field when editing tasks that are done
         *            if (columnRecord.id === 'done') {
         *                items.column = false
         *            }
         *         }
         *     }
         * },
         * ```
         *
         * @config {Function}
         * @param {Object} context An object with information about the editor being shown
         * @param {Object<String,ContainerItemConfig>} context.items An object containing the editor item configs keyed by ref
         * @param {TaskBoard.model.TaskModel} context.taskRecord Record representing task being edited
         * @param {TaskBoard.model.ColumnModel} context.columnRecord Record representing tasks column
         * @param {TaskBoard.model.SwimlaneModel} context.swimlaneRecord Record representing tasks swimlane
         * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
         * @preventable
         */
        processItems : null

        // /**
        //  * The event that shall trigger showing the editor. Defaults to `eventdblclick`, set to `` or null to disable editing of existing events.
        //  * @config {String}
        //  * @default
        //  * @category Editor
        //  */
        // triggerEvent : 'eventdblclick',

        // /**
        //  * Specify `true` to put the editor in read only mode.
        //  * @config {Boolean}
        //  * @default false
        //  */
        // readOnly : null,
    };

    editor = null;

    static pluginConfig = {
        assign : ['editTask'],
        chain  : ['onActivateTask', 'populateTaskMenu']
    };

    doDestroy() {
        this.editor?.destroy();
    }

    //region Type assertions

    changeEditorConfig(editorConfig) {
        ObjectHelper.assertObject(editorConfig, 'features.taskEdit.editorConfig');

        return editorConfig;
    }

    changeEditorType(editorType) {
        ObjectHelper.assertString(editorType, 'features.taskEdit.editorType');

        return editorType;
    }

    changeItems(items) {
        ObjectHelper.assertObject(items, 'features.taskEdit.items');

        return items;
    }

    changeProcessItems(processItems) {
        ObjectHelper.assertFunction(processItems, 'features.taskEdit.processItems');

        return processItems;
    }

    //endregion

    /**
     * Edit the supplied task in the task editor.
     *
     * ```javascript
     * taskBoard.editTask(taskStore.first);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord Task to edit
     * @param {HTMLElement} [element] Optionally an element to align to, by default it tries to resolve one from the
     * supplied task when the editor is configured to not be centered.
     * @on-owner
     * @category Common
     */
    async editTask(taskRecord, element = null) {
        const
            me             = this,
            { client }     = me,
            columnRecord   = client.getColumn(taskRecord),
            swimlaneRecord = client.swimlaneField && client.swimlanes?.getById(taskRecord.getValue(client.swimlaneField));

        if (me.disabled) {
            return;
        }

        /**
         * Fires on the owning TaskBoard before a task is displayed in an editor.
         *
         * Returning `false` or a promise that resolves to `false` stops the default editing UI from being shown.
         *
         * ```javascript
         * taskBoard.on({
         *     beforeTaskEdit({ taskRecord }) {
         *         return await userCanEdit(taskRecord);
         *     }
         * }
         * ```
         *
         * @event beforeTaskEdit
         * @param {TaskBoard.view.TaskBoard} source The owning TaskBoard
         * @param {TaskBoard.model.TaskModel} taskRecord The record about to be shown in the task editor
         * @on-owner
         * @preventable
         * @async
         */
        if (await client.trigger('beforeTaskEdit', { taskRecord }) === false) {
            return;
        }

        if (me.isEditing) {
            me.cancelEdit();
        }


        const
            editorClass   = Widget.resolveType(me.editorType),
            // Combine items defined on the feature with those defined on the editor
            combinedItems = editorClass.mergeConfigs(editorClass.$meta.config.items, me.items),
            // Allow user supplied fn to process the items, returning false will abort edit
            processResult = me.processItems?.({ items : combinedItems, taskRecord, columnRecord, swimlaneRecord });

        if (processResult === false) {
            return;
        }

        const editor = me.editor = editorClass.new({
            items    : combinedItems,
            owner    : client,
            readOnly : taskRecord.readOnly
        }, me.editorConfig);

        /**
         * Fires on the owning TaskBoard when the editor for a task is available, but before it is populated with data
         * and shown. Allows manipulating fields etc.
         *
         * ```javascript
         * taskBoard.on({
         *     beforeTaskEditShow({ taskRecord, editor }) {
         *         editor.title = `Editing "${taskRecord.name}"`;
         *     }
         * }
         * ```
         *
         * @event beforeTaskEditShow
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source The owning TaskBoard
         * @param {TaskBoard.model.TaskModel} taskRecord The record about to be shown in the task editor
         * @param {TaskBoard.widget.TaskEditor} editor The editor
         */
        client.trigger('beforeTaskEditShow', { taskRecord, editor });

        editor.record = taskRecord;

        if (editor.centered || !BrowserHelper.isHoverableDevice) {
            editor.show();
        }
        else {
            Scroller.scrollIntoView(element ?? client.getTaskElement(taskRecord));
            editor.showBy(element ?? client.getTaskElement(taskRecord));
        }

        editor.isVisible && editor.ion({
            hide    : me.onEditorHide,
            thisObj : me
        });
    }

    cancelEdit() {

    }

    onActivateTask({ taskRecord, event }) {
        if (!event.defaultPrevented) {
            this.editTask(taskRecord);
        }
    }

    populateTaskMenu({ items, taskRecord }) {
        if (!this.client.readOnly && !this.disabled) {
            items.editTask = {
                text     : 'L{TaskBoard.editTask}',
                icon     : 'b-fw-icon b-icon-edit',
                weight   : 100,
                onItem   : () => this.editTask(taskRecord),
                disabled : taskRecord.readOnly
            };
        }
    }

    onEditorHide() {
        this.client.getTaskElement(this.editor.record)?.focus();
    }
}

TaskEdit.initClass();
