import Base from '../../../Core/Base.js';
import TaskItem from '../item/TaskItem.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';

// Items used by default
import '../item/TextItem.js';
import '../item/ResourceAvatarsItem.js';

/**
 * @module TaskBoard/view/mixin/TaskItems
 */

const
    fieldLess        = {
        resourceAvatars : 1,
        separator       : 1,
        taskMenu        : 1
    },
    taskItemSelector = '.b-taskboard-taskitem',
    afterRe          = /\s*<\s*/,
    beforeRe         = /\s*>\s*/;

/**
 * Mixin that allows adding multiple predefined items (sort of like task widgets) to tasks:
 *
 * {@inlineexample TaskBoard/view/mixin/TaskItems.js}
 *
 * You can pick from the following item types:
 *
 * * {@link TaskBoard/view/item/ImageItem image}
 * * {@link TaskBoard/view/item/JsxItem jsx}
 * * {@link TaskBoard/view/item/ProgressItem progress}
 * * {@link TaskBoard/view/item/RatingItem rating}
 * * {@link TaskBoard/view/item/ResourceAvatarsItem resourceAvatars}
 * * {@link TaskBoard/view/item/SeparatorItem separator}
 * * {@link TaskBoard/view/item/TagsItem tags}
 * * {@link TaskBoard/view/item/TemplateItem template}
 * * {@link TaskBoard/view/item/TextItem text}
 * * {@link TaskBoard/view/item/TodoListItem todoList}
 *
 * All of which are included in this demo:
 *
 * {@inlineexample TaskBoard/view/mixin/TaskItemsAll.js}
 *
 * ## Configuring which items to use
 *
 * Task cards are divided into three sections, header, body and footer. Each section can hold items. The following items
 * are defined by default:
 *
 * | Section     | Key             | Type                                                            | Bound to           |
 * |-------------|-----------------|-----------------------------------------------------------------|--------------------|
 * | headerItems | text            | {@link TaskBoard/view/item/TextItem text}                       | name               |
 * | bodyItems   | text            | {@link TaskBoard/view/item/TextItem text}                       | description        |
 * | footerItems | resourceAvatars | {@link TaskBoard/view/item/ResourceAvatarsItem resourceAvatars} | assigned resources |
 *
 * Add items to tasks by supplying the {@link #config-bodyItems bodyItems config} (the other sections work the same):
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     bodyItems : {
 *         // Will use "prio" as its field
 *         prio  : { type : 'text' },
 *         // Will use "status" as its field
 *         state : { type : 'text', field : 'status' }
 *     }
 * });
 * ```
 *
 * The items you supply are merged with the predefined items (as listed in the table above).
 *
 * The only always required config for new items is `type`, which determines what kind of task item to use. Which other
 * configs you can use depends on the item type.
 *
 * By default, the key in the `items` object will be used to link the item to a field on a task. You can override the
 * default by using the `field` config. Note that, in most cases, if the value of the backing field is `null` or
 * `undefined`, the item will not be rendered.
 *
 * To rearrange items, specify the {@link TaskBoard/view/item/TaskItem#config-order} config of each item. Applied as
 * flex order.
 *
 * You can also add items to a tasks header and footer, using {@link #config-headerItems} and
 * {@link #config-footerItems}.
 *
 * ## Manipulating items per task
 *
 * You can manipulate which items are shown for a task by supplying a {@link #config-processItems} function. It will be
 * called during rendering for each task and in it you can manipulate the passed `bodyItems` object. Set a property of
 * it to `null` to remove that item for that task:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     bodyItems : {
 *         progress  : { type : 'progress' }
 *     },
 *
 *     processItems({ taskRecord, bodyItems }) {
 *         if (taskRecord.status === 'done') {
 *             bodyItems.progress = null;
 *         }
 *     }
 * });
 * ```
 *
 * {@inlineexample TaskBoard/view/mixin/TaskItemsProcessItems.js}
 *
 * @mixin
 */
