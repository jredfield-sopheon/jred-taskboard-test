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
  ArrayHelper,
  Base,
  Button,
  Checkbox,
  DomClassList,
  DomHelper,
  Events_default,
  FunctionHelper,
  GlobalEvents_default,
  Labelable_default,
  ObjectHelper,
  Panel,
  Toolbar,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/util/WebSocketManager.js
var WebSocketManager = class extends Events_default(Base) {
  construct(config = {}) {
    const me = this;
    super.construct(config);
    me.onWsOpen = me.onWsOpen.bind(me);
    me.onWsClose = me.onWsClose.bind(me);
    me.onWsMessage = me.onWsMessage.bind(me);
    me.onWsError = me.onWsError.bind(me);
    if (me.autoConnect && me.address) {
      me.open();
    }
  }
  doDestroy() {
    const me = this;
    if (me.connector) {
      me.detachSocketListeners(me.connector);
      me.connector.close();
      me.connector = null;
    }
    super.doDestroy();
  }
  //#region Websocket state
  get isConnecting() {
    var _a;
    return ((_a = this.connector) == null ? void 0 : _a.readyState) === this.constructor.webSocketImplementation.CONNECTING;
  }
  get isOpened() {
    var _a;
    return ((_a = this.connector) == null ? void 0 : _a.readyState) === this.constructor.webSocketImplementation.OPEN;
  }
  get isClosing() {
    var _a;
    return ((_a = this.connector) == null ? void 0 : _a.readyState) === this.constructor.webSocketImplementation.CLOSING;
  }
  get isClosed() {
    var _a;
    return ((_a = this.connector) == null ? void 0 : _a.readyState) === this.constructor.webSocketImplementation.CLOSED;
  }
  //#endregion
  //#region Websocket init
  createWebSocketConnector() {
    const connector = this.connector = new this.constructor.webSocketImplementation(this.address);
    this.attachSocketListeners(connector);
  }
  destroyWebSocketConnector() {
    this.detachSocketListeners(this.connector);
    this.connector.close();
    this.connector = null;
  }
  attachSocketListeners(connector) {
    const me = this;
    connector.addEventListener("open", me.onWsOpen);
    connector.addEventListener("close", me.onWsClose);
    connector.addEventListener("message", me.onWsMessage);
    connector.addEventListener("error", me.onWsError);
  }
  detachSocketListeners(connector) {
    const me = this;
    connector.removeEventListener("open", me.onWsOpen);
    connector.removeEventListener("close", me.onWsClose);
    connector.removeEventListener("message", me.onWsMessage);
    connector.removeEventListener("error", me.onWsError);
  }
  //#endregion
  //#region Websocket methods
  /**
   * Connect to the server and start listening for messages
   * @returns {Promise} Returns true if connection was successful and false otherwise
   */
  async open() {
    const me = this;
    if (me._openPromise) {
      return me._openPromise;
    }
    if (!me.address) {
      console.warn("Server me.address cannot be empty");
      return;
    }
    if (me.isOpened) {
      return true;
    }
    me.createWebSocketConnector();
    let detacher;
    me._openPromise = new Promise((resolve) => {
      detacher = me.ion({
        open() {
          resolve(true);
        },
        error() {
          resolve(false);
        }
      });
    }).then((value) => {
      detacher();
      me._openPromise = null;
      if (!value) {
        me.destroyWebSocketConnector();
      }
      return value;
    }).catch(() => {
      me._openPromise = null;
      me.destroyWebSocketConnector();
    });
    return me._openPromise;
  }
  /**
   * Close socket and disconnect from the server
   */
  close() {
    if (this.connector) {
      this.destroyWebSocketConnector();
      this.trigger("close");
    }
  }
  /**
   * Send data to the websocket server
   * @param {String} command
   * @param {*} data
   */
  send(command, data = {}) {
    var _a;
    (_a = this.connector) == null ? void 0 : _a.send(JSON.stringify({ command, ...data }));
  }
  //#endregion
  //#region websocket event listeners
  onWsOpen(event) {
    this.trigger("open", { event });
  }
  onWsClose(event) {
    this.trigger("close", { event });
  }
  onWsMessage(message) {
    try {
      const data = JSON.parse(message.data);
      this.trigger("message", { data });
    } catch (error) {
      this.trigger("error", { error });
    }
  }
  onWsError(error) {
    this.trigger("error", { error });
  }
  //#endregion
};
// This allows to hook into for testing purposes
__publicField(WebSocketManager, "webSocketImplementation", typeof WebSocket === "undefined" ? null : WebSocket);
__publicField(WebSocketManager, "configurable", {
  /**
   * WebSocket server address
   * @config {String}
   */
  address: "",
  /**
   * User name allowing to identify client
   * @config {String}
   */
  userName: "User",
  /**
   * Connect to websocket server immediately after instantiation
   * @config {Boolean}
   */
  autoConnect: true
});
WebSocketManager._$name = "WebSocketManager";

