import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/TaskMenuItem
 */

/**
 * Item that adds a `···` button hooked up to display the {@link TaskBoard/feature/TaskMenu} on click.
 *
 * Requires the {@link TaskBoard/feature/TaskMenu} to work as intended.
 *
 * {@inlineexample TaskBoard/view/item/TaskMenuItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype taskMenu
 */
export default class TaskMenuItem extends TaskItem {
    static $name = 'TaskMenuItem';

    static type = 'taskMenu';

    /**
     * @hideconfigs editor
     */

    static defaultEditor = null;

    static render({ taskBoard, domConfig }) {
        if (!taskBoard.features.taskMenu || taskBoard.features.taskMenu.disabled) {
            return false;
        }

        domConfig.tag = 'button';
        domConfig.class['b-icon b-icon-menu-horizontal'] = 1;
    }

    static onClick({ source : taskBoard, event }) {
        taskBoard.features.taskMenu?.showContextMenu(event, { target : event.target });
    }
}

TaskMenuItem.initClass();
