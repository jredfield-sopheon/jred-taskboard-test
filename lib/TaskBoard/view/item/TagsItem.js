import TaskItem from './TaskItem.js';
import DomHelper from '../../../Core/helper/DomHelper.js';
import '../../widget/TagCombo.js';

/**
 * @module TaskBoard/view/item/TagsItem
 */

/**
 * Item displaying tags, either from string split into tags, an array of strings or by plucking a value from an array of
 * objects.
 *
 * Using a string, split into tags using the configured {@link #config-separator}:
 *
 * {@inlineexample TaskBoard/view/item/TagsItem.js}
 *
 * Using an array of strings, each entry is turned into a tag:
 *
 * {@inlineexample TaskBoard/view/item/TagsItemStringArray.js}
 *
 * Using an array of objects, gives you the most control over the tags. Requires configuring a
 * {@link #config-textProperty} and optionally a {@link #config-clsProperty}:
 *
 * {@inlineexample TaskBoard/view/item/TagsItemObjectArray.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype tags
 */
export default class TagsItem extends TaskItem {
    static $name = 'TagsItem';

    static type = 'tags';

    /**
     * Property used to determine the text for the tag. It is plucked from an array of objects that is used as the value
     * for this item.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *       tags : { type : 'TagsItem', textProperty : 'title' }
     *    },
     *
     *    project : {
     *        tasksData : [{
     *            id : 1,
     *            name : 'Issue #1',
     *            tags : [
     *                { title : 'bug', color : 'orange' },
     *                { title : 'important', color : 'red' }
     *            ]
     *        }]
     *    }
     * });
     *
     * // Card for Issue #1 will render 2 tags, 'bug' and 'important'
     * ```
     *
     * @config {String} textProperty
     * @category Common
     */

    /**
     * Property used to add a CSS class to each tag. It is plucked from an array of objects that is used as the value
     * for this item.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *       tags : { type : 'TagsItem', clsProperty : 'color' }
     *    },
     *
     *    project : {
     *        tasksData : [{
     *            id : 1,
     *            name : 'Issue #1',
     *            tags : [
     *                { title : 'bug', color : 'orange' },
     *                { title : 'important', color : 'red' }
     *            ]
     *        }]
     *    }
     * });
     *
     * // Card for Issue #1 will render 2 tags, one with cls 'orange' and one with cls 'red'
     * ```
     *
     * @config {String} clsProperty
     * @category Common
     */

    /**
     * Property used to split a value string into tags.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *    bodyItems : {
     *       tags : { type : 'TagsItem', separator : ';' }
     *    },
     *
     *    project : {
     *        tasksData : [{
     *            id : 1,
     *            name : 'Issue #1',
     *            tags : 'bug;important'
     *        }]
     *    }
     * });
     *
     * // Card for Issue #1 will render 2 tags, 'bug' and 'important'
     * ```
     *
     * @config {String} separator
     * @default ,
     * @category Common
     */

    /**
     * Widget type or config to use as the editor for this item. Used in the inline task editor.
     *
     * Defaults to use a {@link TaskBoard.widget.TagCombo}.
     *
     * @config {String|Object} editor
     * @default tagcombo
     * @category Common
     */
    static defaultEditor = { type : 'tagcombo', pickerWidth : '10em' };

    static render({ domConfig, value, config }) {
        let tags;

        if (value) {
            if (typeof value === 'string') {
                tags = value.split(config.separator || ',').map(str => ({ text : str }));
            }
            else if (Array.isArray(value)) {
                tags = value.map(entry => {
                    if (typeof entry === 'string') {
                        return { text : entry };
                    }
                    else {
                        return {
                            text : config.textProperty && entry[config.textProperty],
                            cls  : config.clsProperty && entry[config.clsProperty]
                        };
                    }
                });
            }

            if (tags) {
                domConfig.children = tags.map(tag => {
                    const cls = ('cls' in tag) ? tag.cls : DomHelper.makeValidId(tag.text, '-').toLowerCase();
                    return {
                        class : {
                            'b-taskboard-tags-tag' : 1,
                            [cls]                  : Boolean(cls)
                        },
                        text : tag.text
                    };
                });
            }
        }
    }
}

TagsItem.initClass();
