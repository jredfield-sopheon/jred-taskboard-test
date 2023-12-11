import Base from '../../../Core/Base.js';
import StringHelper from '../../../Core/helper/StringHelper.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardDomEvents
 */

/**
 * Mixin that handles dom events (click etc) for the TaskBoard and its columns and cards.
 *
 * {@inlineexample TaskBoard/view/mixin/TaskBoardDomEvents.js}
 *
 * Snippet showing two ways to add listeners:
 *
 * ```javascript
 * // Listener defined as part of config
 * const taskBoard = new TaskBoard({
 *     listeners : {
 *        taskClick({ taskRecord }) {
 *            Toast.show(`Clicked on ${taskRecord.name}`);
 *        }
 *     }
 * });
 *
 * // Listener added at runtime
 * taskBoard.on('taskDblClick', ({ taskRecord }) => { ... });
 * ```
 *
 * @mixin
 */
export default Target => class TaskBoardDomEvents extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardDomEvents';

    static configurable = {
        /**
         * The name of the event that should activate a task and trigger editing (if an editing feature is active).
         * Available options are: 'taskClick', 'taskDblClick' or null (disable)
         * @default
         * @config {'taskClick'|'taskDblClick'|null}
         * @category Advanced
         */
        activateTaskEvent : 'taskDblClick',

        domEvents : {
            click       : 'click',
            dblclick    : 'dblClick',
            mouseup     : 'mouseUp',
            mousedown   : 'mouseDown',
            mousemove   : 'mouseMove',
            mouseover   : 'mouseOver',
            mouseout    : 'mouseOut',
            keydown     : 'keyDown',
            contextmenu : 'contextMenu'
        },

        domListeners : {}
    };

    #hoveredCardElement = null;

    get widgetClass() {}

    //endregion

    //region Events

    /**
     * Triggered when a card is clicked.
     *
     * ```javascript
     * taskBoard.on('taskClick', ({ taskRecord }) => {
     *    Toast.show(`Clicked on ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */

    /**
     * Triggered when a card is double clicked
     *
     * ```javascript
     * taskBoard.on('taskDblClick', ({ taskRecord }) => {
     *    Toast.show(`Double clicked on ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskDblClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */

    /**
     * Triggered when the mouse enters a card
     *
     * ```javascript
     * taskBoard.on('taskMouseEnter', ({ taskRecord }) => {
     *    Toast.show(`Mouse entered ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskMouseEnter
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */

    /**
     * Triggered when the mouse leaves a card
     *
     * ```javascript
     * taskBoard.on('taskMouseLeave', ({ taskRecord }) => {
     *    Toast.show(`Mouse left ${taskRecord.name}`);
     * });
     * ```
     *
     * @event taskMouseLeave
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {TaskBoard.model.ColumnModel} columnRecord Column record for the tasks column
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record for the tasks swimlane (if used)
     * @param {MouseEvent} event Browser event
     */

    /**
     * Triggered when a task is "activated" by pressing `Enter` or double clicking it.
     *
     * By default this leads to the task editor being shown.
     *
     * ```javascript
     * taskBoard.on('activateTask', ({ taskRecord }) => {
     *    Toast.show(`Activated ${taskRecord.name}`);
     * });
     * ```
     *
     * @event activateTask
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.TaskModel} taskRecord Task record
     * @param {MouseEvent} event Browser event
     */

    /**
     * Triggered when a task is rendered.
     *
     * This happens on initial render, when a task is added or when the task element is updated.
     *
     * Listening to this event allows you to manipulate the tasks element directly after it has been updated. Please
     * note that we strongly recommend using a `taskRenderer` to manipulate the DomConfig used to update the task for
     * most scenarios.
     *
     * If you listen for this event and manipulate the element in some way, you should also listen for
     * `removeTaskElement` and revert/clean up the changes there.
     *
     * @event renderTask
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {TaskBoard.model.TaskModel} taskRecord Task being rendered
     * @param {Boolean} isRefresh `true` if the element was updated, `false` if it was added
     * @param {HTMLElement} element Tasks element
     */

    /**
     * Triggered when all tasks in the task board are rendered
     * @event renderTasks
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {TaskBoard.model.TaskModel[]} taskRecords Tasks being rendered
     */

    /**
     * Triggered when a tasks element is removed.
     *
     * This happens when a task is removed or when it is move to another swimlane / column (in which case a `renderTask`
     * event is triggered for the new element).
     *
     * If you used listener for `renderTask` to alter the element of tasks, you should also listen for this event to
     * clean that modification up.
     *
     * @event removeTaskElement
     * @param {TaskBoard.view.TaskBoard} source TaskBoard instance
     * @param {String|Number} taskId Id of the task (not the record itself since it might be removed)
     * @param {HTMLElement} element Tasks element
     */

    /**
     * Triggered when a swimlane header is clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderClick', ({ swimlaneRecord }) => {
     *    Toast.show(`Clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a swimlane header is double-clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderDblClick', ({ swimlaneRecord }) => {
     *    Toast.show(`Double-clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderDblClick
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    /**
     * Triggered when a swimlane header is right-clicked.
     *
     * ```javascript
     * taskBoard.on('swimlaneHeaderContextMenu', ({ swimlaneRecord }) => {
     *    Toast.show(`Right-clicked on ${swimlaneRecord.text}`);
     * });
     * ```
     *
     * @event swimlaneHeaderContextMenu
     * @param {TaskBoard.view.TaskBoard} source This TaskBoard
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord Swimlane record
     * @param {MouseEvent} event Browser event
     */
    //endregion

    //region Triggering

    // Sets the domListeners up, all relayed to triggerDomEvent()
    changeDomListeners(domListeners) {
        if (domListeners) {
            for (const eventName in this.domEvents) {
                domListeners[eventName] = 'triggerDomEvent';
            }
        }

        return domListeners;
    }

    // Resolve records from the passed event
    resolveEvent(event) {
        const
            { target }     = event,
            taskRecord     = this.resolveTaskRecord(target),
            columnRecord   = this.resolveColumnRecord(target),
            swimlaneRecord = this.resolveSwimlaneRecord(target);

        return { taskRecord, columnRecord, swimlaneRecord, event };
    }

    // "Re-trigger" a dom event as one of ours, populated with records and prefixed with either 'task'  or 'column'
    // depending on event target
    triggerDomEvent(event) {
        const
            me         = this,
            args       = me.resolveEvent(event),
            name       = me.domEvents[event.type],
            { target } = event;

        // Bail out for fields on a card, or if we are scrolling (_element to not trigger a recompose)
        if (me.isScrolling || target.closest('.b-widget') !== me._element) {
            return;
        }

        // Decorate the event for easy access later
        event.taskBoardData = args;

        let result;

        // Trigger taskDblClick or columnDblClick, depending on what was resolved
        if (args.taskRecord) {
            const eventName = `task${StringHelper.capitalize(name)}`;

            result = me.trigger(eventName, args);

            if (eventName === me.activateTaskEvent && !event.defaultPrevented) {
                me.trigger('activateTask', { taskRecord : args.taskRecord, event });
            }
        }
        else if (args.columnRecord) {
            if (target.closest('.b-taskboard-column-header')) {
                result = me.trigger(`columnHeader${StringHelper.capitalize(name)}`, args);
            }
            else {
                result = me.trigger(`column${StringHelper.capitalize(name)}`, args);
            }
        }
        else if (args.swimlaneRecord) {
            if (target.closest('.b-taskboard-swimlane-header')) {
                result = me.trigger(`swimlaneHeader${StringHelper.capitalize(name)}`, args);
            }
            else {
                result = me.trigger(`swimlane${StringHelper.capitalize(name)}`, args);
            }
        }

        // Allow returning false from taskClick, onTaskClick etc. to prevent triggering 'click'
        if (result === false) {
            return;
        }

        me.trigger(name, args);

        // Conjure up mouseEnter and mouseLeave events from mouseOver/mouseOut
        if ((name === 'mouseOver' || name === 'mouseOut') && args.taskRecord) {
            const cardElement = target.closest('.b-taskboard-card');

            if (name === 'mouseOver' && cardElement !== me.#hoveredCardElement) {
                me.#hoveredCardElement = cardElement;

                me.trigger('taskMouseEnter', args);
            }

            if (name === 'mouseOut' && !cardElement.contains(event.relatedTarget)) {
                me.#hoveredCardElement = null;

                me.trigger('taskMouseLeave', args);
            }
        }
    }

    // Called as DomSync syncs elements
    domSyncCallback({ action, domConfig, lastDomConfig, targetElement : element, syncId, jsx }) {
        const
            me              = this,
            { elementType } = domConfig?.elementData ?? {},
            isRefresh       = action === 'reuseOwnElement',
            { reactComponent } = this;

        if (jsx && this.processTaskItemContent) {
            this.processTaskItemContent({
                jsx,
                targetElement : element,
                reactComponent,
                domConfig
            });
            return;
        }

        // Safeguard against other non dom synced elements being cleaned up
        if (domConfig) {
            // Card element synced
            if (elementType === 'task') {
                const
                    { taskId } = domConfig.elementData,
                    taskRecord = me.project.taskStore.getById(taskId);

                if (action === 'newElement') {
                    me.cardIntersectionObserver?.observe(element);
                }

                if (action === 'newElement' || action === 'reuseOwnElement') {
                    (!me.isVirtualized || taskRecord.instanceMeta(me).intersects) && me.trigger('renderTask', { taskRecord, element, isRefresh });
                }
                else if (action === 'removeElement') {
                    me.cardIntersectionObserver?.unobserve(element);
                    me.trigger('removeTaskElement', { taskId, element });
                }
            }

            // Column
            else if (elementType === 'column') {
                const
                    { columnId, laneId } = domConfig.elementData,
                    columnRecord         = me.columns.getById(columnId),
                    swimlaneRecord       = laneId != null && me.swimlanes?.getById(laneId);

                if (action === 'newElement' || action === 'reuseOwnElement') {
                    me.trigger('renderColumn', { columnRecord, swimlaneRecord, element, isRefresh });
                }
                else if (action === 'removeElement') {
                    me.trigger('removeColumnElement', { columnId, swimlaneRecord, element });
                }
            }

            // Swimlane
            else if (elementType === 'swimlane') {
                const
                    { laneId }     = domConfig.elementData,
                    swimlaneRecord = laneId != null && laneId !== 'default' && me.swimlanes?.getById(laneId);

                // Using swimlanes is optional
                if (laneId !== 'default') {
                    if (action === 'newElement' || action === 'reuseOwnElement') {
                        me.trigger('renderSwimlane', { swimlaneRecord, element, isRefresh });
                    }
                    else if (action === 'removeElement') {
                        me.trigger('removeSwimlaneElement', { swimlaneId : laneId, element });
                    }
                }
            }

            // Column header padder, for resize monitoring
            else if (domConfig.class?.['b-taskboard-column-header-padder'] && me.resizeObserver) {
                if (action === 'newElement') {
                    if (!element.isResizeObserved) {
                        me.resizeObserver.observe(element);
                        element.isResizeObserved = true;
                    }
                }

                if (action === 'removeElement') {
                    if (element.isResizeObserved) {
                        me.resizeObserver.unobserve(element);
                        delete element.isResizeObserved;
                    }
                }
            }

        }
    }

    //endregion

    //region Chainable handlers

    onClick() {}

    onMouseMove() {}

    onMouseUp() {}

    onTaskMouseDown() {}

    onTaskClick() {}

    onTaskDblClick() {}

    onTaskContextMenu() {}

    onColumnMouseDown() {}

    onColumnHeaderClick(...args) {
        super.onColumnHeaderClick(...args);
    }

    onSwimlaneHeaderClick(...args) {
        super.onSwimlaneHeaderClick(...args);
    }

    onActivateTask() {}

    //endregion

};
