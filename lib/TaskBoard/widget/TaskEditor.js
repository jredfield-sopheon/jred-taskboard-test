import StringHelper from '../../Core/helper/StringHelper.js';
import Popup from '../../Core/widget/Popup.js';
import '../../Core/widget/TextAreaField.js';
import '../../Core/widget/TextField.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';
import './ColumnCombo.js';
import './ResourcesCombo.js';
import './SwimlaneCombo.js';
import './TaskColorCombo.js';

/**
 * @module TaskBoard/widget/TaskEditor
 */

/**
 * Popup used to edit tasks. Normally displayed using the {@link TaskBoard.feature.TaskEdit TaskEdit feature}.
 *
 * By default, the editor live updates the task being edited. If you prefer to use buttons to save/cancel the edit,
 * set {@link #config-autoUpdateRecord} to `false`.
 *
 * ## Items
 *
 * By default, it displays the following items:
 *
 * | Ref         | Type                                                   | Weight | Comment                                                                   |
 * |-------------|--------------------------------------------------------|--------|---------------------------------------------------------------------------|
 * | name        | {@link Core.widget.TextField text}                     | 100    | Task {@link TaskBoard.model.TaskModel#field-name}                         |
 * | description | {@link Core.widget.TextAreaField textarea}             | 200    | Task {@link TaskBoard.model.TaskModel#field-description}                  |
 * | resources   | {@link TaskBoard.widget.ResourcesCombo resourcescombo} | 300    | Assigned resources                                                        |
 * | color       | {@link TaskBoard.widget.TaskColorCombo taskcolorcombo} | 400    | Task {@link TaskBoard.model.TaskModel#field-eventColor}                   |
 * | column      | {@link TaskBoard.widget.ColumnCombo columncombo}       | 500    | Bound to configured {@link TaskBoard.view.TaskBoard#config-columnField}   |
 * | swimlane    | {@link TaskBoard.widget.SwimlaneCombo swimlanecombo}   | 600    | Bound to configured {@link TaskBoard.view.TaskBoard#config-swimlaneField} |
 *
 * If configured with `autoUpdateRecord: false` it also displays a bottom toolbar with the following items:
 *
 * | Ref          | Type                              | Weight | Comment          |
 * |--------------|-----------------------------------|--------|------------------|
 * | saveButton   | {@link Core.widget.Button button} | 100    | Save             |
 * | cancelButton | {@link Core.widget.Button button} | 200    | Cancel           |
 *
 * ## Customization
 *
 * Popup and its items can be customized through the feature (see {@link TaskBoard.feature.TaskEdit} fore more info):
 *
 * {@inlineexample TaskBoard/widget/TaskEditorCustomized.js}
 *
 * Or by subclassing and instructing the feature to display the new editor:
 *
 * {@inlineexample TaskBoard/widget/TaskEditorSubclassed.js}
 *
 * @extends Core/widget/Popup
 * @classtype taskboardtaskeditor
 */
export default class TaskEditor extends Popup.mixin(TaskBoardLinked) {
    static $name = 'TaskEditor';

    static type = 'taskboardtaskeditor';

