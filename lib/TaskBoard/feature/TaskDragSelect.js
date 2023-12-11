import DomHelper from '../../Core/helper/DomHelper.js';
import EventHelper from '../../Core/helper/EventHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import Rectangle from '../../Core/helper/util/Rectangle.js';
import TaskBoardFeature from './TaskBoardFeature.js';

/**
 * @module TaskBoard/feature/TaskDragSelect
 */

/**
 * Enables users to click and drag to select cards on the TaskBoard (marquee selection).
 *
 * {@inlineexample TaskBoard/feature/TaskDragSelect.js}
 *
 * This feature is **enabled** by default.
 *
 * @extends Core/mixin/InstancePlugin
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype taskDragSelect
 * @feature
 */
export default class TaskDragSelect extends TaskBoardFeature {

    static $name =  'TaskDragSelect';

    static type = 'taskDragSelect';

    static configurable = {
        /**
         * The amount of pixels to move pointer/mouse before it counts as a drag select operation.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    features : {
         *        taskDragSelect : {
         *            dragThreshold : 10
         *        }
         *    }
         * });
         * ```
         *
         * @config {Number}
         * @default
         */
        dragThreshold : 5
    };

    state = 'idle';

    static pluginConfig = {
        chain : ['onColumnMouseDown', 'onMouseMove']
    };

    //region Type assertions

    changeDragThreshold(threshold) {
        ObjectHelper.assertNumber(threshold, 'features.taskDragSelect.dragThreshold');

        return threshold;
    }

    //endregion

    initializeDragSelect(event) {
        const
            me         = this,
            { client } = me;

        me.bounds = Rectangle.from(client.bodyElement, /* ignorePageScroll = */ true);

        me.element = DomHelper.createElement({
            tag       : 'div',
            className : 'b-dragselect-rect'
        }, { returnAll : true })[0];

        client.floatRoot.appendChild(me.element);
        client.element.classList.add('b-dragselecting');

        const cardElements = Array.from(client.element.querySelectorAll('.b-taskboard-card:not(.b-dragging-item)'));

        // Since the dragselect element is in the floatRoot, we want to use viewport-based coordinates, so we pass
        // ignorePageScroll=true when calling Rectangle.from():
        me.cardRectangles = cardElements.flatMap(el => {
            // Previously we could get here with the drag proxy among elements, that case is now prevented by the
            // selector above, but safeguarding against similar cases in the future here
            const record = client.resolveTaskRecord(el);
            return record
                ? {
                    rectangle : Rectangle.from(el, /* ignorePageScroll = */ true),
                    record
                } : [];
        });

        if (!event.ctrlKey) {
            client.deselectAll();
        }

        // No key processing during drag selection
        client.navigateable = false;

        me.state = 'selecting';
    }

    // Select cards intersected by the selection marquee
    updateSelection() {
        const { cardRectangles, rectangle, client } = this;

        for (let i = 0, len = cardRectangles.length; i < len; i++) {
            const
                cardData     = cardRectangles[i],
                shouldSelect = rectangle.intersect(cardData.rectangle, true);

            if (shouldSelect && !cardData.selected) {
                cardData.selected = true;

                client.selectTask(cardData.record, true);
            }
            else if (!shouldSelect && cardData.selected) {
                cardData.selected = false;

                client.deselectTask(cardData.record);
            }
        }
    }

    //region Listeners

    onColumnMouseDown({ event }) {
        const me = this;

        if (!me.disabled && event.button === 0) {
            me.state = 'considering';
            me.startX = event.clientX;
            me.startY = event.clientY;

            me.mouseUpDetacher = EventHelper.on({
                element : document,
                mouseup : 'onMouseUp',
                thisObj : me
            });
        }
    }

    onMouseMove({ event }) {
        const
            me                   = this,
            { startX, startY }   = me,
            { clientX, clientY } = event;

        if (me.state === 'considering') {
            const
                deltaX = Math.abs(clientX - startX),
                deltaY = Math.abs(clientY - startY);

            if (deltaX > me.dragThreshold || deltaY > me.dragThreshold) {
                me.initializeDragSelect(event);
            }
        }

        if (me.state === 'selecting') {
            const
                { element, bounds } = me,
                x                   = Math.max(clientX, bounds.left),
                y                   = Math.max(clientY, bounds.top),
                left                = Math.min(startX, x),
                top                 = Math.min(startY, y),
                width               = Math.abs(startX - x),
                height              = Math.abs(startY - y),
                rect                = new Rectangle(left, top, width, height).constrainTo(bounds);

            DomHelper.setTranslateXY(element, rect.left, rect.top);
            element.style.width  = rect.width + 'px';
            element.style.height = rect.height + 'px';

            me.rectangle = rect;

            me.updateSelection();
        }
    }

    onMouseUp() {
        const
            me                = this,
            { client, state } = me;

        // Cards are selected during mouse move, no need to change selection here

        if (state === 'selecting') {
            me.element?.remove();
            client.element.classList.remove('b-dragselecting');

            // Navigator will react to the 'click' event which clears selection, bypass this with a short timeout
            client.setTimeout(() => client.navigateable = true, 100);
        }

        if (state === 'selecting' || state === 'considering') {
            me.state = 'idle';
            me.startX = me.startY = me.rectangle = me.bounds = null;
        }

        me.mouseUpDetacher?.();
    }

    //endregion
}

TaskDragSelect.initClass();
