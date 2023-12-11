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
  BrowserHelper,
  DomHelper,
  EventHelper,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/widget/Splitter.js
var classesHV = ["b-horizontal", "b-vertical"];
var hasFlex = (el) => DomHelper.getStyleValue(el.parentElement, "display") === "flex" && (parseInt(DomHelper.getStyleValue(el, "flex-basis"), 10) || parseInt(DomHelper.getStyleValue(el, "flex-grow"), 10));
var verticality = {
  horizontal: false,
  vertical: true
};
var Splitter = class extends Widget {
  static get configurable() {
    return {
      /**
       * Fired when a drag starts
       * @event dragStart
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */
      /**
       * Fired while dragging
       * @event drag
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */
      /**
       * Fired after a drop
       * @event drop
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */
      /**
       * Splitter orientation, see {@link #config-orientation}. When set to 'auto' then actually used orientation
       * can be retrieved using {@link #property-currentOrientation}.
       * @member {'auto'|'horizontal'|'vertical'} orientation
       * @readonly
       */
      /**
       * The splitter's orientation, configurable with 'auto', 'horizontal' or 'vertical'.
       *
       * 'auto' tries to determine the orientation by either checking the `flex-direction` of the parent element
       * or by comparing the positions of the closest sibling elements to the splitter. If they are above and
       * below 'horizontal' is used, if not it uses 'vertical'.
       *
       * ```
       * new Splitter({
       *    orientation : 'horizontal'
       * });
       * ```
       *
       * To receive the actually used orientation when configured with 'auto', see
       * {@link #property-currentOrientation}.
       *
       * @config {'auto'|'horizontal'|'vertical'}
       * @default
       */
      orientation: "auto",
      vertical: null,
      containerElement: {
        $config: "nullify",
        value: null
      },
      nextNeighbor: {
        $config: "nullify",
        value: null
      },
      previousNeighbor: {
        $config: "nullify",
        value: null
      }
    };
  }
  static get delayable() {
    return {
      syncState: "raf"
    };
  }
  //endregion
  //region Init & destroy
  doDestroy() {
    var _a;
    (_a = this.mouseDetacher) == null ? void 0 : _a.call(this);
    super.doDestroy();
  }
  //endregion
  //region Template & element
  compose() {
    return {
      class: {
        "b-splitter": 1
      },
      // eslint-disable-next-line bryntum/no-listeners-in-lib
      listeners: {
        pointerdown: "onMouseDown",
        mouseenter: "syncState",
        ...!BrowserHelper.supportsPointerEvents && {
          mousedown: "onMouseDown",
          touchstart: "onMouseDown"
        }
      }
    };
  }
  //endregion
  //region Orientation
  /**
   * Get actually used orientation, which is either the configured value for `orientation` or if configured with
   * 'auto' the currently used orientation.
   * @property {String}
   * @readonly
   */
  get currentOrientation() {
    return this.vertical ? "vertical" : "horizontal";
  }
  getSibling(next = true) {
    let { element } = this, result;
    while (!result && (element = element[`${next ? "next" : "previous"}ElementSibling`])) {
      if (!element.isConnected || DomHelper.isVisible(element)) {
        result = element;
      }
    }
    return result;
  }
  get nextWidget() {
    let { element } = this, result;
    while (!result && (element = element.nextElementSibling)) {
      result = Widget.fromElement(element, this.element.parentElement);
    }
    return result;
  }
  get previousWidget() {
    let { element } = this, result;
    while (!result && (element = element.previousElementSibling)) {
      result = Widget.fromElement(element, this.element.parentElement);
    }
    return result;
  }
  updateContainerElement(containerElement) {
    var _a;
    const me = this;
    me.stateDetector = (_a = me.stateDetector) == null ? void 0 : _a.disconnect();
    if (containerElement) {
      me.stateDetector = new MutationObserver(() => me.syncState());
      me.stateDetector.observe(containerElement, {
        attributes: true,
        // in case style changes flip our orientation (when == 'auto')
        childList: true
        // watch for our neighbors to render (so we can disable on hidden/collapsed state)
      });
    }
  }
  updateNextNeighbor(next) {
    this.watchNeighbor(next, "next");
  }
  updatePreviousNeighbor(previous) {
    this.watchNeighbor(previous, "previous");
  }
  watchNeighbor(neighbor, name) {
    this.detachListeners(name);
    neighbor == null ? void 0 : neighbor.ion({
      name,
      thisObj: this,
      collapse: "syncState",
      expand: "syncState",
      hide: "syncState",
      show: "syncState"
    });
  }
  updateOrientation() {
    this.syncState.now();
  }
  updateVertical(vertical) {
    var _a;
    const classList = (_a = this.element) == null ? void 0 : _a.classList;
    classList == null ? void 0 : classList.add(classesHV[vertical ? 1 : 0]);
    classList == null ? void 0 : classList.remove(classesHV[vertical ? 0 : 1]);
  }
  /**
   * Determine orientation when set to `'auto'` and detects neighboring widgets to monitor their hidden/collapsed
   * states.
   * @private
   */
  syncState() {
    var _a;
    const me = this, { element, nextWidget, previousWidget } = me;
    let vertical = (_a = verticality[me.orientation]) != null ? _a : null;
    me.nextNeighbor = nextWidget;
    me.previousNeighbor = previousWidget;
    me.disabled = nextWidget && (nextWidget.collapsible && nextWidget.collapsed || nextWidget.hidden) || previousWidget && (previousWidget.collapsible && previousWidget.collapsed || previousWidget.hidden);
    if (vertical !== null && nextWidget && previousWidget) {
      me.containerElement = null;
    } else {
      me.containerElement = element.parentElement;
      if (me.rendered && element.offsetParent) {
        const flexDirection = DomHelper.getStyleValue(element.parentElement, "flex-direction");
        if (flexDirection) {
          vertical = !flexDirection.startsWith("column");
        } else {
          const previous = element.previousElementSibling, next = element.nextElementSibling;
          if (!previous || !next) {
            return;
          }
          const prevRect = previous.getBoundingClientRect(), nextRect = next.getBoundingClientRect(), topMost = prevRect.top < nextRect.top ? prevRect : nextRect, bottomMost = topMost === nextRect ? prevRect : nextRect;
          vertical = topMost.top === bottomMost.top;
        }
      }
    }
    me.vertical = vertical;
  }
  //endregion
  //region Events
  onMouseDown(event) {
    var _a;
    event.preventDefault();
    if (event.touches) {
      event = event.touches[0];
    }
    const me = this, {
      element,
      nextNeighbor,
      previousNeighbor
    } = me, prev = previousNeighbor ? previousNeighbor.element : me.getSibling(false), next = nextNeighbor ? nextNeighbor.element : me.getSibling(), prevHasFlex = hasFlex(prev), nextHasFlex = hasFlex(next), flexed = [];
    (_a = me.mouseDetacher) == null ? void 0 : _a.call(me);
    for (const child of element.parentElement.children) {
      if (hasFlex(child) && child !== element) {
        flexed.push({
          element: child,
          width: child.offsetWidth,
          height: child.offsetHeight
        });
      }
    }
    me.context = {
      startX: event.pageX,
      startY: event.pageY,
      prevWidth: prev.offsetWidth,
      prevHeight: prev.offsetHeight,
      nextWidth: next.offsetWidth,
      nextHeight: next.offsetHeight,
      prevHasFlex,
      nextHasFlex,
      flexed,
      prev,
      next
    };
    const events = {
      element: document,
      pointermove: "onMouseMove",
      pointerup: "onMouseUp",
      thisObj: me
    };
    if (!BrowserHelper.supportsPointerEvents) {
      events.mousemove = events.touchmove = "onMouseMove";
      events.mouseup = events.touchend = "onMouseUp";
    }
    element.classList.add("b-moving");
    me.mouseDetacher = EventHelper.on(events);
    me.trigger("splitterMouseDown", { event });
  }
  onMouseMove(event) {
    const me = this, {
      context,
      nextWidget,
      previousWidget
    } = me, prevStyle = context.prev.style, nextStyle = context.next.style, deltaX = (event.pageX - context.startX) * (me.rtl ? -1 : 1), deltaY = event.pageY - context.startY;
    event.preventDefault();
    Object.assign(context, {
      deltaX,
      deltaY
    });
    if (!context.started) {
      context.started = true;
      me.trigger("dragStart", { context, event });
      context.flexed.forEach((flexed) => {
        flexed.element.style.flexGrow = me.vertical ? flexed.width : flexed.height;
        flexed.element.style.flexBasis = "0";
      });
    }
    if (me.vertical) {
      const newPrevWidth = context.prevWidth + deltaX, newNextWidth = context.nextWidth - deltaX;
      if (context.prevHasFlex) {
        prevStyle.flexGrow = newPrevWidth;
      } else if (previousWidget) {
        previousWidget.width = newPrevWidth;
      } else {
        prevStyle.width = `${newPrevWidth}px`;
      }
      if (context.nextHasFlex) {
        nextStyle.flexGrow = newNextWidth;
      } else if (nextWidget) {
        nextWidget.width = newNextWidth;
      } else {
        nextStyle.width = `${newNextWidth}px`;
      }
    } else {
      const newPrevHeight = context.prevHeight + deltaY, newNextHeight = context.nextHeight - deltaY;
      if (context.prevHasFlex) {
        prevStyle.flexGrow = newPrevHeight;
      } else if (previousWidget) {
        previousWidget.height = newPrevHeight;
      } else {
        prevStyle.height = `${newPrevHeight}px`;
      }
      if (context.nextHasFlex) {
        nextStyle.flexGrow = newNextHeight;
      } else if (nextWidget) {
        nextWidget.height = newNextHeight;
      } else {
        nextStyle.height = `${newNextHeight}px`;
      }
    }
    me.trigger("drag", { context, event });
  }
  onMouseUp(event) {
    var _a;
    const me = this;
    (_a = me.mouseDetacher) == null ? void 0 : _a.call(me);
    me.mouseDetacher = null;
    me.element.classList.remove("b-moving");
    if (me.context.started) {
      me.trigger("drop", { context: me.context, event });
    }
    me.context = null;
  }
  //endregion
  render() {
    super.render(...arguments);
    this.syncState.now();
    if (this.vertical === null) {
      this.syncState();
    }
  }
};
//region Config
__publicField(Splitter, "$name", "Splitter");
__publicField(Splitter, "type", "splitter");
Splitter.initClass();
Splitter._$name = "Splitter";

export {
  Splitter
};
//# sourceMappingURL=chunk-PKK32ALQ.js.map
