import TaskItem from './TaskItem.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import StringHelper from '../../../Core/helper/StringHelper.js';
import AvatarRendering from '../../../Core/widget/util/AvatarRendering.js';

/**
 * @module TaskBoard/view/item/ResourceAvatarsItem
 */

/**
 * Item displaying avatars or initials for a tasks assigned resources.
 *
 * {@inlineexample TaskBoard/view/item/ResourceAvatarsItem.js}
 *
 * @extends TaskBoard/view/item/TaskItem
 * @classtype resourceAvatars
 */
export default class ResourceAvatarsItem extends TaskItem {
    static $name = 'ResourceAvatarsItem';

    static type = 'resourceAvatars';

    /**
     * Maximum avatars to display by default. The last avatar will render an overflow indicator if the task has more
     * resources assigned.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     headerItems : {
     *         resources : {
     *             type       : 'resourceAvatars',
     *             maxAvatars : 5
     *         }
     *     }
     * });
     * ```
     *
     * Overridden by card size based settings, see {@link TaskBoard.view.mixin.ResponsiveCards}.
     *
     * @config {Number} maxAvatars
     * @default 7
     * @category Common
     */

    /**
     * Specify `true` to slightly overlap avatars for tasks that have multiple resources assigned. By default, they are
     * displayed side by side.
     *
     * ```javascript
     * const taskBoard = new TaskBoard({
     *     headerItems : {
     *         resources : {
     *             overlap : true
     *         }
     *     }
     * });
     * ```
     *
     * @config {Boolean} overlap
     */

    /**
     * Widget type or config to use as the editor for this item. Used in the inline task editor.
     *
     * Defaults to use a {@link TaskBoard.widget.ResourcesCombo}.
     *
     * @config {String|Object} editor
     * @default resourcescombo
     * @category Common
     */
    static defaultEditor = { type : 'resourcescombo', pickerWidth : '13em' };

    static render({ taskBoard, domConfig, config, taskRecord, cardSize }) {
        const
            maxAvatars            = cardSize?.maxAvatars ?? config.maxAvatars ?? 7,
            { resourceImagePath } = taskBoard,
            { resources }         = taskRecord,
            hasOverflow           = resources.length > maxAvatars,
            overflowCount         = resources.length - maxAvatars + 1,
            lastResource          = resources[maxAvatars];

        let { avatarRendering } = taskBoard;

        if (!avatarRendering) {
            avatarRendering = taskBoard.avatarRendering = new AvatarRendering({
                element     : taskBoard.element,
                colorPrefix : 'b-taskboard-background-color-'
            });
        }

        if (!taskBoard.project.resourceStore.count) {
            return false;
        }

        ObjectHelper.merge(domConfig, {
            class : {
                'b-overlap' : config.overlap
            },
            children : [
                // "Normal" avatars
                ...resources
                    // Want a stable order for resource to not move around on changes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(0, maxAvatars - (hasOverflow ? 1 : 0)) // -1 for the overflow indicator
                    .map((resource, i) => ({
                        class : {
                            'b-taskboard-resource-avatar-wrap' : 1
                        },
                        dataset : {
                            resourceId : resource.id
                        },
                        children : [
                            avatarRendering.getResourceAvatar({
                                resourceRecord : resource,
                                imageUrl       : resource.image === false ? null : (resource.imageUrl || resource.image && ((resourceImagePath || '') + resource.image)),
                                initials       : resource.initials,
                                color          : resource.eventColor,
                                dataset        : {
                                    btip : StringHelper.encodeHtml(resource.name)
                                }
                            })
                        ]
                    })),
                // Overflow indicating avatar
                hasOverflow && {
                    class : {
                        'b-taskboard-resource-avatar-overflow' : 1
                    },
                    dataset : {
                        resourceId : '$overflow',
                        btip       : resources.slice(-overflowCount).map(r => StringHelper.encodeHtml(r.name)).join(', '),
                        count      : overflowCount
                    },
                    children : [
                        avatarRendering.getResourceAvatar({
                            resourceRecord : lastResource,
                            imageUrl       : lastResource.image === false ? null : (lastResource.imageUrl || lastResource.image && (resourceImagePath + lastResource.image)),
                            initials       : lastResource.initials
                        })
                    ]
                }
            ],
            syncOptions : {
                syncIdField : 'resourceId'
            }
        });
    }

    static onClick({ source : taskBoard, taskRecord, event }) {
        const element = event.target.closest('.b-resource-avatar, .b-taskboard-resource-avatar-overflow');

        if (element) {
            if (element.matches('.b-resource-avatar')) {
                const resourceRecord = taskBoard.project.resourceStore.getById(element.dataset.resourceId);
                taskBoard.trigger('resourceAvatarClick', { resourceRecord, taskRecord, element, event });
            }
            else {
                taskBoard.trigger('resourceAvatarOverflowClick', { taskRecord, element, event });
            }

            return false;
        }
    }
}

ResourceAvatarsItem.initClass();
