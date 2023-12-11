import Base from '../../../Core/Base.js';
import Widget from '../../../Core/widget/Widget.js';

/**
 * @module TaskBoard/widget/mixin/TaskBoardLinked
 */

/**
 * Mixin that simplifies linking a widget to a {@link TaskBoard.view.TaskBoard}.
 *
 * @mixin
 */
export default Target => class TaskBoardLinked extends (Target || Base) {

    static $name = 'TaskBoardLinked';

    static configurable = {
        /**
         * Auto detected when used within a TaskBoard. If you add the widget elsewhere, it will try to find an instance
         * of TaskBoard on page. If that fails you have to supply this config to connect it to a TaskBoard manually.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({});
         *
         * const picker = new ColumnPickerButton({
         *    taskBoard // Link it to the taskBoard instance created above
         * });
         * ```
         *
         * @config {TaskBoard.view.TaskBoard}
         * @category Common
         */
        taskBoard : null
    };

    get taskBoard() {
        return this._taskBoard || this.up(widget => widget.isTaskBoardBase) || Widget.query(widget => widget.isTaskBoardBase);
    }

    changeTaskBoard(taskBoard) {
        if (taskBoard && !taskBoard.isTaskBoard) {
            throw new Error(`The taskBoard config only accepts an instance of TaskBoard or a subclass thereof`);
        }

        return taskBoard;
    }
};
