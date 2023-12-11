import DomHelper from '../../Core/helper/DomHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import '../../Core/widget/Toolbar.js';
import '../../Core/widget/Menu.js';
import TaskBoardFeature from './TaskBoardFeature.js';

/**
 * @module TaskBoard/feature/ColumnToolbars
 */

/**
 * Adds toolbars to the top and/or bottom of each column. By default it adds a bottom toolbar containing a single button
 * for adding events to that column/swimlane:
 *
 * {@inlineexample TaskBoard/feature/ColumnToolbars.js}
 *
 * To add, remove or modify toolbar items for all columns, see {@link #config-topItems} and {@link #config-bottomItems}:
 *
 * {@inlineexample TaskBoard/feature/ColumnToolbarsAdd.js}
 *
 * To have per column/swimlane control over the items, see {@link #config-processItems}:
 *
 * {@inlineexample TaskBoard/feature/ColumnToolbarsProcess.js}
 *
 * In handlers for buttons etc, you can access which column/swimlane the action was taken in on the supplied `source`
 * param, using its `columnRecord` and `swimlaneRecord` properties:
 *
 * ```javascript
 * new TaskBoard({
 *    features : {
 *        columnToolbars : {
 *            topItems : {
 *                clearButton : {
 *                    icon    : 'b-fa-trash',
 *                    onClick({ source }) {
 *                        if (source.columnRecord) {
 *                            ...
 *                        }
 *                    }
 *                }
 *            }
 *        }
 *    }
 * });
 * ```
 *
 * This feature is **enabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype columnToolbars
 * @feature
 */
export default class ColumnToolbars extends TaskBoardFeature {

    static $name = 'ColumnToolbars';

    static type = 'columnToolbars';

    static configurable = {
        /**
         * Items to add to the top toolbar, in object format.
         *
         *
         * ```javascript
         * new TaskBoard({
         *    features : {
         *        columnToolbars : {
         *            topItems : {
         *                clearButton : {
         *                    icon    : 'b-fa-trash',
         *                    onClick : ...
         *                }
         *            }
         *        }
         *    }
         * });
         * ```
         *
         * @config {Object<String,ContainerItemConfig|Boolean|null>}
         */
        topItems : null,

        /**
         * Items to add to the bottom toolbar, in object format.
         *
         * To remove existing items, set corresponding keys to `null`.
         *
         * ```javascript
         * new TaskBoard({
         *    features : {
         *        columnToolbars : {
         *            bottomItems : {
         *                clearButton : {
         *                    icon    : 'b-fa-trash',
         *                    onClick : ...
         *                }
         *            }
         *        }
         *    }
         * });
         * ```
         *
         * @config {Object<String,ContainerItemConfig|Boolean|null>}
         */
        bottomItems : {
            addTask : true
        },

        // Predefined items that can be used in topItems and/or bottomItems

        namedItems : {
            addTask : {
                type              : 'button',
                icon              : 'b-icon-add',
                tooltip           : 'L{TaskBoard.addTask}',
                ariaLabel         : 'L{TaskBoard.addTask}',
                internalListeners : {
                    click : 'onAddClick'
                }
            }
        },

        /**
         * A function called before displaying the toolbar that allows manipulations of its items.
         * Returning `false` from this function prevents the menu being shown.
         *
         * ```javascript
         * features         : {
         *    columnToolbars : {
         *         processItems({ items, location, columnRecord, swimlaneRecord }) {
         *             // Add or hide existing items here as needed
         *             items.myAction = {
         *                 text   : 'Cool action',
         *                 icon   : 'b-fa-ban',
         *                 onClick : () => console.log(`Clicked button for ${columnRecord.text}`)
         *             };
         *
         *            if (columnRecord.id === 'done') {
         *                items.addTask = false
         *            }
         *         }
         *     }
         * },
         * ```
         *
         * @config {Function}
         * @param {Object} context An object with information about the toolbar being shown
         * @param {Object<String,ContainerItemConfig>} context.items An object containing the toolbar item configs keyed by ref
         * @param {'top'|'bottom'} context.location Toolbar location, "top" or "bottom"
         * @param {TaskBoard.model.ColumnModel} context.columnRecord Record representing toolbars column
         * @param {TaskBoard.model.SwimlaneModel} context.swimlaneRecord Record representing toolbars swimlane
         * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
         * @preventable
         */
        processItems : null
    };

    // Holds exising toolbars, keyed by location, column and swimlane
    columnMap = new Map();

    static pluginConfig = {
        chain : ['populateColumn', 'onRemoveColumnElement', 'onRemoveSwimlaneElement']
    };

    doDestroy() {
        for (const [, toolbar] of this.columnMap) {
            toolbar.destroy();
        }

        super.doDestroy();
    }

    //region Type assertions

    changeTopItems(items) {
        ObjectHelper.assertObject(items, 'features.columnToolbars.topItems');

        return items;
    }

    changeBottomItems(items) {
        ObjectHelper.assertObject(items, 'features.columnToolbars.bottomItems');

        return items;
    }

