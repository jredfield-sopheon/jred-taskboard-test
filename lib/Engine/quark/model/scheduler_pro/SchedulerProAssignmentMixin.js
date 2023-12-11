var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from '../../../../ChronoGraph/chrono/Effect.js';
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { model_field } from '../../../chrono/ModelFieldAtom.js';
import { BaseAssignmentMixin } from '../scheduler_basic/BaseAssignmentMixin.js';
import { calculate, field } from '../../../../ChronoGraph/replica/Entity.js';
//---------------------------------------------------------------------------------------------------------------------
/**
 * A mixin for the assignment entity at the Scheduler Pro level.
 */
export class SchedulerProAssignmentMixin extends Mixin([BaseAssignmentMixin], (base) => {
    const superProto = base.prototype;
    class SchedulerProAssignmentMixin extends base {
        *calculateUnits() {
            const event = yield this.$.event;
            // if event of assignment presents - we always delegate to it
            // (so that various assignment logic can be overridden by single event mixin)
            if (event)
                return yield* event.calculateAssignmentUnits(this);
            // otherwise use proposed or current consistent value
            return yield ProposedOrPrevious;
        }
        *calculateEffort() {
            const event = yield this.$.event;
            if (event) {
                const startDate = yield event.$.startDate;
                const endDate = yield event.$.endDate;
                const calendar = yield event.$.effectiveCalendar;
                if (startDate && endDate) {
                    const map = new Map();
                    map.set(calendar, [this]);
                    return yield* event.calculateProjectedEffort(startDate, endDate, map);
                }
            }
            return null;
        }
        *calculateActualDate() {
            const event = yield this.$.event;
            if (event) {
                const startDate = yield event.$.startDate;
                const duration = yield event.$.duration;
                const percentDone = yield event.$.percentDone;
                return yield* event.calculateProjectedXDateWithDuration(startDate, true, duration * 0.01 * percentDone);
            }
            return null;
        }
        *calculateActualEffort() {
            const event = yield this.$.event;
            if (event) {
                const startDate = yield event.$.startDate;
                const calendar = yield event.$.effectiveCalendar;
                const actualDate = yield this.$.actualDate;
                const assignmentsByCalendar = new Map();
                assignmentsByCalendar.set(calendar, [this]);
                return yield* event.calculateProjectedEffort(startDate, actualDate, assignmentsByCalendar);
            }
            return null;
        }
    }
    __decorate([
        model_field({ type: 'number', defaultValue: 100 })
    ], SchedulerProAssignmentMixin.prototype, "units", void 0);
    __decorate([
        calculate('units')
    ], SchedulerProAssignmentMixin.prototype, "calculateUnits", null);
    __decorate([
        field({ lazy: true })
    ], SchedulerProAssignmentMixin.prototype, "effort", void 0);
    __decorate([
        field({ lazy: true })
    ], SchedulerProAssignmentMixin.prototype, "actualDate", void 0);
    __decorate([
        field({ lazy: true })
    ], SchedulerProAssignmentMixin.prototype, "actualEffort", void 0);
    __decorate([
        calculate('effort')
    ], SchedulerProAssignmentMixin.prototype, "calculateEffort", null);
    __decorate([
        calculate('actualDate')
    ], SchedulerProAssignmentMixin.prototype, "calculateActualDate", null);
    __decorate([
        calculate('actualEffort')
    ], SchedulerProAssignmentMixin.prototype, "calculateActualEffort", null);
    return SchedulerProAssignmentMixin;
}) {
}
