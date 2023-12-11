import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/ProgressItem
 */

/**
 * Item displaying a progress bar.
 *
 * Progress is determined by the value of the configured {@link #config-field}. A max value (defaults to 100) can be
 * configured using the {@link #config-max} config.
 *
 * {@inlineexample TaskBoard/view/item/ProgressItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype progress
 */
export default class ProgressItem extends TaskItem {
    static $name = 'ProgressItem';

    static type = 'progress';

    static configurable = {
        /**
         * Max value, at which the bar is full.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    bodyItems : {
         *        progress : { type : 'progress', max : 10 }
         *    },
         *
         *    project : {
         *        tasksData : [
         *            { id : 1, name : 'Task #1', progress : 9 }
         *        ]
         *    }
         * });
         *
         * // Task #1 bar is 9/10 filled
         * ```
         *
         * @config {Number} max
         * @default 100
         * @category Common
         */
    };

    /**
     * Widget type or config to use as the editor for this item. Used in the inline task editor.
     *
     * ProgressItems are un-editable by default.
     *
     * @config {String|Object} editor
     * @default null
     * @category Common
     */

    static defaultEditor = null;

    static render({ domConfig, value, config }) {
        const percent = Math.round(100 * value / (config.max || 100)) + '%';

        domConfig.children = [
            {
                class   : 'b-taskboard-progress-outline',
                dataset : {
                    percent
                },
                children : [
                    {
                        class : 'b-taskboard-progress-progress',
                        style : {
                            width : percent
                        },
                        dataset : {
                            percent
                        }
                    }
                ]
            }
        ];

        domConfig.dataset.percent = domConfig.dataset.btip = percent;
    }
}

ProgressItem.initClass();
