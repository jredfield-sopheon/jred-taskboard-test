import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/SeparatorItem
 */

/**
 * Item displaying a horizontal divider.
 *
 * {@inlineexample TaskBoard/view/item/SeparatorItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype separator
 */
export default class SeparatorItem extends TaskItem {
    static $name = 'SeparatorItem';

    static type = 'separator';

    /**
     * @hideconfigs editor
     */

    static defaultEditor = null;

    static render({ domConfig }) {
        domConfig.tag = 'hr';
    }
}

SeparatorItem.initClass();
