import { CycleResolutionInputChrono } from "../../../../ChronoGraph/chrono/CycleResolver.js"
import { CalculatedValueGen } from "../../../../ChronoGraph/chrono/Identifier.js"
import {
    CalculateProposed,
    CycleDescription,
    CycleResolution,
    Formula
} from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { FieldIdentifier } from "../../../../ChronoGraph/replica/Identifier.js"

//---------------------------------------------------------------------------------------------------------------------
export enum Instruction {
    KeepDuration    = 'KeepDuration',
    KeepStartDate   = 'KeepStartDate',
    KeepEndDate     = 'KeepEndDate'
}

//---------------------------------------------------------------------------------------------------------------------
export const StartDateVar       = Symbol('StartDate')
export const EndDateVar         = Symbol('EndDate')
export const DurationVar        = Symbol('Duration')

//---------------------------------------------------------------------------------------------------------------------
export const startDateFormula  = Formula.new({
    output      : StartDateVar,
    inputs      : new Set([ DurationVar, EndDateVar ])
})

export const endDateFormula    = Formula.new({
    output      : EndDateVar,
    inputs      : new Set([ DurationVar, StartDateVar ])
})

export const durationFormula   = Formula.new({
    output      : DurationVar,
    inputs      : new Set([ StartDateVar, EndDateVar ])
})


//---------------------------------------------------------------------------------------------------------------------
export const SEDGraphDescription = CycleDescription.new({
    variables           : new Set([ StartDateVar, EndDateVar, DurationVar ]),
    formulas            : new Set([ startDateFormula, endDateFormula, durationFormula ])
})

export const SEDForwardCycleResolutionContext = CycleResolution.new({
    description                 : SEDGraphDescription,
    defaultResolutionFormulas   : new Set([ endDateFormula ])
})

export const SEDBackwardCycleResolutionContext = CycleResolution.new({
    description                 : SEDGraphDescription,
    defaultResolutionFormulas   : new Set([ startDateFormula ])
})

//---------------------------------------------------------------------------------------------------------------------
export class SEDDispatcher extends CycleResolutionInputChrono {

    addInstruction (instruction : Instruction) {
        if (instruction === Instruction.KeepStartDate) this.addKeepIfPossibleFlag(StartDateVar)
        if (instruction === Instruction.KeepEndDate) this.addKeepIfPossibleFlag(EndDateVar)
        if (instruction === Instruction.KeepDuration) this.addKeepIfPossibleFlag(DurationVar)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class SEDDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {
    ValueT                  : SEDDispatcher


    equality (v1 : SEDDispatcher, v2 : SEDDispatcher) : boolean {
        const resolution1       = v1.resolution
        const resolution2       = v2.resolution

        const res = resolution1.get(StartDateVar) === resolution2.get(StartDateVar)
            && resolution1.get(EndDateVar) === resolution2.get(EndDateVar)
            && resolution1.get(DurationVar) === resolution2.get(DurationVar)
            || (
                // https://github.com/bryntum/support/issues/6262
                // for the unscheduled tasks (missing all 3 values), resolution of the `v1` will be "keep all proposed"
                // which is always different from the default resolution
                // this leads to the dispatcher identifiers remaining "self-dependent" and re-calculated at every commit
                // process this case specially
                // note, that this is more a patch, a proper solution would probably be to change this line:
                // chronograph/src/chrono/CycleResolver.ts
                //      if (Y(PreviousValueOf(identifier)) != null) this.addPreviousValueFlag(symbol)
                // to
                //      if (Y(PreviousValueOf(identifier)) !== undefined) this.addPreviousValueFlag(symbol)
                // however this breaks normalization tests
                resolution1.get(StartDateVar) === CalculateProposed
                && resolution1.get(EndDateVar) === CalculateProposed
                && resolution1.get(DurationVar) === CalculateProposed
            )

        return res
    }
}
