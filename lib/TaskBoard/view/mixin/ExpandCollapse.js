import Base from '../../../Core/Base.js';
import DomSync from '../../../Core/helper/DomSync.js';
import EventHelper from '../../../Core/helper/EventHelper.js';
import DomHelper from '../../../Core/helper/DomHelper.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';

/**
 * @module TaskBoard/view/mixin/ExpandCollapse
 */

/**
 * Mixin that handles expanding and collapsing swimlanes and columns on the TaskBoard.
 *
 * {@inlineexample TaskBoard/view/mixin/ExpandCollapse.js}
 *
 * Users can expand and collapse using the UI. To do it programmatically, see:
 *
 * * {@link #function-collapse collapse()}
 * * {@link #function-expand expand()}
 * * {@link #function-toggleCollapse toggleCollapse()}
 *
 * Each of them accepts a column or a swimlane to expand/collapse. For example
 *
 * ```javascript
 * taskBoard.collapse(taskBoard.columns.todo);
 * taskBoard.expand(taskBoard.swimlanes.high);
 * ```
 *
 * For convenience, the functions are also callable directly on columns/swimlanes:
 *
 * ```javascript
 * taskBoard.columns.todo.expand();
 * taskBoard.swimlanes.high.collapse();
 * ```
 *
 * Expanding/collapsing is by default transitioned, `await` the calls to be certain that the UI is up to date:
 *
 * ```javascript
 * await taskBoard.collapse(taskBoard.columns.todo);
 * await taskBoard.columns.todo.expand();
 * ```
 *
 * @mixin
 */
