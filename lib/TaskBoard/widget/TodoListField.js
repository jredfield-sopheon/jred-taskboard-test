import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import StringHelper from '../../Core/helper/StringHelper.js';
import Editor from '../../Core/widget/Editor.js';
import Field from '../../Core/widget/Field.js';
import Widget from '../../Core/widget/Widget.js';
import '../../Core/widget/List.js';
import '../../Core/widget/Button.js';

/**
 * @module TaskBoard/widget/TodoListField
 */

/**
 * A field that displays, and also lets users edit, a list of todo items. Each item has a checkbox to mark if the item
 * is completed or not and a button to edit its text/remove it. Designed to be used in the task editor, to work in
 * tandem with the {@link TaskBoard.view.item.TodoListItem}.
 *
 * {@inlineexample TaskBoard/widget/TodoListField.js}
 *
 * To hook it up, add it to the task editors items and link it to a field on your task model declared with
 * `type : 'array'`. The fields data is expected to be an array of objects. Configure {@link #config-textField} and
 * {@link #config-checkedField} to match the names used by the objects in your array.
 *
 * This snippet illustrates basic usage:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    features : {
 *        taskEdit : {
 *            items : {
 *                todo : {
 *                    type         : 'todolist',
 *                    label        : 'Todo',
 *                    field        : 'todo',
 *                    // "title" property will be used as the todo item text
 *                    textField    : 'title',
 *                    // "done" property will drive the checkbox
 *                    checkedField : 'done'
 *                }
 *            }
 *        }
 *    },
 *
 *    project : {
 *        taskStore : {
 *            fields : [ { name : 'todo', type : 'array' } ]
 *        }
 *
 *        tasksData : [
 *            {
 *                id   : 1,
 *                name : 'Important task',
 *                todo : [
 *                    { title : 'Fix this', done : true },
 *                    { title : 'Fix that', done : false }
 *                ]
 *            }
 *        ]
 *    }
 * });
 * ```
 *
 * @extends Core/widget/Field
 * @classtype todolistfield
 * @classtypealias todolist
 * @inputfield
 */
export default class TodoListField extends Field {

    static $name = 'TodoListField';

    static type = 'todolistfield';

    static alias = 'todolist';

    static configurable = {
        /**
         * Name of a property on a todo item to display as its text.
         *
         * @config {String}
         * @category Common
         * @default
         */
        textField : 'text',

        /**
         * Name of a property on a todo item to use for the checkbox. The property is expected to be a boolean.
         *
         * @config {String}
         * @category Common
         * @default
         */
        checkedField : 'checked',

        /**
         * Configure as `false` to hide the per item edit button and the add item button. Users can still check/uncheck
         * items.
         *
         * @config {Boolean}
         * @default
         */
        editableItems : true,

        list : {
            type : 'list',

            multiSelect : true,

            store : {
                fields : []
            },

            itemIconTpl() {
                return `<i class="b-todo-checkbox b-icon"></i>`;
            }
        },

        addButton : {
            type : 'button',
            cls  : 'b-todo-add',
            icon : 'b-icon-add',
            text : 'L{TodoListField.add}'
        },

        role : null
    };

    compose() {
        const { editableItems } = this;

        return {
            class : {
                'b-editable' : editableItems
            }
        };
    }

    changeList(list) {
        return Widget.create(ObjectHelper.assign({
            // List does not support remapping out of the box
            itemTpl : record => StringHelper.xss`<div class="b-todo-text">${record.getValue(this.textField)}</div><i class='b-todo-edit b-icon b-icon-edit' data-noselect></i>`
        }, list));
    }

    updateList(list) {
        // Detect click on edit icon
        list.ion({
            item    : 'onItemClick',
            thisObj : this
        });

        // Detect check/uncheck
        list.ion({
            selectionChange : 'onSelectionChange',
            thisObj         : this
        });
    }

    changeAddButton(button) {
        const result = Widget.create(button);

        this.ariaElement = result.element;

        return result;
    }

    updateAddButton(button) {
        button.ion({
            click   : 'onAddClick',
            thisObj : this
        });
    }

