//---------------------------------------------------------------------------------------------------------------------
// assume 32-bit platform (https://v8.dev/blog/react-cliff)
import { CI } from "../collection/Iterator.js";
export const MIN_SMI = -Math.pow(2, 30);
export const MAX_SMI = Math.pow(2, 30) - 1;
//---------------------------------------------------------------------------------------------------------------------
export const uppercaseFirst = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);
//---------------------------------------------------------------------------------------------------------------------
export const isAtomicValue = (value) => Object(value) !== value;
//---------------------------------------------------------------------------------------------------------------------
export const typeOf = (value) => Object.prototype.toString.call(value).slice(8, -1);
//---------------------------------------------------------------------------------------------------------------------
export const defineProperty = (target, property, value) => {
    Object.defineProperty(target, property, { value, enumerable: true, configurable: true });
    return value;
};
//---------------------------------------------------------------------------------------------------------------------
export const prototypeValue = (value) => {
    return function (target, propertyKey) {
        target[propertyKey] = value;
    };
};
//---------------------------------------------------------------------------------------------------------------------
export const copyMapInto = (sourceMap, targetMap) => {
    for (const [key, value] of sourceMap)
        targetMap.set(key, value);
    return targetMap;
};
//---------------------------------------------------------------------------------------------------------------------
export const copySetInto = (sourceSet, targetSet) => {
    for (const value of sourceSet)
        targetSet.add(value);
    return targetSet;
};
//---------------------------------------------------------------------------------------------------------------------
export const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
//---------------------------------------------------------------------------------------------------------------------
export const matchAll = function* (regexp, testStr) {
    let match;
    while ((match = regexp.exec(testStr)) !== null) {
        yield match;
    }
};
//---------------------------------------------------------------------------------------------------------------------
export const allMatches = function (regexp, testStr) {
    return CI(matchAll(regexp, testStr)).map(match => CI(match).drop(1)).concat().toArray();
};
let isRegeneratorRuntime = null;
export const isGeneratorFunction = function (func) {
    if (isRegeneratorRuntime === null)
        isRegeneratorRuntime = typeof regeneratorRuntime !== 'undefined';
    if (isRegeneratorRuntime === true) {
        return regeneratorRuntime.isGeneratorFunction(func);
    }
    else {
        return func.constructor.name === 'GeneratorFunction';
    }
};
//---------------------------------------------------------------------------------------------------------------------
export const isPromise = function (obj) {
    return obj && typeof obj.then === 'function';
};
