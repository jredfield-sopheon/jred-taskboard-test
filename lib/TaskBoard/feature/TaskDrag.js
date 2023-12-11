import TaskBoardFeature from './TaskBoardFeature.js';
import Base from '../../Core/Base.js';
import AsyncHelper from '../../Core/helper/AsyncHelper.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import DomSync from '../../Core/helper/DomSync.js';
import EventHelper from '../../Core/helper/EventHelper.js';
import Rectangle from '../../Core/helper/util/Rectangle.js';
import Draggable from '../../Core/mixin/Draggable.js';
import Droppable from '../../Core/mixin/Droppable.js';
import Events from '../../Core/mixin/Events.js';

/**
 * @module TaskBoard/feature/TaskDrag
 */

const
    cardSelector = '.b-taskboard-card, .b-taskboard-card-drop-indicator',
    // Index of the specified card/drop indicator (other drop indicators excluded)
    indexOf      = (element, ignoreOriginal = false) => DomHelper
        .children(element.parentElement, `.b-taskboard-card${ignoreOriginal ? ':not(.b-drag-original)' : ''}, .b-first-drop-indicator`)
        .indexOf(element),
    // Check if any drop indicator has moved in a way that will lead to task changes
    hasChanged   = dropIndicators => dropIndicators.some((dropIndicator, i) => {
        return (
            // Moved to another parent is a change (another column or another swimlane)
            dropIndicator.parentElement !== dropIndicator.elementData.initialParent ||
            // Or if first drop indicator has changed index (the others follow it, no need to check)
            (i === 0 && indexOf(dropIndicator, true) !== dropIndicator.elementData.initialIndex)
        );
    });

/**
 * This feature allows cards on the TaskBoard to be dragged across swimlanes and columns but also vertically in the
 * same column to change the order:
 *
 * {@inlineexample TaskBoard/feature/TaskDrag.js}
 *
 * When a task is dropped, its {@link TaskBoard.view.TaskBoard#config-columnField},
 * {@link TaskBoard.view.TaskBoard#config-swimlaneField} and/or {@link TaskBoard.model.TaskModel#field-weight} fields
 * are updated to reflect the new location.
 *
 * ## Drag events
 *
 * The different stages of a drag operation trigger different events, in order of appearance:
 *
 * | Event                         | Description                                                                    |
 * |-------------------------------|--------------------------------------------------------------------------------|
 * | {@link #event-beforeTaskDrag} | Preventable event fired before a drag starts                                   |
 * | {@link #event-taskDragStart}  | Fired when dragging starts                                                     |
 * | {@link #event-taskDrag}       | Fired when movement during a drag will lead to changes                         |
 * | {@link #event-beforeTaskDrop} | Preventable event fired before finalizing a valid drop. Allows async listeners |
 * | {@link #event-taskDrop}       | Fired after finalizing a valid drop                                            |
 * | {@link #event-taskDragAbort}  | Fired when a drag is aborted (ESC, drop out of bounds or by a listener)        |
 * | {@link #event-taskDragEnd}    | Fired when a started drag ends, no matter the outcome                          |
 *
 * The {@link #event-beforeTaskDrop} is useful for example to request user confirmation for a drop:
 *
 * {@inlineexample TaskBoard/feature/TaskDragEvents.js}
 *
 * This feature is **enabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype taskDrag
 * @feature
 */
export default class TaskDrag extends TaskBoardFeature {
    static $name = 'TaskDrag';

    static type = 'taskDrag';

    static pluginConfig = {
        after : ['initialCompose']
    };

    static configurable = {
        /**
         * Specify `true` to enable the old behavior of moving tasks in the store on drop.
         *
         * This behaviour was made opt in since it does not play well when sharing data with other components.
         *
         * <div class="note">
         * If you are sorting tasks by a field other than `weight` and want predictable results on drop, you should
         * enable this config.
         * </div>
         *
         * @config {Boolean}
         * @default
         */
        reorderTaskRecords : false,

        /**
         * The number of milliseconds that must elapse after a `touchstart` event before it is considered a drag. If
         * movement occurs before this time, the drag is aborted. This is to allow touch swipes and scroll gestures.
         * @config {Number}
         * @default 300
         */
        dragTouchStartDelay : null
    };

