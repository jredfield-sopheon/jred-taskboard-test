import ColorPicker from '../../Core/widget/ColorPicker.js';

/**
 * @module TaskBoard/widget/TaskColorPicker
 */

/**
 * A color picker that displays a list of available task colors which the user can select by using mouse or keyboard.
 * See {@link TaskBoard.model.TaskModel#field-eventColor} for default available colors.
 *
 * {@inlineexample TaskBoard/widget/TaskColorPicker.js}
 *
 * ```javascript
 * new TaskColorPicker({
 *    appendTo : 'container',
 *    width    : '10em',
 *    onColorSelected() {
 *        console.log(...arguments);
 *    }
 * });
 * ```
 *
 * @extends Core/widget/ColorPicker
 * @classtype colorpicker
 */
export default class TaskColorPicker extends ColorPicker {
    static $name = 'TaskColorPicker';

    static type = 'taskcolorpicker';

    static configurable = {

        // These are the colors available by default for TaskBoard
        colorClasses : [
            { color : 'red', text : 'Red' },
            { color : 'pink', text : 'Pink' },
            { color : 'purple', text : 'Purple' },
            { color : 'deep-purple', text : 'Deep purple' },
            { color : 'indigo', text : 'Indigo' },
            { color : 'blue', text : 'Blue' },
            { color : 'light-blue', text : 'Light blue' },
            { color : 'cyan', text : 'Cyan' },
            { color : 'teal', text : 'Teal' },
            { color : 'green', text : 'Green' },
            { color : 'light-green', text : 'Light green' },
            { color : 'lime', text : 'Lime' },
            { color : 'yellow', text : 'Yellow' },
            { color : 'amber', text : 'Amber' },
            { color : 'orange', text : 'Orange' },
            { color : 'deep-orange', text : 'Deep orange' }
        ],

        colorClassPrefix : 'b-taskboard-background-color-',

        /**
         * @hideconfigs colors
         */

        colors : null
    };
}

TaskColorPicker.initClass();
