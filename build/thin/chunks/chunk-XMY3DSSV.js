/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import {
  Base,
  BrowserHelper,
  Delayable_default,
  DynamicObject,
  FunctionHelper,
  ObjectHelper,
  StringHelper,
  TextField,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/mixin/Featureable.js
var Featureable_default = (Target) => class Featureable extends (Target || Base) {
  static get $name() {
    return "Featureable";
  }
  static get configurable() {
    return {
      /**
       * Specifies the features to create and associate with the instance. The keys of this object are the names
       * of features. The values are config objects for those feature instances.
       *
       * After construction, this property can be used to access the feature instances and even reconfigure them.
       *
       * For example:
       * ```
       *  instance.features.amazing = {
       *      // reconfigure this feature
       *  }
       * ```
       * This can also be done in bulk:
       * ```
       *  instance.features = {
       *      amazing : {
       *          // reconfigure this feature
       *      },
       *      // reconfigure other features
       *  }
       * ```
       * @config {Object}
       */
      features: null
    };
  }
  static get declarable() {
    return [
      /**
       * This property getter returns options that control feature management for the derived class. This
       * property getter must be defined by the class that mixes in `Featureable` in order to initialize the
       * class properly.
       * ```
       *  class SuperWidget extends Widget.mixin(Featureable) {
       *      static get featureable() {
       *          return {
       *              factory : SuperWidgetFeature
       *          };
       *      }
       *      ...
       *  }
       * ```
       * @static
       * @member {Object} featureable
       * @property {Core.mixin.Factoryable} featureable.factory The factoryable class (not one of its instances)
       * that will be used to create feature instances.
       * @property {String} [featureable.ownerName='client'] The config or property to assign on each feature as
       * a reference to its creator, the `Featureable` instance.
       * @internal
       */
      "featureable"
    ];
  }
  static setupFeatureable(cls) {
    const featureable = {
      ownerName: "client",
      ...cls.featureable
    };
    featureable.factory.initClass();
    Reflect.defineProperty(cls, "featureable", {
      get() {
        return featureable;
      }
    });
  }
  doDestroy() {
    var _a;
    const features = this.features;
    super.doDestroy();
    for (const name in features) {
      const feature = features[name];
      (_a = feature.destroy) == null ? void 0 : _a.call(feature);
    }
  }
  /**
   * Returns `true` if the specified feature is active for this instance and `false` otherwise.
   * @param {String} name The feature name
   * @returns {Boolean}
   */
  hasFeature(name) {
    var _a;
    return Boolean((_a = this.features) == null ? void 0 : _a[name]);
  }
  changeFeatures(features, was) {
    if (this.isDestroying) {
      return;
    }
    const me = this, { featureable } = me.constructor, manager = me.$features || (me.$features = new DynamicObject({
      configName: "features",
      factory: featureable.factory,
      owner: me,
      ownerName: featureable.ownerName
    }));
    manager.update(features);
    if (!was) {
      return manager.target;
    }
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options), { features } = result;
    if (features) {
      for (const featureName in features) {
        if (Object.keys(features[featureName]).length === 0) {
          features[featureName] = true;
        }
      }
    }
    return result;
  }
};

