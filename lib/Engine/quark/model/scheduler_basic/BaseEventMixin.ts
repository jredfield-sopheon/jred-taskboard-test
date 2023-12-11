import {
    ProposedArgumentsOf,
    ProposedOrPrevious,
    ProposedOrPreviousValueOf,
    Reject,
    Write
} from "../../../../ChronoGraph/chrono/Effect.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { SyncEffectHandler, Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculateProposed, CycleResolution, FormulaId } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { build_proposed, calculate, field, write } from "../../../../ChronoGraph/replica/Entity.js"
import DateHelper from "../../../../Core/helper/DateHelper.js"
import { dateConverter, model_field } from "../../../chrono/ModelFieldAtom.js"
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js"
import { DurationConverterMixin } from "../../../scheduling/DurationConverterMixin.js"
import {
    Direction,
    Duration,
    EffectiveDirection,
    isEqualEffectiveDirection,
    TimeUnit
} from "../../../scheduling/Types.js"
import { isNotNumber } from "../../../util/Functions.js"
import { BaseCalendarMixin, EmptyCalendarEffect } from "./BaseCalendarMixin.js"
import {
    durationFormula,
    DurationVar,
    endDateFormula,
    EndDateVar,
    Instruction,
    SEDBackwardCycleResolutionContext,
    SEDDispatcher,
    SEDDispatcherIdentifier,
    SEDForwardCycleResolutionContext,
    startDateFormula,
    StartDateVar
} from "./BaseEventDispatcher.js"
import { ChronoAbstractProjectMixin } from "./ChronoAbstractProjectMixin.js"
import { HasCalendarMixin } from "./HasCalendarMixin.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Base event entity mixin type.
 *
 * At this level event is only aware about its calendar (which is inherited from project, if not provided).
 * The functionality, related to the dependencies, constraints etc is provided in other mixins.
 *
 * A time interval will be "counted" into the event duration, only if the event's calendar has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 *
 */
