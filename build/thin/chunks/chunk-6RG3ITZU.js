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
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  Toast
} from "./chunk-6ZLMCHE5.js";
import {
  AjaxHelper,
  Base,
  BrowserHelper,
  Combo,
  Delayable_default,
  DomHelper,
  DomSync,
  EventHelper,
  Events_default,
  Field,
  IdHelper,
  InstancePlugin,
  LocaleManager_default,
  Localizable_default,
  ObjectHelper,
  Popup,
  TemplateHelper,
  VersionHelper
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/feature/export/Utils.js
var RowsRange = {
  all: "all",
  visible: "visible"
};
var PaperFormat = {
  A6: {
    width: 4.11,
    height: 5.81
  },
  A5: {
    width: 5.81,
    height: 8.25
  },
  A4: {
    width: 8.25,
    height: 11.69,
    portraitWidth: 8.3,
    portraitHeight: 11.7,
    landscapeWidth: 11.7,
    landscapeHeight: 8.26
  },
  A3: {
    width: 11.69,
    height: 16.49,
    portraitWidth: 11.7,
    // 16.54 works perfect in print, but in export (puppeteer) it results in extra empty page
    portraitHeight: 16.49,
    landscapeWidth: 16.54,
    landscapeHeight: 11.68
  },
  Legal: {
    width: 8.5,
    height: 14
  },
  Letter: {
    width: 8.5,
    height: 11
  }
};
function getPrintPaperSizeAdjustments() {
  if (BrowserHelper.isFirefox) {
    return {
      portraitWidth: 0,
      portraitHeight: 0,
      landscapeWidth: 0,
      landscapeHeight: 0.26
    };
  }
  if (BrowserHelper.isSafari) {
    return {
      portraitWidth: 0,
      portraitHeight: 0.1,
      landscapeWidth: 0,
      landscapeHeight: 0.5
    };
  }
  return {
    portraitWidth: 0,
    portraitHeight: 0,
    landscapeWidth: 0,
    landscapeHeight: 0.25
  };
}
var Orientation = {
  portrait: "portrait",
  landscape: "landscape"
};
var FileFormat = {
  pdf: "pdf",
  png: "png"
};
var FileMIMEType = {
  pdf: "application/pdf",
  png: "image/png"
};

// ../Grid/lib/Grid/view/export/field/ExportRowsCombo.js
var ExportRowsCombo = class extends Combo {
  //region Config
  static get $name() {
    return "ExportRowsCombo";
  }
  // Factoryable type name
  static get type() {
    return "exportrowscombo";
  }
  static get defaultConfig() {
    return {
      editable: false
    };
  }
  //endregion
  buildItems() {
    const me = this;
    return [
      { id: RowsRange.all, text: me.L("L{all}") },
      { id: RowsRange.visible, text: me.L("L{visible}") }
    ];
  }
};
ExportRowsCombo.initClass();
ExportRowsCombo._$name = "ExportRowsCombo";

// ../Grid/lib/Grid/view/export/field/ExportOrientationCombo.js
var ExportOrientationCombo = class extends Combo {
  //region Config
  static get $name() {
    return "ExportOrientationCombo";
  }
  // Factoryable type name
  static get type() {
    return "exportorientationcombo";
  }
  static get defaultConfig() {
    return {
      editable: false
    };
  }
  //endregion
  buildItems() {
    const me = this;
    return [
      { id: Orientation.portrait, text: me.L("L{portrait}") },
      { id: Orientation.landscape, text: me.L("L{landscape}") }
    ];
  }
};
ExportOrientationCombo.initClass();
ExportOrientationCombo._$name = "ExportOrientationCombo";

// ../Grid/lib/Grid/view/export/ExportDialog.js
function buildComboItems(obj, fn = (x) => x) {
  return Object.keys(obj).map((key) => ({ id: key, text: fn(key) }));
}
var ExportDialog = class extends Popup {
  //region Config
  static get $name() {
    return "ExportDialog";
  }
  static get type() {
    return "exportdialog";
  }
  static get configurable() {
    return {
      autoShow: false,
      autoClose: false,
      closable: true,
      centered: true,
      /**
       * Returns map of values of dialog fields.
       * @member {Object<String,Object>} values
       * @readonly
       */
      /**
       * Grid instance to build export dialog for
       * @config {Grid.view.Grid}
       */
      client: null,
      /**
       * Set to `false` to not preselect all visible columns when the dialog is shown
       * @config {Boolean}
       */
      autoSelectVisibleColumns: true,
      /**
       * Set to `false` to allow using PNG + Multipage config in export dialog
       * @config {Boolean}
       */
      hidePNGMultipageOption: true,
      /**
       * When set to `true` labels in the dialog will say `Print` instead of `Export`
       * @prp {Boolean}
       */
      useBrowserPrint: false,
      title: "L{exportSettings}",
      maxHeight: "80%",
      scrollable: {
        overflowY: true
      },
      defaults: {
        localeClass: this
      },
      items: {
        columnsField: {
          type: "combo",
          label: "L{ExportDialog.columns}",
          name: "columns",
          store: {},
          valueField: "id",
          displayField: "text",
          multiSelect: true,
          weight: 100,
          maxHeight: 100
        },
        rowsRangeField: {
          type: "exportrowscombo",
          label: "L{ExportDialog.rows}",
          name: "rowsRange",
          value: "all",
          weight: 200
        },
        exporterTypeField: {
          type: "combo",
          label: "L{ExportDialog.exporterType}",
          name: "exporterType",
          editable: false,
          value: "singlepage",
          displayField: "text",
          buildItems() {
            const dialog = this.parent;
            return dialog.exporters.map((exporter) => ({
              id: exporter.type,
              text: dialog.optionalL(exporter.title, this)
            }));
          },
          onChange({ value }) {
            this.owner.widgetMap.alignRowsField.hidden = value === "singlepage";
            this.owner.widgetMap.repeatHeaderField.hidden = value !== "multipagevertical";
          },
          weight: 300
        },
        alignRowsField: {
          type: "checkbox",
          label: "L{ExportDialog.alignRows}",
          name: "alignRows",
          checked: false,
          hidden: true,
          weight: 400
        },
        repeatHeaderField: {
          type: "checkbox",
          label: "L{ExportDialog.repeatHeader}",
          name: "repeatHeader",
          localeClass: this,
          hidden: true,
          weight: 500
        },
        fileFormatField: {
          type: "combo",
          label: "L{ExportDialog.fileFormat}",
          name: "fileFormat",
          localeClass: this,
          editable: false,
          value: "pdf",
          items: [],
          onChange({ value, oldValue }) {
            const dialog = this.parent;
            if (dialog.hidePNGMultipageOption) {
              const exporterField = dialog.widgetMap.exporterTypeField, exporter = exporterField.store.find((r) => r.id === "singlepage");
              if (value === FileFormat.png && exporter) {
                this._previousDisabled = exporterField.disabled;
                exporterField.disabled = true;
                this._previousValue = exporterField.value;
                exporterField.value = "singlepage";
              } else if (oldValue === FileFormat.png && this._previousValue) {
                exporterField.disabled = this._previousDisabled;
                exporterField.value = this._previousValue;
              }
            }
          },
          weight: 600
        },
        paperFormatField: {
          type: "combo",
          label: "L{ExportDialog.paperFormat}",
          name: "paperFormat",
          editable: false,
          value: "A4",
          items: [],
          weight: 700
        },
        orientationField: {
          type: "exportorientationcombo",
          label: "L{ExportDialog.orientation}",
          name: "orientation",
          value: "portrait",
          weight: 800
        }
      },
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          exportButton: {
            color: "b-green",
            text: "L{ExportDialog.export}",
            weight: 100,
            onClick: "up.onExportClick"
          },
          cancelButton: {
            color: "b-gray",
            text: "L{ExportDialog.cancel}",
            weight: 200,
            onClick: "up.onCancelClick"
          }
        }
      }
    };
  }
  //endregion
  construct(config = {}) {
    const me = this, { client } = config;
    if (!client) {
      throw new Error("`client` config is required");
    }
    me.columnsStore = client.columns.chain((column) => column.isLeaf && column.exportable, null, { excludeCollapsedRecords: false });
    me.applyInitialValues(config);
    super.construct(config);
    LocaleManager_default.ion({
      locale: "onLocaleChange",
      prio: -1,
      thisObj: me
    });
  }
  updateUseBrowserPrint(value) {
    const me = this;
    me.whenVisible(() => {
      if (value) {
        me.widgetMap.exportButton.text = me.L("L{ExportDialog.print}");
        me.widgetMap.fileFormatField.hidden = true;
        me.title = me.L("L{printSettings}");
      } else {
        me.widgetMap.exportButton.text = me.L("L{ExportDialog.export}");
        me.widgetMap.fileFormatField.hidden = Boolean(me.widgetMap.fileFormatField.initialConfig.hidden);
        me.title = me.L("L{exportSettings}");
      }
    });
  }
  applyInitialValues(config) {
    const me = this, items = config.items = config.items || {};
    config.width = config.width || me.L("L{width}");
    config.defaults = config.defaults || {};
    config.defaults.labelWidth = config.defaults.labelWidth || me.L("L{ExportDialog.labelWidth}");
    items.columnsField = items.columnsField || {};
    items.fileFormatField = items.fileFormatField || {};
    items.paperFormatField = items.paperFormatField || {};
    items.fileFormatField.items = buildComboItems(FileFormat, (value) => value.toUpperCase());
    items.paperFormatField.items = buildComboItems(PaperFormat);
    items.columnsField.store = me.columnsStore;
  }
  onBeforeShow() {
    var _a;
    const { columnsField, alignRowsField, exporterTypeField, repeatHeaderField } = this.widgetMap;
    if (this.autoSelectVisibleColumns) {
      columnsField.value = this.columnsStore.query((c) => !c.hidden);
    }
    alignRowsField.hidden = exporterTypeField.value === "singlepage";
    repeatHeaderField.hidden = exporterTypeField.value !== "multipagevertical";
    (_a = super.onBeforeShow) == null ? void 0 : _a.call(this, ...arguments);
  }
  onLocaleChange() {
    const labelWidth = this.L("L{labelWidth}");
    this.width = this.L("L{width}");
    this.eachWidget((widget) => {
      if (widget instanceof Field) {
        widget.labelWidth = labelWidth;
      }
    });
  }
  onExportClick() {
    const values = this.values;
    this.trigger("export", { values });
  }
  onCancelClick() {
    this.trigger("cancel");
    this.hide();
  }
};
ExportDialog.initClass();
ExportDialog._$name = "ExportDialog";

