import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/ImageItem
 */

/**
 * Item displaying an image.
 *
 * Loaded from the configured {@link #config-field}, optionally prepended with a {@link #config-baseUrl}.
 *
 * {@inlineexample TaskBoard/view/item/ImageItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype image
 */
export default class ImageItem extends TaskItem {
    static $name = 'ImageItem';

    static type = 'image';

    /**
     * Url prepended to this items value.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *        picture : { type : 'image', baseUrl : 'images/' }
     *    },
     *
     *    project : {
     *        tasksData : [
     *            { id : 1, name : 'Task #1', picture : 'photo.jpg' },
     *            { id : 2, name : 'Task #2', picture : 'image.jpg' }
     *        ]
     *    }
     * });
     *
     * // Card for task #1 will render image "images/photo.jpg"
     * // Card for task #2 will render image "images/image.jpg"
     * ```
     *
     * @config {String} baseUrl
     * @category Common
     */

    /**
     * Widget type or config to use as the editor for this item. Used in the inline task editor.
     *
     * ImageItems are un-editable by default.
     *
     * @config {String|Object} editor
     * @default null
     * @category Common
     */

    static defaultEditor = null;

    static render({ domConfig, value, config }) {
        // Skip drawing when `image === false` or not assigned
        if (value) {
            Object.assign(domConfig, {
                tag       : 'img',
                src       : (config.baseUrl || '') + value,
                draggable : false
            });
        }
    }
}

ImageItem.initClass();