    initialCompose() {
        const me = this;

        // Cannot use configurable since bodyElement is not available yet when feature is pulled in
        me.draggable = TaskZone.new({
            dragRootElement                                                      : me.disabled ? null : me.client.bodyWrapElement,
            dropRootElement                                                      : me.client.bodyWrapElement,
            owner                                                                : me,
            [me.dragTouchStartDelay != null ? 'dragTouchStartDelay' : undefined] : me.dragTouchStartDelay,
            internalListeners                                                    : {
                beforeDragStart : 'onBeforeDragStart',
                dragStart       : 'onDragStart',
                thisObj         : me
            }
        }, me.draggable);
    }

    doDestroy() {
        super.doDestroy();

        this.draggable?.destroy();
    }

    doDisable(disable) {
        super.doDisable(disable);

        if (this.draggable) {
            this.draggable.dragRootElement = disable ? null : this.client.bodyWrapElement;
        }
    }

    onBeforeDragStart({ drag, event }) {
        /**
         * Fires on the owning TaskBoard before task dragging starts. Return `false` to prevent the action
         * @event beforeTaskDrag
         * @preventable
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.TaskModel[]} taskRecords Tasks to be dragged
         * @param {Event} domEvent The mouse event
         */
        return this.client.trigger('beforeTaskDrag', { drag, event, domEvent : event, taskRecords : drag.taskRecords });
    }

    onDragStart({ drag, event }) {
        /**
         * Fires on the owning TaskBoard when task dragging starts
         * @event taskDragStart
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.TaskModel[]} taskRecords Tasks to be dragged
         * @param {Event} domEvent The mouse event
         */
        return this.client.trigger('taskDragStart', { drag, event, domEvent : event, taskRecords : drag.taskRecords });
    }
}

TaskDrag.initClass();

