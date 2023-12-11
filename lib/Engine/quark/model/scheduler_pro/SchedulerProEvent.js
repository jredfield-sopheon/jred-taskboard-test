import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { SchedulerBasicEvent } from "../scheduler_basic/SchedulerBasicEvent.js";
import { ConstrainedEarlyEventMixin } from "./ConstrainedEarlyEventMixin.js";
import { HasDateConstraintMixin } from "./HasDateConstraintMixin.js";
import { HasPercentDoneMixin } from "./HasPercentDoneMixin.js";
import { ScheduledByDependenciesEarlyEventMixin } from "./ScheduledByDependenciesEarlyEventMixin.js";
import { SchedulerProHasAssignmentsMixin } from "./SchedulerProHasAssignmentsMixin.js";
// https://github.com/bryntum/support/issues/6397
import { SplitEventMixin } from "./SplitEventMixin.js";
import { HasEffortMixin } from "./HasEffortMixin.js";
import { HasSchedulingModeMixin } from "./HasSchedulingModeMixin.js";
import { FixedDurationMixin } from "./scheduling_modes/FixedDurationMixin.js";
import { DelayFromParentMixin } from "./DelayFromParentMixin.js";
// Mixin system is limited to handling 10 mixins, so we have to split the mixins into two groups
class SchedulerProBaseEvent extends Mixin([
    SchedulerBasicEvent,
    HasDateConstraintMixin,
    HasPercentDoneMixin,
    SchedulerProHasAssignmentsMixin,
    HasEffortMixin,
    HasSchedulingModeMixin,
    FixedDurationMixin,
    ConstrainedEarlyEventMixin,
    ScheduledByDependenciesEarlyEventMixin,
    SplitEventMixin
], (base) => {
    class SchedulerProBaseEvent extends base {
    }
    return SchedulerProBaseEvent;
}) {
}
/**
 * This is an event class, [[SchedulerProProjectMixin]] is working with.
 * It is constructed as [[SchedulerBasicEvent]], enhanced with extra functionality.
 */
export class SchedulerProEvent extends Mixin([
    SchedulerProBaseEvent,
    DelayFromParentMixin
], (base) => {
    const superProto = base.prototype;
    class SchedulerProEvent extends base {
    }
    return SchedulerProEvent;
}) {
}