    get childItems() {
        return [this.list, this.addButton];
    }

    get inputElement() {
        return this.list.element;
    }

    get innerElements() {
        return super.innerElements.concat(this.addButton.element);
    }

    changeValue(value) {
        value = value || [];

        let autoUpdate = false;

        // Auto update original array if we are used in an auto updating container
        this.eachAncestor(a => {
            if (a.autoUpdateRecord) {
                autoUpdate = true;
                return false;
            }
        });

        // Original value (or a clone thereof if we are not live updating) is kept up to date on later modifications
        this.originalValue = autoUpdate ? value : ObjectHelper.clone(value);

        if (value) {
            // Clone original value as our value, to not pollute the original value
            value = ObjectHelper.clone(value);

            value.forEach((v, i) => {
                // id required by list
                v.id = i + 1;
                // map back to original value
                v.originalIndex = i;
            });
        }

        return value;
    }

    updateValue(value) {
        if (value) {
            const me = this;

            // Populate the list with our value clone
            me.list.items = value;

            // Selection is used to check/uncheck items. Set flag to prevent updating original at this stage
            me.isSettingValue = true;
            me.list.selected.values = value.filter(v => v[me.checkedField]);
            me.isSettingValue = false;
        }
    }

    get value() {
        // Always return a new array, required to flag array data field as modified / for UI to update
        return this.originalValue.slice();
    }

    set value(value) {
        super.value = value;
    }

    // Cant be invalid currently
    get isValid() {
        return true;
    }

    // Edit a todo item, using overlaid editor
    editItem(record, element) {
        const
            me     = this,
            // Always creating a new editor, destroyed when editing finishes
            editor = new Editor({
                appendTo   : me.element,
                owner      : me,
                cls        : 'b-todo-editor',
                inputField : {
                    type     : 'text',
                    triggers : {
                        remove : {
                            cls : 'b-todo-remove b-icon-trash',
                            handler() {
                                me.removeItem(record);
                                editor.cancelEdit();
                            }
                        }
                    }
                },
                // Above modal
                style             : 'z-index : 20000',
                internalListeners : {
                    complete({ value }) {
                        me.originalValue[record.originalIndex][me.textField] = value;
                        me.triggerFieldChange({ value : me.value, userAction : true });
                    },
                    finishEdit() {
                        editor.destroy();
                    },
                    thisObj : me
                }
            });

        // Start editing using configured field mapping
        editor.startEdit({
            target : element,
            record,
            field  : me.textField
        });
    }

    // Remove a todo item, updating both the list and the original value
    removeItem(record) {
        const
            me                = this,
            { originalIndex } = record;

        // Move following items up one notch to match position in originalValue after the splice below
        me.list.store.forEach(r => {
            if (r.parentIndex > record.parentIndex) {
                r.originalIndex--;
            }
        });

        me.list.store.remove(record);

        me.originalValue.splice(originalIndex, 1);

        me.triggerFieldChange({ value : me.value, userAction : true });
    }

    // Lists selection model is used to check/uncheck todo items. React on changes here
    onSelectionChange() {
        const
            me       = this,
            { list } = me;

        if (!me.isSettingValue) {
            me.originalValue.forEach((v, i) => {
                const listRecord = list.store.getAt(i);
                // Selection might change as a reaction to an item being removed = no listRecord
                if (listRecord) {
                    v[me.checkedField] = list.selected.includes(listRecord);
                }
            });

            me.triggerFieldChange({ value : me.value, userAction : true });
        }
    }

    // Clicked on a list item, react if it is on the edit icon
    onItemClick({ record, event }) {
        if (event.target.matches('.b-todo-edit')) {
            this.editItem(record, event.target.closest('.b-list-item'));
        }
    }

    // Clicked the add button, add to original value and then plug it back in to not have to care about syncing it with
    // lists store
    onAddClick() {
        const me = this;

        me.originalValue.push({
            [me.textField]    : me.L('L{newTodo}'),
            [me.checkedField] : false
        });

        me.value = me.originalValue;

        me.triggerFieldChange({ value : me.value, userAction : true });
    }
}

TodoListField.initClass();