class TaskZone extends Base.mixin(Draggable, Droppable, Events) {
    static get configurable() {
        return {
            dragSelector       : '.b-taskboard-card:not(.b-readonly)',
            dragItemSelector   : '.b-taskboard-card:not(.b-readonly)',
            // Accept drops on anything within the TaskBoard
            dropTargetSelector : '.b-taskboardbase',

            // We are going to allow dragging multiple cards, will need to add cls manually to all of them
            draggingItemCls : null,

            dragProxy : {
                type : 'default',

                async open(drag) {
                    const
                        {
                            itemElement,
                            startEvent
                        }          = drag,
                        taskBoard  = this.owner.owner.client,
                        columnEl   = itemElement.closest('.b-taskboard-column'),
                        taskRecord = taskBoard.resolveTaskRecord(itemElement),
                        proxy      = drag.proxy = DomHelper.createElement({
                            // Add column classes too to get exact same styles applied
                            className     : 'b-taskboard-drag-proxy ' + columnEl.className,
                            role          : 'presentation',
                            // Don't want it being removed while dragging
                            retainElement : true
                        }),
                        cardClones = [];

                    let taskRecords;

                    // If we have selected tasks, drag them only if drag starts from one of the selected
                    if (taskBoard.selectedTasks.includes(taskRecord)) {
                        taskRecords = taskBoard.selectedTasks.filter(t => !t.readOnly).sort((a, b) => a.parentIndex - b.parentIndex);
                    }
                    // Otherwise (no selection or dragging an unselected) only drag one
                    else {
                        taskRecords = [taskRecord];
                    }

                    const taskElements = taskRecords.map(r => taskBoard.getTaskElement(r));

                    Object.assign(drag, {
                        taskElements,
                        // Store heights, cannot measure later when original tasks are hidden
                        taskHeights : new Map(),
                        // Offset from cursor, ignoring page scroll = client coords
                        proxyOffset : EventHelper
                            .getClientPoint(startEvent)
                            .getDelta(Rectangle.from(itemElement, null, true))
                    });

                    // Clone all dragged cards and put them in the proxy
                    taskElements.forEach(taskElement => {
                        const
                            { elementData } = taskElement,
                            cardClone       = taskElement.cloneNode(true),
                            bounds          = Rectangle.from(taskElement, itemElement);

                        // Cards get their width from the column, need to apply the width to the proxy card
                        cardClone.style.width = bounds.width + 'px';
                        cardClone.style.height = bounds.height + 'px';
                        drag.taskHeights.set(taskElement, bounds.height);

                        // Position cards in the proxy to overlap their originals
                        cardClone.style.left = bounds.x + 'px';
                        cardClone.style.top = bounds.y + 'px';

                        cardClone.taskElement = taskElement;
                        cardClone.taskRecord = elementData.taskRecord;
                        cardClone.originalColor = elementData.swimlaneRecord?.color || elementData.columnRecord.color;

                        proxy.appendChild(cardClone);
                        cardClones.push(cardClone);
                    });

                    // Hide original card after measuring it above (cannot be done in the same loop, others will get
                    // wrong bounds)
                    taskElements.forEach(taskElement => taskElement.classList.add('b-drag-original'));

                    await AsyncHelper.animationFrame();

                    // Now reposition the cards to their desired position within the proxy, transitioning them there
                    cardClones.forEach((cardClone, i) => {
                        if (i > 0) {
                            cardClone.style.top = (30 + i * 20) + 'px';
                            cardClone.style.left = (40 + i * 5) + 'px';
                        }
                        else {
                            cardClone.style.top = 0;
                            cardClone.style.left = 0;
                        }
                    });
                },

                dragMove({ proxy, event, proxyOffset }) {
                    const
                        { dragRootElement } = this.owner,
                        // Parent coords relative to screen (client)
                        parentBounds        = dragRootElement.getBoundingClientRect(),
                        // Place proxy in client coords
                        position            = EventHelper.getClientPoint(event).translate(
                            proxyOffset[0] - parentBounds.left + dragRootElement.scrollLeft,
                            proxyOffset[1] - parentBounds.top + dragRootElement.scrollTop
                        );

                    proxy.style.top = position.y + 'px';
                    proxy.style.left = position.x + 'px';

                    // Experimental, tilt proxy based on drag amount and direction

                    // let delta = 0;
                    //
                    // if (proxy.lastClientX != null) {
                    //     delta = event.clientX - proxy.lastClientX;
                    // }
                    //
                    // proxy.lastClientX = event.clientX;
                    //
                    // proxy.style.transform = `rotate(${-delta / 10}deg)`;
                    // proxy.style.transformOrigin = `${-proxyOffset[0]}px ${-proxyOffset[1]}px`;
                }
            }
        };
    }

    configureListeners(drag) {
        const listeners = super.configureListeners(drag);

        // Listen to the events on the root element
        listeners.element = this.owner.client.rootElement;

        return listeners;
    }

    setupDragContext(event) {
        const
            result     = super.setupDragContext(event),
            { client } = this.owner;

        result.scrollManager = client.scrollManager;
        result.monitoringConfig = {
            scrollables : [
                {
                    element   : '.b-taskboard-column-body',
                    direction : 'vertical'
                },
                {
                    element   : client.bodyElement,
                    direction : 'both'
                }
            ]
        };

        return result;
    }

    // Populate the drag context early, to have something to take decisions on in beforeDragStart listeners
    startDrag(drag) {
        const
            { itemElement } = drag,
            taskBoard       = this.owner.client,
            taskRecord      = taskBoard.resolveTaskRecord(itemElement);

        // If we have selected tasks, drag them only if drag starts from one of the selected
        if (taskBoard.isSelected(taskRecord)) {
            drag.taskRecords = taskBoard.selectedTasks.slice().sort((a, b) => a.parentIndex - b.parentIndex);
        }
        // Otherwise (no selection or dragging an unselected) only drag one
        else {
            drag.taskRecords = [taskRecord];
        }

        drag.initiatedFrom = taskRecord;

        return super.startDrag(drag);
    }

