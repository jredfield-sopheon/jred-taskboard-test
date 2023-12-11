import TaskBoardFeature from './TaskBoardFeature.js';
import TaskItem from '../view/item/TaskItem.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import Editor from '../../Core/widget/Editor.js';

const actions = {
    editNext     : 1,
    cancel       : 1,
    editPrevious : 1,
    complete     : 1
};

/**
 * @module TaskBoard/feature/SimpleTaskEdit
 */

/**
 * This feature allows inline editing of tasks. Double clicking an item starts editing it:
 *
 * {@inlineexample TaskBoard/feature/SimpleTaskEdit.js}
 *
 * Each {@link TaskBoard.view.item.TaskItem task item} can define an
 * {@link TaskBoard.view.item.TaskItem#config-editor}. To prevent an item from being edited inline, configure it with
 * `editor : null`:
 *
 * {@inlineexample TaskBoard/feature/SimpleTaskEditCustom.js}
 *
 * This feature is **disabled** by default.
 *
 * {@region Keyboard shortcuts}
 * The feature has the following default keyboard shortcuts:
 *
 * | Keys            | Action         | Action description                                                                   |
 * |-----------------|----------------|--------------------------------------------------------------------------------------|
 * | `Enter`         | *editNext*     | In an editor this will accept the change and start editing the next item on that card or the first item on the next card. By default it adds a new task when pressed on the last item of the last card in a column. This behaviour is configurable using the {@link #config-addNewAtEnd} config. |
 * | `Escape`        | *cancel*       | Cancels editing and reverts changes for that item which is currently being edited    |
 * | `Shift`+`Enter` | *editPrevious* | In an editor this will accept the change and start editing the previous item on that card or the last item on the previous card |
 * | `Ctrl`+`Enter`  | *complete*     | Accepts the edit and closes the editor                                               |
 *
 * <div class="note">Please note that <code>Ctrl</code> is the equivalent to <code>Command</code> and <code>Alt</code>
 * is the equivalent to <code>Option</code> for Mac users</div>
 *
 * For more information on how to customize keyboard shortcuts, please see
 * [our guide](#TaskBoard/guides/customization/keymap.md).
 * {@endregion}
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype simpleTaskEdit
 * @feature
 */
export default class SimpleTaskEdit extends TaskBoardFeature {

    static $name = 'SimpleTaskEdit';

    static type = 'simpleTaskEdit';

    static configurable = {
        /**
         * Pressing `Enter` in last item on last task in a column adds a new task.
         * @config {Boolean}
         * @default
         */
        addNewAtEnd : true,

        /**
         * A configuration object for the {@link Core.widget.Editor} used by this feature. Useful when you want to
         * validate the value being set by the end user (see {@link Core.widget.Editor#event-beforeComplete}).
         *
         * @config {EditorConfig}
         */
        editorConfig : {},

        /**
         * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
         * @config {Object<String,String>}
         */
        keyMap : {
            Enter         : 'editNext',
            Escape        : 'cancel',
            'Ctrl+Enter'  : 'complete',
            'Shift+Enter' : 'editPrevious'
        }
    };

    static pluginConfig = {
        assign : ['editTask'],
        before : ['onActivateTask']
    };

    //region Type assertions

    changeAddNewAtEnd(addNewAtEnd) {
        ObjectHelper.assertBoolean(addNewAtEnd, 'features.simpleTaskEdit.addNewAtEnd');

        return addNewAtEnd;
    }

    //endregion

    /**
     * Starts inline editing of the supplied task, optionally for a specific item on its card.
     * @on-owner
     * @param {TaskBoard.model.TaskModel} taskRecord Task record to edit
     * @param {HTMLElement} [element] Card element or card item element to edit. Resolves element from the passed record
     * if left out.
     * @returns {Boolean} Returns `true` if editing started, `false` if it did not.
     */
    editTask(taskRecord, element) {
        const
            me        = this,
            taskBoard = me.client;

        // Get element from record if none supplied
        if (!element) {
            element = taskBoard.getTaskElement(taskRecord);
        }

        const
            // Get a task item from the element, will yield first task item when given the card element
            taskItem         = taskBoard.resolveTaskItem(element),
            itemElement      = taskItem.element,
            itemEditorConfig = TaskItem.getEditorConfig(taskItem);

        // Allow disabling editing for an item using `editor : null`
        if (!itemEditorConfig) {
            return false;
        }

        /**
         * Fires on the owning TaskBoard before displaying an inline editor. Returning `false` stops the editor from
         * being shown.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    listeners : {
         *        beforeSimpleTaskEdit({ taskRecord }) {
         *            // Some condition for which editing should be blocked...
         *            if (taskRecord.disallowed) {
         *                return false;
         *            }
         *        }
         *    }
         * });
         * ```
         *
         * @event beforeSimpleTaskEdit
         * @preventable
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source The task board
         * @param {TaskBoard.feature.SimpleTaskEdit} simpleTaskEdit The simpleTaskEdit feature
         * @param {TaskBoard.model.TaskModel} taskRecord The record about to be shown in the editor
         * @param {String} field Field name being edited
         */
        // Give clients a shot at preventing editing
        if (
            me.disabled || taskRecord.readOnly ||
            taskBoard.trigger('beforeSimpleTaskEdit', { simpleTaskEdit : me, taskRecord, field : taskItem.config.field }) === false
        ) {
            return true;
        }

        // Focus the card to ensure focus reverts to it when editor closes
        element.focus();

        const editor = me.editor = Editor.new({
            owner        : taskBoard,
            appendTo     : itemElement.parentNode,
            scrollAction : 'realign',
            cls          : 'b-simple-task-editor',
            completeKey  : null,
            cancelKey    : null,
            inputField   : {
                autoSelect : true,
                name       : taskItem.config.field,
                ...itemEditorConfig
            },
            align : {
                align          : 'c-c',
                allowTargetOut : false
            },
            internalListeners : {
                complete   : 'onEditorComplete',
                cancel     : 'onEditorCancel',
                finishEdit : 'onEditorFinishEdit',
                thisObj    : me
            }
        }, me.editorConfig);

        // Store active element, to be able to navigate to next/prev later if requested
        me.currentElement = itemElement;

        // Add editing cls, will be cleared by recompose
        itemElement.classList.add('b-editing');

        // Match editor color to item color
        const color = DomHelper.getStyleValue(itemElement, 'color');
        editor.element.style.color = color;
        editor.inputField.element.style.color = color;

        // Don't want a recompose removing editor element
        editor.element.retainElement = true;

        // Scrolling card into view
        taskBoard.getTaskElement(taskRecord).scrollIntoView({
            block : 'nearest'
        });

        // And then item being edited. Two steps since first one won't do anything if card is already in view while item
        // is not
        itemElement.scrollIntoView({
            block : 'nearest'
        });

        editor.startEdit({
            target : taskItem.element,
            record : taskRecord,
            field  : taskItem.config.field
        });

        return true;
    }

