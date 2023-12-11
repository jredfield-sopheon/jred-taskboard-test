import ColorField from '../../Core/widget/ColorField.js';
import './TaskColorPicker.js';

/**
 * @module TaskBoard/widget/TaskColorCombo
 */

/**
 * A combo populated with predefined colors usable by a task, see {@link TaskBoard.model.TaskModel#field-eventColor}.
 *
 * Used in {@link TaskBoard.widget.TaskEditor} to pick a color for a task. Double click a task to try it:
 *
 * {@inlineexample TaskBoard/widget/TaskColorCombo.js}
 *
 * @extends Core/widget/ColorField
 * @classtype taskcolorcombo
 * @inputfield
 */
export default class TaskColorCombo extends ColorField {
    static $name = 'TaskColorCombo';

    static type = 'taskcolorcombo';

    static configurable = {
        picker : {
            type : 'taskcolorpicker'
        },
        name      : 'eventColor',
        clearable : true
    };
}

TaskColorCombo.initClass();