    dragStart(drag) {
        const
            { client }  = this.owner,
            // Insert dropIndicators next to task that drag was initiated on initially
            nextSibling = drag.itemElement;

        // Flag to determine if `taskDragEnd` should be triggered on later abort
        drag.wasStarted = true;

        // Initially positioned after task drag is initiated from
        drag.position = 'after';
        drag.targetTaskRecord = drag.initiatedFrom;

        for (const taskRecord of drag.taskRecords) {
            taskRecord.instanceMeta(client).dragging = true;
        }

        // Adding proxy here and not when it is created saves one layout
        client.bodyWrapElement.appendChild(drag.proxy);

        // Populate drop indicator with placeholders
        drag.dropIndicators = drag.taskElements.map((taskElement, i) => {
            return DomHelper.createElement({
                className : {
                    'b-taskboard-card-drop-indicator' : 1,
                    'b-first-drop-indicator'          : i === 0
                },
                style : {
                    height : drag.taskHeights.get(taskElement)
                },
                elementData : {
                    dropIndicator : true,
                    // To be able to detect if it has actually moved on drop
                    initialParent : taskElement.parentElement,
                    initialIndex  : indexOf(taskElement),
                    // Tag along the taskElement, to be able to return the drop indicator to its position for
                    // invalid drop targets
                    taskElement
                },
                retainElement : true,
                nextSibling
            });
        });

        client.element.classList.add('b-dragging-task');
    }

    dragEnter(drag) {
        // Only accept tasks
        if (!drag.itemElement.matches(this.dragItemSelector)) {
            return false;
        }
    }

    // Finds the first visible direct child in a parent element
    getFirstVisibleChild(parentElement) {
        for (const element of parentElement.children) {
            if (element.offsetParent) {
                return element;
            }
        }
    }

    // Convenience shortcut to not have to pass custom card selector on each call
    getCardAt(x, y) {
        return this.owner.client.getCardAt(x, y, cardSelector);
    }

    updateValidity(drag, valid) {
        drag.proxy.classList.toggle('b-invalid', !valid);
        drag.dropIndicators.forEach(dropIndicator => dropIndicator.classList.toggle('b-invalid', !valid));
        drag.invalid = !valid;
    }

