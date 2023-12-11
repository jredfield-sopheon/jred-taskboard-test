import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/RatingItem
 */

/**
 * Item displaying a star rating.
 *
 * Rating is determined by the value of the configured {@link #config-field}. A max rating can be configured using the
 * {@link #config-max} config.
 *
 * {@inlineexample TaskBoard/view/item/RatingItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype rating
 */
export default class RatingItem extends TaskItem {
    static $name = 'RatingItem';

    static type = 'rating';

    /**
     * Max rating.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *       grade : { type : 'ratingitem', max : 5 }
     *    },
     *
     *    project : {
     *        tasksData : [
     *            { id : 1, name : 'Task #1', grade : 3 }
     *        ]
     *    }
     * });
     *
     * // Card for task #1 will render 3 full stars and 2 faded,
     * // for a total of 5 stars
     * ```
     *
     * @config {Number} max
     * @category Common
     */

    /**
     * Widget type or config to use as the editor for this item. Used in the inline task editor.
     *
     * RatingItems are un-editable by default.
     *
     * @config {String|Object} editor
     * @default null
     * @category Common
     */

    static defaultEditor = null;

    static render({ domConfig, value, config }) {
        const { max = value } = config;

        domConfig.children = [];

        for (let i = 0; i < max; i++) {
            domConfig.children.push({
                tag   : 'i',
                class : {
                    'b-icon b-icon-star' : 1,
                    'b-filled'           : i < value
                }
            });
        }
    }
}

RatingItem.initClass();
