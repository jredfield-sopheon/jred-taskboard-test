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
  Animator,
  Delayable_default,
  DomClassList,
  DomHelper,
  EventHelper,
  ObjectHelper,
  PanelCollapser,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/panel/PanelCollapserOverlay.js
var { dockIsHorz } = PanelCollapser.maps;
var collapseExposeEdge = {
  top: 0,
  down: 0,
  left: 1,
  bottom: 2,
  up: 2,
  right: 3
};
var translateByDir = {
  up: {
    from: `translate(0,0)`,
    to: "translate(0,-100%)"
  },
  down: {
    from: `translate(0,0)`,
    to: "translate(0,100%)"
  },
  left: {
    from: `translate(0,0)`,
    to: "translate(-100%,0)"
  },
  right: {
    from: `translate(0,0)`,
    to: "translate(100%,0)"
  }
};
var PanelCollapserOverlay = class extends PanelCollapser.mixin(Delayable_default) {
  static get configurable() {
    return {
      /**
       * The number of milliseconds to wait once the mouse leaves a {@link Core.widget.Panel#config-revealed}
       * panel before returning to an unrevealed state. Clicking outside the revealed panel will immediately
       * return the panel to its collapsed state.
       *
       * This may be disabled by configuring {@link #config-autoClose} as `null`.
       *
       * If this value is negative, the panel will not automatically recollapse due to the mouse leaving, however,
       * clicks outside the panel will still recollapse it.
       *
       * If this value is `null`, the panel will not automatically recollapse for either outside clicks or if
       * the mouse leaves the panel.
       * @config {Number}
       * @default
       */
      autoCloseDelay: 1e3,
      /**
       * By default, clicking outside the revealed overlay hides the revealed overlay.
       *
       * If the revealed overlay was shown using the {@link #property-recollapseTool}
       * then moving the mouse outside of the revealed overlay hides the revealed overlay.
       *
       * Configure this as `false` to disable auto hiding, making overlayed
       * state permanent, and changeable using the {@link #function-toggleReveal} method.
       * @config {Boolean}
       * @default
       */
      autoClose: true,
      revealing: {
        value: null,
        $config: null,
        default: false
      },
      /**
       * The reveal/hide tool which slides the collapsed panel over the top of the UI.
       * @member {Core.widget.Tool} recollapseTool
       */
      /**
       * The reveal/hide tool which slides the collapsed panel over the top of the UI.
       *
       * The `type` of this instance should not be changed but the tool instance can be
       * configured in other ways via this config property.
       * @config {ToolConfig|Core.widget.Tool}
       */
      recollapseTool: {
        type: "collapsetool",
        cls: "b-recollapse",
        collapsify: "overlay",
        handler() {
          var _a;
          (_a = this.collapsible) == null ? void 0 : _a.toggleReveal();
        }
      }
    };
  }
  static get delayable() {
    return {
      doAutoClose: 0
    };
  }
  doAutoClose() {
    this.toggleReveal(false);
  }
  updateAutoCloseDelay(delay) {
    const { doAutoClose } = this;
    if (!(doAutoClose.suspended = delay == null || delay < 0)) {
      doAutoClose.delay = delay;
      doAutoClose.immediate = !delay;
    }
  }
  changeRecollapseTool(tool) {
    const me = this, { panel } = me;
    if (me.isConfiguring || me.isDestroying || !panel || panel.isDestroying) {
      return tool;
    }
    panel.tools = {
      recollapse: tool
    };
  }
  beforeCollapse(operation) {
    if (super.beforeCollapse(operation) === false) {
      return false;
    }
    if (this.panel.revealed) {
      operation.animation = null;
    }
  }
  applyHeaderDock(collapsed, flush = true) {
    var _a;
    (_a = this.panel) == null ? void 0 : _a.recompose();
    super.applyHeaderDock(collapsed, flush);
  }
  collapseBegin(operation) {
    const me = this, { collapseDir, innerElement } = me, { animation } = operation, { collapseTool, panel } = me;
    me.configuredWidth = panel._lastWidth;
    me.configuredHeight = panel._lastHeight;
    me.applyHeaderDock(true);
    me.lockInnerSize();
    collapseTool == null ? void 0 : collapseTool.element.classList.add("b-collapsed");
    if (animation) {
      panel.element.classList.add("b-collapsing");
      animation.element = innerElement;
      animation.transform = translateByDir[collapseDir];
      operation.animation = Animator.run(animation);
    }
  }
  onComplete(action) {
    var _a, _b;
    super.onComplete(action);
    const me = this, { panel } = me, { element } = panel;
    me.autoCloseLeaveDetacher = (_a = me.autoCloseLeaveDetacher) == null ? void 0 : _a.call(me);
    me.autoCloseClickDetacher = (_b = me.autoCloseClickDetacher) == null ? void 0 : _b.call(me);
    me.doAutoClose.cancel();
    if (action === "reveal" && me.autoClose) {
      if (panel.containsFocus) {
        me.autoCloseLeaveDetacher = EventHelper.on({
          element,
          mouseenter: (ev) => {
            me.doAutoClose.cancel();
          },
          mouseleave: (ev) => {
            me.doAutoClose();
          }
        });
      }
      me.autoCloseClickDetacher = EventHelper.on({
        element: document.body,
        thisObj: panel,
        mousedown: (ev) => {
          var _a2;
          if (!panel.owns(ev) && !((_a2 = me.revealer) == null ? void 0 : _a2.contains(ev.target)) && me.autoCloseDelay != null) {
            me.doAutoClose.now();
          }
        }
      });
    }
  }
  expandBegin(operation) {
    const me = this, { animation } = operation, { collapseDir, collapseTool, innerElement, panel } = me, { element } = panel;
    element.classList.remove("b-collapsed", "b-collapsing");
    me.restoreConfiguredSize();
    me.lockInnerSize(false);
    me.lockInnerSize();
    collapseTool == null ? void 0 : collapseTool.element.classList.remove("b-collapsed");
    if (animation) {
      element.classList.add("b-collapsed", "b-expanding");
      animation.element = innerElement;
      animation.transform = {
        from: translateByDir[collapseDir].to,
        to: translateByDir[collapseDir].from
      };
      operation.animation = Animator.run(animation);
    }
  }
  expandEnd(operation) {
    super.expandEnd(operation);
    const { panel } = this;
    if (operation.completed) {
      panel.revealed = false;
    }
    panel.element.classList.remove("b-expanding");
  }
  expandRevert(operation) {
    super.expandRevert(operation);
    this.panel.element.classList.add("b-expanding");
  }
  get innerElement() {
    return this.panel.overlayElement;
  }
  get innerSizeElement() {
    return this.panel.element;
  }
  get toolsConfig() {
    const me = this, { direction } = me, config = super.toolsConfig, tool = me.recollapseTool;
    if (tool) {
      return {
        ...config,
        recollapse: tool && ObjectHelper.assign({
          direction: direction.toLowerCase()
        }, tool)
      };
    }
    return config;
  }
  lockInnerSize(lock = true) {
    const me = this, { panel } = me, panelRect = lock && panel.rectangle(), inset = lock ? [0, 0, 0, 0] : "", innerRect = super.lockInnerSize(lock);
    if (lock) {
      inset[collapseExposeEdge[me.collapseDir]] = `-${panelRect[me.collapseDim] + 10}px`;
    }
    panel.element.style.clipPath = lock ? `inset(${inset.join(" ")})` : "";
    return innerRect;
  }
  onOverlayTransitionDone(ev) {
    const me = this, { panel } = me;
    if (ev.srcElement === panel.overlayElement && me.revealing) {
      me.revealing = false;
      me.onComplete(panel.revealed ? "reveal" : "unreveal");
    }
  }
  onRevealerClick() {
    this.toggleReveal();
  }
  /**
   * Toggles the revealed state of the Panel to match the passed boolean flag.
   * @param {Boolean} [state]  If not specified, this method toggles current state. Otherwise, pass `true` to reveal
   * the overlay, or `false` to hide it.
   */
  toggleReveal(state) {
    const { panel } = this, { element } = panel;
    if (panel.collapsed) {
      this.revealer = DomHelper.getActiveElement(element);
      if (state == null) {
        state = !panel.revealed;
      }
      if (panel.revealed !== state && panel.trigger("beforeToggleReveal", { reveal: state }) !== false) {
        if (!state && element.contains(this.revealer)) {
          panel.revertFocus(true);
        }
        this.revealing = true;
        panel.revealed = state;
      }
    }
  }
  updateRevealing(value) {
    const me = this, horzDirRe = /left|right/i, { panel } = me, dim = horzDirRe.test(me.collapseDir) ? "height" : "width";
    if (panel) {
      me.innerElement.style[dim] = "0px";
      me.innerElement.style[`min-${dim}`] = "100%";
      panel.element.classList[value ? "add" : "remove"]("b-panel-overlay-revealing");
    }
  }
  wrapCollapser(key, body) {
    var _a;
    const me = this, { collapseDir, panel } = me, { expandedHeaderDock, header, uiClassList } = panel, recollapse = (_a = panel.tools) == null ? void 0 : _a.recollapse, [before, after] = me.splitHeaderItems({ as: "element", dock: me.collapseDock }), horz = dockIsHorz[expandedHeaderDock], title = panel.hasHeader ? panel.title || (header == null ? void 0 : header.title) || "\xA0" : null;
    if (recollapse) {
      recollapse.direction = collapseDir;
    }
    return [
      "overlayElement",
      {
        class: {
          ...uiClassList,
          [`b-panel-overlay-header-${expandedHeaderDock}`]: 1,
          [`b-panel-overlay-${collapseDir}`]: 1,
          [`b-${horz ? "h" : "v"}box`]: 1,
          "b-panel-overlay": 1,
          "b-box-center": 1
        },
        // internalListeners is not correct for element listeners in domConfigs
        listeners: {
          // eslint-disable-line bryntum/no-listeners-in-lib
          transitionend: (ev) => me.onOverlayTransitionDone(ev),
          transitioncancel: (ev) => me.onOverlayTransitionDone(ev)
        },
        children: {
          overlayHeaderElement: title && {
            tag: "header",
            class: new DomClassList({
              ...uiClassList,
              [`b-dock-${expandedHeaderDock}`]: 1,
              "b-panel-header": 1,
              "b-panel-overlay-header": 1
            }, header == null ? void 0 : header.cls),
            children: [
              ...before,
              {
                reference: "overlayTitleElement",
                html: title,
                class: {
                  ...uiClassList,
                  [`b-align-${(header == null ? void 0 : header.titleAlign) || "start"}`]: 1,
                  "b-header-title": 1
                }
              },
              ...after
            ]
          },
          [key]: body
        }
      }
    ];
  }
};
__publicField(PanelCollapserOverlay, "$name", "PanelCollapserOverlay");
__publicField(PanelCollapserOverlay, "type", "overlay");
PanelCollapserOverlay.initClass();
PanelCollapserOverlay._$name = "PanelCollapserOverlay";

export {
  PanelCollapserOverlay
};
//# sourceMappingURL=chunk-6XUOCF5K.js.map
