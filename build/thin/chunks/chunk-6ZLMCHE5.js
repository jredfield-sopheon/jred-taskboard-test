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
  BrowserHelper,
  Combo,
  Container,
  DateHelper,
  DayTime,
  Delayable_default,
  DomClassList,
  DomHelper,
  Duration,
  EventHelper,
  Events_default,
  Field,
  GlobalEvents_default,
  LocaleManager_default,
  Mask,
  ObjectHelper,
  Panel,
  PickerField,
  Point,
  Popup,
  Rectangle,
  Rotatable_default,
  StringHelper,
  TextField,
  TimeZoneHelper,
  Tooltip,
  VersionHelper,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/helper/mixin/DragHelperContainer.js
var DragHelperContainer_default = (Target) => class DragHelperContainer extends (Target || Base) {
  static get $name() {
    return "DragHelperContainer";
  }
  //region Init
  /**
   * Initialize container drag mode.
   * @private
   */
  initContainerDrag() {
    const me = this;
    if (!me.mode) {
      me.mode = "container";
    }
    if (me.mode === "container" && !me.containers) {
      throw new Error("Container drag mode must specify containers");
    }
  }
  //endregion
  //region Grab, update, finish
  /**
   * Grab an element which can be dragged between containers.
   * @private
   * @param event
   * @returns {Boolean}
   */
  grabContainerDrag(event) {
    const me = this;
    if (!me.ignoreSelector || !event.target.closest(me.ignoreSelector)) {
      const element = DomHelper.getAncestor(event.target, me.containers, me.outerElement);
      if (element) {
        const box = element.getBoundingClientRect();
        me.context = {
          element,
          valid: true,
          action: "container",
          offsetX: event.pageX - box.left,
          offsetY: event.pageY - box.top,
          originalPosition: {
            parent: element.parentElement,
            prev: element.previousElementSibling,
            next: element.nextElementSibling
          }
        };
      }
      return true;
    }
    return false;
  }
  startContainerDrag(event) {
    var _a;
    const me = this, { context, floatRootOwner } = me, { element: dragElement } = context, clonedNode = dragElement.cloneNode(true), outerWidgetEl = floatRootOwner == null ? void 0 : floatRootOwner.element.closest(".b-outer");
    clonedNode.classList.add(me.dragProxyCls, me.draggingCls);
    ((floatRootOwner == null ? void 0 : floatRootOwner.floatRoot) || DomHelper.getRootElement(dragElement)).appendChild(clonedNode);
    context.dragProxy = clonedNode;
    context.dragging = dragElement;
    dragElement.classList.add(me.dropPlaceholderCls);
    if ((_a = outerWidgetEl == null ? void 0 : outerWidgetEl.parentElement) == null ? void 0 : _a.matches(".b-float-root")) {
      clonedNode.style.zIndex = floatRootOwner.floatRootMaxZIndex + 1;
    }
  }
  onContainerDragStarted(event) {
    const me = this, { context } = me, { element: dragElement, dragProxy } = context, box = dragElement.getBoundingClientRect();
    if (me.autoSizeClonedTarget) {
      dragProxy.style.width = box.width + "px";
      dragProxy.style.height = box.height + "px";
      DomHelper.setTranslateXY(context.dragProxy, box.left, box.top);
    } else {
      const proxyBox = dragProxy.getBoundingClientRect();
      Object.assign(context, {
        offsetX: proxyBox.width / 2,
        offsetY: proxyBox.height / 2
      });
      DomHelper.setTranslateXY(dragProxy, event.clientX, event.clientY);
    }
  }
  /**
   * Move the placeholder element into its new position on valid drag.
   * @private
   * @param event
   */
  updateContainerDrag(event) {
    var _a;
    const me = this, { context } = me;
    if (!context.started || !context.targetElement) {
      return;
    }
    const containerElement = DomHelper.getAncestor(context.targetElement, me.containers, "b-gridbase"), willLoseFocus = (_a = context.dragging) == null ? void 0 : _a.contains(DomHelper.getActiveElement(context.dragging));
    if (containerElement && DomHelper.isDescendant(context.element, containerElement)) {
      return;
    }
    if (willLoseFocus) {
      GlobalEvents_default.suspendFocusEvents();
    }
    if (containerElement && context.valid) {
      me.moveNextTo(containerElement, event);
    } else {
      me.revertPosition();
    }
    if (willLoseFocus) {
      GlobalEvents_default.resumeFocusEvents();
    }
    event.preventDefault();
  }
  /**
   * Finalize drag, fire drop.
   * @private
   * @param event
   * @fires drop
   */
  finishContainerDrag(event) {
    const me = this, { context } = me, { dragging, dragProxy, valid, draggedTo, insertBefore, originalPosition } = context;
    if (dragging) {
      context.valid = Boolean(valid && (draggedTo || me.externalDropTargetSelector && event.target.closest(me.externalDropTargetSelector)) && // no drop on self or parent
      (dragging !== insertBefore || originalPosition.parent !== draggedTo));
      context.finalize = (valid2 = context.valid) => {
        if (!valid2 && me.context) {
          me.revertPosition();
        }
        dragging.classList.remove(me.dropPlaceholderCls);
        dragProxy.remove();
        me.reset();
      };
      context.async = false;
      me.trigger("drop", { context, event });
      if (!context.async) {
        context.finalize();
      }
    }
  }
  /**
   * Aborts a drag operation.
   * @private
   * @param {Boolean} [invalid]
   * @param {Object} [event]
   * @param {Boolean} [silent]
   */
  abortContainerDrag(invalid = false, event = null, silent = false) {
    const me = this, { context } = me;
    if (context.dragging) {
      context.dragging.classList.remove(me.dropPlaceholderCls);
      context.dragProxy.remove();
      me.revertPosition();
    }
    if (!silent) {
      me.trigger(invalid ? "drop" : "abort", { context, event });
    }
    me.reset();
  }
  //endregion
  //region Helpers
  /**
   * Updates the drag proxy position.
   * @private
   * @param event
   */
  updateContainerProxy(event) {
    const me = this, { context } = me, proxy = context.dragProxy;
    let newX = event.pageX - context.offsetX, newY = event.pageY - context.offsetY;
    if (typeof me.minX === "number") {
      newX = Math.max(me.minX, newX);
    }
    if (typeof me.maxX === "number") {
      newX = Math.min(me.maxX - proxy.offsetWidth, newX);
    }
    if (typeof me.minY === "number") {
      newY = Math.max(me.minY, newY);
    }
    if (typeof me.maxY === "number") {
      newY = Math.min(me.maxY - proxy.offsetHeight, newY);
    }
    if (me.lockX) {
      DomHelper.setTranslateY(proxy, newY);
    } else if (me.lockY) {
      DomHelper.setTranslateX(proxy, newX);
    } else {
      DomHelper.setTranslateXY(proxy, newX, newY);
    }
    let targetElement;
    if (event.type === "touchmove") {
      const touch = event.changedTouches[0];
      targetElement = DomHelper.elementFromPoint(touch.clientX, touch.clientY);
    } else {
      targetElement = event.target;
    }
    context.targetElement = targetElement;
  }
  /**
   * Positions element being dragged in relation to targetElement.
   * @private
   * @param targetElement
   * @param event
   */
  moveNextTo(targetElement, event) {
    const { context } = this, dragElement = context.dragging, parent = targetElement.parentElement;
    if (targetElement !== dragElement) {
      const centerX = Rectangle.from(targetElement).center.x;
      if (this.isRTL && event.pageX > centerX || !this.isRTL && event.pageX < centerX) {
        parent.insertBefore(dragElement, targetElement);
        context.insertBefore = targetElement;
      } else {
        if (targetElement.nextElementSibling) {
          if (targetElement.nextElementSibling !== dragElement) {
            context.insertBefore = targetElement.nextElementSibling;
            parent.insertBefore(dragElement, targetElement.nextElementSibling);
          } else if (!context.insertBefore && dragElement.parentElement.lastElementChild !== dragElement) {
            context.insertBefore = targetElement.nextElementSibling;
          }
        } else {
          parent.appendChild(dragElement);
          context.insertBefore = null;
        }
      }
      context.draggedTo = parent;
    }
  }
  /**
   * Moves element being dragged back to its original position.
   * @private
   */
  revertPosition() {
    const { context } = this, { dragging } = context, { parent, next } = context.originalPosition;
    if (next) {
      const isNoop = next.previousSibling === dragging || !next && dragging === parent.lastChild;
      if (!isNoop) {
        parent.insertBefore(dragging, next);
      }
    } else {
      parent.appendChild(dragging);
    }
    context.draggedTo = null;
  }
  //endregion
};

// ../Core/lib/Core/helper/mixin/DragHelperTranslate.js
var noScroll = { pageXOffset: 0, pageYOffset: 0 };
var DragHelperTranslate_default = (Target) => class DragHelperTranslate extends Delayable_default(Target || Base) {
  static get $name() {
    return "DragHelperTranslate";
  }
  static get configurable() {
    return {
      positioning: null,
      // Private config that disables updating elements position, for when data is live updated during drag,
      // leading to element being redrawn
      skipUpdatingElement: null
    };
  }
  //region Init
  /**
   * Initialize translation drag mode.
   * @private
   */
  initTranslateDrag() {
    const me = this;
    if (!me.isElementDraggable && me.targetSelector) {
      me.isElementDraggable = (element) => element.closest(me.targetSelector);
    }
  }
  //endregion
  //region Grab, update, finish
  /**
   * Grab an element which can be moved using translation.
   * @private
   * @param event
   * @returns {Boolean}
   */
  grabTranslateDrag(event) {
    const element = this.getTarget(event);
    if (element) {
      this.context = {
        valid: true,
        element,
        startPageX: event.pageX,
        startPageY: event.pageY,
        startClientX: event.clientX,
        startClientY: event.clientY
      };
      return true;
    }
    return false;
  }
  getTarget(event) {
    return event.target.closest(this.targetSelector);
  }
  getX(element) {
    if (this.positioning === "absolute") {
      return parseFloat(element.style.left, 10);
    } else {
      return DomHelper.getTranslateX(element);
    }
  }
  getY(element) {
    if (this.positioning === "absolute") {
      return parseFloat(element.style.top, 10);
    } else {
      return DomHelper.getTranslateY(element);
    }
  }
  getXY(element) {
    if (this.positioning === "absolute") {
      return [element.offsetLeft, element.offsetTop];
    } else {
      return DomHelper.getTranslateXY(element);
    }
  }
  setXY(element, x, y) {
    if (this.skipUpdatingElement) {
      return;
    }
    if (this.positioning === "absolute") {
      element.style.left = x + "px";
      element.style.top = y + "px";
    } else {
      DomHelper.setTranslateXY(element, x, y);
    }
  }
  /**
   * Start translating, called on first mouse move after dragging
   * @private
   * @param event
   */
  startTranslateDrag(event) {
    const me = this, { context, outerElement, proxySelector } = me, dragWithin = me.dragWithin = me.dragWithin || me.cloneTarget && document.body;
    let element = context.dragProxy || context.element;
    const grabbed = element, grabbedParent = element.parentElement;
    if (me.cloneTarget) {
      const elementToClone = proxySelector ? element.querySelector(proxySelector) : element, { width, height, x: proxyX, y: proxyY } = Rectangle.from(elementToClone, Rectangle.outer(dragWithin));
      element = me.createProxy(element);
      let x = proxyX, y = proxyY;
      if (me.autoSizeClonedTarget) {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      }
      element.classList.add(me.dragProxyCls, me.draggingCls);
      element.classList.remove("b-hover", "b-selected", "b-focused");
      dragWithin.appendChild(element);
      if (!me.autoSizeClonedTarget || proxySelector) {
        const proxyRect = element.getBoundingClientRect(), { x: dragWithinX, y: dragWithinY } = dragWithin.getBoundingClientRect(), localX = event.clientX - dragWithinX, localY = event.clientY - dragWithinY + (dragWithin !== document.body ? document.body.getBoundingClientRect().y : 0);
        x = localX - proxyRect.width / 2;
        y = localY - proxyRect.height / 2;
        context.startPageX = event.pageX;
        context.startPageY = event.pageY;
      }
      me.setXY(element, x, y);
      grabbed.classList.add("b-drag-original");
      if (me.hideOriginalElement) {
        grabbed.classList.add("b-hidden");
      }
    }
    element.classList.add(me.draggingCls);
    Object.assign(context, {
      // The element which we're moving, could be a cloned version of grabbed, or the grabbed element itself
      element,
      // The original element upon which the mousedown event triggered a drag operation
      grabbed,
      // The parent of the original element where the pointerdown was detected - to be able to restore after an invalid drop
      grabbedParent,
      // The next sibling of the original element where the pointerdown was detected - to be able to restore after an invalid drop
      grabbedNextSibling: element.nextElementSibling,
      // elements position within parent element
      elementStartX: me.getX(element),
      elementStartY: me.getY(element),
      elementX: DomHelper.getOffsetX(element, dragWithin || outerElement),
      elementY: DomHelper.getOffsetY(element, dragWithin || outerElement),
      scrollX: 0,
      scrollY: 0,
      scrollManagerElementContainsDragProxy: !me.cloneTarget || dragWithin === outerElement
    });
    if (dragWithin) {
      context.parentElement = element.parentElement;
      if (dragWithin !== element.parentElement) {
        dragWithin.appendChild(element);
      }
      me.updateTranslateProxy(event);
    }
  }
  // When drag has started, create proxy versions (if applicable) and store original positions of all related elements
  // to be able to animate back to these positions in case of an aborted drag
  onTranslateDragStarted() {
    const me = this, { context } = me;
    let { relatedElements } = context;
    if (me.unifiedProxy) {
      context.element.classList.add("b-drag-main", "b-drag-unified-proxy");
    }
    if ((relatedElements == null ? void 0 : relatedElements.length) > 0) {
      context.relatedElStartPos = [];
      context.relatedElDragFromPos = [];
      const { proxySelector } = me;
      let [elementStartX, elementStartY] = [context.elementStartX, context.elementStartY];
      context.originalRelatedElements = relatedElements;
      relatedElements = context.relatedElements = relatedElements.map((relatedEl, i) => {
        const proxyTemplateElement = proxySelector ? relatedEl.querySelector(proxySelector) : relatedEl, { x, y, width, height } = Rectangle.from(proxyTemplateElement, me.dragWithin), relatedElementToDrag = me.cloneTarget ? me.createProxy(relatedEl) : relatedEl;
        relatedElementToDrag.classList.add(me.draggingCls);
        relatedElementToDrag.classList.remove("b-hover", "b-selected", "b-focused");
        if (me.cloneTarget) {
          me.setXY(relatedElementToDrag, x, y);
          me.dragWithin.appendChild(relatedElementToDrag);
          relatedElementToDrag.classList.add(me.dragProxyCls);
          if (me.autoSizeClonedTarget) {
            relatedElementToDrag.style.width = `${width}px`;
            relatedElementToDrag.style.height = `${height}px`;
          }
          if (me.hideOriginalElement) {
            relatedEl.classList.add("b-hidden");
          }
          relatedEl.classList.add("b-drag-original");
        }
        context.relatedElStartPos[i] = context.relatedElDragFromPos[i] = me.getXY(relatedElementToDrag);
        if (me.unifiedProxy) {
          relatedElementToDrag.classList.add("b-drag-unified-animation", "b-drag-unified-proxy");
          elementStartX += me.unifiedOffset;
          elementStartY += me.unifiedOffset;
          me.setXY(relatedElementToDrag, elementStartX, elementStartY);
          context.relatedElDragFromPos[i] = [elementStartX, elementStartY];
          relatedElementToDrag.style.zIndex = 100 - i;
        }
        return relatedElementToDrag;
      });
      if (me.unifiedProxy && relatedElements && relatedElements.length > 0) {
        EventHelper.onTransitionEnd({
          element: relatedElements[0],
          property: "transform",
          handler() {
            relatedElements.forEach((el) => el.classList.remove("b-drag-unified-animation"));
          },
          thisObj: me,
          once: true
        });
      }
    }
  }
  /**
   * Limit translation to outer bounds and specified constraints
   * @private
   * @param element
   * @param x
   * @param y
   * @returns {{constrainedX: *, constrainedY: *}}
   */
  applyConstraints(element, x, y) {
    const me = this, { constrain, dragWithin } = me, { pageXOffset, pageYOffset } = dragWithin === document.body ? globalThis : noScroll;
    if (dragWithin && constrain) {
      if (x < 0) {
        x = 0;
      }
      if (x + element.offsetWidth > dragWithin.scrollWidth) {
        x = dragWithin.scrollWidth - element.offsetWidth;
      }
      if (y < 0) {
        y = 0;
      }
      if (y + element.offsetHeight > dragWithin.scrollHeight) {
        y = dragWithin.scrollHeight - element.offsetHeight;
      }
    }
    if (typeof me.minX === "number") {
      x = Math.max(me.minX + pageXOffset, x);
    }
    if (typeof me.maxX === "number") {
      x = Math.min(me.maxX + pageXOffset, x);
    }
    if (typeof me.minY === "number") {
      y = Math.max(me.minY + pageYOffset, y);
    }
    if (typeof me.maxY === "number") {
      y = Math.min(me.maxY + pageYOffset, y);
    }
    return { constrainedX: x, constrainedY: y };
  }
  /**
   * Update elements translation on mouse move.
   * @private
   * @param {MouseEvent} event
   * @param {Object} scrollManagerConfig
   */
  updateTranslateProxy(event, scrollManagerConfig) {
    const me = this, { lockX, lockY, context } = me, element = context.dragProxy || context.element, { relatedElements, relatedElDragFromPos } = context;
    if (context.scrollManagerElementContainsDragProxy && scrollManagerConfig) {
      context.scrollX = scrollManagerConfig.getRelativeLeftScroll(element);
      context.scrollY = scrollManagerConfig.getRelativeTopScroll(element);
    }
    context.pageX = event.pageX;
    context.pageY = event.pageY;
    context.clientX = event.clientX;
    context.clientY = event.clientY;
    let newX = context.elementStartX + event.pageX - context.startPageX + context.scrollX, newY = context.elementStartY + event.pageY - context.startPageY + context.scrollY;
    if (me.snapCoordinates) {
      const snapped = me.snapCoordinates({ element, newX, newY });
      newX = snapped.x;
      newY = snapped.y;
    }
    const { constrainedX, constrainedY } = me.applyConstraints(element, newX, newY);
    if (context.started || constrainedX !== newX || constrainedY !== newY) {
      me.setXY(element, lockX ? void 0 : constrainedX, lockY ? void 0 : constrainedY);
    }
    if (relatedElements) {
      const deltaX = lockX ? 0 : constrainedX - context.elementStartX, deltaY = lockY ? 0 : constrainedY - context.elementStartY;
      relatedElements.forEach((r, i) => {
        const [x, y] = relatedElDragFromPos[i];
        me.setXY(r, x + deltaX, y + deltaY);
      });
    }
    context.newX = constrainedX;
    context.newY = constrainedY;
  }
  /**
   * Finalize drag, fire drop.
   * @private
   * @param event
   * @fires drop
   */
  async finishTranslateDrag(event) {
    const me = this, context = me.context, { target } = event, xChanged = !me.lockX && Math.round(context.newX) !== Math.round(context.elementStartX), yChanged = !me.lockY && Math.round(context.newY) !== Math.round(context.elementStartY), element = context.dragProxy || context.element, { relatedElements } = context;
    if (!me.ignoreSamePositionDrop || xChanged || yChanged) {
      if (context.valid === false) {
        await me.abortTranslateDrag(true, event);
      } else {
        const targetRect = !me.allowDropOutside && Rectangle.from(me.dragWithin || me.outerElement);
        if (targetRect && (typeof me.minX !== "number" && me.minX !== true && event.pageX < targetRect.left || typeof me.maxX !== "number" && me.maxX !== true && event.pageX > targetRect.right || typeof me.minY !== "number" && me.minY !== true && event.pageY < targetRect.top || typeof me.maxY !== "number" && me.maxY !== true && event.pageY > targetRect.bottom)) {
          await me.abortTranslateDrag(true, event);
        } else {
          context.finalize = async (valid = context.valid) => {
            if (context.finalized) {
              console.warn("DragHelper: Finalizing already finalized drag");
              return;
            }
            context.finalized = true;
            if (!valid && me.context) {
              await me.abortTranslateDrag(true, null, true);
            }
            if (!me.isDestroyed) {
              me.trigger("dropFinalized", { context, event, target });
              me.reset();
            }
            if (!me.cloneTarget && element.parentElement !== context.grabbedParent) {
              [element, ...relatedElements || []].forEach((el) => el.style.transform = "");
            }
          };
          context.async = false;
          await me.trigger("drop", { context, event, target });
          if (!context.async) {
            await context.finalize();
          }
        }
      }
    } else {
      me.abortTranslateDrag(false, event);
    }
  }
  /**
   * Abort translation
   * @private
   * @param invalid
   * @fires abort
   */
  async abortTranslateDrag(invalid = false, event = null, silent = false) {
    var _a, _b;
    const me = this, {
      cloneTarget,
      context,
      proxySelector,
      dragWithin,
      draggingCls
    } = me, { relatedElements, relatedElStartPos, grabbed } = context, element = context.dragProxy || context.element;
    context.valid = false;
    (_a = me.scrollManager) == null ? void 0 : _a.stopMonitoring();
    if (context.aborted) {
      console.warn("DragHelper: Aborting already aborted drag");
      return;
    }
    let { elementStartX, elementStartY } = context;
    const proxyMoved = elementStartX !== me.getX(element) || elementStartY !== me.getY(element);
    if (element && context.started) {
      if (!cloneTarget && dragWithin && dragWithin !== context.grabbedParent) {
        context.grabbedParent.insertBefore(element, context.grabbedNextSibling);
      }
      if (cloneTarget) {
        if (proxySelector) {
          const animateTo = grabbed.querySelector(proxySelector) || grabbed, { x, y } = Rectangle.from(animateTo);
          elementStartX = x;
          elementStartY = y;
        }
      }
      element.classList.add("b-aborting");
      me.setXY(element, elementStartX, elementStartY);
      relatedElements == null ? void 0 : relatedElements.forEach((element2, i) => {
        element2.classList.remove(draggingCls);
        element2.classList.add("b-aborting");
        me.setXY(element2, relatedElStartPos[i][0], relatedElStartPos[i][1]);
      });
      if (!silent) {
        me.trigger(invalid ? "drop" : "abort", { context, event });
      }
      if (element.isConnected && !me.isDestroying && proxyMoved) {
        await EventHelper.waitForTransitionEnd({
          element,
          property: DomHelper.getPropertyTransitionDuration(element, "transform") ? "transform" : "all",
          thisObj: me,
          once: true,
          runOnDestroy: true
        });
      }
      if (!me.isDestroyed) {
        me.trigger("abortFinalized", { context, event });
      }
    }
    if ((_b = me.context) == null ? void 0 : _b.started) {
      me.reset();
    }
  }
  // Restore state of all mutated elements
  cleanUp() {
    const me = this, { context, cloneTarget, draggingCls, dragProxyCls } = me, element = context.dragProxy || context.element, { relatedElements, originalRelatedElements, grabbed } = context, removeClonedProxies = cloneTarget && (me.removeProxyAfterDrop || !context.valid), cssClassesToRemove = [draggingCls, "b-aborting", dragProxyCls, "b-drag-main", "b-drag-unified-proxy"];
    element.classList.remove(...cssClassesToRemove);
    if (removeClonedProxies) {
      element.remove();
    }
    relatedElements == null ? void 0 : relatedElements.forEach((element2) => {
      if (removeClonedProxies) {
        element2.remove();
      } else {
        element2.classList.remove(...cssClassesToRemove);
      }
    });
    grabbed.classList.remove("b-drag-original", "b-hidden");
    originalRelatedElements == null ? void 0 : originalRelatedElements.forEach((element2) => element2.classList.remove("b-hidden", "b-drag-original"));
  }
  //endregion
};

// ../Core/lib/Core/helper/DragHelper.js
var rootElementListeners = {
  move: "onMouseMove",
  up: "onMouseUp",
  docclick: "onDocumentClick",
  touchstart: "onTouchStart",
  touchmove: "onTouchMove",
  touchend: "onTouchEnd",
  keydown: "onKeyDown"
};
var DragHelper = class extends Base.mixin(Events_default, DragHelperContainer_default, DragHelperTranslate_default) {
  //region Config
  static get defaultConfig() {
    return {
      /**
       * Drag proxy CSS class
       * @config {String}
       * @default
       * @private
       */
      dragProxyCls: "b-drag-proxy",
      /**
       * CSS class added when drag is invalid
       * @config {String}
       * @default
       */
      invalidCls: "b-drag-invalid",
      /**
       * CSS class added to the source element in Container drag
       * @config {String}
       * @default
       * @private
       */
      draggingCls: "b-dragging",
      /**
       * CSS class added to the source element in Container drag
       * @config {String}
       * @default
       * @private
       */
      dropPlaceholderCls: "b-drop-placeholder",
      /**
       * The amount of pixels to move mouse before it counts as a drag operation
       * @config {Number}
       * @default
       */
      dragThreshold: 5,
      /**
       * The outer element where the drag helper will operate (attach events to it and use as outer limit when looking for ancestors)
       * @config {HTMLElement}
       * @default
       */
      outerElement: document.body,
      /**
       * Outer element that limits where element can be dragged
       * @config {HTMLElement}
       */
      dragWithin: null,
      /**
       * Set to true to stack any related dragged elements below the main drag proxy element. Only applicable when
       * using translate {@link #config-mode} with {@link #config-cloneTarget}
       * @config {Boolean}
       */
      unifiedProxy: null,
      monitoringConfig: null,
      /**
       * Constrain translate drag to dragWithin elements bounds (set to false to allow it to "overlap" edges)
       * @config {Boolean}
       * @default
       */
      constrain: true,
      /**
       * Smallest allowed x when dragging horizontally.
       * @config {Number}
       */
      minX: null,
      /**
       * Largest allowed x when dragging horizontally.
       * @config {Number}
       */
      maxX: null,
      /**
       * Smallest allowed y when dragging horizontally.
       * @config {Number}
       */
      minY: null,
      /**
       * Largest allowed y when dragging horizontally.
       * @config {Number}
       */
      maxY: null,
      /**
       * Enabled dragging, specify mode:
       * <table>
       * <tr><td>container<td>Allows reordering elements within one and/or between multiple containers
       * <tr><td>translateXY<td>Allows dragging within a parent container
       * </table>
       * @config {'container'|'translateXY'}
       * @default
       */
      mode: "translateXY",
      /**
       * A function that determines if dragging an element is allowed. Gets called with the element as argument,
       * return `true` to allow dragging or `false` to prevent.
       * @config {Function}
       * @param {HTMLElement} element
       * @returns {Boolean}
       */
      isElementDraggable: null,
      /**
       * A CSS selector used to determine if dragging an element is allowed.
       * @config {String}
       */
      targetSelector: null,
      /**
       * A CSS selector used to determine if a drop is allowed at the current position.
       * @config {String}
       */
      dropTargetSelector: null,
      /**
       * A CSS selector added to each drop target element while dragging.
       * @config {String}
       */
      dropTargetCls: null,
      /**
       * A CSS selector used to target a child element of the mouse down element, to use as the drag proxy element.
       * Applies to translate {@link #config-mode mode} when using {@link #config-cloneTarget}.
       * @config {String}
       */
      proxySelector: null,
      /**
       * Set to `true` to clone the dragged target, and not move the actual target DOM node.
       * @config {Boolean}
       * @default
       */
      cloneTarget: false,
      /**
       * Set to `false` to not apply width/height of cloned drag proxy elements.
       * @config {Boolean}
       * @default
       */
      autoSizeClonedTarget: true,
      /**
       * Set to true to hide the original element while dragging (applicable when `cloneTarget` is true).
       * @config {Boolean}
       * @default
       */
      hideOriginalElement: false,
      /**
       * Containers whose elements can be rearranged (and moved between the containers). Used when
       * mode is set to "container".
       * @config {HTMLElement[]}
       */
      containers: null,
      /**
       * A CSS selector used to exclude elements when using container mode
       * @config {String}
       */
      ignoreSelector: null,
      startEvent: null,
      /**
       * Configure as `true` to disallow dragging in the `X` axis. The dragged element will only move vertically.
       * @config {Boolean}
       * @default
       */
      lockX: false,
      /**
       * Configure as `true` to disallow dragging in the `Y` axis. The dragged element will only move horizontally.
       * @config {Boolean}
       * @default
       */
      lockY: false,
      /**
       * The amount of milliseconds to wait after a touchstart, before a drag gesture will be allowed to start.
       * @config {Number}
       * @default
       */
      touchStartDelay: 300,
      /**
       * Scroll manager of the target. If specified, scrolling while dragging is supported.
       * @config {Core.util.ScrollManager}
       */
      scrollManager: null,
      /**
       * A method provided to snap coordinates to fixed points as you drag
       * @config {Function}
       * @internal
       */
      snapCoordinates: null,
      /**
       * When using {@link #config-unifiedProxy}, use this amount of pixels to offset each extra element when dragging multiple items
       * @config {Number}
       * @default
       */
      unifiedOffset: 5,
      /**
       * Configure as `false` to take ownership of the proxy element after a valid drop (advanced usage).
       * @config {Boolean}
       * @default
       */
      removeProxyAfterDrop: true,
      clickSwallowDuration: 50,
      ignoreSamePositionDrop: true,
      // true to allow drops outside the dragWithin element
      allowDropOutside: null,
      // for container mode
      floatRootOwner: null,
      mouseMoveListenerElement: document,
      externalDropTargetSelector: null,
      testConfig: {
        transitionDuration: 10,
        clickSwallowDuration: 50,
        touchStartDelay: 100
      },
      rtlSource: null,
      /**
       * Creates the proxy element to be dragged, when using {@link #config-cloneTarget}. Clones the original element by default.
       * Provide your custom {@link #function-createProxy} function to be used for creating drag proxy.
       * @param {HTMLElement} element The element from which the drag operation originated
       * @config {Function}
       * @returns {HTMLElement}
       */
      createProxy: null
    };
  }
  //endregion
  //region Events
  /**
   * Fired before dragging starts, return `false` to prevent the drag operation.
   * @preventable
   * @event beforeDragStart
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The original element upon which the mousedown event triggered a drag operation
   * @param {MouseEvent|TouchEvent} event
   */
  /**
   * Fired when dragging starts. The event includes a `context` object. If you want to drag additional elements you can
   * provide these as an array of elements assigned to the `relatedElements` property of the context object.
   * @event dragStart
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we're moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   * @param {HTMLElement[]} context.relatedElements Array of extra elements to include in the drag.
   * @param {MouseEvent|TouchEvent} event
   */
  /**
   * Fired while dragging, you can signal that the drop is valid or invalid by setting `context.valid = false;`
   * @event drag
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we are moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.target The target element below the cursor
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   * @param {HTMLElement[]} context.relatedElements An array of extra elements dragged with the main dragged element
   * @param {Boolean} context.valid Set this to true or false to indicate whether the drop position is valid.
   * @param {MouseEvent} event
   */
  /**
   * Fired after a drop at an invalid position
   * @event abort
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we are moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.target The target element below the cursor
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   * @param {HTMLElement[]} context.relatedElements An array of extra elements dragged with the main dragged element
   * @param {MouseEvent} event
   */
  /**
   * Fires after {@link #event-abort} and after drag proxy has animated back to its original position
   * @private
   * @event abortFinalized
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we are moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.target The target element below the cursor
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   * @param {MouseEvent} event
   */
  //endregion
  //region Init
  /**
   * Initializes a new DragHelper.
   * @param {DragHelperConfig} config Configuration object, accepts options specified under Configs above
   *
   * ```javascript
   * new DragHelper({
   *   containers: [div1, div2],
   *   isElementDraggable: element => element.className.contains('handle'),
   *   outerElement: topParent,
   *   listeners: {
   *     drop: onDrop,
   *     thisObj: this
   *   }
   * });
   * ```
   *
   * @function constructor
   */
  construct(config) {
    const me = this;
    super.construct(config);
    me.initListeners();
    if (me.isContainerDrag) {
      me.initContainerDrag();
    } else {
      me.initTranslateDrag();
    }
    me.onScrollManagerScrollCallback = me.onScrollManagerScrollCallback.bind(me);
  }
  doDestroy() {
    this.reset(true);
    super.doDestroy();
  }
  /**
   * Initialize listener
   * @private
   */
  initListeners() {
    const me = this, { outerElement } = me, dragStartListeners = {
      element: outerElement,
      pointerdown: "onPointerDown",
      thisObj: me
    };
    me.mouseMoveListenerElement = me.getMouseMoveListenerTarget(outerElement);
    EventHelper.on(dragStartListeners);
  }
  // Salesforce hook: we override this method to move listener from the body (which is default root node) to element
  // inside of LWC
  getMouseMoveListenerTarget(element) {
    const root = element.getRootNode();
    let result = this.mouseMoveListenerElement;
    if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && root.mode === "closed") {
      result = element.closest(".b-outer") || result;
    }
    return result;
  }
  get isRTL() {
    var _a;
    return Boolean((_a = this.rtlSource) == null ? void 0 : _a.rtl);
  }
  //endregion
  //region Events
  /**
   * Fires after drop. For valid drops, it exposes `context.async` which you can set to true to signal that additional
   * processing is needed before finalizing the drop (such as showing some dialog). When that operation is done, call
   * `context.finalize(true/false)` with a boolean that determines the outcome of the drop.
   *
   * You can signal that the drop is valid or invalid by setting `context.valid = false;`
   *
   * For translate type drags with {@link #config-cloneTarget}, you can also set `transitionTo` if you want to animate
   * the dragged proxy to a position before finalizing the operation. See class intro text for example usage.
   *
   * @event drop
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we are moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.target The target element below the cursor
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   * @param {HTMLElement[]} context.relatedElements An array of extra elements dragged with the main dragged element
   * @param {Boolean} context.valid true if the drop position is valid
   */
  /**
   * Fires after {@link #event-drop} and after drag proxy has animated to its final position (if setting `transitionTo`
   * on the drag context object).
   * @private
   * @event dropFinalized
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {HTMLElement} context.element The element which we are moving, could be a cloned version of grabbed, or the grabbed element itself
   * @param {HTMLElement} context.target The target element below the cursor
   * @param {HTMLElement} context.grabbed The original element upon which the mousedown event triggered a drag operation
   */
  onPointerDown(event) {
    const me = this;
    if (
      // Left button or touch allowed
      event.button !== 0 || // If a drag is ongoing already, finalize it and don't proceed with new drag (happens if pointerup happened
      // when current window wasn't focused - tab switch or window switch). Also handles the edge case of trying to
      // start a new drag while previous is awaiting finalization, in which case it just bails out.
      me.context
    ) {
      return;
    }
    if (me.isElementDraggable && !me.isElementDraggable(event.target, event)) {
      return;
    }
    me.startEvent = event;
    const handled = me.isContainerDrag ? me.grabContainerDrag(event) : me.grabTranslateDrag(event);
    if (handled) {
      me.blurDetacher = EventHelper.on({
        element: globalThis,
        blur: me.onWindowBlur,
        thisObj: me
      });
      const dragListeners = {
        element: me.mouseMoveListenerElement,
        thisObj: me,
        capture: true,
        keydown: rootElementListeners.keydown
      };
      if (event.pointerType === "touch") {
        me.touchStartTimer = me.setTimeout(() => me.touchStartTimer = null, me.touchStartDelay, "touchStartDelay");
        dragListeners.touchmove = {
          handler: rootElementListeners.touchmove,
          passive: false
          // We need to be able to preventDefault on the touchmove
        };
        dragListeners.touchend = dragListeners.pointerup = rootElementListeners.touchend;
      } else {
        dragListeners.pointermove = rootElementListeners.move;
        dragListeners.pointerup = rootElementListeners.up;
      }
      me.dragListenersDetacher = EventHelper.on(dragListeners);
      if (me.dragWithin && me.dragWithin !== me.outerElement && me.outerElement.contains(me.dragWithin)) {
        const box = Rectangle.from(me.dragWithin, me.outerElement);
        me.minY = box.top;
        me.maxY = box.bottom;
        me.minX = box.left;
        me.maxX = box.right;
      }
    }
  }
  async internalMove(event) {
    var _a, _b;
    if (event.scrollInitiated) {
      return;
    }
    const me = this, { context } = me, distance = EventHelper.getDistanceBetween(me.startEvent, event), abortTouchDrag = me.touchStartTimer && distance > me.dragThreshold;
    if (abortTouchDrag) {
      me.abort(true);
      return;
    }
    if (!me.touchStartTimer && (context == null ? void 0 : context.element) && (context.started || distance >= me.dragThreshold) && // Ignore text nodes
    ((_a = event.target) == null ? void 0 : _a.nodeType) === Node.ELEMENT_NODE) {
      if (!context.started) {
        if (me.trigger("beforeDragStart", { context, event }) === false) {
          return me.abort();
        }
        if (me.isContainerDrag) {
          me.startContainerDrag(event);
        } else {
          me.startTranslateDrag(event);
        }
        context.started = true;
        (_b = me.scrollManager) == null ? void 0 : _b.startMonitoring(ObjectHelper.merge({
          scrollables: [
            {
              element: me.dragWithin || me.outerElement
            }
          ],
          callback: me.onScrollManagerScrollCallback
        }, me.monitoringConfig));
        context.outermostEl = DomHelper.getOutermostElement(event.target);
        context.outermostEl.classList.add("b-draghelper-active");
        if (me.dropTargetSelector && me.dropTargetCls) {
          DomHelper.getRootElement(me.outerElement).querySelectorAll(me.dropTargetSelector).forEach(
            (el) => el.classList.add(me.dropTargetCls)
          );
        }
        const result = me.trigger("dragStart", { context, event });
        if (ObjectHelper.isPromise(result)) {
          await result;
        }
        context.moveUnblocked = true;
        if (me.isContainerDrag) {
          me.onContainerDragStarted(event);
        } else {
          me.onTranslateDragStarted(event);
        }
        me.trigger("afterDragStart", { context, event });
      }
      if (context.moveUnblocked) {
        if (me._cachedMouseEvent) {
          me.update(event);
          me.update(me._cachedMouseEvent);
          delete me._cachedMouseEvent;
        } else {
          me.update(event);
        }
      } else {
        me._cachedMouseEvent = event;
      }
      if (event.type === "touchmove") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }
  onScrollManagerScrollCallback(config) {
    var _a;
    const { lastMouseMoveEvent } = this;
    if (((_a = this.context) == null ? void 0 : _a.element) && lastMouseMoveEvent) {
      lastMouseMoveEvent.isScroll = true;
      this.update(lastMouseMoveEvent, config);
    }
  }
  onTouchMove(event) {
    this.internalMove(event);
  }
  /**
   * Move drag element with mouse.
   * @param event
   * @fires beforeDragStart
   * @fires dragStart
   * @private
   */
  onMouseMove(event) {
    this.internalMove(event);
  }
  /**
   * Updates drag, called when an element is grabbed and mouse moves
   * @private
   * @fires drag
   */
  update(event, scrollManagerConfig) {
    const me = this, { context } = me, scrollingPageElement = document.scrollingElement || document.body;
    let target = me.getMouseMoveEventTarget(event);
    if (event.type === "touchmove") {
      const touch = event.changedTouches[0];
      target = DomHelper.elementFromPoint(touch.clientX + scrollingPageElement.scrollLeft, touch.clientY + scrollingPageElement.scrollTop);
    }
    context.target = target;
    let internallyValid = me.allowDropOutside || !me.dragWithin || me.dragWithin.contains(event.target);
    if (internallyValid && me.dropTargetSelector) {
      internallyValid = internallyValid && Boolean(target == null ? void 0 : target.closest(me.dropTargetSelector));
    }
    if (me.isContainerDrag) {
      me.updateContainerProxy(event, scrollManagerConfig);
    } else {
      me.updateTranslateProxy(event, scrollManagerConfig);
    }
    context.valid = internallyValid;
    me.trigger("drag", { context, event });
    if (me.isContainerDrag) {
      me.updateContainerDrag(event, scrollManagerConfig);
    }
    context.valid = context.valid && internallyValid;
    for (const element of me.draggedElements) {
      element.classList.toggle(me.invalidCls, !context.valid);
    }
    if (event) {
      me.lastMouseMoveEvent = event;
    }
  }
  get draggedElements() {
    var _a;
    const { context } = this;
    return [context.dragProxy || context.element, ...(_a = context.relatedElements) != null ? _a : []];
  }
  /**
   * Abort dragging
   * @fires abort
   */
  async abort(silent = false) {
    var _a, _b;
    const me = this, { context } = me;
    (_b = (_a = me.scrollManager) == null ? void 0 : _a.stopMonitoring) == null ? void 0 : _b.call(_a);
    me.removeListeners();
    if ((context == null ? void 0 : context.started) && !context.aborted) {
      context.element.getBoundingClientRect();
      context.valid = false;
      if (me.isContainerDrag) {
        me.abortContainerDrag(void 0, void 0, silent);
      } else {
        me.abortTranslateDrag(void 0, void 0, silent);
      }
      context.aborted = true;
    } else {
      me.reset(true);
    }
  }
  // Empty class implementation. If listeners *are* added, the detacher is added
  // as an instance property. So this is always callable.
  removeListeners() {
    var _a, _b;
    (_a = this.dragListenersDetacher) == null ? void 0 : _a.call(this);
    (_b = this.blurDetacher) == null ? void 0 : _b.call(this);
  }
  // Called when a drag operation is completed, or aborted
  // Removes DOM listeners and resets context
  reset(silent) {
    const me = this, { context } = me;
    if (context == null ? void 0 : context.started) {
      for (const element of me.draggedElements) {
        element.classList.remove(me.invalidCls);
      }
      context.outermostEl.classList.remove("b-draghelper-active");
      if (me.isContainerDrag) {
        context.dragProxy.remove();
      } else {
        me.cleanUp();
      }
      if (me.dropTargetSelector && me.dropTargetCls) {
        DomHelper.getRootElement(me.outerElement).querySelectorAll(me.dropTargetSelector).forEach(
          (el) => el.classList.remove(me.dropTargetCls)
        );
      }
    }
    me.removeListeners();
    if (!silent) {
      me.trigger("reset");
    }
    me.context = me.lastMouseMoveEvent = null;
  }
  onTouchEnd(event) {
    this.onMouseUp(event);
  }
  /**
   * This is a capture listener, only added during drag, which prevents a click gesture
   * propagating from the terminating mouseup gesture
   * @param {MouseEvent} event
   * @private
   */
  onDocumentClick(event) {
    event.stopPropagation();
  }
  /**
   * Drop on mouse up (if dropped on valid target).
   * @param event
   * @private
   */
  onMouseUp(event) {
    var _a;
    const me = this, { context } = me;
    me.removeListeners();
    if (context) {
      (_a = me.scrollManager) == null ? void 0 : _a.stopMonitoring();
      if (context.started) {
        if (context.moveUnblocked) {
          event.stopPropagation();
          context.finalizing = true;
          if (me.isContainerDrag) {
            me.finishContainerDrag(event);
          } else {
            me.finishTranslateDrag(event);
          }
          EventHelper.on({
            element: document,
            thisObj: me,
            click: rootElementListeners.docclick,
            capture: true,
            expires: me.clickSwallowDuration,
            // In case a click did not ensue, remove the listener
            once: true
          });
        } else {
          me.ion({
            drag() {
              me.onMouseUp(event);
            },
            once: true
          });
        }
      } else {
        me.reset(true);
      }
    }
  }
  /**
   * Cancel on ESC key
   * @param event
   * @private
   */
  onKeyDown(event) {
    var _a;
    if (((_a = this.context) == null ? void 0 : _a.started) && event.key === "Escape") {
      event.stopImmediatePropagation();
      this.abort();
    }
  }
  onWindowBlur() {
    if (this.context && !this.context.finalizing) {
      this.abort();
    }
  }
  /**
   * Creates the proxy element to be dragged, when using {@link #config-cloneTarget}. Clones the original element by default.
   * Override it to provide your own custom HTML element structure to be used as the drag proxy.
   * @param {HTMLElement} element The element from which the drag operation originated
   * @returns {HTMLElement}
   */
  createProxy(element) {
    if (this.proxySelector) {
      element = element.querySelector(this.proxySelector) || element;
    }
    const proxy = element.cloneNode(true);
    proxy.removeAttribute("id");
    return proxy;
  }
  //endregion
  get isContainerDrag() {
    return this.mode === "container";
  }
  /**
   * Animated the proxy element to be aligned with the passed element. Returns a Promise which resolves after the
   * DOM transition completes. Only applies to 'translateXY' mode.
   * @param {HTMLElement|Core.helper.util.Rectangle} element The target element or a Rectangle
   * @param {AlignSpec} [alignSpec] An object describing how to the align drag proxy to the target element
   * to offset the aligned widget further from the target. May be configured as -ve to move the aligned widget
   * towards the target - for example producing the effect of the anchor pointer piercing the target.
   */
  async animateProxyTo(targetElement, alignSpec = { align: "c-c" }) {
    const { context, draggedElements } = this, { element } = context, targetRect = targetElement.isRectangle ? targetElement : Rectangle.from(targetElement);
    draggedElements.forEach((el) => {
      el.classList.add("b-drag-final-transition");
      DomHelper.alignTo(el, targetRect, alignSpec);
    });
    await EventHelper.waitForTransitionEnd({
      element,
      property: "all",
      thisObj: this,
      once: true
    });
    draggedElements.forEach((el) => el.classList.remove("b-drag-final-transition"));
  }
  /**
   * Returns true if a drag operation is active
   * @property {Boolean}
   * @readonly
   */
  get isDragging() {
    var _a;
    return Boolean((_a = this.context) == null ? void 0 : _a.started);
  }
  //#region Salesforce hooks
  getMouseMoveEventTarget(event) {
    return !event.isScroll ? event.target : DomHelper.elementFromPoint(event.clientX, event.clientY);
  }
  //#endregion
};
DragHelper._$name = "DragHelper";

