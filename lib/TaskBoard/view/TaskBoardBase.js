import DomHelper from '../../Core/helper/DomHelper.js';
import DomSync from '../../Core/helper/DomSync.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import VersionHelper from '../../Core/helper/VersionHelper.js';
import Featureable from '../../Core/mixin/Featureable.js';
import Pluggable from '../../Core/mixin/Pluggable.js';
import State from '../../Core/mixin/State.js';
import ScrollManager from '../../Core/util/ScrollManager.js';
import Responsive from '../../Core/widget/mixin/Responsive.js';
import Styleable from '../../Core/widget/mixin/Styleable.js';
import Panel from '../../Core/widget/Panel.js';

import CrudManagerView from '../../Scheduler/crud/mixin/CrudManagerView.js';

import TaskBoardFeature from '../feature/TaskBoardFeature.js';
import ExpandCollapse from './mixin/ExpandCollapse.js';
import ResponsiveCards from './mixin/ResponsiveCards.js';
import TaskBoardColumns from './mixin/TaskBoardColumns.js';
import TaskBoardDom from './mixin/TaskBoardDom.js';
import TaskBoardDomEvents from './mixin/TaskBoardDomEvents.js';
import TaskBoardScroll from './mixin/TaskBoardScroll.js';
import TaskBoardStores from './mixin/TaskBoardStores.js';
import TaskBoardSwimlanes from './mixin/TaskBoardSwimlanes.js';
import TaskBoardVirtualization from './mixin/TaskBoardVirtualization.js';
import TaskItems from './mixin/TaskItems.js';
import TaskNavigation from './mixin/TaskNavigation.js';

import TaskSelection from './mixin/TaskSelection.js';
import '../localization/En.js';
import Tooltip from '../../Core/widget/Tooltip.js';

/**
 * @module TaskBoard/view/TaskBoardBase
 */

const weightSorter = (a, b) => a.weight - b.weight;

/**
 * A thin base class for {@link TaskBoard.view.TaskBoard}. Does not include any features by default, allowing smaller
 * custom-built bundles if used in place of {@link TaskBoard.view.TaskBoard}.
 *
 * **NOTE:** In most scenarios you probably want to use TaskBoard instead of TaskBoardBase.
 *
 * @extends Core/widget/Panel
 *
 * @mixes Core/mixin/Pluggable
 * @mixes Core/mixin/State
 * @mixes Core/widget/mixin/Responsive
 * @mixes Core/widget/mixin/Styleable
 * @mixes Scheduler/crud/mixin/CrudManagerView
 * @mixes TaskBoard/view/mixin/ExpandCollapse
 * @mixes TaskBoard/view/mixin/ResponsiveCards
 * @mixes TaskBoard/view/mixin/TaskBoardColumns
 * @mixes TaskBoard/view/mixin/TaskBoardDom
 * @mixes TaskBoard/view/mixin/TaskBoardDomEvents
 * @mixes TaskBoard/view/mixin/TaskBoardScroll
 * @mixes TaskBoard/view/mixin/TaskBoardStores
 * @mixes TaskBoard/view/mixin/TaskBoardSwimlanes
 * @mixes TaskBoard/view/mixin/TaskBoardVirtualization
 * @mixes TaskBoard/view/mixin/TaskItems
 * @mixes TaskBoard/view/mixin/TaskNavigation
 * @mixes TaskBoard/view/mixin/TaskSelection
 *
 * @features TaskBoard/feature/ColumnDrag
 * @features TaskBoard/feature/ColumnHeaderMenu
 * @features TaskBoard/feature/ColumnToolbars
 * @features TaskBoard/feature/SimpleTaskEdit
 * @features TaskBoard/feature/SwimlaneDrag
 * @features TaskBoard/feature/TaskDrag
 * @features TaskBoard/feature/TaskDragSelect
 * @features TaskBoard/feature/TaskEdit
 * @features TaskBoard/feature/TaskMenu
 * @features TaskBoard/feature/TaskTooltip
 * @widget
 */
