import VersionHelper from '../../../Core/helper/VersionHelper.js';

/**
 * @module Scheduler/model/mixin/ResourceModelMixin
 */

/**
 * Config object used to set different values for top/left and bottom/right margin.
 *
 * @typedef {Object} ResourceMarginConfig
 * @property {Number} start Margin top in horizontal mode, margin left in vertical mode
 * @property {Number} end Margin bottom in horizontal mode, margin right in vertical mode
*/

/**
 * Mixin that holds configuration shared between resources in Scheduler and Scheduler Pro.
 * @mixin
 */
export default Target => class ResourceModelMixin extends Target {
    static get $name() {
        return 'ResourceModelMixin';
    }

    // Flag checked by ResourceStore to make sure it uses a valid subclass
    static get isResourceModel() {
        return true;
    }

    /**
     * Set value for the specified field(s), triggering engine calculations immediately. See
     * {@link Core.data.Model#function-set Model#set()} for arguments.
     *
     * This does not matter much on the resource itself, but is of importance when manipulating its references:
     *
     * ```javascript
     * assignment.set('resourceId', 2);
     * // resource.assignments is not yet up to date
     *
     * await assignment.setAsync('resourceId', 2);
     * // resource.assignments is up to date
     * ```
     *
     * @param {String|Object} field The field to set value for, or an object with multiple values to set in one call
     * @param {*} [value] Value to set
     * @param {Boolean} [silent=false] Set to true to not trigger events
     * automatically.
     * @function setAsync
     * @category Editing
     * @async
     */

    //region Fields

    static get fields() {
        return [
            /**
             * Unique identifier
             * @field {String|Number} id
             * @category Common
             */

            /**
             * Get or set resource name
             * @field {String} name
             * @category Common
             */
            { name : 'name', type : 'string', persist : true },

            /**
             * Controls the primary color used for events assigned to this resource. Can be overridden per event using
             * EventModels {@link Scheduler.model.mixin.EventModelMixin#field-eventColor eventColor config}. Also, see
             * Schedulers {@link Scheduler.view.mixin.TimelineEventRendering#config-eventColor eventColor config}.
             *
             * For available standard colors, see
             * {@link Scheduler.model.mixin.EventModelMixin#typedef-EventColor}.
             *
             * @field {EventColor} eventColor
             * @category Styling
             */
            'eventColor',

            /**
             * Controls the style used for events assigned to this resource. Can be overridden per event using
             * EventModels {@link Scheduler/model/mixin/EventModelMixin#field-eventStyle eventStyle config}. See Schedulers
             * {@link Scheduler.view.mixin.TimelineEventRendering#config-eventStyle eventStyle config} for available
             * options.
             * @field {String} eventStyle
             * @category Styling
             */
            'eventStyle',

            /**
             * Fully qualified image URL, used by `ResourceInfoColumn` and vertical modes `ResourceHeader` to display a miniature image
             * for the resource.
             * @field {String} imageUrl
             * @category Styling
             */
            'imageUrl',

            /**
             * Image name relative to {@link Scheduler/view/mixin/SchedulerEventRendering#config-resourceImagePath},
             * used by `ResourceInfoColumn` and vertical modes `ResourceHeader` to display a miniature image
             * for the resource.
             * Set value to `false` to disable image display.
             * @field {String|Boolean} image
             * @category Styling
             */
            'image',

            /**
             * Control how much space to leave between the first event/last event and the resources edge (top/bottom
             * margin within the resource row in horizontal mode, left/right margin within the resource column in
             * vertical mode), in px.
             *
             * It's also possible to set different values for top/left and bottom/right
             * by assigning  an object to `resourceMargin` with `start` (margin top in horizontal mode,
             * margin left in vertical mode) and `end` (margin bottom / margin right) properties:
             * ```javascript
             * scheduler = new Scheduler({
             *     resourceMargin : {
             *         start : 15,
             *         end   : 1
             *     }
             * });
             * ```
             *
             * @field {Number|ResourceMarginConfig} resourceMargin
             * @category Layout
             */
            'resourceMargin',

            /**
             * Margin between stacked event bars for this resource, in px.
             * @field {Number} barMargin
             * @category Layout
             */
            { name : 'barMargin', type : 'number' },

            /**
             * Base height of this resource, in px. When unset, Schedulers configured rowHeight is used.
             *
             * This value is used in horizontal mode to determine row height. When stacking, it is used as input for
             * calculating the actual row height:
             *
             * ```javascript
             * row.height = (resource.rowHeight - (resourceMargin.start + resourceMargin.end)) * overlap count - barMargin * (overlap count - 1)
             * ```
             *
             * When packing or overlapping, it is used as the actual row height.
             *
             * @field {Number} rowHeight
             * @category Layout
             */

            /**
             * Base width of this resource, in px. If not set, the `columnWidth` specified in
             * the Scheduler's configured {@link Scheduler.view.Scheduler#config-resourceColumns} is used.
             *
             * This value is used in vertical mode to determine column width.
             *
             * @field {Number} columnWidth
             * @category Layout
             */

            /**
             * Specify this to use a resource specific event layout in horizontal mode, see
             * {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventLayout} for options.
             *
             * When unset (the default) Schedulers setting is used.
             *
             * @field {'stack'|'pack'|'mixed'|'none'} eventLayout
             * @category Layout
             */
            'eventLayout'
        ];
    }

    //endregion

    //region Id change

    updateAssignmentResourceIds() {
        this.assigned.forEach(assignment => {
            assignment.resourceId = this.id;
        });
    }

    syncId(value) {
        super.syncId(value);

        this.updateAssignmentResourceIds();
    }

    //endregion

    //region Getters

    // Documented in Scheduler.model.ResourceModel, SchedulerPro.model.ResourceModel, Gantt.model.ResourceModel
    get events() {
        return this.assignments.reduce((events, assignment) => {
            if (assignment.event) {
                events.push(assignment.event);
            }

            return events;
        }, []);
    }

    /**
     * Returns all assignments for the resource
     *
     * @property {Scheduler.model.AssignmentModel[]}
     * @category Common
     */
    get assignments() {
        return this.assigned ? [...this.assigned] : [];
    }

    set assignments(assignments) {
        // Remove old assignments
        this.assignmentStore.remove(this.assignments);

        // Repoint new ones
        // Engine does not allow assigning to `assigned`, handle it here
        assignments.forEach(assignment => {
            assignment.resource = this;
        });
    }

    /**
     * Returns an array of events, associated with this resource
     *
     * @deprecated 5.3.6 Use the events property instead
     *
     * @returns {Scheduler.model.EventModel[]}
     */
    getEvents() {
        VersionHelper.deprecate('scheduler', '6.0.0', 'getEvents() is deprecated, use the events property instead');
        return this.events;
    }

    /**
     * Returns `true` if the resource can be persisted.
     * In a flat store, a resource is always considered persistable. In a tree store, a resource is considered
     * persistable if its parent node is persistable.
     *
     * @property {Boolean}
     * @readonly
     * @category Editing
     */
    get isPersistable() {
        return super.isPersistable && (!this.parent || this.parent.isPersistable);
    }

    //endregion

    /**
     * Unassigns this Resource from all its Events
     */
    unassignAll() {
        this.assignments && this.assignmentStore.remove(this.assignments);
    }

    /**
     * Returns the initials (first letter of the first & last space-separated word in the name) or an empty string
     * if this resource has no name. You can override this method in a ResourceModel subclass to provide your own implementation
     *
     * @property {String}
     * @readonly
     * @category Common
     */
    get initials() {
        const
            { name = '' } = this;

        if (!name) {
            return '';
        }

        const names         = name.split(' '),
            firstInitial  = names[0][0],
            lastInitial   = (names.length > 1 ? names[names.length - 1][0] : '');

        return firstInitial + lastInitial;
    }

    isWorkingTime(date) {
        const calendar = (this.effectiveCalendar || this.project?.calendar);

        return !calendar || calendar.isWorkingTime?.(date);
    }
};