// ../Core/lib/Core/helper/ResizeHelper.js
var documentListeners = {
  down: "onMouseDown",
  move: "onMouseMove",
  up: "onMouseUp",
  docclick: "onDocumentClick",
  touchstart: {
    handler: "onTouchStart",
    // We preventDefault touchstart so as not to scroll. Must not be passive.
    // https://developers.google.com/web/updates/2017/01/scrolling-intervention
    passive: false
  },
  touchmove: "onTouchMove",
  touchend: "onTouchEnd",
  keydown: "onKeyDown"
};
var ResizeHelper = class extends Events_default(Base) {
  //region Config
  static get defaultConfig() {
    return {
      /**
       * CSS class added when resizing
       * @config {String}
       * @default
       */
      resizingCls: "b-resizing",
      /**
       * The amount of pixels to move mouse before it counts as a drag operation
       * @config {Number}
       * @default
       */
      dragThreshold: 5,
      /**
       * Resizing handle size
       * @config {Number}
       * @default
       */
      handleSize: 10,
      /**
       * Automatically shrink virtual handles when available space < handleSize. The virtual handles will
       * decrease towards width/height 1, reserving space between opposite handles to for example leave room for
       * dragging. To configure reserved space, see {@link #config-reservedSpace}.
       * @config {Boolean}
       * @default false
       */
      dynamicHandleSize: null,
      //
      /**
       * Room in px to leave unoccupied by handles when shrinking them dynamically (see
       * {@link #config-dynamicHandleSize}).
       * @config {Number}
       * @default
       */
      reservedSpace: 10,
      /**
       * Resizing handle size on touch devices
       * @config {Number}
       * @default
       */
      touchHandleSize: 30,
      /**
       * Minimum width when resizing
       * @config {Number}
       * @default
       */
      minWidth: 1,
      /**
       * Max width when resizing.
       * @config {Number}
       * @default
       */
      maxWidth: 0,
      /**
       * Minimum height when resizing
       * @config {Number}
       * @default
       */
      minHeight: 1,
      /**
       * Max height when resizing
       * @config {Number}
       * @default
       */
      maxHeight: 0,
      // outerElement, attach events to it and use as outer limit when looking for ancestors
      outerElement: document.body,
      /**
       * Optional scroller used to read scroll position. If unspecified, the outer element will be used.
       * @config {Core.helper.util.Scroller}
       */
      scroller: null,
      /**
       * Assign a function to determine if a hovered element can be resized or not.
       * Return `true` to allow resizing or `false` to prevent.
       * @config {Function}
       * @param {HTMLElement} element
       * @returns {Boolean}
       * @default
       */
      allowResize: null,
      /**
       * Outer element that limits where element can be dragged
       * @config {HTMLElement}
       * @default
       */
      dragWithin: null,
      /**
       * A function that determines if dragging an element is allowed. Gets called with the element as argument,
       * return `true` to allow dragging or `false` to prevent.
       * @config {Function}
       * @param {HTMLElement} element
       * @returns {Boolean}
       * @default
       */
      isElementResizable: null,
      /**
       * A CSS selector used to determine if resizing an element is allowed.
       * @config {String}
       * @default
       */
      targetSelector: null,
      /**
       * Use left handle when resizing. Only applies when `direction` is 'horizontal'
       * @config {Boolean}
       * @default
       */
      leftHandle: true,
      /**
       * Use right handle when resizing. Only applies when `direction` is 'horizontal'
       * @config {Boolean}
       * @default
       */
      rightHandle: true,
      /**
       * Use top handle when resizing. Only applies when `direction` is 'vertical'
       * @config {Boolean}
       * @default
       */
      topHandle: true,
      /**
       * Use bottom handle when resizing. Only applies when `direction` is 'vertical'
       * @config {Boolean}
       * @default
       */
      bottomHandle: true,
      /**
       * A CSS selector used to determine where handles should be "displayed" when resizing. Defaults to
       * targetSelector if unspecified
       * @config {String}
       */
      handleSelector: null,
      /**
       * A CSS selector used to determine which inner element contains handles.
       * @config {String}
       */
      handleContainerSelector: null,
      startEvent: null,
      /*
       * Optional config object, used by EventResize feature: it appends proxy and has to start resizing immediately
       * @config {Object}
       * @private
       */
      grab: null,
      /**
       * CSS class added when the resize state is invalid
       * @config {String}
       * @default
       */
      invalidCls: "b-resize-invalid",
      // A number that controls whether or not the element is wide enough for it to make sense to show resize handles
      // e.g. handle width is 10px, so doesn't make sense to show them unless handles on both sides fit
      handleVisibilityThreshold: null,
      // Private config that disables translation when resizing left edge. Useful for example in cases when element
      // being resized is part of a flex layout
      skipTranslate: false,
      /**
       * Direction to resize in, either 'horizontal' or 'vertical'
       * @config {'horizontal'|'vertical'}
       * @default
       */
      direction: "horizontal",
      clickSwallowDuration: 50,
      rtlSource: null
    };
  }
  //endregion
  //region Events
  /**
   * Fired while dragging
   * @event resizing
   * @param {Core.helper.ResizeHelper} source
   * @param {ResizeContext} context Resize context
   * @param {MouseEvent} event Browser event
   */
  /**
   * Fired when dragging starts.
   * @event resizeStart
   * @param {Core.helper.ResizeHelper} source
   * @param {ResizeContext} context Resize context
   * @param {MouseEvent|TouchEvent} event Browser event
   */
  /**
   * Fires after resize, and allows for asynchronous finalization by setting 'async' to `true` on the context object.
   * @event resize
   * @param {Core.helper.ResizeHelper} source
   * @param {ResizeContext} context Context about the resize operation. Set 'async' to `true` to indicate asynchronous
   * validation of the resize flow (for showing a confirmation dialog etc)
   */
  /**
   * Fires when a resize is canceled (width & height are reverted)
   * @event cancel
   * @param {Core.helper.ResizeHelper} source
   * @param {ResizeContext} context Resize context
   * @param {MouseEvent|TouchEvent} event Browser event
   */
  //endregion
  //region Init
  construct(config) {
    const me = this;
    super.construct(config);
    if (!me.handleSelector && !BrowserHelper.isHoverableDevice) {
      me.handleSize = me.touchHandleSize;
    }
    me.handleVisibilityThreshold = me.handleVisibilityThreshold || 2 * me.handleSize;
    me.initListeners();
    me.initResize();
  }
  doDestroy() {
    this.abort(true);
    super.doDestroy();
  }
  updateSkipUpdatingElement(skip) {
    if (skip) {
      this.skipTranslate = true;
    }
  }
  /**
   * Initializes resizing
   * @private
   */
  initResize() {
    const me = this;
    if (!me.isElementResizable && me.targetSelector) {
      me.isElementResizable = (element) => element.closest(me.targetSelector);
    }
    if (me.grab) {
      const { edge, element, event } = me.grab;
      me.startEvent = event;
      const cursorOffset = me.getCursorOffsetToElementEdge(event, element, edge);
      me.context = {
        element,
        edge,
        valid: true,
        async: false,
        elementStartX: DomHelper.getTranslateX(element) || element.offsetLeft,
        // extract x from translate
        elementStartY: DomHelper.getTranslateY(element) || element.offsetTop,
        // extract x from translate
        newX: DomHelper.getTranslateX(element) || element.offsetLeft,
        // No change yet on start, but info must be present
        newY: DomHelper.getTranslateY(element) || element.offsetTop,
        // No change yet on start, but info must be present
        elementWidth: element.offsetWidth,
        elementHeight: element.offsetHeight,
        cursorOffset,
        startX: event.clientX + cursorOffset.x + me.scrollLeft,
        startY: event.clientY + cursorOffset.y + me.scrollTop,
        finalize: () => {
          var _a;
          return (_a = me.reset) == null ? void 0 : _a.call(me);
        }
      };
      element.classList.add(me.resizingCls);
      me.internalStartResize(me.isTouch);
    }
  }
  /**
   * Initialize listeners
   * @private
   */
  initListeners() {
    const me = this, dragStartListeners = {
      element: me.outerElement,
      mousedown: documentListeners.down,
      touchstart: documentListeners.touchstart,
      thisObj: me
    };
    if (!me.handleSelector && BrowserHelper.isHoverableDevice) {
      dragStartListeners.mousemove = {
        handler: documentListeners.move,
        // Filter events for checkResizeHandles so we only get called if the mouse
        // is over one of our targets.
        delegate: me.targetSelector
      };
      dragStartListeners.mouseleave = {
        handler: "onMouseLeaveTarget",
        delegate: me.targetSelector,
        capture: true
      };
    }
    EventHelper.on(dragStartListeners);
  }
  get isRTL() {
    var _a;
    return Boolean((_a = this.rtlSource) == null ? void 0 : _a.rtl);
  }
  //endregion
  //region Scroll helpers
  get scrollLeft() {
    if (this.scroller) {
      return this.scroller.x;
    }
    return this.outerElement.scrollLeft;
  }
  get scrollTop() {
    if (this.scroller) {
      return this.scroller.y;
    }
    return this.outerElement.scrollTop;
  }
  //endregion
  //region Events
  internalStartResize(isTouch) {
    var _a;
    const dragListeners = {
      element: document,
      keydown: documentListeners.keydown,
      thisObj: this
    };
    if (isTouch) {
      dragListeners.touchmove = documentListeners.touchmove;
      dragListeners.touchend = dragListeners.pointerup = documentListeners.touchend;
    } else {
      dragListeners.mousemove = documentListeners.move;
      dragListeners.mouseup = documentListeners.up;
    }
    this.removeDragListeners = EventHelper.on(dragListeners);
    (_a = this.onResizeHandlePointerDown) == null ? void 0 : _a.call(this, this.startEvent);
  }
  // Empty class implementation. If listeners *are* added, the detacher is added
  // as an instance property. So this is always callable.
  removeDragListeners() {
  }
  reset() {
    var _a;
    (_a = this.removeDragListeners) == null ? void 0 : _a.call(this);
    this.context = null;
    this.trigger("reset");
  }
  canResize(element, event) {
    return !this.isElementResizable || this.isElementResizable(element, event);
  }
  onPointerDown(isTouch, event) {
    const me = this;
    me.startEvent = event;
    if (me.canResize(event.target, event) && me.grabResizeHandle(isTouch, event)) {
      event.stopImmediatePropagation();
      if (event.type === "touchstart") {
        event.preventDefault();
      }
      me.internalStartResize(isTouch);
    }
  }
  onTouchStart(event) {
    if (event.touches.length > 1) {
      return;
    }
    this.onPointerDown(true, event);
  }
  /**
   * Grab draggable element on mouse down.
   * @private
   * @param {MouseEvent|PointerEvent} event
   */
  onMouseDown(event) {
    if (event.button !== 0) {
      return;
    }
    this.onPointerDown(false, event);
  }
  internalMove(isTouch, event) {
    var _a;
    const me = this, { context, direction } = me;
    if ((context == null ? void 0 : context.element) && (context.started || EventHelper.getDistanceBetween(me.startEvent, event) >= me.dragThreshold)) {
      if (!context.started) {
        (_a = me.scrollManager) == null ? void 0 : _a.startMonitoring(ObjectHelper.merge({
          scrollables: [
            {
              element: me.dragWithin || me.outerElement,
              direction
            }
          ],
          callback: (config) => {
            var _a2;
            return ((_a2 = me.context) == null ? void 0 : _a2.element) && me.lastMouseMoveEvent && me.update(me.lastMouseMoveEvent, config);
          }
        }, me.monitoringConfig));
        me.trigger("resizeStart", { context, event });
        context.started = true;
      }
      me.update(event);
    } else if (!isTouch && !me.handleSelector) {
      me.checkResizeHandles(event);
    }
  }
  onTouchMove(event) {
    this.internalMove(true, event);
  }
  /**
   * Move grabbed element with mouse.
   * @param {MouseEvent|PointerEvent} event
   * @fires resizestart
   * @private
   */
  onMouseMove(event) {
    this.internalMove(false, event);
  }
  onPointerUp(isTouch, event) {
    var _a, _b, _c;
    const me = this, context = me.context;
    (_a = me.removeDragListeners) == null ? void 0 : _a.call(me);
    if (context) {
      (_b = me.scrollManager) == null ? void 0 : _b.stopMonitoring();
      if (context.started) {
        EventHelper.on({
          element: document,
          thisObj: me,
          click: documentListeners.docclick,
          expires: me.clickSwallowDuration,
          // In case a click did not ensue, remove the listener
          capture: true,
          once: true
        });
      }
      me.finishResize(event);
    } else {
      (_c = me.reset) == null ? void 0 : _c.call(me);
    }
  }
  onTouchEnd(event) {
    this.onPointerUp(true, event);
  }
  /**
   * Drop on mouse up (if dropped on valid target).
   * @param {MouseEvent|PointerEvent} event
   * @private
   */
  onMouseUp(event) {
    this.onPointerUp(false, event);
  }
  /**
   * This is a capture listener, only added during drag, which prevents a click gesture
   * propagating from the terminating mouseup gesture
   * @param {MouseEvent} event
   * @private
   */
  onDocumentClick(event) {
    event.stopPropagation();
  }
  /**
   * Cancel on ESC key
   * @param {KeyboardEvent} event
   * @private
   */
  onKeyDown(event) {
    if (event.key === "Escape") {
      this.abort();
    }
  }
  //endregion
  //region Grab, update, finish
  /**
   * Updates resize, called when an element is grabbed and mouse moves
   * @private
   * @fires resizing
   */
  update(event) {
    const me = this, context = me.context, { element } = context, parentRectangle = Rectangle.from(me.outerElement);
    context.currentX = Math.max(Math.min(event.clientX + context.cursorOffset.x, parentRectangle.right), parentRectangle.x) + me.scrollLeft;
    context.currentY = Math.max(Math.min(event.clientY + context.cursorOffset.y, parentRectangle.bottom), parentRectangle.y) + me.scrollTop;
    element.classList.add(me.resizingCls);
    if (event) {
      if (me.updateResize(event)) {
        me.trigger("resizing", { context, event });
        element.classList.toggle(me.invalidCls, context.valid === false);
      }
      me.lastMouseMoveEvent = event;
    }
  }
  /**
   * Abort dragging
   */
  abort(silent = false) {
    var _a, _b;
    const me = this;
    (_b = (_a = me.scrollManager) == null ? void 0 : _a.stopMonitoring) == null ? void 0 : _b.call(_a);
    if (me.context) {
      me.abortResize(null, silent);
    } else if (!me.isDestroyed) {
      me.reset();
    }
  }
  /**
   * Starts resizing, updates ResizeHelper#context with relevant info.
   * @private
   * @param {Boolean} isTouch
   * @param {MouseEvent} event
   * @returns {Boolean} True if handled, false if not
   */
  grabResizeHandle(isTouch, event) {
    var _a;
    const me = this;
    if (me.allowResize && !me.allowResize(event.target, event)) {
      return false;
    }
    const handleSelector = me.handleSelector, coordsFrom = event.type === "touchstart" ? event.changedTouches[0] : event, clientX = coordsFrom.clientX, clientY = coordsFrom.clientY;
    let element = me.targetSelector ? event.target.closest(me.targetSelector) : event.target;
    if (element) {
      let edge;
      if (handleSelector) {
        if (event.target.matches(handleSelector)) {
          if (me.direction === "horizontal") {
            if (event.pageX < DomHelper.getPageX(element) + element.offsetWidth / 2) {
              edge = me.isRTL ? "right" : "left";
            } else {
              edge = me.isRTL ? "left" : "right";
            }
          } else {
            if (event.pageY < DomHelper.getPageY(element) + element.offsetHeight / 2) {
              edge = "top";
            } else {
              edge = "bottom";
            }
          }
        } else {
          return false;
        }
      } else {
        if (me.direction === "horizontal") {
          if (me.overLeftHandle(event, element)) {
            edge = me.isRTL ? "right" : "left";
          } else if (me.overRightHandle(event, element)) {
            edge = me.isRTL ? "left" : "right";
          }
        } else {
          if (me.overTopHandle(event, element)) {
            edge = "top";
          } else if (me.overBottomHandle(event, element)) {
            edge = "bottom";
          }
        }
        if (!edge) {
          me.context = null;
          return false;
        }
      }
      if (event.type === "touchstart") {
        event.preventDefault();
      }
      const cursorOffset = me.getCursorOffsetToElementEdge(coordsFrom, element, edge), mutatedContext = (_a = me.internalBeforeStart) == null ? void 0 : _a.call(me, { element, edge });
      if (mutatedContext) {
        element = mutatedContext.element;
        edge = mutatedContext.edge;
      }
      if (me.trigger("beforeResizeStart", { element, event }) !== false) {
        me.context = {
          element,
          edge,
          isTouch,
          valid: true,
          async: false,
          direction: me.direction,
          elementStartX: DomHelper.getTranslateX(element) || element.offsetLeft,
          // extract x from translate
          elementStartY: DomHelper.getTranslateY(element) || element.offsetTop,
          // extract y from translate
          newX: DomHelper.getTranslateX(element) || element.offsetLeft,
          // No change yet on start, but info must be present
          newY: DomHelper.getTranslateY(element) || element.offsetTop,
          // No change yet on start, but info must be present
          elementWidth: element.offsetWidth,
          elementHeight: element.offsetHeight,
          cursorOffset,
          startX: clientX + cursorOffset.x + me.scrollLeft,
          startY: clientY + cursorOffset.y + me.scrollTop,
          finalize: () => {
            var _a2;
            return (_a2 = me.reset) == null ? void 0 : _a2.call(me);
          }
        };
        element.classList.add(me.resizingCls);
        return true;
      }
    }
    return false;
  }
  getCursorOffsetToElementEdge(event, element, edge) {
    const rectEl = Rectangle.from(element);
    let x = 0, y = 0;
    switch (edge) {
      case "left":
        x = rectEl.x - (this.isRTL ? rectEl.width : 0) - event.clientX;
        break;
      case "right":
        x = rectEl.x + (this.isRTL ? 0 : rectEl.width) - event.clientX;
        break;
      case "top":
        y = rectEl.y - event.clientY;
        break;
      case "bottom":
        y = rectEl.y + rectEl.height - event.clientY;
        break;
    }
    return { x, y };
  }
  /**
   * Check if mouse is over a resize handle (virtual). If so, highlight.
   * @private
   * @param {MouseEvent} event
   */
  checkResizeHandles(event) {
    const me = this, target = me.targetSelector ? event.target.closest(me.targetSelector) : event.target;
    if (target && (!me.allowResize || me.allowResize(event.target, event))) {
      me.currentElement = me.handleContainerSelector ? event.target.closest(me.handleContainerSelector) : event.target;
      if (me.currentElement) {
        let over;
        if (me.direction === "horizontal") {
          over = me.overLeftHandle(event, target) || me.overRightHandle(event, target);
        } else {
          over = me.overTopHandle(event, target) || me.overBottomHandle(event, target);
        }
        if (over) {
          me.highlightHandle();
        } else {
          me.unHighlightHandle();
        }
      }
    } else if (me.currentElement) {
      me.unHighlightHandle();
    }
  }
  onMouseLeaveTarget(event) {
    const me = this;
    me.currentElement = me.handleContainerSelector ? event.target.closest(me.handleContainerSelector) : event.target;
    if (me.currentElement) {
      me.unHighlightHandle();
    }
  }
  /**
   * Updates size of target (on mouse move).
   * @private
   * @param {MouseEvent|PointerEvent} event
   */
  updateResize(event) {
    const me = this, {
      context,
      allowEdgeSwitch,
      skipTranslate,
      skipUpdatingElement
    } = me;
    let updated;
    if (allowEdgeSwitch) {
      if (me.direction === "horizontal") {
        context.edge = context.currentX > context.startX ? "right" : "left";
      } else {
        context.edge = context.currentY > context.startY ? "bottom" : "top";
      }
    }
    const {
      element,
      elementStartX,
      elementStartY,
      elementWidth,
      elementHeight,
      edge
    } = context, { style } = element, deltaX = context.currentX - context.startX, deltaY = context.currentY - context.startY, minWidth = DomHelper.getExtremalSizePX(element, "minWidth") || me.minWidth, maxWidth = DomHelper.getExtremalSizePX(element, "maxWidth") || me.maxWidth, minHeight = DomHelper.getExtremalSizePX(element, "minHeight") || me.minHeight, maxHeight = DomHelper.getExtremalSizePX(element, "maxHeight") || me.maxHeight, sign = edge === "right" && !me.isRTL || edge === "bottom" ? 1 : -1, newWidth = elementWidth + deltaX * sign, newHeight = elementHeight + deltaY * sign;
    let width = Math.max(minWidth, newWidth), height = Math.max(minHeight, newHeight);
    if (maxWidth > 0) {
      width = Math.min(width, maxWidth);
    }
    if (maxHeight > 0) {
      height = Math.min(height, maxHeight);
    }
    if (style.flex) {
      style.flex = "";
    }
    if (me.direction === "horizontal" && elementWidth !== width) {
      if (!skipUpdatingElement) {
        style.width = Math.abs(width) + "px";
      }
      context.newWidth = width;
      if (edge === "left" || width < 0) {
        const newX = Math.max(Math.min(elementStartX + elementWidth - me.minWidth, elementStartX + deltaX), 0);
        if (!skipTranslate) {
          DomHelper.setTranslateX(element, Math.round(newX));
        }
        context.newX = newX;
      } else if (edge === "right" && allowEdgeSwitch && !skipTranslate) {
        DomHelper.setTranslateX(element, elementStartX);
      }
      updated = true;
    } else if (me.direction === "vertical" && elementHeight !== newHeight) {
      if (!skipUpdatingElement) {
        style.height = Math.abs(height) + "px";
      }
      context.newHeight = height;
      if (edge === "top" || height < 0) {
        context.newY = Math.max(Math.min(elementStartY + elementHeight - me.minHeight, elementStartY + deltaY), 0);
        if (!skipTranslate) {
          DomHelper.setTranslateY(element, context.newY);
        }
      } else if (edge === "bottom" && allowEdgeSwitch && !skipTranslate) {
        DomHelper.setTranslateY(element, elementStartY);
      }
      updated = true;
    }
    return updated;
  }
  /**
   * Finalizes resize, fires drop.
   * @private
   * @param {MouseEvent|PointerEvent} event
   * @fires resize
   * @fires cancel
   */
  finishResize(event) {
    var _a;
    const me = this, context = me.context, eventObject = { context, event };
    context.element.classList.remove(me.resizingCls);
    if (context.started) {
      let changed = false;
      if (me.direction === "horizontal") {
        changed = context.newWidth && context.newWidth !== context.elementWidth;
      } else {
        changed = context.newHeight && context.newHeight !== context.elementHeight;
      }
      me.trigger(changed ? "resize" : "cancel", eventObject);
      if (!context.async) {
        context.finalize();
      }
    } else {
      (_a = me.reset) == null ? void 0 : _a.call(me);
    }
  }
  /**
   * Abort resizing
   * @private
   * @fires cancel
   */
  abortResize(event = null, silent = false) {
    const me = this, context = me.context;
    context.element.classList.remove(me.resizingCls);
    if (me.direction === "horizontal") {
      if (context.edge === "left" || context.allowEdgeSwitch && !context.skipTranslate) {
        DomHelper.setTranslateX(context.element, context.elementStartX);
      }
      context.element.style.width = context.elementWidth + "px";
    } else {
      DomHelper.setTranslateY(context.element, context.elementStartY);
      context.element.style.height = context.elementHeight + "px";
    }
    !silent && me.trigger("cancel", { context, event });
    if (!me.isDestroyed) {
      me.reset();
    }
  }
  //endregion
  //region Handles
  // /**
  //  * Constrain resize to outerElements bounds
  //  * @private
  //  * @param x
  //  * @returns {*}
  //  */
  // constrainResize(x) {
  //     const me = this;
  //
  //     if (me.outerElement) {
  //         const box = me.outerElement.getBoundingClientRect();
  //         if (x < box.left) x = box.left;
  //         if (x > box.right) x = box.right;
  //     }
  //
  //     return x;
  // }
  /**
   * Highlights handles (applies css that changes cursor).
   * @private
   */
  highlightHandle() {
    const me = this, target = me.targetSelector ? me.currentElement.closest(me.targetSelector) : me.currentElement;
    me.currentElement.classList.add("b-resize-handle");
    target.classList.add("b-over-resize-handle");
  }
  /**
   * Unhighlight handles (removes css).
   * @private
   */
  unHighlightHandle() {
    const me = this, target = me.targetSelector ? me.currentElement.closest(me.targetSelector) : me.currentElement;
    target && target.classList.remove("b-over-resize-handle");
    me.currentElement.classList.remove("b-resize-handle");
    me.currentElement = null;
  }
  overAnyHandle(event, target) {
    return this.overStartHandle(event, target) || this.overEndHandle(event, target);
  }
  overStartHandle(event, target) {
    return this.direction === "horizontal" ? this.overLeftHandle(event, target) : this.overTopHandle(event, target);
  }
  overEndHandle(event, target) {
    return this.direction === "horizontal" ? this.overRightHandle(event, target) : this.overBottomHandle(event, target);
  }
  getDynamicHandleSize(opposite, offsetWidth) {
    const handleCount = opposite ? 2 : 1, { handleSize } = this;
    if (this.dynamicHandleSize && handleSize * handleCount > offsetWidth - this.reservedSpace) {
      return Math.max(Math.floor((offsetWidth - this.reservedSpace) / handleCount), 0);
    }
    return handleSize;
  }
  /**
   * Check if over left handle (virtual).
   * @private
   * @param {MouseEvent} event MouseEvent
   * @param {HTMLElement} target The current target element
   * @returns {Boolean} Returns true if mouse is over left handle, otherwise false
   */
  overLeftHandle(event, target) {
    const me = this, { offsetWidth } = target;
    if (me.leftHandle && me.canResize(target, event) && (offsetWidth >= me.handleVisibilityThreshold || me.dynamicHandleSize)) {
      const leftHandle = Rectangle.from(target);
      leftHandle.width = me.getDynamicHandleSize(me.rightHandle, offsetWidth);
      return leftHandle.width > 0 && leftHandle.contains(EventHelper.getPagePoint(event));
    }
    return false;
  }
  /**
   * Check if over right handle (virtual).
   * @private
   * @param {MouseEvent} event MouseEvent
   * @param {HTMLElement} target The current target element
   * @returns {Boolean} Returns true if mouse is over left handle, otherwise false
   */
  overRightHandle(event, target) {
    const me = this, { offsetWidth } = target;
    if (me.rightHandle && me.canResize(target, event) && (offsetWidth >= me.handleVisibilityThreshold || me.dynamicHandleSize)) {
      const rightHandle = Rectangle.from(target);
      rightHandle.x = rightHandle.right - me.getDynamicHandleSize(me.leftHandle, offsetWidth);
      return rightHandle.width > 0 && rightHandle.contains(EventHelper.getPagePoint(event));
    }
    return false;
  }
  /**
   * Check if over top handle (virtual).
   * @private
   * @param {MouseEvent} event MouseEvent
   * @param {HTMLElement} target The current target element
   * @returns {Boolean} Returns true if mouse is over top handle, otherwise false
   */
  overTopHandle(event, target) {
    const me = this, { offsetHeight } = target;
    if (me.topHandle && me.canResize(target, event) && (offsetHeight >= me.handleVisibilityThreshold || me.dynamicHandleSize)) {
      const topHandle = Rectangle.from(target);
      topHandle.height = me.getDynamicHandleSize(me.bottomHandle, offsetHeight);
      return topHandle.height > 0 && topHandle.contains(EventHelper.getPagePoint(event));
    }
    return false;
  }
  /**
   * Check if over bottom handle (virtual).
   * @private
   * @param {MouseEvent} event MouseEvent
   * @param {HTMLElement} target The current target element
   * @returns {Boolean} Returns true if mouse is over bottom handle, otherwise false
   */
  overBottomHandle(event, target) {
    const me = this, { offsetHeight } = target;
    if (me.bottomHandle && me.canResize(target, event) && (offsetHeight >= me.handleVisibilityThreshold || me.dynamicHandleSize)) {
      const bottomHandle = Rectangle.from(target);
      bottomHandle.y = bottomHandle.bottom - me.getDynamicHandleSize(me.bottomHandle, offsetHeight);
      return bottomHandle.height > 0 && bottomHandle.contains(EventHelper.getPagePoint(event));
    }
    return false;
  }
  //endregion
};
__publicField(ResizeHelper, "configurable", {
  // Private config that disables updating elements width and position, for when data is live updated during
  // resize, leading to element being redrawn
  skipUpdatingElement: null
});
ResizeHelper._$name = "ResizeHelper";

