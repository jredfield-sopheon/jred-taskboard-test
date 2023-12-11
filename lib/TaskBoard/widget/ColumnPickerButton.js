import StringHelper from '../../Core/helper/StringHelper.js';
import Button from '../../Core/widget/Button.js';
import '../../Core/widget/Menu.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/ColumnPickerButton
 */

/**
 * A button with a menu allowing the user to toggle which columns are shown on the {@link TaskBoard.view.TaskBoard}.
 *
 * {@inlineexample TaskBoard/widget/ColumnPickerButton.js}
 *
 * Click to display a menu populated with the columns held in {@link TaskBoard.view.TaskBoard#property-columns}.
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'columnpickerbutton' }
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
 * const picker = new ColumnPickerButton({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/Button
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype columnpickerbutton
 * @widget
 */
export default class ColumnPickerButton extends Button.mixin(TaskBoardLinked) {
    static $name = 'ColumnPickerButton';

    static type = 'columnpickerbutton';

    static configurable = {
        text        : 'L{TaskBoard.Columns}',
        icon        : 'b-icon-picker',
        pressedIcon : 'b-icon-picker-rotated',
        iconAlign   : 'end',
        menuIcon    : null,
        // items null needed to not be considered an object holding menu items
        menu        : { items : null }
    };

    onToggleColumn({ item }) {
        item.column.hidden = !item.checked;
    }

    // Populate menu before each show to make sure it is up to date
    onMenuBeforeShow(info) {
        super.onMenuBeforeShow(info);

        info.source.items = this.taskBoard.columns.map(column => ({
            ref     : column.id,
            text    : StringHelper.encodeHtml(column.text),
            checked : !column.hidden,
            column,
            onItem  : 'up.onToggleColumn'
        }));
    }
}

ColumnPickerButton.initClass();