// ../Core/lib/Core/mixin/Fencible.js
var { defineProperty } = Object;
var { hasOwn } = ObjectHelper;
var fencibleSymbol = Symbol("fencible");
var NONE = [];
var distinct = (array) => Array.from(new Set(array));
var parseNames = (names) => names ? distinct(StringHelper.split(names)) : NONE;
var fenceMethod = (target, name, options) => {
  if (options === true) {
    options = name;
  }
  if (!ObjectHelper.isObject(options)) {
    options = {
      all: options
    };
  }
  let any = parseNames(options.any);
  const all = parseNames(options.all), lock = options.lock ? parseNames(options.lock) : distinct(all.concat(any)), implName = name + "Impl", fence = function(...params) {
    const me = this, fences = hasOwn(me, fencibleSymbol) ? me[fencibleSymbol] : me[fencibleSymbol] = {}, isFree = (key) => !fences[key];
    if (all.every(isFree) && (!any || any.some(isFree))) {
      try {
        lock.forEach((key) => fences[key] = (fences[key] || 0) + 1);
        return me[implName](...params);
      } finally {
        lock.forEach((key) => --fences[key]);
      }
    }
  };
  any = any.length ? any : null;
  !target[implName] && defineProperty(target, implName, {
    configurable: true,
    value: target[name]
  });
  defineProperty(target, name, {
    configurable: true,
    value: fence
  });
};
var Fencible_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static setupFenced(cls) {
      let { fenced } = cls;
      const statics = fenced.static, pairs = [];
      if (statics) {
        fenced = { ...fenced };
        delete fenced.static;
        pairs.push([statics, cls]);
      }
      pairs.push([fenced, cls.prototype]);
      for (const [methods, target] of pairs) {
        for (const methodName in methods) {
          fenceMethod(target, methodName, methods[methodName]);
        }
      }
    }
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "Fencible"), __publicField(_a, "declarable", [
    /**
     * This class property returns an object that specifies methods to be wrapped to prevent reentrancy.
     *
     * It is used like so:
     * ```javascript
     *  class Foo extends Base.mixin(Fencible) {
     *      static fenced = {
     *          reentrantMethod : true
     *      };
     *
     *      reentrantMethod() {
     *          // things() may cause reentrantMethod() to be called...
     *          // but we won't be allowed to reenter this method since we are already inside it
     *          this.things();
     *      }
     *  }
     * ```
     *
     * This can also be used to protect mutually reentrant method groups:
     *
     * ```javascript
     *  class Foo extends Base.mixin(Fencible) {
     *      static fenced = {
     *          foo : 'foobar'
     *          bar : 'foobar'
     *      };
     *
     *      foo() {
     *          console.log('foo');
     *          this.bar();
     *      }
     *
     *      bar() {
     *          console.log('bar');
     *          this.foo();
     *      }
     *  }
     *
     *  instance = new Foo();
     *  instance.foo();
     *  >> foo
     *  instance.bar();
     *  >> bar
     * ```
     *
     * The value for a fenced method value can be `true`, a string, an array of strings, or a
     * {@link #typedef-MethodFence} options object.
     *
     * Internally these methods are protected by assigning a wrapper function in their place. The original function
     * is moved to a new named property by appending 'Impl' to the original name. For example, in the above code,
     * `foo` and `bar` are wrapper functions that apply reentrancy protection and call `fooImpl` and `barImpl`,
     * respectively. This is important for inheritance and `super` calling because the new name must be used in
     * order to retain the guard function implementations.
     *
     * @static
     * @member {Object} fenced
     * @internal
     */
    "fenced"
  ]), _a;
};

// ../Core/lib/Core/widget/FilterField.js
var FilterField = class extends TextField {
  static get configurable() {
    return {
      /**
       * The model field name to filter by. Can optionally be replaced by {@link #config-filterFunction}
       * @config {String}
       * @category Filtering
       */
      field: null,
      /**
       * The store to filter.
       * @config {Core.data.Store}
       * @category Filtering
       */
      store: null,
      /**
       * Optional filter function to be called with record and value as parameters for store filtering.
       * ```javascript
       * {
       *     type           : 'filterfield',
       *     store          : myStore,
       *     filterFunction : (record, value)  => {
       *        return record.text.includes(value);
       *     }
       * }
       * ```
       *
       * @config {Function}
       * @param {Core.data.Model} record Record for comparison
       * @param {String} value Value to compare with
       * @returns {Boolean} Returns `true` if record matches comparison requirements
       *
       * @category Filtering
       */
      filterFunction: null,
      clearable: true,
      revertOnEscape: true,
      ignoreParentReadOnly: true,
      keyStrokeChangeDelay: 100,
      onChange({ value }) {
        const { store, field, filterFunction } = this;
        if (store) {
          const filterId = `${field || this.id}-Filter`;
          if (value.length === 0) {
            store.removeFilter(filterId);
          } else {
            let filterBy;
            if (filterFunction) {
              filterBy = (record) => filterFunction(record, value);
            } else {
              value = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              filterBy = (record) => {
                var _a;
                return (_a = record.getValue(field)) == null ? void 0 : _a.match(new RegExp(value, "i"));
              };
            }
            store.filter({
              id: filterId,
              filterBy
            });
          }
        }
      }
    };
  }
  updateValue(value, old) {
    super.updateValue(value, old);
    if (value && this.isConfiguring) {
      this.onChange({ value });
    }
  }
};
__publicField(FilterField, "$name", "FilterField");
__publicField(FilterField, "type", "filterfield");
FilterField.initClass();
FilterField._$name = "FilterField";

