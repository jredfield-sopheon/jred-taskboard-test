import DomHelper from '../../Core/helper/DomHelper.js';
import DomSync from '../../Core/helper/DomSync.js';
import StringHelper from '../../Core/helper/StringHelper.js';
import Combo from '../../Core/widget/Combo.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';
import AvatarRendering from '../../Core/widget/util/AvatarRendering.js';

/**
 * @module TaskBoard/widget/ResourcesCombo
 */

/**
 * A combo populated with the resources of a {@link TaskBoard.view.TaskBoard taskboard´s}
 * {@link Scheduler.data.ResourceStore resource store}.
 *
 * Used in {@link TaskBoard.widget.TaskEditor} to assign resources to a task. Double-click a task to try it:
 *
 * {@inlineexample TaskBoard/widget/ResourcesCombo.js}
 *
 * @extends Core/widget/Combo
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype resourcescombo
 * @inputfield
 */
export default class ResourcesCombo extends Combo.mixin(TaskBoardLinked) {
    static $name = 'ResourcesCombo';

    static type = 'resourcescombo';

    static configurable = {
        displayField : 'name',
        valueField   : 'id',
        multiSelect  : true,
        editable     : false,

        listItemTpl(resourceRecord) {
            const { avatarRendering, taskBoard } = this.owner;


            return DomHelper.createElement(avatarRendering.getResourceAvatar({
                resourceRecord,
                initials : resourceRecord.initials,
                color    : resourceRecord.color,
                iconCls  : resourceRecord.iconCls,
                imageUrl : resourceRecord.image === false ? null : (resourceRecord.imageUrl || ((taskBoard.resourceImagePath || '') + (resourceRecord.image || '')))
            })).outerHTML + StringHelper.encodeHtml(resourceRecord.name);
        },

        picker : {
            cls : 'b-resources-picker'
        },

        chipView : {
            scrollable : null,

            itemTpl(resourceRecord) {
                const { avatarRendering, taskBoard } = this.owner;


                return DomHelper.createElement(avatarRendering.getResourceAvatar({
                    resourceRecord,
                    initials : resourceRecord.initials,
                    color    : resourceRecord.color,
                    iconCls  : resourceRecord.iconCls,
                    imageUrl : resourceRecord.image === false ? null : (resourceRecord.imageUrl || ((taskBoard.resourceImagePath || '') + (resourceRecord.image || ''))),
                    dataset  : {
                        btip : StringHelper.encodeHtml(resourceRecord.name)
                    }
                })).outerHTML;
            }
        },

        avatarRendering : {
            value   : true,
            $config : 'nullify'
        }
    };

    get innerElements() {
        // See if we have an uningested truthy multiSelect configuration, or we have already set it.
        if (this.peekConfig('multiSelect') || this._multiSelect) {
            return super.innerElements;
        }

        // Add element that we can render an avatar into when not using a chipview
        return [
            { reference : 'avatarContainer' },
            this.inputElement
        ];
    }

    syncInputFieldValue(...args) {
        const me = this;

        // No chipview when not multi selecting, render single avatar
        if (!me.multiSelect) {
            const resourceRecord = me.record;

            if (resourceRecord) {
                DomSync.sync({
                    targetElement : me.avatarContainer,
                    domConfig     : {
                        className : 'b-resourcescombo-avatar-container',
                        children  : [
                            me.avatarRendering.getResourceAvatar({
                                resourceRecord,
                                initials : resourceRecord.initials,
                                color    : resourceRecord.color,
                                iconCls  : resourceRecord.iconCls,
                                imageUrl : resourceRecord.image === false ? null : (resourceRecord.imageUrl || ((me.taskBoard.resourceImagePath || '') + (resourceRecord.image || ''))),
                                dataset  : {
                                    btip : StringHelper.encodeHtml(resourceRecord.name)
                                }
                            })
                        ]
                    }
                });
            }
        }

        super.syncInputFieldValue(...args);
    }

    changeStore() {
        return this.taskBoard.project.resourceStore.chain();
    }

    changeAvatarRendering(value, old) {
        old?.destroy();

        if (value) {
            return new AvatarRendering({
                element : this.element
            });
        }
    }
}

ResourcesCombo.initClass();
