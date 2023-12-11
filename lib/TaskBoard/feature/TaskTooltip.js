import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import StringHelper from '../../Core/helper/StringHelper.js';
import Tooltip from '../../Core/widget/Tooltip.js';
import TaskBoardFeature from './TaskBoardFeature.js';

/**
 * @module TaskBoard/feature/TaskTooltip
 */

/**
 * Displays a tooltip when hovering a task. By default the tooltip displays:
 *
 * * task name
 * * task column
 * * task swimlane (if using swimlanes)
 * * names of assigned resources (if any)
 *
 * {@inlineexample TaskBoard/feature/TaskTooltip.js}
 *
 * To customize the contents, supply your own {@link #config-template}:
 *
 * {@inlineexample TaskBoard/feature/TaskTooltipTemplate.js}
 *
 * This feature is **disabled** by default.
 *
 * @extends TaskBoard/feature/TaskBoardFeature
 * @uninherit Core/Base
 * @uninherit Core/localization/Localizable
 * @classtype taskTooltip
 * @feature
 */
export default class TaskTooltip extends TaskBoardFeature {

    static $name = 'TaskTooltip';

    static type = 'taskTooltip';

    static configurable = {
        /**
         * Tooltip config object used to override the defaults, see {@link Core.widget.Tooltip#configs} for available
         * configs.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     features : {
         *         taskTooltip : {
         *             tooltip : {
         *                 hoverDelay : 100,
         *                 hideDelay  : 500
         *             }
         *         }
         *     }
         * });
         * ```
         *
         * @config {TooltipConfig}
         */
        tooltip : {
            value : {},

            // Lazy, pulled in on render to have element available
            $config : ['lazy', 'nullify']
        },

        /**
         * Function used to populate the tooltip, supply your own to override the default contents of the tooltip.
         *
         * ```javascript
         * const taskBoard = new TaskBoard({
         *     features : {
         *         taskTooltip : {
         *             template({ taskRecord }) {
         *                 return `<b>${taskRecord.name}</b>`
         *             }
         *         }
         *     }
         * });
         * ```
         *
         * @param {Object} tipData
         * @param {TaskBoard.model.TaskModel} tipData.taskRecord Hovered task
         * @param {TaskBoard.model.ColumnModel} tipData.columnRecord The task's column
         * @param {TaskBoard.model.SwimlaneModel} tipData.swimlaneRecord The task's swimlane (if used)
         * @returns {String|DomConfig} Return an HTML string or a DOM config object
         * @config {Function}
         */
        template : null
    };

    static pluginConfig = {
        chain : ['render']
    };

    //region Type assertions

    changeTemplate(template) {
        ObjectHelper.assertFunction(template, 'features.taskTooltip.template');

        return template;
    }

    //endregion

    doDisable(disable) {
        super.doDisable(disable);

        if (this._tooltip) {
            this.tooltip.disabled = disable;
        }
    }

    changeTooltip(tooltip, oldTooltip) {
        const
            me         = this,
            { client } = me;

        ObjectHelper.assertObject(tooltip, 'features.taskTooltip.tooltip');

        oldTooltip?.destroy();

        if (tooltip) {

            return new Tooltip(ObjectHelper.assign({
                axisLock       : 'flexible',
                cls            : 'b-taskboard-tooltip',
                forSelector    : '.b-taskboardbase:not(.b-draghelper-active) .b-taskboard-card',
                scrollAction   : 'realign',
                forElement     : client.element,
                showOnHover    : true,
                hoverDelay     : 0,
                hideDelay      : 100,
                anchorToTarget : true,
                allowOver      : Boolean(me.config.items || me.config.tools),
                getHtml        : me.getTipHtml.bind(me),
                disabled       : me.disabled,
                textContent    : false
            }, tooltip));
        }
    }

    getTipHtml({ tip, activeTarget }) {
        const
            { client }     = this,
            taskRecord     = client.resolveTaskRecord(activeTarget),
            columnRecord   = client.resolveColumnRecord(activeTarget),
            swimlaneRecord = client.resolveSwimlaneRecord(activeTarget);

        if (this.template) {
            return this.template({ tip, taskRecord, columnRecord, swimlaneRecord, activeTarget });
        }

        const children = [
            {
                class : 'b-taskboard-tooltip-title',
                text  : taskRecord.name
            },
            {
                class : 'b-taskboard-tooltip-label',
                text  : StringHelper.capitalize(client.columnField)
            },
            {
                class : 'b-taskboard-tooltip-value',
                text  : columnRecord.text
            }
        ];

        if (swimlaneRecord) {
            children.push(
                {
                    class : 'b-taskboard-tooltip-label',
                    text  : StringHelper.capitalize(client.swimlaneField)
                },
                {
                    class : 'b-taskboard-tooltip-value',
                    text  : swimlaneRecord.text
                }
            );
        }

        if (taskRecord.resources.length) {
            children.push(
                {
                    class : 'b-taskboard-tooltip-label',
                    text  : this.L('L{TaskBoard.resources}')
                },
                {
                    class : 'b-taskboard-tooltip-value',
                    text  : taskRecord.resources.map(resourceRecord => resourceRecord.name).join(', ')
                }
            );
        }

        return {
            children
        };
    }

    render() {
        // Element is now available, pull in tooltip to have it correctly wired up
        this.getConfig('tooltip');
    }
}

TaskTooltip.initClass();