    dragMove(drag) {
        const
            me                                   = this,
            { client }                           = me.owner,
            { event : domEvent, dropIndicators } = drag,
            { clientX, clientY }                 = domEvent,
            overElement                          = client.documentRoot.elementFromPoint(clientX, clientY),
            columnElement                        = DomSync.getChild(overElement?.closest('.b-taskboard-column'), 'body.inner');

        if (drag.invalid) {
            drag.valid = false;
        }

        if (!overElement) {
            return;
        }

        // Over something in a column or the column itself
        if (columnElement) {
            const
                targetSwimlane = client.resolveSwimlaneRecord(overElement),
                targetColumn   = client.resolveColumnRecord(overElement),
                tasksPerRow    = targetColumn.tasksPerRow || targetSwimlane?.tasksPerRow || client.tasksPerRow;

            let
                cardElement   = overElement.closest(cardSelector),
                // Should only trigger drag event when move actually affected something
                shouldTrigger = targetSwimlane !== drag.targetSwimlane || targetColumn !== drag.targetColumn;

            // Only resolve swimlane/column when over a column, that way target sticks even if mouse is moved outside
            drag.targetSwimlane = targetSwimlane;
            drag.targetColumn = targetColumn;

            // Might be over gap between cards, check if there is card above or below the gap
            if (!cardElement) {
                const
                    { cardGap } = client,
                    columnRect  = Rectangle.from(columnElement),
                    topCard     = me.getFirstVisibleChild(columnElement),
                    top         = topCard?.getBoundingClientRect().top ?? null;

                if (tasksPerRow === 1) {
                    // Above top card, use it
                    if (top !== null && clientY < top) {
                        cardElement = topCard;
                    }
                    else {
                        const
                            centerX   = columnRect.center.x,
                            // Check column center, one gap up
                            cardAbove = me.getCardAt(centerX, clientY - cardGap),
                            // And one gap down
                            cardBelow = me.getCardAt(centerX, clientY + cardGap);

                        // Pick one of them
                        cardElement = cardAbove || cardBelow;
                    }
                }
                else {
                    // Determine which "inner column" mouse is over
                    const
                        columnContentWidth = client.getColumnWidth(drag.targetColumn),
                        // Can calculate padding, avoids reading it from DOM
                        columnPadding      = (columnRect.width - columnContentWidth) / 2,
                        // Width of an "inner column", ignoring gap between cards which does not matter in this case.
                        // An approximate center fits our purpose
                        innerColumnWidth   = columnContentWidth / tasksPerRow,
                        // "Inner column" index
                        index              = Math.floor((clientX - columnRect.left) / innerColumnWidth),
                        // That columns center
                        centerX            = columnRect.left + columnPadding + innerColumnWidth * (index + 0.5);

                    // Above top row, use card below us
                    if (top !== null && clientY < top) {
                        cardElement = me.getCardAt(centerX, top);
                    }
                    else {
                        const
                            centerX    = columnRect.center.x,
                            // Check column center, one gap left
                            cardBefore = me.getCardAt(centerX - cardGap, clientY),
                            // And one gap right
                            cardAfter  = me.getCardAt(centerX + cardGap, clientY);

                        // Pick one of them
                        cardElement = cardBefore || cardAfter;
                    }
                }
            }

            // If we are over the drop indicator, we do nothing
            if (!cardElement?.elementData.dropIndicator) {
                let insertBefore = false;

                // If we found a card, we should either go above or below it
                if (cardElement) {
                    const
                        cardRect         = Rectangle.from(cardElement),
                        targetTaskRecord = client.resolveTaskRecord(cardElement);

                    // Insert before
                    if (
                        // If above center with single task per row
                        (tasksPerRow === 1 && clientY < cardRect.center.y) ||
                        // Or left of center in multiple tasks per row
                        (tasksPerRow > 1 && clientX < cardRect.center.x)
                    ) {
                        if (drag.position !== 'before') {
                            shouldTrigger = true;
                        }

                        insertBefore = cardElement;
                        drag.position = 'before';
                    }
                    // Insert after
                    else {
                        if (drag.position !== 'after') {
                            shouldTrigger = true;
                        }

                        insertBefore = cardElement.nextElementSibling;
                        drag.position = 'after';
                    }

                    if (targetTaskRecord !== drag.targetTaskRecord) {
                        shouldTrigger = true;
                    }

                    drag.targetTaskRecord = targetTaskRecord;
                }
                // No card, either empty column or below cards. Either way we append the card to the column
                else {
                    if (drag.position !== 'last') {
                        shouldTrigger = true;
                    }

                    drag.position = 'last';
                    drag.targetTaskRecord = null;
                }

                if (!insertBefore?.elementData?.dropIndicator) {
                    if (insertBefore === false) {
                        dropIndicators.forEach(dropIndicator => {
                            columnElement?.appendChild(dropIndicator);
                        });
                    }
                    else {
                        dropIndicators.forEach(dropIndicator => {
                            (insertBefore?.parentElement || columnElement).insertBefore(dropIndicator, insertBefore);
                        });
                    }

                    drag.lastCardElement = cardElement;
                }
            }

            // Update dragged cards dataset/color cls in case it is used for styling (as we do in demos)
            for (const card of drag.proxy.children) {

                if (!card.taskRecord.eventColor) {
                    const color = drag.targetSwimlane?.color || drag.targetColumn.color;

                    if (card.originalColor) {
                        card.classList.remove(`b-taskboard-color-${card.originalColor}`);
                    }

                    if (color) {
                        card.originalColor = color;
                        if (DomHelper.isNamedColor(color)) {
                            card.classList.add(`b-taskboard-color-${color}`);
                        }
                        else {
                            card.style.color = color;
                        }
                    }
                }

                if (drag.targetSwimlane) {
                    card.dataset.lane = drag.targetSwimlane.id;
                }

                card.dataset.column = drag.targetColumn.id;
            }

            if (shouldTrigger) {
                const
                    { taskRecords, targetTaskRecord, position } = drag,
                    /**
                     * Fires on the owning TaskBoard when tasks are dragged, if the drag leads to any changes compared to
                     * the last taskDrag event (moved to a new column or changed order within a column).
                     *
                     * Returning `false` from a listener will flag the drag as invalid (by default turning the drop
                     * indicator red)
                     *
                     * @event taskDrag
                     * @on-owner
                     * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                     * @param {TaskBoard.model.TaskModel[]} taskRecords Dragged tasks
                     * @param {TaskBoard.model.ColumnModel} targetColumn Currently over this column
                     * @param {TaskBoard.model.SwimlaneModel} targetSwimlane Currently over this swimlane (if used)
                     * @param {Event} domEvent The mouse event
                     */
                    result                                      = client.trigger(
                        'taskDrag',
                        { drag, taskRecords, targetSwimlane, targetColumn, targetTaskRecord, position, event : domEvent, domEvent }
                    );

                me.updateValidity(drag, result !== false);
            }
        }
    }

