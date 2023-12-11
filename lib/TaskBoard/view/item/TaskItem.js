import Base from '../../../Core/Base.js';
import Factoryable from '../../../Core/mixin/Factoryable.js';

/**
 * @module TaskBoard/view/item/TaskItem
 */

/**
 * Config options for all TaskItems combined. See respective item classes for more information.
 * @typedef {Object} TaskItemOptions
 * @property {String} type Type of the item
 * @property {String} [field] Field to display in the item. Usually inferred from the key when supplying items
 * @property {String|Object} [style] Style definition in string or object form
 * @property {String} [cls] CSS class to add
 * @property {Number} [order] Flex order, can be used to re-order task items
 * @property {Boolean} [hidden] Specify `true` to hide the task item
 * @property {String|Object} [editor] Widget type or config to use as the editor for this item. Used in the inline task
 * editor. Set to `null` to not use an editor for this item
 * @property {String} [baseUrl] For `type : 'image'` - Url prepended to this items value
 * @property {Function} [template] For `type : 'template'` - Template function used to generate task content
 * @property {Number} [max] For `type : 'progress'` and `type : 'rating'` - Max value
 * @property {String} [textField] For `type : 'todoList'` - Name of a property on a todo item to display as its text
 * @property {String} [checkedField] For `type : 'todoList'` - Name of a property on a todo item to use for the checkbox
 * @property {String} [clsField] For `type : 'todoList'` - Name of a property on a todo item whose value will be added
 * as a CSS class to the todo item
 * @property {Number} [maxAvatars] For `type : 'resourceAvatars'` - Maximum avatars to display by default.
 * @property {Boolean} [overlap] For `type : 'resourceAvatars'` - Specify `true` to slightly overlap avatars for tasks
 * @property {String} [textProperty] For `type : 'tags'` - Property used to display the tag text
 * @property {String} [clsProperty] For `type : 'tags'` - Property used to add a CSS class to each tag
 * @property {String} [separator] For `type : 'tags'` - Property used to split a value string into tags
 */

/**
 * Abstract base class for task items, lightweight "widgets" that can be added to tasks using the
 * {@link TaskBoard/view/TaskBoard#config-headerItems}, {@link TaskBoard/view/TaskBoard#config-bodyItems} and
 * {@link TaskBoard/view/TaskBoard#config-footerItems} configs.
 *
 * @abstract
 */
export default class TaskItem extends Base.mixin(Factoryable) {
    static factoryable = {};

    static configurable = {
        /**
         * Task field whose value item will act on (usually display it). Defaults to use the key in the items object.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    features : {
         *        taskItems : {
         *            items : {
         *                // Will use "prio" as its field
         *                prio  : { type : 'textitem' },
         *                // Will use "status" as its field
         *                state : { type : 'textitem', field : 'status' }
         *            }
         *        }
         *    }
         * });
         * ```
         *
         * @config {String} field
         * @category Common
         */

        /**
         * Style definition in string or object form.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    features : {
         *        taskItems : {
         *            items : {
         *                prio  : { type : 'textitem', style : { color : 'red' } }
         *            }
         *        }
         *    }
         * });
         * ```
         *
         * @config {String|Object} style
         * @category Common
         */

        /**
         * Specify `true` to hide the task item.
         *
         * @config {Boolean} hidden
         * @category Common
         */

        /**
         * Flex order, can be used to re-order task items.
         *
         * @config {Number} order
         * @default 1
         * @category Common
         */

        /**
         * CSS class to add.
         *
         * @config {String} cls
         * @category Common
         */

        /**
         * Widget type or config to use as the editor for this item. Used in the inline task editor.
         * Set to `null` to not use an editor for this item.
         *
         * @config {String|Object} editor
         * @default text
         * @category Common
         */
    };

    static defaultEditor = { type : 'text' };

    static getEditorConfig({ config, item }) {
        const editor = config.editor !== null && (config.editor || item.defaultEditor);

        if (typeof editor === 'string') {
            return {
                type : editor
            };
        }

        return editor;
    }
}
