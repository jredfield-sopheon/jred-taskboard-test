import Base from '../../../Core/Base.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';

/**
 * @module TaskBoard/view/mixin/ResponsiveCards
 */

/**
 * An object that describes a card size level.
 *
 * @typedef {Object} CardSize
 * @property {String} name Level name, applied to the columns element as CSS class `b-[name]-cards`
 * @property {Number} maxWidth Express in px. This level applies above the previous levels maxWidth and up to this value
 * @property {Number} maxAvatars Max number of resource avatars to render, when that feature is used
 * @property {Object<String,TaskItemOptions>} headerItems A config object for items in a card's header, merges with
 * {@link TaskBoard.view.TaskBoard#config-headerItems} to determine items for this card size
 * @property {Object<String,TaskItemOptions>} bodyItems A config object for items in a card's header, merges with
 * {@link TaskBoard.view.TaskBoard#config-bodyItems} to determine items for this card size
 * @property {Object<String,TaskItemOptions>} footerItems A config object for items in a card's header, merges with
 * {@link TaskBoard.view.TaskBoard#config-footerItems} to determine items for this card size
 */

/**
 * Mixin that allows responsive card behaviours.
 *
 * {@inlineexample TaskBoard/view/mixin/ResponsiveCards.js}
 *
 * It monitors column sizes using a ResizeObserver. When a columns width changes, it calculates the width of the cards
 * in that column based on the columns width and the configured number of tasks per row (see
 * {@link TaskBoard.view.TaskBoard#config-tasksPerRow}).
 *
 * The card width is then used to pick a {@link #config-cardSizes}, which applies CSS and might also affect task items.
 *
 * By default the following levels are defined:
 *
 * | Width | Name   | Cls            | Avatars | Items                       |
 * |-------|--------|----------------|---------|-----------------------------|
 * | < 50  | micro  | b-micro-cards  | 1       | Only resource avatars shown |
 * | < 75  | tiny   | b-tiny-cards   | 1       |                             |
 * | < 175 | small  | b-small-cards  | 1       |                             |
 * | < 300 | medium | b-medium-cards | 3       |                             |
 * | > 300 | large  | b-large-cards  | 7       |                             |
 *
 * If for example cards in a column are above 50px and below 75px wide, that column will have the `b-tiny-cards` CSS
 * class applied to its element. Use it to style the cards in a suitable way for your application, perhaps by applying
 * a smaller font size, hiding images etc.
 *
 * @mixin
 */