// ../Core/lib/Core/widget/Toast.js
var _Toast = class _Toast extends Widget {
  static get configurable() {
    return {
      testConfig: {
        destroyTimeout: 1,
        timeout: 1e3
      },
      floating: true,
      /**
       * Timeout (in ms) until the toast is automatically dismissed. Set to 0 to never hide.
       * @config {Number}
       * @default
       */
      timeout: 2500,
      autoDestroy: null,
      // How long to wait after hide before destruction
      destroyTimeout: 200,
      /**
       * Show a progress bar indicating the time remaining until the toast is dismissed.
       * @config {Boolean}
       * @default
       */
      showProgress: true,
      /**
       * Toast color (should have match in toast.scss or your custom styling).
       * Valid values in Bryntum themes are:
       * * b-amber
       * * b-blue
       * * b-dark-gray
       * * b-deep-orange
       * * b-gray
       * * b-green
       * * b-indigo
       * * b-lime
       * * b-light-gray
       * * b-light-green
       * * b-orange
       * * b-purple
       * * b-red
       * * b-teal
       * * b-white
       * * b-yellow
       *
       * ```
       * new Toast({
       *    color : 'b-blue'
       * });
       * ```
       *
       * @config {String}
       */
      color: null,
      bottomMargin: 20
    };
  }
  compose() {
    const { appendTo, color, html, showProgress, style, timeout } = this;
    return {
      parent: appendTo || this.floatRoot,
      class: {
        ...DomClassList.normalize(color, "object"),
        "b-toast-hide": 1
        // toasts start hidden so we can animate them into view
      },
      html,
      style,
      children: {
        progressElement: showProgress && {
          style: `animation-duration:${timeout / 1e3}s;`,
          class: {
            "b-toast-progress": 1
          }
        }
      },
      // eslint-disable-next-line bryntum/no-listeners-in-lib
      listeners: {
        click: "hide"
      }
    };
  }
  doDestroy() {
    this.untoast();
    super.doDestroy();
  }
  get nextBottom() {
    const { bottomMargin, element } = this;
    return parseInt(element.style.bottom, 10) + element.offsetHeight + bottomMargin;
  }
  /**
   * Show the toast
   */
  async show() {
    var _a, _b;
    await super.show(...arguments);
    const me = this, { element } = me, { toasts } = _Toast;
    if (!toasts.includes(me)) {
      element.style.bottom = ((_b = (_a = toasts[0]) == null ? void 0 : _a.nextBottom) != null ? _b : me.bottomMargin) + "px";
      toasts.unshift(me);
      element.getBoundingClientRect();
      element.classList.remove("b-toast-hide");
      if (me.timeout > 0) {
        me.hideTimeout = me.setTimeout("hide", me.timeout);
      }
    }
  }
  /**
   * Hide the toast
   */
  async hide() {
    const me = this;
    me.untoast();
    me.element.classList.add("b-toast-hide");
    if (me.autoDestroy && !me.destroyTimer) {
      me.destroyTimer = me.setTimeout("destroy", me.destroyTimeout);
    }
  }
  untoast() {
    const { toasts } = _Toast;
    if (toasts.includes(this)) {
      toasts.splice(toasts.indexOf(this), 1);
    }
  }
  /**
   * Hide all visible toasts
   */
  static hideAll() {
    _Toast.toasts.slice().reverse().forEach((toast) => toast.hide());
  }
  /**
   * Easiest way to show a toast
   *
   * ```javascript
   * Toast.show('Hi');
   *
   * Toast.show({
   *   html   : 'Read quickly, please',
   *   timeout: 1000
   * });
   * ```
   *
   * @param {String|ToastConfig} config Message or toast config object
   * @returns {Core.widget.Toast}
   */
  static show(config) {
    const toast = _Toast.new({
      autoDestroy: true,
      rootElement: document.body
    }, typeof config === "string" ? { html: config } : config);
    toast.show();
    return toast;
  }
};
__publicField(_Toast, "$name", "Toast");
__publicField(_Toast, "type", "toast");
var Toast = _Toast;
Toast.toasts = [];
Toast.initClass();
Toast._$name = "Toast";

// ../Core/lib/Core/helper/WidgetHelper.js
var WidgetHelper = class {
  //region Querying
  /**
   * Returns the widget with the specified id.
   * @param {String} id Id of widget to find
   * @returns {Core.widget.Widget} The widget if any
   * @category Querying
   */
  static getById(id) {
    return Widget.getById(id);
  }
  /**
   * Returns the Widget which owns the passed element (or event).
   * @param {HTMLElement|Event} element The element or event to start from
   * @param {String|Function} [type] The type of Widget to scan upwards for. The lowercase
   * class name. Or a filter function which returns `true` for the required Widget.
   * @param {HTMLElement|Number} [limit] The number of components to traverse upwards to find a
   * match of the type parameter, or the element to stop at.
   * @returns {Core.widget.Widget} The found Widget or null.
   * @category Querying
   */
  static fromElement(element, type, limit) {
    return Widget.fromElement(element, type, limit);
  }
  //endregion
  //region Widgets
  /**
   * Create a widget.
   *
   * ```javascript
   * WidgetHelper.createWidget({
   *   type: 'button',
   *   icon: 'user',
   *   text: 'Edit user'
   * });
   * ```
   *
   * @param {ContainerItemConfig} config Widget config
   * @returns {Core.widget.Widget} The widget
   * @category Widgets
   */
  static createWidget(config = {}) {
    return config.isWidget ? config : Widget.create(config);
  }
  /**
   * Appends a widget (array of widgets) to the DOM tree. If config is empty, widgets are appended to the DOM. To
   * append widget to certain position you can pass HTMLElement or its id as config, or as a config, that will be
   * applied to all passed widgets.
   *
   * Usage:
   *
   * ```javascript
   * // Will append button as last item to element with id 'container'
   * let [button] = WidgetHelper.append({ type : 'button' }, 'container');
   *
   * // Same as above, but will add two buttons
   * let [button1, button2] = WidgetHelper.append([
   *     { type : 'button' },
   *     { type : 'button' }
   *     ], { appendTo : 'container' });
   *
   * // Will append two buttons before element with id 'someElement'. Order will be preserved and all widgets will have
   * // additional class 'my-cls'
   * let [button1, button2] = WidgetHelper.append([
   *     { type : 'button' },
   *     { type : 'button' }
   *     ], {
   *         insertBefore : 'someElement',
   *         cls          : 'my-cls'
   *     });
   * ```
   *
   * @param {ContainerItemConfig|ContainerItemConfig[]} widget Widget config or array of such configs
   * @param {HTMLElement|String|Object} [config] Element (or element id) to which to append the widget or config to
   * apply to all passed widgets
   * @returns {Core.widget.Widget[]} Array or widgets
   * @category Widgets
   */
  static append(widget, config) {
    widget = Array.isArray(widget) && widget || [widget];
    if (config instanceof HTMLElement || typeof config === "string") {
      config = {
        appendTo: config
      };
    }
    if (config.insertFirst) {
      const target = typeof config.insertFirst === "string" ? document.getElementById(config.insertFirst) : config.insertFirst;
      if (target.firstChild) {
        config.insertBefore = target.firstChild;
      } else {
        config.appendTo = target;
      }
    }
    return widget.map((item) => Widget.create(ObjectHelper.assign({}, config || {}, item)));
  }
  //endregion
  //region Popups
  /**
   * Shows a popup (~tooltip) containing widgets connected to specified element.
   *
   * ```javascript
   * WidgetHelper.openPopup(element, {
   *   position: 'bottom center',
   *   items: [
   *      { widgetConfig }
   *   ]
   * });
   * ```
   *
   * @param {HTMLElement} element Element to connect popup to
   * @param {PopupConfig} config Config object, or string to use as html in popup
   * @returns {*|{close, widgets}}
   * @category Popups
   */
  static openPopup(element, config) {
    return Widget.create(ObjectHelper.assign({
      forElement: element
    }, typeof config === "string" ? {
      html: config
    } : config), "popup");
  }
  /**
   * Shows a context menu connected to the specified element.
   *
   * ```javascript
   * WidgetHelper.showContextMenu(element, {
   *   items: [
   *      { id: 'addItem', icon: 'add', text: 'Add' },
   *      ...
   *   ],
   *   onItem: item => alert('Clicked ' + item.text)
   * });
   * ```
   *
   * @param {HTMLElement|Number[]} element Element (or a coordinate) to show the context menu for
   * @param {MenuItemConfig} config Context menu config, see example
   * @returns {Core.widget.Menu}
   * @category Popups
   */
  static showContextMenu(element, config) {
    const me = this;
    if (me.currentContextMenu) {
      me.currentContextMenu.destroy();
    }
    if (element instanceof HTMLElement) {
      config.forElement = element;
    } else {
      config.forElement = document.body;
      if (Array.isArray(element)) {
        element = new Point(...element);
      }
      if (element instanceof Point) {
        config.align = {
          position: element
        };
      }
    }
    config.internalListeners = { destroy: me.currentContextMenu = null };
    return me.currentContextMenu = Widget.create(config, "menu");
  }
  /**
   * Attached a tooltip to the specified element.
   *
   * ```javascript
   * WidgetHelper.attachTooltip(element, {
   *   text: 'Useful information goes here'
   * });
   * ```
   *
   * @param {HTMLElement} element Element to attach tooltip for
   * @param {String|TooltipConfig} configOrText Tooltip config or tooltip string, see example and source
   * @returns {HTMLElement} The passed element
   * @category Popups
   */
  static attachTooltip(element, configOrText) {
    return Widget.attachTooltip(element, configOrText);
  }
  /**
   * Checks if element has tooltip attached
   *
   * @param {HTMLElement} element Element to check
   * @returns {Boolean}
   * @category Popups
   */
  static hasTooltipAttached(element) {
    return Widget.resolveType("tooltip").hasTooltipAttached(element);
  }
  /**
   * Destroys any tooltip attached to an element, removes it from the DOM and unregisters any tip related listeners
   * on the element.
   *
   * @param {HTMLElement} element Element to remove tooltip from
   * @category Popups
   */
  static destroyTooltipAttached(element) {
    return Widget.resolveType("tooltip").destroyTooltipAttached(element);
  }
  //endregion
  //region Mask
  /**
   * Masks the specified element, showing a message in the mask.
   * @param {HTMLElement} element Element to mask
   * @param {String} msg Message to show in the mask
   * @returns {Core.widget.Mask}
   * @category Mask
   */
  static mask(element, msg = "Loading") {
    if (element) {
      if (element instanceof HTMLElement) {
        element = {
          target: element,
          text: msg
        };
      }
      return Mask.mask(element, element.target);
    }
  }
  /**
   * Unmask the specified element.
   * @param {HTMLElement} element
   * @category Mask
   */
  static unmask(element, close = true) {
    if (element.mask) {
      if (close) {
        element.mask.close();
      } else {
        element.mask.hide();
      }
    }
  }
  //endregion
  //region Toast
  /**
   * Show a toast
   * @param {String} msg message to show in the toast
   * @category Mask
   */
  static toast(msg) {
    return Toast.show(msg);
  }
  //endregion
};
WidgetHelper._$name = "WidgetHelper";

// ../Core/lib/Core/helper/util/Formatter.js
var hasOwn = Object.hasOwn || ((obj, key) => Object.prototype.hasOwnProperty.call(obj, key));
var cacheKey = null;
function setParser(me, parser) {
  Object.defineProperty(me, "parser", {
    value: parser
  });
  return parser;
}
var Default = class {
  constructor(formatter) {
    this.formatter = formatter;
  }
  format(value) {
    return this.formatter.defaultFormat(value);
  }
  parse(value, strict) {
    return this.formatter.defaultParse(value, strict);
  }
  resolvedOptions() {
    return null;
  }
};
var Formatter = class {
  static get(format) {
    if (format == null) {
      return this.NULL;
    }
    if (format instanceof this) {
      return format;
    }
    const key = typeof format === "string" ? format : JSON.stringify(format), cache = this.cache;
    let fmt = cache.get(key);
    if (!fmt) {
      cacheKey = key;
      fmt = new this(format);
      cache.set(key, fmt);
    }
    return fmt;
  }
  static get cache() {
    return hasOwn(this, "_cache") && this._cache || (this._cache = /* @__PURE__ */ new Map());
  }
  static get NULL() {
    return hasOwn(this, "_null") ? this._null : this._null = new this(null);
  }
  constructor(config) {
    const me = this, { standardOptions } = me.constructor;
    me.cacheKey = cacheKey;
    cacheKey = null;
    me.initialize();
    if (config === null) {
      me.formatter = new Default(me);
    } else {
      me.configure(config);
      for (const [key, value] of Object.entries(me.resolvedOptions())) {
        if (value != null && standardOptions.includes(key)) {
          me[key] = value;
        }
      }
    }
  }
  get parser() {
    return setParser(this, new this.constructor.Parser(this));
  }
  defaultFormat(value) {
    return value == null ? value : String(value);
  }
  defaultParse(value) {
    return value;
  }
  format(value) {
    return value == null ? value : this.formatter.format(value);
  }
  parse(value, strict) {
    return value == null ? value : this.parser.parse(value, strict);
  }
  parseStrict(value) {
    return this.parse(value, true);
  }
  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }
};
__publicField(Formatter, "standardOptions", Object.freeze([]));
Formatter._$name = "Formatter";

// ../Core/lib/Core/helper/util/NumberFormat.js
var escapeRegExp = StringHelper.escapeRegExp;
var digitsRe = /[\d+-]/g;
var newFormatter = (locale, config) => new Intl.NumberFormat(locale || void 0, config);
var numFormatRe = /^(?:([$])\s*)?(?:(\d+)>)?\d+(,\d+)?(?:\.((\d*)(?:#*)|[*]))?(?:\s*([%])?)?$/;
var unicodeMinus = "\u2212";
var NumberParser = class {
  constructor(formatter) {
    const me = this, locale = formatter.locale, numFmt = newFormatter(locale, {
      maximumFractionDigits: 3
    }), currency = formatter.is.currency ? me._decodeStyle(locale, {
      style: "currency",
      currency: formatter.currency,
      currencyDisplay: formatter.currencyDisplay
    }) : null, percent = formatter.is.percent ? me._decodeStyle(locale, {
      style: "percent"
    }) : null, decimal = numFmt.format(1.2).replace(digitsRe, "")[0], grouper = numFmt.format(1e9).replace(digitsRe, "")[0] || "";
    Object.assign(me, { currency, decimal, formatter, grouper, percent });
    me.decimal = decimal;
    me.decimalRe = escapeRegExp(decimal, "g");
    me.grouper = grouper;
    me.stripRe = new RegExp(
      `(?:\\s+|${escapeRegExp(grouper)})` + (currency ? `|(?:${escapeRegExp(currency.text)})` : "") + (percent ? `|(?:${escapeRegExp(percent.text)})` : ""),
      "g"
    );
  }
  decimalPlaces(value) {
    value = value.replace(this.stripRe, "");
    const dot = value.indexOf(this.decimal) + 1;
    return dot && value.length - dot;
  }
  parse(value, strict) {
    if (typeof value === "string") {
      value = value.replace(this.stripRe, "").replace(this.decimalRe, ".").replace(unicodeMinus, "-");
      value = strict ? Number(value) : parseFloat(value);
      if (this.formatter.is.percent) {
        value /= 100;
      }
    }
    return value;
  }
  _decodeStyle(locale, fmtDef) {
    const fmt = newFormatter(locale, fmtDef), decFmt = newFormatter(locale, Object.assign(
      fmt.resolvedOptions(),
      { style: "decimal" }
    )), zero = fmt.format(0), zeroDec = decFmt.format(0);
    return {
      suffix: zero.startsWith(zeroDec),
      text: zero.replace(zeroDec, "").trim()
    };
  }
};
var _NumberFormat = class _NumberFormat extends Formatter {
  static get $name() {
    return "NumberFormat";
  }
  initialize() {
    this._as = {
      // cacheKey : cachedInstance
    };
    this.is = {
      decimal: false,
      currency: false,
      percent: false,
      null: true,
      from: null
    };
  }
  get truncator() {
    const scale = this.maximumFractionDigits, digits = Math.min(20, scale + 1);
    return scale == null ? null : this.as({ style: "decimal", maximumFractionDigits: digits, minimumFractionDigits: digits }, "truncator");
  }
  configure(options) {
    if (typeof options !== "string") {
      Object.assign(this, options);
    } else {
      this.template = options;
    }
    const me = this, config = {}, loc = me.locale ? LocaleManager_default.locales[me.locale] : LocaleManager_default.locale, localeDefaults = loc == null ? void 0 : loc.NumberFormat, { template } = me, { standardOptions } = me.constructor;
    if (localeDefaults) {
      for (const key in localeDefaults) {
        if (me[key] == null && typeof localeDefaults[key] !== "function") {
          me[key] = localeDefaults[key];
        }
      }
    }
    if (template) {
      const match = numFormatRe.exec(template), m2 = match[2], m4 = match[4];
      me.useGrouping = !!match[3];
      me.style = match[1] ? "currency" : match[6] ? "percent" : "decimal";
      if (m2) {
        me.integer = +m2;
      }
      if (m4 === "*") {
        me.fraction = [0, 20];
      } else if (m4 != null) {
        me.fraction = [match[5].length, m4.length];
      }
    }
    me._minMax("fraction", true, true);
    me._minMax("integer", true, false);
    me._minMax("significant", false, true);
    for (const key of standardOptions) {
      if (me[key] != null) {
        config[key] = me[key];
      }
    }
    me.is.from = me.from && me.from.is;
    me.is[me.style] = !(me.is.null = false);
    me.formatter = newFormatter(me.locale, config);
  }
  /**
   * Creates a derived `NumberFormat` from this instance, with a different `style`. This is useful for processing
   * currency and percentage styles without the symbols being injected in the formatting.
   *
   * @param {String|Object} change The new style (if a string) or a set of properties to update.
   * @param {String} [cacheAs] A key by which to cache this derived formatter.
   * @returns {Core.helper.util.NumberFormat}
   */
  as(change, cacheAs = null) {
    const config = this.resolvedOptions() || { template: "9.*" }, cache = this._as;
    let ret = cacheAs && cache[cacheAs];
    if (!ret) {
      if (typeof change === "string") {
        config.style = change;
      } else {
        Object.assign(config, change);
      }
      config.from = this;
      ret = new _NumberFormat(config);
    }
    if (cacheAs) {
      cache[cacheAs] = ret;
    }
    return ret;
  }
  defaultParse(value, strict) {
    return value == null ? value : strict ? Number(value) : parseFloat(value);
  }
  /**
   * Returns the given `value` formatted in accordance with the specified locale and
   * formatting options.
   *
   * @param {Number} value
   * @returns {String}
   */
  format(value) {
    if (typeof value === "string") {
      const v = Number(value);
      value = isNaN(v) ? this.parse(value) : v;
    }
    return super.format(value);
  }
  // The parse() method is inherited but the base class implementation
  // cannot properly document the parameter and return types:
  /**
   * Returns a `Number` parsed from the given, formatted `value`, in accordance with the
   * specified locale and formatting options.
   *
   * If the `value` cannot be parsed, `NaN` is returned.
   *
   * Pass `strict` as `true` to require all text to convert. In essence, the default is
   * in line with JavaScript's `parseFloat` while `strict=true` behaves like the `Number`
   * constructor:
   *```
   *  parseFloat('1.2xx');  // = 1.2
   *  Number('1.2xx')       // = NaN
   *```
   * @method parse
   * @param {String} value
   * @param {Boolean} [strict=false]
   * @returns {Number}
   */
  /**
   * Returns a `Number` parsed from the given, formatted `value`, in accordance with the
   * specified locale and formatting options.
   *
   * If the `value` cannot be parsed, `NaN` is returned.
   *
   * This method simply passes the `value` to `parse()` and passes `true` for the second
   * argument.
   *
   * @method parseStrict
   * @param {String} value
   * @returns {Number}
   */
  /**
   * Returns the given `Number` rounded in accordance with the specified locale and
   * formatting options.
   *
   * @param {Number|String} value
   * @returns {Number}
   */
  round(value) {
    return this.parse(this.format(value));
  }
  /**
   * Returns the given `Number` truncated to the `maximumFractionDigits` in accordance
   * with the specified locale and formatting options.
   *
   * @param {Number|String} value
   * @returns {Number}
   */
  truncate(value) {
    const me = this, scale = me.maximumFractionDigits, { truncator } = me;
    let v = me.parse(value), dot;
    if (truncator) {
      v = truncator.format(v);
      dot = v.indexOf(truncator.parser.decimal);
      if (dot > -1 && v.length - dot - 1 > scale) {
        v = v.slice(0, dot + scale + 1);
      }
      v = truncator.parse(v);
    }
    return v;
  }
  resolvedOptions() {
    const options = super.resolvedOptions();
    for (const key in options) {
      if (options[key] === void 0) {
        options[key] = this[key];
      }
    }
    return options;
  }
  /**
   * Expands the provided shorthand into the "minimum*Digits" and "maximum*Digits".
   * @param {String} name
   * @param {Boolean} setMin
   * @param {Boolean} setMax
   * @private
   */
  _minMax(name, setMin, setMax) {
    const me = this, value = me[name];
    if (value != null) {
      const capName = StringHelper.capitalize(name), max = `maximum${capName}Digits`, min = `minimum${capName}Digits`;
      if (typeof value === "number") {
        if (setMin) {
          me[min] = value;
        }
        if (setMax) {
          me[max] = value;
        }
      } else {
        me[min] = value[0];
        me[max] = value[1];
      }
    }
  }
};
// This object holds only those properties that Intl.NumberFormat accepts in its
// "options" parameter. Only these options will be copied from the NumberFormat
// and passed to the Intl.NumberFormat constructor and only these will be copied
// back from its resolvedOptions:
__publicField(_NumberFormat, "standardOptions", [
  "currency",
  "currencyDisplay",
  "locale",
  "maximumFractionDigits",
  "minimumFractionDigits",
  "minimumIntegerDigits",
  "maximumSignificantDigits",
  "minimumSignificantDigits",
  "style",
  "useGrouping"
]);
var NumberFormat = _NumberFormat;
NumberFormat.Parser = NumberParser;
Object.assign(NumberFormat.prototype, {
  /**
   * The currency to use when using `style: 'currency'`. For example, `'USD'` (US dollar)
   * or `'EUR'` for the euro.
   *
   * If not provided, the {@link Core.localization.LocaleManager} default will be used.
   * @config {String}
   */
  currency: null,
  /**
   * The format in which to display the currency value when using `style: 'currency'`.
   *
   * Valid values are: `'symbol'` (the default), `'code'`, and `'name'`.
   * @config {'symbol'|'code'|'name'}
   * @default
   */
  currencyDisplay: "symbol",
  /**
   * Specifies the `minimumFractionDigits` and `minimumFractionDigits` in a compact
   * way. If this value is a `Number`, it sets both the minimum and maximum to that
   * value. If this value is an array, `[0]` sets the minimum and `[1]` sets the
   * maximum.
   * @config {Number|Number[]}
   */
  fraction: null,
  from: null,
  /**
   * An alias for `minimumIntegerDigits`.
   * @config {Number}
   */
  integer: null,
  /**
   * The name of the locale. For example, `'en-US'`. This config is the same as the
   * first argument to the `Intl.NumberFormat` constructor.
   *
   * Defaults to the browser's default locale.
   * @config {String}
   */
  locale: null,
  /**
   * The maximum number of digits following the decimal.
   *
   * This is more convenient to specify using the {@link #config-fraction} config.
   * @config {Number}
   */
  maximumFractionDigits: null,
  /**
   * The minimum number of digits following the decimal.
   *
   * This is more convenient to specify using the {@link #config-fraction} config.
   * @config {Number}
   */
  minimumFractionDigits: null,
  /**
   * The minimum number of digits preceding the decimal.
   *
   * This is more convenient to specify using the {@link #config-integer} config.
   * @config {Number}
   */
  minimumIntegerDigits: null,
  /**
   * The maximum number of significant digits.
   *
   * This is more convenient to specify using the {@link #config-significant} config.
   * @config {Number}
   */
  maximumSignificantDigits: null,
  /**
   * The minimum number of significant digits.
   *
   * This is more convenient to specify using the {@link #config-significant} config.
   * @config {Number}
   */
  minimumSignificantDigits: null,
  /**
   * Specifies the `minimumSignificantDigits` and `minimumSignificantDigits` in a compact
   * format. If this value is a `Number`, it sets only the maximum to that value. If this
   * value is an array, `[0]` sets the minimum and `[1]` sets the maximum.
   *
   * If this value (or `minimumSignificantDigits` or `minimumSignificantDigits`) is set,
   * `integer` (and `minimumIntegerDigits`) and `fraction` (and `minimumFractionDigits`
   * and `minimumFractionDigits`) are ignored.
   *
   * @config {Number|Number[]}
   */
  significant: null,
  /**
   * The formatting style.
   *
   * Valid values are: `'decimal'` (the default), `'currency'`, and `'percent'`.
   * @config {'decimal'|'currency'|'percent'}
   * @default
   */
  style: "decimal",
  /**
   * A format template consisting of the following parts:
   *```
   *  [$] [\d+:] \d+ [,\d+] [.\d* [#*] | *] [%]
   *```
   * If the template begins with a `'$'`, the formatter's `style` option is set to
   * `'currency'`. If the template ends with `'%'`, `style` is set to `'percent'`.
   * It is invalid to include both characters. When using `'$'`, the `currency` symbol
   * defaults to what is provided by the {@link Core.localization.LocaleManager}.
   *
   * To set the `minimumIntegerDigits`, the desired minimum comes before the first
   * digits in the template and is followed by a `'>'` (greater-than). For example:
   *```
   *  5>9,999.00
   *```
   * The above sets `minimumIntegerDigits` to 5.
   *
   * The `useGrouping` option is enabled if there is a `','` (comma) present and is
   * disabled otherwise.
   *
   * If there is a `'.'` (decimal) present, it may be followed by either of:
   *
   *  - Zero or more digits which may then be followed by zero or more `'#'` characters.
   *    The number of digits determines the `minimumFractionDigits`, while the total
   *    number of digits and `'#'`s determines the `maximumFractionDigits`.
   *  - A single `'*'` (asterisk) indicating any number of fractional digits (no minimum
   *    or maximum).
   *
   * @config {String}
   */
  template: null,
  /**
   * Specify `false` to disable thousands separators.
   * @config {Boolean}
   * @default
   */
  useGrouping: true
});
Formatter.number = (format, value) => NumberFormat.get(format).format(value);
NumberFormat._$name = "NumberFormat";

// ../Core/lib/Core/mixin/Clipboardable.js
var Clipboard = class extends Base.mixin(Events_default) {
  constructor() {
    super(...arguments);
    // Defaults to true, so to set this lazy on first read/write
    __publicField(this, "hasNativeAccess", true);
    __publicField(this, "_content", null);
  }
  /**
   * Write to the native Clipboard API or a local clipboard as a fallback.
   * @param {String} text Only allows string values
   * @param {Boolean} allowNative `true` will try writing to the Clipboard API once
   * @private
   */
  async writeText(text, allowNative) {
    const me = this, { _content } = me;
    if (allowNative && me.hasNativeAccess) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        me.hasNativeAccess = false;
      }
    }
    if (_content !== text) {
      me._content = text;
      me.triggerContentChange(_content, false, true);
    }
  }
  /**
   * Reads from the native Clipboard API or a local clipboard as a fallback.
   * @param {Boolean} allowNative `true` will try reading from the Clipboard API once
   * @private
   */
  async readText(allowNative) {
    const me = this, { _content } = me;
    if (allowNative && me.hasNativeAccess) {
      try {
        const text = await navigator.clipboard.readText();
        if (_content !== text) {
          me._content = text;
          me.triggerContentChange(_content, true);
        }
        return text;
      } catch (e) {
        me.hasNativeAccess = false;
      }
    }
    return _content;
  }
  /**
   * Call this to let other instances know that data has been pasted
   * @param {Object} source
   */
  triggerPaste(source) {
    this.trigger("paste", { source, text: this._content });
  }
  triggerContentChange(oldText, fromRead = false, fromWrite = false) {
    this.trigger("contentChange", { fromRead, fromWrite, oldText, newText: this._content });
  }
  async clear(allowNative) {
    await this.writeText("", allowNative);
  }
};
var Clipboardable_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    construct(...args) {
      super.construct(...args);
      if (!globalThis.bryntum.clipboard) {
        globalThis.bryntum.clipboard = new Clipboard();
      }
      globalThis.bryntum.clipboard.ion({
        paste: "onClipboardPaste",
        contentChange: "onClipboardContentChange",
        thisObj: this
      });
    }
    /**
     * Gets the current shared Clipboard instance
     * @private
     */
    get clipboard() {
      return globalThis.bryntum.clipboard;
    }
    // Called when someone triggers a paste event on the shared Clipboard
    onClipboardPaste({ text, source }) {
      var _a2;
      const me = this, { clipboardText, isCut } = me, isOwn = me.compareClipboardText(clipboardText, text);
      if (isOwn && isCut) {
        (_a2 = me.handleCutData) == null ? void 0 : _a2.call(me, { text, source });
        me.isCut = false;
        me.cutData = null;
      } else if (!isOwn) {
        me.clearClipboard(false);
      }
    }
    // Calls when the shared clipboard writes or reads a new string value
    onClipboardContentChange({ newText }) {
      if (!this.compareClipboardText(this.clipboardText, newText)) {
        this.clearClipboard(false);
      }
    }
    // When a cut is done, or a cut is deactivated
    set cutData(data) {
      var _a2, _b;
      const me = this;
      (_a2 = me._cutData) == null ? void 0 : _a2.forEach((r) => me.setIsCut(r, false));
      me._cutData = ArrayHelper.asArray(data);
      (_b = me._cutData) == null ? void 0 : _b.forEach((r) => me.setIsCut(r, true));
    }
    get cutData() {
      return this._cutData;
    }
    setIsCut() {
    }
    /**
     * Writes string data to the shared/native clipboard. Also saves a local copy of the string and the unconverted
     * data.
     *
     * But firstly, it will call beforeCopy function and wait for a response. If false, the copy will be prevented.
     *
     * @param {Object} data
     * @param {Boolean} isCut
     * @param {Object} [params] Will be passed to beforeCopy function
     * @returns {String} String data that was written to the clipboard
     * @private
     */
    async writeToClipboard(data, isCut, params = {}) {
      if (await this.beforeCopy({ data, isCut, ...params }) === false) {
        return;
      }
      const me = this, isString = typeof data === "string", stringData = isString ? data : me.stringConverter ? me.stringConverter(data) : StringHelper.safeJsonStringify(data);
      me.clipboardText = stringData;
      await me.clipboard.writeText(stringData, me.useNativeClipboard);
      me.clipboardData = data;
      me.isCut = isCut;
      me.cutData = isCut && !isString ? data : null;
      return stringData;
    }
    /**
     * Reads string data from the shared/native clipboard. If string matches current instance local clipboard data, a
     * non-modified version will be return. Otherwise, a stringParser function will be called.
     *
     * But firstly, it will call beforePaste function and wait for a response. If false, the paste will be prevented.
     *
     * This function will also trigger a paste event on the clipboard instance.
     *
     * @param {Object} [params] Will be passed to beforePaste function
     * @param {Boolean} [skipPasteTrigger] Set to `true` not trigger a paste when paste completes
     * @returns {Object}
     * @private
     */
    async readFromClipboard(params = {}, skipPasteTrigger = false) {
      var _a2;
      const me = this, { clipboard } = me, text = await clipboard.readText(me.useNativeClipboard), { isOwn, data } = me.transformClipboardText(text), isCut = text && isOwn && me.isCut;
      if (data == null || Array.isArray(data) && data.length == 0 || // Hook to trigger event or something like that
      await ((_a2 = me.beforePaste) == null ? void 0 : _a2.call(me, { data, text, ...params, isCut })) === false) {
        return;
      }
      if (!isOwn) {
        me.clearClipboard(false);
      }
      skipPasteTrigger || clipboard.triggerPaste(me);
      return data;
    }
    /**
     * Clears the clipboard data
     * @privateparam {Boolean} [clearShared] Set to `false` not to clear the internally shared and native clipboard
     * @category Common
     */
    async clearClipboard(clearShared = true) {
      const me = this;
      me.clipboardData = me.clipboardText = me.cutData = null;
      me.isCut = false;
      if (clearShared) {
        await me.clipboard.clear(me.useNativeClipboard);
      }
    }
    compareClipboardText(a, b) {
      const regex = /\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/g;
      return (a == null ? void 0 : a.replace(regex, "\n")) === (b == null ? void 0 : b.replace(regex, "\n"));
    }
    /**
     * Takes a clipboard text and returns an object with an `isOwn` property and the parsed `data`
     * @param {String} text The text string that was read from the clipboard
     * @returns {Object}
     * @private
     */
    transformClipboardText(text) {
      const me = this, isOwn = me.compareClipboardText(me.clipboardText, text), data = isOwn ? me.clipboardData : me.stringParser && text ? me.stringParser(text) : text;
      return {
        isOwn,
        data
      };
    }
    /**
     * Checks local clipboard if there is clipboard data present. If native clipboard API is available, this function
     * will return `undefined`
     * @returns {Object}
     * @private
     */
    hasClipboardData() {
      const { clipboard } = this, { _content } = clipboard;
      if (this.useNativeClipboard && clipboard.hasNativeAccess) {
        return;
      }
      return Boolean(_content && this.transformClipboardText(_content).data);
    }
  }, __publicField(_a, "$name", "Clipboardable"), __publicField(_a, "configurable", {
    /**
     * Set this to `true` to use native Clipboard API if it is available
     * @config {Boolean}
     * @default
     * @private
     */
    useNativeClipboard: false
  }), _a;
};

// ../Core/lib/Core/mixin/Override.js
var excludedPropNames = {
  constructor: 1,
  prototype: 1,
  name: 1,
  length: 1,
  arguments: 1,
  caller: 1,
  callee: 1,
  __proto__: 1
};
var Override = class {
  /**
   * Apply override. We strongly suggest that you at least specify a maxVersion for your overrides.
   * ```
   * class OriginalOverride {
   *     static get target() {
   *         return {
   *             class      : Original,
   *             product    : 'grid',
   *             minVersion : '1.0',
   *             maxVersion : '1.5'
   *         }
   *     }
   * }
   * ```
   * @param {Object} override An override class definition
   */
  static apply(override) {
    if (!override.target)
      throw new Error("Override must specify what it overrides, using static getter target");
    if (!override.target.class)
      throw new Error("Override must specify which class it overrides, using target.class");
    if (!this.shouldApplyOverride(override))
      return false;
    const staticKeys = Object.getOwnPropertyNames(override), instanceKeys = Object.getOwnPropertyNames(override.prototype);
    staticKeys.splice(staticKeys.indexOf("target"), 1);
    this.internalOverrideAll(override.target.class, staticKeys, override);
    this.internalOverrideAll(override.target.class.prototype, instanceKeys, override.prototype);
    return true;
  }
  static internalOverrideAll(targetClass, properties, overrideDefinition) {
    Reflect.ownKeys(overrideDefinition).forEach((key) => {
      if (properties.includes(key) && !excludedPropNames[key]) {
        const desc = Object.getOwnPropertyDescriptor(overrideDefinition, key);
        let currentTargetClass = targetClass;
        let targetProperty = null;
        while (!targetProperty && currentTargetClass) {
          targetProperty = Object.getOwnPropertyDescriptor(currentTargetClass, key);
          if (!targetProperty) {
            currentTargetClass = Object.getPrototypeOf(currentTargetClass);
          }
        }
        if (targetProperty) {
          this.internalOverride(currentTargetClass, key, desc, targetProperty);
        }
      }
    });
  }
  static internalOverride(target, key, desc, targetDesc) {
    const overrides = target._overridden = target._overridden || {};
    overrides[key] = target[key];
    if (targetDesc.get) {
      Object.defineProperty(target, key, {
        enumerable: false,
        configurable: true,
        get: desc.get
      });
    } else {
      target[key] = desc.value;
    }
  }
  /**
   * Checks versions if an override should be applied. Specify version in your overrides target config
   *
   * ```javascript
   * class OriginalOverride {
   *     static get target() {
   *         return {
   *             class      : Original,
   *             product    : 'grid',
   *             minVersion : '1.0',
   *             maxVersion : '1.5'
   *         }
   *     }
   * }
   * ```
   *
   * @param override
   * @returns {Boolean}
   * @private
   */
  static shouldApplyOverride(override) {
    const config = override.target;
    if (!config.maxVersion && !config.minVersion)
      return true;
    if (!config.product)
      throw new Error("Override must specify product when using versioning");
    if (config.maxVersion && VersionHelper[config.product].isNewerThan(config.maxVersion)) {
      return false;
    }
    if (config.minVersion && VersionHelper[config.product].isOlderThan(config.minVersion)) {
      return false;
    }
    return true;
  }
};
Override._$name = "Override";

