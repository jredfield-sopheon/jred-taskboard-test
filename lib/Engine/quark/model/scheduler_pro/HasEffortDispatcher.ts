import { Formula } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { EndDateVar, SEDDispatcher, SEDDispatcherIdentifier, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js"
import { TombStone } from "../../../../ChronoGraph/chrono/Quark.js"

//---------------------------------------------------------------------------------------------------------------------
export const EffortVar          = Symbol('EffortVar')
export const UnitsVar           = Symbol('UnitsVar')


//---------------------------------------------------------------------------------------------------------------------
export const effortFormula  = Formula.new({
    output      : EffortVar,
    inputs      : new Set([ StartDateVar, EndDateVar, UnitsVar ])
})

export const unitsFormula  = Formula.new({
    output      : UnitsVar,
    inputs      : new Set([ StartDateVar, EndDateVar, EffortVar ])
})

export const endDateByEffortFormula  = Formula.new({
    output      : EndDateVar,
    inputs      : new Set([ StartDateVar, EffortVar, UnitsVar ])
})

export const startDateByEffortFormula  = Formula.new({
    output      : StartDateVar,
    inputs      : new Set([ EndDateVar, EffortVar, UnitsVar ])
})


//---------------------------------------------------------------------------------------------------------------------
export class SEDWUDispatcher extends SEDDispatcher {
}


//---------------------------------------------------------------------------------------------------------------------
export class SEDWUDispatcherIdentifier extends SEDDispatcherIdentifier {
    ValueT      : SEDWUDispatcher

    equality (v1 : SEDWUDispatcher, v2 : SEDWUDispatcher) : boolean {
        const resolution1       = v1.resolution
        const resolution2       = v2.resolution

        // @ts-ignore
        return (v1 !== TombStone || v2 === TombStone)
            // @ts-ignore
            && (v1 === TombStone || v2 !== TombStone)
            && resolution1.get(EffortVar) === resolution2.get(EffortVar)
            && resolution1.get(UnitsVar) === resolution2.get(UnitsVar)
            && super.equality(v1, v2)
    }
}
