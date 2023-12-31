import ObjectHelper from '../helper/ObjectHelper.js';

// The code is based on https://epsil.github.io/gll/ article (MIT license).

/**
 * @module Core/util/Parser
 */

// Tools. Maybe move it to memoization module.
let nextObjectIdentity = 0;
const objectIdentityMap = new WeakMap();

const argsToCacheKey = (...args) => args.map((arg) => {
    let result;

    if (arg && typeof arg == 'object' || typeof arg == 'function') {
        result = objectIdentityMap.get(arg);
        if (result === undefined) {
            result = ++nextObjectIdentity;
            objectIdentityMap.set(arg, result);
        }
    }
    else {
        result = String(arg);
    }

    return result;
}).join('-');

/**
 * Generic memoization function. Wraps `fn` into higher order function which caches `fn` result
 * using stringified arguments as the cache key.
 *
 * @param {Function} fn function to memoize
 */
export const memo = (fn) => {
    const mlist = new Map();

    return (...args) => {
        const mkey = argsToCacheKey(args);
        let result = mlist.get(mkey);

        if (result === undefined) {
            result = fn(...args);
            mlist.set(mkey, result);
        }

        return result;
    };
};

/**
 * Specific memoization function caches `fn` calls. `fn` should receive 2 arguments, the first one
 * is a string, and the second one is a callback which should be called by `fn` with some result.
 * The function returned wraps `fn` and it's callback such that `fn` would be called only once
 * with a particular first argument, other time callback will be called instantly with the result cached.
 *
 * @param {Function} fn function to memoize
 */
export const memoCps = (fn) => {
    const table = new Map(),
        entryContinuations = (entry) => entry[0],
        entryResults = (entry) => entry[1],
        pushContinuation = (entry, cont) => entryContinuations(entry).push(cont),
        pushResult = (entry, result) => entryResults(entry).push(result),
        isResultSubsumed = (entry, result) => entryResults(entry).some(r => ObjectHelper.isEqual(r, result)),
        makeEntry = () => [[], []],
        isEmptyEntry = (entry) => !entryResults(entry).length && !entryContinuations(entry).length,
        tableRef = (str) => {
            let entry = table.get(str);

            if (entry === undefined) {
                entry = makeEntry();
                table.set(str, entry);
            }

            return entry;
        };

    return (str, cont) => {
        const entry = tableRef(str);

        if (isEmptyEntry(entry)) {
            pushContinuation(entry, cont);
            fn(str, (result) => {
                if (!isResultSubsumed(entry, result)) {
                    pushResult(entry, result);
                    entryContinuations(entry).forEach(cont => cont(result));
                }
            });
        }
        else {
            pushContinuation(entry, cont);
            entryResults(entry).forEach(result => cont(result));
        }
    };
};
// End of tools

const SUCCESS = Symbol('success');
const FAILURE = Symbol('failure');

/**
 * Successful parsing result. Represented as array with 3 items:
 * - SUCCESS symbol which can be checked with {@link #function-isSuccess} function.
 * - Parsed payload
 * - Rest string left to parse
 *
 * @typedef {Array} SuccessResult
 */

/**
 * Creates successful parsing result with parsed `val` and unparsed `rest`
 *
 * @param {String} val Parsed value
 * @param {String} rest Unparsed rest
 * @returns {SuccessResult}
 */
export const success = (val, rest) => [SUCCESS, val, rest];

/**
 * Failure parsing result. Represented as array with 2 items:
 * - FAILURE symbol which can be checked with {@link #function-isSuccess} function
 * - Rest string left to parse
 *
 * @typedef {Array} FailureResult
 */

/**
 * Creates failed parsing result with unparsed `rest`
 *
 * @param {String} rest Unparsed rest
 * @returns {FailureResult}
 */
export const failure = (rest) => [FAILURE, rest];

/**
 * Checks if the given parsing `result` is successful
 *
 * @param {SuccessfulResult|FailureResult} result
 */
export const isSuccess = (result) => result.length && result[0] === SUCCESS;

/**
 * Resolves parser when needed. Parser should be resolved if it's defined as a function
 * with no arguments which returns the actual parser function with more then one argument.
 *
 * @param {Function} p Parser factory
 * @returns {Function} Combinable parser function
 */
export const resolveParser = (p) => typeof p === 'function' && !p.length ? p() : p;

/**
 * Returns combinable parser which always return successful parsing result with `val`
 * as parsed result and string parsed as `rest`.
 *
 * ```javascript
 * const sp = succeed('Ok');
 * sp('My string', (r) => console.dir(r)) // Will output successful parsing result with `Ok` payload and `My string` rest.
 * ```
 *
 * @param {*} val Successful parsing result parsed payload
 * @returns {Function} Combinable parser function
 */
export const succeed =
    memo(
        (val) =>
            memoCps(
                (str, cont) =>
                    cont(success(val, str))
            )
    );

/**
 * Returns combinable parser which succeeds if string parsed starts with `match`. The parsing
 * result will contain `match` as parsed result and rest of the string characters,
 * the ones after `match` as the unparsed rest.
 *
 * ```javascript
 * const mp = string('My');
 * mp('My string', (r) => console.dir(r)); // Will output successful parsing result with `My` payload and `string` rest.
 * ```
 *
 * @param {String} match String to match
 * @returns {Function} Combinable parser function
 */
export const string =
    memo(
        (match) =>
            memoCps(
                (str, cont) => {
                    const len = Math.min(match.length, str.length),
                        head = str.substr(0, len),
                        tail = str.substr(len);

                    cont(head === match ? success(head, tail) : failure(tail));
                }
            )
    );