    async dragDrop(drag) {
        const
            me         = this,
            { client } = me.owner,
            {
                dropIndicators,
                taskRecords,
                targetSwimlane,
                targetColumn,
                targetTaskRecord,
                event : domEvent
            }          = drag,
            event      = { drag, domEvent, event : domEvent, taskRecords, targetSwimlane, targetColumn, targetTaskRecord },
            // Check that drop will lead to changes for at least one dragged task
            changed    = hasChanged(dropIndicators);

        /**
         * Fires on the owning TaskBoard when tasks are dropped, before the operation completes. Handles async
         * listeners, returning `false` from one will abort the operation
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *    listeners : {
         *        async beforeTaskDrop({ taskRecords, targetColumn }) {
         *            // Show confirmation dialog
         *            const result = await MessageDialog.confirm({
         *                title   : 'Verify drop',
         *                message : `Please confirm moving ${taskRecords.map(t => `"${t.name}"`).join(', ')} to ${targetColumn.text}?`
         *            });
         *
         *            // Returning false will abort the drop (if user pressed Cancel)
         *            return result === MessageDialog.okButton;
         *        }
         *    }
         * });
         * ```
         *
         * @event beforeTaskDrop
         * @preventable
         * @async
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.TaskModel[]} taskRecords Dropped tasks
         * @param {TaskBoard.model.ColumnModel} targetColumn Dropped on this column
         * @param {TaskBoard.model.SwimlaneModel} targetSwimlane Dropped in this swimlane (if used)
         * @param {Event} domEvent The mouse event
         */
        if (!changed || !targetColumn || drag.invalid || await client.trigger('beforeTaskDrop', event) === false) {
            drag.valid = false;
        }
        else {
            drag.finalizer = new Promise(resolve => {
                // Data part
                const
                    {
                        columnField,
                        swimlaneField
                    }               = client,
                    { taskStore }   = client.project,
                    {
                        proxy
                    }               = drag,
                    columnRecords   = targetColumn.tasks,
                    swimlaneRecords = targetSwimlane
                        ? columnRecords?.filter(task => task[swimlaneField] === targetSwimlane.id)
                        : columnRecords,
                    invalid         = !columnRecords;

                let moveBefore;

                if (!invalid) {
                    // Dropped relative to another card?
                    if (drag.targetTaskRecord) {
                        // If before it, move to before it in store too
                        if (drag.position === 'before') {
                            moveBefore = targetTaskRecord;
                        }
                        // If after, move to before the next record
                        else if (drag.position === 'after') {
                            const index = swimlaneRecords.indexOf(targetTaskRecord);
                            moveBefore = swimlaneRecords[index + 1] ?? null;
                        }
                    }
                    // Dropped below all cards or in empty column, move to last in store which guarantees it is last in that column
                    else if (swimlaneRecords.length) {
                        moveBefore = null;
                    }
                }

                function commit() {
                    // Remove proxy & dropIndicators
                    proxy.remove();

                    dropIndicators.forEach(dropIndicator => {
                        const { taskElement } = dropIndicator.elementData;
                        // Move original element to the new destination
                        dropIndicator.parentElement.insertBefore(taskElement, dropIndicator);
                        // Make it available for syncing
                        dropIndicator.parentElement.syncIdMap[taskElement.elementData.taskId] = taskElement;
                        // And unflag it
                        taskElement.classList.remove('b-drag-original');

                        dropIndicator.remove();
                    });

                    client.suspendDomTransition();

                    // Update data
                    if (!invalid) {
                        let newWeight;

                        // Determine new weight
                        if (moveBefore) {
                            const
                                // Successors, that might need to have their weight updated
                                tasksBelow = swimlaneRecords.slice(swimlaneRecords.indexOf(moveBefore)),
                                // Predecessor, we want to squeeze in after it weight-wise
                                taskAbove = swimlaneRecords[swimlaneRecords.indexOf(moveBefore) - 1];

                            let weightDiff;

                            // We have a predecessor, put us between the card we "replace" and it to update as few
                            // weights as possible
                            if (taskAbove) {
                                // Between tasks, down to 1 sized gaps
                                weightDiff = Math.max(1, Math.round((moveBefore.weight - taskAbove.weight) / 2));
                                newWeight = taskAbove.weight + weightDiff;
                            }
                            // First in column, put us between old first task and 0 in weight
                            else {
                                newWeight = Math.max(1, Math.round(moveBefore.weight / 2));
                            }

                            // Update weight for successors that have colliding weights.
                            // New weight will be between current and next, to try and avoid having to change
                            // multiple weights while also leaving gaps for future drops
                            while (tasksBelow[0]?.weight === newWeight) {
                                // Place halfway between this and next task
                                weightDiff = tasksBelow[1]
                                    ? Math.max(1, Math.round((tasksBelow[1].weight - newWeight) / 2))
                                    : 50;
                                newWeight = tasksBelow[0].weight = newWeight + weightDiff;
                                tasksBelow.shift();
                            }
                        }
                        // Last, add 100 to current lasts weight
                        else {
                            newWeight = swimlaneRecords.length
                                ? swimlaneRecords[swimlaneRecords.length - 1].weight + 100
                                : 100;
                        }

                        taskRecords.forEach(taskRecord => {
                            const toSet = {
                                [columnField] : targetColumn.id,
                                weight        : newWeight
                            };

                            if (targetSwimlane) {
                                toSet[swimlaneField] = targetSwimlane.id;
                            }

                            // Optionally reorder the store
                            if (client.features.taskDrag.reorderTaskRecords && moveBefore !== undefined) {
                                taskStore.move(taskRecord, moveBefore);
                            }

                            taskRecord.set(toSet);
                        });

                        // Reapply sorters if we are not reordering tasks and not overriding sort in the store on drop
                        if (!client.features.taskDrag.reorderTaskRecords && !client.taskSorterFn) {
                            client.project.taskStore.sort();
                        }
                    }

                    client.resumeDomTransition();

                    /**
                     * Fires on the owning TaskBoard when tasks are successfully dropped (after the drop transition has
                     * finished)
                     * @event taskDrop
                     * @on-owner
                     * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                     * @param {TaskBoard.model.TaskModel[]} taskRecords Dropped tasks
                     * @param {TaskBoard.model.ColumnModel} targetColumn Dropped on this column
                     * @param {TaskBoard.model.SwimlaneModel} targetSwimlane Dropped in this swimlane (if used)
                     * @param {Event} domEvent The mouse event
                     */
                    client.trigger('taskDrop', { drag, event : domEvent, taskRecords, targetSwimlane, targetColumn, moveBefore, domEvent });

                    /**
                     * Fires on the owning TaskBoard when a previously started drag operation ends, no matter the
                     * outcome of it (whether valid, invalid or aborted)
                     *
                     * @event taskDragEnd
                     * @on-owner
                     * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
                     * @param {TaskBoard.model.TaskModel[]} taskRecords Affected tasks
                     * @param {Event} domEvent The mouse event
                     */
                    client.trigger('taskDragEnd', { drag, taskRecords, domEvent });

                    // Reading element here flushes the recompose
                    client.element.classList.remove('b-dragging-task');

                    // Reset flag after recompose to avoid flicker when virtualizing (to not first render outline)
                    for (const taskRecord of taskRecords) {
                        taskRecord.instanceMeta(client).dragging = false;
                    }

                    resolve();
                }

                // UI part

                const cardClones = Array.from(proxy.children);

                // Ugly "hack" to force the transforms used in the proxy to go away
                proxy.classList.add('b-pre-dropping');
                cardClones[0].offsetWidth;

                // We are dropping, this cls by default has a transition
                proxy.classList.add('b-dropping');

                // Move proxy cards to drop locations, allowing them to transition there
                cardClones.forEach((cardClone, i) => {
                    const dropClone = dropIndicators[i];

                    DomHelper.alignTo(
                        cardClone,
                        // Ignore page scroll when trying to align element in float root to element in taskboard
                        Rectangle.from(dropClone, undefined, true)
                    );
                });

                // Update record after the transition, to prevent too early redraw (which would ruin the transition)
                if (DomHelper.getPropertyTransitionDuration(cardClones[0], 'transform')) {
                    EventHelper.onTransitionEnd({
                        element  : cardClones[0],
                        property : 'transform',
                        handler  : commit,
                        thisObj  : client // For timer cleanup
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
        // Move drop indicator to dragged cards origin, to indicate what will happen on invalid drop
        drag.dropIndicators.forEach(dropIndicator => {
            const { taskElement } = dropIndicator.elementData;
            taskElement.parentElement.insertBefore(dropIndicator, taskElement);
        });
    }

    doAbort(drag) {
        const
            { client }                             = this.owner,
            { dropIndicators, proxy, taskRecords } = drag;

        if (proxy) {
            const cardClones = Array.from(proxy.children);

            function finalizeAbort() {
                // Remove proxy & dropIndicators
                proxy.remove();

                dropIndicators.forEach(dropIndicator => {
                    dropIndicator.elementData.taskElement.classList.remove('b-drag-original');
                    dropIndicator.remove();
                });

                client.element.classList.remove('b-dragging-task');

                // Rest flag late to avoid flicker when virtualizing (to not first render outline)
                for (const taskRecord of taskRecords) {
                    taskRecord.instanceMeta(client).dragging = false;
                }

                client.trigger('taskDragAbortFinalized');
            }

            // Emulate drop to enable transitions
            proxy.classList.add('b-dropping');

            // Move drop indicators to where each task originated
            dropIndicators.forEach(dropIndicator => {
                const { taskElement } = dropIndicator.elementData;

                dropIndicator.classList.remove('b-invalid'); // Looks better this way when returning to origin

                taskElement.parentElement.insertBefore(dropIndicator, taskElement);
            });

            // Move proxy cards to original locations, allowing them to transition there
            cardClones.forEach((cardClone, i) => {
                DomHelper.alignTo(
                    cardClone,
                    // Ignore page scroll when trying to align element in float root to element in taskboard
                    Rectangle.from(dropIndicators[i], undefined, true)
                );
            });

            // Finalize after transition
            if (DomHelper.getPropertyTransitionDuration(cardClones[0], 'transform')) {
                EventHelper.onTransitionEnd({
                    element  : cardClones[0],
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
         * @event taskDragAbort
         * @on-owner
         * @param {TaskBoard.view.TaskBoard} source Owning TaskBoard
         * @param {TaskBoard.model.TaskModel[]} taskRecords Dragged tasks
         */
        client.trigger('taskDragAbort', { drag, taskRecords });

        if (drag.wasStarted) {
            // Documented in dragDrop()
            client.trigger('taskDragEnd', { drag, taskRecords });
        }
    }

    dragEnd(drag) {
        // Move all cards back to their original location when drag was aborted
        // (ignore abort before drag was started, which might occur with touch dragging, since start is delayed)
        if ((drag.started || drag.wasStarted) && (!drag.valid || drag.aborted)) {
            this.doAbort(drag);
        }
    }
}
