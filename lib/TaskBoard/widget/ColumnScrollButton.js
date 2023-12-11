import StringHelper from '../../Core/helper/StringHelper.js';
import Button from '../../Core/widget/Button.js';
import '../../Core/widget/Menu.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/ColumnScrollButton
 */

/**
 * A button with a menu allowing the user to pick a column to scroll to.
 *
 * {@inlineexample TaskBoard/widget/ColumnScrollButton.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'columnscrollbutton' }
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
 * const picker = new ColumnScrollButton({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/Button
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype columnScrollButton
 * @widget
 */
export default class ColumnScrollButton extends Button.mixin(TaskBoardLinked) {
    static $name = 'ColumnScrollButton';

    static type = 'columnscrollbutton';

    static configurable = {
        text        : 'L{TaskBoard.scrollToColumn}',
        icon        : 'b-icon-picker',
        pressedIcon : 'b-icon-picker-rotated',
        iconAlign   : 'end',
        menuIcon    : null,
        menu        : []
    };

    onClickColumn({ item }) {
        this.setTimeout(() => this.taskBoard?.scrollToColumn(item.column), 100);
    }

    changeMenu(menu) {
        // Nullified on destroy
        if (menu) {
            menu = this.taskBoard.columns.map(column => ({
                ref    : column.id,
                text   : StringHelper.encodeHtml(column.text),
                column,
                onItem : 'up.onClickColumn'
            }));
        }

        return super.changeMenu(menu);
    }
}

ColumnScrollButton.initClass();
