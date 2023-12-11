import FilterField from '../../Core/widget/FilterField.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/TaskFilterField
 */

/**
 * A field that filters the tasks of a linked {@link TaskBoard.view.TaskBoard} when typing into it.
 *
 * {@inlineexample TaskBoard/widget/TaskFilterField.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'taskfilterfield' }
 *     ]
 * });
 * ```
 *
 * When used outside of a TaskBoard, it will query globally to find one but if there are multiple on page it might have
 * to be linked to one manually (see {@link TaskBoard/widget/mixin/TaskBoardLinked#config-taskBoard}:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({});
 *
 * const picker = new TaskFilterField({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/FilterField
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype taskfilterfield
 * @widget
 */
export default class TaskFilterField extends FilterField.mixin(TaskBoardLinked) {
    static $name = 'TaskFilterField';

    static type = 'taskfilterfield';

    static configurable = {
        store : 'this.taskBoard.project.taskStore',

        field : 'name',

        label : 'L{TaskBoard.filterTasks}',

        width : '20em',

        triggers : {
            filter : {
                cls   : 'b-icon b-icon-filter',
                align : 'start'
            }
        }
    };
}

TaskFilterField.initClass();