export default class TaskBoardBase extends Panel.mixin(
    Pluggable,
    State,
    Featureable,
    Styleable,
    CrudManagerView,
    ExpandCollapse,
    Responsive,
    ResponsiveCards,
    TaskBoardColumns,
    TaskBoardDom,
    TaskBoardDomEvents,
    TaskBoardScroll,
    TaskBoardStores,
    TaskBoardSwimlanes,
    TaskBoardVirtualization,
    TaskItems,
    TaskNavigation,
    TaskSelection
) {



    //region Config

    static $name = 'TaskBoardBase';
    static type = 'taskboardbase';

    static featureable = {
        factory : TaskBoardFeature
    };

    static configurable = {
        /** @hideconfigs autoUpdateRecord, defaultFocus, trapFocus, showTooltipWhenDisabled */
        /** @hideproperties firstItem, lastItem, cellInfo, visibleChildCount */
        /** @hidefunctions getAt */

        layout : 'vbox',

        /**
         * An object containing Feature configuration objects (or `true` if no configuration is required)
         * keyed by the Feature class name in all lowercase.
         * @config {Object}
         * @category Common
         */
        features : true,

        /**
         * An empty function by default, but provided so that you can override it. This function is called each time
         * a task is rendered into the task board. It allows you to manipulate the DOM config object used for the card
         * before it is synced to DOM, thus giving you control over styling and contents.
         *
         * NOTE: The function is intended for formatting, you should not update records in it since updating records
         * triggers another round of rendering.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    taskRenderer({ taskRecord, cardConfig }) {
         *        // Add an icon to all tasks header
         *        cardConfig.children.header.children.icon = {
         *            tag   : 'i',
         *            class : 'b-fa b-fa-beer'
         *        }
         *    }
         * });
         * ```
         *
         * For more information, see the [Customize task contents guide](#TaskBoard/guides/customization/taskcontents.md).
         *
         * @config {Function}
         * @param {Object} detail An object containing the information needed to render a task.
         * @param {TaskBoard.model.TaskModel} detail.taskRecord The task record.
         * @param {TaskBoard.model.ColumnModel} detail.columnRecord The column the task will be displayed in.
         * @param {TaskBoard.model.SwimlaneModel} detail.swimlaneRecord The swimlane the task will be displayed in.
         * @param {DomConfig} detail.cardConfig DOM config object for the cards element
         * @returns {void}
         * @category Task content
         */
        taskRenderer : null,

        /**
         * An empty function by default, but provided so that you can override it. This function is called each time
         * a swimlane is rendered into the task board. It allows you to manipulate the DOM config object used for the
         * swimlane before it is synced to DOM, thus giving you control over styling and contents.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    swimlaneRenderer({ swimlaneRecord, swimlaneConfig }) {
         *        // Add an icon to all swimlane headers
         *        swimlaneConfig.children.header.children.icon = {
         *            tag   : 'i',
         *            class : 'b-fa b-fa-dog'
         *        }
         *    }
         * });
         * ```
         *
         * @config {Function}
         * @param {Object} detail An object containing the information needed to render a swimlane.
         * @param {TaskBoard.model.SwimlaneModel} detail.swimlaneRecord The swimlane.
         * @param {DomConfig} detail.swimlaneConfig DOM config object for the swimlane
         * @returns {void}
         * @category Advanced
         */
        swimlaneRenderer : null,

        /**
         * Controls how many cards are rendered to a row in each column. Can be controlled on a per column basis by
         * setting {@link TaskBoard.model.ColumnModel#field-tasksPerRow}
         *
         * ```javascript
         * new TaskBoard({
         *   tasksPerRow : 3
         * });
         * ```
         *
         * @config {Number}
         * @category Common
         */
        tasksPerRow : 1,

        /**
         * Setting this will cause cards to expand to share the available width if there are fewer than
         * {@link #config-tasksPerRow}.
         *
         * By default, the {@link #config-tasksPerRow} always applies, and if it is 3, then a single
         * card in a column will be 33% of the available width.
         *
         * To have fewer cards than the {@link #config-tasksPerRow} evenly share available column width,
         * configure this as `true`;
         * @prp {Boolean}
         * @category Common
         */
        stretchCards : null,

        /**
         * Show task count for a column in its header, appended after the title
         *
         * ```javascript
         * new TaskBoard({
         *   showCountInHeader : false
         * });
         * ```
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        showCountInHeader : true,

        /**
         * Makes column and swimlane headers sticky
         *
         * ```javascript
         * new TaskBoard({
         *   stickyHeaders : true
         * });
         * ```
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        stickyHeaders : false,

        /**
         * Experimental, animate actions that cannot be animated using CSS transitions. Currently includes:
         * * Programmatically moving tasks
         * * Moving tasks using the task editor
         * * Adding tasks
         * * Removing tasks
         * * Sorting tasks
         * * Hiding/showing/filtering columns
         * * Hiding/showing/filtering swimlanes
         *
         * ```javascript
         * new TaskBoard({
         *   useDomTransition : true
         * });
         * ```
         * **NOTE**: This flag is not supported for Lightning Web Components
         * @config {Boolean}
         * @category Experimental
         */
        useDomTransition : false,

        /**
         * Path to load resource images from. Used by the for example the resource picker in the task editor and by the
         * ResourceAvatars task item. Set this to display miniature images for each resource using their `image` field.
         *
         * **NOTE**: The path should end with a `/`:
         *
         * ```javascript
         * new TaskBoard({
         *   resourceImagePath : 'images/resources/'
         * });
         * ```
         *
         * @config {String}
         * @category Common
         */
        resourceImagePath : null,

        /**
         * CSS variable prefix, appended to the keys used in {@link #config-css}.
         *
         * Normally you do not need to change this value.
         *
         * @default
         * @config {String}
         * @category CSS
         */
        cssVarPrefix : 'taskboard',

        /**
         * Configuration values for the {@link Core.util.ScrollManager} class. It is used to manage column/body
         * scrolling during task, column or swimlane drag.
         * ```javascript
         * new TaskBoard({
         *     scrollManager : {
         *         zoneWidth   : 100, // increase zone size
         *         scrollSpeed : 3    // and scroll speed
         *     }
         * })
         * ```
         * @config {ScrollManagerConfig}
         * @category Scrolling
         */
        scrollManager : {
            value : {},

            $config : ['nullify', 'lazy']
        },

        /**
         * Allows sorting tasks in the UI independent of how they are sorted in the task store.
         *
         * Specify `true` to force sorting tasks by {@link TaskBoard/model/TaskModel#field-weight}.
         *
         * Supply a [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
         * function to force a custom sort order.
         *
         * This is likely something you will want to use if combining TaskBoard with other products, sharing the
         * project. Without this, sorting tasks in for example Gantt will also rearrange the cards on the board.
         *
         * As described above it accepts either a boolean or a Function, but it always returns a sorter function.
         *
         * @prp {Function} taskSorterFn
         * @accepts {Boolean|Function}
         * @config {Function}
         * @param {TaskBoard.model.TaskModel} first The first task to compare
         * @param {TaskBoard.model.TaskModel} second The second task to compare
         * @returns {Number} Return `1` if first task is greater than second task, `-1` if the opposite is true or `0`
         * if they are equal
         * @category Advanced
         */
        taskSorterFn : null,

        /**
         * See {@link TaskBoard.view.TaskBoard#keyboard-shortcuts Keyboard shortcuts} for details
         * @config {Object<String,String>} keyMap
         * @category Common
         */

        contentElMutationObserver : false,

        textContent : false,

        // We can scroll in both axes.
        // Scrollable also syncs the b-horizontal-overflow and b-vertical-overflow classes
        // to allow styles to depend upon overflow state.
        scrollable : true
    };

    isInitiallyComposed    = false;
    domTransitionSuspended = 0;
    columnRecomposeQueue   = new Map();

    static delayable = {
        recomposeColumns : 'raf'
    };

    //endregion

    //region Overrides

    onPaintOverride() {
        // Internal procedure used for paint method overrides
        // Not used in onInternalPaint() because it may be chained on instance and Override won't be applied
    }

    onInternalPaint(...args) {
        if (this.onPaintOverride()) {
            return;
        }
        super.onInternalPaint(...args);
    }

    //endregion

    //region Type assertions and changers/updaters

    changeResourceImagePath(resourceImagePath) {
        ObjectHelper.assertString(resourceImagePath, 'resourceImagePath');

        return resourceImagePath;
    }

    changeUseDomTransition(useDomTransition) {
        ObjectHelper.assertBoolean(useDomTransition, 'useDomTransition');

        return useDomTransition;
    }

    changeStickyHeaders(stickyHeaders) {
        ObjectHelper.assertBoolean(stickyHeaders, 'stickyHeaders');

        return stickyHeaders;
    }

    changeScrollManager(scrollManager, oldScrollManager) {
        oldScrollManager?.destroy();

        if (scrollManager) {
            return ScrollManager.new({
                element : this.element,
                owner   : this
            }, scrollManager);
        }

        return null;
    }

    changeShowCountInHeader(showCountInHeader) {
        ObjectHelper.assertBoolean(showCountInHeader, 'showCountInHeader');

        return showCountInHeader;
    }

    changeTasksPerRow(tasksPerRow) {
        ObjectHelper.assertNumber(tasksPerRow, 'tasksPerRow');

        return tasksPerRow;
    }

    changeSwimlaneRenderer(swimlaneRenderer) {
        ObjectHelper.assertFunction(swimlaneRenderer, 'swimlaneRenderer');

        return swimlaneRenderer;
    }

    changeTaskRenderer(taskRenderer) {
        ObjectHelper.assertFunction(taskRenderer, 'taskRenderer');

        return taskRenderer;
    }

    changeTaskSorterFn(fn) {
        if (fn === true) {
            return weightSorter;
        }

        fn && ObjectHelper.assertFunction(fn, 'taskSorterFn');

        return fn;
    }

    //endregion

    //region Recompose columns

    // Queue a column for recomposition on next frame
    queueColumnRecompose(columnRecord, swimlaneRecord) {
        this.columnRecomposeQueue.set(`${columnRecord.id}.-.${swimlaneRecord?.id}`, { columnRecord, swimlaneRecord });
        this.recomposeColumns();
    }

    // RAF function to recompose all queued columns
    recomposeColumns() {
        for (const [, { columnRecord, swimlaneRecord }] of this.columnRecomposeQueue) {
            this.recomposeColumn(columnRecord, swimlaneRecord);
        }
        this.columnRecomposeQueue.clear();
    }

    // Recompose a single column / swimlane intersection
    recomposeColumn(columnRecord, swimlaneRecord) {
        const
            element   = this.getSwimlaneColumnElement(swimlaneRecord, columnRecord),
            domConfig = DomHelper.normalizeChildren(this.renderColumn(swimlaneRecord, columnRecord));

        domConfig.onlyChildren = true;

        DomSync.sync({
            targetElement : element,
            domConfig,
            callback      : this.domSyncCallback,
            syncOptions   : {
                syncIdField      : 'column',
                releaseThreshold : 0
            }
        });
    }

    //endregion

    //region Render

    // Creates a DOM config for a single card, calling any configured taskRenderer() in the process
    renderCard(taskRecord, columnRecord, swimlaneRecord) {
        // Allow mixins to fully control card rendering (used by TaskBoardVirtualization)
        const overriddenCard = super.renderCard(taskRecord, columnRecord, swimlaneRecord);
        if (overriddenCard) {
            return overriddenCard;
        }

        const
            me                                = this,
            { id, domId, eventColor, weight } = taskRecord,
            color                             = eventColor || swimlaneRecord?.color || columnRecord.color,
            namedColor                        = DomHelper.isNamedColor(color) ? color : null,
            cardSize                          = me.getCardSize(columnRecord, swimlaneRecord),
            cardConfig                        = {
                id    : `${me.id}-card-${domId}`,
                class : {
                    'b-taskboard-card'                  : true,
                    [`b-taskboard-color-${namedColor}`] : namedColor,
                    'b-readonly'                        : taskRecord.readOnly,
                    ...taskRecord.cls
                },
                tabIndex : 0,
                dataset  : {
                    task          : domId,
                    column        : columnRecord.id,
                    lane          : swimlaneRecord?.id,
                    weight,
                    domTransition : true
                },
                style : {
                    color  : namedColor ? null : color,
                    height : me.getTaskHeight?.(taskRecord) ?? null
                },
                elementData : {
                    elementType : 'task',
                    taskId      : id,
                    taskRecord,
                    columnRecord,
                    swimlaneRecord
                },
                children : {
                    header : {
                        tag   : 'header',
                        class : {
                            'b-taskboard-card-header' : 1
                        },
                        children    : {},
                        syncOptions : {
                            syncIdField : 'role'
                        }
                    },
                    body : {
                        tag   : 'section',
                        class : {
                            'b-taskboard-card-body' : 1
                        },
                        children    : {},
                        syncOptions : {
                            syncIdField : 'role'
                        }
                    },
                    footer : {
                        tag   : 'footer',
                        class : {
                            'b-taskboard-card-footer' : 1
                        },
                        children    : {},
                        syncOptions : {
                            syncIdField : 'role'
                        }
                    }
                }
            },
            { children }             = cardConfig,
            { header, body, footer } = children;

        // Chained by features
        me.populateCard({
            taskRecord,
            columnRecord,
            swimlaneRecord,
            cardConfig,
            cardSize
        });

        // Supplied by app
        me.taskRenderer?.({
            taskRecord,
            columnRecord,
            swimlaneRecord,
            cardConfig,
            cardSize
        });



        // Remove unused parts of the card
        if (header.html == null && header.text == null && (!header.children || Object.keys(header.children).length === 0)) {
            children.header = null;
        }

        if (body.html == null && body.text == null && (!body.children || Object.keys(body.children).length === 0)) {
            children.body = null;
        }

        if (footer.html == null && footer.text == null && (!footer.children || Object.keys(footer.children).length === 0)) {
            children.footer = null;
        }

        return cardConfig;
    }

    renderColumnHeader(columnRecord) {
        const
            me                 = this,
            { text, id, domId, width, flex, minWidth, color, tooltip } = columnRecord,
            namedColor         = DomHelper.isNamedColor(color) ? color : null,
            columnHeaderConfig = {
                id    : `${me.id}-column-header-${domId}`,
                class : {
                    'b-taskboard-column-header'         : 1,
                    'b-fixed-width'                     : width && !flex,
                    [`b-taskboard-color-${namedColor}`] : namedColor,
                    'b-last'                            : columnRecord === this.columns.last
                },
                style : {
                    color : namedColor ? null : color,
                    width,
                    flex,
                    minWidth
                },
                children : {
                    padder : {
                        class : {
                            'b-taskboard-column-header-padder' : 1
                        },
                        children : {
                            title : {
                                class : {
                                    'b-taskboard-column-title' : 1
                                },
                                dataset : {
                                    btip : tooltip
                                },
                                children : [
                                    {
                                        tag   : 'span',
                                        class : 'b-column-title-text',
                                        text
                                    },
                                    me.showCountInHeader && {
                                        tag   : 'span',
                                        class : {
                                            'b-taskboard-column-count' : 1
                                        },
                                        html : `(${me.getColumnTasks(columnRecord)?.length ?? 0})`
                                    }
                                ]
                            }
                        }
                    }
                },
                dataset : {
                    column        : domId,
                    domTransition : true
                },
                elementData : {
                    elementType : 'columnHeader',
                    columnId    : id
                }
            };

        Tooltip.showOverflow = true;

        // Chained by features
        me.populateColumnHeader({
            columnRecord,
            columnHeaderConfig
        });

        // Supplied by app
        me.columnHeaderRenderer?.({
            columnRecord,
            columnHeaderConfig
        });

        return columnHeaderConfig;
    }

    renderColumn(swimlaneRecord, columnRecord) {
        const
            me            = this,
            {
                taskSorterFn,
                stretchCards,
                columnField,
                swimlaneField
            }             = me,
            {
                width,
                flex,
                id,
                domId,
                minWidth,
                color
            }             = columnRecord,
            { taskStore } = me.project,
            // Tasks in this column / swimlane intersection. Fetched using an index for better performance, except when
            // using a tree store, since only the expended tasks are indexed then (only those are in storage)
            tasks         = taskStore.isTree
                ? taskStore.query(r =>
                    r[columnField] === id &&
                    (!swimlaneField || !swimlaneRecord || r[swimlaneField] === swimlaneRecord.id) // Might have no lanes
                )
                : Array.from(taskStore.storage.findItem(
                    'columnSwimlaneIntersection',
                    `${columnRecord.id}-/-${swimlaneRecord?.id ?? 'default'}`
                ) || []),
            perRow       = me.getTasksPerRow(columnRecord, swimlaneRecord),
            elementId    = `${me.id}-column-${swimlaneRecord?.domId ?? 'default'}-${domId}`,
            namedColor   = DomHelper.isNamedColor(color) ? color : null,
            columnConfig = {
                id    : elementId,
                class : {
                    'b-taskboard-column'                                 : 1,
                    'b-fixed-width'                                      : width && !flex,
                    [`b-${perRow}-task${perRow > 1 ? 's' : ''}-per-row`] : 1,
                    'b-inline'                                           : perRow > 1,
                    [`b-taskboard-color-${namedColor}`]                  : namedColor,
                    'b-last'                                             : columnRecord === this.columns.last
                },
                style : {
                    color : namedColor ? null : color,
                    width,
                    flex,
                    minWidth
                },
                dataset : {
                    column        : domId,
                    lane          : swimlaneRecord?.id,
                    domTransition : true
                },
                elementData : {
                    elementType : 'column',
                    columnId    : id,
                    laneId      : swimlaneRecord?.id
                },
                // Cards
                children : {
                    body : {
                        id    : `${elementId}-body`,
                        class : {
                            'b-taskboard-column-body' : 1
                        },
                        dataset : {
                            role          : 'body',
                            domTransition : true
                        },
                        children : [
                            {
                                class : {
                                    'b-taskboard-column-body-inner' : 1
                                },
                                style : {
                                    'grid-template-columns' : `repeat(${stretchCards ? Math.min(perRow, tasks.length) : perRow}, 1fr)`
                                },
                                dataset : {
                                    role          : 'inner',
                                    domTransition : true
                                },
                                children : (() => {
                                    // Optionally force sort order
                                    if (taskSorterFn) {
                                        tasks.sort(taskSorterFn);
                                    }
                                    // Otherwise match store order, Set is unordered
                                    else {
                                        tasks.sort((a, b) => taskStore.indexOf(a) - taskStore.indexOf(b));
                                    }

                                    return tasks.map(taskRecord => me.renderCard(taskRecord, columnRecord, swimlaneRecord));
                                })(),
                                syncOptions : {
                                    syncIdField      : 'task',
                                    releaseThreshold : me.isVirtualized ? 1000 : 0
                                }
                            }
                        ],
                        syncOptions : {
                            syncIdField : 'role'
                        }
                    }
                },
                syncOptions : {
                    syncIdField : 'role'
                }
            };

        // Chained by features
        me.populateColumn({
            columnRecord,
            swimlaneRecord,
            columnConfig
        });

        // Supplied by app
        me.columnRenderer?.({
            columnRecord,
            swimlaneRecord,
            columnConfig
        });

        return columnConfig;
    }

    renderSwimlane(swimlaneRecord) {
        const
            me                             = this,
            { showCountInHeader, columns } = me,
            {
                id = 'default',
                domId = 'default',
                text,
                height,
                flex,
                color
            }                              = swimlaneRecord || {},
            elementId                      = `${me.id}-swimlane-${domId}`,
            namedColor                     = DomHelper.isNamedColor(color) ? color : null,
            swimlaneConfig                 = {
                id    : elementId,
                class : {
                    'b-taskboard-swimlane'              : 1,
                    'b-fixed-height'                    : height && !flex,
                    'b-last'                            : !swimlaneRecord || swimlaneRecord === me.swimlanes.last,
                    [`b-taskboard-color-${namedColor}`] : namedColor
                },
                style : {
                    color : namedColor ? null : color,
                    height,
                    flex
                },
                dataset : {
                    lane          : domId,
                    domTransition : true
                },
                elementData : {
                    elementType : 'swimlane',
                    laneId      : id
                },
                children : {
                    // If a lane is defined, it has a header
                    header : swimlaneRecord && {
                        id    : `${elementId}-header`,
                        tag   : 'header',
                        class : {
                            'b-taskboard-swimlane-header' : 1
                        },
                        dataset : {
                            role          : 'header',
                            domTransition : 'preserve-padding'
                        },
                        children : {
                            title : {
                                class : {
                                    'b-taskboard-swimlane-title' : 1
                                },
                                children : {
                                    text,
                                    count : showCountInHeader && {
                                        tag   : 'span',
                                        class : {
                                            'b-taskboard-swimlane-count' : 1
                                        },
                                        text : `(${me.getSwimlaneTasks(swimlaneRecord)?.size ?? 0})`
                                    }
                                }
                            }
                        }
                    },
                    // Lane or no lane, there is always a body to contain columns
                    body : {
                        id    : `${elementId}-body`,
                        class : {
                            'b-taskboard-swimlane-body' : 1
                        },
                        dataset : {
                            role          : 'body',
                            domTransition : true
                        },
                        // Columns within the lane
                        children : columns.map(column =>
                            !column.hidden && me.renderColumn(swimlaneRecord, column)
                        ),
                        syncOptions : {
                            syncIdField      : 'column',
                            releaseThreshold : 0
                        }
                    }
                },
                syncOptions : {
                    syncIdField : 'role'
                }
            };

        me.populateSwimlane({
            swimlaneRecord,
            swimlaneConfig
        });

        // Supplied by app
        me.swimlaneRenderer?.({
            swimlaneRecord,
            swimlaneConfig
        });

        return swimlaneConfig;
    }

    // Creates a DOM config for the entire TaskBoard, rendered to panels body
    get bodyConfig() {
        const
            me = this,

            // Pull in configs that affect rendering, even if not used here to prime them
            {
                /* eslint-disable no-unused-vars */
                stickyHeaders,
                showCountInHeader,
                columns,
                columnField,
                swimlaneField,
                tasksPerRow,
                headerItems,
                bodyItems,
                footerItems,
                selectedTasks,
                showCollapseInHeader,
                showCollapseTooltip,
                taskSorterFn,
                stretchCards
                /* eslint-enable no-unused-vars */
            }  = me;

        // On first compose, supply a minimal body to have element ready when features inject their contents on next
        // compose. Allows us to avoid using hacks to pull features in early
        if (!me.rendered) {
            // Queue up another recompose after the minimal bootstrap, to render columns while loading
            me.setTimeout(() => me.recompose(), 0);

            return {
                // Required by panel, it expects a bodyElement reference
                reference : 'bodyElement',
                // Listeners are only set up on first sync, has to go here (not internalListeners no purpose, these are
                // EventHelper listeners)
                // eslint-disable-next-line bryntum/no-listeners-in-lib
                listeners : ObjectHelper.assign({ thisObj : me }, me.domListeners)
            };
        }

        // We get here on second compose, features are now pulled in and we have an outer element ready
        const bodyConfig = {
            // Save some processing by not cloning the config, it is regenerated on every compose anyway
            skipClone : true,
            reference : 'bodyElement',
            class     : {
                'b-taskboard-body' : 1,
                'b-sticky-headers' : stickyHeaders
            },
            children : [
                // Column headers
                {
                    tag   : 'header',
                    id    : `${me.id}-column-headers`,
                    class : {
                        'b-taskboard-column-headers' : 1
                    },
                    children : columns.map(column => !column.hidden && me.renderColumnHeader(column)),
                    dataset  : {
                        lane          : 'header',
                        domTransition : true
                    },
                    syncOptions : {
                        syncIdField : 'column'
                    }
                }
            ],
            syncOptions : {
                syncIdField      : 'lane',
                releaseThreshold : 0,
                ignoreRefs       : 'children' // References in "children" should not be hoisted to the panel
            }
        };

        let { swimlanes } = me;

        // There is always a swimlane
        if (!swimlanes?.count) {
            swimlanes = [null];
        }

        // Swimlanes
        for (const lane of swimlanes) {
            if (!lane?.hidden) {
                bodyConfig.children.push(me.renderSwimlane(lane));
            }
        }

        me.populateBody({
            bodyConfig
        });

        me.isComposed = true;

        return bodyConfig;
    }

    // For chaining, to decorate dom config
    populateCard(args) {
        super.populateCard?.(args);
    }

    populateColumn(args) {
        super.populateColumn?.(args);
    }

    populateColumnHeader(args) {
        super.populateColumnHeader?.(args);
    }

    populateSwimlane(args) {
        super.populateSwimlane?.(args);
    }

    populateBody(args) {
        super.populateBody?.(args);
    }

    afterRecompose() {
        super.afterRecompose();

        const me = this;

        if (!me.isInitiallyComposed && me.isComposed) {
            me.isInitiallyComposed = true;
            me.initialCompose();
        }

        if (me.project.taskStore.count > 0) {
            me.trigger('renderTasks', { taskRecords : me.project.taskStore.allRecords });
        }

        me.transitionRecompose = null;
    }

    // For chaining, replaces render() since we don't do full compose on render
    initialCompose() {
        this.trigger('initialCompose');
    }

    // For chaining, to react to element changes
    onRenderColumn() {}

    onRemoveColumnElement() {}

    onRenderSwimlane() {}

    onRemoveSwimlaneElement() {}

    //endregion

    //region Transition - experimental

    // Prevent dom transitions until resumed
    suspendDomTransition() {
        this.domTransitionSuspended++;
    }

    // Resume dom transitions
    resumeDomTransition() {
        this.domTransitionSuspended--;
    }

    // Recompose transitioning dom
    recomposeWithDomTransition(options) {
        const me = this;

        if (me.useDomTransition && !me.domTransitionSuspended) {
            me.transitionRecompose = {
                selector : '[data-dom-transition]',
                duration : 300,
                element  : me._bodyElement, // _ needed to not flush recompose if we are dirty
                ...options
            };
        }

        // Transitioned recompose takes a bit of time, if we are requested to recompose again while it is ongoing,
        // we queue up another recompose to run after the transition is done
        if (me.recompose.suspended) {
            me._recomposeQueued = true;
        }
        else {
            me.recompose();
        }
    }

    resumeRecompose() {
        super.resumeRecompose();

        // Kick of another recompose if needed, see comment in recomposeWithDomTransition() above
        if (this._recomposeQueued) {
            this._recomposeQueued = null;
            this.recompose();
        }
    }

    //endregion

    //region Extract configs

    // This function is not meant to be called by any code other than Base#getCurrentConfig().
    // It extracts the current configs for the task board, with special handling for columns
    getCurrentConfig(options) {
        const result = super.getCurrentConfig(options);

        if (result.columns) {
            delete result.columns.modelClass;
        }

        return result;
    }

    //endregion

    // Expected by CrudManagerView
    refresh() {
        this.recompose();
    }
}

TaskBoardBase.initClass();
VersionHelper.setVersion('taskboard', '5.6.2');
