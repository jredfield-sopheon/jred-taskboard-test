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
  TimeField
} from "./chunk-6ZLMCHE5.js";
import {
  DateHelper,
  EventHelper,
  Field,
  Layout,
  ObjectHelper,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/DateTimeField.js
var midnightDate = new Date(2e3, 0, 1);
var DateTimeField = class extends Field {
  doDestroy() {
    this.dateField.destroy();
    this.timeField.destroy();
    super.doDestroy();
  }
  get focusElement() {
    return this.dateField.input;
  }
  // Implementation needed at this level because it has two inner elements in its inputWrap
  get innerElements() {
    return [
      this.dateField.element,
      this.timeField.element
    ];
  }
  // Each subfield handles its own keystrokes
  internalOnKeyEvent() {
  }
  // CellEdit sets this dynamically on its editor field
  updateRevertOnEscape(revertOnEscape) {
    this.timeField.revertOnEscape = revertOnEscape;
    this.dateField.revertOnEscape = revertOnEscape;
  }
  // Converts the timeField config into a TimeField
  changeTimeField(config) {
    const me = this, result = TimeField.new({
      revertOnEscape: me.revertOnEscape,
      syncInvalid(...args) {
        const updatingInvalid = me.updatingInvalid;
        TimeField.prototype.syncInvalid.apply(this, args);
        me.timeField && !updatingInvalid && me.syncInvalid();
      }
    }, config);
    EventHelper.on({
      element: result.element,
      keydown: "onTimeFieldKeyDown",
      thisObj: me
    });
    if (me.readOnly) {
      result.readOnly = true;
    }
    return result;
  }
  // Set up change listener when TimeField is available. Not in timeField config to enable users to supply their own
  // listeners block there
  updateTimeField(timeField) {
    const me = this;
    timeField.ion({
      change({ userAction, value }) {
        if (userAction && !me.$settingValue) {
          const dateAndTime = me.dateField.value;
          me._isUserAction = true;
          me.value = dateAndTime ? DateHelper.copyTimeValues(new Date(dateAndTime), value || midnightDate) : null;
          me._isUserAction = false;
        }
      },
      thisObj: me
    });
  }
  // Converts the dateField config into a class based on { type : "..." } provided (DateField by default)
  changeDateField(config) {
    const me = this, type = (config == null ? void 0 : config.type) || "datefield", cls = Widget.resolveType(config.type || "datefield"), result = Widget.create(ObjectHelper.assign({
      type,
      revertOnEscape: me.revertOnEscape,
      syncInvalid(...args) {
        const updatingInvalid = me.updatingInvalid;
        cls.prototype.syncInvalid.apply(this, args);
        me.dateField && !updatingInvalid && me.syncInvalid();
      }
    }, config));
    EventHelper.on({
      element: result.element,
      keydown: "onDateFieldKeyDown",
      thisObj: me
    });
    if (me.readOnly) {
      result.readOnly = true;
    }
    result.ion({
      keydown: ({ event }) => {
        var _a;
        if (event.key === "Tab" && !event.shiftKey && ((_a = this.timeField) == null ? void 0 : _a.isVisible)) {
          event.stopPropagation();
          event.cancelBubble = true;
        }
      }
    });
    return result;
  }
  get childItems() {
    return [this.dateField, this.timeField];
  }
  // Set up change listener when DateField is available. Not in dateField config to enable users to supply their own
  // listeners block there
  updateDateField(dateField) {
    const me = this;
    dateField.ion({
      change({ userAction, value }) {
        if (userAction && !me.$isInternalChange) {
          me._isUserAction = true;
          me.timeField.value = value;
          me.value = value;
          me._isUserAction = false;
        }
      },
      thisObj: me
    });
  }
  updateWeekStartDay(weekStartDay) {
    if (this.dateField) {
      this.dateField.weekStartDay = weekStartDay;
    }
  }
  changeWeekStartDay(value) {
    var _a, _b;
    return typeof value === "number" ? value : (_b = (_a = this.dateField) == null ? void 0 : _a.weekStartDay) != null ? _b : DateHelper.weekStartDay;
  }
  // Apply our value to our underlying fields
  syncInputFieldValue(skipHighlight = this.isConfiguring) {
    super.syncInputFieldValue(true);
    const me = this, { dateField, timeField } = me, highlightDate = dateField.highlightExternalChange, highlightTime = timeField.highlightExternalChange;
    if (!skipHighlight && !me.highlightExternalChange) {
      skipHighlight = true;
    }
    me.$isInternalChange = true;
    dateField.highlightExternalChange = false;
    dateField.highlightExternalChange = highlightDate;
    if (skipHighlight) {
      timeField.highlightExternalChange = dateField.highlightExternalChange = false;
    }
    timeField.value = dateField.value = me.inputValue;
    dateField.highlightExternalChange = highlightDate;
    timeField.highlightExternalChange = highlightTime;
    me.$isInternalChange = false;
    me.syncInvalid();
  }
  onTimeFieldKeyDown(e) {
    const me = this;
    if (e.key === "Enter" || e.key === "Tab") {
      const dateAndTime = me.dateField.value;
      me._isUserAction = true;
      me.value = dateAndTime ? DateHelper.copyTimeValues(new Date(dateAndTime), me.timeField.value || midnightDate) : null;
      me._isUserAction = false;
    }
  }
  onDateFieldKeyDown(e) {
    const me = this;
    if (e.key === "Tab" && !e.shiftKey) {
      e.stopPropagation();
      e.preventDefault();
      me.timeField.focus();
    } else if (e.key === "Enter") {
      me.value = me.dateField.value;
    }
  }
  // Make us and our underlying fields required
  updateRequired(required, was) {
    this.timeField.required = this.dateField.required = required;
  }
  updateReadOnly(readOnly, was) {
    super.updateReadOnly(readOnly, was);
    if (!this.isConfiguring) {
      this.timeField.readOnly = this.dateField.readOnly = readOnly;
    }
  }
  // Make us and our underlying fields disabled
  onDisabled(value) {
    this.timeField.disabled = this.dateField.disabled = value;
  }
  focus() {
    this.dateField.focus();
  }
  hasChanged(oldValue, newValue) {
    return !DateHelper.isEqual(oldValue, newValue);
  }
  get isValid() {
    return this.timeField.isValid && this.dateField.isValid;
  }
  setError(error, silent) {
    [this.dateField, this.timeField].forEach((f) => f.setError(error, silent));
  }
  getErrors() {
    const errors = [...this.dateField.getErrors() || [], ...this.timeField.getErrors() || []];
    return errors.length ? errors : null;
  }
  clearError(error, silent) {
    [this.dateField, this.timeField].forEach((f) => f.clearError(error, silent));
  }
  updateInvalid() {
    this.updatingInvalid = true;
    [this.dateField, this.timeField].forEach((f) => f.updateInvalid());
    this.updatingInvalid = false;
  }
};
__publicField(DateTimeField, "$name", "DateTimeField");
__publicField(DateTimeField, "type", "datetimefield");
__publicField(DateTimeField, "alias", "datetime");
__publicField(DateTimeField, "configurable", {
  /**
   * Returns the TimeField instance
   * @readonly
   * @member {Core.widget.TimeField} timeField
   */
  /**
   * Configuration for the {@link Core.widget.TimeField}
   * @config {TimeFieldConfig}
   */
  timeField: {},
  /**
   * Returns the DateField instance
   * @readonly
   * @member {Core.widget.DateField} dateField
   */
  /**
   * Configuration for the {@link Core.widget.DateField}
   * @config {DateFieldConfig}
   */
  dateField: {
    // To be able to use transformDateValue for parsing without loosing time, a bit of a hack
    keepTime: true,
    step: "1 d"
  },
  /**
   * The week start day in the {@link Core.widget.DateField#config-picker}, 0 meaning Sunday, 6 meaning Saturday.
   * Uses localized value per default.
   *
   * @config {Number}
   */
  weekStartDay: null,
  inputTemplate: () => "",
  ariaElement: "element"
});
DateTimeField.initClass();
DateTimeField._$name = "DateTimeField";

// ../Core/lib/Core/widget/layout/Card.js
var animationClasses = [
  "b-slide-out-left",
  "b-slide-out-right",
  "b-slide-in-left",
  "b-slide-in-right"
];
var Card = class extends Layout {
  onChildAdd(item) {
    super.onChildAdd(item);
    const me = this, {
      activeItem,
      owner
    } = me, activeIndex = owner.activeIndex != null ? owner.activeIndex : me.activeIndex || 0, itemIndex = owner.items.indexOf(item), isActive = activeItem != null ? item === activeItem : itemIndex === activeIndex;
    item.ion({
      beforeHide: "onBeforeChildHide",
      beforeShow: "onBeforeChildShow",
      thisObj: me
    });
    if (isActive) {
      me._activeIndex = itemIndex;
      me._activeItem = item;
      item.show();
    } else {
      item.$isDeactivating = true;
      item.hide();
      item.$isDeactivating = false;
    }
  }
  onChildRemove(item) {
    super.onChildRemove(item);
    const me = this;
    if (me._activeItem === item) {
      me.activateSiblingOf(item);
    }
    me._activeIndex = me.owner.items.indexOf(me._activeItem);
    item.un({
      beforeHide: "onBeforeChildHide",
      beforeShow: "onBeforeChildShow",
      thisObj: me
    });
  }
  /**
   * Detect external code showing a child. We veto that show and activate it through the API.
   * @internal
   */
  onBeforeChildShow({ source: showingChild }) {
    if (!this.owner.isConfiguring && !showingChild.$isActivating) {
      this.activeItem = showingChild;
      return false;
    }
  }
  /**
   * Detect external code hiding a child. We veto that show and activate an immediate sibling through the API.
   * @internal
   */
  onBeforeChildHide({ source: hidingChild }) {
    if (!this.owner.isConfiguring && !hidingChild.$isDeactivating) {
      this.activateSiblingOf(hidingChild);
      return false;
    }
  }
  activateSiblingOf(item) {
    const { owner } = this, items = owner.items.slice(), removeAt = items.indexOf(item);
    items.splice(removeAt, 1);
    this.activeIndex = Math.min(removeAt, items.length - 1);
  }
  /**
   * Get/set active item, using index or the Widget to activate
   * @param {Core.widget.Widget|Number} activeIndex
   * @param {Number} [prevActiveIndex]
   * @param {Object} [options]
   * @param {Boolean} [options.animation] Pass `false` to disable animation
   * @param {Boolean} [options.silent] Pass `true` to not fire transition events
   * @returns {Object} An object describing the card change containing the following properties:
   *  - `prevActiveIndex` The previously active index.
   *  - `prevActiveItem ` The previously active child item.
   *  - `activeIndex    ` The newly active index.
   *  - `activeItem     ` The newly active child item.
   *  - `promise        ` A promise which completes when the slide-in animation finishes and the child item contains
   * focus if it is focusable.
   * @internal
   */
  setActiveItem(activeIndex, prevActiveIndex = this.activeIndex, options) {
    var _a;
    const me = this, { owner } = me, { items } = owner, widgetPassed = activeIndex instanceof Widget, prevActiveItem = items[prevActiveIndex], newActiveItem = owner.items[activeIndex = widgetPassed ? items.indexOf(activeIndex) : parseInt(activeIndex, 10)], animation = (options == null ? void 0 : options.animation) !== false, chatty = !(options == null ? void 0 : options.silent), event = {
      prevActiveIndex,
      prevActiveItem
    };
    if (newActiveItem && !newActiveItem.$isActivating && newActiveItem !== prevActiveItem) {
      const prevItemElement = prevActiveItem && prevActiveItem.element, newActiveElement = newActiveItem && newActiveItem.element;
      if (me.animateDetacher) {
        const activeCardChange = me.animateDetacher.event;
        if (activeCardChange.activeItem === newActiveItem) {
          return activeCardChange.promise;
        }
        me.animateDetacher();
        activeCardChange.prevActiveItem.element.classList.remove(...animationClasses);
        activeCardChange.activeItem.element.classList.remove(...animationClasses);
        me.animateDetacher = null;
      }
      event.activeIndex = activeIndex;
      event.activeItem = newActiveItem;
      if (chatty && owner.trigger("beforeActiveItemChange", event) === false) {
        return null;
      }
      const reset = me._activeIndex !== event.activeIndex;
      if (reset) {
        me._activeIndex = event.activeIndex;
      }
      chatty && ((_a = owner.onBeginActiveItemChange) == null ? void 0 : _a.call(owner, event));
      if (reset) {
        me._activeIndex = event.prevActiveIndex;
      }
      if (animation && prevItemElement && owner.isVisible && me.animateCardChange) {
        event.promise = me.cardChangeAnimation = new Promise((resolve, reject) => {
          const wasMonitoringSize = prevActiveItem.monitorResize;
          prevActiveItem.monitorResize = false;
          me.contentElement.style.overflowX = "hidden";
          prevActiveItem._hidden = true;
          newActiveItem.$isActivating = true;
          newActiveItem.show();
          newActiveItem.$isActivating = false;
          prevItemElement.classList.add(activeIndex > prevActiveIndex ? "b-slide-out-left" : "b-slide-out-right");
          newActiveElement.classList.add(activeIndex < prevActiveIndex ? "b-slide-in-left" : "b-slide-in-right");
          owner.isAnimating = true;
          me.animateDetacher = EventHelper.onTransitionEnd({
            mode: "animation",
            element: newActiveElement,
            // onTransitionEnd protects us from being called
            // after the thisObj is destroyed.
            thisObj: prevActiveItem,
            handler() {
              owner.isAnimating = me.cardChangeAnimation = false;
              if (!me.animateDetacher) {
                me.setActiveItem(activeIndex, prevActiveIndex, options);
                return;
              }
              me.animateDetacher = null;
              newActiveElement.classList.remove(...animationClasses);
              if (prevItemElement) {
                prevItemElement.classList.remove(...animationClasses);
                prevActiveItem.$isDeactivating = true;
                prevActiveItem._hidden = false;
                prevActiveItem.hide();
                prevActiveItem.monitorResize = wasMonitoringSize;
                prevActiveItem.$isDeactivating = false;
              }
              me.contentElement.style.overflowX = "";
              me.onActiveItemChange(event, resolve, !chatty);
            }
          });
          me.animateDetacher.reject = reject;
          me.animateDetacher.event = event;
        });
      } else {
        newActiveItem.$isActivating = true;
        newActiveItem.show();
        newActiveItem.focus();
        newActiveItem.$isActivating = false;
        if (prevActiveItem) {
          prevActiveItem.$isDeactivating = true;
          prevActiveItem.hide();
          prevActiveItem.$isDeactivating = false;
        }
        me.onActiveItemChange(event, null, !chatty);
      }
    }
    return event;
  }
  onActiveItemChange(event, resolve, silent) {
    const me = this;
    me._activeItem = event.activeItem;
    me._activeIndex = event.activeIndex;
    !silent && me.owner.trigger("activeItemChange", event);
    me.owner.containsFocus && event.activeItem.focus();
    resolve == null ? void 0 : resolve(event);
  }
  renderChildren() {
    const { owner } = this;
    owner.contentElement.classList.toggle(this.hideChildHeaderCls, owner.suppressChildHeaders);
    super.renderChildren();
  }
  changeActiveIndex(activeIndex) {
    const { owner } = this;
    return owner.isConfiguring && !owner._items ? activeIndex : Math.min(activeIndex, owner.items.length - 1);
  }
  updateActiveIndex(activeIndex, oldActiveIndex) {
    if (!this.owner.isConfiguring) {
      this.setActiveItem(activeIndex, oldActiveIndex);
    }
  }
  updateActiveItem(activeItem) {
    if (!this.owner.isConfiguring) {
      this.setActiveItem(activeItem, this.activeIndex);
    }
  }
  /**
   * If the layout is set to {@link #config-animateCardChange}, then this property
   * will be `true` during the animated card change.
   * @property {Boolean}
   * @readonly
   */
  get isChangingCard() {
    return Boolean(this.animateDetacher);
  }
};
__publicField(Card, "$name", "Card");
__publicField(Card, "type", "card");
__publicField(Card, "configurable", {
  containerCls: "b-card-container",
  itemCls: "b-card-item",
  hideChildHeaderCls: "b-hide-child-headers",
  /**
   * Specifies whether to slide tabs in and out of visibility.
   * @config {Boolean}
   * @default
   */
  animateCardChange: true,
  /**
   * The active child item.
   * @config {Core.widget.Widget}
   */
  activeItem: null,
  /**
   * The active child index.
   * @config {Number}
   */
  activeIndex: null
});
Card.initClass();
Card._$name = "Card";

export {
  DateTimeField
};
//# sourceMappingURL=chunk-AWEOM52O.js.map