// ../Core/lib/Core/util/Month.js
var _Month = class _Month extends Events_default(Base) {
  static get configurable() {
    return {
      /**
       * The date which the month should encapsulate. May be a `Date` object, or a
       * `YYYY-MM-DD` format string.
       *
       * Mutating a passed `Date` after initializing a `Month` object has no effect on
       * the `Month` object.
       * @config {Date|String}
       */
      date: {
        $config: {
          equal: "date"
        },
        value: DateHelper.clearTime(/* @__PURE__ */ new Date())
      },
      month: null,
      year: null,
      /**
       * The week start day, 0 meaning Sunday, 6 meaning Saturday.
       * Defaults to {@link Core.helper.DateHelper#property-weekStartDay-static}.
       * @config {Number}
       */
      weekStartDay: null,
      /**
       * Configure as `true` to have the visibleDayColumnIndex and visibleColumnCount properties
       * respect the configured {@link #config-nonWorkingDays}.
       * @config {Boolean}
       */
      hideNonWorkingDays: null,
      /**
       * Non-working days as an object where keys are day indices, 0-6 (Sunday-Saturday), and the value is `true`.
       * Defaults to {@link Core.helper.DateHelper#property-nonWorkingDays-static}.
       * @config {Object<String,Boolean>}
       */
      nonWorkingDays: null,
      /**
       * Configure as `true` to always have the month encapsulate six weeks.
       * This is useful for UIs which must be a fixed height.
       * @prp {Boolean}
       */
      sixWeeks: null
    };
  }
  //region events
  /**
   * Fired when setting the {@link #config-date} property causes the encapsulated date to change
   * in **any** way, date, week, month or year.
   * @event dateChange
   * @param {Core.util.Month} source The Month which triggered the event.
   * @param {Date} newDate The new encapsulated date value.
   * @param {Date} oldDate The previous encapsulated date value.
   * @param {Number} changes An object which contains properties which indicate what part of the date changed.
   * @param {Boolean} changes.d True if the date changed in any way.
   * @param {Boolean} changes.w True if the week changed (including same week in a different year).
   * @param {Boolean} changes.m True if the month changed (including same month in a different year).
   * @param {Boolean} changes.y True if the year changed.
   * @param {Boolean} changes.r True if the row count (with respect to the {@link #config-sixWeeks} setting) changed.
   */
  /**
   * Fired when setting the {@link #config-date} property causes a change of week. Note that
   * weeks are calculated in the ISO standard form such that if there are fewer than four
   * days in the first week of a year, then that week is owned by the previous year.
   *
   * The {@link #config-weekStartDay} is honoured when making this calculation and this is a
   * locale-specific value which defaults to the ISO standard of 1 (Monday) in provided European
   * locales and 0 (Sunday) in the provided US English locale.
   * @event weekChange
   * @param {Core.util.Month} source The Month which triggered the event.
   * @param {Date} newDate The new encapsulated date value.
   * @param {Date} oldDate The previous encapsulated date value.
   * @param {Number} changes An object which contains properties which indicate what part of the date changed.
   * @param {Boolean} changes.d True if the date changed in any way.
   * @param {Boolean} changes.w True if the week changed (including same week in a different year).
   * @param {Boolean} changes.m True if the month changed (including same month in a different year).
   * @param {Boolean} changes.y True if the year changed.
   * @param {Boolean} changes.r True if the row count (with respect to the {@link #config-sixWeeks} setting) changed.
   */
  /**
   * Fired when setting the {@link #config-date} property causes a change of month. This
   * will fire when changing to the same month in a different year.
   * @event monthChange
   * @param {Core.util.Month} source The Month which triggered the event.
   * @param {Date} newDate The new encapsulated date value.
   * @param {Date} oldDate The previous encapsulated date value.
   * @param {Number} changes An object which contains properties which indicate what part of the date changed.
   * @param {Boolean} changes.d True if the date changed in any way.
   * @param {Boolean} changes.w True if the week changed (including same week in a different year).
   * @param {Boolean} changes.m True if the month changed (including same month in a different year).
   * @param {Boolean} changes.y True if the year changed.
   * @param {Boolean} changes.r True if the row count (with respect to the {@link #config-sixWeeks} setting) changed.
   */
  /**
   * Fired when setting the {@link #config-date} property causes a change of year.
   * @event yearChange
   * @param {Core.util.Month} source The Month which triggered the event.
   * @param {Date} newDate The new encapsulated date value.
   * @param {Date} oldDate The previous encapsulated date value.
   * @param {Number} changes An object which contains properties which indicate what part of the date changed.
   * @param {Boolean} changes.d True if the date changed in any way.
   * @param {Boolean} changes.w True if the week changed (including same week in a different year).
   * @param {Boolean} changes.m True if the month changed (including same month in a different year).
   * @param {Boolean} changes.y True if the year changed.
   * @param {Boolean} changes.r True if the row count (with respect to the {@link #config-sixWeeks} setting) changed.
   */
  //endRegion
  /**
   * For use when this Month's `weekStartDay` is non-zero.
   *
   * An array to map the days of the week 0-6 of this Calendar to the canonical day numbers
   * used by the Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
   * @member {Number[]} canonicalDayNumbers
   * @readonly
   */
  /**
   * An array to map a canonical day number to a *visible* column index.
   * For example, if we have `weekStartDay` as Monday which is 1, and non working days as
   * Wednesday, and `hideNonWorkingDays : true`, then the calendar would look like
   *
   *```
   * ┌────┬────┬────┬────┬────┬────┐
   * | Mo | Tu | Th | Fr | Sa | Su |
   * └────┴────┴────┴────┴────┴────┘
   *```
   *
   * So we'd need this array: `[ 5, 0, 1, undefined, 2, 3, 4]`
   * @member {Number[]} visibleDayColumnIndex
   * @readonly
   */
  /**
   * An array to map a canonical day number to a 0-6 column index.
   * For example, if we have `weekStartDay` as Monday which is 1, then the calendar would look like
   *
   *```
   * ┌────┬────┬────┬────┬────┬────┬────┐
   * | Mo | Tu | We | Th | Fr | Sa | Su |
   * └────┴────┴────┴────┴────┴────┴────┘
   *```
   *
   * So we'd need this array: `[ 6, 0, 1, 2, 3, 4, 5]`
   * @member {Number[]} dayColumnIndex
   * @readonly
   */
  /**
   * The number of visible days in the week as defined by the `nonWorkingDays` and
   * `hideNonWorkingDays` options.
   * @member {Number} weekLength
   * @readonly
   */
  configure(config) {
    super.configure(config);
    this.updateDayNumbers();
    if (config.date) {
      this.date = config.date;
    }
    this.generation = 0;
  }
  changeDate(date) {
    if (this.isConfiguring) {
      return;
    }
    date = typeof date === "string" ? DateHelper.parse(date, "YYYY-MM-DD") : new Date(date);
    if (isNaN(date)) {
      throw new Error("Month date ingestion must be passed a Date, or a valid YYYY-MM-DD date string");
    }
    return date;
  }
  updateDate(newDate, oldDate) {
    const me = this, {
      dayColumnIndex,
      weekCount
    } = me, monthStart = DateHelper.getFirstDateOfMonth(newDate), monthEnd = DateHelper.getLastDateOfMonth(monthStart), startWeekDay = dayColumnIndex[monthStart.getDay()], endWeekDay = dayColumnIndex[monthEnd.getDay()], yearChanged = !oldDate || newDate.getFullYear() !== oldDate.getFullYear(), monthChanged = !oldDate || newDate.getMonth() !== oldDate.getMonth(), changes = me.eventListeners && (oldDate ? newDate.getDate() !== oldDate.getDate() | (me.getWeekId(newDate) !== me.getWeekId(oldDate)) << 1 | monthChanged << 2 | yearChanged << 3 : 15);
    me._year = newDate.getFullYear();
    me._month = newDate.getMonth();
    me.startDayOfMonth = 1 - startWeekDay;
    me.endDayOfMonth = monthEnd.getDate() + (6 - endWeekDay);
    if (me.sixWeeks) {
      me.endDayOfMonth += (6 - me.weekCount) * 7;
    }
    if (!me.weekBase || yearChanged) {
      me.calculateWeekBase();
    }
    if (monthChanged || yearChanged) {
      me.generation++;
    }
    if (changes) {
      const event = {
        newDate,
        oldDate,
        changes: {
          d: true,
          w: Boolean(changes & 2),
          m: Boolean(changes & 12),
          y: Boolean(changes & 8),
          r: me.weekCount !== weekCount
        }
      };
      me.trigger("dateChange", event);
      if (changes & 2) {
        me.trigger("weekChange", event);
      }
      if (changes & 12) {
        me.trigger("monthChange", event);
      }
      if (changes & 8) {
        me.trigger("yearChange", event);
      }
    }
  }
  calculateWeekBase() {
    const me = this, {
      dayColumnIndex
    } = me, jan1 = new Date(me.year, 0, 1), dec31 = new Date(me.year, 11, 31), january = me.month ? me.getOtherMonth(jan1) : me;
    if (me.dayColumnIndex[jan1.getDay()] > 3) {
      me.weekBase = january.startDate;
    } else {
      me.weekBase = new Date(me.year, 0, january.startDayOfMonth - 7);
    }
    const dec31Week = Math.floor(DateHelper.diff(me.weekBase, dec31, "day") / 7);
    me.has53weeks = dec31Week === 53 && dayColumnIndex[dec31.getDay()] > 2;
  }
  /**
   * Returns the week start date, based on the configured {@link #config-weekStartDay} of the
   * passed week.
   * @param {Number| Number[]} week The week number in the current year, or an array containing
   * `[year, weekOfYear]` for any year.
   *
   * Week numbers greater than the number of weeks in the year just wrap into the following year.
   */
  getWeekStart(week) {
    if (typeof week === "number") {
      return DateHelper.add(this.weekBase, Math.max(week, 1) * 7, "day");
    }
    const me = this, [year, weekOfYear] = week;
    if (year === me.year) {
      return me.getWeekStart(weekOfYear);
    }
    return me.getOtherMonth(new Date(year, 0, 1)).getWeekStart(weekOfYear);
  }
  getOtherMonth(date) {
    const me = this, result = me === otherMonth ? new _Month(null) : otherMonth;
    result.configure({
      weekBase: null,
      weekStartDay: me.weekStartDay,
      nonWorkingDays: me.nonWorkingDays,
      hideNonWorkingDays: me.hideNonWorkingDays,
      sixWeeks: me.sixWeeks,
      date: new Date(date.getFullYear(), 0, 1)
      // Make it easy to calculate its own weekBase
    });
    result.date = date;
    result.updateDate(result.date, result.date);
    return result;
  }
  changeYear(year) {
    const newDate = new Date(this.date);
    newDate.setFullYear(year);
    this.date = newDate;
  }
  changeMonth(month) {
    const newDate = new Date(this.date);
    newDate.setMonth(month);
    this.date = newDate;
  }
  get weekStartDay() {
    return typeof this._weekStartDay === "number" ? this._weekStartDay : DateHelper.weekStartDay;
  }
  updateWeekStartDay() {
    const me = this;
    me.updateDayNumbers();
    if (!me.isConfiguring && me.date) {
      me.weekBase = null;
      me.updateDate(me.date, me.date);
    }
  }
  get nonWorkingDays() {
    return this._nonWorkingDays || DateHelper.nonWorkingDays;
  }
  changeNonWorkingDays(nonWorkingDays) {
    return ObjectHelper.assign({}, nonWorkingDays);
  }
  updateNonWorkingDays() {
    this.updateDayNumbers();
  }
  updateHideNonWorkingDays() {
    this.updateDayNumbers();
  }
  updateSixWeeks() {
    if (!this.isConfiguring) {
      this.updateDate(this.date, this.date);
    }
  }
  /**
   * The number of days in the calendar for this month. This will always be
   * a multiple of 7, because this represents the number of calendar cells
   * occupied by this month.
   * @property {Number}
   * @readonly
   */
  get dayCount() {
    return this.endDayOfMonth + 1 - this.startDayOfMonth;
  }
  /**
   * The number of weeks in the calendar for this month.
   * @property {Number}
   * @readonly
   */
  get weekCount() {
    return this.dayCount / 7;
  }
  /**
   * The date of the first cell in the calendar view of this month.
   * @property {Date}
   * @readonly
   */
  get startDate() {
    const me = this;
    if (me.year != null && me.month != null && me.startDayOfMonth != null) {
      return new Date(me.year, me.month, me.startDayOfMonth);
    }
  }
  /**
   * The date of the last cell in the calendar view of this month.
   * @property {Date}
   * @readonly
   */
  get endDate() {
    const me = this;
    if (me.year != null && me.month != null && me.startDayOfMonth != null) {
      return new Date(me.year, me.month, me.endDayOfMonth);
    }
  }
  /**
   * Iterates through all calendar cells in this month, calling the passed function for each date.
   * @param {Function} fn The function to call.
   * @param {Date} fn.date The date for the cell.
   */
  eachDay(fn) {
    for (let dayOfMonth = this.startDayOfMonth; dayOfMonth <= this.endDayOfMonth; dayOfMonth++) {
      fn(new Date(this.year, this.month, dayOfMonth));
    }
  }
  /**
   * Iterates through all weeks in this month, calling the passed function
   * for each week.
   * @param {Function} fn The function to call.
   * @param {Number[]} fn.week An array containing `[year, weekNumber]`
   * @param {Date[]} fn.dates The dates for the week.
   */
  eachWeek(fn) {
    const me = this, { weekCount } = me;
    for (let dayOfMonth = me.startDayOfMonth, week = 0; week < weekCount; week++) {
      const weekDates = [], weekOfYear = me.getWeekNumber(new Date(me.year, me.month, dayOfMonth));
      for (let day = 0; day < 7; day++, dayOfMonth++) {
        weekDates.push(new Date(me.year, me.month, dayOfMonth));
      }
      fn(weekOfYear, weekDates);
    }
  }
  /**
   * Returns the week of the year for the passed date. This returns an array containing *two* values,
   * the year **and** the week number are returned.
   *
   * The week number is calculated according to ISO rules, meaning that if the first week of the year
   * contains less than four days, it is considered to be the last week of the preceding year.
   *
   * The configured {@link #config-weekStartDay} is honoured in this calculation. So if the weekStartDay
   * is **NOT** the ISO standard of `1`, (Monday), then the weeks do not coincide with ISO weeks.
   * @param {Date} date The date to calculate the week for.
   * @returns {Number[]} A numeric array: `[year, week]`
   */
  getWeekNumber(date) {
    const me = this;
    date = DateHelper.clearTime(date);
    if (date.getFullYear() !== me.year) {
      return me.getOtherMonth(new Date(date.getFullYear(), 0, 1)).getWeekNumber(date);
    }
    let weekNo = Math.floor(DateHelper.diff(me.weekBase, date, "day") / 7), year = date.getFullYear();
    if (!weekNo) {
      return me.getOtherMonth(new Date(me.year - 1, 0, 1)).getWeekNumber(new Date(me.year, 0, 0));
    } else if (weekNo === 53 && !me.has53weeks) {
      weekNo = 1;
      year++;
    } else if (weekNo > 53) {
      weekNo = weekNo % 52;
    }
    return [year, weekNo];
  }
  getWeekId(date) {
    const week = this.getWeekNumber(date);
    return week[0] * 100 + week[1];
  }
  getCellData(date, ownerMonth, dayTime = DayTime.MIDNIGHT) {
    const me = this, day = date.getDay(), visibleColumnIndex = me.visibleDayColumnIndex[day], isNonWorking = me.nonWorkingDays[day], isHiddenDay = me.hideNonWorkingDays && isNonWorking;
    if (date < me.startDate || date > me.endDate) {
      me.month = date.getMonth();
    }
    return {
      day,
      dayTime,
      visibleColumnIndex,
      isNonWorking,
      week: me.getOtherMonth(date).getWeekNumber(date),
      key: DateHelper.format(date, "YYYY-MM-DD"),
      columnIndex: me.dayColumnIndex[day],
      date: new Date(date),
      dayEnd: dayTime.duration("s"),
      tomorrow: dayTime.dayOfDate(DateHelper.add(date, 1, "day")),
      // These two properties are only significant when used by a CalendarPanel which encapsulates
      // a single month.
      isOtherMonth: Math.sign(date.getMonth() + date.getFullYear() * 12 - (ownerMonth.month + ownerMonth.year * 12)),
      visible: !isHiddenDay && (date >= ownerMonth.startDate && date < DateHelper.add(ownerMonth.endDate, 1, "day")),
      isRowStart: visibleColumnIndex === 0,
      isRowEnd: visibleColumnIndex === me.visibleColumnCount - 1
    };
  }
  updateDayNumbers() {
    const me = this, {
      weekStartDay,
      nonWorkingDays,
      hideNonWorkingDays
    } = me, dayColumnIndex = me.dayColumnIndex = [], canonicalDayNumbers = me.canonicalDayNumbers = [], visibleDayColumnIndex = me.visibleDayColumnIndex = [];
    let visibleColumnIndex = 0;
    for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
      const canonicalDay = (weekStartDay + columnIndex) % 7;
      canonicalDayNumbers[columnIndex] = canonicalDay;
      dayColumnIndex[canonicalDay] = columnIndex;
      if (!hideNonWorkingDays || !nonWorkingDays[canonicalDay]) {
        visibleDayColumnIndex[canonicalDay] = visibleColumnIndex++;
      }
    }
    me.visibleColumnCount = visibleColumnIndex;
    me.weekLength = hideNonWorkingDays ? 7 - ObjectHelper.keys(nonWorkingDays).length : 7;
  }
};
__publicField(_Month, "$name", "Month");
var Month = _Month;
var otherMonth = new Month(null);
Month._$name = "Month";

// ../Core/lib/Core/widget/ButtonGroup.js
var _ButtonGroup = class _ButtonGroup extends Container.mixin(Rotatable_default) {
  onChildAdd(item) {
    super.onChildAdd(item);
    item.ion({
      click: "resetValueCache",
      toggle: "onItemToggle",
      thisObj: this,
      // This needs to run before the 'click' event is relayed by this button group, in such listener
      // the `value` must already be updated
      prio: 1e4
    });
  }
  onChildRemove(item) {
    item.un({
      toggle: "resetValueCache",
      click: "resetValueCache",
      thisObj: this
    });
    super.onChildRemove(item);
  }
  onItemToggle(event) {
    const me = this;
    me.resetValueCache();
    if (!me.isSettingValue && (!me.toggleGroup || event.pressed)) {
      me.triggerFieldChange({ value: me.value, userAction: true, event });
    }
  }
  resetValueCache() {
    this._value = null;
  }
  createWidget(widget) {
    const me = this, type = me.constructor.resolveType(widget.type || "button");
    if (type.isButton) {
      if (me.color && !widget.color) {
        widget.color = me.color;
      }
      if (me.toggleGroup && !widget.toggleGroup) {
        if (typeof me.toggleGroup === "boolean") {
          me.toggleGroup = _ButtonGroup.generateId("toggleGroup");
        }
        widget.toggleGroup = me.toggleGroup;
      }
    }
    if (me.columns) {
      widget.width = `${100 / me.columns}%`;
    }
    widget = super.createWidget(widget);
    me.relayEvents(widget, ["click", "action", "toggle"]);
    return widget;
  }
  updateRotate(rotate) {
    this.eachWidget((btn) => {
      if (btn.rotate !== false) {
        btn.rotate = rotate;
      }
    });
  }
  get value() {
    if (!this._value) {
      const values = [];
      this.items.forEach((w) => {
        if (w.pressed && w.value !== void 0) {
          values.push(w.value);
        }
      });
      this._value = values.join(this.valueSeparator);
    }
    return this._value;
  }
  set value(value) {
    const me = this, oldValue = me.value;
    if (!Array.isArray(value)) {
      if (value === void 0 || value === null) {
        value = [];
      } else if (typeof value == "string") {
        value = value.split(me.valueSeparator);
      } else {
        value = [value];
      }
    }
    me._value = value.join(me.valueSeparator);
    me.isSettingValue = true;
    me.items.forEach((w) => {
      if (w.value !== void 0) {
        w.pressed = value.includes(w.value);
      }
    });
    me.isSettingValue = false;
    if (!me.isConfiguring && oldValue !== me.value) {
      me.triggerFieldChange({ value: me.value, userAction: false });
    }
  }
  updateDisabled(disabled) {
    this.items.forEach((button) => button.disabled = disabled || !button.ignoreParentReadOnly && this.readOnly);
  }
  updateReadOnly(readOnly) {
    super.updateReadOnly(readOnly);
    this.updateDisabled(this.disabled);
  }
  get widgetClassList() {
    const classList = super.widgetClassList;
    this.columns && classList.push("b-columned");
    return classList;
  }
};
/**
 * Fires when a button in the group is clicked
 * @event click
 * @param {Core.widget.Button} source Clicked button
 * @param {Event} event DOM event
 */
/**
 * Fires when the default action is performed on a button in the group (the button is clicked)
 * @event action
 * @param {Core.widget.Button} source Clicked button
 * @param {Event} event DOM event
 */
/**
 * Fires when a button in the group is toggled (the {@link Core.widget.Button#property-pressed} state is changed).
 * If you need to process the pressed button only, consider using {@link #event-click} event or {@link #event-action} event.
 * @event toggle
 * @param {Core.widget.Button} source Toggled button
 * @param {Boolean} pressed New pressed state
 * @param {Event} event DOM event
 */
__publicField(_ButtonGroup, "$name", "ButtonGroup");
__publicField(_ButtonGroup, "type", "buttongroup");
__publicField(_ButtonGroup, "configurable", {
  defaultType: "button",
  /**
   * Custom CSS class to add to element. When using raised buttons (cls 'b-raised' on the buttons), the group
   * will look nicer if you also set that cls on the group.
   *
   * ```
   * new ButtonGroup({
   *   cls : 'b-raised,
   *   items : [
   *       { icon : 'b-fa b-fa-unicorn', cls : 'b-raised' },
   *       ...
   *   ]
   * });
   * ```
   *
   * @config {String}
   * @category CSS
   */
  cls: null,
  /**
   * An array of Buttons or typed Button config objects.
   * @config {ButtonConfig[]|Core.widget.Button[]}
   */
  items: null,
  /**
   * Default color to apply to all contained buttons, see {@link Core.widget.Button#config-color Button#color}.
   * Individual buttons can override the default.
   * @config {String}
   */
  color: null,
  /**
   * Set to `true` to turn the ButtonGroup into a toggle group, assigning a generated value to each contained
   * buttons {@link Core.widget.Button#config-toggleGroup toggleGroup config}. Individual buttons can
   * override the default.
   * @config {Boolean}
   */
  toggleGroup: null,
  valueSeparator: ",",
  columns: null,
  hideWhenEmpty: true,
  defaultBindProperty: "value"
});
var ButtonGroup = _ButtonGroup;
ButtonGroup.initClass();
ButtonGroup._$name = "ButtonGroup";

// ../Core/lib/Core/widget/CalendarPanel.js
var CalendarPanel = class extends Panel {
  static get configurable() {
    return {
      layout: "vbox",
      textContent: false,
      /**
       * Gets or sets the date that orientates the panel to display a particular month.
       * Changing this causes the content to be refreshed.
       * @member {Date} date
       */
      /**
       * The date which this CalendarPanel encapsulates.
       * @config {Date|String}
       */
      date: {
        $config: {
          equal: "date"
        },
        value: null
      },
      /**
       * A {@link Core.util.Month} Month utility object which encapsulates this Panel's month
       * and provides contextual information and navigation services.
       * @config {Core.util.Month|MonthConfig}
       */
      month: {},
      year: null,
      /**
       * The week start day, 0 meaning Sunday, 6 meaning Saturday.
       * Defaults to {@link Core.helper.DateHelper#property-weekStartDay-static}.
       * @config {Number}
       */
      weekStartDay: null,
      /**
       * Configure as `true` to always show a six week calendar.
       * @config {Boolean}
       * @default
       */
      sixWeeks: true,
      /**
       * Configure as `true` to show a week number column at the start of the calendar block.
       * @deprecated Since 4.0.0. Use {@link #config-showWeekColumn} instead.
       * @config {Boolean}
       */
      showWeekNumber: null,
      /**
       * Configure as `true` to show a week number column at the start of the calendar block.
       * @config {Boolean}
       */
      showWeekColumn: null,
      /**
       * Either an array of `Date` objects which are to be disabled, or
       * a function (or the name of a function), which, when passed a `Date` returns `true` if the
       * date is disabled.
       * @config {Function|Date[]|String}
       * @param {Date} date Date to check
       * @returns {Boolean} Returns `true` if the provided date is disabled
       */
      disabledDates: null,
      /**
       * A function (or the name of a function) which creates content in, and may mutate a day header element.
       *
       * @config {Function|String}
       * @param {Object} renderData
       * @param {HTMLElement} renderData.cell The header element
       * @param {Number} renderData.day The day number conforming to the specified {@link #config-weekStartDay}. Will be in the range `0` to `6`
       * @param {Number} renderData.weekDay The canonical day number where Monday is 0 and Sunday is
       * @returns {String|DomConfig|null}
       */
      headerRenderer: null,
      /**
       * A function (or the name of a function) which creates content in, and may mutate the week cell element at the start of a week row.
       *
       * @config {Function|String}
       * @param {Object} renderData
       * @param {HTMLElement} renderData.cell The header element
       * @param {Number[]} renderData.week An array containing `[year, weekNumber]`
       * @returns {String|DomConfig|null}
       */
      weekRenderer: null,
      /**
       * A function (or the name of a function) which creates content in, and may mutate a day cell element.
       *
       * @config {Function|String}
       * @param {Object} renderData
       * @param {HTMLElement} renderData.cell The header element
       * @param {Date} renderData.date The date for the cell
       * @param {Number} renderData.day The day for the cell (`0` to `6` for Sunday to Saturday)
       * @param {Number[]} renderData.rowIndex The row index, 0 to month row count (6 if {@link #config-sixWeeks} is `true`)
       * @param {HTMLElement} renderData.row The row element encapsulating the week which the cell is a part of
       * @param {Number[]} renderData.cellIndex The cell index in the whole panel. May be from `0` to up to `42`
       * @param {Number[]} renderData.columnIndex The column index, `0` to `6`
       * @param {Number[]} renderData.visibleColumnIndex The visible column index taking hidden non working days into account
       * @returns {String|DomConfig|null}
       */
      cellRenderer: null,
      /**
       * Configure as `true` to render weekends as {@link #config-disabledDates}.
       * @config {Boolean}
       */
      disableWeekends: null,
      hideNonWorkingDays: null,
      hideNonWorkingDaysCls: "b-hide-nonworking-days",
      /**
       * Non-working days as an object where keys are day indices, 0-6 (Sunday-Saturday), and the value is `true`.
       * Defaults to {@link Core.helper.DateHelper#property-nonWorkingDays-static}.
       * @config {Object<Number,Boolean>}
       */
      nonWorkingDays: null,
      /**
       * A config object to create a tooltip which will show on hover of a date cell including disabled, weekend,
       * and "other month" cells.
       *
       * It is the developer's responsibility to hook the `beforeshow` event to either veto the show by returning
       * `false` or provide contextual content for the date.
       *
       * The tip instance will be primed with a `date` property.
       * @config {TooltipConfig}
       */
      tip: null,
      dayCellCls: "b-calendar-cell",
      dayHeaderCls: "b-calendar-day-header",
      /**
       * The class name to add to disabled calendar cells.
       * @config {String}
       * @private
       */
      disabledCls: "b-disabled-date",
      /**
       * The class name to add to calendar cells which are in the previous or next month.
       * @config {String}
       * @private
       */
      otherMonthCls: "b-other-month",
      /**
       * The class name to add to calendar cells which are weekend dates.
       * @config {String}
       * @private
       */
      weekendCls: "b-weekend",
      /**
       * The class name to add to the calendar cell which contains today's date.
       * @config {String}
       * @private
       */
      todayCls: "b-today",
      /**
       * The class name to add to calendar cells which are {@link #config-nonWorkingDays}.
       * @config {String}
       * @private
       */
      nonWorkingDayCls: "b-nonworking-day",
      /**
       * The {@link Core.helper.DateHelper} format string to format the day names
       * in the header row above the calendar cells.
       * @config {String}
       * @default
       */
      dayNameFormat: "ddd",
      /**
       * By default, week rows flex to share available Panel height equally.
       *
       * Set this config if the available height is too small, and the cell height needs
       * to be larger to show events.
       *
       * Setting this config causes the month grid to become scrollable in the `Y` axis.
       *
       * May be specified as a number in which case it will be taken to mean pixels,
       * or a length in standard CSS units.
       * @config {Number|String}
       */
      minRowHeight: {
        $config: ["lazy"],
        value: null
      },
      /**
       * By default, day cells flex to share available Panel width equally.
       *
       * Set this config if the available width is too small, and the cell width needs
       * to be larger to show events.
       *
       * Setting this config causes the month grid to become scrollable in the `X` axis.
       * @config {Number}
       */
      minColumnWidth: {
        $config: ["lazy"],
        value: null
      },
      /**
       * Configure this as true to disable pointer interaction with cells which are outside the
       * range of the current month.
       * @config {Boolean}
       */
      disableOtherMonthCells: null,
      disableOtherMonthCellsCls: "b-disable-othermonth-cells",
      /**
       * Configure this as `true` to hide cells which are outside the range of the current month.
       * @config {Boolean}
       */
      hideOtherMonthCells: null,
      hideOtherMonthCellsCls: "b-hide-othermonth-cells",
      /**
       * By default, when navigating through time, the next time
       * block will be animated in from the appropriate direction.
       *
       * Configure this as `false` to disable this.
       * @prp {Boolean} animateTimeShift
       * @default
       */
      animateTimeShift: true
    };
  }
  construct(config) {
    super.construct(config);
    if (!this.refreshCount) {
      this.refresh();
    }
  }
  onInternalPaint({ firstPaint }) {
    var _a;
    (_a = super.onInternalPaint) == null ? void 0 : _a.call(this, ...arguments);
    if (firstPaint) {
      if (!this.refreshCount) {
        this.refresh();
      }
      this.getConfig("minColumnWidth");
      this.getConfig("minRowHeight");
    }
  }
  get overflowElement() {
    return this.weeksElement;
  }
  doDestroy() {
    var _a;
    (_a = this.tip) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  updateMinRowHeight(minRowHeight) {
    this.element.style.setProperty("--min-row-height", DomHelper.setLength(minRowHeight));
    this.scrollable = {
      overflowY: minRowHeight ? "auto" : false
    };
  }
  updateMinColumnWidth(minColumnWidth) {
    const me = this;
    me.element.style.setProperty("--min-column-width", DomHelper.setLength(minColumnWidth));
    me.scrollable = {
      overflowX: minColumnWidth ? "auto" : false
    };
    me.overflowElement.classList[minColumnWidth ? "add" : "remove"]("b-min-columnwidth");
  }
  getDateFromDomEvent(domEvent) {
    const element = (domEvent.nodeType === Element.ELEMENT_NODE ? domEvent : domEvent.target).closest(`#${this.id} [data-date]`);
    if (element) {
      return DateHelper.parseKey(element.dataset.date);
    }
  }
  changeTip(tip, existingTip) {
    const me = this;
    return Tooltip.reconfigure(existingTip, tip, {
      owner: me,
      defaults: {
        type: "tooltip",
        owner: me,
        id: `${me.id}-cell-tip`,
        forElement: me.bodyElement,
        forSelector: `.${me.dayCellCls}`
      }
    });
  }
  updateTip(tip) {
    this.detachListeners("tip");
    tip == null ? void 0 : tip.ion({
      pointerOver: "onTipOverCell",
      name: "tip",
      thisObj: this
    });
  }
  updateElement(element, was) {
    const me = this;
    super.updateElement(element, was);
    me.updateHideNonWorkingDays(me.hideNonWorkingDays);
    me.weekdayCells = Array.from(element.querySelectorAll(".b-calendar-day-header"));
    me.weekElements = Array.from(element.querySelectorAll(".b-calendar-week"));
    me.weekDayElements = Array.from(element.querySelectorAll(".b-calendar-days"));
    me.cellElements = [];
    for (let i = 0, { length } = me.weekDayElements; i < length; i++) {
      me.cellElements.push(me.weekDayElements[i].previousSibling, ...me.weekDayElements[i].children);
    }
  }
  changeDate(date) {
    date = typeof date === "string" ? DateHelper.parse(date) : new Date(date);
    if (isNaN(date)) {
      throw new Error("CalendarPanel date ingestion must be passed a Date, or a YYYY-MM-DD date string");
    }
    return DateHelper.clearTime(date);
  }
  /**
   * The date which this CalendarPanel encapsulates. Setting this causes the
   * content to be refreshed.
   * @property {Date}
   */
  updateDate(value) {
    this.month.date = value;
  }
  updateDayNameFormat() {
    const d = /* @__PURE__ */ new Date("2000-06-04T12:00:00");
    this.shortDayNames = [];
    for (let date = 4; date < 11; date++) {
      d.setDate(date);
      this.shortDayNames.push(DateHelper.format(d, this.dayNameFormat));
    }
  }
  get weekStartDay() {
    return typeof this._weekStartDay === "number" ? this._weekStartDay : DateHelper.weekStartDay;
  }
  /**
   * Set to 0 for Sunday (the default), 1 for Monday etc.
   *
   * Set to `null` to use the default value from {@link Core/helper/DateHelper}.
   */
  updateWeekStartDay(weekStartDay) {
    const me = this;
    if (me._month) {
      me.month.weekStartDay = weekStartDay;
      me.dayNames = [];
      for (let i = 0; i < 7; i++) {
        me.dayNames[i] = me.shortDayNames[me.canonicalDayNumbers[i]];
      }
      if (me.refreshCount) {
        me.refresh();
      }
    }
  }
  updateHideNonWorkingDays(hideNonWorkingDays) {
    var _a;
    this.contentElement.classList.toggle(this.hideNonWorkingDaysCls, Boolean(hideNonWorkingDays));
    (_a = this.scrollable) == null ? void 0 : _a.syncOverflowState();
    if (this._month) {
      this.month.hideNonWorkingDays = hideNonWorkingDays;
    }
    if (!this.isConfiguring) {
      this.refresh();
    }
  }
  updateHideOtherMonthCells(hideOtherMonthCells) {
    var _a;
    this.element.classList.toggle(this.hideOtherMonthCellsCls, Boolean(hideOtherMonthCells));
    (_a = this.scrollable) == null ? void 0 : _a.syncOverflowState();
  }
  updateDisableOtherMonthCells(disableOtherMonthCells) {
    var _a;
    this.element.classList.toggle(this.disableOtherMonthCellsCls, Boolean(disableOtherMonthCells));
    (_a = this.scrollable) == null ? void 0 : _a.syncOverflowState();
  }
  get nonWorkingDays() {
    return this._nonWorkingDays || (this._localeNonWorkingDays || (this._localeNonWorkingDays = DateHelper.nonWorkingDays));
  }
  get weekends() {
    return this._localeWeekends || (this._localeWeekends = DateHelper.weekends);
  }
  changeNonWorkingDays(nonWorkingDays) {
    return ObjectHelper.assign({}, nonWorkingDays);
  }
  updateNonWorkingDays(nonWorkingDays) {
    var _a;
    if (this._month) {
      this.month.nonWorkingDays = nonWorkingDays;
      this.refresh();
      (_a = this.scrollable) == null ? void 0 : _a.syncOverflowState();
    }
  }
  get visibleDayColumnIndex() {
    return this.month.visibleDayColumnIndex;
  }
  get dayColumnIndex() {
    return this.month.dayColumnIndex;
  }
  get canonicalDayNumbers() {
    return this.month.canonicalDayNumbers;
  }
  get visibleColumnCount() {
    return this.month.visibleColumnCount;
  }
  get weekLength() {
    return this.month.weekLength;
  }
  /**
   * The date of the first day cell in this panel.
   * Note that this may *not* be the first of this panel's current month.
   * @property {Date}
   * @readonly
   */
  get startDate() {
    return this.month.startDate;
  }
  get duration() {
    return DateHelper.diff(this.month.startDate, this.month.endDate, "day") + 1;
  }
  /**
   * The end date of this view. Note that in terms of full days, this is exclusive,
   * ie: 2020-01-012 to 2020-01-08 is *seven* days. The end is 00:00:00 on the 8th.
   *
   * Note that this may *not* be the last date of this panel's current month.
   * @property {Date}
   * @readonly
   */
  get endDate() {
    const { endDate } = this.month;
    if (endDate) {
      return DateHelper.add(endDate, 1, "day");
    }
  }
  changeMonth(month, currentMonth) {
    const me = this;
    if (!(month instanceof Month)) {
      if (typeof month === "number") {
        if (currentMonth) {
          currentMonth.month = month;
          return;
        }
        const date = me.date || DateHelper.clearTime(/* @__PURE__ */ new Date());
        date.setMonth(month);
        month = {
          date
        };
      }
      month = Month.new({
        weekStartDay: me.weekStartDay,
        nonWorkingDays: me.nonWorkingDays,
        hideNonWorkingDays: me.hideNonWorkingDays,
        sixWeeks: me.sixWeeks
      }, month);
    }
    month.ion({
      dateChange: "onMonthDateChange",
      thisObj: me
    });
    return month;
  }
  onMonthDateChange({ source: month, newDate, oldDate, changes }) {
    const me = this;
    me.year = month.year;
    if (!me.isConfiguring) {
      if (!me.getCell(newDate) || (changes.m || changes.y)) {
        const { isVisible } = me;
        me.refresh();
        if (me.animateTimeShift && isVisible) {
          DomHelper.slideIn(me.contentElement, newDate > oldDate ? 1 : -1);
        }
      }
      me.trigger("dateChange", {
        changes,
        value: newDate,
        oldValue: oldDate
      });
    }
  }
  updateYear(year) {
    this.month.year = year;
  }
  updateShowWeekNumber(showWeekNumber) {
    this.updateShowWeekColumn(showWeekNumber);
  }
  updateShowWeekColumn(showWeekColumn) {
    const me = this;
    me.element.classList[showWeekColumn ? "add" : "remove"]("b-show-week-column");
    if (me.floating) {
      if (!me.isAligning) {
        me.realign();
      }
    }
  }
  updateSixWeeks(sixWeeks) {
    if (this.month) {
      this.month.sixWeeks = sixWeeks;
      this.refresh();
    }
  }
  /**
   * Refreshes the UI after changing a config that would affect the UI.
   */
  refresh() {
    this.doRefresh();
  }
  /**
   * Implementation of the UI refresh.
   * @private
   */
  doRefresh() {
    var _a;
    this.getConfig("element");
    const me = this, timeZone = me.timeZone != null ? me.timeZone : (_a = me.project) == null ? void 0 : _a.timeZone, today = timeZone != null ? TimeZoneHelper.toTimeZone(/* @__PURE__ */ new Date(), timeZone) : /* @__PURE__ */ new Date(), {
      weekElements,
      weekDayElements,
      date,
      month,
      dayCellCls,
      dayHeaderCls,
      disabledCls,
      otherMonthCls,
      weekendCls,
      todayCls,
      nonWorkingDayCls,
      nonWorkingDays,
      canonicalDayNumbers,
      sixWeeks
    } = me;
    today.setHours(0, 0, 0, 0);
    if (!date) {
      me.date = today;
      return;
    }
    me.element.style.setProperty("--visible-week-count", month.weekCount);
    me.trigger("beforeRefresh");
    me.getConfig("dayNameFormat");
    for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
      const cell = me.weekdayCells[columnIndex], cellDay = me.canonicalDayNumbers[columnIndex], cellClassList = {
        [dayHeaderCls]: 1,
        [weekendCls]: DateHelper.weekends[cellDay],
        [nonWorkingDayCls]: nonWorkingDays[cellDay]
      };
      if (me.headerRenderer) {
        cell.innerHTML = "";
        me.callback(me.headerRenderer, me, [cell, columnIndex, cellDay]);
      } else {
        DomHelper.setInnerText(cell, me.shortDayNames[cellDay]);
      }
      DomHelper.syncClassList(cell, cellClassList);
      cell.dataset.columnIndex = columnIndex;
      cell.dataset.cellDay = cellDay;
    }
    let rowIndex = 0, cellIndex = 0, lastWorkingColumn = 6;
    for (let columnIndex = 6; columnIndex >= 0; columnIndex--) {
      if (!nonWorkingDays[canonicalDayNumbers[columnIndex]]) {
        lastWorkingColumn = columnIndex;
        break;
      }
    }
    weekElements[4].classList.toggle("b-hide-display", month.weekCount < 5 && !sixWeeks);
    weekElements[5].classList.toggle("b-hide-display", month.weekCount < 6 && !sixWeeks);
    month.eachWeek((week, dates) => {
      const weekDayElement = weekDayElements[rowIndex], weekCells = [weekDayElement.previousSibling, ...weekDayElement.children];
      weekElements[rowIndex].dataset.week = `${week[0]},${week[1]}`;
      if (me.weekRenderer) {
        me.callback(me.weekRenderer, me, [weekCells[0], week]);
      } else {
        weekCells[0].innerText = week[1];
      }
      for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
        const date2 = dates[columnIndex], day = date2.getDay(), key = DateHelper.makeKey(date2), isNonWorking = nonWorkingDays[day], cell = weekCells[columnIndex + 1], cellClassList = {
          [dayCellCls]: 1,
          [disabledCls]: me.isDisabledDate(date2),
          [otherMonthCls]: date2.getMonth() !== month.month,
          [weekendCls]: DateHelper.weekends[day],
          [todayCls]: date2.getTime() === today.getTime(),
          [nonWorkingDayCls]: isNonWorking,
          "b-last-working-day": columnIndex === lastWorkingColumn,
          "b-first-visible-cell": !(date2 - (me.firstVisibleDate || -1)),
          "b-last-visible-cell": !(date2 - (me.lastVisibleDate || -1)),
          [`b-day-of-week-${day}`]: 1
        };
        DomHelper.syncClassList(cell, cellClassList);
        cell.dataset.date = key;
        cell.dataset.cellIndex = cellIndex;
        cell.dataset.columnIndex = columnIndex;
        if (cell.lastDomConfig) {
          delete cell.lastDomConfig.class;
          delete cell.lastDomConfig.className;
        }
        if (me.cellRenderer) {
          me.callback(me.cellRenderer, me, [{
            cell,
            date: date2,
            day,
            row: weekElements[rowIndex],
            rowIndex,
            cellIndex,
            columnIndex,
            visibleColumnIndex: me.visibleDayColumnIndex[day],
            week,
            key
          }]);
        } else {
          cell.innerHTML = date2.getDate();
        }
        cellIndex++;
      }
      rowIndex++;
    });
    me.visibleWeekCount = rowIndex;
    if (me.floating) {
      if (!me.isAligning) {
        me.realign();
      }
    }
    me.refreshCount = (me.refreshCount || 0) + 1;
    me.trigger("refresh");
  }
  isDisabledDate(date) {
    const day = date.getDay(), {
      disabledDates,
      nonWorkingDays
    } = this;
    if (this.disableWeekends && nonWorkingDays[day]) {
      return true;
    }
    if (disabledDates) {
      if (Array.isArray(disabledDates)) {
        date = DateHelper.clearTime(date, true);
        return disabledDates.some((d) => !(DateHelper.clearTime(d, true) - date));
      } else {
        return this.callback(this.disabledDates, this, [date]);
      }
    }
  }
  get bodyConfig() {
    const result = super.bodyConfig, weeksContainerChildren = [];
    result.children = [{
      tag: "div",
      className: "b-calendar-row b-calendar-weekdays",
      reference: "weekdaysHeader",
      children: [
        { class: "b-week-number-cell" },
        ...ArrayHelper.fill(7, { class: this.dayHeaderCls }),
        DomHelper.scrollBarPadElement
      ]
    }, {
      // `notranslate` prevents google translate messing up the DOM, https://github.com/facebook/react/issues/11538
      className: "b-weeks-container notranslate",
      reference: "weeksElement",
      children: weeksContainerChildren
    }];
    for (let i = 0; i < 6; i++) {
      const weekRow = {
        className: "b-calendar-row b-calendar-week",
        dataset: {
          rowIndex: i
        },
        children: [{
          className: "b-week-number-cell"
        }, {
          className: "b-calendar-days",
          children: [{}, {}, {}, {}, {}, {}, {}],
          syncOptions: {
            ignoreRefs: true,
            strict: false
            // allow complete replacement of classes w/o matching lastDomConfig
          }
        }]
      };
      weeksContainerChildren.push(weekRow);
    }
    return result;
  }
  get firstVisibleDate() {
    if (this.hideOtherMonthCells) {
      const { year, month } = this.month;
      return new Date(year, month, 1);
    }
    for (const me = this, date = me.month.startDate; ; date.setDate(date.getDate() + 1)) {
      if (!me.hideNonWorkingDays || !me.nonWorkingDays[date.getDay()]) {
        return date;
      }
    }
  }
  get lastVisibleDate() {
    const lastDate = DateHelper.add(this.endDate, -1, "d");
    if (this.hideOtherMonthCells) {
      return lastDate;
    }
    for (const me = this, date = lastDate; ; date.setDate(date.getDate() - 1)) {
      if (!me.hideNonWorkingDays || !me.nonWorkingDays[date.getDay()]) {
        return date;
      }
    }
  }
  /**
   * Returns the cell associated with the passed date.
   *
   * To exclude dates which are outside of the panel's current month, pass the `strict` parameter as `true`
   * @param {Date|String} date The date to find the element for or a key in the format `YYYY-MM-DD`
   * @param {Boolean} strict Only return the element if this view *owns* the date.
   * @returns {HTMLElement} The cell for the passed date if it exists
   */
  getCell(date, strict) {
    if (!(typeof date === "string")) {
      date = DateHelper.makeKey(date);
    }
    const cell = this.weeksElement.querySelector(`[data-date="${date}"]`);
    if (cell && (!strict || !cell.classList.contains(this.otherMonthCls))) {
      return cell;
    }
  }
  onTipOverCell({ source: tip, target }) {
    tip.date = DateHelper.parseKey(target.dataset.date);
  }
  updateLocalization() {
    this._localeNonWorkingDays = this._localeWeekends = null;
    this.updateDayNameFormat();
    this.updateWeekStartDay(this.weekStartDay);
    super.updateLocalization();
  }
};
__publicField(CalendarPanel, "$name", "CalendarPanel");
__publicField(CalendarPanel, "type", "calendarpanel");
CalendarPanel.initClass();
CalendarPanel._$name = "CalendarPanel";