    // Edit previous task item
    async editPrevious(event) {
        const
            me                 = this,
            { client, editor } = me,
            taskRecord         = editor.record,
            cardElement        = client.getTaskElement(taskRecord),
            itemElements       = Array.from(cardElement.querySelectorAll('.b-taskboard-taskitem.b-editable')),
            index              = itemElements.indexOf(me.currentElement) - 1;

        if (await me.complete(event)) {
            // More items on the card, edit prev item
            if (index >= 0) {
                me.editTask(taskRecord, itemElements[index]);
            }
            // No more items
            else {
                const prevTaskRecord = client.getPreviousTask(taskRecord, false);
                // Edit last item of prev card
                if (prevTaskRecord) {
                    const
                        prevCardElement  = client.getTaskElement(prevTaskRecord),
                        prevItemElements = Array.from(prevCardElement.querySelectorAll('.b-taskboard-taskitem.b-editable'));

                    me.editTask(prevTaskRecord, prevItemElements[prevItemElements.length - 1]);
                }
            }
        }
    }

    // Edit next task item
    async editNext(event) {
        const
            me                 = this,
            { client, editor } = me,
            taskRecord         = editor.record,
            cardElement        = client.getTaskElement(taskRecord),
            itemElements       = Array.from(cardElement.querySelectorAll('.b-taskboard-taskitem.b-editable')),
            index              = itemElements.indexOf(me.currentElement) + 1;

        if (await me.complete(event)) {
            // More items on the card, edit next item
            if (index < itemElements.length) {
                me.editTask(taskRecord, itemElements[index]);
            }
            // No more items
            else {
                const nextTaskRecord = client.getNextTask(taskRecord, false);
                // Edit next card
                if (nextTaskRecord) {
                    me.editTask(nextTaskRecord);
                }
                // Or add a new card
                else if (me.addNewAtEnd) {
                    client.addTask(client.getColumn(taskRecord), client.getSwimlane(taskRecord));
                }
            }
        }
    }

    complete(event) {
        return this.editor.completeEdit(null, event);
    }

    cancel(event) {
        this.editor.cancelEdit(event);
    }

    // Start editing when activating task (enter/dblclick)
    onActivateTask({ taskRecord, event }) {
        if (this.editTask(taskRecord, event.target)) {
            // Block other actions (TaskEdit)
            event.preventDefault();
        }
    }

    onEditorComplete({ source }) {
        /**
         * Fires on the owning TaskBoard when inline editing of a field has successfully finished.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    listeners : {
         *        simpleTaskEditComplete({ taskRecord, field }) {
         *            Toast.show(`Finished editing ${field} of ${taskRecord.name}`);
         *        }
         *    }
         * });
         * ```
         *
         * @event simpleTaskEditComplete
         * @preventable
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source The task board
         * @param {TaskBoard.feature.SimpleTaskEdit} simpleTaskEdit The simpleTaskEdit feature
         * @param {TaskBoard.model.TaskModel} taskRecord Record that was edited
         * @param {String} field Field name being edited
         */
        this.client.trigger('simpleTaskEditComplete', { simpleTaskEdit : this, taskRecord : source.record, field : source.dataField  });
    }

    onEditorCancel({ source }) {
        /**
         * Fires on the owning TaskBoard when inline editing of a field is cancelled (by pressing ESC).
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    listeners : {
         *        simpleTaskEditCancel({ taskRecord }) {
         *            Toast.show(`Aborted editing of ${taskRecord.name}`);
         *        }
         *    }
         * });
         * ```
         *
         * @event simpleTaskEditCancel
         * @preventable
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source The task board
         * @param {TaskBoard.feature.SimpleTaskEdit} simpleTaskEdit The simpleTaskEdit feature
         * @param {TaskBoard.model.TaskModel} taskRecord Record that was edited
         * @param {String} field Field name being edited
         */
        this.client.trigger('simpleTaskEditCancel', { simpleTaskEdit : this, taskRecord : source.record, field : source.dataField  });
    }

    onEditorFinishEdit() {
        // Have to store editor before the timeout, might get replaced by new
        const
            me = this,
            { editor } = me;

        editor?.setTimeout(() => {
            // Don't retain the element if we did not start editing something else
            if (me.editor === editor) {
                me.currentElement = null;
                me.editor = null;
            }

            editor.destroy();
        }, 0);
    }

    // All keyMap actions require that we are editing
    isActionAvailable({ actionName }) {
        if (actions[actionName]) {
            return Boolean(this.editor);
        }
    }
}

SimpleTaskEdit.initClass();
