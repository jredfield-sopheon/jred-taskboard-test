import TaskBoardFeature from './TaskBoardFeature.js';
import Base from '../../Core/Base.js';
import ArrayHelper from '../../Core/helper/ArrayHelper.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import DomSync from '../../Core/helper/DomSync.js';
import EventHelper from '../../Core/helper/EventHelper.js';
import Rectangle from '../../Core/helper/util/Rectangle.js';
import Draggable from '../../Core/mixin/Draggable.js';
import Droppable from '../../Core/mixin/Droppable.js';
import Events from '../../Core/mixin/Events.js';

/**
 * @module TaskBoard/feature/ColumnDrag
 */

/**
 * This feature allows users to drag columns on the TaskBoard to change the column order. Drag is initiated upon
 * mouse down in the column header. Try it out below!
 *
 * {@inlineexample TaskBoard/feature/ColumnDrag.js}
 *
 * Works just as well when using swimlanes:
 *
 * {@inlineexample TaskBoard/feature/ColumnDragSwimlanes.js}
 *
 * ## Drag events
 *
 * The different stages of a drag operation trigger different events, in order of appearance:
 *
 * | Event                           | Description                                                                    |
 * |---------------------------------|--------------------------------------------------------------------------------|
 * | {@link #event-beforeColumnDrag} | Preventable event fired before a drag starts                                   |
 * | {@link #event-columnDragStart}  | Fired when dragging starts                                                     |
 * | {@link #event-columnDrag}       | Fired when movement during a drag will lead to changes                         |
 * | {@link #event-beforeColumnDrop} | Preventable event fired before finalizing a valid drop. Allows async listeners |
 * | {@link #event-columnDrop}       | Fired after finalizing a valid drop                                            |
 * | {@link #event-columnDragAbort}  | Fired when a drag is aborted (ESC, drop out of bounds or by a listener)        |
 * | {@link #event-columnDragEnd}    | Fired when a started drag ends, no matter the outcome                          |
 *
 * This feature is **disabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype columnDrag
 * @feature
 */
export default class ColumnDrag extends TaskBoardFeature {
    static $name = 'ColumnDrag';

    static type = 'columnDrag';

    static pluginConfig = {
        after : ['initialCompose', 'populateColumnHeaderMenu']
    };

    initialCompose() {
        const me = this;

        // Cannot use configurable since bodyElement is not available yet when feature is pulled in
        me.draggable = ColumnZone.new({
            dragRootElement : me.disabled ? null : me.client.bodyWrapElement,
            dropRootElement : me.client.bodyWrapElement,
            owner           : me,

            internalListeners : {
                beforeDragStart : 'onBeforeDragStart',
                dragStart       : 'onDragStart',
                thisObj         : me
            }
        }, me.draggable);
    }

    doDestroy() {
        this.draggable?.destroy();

        super.doDestroy();
    }

    doDisable(disable) {
        super.doDisable(disable);

        if (this.draggable) {
            this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
        }
    }

    movePrev(columnRecord) {
        const { columns } = this.client;

        columns.move(columnRecord, columns.getPrev(columnRecord));
    }

    moveNext(columnRecord) {
        const
            { columns } = this.client,
            beforeIndex = Math.min(columns.indexOf(columnRecord) + 2, columns.count);

        columns.move(columnRecord, columns.getAt(beforeIndex));
    }

    populateColumnHeaderMenu({ items, columnRecord }) {
        const
            { client }       = this,
            { columns, rtl } = client;

        if (!client.readOnly && !this.disabled) {
            items.moveColumnLeft = {
                text     : 'L{TaskBoard.moveColumnLeft}',
                icon     : 'b-fw-icon b-icon-left',
                disabled : columnRecord === columns[rtl ? 'last' : 'first'],
                weight   : 200,
                onItem   : () => this['move' + (rtl ? 'Next' : 'Prev')](columnRecord)
            };

            items.moveColumnRight = {
                text     : 'L{TaskBoard.moveColumnRight}',
                icon     : 'b-fw-icon b-icon-right',
                disabled : columnRecord === columns[rtl ? 'first' : 'last'],
                weight   : 300,
                onItem   : () => this['move' + (rtl ? 'Prev' : 'Next')](columnRecord)
            };
        }
    }