    changeProcessItems(fn) {
        ObjectHelper.assertFunction(fn, 'features.columnToolbars.processItems');

        return fn;
    }

    //endregion

    //region Toolbars

    // removeToolbar(location) {
    //     const columnMap = this.columnMap;
    //
    //     for (const [key, toolbar] of columnMap) {
    //         if (key.startsWith(location)) {
    //             toolbar.destroy();
    //             columnMap.delete(toolbar);
    //         }
    //     }
    // }
    //
    // changeTopItems(items, old) {
    //     if (old && !items) {
    //         this.removeToolbar('top');
    //     }
    //
    //     return items;
    // }
    //
    // changeBottomItems(items, old) {
    //     if (old && !items) {
    //         this.removeToolbar('items');
    //     }
    //
    //     return items;
    // }

    // Creates or retrieves a toolbar instance for the requested column/swimlane intersection
    getToolbar(location, columnRecord, swimlaneRecord) {
        const
            me                                = this,
            { columnMap, client, namedItems } = me,
            items                             = me[`${location}Items`],
            key                               = `${location}_._${columnRecord.domId}_._${swimlaneRecord?.domId ?? 'default'}`;

        let toolbar = columnMap.get(key);

        if (!toolbar) {
            const clonedItems = {};

            // items allows configuring out using falsy value, only iterate the truthy ones
            ObjectHelper.getTruthyKeys(items).map(ref => {
                const
                    // Could match a named item, to either be used as is or use reconfigured
                    namedItem = namedItems[ref],
                    // Item config or a truthy value to include a named item as is
                    item      = items[ref];

                clonedItems[ref] = ObjectHelper.merge(
                    // Default listeners + decorate with records
                    {
                        internalListeners : {
                            click   : 'onClick',
                            change  : 'onChange',
                            thisObj : me
                        },

                        columnRecord,
                        swimlaneRecord
                    },
                    // Merge with any matched named item
                    namedItem,
                    // And any supplied config
                    item
                );
            });

            // Allow client code to alter items before adding them to the toolbar
            if (me.processItems?.({ items : clonedItems, location, columnRecord, swimlaneRecord }) === false) {
                return null;
            }

            // Create toolbar using the processed items
            toolbar = client.add({
                type                      : 'toolbar',
                cls                       : `b-taskboard-column-${location[0]}bar`,
                overflow                  : null,
                monitorResize             : false,
                contentElMutationObserver : false,
                items                     : clonedItems,
                dataset                   : {
                    role          : `${location}-toolbar`,
                    domTransition : true
                }
            });

            columnMap.set(key, toolbar);
        }

        return toolbar.element;
    }

    populateColumn({ columnConfig, columnRecord, swimlaneRecord }) {
        const me = this;

        if (!me.disabled) {
            // Add top toolbar, if it has items
            if (ObjectHelper.getTruthyKeys(me.topItems).length) {
                DomHelper.merge(columnConfig, {
                    children : {
                        'tbar > body' : me.getToolbar('top', columnRecord, swimlaneRecord)
                    }
                });
            }

            // Add bottom toolbar, if it has items
            if (ObjectHelper.getTruthyKeys(me.bottomItems).length) {
                columnConfig.children.bbar = me.getToolbar('bottom', columnRecord, swimlaneRecord);
            }
        }
    }

    removeColumnToolbar(location, columnId, swimlaneId) {
        const
            { columnMap, client } = this,
            key                   = `${location}_._${columnId}_._${swimlaneId}`,
            toolbar               = columnMap.get(key);

        if (toolbar) {
            client.remove(toolbar);

            // Toolbar gets removed during a compose, which leads to a race condition with syncOverflowVisibility.
            // Postpone destroy til after compose to avoid this
            client.setTimeout(() => toolbar.destroy(), 0);

            columnMap.delete(key);
        }
    }

    removeColumnToolbars(columnId, swimlaneId) {
        this.removeColumnToolbar('top', columnId, swimlaneId);
        this.removeColumnToolbar('bottom', columnId, swimlaneId);
    }

    onRemoveColumnElement({ columnId, swimlaneRecord }) {
        this.removeColumnToolbars(columnId, swimlaneRecord.id ?? 'default');
    }

    onRemoveSwimlaneElement({ swimlaneId }) {
        for (const column of this.client.columns) {
            this.removeColumnToolbars(column.id, swimlaneId);
        }
    }

    //endregion

    //region Predefined items events

    onAddClick({ source }) {
        this.client.addTask(source.columnRecord, source.swimlaneRecord);
    }

    //endregion

    //region Generic events

    onChange({ source }) {
        this.trigger('itemChange', {
            item           : source,
            columnRecord   : source.columnRecord,
            swimlaneRecord : source.swimlaneRecord
        });
    }

    onClick({ source }) {
        this.trigger('itemClick', {
            item           : source,
            columnRecord   : source.columnRecord,
            swimlaneRecord : source.swimlaneRecord
        });
    }

    //endregion
}

ColumnToolbars.initClass();