// ../Core/lib/Core/widget/YearPicker.js
var YearPicker = class extends Panel {
  construct(config) {
    super.construct({
      year: (/* @__PURE__ */ new Date()).getFullYear(),
      ...config
    });
    EventHelper.on({
      element: this.contentElement,
      click: "onYearClick",
      delegate: ".b-yearpicker-year",
      thisObj: this
    });
  }
  get focusElement() {
    return this.getYearButton(this.year) || this.getYearButton(this.startYear);
  }
  getYearButton(y) {
    return this.contentElement.querySelector(`.b-yearpicker-year[data-year="${y}"]`);
  }
  /**
   * The currently selected year.
   * @member {Number} value
   */
  get value() {
    return this.year;
  }
  set value(year) {
    this.year = year;
  }
  onYearClick({ target }) {
    const clickedYear = Math.min(Math.max(parseInt(target.innerText), this.minYear || 1), this.maxYear || 9999);
    if (this.year === clickedYear) {
      this.trigger("select", { oldValue: clickedYear, value: clickedYear });
    } else {
      this.year = clickedYear;
    }
  }
  handleTitleClick(e) {
    this.trigger("titleClick", e);
  }
  previous() {
    this.startYear = this.startYear - this.yearButtonCount;
  }
  next() {
    this.startYear = this.endYear + 1;
  }
  ingestYear(year) {
    if (!isNaN(year)) {
      return ObjectHelper.isDate(year) ? year.getFullYear() : year;
    }
  }
  changeYear(year) {
    if (year = this.ingestYear(year)) {
      return Math.min(Math.max(year, this.minYear || 1), this.maxYear || 9999);
    }
  }
  updateYear(year, oldValue) {
    const me = this;
    if (!me.startYear || year > me.endYear) {
      me.startYear = year;
    } else if (year < me.startYear) {
      me.startYear = year - (me.yearButtonCount - 1);
    }
    if (!me.isConfiguring) {
      me.trigger("select", { oldValue, value: year });
    }
  }
  /**
   * The ending year displayed in the widget.
   * @member {Number} endYear
   * @readonly
   */
  get endYear() {
    return this.startYear + this.yearButtonCount - 1;
  }
  changeStartYear(startYear) {
    if (startYear = this.ingestYear(startYear)) {
      startYear = this.minYear ? Math.max(startYear, this.minYear) : startYear;
      return this.maxYear ? Math.min(startYear, this.maxYear - (this.yearButtonCount - 1)) : startYear;
    }
  }
  async updateStartYear(startYear, oldStartYear) {
    if (this.isVisible) {
      DomHelper.slideIn(this.contentElement, Math.sign(startYear - oldStartYear));
    }
  }
  composeBody() {
    this.getConfig("year");
    const { startYear } = this, result = super.composeBody(), children = result.children[this.tbar ? 1 : 0].children = [];
    this.widgetMap.title.text = `${`000${startYear}`.slice(-4)} - ${`000${this.endYear}`.slice(-4)}`;
    for (let i = 0, y = startYear; i < this.yearButtonCount; i++, y++) {
      children.push({
        tag: "button",
        dataset: {
          year: y
        },
        class: {
          "b-yearpicker-year": 1,
          "b-selected": y === this.year
        },
        text: `000${y}`.slice(-4)
      });
    }
    return result;
  }
};
__publicField(YearPicker, "$name", "YearPicker");
__publicField(YearPicker, "type", "yearpicker");
__publicField(YearPicker, "configurable", {
  textContent: false,
  /**
   * The definition of the top toolbar which displays the title and "previous" and
   * "next" buttons.
   *
   * This contains the following predefined `items` which may be reconfigured by
   * application code:
   *
   * - `title` A widget which displays the visible year range. Weight 100.
   * - `previous` A button which navigates to the previous block. Weight 200.
   * - `next` A button which navigates to the next block. Weight 300.
   *
   * These may be reordered:
   *
   * ```javascript
   * new YearPicker({
   *     appendTo : targetElement,
   *     tbar     : {
   *         items : {
   *             // Move title to centre
   *             title : {
   *                 weight : 250
   *             }
   *         }
   *     },
   *     width    : '24em'
   * });
   * ```
   * @config {ToolbarConfig}
   */
  tbar: {
    overflow: null,
    items: {
      previous: {
        type: "tool",
        cls: "b-icon b-icon-previous",
        onAction: "up.previous",
        weight: 100
      },
      title: {
        type: "button",
        cls: "b-yearpicker-title",
        weight: 200,
        onAction: "up.handleTitleClick"
      },
      next: {
        type: "tool",
        cls: "b-icon b-icon-next",
        onAction: "up.next",
        weight: 300
      }
    }
  },
  itemCls: "b-year-container",
  /**
   * The number of clickable year buttons to display in the widget.
   *
   * It may be useful to change this if a non-standard shape or size is used.
   * @config {Number}
   * @default
   */
  yearButtonCount: 12,
  /**
   * The currently selected year.
   * @member {Number} year
   */
  /**
   * The year to use as the selected year. Defaults to the current year.
   * @config {Number}
   */
  year: null,
  /**
   * The lowest year to allow.
   * @config {Number}
   */
  minYear: null,
  /**
   * The highest year to allow.
   * @config {Number}
   */
  maxYear: null,
  /**
   * The starting year displayed in the widget.
   * @member {Number} startYear
   */
  /**
   * The year to show at the start of the widget
   * @config {Number}
   */
  startYear: null
});
YearPicker.initClass();
YearPicker._$name = "YearPicker";

// ../Core/lib/Core/widget/DisplayField.js
var DisplayField = class extends TextField {
  static get configurable() {
    return {
      readOnly: true,
      editable: false,
      cls: "b-display-field",
      /**
       * A template string used to render the value of this field. Please note you are responsible for encoding
       * any strings protecting against XSS.
       *
       * ```javascript
       * new DisplayField({
       *     appendTo : document.body,
       *     name     : 'age',
       *     label    : 'Age',
       *     template : data => `${data.value} years old`
       * })
       * ```
       * @config {Function}
       * @param {ContainerItemConfig} fieldConfig Configuration object for the field
       * @returns {DomConfig|String|null}
       */
      template: null,
      ariaElement: "displayElement"
    };
  }
  get focusElement() {
  }
  changeReadOnly() {
    return true;
  }
  changeEditable() {
    return false;
  }
  get inputElement() {
    return {
      tag: "span",
      id: `${this.id}-input`,
      reference: "displayElement",
      html: this.template ? this.template(this.value) : StringHelper.encodeHtml(this.value)
    };
  }
};
__publicField(DisplayField, "$name", "DisplayField");
__publicField(DisplayField, "type", "displayfield");
__publicField(DisplayField, "alias", "display");
DisplayField.initClass();
DisplayField._$name = "DisplayField";

// ../Core/lib/Core/widget/DatePicker.js
var generateMonthNames = () => DateHelper.getMonthNames().map((m, i) => [i, m]);
var dateSort = (lhs, rhs) => lhs.valueOf() - rhs.valueOf();
var emptyArray = Object.freeze([]);
var ReadOnlyCombo = class extends Combo {
  static get $name() {
    return "ReadOnlyCombo";
  }
  static get type() {
    return "readonlycombo";
  }
  static get configurable() {
    return {
      editable: false,
      inputAttributes: {
        tag: "div",
        tabIndex: -1
      },
      inputValueAttr: "innerHTML",
      highlightExternalChange: false,
      monitorResize: false,
      triggers: {
        expand: false
      },
      picker: {
        align: {
          align: "t-b",
          axisLock: true,
          matchSize: false
        },
        cls: "b-readonly-combo-list",
        scrollable: {
          overflowX: false
        }
      }
    };
  }
};
ReadOnlyCombo.initClass();
var DatePicker = class extends CalendarPanel {
  static get delayable() {
    return {
      refresh: "raf"
    };
  }
  static get configurable() {
    return {
      /**
       * The date that the user has navigated to using the UI *prior* to setting the widget's
       * value by selecting. The initial default is today's date.
       *
       * This may be changed using keyboard navigation. The {@link Core.widget.CalendarPanel#property-date} is set
       * by pressing `ENTER` when the desired date is reached.
       *
       * Programmatically setting the {@link Core.widget.CalendarPanel#config-date}, or using the UI to select the date
       * by clicking it also sets the `activeDate`
       * @config {Date}
       */
      activeDate: {
        value: /* @__PURE__ */ new Date(),
        $config: {
          equal: "date"
        }
      },
      focusable: true,
      textContent: false,
      tbar: {
        overflow: null,
        items: {
          prevYear: {
            cls: "b-icon b-icon-first",
            onAction: "up.gotoPrevYear",
            tooltip: "L{DatePicker.gotoPrevYear}"
          },
          prevMonth: {
            cls: "b-icon b-icon-previous",
            onAction: "up.gotoPrevMonth",
            tooltip: "L{DatePicker.gotoPrevMonth}"
          },
          fields: {
            type: "container",
            cls: "b-datepicker-title",
            items: {
              monthField: {
                type: "readonlycombo",
                cls: "b-datepicker-monthfield",
                items: generateMonthNames(),
                internalListeners: {
                  select: "up.onMonthPicked"
                }
              },
              yearButton: {
                type: "button",
                cls: "b-datepicker-yearbutton",
                internalListeners: {
                  click: "up.onYearPickerRequested"
                }
              }
            }
          },
          nextMonth: {
            cls: "b-icon b-icon-next",
            onAction: "up.gotoNextMonth",
            tooltip: "L{DatePicker.gotoNextMonth}"
          },
          nextYear: {
            cls: "b-icon b-icon-last",
            onAction: "up.gotoNextYear",
            tooltip: "L{DatePicker.gotoNextYear}"
          }
        }
      },
      yearPicker: {
        value: {
          type: "YearPicker",
          yearButtonCount: 16,
          trapFocus: true,
          positioned: true,
          hidden: true,
          internalListeners: {
            titleClick: "up.onYearPickerTitleClick",
            select: "up.onYearPicked"
          }
        },
        $config: "lazy"
      },
      /**
       * The initially selected date.
       * @config {Date}
       */
      date: null,
      /**
       * The minimum selectable date. Selection of and navigation to dates prior
       * to this date will not be possible.
       * @config {Date}
       */
      minDate: {
        value: null,
        $config: {
          equal: "date"
        }
      },
      /**
       * The maximum selectable date. Selection of and navigation to dates after
       * this date will not be possible.
       * @config {Date}
       */
      maxDate: {
        value: null,
        $config: {
          equal: "date"
        }
      },
      /**
       * By default, disabled dates cannot be navigated to, and they are skipped over
       * during keyboard navigation. Configure this as `true` to enable navigation to
       * disabled dates.
       * @config {Boolean}
       * @default
       */
      focusDisabledDates: null,
      /**
       * Configure as `true` to enable selecting multiple discontiguous date ranges using
       * click and Shift+click to create ranges and Ctrl+click to select/deselect individual dates.
       *
       * Configure as `'range'` to enable selecting a single date range by selecting a
       * start and end date. Hold "SHIFT" button to select date range. Ctrl+click may add
       * or remove dates to/from either end of the range.
       * @config {Boolean|'range'}
       * @default
       */
      multiSelect: false,
      /**
       * If {@link #config-multiSelect} is configured as `true`, this is an array of dates
       * which are selected. There may be multiple, discontiguous date ranges.
       *
       * If {@link #config-multiSelect} is configured as `'range'`, this is a two element array
       * specifying the first and last selected dates in a range.
       * @config {Date[]}
       */
      selection: {
        $config: {
          equal: (v1, v2) => v1 && v1.equals(v2)
        },
        value: null
      },
      /**
       * By default, the month and year are editable. Configure this as `false` to prevent that.
       * @config {Boolean}
       * @default
       */
      editMonth: true,
      /**
       * The {@link Core.helper.DateHelper} format string to format the day names.
       * @config {String}
       * @default
       */
      dayNameFormat: "dd",
      trapFocus: true,
      role: "grid",
      focusDescendant: true,
      /**
       * By default, when the {@link #property-date} changes, the UI will only refresh
       * if it doesn't contain a cell for that date, so as to keep a stable UI when
       * navigating.
       *
       * Configure this as `true` to refresh the UI whenever the month changes, even if
       * the UI already shows that date.
       * @config {Boolean}
       * @internal
       */
      alwaysRefreshOnMonthChange: null
    };
  }
  static get prototypeProperties() {
    return {
      /**
       * The class name to add to the calendar cell whose date which is outside of the
       * {@link #config-minDate}/{@link #config-maxDate} range.
       * @config {String}
       * @private
       */
      outOfRangeCls: "b-out-of-range",
      /**
       * The class name to add to the currently focused calendar cell.
       * @config {String}
       * @private
       */
      activeCls: "b-active-date",
      /**
       * The class name to add to selected calendar cells.
       * @config {String}
       * @private
       */
      selectedCls: "b-selected-date"
    };
  }
  // region Init
  construct(config) {
    const me = this;
    super.construct(config);
    me.externalCellRenderer = me.cellRenderer;
    me.cellRenderer = me.internalCellRenderer;
    me.element.setAttribute("aria-activedescendant", `${me.id}-active-day`);
    me.weeksElement.setAttribute("role", "grid");
    me.weekElements.forEach((w) => w.setAttribute("role", "row"));
    me.element.setAttribute("ariaLabelledBy", me.widgetMap.fields.id);
    EventHelper.on({
      element: me.weeksElement,
      click: {
        handler: "onCellClick",
        delegate: `.${me.dayCellCls}:not(.${me.disabledCls}):not(.${me.outOfRangeCls})`
      },
      mousedown: {
        handler: "onCellMousedown",
        delegate: `.${me.dayCellCls}`
      },
      thisObj: me
    });
    me.widgetMap.monthField.readOnly = me.widgetMap.yearButton.disabled = !me.editMonth;
    me.refresh.flush();
  }
  afterHide() {
    var _a;
    (_a = this._yearPicker) == null ? void 0 : _a.hide();
    super.afterHide(...arguments);
  }
  doDestroy() {
    var _a, _b;
    (_a = this.yearButton) == null ? void 0 : _a.destroy();
    (_b = this.monthField) == null ? void 0 : _b.destroy();
    super.doDestroy();
  }
  // endregion
  get focusElement() {
    return this.weeksElement.querySelector(`.${this.dayCellCls}[tabIndex="0"]`);
  }
  doRefresh() {
    const me = this, { date } = me, oldActiveCell = me.focusElement, activeDate = DateHelper.betweenLesser(me.activeDate, me.month.startDate, me.month.endDate) ? me.activeDate : me._activeDate = date;
    me.getConfig("tbar");
    super.doRefresh(...arguments);
    me.widgetMap.monthField.value = date.getMonth();
    me.widgetMap.yearButton.text = date.getFullYear();
    const dateOfOldActiveCell = DateHelper.parseKey(oldActiveCell == null ? void 0 : oldActiveCell.dataset.date);
    if (activeDate - dateOfOldActiveCell) {
      me.syncActiveDate(activeDate, dateOfOldActiveCell);
    }
  }
  internalCellRenderer({ cell, date }) {
    const me = this, {
      activeCls,
      selectedCls,
      externalCellRenderer
    } = me, isSelected = me.isSelectedDate(date), cellClassList = {
      [activeCls]: activeCls && me.isActiveDate(date),
      [selectedCls]: isSelected,
      [me.outOfRangeCls]: me.minDate && date < me.minDate || me.maxDate && date > me.maxDate
    };
    if (isSelected) {
      if (me.multiSelect) {
        const isStart = !me.isSelectedDate(DateHelper.add(date, -1, "d")), isEnd = !me.isSelectedDate(DateHelper.add(date, 1, "d"));
        cellClassList["b-range-start"] = isStart;
        cellClassList["b-range-end"] = isEnd;
        cellClassList["b-in-range"] = !isStart && !isEnd;
      }
    }
    DomHelper.updateClassList(cell, cellClassList);
    cell.innerHTML = `<div class="b-datepicker-cell-inner">${date.getDate()}</div>`;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", DateHelper.format(date, "MMMM D, YYYY"));
    if (me.isActiveDate(date)) {
      cell.id = `${me.id}-active-day`;
    } else {
      cell.removeAttribute("id");
    }
    if (externalCellRenderer) {
      arguments[0].cell = cell.firstChild;
      me.callback(externalCellRenderer, this, arguments);
    }
  }
  onCellMousedown(event) {
    const cell = event.target.closest("[data-date]");
    cell.focus();
    if (DomHelper.getActiveElement(cell) === cell) {
      event.preventDefault();
    }
    this.activeDate = DateHelper.parseKey(cell.dataset.date);
  }
  onCellClick(event) {
    const cell = event.target.closest("[data-date]");
    this.onUIDateSelect(DateHelper.parseKey(cell.dataset.date), event);
  }
  /**
   * Called when the user uses the UI to select the current activeDate. So ENTER when focused
   * or clicking a date cell.
   * @param {Date} date The active date to select
   * @param {Event} event the instigating event, either a `click` event or a `keydown` event.
   * @internal
   */
  onUIDateSelect(date, event) {
    const me = this, {
      lastClickedDate,
      multiSelect
    } = me;
    me.lastClickedDate = date;
    if (!me.isDisabledDate(date)) {
      me.activatingEvent = event;
      if (multiSelect) {
        me.handleMultiSelect(lastClickedDate, date, event);
      } else {
        me.selection = date;
        if (me.floating) {
          me.hide();
        }
      }
      me.activatingEvent = null;
    }
  }
  // Calls updateSelection if the selection is mutated
  handleMultiSelect(lastClickedDate, date, event) {
    const me = this, {
      multiSelect
    } = me, _selection = me._selection || (me._selection = new DateSet()), selection = _selection.dates, singleRange = multiSelect === "range", {
      size,
      generation
    } = _selection, rangeEnds = size && {
      [DateHelper.makeKey(DateHelper.add(selection[0], -1, "d"))]: 1,
      [DateHelper.makeKey(selection[0])]: 1,
      [DateHelper.makeKey(selection[selection.length - 1])]: 1,
      [DateHelper.makeKey(DateHelper.add(selection[selection.length - 1], 1, "d"))]: 1
    }, isSelected = _selection.has(date), toggleFn = isSelected ? "delete" : "add";
    const clickedRangeEnd = singleRange && (rangeEnds == null ? void 0 : rangeEnds[DateHelper.makeKey(date)]);
    if (event.ctrlKey) {
      if (multiSelect === true || !size || clickedRangeEnd) {
        _selection[toggleFn](date);
        if (singleRange && !_selection.has(me.rangeStartDate)) {
          me.rangeStartDate.setDate(me.rangeStartDate.getDate() + (date < selection[1] ? 1 : -1));
        }
      }
    } else if (event.shiftKey && size) {
      const [start, end] = [
        new Date(singleRange ? me.rangeStartDate || (me.rangeStartDate = selection[0]) : lastClickedDate),
        date
      ].sort(dateSort);
      if (singleRange) {
        _selection.clear();
      }
      for (const d = start; d <= end; d.setDate(d.getDate() + 1)) {
        _selection.add(d);
      }
    } else if (!(_selection.has(date) && _selection.size === 1)) {
      _selection.clear();
      _selection.add(date);
    }
    const newSize = _selection.size;
    if (newSize === 1) {
      me.rangeStartDate = date;
    } else if (!newSize) {
      me.rangeStartDate = null;
    }
    if (_selection.generation !== generation) {
      me.updateSelection(_selection);
    }
  }
  changeSelection(selection) {
    const me = this;
    let result, rangeStartDate;
    if (selection) {
      if (!selection.forEach) {
        selection = [selection];
      }
      selection.forEach((d, i) => selection[i] = me.changeDate(d));
      rangeStartDate = selection[0];
      selection.sort(dateSort);
      if (me.multiSelect === "range" && selection.length === 2) {
        result = new DateSet();
        for (const d = new Date(selection[0]); d <= selection[1]; d.setDate(d.getDate() + 1)) {
          result.add(d);
        }
      } else {
        rangeStartDate = selection[0];
        result = new DateSet(selection);
      }
    } else {
      result = new DateSet();
    }
    if (rangeStartDate) {
      me.activeDate = me.rangeStartDate = DateHelper.clearTime(rangeStartDate);
    }
    return result;
  }
  updateMultiSelect(multiSelect) {
    this.element.classList.toggle("b-multiselect", Boolean(multiSelect));
    if (!multiSelect) {
      this.selection = [...this.selection][0];
    }
  }
  updateSelection(dateSet) {
    const me = this, { dates } = dateSet, selection = me.multiSelect === "range" ? [dates[0], dates[dates.length - 1]] : dates;
    dates.length && (me.date = dates[0]);
    if (!me.isConfiguring) {
      me.refresh.now();
      me.trigger("selectionChange", {
        selection,
        userAction: Boolean(me.activatingEvent)
      });
    }
  }
  /**
   * The selected Date(s).
   *
   * When {@link #config-multiSelect} is `'range'`, then this yields a two element array
   * representing the start and end of the selected range.
   *
   * When {@link #config-multiSelect} is `true`, this yields an array containing every selected
   * Date.
   * @member {Date[]} selection
   */
  get selection() {
    const { _selection } = this, dates = _selection ? _selection.dates : emptyArray;
    return this.multiSelect === "range" && dates.length ? [dates[0], dates[dates.length - 1]] : dates;
  }
  onInternalKeyDown(keyEvent) {
    const me = this, keyName = keyEvent.key.trim() || keyEvent.code, activeDate = me.activeDate;
    let newDate = new Date(activeDate);
    if (keyName === "Escape" && me.floating) {
      return me.hide();
    }
    if (activeDate && me.weeksElement.contains(keyEvent.target)) {
      do {
        switch (keyName) {
          case "ArrowLeft":
            keyEvent.preventDefault();
            if (keyEvent.ctrlKey) {
              newDate = me.gotoPrevMonth();
            } else {
              newDate.setDate(newDate.getDate() - 1);
            }
            break;
          case "ArrowUp":
            keyEvent.preventDefault();
            newDate.setDate(newDate.getDate() - 7);
            break;
          case "ArrowRight":
            keyEvent.preventDefault();
            if (keyEvent.ctrlKey) {
              newDate = me.gotoNextMonth();
            } else {
              newDate.setDate(newDate.getDate() + 1);
            }
            break;
          case "ArrowDown":
            keyEvent.preventDefault();
            newDate.setDate(newDate.getDate() + 7);
            break;
          case "Enter":
            return me.onUIDateSelect(activeDate, keyEvent);
        }
      } while (me.isDisabledDate(newDate) && !me.focusDisabledDates);
      if (me.minDate && newDate < me.minDate) {
        return;
      }
      if (me.maxDate && newDate > me.maxDate) {
        return;
      }
      me.activeDate = newDate;
    }
  }
  changeMinDate(minDate) {
    return minDate && CalendarPanel.prototype.changeDate.apply(this, arguments);
  }
  updateMinDate(minDate) {
    this._yearpicker && (this._yearpicker.minYear = minDate == null ? void 0 : minDate.getFullYear());
    this.refresh();
  }
  changeMaxDate(minDate) {
    return minDate && CalendarPanel.prototype.changeDate.apply(this, arguments);
  }
  updateMaxDate(maxDate) {
    this._yearpicker && (this._yearpicker.maxYear = maxDate == null ? void 0 : maxDate.getFullYear());
    this.refresh();
  }
  changeDate(date) {
    return DateHelper.clamp(super.changeDate(date), this.minDate, this.maxDate);
  }
  updateDate(date, oldDate) {
    const me = this, { month } = me;
    me.isConfiguring && !me.initializingActiveDate && (me.selection = date);
    if (!month.date || date.getMonth() === month.month || !me.getCell(date) || me.alwaysRefreshOnMonthChange || me.isNavigating) {
      super.updateDate(date);
    } else {
      const newMonth = month.getOtherMonth(date), changes = me.eventListeners && (oldDate ? date.getDate() !== oldDate.getDate() | (newMonth.getWeekId(date) !== month.getWeekId(oldDate)) << 1 | (date.getMonth() !== (oldDate == null ? void 0 : oldDate.getMonth())) << 2 | (date.getFullYear() !== (oldDate == null ? void 0 : oldDate.getFullYear())) << 3 : 15);
      me.trigger("dateChange", {
        changes: {
          d: true,
          w: Boolean(changes & 2),
          m: Boolean(changes & 12),
          y: Boolean(changes & 8),
          r: newMonth.weekCount !== month.weekCount
        },
        value: date,
        oldValue: oldDate
      });
    }
  }
  changeActiveDate(activeDate, oldActiveDate) {
    if (this.trigger("beforeActiveDateChange", { activeDate, oldActiveDate }) === false) {
      return;
    }
    activeDate = activeDate ? this.changeDate(activeDate) : this.date || (this.date = DateHelper.clearTime(/* @__PURE__ */ new Date()));
    if (isNaN(activeDate)) {
      throw new Error("DatePicker date ingestion must be passed a Date, or a YYYY-MM-DD date string");
    }
    return DateHelper.clamp(activeDate, this.minDate, this.maxDate);
  }
  updateActiveDate(activeDate, wasActiveDate) {
    const me = this, { isConfiguring } = me;
    if (isConfiguring || !me.getCell(activeDate)) {
      me.initializingActiveDate = isConfiguring;
      me.date = activeDate;
      me.initializingActiveDate = false;
    }
    if (!isConfiguring && !me.refresh.isPending) {
      me.syncActiveDate(activeDate, wasActiveDate);
    }
  }
  syncActiveDate(activeDate, wasActiveDate) {
    const me = this, { activeCls } = me, activeCell = me.getCell(activeDate), wasActiveCell = wasActiveDate && me.getCell(wasActiveDate), activeElement = DomHelper.getActiveElement(me.element);
    activeCell.setAttribute("tabIndex", 0);
    activeCls && activeCell.classList.add(activeCls);
    activeCell.id = `${me.id}-active-day`;
    if (me.weeksElement.contains(activeElement)) {
      activeCell.focus();
    }
    if (wasActiveCell && wasActiveCell !== activeCell) {
      wasActiveCell.removeAttribute("tabIndex");
      activeCls && wasActiveCell.classList.remove(activeCls);
      wasActiveCell.removeAttribute("id");
    }
  }
  set value(value) {
    const me = this, {
      selection,
      duration
    } = me;
    if (value) {
      value = me.changeDate(value, me.value);
      if (me.multiSelect === "range" && (selection == null ? void 0 : selection.length) === 2) {
        if (!DateHelper.betweenLesserEqual(value, ...selection)) {
          if (value < selection[0]) {
            me.selection = [value, DateHelper.add(value, duration - 1, "d")];
          } else {
            me.selection = [DateHelper.add(value, -(duration - 1), "d"), value];
          }
        }
        me.date = me.activeDate = value;
        return;
      }
      if (value !== void 0) {
        me.selection = value;
      }
    } else {
      me.date = /* @__PURE__ */ new Date();
      me.selection = null;
    }
  }
  get value() {
    return this.selection[this.selection.length - 1];
  }
  get duration() {
    return this.multiSelect === "range" ? DateHelper.diff(...this.selection, "d") + 1 : 1;
  }
  gotoPrevYear() {
    return this.goto(-1, "year");
  }
  gotoPrevMonth() {
    return this.goto(-1, "month");
  }
  gotoNextMonth() {
    return this.goto(1, "month");
  }
  gotoNextYear() {
    return this.goto(1, "year");
  }
  goto(direction, unit) {
    const me = this, { activeDate } = me, activeCell = activeDate && me.getCell(activeDate);
    let newDate;
    if (unit === "month" && activeCell && (activeDate == null ? void 0 : activeDate.getMonth()) === me.month.month + direction) {
      newDate = activeDate;
    } else {
      newDate = DateHelper.add(activeCell ? activeDate : me.date, direction, unit);
    }
    const firstDateOfNewMonth = new Date(newDate);
    firstDateOfNewMonth.setDate(1);
    const lastDateOfNewMonth = DateHelper.add(DateHelper.add(firstDateOfNewMonth, 1, "month"), -1, "day");
    if (me.minDate && direction < 0 && lastDateOfNewMonth < me.minDate || me.maxDate && direction > 0 && firstDateOfNewMonth > me.maxDate) {
      return;
    }
    me.isNavigating = true;
    const result = me.date = newDate;
    if (activeCell) {
      me.activeDate = newDate;
    }
    me.isNavigating = false;
    return result;
  }
  isActiveDate(date) {
    return !(date - this.activeDate);
  }
  isSelectedDate(date) {
    var _a;
    return (_a = this._selection) == null ? void 0 : _a.has(date);
  }
  onMonthPicked({ record, userAction }) {
    var _a;
    if (userAction) {
      this.activeDate = DateHelper.add(this.activeDate, record.value - this.activeDate.getMonth(), "month");
      (_a = this.focusElement) == null ? void 0 : _a.focus();
    }
  }
  onYearPickerRequested() {
    const { yearPicker } = this;
    if (yearPicker.isVisible) {
      yearPicker.hide();
    } else {
      yearPicker.year = yearPicker.startYear = this.activeDate.getFullYear();
      yearPicker.show();
      yearPicker.focus();
    }
  }
  onYearPickerTitleClick() {
    this.yearPicker.hide();
  }
  onYearPicked({ value, source }) {
    const newDate = new Date(this.activeDate);
    newDate.setFullYear(value);
    this.activeDate = newDate;
    this.focusElement && DomHelper.focusWithoutScrolling(this.focusElement);
    source.hide();
  }
  changeYearPicker(yearPicker, oldYearPicker) {
    var _a, _b;
    return YearPicker.reconfigure(oldYearPicker, yearPicker ? YearPicker.mergeConfigs({
      owner: this,
      appendTo: this.element,
      minYear: (_a = this.minDate) == null ? void 0 : _a.getFullYear(),
      maxYear: (_b = this.maxDate) == null ? void 0 : _b.getFullYear()
    }, yearPicker) : null, this);
  }
  get childItems() {
    const { _yearPicker } = this, result = super.childItems;
    if (_yearPicker) {
      result.push(_yearPicker);
    }
    return result;
  }
  updateLocalization() {
    var _a;
    const {
      monthField
    } = this.widgetMap, newData = generateMonthNames();
    if (!this.isConfiguring && !newData.every((d, i) => d[1] === monthField.store.getAt(i).text)) {
      newData[(_a = monthField.value) != null ? _a : this.date.getMonth()].selected = true;
      monthField.items = newData;
    }
    super.updateLocalization();
  }
};
__publicField(DatePicker, "$name", "DatePicker");
__publicField(DatePicker, "type", "datepicker");
var DateSet = class _DateSet extends Set {
  add(d) {
    d = DateHelper.makeKey(d);
    if (!this.has(d)) {
      this.generation = (this.generation || 0) + 1;
    }
    return super.add(d);
  }
  delete(d) {
    d = DateHelper.makeKey(d);
    if (this.has(d)) {
      this.generation++;
    }
    return super.delete(d);
  }
  has(d) {
    return super.has(DateHelper.makeKey(d));
  }
  clear() {
    if (this.size) {
      this.generation++;
    }
    return super.clear();
  }
  equals(other) {
    Array.isArray(other) && (other = new _DateSet(other));
    return other.size === this.size && [...this].every((s) => other.has(s));
  }
  get dates() {
    return [...this].sort().map((k) => DateHelper.parseKey(k));
  }
};
DatePicker.initClass();
DatePicker._$name = "DatePicker";

