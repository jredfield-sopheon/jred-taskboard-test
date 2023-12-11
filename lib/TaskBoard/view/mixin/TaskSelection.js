import Base from '../../../Core/Base.js';
import ArrayHelper from '../../../Core/helper/ArrayHelper.js';
import DomHelper from '../../../Core/helper/DomHelper.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';

/**
 * @module TaskBoard/view/mixin/TaskSelection
 */

/**
 * Mixin that handles card selection for the TaskBoard.
 *
 * By default tasks can be selected using mouse clicks and the keyboard. To enable marquee selection, see
 * {@link TaskBoard.feature.TaskDragSelect}.
 *
 * ## Mouse selection
 *
 * Select and deselect cards using the mouse, using a modifier key to do multi selection:
 *
 * * Click on a card to focus and select it, deselecting any previously selected card.
 * * `CMD`/`CTRL` + click on a card to add or remove it from the selection.
 *
 * See {@link TaskBoard.view.TaskBoard#keyboard-shortcuts} for more information on selecting cards using the keyboard.
 *
 * @mixin
 */
export default Target => class TaskSelection extends (Target || Base) {

    //region Config

    static $name = 'TaskSelection';

    static configurable = {
        /**
         * Selected tasks.
         * @prp {TaskBoard.model.TaskModel[]} selectedTasks
         * @category Common
         */
        selectedTasks : [],

        /**
         * A template method (empty by default) allowing you to control if a task can be selected or not.
         *
         * ```javascript
         * new TaskBoard({
         *     isTaskSelectable(taskRecord) {
         *         return taskRecord.status !== 'done';
         *     }
         * })
         * ```
         *
         * @param {TaskBoard.model.TaskModel} taskRecord The task record
         * @returns {Boolean} `true` if the task can be selected, otherwise `false`
         * @prp {Function}
         * @category Selection
         */
        isTaskSelectable : null,

        keyMap : {
            ' '                : 'keyboardSelect',
            'Ctrl+ '           : 'keyboardToggleSelect',
            'Shift+ArrowDown'  : 'selectDown',
            'Shift+ArrowLeft'  : 'selectLeft',
            'Shift+ArrowUp'    : 'selectUp',
            'Shift+ArrowRight' : 'selectRight'
        }
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeSelectedTasks(selectedTasks) {
        ObjectHelper.assertArray(selectedTasks, 'selectedTasks');

        return selectedTasks.filter(task => this.isTaskSelectable?.(task) !== false);
    }

    //endregion

    //region Programmatic selection

    toggleTaskSelection(taskRecord, add = false, forceSelect = null) {
        const me = this;

        // Toggle
        if (forceSelect == null) {
            if (me.isSelected(taskRecord)) {
                // Clicked on a selected task without modifier key, select only it
                if (!add) {
                    me.selectTask(taskRecord, false);
                }
                // Using modifier key, deselect instead
                else {
                    me.deselectTask(taskRecord);
                }
            }
            else {
                me.selectTask(taskRecord, add);
            }
        }
        // Force select
        else if (forceSelect) {
            me.selectTask(taskRecord, add);
        }
        // Force deselect
        else {
            me.deselectTask(taskRecord);
        }
    }

    /**
     * Select the supplied task, deselecting any previously selected by default.
     * @param {TaskBoard.model.TaskModel} taskRecord Task to select
     * @param {Boolean} [add] Specify `true` to add to selection instead of replacing it
     * @category Selection
     */
    selectTask(taskRecord, add = false) {
        const
            { selectedTasks } = this,
            event             = {
                action : 'select',
                select : [taskRecord]
            };

        // Abort if not selectable
        if (this.isTaskSelectable?.(taskRecord) === false) {
            return;
        }

        if (!add) {
            event.deselect = selectedTasks.slice();
            selectedTasks.length = 0;
        }

        ArrayHelper.include(selectedTasks, taskRecord);

        this.triggerSelectionChange(event);

        this.recompose();
    }

    /**
     * Deselect the supplied task.
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @category Selection
     */
    deselectTask(taskRecord) {
        ArrayHelper.remove(this.selectedTasks, taskRecord);

        this.triggerSelectionChange({
            action   : 'deselect',
            deselect : [taskRecord]
        });

        this.recompose();
    }

    /**
     * Deselect all tasks.
     * @category Selection
     */
    deselectAll() {
        const { selectedTasks } = this;

        if (selectedTasks.length) {
            const deselect = selectedTasks.slice();

            selectedTasks.length = 0;

            this.triggerSelectionChange({
                action : 'deselect',
                deselect
            });

            this.recompose();
        }
    }

    /**
     * Check if the supplied task is selected or not
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {Boolean} Returns `true` if it is selected, `false` if not
     * @category Selection
     */
    isSelected(taskRecord) {
        return this.selectedTasks.includes(taskRecord);
    }

    triggerSelectionChange(event) {
        /**
         * Triggered when task selection changes.
         *
         * @event selectionChange
         * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
         * @param {'select'|'deselect'} action Either 'select' or 'deselect', depending on operation
         * @param {TaskBoard.model.TaskModel[]} selection All currently selected tasks
         * @param {TaskBoard.model.TaskModel[]} select Tasks selected by the operation
         * @param {TaskBoard.model.TaskModel[]} deselect Tasks deselected by the operation
         */
        this.trigger('selectionChange', Object.assign({
            selection : this.selectedTasks,
            select    : [],
            deselect  : []
        }, event));
    }

    //endregion

    //region Listeners

    onTaskClick(bryntumEvent) {
        super.onTaskClick(bryntumEvent);

        const { event, taskRecord } = bryntumEvent;

        if (!event.defaultPrevented) {
            this.toggleTaskSelection(taskRecord, event.ctrlKey);
        }
    }

    keyboardSelect(keyEvent) {
        if (!DomHelper.isEditable(keyEvent.target)) {
            const { taskRecord } = this.resolveEvent(keyEvent);
            if (taskRecord) {
                this.toggleTaskSelection(taskRecord, false);
                return true;
            }
        }
        return false;
    }

    keyboardToggleSelect(keyEvent) {
        const { taskRecord } = this.resolveEvent(keyEvent);
        if (taskRecord) {
            this.toggleTaskSelection(taskRecord, true);
        }
    }

    onClick(event) {
        super.onClick(event);

        if (!event.taskRecord && this.navigateable) {
            this.deselectAll();
        }
    }

    selectUp(event) {
        this.navigateUp(event, true);
    }

    selectDown(event) {
        this.navigateDown(event, true);
    }

    selectLeft(event) {
        this.navigateLeft(event, true);
    }

    selectRight(event) {
        this.navigateRight(event, true);
    }

    //endregion

    //region Rendering

    populateCard(args) {
        super.populateCard?.(args);

        const { taskRecord, cardConfig } = args;

        cardConfig.class['b-selected'] = this.isSelected(taskRecord);
    }

    populateBody(args) {
        super.populateBody?.(args);

        const { bodyConfig } = args;

        bodyConfig.class['b-has-selection'] = Boolean(this.selectedTasks.length);
    }

    //endregion

};
