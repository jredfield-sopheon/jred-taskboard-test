import Base from '../../../Core/Base.js';
import Rectangle from '../../../Core/helper/util/Rectangle.js';
import DomHelper from '../../../Core/helper/DomHelper.js';

/**
 * @module TaskBoard/view/mixin/TaskNavigation
 */

const navigationActions = ['navigateDown', 'navigateLeft', 'navigateUp', 'navigateRight', 'activate'];

/**
 * Mixin that handles keyboard navigation for the TaskBoard.
 *
 * See {@link TaskBoard.view.TaskBoard#keyboard-shortcuts} for information on keyboard navigation.
 *
 * @mixin
 */
export default Target => class TaskNavigation extends (Target || Base) {

    //region Config

    static $name = 'TaskNavigation';

    static configurable = {
        // Documented on TaskBoard
        keyMap : {
            ArrowDown  : 'navigateDown',
            ArrowLeft  : 'navigateLeft',
            ArrowUp    : 'navigateUp',
            ArrowRight : 'navigateRight',
            Enter      : 'activate'
        },

        navigateable : true,

        /**
         * Configure with `true` to change the default behaviour of keyboard navigation from moving focus to selecting
         * tasks:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     selectOnNavigation : true
         * });
         * ```
         *
         * @config {Boolean|String}
         * @default
         * @category Selection
         */
        selectOnNavigation : false
    };

    get widgetClass() {}

    //endregion

    //region Utility

    getTaskNear(x, y) {
        const
            { documentRoot } = this,
            gap              = DomHelper.measureSize(
                this.css.cardGap || '1em',
                this.bodyElement.querySelector('.b-taskboard-swimlane-body .b-taskboard-column')
            );

        let task = documentRoot.elementFromPoint(x, y)?.closest('.b-taskboard-card');

        // Nothing there, might have hit a gap, look up
        if (!task) {
            task = documentRoot.elementFromPoint(x, y - gap)?.closest('.b-taskboard-card');
        }

        // Still nothing, look down
        if (!task) {
            task = documentRoot.elementFromPoint(x, y + gap)?.closest('.b-taskboard-card');
        }

        return task;
    }

    //endregion

    //region Navigation

    focusAndOptionallySelect(taskElement, forceSelect) {
        if (taskElement) {
            const
                me                   = this,
                currentlyFocusedTask = me.resolveTaskRecord(document.activeElement);

            // If a task is focused but not selected and we navigate away from it holding SPACE we want that task to
            // become selected in addition to the newly focused task
            if (forceSelect && currentlyFocusedTask && !me.isSelected(currentlyFocusedTask)) {
                me.selectTask(currentlyFocusedTask, true);
            }

            // When configured with `selectOnNavigation : true` we should move the selection. If user holds SHIFT we
            // should always extend it
            if (me.selectOnNavigation || forceSelect) {
                const taskToFocus = me.resolveTaskRecord(taskElement);
                // Newly focused task is not selected, always select it (optionally extending the selection)
                if (!me.isSelected(taskToFocus)) {
                    me.selectTask(taskToFocus, forceSelect);
                }
                // Newly focused task already selected, deselect current if SHIFT is pressed (to allow extending and
                // shrinking selection holding SHIFT)
                else if (forceSelect) {
                    me.deselectTask(currentlyFocusedTask);
                }
            }

            // Always move focus
            taskElement.focus();
        }
    }

    // To task at same Y in next column
    navigateNext(keyEvent, select) {
        const
            me                                           = this,
            { taskRecord, swimlaneRecord, columnRecord } = keyEvent.taskBoardData,
            taskElement                                  = me.getTaskElement(taskRecord);

        let
            found = null,
            nextColumnRecord = columnRecord;

        do {
            nextColumnRecord = me.columns.getNext(nextColumnRecord, true);

            if (!nextColumnRecord.hidden) {
                const
                    nextColumnElement = me.getSwimlaneColumnElement(swimlaneRecord, nextColumnRecord),
                    x                 = Rectangle.from(nextColumnElement, null, true).center.x,
                    y                 = Rectangle.from(taskElement, null, true).center.y;

                found = me.getTaskNear(x, y);
            }
        }
        while (!found && nextColumnRecord !== columnRecord);

        me.focusAndOptionallySelect(found, select);
    }

    // To task at same Y in prev column
    navigatePrev(keyEvent, select) {
        const
            me                                           = this,
            { taskRecord, swimlaneRecord, columnRecord } = keyEvent.taskBoardData,
            taskElement                                  = me.getTaskElement(taskRecord);

        let
            found = null,
            prevColumnRecord = columnRecord;

        do {
            prevColumnRecord = me.columns.getPrev(prevColumnRecord, true);

            if (!prevColumnRecord.hidden) {
                const
                    prevColumnElement = me.getSwimlaneColumnElement(swimlaneRecord, prevColumnRecord),
                    x                 = Rectangle.from(prevColumnElement, null, true).center.x,
                    y                 = Rectangle.from(taskElement, null, true).center.y;

                found = me.getTaskNear(x, y);
            }
        }
        while (!found && prevColumnRecord !== columnRecord);

        me.focusAndOptionallySelect(found, select);
    }

    // Right navigates to next column for LTR and previous for RTL
    navigateRight(event, select = false) {
        this['navigate' + (this.rtl ? 'Prev' : 'Next')](event, select);
    }

    // Left navigates to previous column for LTR and next for RTL
    navigateLeft(event, select = false) {
        this['navigate' + (this.rtl ? 'Next' : 'Prev')](event, select);
    }

    // Find next task in same column (might be in next swimlane)
    navigateDown(keyEvent, select = false) {
        const
            { taskRecord } = keyEvent.taskBoardData,
            nextTask       = this.getNextTask(taskRecord, true);

        this.focusAndOptionallySelect(this.getTaskElement(nextTask), select);
    }

    // Find prev task in same column (might be in prev swimlane)
    navigateUp(keyEvent, select = false) {
        const
            { taskRecord } = keyEvent.taskBoardData,
            prevTask       = this.getPreviousTask(taskRecord, true);

        this.focusAndOptionallySelect(this.getTaskElement(prevTask), select);
    }

    // Activate (show editor)
    activate(event) {
        const { taskRecord } = this.resolveEvent(event);
        // Only care about ENTER on a task
        taskRecord && this.trigger('activateTask', { taskRecord, event });
    }

    isActionAvailable({ action, event }) {
        const taskBoardData = this.resolveEvent(event);

        event.taskBoardData = taskBoardData;

        // Block activating if a task item has focus (eg. a button in the card)
        if (action === 'activate' && taskBoardData.taskRecord && event.target !== this.getTaskElement(taskBoardData.taskRecord)) {
            return false;
        }

        return Boolean((this.navigateable || !navigationActions.includes(action)) && taskBoardData?.taskRecord);
    }

    //endregion

};