// ../Core/lib/Core/widget/mixin/Responsive.js
var EMPTY = [];
var isStateName = (name) => name[0] !== "*";
var pop = (object, key) => {
  const ret = object[key] || null;
  delete object[key];
  return ret;
};
var responsiveRootFn = (widget) => widget.responsiveRoot;
var scoring = {
  number: (threshold) => ({ width }) => width <= threshold && threshold
};
var splitConfigs = (configs) => {
  delete configs.once;
  return {
    callback: pop(configs, "callback"),
    configs,
    when: pop(configs, "when")
  };
};
var splitMergedConfigs = (cls, ...parts) => {
  const once = parts.flatMap((p) => (p == null ? void 0 : p.once) || EMPTY), configs = cls.mergeConfigs(...parts), ret = splitConfigs(configs);
  ret.once = once.length ? splitConfigs(cls.mergeConfigs(...once)) : null;
  return ret;
};
var wrapWidget = (widget, handler) => {
  let triggers, desc = Proxy.revocable(widget, {
    get(o, name) {
      if (triggers) {
        triggers[name] = true;
      }
      return widget[name];
    }
  }), detacher = FunctionHelper.after(widget, "onConfigChange", (ignore, { name }) => {
    if (triggers == null ? void 0 : triggers[name]) {
      handler();
    }
  }), resizer = widget.ion({
    resize: () => {
      handler();
    }
  });
  widget.monitorResize = true;
  return {
    widget,
    get object() {
      return desc == null ? void 0 : desc.proxy;
    },
    destroy() {
      if (desc) {
        desc.revoke();
        detacher();
        resizer();
        desc = detacher = resizer = null;
      }
    },
    reset() {
      triggers = /* @__PURE__ */ Object.create(null);
    }
  };
};
var Responsive_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base).mixin(Delayable_default, Fencible_default) {
    get isResponsivePending() {
      return this.responsiveUpdateCount === 0 && this.hasConfig("responsive");
    }
    get isResponsiveUpdating() {
      var _a2;
      return this._responsiveUpdating || ((_a2 = this.responsiveWidget) == null ? void 0 : _a2._responsiveUpdating);
    }
    // responsive
    updateResponsive(responsive) {
      var _a2;
      const me = this, cls = me.constructor, { responsiveDefaults } = me, stateNames = Array.from(
        new Set(ObjectHelper.keys(responsive).concat(ObjectHelper.keys(responsiveDefaults)))
      ).filter(isStateName);
      let states = null, hasWhen, name, state, when;
      if (responsive) {
        states = {
          "*": splitMergedConfigs(cls, responsiveDefaults["*"], responsive["*"])
        };
        for (name of stateNames) {
          state = responsive[name];
          if (state !== null && state !== false) {
            hasWhen = hasWhen || state && "when" in state;
            states[name] = splitMergedConfigs(
              cls,
              responsiveDefaults["*"],
              responsiveDefaults[name],
              responsive["*"],
              state
            );
            when = states[name].when;
            states[name].when = ((_a2 = scoring[typeof when]) == null ? void 0 : _a2.call(scoring, when)) || when;
          }
        }
      }
      me.$responsiveStates = states;
      me.$responsiveWhen = hasWhen;
      me.syncResponsiveWidget();
    }
    // responsiveState
    updateResponsiveState(state, oldState) {
      var _a2, _b, _c, _d, _e;
      const me = this, { $responsiveStates: states } = me, initial = ++me.responsiveStateChanges === 1, classList = (_a2 = me.element) == null ? void 0 : _a2.classList, defaults = states["*"], def = states[state] || defaults, once = initial && (def.once || defaults.once), isStateful = initial && me.isStateful, target = me.responsiveWidget;
      let config = def.configs, otherConfigs = once == null ? void 0 : once.configs;
      if (otherConfigs) {
        config = config ? me.constructor.mergeConfigs(config, otherConfigs) : otherConfigs;
      }
      oldState && (classList == null ? void 0 : classList.remove(`b-responsive-${oldState.toLowerCase()}`));
      state && (classList == null ? void 0 : classList.add(`b-responsive-${state.toLowerCase()}`));
      if (isStateful) {
        otherConfigs = me.loadStatefulData();
        if (otherConfigs) {
          config = config ? me.constructor.mergeConfigs(config, otherConfigs) : otherConfigs;
        }
        me.suspendStateful();
      }
      me._responsiveUpdating = true;
      try {
        (_b = me.trigger) == null ? void 0 : _b.call(me, "beforeResponsiveStateChange", { state, oldState, target });
        config && me.setConfig(config);
        (_c = def.callback) == null ? void 0 : _c.call(def, { source: me, state, oldState, target, initial });
        (_d = once == null ? void 0 : once.callback) == null ? void 0 : _d.call(once, { source: me, state, oldState, target, initial });
        (_e = me.trigger) == null ? void 0 : _e.call(me, "responsiveStateChange", { state, oldState, target });
      } finally {
        me._responsiveUpdating = false;
        isStateful && me.resumeStateful();
      }
    }
    // responsiveTarget
    get responsiveTarget() {
      return this.responsiveWidget || this._responsiveTarget;
    }
    updateResponsiveTarget() {
      this.syncResponsiveWidget();
    }
    // responsiveWidget
    updateResponsiveWidget(target) {
      var _a2;
      const me = this, responsiveUpdate = target && me.responsiveUpdate;
      (_a2 = me.$responsiveWrapper) == null ? void 0 : _a2.destroy();
      me.$responsiveWrapper = target && wrapWidget(target, responsiveUpdate);
      responsiveUpdate == null ? void 0 : responsiveUpdate.now();
    }
    // Support methods
    responsiveUpdate() {
      const me = this, { $responsiveStates: states, $responsiveWrapper: wrapper } = me, responsiveTarget = wrapper == null ? void 0 : wrapper.widget;
      if (states && wrapper) {
        let best = null, bestScore = 0, fromWhen = states, score, state;
        if (responsiveTarget && responsiveTarget !== me && !me.$responsiveWhen) {
          responsiveTarget.getConfig("responsive");
          fromWhen = responsiveTarget.$responsiveStates || fromWhen;
        }
        wrapper.reset();
        for (state in states) {
          if (state !== "*") {
            score = fromWhen[state].when(wrapper.object, BrowserHelper);
            if (score != null && score !== false && (!best || score < bestScore)) {
              best = state;
              bestScore = score;
            }
          }
        }
        ++me.responsiveUpdateCount;
        me.responsiveState = best;
      }
    }
    syncResponsiveWidget() {
      var _a2;
      const me = this;
      let widget = null, responsiveTarget;
      if (!me.isDestroying && me.responsive) {
        responsiveTarget = me.responsiveTarget;
        if (!(widget = responsiveTarget)) {
          widget = !me.responsiveRoot && ((_a2 = me.up) == null ? void 0 : _a2.call(me, responsiveRootFn)) || me;
        } else if (typeof responsiveTarget === "string") {
          widget = responsiveTarget === "@" ? me : responsiveTarget[0] === "@" ? me[responsiveTarget.substring(1)] : me.up(responsiveTarget);
          if (!widget) {
            throw new Error(`No match for responsiveTarget="${responsiveTarget}"`);
          }
        }
        if (!widget.isWidget) {
          throw new Error(`${widget.constructor.$$name} is not a widget and cannot be a responsiveTarget`);
        }
      }
      me.responsiveWidget = widget;
      return widget;
    }
    changeBreakpoints(breakpoints) {
      ObjectHelper.assertObject(breakpoints, "breakpoints");
      if (breakpoints == null ? void 0 : breakpoints.width) {
        Object.keys(breakpoints.width).forEach((key) => {
          breakpoints.width[key].maxWidth = key;
        });
      }
      if (breakpoints == null ? void 0 : breakpoints.height) {
        Object.keys(breakpoints.height).forEach((key) => {
          breakpoints.height[key].maxHeight = key;
        });
      }
      return breakpoints;
    }
    updateBreakpoints(breakpoints) {
      if (breakpoints) {
        this.monitorResize = true;
      }
    }
    // Get a width/height breakpoint for the supplied dimension
    getBreakpoint(levels, dimension) {
      const ascendingLevels = Object.keys(levels).map((l) => parseInt(l)).sort(), breakpoint = ascendingLevels.find((bp) => dimension <= bp);
      return levels[breakpoint != null ? breakpoint : levels["*"] && "*"];
    }
    // Apply a breakpoints configs, trigger event and call any callback
    activateBreakpoint(orientation, breakpoint) {
      var _a2, _b;
      const me = this, prevBreakpoint = me[`current${orientation}Breakpoint`];
      if (breakpoint !== prevBreakpoint) {
        me[`current${orientation}Breakpoint`] = breakpoint;
        me.setConfig(breakpoint.configs);
        prevBreakpoint && me.element.classList.remove(`b-breakpoint-${prevBreakpoint.name.toLowerCase()}`);
        me.element.classList.add(`b-breakpoint-${breakpoint.name.toLowerCase()}`);
        me.trigger(`responsive${orientation}Change`, { breakpoint, prevBreakpoint });
        (_a2 = breakpoint.callback) == null ? void 0 : _a2.call(breakpoint, { source: me, breakpoint, prevBreakpoint });
        (_b = me.recompose) == null ? void 0 : _b.call(me);
      }
    }
    // Called on resize to pick and apply a breakpoint, if size changed enough
    applyResponsiveBreakpoints(width, height) {
      var _a2;
      const me = this, {
        width: widths,
        height: heights
      } = (_a2 = me.breakpoints) != null ? _a2 : {};
      if (widths) {
        const breakpoint = me.getBreakpoint(widths, width);
        me.activateBreakpoint("Width", breakpoint);
      }
      if (heights) {
        const breakpoint = me.getBreakpoint(heights, height);
        me.activateBreakpoint("Height", breakpoint);
      }
    }
    onInternalResize(element, width, height, oldWidth, oldHeight) {
      super.onInternalResize(element, width, height, oldWidth, oldHeight);
      this.applyResponsiveBreakpoints(width, height);
    }
  }, __publicField(_a, "$name", "Responsive"), __publicField(_a, "configurable", {
    /**
     * Specifies the various responsive state objects keyed by their name. Each key (except `'*'`, see below) in
     * this object is a state name (see {@link #config-responsiveState}) and its corresponding value is the
     * associated {@link #typedef-ResponsiveState} object.
     *
     * Some properties of a `ResponsiveState` object are special, for example `when` and `callback`. All other
     * properties of the state object are config properties to apply when that state is active.
     *
     * The `when` property can be a function that computes the score for the state. The state whose `when` function
     * returns the lowest score is selected and its non-special properties will be assigned to the instance. If
     * `when` is a number, it will be converted into a scoring function (see below).
     *
     * A `when` function accepts two readonly parameters and returns either a numeric score if the state should be
     * considered, or `false` or `null` if the state should be ignored (i.e., it does match with the current state).
     *
     * The first parameter is a readonly proxy for the {@link #config-responsiveTarget widget} whose size and other
     * properties determine the state's score. The proxy tracks property access to that widget in order to update
     * the responsive state should any of those properties change.
     *
     * The second argument to a `when` function is the {@link Core.helper.BrowserHelper} singleton. This allows
     * a `when` function to conveniently test platform and browser information.
     *
     * The state whose `when` function returns the lowest score is selected as the new
     * {@link #config-responsiveState} and its config object (minus the `when` function and other special
     * properties) is applied to the instance.
     *
     * If `when` is a number, it is converted to function. The following two snippets produce the same `when`
     * scoring:
     *
     * ```javascript
     *      small : {
     *          when : 400,
     *          ...
     *      }
     * ```
     *
     * The above converted to:
     *
     * ```javascript
     *      small : {
     *          when : ({ width }) => width <= 400 && 400,
     *          ...
     *      }
     * ```
     * Selecting the lowest score as the winner allows for the simple conversion of width threshold to score value,
     * such that the state with the smallest matching width is selected.
     *
     * If the `responsive` config object has an asterisk key (`'*'`), its value is used as the default set of config
     * properties to apply all other states. This will be the only config properties to apply if no `when` function
     * returns a score. In this way, this special state object acts as a default state as well as a set of
     * default values for other states to share. This state object has no `when` function.
     *
     * The default for this config is:
     * ```javascript
     *  {
     *      small : {
     *          when : 400
     *      },
     *
     *      medium : {
     *          when : 800
     *      },
     *
     *      large : {
     *          when : () => Infinity
     *      },
     *
     *      '*' : {}
     *  }
     * ```
     *
     * A derived class (or instance) can use these states by populating other config properties, define
     * additional states, and/or adjust the `when` properties to use different size thresholds.
     *
     * @config {Object}
     */
    responsive: {
      $config: {
        lazy: "paint"
      },
      value: null
    },
    /**
     * The defaults for the {@link #config-responsive} config. These are separated so that the act of setting the
     * {@link #config-responsive} config is what triggers additional processing.
     * @config {Object}
     * @internal
     * @default
     */
    responsiveDefaults: {
      small: {
        when: 400
      },
      medium: {
        when: 800
      },
      large: {
        when: () => Infinity
      },
      "*": {}
    },
    /**
     * Set to `true` to mark this instance as the default {@link #config-responsiveTarget} for descendants that do
     * not specify an explicit {@link #config-responsiveTarget} of their own.
     * @config {Boolean}
     * @default false
     */
    responsiveRoot: null,
    /**
     * The name of the active state of the {@link #config-responsive} config. This is assigned internally
     * and should not be assigned directly.
     *
     * @config {String}
     * @readonly
     */
    responsiveState: null,
    /**
     * The widget whose size and other properties drive this object's responsive behavior. If this config is not
     * specified, the closest ancestor that specified {@link #config-responsiveRoot responsiveRoot=true} will be
     * used. If there is no such ancestor, then the instance using this mixin is used.
     *
     * If this value is set to `'@'`, then this instance is used even if there is a {@link #config-responsiveRoot}
     * ancestor.
     *
     * If this config is a string that starts with `'@'`, the text following the first character is the name of the
     * property on this instance that holds the target to use. For example, `'@owner'` to use the value of the
     * `owner` property as the responsive target.
     *
     * If this config is a string that does not start with `'@'`, that string is passed to
     * {@link Core.widget.Widget#function-up} to find the closest matching ancestor.
     *
     * If another widget is used as the `responsiveTarget` and if this instance does not specify any explicit `when`
     * properties in its {@link #config-responsive} config, then the `when` definitions of the `responsiveTarget`
     * will be used for this instance.
     * @config {String|Core.widget.Widget}
     */
    responsiveTarget: {
      value: null,
      $config: {
        lazy: "paint"
      }
    },
    responsiveWidget: {
      value: null,
      $config: {
        nullify: true
      }
    },
    /**
     * Defines responsive breakpoints, based on max-width or max-height.
     *
     * When the widget is resized, the defined breakpoints are queried to find the closest larger or equal
     * breakpoint for both width and height. If the found breakpoint differs from the currently applied, it is
     * applied.
     *
     * Applying a breakpoint triggers an event that applications can catch to react to the change. It also
     * optionally applies a set of configs and calls a configured callback.
     *
     * ```javascript
     * breakpoints : {
     *     width : {
     *         50 : { name : 'small', configs : { text : 'Small', ... } }
     *         100 : { name : 'medium', configs : { text : 'Medium', ... } },
     *         '*' : { name : 'large', configs : { text : 'Large', ... } }
     *     }
     * }
     * ```
     *
     * @config {Object}
     * @param {Object} width Max-width breakpoints, with keys as numerical widths (or '*' for larger widths than the
     * largest defined one) and the value as a {@link #typedef-Breakpoint breakpoint definition}
     * @param {Object} height Max-height breakpoints, with keys as numerical heights (or '*' for larger widths than
     * the largest defined one) and the value as a {@link #typedef-Breakpoint breakpoint definition}
     * @deprecated 5.0 Use {@link #config-responsive} instead.
     */
    breakpoints: null
  }), __publicField(_a, "delayable", {
    responsiveUpdate: "raf"
  }), __publicField(_a, "fenced", {
    syncResponsiveWidget: true
  }), __publicField(_a, "prototypeProperties", {
    responsiveStateChanges: 0,
    responsiveUpdateCount: 0
  }), _a;
};

export {
  Featureable_default,
  Fencible_default,
  FilterField,
  Responsive_default
};
//# sourceMappingURL=chunk-XMY3DSSV.js.map