    onBeforeDragStart({ drag, event }) {
        /**
         * Fires on the owning TaskBoard before column dragging starts. Return `false` to prevent the action
         * @event beforeColumnDrag
         * @preventable
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.ColumnModel} columnRecord Column to be dragged
         */
        return this.client.trigger('beforeColumnDrag', { drag, event, columnRecord : drag.columnRecord });
    }

    onDragStart({ drag, event }) {
        /**
         * Fires on the owning TaskBoard when column dragging starts
         * @event columnDragStart
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.ColumnModel} columnRecord Column to be dragged
         */
        return this.client.trigger('columnDragStart', { drag, event, columnRecord : drag.columnRecord });
    }
}

ColumnDrag.initClass();

class ColumnZone extends Base.mixin(Draggable, Droppable, Events) {
    static get configurable() {
        return {
            dragSelector     : '.b-taskboard-column-header, .b-taskboard-column-header *',
            dragItemSelector : '.b-taskboard-column-header',

            // Column has multiple parts (header + one element per swimlane), going to add cls manually to them
            draggingItemCls : null,

            dragProxy : {
                type : 'default',

                async open(drag) {
                    const
                        { owner }    = this,
                        {
                            itemElement,
                            startEvent,
                            columnRecord
                        }            = drag,
                        taskBoard    = owner.owner.client,
                        headerBounds = Rectangle.from(itemElement, owner.dragRootElement),
                        // Offset from cursor
                        proxyOffset  = EventHelper.getClientPoint(startEvent).getDelta(headerBounds),
                        // Drag proxy, positioned over column being dragged
                        proxy        = DomHelper.createElement({
                            className : 'b-taskboard-column-drag-proxy',
                            parent    : owner.dragRootElement,
                            style     : {
                                // Using fixed top, only draggable horizontally
                                top   : headerBounds.y,
                                // Offset from cursor to be positioned over original column
                                left  : EventHelper.getClientPoint(startEvent).translate(proxyOffset[0], 0).x,
                                // Need a fixed width on the proxy, since columns width might be flexed etc
                                width : itemElement.getBoundingClientRect().width
                            },
                            // Don't want it being removed while dragging
                            retainElement : true
                        }),
                        // A column consists of multiple elements, a header and one "column" per swimlane (at least one)
                        elements     = [itemElement, ...taskBoard.getColumnElements(columnRecord)];

                    // Things we want to access later on drag
                    Object.assign(drag, {
                        proxy,
                        elements,
                        proxyOffset
                    });

                    // Clone all dragged column elements and put them in the proxy
                    elements.forEach((element, i) => {
                        const
                            columnClone = element.cloneNode(true),
                            bounds      = element.getBoundingClientRect();

                        // Store size, used to size drop indicator later
                        element.originalWidth = bounds.width;
                        element.originalHeight = bounds.height;

                        // Mimic element structure, swimlane > column (not fully mimicking it for now, should suffice)
                        if (element.matches('.b-taskboard-column')) {
                            const
                                swimlane      = element.closest('.b-taskboard-swimlane'),
                                header        = DomSync.getChild(swimlane, 'header'),
                                body          = DomSync.getChild(swimlane, 'body'),
                                swimlaneClone = swimlane.cloneNode(),
                                headerClone   = header?.cloneNode(true),
                                bodyClone     = body.cloneNode();

                            let height = swimlane.getBoundingClientRect().height;

                            // Last swimlane has bottom padding that we do not want in proxy
                            if (i === elements.length - 1) {
                                const paddingBottom = DomHelper.getStyleValue(element.parentElement, 'padding-bottom');
                                height -= parseFloat(paddingBottom);
                            }

                            // Use fixed height on the swimlanes in the drag proxy, to have it exactly match the board.
                            // Otherwise it would shrinkwrap
                            swimlaneClone.style.flex = `0 0 ${height}px`;

                            headerClone && swimlaneClone.appendChild(headerClone);
                            bodyClone.appendChild(columnClone);
                            swimlaneClone.appendChild(bodyClone);

                            proxy.appendChild(swimlaneClone);
                        }
                        // Column header
                        else {
                            proxy.appendChild(columnClone);
                        }

                        // Hide original column after measuring it above
                        element.classList.add('b-drag-original');
                    });
                },

                dragMove({ proxy, event, proxyOffset }) {
                    // Move along x-axis only
                    const position = EventHelper.getClientPoint(event).translate(proxyOffset[0], 0);

                    proxy.style.left = `${position.x}px`;
                }
            }
        };
    }

