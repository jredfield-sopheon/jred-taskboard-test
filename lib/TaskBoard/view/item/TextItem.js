import TaskItem from './TaskItem.js';

/**
 * @module TaskBoard/view/item/TextItem
 */

/**
 * Item that displays the value of the configured {@link #config-field} in a XSS safe way.
 *
 * {@inlineexample TaskBoard/view/item/TextItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype text
 */
export default class TextItem extends TaskItem {
    static $name = 'TextItem';

    static type = 'text';

    static render({ domConfig, value, taskRecord, config }) {
        // Special handling when bound to id
        if (config.field === 'id' && taskRecord.hasGeneratedId) {
            domConfig.class['b-generated-id'] = 1;
            domConfig.text = '✻';
        }
        else {
            domConfig.text = taskRecord.getFieldDefinition(config.field).print(value);
        }
    }
}

TextItem.initClass();
