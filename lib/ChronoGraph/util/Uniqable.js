import { MIN_SMI } from "./Helpers.js";
let UNIQABLE = MIN_SMI;
// in-place mutation
export const compact = (array) => {
    const uniqableId = ++UNIQABLE;
    let uniqueIndex = -1;
    for (let i = 0; i < array.length; ++i) {
        const element = array[i];
        if (element.uniqable !== uniqableId) {
            element.uniqable = uniqableId;
            ++uniqueIndex;
            if (uniqueIndex !== i)
                array[uniqueIndex] = element;
        }
    }
    // assuming its better to not touch the array's `length` property
    // unless we really have to
    if (array.length !== uniqueIndex + 1)
        array.length = uniqueIndex + 1;
};