export class BaseEventMixin extends Mixin(
    [ HasCalendarMixin ],
    (base : AnyConstructor<HasCalendarMixin, typeof HasCalendarMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class BaseEventMixin extends base {

        project                 : ChronoAbstractProjectMixin
            & DurationConverterMixin
            & HasCalendarMixin
            & { skipNonWorkingTimeWhenSchedulingManually : boolean, skipNonWorkingTimeInDurationWhenSchedulingManually : boolean }

        name                    : string

        /**
         * The start date of the event. Can also be provided as a string, parsable with `DateHelper.parse()`
         */
        @model_field({ type : 'date' }, { converter : dateConverter })
        startDate       : Date

        /**
         * The end date of the event. Can also be provided as a string, parsable with `DateHelper.parse()`
         */
        @model_field({ type : 'date' }, { converter : dateConverter })
        endDate         : Date

        /**
         * The duration of the event. See also [[durationUnit]].
         */
        @model_field({ type : 'number', allowNull : true })
        duration        : Duration

        /**
         * The duration unit of the event's duration. See also [[duration]].
         */
        @model_field({ type : 'string', defaultValue : TimeUnit.Day }, { converter : (unit : string) => DateHelper.normalizeUnit(unit) || TimeUnit.Day })
        durationUnit    : TimeUnit

        /**
         * The scheduling direction of the event. The `Forward` direction corresponds to the as-soon-as-possible scheduling (ASAP),
         * `Backward` - to as-late-as-possible (ALAP).
         *
         * If not specified (which is the default), direction is inherited from the parent task (and from project for the top-level tasks).
         * By default, the project model has forward scheduling mode.
         */
        @model_field({ type : 'string' }, { sync : true })
        direction       : Direction

        @field({ sync : true, equality : isEqualEffectiveDirection })
        startDateDirection      : EffectiveDirection

        @field({ sync : true, equality : isEqualEffectiveDirection })
        endDateDirection        : EffectiveDirection

        @model_field({ persist : false, isEqual : isEqualEffectiveDirection }, { sync : true, equality : isEqualEffectiveDirection })
        effectiveDirection : EffectiveDirection

        /**
         * The dispatcher instance for this event. Dispatcher accumulates the information about user input and decide which formula
         * to use for calculation of every related field (`startDate`, `endDate` and `duration` at this level).
         *
         * Every field can be calculated with 2 type of formulas. The 1st one is called "proposed" and it is used when
         * there is a user input for this field ("proposed" input), or, when user intention is to keep the previous value of the field.
         * The 2nd type is called "pure" and it is used, when a value of the field should be calculated "purely" based
         * on the values of other fields.
         *
         * See [[CycleResolverGuide]] for more information.
         */
        @field({ identifierCls : SEDDispatcherIdentifier })
        dispatcher      : SEDDispatcher

        /**
         * A boolean field, indicating whether this event should be scheduled automatically or
         * its [[startDate]] and [[endDate]] are supposed to be defined manually.
         */
        @model_field({ type : 'boolean', defaultValue : false }, { sync : true })
        manuallyScheduled               : boolean

        getManuallyScheduled : () => boolean
        setManuallyScheduled : (mode : boolean) => Promise<CommitResult>
        putManuallyScheduled : (mode : boolean) => void


        @model_field({ type : 'boolean', defaultValue : false })
        unscheduled                     : boolean


        @calculate('dispatcher')
        * calculateDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            // this value is not used directly, but it contains a default cycle resolution
            // if we calculate different resolution, dispatcher will be marked dirty
            // on next revision
            const proposed                      = yield ProposedOrPrevious

            const cycleDispatcher               = yield* this.prepareDispatcher(YIELD)

            //--------------
            const startDateProposedArgs         = yield ProposedArgumentsOf(this.$.startDate)

            const startInstruction : Instruction = startDateProposedArgs ? (startDateProposedArgs[ 0 ] ? Instruction.KeepDuration : Instruction.KeepEndDate) : undefined

            if (startInstruction) cycleDispatcher.addInstruction(startInstruction)

            //--------------
            const endDateProposedArgs           = yield ProposedArgumentsOf(this.$.endDate)

            const endInstruction : Instruction    = endDateProposedArgs ? (endDateProposedArgs[ 0 ] ? Instruction.KeepDuration : Instruction.KeepStartDate) : undefined

            if (endInstruction) cycleDispatcher.addInstruction(endInstruction)

            //--------------
            const directionValue : EffectiveDirection  = yield this.$.effectiveDirection

            const durationProposedArgs          = yield ProposedArgumentsOf(this.$.duration)

            let durationInstruction : Instruction

            if (durationProposedArgs) {
                switch (durationProposedArgs[ 0 ]) {
                    case true:
                        durationInstruction     = Instruction.KeepStartDate
                        break

                    case false:
                        durationInstruction     = Instruction.KeepEndDate
                        break
                }
            }

            if (!durationInstruction && cycleDispatcher.hasProposedValue(DurationVar)) {
                durationInstruction = directionValue.direction === Direction.Forward || directionValue.direction === Direction.None ? Instruction.KeepStartDate : Instruction.KeepEndDate
            }

            if (durationInstruction) cycleDispatcher.addInstruction(durationInstruction)

            return cycleDispatcher
        }


        * prepareDispatcher (Y : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            const dispatcherClass               = this.dispatcherClass(Y)

            const cycleDispatcher               = dispatcherClass.new({
                context                     : this.cycleResolutionContext(Y)
            })

            cycleDispatcher.collectInfo(Y, this.$.startDate, StartDateVar)
            cycleDispatcher.collectInfo(Y, this.$.endDate, EndDateVar)
            cycleDispatcher.collectInfo(Y, this.$.duration, DurationVar)

            return cycleDispatcher
        }


        cycleResolutionContext (Y) : CycleResolution {
            const direction : EffectiveDirection         = Y(this.$.effectiveDirection)

            return direction.direction === Direction.Forward || direction.direction === Direction.None ? SEDForwardCycleResolutionContext : SEDBackwardCycleResolutionContext
        }


        dispatcherClass (Y) : typeof SEDDispatcher {
            return SEDDispatcher
        }

        @build_proposed('dispatcher')
        buildProposedDispatcher (me : Identifier, quark : Quark, transaction : Transaction) : SEDDispatcher {
            const dispatcher = this.dispatcherClass(transaction.onEffectSync).new({
                context                     : this.cycleResolutionContext(transaction.onEffectSync)
            })

            dispatcher.addPreviousValueFlag(StartDateVar)
            dispatcher.addPreviousValueFlag(EndDateVar)
            dispatcher.addPreviousValueFlag(DurationVar)

            return dispatcher
        }


        /**
         * The method skips the event non working time starting from the provided `date` and
         * going either _forward_ or _backward_ in time.
         * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
         * @param date Date to start skipping from
         * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
         */
        * skipNonWorkingTime (date : Date, isForward : boolean) : CalculationIterator<Date> {
            const calendar : BaseCalendarMixin  = yield this.$.effectiveCalendar

            if (!date) return null

            const skippingRes   = calendar.skipNonWorkingTime(date, isForward)

            if (skippingRes instanceof Date) {
                return skippingRes
            } else {
                const effect = EmptyCalendarEffect.new({
                    calendars : [calendar],
                    event     : this,
                    date,
                    isForward
                })

                if ((yield effect) === EffectResolutionResult.Cancel) {
                    yield Reject(effect)
                } else {
                    return null
                }
            }
        }


        /**
         * The method skips the provided amount of the event _working time_
         * starting from the `date` and going either _forward_ or _backward_ in time.
         * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
         * @param date Date to start skipping from
         * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
         * @param duration Amount of working time to skip
         * @param unit Units the `duration` value in (if not provided then duration is considered provided in [[durationUnit]])
         */
        * skipWorkingTime (date : Date, isForward : boolean, duration : Duration, unit? : TimeUnit) : CalculationIterator<Date> {

            const durationUnit : TimeUnit           = yield this.$.durationUnit

            // Convert duration to duration unit if needed
            if (unit && unit !== durationUnit) {
                duration    = yield* this.getProject().$convertDuration(duration, unit, durationUnit)
            }

            return yield* this.calculateProjectedXDateWithDuration(date, isForward, duration)
        }


        //region start date
        /**
         * Gets the event [[startDate|start date]]
         */
        getStartDate : () => Date

        // copied generated method, to avoid compilation error when it is overridden in HasDateConstraintMixin
        /**
         * Sets the event [[startDate|start date]]
         *
         * @param date The new start date to set
         * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `endDate` (`keepDuration = false`)
         */
        setStartDate (date : Date, keepDuration : boolean = true) : Promise<CommitResult> {
            const { graph, project } = this

            if (graph) {
                graph.write(this.$.startDate, date, keepDuration)

                return graph.commitAsync()
            } else {
                this.$.startDate.DATA = date

                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise
            }
        }

        putStartDate : (date : Date, keepDuration? : boolean) => void


        @write('startDate')
        writeStartDate (me : Identifier, transaction : Transaction, quark : Quark, date : Date, keepDuration : boolean = true) {
            // we use the approach, that when user sets some atom to `null`
            // that `null` is propagated as a normal valid value through all calculation formulas
            // turning the result of all calculations to `null`
            // this works well, except the initial data load case, when don't want to do such propagation
            // but instead wants to "normalize" the data
            // because of that we ignore the `null` writes, for the initial data load case
            if (!transaction.baseRevision.hasIdentifier(me) && date == null) return

            if (!this.getProject().isStmRestoring) {
                // this is basically: this.unscheduled = date == null, however it will work with branches
                this.$.unscheduled.write(this.$.unscheduled, transaction, undefined, date == null)
            }

            me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration)
        }


        /**
         * The main calculation method for the [[startDate]] field. Delegates to either [[calculateStartDateProposed]]
         * or [[calculateStartDatePure]], depending on the information from [[dispatcher]]
         */
        @calculate('startDate')
        * calculateStartDate () : CalculationIterator<Date> {
            const dispatch : SEDDispatcher = yield this.$.dispatcher

            const formulaId : FormulaId = dispatch.resolution.get(StartDateVar)

            if (formulaId === CalculateProposed) {
                return yield* this.calculateStartDateProposed()
            }
            else if (formulaId === startDateFormula.formulaId) {
                return yield* this.calculateStartDatePure()
            } else {
                throw new Error("Unknown formula for `startDate`")
            }
        }


        /**
         * The "pure" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * At this level it delegates to [[calculateProjectedXDateWithDuration]]
         *
         * See also [[calculateStartDateProposed]].
         */
        * calculateStartDatePure () : CalculationIterator<Date> {
            return yield* this.calculateProjectedXDateWithDuration(yield this.$.endDate, false, yield this.$.duration)
        }


        /**
         * The "proposed" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateStartDatePure]]
         */
        * calculateStartDateProposed () : CalculationIterator<Date> {
            const project : this['project']    = this.getProject()
            const startDate : Date             = yield ProposedOrPrevious
            const manuallyScheduled : boolean  = yield this.$.manuallyScheduled

            return (!manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually) ? yield* this.skipNonWorkingTime(startDate, true) : startDate
        }


        /**
         * This method calculates the opposite date of the event.
         *
         * @param baseDate The base date of the event (start or end date)
         * @param isForward Boolean flag, indicating whether the given `baseDate` is start date (`true`) or end date (`false`)
         * @param duration Duration of the event, in its [[durationUnit|durationUnits]]
         */
        * calculateProjectedXDateWithDuration (baseDate : Date, isForward : boolean, duration : Duration) : CalculationIterator<Date> {
            const durationUnit : TimeUnit               = yield this.$.durationUnit
            const calendar : BaseCalendarMixin          = yield this.$.effectiveCalendar
            const project : this[ 'project' ]           = this.getProject()

            if (!baseDate || isNotNumber(duration)) return null

            // calculate forward by default
            isForward = isForward === undefined ? true : isForward

            if (isForward) {
                return calendar.calculateEndDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond))
            } else {
                return calendar.calculateStartDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond))
            }
        }
        //endregion


        //region end date
        /**
         * Gets the event [[endDate|end date]].
         */
        getEndDate : () => Date

        // copied generated method, to specify the default value for `keepDuration`
        // and to avoid compilation error when it is overridden in HasDateConstraintMixin
        /**
         * Sets the event [[endDate|end date]].
         *
         * @param date The new end date to set
         * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `startDate` (`keepDuration = false`)
         */
        setEndDate (date : Date, keepDuration : boolean = false) : Promise<CommitResult> {
            const { graph, project } = this

            if (graph) {
                graph.write(this.$.endDate, date, keepDuration)

                return graph.commitAsync()
            } else {
                this.$.endDate.DATA = date

                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise
            }
        }

        putEndDate : (date : Date, keepDuration? : boolean) => void


        @write('endDate')
        writeEndDate (me : Identifier, transaction : Transaction, quark : Quark, date : Date, keepDuration : boolean = false) {
            if (!transaction.baseRevision.hasIdentifier(me) && date == null) return

            if (!this.getProject().isStmRestoring) {
                // this is basically: this.unscheduled = date == null, however it will work with branches
                this.$.unscheduled.write(this.$.unscheduled, transaction, undefined, date == null)
            }

            me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration)
        }


        /**
         * The main calculation method for the [[endDate]] field. Delegates to either [[calculateEndDateProposed]]
         * or [[calculateEndDatePure]], depending on the information from [[dispatcher]]
         */
        @calculate('endDate')
        * calculateEndDate () : CalculationIterator<Date> {
            const dispatch : SEDDispatcher = yield this.$.dispatcher

            const formulaId : FormulaId = dispatch.resolution.get(EndDateVar)

            if (formulaId === CalculateProposed) {
                return yield* this.calculateEndDateProposed()
            }
            else if (formulaId === endDateFormula.formulaId) {
                return yield* this.calculateEndDatePure()
                // the "new way" would be
                // return yield* this.calculateProjectedEndDateWithDuration(yield this.$.startDate, yield this.$.duration)
            } else {
                throw new Error("Unknown formula for `endDate`")
            }
        }


        /**
         * The "pure" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * At this level it delegates to [[calculateProjectedXDateWithDuration]]
         *
         * See also [[calculateEndDateProposed]].
         */
        * calculateEndDatePure () : CalculationIterator<Date> {
            return yield* this.calculateProjectedXDateWithDuration(yield this.$.startDate, true, yield this.$.duration)
        }


        /**
         * The "proposed" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateEndDatePure]]
         */
        * calculateEndDateProposed () : CalculationIterator<Date> {
            const project : this['project']     = this.getProject()
            const endDate : Date                = yield ProposedOrPrevious
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled

            return (!manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually) ? yield* this.skipNonWorkingTime(endDate, false) : endDate
        }
        //endregion


        //region duration
        /**
         * Duration getter. Returns the duration of the event, in the given unit. If unit is not given, returns duration in [[durationUnit]].
         *
         * @param unit
         */
        getDuration (unit? : TimeUnit) : Duration {
            const duration        = this.duration

            return unit !== undefined ? this.getProject().convertDuration(duration, this.durationUnit, unit) : duration
        }

        /**
         * Duration setter.
         *
         * @param duration The new duration to set.
         * @param unit The unit for new duration. Optional, if missing the [[durationUnit]] value will be used.
         * @param keepStart A boolean flag, indicating, whether the intention is to keep the start date (`true`) or end date (`false`)
         */
        setDuration (duration : Duration, unit? : TimeUnit, keepStart? : boolean) : Promise<CommitResult> {
            const { graph, project } = this

            if (graph) {
                // this check is performed just because the duration editor tries to apply `undefined` when
                // an input is invalid (and we want to filter that out)
                // in the same time, we want to allow input of empty string - (task "unscheduling")
                // so for unscheduling case, the editor will apply a `null` value, for invalid - `undefined`
                // this is a mess of course (if the value is invalid, editor should not be applying anything at all),
                // but so is life
                if (duration !== undefined) {
                    graph.write(this.$.duration, duration, unit, keepStart)

                    return graph.commitAsync()
                }
            } else {
                const toSet : any = { duration }

                this.$.duration.DATA = duration

                if (unit != null) toSet.durationUnit = this.$.durationUnit.DATA = unit

                // Also has to make sure record data is updated in case this detached record is displayed elsewhere
                this.set(toSet)

                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise
            }
        }

        setDurationUnit (_value : TimeUnit) {
            throw new Error("Use `setDuration` instead")
        }


        getDurationUnit : () => TimeUnit


        @write('duration')
        writeDuration (me : Identifier, transaction : Transaction, quark : Quark, duration : Duration, unit? : TimeUnit, keepStart : boolean | Instruction = undefined) {
            if (duration < 0) duration = 0

            if (!transaction.baseRevision.hasIdentifier(me) && duration == null) return

            if (!this.getProject().isStmRestoring) {
                // this is basically: this.unscheduled = date == null, however it will work with branches
                this.$.unscheduled.write(this.$.unscheduled, transaction, undefined, duration == null)
            }

            me.constructor.prototype.write.call(this, me, transaction, quark, duration, keepStart)

            if (unit != null) transaction.write(this.$.durationUnit, unit)
        }



        /**
         * The main calculation method for the [[duration]] field. Delegates to either [[calculateDurationProposed]]
         * or [[calculateDurationPure]], depending on the information from [[dispatcher]]
         */
        @calculate('duration')
        * calculateDuration () : CalculationIterator<Duration> {
            const dispatch : SEDDispatcher = yield this.$.dispatcher

            const formulaId : FormulaId = dispatch.resolution.get(DurationVar)

            if (formulaId === CalculateProposed) {
                return yield* this.calculateDurationProposed()
            }
            else if (formulaId === durationFormula.formulaId) {
                return yield* this.calculateDurationPure()
                // the "new way" would be
                // return yield* this.calculateProjectedDuration(yield this.$.startDate, yield this.$.endDate)
            } else {
                throw new Error("Unknown formula for `duration`")
            }
        }


        /**
         * The "pure" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * If start date of event is less or equal then end date (normal case) it delegates to [[calculateProjectedDuration]].
         * Otherwise, duration is set to 0.
         *
         * See also [[calculateDurationProposed]].
         */
        * calculateDurationPure () : CalculationIterator<Duration> {
            const startDate : Date          = yield this.$.startDate
            const endDate : Date            = yield this.$.endDate

            if (!startDate || !endDate) return null

            if (startDate > endDate) {
                yield Write(this.$.duration, 0, null)
            }
            else {
                return yield* this.calculateProjectedDuration(startDate, endDate)
            }
        }


        /**
         * The "proposed" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateDurationPure]]
         */
        * calculateDurationProposed () : CalculationIterator<Duration> {
            return yield ProposedOrPrevious
        }


        /**
         * This method calculates the duration of the given time span, in the provided `durationUnit` or in the [[durationUnit]].
         *
         * @param startDate
         * @param endDate
         * @param durationUnit
         */
        * calculateProjectedDuration (startDate : Date, endDate : Date, durationUnit? : TimeUnit) : CalculationIterator<Duration> {
            if (!startDate || !endDate) return null

            if (!durationUnit) durationUnit             = yield this.$.durationUnit

            const calendar : BaseCalendarMixin          = yield this.$.effectiveCalendar
            const project : this[ 'project' ]           = this.getProject()

            return yield* project.$convertDuration(calendar.calculateDurationMs(startDate, endDate), TimeUnit.Millisecond, durationUnit)
        }


        // effective duration is either a "normal" duration, or, if the duration itself is being calculated
        // (so that yielding it will cause a cycle)
        // an "estimated" duration, calculated based on proposed/previous start/end date values
        * calculateEffectiveDuration () : CalculationIterator<Duration> {
            const dispatch : SEDDispatcher              = yield this.$.dispatcher

            let effectiveDurationToUse : Duration

            const durationResolution : FormulaId        = dispatch.resolution.get(DurationVar)

            if (durationResolution === CalculateProposed) {
                effectiveDurationToUse  = yield this.$.duration
            }
            else if (durationResolution === durationFormula.formulaId) {
                effectiveDurationToUse  = yield* this.calculateProjectedDuration(
                    yield ProposedOrPreviousValueOf(this.$.startDate),
                    yield ProposedOrPreviousValueOf(this.$.endDate)
                )
            }

            return effectiveDurationToUse
        }
        //endregion


        //region direction
        /**
         * Getter for [[direction]] field.
         */
        getDirection : () => Direction

        /**
         * Setter for [[direction]] field.
         */
        setDirection : (value : Direction) => Promise<CommitResult>

        @calculate('effectiveDirection')
        * calculateEffectiveDirection () : CalculationIterator<EffectiveDirection> {
            const direction : Direction = yield this.$.direction

            return {
                // our TS version is a bit too old
                kind : 'own' as 'own',
                direction : direction || Direction.Forward
            }
        }


        // for leaf-events it just translates the value of `effectiveDirection`
        // for parent-events there will be more complex logic
        @calculate('startDateDirection')
        * calculateStartDateDirection () : CalculationIterator<EffectiveDirection> {
            return yield this.$.effectiveDirection
        }


        @calculate('endDateDirection')
        * calculateEndDateDirection () : CalculationIterator<EffectiveDirection> {
            return yield this.$.effectiveDirection
        }
        //endregion

        * calculateEffectiveDataOrVisualCalendar (purpose : 'data' | 'visual') : CalculationIterator<BaseCalendarMixin> {
            if (purpose === 'visual') {
                return yield* super.calculateEffectiveDataOrVisualCalendar('visual')
            }
            else {
                const manuallyScheduled : boolean           = yield this.$.manuallyScheduled
                const project : this[ 'project' ]           = this.getProject()

                return manuallyScheduled && !project.skipNonWorkingTimeInDurationWhenSchedulingManually
                    ? project.defaultCalendar as BaseCalendarMixin
                    : yield* super.calculateEffectiveDataOrVisualCalendar('data')
            }
        }
    }

    return BaseEventMixin
}){}