    setupDragContext(event) {
        const
            result = super.setupDragContext(event),
            { client } = this.owner;

        result.scrollManager = client.scrollManager;
        result.monitoringConfig = {
            scrollables : [{
                element   : client.bodyElement,
                direction : 'horizontal'
            }]
        };

        return result;
    }

    // Populate the drag context early, to have something to take decisions on in beforeDragStart listeners
    startDrag(drag) {
        drag.columnRecord = this.owner.client.resolveColumnRecord(drag.itemElement);

        return super.startDrag(drag);
    }

    dragStart(drag) {
        // Even though the size of other columns should not be affected, we might decide to animate in the future.
        // Suspending responsiveness to not have it kick in if we do...
        this.owner.client.suspendResponsiveness();

        drag.wasStarted = true;
    }

    dragEnter(drag) {
        // Only accept columns
        if (!drag.itemElement.matches(this.dragItemSelector)) {
            return false;
        }

        // Create drop indicators on first enter
        if (!drag.dropIndicators) {
            // Need one indicator for each part of the column
            drag.dropIndicators = drag.elements.map((element, i) => DomHelper.createElement({
                className   : 'b-taskboard-column-drop-indicator',
                elementData : {
                    dropIndicator : true,
                    // Tag along the element, to be able to return the drop indicator to its position for
                    // invalid drop targets. NOTE: Currently not used
                    element
                },
                // Use same size as dragged column had originally
                style : {
                    width  : element.originalWidth,
                    height : element.originalHeight
                }
            }));

            this.insertDropIndicators(drag, drag.columnRecord);
        }
    }

    insertDropIndicators(drag, beforeColumnRecord) {
        // Figure out insertion index among headers, will use same index within swimlanes
        const
            { client } = this.owner,
            insertAt   = client.columns.indexOf(beforeColumnRecord);

        // Insert all drop indicators
        drag.dropIndicators.forEach((dropIndicator, i) => {
            // Header
            if (i === 0) {
                // Insert at correct place among column headers
                const
                    headerContainer = DomSync.getChild(client.bodyElement, 'header'),
                    actualHeaders   = [...headerContainer.children];

                ArrayHelper.remove(actualHeaders, dropIndicator);

                headerContainer.insertBefore(dropIndicator, actualHeaders[insertAt]);
            }
            // Column
            else {
                // Insert it at correct place within corresponding swimlane
                const
                    // Get corresponding swimlane (default if swimlanes not used)
                    swimlaneRecord = client.swimlanes?.getAt(i - 1) ?? { domId : 'default' },
                    swimlaneBody   = DomSync.getChild(client.getSwimlaneElement(swimlaneRecord), 'body'),
                    actualColumns  = [...swimlaneBody.children];

                ArrayHelper.remove(actualColumns, dropIndicator);

                swimlaneBody.insertBefore(dropIndicator, actualColumns[insertAt]);
            }
        });
    }

    updateValidity(drag, valid) {
        drag.proxy.classList.toggle('b-invalid', !valid);
        drag.dropIndicators.forEach(dropIndicator => dropIndicator.classList.toggle('b-invalid', !valid));
        drag.invalid = !valid;
    }

