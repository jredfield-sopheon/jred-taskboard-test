import Combo from '../../Core/widget/Combo.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/TagCombo
 */

/**
 * A combo for picking tags. Works well to edit fields displayed by a {@link TaskBoard/view/item/TagsItem}, if data
 * uses strings to represent tags:
 *
 * {@inlineexample TaskBoard/widget/TagCombo.js}
 *
 * Consumes and outputs and array of strings, or if configured with a {@link #config-separator} a single string.
 *
 * If not seeded with any items/store, it tries to extract tags from the task store by collecting distinct values for
 * the field it is linked to (by {@link #config-name}).
 *
 * @extends Core/widget/Combo
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype tagcombo
 * @inputfield
 */
export default class TagCombo extends Combo.mixin(TaskBoardLinked) {
    static $name = 'TagCombo';

    static type = 'tagcombo';

    static configurable = {
        multiSelect : true,
        editable    : false,

        /**
         * Separator used to split a string into tags. Required if data format uses a single string to represent tags.
         * @config {String}
         * @default
         */
        separator : ',',

        picker : {
            cls : 'b-tag-picker'
        },

        chipView : {
            closable : false
        }
    };

    afterConfigure() {
        const me = this;

        // Populate with tags from the task store
        if (!me.store?.count && me.taskBoard && me.name) {
            const
                { name, separator } = me,
                tags                = [];

            me.taskBoard.project.taskStore.forEach(task => {
                const taskTags = task[name];
                if (taskTags) {
                    if (typeof taskTags === 'string') {
                        tags.push(...taskTags.split(separator));
                    }
                    else {
                        tags.push(...taskTags);
                    }
                }
            });

            me.items = [...new Set(tags)].sort();
        }
    }

    changeValue(value, old) {
        this.$expectsString = false;

        if (this.separator && typeof value === 'string') {
            value = value.split(this.separator);
            this.$expectsString = true;
        }

        super.changeValue(value, old);
    }

    get value() {
        const value = super.value;

        if (this.$expectsString) {
            return value.join(this.separator);
        }

        return value;
    }

    set value(value) {
        super.value = value;
    }
}

TagCombo.initClass();