    static configurable = {

        /**
         * Center the editor in browser viewport space. Defaults to true for desktop browsers using a pointer device
         * @config {Boolean}
         * @default
         * @category Common
         */
        centered : true,

        /**
         * Show an opaque mask below the editor when shown.
         *
         * Clicking the mask closes the editor.
         *
         * @config {Boolean}
         * @default true
         * @category Common
         */
        modal : { closeOnMaskTap : true },

        /**
         * Shows a tool used to close the editor in the header.
         * @config {Boolean}
         * @default
         * @category Common
         */
        closable : true,

        /**
         * By default the editor automatically updates the edited task when a field is changed. Set this to `false`
         * to show Save / Cancel buttons and take manual control of the updating.
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        autoUpdateRecord : true,

        /**
         * Update fields if the {@link #config-record} changes
         * @config {Boolean}
         */
        autoUpdateFields : true,

        /**
         * True to save and close the editor if ENTER is pressed.
         * (The save part only applies when configured with `autoUpdateRecord : false`)
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        saveAndCloseOnEnter : true,

        draggable : {
            handleSelector : '.b-panel-header'
        },

        autoShow : false,

        anchor : true,

        closeAction : 'destroy',

        scrollAction : 'realign',

        title : 'L{TaskBoard.editTask}',

        defaults : {
            labelWidth : '30%'
        },

        width : '30em',

        items : {
            name        : { type : 'text', label : 'L{TaskBoard.name}', weight : 100 },
            description : { type : 'textarea', label : 'L{TaskBoard.description}', height : '5em', weight : 200 },
            resources   : { type : 'resourcescombo', label : 'L{TaskBoard.resources}', weight : 300 },
            color       : { type : 'taskcolorcombo', label : 'L{TaskBoard.color}', name : 'eventColor', weight : 400 },
            column      : { type : 'columncombo', weight : 500 },
            swimlane    : { type : 'swimlanecombo', weight : 600 }
        },

        bbar : {
            hidden : true,
            items  : {
                saveButton   : { text : 'L{TaskBoard.save}', onClick : 'up.onSaveClick', weight : 100 },
                cancelButton : { text : 'L{TaskBoard.cancel}', onClick : 'up.onCancelClick', weight : 200 }
            }
        },

        // We want to maximize on phones and tablets
        maximizeOnMobile : true
    };

    changeItems(items, old) {
        const
            { taskBoard }                   = this,
            { column, swimlane, resources } = items;

        if (taskBoard) {
            // Hook column field up to correct record field
            if (column) {
                if (!column.name) {
                    column.name = taskBoard.columnField;
                }

                if (!column.label) {
                    column.label = StringHelper.capitalize(taskBoard.columnField);
                }
            }

            if (swimlane) {
                // Take the swimlane field out if not using swimlanes
                if (!taskBoard.swimlaneField || !taskBoard.swimlanes) {
                    items.swimlane = null;
                }
                // Otherwise hook it up with correct record field
                else {
                    if (!swimlane.name) {
                        swimlane.name = taskBoard.swimlaneField;
                    }

                    if (!swimlane.label) {
                        swimlane.label = StringHelper.capitalize(taskBoard.swimlaneField);
                    }
                }
            }

            // Remove resources field if there are no resources
            if (!taskBoard.project.resourceStore.count) {
                items.resources = null;
            }

            // Prevent multi selection if using single assignment mode
            if (taskBoard.project.eventStore.usesSingleAssignment && resources) {
                resources.multiSelect = false;
            }
        }
        else {
            items.column = items.swimlane = items.resources = null;
        }

        return super.changeItems(items, old);
    }

    processItemsObject(items, namedItems, result) {
        // Use ref as name if not explicitly set
        for (const ref in items) {
            const item = items[ref];

            if (item && !('name' in item)) {
                item.name = ref;
            }
        }

        return super.processItemsObject(items, namedItems, result);
    }

    updateAutoUpdateRecord(autoUpdate) {
        this.bbar.hidden = autoUpdate;
    }

    updateRecord(record) {
        super.updateRecord(record);

        if (record) {
            // Tag along task id, mainly for tests
            this.element.dataset.taskId = record.id;
        }
    }

    onSaveClick() {
        const
            me                       = this,
            { record, owner }        = me,
            { resources, ...values } = me.values;

        if (me.isValid) {
            /**
             * Fires on the owning TaskBoard when user clicks `Save`, before changes are saved.
             * Returning `false` from a listener prevents saving and keeps the editor open.
             * @event beforeSave
             * @on-owner
             * @preventable
             * @param {TaskBoard.view.TaskBoard} source The taskboard
             * @param {TaskBoard.widget.TaskEditor} editor The editor
             * @param {TaskBoard.model.TaskModel} record The task record
             * @param {Object} values The task editor field values
             */
            if (owner?.trigger('beforeSave', { record, values : me.values, editor : me }) === false) {
                return;
            }

            /**
             * Fires on the owning TaskBoard when user clicks `Save`, after changes are saved.
             * @event save
             * @on-owner
             * @param {TaskBoard.view.TaskBoard} source The taskboard
             * @param {TaskBoard.widget.TaskEditor} editor The editor
             * @param {TaskBoard.model.TaskModel} record The task record
             * @param {Object} values The task editor field values
             */
            owner?.trigger('save', { record, values : me.values, editor : me });

            // Close first to avoid focus restoring issues if the edit element gets removed by the operations below
            me.close();

            record.set(values);

            if (resources) {
                // Does not work when passed through set, handle it separately
                record.resources = resources;
            }
        }
    }

    onCancelClick() {
        const me = this;
        /**
         * Fires on the owning TaskBoard when user clicks 'Cancel'.
         * Returning `false` from a listener prevents canceling and keeps the editor open.
         * @event beforeCancel
         * @preventable
         * @param {TaskBoard.view.TaskBoard} source The taskboard
         * @param {TaskBoard.widget.TaskEditor} editor The editor
         */
        if (me.owner?.trigger('beforeCancel', { editor : me }) === false) {
            return;
        }
        /**
         * Fires on the owning TaskBoard when user clicks 'Cancel', after the editor closed.
         * @event cancel
         * @preventable
         * @param {TaskBoard.view.TaskBoard} source The taskboard
         * @param {TaskBoard.widget.TaskEditor} editor The editor
         */
        me.owner?.trigger('cancel', { editor : me });

        me.close();
    }

    onInternalKeyDown(event) {
        const me = this;

        if (me.saveAndCloseOnEnter && !me.readOnly && event.key === 'Enter') {
            // Need to prevent this key events from being fired on whatever receives focus after the editor is hidden
            event.preventDefault();

            if (me.autoUpdateRecord) {
                if (me.isValid) {
                    // Blur to get a change event before closing, to be sure record is up to date
                    event.target.blur();
                    me.close();
                }
            }
            else {
                me.onSaveClick();
            }
        }

        super.onInternalKeyDown(event);
    }
}

TaskEditor.initClass();