export default Target => class TaskItems extends (Target || Base) {

    //region Config

    static $name = 'TaskItems';

    static configurable = {
        /**
         * Items in card header.
         *
         * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
         *
         * Reassigning this property merges the supplied object with the configured items:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    headerItems : {
         *        status : { type : 'text' }
         *    }
         * });
         *
         * taskBoard.headerItems = {
         *     status : { hidden : true },
         *     tags   : { type : 'tags' }
         * };
         *
         * // Results in:
         * //
         * // headerItems = {
         * //     status : { type : 'text', hidden: true }
         * //     tags   : { type : 'tags' }
         * // }
         * }
         * ```
         *
         * @member {Object<String,TaskItemOptions>} headerItems
         * @category Task content
         */

        /**
         * Items to add to each card's header.
         *
         * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
         * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
         *
         * You are always required to supply a `type`, see the docs for each item type for more information on available
         * configs.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    headerItems : {
         *        status : { type : 'text' }
         *    }
         * });
         * ```
         *
         * For more information, see the {@link #class-description class description} above.
         *
         * @config {Object<String,TaskItemOptions>}
         * @category Task content
         */
        headerItems : {
            value : {
                text : { type : 'text', field : 'name' }
            },

            $config : {
                merge : 'items'
            }
        },

        /**
         * Items to add to each card's body.
         *
         * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
         *
         * Reassigning this property merges the supplied object with the configured items:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    bodyItems : {
         *        status : { type : 'text' }
         *    }
         * });
         *
         * taskBoard.bodyItems = {
         *     status : { hidden : true },
         *     tags   : { type : 'tags' }
         * };
         *
         * // Results in:
         * //
         * // bodyItems = {
         * //     status : { type : 'text', hidden: true }
         * //     tags   : { type : 'tags' }
         * // }
         * }
         * ```
         *
         * @member {Object<String,TaskItemOptions>} bodyItems
         * @category Task content
         */

        /**
         * Items to add to each card's body.
         *
         * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
         * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
         *
         * You are always required to supply a `type`, see the docs for each item type for more information on available
         * configs.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    bodyItems : {
         *        status : { type : 'text' }
         *    }
         * });
         * ```
         *
         * For more information, see the {@link #class-description class description} above.
         *
         * @config {Object<String,TaskItemOptions>}
         * @category Task content
         */
        bodyItems : {
            value : {
                text : { type : 'text', field : 'description' }
            },

            $config : {
                merge : 'items'
            }
        },

        /**
         * Items in card footer.
         *
         * As an object keyed by field names, values are {@link TaskBoard/view/item/TaskItem#configs TaskItem configs}.
         *
         * Reassigning this property merges the supplied object with the configured items:
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    footerItems : {
         *        status : { type : 'text' }
         *    }
         * });
         *
         * taskBoard.footerItems = {
         *     status : { hidden : true },
         *     tags   : { type : 'tags' }
         * };
         *
         * // Results in:
         * //
         * // footerItems = {
         * //     status : { type : 'text', hidden: true }
         * //     tags   : { type : 'tags' }
         * // }
         * }
         * ```
         *
         * @member {Object<String,TaskItemOptions>} footerItems
         * @category Task content
         */

        /**
         * Items to add to each card's footer.
         *
         * Supplied keys are used to bind to a field on the {@link TaskBoard/model/TaskModel task record}, supplied
         * values are used to configure the {@link TaskBoard/view/item/TaskItem#configs items}.
         *
         * You are always required to supply a `type`, see the docs for each item type for more information on available
         * configs.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    footerItems : {
         *        status : { type : 'text' }
         *    }
         * });
         * ```
         *
         * For more information, see the {@link #class-description class description} above.
         *
         * @config {Object<String,TaskItemOptions>}
         * @category Task content
         */
        footerItems : {
            value : {
                resourceAvatars : { type : 'resourceAvatars', field : 'resources' }
            },

            $config : {
                merge : 'items'
            }
        },

        /**
         * A function called on each render before adding items to a tasks card, allowing runtime manipulation of them.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     processItems({ bodyItems, taskRecord }) {
         *        // Remove the progress item for done tasks
         *        if (taskRecord.status === 'done') {
         *            bodyItems.progress = null;
         *        }
         *     }
         * });
         * ```
         *
         * NOTE: The function is only intended for manipulating the passed items, you should not update the passed
         * `taskRecord` in it since updating records triggers another round of rendering.
         *
         * @config {Function}
         * @param {Object} context
         * @param {Object<String,TaskItemOptions>} context.headerItems Item config objects for the task header, keyed by ref
         * @param {Object<String,TaskItemOptions>} context.bodyItems Item config objects for the task body, keyed by ref
         * @param {Object<String,TaskItemOptions>} context.footerItems Item config objects for the task footer, keyed by ref
         * @param {TaskBoard.model.TaskModel} context.taskRecord Record representing task to be rendered
         * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
         * @category Task content
         */
        processItems : null
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeProcessItems(processItems) {
        ObjectHelper.assertFunction(processItems, 'processItems');

        return processItems;
    }

    //endregion

    // region Configuring items


    mergeItems(items, old) {
        if (old && items) {
            items = ObjectHelper.mergeItems(old, items);
        }

        return items;
    }

    // Needed to allow reconfiguring on the fly (for responsive)
    changeHeaderItems(items, old) {
        ObjectHelper.assertObject(items, 'headerItems');

        return this.mergeItems(items, old);
    }

    // Needed to allow reconfiguring on the fly (for responsive)
    changeBodyItems(items, old) {
        ObjectHelper.assertObject(items, 'bodyItems');

        return this.mergeItems(items, old);
    }

    // Needed to allow reconfiguring on the fly (for responsive)
    changeFooterItems(items, old) {
        ObjectHelper.assertObject(items, 'footerItems');

        return this.mergeItems(items, old);
    }

    //endregion

    //region Rendering

    // Render items to header, body or footer of the supplied task
    renderItems(taskRecord, items, target, cardSize) {
        for (const key in items) {
            const config = items[key];
            if (config && !config.hidden) {
                // Defaults to use the key as the field, but allows overriding it using the field config
                if (!('field' in config)) {
                    if (key.includes('>')) {
                        [config.field] = key.split(beforeRe);
                    }
                    else if (key.includes('<')) {
                        [, config.field] = key.split(afterRe);
                    }
                    else {
                        config.field = key;
                    }
                }

                const
                    { field } = config,
                    value     = taskRecord.getValue(field);

                // Most fields render nothing if they have no value, some are excluded from that logic (separator etc)
                if (value != null || fieldLess[config.type] || config.renderNull) {
                    const
                        // TaskItem implements factoryable, we are not using instances but rather static items to avoid
                        // creating one instance per card. Thus we only use the lookup functionality of factoryable
                        item      = TaskItem.resolveType(config.type),
                        typeCls   = `b-taskboard-${StringHelper.hyphenate(config.type)}`,
                        // Base DomConfig, shared by all task items
                        domConfig = {
                            class : {
                                'b-taskboard-taskitem' : 1,
                                [typeCls]              : 1,
                                [config.cls]           : config.cls,
                                'b-editable'           : !taskRecord.readOnly && item.getEditorConfig({ config, item })
                            },
                            dataset : {
                                role : `item-${field}`,
                                field,
                                ref  : key
                            },
                            elementData : {
                                item,
                                taskRecord,
                                config
                            },
                            style : {
                                order : config.order,
                                style : config.style
                            }
                        },
                        // Call items (static) renderer, further populating the DomConfig from above
                        result    = item.render({ taskBoard : this, domConfig, value, config, taskRecord, cardSize });

                    // Returning false from an items renderer prevents it from being shown
                    if (result !== false) {
                        target.children[key] = domConfig;
                    }
                }
            }
        }
    }

    // Hook into card rendering
    populateCard(args) {
        super.populateCard?.(args);

        const
            me                                   = this,
            { processItems }                     = me,
            { taskRecord, cardConfig, cardSize } = args,
            {
                headerItems : sizeHeaderItems,
                bodyItems   : sizeBodyItems,
                footerItems : sizeFooterItems
            }                                    = cardSize || {},
            { header, body, footer }             = cardConfig.children;

        let { headerItems, bodyItems, footerItems } = me;

        // Items are shared between all cards, clone before processing to only affect the set for this card
        if (sizeHeaderItems || processItems) {
            headerItems = ObjectHelper.clone(headerItems);
        }

        if (sizeBodyItems || processItems) {
            bodyItems = ObjectHelper.clone(bodyItems);
        }

        if (sizeFooterItems || processItems) {
            footerItems = ObjectHelper.clone(footerItems);
        }

        // Apply any card size specific items
        sizeHeaderItems && ObjectHelper.merge(headerItems, sizeHeaderItems);
        sizeBodyItems && ObjectHelper.merge(bodyItems, sizeBodyItems);
        sizeFooterItems && ObjectHelper.merge(footerItems, sizeFooterItems);

        // Allow app a shot at processing the items before they are shown. Can be used to add or remove items and
        // manipulate configs
        processItems?.({ headerItems, bodyItems, footerItems, taskRecord, cardSize });

        // Render items into card header, body and footer
        me.renderItems(taskRecord, headerItems, header, cardSize);
        me.renderItems(taskRecord, bodyItems, body, cardSize);
        me.renderItems(taskRecord, footerItems, footer, cardSize);
    }

    //endregion

    //region Listeners

    resolveTaskItem(element) {
        // First look up, if inside an item. Then looks down, in case given a card or similar
        const taskItemElement = element.closest(taskItemSelector) || element.querySelector(`:scope > * > ${taskItemSelector}, :scope > ${taskItemSelector}`);

        if (taskItemElement) {
            return {
                ...taskItemElement.elementData,
                element : taskItemElement
            };
        }

        return null;
    }

    // Relay clicks to items
    onTaskClick(args) {
        const taskItem = this.resolveTaskItem(args.event.target);

        if (taskItem) {
            const { config, item  } = taskItem;

            item.onClick?.({
                config,
                ...args
            });
        }

        super.onTaskClick(args);
    }

    // Relay double clicks to items
    onTaskDblClick(args) {
        const taskItem = this.resolveTaskItem(args.event.target);

        if (taskItem) {
            const { config, item  } = taskItem;

            item.onDblClick?.({
                config,
                ...args
            });
        }

        super.onTaskDblClick(args);
    }

    //endregion

};
