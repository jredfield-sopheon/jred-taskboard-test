import TaskBoard from '../view/TaskBoard.js';
import WidgetTag from '../../Core/customElements/WidgetTag.js';



/**
 * @module TaskBoard/customElements/TaskBoardTag
 */

const keyCaseMap = {
    resourceavatars : 'resourceAvatars',
    taskmenu        : 'taskMenu',
    todolist        : 'todoList'
};

/**
 * Import this file to be able to use the tag &lt;bryntum-taskboard&gt; to create a taskboard.
 *
 * This is more of a proof of concept than a ready to use class. Example:
 *
 * ```html
 * <bryntum-taskboard data-column-field="status">
 *   <column>todo</column>
 *   <column>doing</column>
 *   <column>done</column>
 *   <data>
 *      <task data-id="1" data-name="Cook Hamburgers" data-status="todo"></task>
 *      <task data-id="2" data-name="Make Pasta" data-status="doing"></task>
 *      <task data-id="3" data-name="Bake Pizza" data-status="done"></task>
 *   </data>
 * </bryntum-taskboard>
 * ```
 *
 * To get styling correct, supply the path to the theme you want to use and to the folder that holds Font Awesome:
 *
 * ```html
 * <bryntum-taskboard stylesheet="resources/taskboard.stockholm.css" fa-path="resources/fonts">
 * </bryntum-taskboard>
 * ```
 *
 * Any entries in the tags dataset (attributes starting with `data-`) will be applied as configs of the TaskBoard:
 *
 * ```html
 * <bryntum-taskboard data-column-field="status">
 * </bryntum-taskboard>
 * ```
 *
 * NOTE: Remember to call {@link #function-destroy} before removing this web component from the DOM to avoid memory
 * leaks.
 *
 * @demo TaskBoard/webcomponents
 * @extends Core/customElements/WidgetTag
 */
export default class TaskBoardTag extends WidgetTag {
    createInstance(config) {
        const
            columns     = [],
            swimlanes   = [],
            tasks       = [],
            resources   = [],
            assignments = [],
            headerItems = {},
            bodyItems   = {},
            footerItems = {};

        // Create columns, data and configure features
        for (const tag of this.children) {
            switch (tag.tagName) {
                case 'COLUMN': {
                    columns.push(this.convertDatasetToConfigs(tag.dataset, {
                        text : tag.innerHTML
                    }));
                    break;
                }
                case 'SWIMLANE': {
                    swimlanes.push(this.convertDatasetToConfigs(tag.dataset, {
                        text : tag.innerHTML
                    }));
                    break;
                }
                case 'DATA': {
                    Array.from(tag.children || []).forEach(dataNode => {
                        const cfg = Object.assign({}, dataNode.dataset);

                        switch (dataNode.tagName) {
                            case 'TASK':
                                tasks.push(cfg);
                                break;

                            case 'RESOURCE':
                                resources.push(cfg);
                                break;

                            case 'ASSIGNMENT':
                                assignments.push(cfg);
                                break;

                            default:
                                console.warn('Unknown data type: ' + dataNode.tagName);
                        }
                    });
                    break;
                }
                case 'HEADERITEMS':
                case 'BODYITEMS':
                case 'FOOTERITEMS': {
                    const target = tag.tagName === 'HEADERITEMS' ? headerItems : tag.tagName === 'BODYITEMS' ? bodyItems : footerItems;
                    for (const item of tag.children) {
                        const itemKey = keyCaseMap[item.tagName.toLowerCase()] || item.tagName.toLowerCase();
                        target[itemKey] = this.convertDatasetToConfigs(item.dataset, {});
                    }
                    break;
                }
            }
        }

        return new TaskBoard(Object.assign(config, {
            columns,
            swimlanes,
            headerItems,
            bodyItems,
            footerItems,

            project : {
                tasksData       : tasks,
                resourcesData   : resources,
                assignmentsData : assignments
            }
        }));
    }
}


try {
    globalThis.customElements?.define('bryntum-taskboard', TaskBoardTag);
}
catch (error) {

}