// ../Core/lib/Core/widget/DateField.js
var DateField = class extends PickerField {
  static get configurable() {
    return {
      /**
       * Get / set format for date displayed in field (see {@link Core.helper.DateHelper#function-format-static}
       * for formatting options).
       * @member {String} format
       */
      /**
       * Format for date displayed in field. Defaults to using long date format, as defined by current locale (`L`)
       * @config {String}
       * @default
       */
      format: "L",
      /**
       * A flag which indicates whether the date parsing should be strict - meaning if the date
       * is missing a year/month/day part - parsing fails.
       *
       * Turned off by default, meaning default values are substituted for missing parts.
       *
       * @config {Boolean}
       * @default
       */
      strictParsing: false,
      // same for all languages
      fallbackFormat: "YYYY-MM-DD",
      timeFormat: "HH:mm:ss:SSS",
      /**
       * A flag which indicates what time should be used for selected date.
       * `false` by default which means time is reset to midnight.
       *
       * Possible options are:
       * - `false` to reset time to midnight
       * - `true` to keep original time value
       * - `'17:00'` a string which is parsed automatically
       * - `new Date(2020, 0, 1, 17)` a date object to copy time from
       * - `'entered'` to keep time value entered by user (in case {@link #config-format} includes time info)
       *
       * @config {Boolean|Date|String}
       * @default
       */
      keepTime: false,
      /**
       * Format for date in the {@link #config-picker}. Uses localized format per default
       * @config {String}
       */
      pickerFormat: null,
      /**
       * Set to true to first clear time of the field's value before comparing it to the max value
       * @internal
       * @config {Boolean}
       */
      validateDateOnly: null,
      triggers: {
        expand: {
          cls: "b-icon-calendar",
          handler: "onTriggerClick",
          weight: 200
        },
        back: {
          cls: "b-icon b-icon-angle-left b-step-trigger",
          key: "Shift+ArrowDown",
          handler: "onBackClick",
          align: "start",
          weight: 100
        },
        forward: {
          cls: "b-icon b-icon-angle-right b-step-trigger",
          key: "Shift+ArrowUp",
          handler: "onForwardClick",
          align: "end",
          weight: 100
        }
      },
      // An optional extra CSS class to add to the picker container element
      calendarContainerCls: "",
      /**
       * Get/set min value, which can be a Date or a string. If a string is specified, it will be converted using
       * the specified {@link #config-format}.
       * @member {Date} min
       * @accepts {String|Date}
       */
      /**
       * Min value
       * @config {String|Date}
       */
      min: null,
      /**
       * Get/set max value, which can be a Date or a string. If a string is specified, it will be converted using
       * the specified {@link #config-format}.
       * @member {Date} max
       * @accepts {String|Date}
       */
      /**
       * Max value
       * @config {String|Date}
       */
      max: null,
      /**
       * The `step` property may be set in object form specifying two properties, `magnitude`, a Number, and
       * `unit`, a String.
       *
       * If a Number is passed, the step's current unit is used (or `day` if no current step set) and just the
       * magnitude is changed.
       *
       * If a String is passed, it is parsed by {@link Core.helper.DateHelper#function-parseDuration-static}, for
       * example `'1d'`, `'1 d'`, `'1 day'`, or `'1 day'`.
       *
       * Upon read, the value is always returned in object form containing `magnitude` and `unit`.
       * @member {DurationConfig} step
       * @accepts {String|Number|DurationConfig}
       */
      /**
       * Time increment duration value. If specified, `forward` and `back` triggers are displayed.
       * The value is taken to be a string consisting of the numeric magnitude and the units.
       * The units may be a recognised unit abbreviation of this locale or the full local unit name.
       * For example `'1d'` or `'1w'` or `'1 week'`. This may be specified as an object containing
       * two properties: `magnitude`, a Number, and `unit`, a String
       * @config {String|Number|DurationConfig}
       */
      step: false,
      stepTriggers: null,
      /**
       * The week start day in the {@link #config-picker}, 0 meaning Sunday, 6 meaning Saturday.
       * Uses localized value per default.
       * @config {Number}
       */
      weekStartDay: null,
      /**
       * A config object used to configure the {@link Core.widget.DatePicker datePicker}.
       * ```javascript
       * dateField = new DateField({
       *      picker    : {
       *          multiSelect : true
       *      }
       *  });
       * ```
       * @config {DatePickerConfig}
       */
      picker: {
        type: "datepicker",
        role: "dialog",
        floating: true,
        scrollAction: "realign",
        align: {
          align: "t0-b0",
          axisLock: true
        }
      },
      /**
       * Get/set value, which can be set as a Date or a string but always returns a Date. If a string is
       * specified, it will be converted using the specified {@link #config-format}
       * @member {Date} value
       * @accepts {String|Date}
       */
      /**
       * Value, which can be a Date or a string. If a string is specified, it will be converted using the
       * specified {@link #config-format}
       * @config {String|Date}
       */
      value: null
    };
  }
  //endregion
  //region Init & destroy
  /**
   * Creates default picker widget
   *
   * @internal
   */
  changePicker(picker, oldPicker) {
    const me = this, defaults = {
      owner: me,
      forElement: me[me.pickerAlignElement],
      minDate: me.min,
      maxDate: me.max,
      weekStartDay: me._weekStartDay,
      // need to pass the raw value to let the component to use its default value
      align: {
        anchor: me.overlayAnchor,
        target: me[me.pickerAlignElement]
      },
      onSelectionChange: ({ selection, source: picker2 }) => {
        if (picker2.isVisible) {
          me._isUserAction = me._isPickerInput = true;
          me.value = me.value ? DateHelper.copyTimeValues(new Date(selection[0]), me.value) : new Date(selection[0]);
          me._isPickerInput = me._isUserAction = false;
          picker2.hide();
        }
      }
    };
    if (me.calendarContainerCls) {
      defaults.cls = me.calendarContainerCls;
    }
    if (me.value) {
      defaults.value = me.value;
    } else {
      defaults.activeDate = /* @__PURE__ */ new Date();
    }
    const result = DatePicker.reconfigure(oldPicker, picker, {
      owner: me,
      defaults
    });
    result == null ? void 0 : result.refresh.flush();
    return result;
  }
  //endregion
  //region Click listeners
  get backShiftDate() {
    return DateHelper.add(this.value, -1 * this._step.magnitude, this._step.unit);
  }
  onBackClick() {
    const me = this, { min } = me;
    if (!me.readOnly && me.value) {
      const newValue = me.backShiftDate;
      if (!min || min.getTime() <= newValue) {
        me._isUserAction = true;
        me.value = newValue;
        me._isUserAction = false;
      }
    }
  }
  get forwardShiftDate() {
    return DateHelper.add(this.value, this._step.magnitude, this._step.unit);
  }
  onForwardClick() {
    const me = this, { max } = me;
    if (!me.readOnly && me.value) {
      const newValue = me.forwardShiftDate;
      if (!max || max.getTime() >= newValue) {
        me._isUserAction = true;
        me.value = newValue;
        me._isUserAction = false;
      }
    }
  }
  //endregion
  //region Toggle picker
  showPicker(focusPicker) {
    if (this.readOnly) {
      return;
    }
    const me = this, { _picker } = me;
    if (_picker) {
      const pickerConfig = {
        minDate: me.min,
        maxDate: me.max
      };
      if (me.value) {
        pickerConfig.value = me.value;
      } else if (!_picker.activeDate) {
        pickerConfig.activeDate = /* @__PURE__ */ new Date();
      }
      _picker.setConfig(pickerConfig);
    }
    super.showPicker(focusPicker);
  }
  focusPicker() {
    this.picker.focus();
  }
  //endregion
  // region Validation
  get isValid() {
    const me = this;
    me.clearError("L{Field.minimumValueViolation}", true);
    me.clearError("L{Field.maximumValueViolation}", true);
    let value = me.value;
    if (value) {
      const { min, max, validateDateOnly } = me;
      if (validateDateOnly) {
        value = DateHelper.clearTime(value, false);
      }
      if (min && value < min) {
        me.setError("L{Field.minimumValueViolation}", true);
        return false;
      }
      if (max && value > max) {
        me.setError("L{Field.maximumValueViolation}", true);
        return false;
      }
    }
    return super.isValid;
  }
  //endregion
  //region Getters/setters
  transformDateValue(value, checkBounds = true) {
    const me = this;
    if (value != null) {
      if (!DateHelper.isDate(value)) {
        if (typeof value === "string") {
          value = DateHelper.parse(value, me.format, me.strictParsing) || DateHelper.parse(value, me.fallbackFormat, me.strictParsing);
        } else {
          value = new Date(value);
        }
      }
      if (DateHelper.isValidDate(value)) {
        if (checkBounds && (!me.min || value - me.min > -DateHelper.MS_PER_DAY) && (!me.max || value <= me.max)) {
          return me.transformTimeValue(value);
        }
        return value;
      }
    }
    return null;
  }
  transformTimeValue(value) {
    const me = this, { keepTime } = me;
    value = DateHelper.clone(value);
    if (!keepTime) {
      DateHelper.clearTime(value, false);
    } else if (keepTime !== "entered" && keepTime !== true) {
      const timeValue = DateHelper.parse(keepTime, me.timeFormat);
      if (DateHelper.isValidDate(timeValue)) {
        DateHelper.copyTimeValues(value, timeValue);
      } else if (DateHelper.isValidDate(me.value)) {
        DateHelper.copyTimeValues(value, me.value);
      }
    } else if (keepTime === true && (me._isPickerInput || me.inputting) && DateHelper.isValidDate(me.value)) {
      DateHelper.copyTimeValues(value, me.value);
    }
    return value;
  }
  changeMin(value) {
    return this.transformDateValue(value, false);
  }
  updateMin(min) {
    const { input, _picker } = this;
    if (input) {
      if (min == null) {
        input.removeAttribute("min");
      } else {
        input.min = min;
      }
    }
    if (_picker) {
      _picker.minDate = min;
    }
    this.syncInvalid();
  }
  changeMax(value) {
    return this.transformDateValue(value, false);
  }
  updateMax(max) {
    const { input, _picker } = this;
    if (input) {
      if (max == null) {
        input.removeAttribute("max");
      } else {
        input.max = max;
      }
    }
    if (_picker) {
      _picker.maxDate = max;
    }
    this.syncInvalid();
  }
  get weekStartDay() {
    return typeof this._weekStartDay === "number" ? this._weekStartDay : DateHelper.weekStartDay;
  }
  updateWeekStartDay(weekStartDay) {
    if (this._picker) {
      this._picker.weekStartDay = weekStartDay;
    }
  }
  changeValue(value, oldValue) {
    const me = this, newValue = me.transformDateValue(value);
    if (value && !newValue) {
      me.setError("L{invalidDate}");
      return;
    }
    me.clearError("L{invalidDate}");
    if (me.hasChanged(oldValue, newValue)) {
      return super.changeValue(newValue, oldValue);
    }
    if (!me.inputting) {
      me.syncInputFieldValue();
    }
  }
  updateValue(value, oldValue) {
    const picker = this._picker;
    if (picker && !this.inputting) {
      picker.value = picker.activeDate = value;
    }
    super.updateValue(value, oldValue);
  }
  changeStep(value, was) {
    const type = typeof value;
    if (!value) {
      return null;
    }
    if (type === "number") {
      value = {
        magnitude: Math.abs(value),
        unit: was ? was.unit : "day"
      };
    } else if (type === "string") {
      value = DateHelper.parseDuration(value);
    }
    if (value && value.unit && value.magnitude) {
      if (value.magnitude < 0) {
        value = {
          magnitude: -value.magnitude,
          // Math.abs
          unit: value.unit
        };
      }
      return value;
    }
  }
  updateStep(value) {
    this.element.classList[value ? "remove" : "add"]("b-no-steppers");
    this.syncInvalid();
  }
  hasChanged(oldValue, newValue) {
    if ((oldValue == null ? void 0 : oldValue.getTime) && (newValue == null ? void 0 : newValue.getTime) && this.keepTime !== "entered" && this.keepTime !== true) {
      return !DateHelper.isEqual(DateHelper.clearTime(oldValue), DateHelper.clearTime(newValue));
    }
    return super.hasChanged(oldValue && oldValue.getTime(), newValue && newValue.getTime());
  }
  get inputValue() {
    const date = this.value;
    return date ? DateHelper.format(date, this.format) : "";
  }
  updateFormat() {
    if (!this.isConfiguring) {
      this.syncInputFieldValue(true);
    }
  }
  //endregion
  //region Localization
  updateLocalization() {
    super.updateLocalization();
    this.syncInputFieldValue(true);
  }
  //endregion
  //region Other
  internalOnKeyEvent(event) {
    super.internalOnKeyEvent(event);
    if (event.key === "Enter" && this.isValid) {
      this.picker.hide();
    }
  }
  //endregion
};
//region Config
__publicField(DateField, "$name", "DateField");
__publicField(DateField, "type", "datefield");
__publicField(DateField, "alias", "date");
DateField.initClass();
DateField._$name = "DateField";

// ../Core/lib/Core/widget/NumberField.js
var preventDefault = (e) => e.ctrlKey && e.preventDefault();
var NumberField = class extends Field {
  static get configurable() {
    return {
      /**
       * Reset to min value when max value is reached using steppers, and vice-versa.
       * @config {Boolean}
       * @default false
       */
      wrapAround: null,
      /**
       * Min value
       * @config {Number}
       */
      min: null,
      /**
       * Max value
       * @config {Number}
       */
      max: null,
      /**
       * Step size for spin button clicks.
       * @member {Number} step
       */
      /**
       * Step size for spin button clicks. Also used when pressing up/down keys in the field.
       * @config {Number}
       * @default
       */
      step: 1,
      /**
       * Large step size, defaults to 10 * `step`. Applied when pressing SHIFT and stepping either by click or
       * using keyboard.
       * @config {Number}
       * @default 10
       */
      largeStep: 0,
      /**
       * Initial value
       * @config {Number}
       */
      value: null,
      /**
       * The format to use for rendering numbers.
       *
       * For example:
       * ```
       *  format: '9,999.00##'
       * ```
       * The above enables digit grouping and will display at least 2 (but no more than 4) fractional digits.
       * @config {String|NumberFormatConfig}
       * @default
       */
      format: "",
      /**
       * The number of decimal places to allow. Defaults to no constraint.
       *
       * This config has been replaced by {@link #config-format}. Instead of this:
       *```
       *  decimalPrecision : 3
       *```
       * Use `format`:
       *```
       *  format : '9.###'
       *```
       * To set both `decimalPrecision` and `leadingZeroes` (say to `3`), do this:
       *```
       *  format : '3>9.###'
       *```
       * @config {Number}
       * @default
       * @deprecated Since 3.1. Use {@link #config-format} instead.
       */
      decimalPrecision: null,
      /**
       * The maximum number of leading zeroes to show. Defaults to no constraint.
       *
       * This config has been replaced by {@link #config-format}. Instead of this:
       *```
       *  leadingZeros : 3
       *```
       * Use `format`:
       *```
       *  format : '3>9'
       *```
       * To set both `leadingZeroes` and `decimalPrecision` (say to `2`), do this:
       *```
       *  format : '3>9.##'
       *```
       * @config {Number}
       * @default
       * @deprecated Since 3.1. Use {@link #config-format} instead.
       */
      leadingZeroes: null,
      triggers: {
        spin: {
          type: "spintrigger"
        }
      },
      /**
       * Controls how change events are triggered when stepping the value up or down using either spinners or
       * arrow keys.
       *
       * Configure with:
       * * `true` to trigger a change event per step
       * * `false` to not trigger change while stepping. Will trigger on blur/Enter
       * * A number of milliseconds to buffer the change event, triggering when no steps are performed during that
       *   period of time.
       *
       * @config {Boolean|Number}
       * @default
       */
      changeOnSpin: true,
      // NOTE: using type="number" has several trade-offs:
      //
      // Negatives:
      //   - No access to caretPos/textSelection. This causes anomalies when replacing
      //     the input value with a formatted version of that value (the caret moves to
      //     the end of the input el on each character typed).
      //   - The above also prevents Siesta/synthetic events from mimicking typing.
      //   - Thousand separators cannot be displayed (input.value = '1,000' throws an
      //     exception).
      // Positives:
      //   - On mobile, the virtual keyboard only shows digits et al.
      //   - validity property on DOM node that handles min/max checks.
      //
      // The above may not be exhaustive, but there is not a compelling reason to
      // use type="number" except on mobile.
      /**
       * This can be set to `'number'` to enable the numeric virtual keyboard on
       * mobile devices. Doing so limits this component's ability to handle keystrokes
       * and format properly as the user types, so this is not recommended for
       * desktop applications. This will also limit similar features of automated
       * testing tools that mimic user input.
       * @config {String}
       * @default text
       */
      inputType: null
    };
  }
  //endregion
  //region Init
  construct(config) {
    super.construct(config);
    const me = this;
    me.input.addEventListener("dblclick", () => {
      me.select();
    });
    if (typeof me.changeOnSpin === "number") {
      me.bufferedSpinChange = me.buffer(me.triggerChange, me.changeOnSpin);
    }
  }
  //endregion
  //region Internal functions
  acceptValue(value, rawValue) {
    let accept = !isNaN(value);
    if (accept && !this.hasTextSelection) {
      accept = false;
      const raw = this.input.value, current = parseFloat(raw);
      if (raw !== rawValue) {
        accept = !this.acceptValue(current, raw);
      }
    }
    return accept;
  }
  okMax(value) {
    return isNaN(this.max) || value <= this.max;
  }
  okMin(value) {
    return isNaN(this.min) || value >= this.min;
  }
  internalOnKeyEvent(e) {
    if (e.type === "keydown") {
      const me = this, key = e.key;
      let block;
      if (key === "ArrowUp") {
        me.doSpinUp(e.shiftKey);
        block = true;
      } else if (key === "ArrowDown") {
        me.doSpinDown(e.shiftKey);
        block = true;
      } else if (!e.altKey && !e.ctrlKey && key && key.length === 1) {
        const after = me.getAfterValue(key), afterValue = me.formatter.parseStrict(after), accepted = afterValue === me.value || after === "-" && (isNaN(me.min) || me.min < 0);
        block = !accepted && !me.acceptValue(afterValue, after);
      }
      if (key === "Enter" && me._changedBySilentSpin) {
        me.triggerChange(e, true);
        me._changedBySilentSpin = false;
      }
      if (block) {
        e.preventDefault();
      }
    }
    super.internalOnKeyEvent(e);
  }
  doSpinUp(largeStep = false) {
    const me = this;
    if (me.readOnly) {
      return;
    }
    let newValue = (me.value || 0) + (largeStep ? me.largeStep : me.step);
    if (!me.okMin(newValue)) {
      newValue = me.min;
    }
    if (me.okMax(newValue)) {
      me.applySpinChange(newValue);
    } else if (me.wrapAround) {
      newValue = me.min;
      me.applySpinChange(newValue);
    }
  }
  doSpinDown(largeStep = false) {
    const me = this;
    if (me.readOnly) {
      return;
    }
    let newValue = (me.value || 0) - (largeStep ? me.largeStep : me.step);
    if (!me.okMax(newValue)) {
      newValue = me.max;
    }
    if (me.okMin(newValue)) {
      me.applySpinChange(newValue);
    } else if (me.wrapAround) {
      newValue = me.max;
      me.applySpinChange(newValue);
    }
  }
  applySpinChange(newValue) {
    const me = this;
    me._isUserAction = true;
    if (me.changeOnSpin !== true) {
      me._changedBySilentSpin = true;
      me.silenceChange = true;
      me.bufferedSpinChange && me.bufferedSpinChange(null, true);
    }
    me.value = newValue;
    me._isUserAction = false;
    me.silenceChange = false;
  }
  triggerChange() {
    if (!this.silenceChange) {
      super.triggerChange(...arguments);
    }
  }
  onFocusOut(e) {
    var _a, _b, _c;
    super.onFocusOut(...arguments);
    const me = this, { input } = me, raw = input.value, value = me.formatter.truncate(raw), formatted = isNaN(value) ? raw : me.formatValue(value);
    (_c = (_b = (_a = me.triggers) == null ? void 0 : _a.spin) == null ? void 0 : _b.clickRepeater) == null ? void 0 : _c.cancel();
    me.lastTouchmove = null;
    if (raw !== formatted) {
      input.value = formatted;
    }
    if (me._changedBySilentSpin) {
      me.triggerChange(e, true);
      me._changedBySilentSpin = false;
    }
  }
  internalOnInput(event) {
    const me = this, { formatter, input } = me, { parser, maximumFractionDigits } = formatter, raw = input.value, decimals = parser.decimalPlaces(raw);
    if (formatter.truncator && decimals > maximumFractionDigits) {
      let value = raw, valueDecimals;
      const trunc = formatter.truncate(raw);
      if (!isNaN(trunc)) {
        value = me.formatValue(trunc);
        valueDecimals = parser.decimalPlaces(value);
        if (valueDecimals < maximumFractionDigits) {
          value += "0".repeat(maximumFractionDigits - valueDecimals);
          valueDecimals = maximumFractionDigits;
        }
        if (valueDecimals < decimals) {
          const pos = raw.length - me.caretPos;
          input.value = value;
          me.caretPos = value.length - pos + 1;
        }
      }
    }
    super.internalOnInput(event);
  }
  formatValue(value) {
    return this.formatter.format(value);
  }
  changeFormat(format) {
    const me = this;
    if (format === "") {
      const { leadingZeroes, decimalPrecision } = me;
      format = leadingZeroes ? `${leadingZeroes}>9` : null;
      if (decimalPrecision != null) {
        format = `${format || ""}9.${"#".repeat(decimalPrecision)}`;
      } else if (format) {
        format += ".*";
      }
    }
    return format;
  }
  get formatter() {
    const me = this, format = me.format;
    let formatter = me._formatter;
    if (!formatter || me._lastFormat !== format) {
      formatter = NumberFormat.get(me._lastFormat = format);
      me._formatter = formatter;
    }
    return formatter;
  }
  //endregion
  //region Getters/Setters
  updateStep(step) {
    var _a;
    const me = this;
    me.element.classList.toggle("b-hide-spinner", !step);
    me._step = step;
    if (step && BrowserHelper.isMobile) {
      if (!me.touchMoveListener) {
        me.touchMoveListener = EventHelper.on({
          element: me.input,
          touchmove: "onInputSwipe",
          thisObj: me,
          throttled: {
            buffer: 150,
            alt: preventDefault
          }
        });
      }
    } else {
      (_a = me.touchMoveListener) == null ? void 0 : _a.call(me);
    }
  }
  onInputSwipe(e) {
    const { lastTouchmove } = this;
    if (lastTouchmove) {
      const deltaX = e.screenX - lastTouchmove.screenX, deltaY = lastTouchmove.screenY - e.screenY, delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      this[`doSpin${delta > 0 ? "Up" : "Down"}`]();
    }
    e.preventDefault();
    this.lastTouchmove = e;
  }
  changeLargeStep(largeStep) {
    return largeStep || this.step * 10;
  }
  get validity() {
    const value = this.value, validity = {};
    if (value != null) {
      validity.rangeUnderflow = !this.okMin(value);
      validity.rangeOverflow = !this.okMax(value);
    }
    validity.valid = !validity.rangeUnderflow && !validity.rangeOverflow;
    return validity;
  }
  /**
   * Get/set the NumberField's value, or `undefined` if the input field is empty
   * @property {Number}
   */
  changeValue(value, was) {
    const me = this;
    if (value || value === 0) {
      let valueIsNaN;
      if (typeof value !== "number") {
        value = typeof value === "string" ? me.formatter.parse(value) : Number(value);
        valueIsNaN = isNaN(value);
        if (valueIsNaN) {
          value = "";
        }
      }
      if (!valueIsNaN && me.format) {
        value = me.formatter.round(value);
      }
    } else {
      value = void 0;
    }
    return super.changeValue(value, was);
  }
  get inputValue() {
    let value = this.value;
    if (value != null && this.format) {
      value = this.formatValue(value);
    }
    return value;
  }
  //endregion
};
//region Config
__publicField(NumberField, "$name", "NumberField");
__publicField(NumberField, "type", "numberfield");
__publicField(NumberField, "alias", "number");
NumberField.initClass();
NumberField._$name = "NumberField";

// ../Core/lib/Core/widget/TimePicker.js
var TimePicker = class extends Panel {
  //endregion
  //region Init
  construct(config) {
    super.construct(config);
    this.refresh();
  }
  updateSeconds(seconds) {
    this.widgetMap.second[seconds ? "show" : "hide"]();
  }
  //endregion
  //region Event listeners
  // Automatically called by Widget's triggerFieldChange which announces changes to all ancestors
  onFieldChange() {
    if (!this.isConfiguring && !this.isRefreshing) {
      this.value = this.pickerToTime();
    }
  }
  onAmPmButtonClick({ source }) {
    this._pm = source.ref === "pmButton";
    if (this._value) {
      this.value = this.pickerToTime();
    }
  }
  onInternalKeyDown(keyEvent) {
    var _a;
    const me = this;
    switch (keyEvent.key) {
      case "Escape":
        me.triggerTimeChange(me._initialValue);
        me.hide();
        keyEvent.preventDefault();
        return;
      case "Enter":
        me.value = me.pickerToTime();
        me.hide();
        keyEvent.preventDefault();
        return;
    }
    (_a = super.onInternalKeyDown) == null ? void 0 : _a.call(this, keyEvent);
  }
  //endregion
  //region Internal functions
  pickerToTime() {
    const me = this, pm = me._pm, { hour, minute, second } = me.widgetMap;
    hour.format = me._is24Hour ? "2>9" : null;
    let hours = hour.value, newValue = new Date(me.value);
    if (!me._is24Hour) {
      if (pm && hours < 12)
        hours = hours + 12;
      if (!pm && hours === 12)
        hours = 0;
    }
    newValue.setHours(hours);
    newValue.setMinutes(minute.value);
    if (me.seconds) {
      newValue.setSeconds(second.value);
    }
    if (me._min) {
      newValue = DateHelper.max(me._min, newValue);
    }
    if (me._max) {
      newValue = DateHelper.min(me._max, newValue);
    }
    return newValue;
  }
  triggerTimeChange(time) {
    this.trigger("timeChange", { time });
  }
  //endregion
  //region Getters / Setters
  updateInitialValue(initialValue) {
    this.value = initialValue;
  }
  changeValue(value) {
    if (value) {
      value = typeof value === "string" ? DateHelper.parse(value, this.format) : value;
    }
    if (!this.isVisible) {
      this._initialValue = value;
    }
    return value != null ? value : DateHelper.getTime(0);
  }
  updateValue(value) {
    if (this.isVisible) {
      this.triggerTimeChange(value);
    }
    this.refresh();
  }
  updateFormat(format) {
    this._is24Hour = DateHelper.is24HourFormat(format);
    this.refresh();
  }
  changeMin(min) {
    return typeof min === "string" ? DateHelper.parse(min, this.format) : min;
  }
  changeMax(max) {
    return typeof max === "string" ? DateHelper.parse(max, this.format) : max;
  }
  //endregion
  //region Display
  refresh() {
    const me = this;
    if (!me.isConfiguring && me.value) {
      me.isRefreshing = true;
      const { hour, minute, second, amButton, pmButton } = me.widgetMap, time = me.value, is24 = me._is24Hour, hours = time.getHours(), pm = me._pm = hours >= 12;
      me.element.classList[is24 ? "add" : "remove"]("b-24h");
      hour.min = is24 ? 0 : 1;
      hour.max = is24 ? 23 : 12;
      hour.value = is24 ? hours : hours % 12 || 12;
      minute.value = time.getMinutes();
      second.value = time.getSeconds();
      amButton.pressed = !pm;
      pmButton.pressed = pm;
      amButton.hidden = pmButton.hidden = is24;
      me.isRefreshing = false;
    }
  }
  //endregion
};
//region Config
__publicField(TimePicker, "$name", "TimePicker");
__publicField(TimePicker, "type", "timepicker");
__publicField(TimePicker, "configurable", {
  floating: true,
  layout: "hbox",
  items: {
    hour: {
      label: "L{TimePicker.hour}",
      type: "number",
      min: 0,
      max: 23,
      highlightExternalChange: false,
      format: "2>9",
      wrapAround: true
    },
    minute: {
      label: "L{TimePicker.minute}",
      type: "number",
      min: 0,
      max: 59,
      highlightExternalChange: false,
      format: "2>9",
      wrapAround: true
    },
    second: {
      hidden: true,
      label: "L{TimePicker.second}",
      type: "number",
      min: 0,
      max: 59,
      highlightExternalChange: false,
      format: "2>9",
      wrapAround: true
    },
    amPm: {
      type: "buttongroup",
      items: {
        amButton: {
          type: "button",
          text: "AM",
          toggleGroup: "am-pm",
          cls: "b-blue",
          onClick: "up.onAmPmButtonClick"
        },
        pmButton: {
          type: "button",
          text: "PM",
          toggleGroup: "am-pm",
          cls: "b-blue",
          onClick: "up.onAmPmButtonClick"
        }
      }
    }
  },
  autoShow: false,
  trapFocus: true,
  /**
   * By default the seconds field is not displayed. If you require seconds to be visible,
   * configure this as `true`
   * @config {Boolean}
   * @default false
   */
  seconds: null,
  /**
   * Time value, which can be a Date or a string. If a string is specified, it will be converted using the
   * specified {@link #config-format}
   * @prp {Date}
   * @accepts {Date|String}
   */
  value: {
    $config: {
      equal: "date"
    },
    value: null
  },
  /**
   * Time format. Used to set appropriate 12/24 hour format to display.
   * See {@link Core.helper.DateHelper#function-format-static DateHelper} for formatting options.
   * @prp {String}
   */
  format: null,
  /**
   * Max value, which can be a Date or a string. If a string is specified, it will be converted using the
   * specified {@link #config-format}
   * @prp {Date}
   * @accepts {Date|String}
   */
  max: null,
  /**
   * Min value, which can be a Date or a string. If a string is specified, it will be converted using the
   * specified {@link #config-format}
   * @prp {Date}
   * @accepts {Date|String}
   */
  min: null,
  /**
   * Initial value, which can be a Date or a string. If a string is specified, it will be converted using the
   * specified {@link #config-format}. Initial value is restored on Escape click
   * @member {Date} initialValue
   * @accepts {Date|String}
   */
  initialValue: null
  // Not documented as config on purpose, API was that way
});
TimePicker.initClass();
TimePicker._$name = "TimePicker";

