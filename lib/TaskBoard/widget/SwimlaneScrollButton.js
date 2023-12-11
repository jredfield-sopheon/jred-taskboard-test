import StringHelper from '../../Core/helper/StringHelper.js';
import Button from '../../Core/widget/Button.js';
import '../../Core/widget/Menu.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/SwimlaneScrollButton
 */

/**
 * A button with a menu allowing the user to pick a swimlane to scroll to.
 *
 * {@inlineexample TaskBoard/widget/SwimlaneScrollButton.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'swimlanescrollbutton' }
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
 * const picker = new SwimlaneScrollButton({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/Button
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype swimlaneScrollButton
 * @widget
 */
export default class SwimlaneScrollButton extends Button.mixin(TaskBoardLinked) {
    static $name = 'SwimlaneScrollButton';

    static type = 'swimlanescrollbutton';

    static configurable = {
        text        : 'L{TaskBoard.scrollToSwimlane}',
        icon        : 'b-icon-picker',
        pressedIcon : 'b-icon-picker-rotated',
        iconAlign   : 'end',
        menuIcon    : null,
        menu        : []
    };

    onClickSwimlane({ item }) {
        this.setTimeout(() => this.taskBoard?.scrollToSwimlane(item.swimlane), 100);
    }

    changeMenu(menu) {
        // Nullified on destroy
        if (menu) {
            menu = this.taskBoard.swimlanes.map(swimlane => ({
                ref    : swimlane.id,
                text   : StringHelper.encodeHtml(swimlane.text),
                swimlane,
                onItem : 'up.onClickSwimlane'
            }));
        }

        return super.changeMenu(menu);
    }
}

SwimlaneScrollButton.initClass();
