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
  ObjectHelper,
  StringHelper,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/mixin/Styleable.js
var Styleable_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    changeCssVarPrefix(prefix) {
      ObjectHelper.assertString(prefix, "prefix");
      if (prefix && !prefix.endsWith("-")) {
        prefix = prefix + "-";
      }
      return prefix || "";
    }
    changeCss(css) {
      ObjectHelper.assertObject(css, "css");
      const me = this;
      if (!globalThis.Proxy) {
        throw new Error("Proxy not supported");
      }
      const proxy = new Proxy({}, {
        get(target, property) {
          var _a2;
          const styles = getComputedStyle(me.element || document.documentElement);
          return (_a2 = styles.getPropertyValue(`--${me.cssVarPrefix}${StringHelper.hyphenate(property)}`)) == null ? void 0 : _a2.trim();
        },
        set(target, property, value) {
          const element = me.element || document.documentElement;
          element.style.setProperty(`--${me.cssVarPrefix}${StringHelper.hyphenate(property)}`, value);
          return true;
        }
      });
      if (css) {
        if (me._element) {
          ObjectHelper.assign(proxy, css);
        } else {
          me.$initialCSS = css;
        }
      }
      return proxy;
    }
    // Apply any initially supplied CSS when we have an element
    updateElement(element, ...args) {
      super.updateElement(element, ...args);
      if (this.$initialCSS) {
        ObjectHelper.assign(this.css, this.$initialCSS);
      }
    }
    get widgetClass() {
    }
  }, __publicField(_a, "$name", "Styleable"), __publicField(_a, "configurable", {
    /**
     * CSS variable prefix, appended to the keys used in {@link #config-css}.
     *
     * For example:
     *
     * ```javascript
     * {
     *    cssVarPrefix : 'taskboard',
     *
     *    css : {
     *        cardBackground : '#333'
     *    }
     * }
     * ```
     *
     * Results in the css var `--taskboard-card-background` being set to `#333`.
     * @config {String}
     * @category CSS
     */
    cssVarPrefix: "",
    /**
     * Allows runtime manipulating of CSS variables.
     *
     * See {@link #config-css} for more information.
     *
     * ```javascript
     * taskBoard.css.columnBackground = '#ccc';
     *
     * // Will set "--taskboard-column-background : #ccc"
     * ```
     *
     * @member {Proxy} css
     * @typings {typeof Proxy}
     * @category DOM
     */
    /**
     * Initial CSS variables to set.
     *
     * Each key will be applied as a CSS variable to the target elements style. Key names are hyphenated and
     * prefixed with {@link #config-cssVarPrefix} in the process. For example:
     *
     * ```javascript
     * {
     *    cssVarPrefix : 'taskboard',
     *
     *    css : {
     *        cardBackground : '#333'
     *    }
     * }
     * ```
     *
     * Results in the css var `--taskboard-card-background` being set to `#333`.
     *
     * @config {Object}
     * @category CSS
     */
    css: {}
  }), _a;
};

export {
  Styleable_default
};
//# sourceMappingURL=chunk-VCPKNRNI.js.map