// ../Core/lib/Core/widget/TimeField.js
var TimeField = class extends PickerField {
  static get configurable() {
    return {
      picker: {
        type: "timepicker",
        align: {
          align: "t0-b0",
          axisLock: true
        }
      },
      /**
       * Get/Set format for time displayed in field (see {@link Core.helper.DateHelper#function-format-static}
       * for formatting options).
       * @member {String} format
       */
      /**
       * Format for date displayed in field (see Core.helper.DateHelper#function-format-static for formatting
       * options).
       * @config {String}
       * @default
       */
      format: "LT",
      triggers: {
        expand: {
          align: "end",
          handler: "onTriggerClick",
          compose: () => ({
            children: [{
              class: {
                "b-icon-clock-live": 1
              }
            }]
          })
        },
        back: {
          align: "start",
          cls: "b-icon b-icon-angle-left b-step-trigger",
          key: "Shift+ArrowDown",
          handler: "onBackClick"
        },
        forward: {
          align: "end",
          cls: "b-icon b-icon-angle-right b-step-trigger",
          key: "Shift+ArrowUp",
          handler: "onForwardClick"
        }
      },
      /**
       * Get/set min value, which can be a Date or a string. If a string is specified, it will be converted using
       * the specified {@link #config-format}.
       * @member {Date} min
       * @accepts {String|Date}
       */
      /**
       * Min time value
       * @config {String|Date}
       */
      min: null,
      /**
       * Get/set max value, which can be a Date or a string. If a string is specified, it will be converted using
       * the specified {@link #config-format}.
       * @member {Date} max
       * @accepts {String|Date}
       */
      /**
       * Max time value
       * @config {String|Date}
       */
      max: null,
      /**
       * The `step` property may be set in Object form specifying two properties, `magnitude`, a Number, and
       * `unit`, a String.
       *
       * If a Number is passed, the steps's current unit is used and just the magnitude is changed.
       *
       * If a String is passed, it is parsed by {@link Core.helper.DateHelper#function-parseDuration-static}, for
       * example `'5m'`, `'5 m'`, `'5 min'`, `'5 minutes'`.
       *
       * Upon read, the value is always returned in object form containing `magnitude` and `unit`.
       * @member {DurationConfig} step
       * @accepts {String|Number|DurationConfig}
       */
      /**
       * Time increment duration value. Defaults to 5 minutes.
       * The value is taken to be a string consisting of the numeric magnitude and the units.
       * The units may be a recognised unit abbreviation of this locale or the full local unit name.
       * For example `"10m"` or `"5min"` or `"2 hours"`
       * @config {String}
       */
      step: "5m",
      stepTriggers: null,
      /**
       * Get/set value, which can be a Date or a string. If a string is specified, it will be converted using the
       * specified {@link #config-format}.
       * @member {Date} value
       * @accepts {String|Date}
       */
      /**
       * Value, which can be a Date or a string. If a string is specified, it will be converted using the
       * specified {@link #config-format}
       * @config {String|Date}
       */
      value: null,
      /**
       * Set to true to not clean up the date part of the passed value. Set to false to reset the date part to
       * January 1st
       * @prp {Boolean}
       * @default
       */
      keepDate: false
    };
  }
  //endregion
  //region Init & destroy
  changePicker(picker, oldPicker) {
    const me = this;
    return TimePicker.reconfigure(oldPicker, picker, {
      owner: me,
      defaults: {
        value: me.value,
        forElement: me[me.pickerAlignElement],
        owner: me,
        align: {
          anchor: me.overlayAnchor,
          target: me[me.pickerAlignElement]
        },
        onTimeChange({ time }) {
          me._isUserAction = true;
          me.value = time;
          me._isUserAction = false;
        }
      }
    });
  }
  //endregion
  //region Click listeners
  onBackClick() {
    const me = this, { min } = me;
    if (!me.readOnly && me.value) {
      const newValue = DateHelper.add(me.value, -1 * me.step.magnitude, me.step.unit);
      if (!min || min.getTime() <= newValue) {
        me._isUserAction = true;
        me.value = newValue;
        me._isUserAction = false;
      }
    }
  }
  onForwardClick() {
    const me = this, { max } = me;
    if (!me.readOnly && me.value) {
      const newValue = DateHelper.add(me.value, me.step.magnitude, me.step.unit);
      if (!max || max.getTime() >= newValue) {
        me._isUserAction = true;
        me.value = newValue;
        me._isUserAction = false;
      }
    }
  }
  //endregion
  // region Validation
  get isValid() {
    const me = this;
    me.clearError("L{Field.minimumValueViolation}", true);
    me.clearError("L{Field.maximumValueViolation}", true);
    let value = me.value;
    if (value) {
      value = value.getTime();
      if (me._min && me._min.getTime() > value) {
        me.setError("L{Field.minimumValueViolation}", true);
        return false;
      }
      if (me._max && me._max.getTime() < value) {
        me.setError("L{Field.maximumValueViolation}", true);
        return false;
      }
    }
    return super.isValid;
  }
  hasChanged(oldValue, newValue) {
    if ((oldValue == null ? void 0 : oldValue.getTime) && (newValue == null ? void 0 : newValue.getTime)) {
      return oldValue.getHours() !== newValue.getHours() || oldValue.getMinutes() !== newValue.getMinutes() || oldValue.getSeconds() !== newValue.getSeconds() || oldValue.getMilliseconds() !== newValue.getMilliseconds();
    }
    return super.hasChanged(oldValue, newValue);
  }
  //endregion
  //region Toggle picker
  /**
   * Show picker
   */
  showPicker() {
    const me = this, {
      picker,
      value
    } = me;
    if (me.readOnly) {
      return;
    }
    picker.value = value;
    picker.format = me.format;
    picker.maxTime = me.max;
    picker.minTime = me.min;
    if (!value) {
      me.value = picker.value;
    }
    super.showPicker(true);
  }
  onPickerShow() {
    var _a;
    super.onPickerShow();
    this.pickerKeyDownRemover = (_a = this.pickerKeyDownRemover) == null ? void 0 : _a.call(this);
  }
  /**
   * Focus time picker
   */
  focusPicker() {
    this.picker.focus();
  }
  //endregion
  //region Getters/setters
  transformTimeValue(value) {
    if (value != null) {
      if (typeof value === "string") {
        value = DateHelper.parse(value, this.format);
        if (this.keepDate) {
          value = DateHelper.copyTimeValues(new Date(this.value), value);
        }
      } else {
        value = new Date(value);
      }
      if (DateHelper.isValidDate(value)) {
        if (!this.keepDate) {
          return DateHelper.getTime(value);
        } else {
          return value;
        }
      }
    }
    return null;
  }
  changeMin(value) {
    return this.transformTimeValue(value);
  }
  updateMin(value) {
    const { input } = this;
    if (input) {
      if (value == null) {
        input.removeAttribute("min");
      } else {
        input.min = value;
      }
    }
    this.syncInvalid();
  }
  changeMax(value) {
    return this.transformTimeValue(value);
  }
  updateMax(value) {
    const { input } = this;
    if (input) {
      if (value == null) {
        input.removeAttribute("max");
      } else {
        input.max = value;
      }
    }
    this.syncInvalid();
  }
  changeValue(value, was) {
    const me = this, newValue = me.transformTimeValue(value);
    if (value && !newValue || me.isRequired && value === "") {
      me.setError("L{invalidTime}");
      return;
    }
    me.clearError("L{invalidTime}");
    if (me.hasChanged(was, newValue)) {
      return super.changeValue(newValue, was);
    }
    if (!me.inputting) {
      me.syncInputFieldValue(true);
    }
  }
  updateValue(value, was) {
    const { expand } = this.triggers;
    if (expand && value) {
      expand.element.firstElementChild.style.animationDelay = -((value.getHours() * 60 + value.getMinutes()) / 10) + "s";
    }
    super.updateValue(value, was);
  }
  changeStep(value, was) {
    const type = typeof value;
    if (!value) {
      return null;
    }
    if (type === "number") {
      value = {
        magnitude: Math.abs(value),
        unit: was ? was.unit : "hour"
      };
    } else if (type === "string") {
      value = DateHelper.parseDuration(value);
    }
    if ((value == null ? void 0 : value.unit) && (value == null ? void 0 : value.magnitude)) {
      if (value.magnitude < 0) {
        value = {
          magnitude: -value.magnitude,
          // Math.abs
          unit: value.unit
        };
      }
      return value;
    }
  }
  updateStep(value) {
    this.element.classList[value ? "remove" : "add"]("b-no-steppers");
    this.syncInvalid();
  }
  updateFormat() {
    this.syncInputFieldValue(true);
  }
  get inputValue() {
    return DateHelper.format(this.value, this.format);
  }
  //endregion
  //region Localization
  updateLocalization() {
    super.updateLocalization();
    this.syncInputFieldValue(true);
  }
  //endregion
};
//region Config
__publicField(TimeField, "$name", "TimeField");
__publicField(TimeField, "type", "timefield");
__publicField(TimeField, "alias", "time");
TimeField.initClass();
TimeField._$name = "TimeField";

// ../Core/lib/Core/widget/DurationField.js
var DurationField = class extends TextField {
  static get defaultConfig() {
    return {
      /**
       * The `value` config may be set in Object form specifying two properties,
       * `magnitude`, a Number, and `unit`, a String.
       *
       * If a String is passed, it is parsed in accordance with current locale rules.
       * The string is taken to be the numeric magnitude, followed by whitespace, then an abbreviation, or name of
       * the unit.
       * @config {DurationConfig|String}
       * @category Common
       */
      value: null,
      /**
       * Step size for spin button clicks.
       * @config {Number}
       * @default
       * @category Common
       */
      step: 1,
      /**
       * The duration unit to use with the current magnitude value.
       * @config {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
       * @category Common
       */
      unit: null,
      defaultUnit: "day",
      /**
       * The duration magnitude to use with the current unit value. Can be either an integer or a float value.
       * Both "," and "." are valid decimal separators.
       * @config {Number}
       * @category Common
       */
      magnitude: null,
      /**
       * When set to `true` the field will use short names of unit durations
       * (as returned by {@link Core.helper.DateHelper#function-getShortNameOfUnit-static}) when creating the
       * input field's display value.
       * @config {Boolean}
       * @category Common
       */
      useAbbreviation: false,
      /**
       * Set to `true` to allow negative duration
       * @config {Boolean}
       * @category Common
       */
      allowNegative: false,
      /**
       * The number of decimal places to allow. Defaults to no constraint.
       * @config {Number}
       * @default
       * @category Common
       */
      decimalPrecision: null,
      triggers: {
        spin: {
          type: "spintrigger"
        }
      },
      nullValue: null
    };
  }
  /**
   * Fired when this field's value changes.
   * @event change
   * @param {Core.data.Duration} value - This field's value
   * @param {Core.data.Duration} oldValue - This field's previous value
   * @param {Boolean} valid - True if this field is in a valid state.
   * @param {Event} [event] - The triggering DOM event if any.
   * @param {Boolean} userAction - Triggered by user taking an action (`true`) or by setting a value (`false`)
   * @param {Core.widget.DurationField} source - This field
   */
  /**
   * User performed default action (typed into this field or hit the triggers).
   * @event action
   * @param {Core.data.Duration} value - This field's value
   * @param {Core.data.Duration} oldValue - This field's previous value
   * @param {Boolean} valid - True if this field is in a valid state.
   * @param {Event} [event] - The triggering DOM event if any.
   * @param {Boolean} userAction - Triggered by user taking an action (`true`) or by setting a value (`false`)
   * @param {Core.widget.DurationField} source - This field
   */
  static get configurable() {
    return {
      /**
       * Get/set the min value (e.g. 1d)
       * @member {String} min
       * @category Common
       */
      /**
       * Minimum duration value (e.g. 1d)
       * @config {String}
       * @category Common
       */
      min: null,
      /**
       * Get/set the max value
       * @member {String} max (e.g. 10d)
       * @category Common
       */
      /**
       * Max duration value (e.g. 10d)
       * @config {String}
       * @category Common
       */
      max: null,
      /**
       * Get/set the allowed units, e.g. "day,hour,year".
       * @member {String} allowedUnits
       * @category Common
       */
      /**
       * Comma-separated list of units to allow in this field, e.g. "day,hour,year". Leave blank to allow all
       * valid units (the default)
       * @config {String}
       * @category Common
       */
      allowedUnits: null
    };
  }
  changeMin(value) {
    return typeof value === "string" ? new Duration(value) : value;
  }
  changeMax(value) {
    return typeof value === "string" ? new Duration(value) : value;
  }
  changeAllowedUnits(units) {
    if (typeof units === "string") {
      units = units.split(",");
    }
    if (units.length > 0 && !units.includes(this.defaultUnit)) {
      this.defaultUnit = units[0];
    }
    return units;
  }
  updateAllowedUnits(units) {
    this.allowedUnitsRe = new RegExp(`(${units.join("|")})`, "i");
  }
  get inputValue() {
    return this.value == null ? "" : this.calcValue(true).toString(this.useAbbreviation);
  }
  /**
   * Get/Set duration unit to use with the current magnitude value.
   * Valid values are:
   * - "millisecond" - Milliseconds
   * - "second" - Seconds
   * - "minute" - Minutes
   * - "hour" - Hours
   * - "day" - Days
   * - "week" - Weeks
   * - "month" - Months
   * - "quarter" - Quarters
   * - "year"- Years
   *
   * @property {'millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
   * @category Common
   */
  set unit(unit) {
    this._unit = unit;
    this.value = this.calcValue();
  }
  get unit() {
    return this._unit;
  }
  get unitWithDefault() {
    return this._unit || this.defaultUnit;
  }
  /**
   * Get/Set numeric magnitude `value` to use with the current unit value.
   * @property {Number}
   * @category Common
   */
  set magnitude(magnitude) {
    this.clearError("L{invalidUnit}");
    this._magnitude = magnitude;
    super.value = this.calcValue();
  }
  get magnitude() {
    return this._magnitude;
  }
  roundMagnitude(value) {
    return value && this.decimalPrecision != null ? ObjectHelper.round(value, this.decimalPrecision) : value;
  }
  get allowDecimals() {
    return this.decimalPrecision !== 0;
  }
  get isValid() {
    const me = this, isEmpty = me.value == null || me.value && me.value.magnitude == null;
    return super.isValid && (isEmpty && !me.required || !isEmpty && (me.allowNegative || me.value.magnitude >= 0));
  }
  internalOnChange(event) {
    const me = this, value = me.value, oldVal = me._lastValue;
    if (me.hasChanged(oldVal, value)) {
      me._lastValue = value;
      me.triggerFieldChange({ value, event, userAction: true, valid: me.isValid });
    }
  }
  onFocusOut(e) {
    var _a, _b, _c;
    this.syncInputFieldValue(true);
    (_c = (_b = (_a = this.triggers) == null ? void 0 : _a.spin) == null ? void 0 : _b.clickRepeater) == null ? void 0 : _c.cancel();
    return super.onFocusOut(e);
  }
  /**
   * The `value` property may be set in Object form specifying two properties, `magnitude`, a Number, and `unit`, a
   * String.
   *
   * If a Number is passed, the field's current unit is used and just the magnitude is changed.
   *
   * If a String is passed, it is parsed in accordance with current locale rules. The string is taken to be the
   * numeric magnitude, followed by whitespace, then an abbreviation, or name of the unit.
   *
   * Upon read, the value is always a {@link Core.data.Duration} object containing `magnitude` and `unit`.
   *
   * @property {Core.data.Duration}
   * @accepts {String|Number|DurationConfig|Core.data.Duration}
   * @category Common
   */
  set value(value) {
    const me = this;
    let newMagnitude, newUnit;
    me.getConfig("allowedUnits");
    me.clearError("L{invalidUnit}");
    if (typeof value === "number" || typeof value === "string" && value.length > 0 && !isNaN(value)) {
      newMagnitude = Number(value);
      newUnit = me.unitWithDefault;
    } else if (typeof value === "string") {
      if (/^\s*$/.test(value)) {
        newMagnitude = null;
      } else {
        const parsedDuration = DateHelper.parseDuration(value, me.allowDecimals, me.unitWithDefault);
        if (parsedDuration) {
          if (!me.allowedUnitsRe || me.allowedUnitsRe.test(parsedDuration.unit)) {
            newUnit = parsedDuration.unit;
            newMagnitude = parsedDuration.magnitude;
          } else {
            me.setError("L{invalidUnit}");
          }
        }
      }
    } else {
      if (value && "unit" in value && "magnitude" in value) {
        newUnit = value.unit;
        newMagnitude = value.magnitude;
      } else {
        newUnit = null;
        newMagnitude = null;
      }
    }
    if (me._magnitude !== newMagnitude || me._unit != newUnit) {
      me._magnitude = newMagnitude;
      if (newUnit) {
        me._unit = newUnit;
      }
      super.value = me.calcValue();
    }
  }
  okMax(value) {
    if (typeof value === "number") {
      value = new Duration({
        unit: this.unitWithDefault,
        magnitude: value
      });
    }
    return this.max == null || value <= this.max;
  }
  okMin(value) {
    if (typeof value === "number") {
      value = new Duration({
        unit: this.unitWithDefault,
        magnitude: value
      });
    }
    return this.min == null || value >= this.min;
  }
  get validity() {
    const value = this.value, validity = {};
    if (value != null) {
      validity.rangeUnderflow = !this.okMin(value);
      validity.rangeOverflow = !this.okMax(value);
    }
    validity.valid = !validity.rangeUnderflow && !validity.rangeOverflow;
    return validity;
  }
  get value() {
    return super.value;
  }
  calcValue(round = false) {
    const me = this;
    if ((!me._unit || me._magnitude == null) && me.clearable) {
      return null;
    } else {
      return new Duration(round ? this.roundMagnitude(me._magnitude) : this._magnitude, me.unitWithDefault);
    }
  }
  hasChanged(oldValue, newValue) {
    return newValue && !oldValue || !newValue && oldValue || newValue && oldValue && !oldValue.isEqual(newValue);
  }
  /**
   * The `milliseconds` property is a read only property which returns the number of milliseconds in this field's
   * value
   * @member {Number} milliseconds
   * @readonly
   */
  get milliseconds() {
    return this.value ? this.value.milliseconds : 0;
  }
  onInternalKeyDown(keyEvent) {
    if (keyEvent.key === "ArrowUp") {
      this.doSpinUp();
    } else if (keyEvent.key === "ArrowDown") {
      this.doSpinDown();
    }
  }
  doSpinUp() {
    const me = this;
    if (me.readOnly) {
      return;
    }
    let newValue = (me.magnitude || 0) + me.step;
    me._isUserAction = true;
    if (!me.okMin(newValue)) {
      newValue = me.min;
    }
    if (me.okMax(newValue)) {
      me.value = newValue;
    }
    me._isUserAction = false;
  }
  doSpinDown() {
    const me = this;
    if (me.readOnly) {
      return;
    }
    let newValue = (me.magnitude || 0) - me.step;
    if (!me.okMax(newValue)) {
      newValue = me.max;
    }
    if (me.okMin(newValue) && (me.allowNegative || (me.magnitude || 0) > 0)) {
      me._isUserAction = true;
      me.value = newValue;
      me._isUserAction = false;
    }
  }
};
__publicField(DurationField, "$name", "DurationField");
__publicField(DurationField, "type", "durationfield");
__publicField(DurationField, "alias", "duration");
DurationField.initClass();
DurationField._$name = "DurationField";

