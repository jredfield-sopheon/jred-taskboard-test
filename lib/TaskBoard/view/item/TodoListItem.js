import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/TodoListItem
 */

/**
 * Item displaying a list of todo items with associated checkboxes. It allows users to toggle the checkbox for each item
 * on the card to indicate if that item is completed or not. By adding a {@link TaskBoard/widget/TodoListField} to the
 * task editor users can also add, edit and remove todo items.
 *
 * {@inlineexample TaskBoard/view/item/TodoListItem.js}
 *
 * It consumes an array of objects representing todo items. For this item to work as indented, that array has to be
 * supplied by a task field using `type : 'array'`. It is also important to configure the {@link #config-textField} and
 * {@link #config-checkedField} to match properties of the objects in that array. This snippet illustrates a possible
 * setup:
 *
 * ```javascript
 * // Custom task model with a todo field of array type
 * class MyTask extends TaskModel {
 *     static fields = [
 *        { name : 'todo', type : 'array' }
 *     ];
 * }
 *
 * const taskBoard = new TaskBoard({
 *    project : {
 *        // Use the custom task model defined above
 *        taskModelClass : MyTask,
 *
 *        tasksData : [
 *            {
 *              id : 1,
 *              name : 'Order software',
 *              // The custom field, accepts an array
 *              todo : [
 *                  { title : 'Sketchup Pro', done : false },
 *                  { title : 'AutoCAD LT', done : true },
 *                  { title : 'Inventor', done : false }
 *              ]
 *            }
 *        ]
 *    },
 *
 *    bodyItems : {
 *        todo : {
 *            // Add a todo list item to card body
 *            type         : 'todoList',
 *            // Map text to the "title" field
 *            textField    : 'text',
 *            // Map checkbox to the "done" field
 *            checkedField : 'done'
 *        }
 *    }
 * });
 * ```
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype todoList
 */
export default class TodoListItem extends TaskItem {
    static $name = 'TodoListItem';

    static type = 'todoList';

    /**
     * Name of a property on a todo item to display as its text.
     *
     * @config {String} textField
     * @category Common
     * @default text
     */

    /**
     * Name of a property on a todo item to use for the checkbox. The property is expected to be a boolean.
     *
     * @config {String} checkedField
     * @category Common
     * @default checked
     */

    /**
     * Name of a property on a todo item whose value will be added as a CSS class to the todo item.
     *
     * @config {String} clsField
     * @category Common
     * @default cls
     */

    // private for now:
    // checkedIcon
    // uncheckedIcon

    /**
     * @hideconfigs editor
     */

    static defaultEditor = null;

    static render({ domConfig, value, config, taskRecord }) {
        if (value) {
            const {
                textField = 'text',
                checkedField = 'checked',
                clsField = 'cls',
                checkedIcon = 'b-icon b-icon-checked',
                uncheckedIcon = 'b-icon b-icon-unchecked'
            } = config;

            if (this.firstRender !== false) {
                const dataField = taskRecord.getFieldDefinition(config.field);
                if (!dataField.isArrayDataField) {
                    throw new Error('TodoListItem has to be mapped to a field with `type : "array"`');
                }

            }

            domConfig.children = value.map((todo, index) => ({
                class : {
                    'b-taskboard-todolist-todo' : 1,
                    [todo[clsField]]            : todo[clsField],
                    'b-checked'                 : todo[checkedField]
                },
                children : {
                    icon : {
                        tag   : 'i',
                        class : todo[checkedField] ? checkedIcon : uncheckedIcon
                    },
                    text : {
                        tag  : 'span',
                        text : todo[textField]
                    }
                },
                elementData : {
                    index
                }
            }));

            this.firstRender = false;
        }
    }

    static onClick({ source : taskBoard, taskRecord, event, config }) {
        const element = event.target.closest('.b-taskboard-todolist-todo');

        if (element && !taskRecord.readOnly) {
            const
                { checkedField = 'checked', field } = config,
                { index }                           = element.elementData,
                // array fields has to be assigned a new array to detect a change, hence the slice
                clone                               = taskRecord.getValue(field).slice(),
                todo                                = clone[index];

            // Toggle the mapped fields value
            todo[checkedField] = !todo[checkedField];

            // Assign the cloned array to the task record
            taskRecord.setValue(field, clone);

            taskBoard.trigger('todoToggle', { taskRecord, todo, checked : todo[checkedField], element, event });

            // Don't want the click to select the task, feels a bit awkward when it does
            event.preventDefault();
        }
    }

    // Prevent editor from opening when dbl clicking a todo item
    static onDblClick({ event }) {
        event.preventDefault();
    }

}

TodoListItem.initClass();