// ../Core/lib/Core/widget/FieldSet.js
var FieldSet = class extends Panel.mixin(Labelable_default) {
  static get configurable() {
    return {
      bodyTag: "fieldset",
      focusable: false,
      /**
       * Setting this config to `true` assigns a horizontal box layout (`flex-flow: row`) to the items in this
       * container, while `false` assigns a vertical box layout (`flex-flow: column`).
       *
       * By default, this value is automatically determined based on the {@link #config-label} and
       * {@link #config-labelPosition} configs.
       * @config {Boolean}
       */
      inline: null,
      inlineInternal: null,
      layout: {
        type: "box",
        horizontal: false
      }
    };
  }
  static get prototypeProperties() {
    return {
      flexRowCls: "b-hbox",
      flexColCls: "b-vbox"
    };
  }
  //endregion
  //region Composition
  get bodyConfig() {
    const result = super.bodyConfig, { className } = result, { inlineInternal: inline, hasLabel, title } = this;
    delete result.html;
    className["b-inline"] = inline;
    className["b-fieldset-has-label"] = hasLabel;
    if (title) {
      result.children = {
        // We render the <legend> element for a11y (not 100% sure it is needed)
        legendElement: {
          tag: "legend",
          text: title,
          class: {
            "b-fieldset-legend": 1
          }
        }
      };
    }
    return result;
  }
  compose() {
    const { inlineInternal: inline, label, labelCls, labelWidth } = this;
    return {
      class: {
        "b-field": label,
        "b-vbox": !inline
        // override panel
      },
      children: {
        "labelElement > headerElement": (label || null) && {
          tag: "label",
          html: label,
          class: {
            "b-label": 1,
            "b-align-start": 1,
            [labelCls]: labelCls
          },
          style: {
            width: DomHelper.unitize("width", labelWidth)[1]
          }
        }
      }
    };
  }
  //endregion
  syncInlineInternal() {
    var _a;
    this.inlineInternal = (_a = this.inline) != null ? _a : this.label != null && this.labelPosition === "before";
  }
  updateDisabled(value, was) {
    super.updateDisabled(value, was);
    this.eachWidget(
      (item) => {
        item.disabled = value;
      },
      /* deep = */
      false
    );
  }
  updateInline() {
    this.syncInlineInternal();
  }
  updateInlineInternal(inline) {
    this.layout.horizontal = inline;
  }
  updateLabel() {
    this.syncInlineInternal();
  }
  updateLabelPosition() {
    this.syncInlineInternal();
  }
};
//region Config
__publicField(FieldSet, "$name", "FieldSet");
__publicField(FieldSet, "type", "fieldset");
FieldSet.initClass();
FieldSet._$name = "FieldSet";

// ../Core/lib/Core/widget/Radio.js
var Radio = class extends Checkbox {
  static get configurable() {
    return {
      inputType: "radio",
      /**
       * Set this to `true` so that clicking a checked radio button will clear its checked state.
       * @config {Boolean}
       * @default false
       */
      clearable: null,
      uncheckedValue: void 0
      // won't store to Container#values when unchecked
    };
  }
  //endregion
  //region Init
  get textLabelCls() {
    return super.textLabelCls + " b-radio-label";
  }
  //endregion
  internalOnClick(info) {
    if (super.internalOnClick(info) !== false) {
      if (this.checked && this.clearable) {
        this.checked = false;
      }
    }
  }
  updateName(name) {
    this.toggleGroup = name;
  }
  // Empty override to get rid of clear trigger
  updateClearable() {
  }
};
//region Config
__publicField(Radio, "$name", "Radio");
__publicField(Radio, "type", "radio");
__publicField(Radio, "alias", "radiobutton");
Radio.initClass();
Radio._$name = "Radio";