    dragMove(drag) {
        const
            { client }          = this.owner,
            documentRoot        = client.documentRoot,
            proxyBounds         = Rectangle.from(drag.proxy, undefined, true),
            // Check element under proxy top center, should get a column header (or a gap)
            overElement         = documentRoot.elementFromPoint(proxyBounds.center.x, proxyBounds.y),
            columnHeaderElement = overElement?.closest('.b-taskboard-column-header');

        if (drag.invalid) {
            drag.valid = false;
        }

        // If we are over the drop indicator or something not a column header, we do nothing
        if (!overElement?.elementData?.dropIndicator && columnHeaderElement) {
            const targetBounds = Rectangle.from(columnHeaderElement);

            // Column that we are going to insert the dragged column before or after
            let beforeColumn = client.resolveColumnRecord(columnHeaderElement);

            // If beyond center, insert before next column
            if (proxyBounds.center.x > targetBounds.center.x) {
                beforeColumn = client.columns.getNext(beforeColumn);
            }

            this.insertDropIndicators(drag, beforeColumn);

            // Only trigger if order will change
            const shouldTrigger = drag.beforeColumn !== beforeColumn;

            drag.beforeColumn = beforeColumn;

            if (shouldTrigger) {
                /**
                 * Fires on the owning TaskBoard when a column is dragged, if the drag leads to a change compared to
                 * the last columnDrag event.
                 *
                 * Returning `false` from a listener will flag the drag as invalid (by default turning the drop
                 * indicator red)
                 *
                 * ```javascript
                 * const taskBoard = new TaskBoard({
                 *    listeners : {
                 *        // Do not allow moving beyond last column
                 *        columnDrag({ columnRecord, beforeColumn }) {
                 *           return beforeColumn === null;
                 *        }
                 *    }
                 * });
                 * ```
                 *
                 * @event columnDrag
                 * @on-owner
                 * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                 * @param {TaskBoard.model.ColumnModel} columnRecord Column being dragged
                 * @param {TaskBoard.model.ColumnModel} beforeColumn Insert before this column on drop, `null` if last
                 */
                const result = client.trigger('columnDrag', { drag, columnRecord : drag.columnRecord, beforeColumn });

                this.updateValidity(drag, result !== false);
            }
        }
    }