/**
 * Binds parser or parser factory with a `fn` function which should receive one string argument
 * and return a combinable parser function.
 *
 * @param {Function} p Combinable parser function or combinable parser factory which can be
 *                     resolved using with {@link #function-resolveParser}.
 * @param {Function} fn A function receiving one string argument and returning combinable parser function.
 *
 * @internal
 */
export const bind = (p, fn) =>
    (str, cont) =>
        resolveParser(p)(str, (result) => {
            if (isSuccess(result)) {
                const [, val, rest] = result;
                fn(val)(rest, cont);
            }
            else {
                cont(result);
            }
        });

/**
 * Combines several combined parser functions or combinable parser factories in sequence such that second starts after first succeeds
 * third after second etc, if first fails then second will not be called and so on.
 *
 * ```javascript
 * const ab = seq(string('a'), string('b'));
 * ab('abc', (r) => console.dir(r)); // Will output successful parsing result with `ab` as parsed payload and `c` as the rest.
 * ```
 *
 * @param {...Function} parsers Combinable parser function or combinable parser factory which can be
 * @returns {Function} Combinable parser function
 */
export const seq =
    memo(
        (...parsers) => {
            const seq2 = memo(
                (a, b) =>
                    memoCps(
                        bind(
                            a,
                            (x) => bind(
                                b,
                                (y) => succeed([].concat(x, y))
                            )
                        )
                    )
            );

            return parsers.reduce(seq2, succeed([]));
        }
    );

/**
 * Combines several combined parser functions or combinable parser factories in alteration such that successful parsing result will be passed into
 * a callback if one of those parsers succeeds.
 *
 * ```javascript
 * const aorb = alt(string('a'), string('b'));
 * aorb('abc', (r) => console.dir(r)); // Will output successful parsing result with `a` as parsed payload and `bc` as the rest.
 * aorb('bbc', (r) => console.dir(r)); // Will output successful parsing result with `b` as parsed payload and `bc` as the rest.
 * ```
 *
 * @param {...Function} parsers Combinable parser function or combinable parser factory which can be
 *  resolved using with {@link #function-resolveParser}.
 * @returns {Function} Combinable parser function
 */
export const alt =
    memo(
        (...parsers) =>
            memoCps(
                (str, cont) =>
                    parsers.forEach(p => resolveParser(p)(str, cont))
            )
    );

/**
 * Creates combinable parser which succeeds if string to parse starts from a substring which succeeds for the regular expression
 * `pattern` the parser is created with.
 *
 * ```javascript
 * const rp = regexp('a+');
 * rp('aaabb', (r) => console.dir(r)); // Will output successful parsing result with `aaa` as parsed payload and `bb` as the rest.
 * ```
 *
 * @param {String} pattern Regular expression pattern
 * @returns {Function} Combinable parser function
 */
export const regexp =
    memo(
        (pattern) =>
            (str, cont) => {
                const rexp = new RegExp(`^${pattern}`),
                    match = rexp.exec(str);

                if (match) {
                    const head = match[0],
                        tail = str.substr(head.length);

                    cont(success(head, tail));
                }
                else {
                    cont(failure(str));
                }
            }
    );

/**
 * Creates reducing combinable parser function which should be used to create semantic actions
 * on parsed results.
 *
 * ```javascript
 * const nump = red(
 *     regexp('\d'),
 *     Number
 * );
 *
 * const plusp = string('+');
 *
 * const sump = red(
 *     seq(nump, plusp, nump),
 *     (a, _, b) => a + b
 * );
 *
 * sump('7+8', (r) => console.dir(r)); // Will return successful parsing result with `15` as parsing payload and `` as rest.
 * ```
 *
 * @param {Function} p Combinable parser function or combinable parser factory which can be
 *  resolved using with {@link #function-resolveParser}.
 * @param {Function} fn Semantic action function should be the same arity as the successful result arity *  of `p` parser.
 * @returns {Function} Combinable parser function
 */
export const red =
    memo(
        (p, fn) =>
            bind(
                p,
                (...val) =>
                    succeed(fn(...[].concat.apply([], val)))
            )
    );

/**
 * Runs combinable parsing function returning totally parsed results only, i.e. such results which have
 * parsed the `str` string completely.
 *
 * @param {Function} body Combinable parser function
 * @param {String} str String to parse
 * @returns {SuccessfulResult[]} All totally parsed results possible for the given parsing function.
 */
export const runParser = (body, str) => {
    const results = [];

    body(str, (result) => {
        if (isSuccess(result)) {
            const [, , left] = result;
            if (left === '') {
                results.push(result);
            }
        }
    });

    return results;
};

/**
 * Helper function for combinable parser definition supplements combinable parser function
 * returning a higher order function which when called with 2 arguments (string to parse and
 * a callback function) behaves exactly like parser function, but when called with 1 argument
 * it wraps call to parser function with {@link function-runParser} thus returning array of
 * totally parsed results.
 *
 * @param {Function} body Combinable parser function
 */
export const defineParser = (body) =>
    (str, cont) => cont ? resolveParser(body)(str, cont) : runParser(resolveParser(body), str);

//Combines exports in an object such that it was possible to export parser utilities
// in UMD/module bundles.
export default {
    memo,
    memoCps,
    success,
    failure,
    isSuccess,
    resolveParser,
    succeed,
    string,
    bind,
    seq,
    alt,
    regexp,
    red,
    runParser,
    defineParser
};
