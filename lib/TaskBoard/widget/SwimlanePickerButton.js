import StringHelper from '../../Core/helper/StringHelper.js';
import Button from '../../Core/widget/Button.js';
import '../../Core/widget/Menu.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/SwimlanePickerButton
 */

/**
 * A button with a menu allowing the user to toggle which swimlanes are shown on the {@link TaskBoard.view.TaskBoard}.
 *
 * {@inlineexample TaskBoard/widget/SwimlanePickerButton.js}
 *
 * Click to display a menu populated with the swimlanes held in {@link TaskBoard.view.TaskBoard#property-swimlanes}.
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'swimlanepickerbutton' }
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
 * const picker = new SwimlanePickerButton({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/Button
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype swimlanepickerbutton
 * @widget
 */
export default class SwimlanePickerButton extends Button.mixin(TaskBoardLinked) {
    static $name = 'SwimlanePickerButton';

    static type = 'swimlanepickerbutton';

    static configurable = {
        text        : 'L{TaskBoard.Swimlanes}',
        icon        : 'b-icon-picker',
        pressedIcon : 'b-icon-picker-rotated',
        iconAlign   : 'end',
        menuIcon    : null,
        // items null needed to not be considered an object holding menu items
        menu        : { items : null }
    };

    onToggleSwimlane({ item }) {
        item.swimlane.hidden = !item.checked;
    }

    // Populate menu before each show to make sure it is up to date
    onMenuBeforeShow(info) {
        super.onMenuBeforeShow(info);

        info.source.items = this.taskBoard.swimlanes.map(swimlane => ({
            ref     : swimlane.id,
            text    : StringHelper.encodeHtml(swimlane.text),
            checked : !swimlane.hidden,
            swimlane,
            onItem  : 'up.onToggleSwimlane'
        }));
    }
}

SwimlanePickerButton.initClass();
