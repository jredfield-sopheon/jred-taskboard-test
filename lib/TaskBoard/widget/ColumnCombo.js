import ColorBoxCombo from './base/ColorBoxCombo.js';

/**
 * @module TaskBoard/widget/ColumnCombo
 */

/**
 * A combo populated with the {@link TaskBoard.view.TaskBoard#property-columns} of a {@link TaskBoard.view.TaskBoard}.
 * If a column has a {@link TaskBoard.model.ColumnModel#field-color} defined, that color will be displayed in the combo
 * and its picker.
 *
 * Used in {@link TaskBoard.widget.TaskEditor} to pick which column a task belongs to ("Status" below):
 *
 * {@inlineexample TaskBoard/widget/ColumnCombo.js}
 *
 * @extends TaskBoard/widget/base/ColorBoxCombo
 * @classtype columncombo
 * @inputfield
 */
export default class ColumnCombo extends ColorBoxCombo {
    static $name = 'ColumnCombo';

    static type = 'columncombo';

    changeStore() {
        return this.taskBoard.columns.chain();
    }
}

ColumnCombo.initClass();
