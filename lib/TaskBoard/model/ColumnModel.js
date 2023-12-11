import Model from '../../Core/data/Model.js';

/**
 * @module TaskBoard/model/ColumnModel
 */

/**
 * Represents a single column on a TaskBoard.
 *
 * When creating a TaskBoard, you supply an initial set of columns. These columns are either defined as plain strings,
 * ColumnModel data objects or ColumnModel records (or a mix thereof). When using strings, the string will be used as is
 * as the column's id and capitalized as its text.
 *
 * ```javascript
 * const doneColumn = new ColumnModel({
 *     id   : 'done',
 *     text : 'Done'
 * });
 *
 * const taskBoard = new TaskBoard({
 *     columns : [
 *         // String, equal to passing { id : 'todo', text : 'Todo' }
 *         'todo',
 *         // Data object, in this case with a fixed width and not collapsible from the UI
 *         { id : 'doing', text : 'Doing', width : 200, collapsible : false }
 *         // Record, not commonly used since it is easier to supply the data object directly
 *         doneColumn
 *     ]
 * });
 * ```
 *
 * @extends Core/data/Model
 * @uninherit Core/data/mixin/TreeNode
 */
export default class ColumnModel extends Model {

    static $name = 'ColumnModel';

    static fields = [
        /**
         * This column's unique id, used to match a task to a column (which field on a task to match is specified using
         * then {@link TaskBoard.view.TaskBoardBase#config-columnField} config on TaskBoard).
         * @field {String|Number} id
         */

        /**
         * Text displayed in the column header.
         * @field {String} text
         */
        'text',

        /**
         * A tooltip string to show when hovering the column header
         * @field {String} tooltip
         */
        'tooltip',

        /**
         * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
         * class to the column. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the column.
         *
         * By default it does not visually affect the UI, but it applies a color to the column that applications can
         * leverage using `currentColor` to style it in the desired way.
         *
         * Using named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     columns : [
         *         { id : 'todo', text : 'Todo', color : 'orange', tooltip : 'These are items to be done' }
         *     ]
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-column b-taskboard-color-orange">
         * ```
         *
         * Which can the be used for example like:
         *
         * ```css
         * .b-taskboard-column-header {
         *     border-left : 5px solid currentColor; // where currentColor is the color defined by b-taskboard-color-orange
         * }
         * ```
         *
         * Using non-named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     columns : [
         *         { id : 'todo', text : 'Todo', color : 'hsl(229deg 66% 42%)' }
         *     ]
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-column" style="color: hsl(229deg 66% 42%)">
         * ```
         *
         * Predefined named colors (actual color might vary by theme):
         * <div class="b-colorbox b-inline b-taskboard-color-red"></div>red,
         * <div class="b-colorbox b-inline b-taskboard-color-pink"></div>pink,
         * <div class="b-colorbox b-inline b-taskboard-color-purple"></div>purple,
         * <div class="b-colorbox b-inline b-taskboard-color-deep-purple"></div>deep-purple,
         * <div class="b-colorbox b-inline b-taskboard-color-indigo"></div>indigo,
         * <div class="b-colorbox b-inline b-taskboard-color-blue"></div>blue,
         * <div class="b-colorbox b-inline b-taskboard-color-light-blue"></div>light-blue,
         * <div class="b-colorbox b-inline b-taskboard-color-cyan"></div>cyan,
         * <div class="b-colorbox b-inline b-taskboard-color-teal"></div>teal,
         * <div class="b-colorbox b-inline b-taskboard-color-green"></div>green,
         * <div class="b-colorbox b-inline b-taskboard-color-light-green"></div>light-green,
         * <div class="b-colorbox b-inline b-taskboard-color-lime"></div>lime,
         * <div class="b-colorbox b-inline b-taskboard-color-yellow"></div>yellow,
         * <div class="b-colorbox b-inline b-taskboard-color-amber"></div>amber,
         * <div class="b-colorbox b-inline b-taskboard-color-orange"></div>orange,
         * <div class="b-colorbox b-inline b-taskboard-color-deep-orange"></div>deep-orange
         *
         * @field {String} color
         */
        { name : 'color', type : 'string' },

        /**
         * Number of tasks per row to display in this column. Leave blank to use the setting from the
         * {@link TaskBoard.view.TaskBoardBase#config-tasksPerRow} config on TaskBoard.
         * @field {Number} tasksPerRow
         */
        'tasksPerRow',

        /**
         * Allow collapsing this column
         * @field {Boolean} collapsible=true
         */
        { name : 'collapsible', type : 'boolean', defaultValue : true },

        /**
         * Collapsed (`true`) or expanded (`false`)
         *
         * To expand or collapse, use {@link #function-expand} and  {@link #function-collapse} functions.
         *
         * @field {Boolean} collapsed
         * @readonly
         */
        { name : 'collapsed', type : 'boolean' },

        /**
         * Set to `true` to hide the column, `false` to show it again.
         * @field {Boolean} hidden
         */
        { name : 'hidden', type : 'boolean' },

        /**
         * Column width in px.
         * @field {Number} width
         */
        { name : 'width', type : 'number' },

        /**
         * Column flex, affects width.
         * @field {Number} flex
         */
        { name : 'flex', type : 'number' },

        /**
         * Column min-width in px. To override the default min-width specified in CSS.
         * @field {Number} minWidth
         */
        { name : 'minWidth', type : 'number' }

    ];

    /**
     * Get the tasks in this column in visual order.
     * @property {TaskBoard.model.TaskModel[]}
     * @readonly
     */
    get tasks() {
        return this.taskBoard.getColumnTasks(this, true);
    }

    get taskBoard() {
        return this.firstStore.taskBoard;
    }

    /**
     * Collapse this column.
     *
     * Uses a transition by default, await the call to be certain that it has finished.
     *
     * @category Expand/collapse
     * @returns {Promise} A promise which is resolved when the column is collapsed
     */
    async collapse() {
        return this.taskBoard.collapse(this);
    }

    /**
     * Expand this column.
     *
     * Uses a transition by default, await the call to be certain that it has finished.
     *
     * @category Expand/collapse
     * @returns {Promise} A promise which is resolved when the column is expanded
     */
    async expand() {
        return this.taskBoard.expand(this);
    }
}
