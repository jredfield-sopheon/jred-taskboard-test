import { CycleResolutionInput } from "../cycle_resolver/CycleResolver.js";
import { HasProposedNotPreviousValue, PreviousValueOf } from "./Effect.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * A subclass of [[CycleResolutionInput]] with additional convenience method [[collectInfo]].
 */
export class CycleResolutionInputChrono extends CycleResolutionInput {
    /**
     * This method, given an effect handler, identifier and a variable, will add [[CycleResolutionInput.addPreviousValueFlag|previous value]]
     * and [[CycleResolutionInput.addProposedValueFlag|proposed value]] flags for that variable.
     *
     * @param Y An effect handler function, which is given as a 1st argument of every calculation function
     * @param identifier
     * @param symbol
     */
    collectInfo(Y, identifier, symbol) {
        if (Y(PreviousValueOf(identifier)) != null)
            this.addPreviousValueFlag(symbol);
        if (Y(HasProposedNotPreviousValue(identifier)))
            this.addProposedValueFlag(symbol);
    }
}
