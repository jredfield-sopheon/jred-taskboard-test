import Base from '../../../Core/Base.js';
import EventHelper from '../../../Core/helper/EventHelper.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import VersionHelper from '../../../Core/helper/VersionHelper.js';
import Scroller from '../../../Core/helper/util/Scroller.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardScroll
 */

/**
 * Mixin that handles scrolling to tasks, columns and swimlanes.
 *
 * {@inlineexample TaskBoard/view/mixin/TaskBoardScroll.js}
 *
 * @mixin
 */
export default Target => class TaskBoardScroll extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardScroll';

    static configurable = {
        /**
         * Default scroll options, see the options for {@link Core.helper.util.Scroller#function-scrollIntoView}
         *
         * Defaults to:
         *
         * ```javascript
         * scrollOptions : {
         *     animate   : true,
         *     block     : 'nearest',
         *     highlight : true
         * }
         * ```
         *
         * Can be overridden per call for all scroll functions.
         *
         * @config {BryntumScrollOptions}
         * @category Advanced
         */
        scrollOptions : {
            animate   : true,
            block     : 'nearest',
            highlight : true
        },

        testConfig : {
            scrollOptions : {
                animate : false,
                block   : 'nearest'
            }
        }
    };

    get widgetClass() {}

    static delayable = {
        onScrollEnd : VersionHelper.isTestEnv ? 300 : 100
    };

    //endregion

    //region Scroll tracking

    onInternalPaint({ firstPaint }) {
        if (firstPaint) {
            const me = this;

            EventHelper.on({
                element : me.element,
                scroll() {
                    me.isScrolling = true;
                    me.onScrollEnd();
                },
                capture : true,
                thisObj : me
            });
        }
    }

    onScrollEnd() {
        this.isScrolling = false;

        if (this.recomposeOnScrollEnd) {
            this.recompose();
            this.recomposeOnScrollEnd = false;
        }
    }

    //endregion

    //region Type assertions

    changeScrollOptions(scrollOptions) {
        ObjectHelper.assertObject(scrollOptions, 'scrollOptions');

        return scrollOptions;
    }

    //endregion

    //region Scroll to

    /**
     * Scroll specified swimlane into view.
     *
     * ```javascript
     * taskBoard.scrollToSwimlane('high');
     * taskBoard.scrollToSwimlane(taskBoard.swimlanes.last);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|Number|String} swimlaneOrId Swimlane or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToSwimlane(swimlaneOrId, options = this.scrollOptions) {
        const
            swimlane        = this.swimlanes.getById(swimlaneOrId),
            swimlaneElement = swimlane && this.getSwimlaneElement(swimlane);

        if (swimlaneElement) {
            options = ObjectHelper.assign({
                x       : false,
                animate : options?.animate || options?.behavior === 'smooth'
            }, options);


            return Scroller.scrollIntoView(swimlaneElement, options, this.rtl);
        }
    }

    /**
     * Scroll specified column into view.
     *
     * ```javascript
     * taskBoard.scrollToColumn('backlog');
     * taskBoard.scrollToColumn(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.ColumnModel|Number|String} columnOrId Column or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToColumn(columnOrId, options = this.scrollOptions) {
        const
            column        = this.columns.getById(columnOrId),
            columnElement = column && this.getColumnHeaderElement(column);

        if (columnElement) {
            // Only scroll in the X axis.
            options = ObjectHelper.assign({
                animate : options?.animate || options?.behavior === 'smooth',
                y       : false
            }, options);
            return Scroller.scrollIntoView(columnElement, options, this.rtl);
        }
    }

    /**
     * Scroll to the intersection between specified swimlane and column.
     *
     * ```javascript
     * taskBoard.scrollToIntersection('high', 'done');
     * taskBoard.scrollToIntersection(taskBoard.swimlanes.low, taskBoard.columns.todo);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|Number|String} swimlaneOrId Swimlane or its id
     * @param {TaskBoard.model.ColumnModel|Number|String} columnOrId Column or its id
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToIntersection(swimlaneOrId, columnOrId, options = this.scrollOptions) {
        const
            swimlane = this.swimlanes.getById(swimlaneOrId),
            column   = this.columns.getById(columnOrId),
            target   = swimlane && column && this.getSwimlaneColumnElement(swimlane, column);

        if (target) {
            options = ObjectHelper.assign({
                animate    : options?.animate || options?.behavior === 'smooth',
                edgeOffset : 10
            }, options);
            return Scroller.scrollIntoView(target, options, this.rtl);
        }
    }

    /**
     * Scroll the specified task into view.
     *
     * ```javascript
     * taskBoard.scrollToTask(10);
     * taskBoard.scrollToTask(taskStore.first);
     * ```
     *
     * @param {TaskBoard.model.TaskModel|Number|String} taskOrId
     * @param {BryntumScrollOptions} [options] Scroll options, see {@link #config-scrollOptions}
     * @category Scrolling
     */
    async scrollToTask(taskOrId, options = this.scrollOptions) {
        const
            me          = this,
            taskRecord  = me.project.taskStore.getById(taskOrId),
            taskElement = taskRecord && me.getTaskElement(taskRecord);

        if (taskElement) {
            const edgeOffset = { start : 10, end : 10, top : 10, bottom : 10 };

            // Make sure we don't end up under column or swimlane headers when using sticky headers
            if (me.stickyHeaders) {
                if (me.hasSwimlanes) {
                    edgeOffset.top += me.getTaskSwimlaneElement(taskRecord).syncIdMap.header.offsetHeight;
                }

                edgeOffset.top += me.bodyElement.syncIdMap.header.offsetHeight;
            }

            if (me.isVirtualized && !me.getTaskHeight) {
                // Rely on native scrolling for cards at an unknown position, due to unknown heights of cards above it.
                // Native scrolling is able to somewhat compensate for changing heights during the scroll (seems to
                // always scroll it slightly intersecting the view, no matter which settings)
                taskElement.scrollIntoView();

                // Wait until the task is rendered
                await new Promise((resolve, reject) => {
                    const detach = me.ion({
                        renderTask({ taskRecord : renderedTaskRecord }) {
                            if (renderedTaskRecord === taskRecord) {
                                detach();
                                resolve();
                            }
                        },
                        expires : {
                            delay : 200,
                            alt   : reject
                        }
                    });
                });
            }

            options = ObjectHelper.assign({
                animate : options?.animate || options?.behavior === 'smooth',
                edgeOffset
            }, options);
            return Scroller.scrollIntoView(taskElement, options, me.rtl);
        }
    }

    //endregion

};