// ../Core/lib/Core/widget/RadioGroup.js
var RadioGroup = class extends FieldSet {
  static get configurable() {
    return {
      defaultType: "radio",
      /**
       * Set this to `true` so that clicking the currently checked radio button will clear the check from all
       * radio buttons in the group.
       * @config {Boolean}
       * @default false
       */
      clearable: null,
      /**
       * The name by which this widget's {@link #property-value} is accessed using the parent container's
       * {@link Core.widget.Container#property-values}.
       *
       * The config must be provided as it is used to set the {@link Core.widget.Radio#config-name} of the
       * child {@link Core.widget.Radio radio buttons}.
       * @config {String}
       */
      name: null,
      /**
       * The set of radio button options for this radio button group. This is a shorthand for defining these in
       * the {@link Core.widget.Container#config-items}. The keys of this object hold the radio button's
       * {@link Core.widget.Radio#config-checkedValue} while the object values are a string for the radio button's
       * {@link Core.widget.Radio#config-text} or a config object for that radio button.
       *
       * The {@link #property-value} of this radio button group will be one of the keys in this object or `null`
       * if no radio button is checked.
       *
       * For example, consider the following configuration:
       * ```javascript
       *  {
       *      type    : 'radiogroup',
       *      name    : 'resolution',
       *      value   : 'A',
       *      options : {
       *          A : 'Keep the original version',
       *          B : 'Use the new version',
       *          C : 'Reconcile individual conflicts'
       *      }
       *  }
       * ```
       *
       * The above is equivalent to this configuration below using {@link #config-items}:
       * ```javascript
       *  {
       *      type  : 'radiogroup',
       *      items : [{
       *          text         : 'Keep the original version',
       *          name         : 'resolution',
       *          ref          : 'resolution_A',
       *          checked      : true,
       *          checkedValue : 'A'
       *      }, {
       *          text         : 'Use the new version',
       *          name         : 'resolution',
       *          ref          : 'resolution_B',
       *          checkedValue : 'B'
       *      }, {
       *          text         : 'Reconcile individual conflicts',
       *          name         : 'resolution',
       *          ref          : 'resolution_C',
       *          checkedValue : 'C'
       *      }]
       *  }
       * ```
       * @config {Object<String,String|RadioConfig>} options
       */
      options: {
        value: null,
        $config: {
          merge: "items"
        }
      },
      defaultBindProperty: "value"
    };
  }
  get existingOptions() {
    const { name } = this;
    return this.ensureItems().filter((c) => c.name === name);
  }
  get refPrefix() {
    return `${this.name || this.ref || this.id}_`;
  }
  get selected() {
    return this.existingOptions.filter((c) => c.input.checked)[0] || null;
  }
  /**
   * This property corresponds to the {@link Core.widget.Radio#config-checkedValue} of the currently
   * {@link Core.widget.Radio#property-checked} radio button.
   * @property {String}
   */
  get value() {
    const { selected } = this;
    return selected ? selected.checkedValue : null;
  }
  set value(v) {
    this.existingOptions.forEach((c) => {
      c.isConfiguring = this.isConfiguring;
      c.checked = c.checkedValue === v;
      c.isConfiguring = false;
    });
  }
  ensureItems() {
    this.getConfig("options");
    return super.ensureItems();
  }
  changeOptions(options, was) {
    if (!(options && was && ObjectHelper.isDeeplyEqual(was, options))) {
      return options;
    }
  }
  convertOption(key, option, existing) {
    const me = this, { name } = me, ret = {
      name,
      type: "radio",
      value: key === me.value,
      ref: `${me.refPrefix}${key}`,
      checkedValue: key
    };
    if (typeof option === "string") {
      ret.text = option;
    } else {
      ObjectHelper.assign(ret, option);
    }
    return existing ? Widget.reconfigure(existing, ret) : ret;
  }
  isOurRadio(item) {
    return item.isRadio && item.name === this.name;
  }
  isolateFieldChange(field) {
    return this.isOurRadio(field);
  }
  onChildAdd(item) {
    super.onChildAdd(item);
    if (this.isOurRadio(item)) {
      item.ion({
        name: item.id,
        beforeChange: "onRadioItemBeforeChange",
        change: "onRadioItemChange",
        click: "onRadioClick",
        thisObj: this
      });
    }
  }
  onChildRemove(item) {
    if (this.isOurRadio(item)) {
      this.detachListeners(item.id);
    }
    super.onChildRemove(item);
  }
  onRadioClick(ev) {
    const { source } = ev;
    if (source.checked && this.clearable && source.clearable == null) {
      source.checked = false;
    }
  }
  onRadioItemBeforeChange(ev) {
    if (ev.checked) {
      const me = this, { lastValue } = me;
      if (!me.reverting && me.trigger("beforeChange", me.wrapRadioEvent(ev)) === false) {
        if (lastValue != null && lastValue !== me.value) {
          me.reverting = true;
          ev.source.uncheckToggleGroupMembers();
          me.value = lastValue;
          me.lastValue = lastValue;
          me.reverting = false;
          return false;
        }
      }
    }
  }
  onRadioItemChange(ev) {
    const me = this;
    if (ev.checked && !me.reverting) {
      me.triggerFieldChange(me.wrapRadioEvent(ev));
      me.lastValue = me.value;
    }
  }
  wrapRadioEvent(ev) {
    return {
      from: ev,
      item: ev.source,
      userAction: ev.userAction,
      lastValue: this.lastValue,
      value: this.value
    };
  }
  updateOptions() {
    const me = this, { options, refPrefix } = me, existingOptions = me.existingOptions.reduce((m, c) => {
      m[c.ref.substring(refPrefix.length)] = c;
      return m;
    }, {});
    let index = 0, key, option;
    if (options) {
      for (key in options) {
        option = me.convertOption(key, options[key], existingOptions[key]);
        delete existingOptions[key];
        me.insert(option, index++);
      }
    }
    const existing = Object.values(existingOptions);
    if (existing == null ? void 0 : existing.length) {
      me.remove(existing);
      existing.forEach((c) => c.destroy());
    }
  }
  //endregion
};
//region Config
__publicField(RadioGroup, "$name", "RadioGroup");
__publicField(RadioGroup, "type", "radiogroup");
RadioGroup.initClass();
RadioGroup._$name = "RadioGroup";