    async dragDrop(drag) {
        // Data part
        const
            { client }  = this.owner,
            { columns } = client,
            {
                columnRecord,
                beforeColumn,
                elements,
                dropIndicators,
                proxy
            }           = drag;

        /**
         * Fires on the owning TaskBoard when dropping a column, before the operation completes. Handles async
         * listeners, returning `false` from one will abort the operation
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    listeners : {
         *        async beforeColumnDrop({ columnRecord, beforeColumn }) {
         *            // Show confirmation dialog
         *            const result = await MessageDialog.confirm({
         *                title   : 'Verify drop',
         *                message : `Please confirm moving ${columnRecord.text} before ${beforeColumn.text}?`
         *            });
         *
         *            // Returning false will abort the drop (if user pressed Cancel)
         *            return result === MessageDialog.okButton;
         *        }
         *    }
         * });
         * ```
         *
         * @event beforeColumnDrop
         * @preventable
         * @async
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.ColumnModel} columnRecord Dropped column
         * @param {TaskBoard.model.ColumnModel} beforeColumn Dropped before this column
         */
        if (drag.invalid || await client.trigger('beforeColumnDrop', { drag, columnRecord, beforeColumn }) === false) {
            drag.valid = false;
        }
        else {
            drag.finalizer = new Promise(resolve => {
                function commit() {
                    // Remove proxy & dropIndicator
                    proxy.remove();
                    dropIndicators.forEach(dropIndicator => dropIndicator.remove());

                    // Restore original elements
                    elements.forEach(element => element.classList.remove('b-drag-original'));

                    // Update data
                    client.suspendDomTransition();
                    beforeColumn !== undefined && columns.move(columnRecord, beforeColumn);
                    client.resumeDomTransition();

                    /**
                     * Fires on the owning TaskBoard when a column is successfully dropped (after the drop transition
                     * has finished)
                     * @event columnDrop
                     * @on-owner
                     * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                     * @param {TaskBoard.model.ColumnModel} columnRecord Dropped column
                     * @param {TaskBoard.model.ColumnModel} beforeColumn Dropped before this column (`null` if last)
                     * @param {TaskBoard.model.SwimlaneModel} targetSwimlane Dropped in this swimlane (if used)
                     */
                    client.trigger('columnDrop', { drag, columnRecord, beforeColumn });

                    /**
                     * Fires on the owning TaskBoard when a previously started drag operation ends, no matter the
                     * outcome of it (whether valid, invalid or aborted)
                     *
                     * @event columnDragEnd
                     * @on-owner
                     * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                     * @param {TaskBoard.model.ColumnModel} columnRecord Affected column
                     */
                    client.trigger('columnDragEnd', { drag, columnRecord, beforeColumn });

                    client.resumeResponsiveness();

                    resolve();
                }

                // UI part

                // We are dropping, this cls by default has a transition
                proxy.classList.add('b-dropping');

                // Move proxy to drop location, allowing it to transition there
                DomHelper.alignTo(
                    proxy,
                    Rectangle.from(dropIndicators[0], undefined, true)
                );

                // Update record after the transition, to prevent too early redraw (which would ruin the transition)
                if (DomHelper.getPropertyTransitionDuration(proxy, 'transform')) {
                    EventHelper.onTransitionEnd({
                        element  : proxy,
                        property : 'transform',
                        handler  : commit,
                        thisObj  : client
                    });
                }
                // Or right away if no transition is used
                else {
                    commit();
                }
            });
        }
    }

    dragLeave(drag) {
        // Doing nothing feels ok for now
    }

    doAbort(drag) {
        const
            { client }                                        = this.owner,
            { dropIndicators, proxy, columnRecord, elements } = drag;

        if (proxy) {
            function finalizeAbort() {
                // Remove proxy & dropIndicator
                proxy.remove();
                dropIndicators.forEach(dropIndicator => dropIndicator.remove());

                // Restore original elements
                elements.forEach(element => element.classList.remove('b-drag-original'));

                client.trigger('columnDragAbortFinalized');
            }

            // Emulate a drop on abort, to get transitions
            proxy.classList.add('b-dropping');

            // Move drop indicators to where column originated
            dropIndicators.forEach((dropIndicator, i) => {
                const original = drag.elements[i];

                dropIndicator.classList.remove('b-invalid'); // Looks better if not invalid on return to origin

                original.parentElement.insertBefore(dropIndicator, original);
            });

            // Move proxy to original location, allowing it to transition there
            DomHelper.alignTo(
                proxy,
                Rectangle.from(dropIndicators[0], undefined, true)
            );

            // Finalize after transition
            if (DomHelper.getPropertyTransitionDuration(proxy, 'transform')) {
                EventHelper.onTransitionEnd({
                    element  : proxy,
                    property : 'transform',
                    handler  : finalizeAbort,
                    thisObj  : client // For timer cleanup
                });
            }
            // Or right away if no transition is used
            else {
                finalizeAbort();
            }
        }

        /**
         * Fires on the owning TaskBoard when a drag operation is aborted (invalid drop or aborted using ESC)
         *
         * @event columnDragAbort
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.ColumnModel} columnRecord Dragged column
         */
        client.trigger('columnDragAbort', { drag, columnRecord });

        if (drag.wasStarted) {
            // Documented in dragDrop()
            client.trigger('columnDragEnd', { drag, columnRecord });
        }
    }

    dragEnd(drag) {
        // Move back to original location when drag was aborted
        if (!drag.valid || drag.aborted) {
            this.doAbort(drag);
        }
    }
}