// ../Core/lib/Core/widget/FieldFilterPicker.js
var filterableFieldDataTypes = {
  number: true,
  boolean: true,
  string: true,
  date: true,
  duration: true,
  time: true,
  auto: true
};
var isInferrableType = {
  number: true,
  boolean: true,
  string: true
};
var isSupportedDurationField = (field) => {
  var _a;
  return ((_a = field == null ? void 0 : field.column) == null ? void 0 : _a.type) === "duration";
};
var isFilterableField = (field) => filterableFieldDataTypes[field == null ? void 0 : field.type] || isSupportedDurationField(field);
var emptyString = "";
var clsBase = `b-fieldfilterpicker`;
var multiValueOperators = {
  between: true,
  notBetween: true,
  isIncludedIn: true,
  isNotIncludedIn: true
};
var valueInputTypes = {
  textfield: true,
  datefield: true,
  numberfield: true,
  durationfield: true,
  combo: true,
  timefield: true
};
var commonOperators = {
  empty: { value: "empty", text: "L{isEmpty}", argCount: 0 },
  notEmpty: { value: "notEmpty", text: "L{isNotEmpty}", argCount: 0 },
  "=": { value: "=", text: "L{equals}" },
  "!=": { value: "!=", text: "L{doesNotEqual}" },
  ">": { value: ">", text: "L{isGreaterThan}" },
  "<": { value: "<", text: "L{isLessThan}" },
  ">=": { value: ">=", text: "L{isGreaterThanOrEqualTo}" },
  "<=": { value: "<=", text: "L{isLessThanOrEqualTo}" },
  between: { value: "between", text: "L{isBetween}", argCount: 2 },
  notBetween: { value: "notBetween", text: "L{isNotBetween}", argCount: 2 },
  isIncludedIn: { value: "isIncludedIn", text: "L{isOneOf}", isArrayValued: true },
  isNotIncludedIn: { value: "isNotIncludedIn", text: "L{isNotOneOf}", isArrayValued: true }
};
var _FieldFilterPicker = class _FieldFilterPicker extends Container {
  static get defaultValueFieldPlaceholders() {
    return {
      string: "L{enterAValue}",
      number: "L{enterANumber}",
      date: "L{selectADate}",
      relation: "L{selectValue}",
      list: "L{selectOneOrMoreValues}",
      duration: "L{enterAValue}",
      time: "L{selectATime}",
      auto: "L{enterAValue}"
    };
  }
  afterConstruct() {
    const me = this;
    if (!me._fields) {
      throw new Error(`${_FieldFilterPicker.name} requires 'fields' to be configured.`);
    }
    if (!me._filter) {
      throw new Error(`${_FieldFilterPicker.name} requires 'filter' to be configured.`);
    }
    super.afterConstruct();
    const { widgetMap: { propertyPicker, operatorPicker, caseSensitive } } = me;
    propertyPicker.ion({ select: "onPropertySelect", thisObj: me });
    operatorPicker.ion({ select: "onOperatorSelect", thisObj: me });
    caseSensitive.ion({ change: "onCaseSensitiveChange", thisObj: me });
    me.propertyFieldConfig && propertyPicker.setConfig(me.propertyFieldConfig);
    me.operatorFieldConfig && operatorPicker.setConfig(me.operatorFieldConfig);
    propertyPicker.cls = me.allPropertyPickerClasses;
    operatorPicker.cls = me.allOperatorPickerClasses;
    me.populateUIFromFilter();
  }
  changeDateFormat(dateFormat) {
    return this.L(dateFormat);
  }
  get allChildInputs() {
    const { propertyPicker, operatorPicker, caseSensitive } = this.widgetMap;
    return [propertyPicker, operatorPicker, ...this.valueFields, caseSensitive];
  }
  updateDisabled(newDisabled) {
    this.allChildInputs.forEach((field) => field.disabled = newDisabled);
  }
  updateReadOnly(newReadOnly) {
    const { propertyPicker, operatorPicker } = this.widgetMap;
    this.allChildInputs.forEach((field) => field.readOnly = newReadOnly);
    propertyPicker.readOnly = propertyPicker.readOnly || newReadOnly;
    operatorPicker.readOnly = operatorPicker.readOnly || newReadOnly;
  }
  updatePropertyLocked(newPropertyLocked) {
    this.widgetMap.propertyPicker.readOnly = newPropertyLocked || this.readOnly;
    this.widgetMap.propertyPicker.cls = this.allPropertyPickerClasses;
  }
  updateOperatorLocked(newOperatorLocked) {
    this.widgetMap.operatorPicker.readOnly = newOperatorLocked || this.readOnly;
    this.widgetMap.operatorPicker.cls = this.allOperatorPickerClasses;
  }
  changeOperators(newOperators) {
    const operators = newOperators != null ? newOperators : _FieldFilterPicker.defaultOperators;
    return Object.keys(operators).reduce((outOperators, dataType) => ({
      ...outOperators,
      [dataType]: operators[dataType].map((op) => ({ ...op, text: this.L(op.text) }))
    }), {});
  }
  changeFields(newFields) {
    let fields = newFields;
    if (Array.isArray(newFields)) {
      VersionHelper.deprecate("Core", "6.0.0", "FieldOption[] deprecated, use Object<String, FieldOption> keyed by field name instead");
      fields = ArrayHelper.keyBy(fields, "name");
    }
    return fields;
  }
  get isMultiSelectValueField() {
    var _a;
    return ["isIncludedIn", "isNotIncludedIn"].includes((_a = this._filter) == null ? void 0 : _a.operator);
  }
  get allPropertyPickerClasses() {
    var _a;
    return new DomClassList(`${clsBase}-property`, (_a = this.propertyFieldConfig) == null ? void 0 : _a.cls, {
      [`${clsBase}-combo-locked`]: this.propertyLocked
    });
  }
  get allOperatorPickerClasses() {
    var _a;
    return new DomClassList(`${clsBase}-operator`, (_a = this.operatorFieldConfig) == null ? void 0 : _a.cls, {
      [`${clsBase}-combo-locked`]: this.operatorLocked
    });
  }
  getValueFieldConfigs() {
    const me = this, {
      valueFieldCls,
      fieldType,
      _filter: { operator },
      onValueChange,
      filterValues,
      isMultiSelectValueField,
      operatorArgCount,
      getValueFieldConfig,
      fieldIsRelation,
      triggerChangeOnInput
    } = me, valueFieldPlaceholders = ObjectHelper.merge(
      {},
      _FieldFilterPicker.defaultValueFieldPlaceholders,
      me.valueFieldPlaceholders
    );
    if (!fieldType || !operator || operatorArgCount === 0) {
      return [];
    }
    let valueFieldCfg = {
      type: "textfield",
      // replaced as needed below
      internalListeners: {
        change: onValueChange,
        input: triggerChangeOnInput ? onValueChange : null,
        thisObj: me
      },
      bubbleEvents: { keydown: true },
      cls: valueFieldCls,
      dataset: {
        type: fieldType
      },
      placeholder: me.L(valueFieldPlaceholders[isMultiSelectValueField ? "list" : fieldIsRelation ? "relation" : fieldType]),
      highlightExternalChange: false
    };
    if (isMultiSelectValueField || fieldIsRelation) {
      valueFieldCfg = {
        ...valueFieldCfg,
        type: "combo",
        multiSelect: isMultiSelectValueField,
        createOnUnmatched: true,
        items: me.getUniqueDataValues(filterValues),
        value: filterValues != null ? filterValues : []
      };
    } else if (["number", "date", "boolean", "duration", "time"].includes(fieldType)) {
      valueFieldCfg.type = `${fieldType}field`;
    }
    if (getValueFieldConfig) {
      valueFieldCfg = me.callback(getValueFieldConfig, me, [me.filter, valueFieldCfg]);
    }
    if (isMultiSelectValueField) {
      return [valueFieldCfg];
    }
    return ArrayHelper.populate(operatorArgCount, (index) => [{
      type: "widget",
      tag: "div",
      cls: `${clsBase}-value-separator`,
      content: me.L("L{FieldFilterPicker.and}")
    }, {
      ...valueFieldCfg,
      value: filterValues[index]
    }]).flat().slice(1);
  }
  /**
   * Return an array of unique values in the data store for the currently selected field. If no store is
   * configured or no field is selected, returns an empty array.
   */
  getUniqueDataValues(extraValuesToInclude = []) {
    var _a;
    const me = this, { fieldType } = me;
    if (!me.store || !((_a = me._filter) == null ? void 0 : _a.property)) {
      return [];
    }
    const { relatedDisplayField } = me.selectedField;
    let values, sortedValues;
    if (me.fieldIsRelation) {
      const { foreignStore } = me.currentPropertyRelationConfig;
      if (relatedDisplayField) {
        values = foreignStore.allRecords.reduce((options, record) => {
          if (record.id != null) {
            options.push({
              text: record.getValue(relatedDisplayField),
              value: record.id
            });
          }
          return options;
        }, []);
        sortedValues = values.sort((a, b) => me.sortStrings(a.text, b.text));
      } else {
        values = foreignStore.allRecords.map((record) => record.id);
      }
    } else {
      values = me.store.allRecords.map((record) => record.getValue(me._filter.property));
    }
    if (!sortedValues) {
      values.push(...extraValuesToInclude);
      const uniqueValues = ArrayHelper.unique(values.reduce((primitiveValues, value) => {
        if (value != null && String(value).trim() !== "") {
          if (fieldType === "date") {
            primitiveValues.push(value.valueOf());
          } else if (fieldType === "duration") {
            primitiveValues.push(value.toString());
          } else {
            primitiveValues.push(value);
          }
        }
        return primitiveValues;
      }, []));
      if (fieldType === "string") {
        sortedValues = uniqueValues.sort(me.sortStrings);
      } else if (fieldType === "duration") {
        sortedValues = uniqueValues.map((durationStr) => new Duration(durationStr)).filter((duration) => duration.isValid).sort(me.sortDurations);
      } else {
        sortedValues = uniqueValues.sort(me.sortNumerics);
      }
      if (fieldType === "date") {
        sortedValues = sortedValues.map((timestamp) => {
          const date = new Date(timestamp);
          return {
            text: DateHelper.format(date, me.dateFormat),
            value: timestamp
          };
        });
      } else if (fieldType === "duration") {
        sortedValues = sortedValues.map((duration) => duration.toString());
      }
    }
    return sortedValues;
  }
  sortStrings(a, b) {
    return (a != null ? a : emptyString).localeCompare(b != null ? b : emptyString);
  }
  sortNumerics(a, b) {
    return a - b;
  }
  sortDurations(a, b) {
    return a.valueOf() - b.valueOf();
  }
  get fieldType() {
    var _a;
    return (_a = this.selectedField) == null ? void 0 : _a.type;
  }
  get selectedField() {
    var _a, _b;
    return (_b = this.fields) == null ? void 0 : _b[(_a = this._filter) == null ? void 0 : _a.property];
  }
  get propertyOptions() {
    var _a;
    return Object.entries((_a = this.fields) != null ? _a : {}).filter(
      ([, fieldDef]) => filterableFieldDataTypes[fieldDef.type] || isSupportedDurationField(fieldDef)
    ).map(([fieldName, { title }]) => ({ value: fieldName, text: title != null ? title : fieldName })).sort((a, b) => a.text.localeCompare(b.text));
  }
  get operatorOptions() {
    return this.operators[this.fieldIsRelation ? "relation" : this.fieldType];
  }
  get fieldIsRelation() {
    return Boolean(this.currentPropertyRelationConfig);
  }
  get currentPropertyRelationConfig() {
    var _a, _b;
    return (_b = (_a = this.store) == null ? void 0 : _a.modelRelations) == null ? void 0 : _b.find(({ foreignKey }) => {
      var _a2;
      return foreignKey === ((_a2 = this._filter) == null ? void 0 : _a2.property);
    });
  }
  updateOperators() {
    delete this._operatorArgCountLookup;
  }
  /**
   * @internal
   */
  get operatorArgCountLookup() {
    return this._operatorArgCountLookup || (this._operatorArgCountLookup = _FieldFilterPicker.buildOperatorArgCountLookup(this.operators));
  }
  updateFilter() {
    if (this._filter) {
      this.onFilterChange();
    }
  }
  updateStore(newStore) {
    var _a;
    (_a = this._store) == null ? void 0 : _a.un(this);
    newStore == null ? void 0 : newStore.ion({ refresh: "onStoreRefresh", thisObj: this });
    this.inferFieldTypes();
  }
  onStoreRefresh({ action }) {
    if (this.isMultiSelectValueField && ["dataset", "create", "update", "delete"].includes(action)) {
      this.valueFields[0].items = this.getUniqueDataValues(this.filterValues);
    }
  }
  refreshValueFields() {
    const me = this, { valueFields } = me.widgetMap, {
      fieldType,
      operatorArgCount,
      _filter: { property, operator }
    } = me, isMultiValue = multiValueOperators[operator];
    valueFields.element.className = new DomClassList({
      [`${clsBase}-values`]: true,
      [`${clsBase}-values-multiple`]: isMultiValue,
      [`${clsBase}-values-${fieldType}`]: fieldType !== void 0,
      "b-hidden": property == void 0 || operator == void 0 || operatorArgCount === 0
    });
    valueFields.removeAll();
    valueFields.add(me.getValueFieldConfigs());
    delete me._valueFields;
    me.refreshCaseSensitive();
  }
  refreshCaseSensitive() {
    var _a, _b;
    const me = this, { fieldType, operatorArgCount, isMultiSelectValueField } = me, operator = (_a = me._filter) == null ? void 0 : _a.operator, { caseSensitive } = me.widgetMap;
    caseSensitive.hidden = fieldType !== "string" || !operator || isMultiSelectValueField || operatorArgCount === 0;
    caseSensitive.checked = ((_b = me._filter) == null ? void 0 : _b.caseSensitive) !== false;
  }
  onPropertySelect(event) {
    var _a;
    const me = this, { _filter } = me;
    _filter.property = ((_a = event.record) == null ? void 0 : _a.data.value) || null;
    if (me.fieldType !== me._fieldType) {
      _filter.operator = null;
      _filter.value = null;
    }
    me._fieldType = _filter.type = me.fieldType;
    me.refreshOperatorPicker();
    me.refreshValueFields();
    me.triggerChange();
  }
  onCaseSensitiveChange({ checked }) {
    this._filter.caseSensitive = checked;
    this.triggerChange();
  }
  onOperatorSelect(event) {
    var _a;
    const me = this, wasMultiSelectValueField = me.isMultiSelectValueField;
    const prevArgCount = this.operatorArgCount;
    me._filter.operator = ((_a = event.record) == null ? void 0 : _a.data.value) || null;
    if (me.operatorArgCount !== prevArgCount) {
      me._filter.value = null;
    }
    if (me.isMultiSelectValueField && !wasMultiSelectValueField) {
      me._filter.value = [];
    }
    me.refreshValueFields();
    me.triggerChange();
  }
  triggerChange() {
    const { filter, isValid } = this;
    this.trigger("change", {
      filter,
      isValid
    });
  }
  onValueChange() {
    const me = this, { isMultiSelectValueField, fieldType, _filter } = me, values = this.valueFields.map((field) => field.value);
    if (isMultiSelectValueField && fieldType === "date") {
      _filter.value = values[0].map((timestamp) => new Date(timestamp));
    } else if (isMultiSelectValueField && fieldType === "duration") {
      _filter.value = values[0].map((durationStr) => new Duration(durationStr));
    } else {
      if (fieldType === "date" && _filter.operator === "between" && DateHelper.isValidDate(values[1])) {
        values[1].setHours(23, 59, 59, 999);
      }
      _filter.value = values.length === 1 ? values[0] : values;
    }
    me.triggerChange();
  }
  refreshOperatorPicker() {
    const { operatorPicker } = this.widgetMap, { _filter: { operator, property }, operatorOptions } = this;
    operatorPicker.items = operatorOptions;
    operatorPicker.value = operator;
    operatorPicker.hidden = property === null;
  }
  populateUIFromFilter(forceRefreshValueFields = false) {
    const me = this, {
      filterValues,
      widgetMap: { propertyPicker, operatorPicker },
      _filter: { property, operator, disabled },
      propertyOptions,
      operatorOptions,
      isMultiSelectValueField
    } = me;
    propertyPicker.items = propertyOptions;
    operatorPicker.items = operatorOptions;
    operatorPicker.hidden = property === null;
    let refreshValueFields = forceRefreshValueFields;
    if (propertyPicker.value !== property) {
      propertyPicker.value = property;
      me.refreshOperatorPicker();
      refreshValueFields = true;
    }
    if (operatorPicker.value !== operator) {
      if (operator === null || !operatorPicker.items.find(({ value }) => value === operator)) {
        operatorPicker.clear();
      } else {
        operatorPicker.value = operator;
      }
      refreshValueFields = true;
    }
    if (!operator && operatorPicker.items.length === 1) {
      operatorPicker.value = me._filter.operator = operatorPicker.items[0].value;
    }
    if (refreshValueFields) {
      me.refreshValueFields();
    }
    me.refreshCaseSensitive();
    me.valueFields.forEach((valueField, fieldIndex) => {
      if (isMultiSelectValueField && (valueField.value.length > 0 || filterValues.length > 0)) {
        if (me.fieldType === "date") {
          valueField.value = filterValues.map((date) => date == null ? void 0 : date.valueOf());
        } else if (me.fieldType === "duration") {
          valueField.value = filterValues.map((duration) => duration == null ? void 0 : duration.toString());
        } else {
          valueField.value = filterValues;
        }
      } else if (fieldIndex >= filterValues.length) {
        valueField.clear();
      } else {
        valueField.value = filterValues[fieldIndex];
      }
    });
    me.allChildInputs.forEach((widget) => widget.disabled = me.disabled || disabled);
  }
  get valueFields() {
    return this._valueFields || (this._valueFields = this.widgetMap.valueFields.queryAll(
      (w) => w.owner === this.widgetMap.valueFields && valueInputTypes[w.type]
    ));
  }
  get filterValues() {
    var _a;
    if (((_a = this._filter) == null ? void 0 : _a.value) == null) {
      return [];
    }
    return ArrayHelper.asArray(this._filter.value);
  }
  // Must be called manually when filter modified externally
  onFilterChange() {
    const me = this, newFieldType = me.fieldType, forceRefreshValueFields = newFieldType !== me._fieldType;
    me._fieldType = me._filter.type = newFieldType;
    me.populateUIFromFilter(forceRefreshValueFields);
  }
  get operatorArgCount() {
    const { fieldType, filter: { operator }, operatorArgCountLookup } = this;
    return fieldType && operator ? operatorArgCountLookup[fieldType][operator] : 1;
  }
  get isValid() {
    const me = this, { filter, fieldType, filterValues, isMultiSelectValueField, operatorArgCount } = me, { operator } = filter, missingValue = operatorArgCount > 0 && (filter == null ? void 0 : filter.value) == null;
    return (
      // fieldType here validates that we have a matching field
      fieldType && operator && !missingValue && (isMultiSelectValueField && filterValues.length > 0 || filterValues.length === operatorArgCount) && filterValues.every((value) => value != null && (fieldType !== "duration" || value.isValid))
    );
  }
  focus() {
    var _a, _b, _c;
    (_c = (_b = (_a = this.valueFields.find((f) => f.isEmptyInput)) != null ? _a : this.operatorPicker) != null ? _b : this.propertyPicker) == null ? void 0 : _c.focus();
  }
  inferFieldTypes() {
    if (this.store && this.fields) {
      for (const [fieldName, fieldDef] of Object.entries(this.fields)) {
        if (fieldDef.type === "auto") {
          fieldDef.type = _FieldFilterPicker.inferFieldType(this.store, fieldName);
        }
      }
    }
  }
  static inferFieldType(store, fieldName) {
    var _a;
    const firstValue = (_a = store.find((record) => record.getValue(fieldName) != null, true)) == null ? void 0 : _a.getValue(fieldName);
    if (firstValue !== void 0) {
      const valueType = typeof firstValue;
      if (valueType === "object" && firstValue instanceof Date) {
        return "date";
      } else if (isInferrableType[valueType]) {
        return valueType;
      }
    }
    return "auto";
  }
};
//region Config
__publicField(_FieldFilterPicker, "$name", "FieldFilterPicker");
__publicField(_FieldFilterPicker, "type", "fieldfilterpicker");
__publicField(_FieldFilterPicker, "operators", {
  empty: { value: "empty", text: "L{isEmpty}", argCount: 0 },
  notEmpty: { value: "notEmpty", text: "L{isNotEmpty}", argCount: 0 },
  "=": { value: "=", text: "L{equals}" },
  "!=": { value: "!=", text: "L{doesNotEqual}" },
  ">": { value: ">", text: "L{isGreaterThan}" },
  "<": { value: "<", text: "L{isLessThan}" },
  ">=": { value: ">=", text: "L{isGreaterThanOrEqualTo}" },
  "<=": { value: "<=", text: "L{isLessThanOrEqualTo}" },
  between: { value: "between", text: "L{isBetween}", argCount: 2 },
  notBetween: { value: "notBetween", text: "L{isNotBetween}", argCount: 2 },
  isIncludedIn: { value: "isIncludedIn", text: "L{isOneOf}" },
  isNotIncludedIn: { value: "isNotIncludedIn", text: "L{isNotOneOf}" }
});
__publicField(_FieldFilterPicker, "defaultOperators", {
  string: [
    // In display order
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    { value: "includes", text: "L{contains}" },
    { value: "doesNotInclude", text: "L{doesNotContain}" },
    { value: "startsWith", text: "L{startsWith}" },
    { value: "endsWith", text: "L{endsWith}" },
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  number: [
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    commonOperators[">"],
    commonOperators["<"],
    commonOperators[">="],
    commonOperators["<="],
    commonOperators.between,
    commonOperators.notBetween,
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  date: [
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    { value: "<", text: "L{isBefore}" },
    { value: ">", text: "L{isAfter}" },
    commonOperators.between,
    { value: "isToday", text: "L{isToday}", argCount: 0 },
    { value: "isTomorrow", text: "L{isTomorrow}", argCount: 0 },
    { value: "isYesterday", text: "L{isYesterday}", argCount: 0 },
    { value: "isThisWeek", text: "L{isThisWeek}", argCount: 0 },
    { value: "isNextWeek", text: "L{isNextWeek}", argCount: 0 },
    { value: "isLastWeek", text: "L{isLastWeek}", argCount: 0 },
    { value: "isThisMonth", text: "L{isThisMonth}", argCount: 0 },
    { value: "isNextMonth", text: "L{isNextMonth}", argCount: 0 },
    { value: "isLastMonth", text: "L{isLastMonth}", argCount: 0 },
    { value: "isThisYear", text: "L{isThisYear}", argCount: 0 },
    { value: "isNextYear", text: "L{isNextYear}", argCount: 0 },
    { value: "isLastYear", text: "L{isLastYear}", argCount: 0 },
    { value: "isYearToDate", text: "L{isYearToDate}", argCount: 0 },
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  boolean: [
    { value: "isTrue", text: "L{isTrue}", argCount: 0 },
    { value: "isFalse", text: "L{isFalse}", argCount: 0 }
  ],
  duration: [
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    commonOperators[">"],
    commonOperators["<"],
    commonOperators[">="],
    commonOperators["<="],
    commonOperators.between,
    commonOperators.notBetween,
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  time: [
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    commonOperators[">"],
    commonOperators["<"],
    commonOperators[">="],
    commonOperators["<="],
    commonOperators.between,
    commonOperators.notBetween,
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  relation: [
    commonOperators.empty,
    commonOperators.notEmpty,
    commonOperators["="],
    commonOperators["!="],
    commonOperators.isIncludedIn,
    commonOperators.isNotIncludedIn
  ],
  auto: [
    { value: "*", text: "L{contains}" }
  ]
});
__publicField(_FieldFilterPicker, "configurable", {
  /**
   * Dictionary of {@link #typedef-FieldOption} representing the fields against which filters can be defined,
   * keyed by field name.
   *
   * <div class="note">5.3.0 Syntax accepting FieldOption[] was deprecated in favor of dictionary and will be removed in 6.0</div>
   *
   * If filtering a {@link Grid.view.Grid}, consider using {@link Grid.widget.GridFieldFilterPicker}, which can be configured
   * with an existing {@link Grid.view.Grid} instead of, or in combination with, defining fields manually.
   *
   * Example:
   * ```javascript
   * fields: {
   *     // Allow filters to be defined against the 'age' and 'role' fields in our data
   *     age  : { title: 'Age', type: 'number' },
   *     role : { title: 'Role', type: 'string' }
   * }
   * ```
   *
   * @config {Object<String,FieldOption>}
   */
  fields: null,
  /**
   * Make the entire picker disabled.
   *
   * @config {Boolean}
   * @default
   */
  disabled: false,
  /**
   * Make the entire picker read-only.
   *
   * @config {Boolean}
   * @default
   */
  readOnly: false,
  layout: "vbox",
  /**
   * Make only the property selector readOnly.
   * @private
   *
   * @config {Boolean}
   * @default
   */
  propertyLocked: false,
  /**
   * Make only the operator selector readOnly.
   * @private
   *
   * @config {Boolean}
   * @default
   */
  operatorLocked: false,
  /**
   * Configuration object for the {@link Core.util.CollectionFilter} displayed
   * and editable in this picker.
   *
   * Example:
   *
   * ```javascript
   * {
   *     property: 'age',
   *     operator: '=',
   *     value: 25
   * }
   * ```
   *
   * @config {CollectionFilterConfig}
   */
  filter: null,
  /**
   * Optional configuration for the property selector {@link Core.widget.Combo}.
   *
   * @config {ComboConfig}
   */
  propertyFieldConfig: null,
  /**
   * Optional configuration for the operator selector {@link Core.widget.Combo}.
   *
   * @config {ComboConfig}
   * @private
   */
  operatorFieldConfig: null,
  /**
   * Optional CSS class to apply to the value field(s).
   *
   * @config {String}
   * @private
   */
  valueFieldCls: null,
  /**
   * Whether to raise {@link #event-change} events as the user types into a value field. If `false`,
   * {@link #event-change} events will be raised only when the value input field's own `change` event
   * occurs, for example on field blur.
   *
   * @config {Boolean}
   * @default
   */
  triggerChangeOnInput: true,
  /**
   * @private
   */
  items: {
    inputs: {
      type: "container",
      layout: "hbox",
      cls: `${clsBase}-inputs`,
      items: {
        propertyPicker: {
          type: "combo",
          items: {},
          cls: `${clsBase}-property`,
          placeholder: "L{FieldFilterPicker.selectAProperty}",
          highlightExternalChange: false
        },
        operatorPicker: {
          type: "combo",
          items: {},
          cls: `${clsBase}-operator`,
          placeholder: "L{FieldFilterPicker.selectAnOperator}",
          highlightExternalChange: false
        },
        valueFields: {
          type: "container",
          cls: `${clsBase}-values`,
          items: {}
        }
      }
    },
    caseSensitive: {
      type: "checkbox",
      text: "L{FieldFilterPicker.caseSensitive}",
      cls: `${clsBase}-case-sensitive`
    }
  },
  /**
   * Overrides the built-in list of operators that are available for selection. Specify operators as
   * an object with data types as keys and lists of operators as values, like this:
   *
   * ```javascript
   * operators : {
   *     string : [
   *         { value : 'empty', text : 'is empty', argCount : 0 },
   *         { value : 'notEmpty', text : 'is not empty', argCount : 0 }
   *     ],
   *     number : [
   *         { value : '=', text : 'equals' },
   *         { value : '!=', text : 'does not equal' }
   *     ],
   *     date : [
   *         { value : '<', text : 'is before' }
   *     ]
   * }
   * ```
   *
   * Here `value` is what will be stored in the `operator` field in the filter when selected, `text` is the text
   * displayed in the Combo for selection, and `argCount` is the number of arguments (comparison values) the
   * operator requires. The default argCount if not specified is 1.
   *
   * @config {Object}
   */
  operators: _FieldFilterPicker.defaultOperators,
  /**
   * The date format string used to display dates when using the 'is one of' / 'is not one of' operators with a date
   * field. Defaults to the current locale's `FieldFilterPicker.dateFormat` value.
   *
   * @config {String}
   * @default
   */
  dateFormat: "L{FieldFilterPicker.dateFormat}",
  /**
   * Optional {Core.data.Store} against which filters are being defined. This is used to supply options to filter against
   * when using the 'is one of' and 'is not one of' operators.
   *
   * @config {Core.data.Store}
   */
  store: null,
  /**
   * Optional {@link ValueFieldPlaceholders} object specifying custom placeholder text for value input fields.
   *
   * @config {ValueFieldPlaceholders}
   */
  valueFieldPlaceholders: null,
  /**
   * Optional function that modifies the configuration of value fields shown for a filter. The default configuration
   * is received as an argument and the returned value will be used as the final configuration. For example:
   *
   * ```javascript
   * getValueFieldConfig : (filter, fieldConfig) => {
   *     return {
   *         ...fieldConfig,
   *         title : fieldName    // Override the `title` config for the field
   *     };
   * }
   * ```
   *
   * The supplied function should accept the following arguments:
   *
   * @config {Function}
   * @param {Core.util.CollectionFilter} filter The filter being displayed
   * @param {ContainerItemConfig} fieldConfig Configuration object for the value field
   * @returns {ContainerItemConfig} the resulting configuration
   */
  getValueFieldConfig: null
});
//endregion
// Make lookup of operator arity (arg count) by [fieldType][operator]
__publicField(_FieldFilterPicker, "buildOperatorArgCountLookup", (operators) => ArrayHelper.keyBy(
  Object.entries(operators),
  ([fieldType]) => fieldType,
  ([, operators2]) => ArrayHelper.keyBy(
    operators2,
    ({ value }) => value,
    ({ argCount }) => argCount === void 0 ? 1 : argCount
  )
));
var FieldFilterPicker = _FieldFilterPicker;
FieldFilterPicker.initClass();
FieldFilterPicker._$name = "FieldFilterPicker";

// ../Core/lib/Core/widget/Label.js
var Label = class extends Widget {
  compose() {
    const { text, html } = this;
    return {
      tag: "label",
      text,
      html
    };
  }
};
__publicField(Label, "$name", "Label");
__publicField(Label, "type", "label");
__publicField(Label, "configurable", {
  /**
   * Get/set label text
   * @prp {String}
   */
  text: null,
  localizableProperties: ["text"]
});
Label.initClass();
Label._$name = "Label";

// ../Core/lib/Core/widget/FieldFilterPickerGroup.js
var _FieldFilterPickerGroup = class _FieldFilterPickerGroup extends Container {
  afterConstruct() {
    const me = this;
    me.validateConfig();
    const { addFilterButton } = me.widgetMap;
    addFilterButton.ion({ click: "addFilter", thisObj: me });
    addFilterButton.text = me.L(addFilterButton.text);
    me.store && me.updateStore(me.store);
    super.afterConstruct();
  }
  changeDateFormat(dateFormat) {
    return this.L(dateFormat);
  }
  validateConfig() {
    if (!this.fields && !this.store) {
      throw new Error(
        `FieldFilterPickerGroup requires either a 'fields' or 'store' config property.`
      );
    }
  }
  updateFields(newFields) {
    this.widgetMap.pickers.childItems.forEach((picker) => picker.fields = newFields);
  }
  updateFilters(newFilters, oldFilters) {
    const me = this;
    if (oldFilters) {
      oldFilters.filter((filter) => !newFilters.find((newFilter) => newFilter.id === filter.id)).forEach((filter) => {
        var _a;
        return (_a = me.store) == null ? void 0 : _a.removeFilter(filter.id);
      });
    }
    newFilters.forEach((filter) => filter.id = filter.id || me.nextFilterId);
    me.widgetMap.pickers.items = (newFilters == null ? void 0 : newFilters.map((filter) => me.getPickerRowConfig(filter))) || [];
  }
  changeFilters(newFilters) {
    const { canManageFilter } = this;
    return newFilters && canManageFilter ? newFilters.filter((filter) => this.callback(canManageFilter, this, [filter])) : newFilters;
  }
  updateStore(newStore) {
    const me = this;
    me.detachListeners("store");
    if (newStore) {
      me.widgetMap.pickers.childItems.forEach(({ widgetMap: { filterPicker: { filter, isValid } } }) => {
        newStore.removeFilter(filter.id, true);
        if (isValid) {
          newStore.addFilter(filter, true);
        }
      });
      newStore.filter();
      me.appendFiltersFromStore();
      newStore.ion({
        name: "store",
        filter: "onStoreFilter",
        thisObj: me
      });
    }
    me.widgetMap.pickers.childItems.forEach((picker) => picker.store = newStore);
  }
  updateShowAddFilterButton(newShow) {
    this.widgetMap.addFilterButton.hidden = !newShow;
  }
  updateAddFilterButtonText(newText) {
    this.widgetMap.addFilterButton.text = newText != null ? newText : _FieldFilterPickerGroup.addFilterButtonDefaultText;
  }
  /**
   * Find any filters the store has that we don't know about yet, and add to our list
   * @private
   */
  appendFiltersFromStore() {
    const me = this;
    me.store.filters.forEach((filter) => {
      var _a;
      const canManage = me.canManage(filter), { property, operator, id } = filter;
      if (canManage && property && operator && !((_a = me.filters) == null ? void 0 : _a.find((filter2) => filter2.id === id))) {
        me.appendFilter(filter);
      }
    });
  }
  /**
   * @private
   */
  canManage(filter) {
    const me = this;
    return !me.canManageFilter || me.callback(me.canManageFilter, me, [filter]) === true;
  }
  /**
   * Get the configuration object for one child FieldFilterPicker.
   * @param {Core.util.CollectionFilter} filter The filter represented by the child FieldFilterPicker
   * @returns {Object} The FieldFilterPicker configuration
   */
  getFilterPickerConfig(filter) {
    const me = this, {
      fields,
      store,
      disabled,
      readOnly,
      valueFieldCls,
      operators,
      limitToProperty,
      dateFormat,
      getFieldFilterPickerConfig,
      triggerChangeOnInput
    } = me;
    return {
      type: me.constructor.childPickerType,
      fields: fields != null ? fields : me.getFieldsFromStore(store),
      filter,
      store,
      disabled,
      readOnly,
      propertyLocked: Boolean(limitToProperty),
      valueFieldCls,
      operators,
      dateFormat,
      internalListeners: {
        change: "onFilterPickerChange",
        thisObj: me
      },
      flex: 1,
      triggerChangeOnInput,
      ...getFieldFilterPickerConfig ? me.callback(getFieldFilterPickerConfig, me, [filter]) : void 0
    };
  }
  /**
   * Get store fields as {@link Core.widget.FieldFilterPicker#typedef-FieldOption}s in a dictionary keyed by name.
   * @private
   */
  getFieldsFromStore(store) {
    var _a, _b;
    return Object.fromEntries((_b = (_a = store.modelClass) == null ? void 0 : _a.fields.map(({ name, type }) => [name, { type }])) != null ? _b : []);
  }
  getPickerRowConfig(filter) {
    const me = this, { disabled, readOnly, canDeleteFilter } = me, canDelete = !(canDeleteFilter && me.callback(canDeleteFilter, me, [filter]) === false);
    return {
      type: "container",
      layout: "box",
      cls: {
        [`b-${_FieldFilterPickerGroup.type}-row`]: true,
        [`b-${_FieldFilterPickerGroup.type}-row-removable`]: canDelete
      },
      dataset: {
        separatorText: me.L("L{FieldFilterPicker.and}")
      },
      items: {
        activeCheckbox: {
          type: "checkbox",
          disabled,
          readOnly,
          checked: !Boolean(filter.disabled),
          internalListeners: {
            change: "onFilterActiveChange",
            thisObj: me
          },
          cls: `b-${_FieldFilterPickerGroup.type}-filter-active`
        },
        filterPicker: me.getFilterPickerConfig(filter),
        removeButton: {
          type: "button",
          ref: "removeButton",
          disabled,
          readOnly,
          hidden: !canDelete,
          cls: `b-transparent b-${_FieldFilterPickerGroup.type}-remove`,
          icon: "b-fa-trash",
          internalListeners: {
            click: "removeFilter",
            thisObj: me
          }
        }
      }
    };
  }
  get allInputs() {
    const childInputTypes = [this.constructor.childPickerType, "button", "checkbox"];
    return this.queryAll((w) => childInputTypes.includes(w.type));
  }
  updateDisabled(newDisabled) {
    this.allInputs.forEach((input) => input.disabled = newDisabled);
  }
  updateReadOnly(newReadOnly) {
    this.allInputs.forEach((input) => input.readOnly = newReadOnly);
  }
  onFilterActiveChange({ source, checked }) {
    const me = this, filterIndex = me.getFilterIndex(source), filter = me.filters[filterIndex], filterPicker = me.getFilterPicker(filterIndex);
    filter.disabled = !checked;
    filterPicker.onFilterChange();
    if (me.store && filterPicker.isValid) {
      me.store.addFilter(filter, true);
    }
    me.updateStoreFilter();
    me.triggerChange();
  }
  onFilterPickerChange({ source, filter, isValid }) {
    const me = this, { store } = me, filterIndex = me.getFilterIndex(source);
    if (store) {
      store.removeFilter(filter.id, true);
      if (isValid) {
        store.addFilter(filter, true);
      }
      me.updateStoreFilter();
    }
    Object.assign(me.filters[filterIndex], filter);
    me.triggerChange();
  }
  getFilterIndex(eventSource) {
    return this.widgetMap.pickers.childItems.indexOf(
      eventSource.containingWidget
    );
  }
  getPickerRow(index) {
    return this.widgetMap.pickers.childItems[index];
  }
  /**
   * Return the {@link Core.widget.FieldFilterPicker} for the filter at the specified index.
   * @param {Number} filterIndex
   * @returns {Core.widget.FieldFilterPicker}
   */
  getFilterPicker(filterIndex) {
    return this.getPickerRow(filterIndex).widgetMap.filterPicker;
  }
  get nextFilterId() {
    this._nextId = (this._nextId || 0) + 1;
    return `${this.id}-filter-${this._nextId}`;
  }
  removeFilter({ source }) {
    const me = this, filterIndex = me.getFilterIndex(source), filter = me.filters[filterIndex], pickerRow = me.getPickerRow(filterIndex), newFocusWidget = me.query((w) => w.isFocusable && w.type !== "container" && !pickerRow.contains(w));
    if (newFocusWidget) {
      newFocusWidget.focus();
    }
    me.removeFilterAt(filterIndex);
    if (me.store) {
      me.store.removeFilter(filter.id, true);
      me.updateStoreFilter();
    }
    me.trigger("remove", { filter });
    me.triggerChange();
  }
  /**
   * Appends a filter at the bottom of the list.
   * @param {CollectionFilterConfig} [filter={}] Configuration object for the {@link Core.util.CollectionFilter} to
   * add. Defaults to an empty filter.
   */
  addFilter({ property = null, operator = null, value = null } = {}) {
    var _a;
    const me = this, { filters } = me, newFilter = {
      property: me.limitToProperty || property,
      operator,
      value,
      disabled: false,
      id: me.nextFilterId,
      caseSensitive: false
    };
    if (!me.trigger("beforeAddFilter", { filter: newFilter })) {
      return;
    }
    me.appendFilter(newFilter);
    if (me.getFilterPicker(filters.length - 1).isValid) {
      (_a = me.store) == null ? void 0 : _a.addFilter(newFilter, true);
      me.store && me.updateStoreFilter();
    }
    me.trigger("add", { filter: newFilter });
    me.triggerChange();
  }
  /**
   * @private
   */
  appendFilter(filter) {
    const me = this;
    if (!me.limitToProperty || filter.property === me.limitToProperty) {
      me.filters.push(filter);
      me.widgetMap.pickers.add(
        me.getPickerRowConfig(filter, me.filters.length - 1)
      );
    }
  }
  onStoreFilter(event) {
    const me = this;
    if (me._isUpdatingStore) {
      return;
    }
    const { filters } = event, storeFiltersById = filters.values.reduce((byId, filter) => ({ ...byId, [filter.id]: filter }), {});
    for (let filterIndex = me.filters.length - 1; filterIndex >= 0; filterIndex--) {
      const filter = me.filters[filterIndex], storeFilter = storeFiltersById[filter.id], filterRow = me.getPickerRow(filterIndex);
      if (filterRow) {
        const { filterPicker, activeCheckbox } = filterRow.widgetMap;
        if (!storeFilter && filterPicker.isValid) {
          me.removeFilterAt(filterIndex);
        } else if (storeFilter !== void 0) {
          const { operator, value, property, disabled, caseSensitive } = storeFilter;
          if (filter !== storeFilter) {
            Object.assign(filter, { operator, value, property, disabled, caseSensitive });
          }
          filterPicker.filter = filter;
          filterPicker.onFilterChange();
          activeCheckbox.checked = !disabled;
        }
      }
    }
    me.appendFiltersFromStore();
    me.triggerChange();
  }
  /**
   * Remove the filter at the given index.
   * @param {Number} filterIndex The index of the filter to remove
   */
  removeFilterAt(filterIndex) {
    const { widgetMap: { pickers }, filters } = this;
    pickers.remove(pickers.childItems[filterIndex]);
    filters.splice(filterIndex, 1);
    this.triggerChange();
  }
  /**
   * Trigger a store re-filter after filters have been silently modified.
   * @private
   */
  updateStoreFilter() {
    var _a;
    this._isUpdatingStore = true;
    (_a = this.store) == null ? void 0 : _a.filter();
    this._isUpdatingStore = false;
  }
  /**
   * Returns the array of filter configuration objects currently represented by this picker group.
   * @type {CollectionFilterConfig[]}
   */
  get value() {
    return this.filters;
  }
  triggerChange() {
    const { filters } = this, validFilters = filters.filter((f, index) => this.getPickerRow(index).widgetMap.filterPicker.isValid);
    this.trigger("change", {
      filters,
      validFilters
    });
  }
  /**
   * Sets all current filters to enabled and checks their checkboxes.
   */
  activateAll() {
    this.setAllActiveStatus(true);
  }
  /**
   * Sets all current filters to disabled and clears their checkboxes.
   */
  deactivateAll() {
    this.setAllActiveStatus(false);
  }
  /**
   * @private
   */
  setAllActiveStatus(newActive) {
    const me = this, { _filters, store } = me;
    _filters.forEach((filter, filterIndex) => {
      if (newActive === filter.disabled) {
        const { filterPicker, activeCheckbox } = me.getPickerRow(filterIndex).widgetMap;
        filter.disabled = !newActive;
        filterPicker.onFilterChange();
        activeCheckbox.checked = newActive;
        if (newActive && store && filterPicker.isValid) {
          store.addFilter(filter, true);
        }
      }
    });
    me.updateStoreFilter();
  }
  focus() {
    var _a;
    const { length } = this._filters;
    if (length > 0) {
      (_a = this.getPickerRow(length - 1)) == null ? void 0 : _a.widgetMap.filterPicker.focus();
    }
  }
};
//region Config
__publicField(_FieldFilterPickerGroup, "$name", "FieldFilterPickerGroup");
__publicField(_FieldFilterPickerGroup, "type", "fieldfilterpickergroup");
/**
 * @private
 */
__publicField(_FieldFilterPickerGroup, "addFilterButtonDefaultText", "L{FieldFilterPickerGroup.addFilter}");
__publicField(_FieldFilterPickerGroup, "configurable", {
  /**
   * Array of {@link Core.util.CollectionFilter} configuration objects. One
   * {@link Core.widget.FieldFilterPicker} will be created
   * for each object in the array.
   *
   * When {@link #config-store} is provided, any filters in the store will
   * be automatically added and do not need to be provided explicitly.
   *
   * Example:
   * ```javascript
   * filters: [{
   *     // Filter properties should exist among field names configured
   *     // via `fields` or `store`
   *     property: 'age',
   *     operator: '<',
   *     value: 30
   * },{
   *     property: 'title',
   *     operator: 'startsWith',
   *     value: 'Director'
   * }]
   * ```
   *
   * @config
   * @type {CollectionFilterConfig[]}
   */
  filters: [],
  /**
   * Dictionary of {@link Core.widget.FieldFilterPicker#typedef-FieldOption} representing the fields against which filters can be defined,
   * keyed by field name.
   *
   * If filtering a {@link Grid.view.Grid}, consider using {@link Grid.widget.GridFieldFilterPicker}, which can be configured
   * with an existing {@link Grid.view.Grid} instead of, or in combination with, defining fields manually.
   *
   * Example:
   * ```javascript
   * fields: {
   *     // Allow filters to be defined against the 'age' and 'role' fields in our data
   *     age  : { text: 'Age', type: 'number' },
   *     role : { text: 'Role', type: 'string' }
   * }
   * ```
   *
   * @config {Object<String,FieldOption>}
   * @deprecated 5.3.0 Syntax accepting FieldOptions[] was deprecated in favor of dictionary and will be removed in 6.0
   */
  fields: null,
  /**
   * Whether the picker group is disabled.
   *
   * @config {Boolean}
   * @default
   */
  disabled: false,
  /**
   * Whether the picker group is read-only.
   *
   * Example:
   * fields: [
   *    { name: 'age', type: 'number' },
   *    { name: 'title', type: 'string' }
   * ]
   *
   * @config {Boolean}
   * @default
   */
  readOnly: false,
  layout: "vbox",
  /**
   * The {@link Core.data.Store} whose records will be filtered. The store's {@link Core.data.Store#property-modelClass}
   * will be used to determine field types.
   *
   * This store will be kept in sync with the filters defined in the picker group, and new filters added to the store
   * via other means will appear in this filter group when they are able to be modified by it. (Some types of filters,
   * like arbitrary filter functions, cannot be managed through this widget.)
   *
   * As a corollary, multiple `FieldFilterPickerGroup`s configured with the same store will stay in sync, showing the
   * same filters as the store's filters change.
   *
   * @config {Core.data.Store}
   */
  store: null,
  /**
   * When `limitToProperty` is set to the name of an available field (as specified either
   * explicitly in {@link #config-fields} or implicitly in the
   * {@link #config-store}'s model), it has the following effects:
   *
   * - the picker group will only show filters defined on the specified property
   * - it will automatically set the `property` to the specified property for all newly added
   *   filters where the property is not already set
   * - the property selector is made read-only
   *
   * @config {String}
   */
  limitToProperty: null,
  /**
   * Optional CSS class to apply to the value field(s).
   *
   * @config {String}
   * @private
   */
  valueFieldCls: null,
  /**
   * Show a button at the bottom of the group that adds a new, blank filter to the group.
   *
   * @config {Boolean}
   * @default
   */
  showAddFilterButton: true,
  /**
   * Optional predicate that returns whether a given filter can be deleted. When `canDeleteFilter` is provided,
   * it will be called for each filter and will not show the delete button for those for which the
   * function returns `false`.
   *
   * @config {Function}
   * @param {*} filter  filter for checking
   * @returns {Boolean} truthy value if filter can be deleted
   */
  canDeleteFilter: null,
  /**
   * Optional function that returns {@link Core.widget.FieldFilterPicker} configuration properties for
   * a given filter. When `getFieldFilterPickerConfig` is provided, it will be called for each filter and the returned
   * object will be merged with the configuration properties for the individual
   * {@link Core.widget.FieldFilterPicker} representing that filter.
   *
   * The supplied function should accept a single argument, the {@link Core.util.CollectionFilter} whose picker
   * is being created.
   *
   * @config {Function}
   * @returns {FieldFilterPickerConfig}
   */
  getFieldFilterPickerConfig: null,
  /**
   * Optional predicate that returns whether a given filter can be managed by this widget. When `canManageFilter`
   * is provided, it will be used to decide whether to display filters found in the configured
   * {@link #config-store}.
   *
   * @config {Function}
   * @param {*} filter  filter for checking
   * @returns {Boolean} truthy value if filter can be managed
   */
  canManageFilter: null,
  /**
   * Sets the text displayed in the 'add filter' button if one is present.
   *
   * @config {String}
   */
  addFilterButtonText: null,
  /**
   * Whether to raise {@link #event-change} events as the user types into a value field. If `false`,
   * {@link #event-change} events will be raised only when the value input field's own `change` event
   * occurs, for example on field blur.
   *
   * @config {Boolean}
   * @default
   */
  triggerChangeOnInput: true,
  /**
   * @private
   */
  items: {
    pickers: {
      type: "container",
      layout: "vbox",
      scrollable: true,
      items: {}
    },
    addFilterButton: {
      type: "button",
      text: _FieldFilterPickerGroup.addFilterButtonDefaultText,
      cls: `b-${_FieldFilterPickerGroup.type}-add-button`,
      hidden: true
    }
  },
  /**
   * When specified, overrides the built-in list of available operators. See
   * {@link Core.widget.FieldFilterPicker#config-operators}.
   *
   * @config {Object}
   */
  operators: null,
  /**
   * The date format string used to display dates when using the 'is one of' / 'is not one of' operators with a date
   * field. Defaults to the current locale's `FieldFilterPicker.dateFormat` value.
   *
   * @config {String}
   * @default
   */
  dateFormat: "L{FieldFilterPicker.dateFormat}"
});
// endregion
__publicField(_FieldFilterPickerGroup, "childPickerType", "fieldfilterpicker");
var FieldFilterPickerGroup = _FieldFilterPickerGroup;
FieldFilterPickerGroup.initClass();
FieldFilterPickerGroup._$name = "FieldFilterPickerGroup";

// ../Core/lib/Core/widget/MessageDialog.js
var items = [
  {
    ref: "cancelButton",
    cls: "b-messagedialog-cancelbutton b-gray",
    text: "L{Object.Cancel}",
    onClick: "up.onCancelClick"
  },
  {
    ref: "okButton",
    cls: "b-messagedialog-okbutton b-raised b-blue",
    text: "L{Object.Ok}",
    onClick: "up.onOkClick"
  }
];
if (BrowserHelper.isWindows) {
  items.reverse();
}
var _MessageDialogConstructor = class _MessageDialogConstructor extends Popup {
  static get configurable() {
    return {
      centered: true,
      modal: true,
      hidden: true,
      autoShow: false,
      closeAction: "hide",
      title: "\xA0",
      lazyItems: {
        $config: ["lazy"],
        value: [{
          cls: "b-messagedialog-message",
          ref: "message"
        }, {
          type: "textfield",
          cls: "b-messagedialog-input",
          ref: "input"
        }]
      },
      showClass: null,
      bbar: {
        overflow: null,
        items
      }
    };
  }
  construct() {
    this.okButton = this.yesButton = 1;
    this.cancelButton = 3;
    super.construct(...arguments);
  }
  // Protect from queryAll -> destroy
  destroy() {
  }
  /**
   * Shows a confirm dialog with "Ok" and "Cancel" buttons. The returned promise resolves passing the button identifier
   * of the button that was pressed ({@link #property-okButton} or {@link #property-cancelButton}).
   * @function confirm
   * @param {Object} options An options object for what to show.
   * @param {String} [options.title] The title to show in the dialog header.
   * @param {String} [options.message] The message to show in the dialog body.
   * @param {String} [options.rootElement] The root element of this widget, defaults to document.body. Use this
   * if you use the MessageDialog inside a web component ShadowRoot
   * @param {String|ButtonConfig} [options.cancelButton] A text or a config object to apply to the Cancel button.
   * @param {String|ButtonConfig} [options.okButton] A text or config object to apply to the OK button.
   * @returns {Promise} A promise which is resolved when the dialog is closed
   */
  async confirm() {
    return this.showDialog("confirm", ...arguments);
  }
  /**
   * Shows an alert popup with a message. The returned promise resolves when the button is clicked.
   * @function alert
   * @param {Object} options An options object for what to show.
   * @param {String} [options.title] The title to show in the dialog header.
   * @param {String} [options.message] The message to show in the dialog body.
   * @param {String} [options.rootElement] The root element of this widget, defaults to document.body. Use this
   * if you use the MessageDialog inside a web component ShadowRoot
   * @param {String|ButtonConfig} [options.okButton] A text or config object to apply to the OK button.
   * @returns {Promise} A promise which is resolved when the dialog is closed
   */
  async alert() {
    return this.showDialog("alert", ...arguments);
  }
  /**
   * Shows a popup with a basic {@link Core.widget.TextField} along with a message. The returned promise resolves when
   * the dialog is closed and yields an Object with a `button` ({@link #property-okButton} or {@link #property-cancelButton})
   * and a `text` property with the text the user provided
   * @function prompt
   * @param {Object} options An options object for what to show.
   * @param {String} [options.title] The title to show in the dialog header.
   * @param {String} [options.message] The message to show in the dialog body.
   * @param {String} [options.rootElement] The root element of this widget, defaults to document.body. Use this
   * if you use the MessageDialog inside a web component ShadowRoot
   * @param {TextFieldConfig} [options.textField] A config object to apply to the TextField.
   * @param {String|ButtonConfig} [options.cancelButton] A text or a config object to apply to the Cancel button.
   * @param {String|ButtonConfig} [options.okButton] A text or config object to apply to the OK button.
   * @returns {Promise} A promise which is resolved when the dialog is closed. The promise yields an Object with
   * a `button` ({@link #property-okButton} or {@link #property-cancelButton}) and a `text` property with the text the
   * user provided
   */
  async prompt({
    textField
  }) {
    const field = this.widgetMap.input;
    Widget.reconfigure(field, textField);
    field.value = "";
    return this.showDialog("prompt", ...arguments);
  }
  showDialog(mode, {
    message = "",
    title = "\xA0",
    cancelButton,
    okButton,
    rootElement = document.body
  }) {
    const me = this;
    me.rootElement = rootElement;
    me.getConfig("lazyItems");
    me.title = me.optionalL(title);
    me.widgetMap.message.html = me.optionalL(message);
    me.showClass = `b-messagedialog-${mode}`;
    if (okButton) {
      okButton = typeof okButton === "string" ? { text: okButton } : okButton;
    }
    if (cancelButton) {
      cancelButton = typeof cancelButton === "string" ? { text: cancelButton } : cancelButton;
    }
    okButton = Object.assign({}, me.widgetMap.okButton.initialConfig, okButton);
    cancelButton = Object.assign({}, me.widgetMap.cancelButton.initialConfig, cancelButton);
    okButton.text = me.optionalL(okButton.text);
    cancelButton.text = me.optionalL(cancelButton.text);
    Widget.reconfigure(me.widgetMap.okButton, okButton);
    Widget.reconfigure(me.widgetMap.cancelButton, cancelButton);
    me.show();
    return me.promise = new Promise((resolve) => {
      me.resolve = resolve;
    });
  }
  show() {
    const activeElement = DomHelper.getActiveElement(this.element);
    this.owner = this.element.contains(activeElement) ? null : _MessageDialogConstructor.fromElement(document.activeElement);
    return super.show(...arguments);
  }
  updateShowClass(showClass, oldShowClass) {
    const { classList } = this.element;
    if (oldShowClass) {
      classList.remove(oldShowClass);
    }
    if (showClass) {
      classList.add(showClass);
    }
  }
  doResolve(value) {
    const me = this, { resolve } = me;
    if (resolve) {
      const isPrompt = me.showClass === "b-messagedialog-prompt";
      if (isPrompt && value === me.okButton && !me.widgetMap.input.isValid) {
        return;
      }
      me.resolve = me.reject = me.promise = null;
      resolve(isPrompt ? { button: value, text: me.widgetMap.input.value } : value);
      me.hide();
    }
  }
  onInternalKeyDown(event) {
    if (event.key === "Escape") {
      event.stopImmediatePropagation();
      this.onCancelClick();
    } else if (event.key === "Enter" && !event.target.closest(".b-button")) {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onOkClick();
    }
    super.onInternalKeyDown(event);
  }
  onOkClick() {
    this.doResolve(MessageDialog.okButton);
  }
  onCancelClick() {
    this.doResolve(MessageDialog.cancelButton);
  }
};
__publicField(_MessageDialogConstructor, "$name", "MessageDialog");
__publicField(_MessageDialogConstructor, "type", "messagedialog");
var MessageDialogConstructor = _MessageDialogConstructor;
MessageDialogConstructor.initClass();
var MessageDialog = new Proxy({}, {
  get(target, prop) {
    const instance = target.instance || (target.instance = new MessageDialogConstructor({
      rootElement: document.body
    })), result = instance[prop];
    return typeof result === "function" ? result.bind(instance) : result;
  }
});
var MessageDialog_default = MessageDialog;

export {
  DragHelper,
  ResizeHelper,
  Toast,
  WidgetHelper,
  Formatter,
  NumberFormat,
  Clipboardable_default,
  Override,
  Month,
  ButtonGroup,
  CalendarPanel,
  YearPicker,
  DisplayField,
  DatePicker,
  DateField,
  NumberField,
  TimePicker,
  TimeField,
  DurationField,
  filterableFieldDataTypes,
  isSupportedDurationField,
  isFilterableField,
  FieldFilterPicker,
  Label,
  FieldFilterPickerGroup,
  MessageDialog_default
};
//# sourceMappingURL=chunk-6ZLMCHE5.js.map
