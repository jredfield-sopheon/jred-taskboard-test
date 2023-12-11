import EventModel from '../../Scheduler/model/EventModel.js';

/**
 * @module TaskBoard/model/TaskModel
 */

/**
 * Represents a single task on your TaskBoard, usually added to a {@link TaskBoard/store/TaskStore}.
 *
 * ## Customizing Task fields
 *
 * The TaskModel has a few predefined fields as seen under Fields below. If you want to add new fields or change
 * existing fields, you can do that by subclassing this class:
 *
 * ```javascript
 * class MyTask extends TaskModel {
 *
 *     static get fields() {
 *         return [
 *            // Add a new field
 *            { name: 'myField', type : 'number', defaultValue : 0 }
 *         ];
 *     }
 *
 *     ...
 * }
 *
 * // Instances of your class now has getters / setters defined for your field
 * const task = new MyTask();
 * console.log(task.myField); // => 0
 * ```
 *
 * If you want to use other names for any predefined field in your data, you can reconfigure them as seen below:
 *
 * ```javascript
 * class MyTask extends TaskModel {
 *
 *     static get fields() {
 *         return [
 *            // Remap status -> state
 *            { name: 'status', dataSource : 'state' }
 *         ];
 *     }
 *
 *     ...
 * }
 * ```
 *
 * ## Configuring the Project to use a custom task model
 *
 * Here's how you configure the {@link TaskBoard/model/ProjectModel Project} to use a certain Model class:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     // Configure the project to use our custom task model and to load data remotely
 *     project : {
 *         taskModelClass : MyTask,
 *
 *         autoLoad  : true
 *         transport : {
 *             load : {
 *                 url : 'data/data.json'
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Read-only tasks
 *
 * A task can be flagged as read-only using the {@link #field-readOnly} field. This protects it from being edited in the
 * UI, but has no effect on the data layer.
 *
 * {@inlineexample TaskBoard/model/TaskModelReadOnly.js}
 *
 * Please refer to {@link Core/data/Model} for additional details.
 *
 * @extends Scheduler/model/EventModel
 */
export default class TaskModel extends EventModel {

    static $name = 'TaskModel';

    static fields = [
        /**
         * Task status, for example for linking to a column on the TaskBoard.
         *
         * @field {String} status
         */
        'status',

        /**
         * Task priority, for example for linking to a swimlane on the TaskBoard.
         *
         * @field {String|Number} prio
         */
        'prio',

        /**
         * Task description, by default shown in tasks body.
         *
         * @field {String} description
         */
        'description',

        /**
         * Color, named colors are applied as a `b-taskboard-color-{color}` (for example `b-taskboard-color-red`) CSS
         * class to the tasks card. Colors specified as hex, `rgb()` etc. are applied as `style.color` to the card.
         *
         * If no color is specified, any color defined on the {@link TaskBoard/model/ColumnModel#field-color column} or
         * {@link TaskBoard/model/SwimlaneModel#field-color swimlane} will apply instead.
         *
         * By default it does not visually affect the UI, but it applies a color to the task that applications can
         * leverage using `currentColor` to style it in the desired way.
         *
         * Using named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     project {
         *         tasksData : [
         *             { id : 1, name : 'Important task', eventColor : 'red' }
         *         ]
         *     }
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-card b-taskboard-color-red">
         * ```
         *
         * Which can the be used for example like:
         *
         * ```css
         * .b-taskboard-card {
         *     // currentColor is the color defined by b-red
         *     border-left : 5px solid currentColor;
         * }
         * ```
         *
         * Using non-named colors:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     project {
         *         tasksData : [
         *             { id : 1, name : 'Important task', eventColor : '#ff0000' }
         *         ]
         *     }
         * });
         * ```
         *
         * Will result in:
         *
         * ```html
         * <div class="b-taskboard-card" style="color: #ff0000">
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
         * <div class="b-colorbox b-inline b-taskboard-color-deep-orange"></div>deep-orange,
         * <div class="b-colorbox b-inline b-taskboard-color-gray"></div>gray,
         * <div class="b-colorbox b-inline b-taskboard-color-light-gray"></div>light-gray
         *
         * @field {'red'|'pink'|'purple'|'deep-purple'|'indigo'|'blue'|'light-blue'|'cyan'|'teal'|'green'|'light-green'|'lime'|'yellow'|'amber'|'orange'|'deep-orange'|'gray'|'light-gray'|String|null} eventColor
         */
        'eventColor',

        /**
         * Task weight, used by default to determine its index in a column. Higher weights are displayed further down.
         *
         * The weight is applied as a default sorter to the {@link TaskBoard/store/TaskStore}.
         *
         * When no weights are defined, task order is determined by store order.
         *
         * @field {Number} weight
         */
        { name : 'weight', type : 'number' },

        /**
         * Set to `true` to make the task read-only, preventing it from being edited in the UI.
         *
         * See the class description above for a live demo.
         *
         * @field {Boolean} readOnly
         */
        { name : 'readOnly', type : 'boolean' }
    ];
}