export default Target => class ExpandCollapse extends (Target || Base) {

    //region Config

    static $name = 'ExpandCollapse';

    static configurable = {
        /**
         * Show an icon to expand/collapse columns and swimlanes in their headers.
         *
         * Programmatic expand/collapse works independently of this setting, it only affects the UI.
         *
         * @config {Boolean}
         * @default
         * @category Common
         */
        showCollapseInHeader : true,

        /**
         * Specify `true` to hide the column title instead of rotating it on collapse.
         *
         * Used by default with swimlanes, since the title will overlap the swimlane header otherwise.
         *
         * @config {Boolean}
         * @default
         * @category Misc
         */
        collapseTitle : false,

        /**
         * By default, a tooltip showing `Expand XX`/`Collapse XX` is shown when hovering the expand/collapse icon for
         * a column or swimlane. To disable the tooltip, set this to `false`.
         * @prp {Boolean}
         * @default
         * @category Misc
         */
        showCollapseTooltip : true
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeShowCollapseInHeader(showCollapseInHeader) {
        ObjectHelper.assertBoolean(showCollapseInHeader, 'showCollapseInHeader');

        return showCollapseInHeader;
    }

    //endregion

    //region Events
    /**
     * Triggered when a column is expanded.
     *
     * @event columnExpand
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     */
    /**
     * Triggered when a column is collapsed.
     *
     * @event columnCollapse
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     */
    /**
     * Triggered when the column collapsed state is toggled.
     *
     * @event columnToggle
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record
     * @param {Boolean} collapse `true` if the column is being collapsed.
     */
    /**
     * Triggered when a swimlane is expanded.
     *
     * @event swimlaneExpand
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     */
    /**
     * Triggered when a swimlane is collapsed.
     *
     * @event swimlaneCollapse
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     */
    /**
     * Triggered when the swimlane collapsed state is toggled.
     *
     * @event swimlaneToggle
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {Boolean} collapse `true` if the column is being collapsed.
     */
    //endregion

    //region Toggling

    /**
     * Collapse a swimlane or column.
     *
     * Await the call to be certain that the collapse transition has ended.
     *
     * ```javascript
     * await taskBoard.collapse(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @category Expand & collapse
     */
    async collapse(record) {
        return this.toggleCollapse(record, true);
    }

    /**
     * Expand a swimlane or column.
     *
     * Await the call to be certain that the expand transition has ended.
     *
     * ```javascript
     * await taskBoard.expand(taskBoard.columns.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @category Expand & collapse
     */
    async expand(record) {
        return this.toggleCollapse(record, false);
    }

    /**
     * Expand or collapse a swimlane or column.
     *
     * Await the call to be certain that the expand/collapse transition has ended.
     *
     * ```javascript
     * // Toggle
     * await taskBoard.toggleCollapse(taskBoard.columns.first);
     * // Force collapse
     * await taskBoard.toggleCollapse(taskBoard.columns.first, true);
     * // Force expand
     * await taskBoard.toggleCollapse(taskBoard.columns.first, false);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel|TaskBoard.model.ColumnModel} record Swimlane or column
     * @param {Boolean} [collapse] Specify to force a certain state, leave out to toggle
     * @category Expand & collapse
     * @fires columnCollapse
     * @fires columnExpand
     * @fires columnToggle
     * @fires swimlaneCollapse
     * @fires swimlaneExpand
     * @fires swimlaneToggle
     */
    async toggleCollapse(record, collapse = !record.collapsed) {
        if (record.isSwimlaneModel) {
            await this.toggleSwimlaneCollapse(record, collapse);
        }
        else {
            await this.toggleColumnCollapse(record, collapse);
        }
    }

    async toggleSwimlaneCollapse(swimlaneRecord, collapse = !swimlaneRecord.collapsed) {
        return new Promise(resolve => {
            const
                me              = this,
                swimlaneElement = me.getSwimlaneElement(swimlaneRecord),
                swimlaneBody    = DomSync.getChild(swimlaneElement, 'body');

            // Set a height on collapse, to transition down from -> 0
            if (collapse) {
                swimlaneBody.style.height = `${swimlaneBody.getBoundingClientRect().height}px`;
            }

            EventHelper.onTransitionEnd({
                element  : swimlaneBody,
                property : 'height',
                handler() {

                    if (collapse) {
                        // Removing static height on swimlane element on collapse
                        swimlaneElement.style.height = '';
                    }
                    else {
                        // Remove that height on expand, after it has transitioned from 0 to it
                        swimlaneBody.style.height = '';

                        // Setting static height on swimlane element on expand
                        swimlaneElement.style.height = `${swimlaneRecord.height}px`;
                    }

                    swimlaneElement.classList.remove(collapse ? 'b-collapsing' : 'b-expanding');

                    // Make sure UI is up to date when promise is resolved
                    me.recompose.flush();

                    resolve();
                },
                thisObj : me
            });

            swimlaneElement.classList.add(collapse ? 'b-collapsing' : 'b-expanding');

            me.suspendDomTransition();

            // This will trigger the recompose
            swimlaneRecord.collapsed = collapse;

            me.trigger(`swimlane${collapse ? 'Collapse' : 'Expand'}`, { swimlaneRecord });
            me.trigger('swimlaneToggle', { swimlaneRecord, collapse });
            me.resumeDomTransition();
        });
    }

    async toggleColumnCollapse(columnRecord, collapse = !columnRecord.collapsed) {
        return new Promise(resolve => {
            const
                me               = this,
                { documentRoot } = me,
                columnElements   = me.getColumnElements(columnRecord),
                headerElement    = DomSync.getChild(me.bodyElement, `header.${columnRecord.domId}`),
                // For columns that already has a width specified we won't need to measure and apply current width
                hasFixedWidth    = columnRecord.width && !columnRecord.flex,
                cardElements     = documentRoot.querySelectorAll(`.b-taskboard-card[data-column="${columnRecord.domId}"]`),
                cardWidth        = `${cardElements[0]?.getBoundingClientRect().width}px`,
                columnWidth      = `${columnElements[0]?.getBoundingClientRect().width}px`;

            // Fix card widths on collapse, to not have their contents reflow during the collapse
            cardElements.forEach(card => {
                if (collapse) {
                    card.style.width = cardWidth;
                }
            });

            columnElements.unshift(headerElement);

            columnElements.forEach(element => {
                // Set a width on collapse, to transition down from -> 0
                if (collapse) {
                    if (!hasFixedWidth) {
                        element.style.width = columnWidth;
                    }

                    element.classList.add('b-collapsing');
                }
                // Add cls to keep flex away a bit longer on expand
                else {
                    element.classList.add('b-expanding');
                }
            });

            EventHelper.onTransitionEnd({
                element  : headerElement,
                property : 'width',
                handler() {
                    // Unfix card widths when fully expanded again
                    cardElements.forEach(card => {
                        if (!collapse) {
                            card.style.width = '';
                        }
                    });

                    // Remove that width on expand, after it has transitioned from 0 to it
                    columnElements.forEach(element => {
                        if (!collapse) {
                            // Restore width and flex from css
                            if (!hasFixedWidth) {
                                element.style.width = '';
                            }
                            element.classList.remove('b-expanding');
                        }
                        else {
                            element.classList.remove('b-collapsing');
                        }
                    });

                    // Make sure UI is up to date when promise is resolved
                    me.recompose.flush();

                    // Scroller is not aware of that expanding/collapsing might change overflow state, inform it...
                    me.scrollable.syncOverflowState();

                    resolve();
                },
                thisObj : me
            });

            // Force browser to reevaluate, for transition to trigger
            headerElement.offsetWidth;

            me.suspendDomTransition();
            // This will trigger the recompose
            columnRecord.collapsed = collapse;

            me.trigger(`column${collapse ? 'Collapse' : 'Expand'}`, { columnRecord });
            me.trigger('columnToggle', { columnRecord, collapse });

            me.resumeDomTransition();
        });
    }

    //endregion

    //region Rendering

    // Inject expander icon + expand/collapsed state cls in column headers
    populateColumnHeader(args) {
        super.populateColumnHeader?.(args);

        const
            { showCollapseInHeader, collapseTitle, hasSwimlanes, showCollapseTooltip } = this,
            { columnRecord, columnHeaderConfig }                                       = args,
            { text, collapsed, collapsible }                                           = columnRecord;

        DomHelper.merge(columnHeaderConfig, {
            class : {
                'b-collapsed'    : collapsed,
                'b-rotate-title' : collapsed && !collapseTitle && !hasSwimlanes
            },
            style : {
                minWidth : collapsed ? null : columnRecord.minWidth
            },
            children : {
                padder : {
                    children : {
                        expander : showCollapseInHeader && collapsible && {
                            tag   : 'button',
                            class : {
                                'b-taskboard-column-expander' : 1,
                                'b-fw-icon'                   : 1,
                                'b-icon-expand-column'        : 1
                            },
                            dataset : {
                                btip : showCollapseTooltip
                                    ? StringHelper.xss`${this.L(collapsed ? 'L{TaskBoard.expand}' : 'L{TaskBoard.collapse}', text)}`
                                    : null
                            }
                        }
                    }
                }
            }
        });
    }

    // Inject expand/collapsed state cls in columns
    populateColumn(args) {
        super.populateColumn?.(args);

        const
            { columnRecord, columnConfig } = args,
            { collapsed }                  = columnRecord;

        columnConfig.class['b-collapsed'] = collapsed;

        if (collapsed) {
            columnConfig.style.minWidth = null;
        }
    }

    // Inject expander icon + expand/collapsed state cls in swimlanes
    populateSwimlane(args) {
        super.populateColumn?.(args);

        const { swimlaneRecord, swimlaneConfig } = args;

        if (swimlaneRecord) {
            const
                { showCollapseInHeader, showCollapseTooltip } = this,
                { text, collapsed, collapsible }              = swimlaneRecord;

            DomHelper.merge(swimlaneConfig, {
                class : {
                    'b-collapsed'   : collapsed,
                    'b-collapsible' : collapsible
                },
                children : {
                    header : {
                        children : {
                            title : {
                                children : {
                                    // Before text
                                    'expander > text' : showCollapseInHeader && collapsible && {
                                        tag   : 'button',
                                        class : {
                                            'b-taskboard-swimlane-expander' : 1,
                                            'b-icon'                        : 1,
                                            'b-icon-expand-row'             : 1
                                        },
                                        dataset : {
                                            btip : showCollapseTooltip
                                                ? StringHelper.xss`${this.L(collapsed ? 'L{TaskBoard.expand}' : 'L{TaskBoard.collapse}', text)}`
                                                : null
                                        }
                                    }
                                }
                            }
                        }
                    },
                    body : {
                        [collapsed ? 'inert' : null] : true
                    }
                }
            });
        }
    }

    //endregion

    //region Listeners

    onColumnHeaderClick({ event, columnRecord }) {
        if (event.target.matches('.b-taskboard-column-expander') || columnRecord.collapsed) {
            this.toggleCollapse(columnRecord);
        }
    }

    onColumnClick({ columnRecord }) {
        if (columnRecord.collapsed) {
            this.toggleCollapse(columnRecord);
        }
    }

    onSwimlaneHeaderClick({ swimlaneRecord }) {
        this.toggleCollapse(swimlaneRecord);
    }

    //endregion

};
