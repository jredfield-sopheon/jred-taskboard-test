import Slider from '../../Core/widget/Slider.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/ZoomSlider
 */

/**
 * A slider that controls the {@link TaskBoard/view/TaskBoardBase#config-tasksPerRow} config of TaskBoard.
 *
 * {@inlineexample TaskBoard/widget/ZoomSlider.js}
 *
 * When used within a TaskBoard, it connects to it automatically:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         { type : 'zoomslider' }
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
 * const picker = new ZoomSlider({
 *    taskBoard // Link it to the taskBoard instance created above
 * });
 * ```
 *
 * @extends Core/widget/Slider
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype zoomslider
 * @widget
 */
export default class ZoomSlider extends Slider.mixin(TaskBoardLinked) {
    static $name = 'ZoomSlider';

    static type = 'zoomslider';

    static configurable = {
        text : 'L{TaskBoard.zoom}',

        max   : 10,
        min   : 1,
        // Override default to avoid hitting updater, value set in afterConstruct
        value : null,

        showValue : false
    };

    calculateValue(input) {
        return this.max - input + 1;
    }

    afterConstruct() {
        this.value = this.calculateValue(this.taskBoard.tasksPerRow);
    }

    onInput({ value }) {
        this.taskBoard.tasksPerRow = this.calculateValue(value);
    }

    updateValue(value) {
        super.updateValue(value);

        this.onInput({ value });
    }

    getTooltipHtml(value) {
        const tasksPerRow = this.calculateValue(value);

        return `${tasksPerRow} card${tasksPerRow === 1 ? '' : 's'} per row`;
    }
}

ZoomSlider.initClass();