// ../Core/lib/Core/widget/Tab.js
var Tab = class extends Button {
  static get configurable() {
    return {
      /**
       * This config is set to `true` when this tab represents the `activeTab` of a {@link Core.widget.TabPanel}. It
       * is managed by the tab panel is not set directly.
       * @config {Boolean} active
       * @default false
       */
      active: null,
      /**
       * This config is set to the ordinal position of this tab in the {@link Core.widget.TabPanel}. It is managed
       * by the tab panel is not set directly.
       * @config {Number} index
       */
      index: null,
      /**
       * This config is set to `true` when this tab represents the first tab of a {@link Core.widget.TabPanel}. It
       * is managed by the tab panel is not set directly.
       * @config {Boolean} isFirst
       */
      isFirst: null,
      /**
       * This config is set to `true` when this tab represents the last tab of a {@link Core.widget.TabPanel}. It
       * is managed by the tab panel is not set directly.
       * @config {Boolean} isLast
       */
      isLast: null,
      /**
       * The {@link Core.widget.Widget} in the {@link Core.widget.TabPanel} corresponding to this tab. This is
       * managed by the tab panel is not set directly.
       * @config {Core.widget.Widget} item
       */
      item: {
        value: null,
        $config: "nullify"
      },
      itemCls: null,
      /**
       * The tab panel that owns this tab.
       * @config {Core.widget.TabPanel} tabPanel
       */
      tabPanel: null,
      /**
       * The config property on this tab that will be set to the value of the {@link #config-titleSource} property
       * of this tab's {@link #config-item}.
       *
       * By default, the {@link #config-text} property of the tab is set to the {@link Core.widget.Widget#config-title}
       * property of its {@link #config-item}.
       * @config {String} titleProperty
       * @default
       */
      titleProperty: "text",
      /**
       * The config property on this tab's {@link #config-item} that is used to set the value of the
       * {@link #config-titleProperty} of this tab.
       *
       * By default, the {@link #config-text} property of the tab is set to the {@link Core.widget.Widget#config-title}
       * property of its {@link #config-item}.
       * @config {String} titleSource
       * @default
       */
      titleSource: "title",
      role: "tab"
    };
  }
  compose() {
    const { active, cls, index, isFirst, isLast } = this, setSize = this.owner.visibleChildCount;
    return {
      tabindex: 0,
      "aria-selected": active,
      "aria-setsize": setSize,
      "aria-posinset": index + 1,
      class: {
        "b-tabpanel-tab": 1,
        "b-active": active,
        "b-tab-first": isFirst,
        "b-tab-last": isLast,
        ...cls
        // cls is a DomClassList
      },
      dataset: {
        index
      }
    };
  }
  //endregion
  updateIndex(index) {
    this.isFirst = !index;
  }
  updateItem(item, was) {
    var _a, _b;
    const me = this;
    if ((was == null ? void 0 : was.tab) === me) {
      was.tab = null;
    }
    if (item) {
      item.tab = me;
      me[me.titleProperty] = item[me.titleSource];
      me.itemCls = item.cls;
      me.ariaElement.setAttribute("aria-controls", item.id);
      item.role = "tabpanel";
    }
    (_a = me.itemChangeDetacher) == null ? void 0 : _a.call(me);
    me.itemChangeDetacher = item && FunctionHelper.after(item, "onConfigChange", "onItemConfigChange", me, {
      return: false
    });
    (_b = me.itemHideDetacher) == null ? void 0 : _b.call(me);
    me.itemHideDetacher = item == null ? void 0 : item.ion({
      beforeChangeHidden: "onItemBeforeChangeHidden",
      beforeHide: "onItemBeforeHide",
      beforeUpdateDisabled: "onItemBeforeUpdateDisabled",
      thisObj: me,
      prio: 1e3
      // We must know before the layout intercepts and activates a sibling
    });
    me.syncMinMax();
  }
  updateItemCls(cls, was) {
    const { element } = this, classList = element && DomClassList.from(
      element == null ? void 0 : element.classList,
      /* returnEmpty= */
      true
    );
    if (element) {
      classList.remove(was).add(cls);
      element.className = classList.value;
    }
  }
  updateRotate(rotate, was) {
    if (!rotate !== !was) {
      this.syncMinMax();
    }
  }
  syncMinMax() {
    const me = this, { rotate, tabPanel } = me;
    let { _minWidth: minWidth, _minHeight: minHeight, _maxWidth: maxWidth, _maxHeight: maxHeight } = me;
    if (tabPanel) {
      const { tabMinWidth, tabMaxWidth } = tabPanel;
      if (tabMinWidth != null) {
        if (rotate) {
          if (minWidth === tabMinWidth) {
            minWidth = null;
          }
          minHeight = tabMinWidth;
        } else {
          if (minHeight === tabMinWidth) {
            minHeight = null;
          }
          minWidth = tabMinWidth;
        }
      }
      if (tabMaxWidth != null) {
        if (rotate) {
          if (maxWidth === tabMaxWidth) {
            maxWidth = null;
          }
          maxHeight = tabMaxWidth;
        } else {
          if (maxHeight === tabMaxWidth) {
            maxHeight = null;
          }
          maxWidth = tabMaxWidth;
        }
      }
      me.minWidth = minWidth;
      me.minHeight = minHeight;
      me.maxWidth = maxWidth;
      me.maxHeight = maxHeight;
    }
  }
  onItemBeforeChangeHidden({ source: hidingChild, hidden }) {
    if (!hidingChild.$isDeactivating && !hidingChild.$isActivating) {
      const { tabPanel } = this;
      this.hidden = hidden;
      if (hidden && hidingChild === tabPanel.activeItem) {
        tabPanel.activateAvailableTab(hidingChild);
      }
    }
  }
  onItemBeforeHide() {
    if (!this.item.$isDeactivating) {
      this.hide();
    }
  }
  onItemBeforeUpdateDisabled({ source: disablingChild, disabled }) {
    const { tabPanel } = this;
    this.disabled = disabled;
    if (disablingChild === tabPanel.activeItem) {
      tabPanel.activateAvailableTab(disablingChild);
    }
  }
  onItemConfigChange({ name, value }) {
    if (name === this.titleSource) {
      this[this.titleProperty] = value;
    }
  }
};
//region Config
__publicField(Tab, "$name", "Tab");
__publicField(Tab, "type", "tab");
Tab.initClass();
Tab._$name = "Tab";

