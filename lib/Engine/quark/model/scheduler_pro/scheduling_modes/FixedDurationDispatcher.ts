import { CycleResolution, CycleDescription } from "../../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import {
    durationFormula,
    DurationVar,
    endDateFormula,
    EndDateVar,
    startDateFormula,
    StartDateVar
} from "../../scheduler_basic/BaseEventDispatcher.js"
import { effortFormula, EffortVar, unitsFormula, UnitsVar } from "../HasEffortDispatcher.js"


//---------------------------------------------------------------------------------------------------------------------
export const fixedDurationSEDWUGraphDescription = CycleDescription.new({
    variables           : new Set([ StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar ]),
    formulas            : new Set([
        startDateFormula,
        endDateFormula,
        durationFormula,
        unitsFormula,
        effortFormula,

    ])
})

export const fixedDurationAndEffortSEDWUGraphDescription = CycleDescription.new({
    variables           : new Set([ StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar ]),
    formulas            : new Set([
        startDateFormula,
        endDateFormula,
        durationFormula,
        unitsFormula,
    ])
})


//---------------------------------------------------------------------------------------------------------------------
export const fixedDurationSEDWUForwardNonEffortDriven = CycleResolution.new({
    description                 : fixedDurationSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ endDateFormula, effortFormula ])
})

export const fixedDurationSEDWUForwardEffortDriven = CycleResolution.new({
    description                 : fixedDurationAndEffortSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ endDateFormula, unitsFormula ])
})

export const fixedDurationSEDWUBackwardNonEffortDriven = CycleResolution.new({
    description                 : fixedDurationSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ startDateFormula, effortFormula ])
})

export const fixedDurationSEDWUBackwardEffortDriven = CycleResolution.new({
    description                 : fixedDurationAndEffortSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ startDateFormula, unitsFormula ])
})

