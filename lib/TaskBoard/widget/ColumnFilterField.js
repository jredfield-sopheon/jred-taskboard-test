import FilterField from '../../Core/widget/FilterField.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/ColumnFilterField
 */

/**
 * A field that filters the columns of a linked {@link TaskBoard.view.TaskBoard} when typing into it.
 *
 * {@inlineexample TaskBoard/widget/ColumnFilterField.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'columnfilterfield' }
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
 * const picker = new ColumnFilterField({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/FilterField
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype columnfilterfield
 * @widget
 */
export default class ColumnFilterField extends FilterField.mixin(TaskBoardLinked) {
    static $name = 'ColumnFilterField';

    static type = 'columnfilterfield';

    static configurable = {

        /**
         * @hideconfigs store, filterFunction
         */

        store : 'this.taskBoard.columns',

        /**
         * The ColumnModel field name to filter by, defaults to `'text'`.
         * @config {String}
         * @default
         * @category Common
         */
        field : 'text',

        /**
         * Label, defaults to a localized version of `'Filter columns'`.
         *
         * Content is determined by the `TaskBoard.filterColumns` key in the applied locale.
         *
         * @config {String}
         * @category Label
         */
        label : 'L{TaskBoard.filterColumns}',

        width : '20em',

        triggers : {
            filter : {
                cls   : 'b-icon b-icon-filter',
                align : 'start'
            }
        }
    };
}

ColumnFilterField.initClass();