// ../Core/lib/Core/widget/TabBar.js
var isTab = (t) => t.isTab;
var TabBar = class extends Toolbar {
  static get configurable() {
    return {
      defaultType: "tab",
      overflow: "scroll",
      role: "tablist",
      ignoreParentReadOnly: true
    };
  }
  get firstTab() {
    return this.tabAt(0);
  }
  get lastTab() {
    return this.tabAt(-1);
  }
  get tabCount() {
    return this._items.countOf(isTab);
  }
  get tabs() {
    return ArrayHelper.from(this._items, isTab);
  }
  compose() {
    return {
      children: {
        toolbarContent: {
          class: {
            "b-tabpanel-tabs": 1
          }
        }
      }
    };
  }
  indexOfTab(tab) {
    return this._items.indexOf(tab, isTab);
  }
  onChildAdd(child) {
    super.onChildAdd(child);
    if (child.index == null) {
      this.syncTabs();
    }
  }
  onChildRemove(child) {
    super.onChildRemove(child);
    this.syncTabs();
  }
  onFocusIn() {
    const { activeIndex } = this.owner;
    if (!isNaN(activeIndex)) {
      this.tabs[activeIndex].focus();
    }
  }
  syncTabs() {
    const { tabs } = this;
    for (let i = 0, n = tabs.length; i < n; ++i) {
      tabs[i].index = i;
      tabs[i].isFirst = !i;
      tabs[i].isLast = i === n - 1;
    }
  }
  tabAt(index) {
    return this._items.find(isTab, index) || null;
  }
};
__publicField(TabBar, "$name", "TabBar");
__publicField(TabBar, "type", "tabbar");
TabBar.initClass();
TabBar._$name = "TabBar";

