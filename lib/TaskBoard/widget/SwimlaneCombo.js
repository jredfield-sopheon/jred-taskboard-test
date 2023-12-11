import ColorBoxCombo from './base/ColorBoxCombo.js';

/**
 * @module TaskBoard/widget/SwimlaneCombo
 */

/**
 * A combo populated with the {@link TaskBoard.view.TaskBoard#property-swimlanes} of a {@link TaskBoard.view.TaskBoard}.
 * If a swimlane has a {@link TaskBoard.model.SwimlaneModel#field-color} defined, that color will be displayed in the
 * combo and its picker.
 *
 * Used in {@link TaskBoard.widget.TaskEditor} to pick which swimlane a task belongs to ("Prio" below):
 *
 * {@inlineexample TaskBoard/widget/ColumnCombo.js}
 *
 * @extends TaskBoard/widget/base/ColorBoxCombo
 * @classtype swimlanecombo
 * @inputfield
 */
export default class SwimlaneCombo extends ColorBoxCombo {
    static $name = 'SwimlaneCombo';

    static type = 'swimlanecombo';

    changeStore() {
        return this.taskBoard.swimlanes.chain();
    }
}

SwimlaneCombo.initClass();
