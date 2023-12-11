import Model from '../../Core/data/Model.js';
/**
 * @module TaskBoard/model/SwimlaneModel
 */

/**
 * Represents a single swimlane on a TaskBoard.
 *
 * When creating a TaskBoard, you can optionally supply an initial set of swimlanes. These are either defined as plain
 * strings, SwimlaneModel data objects or SwimlaneModel records (or a mix thereof). When using strings, the string will
 * be used as is as the swimlane's id and capitalized as its text.
 *
 * ```javascript
 * const highPrio = new SwimlaneModel({
 *     id   : 'high',
 *     text : 'High prio'
 * });
 *
 * const taskBoard = new TaskBoard({
 *     swimlanes : [
 *         // String, equal to passing { id : 'low', text : 'Low' }
 *         'low',
 *         // Data object, in this case with a fixed height and not collapsible from the UI
 *         { id : 'medium', text : 'Medium', height : 200, collapsible : false }
 *         // Record, not commonly used since it is easier to supply the data object directly
 *         highPrio
 *     ]
 * });
 * ```
 *
 * @extends Core/data/Model
 * @uninherit Core/data/mixin/TreeNode
 */
export default class SwimlaneModel extends Model {

    static $name = 'SwimlaneModel';

    static fields = [
        /**
         * The swimlane's unique id, used to match a task to a swimlane (which field on a task to match is specified
         * using then {@link TaskBoard.view.TaskBoardBase#config-swimlaneField} config on TaskBoard).
         * @field {String|Number} id
         */

        /**
         * Text displayed in the swimlane header.
         * @field {String} text
         */
        { name : 'text', type : 'string' },

        /**
         * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
         * class to the swimlane. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the swilane.
         *
         * By default it does not visually affect the UI, but it applies a color to the swimlane that applications can
         * leverage using `currentColor` to style it in the desired way.
         *
         * Using named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     swimlanes : [
         *         { id : 'high', text : 'High', color : 'red' }
         *     ]
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-swimlane b-taskboard-color-red">
         * ```
         *
         * Which can the be used for example like:
         *
         * ```css
         * .b-taskboard-swimlane-header {
         *     border-left : 5px solid currentColor; // where currentColor is the color defined by b-red
         * }
         * ```
         *
         * Using non-named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     swimlanes : [
         *         { id : 'high', text : 'High', color : 'hsl(229deg 66% 42%)' }
         *     ]
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-swimlane" style="color: hsl(229deg 66% 42%)">
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
         * Allow collapsing this swimlane
         * @field {Boolean} collapsible=true
         */
        { name : 'collapsible', type : 'boolean', defaultValue : true },

        /**
         * Collapsed (true) or expanded (False).
         *
         * To expand or collapse, use TaskBoards {@link TaskBoard.view.mixin.ExpandCollapse#function-expand} and
         * {@link TaskBoard.view.mixin.ExpandCollapse#function-collapse} functions.
         *
         * @field {Boolean} collapsed
         * @readonly
         */
        { name : 'collapsed', type : 'boolean' },

        /**
        * Set to `true` to hide the swimlane, `false` to show it again.
        * @field {Boolean} hidden
        */
        { name : 'hidden', type : 'boolean' },

        /**
         * Swimlane height in px.
         * @field {Number} height
         */
        { name : 'height', type : 'number' },

        /**
         * Swimlane flex, affects height.
         * @field {Number} flex
         */
        { name : 'flex', type : 'number' },

        /**
         * Number of tasks per row to display in this swimlane. Leave blank to use the setting from the
         * {@link TaskBoard.view.TaskBoardBase#config-tasksPerRow} config on TaskBoard.
         * @field {Number} tasksPerRow
         */
        'tasksPerRow'
    ];

    get taskBoard() {
        return this.firstStore.taskBoard;
    }

    /**
     * Collapse this swimlane.
     *
     * Uses a transition by default, await the call to be certain that it has finished.
     *
     * @category Expand/collapse
     * @returns {Promise} A promise which is resolved when the column is collapsed
     */
    async collapse() {
        this.taskBoard.collapse(this);
    }

    /**
     * Expand this swimlane.
     *
     * Uses a transition by default, await the call to be certain that it has finished.
     *
     * @category Expand/collapse
     * @returns {Promise} A promise which is resolved when the column is expanded
     */
    async expand() {
        return this.taskBoard.expand(this);
    }

    /**
     * Get tasks in this swimlane.
     * @property {TaskBoard.model.TaskModel[]}
     * @readonly
     */
    get tasks() {
        return [...(this.taskBoard.getSwimlaneTasks(this) || [])];
    }
}