export default Target => class ResponsiveCards extends (Target || Base) {

    //region Config

    static $name = 'ResponsiveCards';

    static configurable = {
        /**
         * An array of {@link CardSize} objects to use as responsive levels based on card widths.
         *
         * By default, the following levels are defined:
         *
         * | Width | Name   | Cls            | Avatars | Items                       |
         * |-------|--------|----------------|---------|-----------------------------|
         * | < 50  | micro  | b-micro-cards  | 1       | Only resource avatars shown |
         * | < 75  | tiny   | b-tiny-cards   | 1       | Body text hidden            |
         * | < 175 | small  | b-small-cards  | 2       | Body text hidden            |
         * | < 300 | medium | b-medium-cards | 3       |                             |
         * | > 300 | large  | b-large-cards  | 7       |                             |
         *
         * @config {CardSize}
         * @category Common
         */
        cardSizes : [
            {
                maxWidth    : 50,
                name        : 'micro',
                maxAvatars  : 1,
                headerItems : {
                    text : null
                },
                bodyItems : {
                    text : null
                }
            },
            {
                maxWidth   : 75,
                name       : 'tiny',
                maxAvatars : 1,
                bodyItems  : {
                    text : null
                }
            },
            {
                maxWidth   : 175,
                name       : 'small',
                maxAvatars : 2,
                bodyItems  : {
                    text : null
                }
            },
            { maxWidth : 250, name : 'medium', maxAvatars : 3 },
            { name : 'large', maxAvatars : 7 }
        ],

        resizeObserver : {
            value   : true,
            $config : ['nullify']
        }
    };

    get widgetClass() {}

    //endregion

    //region Type assertions

    changeCardSizes(cardSizes) {
        ObjectHelper.assertArray(cardSizes, 'cardSizes');

        return cardSizes;
    }

    //endregion

    //region Suspend/resume responsiveness

    responsivenessSuspended = 0;

    suspendResponsiveness() {
        this.responsivenessSuspended++;
    }

    resumeResponsiveness() {
        this.responsivenessSuspended--;
    }

    //endregion

    //region Calculate card size

    // Get a card size entity, very similar to a responsive level in Grid
    getCardSize(columnRecord, swimlaneRecord) {
        const
            me            = this,
            { cardSizes } = me,
            perRow        = me.getTasksPerRow(columnRecord, swimlaneRecord),
            columnWidth   = me.getColumnWidth(columnRecord),
            // Three cards on a row shares the column width with 2 gaps.
            // Column padding is not measured and thus not part of calc
            // |               |
            // | █ gap █ gap █ |
            // |               |
            cardWidth     = (columnWidth - me.cardGap * (perRow - 1)) / perRow;



        return cardSizes?.find(size => cardWidth < size.maxWidth) || cardSizes?.[cardSizes.length - 1];
    }

    // Get the last reported width for a column, set by the ResizeObserver
    getColumnWidth(columnRecord) {
        return columnRecord.instanceMeta(this).width;
    }

    // Number of tasks per row to render for the requested column / swimlane intersection.
    // Prio order is columns config, swimlanes config and lastly taskboards config
    getTasksPerRow(columnRecord, swimlaneRecord) {
        return columnRecord.tasksPerRow || swimlaneRecord?.tasksPerRow || this.tasksPerRow;
    }

    //endregion

    //region ResizeObserver

    // ResizeObserver callback for column size changes
    onChildResize(entries) {
        const me = this;

        if (me.recompose.suspended || me.responsivenessSuspended) {
            return;
        }

        // If any columns width changed enough for it to change card size level (medium -> large etc) we need to
        // recompose to allow UI to react
        let shouldRecompose = false;

        for (const entry of entries) {
            const { target, contentRect } = entry;

            // Only care about width
            if (target.observedWidth !== contentRect.width) {
                const
                    columnRecord   = me.resolveColumnRecord(target),
                    // We are observing the headers, but need to calculate card size per column / swimlane intersection
                    columnElements = columnRecord && me.columns.includes(columnRecord) && me.getColumnElements(columnRecord);

                // Bail out when collapsing or hiding the column or if we did not get any record, which can happen
                // during recompose when switching column set
                if (!columnRecord || columnRecord.collapsed || columnRecord.hidden || !columnElements) {
                    return;
                }

                // Cache width on element and column record (for easy lookup later)
                columnRecord.instanceMeta(me).width = target.observedWidth = contentRect.width;

                for (const columnElement of columnElements) {
                    const
                        swimlaneRecord = me.resolveSwimlaneRecord(columnElement),
                        cardSize       = me.getCardSize(columnRecord, swimlaneRecord);

                    // Was the size change enough to take us to a new card size level?
                    if (cardSize && columnElement.elementData.cardSize !== cardSize.name) {
                        shouldRecompose = true;
                    }
                }
            }
        }

        if (shouldRecompose) {
            me.recompose.now();
            me.scrollable.syncOverflowState();
        }
    }

    // ResizeObserver used to monitor column size, observing set up in domSyncCallback
    changeResizeObserver(observer, oldObserver) {
        oldObserver?.disconnect();

        // Resize observer could be set to null for FireFox testing
        return this.isDestroying || !ResizeObserver ? null : new ResizeObserver(this.onChildResize.bind(this));
    }

    //endregion

    //region Rendering

    populateColumn(args) {
        super.populateColumn?.(args);

        const
            { columnRecord, swimlaneRecord, columnConfig } = args,
            // Tag cardSize along with args, to be reachable from renderer
            cardSize = args.cardSize                       = this.getCardSize(columnRecord, swimlaneRecord);

        if (cardSize) {
            columnConfig.class[`b-${cardSize.name}-cards`] = cardSize;
            columnConfig.elementData.cardSize = cardSize.name;
        }
    }

    //endregion

};
