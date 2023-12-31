import { CycleResolution, CycleDescription } from "../../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import {
    durationFormula,
    DurationVar,
    endDateFormula,
    EndDateVar,
    startDateFormula,
    StartDateVar
} from "../../scheduler_basic/BaseEventDispatcher.js"
import { effortFormula, EffortVar, endDateByEffortFormula, startDateByEffortFormula, unitsFormula, UnitsVar } from "../../scheduler_pro/HasEffortDispatcher.js"


//---------------------------------------------------------------------------------------------------------------------
export const fixedEffortSEDWUGraphDescription = CycleDescription.new({
    variables           : new Set([ StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar ]),
    formulas            : new Set([
        // the order of formulas is important here - the earlier ones are preferred
        endDateByEffortFormula,
        durationFormula,
        unitsFormula,
        effortFormula,
        startDateByEffortFormula,
        startDateFormula,
        endDateFormula
    ])
})


//---------------------------------------------------------------------------------------------------------------------
export const fixedEffortSEDWUForward = CycleResolution.new({
    description                 : fixedEffortSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ endDateByEffortFormula, durationFormula ])
})

export const fixedEffortSEDWUBackward = CycleResolution.new({
    description                 : fixedEffortSEDWUGraphDescription,
    defaultResolutionFormulas   : new Set([ startDateByEffortFormula, durationFormula ])
})

