import FilterField from '../../Core/widget/FilterField.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/SwimlaneFilterField
 */

/**
 * A field that filters the swimlanes of a linked {@link TaskBoard.view.TaskBoard} when typing into it.
 *
 * {@inlineexample TaskBoard/widget/SwimlaneFilterField.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'swimlanefilterfield' }
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
 * const picker = new SwimlaneFilterField({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/FilterField
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype swimlanefilterfield
 * @widget
 */
export default class SwimlaneFilterField extends FilterField.mixin(TaskBoardLinked) {
    static $name = 'SwimlaneFilterField';

    static type = 'swimlanefilterfield';

    static configurable = {
        store : 'this.taskBoard.swimlanes',

        field : 'text',

        label : 'L{TaskBoard.filterSwimlanes}',

        width : '20em',

        triggers : {
            filter : {
                cls   : 'b-icon b-icon-filter',
                align : 'start'
            }
        }
    };
}

SwimlaneFilterField.initClass();
