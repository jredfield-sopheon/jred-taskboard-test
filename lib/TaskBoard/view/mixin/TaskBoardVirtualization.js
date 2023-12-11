import Base from '../../../Core/Base.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardVirtualization
 */

/**
 * Mixin that handles partial virtualization for the TaskBoard.
 * See class docs for {@link TaskBoard/view/TaskBoard} for more information.
 *
 * @mixin
 */
export default Target => class TaskBoardVirtualization extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardVirtualization';

    static configurable = {
        /**
         * The function is called for each task as part of the render loop, and is expected to return the height in
         * pixels for the task. Using this function is only recommended when using partial virtualized rendering, see
         * the {@link #config-virtualize} setting.
         *
         * How the height is determined is up to the application, it could for example return a fixed value:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *     getTaskHeight() {
         *         return 150;
         *     }
         * }
         * ```
         *
         * Or get the height from data:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *     getTaskHeight(taskRecord) {
         *         return taskRecord.myTaskHeight;
         *     }
         * }
         * ```
         *
         * Or use some custom application logic:
         *
         * ```javascript
         * taskBoard = new TaskBoard({
         *     getTaskHeight(taskRecord) {
         *         if (taskRecord.isCollapsed) {
         *             return 20;
         *         }
         *
         *         return taskRecord.myTaskHeight;
         *     }
         * }
         * ```
         *
         * @prp {Function}
         * @param {TaskBoard.model.TaskModel} taskRecord The task record
         * @return {Number} The height of the task in pixels
         * @category Advanced
         */
        getTaskHeight : null,

        /**
         * By turning on this setting you enable partial virtualized rendering for the board, which reduces initial
         * rendering time and makes interaction less sluggish when using thousands of tasks. The tradeoff is that
         * scrolling in most cases will be slower.
         *
         * For a nice UX, it is strongly recommended to also implement a {@link #config-getTaskHeight} function. Without
         * it, the height of tasks out of view will be unknown and the behaviour when scrolling will be less than ideal.
         *
         * <div class="note">Note that for normal datasets (depending on machine, but roughly <1000 tasks) performance
         * might be better without partial virtualized rendering, since it adds some overhead.</div>
         *
         * <div class="note">Also note that as part of the optimizations for partial virtualized rendering, the inner
         * element in columns that contain cards is absolutely positioned. This leads to column not being able to
         * automatically shrink wrap the cards, you will have to set a height on the swimlane (or task board if not
         * using swimlanes) to size things correctly.</div>
         *
         * @prp {Boolean}
         */
        virtualize : {
            value   : null,
            $config : 'nullify'
        },

        /**
         * Whether to draw cards on scroll, or only when scrolling ends.
         *
         * Only applies when using partial virtualized rendering (see {@link #config-getTaskHeight}).
         *
         * Setting this to `false` will boost scroll performance, but cards scrolled into view will be empty outlines
         * until scrolling ends.
         *
         * @prp {Boolean}
         */
        drawOnScroll : true
    };

    get widgetClass() {}

    //endregion

    //region Type assertions and changers/updaters

    changeVirtualize(virtualize) {
        ObjectHelper.assertBoolean(virtualize, 'virtualize');

        return virtualize;
    }

    updateVirtualize(virtualize) {
        const me = this;

        me.cardIntersectionObserver?.disconnect();
        me.cardIntersectionObserver = null;

        if (virtualize) {
            // Observes cards coming into / out of view.
            // Elements to observe are added from TaskBoardDomEvents#domSyncCallback
            me.cardIntersectionObserver = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    me.onCardIntersection(entry.target, entry.isIntersecting, entry);
                }
            });
        }

        // Allow toggling at runtime (mainly for bigdataset demo)
        if (!this.isConfiguring && !this.isDestroying) {
            this.refreshVirtualizedCards();
        }
    }

    refreshVirtualizedCards() {
        const me = this;

        me.recompose.now();

        if (me.cardIntersectionObserver) {
            for (const taskElement of me.element.querySelectorAll('.b-taskboard-card')) {
                me.cardIntersectionObserver.observe(taskElement);
            }
        }
    }

    changeGetTaskHeight(getTaskHeight) {
        getTaskHeight && ObjectHelper.assertFunction(getTaskHeight, 'getTaskHeight');

        return getTaskHeight;
    }

    updateGetTaskHeight(fn) {
        // Allow toggling at runtime (mainly for bigdataset demo)
        if (!this.isConfiguring && !this.isDestroying) {
            this.refreshVirtualizedCards();
        }
    }

    //endregion

    compose(domConfig) {
        domConfig.class['b-virtualized'] = this.isVirtualized;

        return super.compose(domConfig);
    }

    get isVirtualized() {
        return Boolean(this.cardIntersectionObserver);
    }

    // Flag cards as in view or out of view when their elements are intersecting the viewport (or not anymore)
    onCardIntersection(cardElement, isIntersecting, entry) {
        const
            me              = this,
            { taskRecord }  = cardElement.elementData,
            instanceMeta    = taskRecord.instanceMeta(me),
            wasIntersecting = instanceMeta.intersects;

        if (wasIntersecting !== isIntersecting) {
            instanceMeta.intersects = isIntersecting;
            if (!isIntersecting && wasIntersecting) {
                instanceMeta.lastHeight = entry.boundingClientRect.height;
            }
            // Recompose affected column right away if not scrolling, or if configured to draw on scroll
            if (!me.isScrolling || me.drawOnScroll) {
                me.queueColumnRecompose(me.getColumn(taskRecord), me.getSwimlane(taskRecord));
            }

            // Always do a full recompose when scrolling ends, to have all lastDomConfigs up to date
            if (me.isScrolling) {
                me.recomposeOnScrollEnd = true;
            }
        }
    }

    //region Rendering

    // Creates a DOM config for the outline of a single card
    renderCardOutline(taskRecord, columnRecord, swimlaneRecord) {
        const
            me                    = this,
            { id, domId, weight } = taskRecord;

        return {
            id    : `${me.id}-card-${domId}`,
            class : {
                'b-taskboard-card' : true,
                'b-out-of-view'    : true
            },
            tabIndex : 0,
            dataset  : {
                task          : domId,
                column        : columnRecord.id,
                lane          : swimlaneRecord?.id,
                weight,
                domTransition : true
            },
            elementData : {
                elementType : 'task',
                taskId      : id,
                taskRecord,
                columnRecord,
                swimlaneRecord
            },
            style : {
                height : me.getTaskHeight?.(taskRecord) || taskRecord.instanceMeta(me).lastHeight
            }
        };
    }

    // Overrides renderCard in TaskBoardBase, rendering outlines for cards out of view
    renderCard(taskRecord, columnRecord, swimlaneRecord) {
        const
            { isVirtualized } = this,
            meta              = taskRecord.instanceMeta(this);

        // Render outlines for cards out of view when using virtualization
        if (isVirtualized && !meta.dragging && !meta.intersects && !this.isSelected(taskRecord)) {
            return this.renderCardOutline(taskRecord, columnRecord, swimlaneRecord);
        }
    }

    //endregion
};
