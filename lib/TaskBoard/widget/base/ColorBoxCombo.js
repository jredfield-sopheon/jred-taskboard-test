import DomHelper from '../../../Core/helper/DomHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';
import Combo from '../../../Core/widget/Combo.js';
import TaskBoardLinked from '../mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/base/ColorBoxCombo
 */

/**
 * Abstract base class with functionality shared between {@link TaskBoard.widget.ColumnCombo} and
 * {@link TaskBoard.widget.SwimlaneCombo}.
 *
 * @extends Core/widget/Combo
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @abstract
 */
export default class ColorBoxCombo extends Combo.mixin(TaskBoardLinked) {
    static $name = 'ColorBoxCombo';

    static type = 'colorboxcombo';

    static configurable = {
        displayField      : 'text',
        valueField        : 'id',
        editable          : false,
        showBoxForNoColor : false,
        listItemTpl({ text, color }) {
            let html = StringHelper.encodeHtml(text);

            if (color) {
                if (DomHelper.isNamedColor(color)) {
                    html = `<div class="b-colorbox b-taskboard-color-${color}"></div>` + html;
                }
                else {
                    html = `<div class="b-colorbox" style="color : ${color}"></div>` + html;
                }
            }

            return html;
        },
        picker : {
            cls : 'b-colorbox-picker'
        }
    };

    afterConstruct() {
        if (!this.showBoxForNoColor && !this.value) {
            this.element.classList.add('b-colorless');
        }
    }

    syncInputFieldValue(...args) {
        const
            me        = this,
            { color } = me.record || {};

        let className = 'b-colorbox';

        if (color) {
            if (DomHelper.isNamedColor(color)) {
                className += ` b-taskboard-color-${color}`;
            }
            else {
                me.colorBox.style.color = color;
            }
        }

        me.colorBox.className = className;

        if (!me.showBoxForNoColor) {
            me.element.classList.toggle('b-colorless', !color);
        }

        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'colorBox',
                className : 'b-colorbox'
            },
            ...super.innerElements
        ];
    }
}
