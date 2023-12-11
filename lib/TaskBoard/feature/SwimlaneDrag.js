import TaskBoardFeature from './TaskBoardFeature.js';
import Base from '../../Core/Base.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import EventHelper from '../../Core/helper/EventHelper.js';
import Rectangle from '../../Core/helper/util/Rectangle.js';
import Draggable from '../../Core/mixin/Draggable.js';
import Droppable from '../../Core/mixin/Droppable.js';

/**
 * @module TaskBoard/feature/SwimlaneDrag
 */

/**
 * This feature allows users to drag drop swimlanes on the TaskBoard changing their order (by grabbing their header).
 *
 * {@inlineexample TaskBoard/feature/SwimlaneDrag.js}
 *
 * This feature is **disabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype swimlaneDrag
 * @feature
 */
export default class SwimlaneDrag extends TaskBoardFeature {
    static $name = 'SwimlaneDrag';

    static type = 'swimlaneDrag';

    static pluginConfig = {
        after : ['initialCompose']
    };

    initialCompose() {
        const me     = this;
        // Cannot use configurable since bodyElement is not available yet when feature is pulled in
        me.draggable = SwimlaneZone.new({
            dragRootElement : me.disabled ? null : me.client.bodyWrapElement,
            dropRootElement : me.client.bodyWrapElement,
            owner           : me
        }, me.draggable);
    }

    doDisable(disable) {
        super.doDisable(disable);

        if (this.draggable) {
            this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
        }
    }
}

SwimlaneDrag.initClass();

class SwimlaneZone extends Base.mixin(Draggable, Droppable) {
    static get configurable() {
        return {
            dragSelector     : '.b-taskboard-swimlane-header, .b-taskboard-swimlane-header *',
            dragItemSelector : '.b-taskboard-swimlane-header',

            draggingItemCls : null,

            dragProxy : {
                type : 'default',

                async open(drag) {
                    const
                        { owner }       = this,
                        {
                            itemElement,
                            startEvent
                        }               = drag,
                        taskBoard       = owner.owner.client,
                        swimlaneRecord  = taskBoard.resolveSwimlaneRecord(itemElement),
                        swimlaneElement = taskBoard.getSwimlaneElement(swimlaneRecord),
                        padding         = DomHelper.getStyleValue(
                            swimlaneElement.syncIdMap.body,
                            ['padding-left', 'padding-right']
                        ),
                        bounds          = Rectangle.from(swimlaneElement, owner.dragRootElement).deflate(
                            0,
                            parseFloat(padding['padding-right']),
                            0,
                            parseFloat(padding['padding-left'])
                        ),
                        // Offset from cursor
                        proxyOffset     = EventHelper.getClientPoint(startEvent).getDelta(bounds),
                        // Drag proxy, positioned over column being dragged
                        proxy           = DomHelper.createElement({
                            className : 'b-taskboard-swimlane-drag-proxy',
                            parent    : owner.dragRootElement,
                            style     : {
                                // Using fixed top, only draggable horizontally
                                top   : EventHelper.getClientPoint(startEvent).translate(0, proxyOffset[1]).y,
                                // Offset from cursor to be positioned over original column
                                left  : bounds.x,
                                // Need a fixed height on the proxy, since columns width might be flexed etc
                                width : bounds.width
                            },
                            // Don't want it being removed while dragging
                            retainElement : true
                        });

                    // Things we want to access later on drag
                    Object.assign(drag, {
                        proxy,
                        swimlaneRecord,
                        swimlaneElement,
                        proxyOffset,
                        // Used to size dropIndicator
                        bounds
                    });

                    // Clone all dragged column elements and put them in the proxy
                    const swimlaneClone = swimlaneElement.cloneNode(true);

                    proxy.appendChild(swimlaneClone);
                },

                dragMove({ proxy, event, proxyOffset }) {
                    // Move along y-axis only
                    const position = EventHelper.getClientPoint(event).translate(0, proxyOffset[1]);

                    proxy.style.top = `${position.y}px`;
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
                direction : 'vertical'
            }]
        };

        return result;
    }

    dragStart(drag) {
        // Trigger something...
    }

    dragEnter(drag) {
        // Only accept swimlanes
        if (!drag.itemElement.matches(this.dragItemSelector)) {
            return false;
        }

        // Create drop indicators on first enter
        if (!drag.dropIndicator) {
            const { bounds } = drag;

            // Need one indicator for each part of the column
            drag.dropIndicator = DomHelper.createElement({
                className   : 'b-taskboard-swimlane-drop-indicator',
                elementData : {
                    dropIndicator : true
                },
                // Use same size as dragged column had originally
                style : {
                    width  : bounds.width,
                    height : bounds.height
                }
            });

            this.insertDropIndicator(drag.dropIndicator, drag.swimlaneRecord);

            drag.swimlaneElement.classList.add('b-drag-original');
        }
    }

    insertDropIndicator(dropIndicator, beforeSwimlaneRecord) {
        const { client } = this.owner;

        client.bodyElement.insertBefore(
            dropIndicator,
            beforeSwimlaneRecord && client.getSwimlaneElement(beforeSwimlaneRecord)
        );
    }

    async dragMove(drag) {
        const
            { client }       = this.owner,
            { documentRoot } = client,
            taskBoardBounds  = Rectangle.from(client.element, undefined, true),
            proxyBounds      = Rectangle.from(drag.proxy, undefined, true),
            // Check element under proxy left center, should get a swimlane (or a gap)
            overElement      = proxyBounds.center.y > taskBoardBounds.bottom
                ? documentRoot.elementFromPoint(proxyBounds.x, proxyBounds.y)
                : documentRoot.elementFromPoint(proxyBounds.x, proxyBounds.center.y),
            swimlaneElement  = overElement?.closest('.b-taskboard-swimlane');

        // If we are over the drop indicator or something not a column header, we do nothing
        if (!overElement?.elementData?.dropIndicator && swimlaneElement) {
            const targetBounds = Rectangle.from(swimlaneElement, undefined, true);

            // Column that we are going to insert the dragged column before or after
            let beforeSwimlane = client.resolveSwimlaneRecord(swimlaneElement);

            // If beyond center, insert before next column
            if (proxyBounds.center.y > targetBounds.center.y) {
                beforeSwimlane = client.swimlanes.getNext(beforeSwimlane);
            }

            this.insertDropIndicator(drag.dropIndicator, beforeSwimlane);

            drag.beforeSwimlane = beforeSwimlane;
        }
    }

    async dragDrop(drag) {
        // Data part
        const
            { client }    = this.owner,
            { swimlanes } = client,
            {
                swimlaneRecord,
                beforeSwimlane,
                swimlaneElement,
                dropIndicator,
                proxy
            }             = drag;

        function commit() {
            // Remove proxy & dropIndicator
            proxy.remove();
            dropIndicator.remove();

            // Restore original element
            swimlaneElement.classList.remove('b-drag-original');

            // Update data
            beforeSwimlane !== undefined && swimlanes.move(swimlaneRecord, beforeSwimlane);

            client.trigger('dropSwimlane', { beforeSwimlane, drag });
        }

        // UI part

        // We are dropping, this cls by default has a transition
        proxy.classList.add('b-dropping');

        // Move proxy to drop location, allowing it to transition there
        DomHelper.alignTo(
            proxy,
            Rectangle.from(dropIndicator, undefined, true)
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
    }

    dragLeave(drag) {
        // Doing nothing feels ok for now
    }
}