// ../Grid/lib/Grid/feature/export/exporter/Exporter.js
var Exporter = class extends Delayable_default(Events_default(Localizable_default(Base))) {
  static get defaultConfig() {
    return {
      /**
       * `True` to replace all linked CSS files URLs to absolute before passing HTML to the server.
       * When passing a string the current origin of the CSS files URLS will be replaced by the passed origin.
       *
       * For example: css files pointing to /app.css will be translated from current origin to {translateURLsToAbsolute}/app.css
       * @config {Boolean|String}
       * @default
       */
      translateURLsToAbsolute: true,
      /**
       * When true links are converted to absolute by combining current window location (with replaced origin) with
       * resource link.
       * When false links are converted by combining new origin with resource link (for angular)
       * @config {Boolean}
       * @default
       */
      keepPathName: true,
      /**
       * This method accepts all stylesheets (link and style tags) which are supposed to be put on the page. Use this
       * hook method to filter or modify them.
       *
       * ```javascript
       * new Grid({
       *     features: {
       *         pdfExport: {
       *             // filter out inline styles and bootstrap.css
       *             filterStyles: styles => styles.filter(item => !/(link|bootstrap.css)/.test(item))
       *         }
       *     }
       * });
       * ```
       * @param {String[]} styles
       * @returns {String[]} List of stylesheets to put on the exported page
       */
      filterStyles: (styles) => styles
    };
  }
  static inchToPx(value) {
    return value * 96;
  }
  /**
   * Template of an extracted page.
   * @param {Object} data Data for the page template
   * @returns {String}
   */
  pageTpl(data) {
    const {
      title,
      header,
      footer,
      styles,
      htmlClasses,
      bodyClasses = [],
      paperHeight,
      paperWidth,
      html,
      currentPage,
      isPrint
    } = data;
    let { htmlStyle = "", bodyStyle = "" } = data;
    bodyClasses.push(`b-${this.constructor.type}`);
    if (DomHelper.scrollBarWidth) {
      bodyClasses.push("b-visible-scrollbar");
    } else {
      bodyClasses.push("b-overlay-scrollbar");
    }
    if (BrowserHelper.isChrome) {
      bodyClasses.push("b-chrome");
    } else if (BrowserHelper.isSafari) {
      bodyClasses.push("b-safari");
    } else if (BrowserHelper.isFirefox) {
      bodyClasses.push("b-firefox");
    }
    htmlStyle = isPrint ? htmlStyle : `${htmlStyle}; width: ${paperWidth}in; height: ${paperHeight}in;`;
    bodyStyle = isPrint ? `${bodyStyle}; width: ${paperWidth}in;` : `${bodyStyle}; width: ${paperWidth}in; height: ${paperHeight}in;`;
    return TemplateHelper.tpl`
            <!DOCTYPE html>
            <html class="${htmlClasses} b-print-root" style="${htmlStyle}">
                <head>
                    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
                    <title>${title}</title>
                    ${styles.join("")}
                </head>
                <body class="b-export ${bodyClasses.join(" ")}" style="${bodyStyle}">
                    <div class="b-export-content b-page-${currentPage}">
                        ${header && `<div class="b-export-header" style="width: 100%">${header}</div>`}
                        <div class="b-export-body"><div class="b-export-viewport">${html}</div></div>
                        ${footer && `<div class="b-export-footer" style="width: 100%">${footer}</div>`}
                    </div>
                </body>
            </html>`;
  }
  /**
   * Returns all style-related tags: `<style>` and `<link rel="stylesheet">`
   * @property {String[]}
   * @readonly
   */
  get stylesheets() {
    const me = this;
    if (me._stylesheets) {
      return me._stylesheets;
    }
    const translate = me.translateURLsToAbsolute, origin = globalThis.origin, styleSheetNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')), styles = [];
    styleSheetNodes.forEach((node) => {
      node = node.cloneNode(true);
      if (translate && node.href) {
        let result;
        if (translate === true) {
          result = node.href;
        } else if (this.keepPathName) {
          result = node.href.replace(origin, translate);
        } else {
          result = new URL(node.getAttribute("href"), translate);
        }
        node.setAttribute("href", result);
      }
      let styleText = node.outerHTML;
      if (translate && /style/i.test(node.tagName)) {
        const converter = me.getStyleTagURLConverter(translate);
        styleText = styleText.replace(/url\(['"]?(.+?)['"]?\)/g, converter);
      }
      styles.push(styleText);
    });
    return me._stylesheets = me.filterStyles(styles);
  }
  set stylesheets(value) {
    this._stylesheets = value ? this.filterStyles(value) : value;
  }
  getStyleTagURLConverter(translate) {
    return function(match, url) {
      let result;
      try {
        let base;
        if (/^#/.test(url)) {
          result = match;
        } else {
          if (translate === true) {
            base = globalThis.location.href;
          } else if (this.keepPathName) {
            base = globalThis.location.href.replace(globalThis.location.origin, translate);
          } else {
            base = translate;
          }
          result = `url('${new URL(url, base).href}')`;
        }
      } catch (e) {
        result = match;
      }
      return result;
    }.bind(this);
  }
  saveState({ client }) {
    this.state = client.state;
  }
  async restoreState({ client }) {
    const promises = [], detachers = /* @__PURE__ */ new Set();
    detachers.add(
      client.scrollable.ion({
        scroll() {
          promises.push(client.scrollable.await("scrollEnd"));
        }
      })
    );
    client.eachSubGrid(({ header, scrollable }) => {
      detachers.add(
        scrollable.ion({
          scroll() {
            promises.push(scrollable.await("scrollEnd"));
          }
        })
      );
      detachers.add(
        header.scrollable.ion({
          scroll() {
            promises.push(header.scrollable.await("scrollEnd"));
          }
        })
      );
    });
    client.state = this.state;
    await Promise.all(promises);
    detachers.forEach((fn) => fn());
  }
  beforeExport() {
    this.element = document.createElement("div");
  }
  //region DOM helpers
  cloneElement(element, target = this.element, clear = true) {
    if (clear) {
      target.innerHTML = "";
    }
    target.appendChild(element.cloneNode(true));
    DomHelper.removeEachSelector(target, ".b-grid-row,.b-grid-merged-cells-container");
    const maskEl = target.querySelector(".b-gridbase > .b-mask");
    if (maskEl) {
      maskEl.remove();
    }
  }
  createPlaceholder(el, clear = true, config = {}) {
    if (clear) {
      el.innerHTML = "";
    }
    return DomHelper.createElement(Object.assign({
      parent: el,
      id: IdHelper.generateId("export")
    }, config));
  }
  prepareElement({ client }) {
    const { tbar, bbar } = client;
    if (tbar) {
      this.element.querySelector(`#${tbar.id}`).remove();
    }
    if (bbar) {
      this.element.querySelector(`#${bbar.id}`).remove();
    }
  }
  /**
   * Appends generated header/footer element to the document body to measure their height
   * @param html
   * @returns {Number}
   * @private
   */
  measureElement(html = "") {
    if (html instanceof HTMLElement) {
      html = html.outerHTML;
    }
    const target = DomHelper.createElement({
      parent: document.body,
      style: {
        visibility: "hidden",
        position: "absolute"
      },
      // Add html to measure to a div between two other divs to take margin into account
      html: `<div style="height: 1px"></div>${html}<div style="height: 1px"></div>`
    });
    const result = target.offsetHeight - 2;
    target.remove();
    return result;
  }
  // Converts local urls to absolute
  prepareHTML(html) {
    if (html instanceof HTMLElement) {
      html = html.outerHTML;
    }
    const target = DomHelper.createElement({
      parent: document.body,
      style: {
        visibility: "hidden",
        position: "absolute"
      },
      html
    });
    const elements = target.querySelectorAll("img");
    for (let i = 0, l = elements.length; i < l; i++) {
      elements[i].setAttribute("src", elements[i].src);
    }
    const result = target.innerHTML;
    target.remove();
    return result;
  }
  getVirtualScrollerHeight(client) {
    let result = 0;
    client.eachSubGrid((subGrid) => {
      if (subGrid.overflowingHorizontally) {
        result = DomHelper.scrollBarWidth;
      }
    });
    return result === 0 ? result : result + 1;
  }
  //endregion
  // Use carefully picked values for portrait/landscape mode and fallback to legacy width/height in case use
  // has them overridden
  getPaperWidth(paperFormat, isPortrait) {
    if ("portraitWidth" in paperFormat) {
      const prop = isPortrait ? "portraitWidth" : "landscapeWidth";
      return paperFormat[prop] - (this.exportMeta.isPrinting ? getPrintPaperSizeAdjustments()[prop] : 0);
    } else {
      return isPortrait ? paperFormat.width : paperFormat.height;
    }
  }
  getPaperHeight(paperFormat, isPortrait) {
    if ("portraitHeight" in paperFormat) {
      const prop = isPortrait ? "portraitHeight" : "landscapeHeight";
      return paperFormat[prop] - (this.exportMeta.isPrinting ? getPrintPaperSizeAdjustments()[prop] : 0);
    } else {
      return isPortrait ? paperFormat.height : paperFormat.width;
    }
  }
  inchToPx(value) {
    return value * 96;
  }
  getScaleValue(base, value) {
    return Math.floor(base * 1e4 / value) / 1e4;
  }
  getVisibleRowsCount(client) {
    const rowManager = client.rowManager, firstVisibleIndex = rowManager.rows.indexOf(rowManager.firstVisibleRow), lastVisibleIndex = rowManager.rows.indexOf(rowManager.lastVisibleRow);
    let result;
    if (firstVisibleIndex !== -1) {
      if (lastVisibleIndex === -1) {
        result = client.store.count - firstVisibleIndex;
      } else {
        result = lastVisibleIndex - firstVisibleIndex + 1;
      }
    } else {
      result = client.store.count;
    }
    return result;
  }
  async export(config) {
    const me = this;
    let pages;
    me.beforeExport();
    me.saveState(config);
    await me.prepareComponent(config);
    try {
      pages = await me.getPages(config);
    } finally {
      await me.restoreComponent(config);
      me.stylesheets = null;
      await new Promise((resolve) => me.requestAnimationFrame(resolve));
      await me.restoreState(config);
    }
    return pages;
  }
  async getPages(config) {
    const generator = this.pagesExtractor(config), pages = [];
    let step;
    while ((step = await generator.next()) && !step.done) {
      pages.push(step.value);
    }
    return pages;
  }
  // Row buffer has to be adjusted to render complete row set per exported page. See virtual scrolling section in README
  // for more details
  adjustRowBuffer(client) {
    const { contentHeight } = this.exportMeta, { rowManager } = client;
    this.oldRowManagerConfig = {
      prependRowBuffer: rowManager.prependRowBuffer,
      appendRowBuffer: rowManager.appendRowBuffer
    };
    const adjustedRowBuffer = Math.ceil(contentHeight / rowManager.rowOffsetHeight);
    rowManager.prependRowBuffer = adjustedRowBuffer;
    rowManager.appendRowBuffer = adjustedRowBuffer;
    client.renderRows();
    client.rowManager.jumpToPosition(client.scrollable.y);
  }
  restoreRowBuffer(client) {
    client.rowManager.prependRowBuffer = this.oldRowManagerConfig.prependRowBuffer;
    client.rowManager.appendRowBuffer = this.oldRowManagerConfig.appendRowBuffer;
  }
  async prepareComponent(config) {
    const me = this, {
      client,
      columns,
      rowsRange,
      keepRegionSizes,
      enableDirectRendering,
      useRenderedColumnWidth
    } = config, { rowManager } = client, exportMeta = me.exportMeta = {
      enableDirectRendering,
      totalWidth: 0,
      totalHeight: 0 - (enableDirectRendering ? 0 : me.getVirtualScrollerHeight(client)),
      subGrids: {},
      isPrinting: config.useBrowserPrint
    };
    client.columns.forEach((column) => {
      if (columns.includes(column.id)) {
        column.show();
      } else {
        column.hide();
      }
    });
    await new Promise((resolve) => client.requestAnimationFrame(resolve));
    if (rowManager.rowCount > 0) {
      if (rowsRange === RowsRange.all) {
        exportMeta.firstVisibleDataIndex = rowManager.rows[0].dataIndex;
      } else {
        exportMeta.firstVisibleDataIndex = rowManager.firstVisibleRow.dataIndex;
        config.alignRows = true;
      }
      if (!enableDirectRendering) {
        await client.scrollRowIntoView(client.store.getAt(exportMeta.firstVisibleDataIndex), { block: "start" });
      }
    }
    const { element } = me;
    me.cloneElement(client.element);
    me.prepareElement(config);
    let fakeRow;
    if (enableDirectRendering) {
      exportMeta.fakeRow = fakeRow = rowManager.rowClass.new({
        cls: client.rowCls,
        rowManager,
        grid: client,
        // use fake indices, they aren't really required
        index: -10,
        dataIndex: -10
      });
    }
    client.eachSubGrid((subGrid) => {
      var _a, _b, _c;
      if (fakeRow) {
        subGrid.onAddRow({ rows: [fakeRow], isExport: true });
        fakeRow.element.dataset.ownerCmp = client.id;
      }
      const placeHolder = me.createPlaceholder(element.querySelector(`[id="${subGrid.id}"]`), false);
      let width;
      if (keepRegionSizes == null ? void 0 : keepRegionSizes[subGrid.region]) {
        width = subGrid.element.offsetWidth;
      } else {
        const { visibleColumns } = subGrid.columns;
        if (
          // If there is only one visible column...
          visibleColumns.length === 1 && // ...and it is not a timeaxis column, which should always take as much space as possible
          !visibleColumns[0].isTimeAxisColumn && // ...and originally in grid there was only one visible column and it is the same one
          me.state.columns.filter((c) => c.region === subGrid.region && !c.hidden && c.id !== visibleColumns[0].id).length === 0
        ) {
          width = subGrid.element.offsetWidth;
        } else {
          width = subGrid.columns.visibleColumns.reduce((result, column) => {
            if (!useRenderedColumnWidth && typeof column.width === "number") {
              result += column.width;
            } else {
              result += (client.hideHeaders ? rowManager.rows[0].getCell(column.id) : column.element).offsetWidth;
            }
            return result;
          }, 0);
        }
      }
      exportMeta.totalWidth += width;
      const splitterWidth = ((_a = subGrid.splitterElement) == null ? void 0 : _a.offsetWidth) || 0;
      exportMeta.totalWidth += splitterWidth;
      exportMeta.subGrids[subGrid.region] = {
        id: subGrid.id,
        headerId: ((_b = subGrid.header) == null ? void 0 : _b.id) || null,
        footerId: ((_c = subGrid.footer) == null ? void 0 : _c.id) || null,
        rows: [],
        splitterWidth,
        placeHolder,
        width
      };
    });
  }
  prepareExportElement() {
    const me = this, { element, exportMeta } = me;
    Object.values(exportMeta.subGrids).forEach(({ width, id, headerId, footerId }) => {
      [id, headerId, footerId].forEach((id2) => {
        if (id2) {
          const childElement = element.querySelector(`[id="${id2}"]`);
          if (childElement) {
            childElement.style.width = `${width}px`;
            childElement.style.flex = "";
          }
        }
      });
    });
    return element.innerHTML;
  }
  async restoreComponent(config) {
    if (this.exportMeta.fakeRow) {
      this.exportMeta.fakeRow.destroy();
      delete this.exportMeta.fakeRow;
    }
  }
  async scrollRowIntoView(client, index) {
    await client.scrollRowIntoView(client.store.getAt(index), { block: "start" });
    await new Promise((resolve) => this.requestAnimationFrame(resolve));
  }
  collectRow(row) {
    const subGrids = this.exportMeta.subGrids, re = /data-owner-cmp=".+?"/;
    Object.entries(row.elements).forEach(([key, value]) => {
      subGrids[key].rows.push([
        value.outerHTML.replace(re, ""),
        row.top,
        row.offsetHeight,
        /* @__PURE__ */ new Map()
        // This one is used to collect events (or in general additional row content)
      ]);
    });
  }
  renderMergedCells(config, fromIndex, toIndex, rows) {
    const me = this, { client } = config, { subGrids } = me.exportMeta, domConfigMap = client.features.mergeCells.buildMergedCellsConfig(fromIndex, toIndex, rows);
    for (const subGridName in subGrids) {
      const subGrid = subGrids[subGridName], target = document.createElement("div");
      DomSync.sync({
        targetElement: target,
        domConfig: {
          children: domConfigMap[subGridName].children
        }
      });
      if (target.childNodes.length) {
        target.childNodes.forEach((child) => {
          const { syncId } = child.dataset, range = client.features.mergeCells.mergedRanges.find((range2) => {
            var _a;
            return ((_a = range2.cellElement) == null ? void 0 : _a.parentNode.dataset.syncId) === syncId;
          });
          if (range) {
            child.innerHTML = range.cellElement.outerHTML;
          }
        });
        subGrid.mergedCellsHtml = [target.innerHTML];
      }
    }
  }
};
Exporter.prototype.pagesExtractor = async function* pagesExtractor() {
  throw new Error("Implement this method in a subclass");
};
Exporter._$name = "Exporter";

// ../Grid/lib/Grid/feature/export/exporter/MultiPageExporter.js
var MultiPageExporter = class extends Exporter {
  static get $name() {
    return "MultiPageExporter";
  }
  static get type() {
    return "multipage";
  }
  static get title() {
    return this.L("L{multipage}");
  }
  static get exportingPageText() {
    return "L{exportingPage}";
  }
  //region State management
  async stateNextPage({ client, rowsRange, enableDirectRendering }) {
    const { exportMeta } = this;
    ++exportMeta.currentPage;
    ++exportMeta.verticalPosition;
    delete exportMeta.lastExportedRowBottom;
    if (exportMeta.verticalPosition >= exportMeta.verticalPages) {
      Object.assign(exportMeta, {
        verticalPosition: 0,
        horizontalPosition: exportMeta.horizontalPosition + 1,
        currentPageTopMargin: 0,
        lastTop: 0,
        lastRowIndex: rowsRange === RowsRange.visible ? client.rowManager.firstVisibleRow.dataIndex : 0
      });
      delete exportMeta.lastRowDataIndex;
      if (!enableDirectRendering) {
        await this.scrollRowIntoView(client, exportMeta.firstVisibleDataIndex, { block: "start" });
      }
    }
  }
  //endregion
  //region Preparation
  async prepareComponent(config) {
    await super.prepareComponent(config);
    const me = this, { exportMeta } = me, {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      rowsRange,
      enableDirectRendering
    } = config, paperFormat = PaperFormat[config.paperFormat], isPortrait = config.orientation === Orientation.portrait, paperWidth = me.getPaperWidth(paperFormat, isPortrait), paperHeight = me.getPaperHeight(paperFormat, isPortrait), pageWidth = me.inchToPx(paperWidth), pageHeight = me.inchToPx(paperHeight), onlyVisibleRows = rowsRange === RowsRange.visible, horizontalPages = Math.ceil(exportMeta.totalWidth / pageWidth);
    let contentHeight = pageHeight;
    if (headerTpl) {
      contentHeight -= me.measureElement(headerTpl({
        totalWidth: exportMeta.totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }
    if (footerTpl) {
      contentHeight -= me.measureElement(footerTpl({
        totalWidth: exportMeta.totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }
    let totalHeight, verticalPages, totalRows = client.store.count;
    if (onlyVisibleRows) {
      totalRows = me.getVisibleRowsCount(client);
      totalHeight = exportMeta.totalHeight + client.headerHeight + client.footerHeight + client.bodyHeight;
    } else {
      totalHeight = exportMeta.totalHeight + client.headerHeight + client.footerHeight + client.scrollable.scrollHeight;
    }
    if (alignRows && !onlyVisibleRows) {
      const rowHeight = client.rowManager.rowOffsetHeight, rowsOnFirstPage = Math.floor((contentHeight - client.headerHeight) / rowHeight), rowsPerPage = Math.floor(contentHeight / rowHeight), remainingRows = totalRows - rowsOnFirstPage;
      verticalPages = 1 + Math.ceil(remainingRows / rowsPerPage);
    } else {
      verticalPages = Math.ceil(totalHeight / contentHeight);
    }
    Object.assign(exportMeta, {
      paperWidth,
      paperHeight,
      pageWidth,
      pageHeight,
      horizontalPages,
      verticalPages,
      totalHeight,
      contentHeight,
      totalRows,
      totalPages: horizontalPages * verticalPages,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0,
      currentPageTopMargin: 0,
      lastTop: 0,
      lastRowIndex: onlyVisibleRows ? client.rowManager.firstVisibleRow.dataIndex : 0
    });
    if (!enableDirectRendering) {
      this.adjustRowBuffer(client);
    }
  }
  async restoreComponent(config) {
    await super.restoreComponent(config);
    if (!config.enableDirectRendering) {
      this.restoreRowBuffer(config.client);
    }
  }
  //endregion
  async collectRows(config) {
    const me = this, { exportMeta } = me, {
      client,
      alignRows,
      rowsRange
    } = config, {
      subGrids,
      currentPageTopMargin,
      verticalPosition,
      contentHeight,
      totalRows,
      lastRowDataIndex
    } = exportMeta, { rowManager } = client, { rows } = rowManager, onlyVisible = rowsRange === RowsRange.visible, hasMergeCells = client.hasActiveFeature("mergeCells");
    let remainingHeight, index;
    if (onlyVisible && lastRowDataIndex != null) {
      if (lastRowDataIndex === rows[rows.length - 1].dataIndex) {
        index = rows.length - 1;
      } else {
        index = rows.findIndex((r) => r.dataIndex === lastRowDataIndex);
      }
    } else {
      index = onlyVisible ? rows.findIndex((r) => r.bottom > Math.ceil(client.scrollable.y)) : rows.findIndex((r) => r.bottom + currentPageTopMargin + client.headerHeight > 0);
    }
    const firstRowIndex = index, overflowingHeight = onlyVisible || verticalPosition === 0 ? 0 : rows[index].top + currentPageTopMargin + client.headerHeight;
    remainingHeight = contentHeight - overflowingHeight;
    if (verticalPosition === 0) {
      remainingHeight -= client.headerHeight;
    }
    let lastDataIndex, offset = 0;
    while (remainingHeight > 0) {
      const row = rows[index];
      if (alignRows && remainingHeight < row.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0;
        me.exportMeta.lastExportedRowBottom = rows[index - 1].bottom;
      } else {
        me.collectRow(row);
        remainingHeight -= row.offsetHeight;
        lastDataIndex = row.dataIndex;
        if (++index === rows.length && remainingHeight > 0) {
          remainingHeight = 0;
        } else if (onlyVisible && index - firstRowIndex === totalRows) {
          remainingHeight = 0;
        }
      }
    }
    if (hasMergeCells) {
      for (const subGridName in subGrids) {
        const subGrid = subGrids[subGridName], mergedCells = client.subGrids[subGridName].element.querySelectorAll(`.b-grid-merged-cells`);
        subGrid.mergedCellsHtml = [];
        for (const mergedCell of mergedCells) {
          subGrid.mergedCellsHtml.push(mergedCell.outerHTML);
        }
      }
    }
    const lastRow = rows[index - 1];
    if (lastRow) {
      exportMeta.exactGridHeight = lastRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
      exportMeta.lastRowDataIndex = lastRow.dataIndex + 1;
    }
    await me.onRowsCollected(rows.slice(firstRowIndex, index), config);
    if (onlyVisible) {
      exportMeta.exactGridHeight -= exportMeta.scrollableTopMargin = client.scrollable.y;
    } else {
      const detacher = rowManager.ion({ offsetRows: ({ offset: value }) => offset += value });
      await me.scrollRowIntoView(client, lastDataIndex + 1);
      detacher();
    }
    return offset;
  }
  async renderRows(config) {
    const me = this, { exportMeta } = me, {
      client,
      alignRows,
      rowsRange
    } = config, {
      currentPageTopMargin,
      verticalPosition,
      contentHeight,
      totalRows,
      lastRowIndex,
      fakeRow
    } = exportMeta, { store } = client, hasMergeCells = client.hasActiveFeature("mergeCells"), onlyVisibleRows = rowsRange === RowsRange.visible;
    let index = lastRowIndex, { lastTop } = exportMeta, remainingHeight;
    const firstRowIndex = index, overflowingHeight = onlyVisibleRows || verticalPosition === 0 ? 0 : lastTop + currentPageTopMargin + client.headerHeight, rows = [];
    remainingHeight = contentHeight - overflowingHeight;
    if (verticalPosition === 0) {
      remainingHeight -= client.headerHeight;
    }
    let lastDataIndex, previousTop, offset = 0;
    while (remainingHeight > 0) {
      fakeRow.render(index, store.getAt(index), true, false, true);
      if (alignRows && remainingHeight < fakeRow.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0;
        me.exportMeta.lastExportedRowBottom = lastTop;
      } else {
        previousTop = lastTop;
        lastDataIndex = index;
        lastTop = fakeRow.translate(lastTop);
        remainingHeight -= fakeRow.offsetHeight;
        me.collectRow(fakeRow);
        rows.push({
          top: fakeRow.top,
          bottom: fakeRow.bottom,
          offsetHeight: fakeRow.offsetHeight,
          dataIndex: fakeRow.dataIndex
        });
        if (++index === store.count && remainingHeight > 0) {
          remainingHeight = 0;
        } else if (onlyVisibleRows && index - firstRowIndex === totalRows) {
          remainingHeight = 0;
        }
      }
    }
    if (hasMergeCells) {
      me.renderMergedCells(config, firstRowIndex, index, rows);
    }
    exportMeta.lastRowIndex = alignRows ? index : lastDataIndex;
    exportMeta.lastTop = alignRows ? lastTop : previousTop;
    if (fakeRow) {
      exportMeta.exactGridHeight = fakeRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
    }
    await me.onRowsCollected(rows, config);
    return offset;
  }
  async buildPage(config) {
    const me = this, { exportMeta } = me, {
      client,
      headerTpl,
      footerTpl,
      enableDirectRendering
    } = config, {
      totalWidth,
      totalPages,
      currentPage,
      subGrids
    } = exportMeta;
    Object.values(subGrids).forEach((subGrid) => subGrid.rows = []);
    if (config.rowsRange === RowsRange.all) {
      exportMeta.totalHeight = client.height - client.bodyHeight + client.scrollable.scrollHeight - me.getVirtualScrollerHeight(client);
    }
    let header, footer;
    if (headerTpl) {
      header = me.prepareHTML(headerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    }
    if (footerTpl) {
      footer = me.prepareHTML(footerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    }
    let offset;
    if (enableDirectRendering) {
      offset = await me.renderRows(config);
    } else {
      offset = await me.collectRows(config);
    }
    const html = me.buildPageHtml(config);
    return { html, header, footer, offset };
  }
  async onRowsCollected() {
  }
  buildPageHtml() {
    const me = this, { subGrids } = me.exportMeta;
    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({ placeHolder, rows, mergedCellsHtml }) => {
      const placeHolderText = placeHolder.outerHTML;
      let contentHtml = rows.reduce((result, row) => {
        result += row[0];
        return result;
      }, "");
      if (mergedCellsHtml == null ? void 0 : mergedCellsHtml.length) {
        contentHtml += `<div class="b-grid-merged-cells-container">${mergedCellsHtml.join("")}</div>`;
      }
      html = html.replace(placeHolderText, contentHtml);
    });
    return html;
  }
  prepareExportElement() {
    const me = this, { element, exportMeta } = me;
    if (exportMeta.scrollableTopMargin) {
      element.querySelector(".b-grid-vertical-scroller").style.marginTop = `-${exportMeta.scrollableTopMargin}px`;
    }
    return super.prepareExportElement();
  }
};
MultiPageExporter.prototype.pagesExtractor = async function* pagesExtractor2(config) {
  const me = this, {
    exportMeta,
    stylesheets
  } = me, {
    totalWidth,
    totalPages,
    paperWidth,
    paperHeight,
    realPaperWidth,
    realPaperHeight,
    contentHeight
  } = exportMeta, isPrint = config.useBrowserPrint;
  let currentPage;
  while ((currentPage = exportMeta.currentPage) < totalPages) {
    me.trigger("exportStep", { text: me.L(MultiPageExporter.exportingPageText, { currentPage, totalPages }), progress: Math.round((currentPage + 1) / totalPages * 90) });
    const { html, header, footer, offset } = await me.buildPage(config);
    const styles = [
      ...stylesheets,
      `
                <style>
                    .b-page-wrap {
                        width: ${paperWidth}in;
                        height: ${paperHeight}in;
                    }
                    .b-page-${currentPage} #${config.client.id} {
                        height: ${exportMeta.exactGridHeight}px !important;
                        width: ${totalWidth}px !important;
                    }
                    .b-page-${currentPage} .b-export-body .b-export-viewport {
                        transform: translate(${-paperWidth * exportMeta.horizontalPosition}in, ${exportMeta.currentPageTopMargin}px);
                    }
                </style>
            `
    ];
    exportMeta.currentPageTopMargin -= contentHeight + offset;
    await me.stateNextPage(config);
    yield {
      html: me.pageTpl({
        html,
        header,
        footer,
        styles,
        paperWidth,
        paperHeight,
        realPaperWidth,
        realPaperHeight,
        currentPage,
        isPrint
      })
    };
  }
};
MultiPageExporter._$name = "MultiPageExporter";

// ../Grid/lib/Grid/feature/export/exporter/MultiPageVerticalExporter.js
var MultiPageVerticalExporter = class extends Exporter {
  static get $name() {
    return "MultiPageVerticalExporter";
  }
  static get type() {
    return "multipagevertical";
  }
  static get title() {
    return this.L("L{multipagevertical}");
  }
  static get exportingPageText() {
    return "L{exportingPage}";
  }
  //region State management
  async stateNextPage({ client }) {
    const { exportMeta } = this, {
      totalRows,
      processedRows,
      totalPages
    } = exportMeta;
    ++exportMeta.currentPage;
    ++exportMeta.verticalPosition;
    if (exportMeta.currentPage === totalPages && processedRows.size !== totalRows) {
      ++exportMeta.totalPages;
      ++exportMeta.verticalPages;
    }
  }
  //endregion
  estimateTotalPages(config) {
    const me = this, { exportMeta } = me, {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      rowsRange,
      repeatHeader,
      enableDirectRendering
    } = config, {
      pageWidth,
      pageHeight,
      totalWidth
    } = exportMeta, scale = me.getScaleValue(pageWidth, totalWidth);
    let totalHeight = 0 - me.getVirtualScrollerHeight(client) + client.height - client.bodyElement.offsetHeight + client.scrollable.scrollHeight, contentHeight = pageHeight / scale, totalRows = client.store.count, initialScroll = 0, rowsHeight = totalHeight, verticalPages;
    if (headerTpl) {
      contentHeight -= me.measureElement(headerTpl({
        totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }
    if (footerTpl) {
      contentHeight -= me.measureElement(footerTpl({
        totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }
    if (repeatHeader) {
      contentHeight -= client.headerHeight + client.footerHeight;
      totalHeight -= client.headerHeight + client.footerHeight;
    }
    if (rowsRange === RowsRange.visible) {
      const rowManager = client.rowManager, firstRow = rowManager.firstVisibleRow, lastRow = rowManager.lastVisibleRow;
      if (!enableDirectRendering) {
        initialScroll = firstRow.top;
      }
      totalRows = me.getVisibleRowsCount(client);
      if (enableDirectRendering) {
        totalHeight = client.headerHeight + client.footerHeight + lastRow.bottom - firstRow.top;
        rowsHeight = lastRow.bottom - firstRow.top;
      } else {
        rowsHeight = totalHeight = totalHeight - client.scrollable.scrollHeight + lastRow.bottom - firstRow.top;
      }
      exportMeta.lastRowIndex = firstRow.dataIndex;
      exportMeta.finishRowIndex = lastRow.dataIndex;
    } else {
      exportMeta.finishRowIndex = client.store.count - 1;
    }
    if (alignRows && !repeatHeader && rowsRange !== RowsRange.visible) {
      const rowHeight = client.rowManager.rowOffsetHeight, rowsOnFirstPage = Math.floor((contentHeight - client.headerHeight) / rowHeight), rowsPerPage = Math.floor(contentHeight / rowHeight), remainingRows = totalRows - rowsOnFirstPage;
      verticalPages = 1 + Math.ceil(remainingRows / rowsPerPage);
    } else {
      verticalPages = Math.ceil(rowsHeight / contentHeight);
    }
    Object.assign(exportMeta, {
      scale,
      contentHeight,
      totalRows,
      totalHeight,
      verticalPages,
      initialScroll,
      horizontalPages: 1,
      totalPages: verticalPages
    });
  }
  async prepareComponent(config) {
    await super.prepareComponent(config);
    const me = this, { exportMeta } = me, { client } = config, paperFormat = PaperFormat[config.paperFormat], isPortrait = config.orientation === Orientation.portrait, paperWidth = me.getPaperWidth(paperFormat, isPortrait), paperHeight = me.getPaperHeight(paperFormat, isPortrait), pageWidth = me.inchToPx(paperWidth), pageHeight = me.inchToPx(paperHeight), horizontalPages = 1;
    Object.assign(exportMeta, {
      paperWidth,
      paperHeight,
      realPaperWidth: me.getPaperWidth(paperFormat, isPortrait),
      realPaperHeight: me.getPaperHeight(paperFormat, isPortrait),
      pageWidth,
      pageHeight,
      horizontalPages,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0,
      currentPageTopMargin: 0,
      lastTop: 0,
      lastRowIndex: 0,
      processedRows: /* @__PURE__ */ new Set()
    });
    me.estimateTotalPages(config);
    if (!config.enableDirectRendering) {
      me.adjustRowBuffer(client);
    }
  }
  async restoreComponent(config) {
    await super.restoreComponent(config);
    if (!config.enableDirectRendering) {
      this.restoreRowBuffer(config.client);
    }
  }
  async collectRows(config) {
    const me = this, { exportMeta } = me, {
      client,
      alignRows,
      repeatHeader
    } = config, {
      subGrids,
      currentPageTopMargin,
      verticalPosition,
      totalRows,
      contentHeight
    } = exportMeta, clientHeaderHeight = repeatHeader ? 0 : client.headerHeight, { rowManager } = client, { rows } = rowManager, onlyVisibleRows = config.rowsRange === RowsRange.visible, hasMergeCells = client.hasActiveFeature("mergeCells");
    let index = onlyVisibleRows ? rows.findIndex((r) => r.bottom > client.scrollable.y) : rows.findIndex((r) => r.bottom + currentPageTopMargin + clientHeaderHeight > 0), remainingHeight;
    const firstRowIndex = index, overflowingHeight = verticalPosition === 0 ? 0 : rows[index].top + currentPageTopMargin + clientHeaderHeight;
    remainingHeight = contentHeight - overflowingHeight;
    if (verticalPosition === 0) {
      remainingHeight -= clientHeaderHeight;
    }
    let lastDataIndex, offset = 0;
    while (remainingHeight > 0) {
      const row = rows[index];
      if (alignRows && remainingHeight < row.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0;
      } else {
        me.collectRow(row);
        remainingHeight -= row.offsetHeight;
        if (remainingHeight > 0) {
          exportMeta.processedRows.add(row.dataIndex);
        }
        lastDataIndex = row.dataIndex;
        if (++index === rows.length && remainingHeight > 0) {
          remainingHeight = 0;
        } else if (onlyVisibleRows && index - firstRowIndex === totalRows) {
          remainingHeight = 0;
        }
      }
    }
    if (hasMergeCells) {
      for (const subGridName in subGrids) {
        const subGrid = subGrids[subGridName], mergedCells = client.subGrids[subGridName].element.querySelectorAll(`.b-grid-merged-cells`);
        subGrid.mergedCellsHtml = [];
        for (const mergedCell of mergedCells) {
          subGrid.mergedCellsHtml.push(mergedCell.outerHTML);
        }
      }
    }
    const lastRow = rows[index - 1];
    if (lastRow) {
      exportMeta.exactGridHeight = lastRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
    }
    await me.onRowsCollected(rows.slice(firstRowIndex, index), config);
    if (onlyVisibleRows) {
      exportMeta.scrollableTopMargin = client.scrollable.y;
    } else {
      const detacher = rowManager.ion({ offsetRows: ({ offset: value }) => offset += value });
      await me.scrollRowIntoView(client, lastDataIndex + 1);
      detacher();
    }
    return offset;
  }
  async renderRows(config) {
    const me = this, { exportMeta } = me, {
      client,
      alignRows,
      repeatHeader
    } = config, {
      currentPageTopMargin,
      verticalPosition,
      totalRows,
      contentHeight,
      lastRowIndex,
      finishRowIndex,
      fakeRow
    } = exportMeta, clientHeaderHeight = repeatHeader ? 0 : client.headerHeight, { store } = client, hasMergeCells = client.hasActiveFeature("mergeCells"), onlyVisibleRows = config.rowsRange === RowsRange.visible;
    let index = lastRowIndex, { lastTop } = exportMeta, remainingHeight;
    const firstRowIndex = index, overflowingHeight = verticalPosition === 0 ? 0 : lastTop + currentPageTopMargin + clientHeaderHeight, rows = [];
    remainingHeight = contentHeight - overflowingHeight;
    if (verticalPosition === 0) {
      remainingHeight -= clientHeaderHeight;
    }
    let lastDataIndex, nextPageTop, offset = 0;
    while (remainingHeight > 0) {
      fakeRow.render(index, store.getAt(index), true, false, true);
      if (alignRows && remainingHeight < fakeRow.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0;
      } else {
        nextPageTop = lastTop;
        lastDataIndex = index;
        lastTop = fakeRow.translate(lastTop);
        remainingHeight -= fakeRow.offsetHeight;
        me.collectRow(fakeRow);
        rows.push({
          top: fakeRow.top,
          bottom: fakeRow.bottom,
          offsetHeight: fakeRow.offsetHeight,
          dataIndex: fakeRow.dataIndex
        });
        if (remainingHeight > 0) {
          exportMeta.processedRows.add(index);
        }
        if (index === finishRowIndex) {
          remainingHeight = 0;
        } else if (++index - firstRowIndex === totalRows && onlyVisibleRows) {
          remainingHeight = 0;
        }
      }
    }
    if (hasMergeCells) {
      me.renderMergedCells(config, firstRowIndex, index, rows);
    }
    exportMeta.lastRowIndex = lastDataIndex;
    exportMeta.lastTop = nextPageTop;
    if (fakeRow) {
      exportMeta.exactGridHeight = fakeRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
    }
    await me.onRowsCollected(rows, config);
    return offset;
  }
  async buildPage(config) {
    const me = this, { exportMeta } = me, {
      client,
      headerTpl,
      footerTpl,
      enableDirectRendering
    } = config, {
      totalWidth,
      totalPages,
      currentPage,
      subGrids
    } = exportMeta;
    Object.values(subGrids).forEach((subGrid) => subGrid.rows = []);
    if (config.rowsRange === RowsRange.all) {
      exportMeta.totalHeight = client.headerHeight + client.footerHeight + client.scrollable.scrollHeight;
      if (!enableDirectRendering) {
        exportMeta.totalHeight -= me.getVirtualScrollerHeight(client);
      }
    }
    let header, footer, offset;
    if (headerTpl) {
      header = me.prepareHTML(headerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    }
    if (footerTpl) {
      footer = me.prepareHTML(footerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    }
    if (enableDirectRendering) {
      offset = await me.renderRows(config);
    } else {
      offset = await me.collectRows(config);
    }
    const html = me.buildPageHtml(config);
    return { html, header, footer, offset };
  }
  async onRowsCollected() {
  }
  buildPageHtml() {
    const me = this, { subGrids } = me.exportMeta;
    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({ placeHolder, rows, mergedCellsHtml }) => {
      const placeHolderText = placeHolder.outerHTML;
      let contentHtml = rows.reduce((result, row) => {
        result += row[0];
        return result;
      }, "");
      if (mergedCellsHtml == null ? void 0 : mergedCellsHtml.length) {
        contentHtml += `<div class="b-grid-merged-cells-container">${mergedCellsHtml.join("")}</div>`;
      }
      html = html.replace(placeHolderText, contentHtml);
    });
    return html;
  }
};
MultiPageVerticalExporter.prototype.pagesExtractor = async function* pagesExtractor3(config) {
  const me = this, {
    exportMeta,
    stylesheets
  } = me, {
    totalWidth,
    paperWidth,
    paperHeight,
    realPaperWidth,
    realPaperHeight,
    contentHeight,
    scale,
    initialScroll
  } = exportMeta, isPrint = config.useBrowserPrint;
  let { totalPages } = exportMeta, currentPage, style;
  while ((currentPage = exportMeta.currentPage) < totalPages) {
    me.trigger("exportStep", {
      text: me.L(MultiPageVerticalExporter.exportingPageText, { currentPage, totalPages }),
      progress: Math.round((currentPage + 1) / totalPages * 90)
    });
    const { html, header, footer, offset } = await me.buildPage(config);
    style = `
            ${isPrint ? `
                        .b-page-wrap {
                            width: ${realPaperWidth}in;
                            height: ${realPaperHeight}in;
                        }
                        .b-print:not(.b-firefox) .b-export-content {
                            zoom: ${scale};
                            height: 100%;
                        }
                        .b-print.b-firefox .b-export-content {
                            transform: scale(${scale});
                            transform-origin: top left;
                            height: ${100 / scale}%;
                            width: ${100 / scale}%;
                        }
                    ` : `
                        .b-export .b-page-${currentPage}.b-export-content {
                            transform: scale(${scale});
                            transform-origin: top left;
                            height: ${100 / scale}%;
                            width: ${100 / scale}%;
                        }
                    `}
        `;
    if (config.repeatHeader) {
      const gridHeight = exportMeta.exactGridHeight ? `${exportMeta.exactGridHeight + exportMeta.currentPageTopMargin}px` : "100%";
      style = `
                ${style}
                .b-page-${currentPage} #${config.client.id} {
                    height: ${gridHeight} !important;
                    width: ${totalWidth}px !important;
                }
                .b-export-body {
                    height: 100%;
                    display: flex;
                }
                .b-export-viewport {
                    height: 100%;
                }
                .b-page-${currentPage} .b-grid-vertical-scroller {
                    margin-top: ${exportMeta.currentPageTopMargin - initialScroll}px;
                }
            `;
    } else {
      const gridHeight = exportMeta.exactGridHeight || contentHeight - exportMeta.currentPageTopMargin;
      style = `
                ${style}
                .b-page-${currentPage} #${config.client.id} {
                    height: ${gridHeight}px !important;
                    width: ${totalWidth}px !important;
                }
                .b-export-body {
                    overflow: hidden;
                }
                .b-page-${currentPage} .b-export-body .b-export-viewport {
                    margin-top: ${exportMeta.currentPageTopMargin}px;
                }
                .b-page-${currentPage} .b-grid-vertical-scroller {
                    margin-top: -${initialScroll}px;
                }
            `;
    }
    const styles = [
      ...stylesheets,
      `<style>${style}</style>`
    ];
    exportMeta.currentPageTopMargin -= contentHeight + offset;
    await me.stateNextPage(config);
    ({ totalPages } = exportMeta);
    yield {
      html: me.pageTpl({
        html,
        header,
        footer,
        styles,
        paperWidth,
        paperHeight,
        realPaperWidth,
        realPaperHeight,
        currentPage,
        isPrint
      })
    };
  }
};
MultiPageVerticalExporter._$name = "MultiPageVerticalExporter";

// ../Grid/lib/Grid/feature/export/exporter/SinglePageExporter.js
var SinglePageExporter = class extends Exporter {
  static get $name() {
    return "SinglePageExporter";
  }
  static get type() {
    return "singlepage";
  }
  static get title() {
    return this.localize("L{singlepage}");
  }
  static get defaultConfig() {
    return {
      /**
       * Set to true to center content horizontally on the page
       * @config {Boolean}
       */
      centerContentHorizontally: false
    };
  }
  async prepareComponent(config) {
    await super.prepareComponent(config);
    Object.assign(this.exportMeta, {
      verticalPages: 1,
      horizontalPages: 1,
      totalPages: 1,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0
    });
  }
  async onRowsCollected() {
  }
  positionRows(rows, config) {
    if (config.enableDirectRendering) {
      return rows.map((r) => r[0]);
    } else {
      let currentTop = 0;
      return rows.map(([html, , height]) => {
        const result = html.replace(/translate\(\d+px, \d+px\)/, `translate(0px, ${currentTop}px)`);
        currentTop += height;
        return result;
      });
    }
  }
  async collectRows(config) {
    const me = this, { client } = config, { rowManager, store } = client, hasMergeCells = client.hasActiveFeature("mergeCells"), { subGrids } = me.exportMeta, totalRows = config.rowsRange === RowsRange.visible && store.count ? me.getVisibleRowsCount(client) : store.count;
    let { totalHeight } = me.exportMeta, processedRows = 0, lastDataIndex = -1;
    if (rowManager.rows.length > 0) {
      if (config.rowsRange === RowsRange.visible) {
        lastDataIndex = rowManager.firstVisibleRow.dataIndex - 1;
      }
      if (hasMergeCells) {
        for (const subGrid of Object.values(subGrids)) {
          subGrid.mergedCellsHtml = [];
        }
      }
      while (processedRows < totalRows) {
        const rows = rowManager.rows, lastRow = rows[rows.length - 1], lastProcessedRowIndex = processedRows;
        rows.forEach((row) => {
          if (row.dataIndex > lastDataIndex && processedRows < totalRows) {
            ++processedRows;
            totalHeight += row.offsetHeight;
            me.collectRow(row);
          }
        });
        if (hasMergeCells) {
          for (const subGridName in subGrids) {
            const subGrid = subGrids[subGridName], mergedCells = client.subGrids[subGridName].element.querySelectorAll(`.b-grid-merged-cells`);
            for (const mergedCell of mergedCells) {
              subGrid.mergedCellsHtml.push(mergedCell.outerHTML);
            }
          }
        }
        const firstNewRowIndex = rows.findIndex((r) => r.dataIndex === lastDataIndex + 1), lastNewRowIndex = firstNewRowIndex + (processedRows - lastProcessedRowIndex);
        await me.onRowsCollected(rows.slice(firstNewRowIndex, lastNewRowIndex), config);
        if (processedRows < totalRows) {
          lastDataIndex = lastRow.dataIndex;
          await me.scrollRowIntoView(client, lastDataIndex + 1);
        }
      }
    }
    return totalHeight;
  }
  async renderRows(config) {
    const me = this, { client, rowsRange } = config, { rowManager, store } = client, hasMergeCells = client.hasActiveFeature("mergeCells"), onlyVisibleRows = rowsRange === RowsRange.visible;
    let { totalHeight } = me.exportMeta;
    if (store.count) {
      const { fakeRow } = me.exportMeta, { firstVisibleRow } = rowManager, fromIndex = onlyVisibleRows ? firstVisibleRow.dataIndex : 0, toIndex = onlyVisibleRows ? rowManager.lastVisibleRow.dataIndex : store.count - 1, rows = [];
      let top = 0;
      if (fakeRow.cells.length) {
        for (let i = fromIndex; i <= toIndex; i++) {
          fakeRow.render(i, store.getAt(i), true, false, true);
          top = fakeRow.translate(top);
          me.collectRow(fakeRow);
          rows.push({
            top: fakeRow.top,
            bottom: fakeRow.bottom,
            offsetHeight: fakeRow.offsetHeight,
            dataIndex: fakeRow.dataIndex
          });
        }
        await me.onRowsCollected(rows, config);
      }
      totalHeight += top;
      if (hasMergeCells) {
        me.renderMergedCells(config, fromIndex, toIndex, rows);
      }
    }
    return totalHeight;
  }
  buildPageHtml(config) {
    const me = this, { subGrids } = me.exportMeta;
    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({ placeHolder, rows, mergedCellsHtml }) => {
      const placeHolderText = placeHolder.outerHTML;
      let contentHtml = me.positionRows(rows, config).join("");
      if (mergedCellsHtml == null ? void 0 : mergedCellsHtml.length) {
        contentHtml += `<div class="b-grid-merged-cells-container">${mergedCellsHtml.join("")}</div>`;
      }
      html = html.replace(placeHolderText, contentHtml);
    });
    return html;
  }
};
SinglePageExporter.prototype.pagesExtractor = async function* pagesExtractor4(config) {
  const me = this, { client } = config, { totalWidth } = me.exportMeta, styles = me.stylesheets, portrait = config.orientation === Orientation.portrait, paperFormat = PaperFormat[config.paperFormat], isPrint = config.useBrowserPrint, paperWidth = me.getPaperWidth(paperFormat, portrait), paperHeight = me.getPaperHeight(paperFormat, portrait), realPaperWidth = me.getPaperWidth(paperFormat, portrait), realPaperHeight = me.getPaperHeight(paperFormat, portrait);
  let totalHeight, header, footer;
  if (config.enableDirectRendering) {
    totalHeight = await me.renderRows(config);
    totalHeight += client.headerHeight + client.footerHeight;
  } else {
    totalHeight = await me.collectRows(config);
    totalHeight += client.height - client.bodyHeight;
  }
  const html = me.buildPageHtml(config);
  const totalClientHeight = totalHeight;
  if (config.headerTpl) {
    header = me.prepareHTML(config.headerTpl({ totalWidth }));
    const height = me.measureElement(header);
    totalHeight += height;
  }
  if (config.footerTpl) {
    footer = me.prepareHTML(config.footerTpl({ totalWidth }));
    const height = me.measureElement(footer);
    totalHeight += height;
  }
  const widthScale = Math.min(1, me.getScaleValue(me.inchToPx(paperWidth), totalWidth)), heightScale = Math.min(1, me.getScaleValue(me.inchToPx(paperHeight), totalHeight)), scale = Math.min(widthScale, heightScale);
  styles.push(
    `<style>
                #${client.id} {
                    height: ${totalClientHeight}px !important;
                    width: ${totalWidth}px !important;
                }
                ${isPrint ? `
                            html, body {
                                overflow: hidden;
                            }
                            .b-page-wrap {
                                width: ${realPaperWidth}in;
                                height: ${realPaperHeight}in;
                            }
                            .b-print:not(.b-firefox) .b-export-content {
                                zoom: ${scale};
                                height: 100%;
                            }
                            .b-print.b-firefox .b-export-content {
                                transform: scale(${scale}) ${me.centerContentHorizontally ? "translateX(-50%)" : ""};
                                transform-origin: top left;
                                height: ${scale === 1 ? "inherit" : "auto !important"};
                            }
                            .b-export-content {
                                ${me.centerContentHorizontally ? "left: 50%;" : ""}
                            }
                        ` : `
                            .b-export-content {
                                ${me.centerContentHorizontally ? "left: 50%;" : ""}
                                transform: scale(${scale}) ${me.centerContentHorizontally ? "translateX(-50%)" : ""};
                                transform-origin: top left;
                                height: ${scale === 1 ? "inherit" : "auto !important"};
                            }
                        `}
            </style>`
  );
  yield {
    html: me.pageTpl({
      html,
      header,
      footer,
      styles,
      paperWidth,
      paperHeight,
      realPaperHeight,
      realPaperWidth,
      currentPage: 0,
      isPrint: config.useBrowserPrint
    })
  };
};
SinglePageExporter._$name = "SinglePageExporter";

// ../Grid/lib/Grid/feature/export/PdfExport.js
var PdfExport = class extends InstancePlugin {
  static get $name() {
    return "PdfExport";
  }
  static get configurable() {
    return {
      dialogClass: ExportDialog,
      /**
       * URL of the print server.
       * @config {String}
       */
      exportServer: void 0,
      /**
       * Returns the instantiated export dialog widget as configured by {@link #config-exportDialog}
       * @member {Grid.view.export.ExportDialog} exportDialog
       */
      /**
       * A config object to apply to the {@link Grid.view.export.ExportDialog} widget.
       * @config {ExportDialogConfig}
       */
      exportDialog: {
        value: true,
        $config: ["lazy"]
      },
      /**
       * Name of the exported file.
       * @config {String}
       * @category Export file config
       */
      fileName: null,
      /**
       * Format of the exported file, either `pdf` or `png`.
       * @config {'pdf'|'png'}
       * @default
       * @category Export file config
       */
      fileFormat: "pdf",
      /**
       * Export server will navigate to this url first and then will change page content to whatever client sent.
       * This option is useful with react dev server, which uses a strict CORS policy.
       * @config {String}
       */
      clientURL: null,
      /**
       * Export paper format. Available options are A1...A5, Legal, Letter.
       * @config {'A1'|'A2'|'A3'|'A4'|'A5'|'Legal'|'Letter'}
       * @default
       * @category Export file config
       */
      paperFormat: "A4",
      /**
       * Orientation. Options are `portrait` and `landscape`.
       * @config {'portrait'|'landscape'}
       * @default
       * @category Export file config
       */
      orientation: "portrait",
      /**
       * Specifies which rows to export. `all` for complete set of rows, `visible` for only rows currently visible.
       * @config {'all'|'visible'}
       * @category Export file config
       * @default
       */
      rowsRange: "all",
      /**
       * Set to true to align row top to the page top on every exported page. Only applied to multipage export.
       * @config {Boolean}
       * @default
       */
      alignRows: false,
      /**
       * Set to true to show column headers on every page. This will also set {@link #config-alignRows} to true.
       * Only applies to MultiPageVertical exporter.
       * @config {Boolean}
       * @default
       */
      repeatHeader: false,
      /**
       * By default, subGrid width is changed to fit all exported columns. To keep certain subGrid size specify it
       * in the following form:
       * ```javascript
       * keepRegionSizes : {
       *     locked : true
       * }
       * ```
       * @config {Object<String,Boolean>}
       * @default
       */
      keepRegionSizes: null,
      /**
       * When exporting large views (hundreds of pages) stringified HTML may exceed browser or server request
       * length limit. This config allows to specify how many pages to send to server in one request.
       * @config {Number}
       * @default
       * @private
       */
      pagesPerRequest: 0,
      /**
       * Config for exporter.
       * @config {Object}
       * @private
       */
      exporterConfig: null,
      /**
       * Type of the exporter to use. Should be one of the configured {@link #config-exporters}
       * @config {'singlepage'|'multipage'|'multipagevertical'|String}
       * @default
       */
      exporterType: "singlepage",
      /**
       * List of exporter classes to use in export feature
       * @config {Grid.feature.export.exporter.Exporter[]}
       * @default
       */
      exporters: [SinglePageExporter, MultiPageExporter, MultiPageVerticalExporter],
      /**
       * `True` to replace all linked CSS files URLs to absolute before passing HTML to the server.
       * When passing a string the current origin of the CSS files URLS will be replaced by the passed origin.
       *
       * For example: css files pointing to /app.css will be translated from current origin to {translateURLsToAbsolute}/app.css
       * @config {Boolean|String}
       * @default
       */
      translateURLsToAbsolute: true,
      /**
       * When true links are converted to absolute by combining current window location (with replaced origin) with
       * resource link.
       * When false links are converted by combining new origin with resource link (for angular)
       * @config {Boolean}
       * @default
       */
      keepPathName: true,
      /**
       * When true, page will attempt to download generated file.
       * @config {Boolean}
       * @default
       */
      openAfterExport: true,
      /**
       * Set to true to receive binary file from the server instead of download link.
       * @config {Boolean}
       * @default
       */
      sendAsBinary: false,
      /**
       * False to open in the current tab, true - in a new tab
       * @config {Boolean}
       * @default
       */
      openInNewTab: false,
      /**
       * A template function used to generate a page header. It is passed an object with ´currentPage´ and `totalPages´ properties.
       *
       * ```javascript
       * let grid = new Grid({
       *     appendTo   : 'container',
       *     features : {
       *         pdfExport : {
       *             exportServer : 'http://localhost:8080/',
       *             headerTpl : ({ currentPage, totalPages }) => `
       *                 <div class="demo-export-header">
       *                     <img src="coolcorp-logo.png"/>
       *                     <dl>
       *                         <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
       *                         <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
       *                     </dl>
       *                 </div>`
       *          }
       *     }
       * });
       * ```
       * @config {Function}
       * @param {Object} data Data object
       * @param {Number} data.currentPage Current page number
       * @param {Number} data.totalPages Tolal pages count
       * @returns {String}
       */
      headerTpl: null,
      /**
       * A template function used to generate a page footer. It is passed an object with ´currentPage´ and `totalPages´ properties.
       *
       * ```javascript
       * let grid = new Grid({
       *      appendTo   : 'container',
       *      features : {
       *          pdfExport : {
       *              exportServer : 'http://localhost:8080/',
       *              footerTpl    : () => '<div class="demo-export-footer"><h3>© 2020 CoolCorp Inc</h3></div>'
       *          }
       *      }
       * });
       * ```
       *
       * @config {Function}
       * @param {Object} data Data object
       * @param {Number} data.currentPage Current page number
       * @param {Number} data.totalPages Tolal pages count
       * @returns {String}
       */
      footerTpl: null,
      /**
       * An object containing the Fetch options to pass to the export server request. Use this to control if
       * credentials are sent and other options, read more at
       * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
       * @config {FetchOptions}
       */
      fetchOptions: null,
      /**
       * A message to be shown when Export feature is performing export.
       * @config {String}
       * @default "Generating pages..."
       */
      exportMask: "L{Generating pages}",
      /**
       * A message to be shown when export is almost done.
       * @config {String}
       * @default "Waiting for response from server..."
       */
      exportProgressMask: "L{Waiting for response from server}",
      /**
       * Set to `false` to not show Toast message on export error.
       * @config {Boolean}
       * @default
       */
      showErrorToast: true,
      localizableProperties: ["exportMask", "exportProgressMask"],
      /**
       * This method accepts all stylesheets (link and style tags) which are supposed to be put on the page. Use
       * this hook method to filter or modify them.
       *
       * ```javascript
       * new Grid({
       *     features: {
       *         pdfExport: {
       *             // filter out inline styles and bootstrap.css
       *             filterStyles: styles => styles.filter(item => !/(link|bootstrap.css)/.test(item))
       *         }
       *     }
       * });
       * ```
       * @param {String[]} styles
       * @returns {String[]} List of stylesheets to put on the exported page
       */
      filterStyles: (styles) => styles,
      /**
       * Enables direct rendering of the component content which significantly improves performance. To enable
       * old export mode set this flag to false.
       * @config {Boolean}
       * @default
       */
      enableDirectRendering: true,
      /**
       * This config forces exporter to always use rendered column width. Used by Agenda view in Calendar
       * @private
       */
      useRenderedColumnWidth: false,
      /**
       * When true, export feature will use an iframe and browser's default print dialog, which allows to save
       * as PDF. Content is optimized for chrome/edge to exact page size in the specified orientation and no
       * margins. If you only see grid header or blank pages, try using different scale value in the print dialog
       * **NOTE**: Not supported in Safari. Print works, but Safari cannot seem to fit content to one page
       * correctly.
       * @config {Boolean}
       * @default
       * @private
       */
      useBrowserPrint: false
    };
  }
  updateEnableDirectRendering(value) {
    if (!value) {
      VersionHelper.deprecate("Grid", "6.0.0", "Indirect rendering is deprecated");
    }
  }
  doDestroy() {
    var _a;
    (_a = this.exportDialog) == null ? void 0 : _a.destroy();
    this.exportersMap.forEach((exporter) => exporter.destroy());
    super.doDestroy();
  }
  /**
   * When export is started from GUI ({@link Grid.view.export.ExportDialog}), export promise can be accessed via
   * this property.
   * @property {Promise|null}
   */
  get currentExportPromise() {
    return this._currentExportPromise;
  }
  set currentExportPromise(value) {
    this._currentExportPromise = value;
  }
  get exportersMap() {
    return this._exportersMap || (this._exportersMap = /* @__PURE__ */ new Map());
  }
  getExporter(config = {}) {
    const me = this, { exportersMap } = me, { type } = config;
    let exporter;
    if (exportersMap.has(type)) {
      exporter = exportersMap.get(type);
      Object.assign(exporter, config);
    } else {
      const exporterClass = this.exporters.find((cls) => cls.type === type);
      if (!exporterClass) {
        throw new Error(`Exporter type ${type} is not found. Make sure you've configured it`);
      }
      config = ObjectHelper.clone(config);
      delete config.type;
      exporter = new exporterClass(config);
      exporter.relayAll(me);
      exportersMap.set(type, exporter);
    }
    return exporter;
  }
  buildExportConfig(config = {}) {
    const me = this, {
      client,
      exportServer,
      clientURL,
      fileFormat,
      fileName,
      paperFormat,
      rowsRange,
      alignRows,
      repeatHeader,
      keepRegionSizes,
      orientation,
      translateURLsToAbsolute,
      keepPathName,
      sendAsBinary,
      headerTpl,
      footerTpl,
      filterStyles,
      enableDirectRendering,
      useRenderedColumnWidth,
      useBrowserPrint
    } = me;
    if (!config.columns) {
      config.columns = client.columns.visibleColumns.filter((column) => column.exportable).map((column) => column.id);
    }
    const result = ObjectHelper.assign({
      client,
      exportServer,
      clientURL,
      fileFormat,
      paperFormat,
      rowsRange,
      alignRows,
      repeatHeader,
      keepRegionSizes,
      orientation,
      translateURLsToAbsolute,
      keepPathName,
      sendAsBinary,
      headerTpl,
      footerTpl,
      enableDirectRendering,
      useRenderedColumnWidth,
      useBrowserPrint,
      exporterType: me.exporterType,
      fileName: fileName || client.$$name
    }, config);
    result.columns = config.columns.slice();
    if (result.exporterType !== "multipagevertical") {
      result.repeatHeader = false;
    }
    if (!("alignRows" in config) && config.repeatHeader) {
      result.alignRows = true;
    }
    result.exporterConfig = ObjectHelper.assign({
      type: result.exporterType,
      translateURLsToAbsolute: result.translateURLsToAbsolute,
      keepPathName: result.keepPathName,
      filterStyles
    }, result.exporterConfig || {});
    delete result.exporterType;
    delete result.translateURLsToAbsolute;
    delete result.keepPathName;
    return result;
  }
  /**
   * Starts the export process. Accepts a config object which overrides any default configs.
   * **NOTE**. Component should not be interacted with when export is in progress
   *
   * @param {Object} config
   * @returns {Promise} Object of the following structure
   * ```
   * {
   *     response // Response instance
   * }
   * ```
   */
  async export(config = {}) {
    var _a, _b;
    const me = this, {
      client,
      pagesPerRequest
    } = me;
    config = me.buildExportConfig(config);
    let result;
    if (client.trigger("beforePdfExport", { config }) !== false) {
      client.isExporting = true;
      client.mask(me.exportMask);
      try {
        const exporter = me.getExporter(config.exporterConfig);
        if (pagesPerRequest === 0) {
          const pages = await exporter.export(config);
          if (me.isDestroying) {
            return;
          }
          (_a = me.exportDialog) == null ? void 0 : _a.close();
          client.unmask();
          me.trigger("exportStep", { progress: 90, text: me.exportProgressMask, contentGenerated: true });
          if (config.useBrowserPrint) {
            await me.doPrint(pages, config);
            result = {};
          } else {
            const responsePromise = me.receiveExportContent(pages, config);
            me.toast = me.showLoadingToast(responsePromise);
            const response = await responsePromise;
            result = { response };
            await me.processExportContent(response, config);
          }
        }
      } catch (error) {
        if (error instanceof Response) {
          result = { response: error };
        } else {
          result = { error };
        }
        throw error;
      } finally {
        if (me.toast && !me.toast.isDestroying) {
          me.toast.hide();
        }
        if (!me.isDestroying) {
          (_b = me.exportDialog) == null ? void 0 : _b.close();
          client.unmask();
          if (me.showErrorToast) {
            if (result.error) {
              if (result.error.name !== "AbortError") {
                Toast.show({
                  html: me.L("L{Export failed}"),
                  rootElement: me.rootElement
                });
              }
            } else if (result.response && !result.response.ok) {
              Toast.show({
                html: me.L("L{Server error}"),
                rootElement: me.rootElement
              });
            }
          }
          client.trigger("pdfExport", result);
          client.isExporting = false;
        }
      }
    }
    return result;
  }
  /**
   * Sends request to the export server and returns Response instance. This promise can be cancelled by the user
   * by clicking on the toast message. When the user clicks on the toast, `abort` method is called on the promise
   * returned by this method. If you override this method you can implement `abort` method like in the snippet
   * below to cancel the request.
   *
   * ```javascript
   * class MyPdfExport extends PdfExport {
   *     receiveExportContent(pages, config) {
   *         let controller;
   *
   *         const promise = new Promise(resolve => {
   *             controller = new AbortController();
   *             const signal = controller.signal;
   *
   *             fetch(url, { signal })
   *                 .then(response => resolve(response));
   *         });
   *
   *         // This method will be called when user clicks on the toast message to cancel the request
   *         promise.abort = () => controller.abort();
   *
   *         return promise;
   *     }
   * }
   *
   * const grid = new Grid({ features: { myPdfExport : {...} } });
   *
   * grid.features.myPdfExport.export().catch(e => {
   *     // In case of aborted request do nothing
   *     if (e.name !== 'AbortError') {
   *         // handle other exceptions
   *     }
   * });
   * ```
   * @param {Object[]} pages Array of exported pages.
   * @param {String} pages[].html pages HTML of the exported page.
   * @param {Object} config Export config
   * @param {String} config.exportServer URL of the export server.
   * @param {String} config.orientation Page orientation. portrait/landscape.
   * @param {String} config.paperFormat Paper format as supported by puppeteer. A4/A3/...
   * @param {String} config.fileFormat File format. PDF/PNG.
   * @param {String} config.fileName Name to use for the saved file.
   * @param {String} config.clientURL URL to navigate before export. See {@link #config-clientURL}.
   * @param {String} config.sendAsBinary Tells server whether to return binary file instead of download link.
   * @returns {Promise} Returns Response instance
   */
  receiveExportContent(pages, config) {
    return AjaxHelper.fetch(
      config.exportServer,
      Object.assign({
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: pages,
          orientation: config.orientation,
          format: config.paperFormat,
          fileFormat: config.fileFormat,
          fileName: config.fileName,
          clientURL: config.clientURL,
          sendAsBinary: config.sendAsBinary
        })
      }, this.fetchOptions)
    );
  }
  /**
   * Handles output of the {@link #function-receiveExportContent}. Server response can be of two different types depending
   * on {@link #config-sendAsBinary} config:
   * - `application/json` In this case JSON response contains url of the file to download
   * - `application/octet-stream` In this case response contains stream of file binary data
   *
   * If {@link #config-openAfterExport} is true, this method will try to download content.
   * @param {Response} response
   * @param {Object} config Export config
   * @param {String} config.exportServer URL of the export server.
   * @param {String} config.orientation Page orientation. portrait/landscape.
   * @param {String} config.paperFormat Paper format as supported by puppeteer. A4/A3/...
   * @param {String} config.fileFormat File format. PDF/PNG.
   * @param {String} config.fileName Name to use for the saved file.
   * @param {String} config.clientURL URL to navigate before export. See {@link #config-clientURL}.
   * @param {String} config.sendAsBinary Tells server whether to return binary file instead of download link. See {@link #config-sendAsBinary}
   */
  async processExportContent(response, config) {
    const me = this;
    if (response.ok && me.openAfterExport) {
      response = response.clone();
      const contentType = response.headers.get("content-type");
      if (contentType.match(/application\/octet-stream/)) {
        const MIMEType = FileMIMEType[config.fileFormat], objectURL = await me.responseBlobToObjectURL(response, MIMEType), link = me.getDownloadLink(config.fileName, objectURL);
        link.click();
      } else if (contentType.match(/application\/json/)) {
        const responseJSON = await response.json();
        if (responseJSON.success) {
          const link = me.getDownloadLink(config.fileName, responseJSON.url);
          link.click();
        } else {
          Toast.show({
            html: responseJSON.msg,
            rootElement: this.rootElement
          });
        }
      }
    }
  }
  doPrint(pages) {
  }
  /**
   * Creates object URL from response content with given mimeType
   * @param {Response} response Response instance
   * @param {String} mimeType
   * @returns {Promise} Returns string object URL
   * @private
   */
  async responseBlobToObjectURL(response, mimeType) {
    const blob = await response.blob();
    return URL.createObjectURL(blob.slice(0, blob.size, mimeType));
  }
  /**
   * Creates link to download the file.
   * @param {String} name File name
   * @param {String} href URL of the resource
   * @returns {HTMLElement} HTMLAnchorElement
   * @private
   */
  getDownloadLink(name, href) {
    const link = document.createElement("a");
    link.download = name;
    link.href = href;
    if (this.openInNewTab) {
      link.target = "_blank";
    }
    return link;
  }
  get defaultExportDialogConfig() {
    return ObjectHelper.copyProperties({}, this, [
      "client",
      "exporters",
      "exporterType",
      "orientation",
      "fileFormat",
      "paperFormat",
      "alignRows",
      "rowsRange",
      "repeatHeader",
      "useBrowserPrint"
    ]);
  }
  changeExportDialog(exportDialog, oldExportDialog) {
    const me = this;
    oldExportDialog == null ? void 0 : oldExportDialog.destroy();
    if (exportDialog) {
      const config = me.dialogClass.mergeConfigs({
        rootElement: me.rootElement,
        client: me.client,
        modal: {
          transparent: true
        },
        items: {
          rowsRangeField: {
            value: me.rowsRange
          },
          exporterTypeField: {
            value: me.exporterType
          },
          orientationField: {
            value: me.orientation
          },
          paperFormatField: {
            value: me.paperFormat
          },
          repeatHeaderField: {
            value: me.repeatHeader
          },
          fileFormatField: {
            value: me.fileFormat
          },
          alignRowsField: {
            checked: me.alignRows
          }
        }
      }, me.defaultExportDialogConfig, exportDialog);
      exportDialog = me.dialogClass.new(config);
      exportDialog.ion({
        export: me.onExportButtonClick,
        thisObj: me
      });
    }
    return exportDialog;
  }
  /**
   * Shows {@link Grid.view.export.ExportDialog export dialog}
   */
  async showExportDialog() {
    return this.exportDialog.show();
  }
  onExportButtonClick({ values }) {
    const me = this, dialogMask = me.exportDialog.mask({
      progress: 0,
      maxProgress: 100,
      text: me.exportMask
    });
    const detacher = me.ion({
      exportstep({ progress, text, contentGenerated }) {
        if (contentGenerated) {
          me.exportDialog.unmask();
          detacher();
        } else {
          dialogMask.progress = progress;
          if (text != null) {
            dialogMask.text = text;
          }
        }
      }
    });
    me.currentExportPromise = me.export(values);
    me.currentExportPromise.catch(() => {
    }).finally(() => {
      var _a;
      detacher();
      (_a = me.exportDialog) == null ? void 0 : _a.unmask();
      me.currentExportPromise = null;
    });
  }
  showLoadingToast(exportPromise) {
    const toast = Toast.show({
      timeout: 0,
      showProgress: false,
      rootElement: this.rootElement,
      html: `
    <span class="b-mask-icon b-icon b-icon-spinner"></span>
    <span>${this.exportProgressMask}</span>
    <button class="b-button">${this.L("L{Click to abort}")}</button>`
    });
    EventHelper.on({
      element: toast.element,
      click() {
        var _a;
        (_a = exportPromise.abort) == null ? void 0 : _a.call(exportPromise);
      }
    });
    return toast;
  }
};
PdfExport._$name = "PdfExport";
GridFeatureManager.registerFeature(PdfExport, false, "Grid");

// ../Grid/lib/Grid/feature/export/mixin/PrintMixin.js
var PrintMixin_default = (Target) => class PrintMixin extends Target {
  static get $name() {
    return "PrintMixin";
  }
  static get configurable() {
    return {
      useBrowserPrint: true,
      exporterType: "multipagevertical"
    };
  }
  static get pluginConfig() {
    return {
      assign: ["print", "showPrintDialog"]
    };
  }
  /**
   * Shows the {@link Grid.view.export.ExportDialog print dialog}
   * @returns {Promise}
   * @on-owner
   * @catagory Print
   */
  showPrintDialog(config) {
    return this.showExportDialog(config);
  }
  /**
   * Starts the print process. Accepts a config object which overrides any default configs.
   * **NOTE** Component should not be interacted with when print is in progress
   *
   * @param {Object} config
   * @returns {Promise} Promise which resolves when printing is done. Optionally it might return an object with an
   * `error` key in it.
   * @on-owner
   * @catagory Print
   */
  print(config) {
    return this.export(config);
  }
  /**
   * This method is called when IFrame is loaded with all the HTML/CSS and is about to be printed. Use it to take
   * control over the page contents.
   * @param {HTMLIFrameElement} iframe
   */
  async onPrintIFrameLoad(iframe) {
  }
  async showBrowserPrintDialog(iframe, resolve) {
    await this.onPrintIFrameLoad(iframe);
    if (await this.client.trigger("beforeShowPrintDialog", { iframe }) !== false) {
      const { contentWindow } = iframe;
      contentWindow.onafterprint = () => {
        iframe.remove();
        resolve();
      };
      contentWindow.print();
    } else {
      iframe.remove();
      resolve();
    }
  }
  doPrint(pages) {
    const me = this;
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.className = "b-print-wrapper";
      iframe.style.visibility = "hidden";
      iframe.style.height = "0";
      iframe.onload = () => {
        var _a;
        const handle = iframe.contentWindow, doc = handle.document, { body } = doc, parser = new DOMParser();
        let paperHeight;
        pages.forEach(({ html: html2 }) => {
          const fragment = parser.parseFromString(html2, "text/html"), node = doc.adoptNode(fragment.body.firstChild), pageWrap = doc.createElement("div");
          fragment.head.querySelectorAll('style,link[rel="stylesheet"],link[as="style"]').forEach((styleEl) => {
            const el = doc.adoptNode(styleEl);
            doc.head.appendChild(el);
          });
          pageWrap.classList.add("b-page-wrap");
          pageWrap.style.height = fragment.body.parentElement.style.height;
          pageWrap.style.width = fragment.body.parentElement.style.width;
          paperHeight = parseFloat(fragment.body.parentElement.style.height);
          body.appendChild(pageWrap);
          pageWrap.appendChild(node);
        });
        const { html } = pages[0];
        body.className = ((_a = html.match(/<body class="(.+?)"/)) == null ? void 0 : _a[1]) || "";
        body.classList.add("b-print");
        body.parentElement.classList.add("b-print-root");
        body.parentElement.style.height = `${paperHeight * pages.length}in`;
        Promise.all(Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]')).map((link) => {
          return new Promise((resolve2, reject2) => {
            link.onload = resolve2;
            link.onerror = reject2;
          });
        })).then(() => doc.fonts.ready).then(() => me.showBrowserPrintDialog(iframe, resolve)).catch((e) => {
          console.warn(`Failed to load stylesheets ${e.message ? `: ${e.message}` : ""}`);
          reject(me.L("L{PdfExport.Export failed}"));
        });
      };
      me.client.element.parentElement.appendChild(iframe);
    });
  }
};

export {
  RowsRange,
  PaperFormat,
  Orientation,
  FileFormat,
  ExportRowsCombo,
  ExportOrientationCombo,
  ExportDialog,
  Exporter,
  MultiPageExporter,
  MultiPageVerticalExporter,
  SinglePageExporter,
  PdfExport,
  PrintMixin_default
};
//# sourceMappingURL=chunk-6RG3ITZU.js.map