// ../Core/lib/Core/widget/TabPanel.js
var isMaximized = (w) => w.maximized;
var TabPanel = class extends Panel {
  static get configurable() {
    return {
      /**
       * The index of the initially active tab.
       * @member {Number} activeTab
       */
      /**
       * The index of the initially active tab.
       * @config {Number}
       * @default
       */
      activeTab: 0,
      /**
       * Specifies whether to slide tabs in and out of visibility.
       * @config {Boolean}
       * @default
       */
      animateTabChange: true,
      /**
       * Set the height of all tabs to match the tab with the highest content.
       * @config {Boolean}
       * @default
       */
      autoHeight: false,
      defaultType: "container",
      focusable: false,
      itemCls: "b-tabpanel-item",
      layout: {
        type: "card"
      },
      // Prevent child panels from displaying a header unless explicitly configured with one
      suppressChildHeaders: true,
      tabBar: {
        type: "tabbar",
        weight: -2e3
      },
      /**
       * Min width of a tab title. 0 means no minimum width. This is default.
       * @config {Number}
       * @default
       */
      tabMinWidth: null,
      /**
       * Max width of a tab title. 0 means no maximum width. This is default.
       * @config {Number}
       * @default
       */
      tabMaxWidth: null
    };
  }
  //endregion
  //region Init
  /**
   * The active tab index. Setting must be done through {@link #property-activeTab}
   * @property {Number}
   * @readonly
   */
  get activeIndex() {
    return this.layout.activeIndex;
  }
  /**
   * The active child widget. Setting must be done through {@link #property-activeTab}
   * @property {Core.widget.Widget}
   * @readonly
   */
  get activeItem() {
    return this.layout.activeItem;
  }
  get activeTabItemIndex() {
    var _a;
    const { activeTab, items, tabBar } = this;
    return items.indexOf((_a = tabBar.tabs[activeTab]) == null ? void 0 : _a.item);
  }
  get bodyConfig() {
    return ObjectHelper.merge({
      className: {
        "b-tabpanel-body": 1
      }
    }, super.bodyConfig);
  }
  get focusElement() {
    var _a;
    const activeTab = this.items[this.activeTab || 0];
    return (activeTab == null ? void 0 : activeTab.focusElement) || ((_a = activeTab == null ? void 0 : activeTab.tab) == null ? void 0 : _a.focusElement);
  }
  get tabPanelBody() {
    return this.bodyElement;
  }
  finalizeInit() {
    super.finalizeInit();
    const me = this, { activeTab, layout } = me, { activeIndex } = layout, { tabs } = me.tabBar, activeTabItemIndex = activeTab >= 0 && activeTab < tabs.length && me.items.indexOf(tabs[activeTab].item);
    if (tabs.length > 0 && (activeTabItemIndex === false || activeTabItemIndex < 0)) {
      throw new Error(`Invalid activeTab ${activeTab} (${tabs.length} tabs)`);
    }
    if (activeTabItemIndex !== activeIndex) {
      layout.setActiveItem(activeTabItemIndex, activeIndex, {
        animation: false,
        silent: true
      });
    }
    layout.animateCardChange = me.animateTabChange;
  }
  onChildAdd(child) {
    super.onChildAdd(child);
    if (!this.initialItems) {
      const me = this, { tabBar } = me, config = me.makeTabConfig(child), firstTab = config && (tabBar == null ? void 0 : tabBar.firstTab), tabBarItems = firstTab && tabBar._items, tabItems = firstTab && ArrayHelper.from(me._items, (it) => it.tab || it === child), index = firstTab ? tabItems.indexOf(child) + tabBarItems.indexOf(firstTab) : 0;
      if (config && tabBar) {
        if (firstTab && child.weight == null && index < tabBarItems.count - 1) {
          tabBar.insert(config, index);
        } else {
          tabBar.add(config);
        }
      }
    }
  }
  onChildRemove(child) {
    const { tab } = child, { items } = this;
    if (tab) {
      this.tabBar.remove(tab);
      tab.destroy();
    }
    if (child === this.activeItem) {
      this._activeTab = null;
      if (items.length) {
        this.activeTab = items[Math.min(this.activeIndex, items.length - 1)];
      }
    }
    super.onChildRemove(child);
  }
  //endregion
  //region Tabs
  isDisabledOrHiddenTab(tabIndex) {
    const { tabs } = this.tabBar, tab = tabs == null ? void 0 : tabs[tabIndex];
    return tab && (tab.disabled || tab.hidden);
  }
  findAvailableTab(item, delta = 1) {
    const { tabs } = this.tabBar, tabCount = tabs.length, itemIndex = Math.max(0, tabs.indexOf(item.tab));
    if (itemIndex) {
      delta = -delta;
    }
    let activeTab;
    for (let n = 1; n <= tabCount; ++n) {
      activeTab = (itemIndex + (delta < 0 ? tabCount : 0) + n * delta) % tabCount;
      if (!this.isDisabledOrHiddenTab(activeTab)) {
        break;
      }
    }
    return activeTab;
  }
  activateAvailableTab(item, delta = 1) {
    this.activeTab = this.findAvailableTab(item, delta);
  }
  changeActiveTab(activeTab, oldActiveTab) {
    const me = this, {
      tabBar,
      layout
    } = me, { tabCount } = tabBar;
    if (activeTab.isWidget || ObjectHelper.isObject(activeTab)) {
      if (me.items.indexOf(activeTab) === -1) {
        activeTab = me.add(activeTab);
      }
      activeTab = tabBar.indexOfTab(activeTab.tab);
    } else {
      activeTab = parseInt(activeTab, 10);
    }
    if (!me.initialItems && tabCount > 0 && (activeTab < -1 || activeTab >= tabCount)) {
      throw new Error(`Invalid activeTab ${activeTab} (${tabCount} tabs)`);
    }
    if (me.isDisabledOrHiddenTab(activeTab)) {
      activeTab = me.findAvailableTab(activeTab);
    }
    if (layout.animateCardChange && layout.cardChangeAnimation) {
      layout.cardChangeAnimation.then((cardChange) => {
        if ((cardChange == null ? void 0 : cardChange.activeIndex) !== activeTab) {
          me._activeTab = activeTab;
          me.updateActiveTab(activeTab, oldActiveTab);
        }
      });
    } else {
      return activeTab;
    }
  }
  async updateActiveTab(activeTab, was) {
    var _a;
    if (!this.initialItems) {
      const { activeTabItemIndex, layout } = this;
      if (activeTabItemIndex > -1) {
        const oldActiveItem = this.items[was], newActiveItem = this.items[activeTabItemIndex];
        if (layout.activeItem !== newActiveItem) {
          if (layout.animateCardChange) {
            await this.tabSelectionPromise;
          }
          if (oldActiveItem == null ? void 0 : oldActiveItem.containsFocus) {
            oldActiveItem.tab.focus();
          }
          this.tabSelectionPromise = (_a = layout.setActiveItem(newActiveItem)) == null ? void 0 : _a.promise;
        }
      }
    }
  }
  changeTabBar(bar) {
    this.getConfig("strips");
    this.strips = {
      tabBar: bar
    };
    return this.strips.tabBar;
  }
  makeTabConfig(item) {
    const { tab } = item, config = {
      item,
      type: "tab",
      tabPanel: this,
      disabled: Boolean(item.disabled),
      hidden: item.initialConfig.hidden,
      weight: item.weight || 0,
      internalListeners: {
        click: "onTabClick",
        thisObj: this
      },
      localizableProperties: {
        // our tabs copy their text from the item's title and so are not directly localized
        text: false
      }
    };
    if (tab === false) {
      return null;
    }
    return ObjectHelper.isObject(tab) ? Tab.mergeConfigs(config, tab) : config;
  }
  updateItems(items, was) {
    const me = this, { activeTab, initialItems } = me;
    let index = 0, tabs;
    super.updateItems(items, was);
    if (initialItems) {
      tabs = Array.from(items, (it) => me.makeTabConfig(it)).filter((it) => {
        if (it) {
          it.index = index++;
          return true;
        }
      });
      if (index) {
        tabs[0].isFirst = true;
        tabs[index - 1].isLast = true;
        tabs[activeTab].active = true;
        me.tabBar.add(tabs);
        me.activeTab = activeTab;
      }
    }
  }
  updateTabMinWidth(tabMinWidth) {
    var _a;
    (_a = this.tabBar) == null ? void 0 : _a.items.forEach((tab) => {
      if (tab.isTab) {
        tab.minWidth = tabMinWidth;
      }
    });
  }
  updateTabMaxWidth(tabMaxWidth) {
    var _a;
    (_a = this.tabBar) == null ? void 0 : _a.items.forEach((tab) => {
      if (tab.isTab) {
        tab.maxWidth = tabMaxWidth;
      }
    });
  }
  //endregion
  //region Auto height
  updateAutoHeight(autoHeight) {
    this.detachListeners("themeAutoHeight");
    autoHeight && GlobalEvents_default.ion({
      name: "themeAutoHeight",
      theme: "internalOnThemeChange",
      thisObj: this
    });
    this.$measureHeight = autoHeight;
  }
  applyAutoHeight() {
    const me = this, { layout, activeTab, element } = me, { animateCardChange } = layout;
    layout.animateCardChange = false;
    me.height = null;
    if (!me.up(isMaximized)) {
      const maxContentHeight = me.height = Math.max(...me.items.map((tab) => {
        me.activeTab = tab;
        return element.clientHeight;
      })) + 1;
      me.flex = `1 1 ${maxContentHeight}px`;
    }
    me.activeTab = activeTab;
    layout.animateCardChange = animateCardChange;
    me.$measureHeight = false;
  }
  internalOnThemeChange() {
    if (this.isVisible) {
      this.applyAutoHeight();
    } else {
      this.$measureHeight = true;
    }
  }
  //endregion
  //region Events
  // Called after beforeActiveItemChange has fired and not been vetoed before animation and activeItemChange
  onBeginActiveItemChange(activeItemChangeEvent) {
    const tabs = this.tabBar.tabs, { activeItem, prevActiveItem } = activeItemChangeEvent;
    this.activeTab = tabs.indexOf(activeItem == null ? void 0 : activeItem.tab);
    if (prevActiveItem == null ? void 0 : prevActiveItem.tab) {
      prevActiveItem.tab.active = false;
    }
    if (activeItem == null ? void 0 : activeItem.tab) {
      activeItem.tab.active = true;
      activeItem.tab.show();
    }
  }
  // Auto called because Card layout triggers the beforeActiveItemChange on its owner
  onBeforeActiveItemChange(activeItemChangeEvent) {
    return this.trigger("beforeTabChange", activeItemChangeEvent);
  }
  // Auto called because Card layout triggers the activeItemChange on its owner
  onActiveItemChange(activeItemChangeEvent) {
    this.trigger("tabChange", activeItemChangeEvent);
  }
  onTabClick(event) {
    this.activeTab = event.source.item;
  }
  onInternalPaint() {
    super.onInternalPaint(...arguments);
    if (this.$measureHeight) {
      this.applyAutoHeight();
    }
  }
  //endregion
};
//region Config
__publicField(TabPanel, "$name", "TabPanel");
__publicField(TabPanel, "type", "tabpanel");
__publicField(TabPanel, "alias", "tabs");
TabPanel.initClass();
TabPanel._$name = "TabPanel";

export {
  WebSocketManager,
  FieldSet,
  Radio,
  RadioGroup,
  Tab,
  TabBar,
  TabPanel
};
//# sourceMappingURL=chunk-ILA6GLVW.js.map
