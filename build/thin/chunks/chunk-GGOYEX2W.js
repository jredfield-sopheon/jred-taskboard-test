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
  Clipboardable_default,
  DragHelper,
  FieldFilterPicker,
  FieldFilterPickerGroup,
  MessageDialog_default,
  ResizeHelper,
  WidgetHelper,
  filterableFieldDataTypes,
  isFilterableField,
  isSupportedDurationField
} from "./chunk-6ZLMCHE5.js";
import {
  GridRowModel
} from "./chunk-4NB7OJYA.js";
import {
  AjaxStore,
  ArrayHelper,
  Base,
  BrowserHelper,
  Checkbox,
  Collection,
  CollectionFilter,
  Config,
  ContextMenuBase,
  DateHelper,
  Delayable_default,
  DomClassList,
  DomDataStore,
  DomHelper,
  DomSync,
  Duration,
  Editor,
  EventHelper,
  Events_default,
  GlobalEvents_default,
  InstancePlugin,
  LoadMaskable_default,
  LocaleHelper,
  LocaleManager_default,
  Localizable_default,
  Mask,
  Model,
  ObjectHelper,
  Objects,
  Panel,
  Pluggable_default,
  Rectangle,
  ScrollManager,
  Scroller,
  State_default,
  Store,
  StringHelper,
  TemplateHelper,
  Tooltip,
  VersionHelper,
  Widget,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/util/Location.js
var Location = class _Location {
  /**
   * The grid which this Location references.
   * @config {Grid.view.Grid} grid
   */
  /**
   * The record which this Location references. (unless {@link #config-rowIndex} is used to configure)
   * @config {Core.data.Model} record
   */
  /**
   *
   * The row index which this Location references. (unless {@link #config-record} is used to configure).
   *
   * `-1` means the header row, in which case the {@link #config-record} will be `null`.
   * @config {Number} rowIndex
   */
  /**
   * The Column which this location references. (unless {@link #config-columnIndex} or {@link #config-columnId} is used to configure)
   * @config {Grid.column.Column} column
   */
  /**
   * The column id which this location references. (unless {@link #config-column} or {@link #config-columnIndex} is used to configure)
   * @config {String|Number} columnId
   */
  /**
   * The column index which this location references. (unless {@link #config-column} or {@link #config-columnId} is used to configure)
   * @config {Number} columnIndex
   */
  /**
   * The field of the column index which this location references. (unless another column identifier is used to configure)
   * @config {String} field
   */
  /**
   * Initializes a new Location.
   * @param {LocationConfig|HTMLElement} location A grid location specifier. This may be:
   *  * An element inside a grid cell or a grid cell.
   *  * An object identifying a cell location using the following properties:
   *    * grid
   *    * record
   *    * rowIndex
   *    * column
   *    * columnIndex
   * @function constructor
   */
  constructor(location) {
    if (location) {
      if (location.isLocation) {
        return location;
      }
      if (location.nodeType === Node.ELEMENT_NODE) {
        const grid = Widget.fromElement(location, "gridbase"), cell = grid && location.closest(grid.focusableSelector);
        if (cell) {
          const { dataset } = cell.parentNode;
          this.init({
            grid,
            // A .b-grid-row will have a data-index
            // If it' a column header, we use rowIndex -1
            rowIndex: grid.store.includes(dataset.id) ? grid.store.indexOf(dataset.id) : dataset.index || -1,
            columnId: cell.dataset.columnId
          });
          this.initialTarget = location;
        }
      } else {
        this.init(location);
      }
    }
  }
  init(config) {
    var _a, _b;
    const me = this;
    const grid = me.grid = config.grid, { store, columns } = grid, { visibleColumns } = columns;
    if (config.target) {
      me.actionTargets = [me._target = config.target];
    }
    if (config.record) {
      me._id = config.record.id;
    } else if ("id" in config) {
      me._id = config.id;
      if (config.id == null) {
        me._rowIndex = -1;
      }
    } else {
      const rowIndex = !isNaN(config.row) ? config.row : !isNaN(config.rowIndex) ? config.rowIndex : NaN;
      me._rowIndex = Math.max(Math.min(Number(rowIndex), store.count - 1), grid.hideHeaders ? 0 : -1);
      me._id = (_a = store.getAt(me._rowIndex)) == null ? void 0 : _a.id;
    }
    if (!("_rowIndex" in me)) {
      me._rowIndex = store.indexOf(me.id);
    }
    me.isSpecialRow = (_b = me.record) == null ? void 0 : _b.isSpecialRow;
    if ("columnId" in config) {
      me._column = columns.getById(config.columnId);
    } else if ("field" in config) {
      me._column = columns.get(config.field);
    } else {
      const columnIndex = !isNaN(config.column) ? config.column : !isNaN(config.columnIndex) ? config.columnIndex : NaN;
      if (!isNaN(columnIndex)) {
        me._columnIndex = Math.min(Number(columnIndex), visibleColumns.length - 1);
        me._column = visibleColumns[me._columnIndex];
      } else {
        me._column = "column" in config ? isNaN(config.column) ? config.column : visibleColumns[config.column] : visibleColumns[0];
      }
    }
    if (!("_columnIndex" in me)) {
      me._columnIndex = visibleColumns.indexOf(me._column);
    }
  }
  // Class identity indicator. Usually added by extending Base, but we don't do that for perf.
  get isLocation() {
    return true;
  }
  equals(other, shallow = false) {
    const me = this;
    return (other == null ? void 0 : other.isLocation) && other.grid === me.grid && // For a more performant check, use the shallow param
    (shallow ? me.id === other.id && me._column === other._column : other.record === me.record && other.column === me.column && other.target === me.target);
  }
  /**
   * Yields the row index of this location.
   * @property {Number}
   * @readonly
   */
  get rowIndex() {
    const { _id } = this, { store } = this.grid;
    return store.includes(_id) ? store.indexOf(_id) : Math.min(this._rowIndex, store.count - 1);
  }
  /**
   * Used by GridNavigation.
   * @private
   */
  get visibleRowIndex() {
    const { rowManager } = this.grid, { rowIndex } = this;
    return rowIndex === -1 ? rowIndex : Math.max(Math.min(rowIndex, rowManager.lastFullyVisibleTow.dataIndex), rowManager.firstFullyVisibleTow.dataIndex);
  }
  /**
   * Yields `true` if the cell and row are selectable.
   *
   * That is if the record is present in the grid's store and it's not a group summary or group header record.
   * @property {Boolean}
   * @readonly
   */
  get isSelectable() {
    return this.grid.store.includes(this._id) && !this.isSpecialRow;
  }
  get record() {
    if (this._rowIndex > -1) {
      const { store } = this.grid;
      if (!store.includes(this._id)) {
        return store.getAt(this._rowIndex);
      }
      return store.getById(this._id);
    }
  }
  get id() {
    return this._id;
  }
  get column() {
    const { visibleColumns } = this.grid.columns;
    if (!(visibleColumns == null ? void 0 : visibleColumns.includes(this._column))) {
      return visibleColumns == null ? void 0 : visibleColumns[this.columnIndex];
    }
    return this._column;
  }
  get columnId() {
    var _a;
    return (_a = this.column) == null ? void 0 : _a.id;
  }
  get columnIndex() {
    var _a;
    return Math.min(this._columnIndex, ((_a = this.grid.columns.visibleColumns) == null ? void 0 : _a.length) - 1);
  }
  /**
   * Returns a __*new *__ `Location` instance having moved from the current location in the
   * mode specified.
   * @param {Number} where Where to move from this Location. May be:
   *
   *  - `Location.UP`
   *  - `Location.NEXT_CELL`
   *  - `Location.DOWN`
   *  - `Location.PREV_CELL`
   *  - `Location.FIRST_COLUMN`
   *  - `Location.LAST_COLUMN`
   *  - `Location.FIRST_CELL`
   *  - `Location.LAST_CELL`
   *  - `Location.PREV_PAGE`
   *  - `Location.NEXT_PAGE`
   * @returns {Grid.util.Location} A Location object encapsulating the target location.
   */
  move(where) {
    const me = this, {
      record,
      column,
      grid
    } = me, { store } = grid, columns = grid.columns.visibleColumns, result = new _Location();
    let rowIndex = store.includes(record) ? store.indexOf(record) : me.rowIndex, columnIndex = columns.includes(column) ? columns.indexOf(column) : me.columnIndex;
    const rowMin = grid.hideHeaders ? 0 : -1, rowMax = store.count - 1, colMax = columns.length - 1, atFirstRow = rowIndex === rowMin, atLastRow = rowIndex === rowMax, atFirstColumn = columnIndex === 0, atLastColumn = columnIndex === colMax;
    switch (where) {
      case _Location.PREV_CELL:
        if (atFirstColumn) {
          if (!atFirstRow) {
            columnIndex = colMax;
            rowIndex--;
          }
        } else {
          columnIndex--;
        }
        break;
      case _Location.NEXT_CELL:
        if (atLastColumn) {
          if (!atLastRow) {
            columnIndex = 0;
            rowIndex++;
          }
        } else {
          columnIndex++;
        }
        break;
      case _Location.UP:
        if (!atFirstRow) {
          rowIndex--;
        }
        break;
      case _Location.DOWN:
        if (!atLastRow) {
          if (rowIndex === -1) {
            rowIndex = grid.rowManager.firstFullyVisibleRow.dataIndex;
          } else {
            rowIndex++;
          }
        }
        break;
      case _Location.FIRST_COLUMN:
        columnIndex = 0;
        break;
      case _Location.LAST_COLUMN:
        columnIndex = colMax;
        break;
      case _Location.FIRST_CELL:
        rowIndex = rowMin;
        columnIndex = 0;
        break;
      case _Location.LAST_CELL:
        rowIndex = rowMax;
        columnIndex = colMax;
        break;
      case _Location.PREV_PAGE:
        rowIndex = Math.max(rowMin, rowIndex - Math.floor(grid.scrollable.clientHeight / grid.rowHeight));
        break;
      case _Location.NEXT_PAGE:
        rowIndex = Math.min(rowMax, rowIndex + Math.floor(grid.scrollable.clientHeight / grid.rowHeight));
        break;
    }
    result.init({
      grid,
      rowIndex,
      columnIndex
    });
    return result;
  }
  /**
   * The cell DOM element which this Location references.
   * @property {HTMLElement}
   * @readonly
   */
  get cell() {
    var _a, _b;
    const me = this, {
      grid,
      id,
      _cell
    } = me;
    if (_cell) {
      return _cell;
    }
    if (id == null) {
      return (_a = grid.columns.getById(me.columnId)) == null ? void 0 : _a.element;
    } else {
      const { row } = me;
      if (row) {
        return row.getCell(me.columnId) || row.getCell((_b = grid.columns.getAt(me.columnIndex)) == null ? void 0 : _b.id);
      }
    }
  }
  get row() {
    return this.grid.getRowById(this.id) || this.grid.getRow(this.rowIndex);
  }
  /**
   * The DOM element which encapsulates the focusable target of this Location.
   *
   * This is usually the {@link #property-cell}, but if this is an actionable location, this
   * may be another DOM element within the cell.
   * @property {HTMLElement}
   * @readonly
   */
  get target() {
    const { cell, _target } = this, { focusableFinder } = this.grid;
    if (cell) {
      if (_target) {
        return _target;
      }
      focusableFinder.currentNode = this.grid.focusableFinderCell = cell;
      return focusableFinder.nextNode() || cell;
    }
  }
  /**
   * This property is `true` if the focus target is not the cell itself.
   * @property {Boolean}
   * @readonly
   */
  get isActionable() {
    const { cell, _target } = this, activeEl = cell && DomHelper.getActiveElement(cell), containsFocus = activeEl && cell.compareDocumentPosition(activeEl) & Node.DOCUMENT_POSITION_CONTAINED_BY;
    return Boolean(containsFocus || _target && _target !== this.cell);
  }
  /**
   * This property is `true` if this location represents a column header.
   * @property {Boolean}
   * @readonly
   */
  get isColumnHeader() {
    return this.cell && this.rowIndex === -1;
  }
  /**
   * This property is `true` if this location represents a cell in the grid body.
   * @property {Boolean}
   * @readonly
   */
  get isCell() {
    return this.cell && this.record;
  }
};
Location.UP = 1;
Location.NEXT_CELL = 2;
Location.DOWN = 3;
Location.PREV_CELL = 4;
Location.FIRST_COLUMN = 5;
Location.LAST_COLUMN = 6;
Location.FIRST_CELL = 7;
Location.LAST_CELL = 8;
Location.PREV_PAGE = 9;
Location.NEXT_PAGE = 10;
Location._$name = "Location";

// ../Grid/lib/Grid/column/Column.js
var validWidth = (value) => typeof value === "number" || (value == null ? void 0 : value.endsWith("px"));
var _Column = class _Column extends Model.mixin(Events_default, Localizable_default) {
  //region Config
  /**
   * Default settings for the column, applied in constructor. None by default, override in subclass.
   * @member {Object} defaults
   * @returns {Object}
   * @readonly
   */
  static get fields() {
    return [
      //region Common
      "type",
      /**
       * Header text
       * @prp {String} text
       * @category Common
       */
      "text",
      /**
       * The {@link Core.data.field.DataField#config-name} of the {@link Core.data.Model data model} field to
       * read a cells value from.
       *
       * Also accepts dot notation to read nested or related data, for example `'address.city'`.
       *
       * @prp {String} field
       * @readonly
       * @category Common
       */
      "field",
      // NOTE: This is duplicated in WidgetColumn and partly in TreeColumn so remember to change there too if
      // changing the signature of this function
      /**
       * Renderer function, used to format and style the content displayed in the cell. Return the cell text you
       * want to display. Can also affect other aspects of the cell, such as styling.
       *
       * **NOTE:** If you mutate `cellElement`, and you want to prevent cell content from being reset during
       * rendering, please return `undefined` from the renderer (or just omit the `return` statement) and make
       * sure that the {@link #config-alwaysClearCell} config is set to `false`.
       *
       * ```javascript
       * new Grid({
       *     columns : [
       *         // Returns an empty string if status field value is undefined
       *         { text : 'Status', renderer : ({ record }) => record.status ?? '' },
       *
       *         // From Grid v6.0 there is no need for the undefined check
       *         // { text : 'Status', renderer : ({ record }) => record.status }
       *     ]
       * });
       * ```
       *
       * You can also return a {@link Core.helper.DomHelper#typedef-DomConfig} object describing the markup
       * ```javascript
       * new Grid({
       *     columns : [
       *         {
       *              text : 'Status',
       *              renderer : ({ record }) => {
       *                  return {
       *                      class : 'myClass',
       *                      children : [
       *                          {
       *                              tag : 'i',
       *                              class : 'fa fa-pen'
       *                          },
       *                          {
       *                              tag : 'span',
       *                              html : record.name
       *                          }
       *                      ]
       *                  };
       *              }
       *         }
       *     ]
       * });
       * ```
       *
       * You can modify the row element too from inside a renderer to add custom CSS classes:
       *
       * ```javascript
       * new Grid({
       *     columns : [
       *         {
       *             text     : 'Name',
       *             renderer : ({ record, row }) => {
       *                // Add special CSS class to new rows that have not yet been saved
       *               row.cls.newRow = record.isPhantom;
       *
       *               return record.name;
       *         }
       *     ]
       * });
       * ```
       *
       * @config {Function} renderer
       * @param {Object} renderData Object containing renderer parameters
       * @param {HTMLElement} renderData.cellElement Cell element, for adding CSS classes, styling etc. Can be `null` in case of export
       * @param {*} renderData.value Value to be displayed in the cell
       * @param {Core.data.Model} renderData.record Record for the row
       * @param {Grid.column.Column} renderData.column This column
       * @param {Grid.view.Grid} renderData.grid This grid
       * @param {Grid.row.Row} renderData.row Row object. Can be null in case of export.
       *   Use the {@link Grid.row.Row#function-assignCls row's API} to manipulate CSS class names.
       * @param {Object} renderData.size Set `size.height` to specify the desired row height for the current
       *   row. Largest specified height is used, falling back to configured {@link Grid/view/Grid#config-rowHeight}
       *   in case none is specified. Can be null in case of export
       * @param {Number} renderData.size.height Set this to request a certain row height
       * @param {Number} renderData.size.configuredHeight Row height that will be used if none is requested
       * @param {Boolean} renderData.isExport True if record is being exported to allow special handling during export.
       * @param {Boolean} renderData.isMeasuring True if the column is being measured for a `resizeToFitContent` call.
       *   In which case an advanced renderer might need to take different actions.
       * @returns {String|DomConfig|DomConfig[]|null}
       *
       * @category Rendering
       */
      "renderer",
      //'reactiveRenderer',
      /**
       * Column width. If value is Number then width is in pixels
       * @config {Number|String} width
       * @category Common
       */
      "width",
      /**
       * Column width as a flex weight. All columns with flex specified divide the available space (after
       * subtracting fixed widths) between them according to the flex value. Columns that have `flex : 2` will be
       * twice as wide as those with `flex : 1` (and so on)
       * @prp {Number|String} flex
       * @category Common
       */
      "flex",
      /**
       * This config sizes a column to fits its content. It is used instead of `width` or `flex`.
       *
       * This config requires the {@link Grid.feature.ColumnAutoWidth} feature which responds to changes in the
       * grid's store and synchronizes the widths' of all `autoWidth` columns.
       *
       * If this config is not a Boolean value, it is passed as the only argument to the `resizeToFitContent`
       * method to constrain the column's width.
       *
       * @config {Boolean|Number|Number[]} autoWidth
       * @category Common
       */
      "autoWidth",
      /**
       * This config enables automatic height for all cells in this column. It is achieved by measuring the height
       * a cell after rendering it to DOM, and then sizing the row using that height (if it is greater than other
       * heights used for the row).
       *
       * Heads up if you render your Grid on page load, if measurement happens before the font you are using is
       * loaded you might get slightly incorrect heights. For browsers that support it we detect that
       * and remeasure when fonts are available.
       *
       * **NOTE:** Enabling this config comes with a pretty big performance hit. To maintain good performance,
       * we recommend not using it. You can still set the height of individual rows manually, either through
       * {@link Grid.data.GridRowModel#field-rowHeight data} or via {@link #config-renderer renderers}.
       *
       * Also note that this setting only works fully as intended with non-flex columns.
       *
       * Rows will always be at least {@link Grid.view.Grid#config-rowHeight} pixels tall
       * even if an autoHeight cell contains no data.
       *
       * Manually setting a height from a {@link #config-renderer} in this column will take precedence over this
       * config.
       *
       * @config {Boolean} autoHeight
       * @category Common
       */
      "autoHeight",
      /**
       * Mode to use when measuring the contents of this column in calls to {@link #function-resizeToFitContent}.
       * Available modes are:
       *
       * * 'exact'       - Most precise, renders and measures all cells (Default, slowest)
       * * 'textContent' - Renders all cells but only measures the one with the longest `textContent`
       * * 'value'       - Renders and measures only the cell with the longest data (Fastest)
       * * 'none'/falsy  - Resize to fit content not allowed, a call does nothing
       *
       * @config {'exact'|'textContent'|'value'|'none'|null} fitMode
       * @default 'exact'
       * @category Common
       */
      { name: "fitMode", defaultValue: "exact" },
      //endregion
      //region Interaction
      /**
       * Set this to `true` to not allow any type of editing in this column.
       * @prp {Boolean} readOnly
       */
      "readOnly",
      /**
       * A config object used to create the input field which will be used for editing cells in the
       * column. Used when {@link Grid.feature.CellEdit} feature is enabled. The Editor refers to
       * {@link #config-field} for a data source.
       *
       * Configure this as `false` or `null` to prevent cell editing in this column.
       *
       * All subclasses of {@link Core.widget.Field} can be used as editors. The most popular are:
       * - {@link Core.widget.TextField}
       * - {@link Core.widget.NumberField}
       * - {@link Core.widget.DateField}
       * - {@link Core.widget.TimeField}
       * - {@link Core.widget.Combo}
       *
       * If record has method set + capitalized field, method will be called, e.g. if record has method named
       * `setFoobar` and the {@link #config-field} is `foobar`, then instead of `record.foobar = value`,
       * `record.setFoobar(value)` will be called.
       *
       * `Function` may be used for React application parameter for using JSX components as editors.
       *
       * ```javascript
       *  columns : [
       *         {
       *             type   : 'name',
       *             field  : 'name',
       *             width  : 250,
       *             editor : ref => <TextEditor ref={ref}/>
       *         },
       *         ...
       * ]
       * ```
       *
       * NOTE: React editor component must implement `setValue` method which usually internally calls `setState`.
       * React `setState` is asynchronous so we need to return Promise which will be resolved when `setState`
       * finishes. A typical example of `setValue` method implemented in a React editor is:
       *
       * ```javascript
       * setValue(value) {
       *     return new Promise(resolve => this.setState({ value }, () => resolve(value)));
       * }
       * ```
       *
       * @config {Boolean|String|InputFieldConfig|Core.widget.Field|Function|null} editor
       * @param {*} ref React `RefObject` for editor JSX component.
       * @returns {*} Returns React editor JSX component template
       *
       * @category Interaction
       */
      { name: "editor", defaultValue: {} },
      /**
       * A config object used to configure an {@link Core.widget.Editor} which contains this Column's
       * {@link #config-editor input field} if {@link Grid.feature.CellEdit} feature is enabled.
       * @config {EditorConfig} cellEditor
       * @category Interaction
       */
      "cellEditor",
      /**
       * A function which is called when a cell edit is requested to finish.
       *
       * This may be an `async` function which performs complex validation. The return value should be:
       * - `false` - To indicate a generic validation error
       * - `true` - To indicate a successful validation, which will complete the editing
       * - a string - To indicate an error message of the failed validation. This error message will be cleared
       * upon any subsequent user input.
       *
       * The action for the failed validation is defined with the {@link #config-invalidAction} config.
       *
       * For example for synchronous validation:
       *
       * ```javascript
       * const grid = new Grid({
       *    columns : [
       *       {
       *          type : 'text',
       *          text : 'The column',
       *          field : 'someField',
       *          flex : 1,
       *          finalizeCellEdit : ({ value }) => {
       *              return value.length < 4 ? 'Value length should be at least 4 characters' : true;
       *          }
       *       }
       *    ]
       * });
       * ```
       * Here we've defined a validation `finalizeCellEdit` function, which marks all edits with new value
       * less than 4 characters length as invalid.
       *
       * For asynchronous validation you can make the validation function async:
       *
       * ```javascript
       * finalizeCellEdit : async ({ value }) => {
       *     return await performRemoteValidation(value);
       * }
       * ```
       *
       * @config {Function} finalizeCellEdit
       * @param {Object} context An object describing the state of the edit at completion request time.
       * @param {Core.widget.Field} context.inputField The field configured as the column's `editor`.
       * @param {Core.data.Model} context.record The record being edited.
       * @param {*} context.oldValue The old value of the cell.
       * @param {*} context.value The new value of the cell.
       * @param {Grid.view.Grid} context.grid The host grid.
       * @param {Object} context.editorContext The {@link Grid.feature.CellEdit} context object.
       * @param {Grid.column.Column} context.editorContext.column The column being edited.
       * @param {Core.data.Model} context.editorContext.record The record being edited.
       * @param {HTMLElement} context.editorContext.cell The cell element hosting the editor.
       * @param {Core.widget.Editor} context.editorContext.editor The floating Editor widget which is hosting the input field.
       * @returns {Boolean|void}
       * @async
       *
       * @category Interaction
       */
      "finalizeCellEdit",
      /**
       * Setting this option means that pressing the `ESCAPE` key after editing the field will
       * revert the field to the value it had when the edit began. If the value is _not_ changed
       * from when the edit started, the input field's {@link Core.widget.Field#config-clearable}
       * behaviour will be activated. Finally, the edit will be canceled.
       * @config {Boolean} revertOnEscape
       * @default true
       * @category Interaction
       */
      { name: "revertOnEscape", defaultValue: true },
      /**
       * How to handle a request to complete a cell edit in this column if the field is invalid.
       * There are three choices:
       *  - `block` The default. The edit is not exited, the field remains focused.
       *  - `allow` Allow the edit to be completed.
       *  - `revert` The field value is reverted and the edit is completed.
       * @config {'block'|'allow'|'revert'} invalidAction
       * @default 'block'
       * @category Interaction
       */
      { name: "invalidAction", defaultValue: "block" },
      /**
       * Allow sorting of data in the column. You can pass true/false to enable/disable sorting, or provide a
       * custom sorting function, or a config object for a {@link Core.util.CollectionSorter}
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *          {
       *              // Disable sorting for this column
       *              sortable : false
       *          },
       *          {
       *              field : 'name',
       *              // Custom sorting for this column
       *              sortable(user1, user2) {
       *                  return user1.name < user2.name ? -1 : 1;
       *              }
       *          },
       *          {
       *              // A config object for a Core.util.CollectionSorter
       *              sortable : {
       *                  property         : 'someField',
       *                  direction        : 'DESC',
       *                  useLocaleCompare : 'sv-SE'
       *              }
       *          }
       *     ]
       * });
       * ```
       * When providing a custom sorting function, if the sort feature is configured with
       * `prioritizeColumns : true` that function will also be used for programmatic sorting of the store:
       *
       * ```javascript
       * const grid = new Grid({
       *     features : {
       *       sort : {
       *           prioritizeColumns : true
       *       }
       *     },
       *
       *     columns : [
       *          {
       *              field : 'name',
       *              // Custom sorting for this column
       *              sortable(user1, user2) {
       *                  return user1.name < user2.name ? -1 : 1;
       *              }
       *          }
       *     ]
       * });
       *
       * // Will use sortable() from the column definition above
       * grid.store.sort('name');
       * ```
       *
       * @config {Boolean|Function|CollectionSorterConfig} sortable
       * @param {Core.data.Model} left Left side model to compare
       * @param {Core.data.Model} right Right side model to compare
       * @returns {Number}
       * @default true
       * @category Interaction
       */
      {
        name: "sortable",
        defaultValue: true,
        // Normalize function/object forms
        convert(value, data, column) {
          if (!value) {
            return false;
          }
          if (value === true) {
            return true;
          }
          const sorter = {};
          if (typeof value === "function") {
            sorter.originalSortFn = value;
            sorter.sortFn = value.bind(column);
          } else if (typeof value === "object") {
            Object.assign(sorter, value);
            if (sorter.fn) {
              sorter.sortFn = sorter.fn;
              delete sorter.fn;
            }
          }
          return sorter;
        }
      },
      /**
       * Allow searching in the column (respected by QuickFind and Search features)
       * @config {Boolean} searchable
       * @default true
       * @category Interaction
       */
      { name: "searchable", defaultValue: true },
      /**
       * If `true`, this column will show a collapse/expand icon in its header, only applicable for parent columns
       * @config {Boolean} collapsible
       * @default false
       * @category Interaction
       */
      { name: "collapsible", defaultValue: false },
      /**
       * The collapsed state of this column, only applicable for parent columns
       * @config {Boolean} collapsed
       * @default false
       * @category Interaction
       */
      { name: "collapsed", defaultValue: false },
      /**
       * The collapse behavior when collapsing a parent column. Specify "toggleAll" or "showFirst".
       * * "showFirst" toggles visibility of all but the first columns.
       * * "toggleAll" toggles all children, useful if you have a special initially hidden column which gets shown
       * in collapsed state.
       * @config {String} collapseMode
       * @default 'showFirst'
       * @category Interaction
       */
      { name: "collapseMode" },
      /**
       * Allow filtering data in the column (if {@link Grid.feature.Filter} or {@link Grid.feature.FilterBar}
       * feature is enabled).
       *
       * Also allows passing a custom filtering function that will be called for each record with a single
       * argument of format `{ value, record, [operator] }`. Returning `true` from the function includes the
       * record in the filtered set.
       *
       * Configuration object may be used for {@link Grid.feature.FilterBar} feature to specify `filterField`. See
       * an example in the code snippet below or check {@link Grid.feature.FilterBar} page for more details.
       *
       * ```
       * const grid = new Grid({
       *     columns : [
       *          {
       *              field : 'name',
       *              // Disable filtering for this column
       *              filterable : false
       *          },
       *          {
       *              field : 'age',
       *              // Custom filtering for this column
       *              filterable: ({ value, record }) => Math.abs(record.age - value) < 10
       *          },
       *          {
       *              field : 'start',
       *              // Changing default field type
       *              filterable: {
       *                  filterField : {
       *                      type : 'datetime'
       *                  }
       *              }
       *          },
       *          {
       *              field : 'city',
       *              // Filtering for a value out of a list of values
       *              filterable: {
       *                  filterField : {
       *                      type  : 'combo',
       *                      value : '',
       *                      items : [
       *                          'Paris',
       *                          'Dubai',
       *                          'Moscow',
       *                          'London',
       *                          'New York'
       *                      ]
       *                  }
       *              }
       *          },
       *          {
       *              field : 'score',
       *              filterable : {
       *                  // This filter fn doesn't return 0 values as matching filter 'less than'
       *                  filterFn : ({ record, value, operator, property }) => {
       *                      switch (operator) {
       *                          case '<':
       *                              return record[property] === 0 ? false : record[property] < value;
       *                          case '=':
       *                              return record[property] == value;
       *                          case '>':
       *                              return record[property] > value;
       *                      }
       *                  }
       *              }
       *          }
       *     ]
       * });
       * ```
       *
       * When providing a custom filtering function, if the filter feature is configured with
       * `prioritizeColumns : true` that function will also be used for programmatic filtering of the store:
       *
       * ```javascript
       * const grid = new Grid({
       *     features : {
       *         filter : {
       *             prioritizeColumns : true
       *         }
       *     },
       *
       *     columns : [
       *          {
       *              field : 'age',
       *              // Custom filtering for this column
       *              filterable: ({ value, record }) => Math.abs(record.age - value) < 10
       *          }
       *     ]
       * });
       *
       * // Will use filterable() from the column definition above
       * grid.store.filter({
       *     property : 'age',
       *     value    : 50
       * });
       * ```
       *
       * To use custom `FilterField` combo `store` it should contain one of these
       * {@link Core.data.Store#config-data} or {@link Core.data.AjaxStore#config-readUrl} configs.
       * Otherwise combo will get data from owner Grid store.
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *          {
       *              field : 'name',
       *              filterable: {
       *                  filterField {
       *                      type  : 'combo',
       *                      store : new Store({
       *                          data : ['Adam', 'Bob', 'Charlie']
       *                      })
       *                  }
       *              }
       *          }
       *     ]
       * });
       * ```
       *
       * or
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *          {
       *              field : 'name',
       *              filterable: {
       *                  filterField : {
       *                     type  : 'combo',
       *                     store : new AjaxStore({
       *                         readUrl  : 'data/names.json',
       *                         autoLoad : true
       *                     })
       *                  }
       *              }
       *          }
       *     ]
       * });
       * ```
       *
       * @config {Boolean|Function|Object} filterable
       * @param {Object} data Data object
       * @param {*} data.value Record value
       * @param {Core.data.Model} data.record Record instance
       * @returns {Boolean} Returns `true` if value matches condition
       * @default true
       * @category Interaction
       */
      {
        name: "filterable",
        defaultValue: true,
        // Normalize function/object forms
        convert(value) {
          if (!value) {
            return false;
          }
          if (value === true) {
            return true;
          }
          const filter = {
            columnOwned: true
          };
          if (typeof value === "function") {
            filter.filterFn = value;
          } else if (typeof value === "object") {
            Object.assign(filter, value);
          }
          return filter;
        }
      },
      /**
       * Setting this flag to `true` will prevent dropping child columns into a group column
       * @config {Boolean} sealed
       * @default false
       * @category Interaction
       */
      { name: "sealed" },
      /**
       * Allow column visibility to be toggled through UI
       * @config {Boolean} hideable
       * @default true
       * @category Interaction
       */
      { name: "hideable", defaultValue: true },
      /**
       * Set to false to prevent this column header from being dragged
       * @config {Boolean} draggable
       * @category Interaction
       */
      { name: "draggable", defaultValue: true },
      /**
       * Set to false to prevent grouping by this column
       * @config {Boolean} groupable
       * @category Interaction
       */
      { name: "groupable", defaultValue: true },
      /**
       * Set to `false` to prevent the column from being drag-resized when the ColumnResize plugin is enabled.
       * @config {Boolean} resizable
       * @default true
       * @category Interaction
       */
      { name: "resizable", defaultValue: true },
      //endregion
      //region Rendering
      /**
       * Renderer function for group headers (when using Group feature).
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *         {
       *             text : 'ABC',
       *             groupRenderer(renderData) {
       *                 return {
       *                      class : {
       *                          big   : true,
       *                          small : false
       *                      },
       *                      children : [
       *                          { tag : 'img', src : 'img.png' },
       *                          renderData.groupRowFor
       *                      ]
       *                 };
       *             }
       *         }
       *     ]
       * });
       * ```
       *
       * @config {Function} groupRenderer
       * @param {Object} renderData
       * @param {HTMLElement} renderData.cellElement Cell element, for adding CSS classes, styling etc.
       * @param {*} renderData.groupRowFor Current group value
       * @param {Core.data.Model} renderData.record Record for the row
       * @param {Core.data.Model[]} renderData.groupRecords Records in the group
       * @param {Grid.column.Column} renderData.column Current rendering column
       * @param {Grid.column.Column} renderData.groupColumn Column that the grid is grouped by
       * @param {Number} renderData.count Number of records in the group
       * @param {Grid.view.Grid} renderData.grid This grid
       * @returns {DomConfig|String|null} The header grouping text or DomConfig object representing the HTML markup
       *
       * @category Rendering
       */
      "groupRenderer",
      /**
       * Renderer function for the column header.
       *
       * @config {Function} headerRenderer
       * @param {Object} renderData
       * @param {Grid.column.Column} renderData.column This column
       * @param {HTMLElement} renderData.headerElement The header element
       * @returns {String|null} The text or markup to show in the column header
       *
       * @category Rendering
       */
      "headerRenderer",
      /**
       * A tooltip string to show when hovering the column header, or a config object which can
       * reconfigure the shared tooltip by setting boolean, numeric and string config values.
       * @config {String|TooltipConfig} tooltip
       * @category Rendering
       */
      "tooltip",
      /**
       * Renderer function for the cell tooltip (used with {@link Grid.feature.CellTooltip} feature).
       * Specify `false` to disable tooltip for this column.
       *
       * @config {Function|Boolean} tooltipRenderer
       * @param {Object} renderData
       * @param {HTMLElement} renderData.cellElement Cell element
       * @param {Core.data.Model} renderData.record Record for cell row
       * @param {Grid.column.Column} renderData.column Cell column
       * @param {Grid.feature.CellTooltip} renderData.cellTooltip Feature instance, used to set tooltip content async
       * @param {MouseEvent} renderData.event The event that triggered the tooltip
       * @returns {String|DomConfig|null}
       *
       * @category Rendering
       */
      "tooltipRenderer",
      /**
       * CSS class added to each cell in this column
       * @prp {String} cellCls
       * @category Rendering
       */
      "cellCls",
      /**
       * CSS class added to the header of this column
       * @config {String} cls
       * @category Rendering
       */
      "cls",
      /**
       * Icon to display in header. Specifying an icon will render a `<i>` element with the icon as value for the
       * class attribute
       * @prp {String} icon
       * @category Rendering
       */
      "icon",
      //endregion
      //region Layout
      /**
       * Text align. Accepts `'left'`/`'center'`/`'right'` or direction neutral `'start'`/`'end'`
       * @config {'left'|'center'|'right'|'start'|'end'} align
       * @category Layout
       */
      "align",
      /**
       * Column minimal width. If value is `Number`, then minimal width is in pixels
       * @config {Number|String} minWidth
       * @default 60
       * @category Layout
       */
      { name: "minWidth", defaultValue: 60 },
      /**
       * Column maximal width. If value is Number, then maximal width is in pixels
       * @config {Number|String} maxWidth
       * @category Common
       */
      "maxWidth",
      /**
       * Columns hidden state. Specify `true` to hide the column, `false` to show it.
       * @prp {Boolean} hidden
       * @category Layout
       */
      { name: "hidden", defaultValue: false },
      /**
       * Convenient way of putting a column in the "locked" region. Same effect as specifying region: 'locked'.
       * If you have defined your own regions (using {@link Grid.view.Grid#config-subGridConfigs}) you should use
       * {@link #config-region} instead of this one.
       * @config {Boolean} locked
       * @default false
       * @category Layout
       */
      { name: "locked" },
      /**
       * Region (part of the grid, it can be configured with multiple) where to display the column. Defaults to
       * {@link Grid.view.Grid#config-defaultRegion}.
       *
       * A column under a grouped header automatically belongs to the same region as the grouped header.
       *
       * @config {String} region
       * @category Layout
       */
      { name: "region" },
      /**
       * Specify `true` to merge cells within the column whose value match between rows, making the first
       * occurrence of the value span multiple rows.
       *
       * Only applies when using the {@link Grid/feature/MergeCells MergeCells feature}.
       *
       * This setting can also be toggled using the column header menu.
       *
       * @config {Boolean} mergeCells
       * @category Merge cells
       */
      { name: "mergeCells", type: "boolean" },
      /**
       * Set to `false` to prevent merging cells in this column using the column header menu.
       *
       * Only applies when using the {@link Grid/feature/MergeCells MergeCells feature}.
       *
       * @config {Boolean} mergeable
       * @default true
       * @category Merge cells
       */
      { name: "mergeable", type: "boolean", defaultValue: true },
      /**
       * An empty function by default, but provided so that you can override it. This function is called each time
       * a merged cell is rendered. It allows you to manipulate the DOM config object used before it is synced to
       * DOM, thus giving you control over styling and contents.
       *
       * NOTE: The function is intended for formatting, you should not update records in it since updating records
       * triggers another round of rendering.
       *
       * ```javascript
       * const grid = new Grid({
       *   columns : [
       *     {
       *       field      : 'project',
       *       text       : 'Project',
       *       mergeCells : 'true,
       *       mergedRenderer({ domConfig, value, fromIndex, toIndex }) {
       *         domConfig.className.highlight = value === 'Important project';
       *       }
       *    }
       *  ]
       * });
       * ```
       *
       * @config {Function}
       * @param {Object} detail An object containing the information needed to render a task.
       * @param {*} detail.value Value that will be displayed in the merged cell
       * @param {Number} detail.fromIndex Index in store of the first row of the merged cell
       * @param {Number} detail.toIndex Index in store of the last row of the merged cell
       * @param {Core.helper.DomHelper#typedef-DomConfig} detail.domConfig DOM config object for the merged cell
       * element
       * @category Merge cells
       */
      "mergedRenderer",
      //endregion
      // region Menu
      /**
       * Show column picker for the column
       * @config {Boolean} showColumnPicker
       * @default true
       * @category Menu
       */
      { name: "showColumnPicker", defaultValue: true },
      /**
       * false to prevent showing a context menu on the column header element
       * @config {Boolean} enableHeaderContextMenu
       * @default true
       * @category Menu
       */
      { name: "enableHeaderContextMenu", defaultValue: true },
      /**
       * Set to `false` to prevent showing a context menu on the cell elements in this column
       * @config {Boolean} enableCellContextMenu
       * @default true
       * @category Menu
       */
      { name: "enableCellContextMenu", defaultValue: true },
      /**
       * Extra items to show in the header context menu for this column.
       *
       * ```javascript
       * headerMenuItems : {
       *     customItem : { text : 'Custom item' }
       * }
       * ```
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>} headerMenuItems
       * @category Menu
       */
      "headerMenuItems",
      /**
       * Extra items to show in the cell context menu for this column, `null` or `false` to not show any menu items
       * for this column.
       *
       * ```javascript
       * cellMenuItems : {
       *     customItem : { text : 'Custom item' }
       * }
       * ```
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>} cellMenuItems
       * @category Menu
       */
      "cellMenuItems",
      //endregion
      //region Summary
      /**
       * Summary type (when using Summary feature). Valid types are:
       *
       * * `'sum'` - Sum of all values in the column
       * * `'add'` - Alias for sum
       * * `'count'` - Number of rows
       * * `'countNotEmpty'` - Number of rows containing a value
       * * `'average'` - Average of all values in the column
       * * `callbackFn` - A custom function, used with `store.reduce`. Its return value becomes the value of the accumulator parameter on the next invocation of callbackFn
       * </dl>
       * @config {'sum'|'add'|'count'|'countNotEmpty'|'average'|Function} sum
       * @param {Number|*} result The value resulting from the previous call to callbackFn. On the first call, its value is initialValue if the latter is specified; otherwise its value is first element.
       * @param {Core.data.Model} value The value of the current element.
       * @param {Number} index The index position of currentValue. On the first call, its value is 0 if initialValue is specified, otherwise 1.
       * @returns {Number|*}
       * @category Summary
       */
      "sum",
      /**
       * Summary configs, use if you need multiple summaries per column. Replaces {@link #config-sum} and
       * {@link #config-summaryRenderer} configs.
       * @config {ColumnSummaryConfig[]} summaries
       * @category Summary
       */
      "summaries",
      /**
       * Renderer function for summary (when using Summary feature). The renderer is called with an object having
       * the calculated summary `sum` parameter. Function returns a string value to be rendered.
       *
       * Example:
       *
       * ```javascript
       * columns : [{
       *     type            : 'number',
       *     text            : 'Score',
       *     field           : 'score',
       *     sum             : 'sum',
       *     summaryRenderer : ({ sum }) => `Total amount: ${sum}`
       * }]
       * ```
       *
       * @config {Function} summaryRenderer
       * @param {Object} data Object containing renderer parameters
       * @param {Number|*} data.sum The sum parameter
       * @returns {String|DomConfig|null}
       * @category Summary
       */
      "summaryRenderer",
      //endregion
      //region Misc
      /**
       * Column settings at different responsive levels, see responsive demo under examples/
       * @config {Object} responsiveLevels
       * @category Misc
       */
      "responsiveLevels",
      /**
       * Tags, may be used by ColumnPicker feature for grouping columns by tag in the menu
       * @config {String[]} tags
       * @category Misc
       */
      "tags",
      /**
       * Column config to apply to normal config if viewed on a touch device
       * @config {GridColumnConfig} touchConfig
       * @category Misc
       */
      "touchConfig",
      /**
       * When using the tree feature, exactly one column should specify { tree: true }
       * @config {Boolean} tree
       * @category Misc
       */
      "tree",
      /**
       * Determines which type of filtering to use for the column. Usually determined by the column type used,
       * but may be overridden by setting this field.
       * @config {'text'|'date'|'number'|'duration'} filterType
       * @category Misc
       */
      "filterType",
      /**
       * By default, any rendered column cell content is HTML-encoded. Set this flag to `false` disable this and
       * allow rendering html elements
       * @config {Boolean} htmlEncode
       * @default true
       * @category Misc
       */
      { name: "htmlEncode", defaultValue: true },
      /**
       * By default, the header text is HTML-encoded. Set this flag to `false` disable this and allow html
       * elements in the column header
       * @config {Boolean} htmlEncodeHeaderText
       * @default true
       * @category Misc
       */
      { name: "htmlEncodeHeaderText", defaultValue: true },
      /**
       * Set to `true`to automatically call DomHelper.sync for html returned from a renderer. Should in most cases
       * be more performant than replacing entire innerHTML of cell and also allows CSS transitions to work. Has
       * no effect unless {@link #config-htmlEncode} is disabled. Returned html must contain a single root element
       * (that can have multiple children). See PercentColumn for example usage.
       * @config {Boolean} autoSyncHtml
       * @default false
       * @category Misc
       */
      { name: "autoSyncHtml", defaultValue: false },
      /**
       * Set to `false` to not always clear cell content if the {@link #config-renderer} returns `undefined`
       * or has no `return` statement. This is useful when you mutate the cellElement, and want to prevent
       * cell content from being reset during rendering. **This is the default behaviour until 6.0.**
       *
       * Set to `true` to always clear cell content regardless of renderer return value. **This will be default
       * behaviour from 6.0.**
       * @config {Boolean} alwaysClearCell
       * @default false
       * @category Misc
       */
      { name: "alwaysClearCell", defaultValue: false },
      /**
       * An array of the widgets to append to the column header
       * ```javascript
       * columns : [
       * {
       *     text          : 'Name',
       *     field         : 'name',
       *     flex          : 1,
       *     headerWidgets : [
       *         {
       *             type   : 'button',
       *             text   : 'Add row',
       *             cls    : 'b-raised b-blue',
       *             async onAction() {
       *                 const [newRecord] = grid.store.add({
       *                     name : 'New user'
       *                 });
       *
       *                 await grid.scrollRowIntoView(newRecord);
       *
       *                 await grid.features.cellEdit.startEditing({
       *                     record : newRecord,
       *                     field  : 'name'
       *                 });
       *             }
       *         }
       *     ]
       * }]
       * ```
       * @config {ContainerItemConfig[]} headerWidgets
       * @private
       * @category Misc
       */
      { name: "headerWidgets" },
      /**
       * Set to `true` to have the {@link Grid.feature.CellEdit} feature update the record being edited live upon
       * field edit instead of when editing is finished by using `TAB` or `ENTER`
       * @config {Boolean} instantUpdate
       * @category Misc
       */
      { name: "instantUpdate", defaultValue: false },
      { name: "repaintOnResize", defaultValue: false },
      /**
       * An optional query selector to select a sub element within the cell being
       * edited to align a cell editor's `X` position and `width` to.
       * @config {String} editTargetSelector
       * @category Misc
       */
      "editTargetSelector",
      //endregion
      //region Export
      /**
       * Used by the Export feature. Set to `false` to omit a column from an exported dataset
       * @config {Boolean} exportable
       * @default true
       * @category Export
       */
      { name: "exportable", defaultValue: true },
      /**
       * Column type which will be used by {@link Grid.util.TableExporter}. See list of available types in
       * TableExporter docs. Returns undefined by default, which means column type should be read from the record
       * field.
       * @config {String} exportedType
       * @category Export
       */
      { name: "exportedType" },
      //endregion
      {
        name: "ariaLabel",
        defaultValue: "L{Column.columnLabel}"
      },
      {
        name: "cellAriaLabel",
        defaultValue: "L{cellLabel}"
      }
    ];
  }
  // prevent undefined fields from being exposed, to simplify spotting errors
  static get autoExposeFields() {
    return false;
  }
  //endregion
  //region Init
  construct(data, store) {
    var _a;
    const me = this;
    me.masterStore = store;
    if (store) {
      me._grid = Array.isArray(store) ? store[0].grid : store.grid;
    }
    me.localizableProperties = Config.mergeMethods.distinct(data.localizableProperties, ["text", "ariaLabel", "cellAriaLabel"]);
    if (data.localeClass) {
      me.localeClass = data.localeClass;
    }
    super.construct(...arguments);
    if (me.isLeaf && !("field" in me.data)) {
      me.field = "_" + (me.type || "") + ++_Column.emptyCount;
      me.noFieldSpecified = true;
    }
    if (!me.width && !me.flex && !me.children) {
      me.set({
        width: _Column.defaultWidth,
        flex: null
      }, null, true);
    }
    me.headerWidgets && me.initHeaderWidgets(me.headerWidgets);
    if (me.isParent) {
      me.meta.visibleChildren = /* @__PURE__ */ new Set();
      if (me.collapsible) {
        me.collapsible = true;
      }
    }
    me.rendererReturningContent = (_a = me.renderer) == null ? void 0 : _a.toString().includes("return ");
  }
  /**
   * Checks whether the other column is in the same position and configured the same as this Column.
   * @param {Grid.column.Column} other The partner column to check
   * @returns {Boolean} `true` if these two Columns should be kept in sync.
   * @private
   */
  shouldSync(other) {
    return other.isColumn && other.text === this.text && (other.field === this.field || String(other.renderer) === String(this.renderer)) && (!other.previousSibling && !this.previousSibling || other.previousSibling.shouldSync(this.previousSibling));
  }
  get isCollapsible() {
    var _a;
    return ((_a = this.children) == null ? void 0 : _a.length) > 1 && this.collapsible;
  }
  get collapsed() {
    return this.get("collapsed");
  }
  set collapsed(collapsed) {
    this.set("collapsed", collapsed, true);
    this.onCollapseChange(!collapsed);
    this.trigger("toggleCollapse", { collapsed });
  }
  onCellFocus(location) {
    this.location = location;
    this.updateHeaderAriaLabel(this.localizeProperty("ariaLabel"));
    if (location.rowIndex !== -1) {
      this.updateCellAriaLabel(this.localizeProperty("cellAriaLabel"));
    }
  }
  updateHeaderAriaLabel(headerAriaLabel) {
    DomHelper.setAttributes(this.element, {
      "aria-label": headerAriaLabel
    });
  }
  updateCellAriaLabel(cellAriaLabel) {
    var _a, _b;
    if (!((_a = this.location) == null ? void 0 : _a.isSpecialRow) && ((_b = this.location) == null ? void 0 : _b.cell)) {
      if (!(cellAriaLabel == null ? void 0 : cellAriaLabel.length)) {
        cellAriaLabel = this.location.column.text;
      }
      DomHelper.setAttributes(this.location.cell, {
        "aria-label": cellAriaLabel
      });
    }
  }
  doDestroy() {
    var _a, _b, _c;
    (_c = (_b = (_a = this.data) == null ? void 0 : _a.editor) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
    this.destroyHeaderWidgets();
    super.doDestroy();
  }
  //endregion
  //region Header widgets
  set headerWidgets(widgets) {
    this.initHeaderWidgets(widgets);
    this.set("headerWidgets", widgets);
  }
  get headerWidgets() {
    return this.get("headerWidgets");
  }
  initHeaderWidgets(widgets) {
    this.destroyHeaderWidgets();
    const headerWidgetMap = this.headerWidgetMap = {};
    for (const config of widgets) {
      const widget = Widget.create({ owner: this, ...config });
      headerWidgetMap[widget.ref || widget.id] = widget;
    }
  }
  destroyHeaderWidgets() {
    var _a;
    for (const widget of Object.values(this.headerWidgetMap || {})) {
      (_a = widget.destroy) == null ? void 0 : _a.call(widget);
    }
  }
  //endregion
  //region Fields
  // Yields the automatic cell tagging class, eg b-number-cell from NumberColumn etc
  static generateAutoCls() {
    const classes = [];
    for (let c = this; c !== _Column; c = c.superclass) {
      c.type && c.type !== c.superclass.type && classes.push(`b-${c.type.toLowerCase()}-cell`);
    }
    const columnAutoCls = classes.join(" ");
    (_Column.autoClsMap || (_Column.autoClsMap = /* @__PURE__ */ new Map())).set(this, columnAutoCls);
    return columnAutoCls;
  }
  /**
   * Returns the full CSS class set for a cell at the passed {@link Grid.util.Location}
   * as an object where property keys with truthy values denote a class to be added
   * to the cell.
   * @param {Grid.util.Location} cellContext
   * @returns {Object} An object in which property keys with truthy values are used as
   * the class names on the cell element.
   * @internal
   */
  getCellClass(cellContext) {
    var _a, _b;
    const { record, column } = cellContext, {
      cellCls,
      internalCellCls,
      grid,
      constructor,
      align
    } = column, autoCls = ((_a = _Column.autoClsMap) == null ? void 0 : _a.get(constructor)) || constructor.generateAutoCls(), isEditing = cellContext.cell.classList.contains("b-editing"), result = {
      [grid.cellCls]: grid.cellCls,
      [autoCls]: autoCls,
      [cellCls]: cellCls,
      [internalCellCls]: internalCellCls,
      "b-cell-dirty": record.isFieldModified(column.field) && (column.compositeField || ((_b = record.fieldMap[column.field]) == null ? void 0 : _b.persist) !== false),
      [`b-grid-cell-align-${align}`]: align,
      "b-selected": grid.selectionMode.cell && grid.isCellSelected(cellContext),
      "b-focused": grid.isFocused(cellContext),
      "b-auto-height": column.autoHeight,
      "b-editing": isEditing
    };
    if (record.isSpecialRow && result["b-checkbox-selection"]) {
      result["b-checkbox-selection"] = false;
    }
    return result;
  }
  get locked() {
    return this.data.region === "locked";
  }
  set locked(locked) {
    this.region = locked ? "locked" : "normal";
  }
  // Children of grouped header always uses same region as the group
  get region() {
    if (!this.parent.isRoot) {
      return this.parent.region;
    }
    return this.get("region");
  }
  set region(region) {
    this.set("region", region);
  }
  // parent headers cannot be sorted by
  get sortable() {
    return this.isLeaf && this.data.sortable;
  }
  set sortable(sortable) {
    this.set("sortable", sortable);
  }
  // parent headers cannot be grouped by
  get groupable() {
    return Boolean(this.isLeaf && this.field && this.data.groupable);
  }
  set groupable(groupable) {
    this.set("groupable", groupable);
  }
  /**
   * The Field to use as editor for this column
   * @private
   * @readonly
   */
  get editor() {
    const me = this;
    let { editor } = me.data;
    if (editor && !editor.isWidget) {
      const result = me.grid.processCellEditor({ editor, field: me.field });
      if (result) {
        editor = me.data.editor = result.editor;
      } else {
        if (typeof editor === "string") {
          editor = {
            type: editor
          };
        }
        editor = me.data.editor = Widget.create(ObjectHelper.merge(me.defaultEditor, {
          owner: me.grid,
          // Field labels must be present for A11Y purposes, but are clipped out of visibility.
          // Screen readers will be able to access them and announce them.
          label: StringHelper.encodeHtml(me.text)
        }, editor));
      }
    }
    return editor;
  }
  set editor(editor) {
    this.data.editor = editor;
  }
  /**
   * A config object specifying the editor to use to edit this column.
   * @private
   * @readonly
   */
  get defaultEditor() {
    return {
      type: "textfield",
      name: this.field
    };
  }
  //endregion
  //region Grid, SubGrid & Element
  /**
   * Extracts the value from the record specified by this Column's {@link #config-field} specification
   * in a format that can be used as a value to match by a {@link Grid.feature.Filter filtering} operation.
   *
   * The default implementation returns the {@link #function-getRawValue} value, but this may be
   * overridden in subclasses.
   * @param {Core.data.Model} record The record from which to extract the field value.
   * @returns {*} The value of the referenced field if any.
   */
  getFilterableValue(record) {
    return this.getRawValue(record);
  }
  // Create an ownership hierarchy which links columns up to their SubGrid if no owner injected.
  get owner() {
    return this._owner || this.subGrid;
  }
  set owner(owner) {
    this._owner = owner;
  }
  get grid() {
    var _a;
    return this._grid || ((_a = this.parent) == null ? void 0 : _a.grid);
  }
  // Private, only used in tests where standalone Headers are created with no grid
  // from which to lookup the associate SubGrid.
  set subGrid(subGrid) {
    this._subGrid = subGrid;
  }
  /**
   * Get the SubGrid to which this column belongs
   * @property {Grid.view.SubGrid}
   * @readonly
   */
  get subGrid() {
    var _a;
    return this._subGrid || ((_a = this.grid) == null ? void 0 : _a.getSubGridFromColumn(this));
  }
  /**
   * Get the element for the SubGrid to which this column belongs
   * @property {HTMLElement}
   * @readonly
   * @private
   */
  get subGridElement() {
    return this.subGrid.element;
  }
  /**
   * The header element for this Column. *Only available after the grid has been rendered*.
   *
   * **Note that column headers are rerendered upon mutation of Column values, so this
   * value is volatile and should not be cached, but should be read whenever needed.**
   * @property {HTMLElement}
   * @readonly
   */
  get element() {
    return this.grid.getHeaderElement(this);
  }
  get previousVisibleSibling() {
    const region = this.region;
    let prev = this.previousSibling;
    while (prev && (prev.hidden || prev.region !== region)) {
      prev = prev.previousSibling;
    }
    return prev;
  }
  get nextVisibleSibling() {
    const region = this.region;
    let next = this.nextSibling;
    while (next && (next.hidden || next.region !== region)) {
      next = next.nextSibling;
    }
    return next;
  }
  get isLastInSubGrid() {
    return !this.nextVisibleSibling && (this.parent.isRoot || this.parent.isLastInSubGrid);
  }
  get allowDrag() {
    return !this.parent.isRoot || Boolean(this.nextVisibleSibling || this.previousVisibleSibling);
  }
  /**
   * The text wrapping element for this Column. *Only available after the grid has been rendered*.
   *
   * This is the full-width element which *contains* the text-bearing element and any icons.
   *
   * **Note that column headers are rerendered upon mutation of Column values, so this
   * value is volatile and should not be cached, but should be read whenever needed.**
   * @property {HTMLElement}
   * @readonly
   */
  get textWrapper() {
    return DomHelper.getChild(this.element, ".b-grid-header-text");
  }
  /**
   * The text containing element for this Column. *Only available after the grid has been rendered*.
   *
   * **Note that column headers are rerendered upon mutation of Column values, so this
   * value is volatile and should not be cached, but should be read whenever needed.**
   * @property {HTMLElement}
   * @readonly
   */
  get textElement() {
    return DomHelper.down(this.element, ".b-grid-header-text-content");
  }
  /**
   * The child element into which content should be placed. This means where any
   * contained widgets such as filter input fields should be rendered. *Only available after the grid has been
   * rendered*.
   *
   * **Note that column headers are rerendered upon mutation of Column values, so this
   * value is volatile and should not be cached, but should be read whenever needed.**
   * @property {HTMLElement}
   * @readonly
   */
  get contentElement() {
    return DomHelper.down(this.element, ".b-grid-header-children");
  }
  //endregion
  //region Misc properties
  get isSorted() {
    return this.grid.store.sorters.some((s) => s.field === this.field);
  }
  get isFocusable() {
    return this.isLeaf;
  }
  static get text() {
    return this.$meta.fields.defaults.text;
  }
  /**
   * Returns header text based on {@link #config-htmlEncodeHeaderText} config value.
   * @returns {String}
   * @internal
   */
  get headerText() {
    return this.htmlEncodeHeaderText ? StringHelper.encodeHtml(this.text) : this.text;
  }
  /**
   * An object which contains a map of the header widgets keyed by their {@link Core.widget.Widget#config-ref ref}.
   * @property {Object<String,Core.widget.Widget>} headerWidgetMap
   * @private
   * @readonly
   */
  //endregion
  //region Show/hide
  get isVisible() {
    return !this.hidden && (!this.parent || this.parent.isVisible);
  }
  /**
   * Hides this column.
   */
  hide(silent = false, hidingParent = false) {
    const me = this, { parent } = me;
    if (!me.hidden) {
      me.hidden = true;
      if (parent && !parent.isRoot && !parent.isTogglingAll) {
        const anyVisible = parent.children.some((child) => child.hidden !== true);
        if (!anyVisible && !parent.hidden) {
          silent = true;
          parent.hide();
        }
      }
      if (me.isParent) {
        me.children.forEach((child) => child.hide(true, true));
      } else if (!parent.isRoot) {
        parent.meta.visibleChildren[hidingParent ? "add" : "delete"](me);
      }
      if (!silent) {
        me.stores.forEach((store) => store.trigger("columnHide", { column: me }));
      }
    }
  }
  /**
   * Shows this column.
   */
  show(silent = false) {
    var _a;
    const me = this, { parent } = me;
    if (me.hidden) {
      me.hidden = false;
      if (parent == null ? void 0 : parent.hidden) {
        parent.show();
      }
      if (me.isParent) {
        (_a = me.meta.visibleChildren) == null ? void 0 : _a.forEach((child) => child.show(true));
      }
      if (!silent) {
        me.stores.forEach((store) => store.trigger("columnShow", { column: me }));
      }
    }
  }
  /**
   * Toggles the column visibility.
   * @param {Boolean} [force] Set to true (visible) or false (hidden) to force a certain state
   */
  toggle(forceVisible) {
    if (this.hidden && forceVisible === void 0 || forceVisible === true) {
      return this.show();
    }
    if (!this.hidden && forceVisible === void 0 || forceVisible === false) {
      return this.hide();
    }
  }
  /**
   * Toggles the column visibility of all children of a parent column.
   * @param {Grid.column.Column[]} [columns] The set of child columns to toggle, defaults to all children
   * @param {Boolean} [force] Set to true (visible) or false (hidden) to force a certain state
   */
  toggleChildren(columns = this.children, force = void 0) {
    var _a, _b;
    const me = this;
    (_a = me.grid.columns) == null ? void 0 : _a.beginBatch();
    me.isTogglingAll = true;
    columns.forEach((childColumn) => childColumn.toggle(force));
    me.isTogglingAll = false;
    (_b = me.grid.columns) == null ? void 0 : _b.endBatch();
  }
  /**
   * Toggles the collapsed state of the column. Based on the {@link #config-collapseMode}, this either hides all
   * but the first child column, or toggles the visibility state of all children (if you want to have a special
   * column shown in collapsed mode).
   *
   * Only applicable for columns with child columns.
   * @private
   * @param {Boolean} [force] Set to true (expanded) or false (collapsed) to force a certain state
   */
  onCollapseChange(force = void 0) {
    var _a, _b;
    const me = this;
    if (me.collapseMode === "toggleAll") {
      me.toggleChildren();
    } else {
      const { firstChild } = me;
      if (firstChild.flex != null && me.collapsed) {
        firstChild.oldFlex = firstChild.flex;
        firstChild.width = firstChild.element.offsetWidth;
      } else if (!me.collapsed && firstChild.oldFlex) {
        firstChild.flex = firstChild.oldFlex;
        firstChild.oldFlex = null;
      }
      (_a = me.grid.columns) == null ? void 0 : _a.beginBatch();
      me.isTogglingAll = true;
      me.children.slice(1).forEach((childColumn) => childColumn.toggle(force));
      me.isTogglingAll = false;
      (_b = me.grid.columns) == null ? void 0 : _b.endBatch();
    }
  }
  set collapsible(collapsible) {
    const me = this;
    me.set("collapsible", collapsible);
    if (me.isParent) {
      const { headerWidgets = [] } = me;
      if (collapsible) {
        headerWidgets.push({
          type: "button",
          ref: "collapseExpand",
          toggleable: true,
          pressed: me.collapsed,
          icon: `b-icon-collapse-${me.grid.rtl ? "right" : "left"}`,
          pressedIcon: `b-icon-collapse-${me.grid.rtl ? "left" : "right"}`,
          cls: "b-grid-header-collapse-button b-transparent",
          onToggle: ({ pressed }) => me.collapsed = pressed
        });
      } else {
        const index = headerWidgets.findIndex((w) => w.ref === "collapseExpand");
        index > -1 && headerWidgets.splice(index, 1);
      }
      me.headerWidgets = headerWidgets;
      if (me.collapsed) {
        me.onCollapseChange(false);
      }
    }
  }
  get collapsible() {
    return this.get("collapsible");
  }
  //endregion
  //region Index & id
  /**
   * Generates an id for the column when none is set. Generated ids are 'col1', 'col2' and so on. If a field is
   * specified (as it should be in most cases) the field name is used instead: 'name1', 'age2' ...
   * @private
   * @returns {String}
   */
  generateId() {
    if (!_Column.generatedIdIndex) {
      _Column.generatedIdIndex = 0;
    }
    return (this.field ? this.field.replace(/\./g, "-") : "col") + ++_Column.generatedIdIndex;
  }
  /**
   * Index among all flattened columns
   * @property {Number}
   * @readOnly
   * @internal
   */
  get allIndex() {
    return this.masterStore.indexOf(this);
  }
  //endregion
  //region Width
  // Returns size in pixels for measured value
  measureSize(value) {
    var _a;
    return DomHelper.measureSize(value, (_a = this.subGrid) == null ? void 0 : _a.element);
  }
  /**
   * Returns minimal width in pixels for applying to style according to the current `width` and `minWidth`.
   * @internal
   */
  get calcMinWidth() {
    const { width, minWidth } = this.data;
    if (validWidth(width) && validWidth(minWidth)) {
      return Math.max(parseInt(width) || 0, parseInt(minWidth) || 0);
    } else {
      return width;
    }
  }
  /**
   * Get/set columns width in px. If column uses flex, width will be undefined.
   * Setting a width on a flex column cancels out flex.
   *
   * **NOTE:** Grid might be configured to always stretch the last column, in which case the columns actual width
   * might deviate from the configured width.
   *
   * ```javascript
   * let grid = new Grid({
   *     appendTo : 'container',
   *     height   : 200,
   *     width    : 400,
   *     columns  : [{
   *         text  : 'First column',
   *         width : 100
   *     }, {
   *         text  : 'Last column',
   *         width : 100 // last column in the grid is always stretched to fill the free space
   *     }]
   * });
   *
   * grid.columns.last.element.offsetWidth; // 300 -> this points to the real element width
   * ```
   * @property {Number|String}
   */
  get width() {
    return this.data.width;
  }
  set width(width) {
    const data = { width };
    if (width && "flex" in this.data) {
      data.flex = null;
    }
    this.set(data);
  }
  set flex(flex) {
    const data = { flex };
    if (flex && "width" in this.data) {
      data.width = null;
    }
    this.set(data);
  }
  get flex() {
    return this.data.flex;
  }
  // This method is used to calculate minimum row width for edge and safari
  // It calculates minimum width of the row taking column hierarchy into account
  calculateMinWidth() {
    const me = this, width = me.measureSize(me.width), minWidth = me.measureSize(me.minWidth);
    let minChildWidth = 0;
    if (me.children) {
      minChildWidth = me.children.reduce((result, column) => {
        return result + column.calculateMinWidth();
      }, 0);
    }
    return Math.max(width, minWidth, minChildWidth);
  }
  /**
   * Resizes the column to match the widest string in it. By default it also measures the column header, this
   * behaviour can be configured by setting {@link Grid.view.Grid#config-resizeToFitIncludesHeader}.
   *
   * Called internally when you double click the edge between
   * column headers, but can also be called programmatically. For performance reasons it is limited to checking 1000
   * rows surrounding the current viewport.
   *
   * @param {Number|Number[]} widthMin Minimum allowed width. If content width is less than this, this width is used
   * instead. If this parameter is an array, the first element is `widthMin` and the seconds is `widthMax`.
   * @param {Number} widthMax Maximum allowed width. If the content width is greater than this number, this width
   * is used instead.
   */
  resizeToFitContent(widthMin, widthMax, batch = false) {
    const me = this, {
      grid,
      element,
      fitMode
    } = me, { rowManager, store } = grid, { count } = store;
    if (count <= 0 || me.fitMode === "none" || !me.fitMode) {
      return;
    }
    const [row] = rowManager.rows, {
      rowElement,
      cellElement
    } = grid.beginGridMeasuring(), cellContext = new Location({
      grid,
      column: me,
      id: null
    });
    let maxWidth = 0, start, end, i, record, value, length, longest = { length: 0, record: null };
    cellElement._domData = {
      columnId: me.id,
      row,
      rowElement
    };
    cellContext._cell = cellElement;
    cellContext.updatingSingleRow = true;
    cellContext.isMeasuring = true;
    cellElement.innerHTML = "";
    if (grid.resizeToFitIncludesHeader && !grid.hideHeaders) {
      if (!grid.$headerPadding) {
        const style = globalThis.getComputedStyle(element);
        grid.$headerPadding = parseInt(style.paddingLeft);
      }
      const headerText = element.querySelector(".b-grid-header-text-content");
      headerText.style.cssText = "flex: none; width: auto";
      maxWidth = headerText.offsetWidth + grid.$headerPadding * 2 + 2;
      headerText.style.cssText = "";
    }
    if (count > 1e3) {
      start = Math.max(Math.min(rowManager.topIndex + Math.round(rowManager.rowCount / 2) - 500, count - 1e3), 0);
      end = start + 1e3;
    } else {
      start = 0;
      end = count;
    }
    for (i = start; i < end; i++) {
      record = store.getAt(i);
      value = me.getRawValue(record);
      if (fitMode === "value") {
        length = String(value).length;
      } else {
        cellContext._record = longest.record;
        cellContext._id = record.id;
        cellContext._rowIndex = i;
        row.renderCell(cellContext);
        if (fitMode === "textContent") {
          length = cellElement.textContent.length;
        } else {
          const width = cellElement.offsetWidth;
          if (width > maxWidth) {
            maxWidth = width;
          }
        }
      }
      if (length > longest.length) {
        longest = { record, length, rowIndex: i };
      }
    }
    if (longest.length > 0 && (fitMode === "value" || fitMode === "textContent")) {
      cellContext._record = longest.record;
      cellContext._id = longest.record.id;
      cellContext._rowIndex = longest.rowIndex;
      row.renderCell(cellContext);
      maxWidth = Math.max(maxWidth, cellElement.offsetWidth);
    }
    if (Array.isArray(widthMin)) {
      [widthMin, widthMax] = widthMin;
    }
    maxWidth = Math.max(maxWidth, widthMin || 0);
    maxWidth = Math.min(maxWidth, widthMax || 1e6);
    if (!batch) {
      grid.endGridMeasuring();
    }
    me.width = me.maxWidth ? maxWidth = Math.min(maxWidth, me.maxWidth) : maxWidth;
    return maxWidth;
  }
  //endregion
  //region State
  /**
   * Get column state, used by State mixin
   * @private
   */
  getState() {
    const me = this, state = {
      id: me.id,
      // State should only store column attributes which user can modify via UI (except column index).
      // User can hide column, resize or move it to neighbor region
      hidden: me.hidden,
      region: me.region,
      locked: me.locked
    };
    if (!me.children) {
      state[me.flex ? "flex" : "width"] = me.flex || me.width;
    }
    if (me.isCollapsible) {
      state.collapsed = me.collapsed;
    }
    return state;
  }
  /**
   * Apply state to column, used by State mixin
   * @private
   */
  applyState(state) {
    const me = this;
    me.beginBatch();
    if ("locked" in state) {
      me.locked = state.locked;
    }
    if ("width" in state) {
      me.width = state.width;
    }
    if ("flex" in state) {
      me.flex = state.flex;
    }
    if ("width" in state && me.flex) {
      me.flex = void 0;
    } else if ("flex" in state && me.width) {
      me.width = void 0;
    }
    if ("region" in state) {
      me.region = state.region;
    }
    me.endBatch();
    if ("hidden" in state) {
      me.toggle(state.hidden !== true);
    }
    if ("collapsed" in state) {
      me.collapsed = state.collapsed;
    }
  }
  //endregion
  //region Other
  remove() {
    const { subGrid, grid } = this, focusedCell = subGrid && (grid == null ? void 0 : grid.focusedCell);
    if ((focusedCell == null ? void 0 : focusedCell.columnId) === this.id) {
      if (grid.owns(DomHelper.getActiveElement(grid))) {
        grid.navigateRight();
      } else {
        grid._focusedCell = new Location({
          grid,
          rowIndex: focusedCell.rowIndex,
          column: subGrid.columns.getAdjacentVisibleLeafColumn(this.id, true, true)
        });
      }
    }
    super.remove();
  }
  /**
   * Extracts the value from the record specified by this Column's {@link #config-field} specification.
   *
   * This will work if the field is a dot-separated path to access fields in associated records, eg
   *
   * ```javascript
   *  field : 'resource.calendar.name'
   * ```
   *
   * **Note:** This is the raw field value, not the value returned by the {@link #config-renderer}.
   * @param {Core.data.Model} record The record from which to extract the field value.
   * @returns {*} The value of the referenced field if any.
   */
  getRawValue(record) {
    return record.getValue(this.field);
  }
  /**
   * Refresh the cell for supplied record in this column, if that cell is rendered.
   * @param {Core.data.Model} record Record used to get row to update the cell in
   */
  refreshCell(record) {
    this.grid.rowManager.refreshCell(record, this.id);
  }
  /**
   * Rerender the header for this column
   */
  refreshHeader() {
    this.grid.refreshHeader(this);
  }
  /**
   * Clear cell contents. Base implementation which just sets innerHTML to blank string.
   * Should be overridden in subclasses to clean up for examples widgets.
   * @param {HTMLElement} cellElement
   * @internal
   */
  clearCell(cellElement) {
    cellElement.innerHTML = "";
    delete cellElement._content;
  }
  /**
   * Override in subclasses to allow/prevent editing of certain rows.
   * @param {Core.data.Model} record
   * @internal
   */
  canEdit(record) {
    if (record.isEditable) {
      const isEditable = record.isEditable(this.field);
      if (isEditable !== void 0) {
        return isEditable;
      }
    }
    return true;
  }
  /**
   * Insert a child column(s) before an existing child column. Returns `null` if the parent column is
   * {@link #config-sealed}
   * @param {Core.data.Model|Core.data.Model[]} childColumn Column or array of columns to insert
   * @param {Core.data.Model} [before] Optional column to insert before, leave out to append to the end
   * @param {Boolean} [silent] Pass `true` to not trigger events during insert
   * @returns {Core.data.Model|Core.data.Model[]|null}
   * @category Parent & children
   */
  insertChild(childColumn, before = null, silent = false) {
    childColumn = Array.isArray(childColumn) ? childColumn : [childColumn];
    childColumn.forEach((col) => {
      const { parent } = col;
      if ((parent == null ? void 0 : parent.collapsed) && col === parent.firstChild && parent.children.length > 1 && parent.children.filter((child) => !child.hidden).length === 1) {
        col.nextSibling.hidden = false;
      }
    });
    return this.sealed && !this.inProcessChildren ? null : super.insertChild(...arguments);
  }
  /**
   * Override in subclasses to prevent this column from being filled with the {@link Grid.feature.FillHandle} feature
   * @param {Object} data Object containing information about current cell and fill value
   * @param {Grid.util.Location} data.cell Current cell data
   * @param {Grid.util.Location[]} data.range Range from where to calculate values
   * @param {Core.data.Model} data.record Current cell record
   * @returns {Boolean}
   * @internal
   */
  canFillValue() {
    return true;
  }
  //endregion
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, with special handling for sortable, editor, renderer and
  // headerRenderer
  getCurrentConfig(options) {
    var _a;
    const result = super.getCurrentConfig(options);
    if ((_a = this.sortable) == null ? void 0 : _a.originalSortFn) {
      result.sortable = this.sortable.originalSortFn;
    }
    if (result.renderer === this.internalRenderer) {
      delete result.renderer;
    }
    if (result.headerRenderer === this.internalHeaderRenderer) {
      delete result.headerRenderer;
    }
    delete result.ariaLabel;
    delete result.cellAriaLabel;
    return result;
  }
};
__publicField(_Column, "$name", "Column");
/**
 * Column name alias which you can use in the `columns` array of a Grid.
 *
 * ```javascript
 * class MyColumn extends Column {
 *     static get type() {
 *        return 'mycolumn';
 *     }
 * }
 * ```
 *
 * ```javascript
 * const grid = new Grid({
 *    columns : [
 *       { type : 'mycolumn', text : 'The column', field : 'someField', flex : 1 }
 *    ]
 * });
 * ```
 *
 * @static
 * @member {String} type
 */
__publicField(_Column, "type", "column");
var Column = _Column;
Column.emptyCount = 0;
Column.defaultWidth = 100;
Column.exposeProperties();
Column._$name = "Column";

// ../Grid/lib/Grid/data/ColumnStore.js
var columnDefinitions = {
  boolean: {
    type: "check"
  },
  date: {
    type: "date"
  },
  integer: {
    type: "number",
    format: {
      maximumFractionDigits: 0
    }
  },
  number: {
    type: "number"
  }
};
var lockedColumnSorters = [{
  field: "region"
}];
var ColumnStore = class _ColumnStore extends Localizable_default(Store) {
  //region Events
  /**
   * Fires when a column is shown.
   * @event columnShow
   * @param {Grid.data.ColumnStore} source The store which triggered the event.
   * @param {Grid.column.Column} column The column which status has been changed.
   */
  /**
   * Fires when a column has been hidden.
   * @event columnHide
   * @param {Grid.data.ColumnStore} source The store which triggered the event.
   * @param {Grid.column.Column} column The column which status has been changed.
   */
  //endregion
  static get defaultConfig() {
    return {
      modelClass: Column,
      tree: true,
      /**
       * Automatically adds a field definition to the store used by the Grid when adding a new Column displaying a
       * non-existing field.
       *
       * To enable this behaviour:
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : {
       *         autoAddField : true,
       *         data         : [
       *             // Column definitions here
       *         ]
       *     }
       * }
       *
       * @config {Boolean}
       * @default
       */
      autoAddField: false,
      /**
       * `ColumnStore` uses `syncDataOnLoad` by default (with `threshold : 1`), to ensure good performance when
       * binding to columns in frameworks.
       *
       * See {@link Core/data/Store#config-syncDataOnLoad} for more information.
       *
       * @config {Boolean|SyncDataOnLoadOptions}
       * @default true
       * @readonly
       */
      syncDataOnLoad: {
        threshold: 1
      },
      // Locked columns must sort to before non-locked
      sorters: lockedColumnSorters,
      // Make sure regions stick together when adding columns
      reapplySortersOnAdd: true
    };
  }
  construct(config) {
    const me = this;
    if (config.grid) {
      config.grid._columnStore = me;
      me.id = `${config.grid.id}-columns`;
      config.grid.ion({
        subGridCollapse: "clearSubGridCaches",
        subGridExpand: "clearSubGridCaches",
        thisObj: me
      });
    }
    super.construct(config);
    me.ion({
      change: me.onStoreChange,
      sort: () => me.updateChainedStores(),
      thisObj: me,
      prio: 1
    });
  }
  doDestroy() {
    const allColumns = [];
    if (!this.isChained) {
      this.traverse((column) => allColumns.push(column));
    }
    super.doDestroy();
    if (!this.isChained) {
      allColumns.forEach((column) => column.destroy());
    }
  }
  // Overridden because the flat collection only contains top level columns,
  // not leaves - group columns are *not* expanded.
  /**
   * Get column by id.
   * @param {String|Number} id
   * @returns {Grid.column.Column}
   */
  getById(id) {
    return super.getById(id) || this.idRegister[id];
  }
  forEach(fn, thisObj = this) {
    this.traverseWhile((n, i) => fn.call(thisObj, n, i), true);
  }
  get totalFixedWidth() {
    let result = 0;
    for (const col of this) {
      if (!col.hidden) {
        if (col.children) {
          col.children.forEach((childCol) => result += this.calculateFixedWidth(childCol));
        } else {
          result += this.calculateFixedWidth(col);
        }
      }
    }
    return result;
  }
  get hasFlex() {
    return this.visibleColumns.some((column) => column.flex);
  }
  calculateFixedWidth(column) {
    if (column.flex) {
      return column.measureSize(Column.defaultWidth);
    } else {
      return Math.max(column.measureSize(column.width), column.measureSize(column.minWidth));
    }
  }
  /**
   * Returns the top level columns. If using grouped columns, this is the top level columns. If no grouped
   * columns are being used, this is the leaf columns.
   * @property {Grid.column.Column[]}
   * @readonly
   */
  get topColumns() {
    return this.isChained ? this.masterStore.rootNode.children.filter(this.chainedFilterFn) : this.rootNode.children;
  }
  /**
   * Returns the visible leaf headers which drive the rows' cell content.
   * @property {Grid.column.Column[]}
   * @readonly
   */
  get visibleColumns() {
    const me = this;
    if (!me._visibleColumns) {
      me._visibleColumns = me.leaves.filter((column) => column.isVisible && (!column.subGrid || !column.subGrid.collapsed));
    }
    return me._visibleColumns;
  }
  onStoreChange({ action, changes }) {
    if (action === "update" && !("hidden" in changes)) {
      return;
    }
    this.clearCaches();
  }
  clearSubGridCaches({ subGrid }) {
    subGrid.columns.clearCaches();
    this.clearCaches();
  }
  clearCaches() {
    var _a;
    this._visibleColumns = null;
    (_a = this.masterStore) == null ? void 0 : _a.clearCaches();
  }
  onMasterDataChanged(event) {
    super.onMasterDataChanged(event);
    if (event.action !== "update" || "hidden" in event.changes) {
      this.clearCaches();
    }
  }
  getAdjacentVisibleLeafColumn(columnOrId, next = true, wrap = false) {
    const columns = this.visibleColumns, column = columnOrId instanceof Column ? columnOrId : this.getById(columnOrId);
    let idx = columns.indexOf(column) + (next ? 1 : -1);
    if (!columns[idx]) {
      if (wrap) {
        idx = next ? 0 : columns.length - 1;
      } else {
        return null;
      }
    }
    return columns[idx];
  }
  /**
   * Bottom columns are the ones displayed in the bottom row of a grouped header, or all columns if not using a grouped
   * header. They are the columns that actually display any data.
   * @property {Grid.column.Column[]}
   * @readonly
   */
  get bottomColumns() {
    return this.leaves;
  }
  /**
   * Get column by field. To be sure that you are getting exactly the intended column, use {@link Core.data.Store#function-getById Store#getById()} with the
   * columns id instead.
   * @param {String} field Field name
   * @returns {Grid.column.Column}
   */
  get(field) {
    return this.findRecord("field", field, true);
  }
  /**
   * Used internally to create a new record in the store. Creates a column of the correct type by looking up the
   * specified type among registered columns.
   * @private
   */
  createRecord(data) {
    var _a, _b;
    const { grid = {} } = this, { store } = grid, dataField = (_b = (_a = store == null ? void 0 : store.modelClass) == null ? void 0 : _a.fieldMap) == null ? void 0 : _b[data.field];
    let columnClass = this.modelClass;
    if (dataField == null ? void 0 : dataField.column) {
      data = Objects.merge({}, dataField.column, data);
    }
    if (data.type) {
      columnClass = _ColumnStore.getColumnClass(data.type);
      if (!columnClass) {
        throw new Error(`Column type '${data.type}' not registered`);
      }
    }
    if (data.locked) {
      data.region = "locked";
      delete data.locked;
    }
    const column = new columnClass(data, this);
    if (!column.data.region) {
      column.data.region = grid.defaultRegion || "normal";
    }
    if (this.autoAddField && !column.noFieldSpecified && store && !dataField) {
      let fieldDefinition = column.field;
      if (column.constructor.fieldType) {
        fieldDefinition = {
          name: column.field,
          type: column.constructor.fieldType
        };
      }
      store.modelClass.addField(fieldDefinition);
    }
    return column;
  }
  /**
   * indexOf extended to also accept a columns field, for backward compatibility.
   * ```
   * grid.columns.indexOf('name');
   * ```
   * @param {Core.data.Model|String} recordOrId
   * @returns {Number}
   */
  indexOf(recordOrId) {
    if (recordOrId == null) {
      return -1;
    }
    const index = super.indexOf(recordOrId);
    if (index > -1)
      return index;
    return this.records.findIndex((r) => r.field === recordOrId);
  }
  /**
   * Removes all columns.
   * @param {Boolean} [silent] Specify `true` to suppress events
   * @returns {Boolean} `true` unless the action was prevented, in which case it returns `false`
   * @fires beforeRemove
   * @fires removeAll
   * @fires change
   * @category CRUD
   */
  removeAll(silent = false) {
    const me = this, isTimeAxis = me.some((i) => i.isTimeAxisColumn);
    if (isTimeAxis) {
      return me.remove(me.query((i) => !i.isTimeAxisColumn), silent);
    }
    return super.removeAll(silent);
  }
  /**
   * Checks if any column uses autoHeight
   * @internal
   * @property {Boolean}
   * @readonly
   */
  get usesAutoHeight() {
    return this.find((column) => column.autoHeight);
  }
  /**
   * Checks if any flex column uses autoHeight
   * @internal
   * @property {Boolean}
   * @readonly
   */
  get usesFlexAutoHeight() {
    return this.find((column) => column.autoHeight && column.flex != null);
  }
  // Let syncDataOnLoad match on id, field or type (in that order)
  resolveSyncNode(rawData) {
    if (rawData.id) {
      return super.resolveSyncNode(rawData);
    }
    if (rawData.field) {
      return {
        id: rawData.field,
        node: this.allRecords.find((r) => r.field === rawData.field)
      };
    }
    if (rawData.type) {
      return {
        id: rawData.type,
        node: this.allRecords.find((r) => r.type === rawData.type)
      };
    }
    return { id: null, node: null };
  }
  //region Column types
  /**
   * Call from custom column to register it with ColumnStore. Required to be able to specify type in column config.
   * @param {Function} columnClass The {@link Grid.column.Column} subclass to register.
   * @param {Boolean} simpleRenderer Pass `true` if its default renderer does *not* use other fields from the passed
   * record than its configured {@link Grid.column.Column#config-field}. This enables more granular cell updating
   * upon record mutation.
   *
   * ```javascript
   * // create and register custom column
   * class CustomColumn {
   *  static get type() {
   *      return 'custom';
   *  }
   * }
   * ColumnStore.registerColumnType(CustomColumn, true);
   * // now possible to specify in column config
   * let grid = new Grid({
   *   columns: [
   *     { type: 'custom', field: 'id' }
   *   ]
   * });
   * ```
   */
  static registerColumnType(columnClass, simpleRenderer = false) {
    columnClass.simpleRenderer = simpleRenderer;
    (_ColumnStore.columnTypes || (_ColumnStore.columnTypes = {}))[columnClass.type] = columnClass;
  }
  /**
   * Returns registered column class for specified type.
   * @param type Type name
   * @returns {Grid.column.Column}
   * @internal
   */
  static getColumnClass(type) {
    return _ColumnStore.columnTypes && _ColumnStore.columnTypes[type];
  }
  /**
   * Generates a <strong>new </strong> {@link Grid.column.Column} instance which may be subsequently added to this
   * store to represent the passed {@link Core.data.field.DataField} of the owning Grid's store.
   * @param {Core.data.field.DataField|String} dataField The {@link Core.data.field.DataField field}
   * instance or field name to generate a new {@link Grid.column.Column} for.
   *
   * ```javascript
   * // Add column for the "team" field.
   * grid.columns.add(grid.columns.generateColumnForField('team', {
   *     width : 200
   * }));
   * ```
   *
   * @param {Object} [defaults] Defaults to apply to the new column.
   * @returns {Grid.column.Column} A new Column which will render and edit the field correctly.
   * @internal
   */
  generateColumnForField(dataField, defaults) {
    var _a;
    if (typeof dataField === "string" && this.grid) {
      dataField = (_a = this.grid.store) == null ? void 0 : _a.modelClass.fieldMap[dataField];
    }
    let column = dataField.column || columnDefinitions[dataField.type] || {};
    if (typeof column === "string") {
      column = { type: column };
    }
    column = Object.assign({
      text: dataField.text || StringHelper.separate(dataField.name),
      field: dataField.name
    }, defaults, column);
    if (dataField.precision != null) {
      column.format.maximumFractionDigits = dataField.precision;
    }
    if (dataField.columnType) {
      column.type = dataField.columnType;
    }
    return this.createRecord(column);
  }
  //endregion
};
var columnResizeEvent = (handler, thisObj) => ({
  update: ({ store, record, changes }) => {
    let result = true;
    if ("width" in changes || "minWidth" in changes || "maxWidth" in changes || "flex" in changes) {
      result = handler.call(thisObj, { store, record, changes });
    }
    return result;
  }
});
ColumnStore.registerColumnType(Column, true);
ColumnStore._$name = "ColumnStore";

// ../Grid/lib/Grid/column/WidgetColumn.js
var WidgetColumn = class extends Column {
  /**
   * A renderer function, which gives you access to render data like the current `record`, `cellElement` and the
   * {@link #config-widgets} of the column. See {@link #config-renderer}
   * for more information.
   *
   * ```javascript
   * new Grid({
   *     columns : [
   *         {
   *              type: 'check',
   *              field: 'allow',
   *              // In the column renderer, we get access to the record and column widgets
   *              renderer({ record, widgets }) {
   *                  // Hide checkboxes in certain rows
   *                  widgets[0].hidden = record.readOnly;
   *              }
   *         }
   *     ]
   * });
   * ```
   *
   * @config {Function} renderer
   * @param {Object} renderData Object containing renderer parameters
   * @param {HTMLElement} renderData.cellElement Cell element, for adding CSS classes, styling etc. Can be `null` in case of export
   * @param {*} renderData.value Value to be displayed in the cell
   * @param {Core.data.Model} renderData.record Record for the row
   * @param {Grid.column.Column} renderData.column This column
   * @param {Core.widget.Widget[]} renderData.widgets An array of the widgets rendered into this cell
   * @param {Grid.view.Grid} renderData.grid This grid
   * @param {Grid.row.Row} renderData.row Row object. Can be null in case of export.
   *   Use the {@link Grid.row.Row#function-assignCls row's API} to manipulate CSS class names.
   * @param {Object} renderData.size Set `size.height` to specify the desired row height for the current row.
   *   Largest specified height is used, falling back to configured {@link Grid/view/Grid#config-rowHeight}
   *   in case none is specified. Can be null in case of export
   * @param {Number} renderData.size.height Set this to request a certain row height
   * @param {Number} renderData.size.configuredHeight Row height that will be used if none is requested
   * @param {Boolean} renderData.isExport True if record is being exported to allow special handling during export
   * @param {Boolean} renderData.isTreeGroup True if record is a generated tree group parent record
   * @param {Boolean} renderData.isMeasuring True if the column is being measured for a `resizeToFitContent` call.
   *   In which case an advanced renderer might need to take different actions.
   * @returns {void}
   *
   * @category Rendering
   */
  static get defaults() {
    return {
      filterable: false,
      sortable: false,
      editor: false,
      searchable: false,
      fitMode: false,
      alwaysClearCell: false
    };
  }
  //endregion
  //region Init / Destroy
  construct(config, store) {
    const me = this;
    me.widgetMap = {};
    super.construct(...arguments);
    if (me.renderer !== me.internalRenderer) {
      me.externalRenderer = me.renderer;
      me.renderer = me.internalRenderer;
    }
  }
  doDestroy() {
    for (const widget of Object.values(this.widgetMap)) {
      widget.destroy && widget.destroy();
    }
    super.doDestroy();
  }
  // Called by grid when its read-only state is toggled
  updateReadOnly(readOnly) {
    for (const widget of Object.values(this.widgetMap)) {
      if (!widget.cellInfo.record.readOnly) {
        widget.readOnly = readOnly;
      }
    }
  }
  //endregion
  //region Render
  /**
   * Renderer that displays a widget in the cell.
   * @param {Object} renderData Render data
   * @param {Grid.column.Column} renderData.column Rendered column
   * @param {Core.data.Model} renderData.record Rendered record
   * @private
   */
  internalRenderer(renderData) {
    var _a;
    const me = this, { cellElement, column, record, isExport } = renderData, { widgets } = column;
    if (!isExport && widgets) {
      if (!cellElement.widgets) {
        me.clearCell(cellElement);
      }
      cellElement.widgets = renderData.widgets = widgets.map((widgetCfg, i) => {
        var _a2, _b;
        let widget, widgetNextSibling;
        if (cellElement.widgets) {
          widget = cellElement.widgets[i];
          widgetNextSibling = widget.element.nextElementSibling;
          if (widgetCfg.recreate && widget) {
            delete me.widgetMap[widget.id];
            widget.destroy();
            cellElement.widgets[i] = null;
          }
        }
        if (!widget) {
          me.onBeforeWidgetCreate(widgetCfg, renderData);
          widgetCfg.recomposeAsync = false;
          widgetCfg.owner = me.grid;
          widget = WidgetHelper.append(widgetCfg, widgetNextSibling ? { insertBefore: widgetNextSibling } : cellElement)[0];
          me.widgetMap[widget.id] = widget;
          me.onAfterWidgetCreate(widget, renderData);
          if (widget.name) {
            widget.ion({
              change: ({ value, userAction }) => {
                if (userAction) {
                  widget.cellInfo.record.setValue(widget.name, value);
                }
              }
            });
          }
        }
        widget.cellInfo = {
          record,
          column
        };
        if (me.grid && !me.meta.isSelectionColumn) {
          widget.readOnly = me.grid.readOnly || record.readOnly;
        }
        if (((_a2 = me.onBeforeWidgetSetValue) == null ? void 0 : _a2.call(me, widget, renderData)) !== false) {
          const valueProperty = widgetCfg.valueProperty || "value" in widget && "value" || widget.defaultBindProperty;
          if (valueProperty) {
            const value = widget.name ? record.getValue(widget.name) : renderData.value;
            widget[valueProperty] = value;
          }
        }
        (_b = me.onAfterWidgetSetValue) == null ? void 0 : _b.call(me, widget, renderData);
        return widget;
      });
    }
    const result = (_a = me.externalRenderer) == null ? void 0 : _a.call(me, renderData);
    if (isExport) {
      return result;
    }
    if (!result && !widgets) {
      return "";
    }
    return result;
  }
  //endregion
  //region Other
  /**
   * Called before widget is created on rendering
   * @param {ContainerItemConfig} widgetCfg Widget config
   * @param {Object} renderData Render data
   * @private
   */
  onBeforeWidgetCreate(widgetCfg, renderData) {
  }
  /**
   * Called after widget is created on rendering
   * @param {Core.widget.Widget} widget Created widget
   * @param {Object} renderData Render data
   * @private
   */
  onAfterWidgetCreate(widget, renderData) {
  }
  /**
   * Called before the widget gets its value on rendering. Pass `false` to skip value setting while rendering
   * @preventable
   * @function onBeforeWidgetSetValue
   * @param {Core.widget.Widget} widget Created widget
   * @param {Object} renderData Render data
   * @param {Grid.column.Column} renderData.column Rendered column
   * @param {Core.data.Model} renderData.record Rendered record
   */
  /**
   * Called after the widget gets its value on rendering.
   * @function onAfterWidgetSetValue
   * @param {Core.widget.Widget} widget Created widget
   * @param {Object} renderData Render data
   * @param {Grid.column.Column} renderData.column Rendered column
   * @param {Core.data.Model} renderData.record Rendered record
   */
  // Overrides base implementation to cleanup widgets, for example when a cell is reused as part of group header
  clearCell(cellElement) {
    if (cellElement.widgets) {
      cellElement.widgets.forEach((widget) => {
        delete this.widgetMap[widget.id];
        widget.destroy();
      });
      cellElement.widgets = null;
    }
    super.clearCell(cellElement);
  }
  // Null implementation because there is no way of ascertaining whether the widgets get their width from
  // the column, or the column shrinkwraps the Widget.
  // Remember that the widget could have a width from a CSS rule which we cannot read.
  // It might have width: 100%, or a flex which would mean it is sized by us, but we cannot read that -
  // getComputedStyle would return the numeric width.
  resizeToFitContent() {
  }
  //endregion
};
//region Config
__publicField(WidgetColumn, "$name", "WidgetColumn");
__publicField(WidgetColumn, "type", "widget");
__publicField(WidgetColumn, "fields", [
  /**
   * An array of {@link Core.widget.Widget} config objects
   * @config {ContainerItemConfig[]} widgets
   * @category Common
   */
  "widgets"
]);
ColumnStore.registerColumnType(WidgetColumn);
WidgetColumn.exposeProperties();
WidgetColumn._$name = "WidgetColumn";

// ../Grid/lib/Grid/column/CheckColumn.js
var CheckColumn = class extends WidgetColumn {
  construct(config, store) {
    var _a;
    super.construct(...arguments);
    const me = this;
    Object.assign(me, {
      externalHeaderRenderer: me.headerRenderer,
      externalOnBeforeWidgetSetValue: me.onBeforeWidgetSetValue,
      externalOnAfterWidgetSetValue: me.onAfterWidgetSetValue,
      onBeforeWidgetSetValue: me.internalOnBeforeWidgetSetValue,
      onAfterWidgetSetValue: me.internalOnAfterWidgetSetValue,
      headerRenderer: me.internalHeaderRenderer
    });
    if (!me.meta.isSelectionColumn) {
      const modelClass = (_a = me.grid) == null ? void 0 : _a.store.modelClass;
      if (!me.field) {
        console.warn("CheckColumn MUST be configured with a field, otherwise the checked state will not be persistent. Widgets are recycled and reused");
      } else if (modelClass && !modelClass.fieldMap[me.field] && !me.constructor.suppressNoModelFieldWarning) {
        console.warn(me.$$name + " is configured with a field, but this is not part of your Model `fields` collection.");
        modelClass.addField({ name: me.field, type: "boolean" });
      }
    }
  }
  doDestroy() {
    var _a;
    (_a = this.headerCheckbox) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  internalHeaderRenderer({ headerElement, column }) {
    let returnValue;
    headerElement.classList.add("b-check-header");
    if (column.showCheckAll) {
      headerElement.classList.add("b-check-header-with-checkbox");
      if (column.headerCheckbox) {
        headerElement.appendChild(column.headerCheckbox.element);
      } else {
        column.headerCheckbox = new Checkbox({
          appendTo: headerElement,
          owner: this.grid,
          ariaLabel: "L{Checkbox.toggleSelection}",
          internalListeners: {
            change: "onCheckAllChange",
            thisObj: column
          }
        });
      }
    } else {
      returnValue = column.headerText;
    }
    returnValue = column.externalHeaderRenderer ? column.externalHeaderRenderer.call(this, ...arguments) : returnValue;
    return column.showCheckAll ? void 0 : returnValue;
  }
  updateCheckAllState(value) {
    if (this.headerCheckbox) {
      this.headerCheckbox.suspendEvents();
      this.headerCheckbox.checked = value;
      this.headerCheckbox.resumeEvents();
    }
  }
  onCheckAllChange({ checked }) {
    const me = this;
    if (me.field) {
      const { store } = me.grid;
      store.beginBatch();
      store.forEach((record) => me.updateRecord(record, me.field, checked));
      store.endBatch();
    }
    me.trigger("toggleAll", { checked });
  }
  //endregion
  internalRenderer({ value, isExport, record, cellElement }) {
    const result = super.internalRenderer(...arguments);
    if (isExport) {
      return result != null ? result : value == null ? "" : value;
    }
    if (record.readOnly && !this.meta.isSelectionColumn) {
      cellElement.widgets[0].readOnly = true;
    }
    if (value) {
      cellElement.widgets[0].input.setAttribute("checked", true);
    } else {
      cellElement.widgets[0].input.removeAttribute("checked");
    }
    return result;
  }
  //region Widget rendering
  onBeforeWidgetCreate(widgetCfg, event) {
    widgetCfg.cls = this.checkCls;
  }
  onAfterWidgetCreate(widget, event) {
    event.cellElement.widget = widget;
    widget.ion({
      beforeChange: "onBeforeCheckboxChange",
      change: "onCheckboxChange",
      thisObj: this
    });
  }
  internalOnBeforeWidgetSetValue(widget) {
    var _a;
    widget.record = widget.cellInfo.record;
    this.isInitialSet = true;
    (_a = this.externalOnBeforeWidgetSetValue) == null ? void 0 : _a.call(this, ...arguments);
  }
  internalOnAfterWidgetSetValue(widget) {
    var _a;
    this.isInitialSet = false;
    (_a = this.externalOnAfterWidgetSetValue) == null ? void 0 : _a.call(this, ...arguments);
  }
  //endregion
  //region Events
  onBeforeCheckboxChange({ source, checked, userAction }) {
    const me = this, { grid } = me, { record } = source.cellInfo;
    if (userAction && me.field && (!grid.features.cellEdit || grid.features.cellEdit.disabled) || me.meta.isSelectionColumn && !grid.isSelectable(record) && checked) {
      return false;
    }
    if (!me.isInitialSet) {
      return me.trigger("beforeToggle", { record, checked });
    }
  }
  onCheckboxChange({ source, checked }) {
    if (!this.isInitialSet) {
      const me = this, { record } = source.cellInfo, { field } = me;
      if (field) {
        me.updateRecord(record, field, checked);
        if (checked) {
          me.updateCheckAllState(me.grid.store.every((r) => r[field], null, true));
        } else {
          me.updateCheckAllState(false);
        }
      }
      me.trigger("toggle", { record, checked, checkbox: source });
    }
  }
  updateRecord(record, field, checked) {
    record.setValue(field, checked);
  }
  //endregion
  onCellKeyDown({ event, cellElement }) {
    if (event.key === " ") {
      const checkbox = cellElement.widget;
      checkbox == null ? void 0 : checkbox.toggle();
      event.preventDefault();
      event.handled = true;
    }
  }
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, with special handling for the hooks
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options);
    delete result.onBeforeWidgetSetValue;
    delete result.onAfterWidgetSetValue;
    if (this.externalOnBeforeWidgetSetValue) {
      result.onBeforeWidgetSetValue = this.externalOnBeforeWidgetSetValue;
    }
    if (this.externalOnAfterWidgetSetValue) {
      result.onAfterWidgetSetValue = this.externalOnAfterWidgetSetValue;
    }
    return result;
  }
};
//region Config
__publicField(CheckColumn, "$name", "CheckColumn");
__publicField(CheckColumn, "type", "check");
__publicField(CheckColumn, "fields", [
  "checkCls",
  "showCheckAll",
  "onAfterWidgetSetValue",
  "onBeforeWidgetSetValue",
  "callOnFunctions",
  "onBeforeToggle",
  "onToggle",
  "onToggleAll"
]);
__publicField(CheckColumn, "defaults", {
  align: "center",
  /**
   * CSS class name to add to checkbox
   * @config {String}
   * @category Rendering
   */
  checkCls: null,
  /**
   * True to show a checkbox in the column header to be able to select/deselect all rows
   * @config {Boolean}
   */
  showCheckAll: false,
  sortable: true,
  filterable: true,
  widgets: [{
    type: "checkbox",
    valueProperty: "checked"
  }]
});
ColumnStore.registerColumnType(CheckColumn, true);
CheckColumn._$name = "CheckColumn";

// ../Grid/lib/Grid/column/RowNumberColumn.js
var RowNumberColumn = class extends Column {
  static get defaults() {
    return {
      /**
       * @config {Boolean} groupable
       * @hide
       */
      groupable: false,
      /**
       * @config {Boolean} sortable
       * @hide
       */
      sortable: false,
      /**
       * @config {Boolean} filterable
       * @hide
       */
      filterable: false,
      /**
       * @config {Boolean} searchable
       * @hide
       */
      searchable: false,
      /**
       * @config {Boolean} resizable
       * @hide
       */
      resizable: false,
      /**
       * @config {Boolean} draggable
       * @hide
       */
      draggable: false,
      minWidth: 50,
      width: 50,
      align: "right",
      text: "#",
      editor: false,
      readOnly: true
    };
  }
  construct(config) {
    super.construct(...arguments);
    const me = this, { grid } = me;
    me.internalCellCls = "b-row-number-cell";
    me.externalHeaderRenderer = me.headerRenderer;
    me.headerRenderer = me.internalHeaderRenderer;
    if (grid) {
      grid.ion({
        bindStore: "bindStore",
        thisObj: me
      });
      me.bindStore({ store: grid.store, initial: true });
      if (grid.store.count && !grid.rendered) {
        grid.ion({
          paint: "resizeToFitContent",
          thisObj: me,
          once: true
        });
      }
    }
  }
  get groupHeaderReserved() {
    return true;
  }
  bindStore({ store, initial }) {
    const me = this;
    me.detachListeners("grid");
    store.ion({
      name: "grid",
      [`change${me.grid.asyncEventSuffix}`]: "onStoreChange",
      thisObj: me
    });
    if (!initial && !me.resizeToFitContent()) {
      me.measureOnRender();
    }
  }
  onStoreChange({ action, isMove }) {
    if (action === "dataset" || action === "add" || action === "remove" || action === "removeall") {
      if (action === "remove" && isMove) {
        return;
      }
      const result = this.resizeToFitContent();
      if (action === "dataset" && !result && this.grid.store.count) {
        this.measureOnRender();
      }
    }
  }
  measureOnRender() {
    this.grid.rowManager.ion({
      renderDone() {
        this.resizeToFitContent();
      },
      once: true,
      thisObj: this
    });
  }
  /**
   * Renderer that displays the row number in the cell.
   * @private
   */
  renderer({ record, grid }) {
    return record.isSpecialRow ? "" : grid.store.indexOf(record, true) + 1;
  }
  /**
   * Resizes the column to match the widest string in it. Called when you double click the edge between column
   * headers
   */
  resizeToFitContent() {
    const me = this, { store, element } = me.grid, { count } = store;
    if (count && !me.hidden) {
      const cellElement = element.querySelector(`.b-grid-cell[data-column-id="${me.id}"]`);
      if (cellElement) {
        const cellPadding = cellElement.isConnected ? parseInt(DomHelper.getStyleValue(cellElement, "padding-left")) : me._cachedCellPadding || 0, maxWidth = DomHelper.measureText(count, cellElement);
        me.width = Math.max(me.minWidth, maxWidth + 2 * cellPadding);
        me._cachedCellPadding = cellPadding;
        return true;
      }
    }
    return false;
  }
  set flex(f) {
  }
  internalHeaderRenderer({ headerElement, column }) {
    var _a;
    headerElement.classList.add("b-rownumber-header");
    return ((_a = column.externalHeaderRenderer) == null ? void 0 : _a.call(this, ...arguments)) || column.headerText;
  }
};
__publicField(RowNumberColumn, "$name", "RowNumberColumn");
__publicField(RowNumberColumn, "type", "rownumber");
ColumnStore.registerColumnType(RowNumberColumn, true);
RowNumberColumn._$name = "RowNumberColumn";

// ../Grid/lib/Grid/feature/base/CopyPasteBase.js
var CopyPasteBase = class extends InstancePlugin.mixin(Clipboardable_default) {
  // Internal backwards compatibility
  get clipboardRecords() {
    return this.clipboardData || [];
  }
  /**
   * Used by CellCopyPaste and RowCopyPaste to generate string representations of grid records
   * @param cells
   * @returns {String}
   * @private
   */
  cellsToString(cells) {
    var _a;
    const me = this;
    let lastRowIndex = 0, lastColIndex = 0, stringData = "";
    cells.sort((c1, c2) => c1.rowIndex === c2.rowIndex ? c1.columnIndex - c2.columnIndex : c1.rowIndex - c2.rowIndex);
    for (const cell of cells) {
      const { record, _column: column, rowIndex, columnIndex } = cell;
      if (rowIndex > lastRowIndex) {
        if (stringData.length > 0) {
          stringData += "\n".repeat(rowIndex - lastRowIndex);
        }
        lastRowIndex = rowIndex;
        lastColIndex = columnIndex;
      } else if (columnIndex > lastColIndex) {
        if (stringData.length > 0) {
          stringData += "	".repeat(columnIndex - lastColIndex);
        }
        lastColIndex = columnIndex;
      }
      let cellValue = (_a = column == null ? void 0 : column.toClipboardString) == null ? void 0 : _a.call(column, cell);
      if (cellValue === void 0) {
        cellValue = record.getValue(column.field);
        if (cellValue instanceof Date) {
          cellValue = DateHelper.format(cellValue, me.dateFormat);
        } else {
          cellValue = cellValue == null ? void 0 : cellValue.toString();
        }
      }
      if (me.toCopyString) {
        cellValue = me.toCopyString({ currentValue: cellValue, column, record });
      }
      cellValue = cellValue == null ? void 0 : cellValue.replace(/[\n\t]/, " ");
      stringData += cellValue || me.emptyValueChar;
    }
    return stringData;
  }
  /**
   * Sets tab and new-line separated string data into records.
   * Used by CellCopyPaste to set values into existing records.
   * Used by RowCopyPaste to create new records from values
   * @param clipboardData
   * @param createNewRecords If `false`, a selected cell is required and data will be set to existing records
   * @param store The store which to set/create new data to. Defaults to the clients default store.
   * @param fields Provide an array of string fields to create records instead of using columns
   * @returns {Object} modificationData
   * @private
   */
  setFromStringData(clipboardData, createNewRecords = false, store = this.client.store, fields) {
    var _a;
    const me = this, { client } = me, {
      columns,
      _shiftSelectRange
    } = client, modifiedRecords = /* @__PURE__ */ new Set(), rows = me.stringAs2dArray(clipboardData), selectedCell = client.selectedCells[0], targetCells = [], affectedCells = [];
    if (!createNewRecords && (_shiftSelectRange == null ? void 0 : _shiftSelectRange.some((cell) => cell.equals(selectedCell)))) {
      const cellRows = me.cellSelectorsAs2dArray(_shiftSelectRange);
      if ((cellRows == null ? void 0 : cellRows.length) % rows.length === 0 && cellRows.columnCount % rows.columnCount === 0) {
        for (let curI = 0; curI < cellRows.length; curI += rows.length) {
          for (let curX = 0; curX < cellRows.columnCount; curX += rows.columnCount) {
            targetCells.push(cellRows[curI][curX]);
          }
        }
      }
    }
    if (!targetCells.length) {
      targetCells.push(selectedCell);
    }
    for (const targetCell of targetCells) {
      for (let rI = 0; rI < rows.length; rI++) {
        const row = rows[rI], targetRecord = createNewRecords ? new store.modelClass() : store.getAt(targetCell.rowIndex + rI);
        if (targetRecord && !targetRecord.readOnly) {
          for (let cI = 0; cI < row.length; cI++) {
            const targetColumn = fields ? null : columns.visibleColumns[createNewRecords ? cI : targetCell.columnIndex + cI], targetField = (targetColumn == null ? void 0 : targetColumn.field) || (fields == null ? void 0 : fields[cI]);
            let value = row[cI];
            if (targetField && value && !(targetColumn == null ? void 0 : targetColumn.readOnly)) {
              if (value === me.emptyValueChar) {
                value = null;
              }
              if (targetColumn == null ? void 0 : targetColumn.fromClipboardString) {
                value = targetColumn.fromClipboardString({
                  string: value,
                  record: targetRecord
                });
              }
              if (me.toPasteValue) {
                value = me.toPasteValue({
                  currentValue: value,
                  record: targetRecord,
                  column: targetColumn,
                  field: targetField
                });
              }
              if (typeof value === "string" && ((_a = targetRecord.getFieldDefinition(targetField)) == null ? void 0 : _a.isDateDataField)) {
                const parsedDate = DateHelper.parse(value, me.dateFormat);
                if (!isNaN(parsedDate.getTime())) {
                  value = parsedDate;
                }
              }
              targetRecord.set(targetField, value, false, false, false, true);
              affectedCells.push(client.normalizeCellContext({ column: targetColumn, record: targetRecord }));
            }
          }
          modifiedRecords.add(targetRecord);
        }
      }
    }
    return {
      modifiedRecords: [...modifiedRecords],
      targetCells: affectedCells
    };
  }
  /**
   * Converts an array of Location objects to a two-dimensional array where first level is rows and second level is
   * columns. If the array is inconsistent in the number of columns present for each row, the function will return
   * false.
   * @param {Grid.util.Location[]} locations
   * @private
   */
  cellSelectorsAs2dArray(locations) {
    const rows = [];
    let rId = null, columns;
    for (const location of locations) {
      if (location.id !== rId) {
        rId = location.id;
        columns = [];
        rows.push(columns);
      }
      columns.push(location);
    }
    rows.columnCount = rows[0].length;
    if (rows.some((row) => row.length !== rows.columnCount)) {
      return false;
    }
    return rows;
  }
  /**
   * Converts a new-line- and tab-separated string to a two-dimensional array where first level is rows and second
   * level is columns. If the string is inconsistent in the number of columns present for each row, the function will
   * return false.
   * @param {String} string String values separated with new-line(\n,\r or similar) and tabs (\t)
   * @private
   */
  stringAs2dArray(string) {
    const rows = [], stringRows = string.split(/\r\n|(?!\r\n)[\n-\r\x85\u2028\u2029]/).filter((s) => s.length);
    for (const row of stringRows) {
      const columns = row.split("	");
      if (rows.columnCount && columns.length !== rows.columnCount) {
        return false;
      }
      rows.columnCount = columns.length;
      rows.push(columns);
    }
    return rows;
  }
};
__publicField(CopyPasteBase, "configurable", {
  /**
   * If `true` this prevents cutting and pasting. Will default to `true` if {@link Grid/feature/CellEdit} feature
   * is disabled. Set to `false` to prevent this behaviour.
   * @config {Boolean}
   */
  copyOnly: null,
  /**
   * Default keyMap configuration: Ctrl/Cmd+c to copy, Ctrl/Cmd+x to cut and Ctrl/Cmd+v to paste. These keyboard
   * shortcuts require a selection to be made.
   * @config {Object<String,String>}
   */
  keyMap: {
    "Ctrl+C": "copy",
    "Ctrl+X": "cut",
    "Ctrl+V": "paste"
  },
  /**
   * Set this to `false` to not use native Clipboard API even if it is available
   * @config {Boolean}
   * @default
   */
  useNativeClipboard: false,
  /**
   * Provide a function to be able to customize the string value which is copied
   *
   * ````javascript
   * new Grid({
   *     features : {
   *         cellCopyPaste : {
   *             toCopyString({currentValue, column, record}) {
   *                 if(record.isAvatar){
   *                     return record.fullName;
   *                 }
   *                 return currentValue;
   *             }
   *         }
   *     }
   * });
   * ````
   *
   * Note that this function is only called when copying cell values or copying values from other Bryntum
   * component instances or from native clipboard.
   *
   * @config {Function}
   * @param {Object} data
   * @param {String} data.currentValue
   * @param {Grid.column.Column} data.column
   * @param {Core.data.Model} data.record
   * @returns {String}
   */
  toCopyString: null,
  /**
   * Provide a function to be able to customize the value which will be set onto the record
   *
   * ````javascript
   * new Grid({
   *     features : {
   *         cellCopyPaste : {
   *             toPasteValue({currentValue, column, record, field}) {
   *                 if(typeof currentValue === 'string'){
   *                     return currentValue.replace('$', '');
   *                 }
   *                 return currentValue;
   *             }
   *         }
   *     }
   * });
   * ````
   *
   * Note that this function is only called when pasting string values, either from CellCopyPaste or copying
   * values from other Bryntum component instances or from native clipboard.
   *
   * @config {Function}
   * @param {Object} data
   * @param {String} data.currentValue
   * @param {Grid.column.Column} data.column
   * @param {Core.data.Model} data.record
   * @returns {String}
   */
  toPasteValue: null,
  /**
   * If an empty value (null or empty string) is copied or cut, this config will replace that value.
   * This allows for clipboard data to skip columns.
   *
   * For example, look at these two selections
   * |  ROW  |   0  |      1       |       2      |   3  |
   * |-------|------|--------------|--------------|------|
   * | ROW 1 | SEL1 | not selected | not selected | SEL2 |
   * | ROW 2 | SEL3 | SEL4 (empty) | SEL5 (empty) | SEL6 |
   *
   * The clipboardData for `ROW 1` will look like this:
   `* SEL1\t\t\SEl2\nSEL3\t\t\SEL4`
   *
   * And `ROW 2` will look like this:
   * `SEL3\t\u{0020}\t\u{0020}\tSEL6`
   *
   * `ROW 1` will set value `SEL1` at column index 0 and `SEL2` at column index 3. This leaves column index 1 and
   * 2 untouched.
   *
   * `ROW 2` will set value `SEL3` at column index 0, `u{0020}` at column index 1 and 2, and `SEL`6 at column
   * index 3.
   *
   * The default `u{0020}` is a blank space.
   *
   * Note that this only applies when copy-pasting cell values or copying rows from other Bryntum component
   * instances or from native clipboard.
   *
   * @config {String}
   * @default
   */
  emptyValueChar: " ",
  /**
   * The format a copied date value should have when converted to a string. To learn more about available formats,
   * check out {@link Core.helper.DateHelper} docs.
   * @config {String}
   */
  dateFormat: "lll"
});
CopyPasteBase._$name = "CopyPasteBase";

// ../Grid/lib/Grid/feature/GridFeatureManager.js
var consumerToFeatureMap = /* @__PURE__ */ new Map();
var consumerToDefaultFeatureMap = /* @__PURE__ */ new Map();
var DEFAULT_FOR_TYPE = "Grid";
var remapToBase = {
  Grid: "GridBase",
  Scheduler: "SchedulerBase",
  SchedulerPro: "SchedulerProBase",
  Gantt: "GanttBase"
};
var classNameFix = /\$\d+$/;
var GridFeatureManager = class {
  /**
   * Register a feature class with the Grid. Enables it to be created and configured using config Grid#features.
   * @param {Function} featureClass The feature class constructor to register
   * @param {Boolean} [onByDefault] Specify true to have the feature enabled per default
   * @param {String|String[]} [forType] Specify a type to let the class applying the feature to determine if it should
   * use it
   */
  static registerFeature(featureClass, onByDefault = false, forType = null, as = null) {
    as = StringHelper.uncapitalize(as || Object.prototype.hasOwnProperty.call(featureClass, "$name") && featureClass.$$name || featureClass.name);
    as = as.replace(classNameFix, "");
    if (!Array.isArray(forType)) {
      forType = [forType || DEFAULT_FOR_TYPE];
    }
    forType.forEach((forType2) => {
      const type = remapToBase[forType2] || forType2, consumerFeaturesMap = consumerToFeatureMap.get(type) || /* @__PURE__ */ new Map(), consumerDefaultFeaturesMap = consumerToDefaultFeatureMap.get(type) || /* @__PURE__ */ new Map();
      consumerFeaturesMap.set(as, featureClass);
      consumerDefaultFeaturesMap.set(featureClass, onByDefault);
      consumerToFeatureMap.set(type, consumerFeaturesMap);
      consumerToDefaultFeatureMap.set(type, consumerDefaultFeaturesMap);
    });
  }
  /**
   * Get all the features registered for the given type name in an object where keys are feature names and values are
   * feature constructors.
   *
   * @param {String} [forType]
   * @returns {Object}
   */
  static getTypeNameFeatures(forType = DEFAULT_FOR_TYPE) {
    const type = remapToBase[forType] || forType, consumerFeaturesMap = consumerToFeatureMap.get(type), features = {};
    if (consumerFeaturesMap) {
      consumerFeaturesMap.forEach((featureClass, as) => features[as] = featureClass);
    }
    return features;
  }
  /**
   * Get all the default features registered for the given type name in an object where keys are feature names and
   * values are feature constructors.
   *
   * @param {String} [forType]
   * @returns {Object}
   */
  static getTypeNameDefaultFeatures(forType = DEFAULT_FOR_TYPE) {
    const type = remapToBase[forType] || forType, consumerFeaturesMap = consumerToFeatureMap.get(type), consumerDefaultFeaturesMap = consumerToDefaultFeatureMap.get(type);
    const features = {};
    if (consumerFeaturesMap && consumerDefaultFeaturesMap) {
      consumerFeaturesMap.forEach((featureClass, as) => {
        if (consumerDefaultFeaturesMap.get(featureClass)) {
          features[as] = featureClass;
        }
      });
    }
    return features;
  }
  /**
   * Gets all the features registered for the given instance type name chain. First builds the type name chain then
   * queries for features for each type name and combines them into one object, see
   * {@link #function-getTypeNameFeatures-static}() for returned object description.
   *
   * If feature is registered for both parent and child type name then feature for child overrides feature for parent.
   *
   * @param {Object} instance
   * @returns {Object}
   */
  static getInstanceFeatures(instance) {
    return instance.$meta.names.reduce(
      (features, typeName) => Object.assign(features, this.getTypeNameFeatures(typeName)),
      {}
    );
  }
  /**
   * Gets all the *default* features registered for the given instance type name chain. First builds the type name
   * chain then queries for features for each type name and combines them into one object, see
   * {@link #function-getTypeNameFeatures-static}() for returned object description.
   *
   * If feature is registered for both parent and child type name then feature for child overrides feature for parent.
   *
   * @param {Object} instance
   * @returns {Object}
   */
  static getInstanceDefaultFeatures(instance) {
    return instance.$meta.names.reduce(
      (features, typeName) => Object.entries(
        this.getTypeNameFeatures(typeName)
      ).reduce(
        (features2, [as, featureClass]) => {
          if (this.isDefaultFeatureForTypeName(featureClass, typeName)) {
            features2[as] = featureClass;
          } else {
            delete features2[as];
          }
          return features2;
        },
        features
      ),
      {}
    );
  }
  /**
   * Checks if the given feature class is default for the type name
   *
   * @param {Core.mixin.InstancePlugin} featureClass Feature to check
   * @param {String} [forType]
   * @returns {Boolean}
   */
  static isDefaultFeatureForTypeName(featureClass, forType = DEFAULT_FOR_TYPE) {
    const type = remapToBase[forType] || forType, consumerDefaultFeaturesMap = consumerToDefaultFeatureMap.get(type);
    return consumerDefaultFeaturesMap && consumerDefaultFeaturesMap.get(featureClass) || false;
  }
  /**
   * Checks if the given feature class is default for the given instance type name chain. If the feature is not
   * default for the parent type name but it is for the child type name, then the child setting overrides the parent
   * one.
   *
   * @param {Core.mixin.InstancePlugin} featureClass Feature to check
   * @param {String} [forType]
   * @returns {Boolean}
   */
  static isDefaultFeatureForInstance(featureClass, instance) {
    const typeChain = instance.$meta.names.slice().reverse();
    let result = null;
    for (let i = 0, len = typeChain.length; i < len && result === null; ++i) {
      const consumerDefaultFeaturesMap = consumerToDefaultFeatureMap.get(typeChain[i]);
      if (consumerDefaultFeaturesMap && consumerDefaultFeaturesMap.has(featureClass)) {
        result = consumerDefaultFeaturesMap.get(featureClass);
      }
    }
    return result || false;
  }
  /**
   * Resets feature registration date, used in tests to reset state after test
   *
   * @internal
   */
  static reset() {
    consumerToFeatureMap.clear();
    consumerToDefaultFeatureMap.clear();
  }
};

// ../Grid/lib/Grid/feature/CellEdit.js
var editingActions = {
  finishAndEditNextRow: 1,
  finishAndEditPrevRow: 1,
  finishEditing: 1,
  cancelEditing: 1,
  finishAndEditNextCell: 1,
  finishAndEditPrevCell: 1
};
var allActions = {
  ...editingActions,
  startEditingFromKeyMap: 1,
  finishAllSelected: 1
};
var CellEdit = class extends Delayable_default(InstancePlugin) {
  // Default configuration
  static get defaultConfig() {
    return {
      /**
       * Set to true to select the field text when editing starts
       * @config {Boolean}
       * @default
       */
      autoSelect: true,
      /**
       * What action should be taken when focus moves leaves the cell editor, for example when clicking outside.
       * May be `'complete'` or `'cancel`'.
       * @config {'complete'|'cancel'}
       * @default
       */
      blurAction: "complete",
      /**
       * Set to `false` to stop editing when clicking another cell after a cell edit.
       * @config {Boolean}
       * @default
       */
      continueEditingOnCellClick: true,
      /**
       * Set to true to have TAB key on the last cell (and ENTER anywhere in the last row) in the data set create
       * a new record and begin editing it at its first editable cell.
       *
       * If a customized {@link #config-keyMap} is used, this setting will affect the customized keys instead of
       * ENTER and TAB.
       *
       * If this is configured as an object, it is used as the default data value set for each new record.
       * @config {Boolean|Object}
       */
      addNewAtEnd: null,
      /**
       * Set to `true` to add record to the parent of the last record, when configured with {@link #config-addNewAtEnd}.
       * Only applicable when using a tree view and store.
       *
       * By default, it adds records to the root.
       * @config {Boolean}
       * @default false
       */
      addToCurrentParent: false,
      /**
       * Set to `true` to start editing when user starts typing text on a focused cell (as in Excel)
       * @config {Boolean}
       * @default false
       */
      autoEdit: null,
      /**
       * Set to `false` to not start editing next record when user presses enter inside a cell editor (or previous
       * record if SHIFT key is pressed). This is set to `false` when {@link #config-autoEdit} is `true`. Please
       * note that these key combinations could be different if a customized {@link #config-keyMap} is used.
       * @config {Boolean}
       * @default
       */
      editNextOnEnterPress: true,
      /**
       * Class to use as an editor. Default value: {@link Core.widget.Editor}
       * @config {Core.widget.Widget}
       * @typings {typeof Widget}
       * @internal
       */
      editorClass: Editor,
      /**
       * The name of the grid event that will trigger cell editing. Defaults to
       * {@link Grid.view.mixin.GridElementEvents#event-cellDblClick celldblclick} but can be changed to any other event,
       * such as {@link Grid.view.mixin.GridElementEvents#event-cellClick cellclick}.
       *
       * ```javascript
       * features : {
       *     cellEdit : {
       *         triggerEvent : 'cellclick'
       *     }
       * }
       * ```
       *
       * @config {String}
       * @default
       */
      triggerEvent: "celldblclick",
      // To edit a cell using a touch gesture, at least 300ms should have passed since last cell tap
      touchEditDelay: 300,
      focusCellAnimationDuration: false,
      /**
       * If set to `true` (which is default) this will make it possible to edit current column in multiple rows
       * simultaneously.
       *
       * This is achieved by:
       * 1. Select multiple rows or row's cells
       * 2. Start editing simultaneously as selecting the last row or cell
       * 3. When finished editing, press Ctrl+Enter to apply the new value to all selected rows.
       *
       * If a customized {@link #config-keyMap} is used, the Ctrl+Enter combination could map to something else.
       *
       * @config {Boolean}
       * @default
       */
      multiEdit: true,
      /**
       * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>}
       */
      keyMap: {
        Enter: ["startEditingFromKeyMap", "finishAndEditNextRow"],
        "Ctrl+Enter": ["finishAllSelected", "finishEditing"],
        "Shift+Enter": "finishAndEditPrevRow",
        "Alt+Enter": "finishEditing",
        F2: ["startEditingFromKeyMap", "finishEditing"],
        Escape: "cancelEditing",
        Tab: { handler: "finishAndEditNextCell", weight: 100 },
        "Shift+Tab": { handler: "finishAndEditPrevCell", weight: 100 }
      },
      /**
       * A CSS selector for elements that when clicked, should not trigger editing. Useful if you render actionable
       * icons or buttons into a grid cell.
       * @config {String}
       * @default
       */
      ignoreCSSSelector: "button,.b-icon,.b-fa,svg",
      /**
       * A callback which returns a `blurAction` value depending on the tap out event and the editing context.
       *
       * If specified, it is passed the mousedown event and the editing context object.
       * @internal
       */
      validateTapOut: null
    };
  }
  // Plugin configuration. This plugin chains some functions in Grid.
  static get pluginConfig() {
    return {
      assign: ["startEditing", "finishEditing", "cancelEditing"],
      before: ["onElementKeyDown", "onElementPointerUp"],
      chain: ["onElementClick", "bindStore"]
    };
  }
  //endregion
  //region Init
  construct(grid, config) {
    super.construct(grid, config);
    const me = this, gridListeners = {
      renderRows: "onGridRefreshed",
      cellClick: "onCellClick",
      thisObj: me
    };
    me.grid = grid;
    if (me.triggerEvent !== "cellclick") {
      gridListeners[me.triggerEvent] = "onTriggerEditEvent";
    }
    if (me.autoEdit && !("editNextOnEnterPress" in config)) {
      me.editNextOnEnterPress = false;
    }
    grid.ion(gridListeners);
    grid.rowManager.ion({
      changeTotalHeight: "onGridRefreshed",
      thisObj: me
    });
    me.bindStore(grid.store);
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      update: "onStoreUpdate",
      beforeSort: "onStoreBeforeSort",
      thisObj: this
    });
  }
  /**
   * Displays an OK / Cancel confirmation dialog box owned by the current Editor. This is intended to be
   * used by {@link Grid.column.Column#config-finalizeCellEdit} implementations. The returned promise resolves passing
   * `true` if the "OK" button is pressed, and `false` if the "Cancel" button is pressed. Typing `ESC` rejects.
   *
   * @param {Object} options An options object for what to show.
   * @param {String} [options.title] The title to show in the dialog header.
   * @param {String} [options.message] The message to show in the dialog body.
   * @param {String|Object} [options.cancelButton] A text or a config object to apply to the Cancel button.
   * @param {String|Object} [options.okButton] A text or config object to apply to the OK button.
   * @returns {Boolean}
   */
  async confirm(options) {
    let result = true;
    if (this.editorContext) {
      MessageDialog_default.owner = this.editorContext.editor.inputField;
      options.rootElement = this.grid.rootElement;
      result = await MessageDialog_default.confirm(options);
      MessageDialog_default.owner = null;
    }
    return result === MessageDialog_default.yesButton;
  }
  doDestroy() {
    this.grid.columns.allRecords.forEach((column) => {
      var _a;
      (_a = column._cellEditor) == null ? void 0 : _a.destroy();
    });
    super.doDestroy();
  }
  doDisable(disable) {
    if (disable && !this.isConfiguring) {
      this.cancelEditing(true);
    }
    super.doDisable(disable);
  }
  set disabled(disabled) {
    super.disabled = disabled;
  }
  get disabled() {
    const { grid } = this;
    return Boolean(super.disabled || grid.disabled || grid.readOnly);
  }
  //endregion
  //region Editing
  /**
   * Is any cell currently being edited?
   * @readonly
   * @property {Boolean}
   */
  get isEditing() {
    return Boolean(this.editorContext);
  }
  /**
   * Returns the record currently being edited, or `null`
   * @readonly
   * @property {Core.data.Model}
   */
  get activeRecord() {
    var _a;
    return ((_a = this.editorContext) == null ? void 0 : _a.record) || null;
  }
  /**
   * Internal function to create or get existing editor for specified cell.
   * @private
   * @param cellContext Cell to get or create editor for
   * @returns {Core.widget.Editor} An Editor container which displays the input field.
   * @category Internal
   */
  getEditorForCell({ id, cell, column, columnId, editor }) {
    const me = this, {
      grid,
      editorClass
    } = me;
    let cellEditor = column.cellEditor, leftOffset = 0;
    if (column.editTargetSelector) {
      const editorTarget = cell.querySelector(column.editTargetSelector);
      leftOffset = editorTarget.offsetLeft;
    }
    editor.autoSelect = me.autoSelect;
    if (!(cellEditor == null ? void 0 : cellEditor.isEditor)) {
      cellEditor = column.data.cellEditor = editorClass.create(editorClass.mergeConfigs({
        type: editorClass.type,
        constrainTo: null,
        cls: "b-cell-editor",
        inputField: editor,
        blurAction: "none",
        invalidAction: column.invalidAction,
        completeKey: false,
        cancelKey: false,
        owner: grid,
        align: {
          align: "t0-t0",
          offset: [leftOffset, 0]
        },
        internalListeners: me.getEditorListeners(),
        // Listen for cell edit control keys from the Editor
        onInternalKeyDown: me.onEditorKeydown.bind(me),
        // React editor wrapper code uses this flag to enable mouse events pass through to editor
        allowMouseEvents: editor.allowMouseEvents
      }, cellEditor));
    }
    cellEditor.minHeight = grid.rowHeight;
    if (cellEditor.inputField !== editor) {
      cellEditor.remove(cellEditor.items[0]);
      cellEditor.add(editor);
    }
    cellEditor.align.offset[0] = leftOffset;
    if (column.instantUpdate && !editor.cellEditValueSetter) {
      ObjectHelper.wrapProperty(editor, "value", null, (value) => {
        const { editorContext } = me, inputField = editorContext == null ? void 0 : editorContext.editor.inputField;
        if ((editorContext == null ? void 0 : editorContext.editor.isValid) && !ObjectHelper.isEqual(editorContext.record.getValue(editorContext.column.field), value) && // If editor is a dateField, only allow picker input as not to trigger change on each keystroke.
        (!(inputField == null ? void 0 : inputField.isDateField) || inputField._isPickerInput)) {
          editorContext.record.setValue(editorContext.column.field, value);
        }
      });
      editor.cellEditValueSetter = true;
    }
    Object.assign(cellEditor.element.dataset, {
      rowId: id,
      columnId,
      field: column.field
    });
    cellEditor.inputField.revertOnEscape = column.revertOnEscape;
    return me.editor = cellEditor;
  }
  // Turned into function to allow overriding in Gantt, and make more configurable in general
  getEditorListeners() {
    return {
      focusOut: "onEditorFocusOut",
      focusIn: "onEditorFocusIn",
      start: "onEditorStart",
      beforeComplete: "onEditorBeforeComplete",
      complete: "onEditorComplete",
      beforeCancel: "onEditorBeforeCancel",
      cancel: "onEditorCancel",
      beforeHide: "onBeforeEditorHide",
      finishEdit: "onEditorFinishEdit",
      thisObj: this
    };
  }
  onEditorStart({ source: editor }) {
    var _a;
    const me = this, editorContext = me.editorContext = editor.cellEditorContext;
    if (editorContext) {
      const { grid } = me;
      if (me.triggerEvent !== "cellclick") {
        me.detachListeners("cellClickWhileEditing");
        grid.ion({
          name: "cellClickWhileEditing",
          cellclick: "onCellClickWhileEditing",
          thisObj: me
        });
      }
      (_a = me.removeEditingListeners) == null ? void 0 : _a.call(me);
      me.removeEditingListeners = GlobalEvents_default.addListener({
        globaltap: "onTapOut",
        thisObj: me
      });
      grid.trigger("startCellEdit", { grid, editorContext });
    }
  }
  onEditorBeforeComplete(context) {
    const { grid } = this, editor = context.source, editorContext = editor.cellEditorContext;
    context.grid = grid;
    context.editorContext = editorContext;
    return grid.trigger("beforeFinishCellEdit", context);
  }
  onEditorComplete({ source: editor }) {
    var _a;
    const { grid } = this, editorContext = editor.cellEditorContext;
    editorContext.value = editor.inputField.value;
    if (editor.dataField.includes(".")) {
      const relationName = editor.dataField.split(".")[0];
      if ((_a = editor.record.constructor.relations) == null ? void 0 : _a[relationName]) {
        grid.rowManager.refresh();
      }
    }
    grid.trigger("finishCellEdit", { grid, editorContext });
  }
  onEditorBeforeCancel() {
    const { editorContext } = this;
    return this.grid.trigger("beforeCancelCellEdit", { editorContext });
  }
  onEditorCancel({ event }) {
    const { editorContext, muteEvents, grid } = this;
    if (!muteEvents) {
      grid.trigger("cancelCellEdit", { grid, editorContext, event });
    }
  }
  onBeforeEditorHide({ source }) {
    const me = this, {
      row,
      cell
    } = source.cellEditorContext;
    cell == null ? void 0 : cell.classList.remove("b-editing");
    row == null ? void 0 : row.removeCls("b-editing");
    me.detachListeners("cellClickWhileEditing");
    me.removeEditingListeners();
  }
  onEditorFinishEdit({ source }) {
    source.cellEditorContext = this.editorContext = null;
  }
  /**
   * Find the next succeeding or preceding cell which is editable (column.editor != false)
   * @param {Grid.util.Location} cellInfo
   * @param {Boolean} isForward
   * @returns {Object}
   * @private
   * @category Internal
   */
  getAdjacentEditableCell(cellInfo, isForward) {
    const { grid } = this, { store, columns } = grid, { visibleColumns } = columns;
    let rowId = cellInfo.id, column = columns.getAdjacentVisibleLeafColumn(cellInfo.columnId, isForward);
    while (rowId) {
      if (column) {
        if (column.editor && column.canEdit(cellInfo.record)) {
          return { id: rowId, columnId: column.id };
        }
        column = columns.getAdjacentVisibleLeafColumn(column, isForward);
      } else {
        const record = store.getAdjacent(cellInfo.id, isForward, false, true);
        rowId = record == null ? void 0 : record.id;
        if (record) {
          column = isForward ? visibleColumns[0] : visibleColumns[visibleColumns.length - 1];
        }
      }
    }
    return null;
  }
  /**
   * Adds a new, empty record at the end of the TaskStore with the initial
   * data specified by the {@link Grid.feature.CellEdit#config-addNewAtEnd} setting.
   *
   * @private
   * @returns {Core.data.Model} Newly added record
   */
  doAddNewAtEnd() {
    const newRecordConfig = typeof this.addNewAtEnd === "object" ? ObjectHelper.clone(this.addNewAtEnd) : {}, { grid: { store, rowManager }, addToCurrentParent } = this;
    let record;
    if (store.tree && addToCurrentParent) {
      record = store.last.parent.appendChild(newRecordConfig);
    } else {
      record = store.add(newRecordConfig)[0];
    }
    if (!rowManager.getRowFor(record)) {
      rowManager.displayRecordAtBottom();
    }
    return record;
  }
  /**
   * Creates an editing context object for the passed cell context (target cell must be in the DOM).
   *
   * If the referenced cell is editable, a {@link Grid.util.Location} will
   * be returned containing the following extra properties:
   *
   *     - editor
   *     - value
   *
   * If the referenced cell is _not_ editable, `false` will be returned.
   * @param {Object} cellContext an object which encapsulates a cell.
   * @param {String} cellContext.id The record id of the row to edit
   * @param {String} cellContext.columnId The column id of the column to edit
   * @returns {Grid.util.Location}
   * @private
   */
  getEditingContext(cellContext) {
    cellContext = this.grid.normalizeCellContext(cellContext);
    const { column, record } = cellContext;
    if ((column == null ? void 0 : column.isVisible) && column.editor && !column.readOnly && record && !record.isSpecialRow && !record.readOnly && column.canEdit(record)) {
      const value = record ? column.getRawValue(record) : record;
      Object.assign(cellContext, {
        value: value === void 0 ? null : value,
        editor: column.editor
      });
      return cellContext;
    } else {
      return false;
    }
  }
  startEditingFromKeyMap() {
    return this.startEditing(this.grid.focusedCell);
  }
  /**
   * Start editing specified cell. If no cellContext is given it starts with the first cell in the first row.
   * This function is exposed on Grid and can thus be called as `grid.startEditing(...)`
   * @param {Object} cellContext Cell specified in format { id: 'x', columnId/column/field: 'xxx' }. See
   * {@link Grid.view.Grid#function-getCell} for details.
   * @fires startCellEdit
   * @returns {Promise} Resolved promise returns`true` if editing has been started, `false` if an {@link Core.widget.Editor#event-beforeStart} listener
   * has vetoed the edit.
   * @category Editing
   * @on-owner
   */
  async startEditing(cellContext = {}) {
    var _a, _b, _c;
    const me = this;
    if (!me.disabled) {
      const { grid } = me;
      if (cellContext == null ? void 0 : cellContext.fromKeyMap) {
        cellContext = me.grid.focusedCell;
      }
      if (ObjectHelper.isEmpty(cellContext)) {
        cellContext.id = grid.firstVisibleRow.id;
      }
      if (grid.store.isTree && grid.features.tree) {
        const record2 = cellContext.id ? grid.store.getById(cellContext.id) : (_a = cellContext.record) != null ? _a : grid.store.getAt(cellContext.row);
        if (record2) {
          await grid.expandTo(record2);
        } else {
          return false;
        }
      }
      const editorContext = me.getEditingContext(cellContext);
      if (!editorContext) {
        return false;
      }
      if (me.editorContext) {
        if (me.cancelEditing() === false) {
          return false;
        }
        ;
      }
      if (!((_b = grid.focusedCell) == null ? void 0 : _b.equals(editorContext))) {
        grid.focusCell(editorContext);
      }
      if (grid.trigger("beforeCellEditStart", { grid, editorContext }) === false) {
        return false;
      }
      const editor = editorContext.editor = me.getEditorForCell(editorContext), {
        row,
        cell,
        record
      } = editorContext;
      editor.inputField.highlightExternalChange = false;
      editor.cellEditorContext = editorContext;
      editor.render(cell);
      cell.classList.add("b-editing");
      row.addCls("b-editing");
      if (!await editor.startEdit({
        target: cell,
        field: editor.inputField.name || editorContext.column.field,
        value: editorContext.value,
        record
      })) {
        cell.classList.remove("b-editing");
        row.removeCls("b-editing");
      }
      (_c = me.onCellEditStart) == null ? void 0 : _c.call(me);
      return true;
    }
    return false;
  }
  /**
   * Cancel editing, destroys the editor
   * This function is exposed on Grid and can thus be called as `grid.cancelEditing(...)`
   * @param {Boolean} silent Pass true to prevent method from firing event
   * @fires cancelCellEdit
   * @category Editing
   * @on-owner
   */
  cancelEditing(silent = false, triggeredByEvent) {
    var _a;
    const me = this, { editor } = me;
    if (!me.isEditing) {
      return;
    }
    if (silent.fromKeyMap) {
      triggeredByEvent = silent;
      silent = false;
    }
    me.muteEvents = silent;
    const cancelResult = editor.cancelEdit(triggeredByEvent);
    me.muteEvents = false;
    if (cancelResult === false) {
      editor.inputField.focus();
    } else {
      me.finishEditingPromise = false;
      (_a = me.afterCellEdit) == null ? void 0 : _a.call(me);
    }
    return cancelResult;
  }
  /**
   * Finish editing, update the underlying record and destroy the editor
   * This function is exposed on Grid and can thus be called as `grid.finishEditing(...)`
   * @fires finishCellEdit
   * @category Editing
   * @returns {Promise} Resolved promise returns `false` if the edit could not be finished due to the value being invalid or the
   * Editor's `complete` event was vetoed.
   * @on-owner
   */
  async finishEditing() {
    var _a;
    const me = this, { editorContext, grid } = me;
    let result = false;
    if (me.finishEditingPromise) {
      return me.finishEditingPromise;
    }
    if (editorContext) {
      const { column } = editorContext;
      me.finishEditingPromise = editorContext.editor.completeEdit(column.bindCallback(column.finalizeCellEdit));
      result = await me.finishEditingPromise;
      await grid.waitForAnimations();
      me.finishEditingPromise = null;
      if (result) {
        (_a = me.afterCellEdit) == null ? void 0 : _a.call(me);
      }
    }
    return result;
  }
  //endregion
  //region Events
  /**
   * Event handler added when editing is active called when user clicks a cell in the grid during editing.
   * It finishes editing and moves editor to the selected cell instead.
   * @private
   * @category Internal event handling
   */
  async onCellClickWhileEditing({ event, cellSelector }) {
    const me = this;
    if (event.target.closest(".b-editor")) {
      return;
    }
    if (DomHelper.isTouchEvent || event.target.matches(me.ignoreCSSSelector)) {
      await me.finishEditing();
      return;
    }
    if (me.finishEditingPromise) {
      return;
    }
    if (me.editorContext && !me.editorContext.editor.owns(event.target)) {
      if (me.getEditingContext(cellSelector)) {
        if (await me.finishEditing()) {
          if (me.continueEditingOnCellClick) {
            await me.startEditing(cellSelector);
          }
        } else {
          me.grid.focusCell(me.editorContext);
          me.editor.inputField.focus();
        }
      } else {
        await me.finishEditing();
      }
    }
  }
  /**
   * Starts editing if user taps selected cell again on touch device. Chained function called when user clicks a cell.
   * @private
   * @category Internal event handling
   */
  async onCellClick({ cellSelector, target, event, column }) {
    if (column.onCellClick) {
      return;
    }
    const me = this, { focusedCell } = me.client;
    if (target.closest(".b-tree-expander")) {
      return false;
    } else if (DomHelper.isTouchEvent && me._lastCellClicked === (focusedCell == null ? void 0 : focusedCell.cell) && event.timeStamp - me.touchEditDelay > me._lastCellClickedTime) {
      await me.startEditing(cellSelector);
    } else if (this.triggerEvent === "cellclick") {
      await me.onTriggerEditEvent({ cellSelector, target });
    }
    me._lastCellClicked = focusedCell == null ? void 0 : focusedCell.cell;
    me._lastCellClickedTime = event.timeStamp;
  }
  // onElementPointerUp should be used to cancel editing before toggleCollapse handled
  // otherwise data collisions may be happened
  onElementPointerUp(event) {
    if (event.target.closest(".b-tree-expander")) {
      this.cancelEditing(void 0, event);
    }
  }
  /**
   * Called when the user triggers the edit action in {@link #config-triggerEvent} config. Starts editing.
   * @private
   * @category Internal event handling
   */
  async onTriggerEditEvent({ cellSelector, target, event }) {
    var _a;
    const { editorContext, client } = this;
    if (target.closest(".b-tree-expander") || DomHelper.isTouchEvent && event.type === "dblclick") {
      return;
    }
    if (event && ((_a = client.features.cellMenu) == null ? void 0 : _a.triggerEvent) === event.type) {
      return;
    }
    if (editorContext) {
      if (editorContext.equals(this.grid.normalizeCellContext(cellSelector)) || !await this.finishEditing()) {
        return;
      }
    }
    await this.startEditing(cellSelector);
  }
  /**
   * Update the input field if underlying data changes during edit.
   * @private
   * @category Internal event handling
   */
  onStoreUpdate({ changes, record }) {
    const { editorContext } = this;
    if (editorContext == null ? void 0 : editorContext.editor.isVisible) {
      if (record === editorContext.record && editorContext.editor.dataField in changes) {
        editorContext.editor.refreshEdit();
      }
    }
  }
  onStoreBeforeSort() {
    var _a;
    const editor = (_a = this.editorContext) == null ? void 0 : _a.editor;
    if (this.isEditing && !(editor == null ? void 0 : editor.isFinishing) && !editor.isValid) {
      return this.cancelEditing();
    }
  }
  /**
   * Realign editor if grid renders rows while editing is ongoing (as a result to autoCommit or WebSocket data received).
   * @private
   * @category Internal event handling
   */
  onGridRefreshed() {
    const me = this, {
      grid,
      editorContext
    } = me;
    if (editorContext && grid.isVisible && grid.focusedCell) {
      const cell = grid.getCell(grid.focusedCell), { editor } = editorContext;
      if (cell && DomHelper.isInView(cell) && !editor.isFinishing) {
        editorContext._cell = cell;
        GlobalEvents_default.suspendFocusEvents();
        editor.render(cell);
        editor.showBy(cell);
        editor.focus();
        GlobalEvents_default.resumeFocusEvents();
      } else {
        me.cancelEditing();
      }
    }
  }
  // Gets selected records or selected cells records
  get gridSelection() {
    return [...this.grid.selectedRows, ...this.grid.selectedCells];
  }
  // Tells keyMap what actions are available in certain conditions
  isActionAvailable({ actionName, event }) {
    const me = this;
    if (!allActions[actionName]) {
      return;
    }
    if (!me.disabled && !event.target.closest(".b-grid-header")) {
      if (me.isEditing) {
        if (actionName === "finishAllSelected") {
          return me.multiEdit && me.gridSelection.length > 1;
        } else if (editingActions[actionName]) {
          return true;
        }
      } else if (actionName === "startEditingFromKeyMap") {
        return me.grid.focusedCell.cell === event.target;
      }
    }
    return false;
  }
  // Will copy edited field value to all selected records
  async finishAllSelected() {
    const me = this, { dataField, record } = me.editor;
    if (await me.finishEditing() && !me.isDestroyed) {
      const value = record.getValue(dataField);
      for (const selected of me.gridSelection) {
        if (selected.isModel) {
          if (selected !== record) {
            selected.setValue(dataField, value);
          }
        } else {
          selected.record.set(selected.column.field, value);
        }
      }
    }
  }
  // Will finish editing and start editing next row (unless it's a touch device)
  // If addNewAtEnd, it will create a new row and edit that one if currently editing last row
  async finishAndEditNextRow(event, previous = false) {
    const me = this, { grid } = me, { record } = me.editorContext;
    let nextCell;
    if (await me.finishEditing()) {
      if (me.isDestroyed) {
        return;
      }
      if (!me.isEditing) {
        if (previous) {
          nextCell = grid.internalNextPrevRow(false, true, false);
        } else {
          if (me.addNewAtEnd && record === grid.store.last) {
            await me.doAddNewAtEnd();
          }
          if (!me.isDestroyed) {
            nextCell = grid.internalNextPrevRow(true, true);
          }
        }
        if (nextCell && me.editNextOnEnterPress && !grid.touch) {
          await me.startEditing(nextCell);
        }
      }
    }
  }
  // Will finish editing and start editing previous row
  finishAndEditPrevRow(event) {
    return this.finishAndEditNextRow(event, true);
  }
  // Will finish editing and start editing next cell
  // If addNewAtEnd, it will create a new row and edit that one if currently editing last row
  async finishAndEditNextCell(event, previous = false) {
    var _a, _b;
    const me = this, { grid } = me, { focusedCell } = grid;
    if (focusedCell && !me.finishEditingPromise) {
      const {
        rowIndex,
        columnIndex
      } = focusedCell;
      let cellInfo = me.getAdjacentEditableCell(focusedCell, !previous);
      if (!cellInfo && !previous && me.addNewAtEnd) {
        const currentEditableFinalizationResult = await me.finishEditing();
        if (currentEditableFinalizationResult === true) {
          await me.doAddNewAtEnd();
        }
      }
      let finalizationResult = true;
      if (me.isEditing) {
        finalizationResult = await me.finishEditing();
      }
      if (me.isDestroyed) {
        return;
      }
      cellInfo = me.getAdjacentEditableCell(new Location({
        grid,
        rowIndex,
        columnIndex
      }), !previous);
      if (cellInfo) {
        if (finalizationResult) {
          grid.focusCell(cellInfo, {
            animate: me.focusCellAnimationDuration
          });
          if (!await me.startEditing(cellInfo)) {
            await me.finishAndEditNextCell(event, previous);
          }
        } else {
        }
      } else if (grid.isNested && grid.owner && !((_b = (_a = grid.owner).catchFocus) == null ? void 0 : _b.call(_a, { source: grid, navigationDirection: previous ? "up" : "down", editing: true }))) {
        grid.onTab(event);
      }
    }
  }
  // Will finish editing and start editing next cell
  finishAndEditPrevCell(event) {
    return this.finishAndEditNextCell(event, true);
  }
  // Handles autoedit
  async onElementKeyDown(event) {
    const me = this, { grid } = me, { focusedCell } = grid;
    if (event.handled || !me.autoEdit || me.isEditing || !focusedCell || focusedCell.isActionable || event.ctrlKey) {
      return;
    }
    const { key } = event, isDelete = event.key === "Delete" || event.key === "Backspace", { gridSelection } = isDelete ? me : {}, isMultiDelete = me.multiEdit && (gridSelection == null ? void 0 : gridSelection.length) > 1;
    if ((key.length <= 1 || isDelete && !isMultiDelete) && await me.startEditing(focusedCell)) {
      const { inputField } = me.editor, { input } = inputField;
      if (input) {
        inputField.internalOnKeyEvent(event);
        if (!event.defaultPrevented) {
          input.value = isDelete ? "" : key;
          inputField.internalOnInput(event);
        }
      }
      event.preventDefault();
    } else if (isMultiDelete) {
      if (grid.trigger("beforeCellRangeDelete", { grid, gridSelection }) !== false) {
        for (const selected of gridSelection) {
          if (selected.isModel) {
            grid.columns.visibleColumns.forEach((col) => {
              !col.readOnly && selected.set(col.field, null);
            });
          } else if (!selected.column.readOnly) {
            selected.record.set(selected.column.field, null);
          }
        }
      }
    }
  }
  // Prevents keys which the Grid handles from bubbling to the grid while editing
  onEditorKeydown(event) {
    if (event.key.length !== 1 && this.grid.matchKeyMapEntry(event) && !this.grid.matchKeyMapEntry(event, this.keyMap)) {
      if (!event.key.startsWith("Arrow") && !event.key === "Backspace") {
        event.preventDefault();
      }
      event.handled = true;
      event.stopPropagation();
      return false;
    }
  }
  /**
   * Cancel editing on widget focusout
   * @private
   */
  async onEditorFocusOut(event) {
    const me = this, {
      grid,
      editor,
      editorContext
    } = me, toCell = new Location(event.relatedTarget), isEditableCellClick = toCell.grid === grid && me.getEditingContext(toCell);
    if (editorContext && !editor.isFinishing && editor.owns(event._target)) {
      if (me.blurAction === "cancel" || !grid.store.includes(editorContext.record)) {
        me.cancelEditing(void 0, event);
      } else if (!me.finishEditingPromise && (me.triggerEvent === "cellclick" || me.triggerEvent !== "cellclick" && !isEditableCellClick)) {
        await me.finishEditing();
      }
    }
  }
  onEditorFocusIn(event) {
    const widget = event.toWidget;
    if (widget === this.editor.inputField) {
      if (this.autoSelect && widget.selectAll && !widget.readOnly && !widget.disabled) {
        widget.selectAll();
      }
    }
  }
  /**
   * Cancel edit on touch outside of grid for mobile Safari (focusout not triggering unless you touch something focusable)
   * @private
   */
  async onTapOut({ event }) {
    const me = this, { target } = event;
    if (!target._shadowRoot && !me.editor.owns(target) && (!me.grid.bodyContainer.contains(target) || event.button)) {
      const validateTapOut = me.resolveCallback(me.validateTapOut, me, false), blurAction = (validateTapOut == null ? void 0 : validateTapOut.handler.call(validateTapOut.thisObj, event, me.editorContext)) || me.blurAction;
      me.editingStoppedByTapOutside = true;
      if (blurAction === "cancel") {
        me.cancelEditing(void 0, event);
      } else {
        await me.finishEditing();
      }
      delete me.editingStoppedByTapOutside;
    }
  }
  /**
   * Finish editing if clicking below rows (only applies when grid is higher than rows).
   * @private
   * @category Internal event handling
   */
  async onElementClick(event) {
    if (event.target.classList.contains("b-grid-body-container") && this.editorContext) {
      await this.finishEditing();
    }
  }
  //endregion
};
//region Config
__publicField(CellEdit, "$name", "CellEdit");
CellEdit._$name = "CellEdit";
GridFeatureManager.registerFeature(CellEdit, true);

// ../Grid/lib/Grid/feature/CellMenu.js
var CellMenu = class extends ContextMenuBase {
  //region Config
  static get $name() {
    return "CellMenu";
  }
  static get defaultConfig() {
    return {
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features : {
       *     cellMenu : {
       *         processItems({ items, record, column }) {
       *             // Add or hide existing items here as needed
       *             items.myAction = {
       *                 text   : 'Cool action',
       *                 icon   : 'b-fa b-fa-fw b-fa-ban',
       *                 onItem : () => console.log(`Clicked ${record.name}`),
       *                 weight : 1000 // Move to end
       *             };
       *
       *             if (!record.allowDelete) {
       *                 items.removeRow.hidden = true;
       *             }
       *         }
       *     }
       * },
       * ```
       *
       * @config {Function}
       * @param {Object} context An object with information about the menu being shown
       * @param {Core.data.Model} context.record The record representing the current row
       * @param {Grid.column.Column} context.column The current column
       * @param {Object<String,MenuItemConfig|Boolean>} context.items An object containing the
       *   {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
       * @preventable
       */
      processItems: null,
      /**
       * {@link Core.widget.Menu} items object containing named child menu items to apply to the feature's
       * provided context menu.
       *
       * This may add extra items as below, but you can also configure, or remove any of the default items by
       * configuring the name of the item as `null`:
       *
       * ```javascript
       * features : {
       *     cellMenu : {
       *         // This object is applied to the Feature's predefined default items
       *         items : {
       *             switchToDog : {
       *                 text : 'Dog',
       *                 icon : 'b-fa b-fa-fw b-fa-dog',
       *                 onItem({record}) {
       *                     record.dog = true;
       *                     record.cat = false;
       *                 },
       *                 weight : 500     // Make this second from end
       *             },
       *             switchToCat : {
       *                 text : 'Cat',
       *                 icon : 'b-fa b-fa-fw b-fa-cat',
       *                 onItem({record}) {
       *                     record.dog = false;
       *                     record.cat = true;
       *                 },
       *                 weight : 510     // Make this sink to end
       *             },
       *             removeRow : {
       *                 // Change icon for the delete item
       *                 icon : 'b-fa b-fa-times'
       *             },
       *             secretItem : null
       *         }
       *     }
       * },
       * ```
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>}
       */
      items: null,
      type: "cell"
      /**
       * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>} keyMap
       */
    };
  }
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateCellMenu");
    return config;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning grid before the context menu is shown for a cell.
   * Allows manipulation of the items to show in the same way as in the {@link #config-processItems}.
   *
   * Returning `false` from a listener prevents the menu from being shown.
   *
   * @event cellMenuBeforeShow
   * @preventable
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Column
   * @param {Core.data.Model} record Record
   */
  /**
   * This event fires on the owning grid after the context menu is shown for a cell.
   * @event cellMenuShow
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Column
   * @param {Core.data.Model} record Record
   */
  /**
   * This event fires on the owning grid when an item is selected in the cell context menu.
   * @event cellMenuItem
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {Grid.column.Column} column Column
   * @param {Core.data.Model} record Record
   */
  /**
   * This event fires on the owning grid when a check item is toggled in the cell context menu.
   * @event cellMenuToggleItem
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {Grid.column.Column} column Column
   * @param {Core.data.Model} record Record
   * @param {Boolean} checked Checked or not
   */
  //endregion
  //region Menu handlers
  showContextMenu(eventParams) {
    const me = this, {
      cellSelector,
      event
    } = eventParams;
    me.client.focusCell(cellSelector, {
      doSelect: !me.client.isSelected(cellSelector),
      event
    });
    super.showContextMenu(eventParams);
  }
  shouldShowMenu({ column }) {
    return column && column.enableCellContextMenu !== false;
  }
  getDataFromEvent(event) {
    const cellData = this.client.getCellDataFromEvent(event);
    if (cellData) {
      return ObjectHelper.assign(super.getDataFromEvent(event), cellData);
    }
  }
  beforeContextMenuShow({ record, items, column }) {
    if (column.cellMenuItems === false) {
      return false;
    }
    if (!record || record.isSpecialRow) {
      items.removeRow = false;
    }
  }
  //endregion
  //region Getters/Setters
  populateCellMenu({ items, column, record }) {
    const { client } = this;
    if (column == null ? void 0 : column.cellMenuItems) {
      ObjectHelper.merge(items, column.cellMenuItems);
    }
    if (!client.readOnly) {
      items.removeRow = {
        text: "L{removeRow}",
        localeClass: this,
        icon: "b-fw-icon b-icon-trash",
        cls: "b-separator",
        weight: 100,
        disabled: record.readOnly,
        onItem: () => {
          var _a, _b;
          const store = (_b = (_a = client.features.treeGroup) == null ? void 0 : _a.originalStore) != null ? _b : client.store;
          store.remove(client.selectedRecords.filter((r) => !r.readOnly).map((r) => r.$original));
        }
      };
    }
  }
  get showMenu() {
    return true;
  }
  //endregion
};
CellMenu.featureClass = "";
CellMenu._$name = "CellMenu";
GridFeatureManager.registerFeature(CellMenu, true, ["Grid", "Scheduler"]);
GridFeatureManager.registerFeature(CellMenu, false, ["Gantt"]);

// ../Grid/lib/Grid/feature/ColumnDragToolbar.js
var ColumnDragToolbar = class extends Delayable_default(InstancePlugin) {
  //region Config
  static get $name() {
    return "ColumnDragToolbar";
  }
  // Plugin configuration. This plugin chains some of the functions in Grid
  static get pluginConfig() {
    return {
      after: ["render"]
    };
  }
  //endregion
  //region Init
  construct(grid, config) {
    if (grid.features.columnReorder) {
      grid.features.columnReorder.ion({ beforeDestroy: "onColumnReorderBeforeDestroy", thisObj: this });
    }
    this.grid = grid;
    super.construct(grid, config);
  }
  doDestroy() {
    const me = this;
    if (me.grid.features.columnReorder && !me.grid.features.columnReorder.isDestroyed) {
      me.detachFromColumnReorder();
    }
    me.element && me.element.remove();
    me.element = null;
    super.doDestroy();
  }
  doDisable(disable) {
    if (this.initialized) {
      if (disable) {
        this.detachFromColumnReorder();
      } else {
        this.init();
      }
    }
    super.doDisable(disable);
  }
  init() {
    const me = this, grid = me.grid;
    if (!grid.features.columnReorder) {
      return;
    }
    me.reorderDetacher = grid.features.columnReorder.ion({
      gridheaderdragstart({ context }) {
        const column = grid.columns.getById(context.element.dataset.columnId);
        me.showToolbar(column);
      },
      gridheaderdrag: ({ context }) => me.onDrag(context),
      gridheaderabort: () => {
        me.hideToolbar();
      },
      gridHeaderDrop: me.onDrop,
      thisObj: me
    });
    me.initialized = true;
  }
  onColumnReorderBeforeDestroy() {
    this.detachFromColumnReorder();
  }
  detachFromColumnReorder() {
    const me = this;
    me.grid.features.columnReorder.un("beforedestroy", me.onColumnReorderBeforeDestroy, me);
    me.reorderDetacher && me.reorderDetacher();
    me.reorderDetacher = null;
  }
  /**
   * Initializes this feature on grid render.
   * @private
   */
  render() {
    if (!this.initialized) {
      this.init();
    }
  }
  //endregion
  //region Toolbar
  showToolbar(column) {
    const me = this, buttons = me.grid.getColumnDragToolbarItems(column, []), groups = [];
    me.clearTimeout(me.buttonHideTimer);
    buttons.forEach((button) => {
      button.text = button.localeClass.L(button.text);
      let group = groups.find((group2) => group2.text === button.group);
      if (!group) {
        group = {
          text: button.localeClass.L(button.group),
          buttons: []
        };
        groups.push(group);
      }
      group.buttons.push(button);
    });
    me.element = DomHelper.append(me.grid.element, me.template(groups));
    me.groups = groups;
    me.buttons = buttons;
    me.column = column;
  }
  async hideToolbar() {
    const me = this, element = me.element;
    if (element) {
      element.classList.add("b-remove");
      await EventHelper.waitForTransitionEnd({
        element,
        mode: "animation",
        thisObj: me.client
      });
      element.remove();
      me.element = null;
    }
  }
  //endregion
  //region Events
  onDrag(info) {
    var _a;
    const me = this;
    if (info.dragProxy.getBoundingClientRect().top - me.grid.element.getBoundingClientRect().top > 100) {
      me.element.classList.add("b-closer");
    } else {
      me.element.classList.remove("b-closer");
    }
    if (me.hoveringButton) {
      me.hoveringButton.classList.remove("b-hover");
      me.hoveringButton = null;
    }
    if ((_a = info.targetElement) == null ? void 0 : _a.closest(".b-columndragtoolbar")) {
      me.element.classList.add("b-hover");
      const button = info.targetElement.closest(".b-columndragtoolbar  .b-target-button:not([data-disabled=true])");
      if (button) {
        button.classList.add("b-hover");
        me.hoveringButton = button;
      }
    } else {
      me.element.classList.remove("b-hover");
    }
  }
  onDrop({ context }) {
    const me = this, { targetElement } = context;
    if (targetElement && targetElement.matches(".b-columndragtoolbar .b-target-button:not([data-disabled=true])")) {
      const button = me.buttons.find((button2) => button2.ref === targetElement.dataset.ref);
      if (button) {
        targetElement.classList.add("b-activate");
        me.buttonHideTimer = me.setTimeout(() => {
          me.hideToolbar();
          button.onDrop({ column: me.column });
        }, 100);
      }
    } else {
      me.hideToolbar();
    }
  }
  //endregion
  template(groups) {
    return TemplateHelper.tpl`
            <div class="b-columndragtoolbar">     
            <div class="b-title"></div>          
            ${groups.map((group) => TemplateHelper.tpl`
                <div class="b-group">
                    <div class="b-buttons">
                    ${group.buttons.map((btn) => TemplateHelper.tpl`
                        <div class="b-target-button" data-ref="${btn.ref}" data-disabled="${btn.disabled}">
                            <i class="${btn.icon}"></i>
                            ${btn.text}
                        </div>
                    `)}
                    </div>
                    <div class="b-title">${group.text}</div>
                </div>
            `)}
            </div>`;
  }
};
ColumnDragToolbar.featureClass = "b-hascolumndragtoolbar";
ColumnDragToolbar._$name = "ColumnDragToolbar";
GridFeatureManager.registerFeature(ColumnDragToolbar, BrowserHelper.isTouchDevice);

// ../Grid/lib/Grid/feature/ColumnPicker.js
var ColumnPicker = class extends InstancePlugin {
  static get pluginConfig() {
    return {
      chain: ["populateHeaderMenu", "getColumnDragToolbarItems"]
    };
  }
  get grid() {
    return this.client;
  }
  //endregion
  //region Context menu
  /**
   * Get menu items, either a straight list of columns or sub menus per subgrid
   * @private
   * @param columnStore Column store to traverse
   * @returns {MenuItemConfig[]} Menu item configs
   */
  getColumnPickerItems(columnStore) {
    const me = this, { createColumnsFromModel } = me;
    let result;
    if (me.groupByRegion) {
      result = me.grid.regions.map((region) => {
        const columns = me.grid.getSubGrid(region).columns.topColumns;
        return {
          text: StringHelper.capitalize(region),
          menu: me.buildColumnMenu(columns),
          disabled: columns.length === 0,
          region
        };
      });
      if (createColumnsFromModel) {
        result.push({
          text: me.L("L{newColumns}"),
          menu: me.createAutoColumnItems()
        });
      }
    } else if (me.groupByTag) {
      const tags = {};
      columnStore.topColumns.forEach((column) => {
        column.tags && Array.isArray(column.tags) && column.hideable !== false && column.tags.forEach((tag) => {
          if (!tags[tag]) {
            tags[tag] = 1;
          }
        });
      });
      result = Object.keys(tags).sort().map((tag) => ({
        text: StringHelper.capitalize(tag),
        menu: me.buildColumnMenu(me.getColumnsForTag(tag)),
        tag,
        onBeforeSubMenu: ({ item, itemEl }) => {
          me.refreshTagMenu(item, itemEl);
        }
      }));
      if (createColumnsFromModel) {
        result.push({
          text: me.L("L{newColumns}"),
          menu: me.createAutoColumnItems()
        });
      }
    } else {
      result = me.buildColumnMenu(columnStore.topColumns);
      if (createColumnsFromModel) {
        result.items.push(...ObjectHelper.transformNamedObjectToArray(me.createAutoColumnItems()));
      }
    }
    return result;
  }
  createAutoColumnItems() {
    const me = this, { grid } = me, {
      columns,
      store
    } = grid, { modelClass } = store, { allFields } = modelClass, result = {};
    for (let i = 0, { length } = allFields; i < length; i++) {
      const field = allFields[i], fieldName = field.name;
      if (!columns.get(fieldName)) {
        if (!field.internal) {
          result[fieldName] = {
            text: field.text || StringHelper.separate(field.name),
            checked: false,
            onToggle: (event) => {
              const column = columns.get(fieldName);
              if (column) {
                column[event.checked ? "show" : "hide"]();
              } else {
                columns.add(columns.generateColumnForField(field, {
                  region: me.forColumn.region
                }));
              }
              event.bubbles = false;
            }
          };
        }
      }
    }
    return result;
  }
  /**
   * Get all columns that has the specified tag.
   * @private
   * @param tag
   * @returns {Grid.column.Column[]}
   */
  getColumnsForTag(tag) {
    return this.grid.columns.records.filter(
      (column) => column.tags && Array.isArray(column.tags) && column.tags.includes(tag) && column.hideable !== false
    );
  }
  /**
   * Refreshes checked status for a tag menu. Needed since columns can appear under multiple tags.
   * @private
   */
  refreshTagMenu(item, itemEl) {
    const columns = this.getColumnsForTag(item.tag);
    columns.forEach((column) => {
      const subItem = item.items.find((subItem2) => subItem2.column === column);
      if (subItem)
        subItem.checked = column.hidden !== true;
    });
  }
  /**
   * Traverses columns to build menu items for the column picker.
   * @private
   */
  buildColumnMenu(columns) {
    let currentRegion = columns.length > 0 && columns[0].region;
    const { grid } = this, items = columns.reduce((items2, column) => {
      const visibleInRegion = grid.columns.visibleColumns.filter((col) => col.region === column.region);
      if (column.hideable !== false) {
        const itemConfig = {
          grid,
          column,
          text: column.headerText,
          checked: column.hidden !== true,
          disabled: column.hidden !== true && visibleInRegion.length === 1,
          cls: column.region !== currentRegion ? "b-separator" : ""
        };
        currentRegion = column.region;
        if (column.children && !column.isCollapsible) {
          itemConfig.menu = this.buildColumnMenu(column.children);
        }
        items2.push(itemConfig);
      }
      return items2;
    }, []);
    return {
      cls: this.menuCls,
      items
    };
  }
  /**
   * Populates the header context menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this, { columns } = me.grid;
    me.forColumn = column;
    if (column.showColumnPicker !== false && columns.some((col) => col.hideable)) {
      items.columnPicker = {
        text: "L{columnsMenu}",
        localeClass: me,
        icon: "b-fw-icon b-icon-columns",
        cls: "b-separator",
        weight: 200,
        menu: me.getColumnPickerItems(columns),
        onToggle: me.onColumnToggle,
        disabled: me.disabled
      };
    }
    if (column.hideable !== false && !column.parent.isCollapsible) {
      items.hideColumn = {
        text: "L{hideColumn}",
        localeClass: me,
        icon: "b-fw-icon b-icon-hide-column",
        weight: 210,
        disabled: !column.allowDrag || me.disabled,
        onItem: () => column.hide()
      };
    }
  }
  /**
   * Handler for column hide/show menu checkitems.
   * @private
   * @param {Object} event The {@link Core.widget.MenuItem#event-toggle} event.
   */
  onColumnToggle({ menu, item, checked }) {
    var _a, _b;
    if (Boolean(item.column.hidden) !== !checked) {
      item.column[checked ? "show" : "hide"]();
      const { grid, column } = item, { columns, features } = grid, siblingItems = menu.items, visibleInRegion = columns.visibleColumns.filter((col) => col.region === item.column.region), hideItem = ((_a = features.headerMenu) == null ? void 0 : _a.enabled) && features.headerMenu.menu.widgetMap.hideColumn;
      if (visibleInRegion.length === 1) {
        const lastVisibleItem = siblingItems.find((menuItem) => menuItem.column === visibleInRegion[0]);
        if (lastVisibleItem) {
          lastVisibleItem.disabled = true;
        }
        if (hideItem && column.region === item.column.region) {
          hideItem.disabled = true;
        }
      } else {
        visibleInRegion.forEach((col) => {
          const siblingItem = siblingItems.find((sibling) => sibling.column === col);
          if (siblingItem) {
            siblingItem.disabled = false;
          }
        });
        if (hideItem && column.region === item.column.region) {
          hideItem.disabled = false;
        }
      }
      (_b = item.menu) == null ? void 0 : _b.eachWidget((subItem) => {
        subItem.checked = checked;
      });
      const parentItem = menu.owner;
      if (parentItem && parentItem.column === column.parent) {
        parentItem.checked = siblingItems.some((subItem) => subItem.checked === true);
      }
    }
  }
  /**
   * Supply items to ColumnDragToolbar
   * @private
   */
  getColumnDragToolbarItems(column, items) {
    const visibleInRegion = this.grid.columns.visibleColumns.filter((col) => col.region === column.region);
    if (column.hideable !== false && visibleInRegion.length > 1) {
      items.push({
        text: "L{hideColumnShort}",
        ref: "hideColumn",
        group: "L{column}",
        localeClass: this,
        icon: "b-fw-icon b-icon-hide-column",
        weight: 101,
        onDrop: ({ column: column2 }) => column2.hide()
      });
    }
    return items;
  }
  //endregion
};
//region Config
__publicField(ColumnPicker, "$name", "ColumnPicker");
__publicField(ColumnPicker, "configurable", {
  /**
   * Groups columns in the picker by region (each region gets its own sub menu)
   * @config {Boolean}
   * @default
   */
  groupByRegion: false,
  /**
   * Groups columns in the picker by tag, each column may be shown under multiple tags. See
   * {@link Grid.column.Column#config-tags}
   * @config {Boolean}
   * @default
   */
  groupByTag: false,
  /**
   * Configure this as `true` to have the fields from the Grid's {@link Core.data.Store}'s
   * {@link Core.data.Store#config-modelClass} added to the menu to create __new__ columns
   * to display the fields.
   *
   * This may be combined with the {@link Grid.view.mixin.GridState stateful} ability of the grid
   * to create a self-configuring grid.
   * @config {Boolean}
   * @default
   */
  createColumnsFromModel: false,
  menuCls: "b-column-picker-menu b-sub-menu"
});
ColumnPicker._$name = "ColumnPicker";
GridFeatureManager.registerFeature(ColumnPicker, true);

// ../Grid/lib/Grid/feature/ColumnReorder.js
var ColumnReorder = class extends Delayable_default(InstancePlugin) {
  constructor() {
    super(...arguments);
    __publicField(this, "ignoreSelectors", [
      ".b-grid-header-resize-handle",
      ".b-field"
    ]);
  }
  /**
   * Initialize drag & drop (called from render)
   * @private
   */
  init() {
    const me = this, { grid } = me, gridEl = grid.element, containers = DomHelper.children(gridEl, ".b-grid-headers");
    containers.push(...DomHelper.children(gridEl, ".b-grid-header-children"));
    if (me.dragHelper) {
      me.dragHelper.containers = containers;
    } else {
      grid.whenVisible(() => me.createDragHelper());
    }
  }
  createDragHelper() {
    const me = this, { grid } = me, gridEl = grid.element, containers = DomHelper.children(gridEl, ".b-grid-headers");
    containers.push(...DomHelper.children(gridEl, ".b-grid-header-children"));
    me.dragHelper = new DragHelper({
      name: "columnReorder",
      mode: "container",
      dragThreshold: 10,
      targetSelector: ".b-grid-header",
      floatRootOwner: grid,
      rtlSource: grid,
      outerElement: grid.headerContainer,
      // Require that we drag inside grid header while dragging if we don't have a drag toolbar or external drop
      // target defined
      dropTargetSelector: ".b-grid-headers, .b-groupbar, .b-columndragtoolbar",
      externalDropTargetSelector: ".b-groupbar, .b-columndragtoolbar",
      monitoringConfig: {
        scrollables: [{
          element: ".b-grid-headers"
        }]
      },
      scrollManager: ScrollManager.new({
        direction: "horizontal",
        element: grid.headerContainer
      }),
      containers,
      isElementDraggable(element) {
        const abort = Boolean(element.closest(me.ignoreSelectors.join(",")));
        if (abort || me.disabled) {
          return false;
        }
        const columnEl = element.closest(this.targetSelector), column = columnEl && grid.columns.getById(columnEl.dataset.columnId), isLast = (column == null ? void 0 : column.childLevel) === 0 && grid.subGrids[column.region].columns.count === 1;
        return Boolean(column) && column.draggable !== false && !isLast;
      },
      ignoreSelector: ".b-filter-icon,.b-grid-header-resize-handle",
      internalListeners: {
        beforeDragStart: me.onBeforeDragStart,
        dragstart: me.onDragStart,
        drag: me.onDrag,
        drop: me.onDrop,
        abort: me.onAbort,
        thisObj: me
      }
    });
    me.relayEvents(me.dragHelper, ["dragStart", "drag", "drop", "abort"], "gridHeader");
    return me.dragHelper;
  }
  //endregion
  //region Plugin config
  doDestroy() {
    var _a, _b;
    (_a = this.dragHelper) == null ? void 0 : _a.scrollManager.destroy();
    (_b = this.dragHelper) == null ? void 0 : _b.destroy();
    super.doDestroy();
  }
  get grid() {
    return this.client;
  }
  //endregion
  //region Events (drop)
  onBeforeDragStart({ context, event }) {
    const me = this, { element } = context, column = context.column = me.client.columns.getById(element.dataset.columnId);
    me.dragHelper.autoSizeClonedTarget = !me.usingGroupBarWidget;
    return column.allowDrag && me.client.trigger("beforeColumnDragStart", { column, event });
  }
  onDragStart({ context, event }) {
    const me = this, { grid, usingGroupBarWidget } = me, { column, dragProxy } = context;
    if (!grid.features.columnDragToolbar && !usingGroupBarWidget) {
      const headerContainerBox = grid.element.querySelector(".b-grid-header-container").getBoundingClientRect();
      me.dragHelper.minY = headerContainerBox.top;
      me.dragHelper.maxY = headerContainerBox.bottom;
    }
    grid.element.classList.add("b-dragging-header");
    if (usingGroupBarWidget) {
      dragProxy.classList.add("b-grid-reordering-columns-with-groupbar");
    }
    if (grid.features.filterBar && grid.features.filterBar.compactMode) {
      dragProxy.classList.add("b-filter-bar-compact");
    }
    dragProxy.style.fontSize = DomHelper.getStyleValue(context.element, "fontSize");
    grid.trigger("columnDragStart", { column, event });
  }
  onDrag({ context, event }) {
    const me = this, grid = me.client, { column, insertBefore: insertBeforeElement } = context, insertBefore = grid.columns.getById(insertBeforeElement == null ? void 0 : insertBeforeElement.dataset.columnId), targetHeader = Widget.fromElement(event.target, "gridheader");
    if (targetHeader == null ? void 0 : targetHeader.subGrid.sealedColumns) {
      context.valid = false;
    }
    grid.trigger("columnDrag", { column, insertBefore, event, context });
  }
  /**
   * Handle drop
   * @private
   */
  onDrop({ context, event }) {
    var _a;
    if (!context.valid) {
      return this.onInvalidDrop({ context, event });
    }
    const me = this, { grid } = me, { column } = context, element = context.dragging, onHeader = context.target.closest(".b-grid-header"), droppedInRegion = (_a = context.draggedTo) == null ? void 0 : _a.dataset.region, isReorder = droppedInRegion || onHeader;
    let vetoed, newParent, insertBefore, toRegion, oldParent;
    grid.element.classList.remove("b-dragging-header");
    if (isReorder) {
      const onColumn = onHeader ? grid.columns.get(onHeader.dataset.column) : grid.subGrids[droppedInRegion].columns.last, sibling = context.insertBefore;
      toRegion = droppedInRegion || onColumn.region;
      oldParent = column.parent;
      insertBefore = sibling ? grid.columns.getById(sibling.dataset.columnId) : grid.subGrids[toRegion].columns.last.nextSibling;
      if (insertBefore) {
        newParent = insertBefore.parent;
      } else {
        const groupNode = onHeader == null ? void 0 : onHeader.parentElement.closest(".b-grid-header");
        if (groupNode) {
          newParent = grid.columns.getById(groupNode.dataset.columnId);
        } else {
          newParent = grid.columns.rootNode;
        }
      }
      vetoed = toRegion === column.region && oldParent === newParent && (onColumn === column.previousSibling || insertBefore === column.nextSibling);
      element.remove();
    }
    vetoed = vetoed || grid.trigger("beforeColumnDropFinalize", {
      column,
      newParent,
      insertBefore,
      event,
      region: toRegion
    }) === false;
    if (!vetoed && isReorder) {
      vetoed = !newParent.insertChild(column, insertBefore);
    }
    context.valid = !vetoed;
    if (!vetoed && isReorder) {
      column.region = toRegion;
      if (oldParent.children.length === 0) {
        oldParent.parent.removeChild(oldParent);
      }
    }
    grid.trigger("columnDrop", { column, newParent, insertBefore, valid: context.valid, event, region: toRegion });
  }
  onAbort({ context, event }) {
    this.onInvalidDrop({ context, event });
  }
  /**
   * Handle invalid drop
   * @private
   */
  onInvalidDrop({ context, event }) {
    const { grid } = this, { column } = context;
    grid.trigger("columnDrop", { column, valid: false, event });
    grid.element.classList.remove("b-dragging-header");
  }
  //endregion
  //region Render
  /**
   * Updates DragHelper with updated headers when grid contents is rerendered
   * @private
   */
  renderContents() {
    this.init();
  }
  /**
   * Initializes this feature on grid paint.
   * @private
   */
  onInternalPaint() {
    this.init();
  }
  /**
   * Returns true if a reorder operation is active
   * @property {Boolean}
   * @readonly
   */
  get isReordering() {
    var _a;
    return Boolean((_a = this.dragHelper) == null ? void 0 : _a.isDragging);
  }
  //endregion
};
//region Init
__publicField(ColumnReorder, "$name", "ColumnReorder");
// Plugin configuration. This plugin chains some functions in Grid
__publicField(ColumnReorder, "pluginConfig", {
  after: ["onInternalPaint", "renderContents"]
});
ColumnReorder.featureClass = "b-column-reorder";
ColumnReorder._$name = "ColumnReorder";
GridFeatureManager.registerFeature(ColumnReorder, true);

// ../Grid/lib/Grid/feature/ColumnResize.js
var ColumnResize = class extends InstancePlugin {
  static get $name() {
    return "ColumnResize";
  }
  static get configurable() {
    return {
      /**
       * Resize all cells below a resizing header during dragging.
       * `'auto'` means `true` on non-mobile platforms.
       * @config {String|Boolean}
       * @default
       */
      liveResize: "auto"
    };
  }
  //region Init
  construct(grid, config) {
    const me = this;
    me.grid = grid;
    super.construct(grid, config);
    me.resizer = new ResizeHelper({
      name: "columnResize",
      targetSelector: ".b-grid-header",
      handleSelector: ".b-grid-header-resize-handle",
      outerElement: grid.element,
      rtlSource: grid,
      internalListeners: {
        beforeresizestart: me.onBeforeResizeStart,
        resizestart: me.onResizeStart,
        resizing: me.onResizing,
        resize: me.onResize,
        cancel: me.onCancel,
        thisObj: me
      }
    });
  }
  doDestroy() {
    var _a;
    (_a = this.resizer) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  //endregion
  changeLiveResize(liveResize) {
    if (liveResize === "auto") {
      return !BrowserHelper.isMobileSafari;
    }
    return liveResize;
  }
  //region Events
  onBeforeResizeStart() {
    return !this.disabled;
  }
  onResizeStart({ context }) {
    const { grid, resizer } = this, column = context.column = grid.columns.getById(context.element.dataset.columnId);
    resizer.minWidth = column.minWidth;
    grid.element.classList.add("b-column-resizing");
  }
  /**
   * Handle drag event - resize the column live unless it's a touch gesture
   * @private
   */
  onResizing({ context }) {
    if (context.valid && this.liveResize) {
      this.grid.resizingColumns = true;
      context.column.width = context.newWidth;
    }
  }
  /**
   * Handle drop event (only used for touch)
   * @private
   */
  onResize({ context }) {
    const { grid } = this, { column } = context;
    grid.element.classList.remove("b-column-resizing");
    if (context.valid) {
      if (this.liveResize) {
        grid.resizingColumns = false;
        grid.afterColumnsResized(column);
      } else {
        column.width = context.newWidth;
      }
    }
  }
  /**
   * Restore column width on cancel (ESC)
   * @private
   */
  onCancel({ context }) {
    const { grid } = this;
    grid.element.classList.remove("b-column-resizing");
    context.column.width = context.elementWidth;
    grid.resizingColumns = false;
  }
  //endregion
};
ColumnResize._$name = "ColumnResize";
GridFeatureManager.registerFeature(ColumnResize, true);

// ../Grid/lib/Grid/widget/GridFieldFilterPicker.js
var _GridFieldFilterPicker = class _GridFieldFilterPicker extends FieldFilterPicker {
  //region Config
  static get $name() {
    return "GridFieldFilterPicker";
  }
  // Factoryable type name
  static get type() {
    return "gridfieldfilterpicker";
  }
  //endregion
  afterConstruct() {
    var _a;
    const me = this;
    if (!me.grid) {
      throw new Error(`${me.constructor.$name} requires 'grid' to be configured.`);
    }
    me.fields = (_a = me.fields) != null ? _a : {};
    super.afterConstruct();
  }
  updateGrid(newGrid) {
    var _a;
    if (!((_a = newGrid.store) == null ? void 0 : _a.modelClass)) {
      throw new Error(`Grid does not have a store with a modelClass defined.`);
    }
    if (!newGrid.columns) {
      throw new Error(`Grid does not have a column store.`);
    }
  }
  /**
   * Gets the filterable fields backing any of the configured `grid`'s columns, for those columns for which
   * it is possible to do so.
   * @private
   * @returns {Object} Filterable fields dictionary of the form { [fieldName]: { title, type } }
   */
  static getColumnFields(columnStore, modelClass, allowedFieldNames) {
    var _a;
    return Object.fromEntries(
      (_a = columnStore == null ? void 0 : columnStore.reduce((outFields, { field: fieldName, text, filterType, filterable }) => {
        var _a2;
        if (!allowedFieldNames || allowedFieldNames.includes(fieldName)) {
          const field = fieldName && modelClass.getFieldDefinition(fieldName), fieldType = isFilterableField(field) ? field.type : void 0;
          if (fieldType || filterType || filterable) {
            outFields.push([
              fieldName,
              {
                title: text || fieldName,
                type: (_a2 = filterType != null ? filterType : isSupportedDurationField(field) ? "duration" : fieldType) != null ? _a2 : "auto"
              }
            ]);
          }
        }
        return outFields;
      }, [])) != null ? _a : []
    );
  }
  changeFields(newFields) {
    var _a;
    let localFields = newFields;
    if (Array.isArray(newFields)) {
      VersionHelper.deprecate("Core", "6.0.0", "FieldOption[] deprecated, use Object<String, FieldOption[]> keyed by field name instead");
      localFields = ArrayHelper.keyBy(localFields, "name");
    }
    const mergedFields = ObjectHelper.merge(
      {},
      _GridFieldFilterPicker.getColumnFields(this.grid.columns, (_a = this.grid.store) == null ? void 0 : _a.modelClass),
      localFields
    );
    return this.allowedFieldNames ? Object.fromEntries(this.allowedFieldNames.map((fieldName) => [fieldName, mergedFields[fieldName]])) : mergedFields;
  }
};
/** @hideconfigs store */
__publicField(_GridFieldFilterPicker, "configurable", {
  /**
   * {@link Grid.view.Grid} from which to read the available field list. In order to
   * appear as a selectable property for a filter, a column must have a `field` property.
   * If the column has a `text` property, that will be shown as the displayed text in the
   * selector; otherwise, the `field` property will be shown as-is.
   *
   * The grid's {@link Core.data.Store}'s {@link Core.data.Store#property-modelClass} will be
   * examined to find field data types.
   *
   * You can limit available fields to a subset of the grid's columns using the
   * {@link #config-allowedFieldNames} configuration property.
   *
   * @config {Grid.view.Grid}
   */
  grid: null,
  /**
   * Optional array of field names that are allowed as selectable properties for filters.
   * This is a subset of the field names found in the {@link #config-grid}'s columns. When supplied, only
   * the named fields will be shown in the property selector combo.
   *
   * Note that field names are case-sensitive and should match the data field name in the store
   * model.
   *
   * @config {String[]}
   */
  allowedFieldNames: null
});
var GridFieldFilterPicker = _GridFieldFilterPicker;
GridFieldFilterPicker.initClass();
GridFieldFilterPicker._$name = "GridFieldFilterPicker";

// ../Grid/lib/Grid/widget/GridFieldFilterPickerGroup.js
var GridFieldFilterPickerGroup = class extends FieldFilterPickerGroup {
  //region Config
  static get $name() {
    return "GridFieldFilterPickerGroup";
  }
  // Factoryable type name
  static get type() {
    return "gridfieldfilterpickergroup";
  }
  validateConfig() {
    if (!this.grid) {
      throw new Error(`${this.constructor.$name} requires the 'grid' config property.`);
    }
  }
  getFilterPickerConfig(filter) {
    const { grid, allowedFieldNames, fields } = this;
    return {
      ...super.getFilterPickerConfig(filter),
      fields,
      grid,
      allowedFieldNames
    };
  }
  updateGrid(newGrid) {
    this.store = this.grid.store;
  }
  /**
   * @private
   */
  canManage(filter) {
    const me = this;
    return super.canManage(filter) && (!me.allowedFieldNames || me.allowedFieldNames.includes(filter.property));
  }
};
/** @hideconfigs fields, store */
__publicField(GridFieldFilterPickerGroup, "configurable", {
  /**
   * {@link Grid.view.Grid} from which to read the available field list. In order to
   * appear as a selectable property for a filter, a column must have a `field` property.
   * If the column has a `text` property, that will be shown as the displayed text in the
   * selector; otherwise, the `field` property will be shown as-is.
   *
   * The grid's {@link Core.data.Store}'s {@link Core.data.Store#property-modelClass} will be
   * examined to find field data types.
   *
   * You can limit available fields to a subset of the grid's columns using the
   * {@link #config-allowedFieldNames} configuration property.
   *
   * @config {Grid.view.Grid}
   */
  grid: null,
  /**
   * Optional array of field names that are allowed as selectable properties for filters.
   * This should be a subset of the field names found in the {@link #config-grid}'s store. When supplied,
   * only the named fields will be shown in the property selector combo.
   *
   * @config {String[]}
   */
  allowedFieldNames: null
});
//endregion
__publicField(GridFieldFilterPickerGroup, "childPickerType", "gridfieldfilterpicker");
GridFieldFilterPickerGroup.initClass();
GridFieldFilterPickerGroup._$name = "GridFieldFilterPickerGroup";

// ../Grid/lib/Grid/feature/Filter.js
var fieldTypeMap = {
  date: "date",
  int: "number",
  integer: "number",
  number: "number",
  string: "string",
  duration: "duration",
  time: "time",
  auto: "auto"
};
var defaultOperators = {
  date: "=",
  number: "=",
  string: "includes",
  duration: "=",
  relation: null,
  auto: "*"
};
var allowedFilterTypes = {
  ...filterableFieldDataTypes,
  relation: true
};
var menuItemsWithSeparators = {
  filterDateIsToday: true,
  filterDateIsThisWeek: true,
  filterDateIsThisMonth: true,
  filterDateIsThisYear: true
};
var Filter = class extends InstancePlugin {
  //region Init
  static get $name() {
    return "Filter";
  }
  static get configurable() {
    return {
      /**
       * Use custom filtering functions defined on columns also when programmatically filtering by the columns
       * field.
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *         {
       *             field : 'age',
       *             text : 'Age',
       *             filterable({ record, value }) {
       *               // Custom filtering, return true/false
       *             }
       *         }
       *     ],
       *
       *     features : {
       *         filter : {
       *             prioritizeColumns : true // <--
       *         }
       *     }
       * });
       *
       * // Because of the prioritizeColumns config above, any custom
       * // filterable function on a column will be used when
       * // programmatically filtering by that columns field
       * grid.store.filter({
       *     property : 'age',
       *     value    : 30
       * });
       * ```
       *
       * @config {Boolean}
       * @default
       * @category Common
       */
      prioritizeColumns: false,
      /**
       * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>}
       */
      keyMap: {
        f: "showFilterEditorByKey"
      },
      /**
       * `true` to enable the more limited legacy UI mode.
       *
       * @config {Boolean}
       * @default
       * @category Common
       */
      legacyMode: false,
      /**
       * Optional configuration to use when configuring the {@link Grid.widget.GridFieldFilterPickerGroup} shown in the
       * column header popup, when not in legacy mode.
       *
       * @config {GridFieldFilterPickerGroupConfig}
       * @category Common
       */
      pickerConfig: null,
      /**
       * When true, close the popup when the last filter shown in the popup is removed using the remove button. Not
       * applicable in legacy mode.
       *
       * @config {Boolean}
       * @default
       * @category Common
       */
      closeEmptyPopup: false
    };
  }
  construct(grid, config) {
    if (grid.features.filterBar) {
      throw new Error("Grid.feature.Filter feature may not be used together with Grid.feature.FilterBar. These features are mutually exclusive.");
    }
    const me = this;
    me.grid = grid;
    me.closeFilterEditor = me.closeFilterEditor.bind(me);
    if (config == null ? void 0 : config.isMulti) {
      VersionHelper.deprecate("Grid", "6.0.0", "Filter plugin config isMulti deprecated, use pickerConfig instead");
      if (typeof config.isMulti === "object") {
        config.pickerConfig = config.isMulti;
      }
      delete config.isMulti;
    }
    super.construct(grid, config);
    me.bindStore(grid.store);
    if (config && typeof config === "object") {
      const clone = ObjectHelper.clone(config);
      delete clone.prioritizeColumns;
      delete clone.legacyMode;
      delete clone.pickerConfig;
      delete clone.dateFormat;
      delete clone.closeEmptyPopup;
      if (!ObjectHelper.isEmpty(clone)) {
        grid.store.filter(clone, null, grid.isConfiguring);
      }
    }
  }
  doDestroy() {
    var _a, _b;
    (_a = this.filterTip) == null ? void 0 : _a.destroy();
    (_b = this.filterEditorPopup) == null ? void 0 : _b.destroy();
    super.doDestroy();
  }
  get store() {
    return this.grid.store;
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      beforeFilter: "onStoreBeforeFilter",
      filter: "onStoreFilter",
      thisObj: this
    });
    if (this.client.isPainted) {
      this.refreshHeaders(false);
    }
  }
  //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["renderHeader", "populateCellMenu", "populateHeaderMenu", "onElementClick", "bindStore"]
    };
  }
  //endregion
  //region Refresh headers
  /**
   * Update headers to match stores filters. Called on store load and grid header render.
   * @param reRenderRows Also refresh rows?
   * @private
   */
  refreshHeaders(reRenderRows) {
    const me = this, grid = me.grid, element = grid.headerContainer;
    if (element) {
      DomHelper.children(element, ".b-filter-icon.b-latest").forEach((iconElement) => iconElement.classList.remove("b-latest"));
      if (!me.filterTip) {
        me.filterTip = new Tooltip({
          forElement: element,
          forSelector: ".b-filter-icon",
          getHtml({ activeTarget }) {
            return activeTarget.dataset.filterText;
          }
        });
      }
      if (!grid.store.isFiltered) {
        me.filterTip.hide();
      }
      grid.columns.visibleColumns.forEach((column) => {
        if (column.filterable !== false) {
          const columnFilters = me.store.filters.allValues.filter(({ property, disabled, internal }) => property === column.field && !disabled && !internal), isColumnFiltered = columnFilters.length > 0, headerEl = column.element;
          if (headerEl) {
            const textEl = column.textWrapper;
            let filterIconEl = textEl == null ? void 0 : textEl.querySelector(".b-filter-icon"), filterText;
            if (isColumnFiltered) {
              const bullet = "&#x2022 ";
              filterText = `${me.L("L{filter}")}: ` + (columnFilters.length > 1 ? "<br/><br/>" : "") + columnFilters.map((columnFilter) => {
                var _a, _b, _c, _d, _e;
                let value = (_a = columnFilter.value) != null ? _a : "";
                const isArray = Array.isArray(value), relation = (_c = (_b = me.store) == null ? void 0 : _b.modelRelations) == null ? void 0 : _c.find(
                  ({ foreignKey }) => foreignKey === columnFilter.property
                );
                if (columnFilter.displayValue) {
                  value = columnFilter.displayValue;
                } else {
                  if (!me.legacyMode && relation) {
                    const { relatedDisplayField } = (_e = (_d = me.pickerConfig) == null ? void 0 : _d.fields) == null ? void 0 : _e[columnFilter.property];
                    if (relatedDisplayField) {
                      const getDisplayValue = (foreignId) => {
                        var _a2;
                        return (_a2 = relation.foreignStore.getById(foreignId)) == null ? void 0 : _a2[relatedDisplayField];
                      };
                      if (isArray) {
                        value = value.map(getDisplayValue).sort((a, b) => (a != null ? a : "").localeCompare(b != null ? b : ""));
                      } else {
                        value = getDisplayValue(value);
                      }
                    }
                  } else if (column.formatValue && value) {
                    value = isArray ? value.map((val) => column.formatValue(val)) : column.formatValue(value);
                  }
                  if (isArray) {
                    value = `[ ${value.join(", ")} ]`;
                  }
                }
                return (columnFilters.length > 1 ? bullet : "") + (typeof columnFilter === "string" ? columnFilter : `${columnFilter.operator} ${value}`);
              }).join("<br/><br/>");
            } else {
              filterText = me.L("L{applyFilter}");
            }
            if (!filterIconEl) {
              filterIconEl = DomHelper.createElement({
                parent: textEl,
                tag: "div",
                className: "b-filter-icon",
                dataset: {
                  filterText
                }
              });
            } else {
              filterIconEl.dataset.filterText = filterText;
            }
            if (column.field === me.store.latestFilterField)
              filterIconEl.classList.add("b-latest");
            headerEl.classList.add("b-filterable");
            headerEl.classList.toggle("b-filter", isColumnFiltered);
          }
          column.meta.isFiltered = isColumnFiltered;
        }
      });
      if (reRenderRows) {
        grid.refreshRows();
      }
    }
  }
  //endregion
  //region Filter
  applyFilter(column, filterConfig) {
    const { store } = this;
    column.$filter = store.addFilter(this.injectColumnFilterConfig(column, filterConfig), true);
    store.filter();
  }
  injectColumnFilterConfig(column, filterConfig) {
    const { filterFn } = column.filterable;
    return ObjectHelper.assign(filterConfig, {
      ...column.filterable,
      ...filterConfig,
      property: column.field,
      // Only inject a filterBy configuration if the column has a custom filterBy
      [filterFn ? "filterBy" : "_"]: function(record) {
        return filterFn({ value: this.value, record, operator: this.operator, property: this.property, column });
      }
    });
  }
  removeFilter(column, onlyForOperator) {
    var _a;
    if (!this.legacyMode && !((_a = column.filterable) == null ? void 0 : _a.filterField)) {
      for (const filter of this.getCurrentMultiFilters(column)) {
        if (!onlyForOperator || filter.operator === onlyForOperator) {
          this.store.removeFilter(filter);
        }
      }
    } else {
      this.store.removeFilter(column.field);
    }
  }
  disableFilter(column) {
    for (const filter of this.getCurrentMultiFilters(column)) {
      filter.disabled = true;
      this.store.filter(filter);
    }
    this.store.filter();
  }
  getCurrentMultiFilters(column) {
    return this.store.filters.values.filter((filter) => filter.property === column.field);
  }
  getPopupDateItems(column, fieldType, filter, initialValue, store, changeCallback, closeCallback, filterField) {
    const me = this, onClose = changeCallback;
    function onClear() {
      me.removeFilter(column);
    }
    function onKeydown({ event }) {
      if (event.key === "Enter") {
        changeCallback();
      }
    }
    function onChange({ source, value }) {
      if (value == null) {
        onClear();
      } else {
        me.clearSiblingsFields(source);
        me.applyFilter(column, { operator: source.operator, value, displayValue: source._value, type: "date" });
      }
    }
    return [
      ObjectHelper.assign({
        type: "date",
        ref: "on",
        placeholder: "L{on}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-equal"></i>',
        value: (filter == null ? void 0 : filter.operator) === "sameDay" ? filter.value : initialValue,
        operator: "sameDay",
        onKeydown,
        onChange,
        onClose,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "date",
        ref: "before",
        placeholder: "L{before}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-before"></i>',
        value: (filter == null ? void 0 : filter.operator) === "<" ? filter.value : null,
        operator: "<",
        onKeydown,
        onChange,
        onClose,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "date",
        ref: "after",
        cls: "b-last-row",
        placeholder: "L{after}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-after"></i>',
        value: (filter == null ? void 0 : filter.operator) === ">" ? filter.value : null,
        operator: ">",
        onKeydown,
        onChange,
        onClose,
        onClear
      }, filterField)
    ];
  }
  getPopupNumberItems(column, fieldType, filter, initialValue, store, changeCallback, closeCallback, filterField) {
    const me = this, onEsc = changeCallback;
    function onClear() {
      me.removeFilter(column);
    }
    function onKeydown({ event }) {
      if (event.key === "Enter") {
        changeCallback();
      }
    }
    function onChange({ source, value }) {
      if (value == null) {
        onClear();
      } else {
        me.clearSiblingsFields(source);
        me.applyFilter(column, { operator: source.operator, value });
      }
    }
    return [
      ObjectHelper.assign({
        type: "number",
        placeholder: "L{Filter.equals}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-equal"></i>',
        value: (filter == null ? void 0 : filter.operator) === "=" ? filter.value : initialValue,
        operator: "=",
        onKeydown,
        onChange,
        onEsc,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "number",
        placeholder: "L{lessThan}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-less"></i>',
        value: (filter == null ? void 0 : filter.operator) === "<" ? filter.value : null,
        operator: "<",
        onKeydown,
        onChange,
        onEsc,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "number",
        cls: "b-last-row",
        placeholder: "L{moreThan}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-more"></i>',
        value: (filter == null ? void 0 : filter.operator) === ">" ? filter.value : null,
        operator: ">",
        onKeydown,
        onChange,
        onEsc,
        onClear
      }, filterField)
    ];
  }
  clearSiblingsFields(sourceField) {
    var _a;
    (_a = this.filterEditorPopup) == null ? void 0 : _a.items.forEach((field) => {
      field !== sourceField && (field == null ? void 0 : field.clear());
    });
  }
  getPopupDurationItems(column, fieldType, filter, initialValue, store, changeCallback, closeCallback, filterField) {
    const me = this, onEsc = changeCallback, onClear = () => me.removeFilter(column);
    function onChange({ source, value }) {
      if (value == null) {
        onClear();
      } else {
        me.clearSiblingsFields(source);
        me.applyFilter(column, { operator: source.operator, value });
      }
    }
    return [
      ObjectHelper.assign({
        type: "duration",
        placeholder: "L{Filter.equals}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-equal"></i>',
        value: (filter == null ? void 0 : filter.operator) === "=" ? filter.value : initialValue,
        operator: "=",
        onChange,
        onEsc,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "duration",
        placeholder: "L{lessThan}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-less"></i>',
        value: (filter == null ? void 0 : filter.operator) === "<" ? filter.value : null,
        operator: "<",
        onChange,
        onEsc,
        onClear
      }, filterField),
      ObjectHelper.assign({
        type: "duration",
        cls: "b-last-row",
        placeholder: "L{moreThan}",
        localeClass: me,
        clearable: true,
        label: '<i class="b-fw-icon b-icon-filter-more"></i>',
        value: (filter == null ? void 0 : filter.operator) === ">" ? filter.value : null,
        operator: ">",
        onChange,
        onEsc,
        onClear
      }, filterField)
    ];
  }
  getPopupStringItems(column, fieldType, filter, initialValue, store, changeCallback, closeCallback, filterField) {
    const me = this;
    return [ObjectHelper.assign({
      type: "text",
      cls: "b-last-row",
      placeholder: "L{filter}",
      localeClass: me,
      clearable: true,
      label: '<i class="b-fw-icon b-icon-filter-equal"></i>',
      value: filter ? filter.value || filter : initialValue,
      operator: "*",
      onChange({ source, value }) {
        if (value === "") {
          closeCallback();
        } else {
          me.applyFilter(column, { operator: source.operator, value, displayValue: source.displayField && source.records ? source.records.map((rec) => rec[source.displayField]).join(", ") : void 0 });
          if (!source.multiSelect) {
            changeCallback();
          }
        }
      },
      onClose: changeCallback,
      onClear: closeCallback
    }, filterField)];
  }
  /**
   * Get fields to display in filter popup.
   * @param {Grid.column.Column} column Column
   * @param fieldType Type of field, number, date etc.
   * @param filter Current filter
   * @param initialValue
   * @param store Grid store
   * @param changeCallback Callback for when filter has changed
   * @param closeCallback Callback for when editor should be closed
   * @param filterField filter field
   * @returns {*}
   * @private
   */
  getPopupItems(column, fieldType, filter, initialValue, store, changeCallback, closeCallback, filterField) {
    const me = this;
    if (me.useLegacyModeForColumn(column) || filterField) {
      switch (fieldType) {
        case "date":
          return me.getPopupDateItems(...arguments);
        case "number":
          return me.getPopupNumberItems(...arguments);
        case "duration":
          return me.getPopupDurationItems(...arguments);
        default:
          return me.getPopupStringItems(...arguments);
      }
    }
    return [me.getFieldFilterPickerGroup(column)];
  }
  getFieldFilterPickerGroup(column) {
    const me = this;
    return {
      ...me.pickerConfig,
      type: "gridfieldfilterpickergroup",
      ref: "pickerGroup",
      limitToProperty: column.field,
      grid: me.grid,
      propertyFieldCls: "b-transparent property-field",
      operatorFieldCls: "b-transparent operator-field",
      valueFieldCls: "b-transparent value-field",
      internalListeners: {
        beforeAddFilter: ({ filter }) => {
          me.injectColumnFilterConfig(column, filter);
        },
        remove: me.onPopupFilterRemove,
        keydown: me.onPopupKeydown,
        thisObj: me
      },
      triggerChangeOnInput: false
    };
  }
  onPopupFilterRemove() {
    if (this.closeEmptyPopup && this.filterEditorPopup.widgetMap.pickerGroup.filters.length === 0) {
      this.delay(this.closeFilterEditor, 0);
    }
  }
  onPopupKeydown({ event }) {
    if (event.key === "Enter") {
      this.delay(this.closeFilterEditor, 0);
    }
  }
  /**
   * Shows a popup where a filter can be edited.
   * @param {Grid.column.Column|String} column Column to show filter editor for
   * @param {*} [value] The initial value of the filter value input
   * @param {String} [operator] The initial operator of the filter operator selector (non-legacy mode)
   * @param {Boolean} [forceAddBlank] Whether to add a blank filter row even if other filters exist
   *                  (non-legacy mode; default false)
   */
  showFilterEditor(column, value, operator, forceAddBlank = false) {
    var _a;
    column = this.grid.columns.getById(column);
    const me = this, { store } = me, headerEl = column.element, filter = store.filters.getBy("property", column.field), fieldType = me.getFilterType(column), legacyMode = me.useLegacyModeForColumn(column);
    if (column.filterable === false) {
      return;
    }
    me.closeFilterEditor();
    const items = me.getPopupItems(
      column,
      fieldType,
      // Only pass filter if it's not an internal filter
      (filter == null ? void 0 : filter.internal) ? null : filter,
      value,
      store,
      me.closeFilterEditor,
      () => {
        me.removeFilter(column);
        me.closeFilterEditor();
      },
      column.filterable.filterField
    );
    items.forEach((item) => item.placeholder = item.placeholder ? this.L(item.placeholder) : item.placeholder);
    me.filterEditorPopup = WidgetHelper.openPopup(headerEl, {
      owner: me.grid,
      cls: new DomClassList("b-filter-popup", {
        "b-filter-popup-legacymode": legacyMode
      }),
      scrollAction: "realign",
      layout: {
        type: "vbox",
        align: "stretch"
      },
      items
    });
    if (!legacyMode) {
      if (forceAddBlank || !((_a = me.grid.store) == null ? void 0 : _a.filters.find((filter2) => filter2.property === column.field))) {
        me.filterEditorPopup.widgetMap.pickerGroup.addFilter({
          type: fieldType,
          property: column.field,
          operator: operator != null ? operator : defaultOperators[fieldType],
          value
        });
      }
      me.filterEditorPopup.items[0].focus();
    }
  }
  /**
   * Close the filter editor.
   */
  closeFilterEditor() {
    var _a;
    (_a = this.filterEditorPopup) == null ? void 0 : _a.setTimeout(this.filterEditorPopup.destroy);
    this.filterEditorPopup = null;
  }
  //endregion
  //region Context menu
  getFilterType(column) {
    var _a, _b, _c, _d;
    const fieldName = column.field, field = this.client.store.modelClass.getFieldDefinition(fieldName), type = (_b = (_a = column.filterType) != null ? _a : fieldTypeMap[column.type]) != null ? _b : fieldTypeMap[field == null ? void 0 : field.type], relation = (_d = (_c = this.store) == null ? void 0 : _c.modelRelations) == null ? void 0 : _d.find(({ foreignKey }) => foreignKey === fieldName);
    if (relation) {
      return "relation";
    } else if (type === "auto" && this.store && !this.useLegacyModeForColumn(column)) {
      return FieldFilterPicker.inferFieldType(this.store, fieldName);
    } else if (type) {
      return fieldTypeMap[type];
    }
    return "auto";
  }
  populateCellMenuWithDateItems({ column, record, items }) {
    const property = column.field, type = this.getFilterType(column);
    if (type === "date") {
      const me = this, value = record.getValue(property), filter = (operator) => {
        me.applyFilter(column, {
          operator,
          value,
          displayValue: column.formatValue ? column.formatValue(value) : value,
          type: "date"
        });
      };
      items.filterDateEquals = {
        text: "L{on}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-equal",
        cls: "b-separator",
        weight: 300,
        disabled: me.disabled,
        onItem: () => filter("=")
      };
      items.filterDateBefore = {
        text: "L{before}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-before",
        weight: 310,
        disabled: me.disabled,
        onItem: () => filter("<")
      };
      items.filterDateAfter = {
        text: "L{after}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-after",
        weight: 320,
        disabled: me.disabled,
        onItem: () => filter(">")
      };
    }
  }
  populateCellMenuWithNumberItems({ column, record, items }) {
    const property = column.field, type = this.getFilterType(column);
    if (type === "number") {
      const me = this, value = record.getValue(property), filter = (operator) => {
        me.applyFilter(column, { operator, value });
      };
      items.filterNumberEquals = {
        text: "L{equals}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-equal",
        cls: "b-separator",
        weight: 300,
        disabled: me.disabled,
        onItem: () => filter("=")
      };
      items.filterNumberLess = {
        text: "L{lessThan}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-less",
        weight: 310,
        disabled: me.disabled,
        onItem: () => filter("<")
      };
      items.filterNumberMore = {
        text: "L{moreThan}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-more",
        weight: 320,
        disabled: me.disabled,
        onItem: () => filter(">")
      };
    }
  }
  addMenuItemsForDataType(menuItems, dataType, filterFn, activeOperators) {
    const allowedOperators = FieldFilterPicker.defaultOperators[dataType].filter(({ argCount, isArrayValued }) => !(argCount > 1 || isArrayValued));
    let weight = 300;
    for (const { value: operator, text, argCount } of allowedOperators) {
      menuItems[`filter${StringHelper.capitalize(dataType)}${StringHelper.capitalize(operator)}`] = {
        text: StringHelper.capitalize(FieldFilterPicker.L(text)),
        weight: weight += 10,
        icon: activeOperators.includes(operator) ? "b-icon b-icon-check" : null,
        disabled: this.disabled,
        onItem: () => filterFn(operator, argCount)
      };
    }
  }
  populateCellMenuWithDurationItems({ column, record, items }) {
    const type = this.getFilterType(column);
    if (type === "duration") {
      const me = this, value = column.getFilterableValue(record), filter = (operator) => {
        me.applyFilter(column, { operator, value });
      };
      items.filterDurationEquals = {
        text: "L{equals}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-equal",
        cls: "b-separator",
        weight: 300,
        disabled: me.disabled,
        onItem: () => filter("=")
      };
      items.filterDurationLess = {
        text: "L{lessThan}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-less",
        weight: 310,
        disabled: me.disabled,
        onItem: () => filter("<")
      };
      items.filterDurationMore = {
        text: "L{moreThan}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-more",
        weight: 320,
        disabled: me.disabled,
        onItem: () => filter(">")
      };
    }
  }
  populateCellMenuWithStringItems({ column, record, items }) {
    var _a, _b;
    const type = this.getFilterType(column);
    if (!/(date|number|duration)/.test(type)) {
      const me = this, value = column.getFilterableValue(record), operator = (_b = (_a = column.filterable.filterField) == null ? void 0 : _a.operator) != null ? _b : "*";
      items.filterStringEquals = {
        text: "L{equals}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-equal",
        cls: "b-separator",
        weight: 300,
        disabled: me.disabled,
        onItem: () => me.applyFilter(column, { value, operator })
      };
    }
  }
  /**
   * In non-legacy mode, gets the cell/header context menu items: a top-level Filter item having a submenu with
   * operator and edit/remove options). Not used by legacy mode.
   * @private
   */
  getMenuItems(column, record) {
    const me = this, submenuItems = {}, type = me.getFilterType(column);
    if (column.filterable === false) {
      return {};
    }
    if (allowedFilterTypes[type]) {
      const value = record ? column.getFilterableValue(record) : void 0, activeOperators = me.getCurrentMultiFilters(column).filter((filter) => !filter.disabled).map(({ operator }) => operator), maxArgCount = record ? 1 : void 0, allowedOperators = FieldFilterPicker.defaultOperators[type].filter(({ argCount, isArrayValued }) => !(argCount > maxArgCount || isArrayValued));
      let weight = 300;
      for (const { value: operator, text, argCount } of allowedOperators) {
        const key = `filter${StringHelper.capitalize(type)}${StringHelper.capitalize(operator)}`;
        submenuItems[key] = {
          text: StringHelper.capitalize(FieldFilterPicker.L(text)),
          weight: weight += 10,
          icon: activeOperators.includes(operator) ? "b-icon b-icon-check" : null,
          disabled: me.disabled,
          cls: menuItemsWithSeparators[key] ? "b-separator" : null,
          onItem: () => me.onOperatorMenuItem(column, value, operator, argCount)
        };
      }
    }
    if (column.meta.isFiltered) {
      Object.assign(submenuItems, me.getMenuItemsForFilteredColumn(column, record !== void 0));
    }
    return {
      filterMenu: {
        text: "L{filter}",
        localeClass: me,
        menu: submenuItems,
        icon: "b-fw-icon b-icon-filter",
        weight: record ? 400 : 100
      }
    };
  }
  /**
   * Handle clicking on an operator item in the filter submenu.
   * @param {Grid.column.Column} column The column to which the menu belongs
   * @param {*} value The cell value if this context menu belongs to a grid cell, undefined if header menu
   * @param {String} operator The selected operator, e.g. `'='`, `'isToday'`. See `CollectionFilter`.
   * @param {String} type The selected operator, e.g. `'='`, `'isToday'`. See `CollectionFilter`.
   * @param {Number} argCount The number of arguments required by the operator
   * @private
   */
  onOperatorMenuItem(column, value, operator, argCount = 1) {
    const me = this, type = me.getFilterType(column), wasActive = me.getCurrentMultiFilters(column).find((filter) => !filter.disabled && filter.operator === operator);
    if (wasActive) {
      me.removeFilter(column, operator);
    } else {
      if (argCount == 0 || value !== void 0) {
        me.applyFilter(column, {
          property: column.field,
          operator,
          type,
          value: argCount === 1 ? value : null,
          caseSensitive: false,
          disabled: value == null && argCount > 0
          // Can't apply filter yet; incomplete
        });
      } else {
        me.showFilterEditor(column, null, operator, true);
      }
    }
  }
  /**
   * Get the context menu items (cell and header) that apply when the column is already filtered, e.g. edit,
   * remove, disable. Used by both legacy and regular modes.
   * @param {Grid.column.Column} column The column to which the menu pertains
   * @param {Boolean} isCellMenu Whether this is a cell's context menu (not header)
   * @returns {Object<String,MenuItemConfig>} An `items` config containing the appropriate menu item configs
   * @private
   */
  getMenuItemsForFilteredColumn(column, isCellMenu) {
    const me = this, canRemoveFilter = !me.disabled && (me.legacyMode || me.columnHasRemovableFilters(column));
    return {
      // Don't show 'edit' in legacy mode cell menu (legacy mode header menu handled elsewhere)
      editFilter: me.legacyMode ? void 0 : {
        text: "L{editFilter}",
        localeClass: me,
        icon: "b-fw-icon b-icon-edit",
        cls: "b-separator",
        weight: 500,
        disabled: !canRemoveFilter,
        onItem: () => me.showFilterEditor(column)
      },
      [isCellMenu ? "filterRemove" : "removeFilter"]: {
        text: "L{removeFilter}",
        localeClass: me,
        icon: "b-fw-icon b-icon-remove",
        cls: "b-separator",
        weight: 510,
        disabled: !canRemoveFilter,
        onItem: () => me.removeFilter(column)
      },
      disableFilter: {
        text: "L{disableFilter}",
        localeClass: me,
        icon: "b-fw-icon b-icon-filter-disable",
        weight: 520,
        disabled: me.disabled || !me.columnHasEnabledFilters(column),
        onItem: () => me.disableFilter(column)
      }
    };
  }
  /**
   * Add menu items for filtering.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Core.data.Model} options.record Record for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateCellMenu({ column, record, items, ...rest }) {
    const me = this;
    if (column.filterable !== false && !record.isSpecialRow) {
      if (me.useLegacyModeForColumn(column)) {
        me.populateCellMenuWithDateItems({ column, record, items, ...rest });
        me.populateCellMenuWithNumberItems({ column, record, items, ...rest });
        me.populateCellMenuWithDurationItems({ column, record, items, ...rest });
        me.populateCellMenuWithStringItems({ column, record, items, ...rest });
        if (column.meta.isFiltered) {
          Object.assign(items, me.getMenuItemsForFilteredColumn(column, true));
        }
      } else {
        Object.assign(items, me.getMenuItems(column, record));
      }
    }
  }
  /**
   * Used to determine whether the 'remove filters' menu item should be enabled.
   * @internal
   */
  columnHasRemovableFilters(column) {
    const me = this;
    return Boolean(me.getCurrentMultiFilters(column).find((filter) => !me.canDeleteFilter || me.callback(me.canDeleteFilter, me, [filter]) !== false));
  }
  /**
   * Used to determine whether the 'disable filters' menu item should be enabled.
   * @internal
   */
  columnHasEnabledFilters(column) {
    return Boolean(this.getCurrentMultiFilters(column).find((filter) => !filter.disabled));
  }
  /**
   * Add menu item for removing filter if column is filtered.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this;
    if (me.useLegacyModeForColumn(column)) {
      if (column.meta.isFiltered) {
        items.editFilter = {
          text: "L{editFilter}",
          localeClass: me,
          weight: 100,
          icon: "b-fw-icon b-icon-filter",
          cls: "b-separator",
          disabled: me.disabled,
          onItem: () => me.showFilterEditor(column)
        };
        items.removeFilter = {
          text: "L{removeFilter}",
          localeClass: me,
          weight: 110,
          icon: "b-fw-icon b-icon-remove",
          disabled: me.disabled || !me.legacyMode && !me.columnHasRemovableFilters(column),
          onItem: () => me.removeFilter(column)
        };
        items.disableFilter = {
          text: "L{disableFilter}",
          localeClass: me,
          icon: "b-fw-icon b-icon-filter-disable",
          weight: 115,
          disabled: me.disabled || !me.columnHasEnabledFilters(column),
          onItem: () => me.disableFilter(column)
        };
      } else if (column.filterable !== false) {
        items.filter = {
          text: "L{filter}",
          localeClass: me,
          weight: 100,
          icon: "b-fw-icon b-icon-filter",
          cls: "b-separator",
          disabled: me.disabled,
          onItem: () => me.showFilterEditor(column)
        };
      }
    } else {
      Object.assign(items, me.getMenuItems(column));
    }
  }
  useLegacyModeForColumn(column) {
    var _a, _b, _c;
    return this.legacyMode || ((_c = (_a = column.filterable) == null ? void 0 : _a.filterFn) != null ? _c : (_b = column.filterable) == null ? void 0 : _b.filterField) != void 0;
  }
  //endregion
  //region Events
  // Intercept filtering by a column that has a custom filtering fn, and inject that fn
  onStoreBeforeFilter({ filters }) {
    var _a;
    const { columns } = this.client;
    for (let i = 0; i < filters.count; i++) {
      const filter = filters.getAt(i);
      if (!filter.internal) {
        const column = (filter.columnOwned || this.prioritizeColumns) && columns.find((col) => col.filterable !== false && col.field === filter.property);
        if ((_a = column == null ? void 0 : column.filterable) == null ? void 0 : _a.filterFn) {
          if (!column.$filter) {
            column.$filter = new CollectionFilter({
              columnOwned: true,
              property: filter.property,
              operator: filter.operator,
              value: filter.value,
              filterBy(record) {
                return column.filterable.filterFn({ value: this.value, record, operator: this.operator, property: this.property, column });
              }
            });
          }
          column.$filter.value = filter.value;
          column.$filter.displayValue = filter.displayValue;
          column.$filter.operator = filter.operator;
          filters.splice(i, 1, column.$filter);
        }
      }
    }
  }
  /**
   * Store filtered; refresh headers.
   * @private
   */
  onStoreFilter() {
    this.refreshHeaders(false);
  }
  /**
   * Called after headers are rendered, make headers match stores initial sorters
   * @private
   */
  renderHeader() {
    this.refreshHeaders(false);
  }
  /**
   * Called when user clicks on the grid. Only care about clicks on the filter icon.
   * @param {MouseEvent} event
   * @private
   */
  onElementClick({ target }) {
    if (this.filterEditorPopup) {
      this.closeFilterEditor();
    }
    if (target.classList.contains("b-filter-icon")) {
      const headerEl = target.closest(".b-grid-header");
      this.showFilterEditor(headerEl.dataset.columnId);
      return false;
    }
  }
  /**
   * Called when user presses F-key grid.
   * @param {MouseEvent} event
   * @private
   */
  showFilterEditorByKey({ target }) {
    const headerEl = target.matches(".b-grid-header") && target;
    if (headerEl) {
      this.showFilterEditor(headerEl.dataset.columnId);
    }
    return Boolean(headerEl);
  }
  // Only care about F key when a filterable header is focused
  isActionAvailable({ event, actionName }) {
    if (actionName === "showFilterEditorByKey") {
      const headerElement = event.target.closest(".b-grid-header"), column = headerElement && this.client.columns.find((col) => col.id === headerElement.dataset.columnId);
      return Boolean(column == null ? void 0 : column.filterable);
    }
  }
  //endregion
};
Filter._$name = "Filter";
GridFeatureManager.registerFeature(Filter);

// ../Grid/lib/Grid/feature/FilterBar.js
var complexOperators = {
  "*": null,
  isIncludedIn: null,
  startsWith: null,
  endsWidth: null
};
var FilterBar = class extends InstancePlugin {
  //region Config
  static get $name() {
    return "FilterBar";
  }
  static get configurable() {
    return {
      /**
       * Use custom filtering functions defined on columns also when programmatically filtering by the columns
       * field.
       *
       * ```javascript
       * const grid = new Grid({
       *     columns : [
       *         {
       *             field : 'age',
       *             text : 'Age',
       *             filterable({ record, value }) {
       *               // Custom filtering, return true/false
       *             }
       *         }
       *     ],
       *
       *     features : {
       *         filterBar : {
       *             prioritizeColumns : true // <--
       *         }
       *     }
       * });
       *
       * // Because of the prioritizeColumns config above, any custom
       * // filterable function on a column will be used when
       * // programmatically filtering by that columns field
       * grid.store.filter({
       *     property : 'age',
       *     value    : 30
       * });
       * ```
       *
       * @config {Boolean}
       * @default
       * @category Common
       */
      prioritizeColumns: false,
      /**
       * The delay in milliseconds to wait after the last keystroke before applying filters.
       * Set to 0 to not trigger filtering from keystrokes, requires pressing ENTER instead
       * @config {Number}
       * @default
       * @category Common
       */
      keyStrokeFilterDelay: 300,
      /**
       * Toggle compact mode. In this mode the filtering fields are styled to transparently overlay the headers,
       * occupying no additional space.
       * @member {Boolean} compactMode
       * @category Common
       */
      /**
       * Specify `true` to enable compact mode for the filter bar. In this mode the filtering fields are styled
       * to transparently overlay the headers, occupying no additional space.
       * @config {Boolean}
       * @default
       * @category Common
       */
      compactMode: false,
      /**
       * By default, column filter is removed when a column is hidden or this feature is disabled. Set this flag
       * to `false` to keep filters in these scenarios.
       * @member {Boolean}
       * @category Common
       * @default
       */
      clearStoreFiltersOnHide: true,
      /**
       * Determines `filterBar` visibility. By default it is set to `false` and to hide the `filterBar` set
       * this flag to `true`.
       * @prp {Boolean}
       * @category Common
       * @default
       */
      hidden: false,
      /**
       * Use to set initial filter.
       *
       * ```javascript
       * const grid = new Grid({
       *   features : {
       *     filterBar : { filter: { property : 'city', value : 'Gavle' } }
       *   }
       * });
       * ```
       *
       * @config {CollectionFilterConfig|Function}
       * @returns {Boolean}
       * @category Common
       */
      filter: null,
      keyMap: {
        // Private
        ArrowUp: { handler: "disableGridNavigation", preventDefault: false },
        ArrowRight: { handler: "disableGridNavigation", preventDefault: false },
        ArrowDown: { handler: "disableGridNavigation", preventDefault: false },
        ArrowLeft: { handler: "disableGridNavigation", preventDefault: false },
        Enter: { handler: "disableGridNavigation", preventDefault: false }
      }
    };
  }
  static get pluginConfig() {
    return {
      before: ["renderContents"],
      chain: ["afterColumnsChange", "renderHeader", "populateHeaderMenu", "bindStore"]
    };
  }
  static get properties() {
    return {
      filterFieldCls: "b-filter-bar-field",
      filterFieldInputCls: "b-filter-bar-field-input",
      filterableColumnCls: "b-filter-bar-enabled",
      filterFieldInputSelector: ".b-filter-bar-field-input",
      filterableColumnSelector: ".b-filter-bar-enabled",
      filterParseRegExp: /^\s*([<>=*])?(.*)$/,
      storeTrackingSuspended: 0
    };
  }
  //endregion
  //region Init
  construct(grid, config) {
    if (grid.features.filter) {
      throw new Error("Grid.feature.FilterBar feature may not be used together with Grid.feature.Filter, These features are mutually exclusive.");
    }
    const me = this;
    me.grid = grid;
    me.onColumnFilterFieldChange = me.onColumnFilterFieldChange.bind(me);
    super.construct(grid, Array.isArray(config) ? {
      filter: config
    } : config);
    me.bindStore(grid.store);
    if (me.filter) {
      grid.store.filter(me.filter);
    }
    me.gridDetacher = grid.ion({ beforeElementClick: "onBeforeElementClick", thisObj: me });
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      beforeFilter: "onStoreBeforeFilter",
      filter: "onStoreFilter",
      thisObj: this
    });
  }
  doDestroy() {
    var _a;
    this.destroyFilterBar();
    (_a = this.gridDetacher) == null ? void 0 : _a.call(this);
    super.doDestroy();
  }
  doDisable(disable) {
    const { columns } = this.grid;
    columns == null ? void 0 : columns.forEach((column) => {
      const widget = this.getColumnFilterField(column);
      if (widget) {
        widget.disabled = disable;
      }
    });
    super.doDisable(disable);
  }
  updateHidden(hidden) {
    if (!this.isConfiguring) {
      if (hidden) {
        this.hideFilterBar();
      } else {
        this.showFilterBar();
      }
    }
  }
  updateCompactMode(value) {
    this.client.headerContainer.classList[value ? "add" : "remove"]("b-filter-bar-compact");
    for (const prop in this._columnFilters) {
      const field = this._columnFilters[prop];
      field.placeholder = value ? field.column.headerText : null;
    }
  }
  //endregion
  //region FilterBar
  destroyFilterBar() {
    var _a;
    (_a = this.grid.columns) == null ? void 0 : _a.forEach(this.destroyColumnFilterField, this);
  }
  /**
   * Hides the filtering fields.
   */
  hideFilterBar() {
    var _a;
    const me = this;
    me.clearStoreFiltersOnHide && me.suspendStoreTracking();
    (_a = me.grid.columns) == null ? void 0 : _a.forEach((col) => me.hideColumnFilterField(col, true));
    me.grid.store.filter();
    me.clearStoreFiltersOnHide && me.resumeStoreTracking();
    me._hidden = true;
  }
  /**
   * Shows the filtering fields.
   */
  showFilterBar() {
    this.suspendStoreTracking();
    this.renderFilterBar(this.clearStoreFiltersOnHide);
    this.resumeStoreTracking();
    this._hidden = false;
  }
  /**
   * Toggles the filtering fields visibility.
   */
  toggleFilterBar() {
    if (this.hidden) {
      this.showFilterBar();
    } else {
      this.hideFilterBar();
    }
  }
  /**
   * Renders the filtering fields for filterable columns.
   * @private
   */
  renderFilterBar(applyFilter) {
    if (this.grid.hideHeaders) {
      return;
    }
    this.grid.columns.visibleColumns.forEach((column) => this.renderColumnFilterField(column, applyFilter));
    this.rendered = true;
  }
  //endregion
  //region FilterBar fields
  /**
   * Renders text field filter in the provided column header.
   * @param {Grid.column.Column} column Column to render text field filter for.
   * @private
   */
  renderColumnFilterField(column, applyFilters) {
    const me = this, { grid } = me, filterable = me.getColumnFilterable(column);
    if (filterable && column.isVisible) {
      const headerEl = column.element, filter = grid.store.filters.get(column.id) || grid.store.filters.getBy("property", column.field);
      let widget = me.getColumnFilterField(column);
      if (!widget) {
        const type = `${column.filterType || "text"}field`, { filterField } = filterable, externalCls = filterField == null ? void 0 : filterField.cls;
        if (externalCls) {
          delete filterable.filterField.cls;
        }
        widget = WidgetHelper.append(ObjectHelper.assign({
          type,
          cls: {
            [me.filterFieldCls]: 1,
            [externalCls]: externalCls
          },
          // Simplifies debugging / testing
          dataset: {
            column: column.field
          },
          column,
          owner: grid,
          clearable: true,
          name: column.field,
          value: filter && !filter._filterBy && !filter.internal ? me.buildFilterValue(filter) : "",
          inputCls: me.filterFieldInputCls,
          keyStrokeChangeDelay: me.keyStrokeFilterDelay,
          onChange: me.onColumnFilterFieldChange,
          onClear: me.onColumnFilterFieldChange,
          disabled: me.disabled,
          placeholder: me.compactMode ? column.headerText : null,
          // Also copy formats, DateColumn, TimeColumn etc
          format: column.format
        }, filterField), headerEl)[0];
        if (!(filterField == null ? void 0 : filterField.hasOwnProperty("min"))) {
          Object.defineProperty(widget, "min", {
            get: () => {
              var _a;
              return (_a = column.editor) == null ? void 0 : _a.min;
            },
            set: () => null
          });
        }
        if (!(filterField == null ? void 0 : filterField.hasOwnProperty("max"))) {
          Object.defineProperty(widget, "max", {
            get: () => {
              var _a;
              return (_a = column.editor) == null ? void 0 : _a.max;
            },
            set: () => null
          });
        }
        if (!(filterField == null ? void 0 : filterField.hasOwnProperty("strictParsing"))) {
          Object.defineProperty(widget, "strictParsing", {
            get: () => {
              var _a;
              return (_a = column.editor) == null ? void 0 : _a.strictParsing;
            },
            set: () => null
          });
        }
        widget.element.retainElement = true;
        me.setColumnFilterField(column, widget);
        const hasFilterFieldStoreData = (filterField == null ? void 0 : filterField.store) && (filterField.store.readUrl || filterField.store.data || filterField.store.isChained);
        if (widget.isCombo && !hasFilterFieldStoreData && widget.store.count === 0) {
          const configuredValue = widget.value, refreshData = () => {
            if (!(widget.store.readUrl || widget.store.isChained)) {
              widget.store.data = grid.store.getDistinctValues(column.field, true).map((value) => grid.store.modelClass.new({
                id: value,
                [column.field]: value
              }));
            }
          };
          widget.value = null;
          if (!widget.store.isSorted) {
            widget.store.sort({
              field: column.field,
              ascending: true
            });
          }
          widget.picker.ion({ beforeShow: refreshData });
          refreshData();
          widget.value = configuredValue;
        }
        if (!me.filter && widget.value && grid.store.autoLoad !== false) {
          me.onColumnFilterFieldChange({ source: widget, value: widget.value });
        }
      } else {
        if (applyFilters) {
          me.onColumnFilterFieldChange({ source: widget, value: widget.value });
        }
        widget.render(headerEl);
        widget.show();
      }
      headerEl.classList.add(me.filterableColumnCls);
    }
  }
  /**
   * Fills in column filter fields with values from the grid store filters.
   * @private
   */
  updateColumnFilterFields() {
    const me = this, { columns, store } = me.grid;
    let field, filter;
    me._updatingFields = true;
    for (const column of columns.visibleColumns) {
      field = me.getColumnFilterField(column);
      if (field && !column.$isApplyingFilter) {
        filter = store.filters.get(column.id) || store.filters.getBy("property", column.field);
        if (filter && !filter.internal) {
          if (!filter._filterBy) {
            field.value = me.buildFilterValue(filter);
          } else {
            field.value = filter.value;
          }
        } else {
          field.value = "";
        }
      }
    }
    me._updatingFields = false;
  }
  getColumnFilterable(column) {
    if (!column.isRoot && column.filterable !== false && column.field && column.isLeaf) {
      if (typeof column.filterable === "function") {
        column.filterable = {
          filterFn: column.filterable
        };
      }
      return column.filterable;
    }
  }
  destroyColumnFilterField(column) {
    const widget = this.getColumnFilterField(column);
    if (widget) {
      this.hideColumnFilterField(column, true);
      widget.destroy();
      this.setColumnFilterField(column, void 0);
    }
  }
  hideColumnFilterField(column, silent) {
    const me = this, { store } = me.grid, columnEl = column.element, widget = me.getColumnFilterField(column);
    if (widget) {
      if (!me.isDestroying) {
        widget.hide();
      }
      const { $filter } = column;
      if (!store.isDestroyed && me.clearStoreFiltersOnHide && $filter) {
        store.removeFilter($filter, silent);
      }
      columnEl == null ? void 0 : columnEl.classList.remove(me.filterableColumnCls);
    }
  }
  /**
   * Returns column filter field instance.
   * @param {Grid.column.Column} column Column to get filter field for.
   * @returns {Core.widget.Widget}
   */
  getColumnFilterField(column) {
    var _a;
    return (_a = this._columnFilters) == null ? void 0 : _a[column.id];
  }
  setColumnFilterField(column, widget) {
    this._columnFilters = this._columnFilters || {};
    this._columnFilters[column.data.id] = widget;
  }
  //endregion
  //region Filters
  parseFilterValue(column, value, field) {
    var _a;
    if (Array.isArray(value) || value instanceof Duration) {
      return {
        value
      };
    }
    if (ObjectHelper.isDate(value)) {
      return {
        operator: field.isDateField ? "sameDay" : field.isTimeField ? "sameTime" : "=",
        value
      };
    }
    const match = String(value).match(this.filterParseRegExp);
    return {
      operator: match[1] || ((_a = column.filterable) == null ? void 0 : _a.operator) || "*",
      value: match[2]
    };
  }
  buildFilterValue({ operator, value }) {
    return value instanceof Date || Array.isArray(value) || value instanceof Duration ? value : (operator in complexOperators ? "" : operator) + value;
  }
  //endregion
  // region Events
  // Intercept filtering by a column that has a custom filtering fn, and inject that fn
  onStoreBeforeFilter({ filters }) {
    var _a;
    const { columns } = this.client;
    for (let i = 0; i < filters.count; i++) {
      const filter = filters.getAt(i), column = (filter.columnOwned || this.prioritizeColumns) && columns.find((col) => col.filterable !== false && col.field === filter.property);
      if ((_a = column == null ? void 0 : column.filterable) == null ? void 0 : _a.filterFn) {
        if (!column.$filter) {
          column.$filter = new CollectionFilter({
            columnOwned: true,
            property: filter.property,
            id: column.id,
            filterBy(record) {
              return column.filterable.filterFn({
                value: this.value,
                record,
                property: this.property,
                column
              });
            }
          });
        }
        column.$filter.value = filter.value;
        filters.splice(i, 1, column.$filter);
      }
    }
  }
  /**
   * Fires when store gets filtered. Refreshes field values in column headers.
   * @private
   */
  onStoreFilter() {
    if (!this.storeTrackingSuspended && this.rendered) {
      this.updateColumnFilterFields();
    }
  }
  afterColumnsChange({ action, changes, column, columns }) {
    if (!this.hidden && (changes == null ? void 0 : changes.hidden)) {
      const hidden = changes.hidden.value;
      if (hidden) {
        this.destroyColumnFilterField(column);
      } else {
        this.renderColumnFilterField(column);
      }
    }
    if (action === "remove") {
      columns.forEach((col) => this.destroyColumnFilterField(col));
    }
  }
  suspendStoreTracking() {
    this.storeTrackingSuspended++;
  }
  resumeStoreTracking() {
    this.storeTrackingSuspended--;
  }
  /**
   * Called after headers are rendered, make headers match stores initial sorters
   * @private
   */
  renderHeader() {
    if (!this.hidden) {
      this.renderFilterBar();
    }
  }
  renderContents() {
    if (this._columnFilters) {
      for (const field of Object.values(this._columnFilters)) {
        field == null ? void 0 : field.element.remove();
      }
    }
  }
  disableGridNavigation(event) {
    return event.target.matches(this.filterFieldInputSelector);
  }
  onBeforeElementClick({ event }) {
    if (event.target.closest(`.${this.filterFieldCls}`)) {
      return false;
    }
  }
  /**
   * Called when a column text filter field value is changed by user.
   * @param  {Core.widget.TextField} field Filter text field.
   * @param  {String} value New filtering value.
   * @private
   */
  onColumnFilterFieldChange({ source: field, value }) {
    var _a, _b;
    const me = this, { column } = field, { filterFn } = column.filterable, { store } = me.grid, filter = column.$filter || store.filters.find((f) => (f.id === column.id || f.property === column.field) && !f.internal);
    if (me._updatingFields) {
      return;
    }
    const isClearingFilter = value == null || value === "" || Array.isArray(value) && value.length === 0;
    store.removeFilter(filter, true);
    column.$filter = null;
    column.$isApplyingFilter = true;
    if (isClearingFilter) {
      if (!filter) {
        column.$isApplyingFilter = false;
        return;
      }
    } else {
      column.$filter = store.addFilter({
        property: field.name,
        ...me.parseFilterValue(column, value, field),
        [typeof ((_a = column.filterable) == null ? void 0 : _a.caseSensitive) === "boolean" ? "caseSensitive" : void 0]: (_b = column.filterable) == null ? void 0 : _b.caseSensitive,
        // Only inject a filterBy configuration if the column has a custom filterBy
        [filterFn ? "filterBy" : "_"]: function(record) {
          return filterFn({ value: this.value, record, operator: this.operator, property: this.property, column });
        }
      }, true);
    }
    store.filter();
    column.$isApplyingFilter = false;
  }
  //endregion
  //region Menu items
  /**
   * Adds a menu item to toggle filter bar visibility.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ items }) {
    items.toggleFilterBar = {
      text: this.hidden ? "L{enableFilterBar}" : "L{disableFilterBar}",
      localeClass: this,
      weight: 120,
      icon: "b-fw-icon b-icon-filter",
      cls: "b-separator",
      onItem: () => this.toggleFilterBar()
    };
  }
  //endregion
};
FilterBar.featureClass = "b-filter-bar";
FilterBar._$name = "FilterBar";
GridFeatureManager.registerFeature(FilterBar);

// ../Grid/lib/Grid/feature/Group.js
var Group = class extends InstancePlugin {
  static get $name() {
    return "Group";
  }
  static get configurable() {
    return {
      /**
       * The name of the record field to group by.
       * @config {String}
       * @default
       */
      field: null,
      /**
       * A function used to sort the groups.
       * When grouping, the records have to be sorted so that records in a group stick together.
       * Technically that means that records having the same {@link #config-field} value
       * should go next to each other.
       * And this function (if provided) is responsible for applying such grouping order.
       * ```javascript
       * const grid = new Grid({
       *     features : {
       *         group : {
       *             // group by category
       *             field       : 'category',
       *             groupSortFn : (a, b) => {
       *                 const
       *                     aCategory = a.category || '',
       *                     bCategory = b.category || '';
       *
       *                 // 1st sort by "calegory" field
       *                 return aCategory > bCategory ? -1 :
       *                     aCategory < bCategory ? 1 :
       *                     // inside calegory groups we sort by "name" field
       *                     (a.name > b.name ? -1 : 1);
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * @config {Function}
       * @param {*} first The first value to compare
       * @param {*} second The second value to compare
       * @returns {Number}  Returns `1` if first value is greater than second value, `-1` if the opposite is true or `0` if they're equal
       */
      groupSortFn: null,
      /**
       * A function which produces the HTML for a group header.
       * The function is called in the context of this Group feature object.
       * Default group renderer displays the `groupRowFor` and `count`.
       *
       * @config {Function}
       * @param {Object} renderData Object containing renderer parameters
       * @param {*} renderData.groupRowFor The value of the `field` for the group. Type depends on `field` used for grouping
       * @param {Core.data.Model} renderData.record The group record representing the group
       * @param {Number} renderData.count Number of records in the group
       * @param {Grid.column.Column} renderData.column The column the renderer runs for
       * @param {Boolean} renderData.isFirstColumn True, if `column` is the first column. If `RowNumberColumn` is the real first column, it's not taken into account
       * @param {Grid.column.Column} renderData.groupColumn The column under which the `field` is shown
       * @param {Object} renderData.size Sizing information for the group header row, only `height` is relevant
       * @param {Number} renderData.size.height The height of the row, set this if you want a custom height for the group header row.
       *   That is UI part, so do not rely on its existence
       * @param {Grid.view.Grid} renderData.grid The owning grid
       * @param {HTMLElement} renderData.rowElement The owning row element
       * @returns {DomConfig|String|null}
       * @default
       *
       * @category Rendering
       */
      renderer: null,
      /**
       * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>}
       */
      keyMap: {
        " ": "toggleGroup"
      },
      /**
       * By default, clicking anywhere in a group row toggles its expanded/collapsed state.
       *
       * Configure this as `false` to limit this to only toggling on click of the expanded/collapsed
       * state icon.
       * @prp {Boolean}
       * @default
       */
      toggleOnRowClick: true
    };
  }
  //region Init
  construct(grid, config) {
    const me = this;
    if (grid.features.tree) {
      return;
    }
    me._thisIsAUsedExpression(grid.features.groupSummary);
    config = me.processConfig(config);
    me.grid = grid;
    super.construct(grid, config);
    me.bindStore(grid.store);
    grid.rowManager.ion({
      beforeRenderRow: "onBeforeRenderRow",
      renderCell: "renderCell",
      // The feature gets to see cells being rendered before the GroupSummary feature
      // because this injects header content into group header rows and adds rendering
      // info to the cells renderData which GroupSummary must comply with.
      prio: 1100,
      thisObj: me
    });
  }
  // Group feature handles special config cases, where user can supply a string or a group config object
  // instead of a normal config object
  processConfig(config) {
    if (typeof config === "string") {
      return {
        field: config,
        ascending: null
      };
    }
    return config;
  }
  // override setConfig to process config before applying it (used mainly from ReactGrid)
  setConfig(config) {
    if (config === null) {
      this.store.clearGroupers();
    } else {
      super.setConfig(this.processConfig(config));
    }
  }
  bindStore(store) {
    this.detachListeners("store");
    store.ion({
      name: "store",
      group: "onStoreGroup",
      change: "onStoreChange",
      toggleGroup: "onStoreToggleGroup",
      thisObj: this
    });
    this.onStoreGroup({ groupers: store.groupers });
  }
  updateRenderer(renderer) {
    this.groupRenderer = renderer;
  }
  updateField(field) {
    var _a;
    if (!this.isConfiguring || !((_a = this.store.groupers) == null ? void 0 : _a.some((g) => g.field === field))) {
      this.store.group({
        field,
        ascending: this.ascending,
        fn: this.groupSortFn
      });
    }
  }
  updateGroupSortFn(fn) {
    if (!this.isConfiguring) {
      this.store.group({
        field: this.field,
        ascending: this.ascending,
        fn
      });
    }
  }
  doDestroy() {
    super.doDestroy();
  }
  doDisable(disable) {
    const { store } = this;
    if (disable && store.isGrouped) {
      const { sorters } = store;
      sorters.unshift(...store.groupers);
      this.currentGroupers = store.groupers;
      store.clearGroupers();
      store.sort(sorters);
    } else if (!disable && this.currentGroupers) {
      store.group(this.currentGroupers[0]);
      this.currentGroupers = null;
    }
    super.doDisable(disable);
  }
  get store() {
    return this.grid.store;
  }
  //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      assign: ["collapseAll", "expandAll"],
      chain: [
        "renderHeader",
        "populateHeaderMenu",
        "getColumnDragToolbarItems",
        "onElementTouchStart",
        "onElementClick",
        "bindStore"
      ]
    };
  }
  //endregion
  //region Expand/collapse
  refreshGrid(groupRecord) {
    const { store, rowManager } = this.grid;
    if (rowManager.rowCount > store.count || !rowManager.getRowFor(groupRecord)) {
      rowManager.renderFromRow();
    } else {
      rowManager.renderFromRecord(groupRecord);
    }
  }
  /**
   * Collapses or expands a group depending on its current state
   * @param {Core.data.Model|String} recordOrId Record or records id for a group row to collapse or expand
   * @param {Boolean} collapse Force collapse (`true`) or expand (`false`)
   * @fires togglegroup
   */
  toggleCollapse(recordOrId, collapse) {
    this.internalToggleCollapse(recordOrId, collapse);
  }
  /**
   * Collapses or expands a group depending on its current state
   * @param {Core.data.Model|String} recordOrId Record or records id for a group row to collapse or expand
   * @param {Boolean} collapse Force collapse (true) or expand (true)
   * @param {Boolean} [skipRender] True to not render rows
   * @param {Event} [domEvent] The user interaction event (eg a `click` event) if the toggle request was
   * instigated by user interaction.
   * @internal
   * @fires togglegroup
   */
  internalToggleCollapse(recordOrId, collapse, skipRender = false, domEvent) {
    const me = this, { store, grid } = me, groupRecord = store.getById(recordOrId);
    if (!groupRecord.isGroupHeader) {
      return;
    }
    collapse = collapse === void 0 ? !groupRecord.meta.collapsed : collapse;
    if (grid.trigger("beforeToggleGroup", { groupRecord, collapse, domEvent }) === false) {
      return;
    }
    me.isToggling = true;
    if (collapse) {
      store.collapse(groupRecord);
    } else {
      store.expand(groupRecord);
    }
    me.isToggling = false;
    if (!skipRender) {
      me.refreshGrid(groupRecord);
    }
    grid.trigger("toggleGroup", { groupRecord, collapse });
    grid.afterToggleGroup();
  }
  /**
   * Collapse all groups. This function is exposed on Grid and can thus be called as `grid.collapseAll()`
   * @on-owner
   * @typings {Promise<void>}
   */
  collapseAll() {
    const me = this;
    if (me.store.isGrouped && !me.disabled) {
      me.store.groupRecords.forEach((r) => me.internalToggleCollapse(r, true, true));
      me.grid.refreshRows(true);
    }
  }
  /**
   * Expand all groups. This function is exposed on Grid and can thus be called as `grid.expandAll()`
   * @on-owner
   * @typings {Promise<void>}
   */
  expandAll() {
    const me = this;
    if (me.store.isGrouped && !me.disabled) {
      me.store.groupRecords.forEach((r) => me.internalToggleCollapse(r, false, true));
      me.grid.refreshRows();
    }
  }
  //endregion
  //region Rendering
  /**
   * Called before rendering row contents, used to reset rows no longer used as group rows
   * @private
   */
  onBeforeRenderRow({ row }) {
    const oldRecord = row.grid.store.getById(row.id);
    row.forceInnerHTML = row.forceInnerHTML || (oldRecord == null ? void 0 : oldRecord.isGroupHeader);
  }
  /**
   * Called when a cell is rendered, styles the group rows first cell.
   * @private
   */
  renderCell(renderData) {
    var _a;
    const me = this, {
      cellElement,
      row,
      column,
      grid
    } = renderData, { meta } = renderData.record, rowClasses = {
      "b-group-row": 0,
      "b-grid-group-collapsed": 0
    };
    if (!me.disabled && me.store.isGrouped && "groupRowFor" in meta) {
      if (column.type === "action") {
        return;
      }
      column.clearCell(cellElement);
      rowClasses["b-grid-group-collapsed"] = meta.collapsed;
      rowClasses["b-group-row"] = 1;
      if (grid.buildGroupHeader) {
        grid.buildGroupHeader(renderData);
      } else {
        me.buildGroupHeader(renderData);
      }
      if (column === me.groupHeaderColumn) {
        DomHelper.createElement({
          parent: cellElement,
          tag: "i",
          className: "b-group-state-icon",
          nextSibling: cellElement.firstChild
        });
        cellElement.classList.add("b-group-title");
        cellElement.$groupHeader = cellElement._hasHtml = true;
      }
    } else if (cellElement.$groupHeader) {
      (_a = cellElement.querySelector(".b-group-state-icon")) == null ? void 0 : _a.remove();
      cellElement.classList.remove("b-group-title");
      cellElement.$groupHeader = false;
    }
    row.assignCls(rowClasses);
  }
  // renderData.cellElement is required
  buildGroupHeader(renderData) {
    const me = this, {
      record,
      cellElement,
      column,
      persist
    } = renderData, { grid } = me, meta = record.meta, groupRowFor = meta.emptyArray ? grid.L("L{Object.None}") : meta.groupRowFor, { groupSummary } = grid.features, count = meta.childCount - (groupSummary && groupSummary.target !== "header" ? 1 : 0);
    let html = null, applyDefault = true;
    if (persist || column) {
      const groupColumn = grid.columns.get(meta.groupField), isGroupHeaderColumn = renderData.isFirstColumn = column === me.groupHeaderColumn;
      if (groupColumn == null ? void 0 : groupColumn.groupRenderer) {
        if (isGroupHeaderColumn) {
          html = groupColumn.groupRenderer({
            ...renderData,
            groupRowFor,
            groupRecords: record.groupChildren,
            groupColumn,
            count
          });
          applyDefault = false;
        }
      } else if (me.groupRenderer) {
        html = me.groupRenderer({
          ...renderData,
          groupRowFor,
          groupRecords: record.groupChildren,
          groupColumn,
          count,
          isFirstColumn: isGroupHeaderColumn
        });
      }
      if (isGroupHeaderColumn && html == null && applyDefault && DomHelper.getChildElementCount(cellElement) === 0) {
        html = StringHelper.encodeHtml(`${groupRowFor === "__novalue__" ? "" : groupRowFor} (${count})`);
      }
    } else if (me.groupRenderer) {
      html = me.groupRenderer(renderData);
    }
    if (typeof html === "string") {
      cellElement.innerHTML = html;
    } else if (typeof html === "object") {
      DomSync.sync({
        targetElement: cellElement,
        domConfig: {
          onlyChildren: true,
          children: ArrayHelper.asArray(html)
        }
      });
    }
    if (DomHelper.getChildElementCount(cellElement) > 0) {
      cellElement._hasHtml = true;
    }
    return cellElement.innerHTML;
  }
  get groupHeaderColumn() {
    return this.grid.columns.visibleColumns.find((column) => !column.groupHeaderReserved);
  }
  /**
   * Called when a header is rendered, adds grouping icon if grouped by that column.
   * @private
   * @param headerContainerElement
   */
  renderHeader(headerContainerElement = this.grid.headerContainer) {
    var _a;
    const { store, grid } = this;
    if (headerContainerElement && store.isGrouped) {
      for (const groupInfo of store.groupers) {
        const column = grid.columns.get(groupInfo.field), header = column && grid.getHeaderElement(column.id);
        header == null ? void 0 : header.classList.add("b-group", groupInfo.ascending ? "b-asc" : "b-desc");
        if (header && (!((_a = grid.features.sort) == null ? void 0 : _a.enabled) || column.sortable === false)) {
          const textEl = column.textWrapper;
          if (!(textEl == null ? void 0 : textEl.querySelector(".b-sort-icon"))) {
            DomHelper.createElement({
              parent: textEl,
              className: "b-sort-icon"
            });
          }
        }
      }
    }
  }
  //endregion
  //region Context menu
  /**
   * Supply items for headers context menu.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this;
    if (column.groupable !== false) {
      items.groupAsc = {
        text: "L{groupAscending}",
        localeClass: me,
        icon: "b-fw-icon b-icon-group-asc",
        cls: "b-separator",
        weight: 400,
        disabled: me.disabled,
        onItem: () => me.store.group(column.field, true)
      };
      items.groupDesc = {
        text: "L{groupDescending}",
        localeClass: me,
        icon: "b-fw-icon b-icon-group-desc",
        weight: 410,
        disabled: me.disabled,
        onItem: () => me.store.group(column.field, false)
      };
    }
    if (me.store.isGrouped) {
      items.groupRemove = {
        text: "L{stopGrouping}",
        localeClass: me,
        icon: "b-fw-icon b-icon-clear",
        cls: column.groupable ? "" : "b-separator",
        weight: 420,
        disabled: me.disabled,
        onItem: () => me.store.clearGroupers()
      };
    }
  }
  /**
   * Supply items to ColumnDragToolbar
   * @private
   */
  getColumnDragToolbarItems(column, items) {
    var _a;
    const me = this, { store, disabled } = me;
    items.push({
      text: "L{groupAscendingShort}",
      group: "L{group}",
      localeClass: me,
      icon: "b-icon b-icon-group-asc",
      ref: "groupAsc",
      cls: "b-separator",
      weight: 110,
      disabled,
      onDrop: ({ column: column2 }) => store.group(column2.field, true)
    });
    items.push({
      text: "L{groupDescendingShort}",
      group: "L{group}",
      localeClass: me,
      icon: "b-icon b-icon-group-desc",
      ref: "groupDesc",
      weight: 110,
      disabled,
      onDrop: ({ column: column2 }) => store.group(column2.field, false)
    });
    const grouped = ((_a = store.groupers) == null ? void 0 : _a.some((col) => col.field === column.field)) && !disabled;
    items.push({
      text: "L{stopGroupingShort}",
      group: "L{group}",
      localeClass: me,
      icon: "b-icon b-icon-clear",
      ref: "groupRemove",
      disabled: !grouped,
      weight: 110,
      onDrop: ({ column: column2 }) => store.removeGrouper(column2.field)
    });
    return items;
  }
  //endregion
  //region Events - Store
  /**
   * Called when store grouping changes. Reflects on header and rerenders rows.
   * @private
   */
  onStoreGroup({ groupers }) {
    const { grid } = this, { element } = grid, curGroupHeaders = element && DomHelper.children(element, ".b-grid-header.b-group");
    if (element) {
      for (const header of curGroupHeaders) {
        header.classList.remove("b-group", "b-asc", "b-desc");
      }
      if (groupers) {
        this.renderHeader();
      }
    }
  }
  onStoreChange({ action, records }) {
    const { client } = this, { rowManager, store } = client;
    if (store.isGrouped && action === "move") {
      const { field } = store.groupers[0], fromRow = Math.min(...records.reduce((result, record) => {
        result.push(store.indexOf(record.groupParent.get(store.id)));
        if (field in record.meta.modified) {
          const oldGroup = store.groupRecords.find((r) => r.meta.groupRowFor === record.meta.modified[field]);
          if (oldGroup) {
            result.push(store.indexOf(oldGroup));
          }
        }
        return result;
      }, []));
      rowManager.renderFromRow(rowManager.getRow(fromRow));
    }
  }
  // React to programmatic expand/collapse
  onStoreToggleGroup({ groupRecord }) {
    if (!this.isToggling) {
      this.refreshGrid(groupRecord);
    }
  }
  //endregion
  //region Events - Grid
  /**
   * Store touches when user touches header, used in onElementTouchEnd.
   * @private
   */
  onElementTouchStart(event) {
    const me = this, { target } = event, header = target.closest(".b-grid-header"), column = header && me.grid.getColumnFromElement(header);
    if (event.touches.length > 1 && column && column.groupable !== false && !me.disabled) {
      me.store.group(column.field);
    }
  }
  /**
   * React to click on headers (to group by that column if [alt] is pressed) and on group rows (expand/collapse).
   * @private
   * @param event
   * @returns {Boolean}
   */
  onElementClick(event) {
    var _a;
    const me = this, { store } = me, { target } = event, row = target.closest(".b-group-row"), header = target.closest(".b-grid-header"), field = header == null ? void 0 : header.dataset.column;
    if (target.classList.contains("b-resizer") || me.disabled || target.classList.contains("b-action-item") || event.handled) {
      return;
    }
    if (header && field) {
      const columnGrouper = (_a = store.groupers) == null ? void 0 : _a.find((g) => g.field === field);
      if (columnGrouper && !event.shiftKey) {
        columnGrouper.ascending = !columnGrouper.ascending;
        store.group();
        return false;
      } else if (event.shiftKey) {
        const column = me.grid.columns.get(field);
        if (column.groupable !== false) {
          if (event.altKey) {
            store.removeGrouper(field);
          } else {
            store.group(field);
          }
        }
      }
    }
    if (row && (me.toggleOnRowClick || event.target.classList.contains("b-group-state-icon"))) {
      me.internalToggleCollapse(DomDataStore.get(row).id, void 0, void 0, event);
      return false;
    }
  }
  /**
   * Toggle groups with [space].
   * @private
   * @param event
   */
  toggleGroup(event) {
    var _a;
    const { grid } = this, { focusedCell } = grid;
    if (!this.disabled && !focusedCell.isActionable && ((_a = focusedCell.record) == null ? void 0 : _a.isGroupHeader)) {
      this.internalToggleCollapse(focusedCell.id);
      return true;
    }
    return false;
  }
  //endregion
};
Group._$name = "Group";
GridFeatureManager.registerFeature(Group, true, ["Grid", "Scheduler"]);
GridFeatureManager.registerFeature(Group, false, ["TreeGrid"]);

// ../Grid/lib/Grid/feature/HeaderMenu.js
var HeaderMenu = class extends ContextMenuBase {
  //region Config
  static get $name() {
    return "HeaderMenu";
  }
  static get configurable() {
    return {
      type: "header",
      /**
       * This is a preconfigured set of items used to create the default context menu.
       *
       * The `items` provided by this feature are listed in the intro section of this class. You can
       * configure existing items by passing a configuration object to the keyed items.
       *
       * To remove existing items, set corresponding keys to `null`:
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         headerMenu : {
       *             items : {
       *                 filter        : null,
       *                 columnPicker  : null
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * See the feature config in the above example for details.
       *
       * @config {Object<String,MenuItemConfig|Boolean|null>} items
       */
      items: null,
      /**
       * Configure as `true` to show two extra menu options to move the selected column to either
       * before its previous sibling, or after its next sibling.
       *
       * This is a keyboard-accessible version of drag/drop column reordering.
       * @config {Boolean}
       * @category Accessibility
       */
      moveColumns: null
      /**
       * See {@link #keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>} keyMap
       */
    };
  }
  static get defaultConfig() {
    return {
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       *   features         : {
       *       headerMenu : {
       *           processItems({ column, items }) {
       *               // Add or hide existing items here as needed
       *               items.myAction = {
       *                   text   : 'Cool action',
       *                   icon   : 'b-fa b-fa-fw b-fa-ban',
       *                   onItem : () => console.log('Some coolness'),
       *                   weight : 300 // Move to end
       *               };
       *
       *               // Hide column picker
       *               items.columnPicker.hidden = true;
       *           }
       *       }
       *   },
       * ```
       *
       * @config {Function}
       * @param {Object} context An object with information about the menu being shown
       * @param {Grid.column.Column} context.column The current column
       * @param {Object<String,MenuItemConfig|Boolean>} context.items An object containing the
       *   {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @returns {Boolean|null} Returning `false` from this function prevents the menu being shown
       * @preventable
       */
      processItems: null
    };
  }
  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push("populateHeaderMenu");
    return config;
  }
  //endregion
  //region Events
  /**
   * This event fires on the owning Grid before the context menu is shown for a header.
   * Allows manipulation of the items to show in the same way as in the {@link #config-processItems}.
   *
   * Returning `false` from a listener prevents the menu from being shown.
   *
   * @event headerMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Column
   */
  /**
   * This event fires on the owning Grid after the context menu is shown for a header
   * @event headerMenuShow
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Object<String,MenuItemConfig>} items Menu item configs
   * @param {Grid.column.Column} column Column
   */
  /**
   * This event fires on the owning Grid when an item is selected in the header context menu.
   * @event headerMenuItem
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {Grid.column.Column} column Column
   */
  /**
   * This event fires on the owning Grid when a check item is toggled in the header context menu.
   * @event headerMenuToggleItem
   * @on-owner
   * @param {Grid.view.Grid} source The grid
   * @param {Core.widget.Menu} menu The menu
   * @param {Core.widget.MenuItem} item Selected menu item
   * @param {Grid.column.Column} column Column
   * @param {Boolean} checked Checked or not
   */
  //endregion
  //region Menu handlers
  shouldShowMenu(eventParams) {
    const { column } = eventParams;
    return column && column.enableHeaderContextMenu !== false && column !== this.client.timeAxisColumn;
  }
  getDataFromEvent(event) {
    return ObjectHelper.assign(super.getDataFromEvent(event), this.client.getHeaderDataFromEvent(event));
  }
  populateHeaderMenu({ items, column }) {
    const me = this;
    if (column) {
      if (column.headerMenuItems) {
        ObjectHelper.merge(items, column.headerMenuItems);
      }
      if (column.isCollapsible) {
        const { collapsed } = column, icon = collapsed ? me.client.rtl ? "left" : "right" : me.client.rtl ? "right" : "left";
        items.toggleCollapse = {
          weight: 215,
          icon: `b-fw-icon b-icon-collapse-${icon}`,
          text: me.L(collapsed ? "L{expandColumn}" : "L{collapseColumn}"),
          onItem: () => column.collapsed = !collapsed
        };
      }
      if (me.moveColumns) {
        const columnToMoveBefore = me.getColumnToMoveBefore(column), columnToMoveAfter = me.getColumnToMoveAfter(column);
        if (columnToMoveBefore) {
          items.movePrev = {
            weight: 220,
            icon: "b-fw-icon b-icon-column-move-left",
            text: me.L("L{moveBefore}", StringHelper.encodeHtml(columnToMoveBefore.text)),
            onItem: () => {
              var _a;
              const { parent: oldParent } = column;
              if (columnToMoveBefore.parent.insertChild(column, columnToMoveBefore)) {
                column.region = columnToMoveBefore.region;
                if (!((_a = oldParent.children) == null ? void 0 : _a.length)) {
                  oldParent.remove();
                }
              }
            }
          };
        }
        if (columnToMoveAfter) {
          items.moveNext = {
            weight: 230,
            icon: "b-fw-icon b-icon-column-move-right",
            text: me.L("L{moveAfter}", StringHelper.encodeHtml(columnToMoveAfter.text)),
            onItem: () => {
              var _a;
              const { parent: oldParent } = column;
              if (columnToMoveAfter.parent.insertChild(column, columnToMoveAfter.nextSibling)) {
                column.region = columnToMoveAfter.region;
                if (!((_a = oldParent.children) == null ? void 0 : _a.length)) {
                  oldParent.remove();
                }
              }
            }
          };
        }
      }
    }
    return items;
  }
  getColumnToMoveBefore(column) {
    const { previousSibling, parent } = column;
    if (previousSibling) {
      return previousSibling.children && !column.children ? previousSibling.children[previousSibling.children.length - 1] : previousSibling;
    }
    if (!parent.isRoot) {
      return parent;
    }
  }
  getColumnToMoveAfter(column) {
    const { nextSibling, parent } = column;
    if (nextSibling) {
      return nextSibling;
    }
    if (!parent.isRoot) {
      return parent;
    }
  }
};
HeaderMenu.featureClass = "";
HeaderMenu._$name = "HeaderMenu";
GridFeatureManager.registerFeature(HeaderMenu, true);

// ../Grid/lib/Grid/feature/RegionResize.js
var RegionResize = class extends InstancePlugin {
  static get pluginConfig() {
    return {
      chain: ["onElementPointerDown", "onElementDblClick", "onElementTouchMove", "onSubGridCollapse", "onSubGridExpand", "render"]
    };
  }
  //endregion
  updateShowSplitterButtons(value) {
    this.client.element.classList.toggle("b-hide-splitter-buttons", !value);
  }
  onElementDblClick(event) {
    const me = this, { client } = me, splitterEl = event.target.closest(".b-grid-splitter-collapsed");
    if (splitterEl && !me.expanding) {
      me.expanding = true;
      let region = splitterEl.dataset.region, subGrid = client.getSubGrid(region);
      if (!subGrid.collapsed) {
        region = client.getLastRegions()[1];
        subGrid = client.getSubGrid(region);
      }
      subGrid.expand().then(() => me.expanding = false);
    }
  }
  //region Move splitter
  /**
   * Begin moving splitter.
   * @private
   * @param splitterElement Splitter element
   * @param {Event} domEvent The initiating DOM event.
   */
  startMove(splitterElement, domEvent) {
    const me = this, { clientX } = domEvent, { client } = me, region = splitterElement.dataset.region, gridEl = client.element, nextRegion = client.regions[client.regions.indexOf(region) + 1], nextSubGrid = client.getSubGrid(nextRegion), splitterSubGrid = client.getSubGrid(region);
    let subGrid = splitterSubGrid, flip = 1;
    if (subGrid.flex != null) {
      if (nextSubGrid.flex == null) {
        subGrid = nextSubGrid;
        flip = -1;
      }
    }
    if (client.rtl) {
      flip *= -1;
    }
    if (splitterElement.classList.contains("b-grid-splitter-collapsed")) {
      return;
    }
    const availableWidth = Object.values(client.subGrids).reduce((sum, subGrid2) => {
      return subGrid2.width + sum;
    }, 0);
    client.trigger("splitterDragStart", { subGrid, domEvent });
    me.dragContext = {
      element: splitterElement,
      headerEl: subGrid.header.element,
      subGridEl: subGrid.element,
      subGrid,
      splitterSubGrid,
      originalWidth: subGrid.element.offsetWidth,
      originalX: clientX,
      minWidth: subGrid.minWidth || 0,
      maxWidth: Math.min(availableWidth, subGrid.maxWidth || availableWidth),
      flip
    };
    gridEl.classList.add("b-moving-splitter");
    splitterSubGrid.toggleSplitterCls("b-moving");
    me.pointerDetacher = EventHelper.on({
      element: document,
      pointermove: "onPointerMove",
      pointerup: "onPointerUp",
      thisObj: me
    });
  }
  /**
   * Stop moving splitter.
   * @param {Event} domEvent The initiating DOM event.
   * @private
   */
  endMove(domEvent) {
    const me = this, { dragContext, client } = me;
    if (dragContext) {
      const { subGrid } = dragContext;
      domEvent.preventDefault();
      me.pointerDetacher();
      client.element.classList.remove("b-moving-splitter");
      dragContext.splitterSubGrid.toggleSplitterCls("b-moving", false);
      me.dragContext = null;
      client.trigger("splitterDragEnd", { subGrid, domEvent });
    }
  }
  onCollapseClick(subGrid, splitterEl, domEvent) {
    const me = this, { client } = me, region = splitterEl.dataset.region, regions = client.getLastRegions();
    if (client.trigger("splitterCollapseClick", { subGrid, domEvent }) === false) {
      return;
    }
    if (regions[0] === region) {
      const lastSubGrid = client.getSubGrid(regions[1]);
      if (lastSubGrid.collapsed) {
        lastSubGrid.expand();
        return;
      }
    }
    subGrid.collapse();
  }
  onExpandClick(subGrid, splitterEl, domEvent) {
    const me = this, { client } = me, region = splitterEl.dataset.region, regions = client.getLastRegions();
    if (client.trigger("splitterExpandClick", { subGrid, domEvent }) === false) {
      return;
    }
    if (regions[0] === region) {
      if (!subGrid.collapsed) {
        const lastSubGrid = client.getSubGrid(regions[1]);
        lastSubGrid.collapse();
        return;
      }
    }
    subGrid.expand();
  }
  /**
   * Update splitter position.
   * @private
   * @param newClientX
   */
  updateMove(newClientX) {
    const { dragContext } = this;
    if (dragContext) {
      const diffX = newClientX - dragContext.originalX, newWidth = Math.max(Math.min(dragContext.maxWidth, dragContext.originalWidth + diffX * dragContext.flip), 0);
      dragContext.subGrid.width = Math.max(newWidth, dragContext.minWidth);
    }
  }
  //endregion
  //region Events
  /**
   * Start moving splitter on mouse down (on splitter).
   * @private
   * @param event
   */
  onElementPointerDown(event) {
    const me = this, { target } = event, splitter = event.button === 0 && target.closest(":not(.b-row-reordering):not(.b-dragging-event):not(.b-dragging-task):not(.b-dragging-header):not(.b-dragselecting) .b-grid-splitter"), subGrid = splitter && me.client.getSubGrid(splitter.dataset.region);
    let toggle;
    if (splitter) {
      if (target.closest(".b-grid-splitter-button-collapse")) {
        me.onCollapseClick(subGrid, splitter, event);
      } else if (target.closest(".b-grid-splitter-button-expand")) {
        me.onExpandClick(subGrid, splitter, event);
      } else if (me.enableDragging) {
        me.startMove(splitter, event);
        toggle = splitter;
      }
    }
    if (event.pointerType === "touch") {
      me.toggleTouchSplitter(toggle);
    }
  }
  /**
   * Move splitter on mouse move.
   * @private
   * @param event
   */
  onPointerMove(event) {
    if (this.dragContext) {
      this.updateMove(event.clientX);
      event.preventDefault();
    }
  }
  onElementTouchMove(event) {
    if (this.dragContext) {
      event.preventDefault();
    }
  }
  /**
   * Stop moving splitter on mouse up.
   * @private
   * @param event
   */
  onPointerUp(event) {
    if (this.enableDragging) {
      this.endMove(event);
    }
  }
  onSubGridCollapse({ subGrid }) {
    const splitterEl = this.client.resolveSplitter(subGrid), regions = this.client.getLastRegions();
    if (regions[1] === subGrid.region) {
      splitterEl.classList.add("b-grid-splitter-allow-collapse");
    }
  }
  onSubGridExpand({ subGrid }) {
    const splitterEl = this.client.resolveSplitter(subGrid);
    splitterEl.classList.remove("b-grid-splitter-allow-collapse");
  }
  //endregion
  /**
   * Adds b-touching CSS class to splitterElements when touched. Removes when touched outside.
   * @private
   * @param splitterElement
   */
  toggleTouchSplitter(splitterElement) {
    const me = this, { touchedSplitter } = me;
    if (splitterElement && touchedSplitter && splitterElement.dataset.region !== touchedSplitter.dataset.region) {
      me.toggleTouchSplitter();
    }
    const splitterSubGrid = me.client.getSubGrid(splitterElement ? splitterElement.dataset.region : touchedSplitter == null ? void 0 : touchedSplitter.dataset.region);
    if (splitterSubGrid) {
      splitterSubGrid.toggleSplitterCls("b-touching", Boolean(splitterElement));
      if (splitterElement) {
        splitterSubGrid.startSplitterButtonSyncing();
      } else {
        splitterSubGrid.stopSplitterButtonSyncing();
      }
    }
    me.touchedSplitter = splitterElement;
  }
  render() {
    const { regions, subGrids } = this.client;
    if (regions.length > 2) {
      subGrids[regions[0]].splitterElement.classList.add("b-left-only");
      subGrids[regions[1]].splitterElement.classList.add("b-right-only");
    }
  }
  updateEnableDragging(value) {
    this.client.element.classList.toggle("b-grid-splitter-no-drag", !value);
  }
};
// region Init
__publicField(RegionResize, "$name", "RegionResize");
__publicField(RegionResize, "configurable", {
  /**
   * Set to `false` to hide splitter's collapse/expand buttons
   * @prp {Boolean}
   * @default
   */
  showSplitterButtons: true,
  /**
   * This flag prevents dragging if set to `false` but the collapse / expand buttons will still be functional.
   * @prp {Boolean}
   * @default
   */
  enableDragging: true
});
RegionResize.featureClass = "b-split";
RegionResize._$name = "RegionResize";
GridFeatureManager.registerFeature(RegionResize);

// ../Grid/lib/Grid/feature/Sort.js
var emptyArray = Object.freeze([]);
var Sort = class extends InstancePlugin {
  static get properties() {
    return {
      ignoreRe: new RegExp([
        // Stop this feature from having to know the internals of two other optional features.
        "b-grid-header-resize-handle",
        "b-filter-icon"
      ].join("|")),
      sortableCls: "b-sortable",
      sortedCls: "b-sort",
      sortedAscCls: "b-asc",
      sortedDescCls: "b-desc"
    };
  }
  //endregion
  //region Init
  construct(grid, config) {
    config = this.processConfig(config);
    this.grid = grid;
    this.bindStore(this.store);
    super.construct(grid, config);
  }
  // Sort feature handles special config cases, where user can supply a string or an array of sorters
  // instead of a normal config object
  processConfig(config) {
    if (typeof config === "string" || Array.isArray(config)) {
      return {
        field: config,
        ascending: null
      };
    }
    return config;
  }
  // override setConfig to process config before applying it
  setConfig(config) {
    super.setConfig(this.processConfig(config));
  }
  bindStore(store) {
    var _a;
    this.detachListeners("store");
    store.ion({
      name: "store",
      beforeSort: "onStoreBeforeSort",
      sort: "syncHeaderSortState",
      thisObj: this
    });
    if ((_a = this.client) == null ? void 0 : _a.isPainted) {
      this.syncHeaderSortState();
    }
  }
  set field(field) {
    var _a;
    const column = this.grid.columns.get(field);
    if (column && typeof column.sortable === "object") {
      column.sortable.field = column.sortable.property || field;
      field = column.sortable;
    }
    if (!((_a = this.store.sorters) == null ? void 0 : _a.some((g) => g.field === field))) {
      this.store.sort(field, this.ascending);
    }
  }
  // Avoid caching store, it might change
  get store() {
    return this.grid[this.grid.sortFeatureStore];
  }
  //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.
  static get pluginConfig() {
    return {
      chain: ["onElementClick", "populateHeaderMenu", "getColumnDragToolbarItems", "renderHeader", "onInternalPaint", "bindStore"]
    };
  }
  //endregion
  //region Headers
  /**
   * Update headers to match stores sorters (displays sort icon in correct direction on them)
   * @private
   */
  syncHeaderSortState() {
    var _a;
    const me = this, { grid } = me;
    if (!grid.hideHeaders && grid.isPainted) {
      const storeSorters = me.store.sorters.concat(me.store.groupers || emptyArray), sorterCount = storeSorters.length, classList = new DomClassList();
      let sorter;
      for (const leafColumn of grid.columns.visibleColumns) {
        if (!leafColumn.sortable) {
          continue;
        }
        const leafHeader = leafColumn.element, textEl = leafColumn.textWrapper, dataset = textEl == null ? void 0 : textEl.dataset;
        let sortDirection = "none";
        (dataset == null ? void 0 : dataset.sortIndex) && delete dataset.sortIndex;
        classList.value = leafHeader.classList;
        if (leafColumn.sortable === false) {
          classList.remove(me.sortableCls);
          (_a = textEl == null ? void 0 : textEl.querySelector(".b-sort-icon")) == null ? void 0 : _a.remove();
        } else {
          if (!(textEl == null ? void 0 : textEl.querySelector(".b-sort-icon"))) {
            DomHelper.createElement({
              parent: textEl,
              className: "b-sort-icon"
            });
          }
          classList.add(me.sortableCls);
          sorter = storeSorters.find(
            (sort) => sort.field === leafColumn.field || sort.sortFn && sort.sortFn === leafColumn.sortable.sortFn
          );
          if (sorter) {
            if (sorterCount > 1 && dataset) {
              dataset.sortIndex = storeSorters.indexOf(sorter) + 1;
            }
            classList.add(me.sortedCls);
            if (sorter.ascending) {
              classList.add(me.sortedAscCls);
              classList.remove(me.sortedDescCls);
              sortDirection = "ascending";
            } else {
              classList.add(me.sortedDescCls);
              classList.remove(me.sortedAscCls);
              sortDirection = "descending";
            }
          } else {
            classList.remove(me.sortedCls);
            if (!classList["b-group"]) {
              classList.remove(me.sortedAscCls);
              classList.remove(me.sortedDescCls);
            }
          }
        }
        DomHelper.syncClassList(leafHeader, classList);
        DomHelper.setAttributes(leafHeader, {
          "aria-sort": sortDirection
        });
      }
    }
  }
  //endregion
  //region Context menu
  /**
   * Adds sort menu items to header context menu.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this, { store } = me, sortBy = { ...column.sortable, field: column.field, columnOwned: true };
    if (column.sortable !== false) {
      items.sortAsc = {
        text: "L{sortAscending}",
        localeClass: me,
        icon: "b-fw-icon b-icon-sort-asc",
        cls: "b-separator",
        weight: 300,
        disabled: me.disabled,
        onItem: () => store.sort(sortBy, true)
      };
      items.sortDesc = {
        text: "L{sortDescending}",
        localeClass: me,
        icon: "b-fw-icon b-icon-sort-desc",
        weight: 310,
        disabled: me.disabled,
        onItem: () => store.sort(sortBy, false)
      };
      if (me.multiSort && me.grid.columns.records.some((col) => col.sortable)) {
        const sorter = store.sorters.find((s) => s.field === column.field || column.sortable.sortFn && column.sortable.sortFn === s.sortFn);
        items.multiSort = {
          text: "L{multiSort}",
          localeClass: me,
          icon: "b-fw-icon b-icon-sort",
          weight: 320,
          disabled: me.disabled,
          menu: {
            addSortAsc: {
              text: sorter ? "L{toggleSortAscending}" : "L{addSortAscending}",
              localeClass: me,
              icon: "b-fw-icon b-icon-sort-asc",
              disabled: sorter && (sorter == null ? void 0 : sorter.ascending),
              weight: 330,
              onItem: () => store.addSorter(sortBy, true)
            },
            addSortDesc: {
              text: sorter ? "L{toggleSortDescending}" : "L{addSortDescending}",
              localeClass: me,
              icon: "b-fw-icon b-icon-sort-desc",
              disabled: sorter && !sorter.ascending,
              weight: 340,
              onItem: () => store.addSorter(sortBy, false)
            },
            removeSorter: {
              text: "L{removeSorter}",
              localeClass: me,
              icon: "b-fw-icon b-icon-remove",
              weight: 350,
              disabled: !sorter,
              onItem: () => {
                store.removeSorter(sortBy.field);
              }
            }
          }
        };
      }
    }
  }
  /**
   * Supply items to ColumnDragToolbar
   * @private
   */
  getColumnDragToolbarItems(column, items) {
    const me = this, { store, disabled } = me;
    if (column.sortable !== false) {
      const sorter = store.sorters.find((s) => s.field === column.field);
      items.push(
        {
          text: "L{sortAscendingShort}",
          group: "L{sort}",
          localeClass: me,
          icon: "b-icon b-icon-sort-asc",
          ref: "sortAsc",
          cls: "b-separator",
          weight: 105,
          disabled,
          onDrop: ({ column: column2 }) => store.sort(column2.field, true)
        },
        {
          text: "L{sortDescendingShort}",
          group: "L{sort}",
          localeClass: me,
          icon: "b-icon b-icon-sort-desc",
          ref: "sortDesc",
          weight: 105,
          disabled,
          onDrop: ({ column: column2 }) => store.sort(column2.field, false)
        },
        {
          text: "L{addSortAscendingShort}",
          group: "L{multiSort}",
          localeClass: me,
          icon: "b-icon b-icon-sort-asc",
          ref: "multisortAddAsc",
          disabled: disabled || sorter && sorter.ascending,
          weight: 105,
          onDrop: ({ column: column2 }) => store.addSorter(column2.field, true)
        },
        {
          text: "L{addSortDescendingShort}",
          group: "L{multiSort}",
          localeClass: me,
          icon: "b-icon b-icon-sort-desc",
          ref: "multisortAddDesc",
          disabled: disabled || sorter && !sorter.ascending,
          weight: 105,
          onDrop: ({ column: column2 }) => store.addSorter(column2.field, false)
        },
        {
          text: "L{removeSorterShort}",
          group: "L{multiSort}",
          localeClass: me,
          icon: "b-icon b-icon-remove",
          ref: "multisortRemove",
          weight: 105,
          disabled: disabled || !sorter,
          onDrop: ({ column: column2 }) => store.removeSorter(column2.field)
        }
      );
    }
    return items;
  }
  //endregion
  //region Events
  // Intercept sorting by a column that has a custom sorting fn, and inject that fn
  onStoreBeforeSort({ sorters }) {
    var _a;
    const { columns } = this.client;
    for (let i = 0; i < sorters.length; i++) {
      const sorter = sorters[i], column = (sorter.columnOwned || this.prioritizeColumns) && columns.get(sorter.field);
      if ((_a = column == null ? void 0 : column.sortable) == null ? void 0 : _a.sortFn) {
        sorters[i] = { ...sorter, ...column.sortable, columnOwned: true };
      }
    }
  }
  /**
   * Clicked on header, sort Store.
   * @private
   */
  onElementClick(event) {
    const me = this, { store } = me, { target } = event, header = target.closest(".b-grid-header.b-sortable"), field = header == null ? void 0 : header.dataset.column;
    if (me.ignoreRe.test(target.className) || me.disabled || event.handled) {
      return;
    }
    if (header && field && (me.toggleOnHeaderClick || target.closest(".b-sort-icon"))) {
      const column = me.grid.columns.getById(header.dataset.columnId), columnGrouper = store.isGrouped && store.groupers.find((g) => g.field === field);
      if (columnGrouper && !event.shiftKey) {
        return;
      }
      if (column.sortable && !event.shiftKey) {
        if (event.ctrlKey && event.altKey) {
          store.removeSorter(column.field);
        } else {
          const sortBy = {
            columnOwned: true,
            field: column.field
          };
          if (typeof column.sortable === "object") {
            ObjectHelper.assign(sortBy, column.sortable);
          }
          store.sort(sortBy, null, event.ctrlKey && me.multiSort);
        }
      }
    }
  }
  /**
   * Called when grid headers are rendered, make headers match current sorters.
   * @private
   */
  renderHeader() {
    this.syncHeaderSortState();
  }
  onInternalPaint() {
    this.syncHeaderSortState();
  }
  //endregion
};
//region Config
__publicField(Sort, "$name", "Sort");
__publicField(Sort, "configurable", {
  /**
   * Enable multi sort
   * @config {Boolean}
   * @default
   */
  multiSort: true,
  /**
   * Use custom sorting functions defined on columns also when programmatically sorting by the columns field.
   *
   * ```javascript
   * const grid = new Grid({
   *     columns : [
   *         {
   *             field : 'age',
   *             text : 'Age',
   *             sortable(lhs, rhs) {
   *               // Custom sorting, see Array#sort
   *             }
   *         }
   *     ],
   *
   *     features : {
   *         sort : {
   *             prioritizeColumns : true
   *         }
   *     }
   * });
   *
   * grid.store.sort('age');
   * ```
   *
   * @config {Boolean}
   * @default
   */
  prioritizeColumns: false,
  /**
   * By default, clicking anywhere on the header text toggles the sorting state of a column.
   *
   * Configure this as `false` to only toggle the sorting state of a column on click of the
   * "arrow" icon within the grid header.
   * @config {Boolean}
   * @default false
   */
  toggleOnHeaderClick: true
});
Sort.featureClass = "b-sort";
Sort._$name = "Sort";
GridFeatureManager.registerFeature(Sort, true);

// ../Grid/lib/Grid/feature/Stripe.js
var Stripe = class extends InstancePlugin {
  static get $name() {
    return "Stripe";
  }
  construct(grid, config) {
    super.construct(grid, config);
    grid.ion({
      renderrow: "onRenderRow",
      thisObj: this
    });
  }
  doDisable(disable) {
    if (!this.isConfiguring) {
      this.client.refreshRows();
    }
    super.doDisable(disable);
  }
  /**
   * Applies even/odd CSS when row is rendered
   * @param {Grid.row.Row} rowModel
   * @private
   */
  onRenderRow({ row }) {
    const { disabled } = this, even = row.dataIndex % 2 === 0;
    row.assignCls({
      "b-even": !disabled && even,
      "b-odd": !disabled && !even
    });
  }
};
Stripe._$name = "Stripe";
GridFeatureManager.registerFeature(Stripe);

// ../Grid/lib/Grid/row/Row.js
var cellContentRange = document.createRange();
var Row = class extends Base {
  static get configurable() {
    return {
      /**
       * When __read__, this a {@link Core.helper.util.DomClassList} of class names to be
       * applied to this Row's elements.
       *
       * It can be __set__ using Object notation where each property name with a truthy value is added as
       * a class, or as a regular space-separated string.
       *
       * @member {Core.helper.util.DomClassList} cls
       * @accepts {Core.helper.util.DomClassList|Object<String,Boolean|Number>}
       */
      /**
       * The class name to initially add to all row elements
       * @config {String|Core.helper.util.DomClassList|Object<String,Boolean|Number>}
       */
      cls: {
        $config: {
          equal: (c1, c2) => (c1 == null ? void 0 : c1.isDomClassList) && (c2 == null ? void 0 : c2.isDomClassList) && c1.isEqual(c2)
        }
      }
    };
  }
  //region Init
  /**
   * Constructs a Row setting its index.
   * @param {Object} config A configuration object which must contain the following two properties:
   * @param {Grid.view.Grid} config.grid The owning Grid.
   * @param {Grid.row.RowManager} config.rowManager The owning RowManager.
   * @param {Number} config.index The index of the row within the RowManager's cache.
   * @function constructor
   * @internal
   */
  construct(config) {
    Object.assign(this, {
      _elements: {},
      _elementsArray: [],
      _cells: {},
      _allCells: [],
      _regions: [],
      lastHeight: 0,
      lastTop: -1,
      _dataIndex: 0,
      _top: 0,
      _height: 0,
      _id: null,
      forceInnerHTML: false,
      isGroupFooter: false,
      // Create our cell rendering context
      cellContext: new Location({
        grid: config.grid,
        id: null,
        columnIndex: 0
      })
    });
    super.construct(config);
    if (this.grid.positionMode === "position") {
      this.translateElements = this.positionElements;
    }
  }
  doDestroy() {
    const me = this;
    if (!me.rowManager.isDestroying) {
      me.removeElements();
      if (me.rowManager.idMap[me.id] === me) {
        delete me.rowManager.idMap[me.id];
      }
    }
    super.doDestroy();
  }
  //endregion
  //region Data getters/setters
  /**
   * Get index in RowManagers rows array
   * @property {Number}
   * @readonly
   */
  get index() {
    return this._index;
  }
  set index(index) {
    this._index = index;
  }
  /**
   * Get/set this rows current index in grids store
   * @property {Number}
   */
  get dataIndex() {
    return this._dataIndex;
  }
  set dataIndex(dataIndex) {
    if (this._dataIndex !== dataIndex) {
      this._dataIndex = dataIndex;
      this.eachElement((element) => {
        element.dataset.index = dataIndex;
        element.ariaRowIndex = this.grid.hideHeaders ? dataIndex + 1 : dataIndex + 2;
      });
    }
  }
  /**
   * Get/set id for currently rendered record
   * @property {String|Number}
   */
  get id() {
    return this._id;
  }
  set id(id) {
    const me = this, idObj = { id }, idMap = me.rowManager.idMap;
    if (me._id !== id || idMap[id] !== me) {
      if (idMap[me._id] === me)
        delete idMap[me._id];
      idMap[id] = me;
      me._id = id;
      me.eachElement((element) => {
        DomDataStore.assign(element, idObj);
        element.dataset.id = id;
      });
      me.eachCell((cell) => DomDataStore.assign(cell, idObj));
    }
  }
  //endregion
  //region Row elements
  /**
   * Add a row element for specified region.
   * @param {String} region Region to add element for
   * @param {HTMLElement} element Element
   * @private
   */
  addElement(region, element) {
    const me = this;
    let cellElement = element.firstElementChild;
    me._elements[region] = element;
    me._elementsArray.push(element);
    me._regions.push(region);
    DomDataStore.assign(element, { index: me.index });
    me._cells[region] = [];
    while (cellElement) {
      me._cells[region].push(cellElement);
      me._allCells.push(cellElement);
      DomDataStore.set(cellElement, {
        column: cellElement.dataset.column,
        columnId: cellElement.dataset.columnId,
        rowElement: cellElement.parentNode,
        row: me
      });
      cellElement = cellElement.nextElementSibling;
    }
    element.dataset.index = me.index;
    element.ariaRowIndex = me.grid.hideHeaders ? me.index + 1 : me.index + 2;
    if (me.top !== null) {
      me.translateElements(true);
    }
  }
  /**
   * Get the element for the specified region.
   * @param {String} region
   * @returns {HTMLElement}
   */
  getElement(region) {
    return this._elements[region];
  }
  /**
   * Get the {@link Core.helper.util.Rectangle element bounds} for the specified region of this Row.
   * @param {String} region
   * @returns {Core.helper.util.Rectangle}
   */
  getRectangle(region) {
    return Rectangle.from(this.getElement(region));
  }
  /**
   * Execute supplied function for each regions element.
   * @param {Function} fn
   */
  eachElement(fn) {
    this._elementsArray.forEach(fn);
  }
  /**
   * Execute supplied function for each cell.
   * @param {Function} fn
   */
  eachCell(fn) {
    this._allCells.forEach(fn);
  }
  /**
   * An object, keyed by region name (for example `locked` and `normal`) containing the elements which comprise the full row.
   * @type {Object<String,HTMLElement>}
   * @readonly
   */
  get elements() {
    return this._elements;
  }
  /**
   * The row element, only applicable when not using multiple grid sections (see {@link #property-elements})
   * @type {HTMLElement}
   * @readonly
   */
  get element() {
    const region = Object.keys(this._elements)[0];
    return this._elements[region];
  }
  //endregion
  //region Cell elements
  /**
   * Row cell elements
   * @property {HTMLElement[]}
   * @readonly
   */
  get cells() {
    return this._allCells;
  }
  /**
   * Get cell elements for specified region.
   * @param {String} region Region to get elements for
   * @returns {HTMLElement[]} Array of cell elements
   */
  getCells(region) {
    return this._cells[region];
  }
  /**
   * Get the cell element for the specified column.
   * @param {String|Number} columnId Column id
   * @returns {HTMLElement} Cell element
   */
  getCell(columnId, strict = false) {
    return this._allCells.find((cell) => {
      const cellData = DomDataStore.get(cell);
      return cellData.columnId == columnId || !strict && cellData.column == columnId;
    });
  }
  removeElements(onlyRelease = false) {
    const me = this;
    me.rowManager.trigger("removeRow", { row: me });
    if (!onlyRelease) {
      me.eachElement((element) => element.remove());
    }
    me._elements = {};
    me._cells = {};
    me._elementsArray.length = me._regions.length = me._allCells.length = me.lastHeight = me.height = 0;
    me.lastTop = -1;
  }
  //endregion
  //region Height
  /**
   * Get/set row height
   * @property {Number}
   */
  get height() {
    return this._height;
  }
  set height(height) {
    this._height = height;
  }
  /**
   * Get row height including border
   * @property {Number}
   */
  get offsetHeight() {
    return this.height + this.grid._rowBorderHeight;
  }
  /**
   * Sync elements height to rows height
   * @private
   */
  updateElementsHeight(isExport) {
    const me = this;
    if (!isExport) {
      me.rowManager.storeKnownHeight(me.id, me.height);
    }
    if (me.lastHeight !== me.height) {
      this.eachElement((element) => element.style.height = `${me.offsetHeight}px`);
      me.lastHeight = me.height;
    }
  }
  //endregion
  //region CSS
  /**
   * Add CSS classes to each element.
   * @param {...String|Object<String,Boolean|Number>|Core.helper.util.DomClassList} classes
   */
  addCls(classes) {
    this.updateCls(this.cls.add(classes));
  }
  /**
   * Remove CSS classes from each element.
   * @param {...String|Object<String,Boolean|Number>|Core.helper.util.DomClassList} classes
   */
  removeCls(classes) {
    this.updateCls(this.cls.remove(classes));
  }
  /**
   * Toggle CSS classes for each element.
   * @param {Object<String,Boolean|Number>|Core.helper.util.DomClassList|...String} classes
   * @param {Boolean} add
   * @internal
   */
  toggleCls(classes, add) {
    this.updateCls(this.cls[add ? "add" : "remove"](classes));
  }
  /**
   * Adds/removes class names according to the passed object's properties.
   *
   * Properties with truthy values are added.
   * Properties with false values are removed.
   * @param {Object<String,Boolean|Number>} classes Object containing properties to set/clear
   */
  assignCls(classes) {
    this.updateCls(this.cls.assign(classes));
  }
  changeCls(cls) {
    return (cls == null ? void 0 : cls.isDomClassList) ? cls : new DomClassList(cls);
  }
  updateCls(cls) {
    this.eachElement((element) => DomHelper.syncClassList(element, cls));
  }
  setAttribute(attribute, value) {
    this.eachElement((element) => element.setAttribute(attribute, value));
  }
  removeAttribute(attribute) {
    this.eachElement((element) => element.removeAttribute(attribute));
  }
  //endregion
  //region Position
  /**
   * Is this the very first row?
   * @property {Boolean}
   * @readonly
   */
  get isFirst() {
    return this.dataIndex === 0;
  }
  /**
   * Row top coordinate
   * @property {Number}
   * @readonly
   */
  get top() {
    return this._top;
  }
  /**
   * Row bottom coordinate
   * @property {Number}
   * @readonly
   */
  get bottom() {
    return this._top + this._height + this.grid._rowBorderHeight;
  }
  /**
   * Sets top coordinate, translating elements position.
   * @param {Number} top Top coordinate
   * @param {Boolean} [silent] Specify `true` to not trigger translation event
   * @internal
   */
  setTop(top, silent) {
    if (this._top !== top) {
      this._top = top;
      this.translateElements(silent);
    }
  }
  /**
   * Sets bottom coordinate, translating elements position.
   * @param {Number} bottom Bottom coordinate
   * @param {Boolean} [silent] Specify `true` to not trigger translation event
   * @private
   */
  setBottom(bottom, silent) {
    this.setTop(bottom - this.offsetHeight, silent);
  }
  // Used by export feature to position individual row
  translate(top, silent = false) {
    this.setTop(top, silent);
    return top + this.offsetHeight;
  }
  /**
   * Sets css transform to position elements at correct top position (translateY)
   * @private
   */
  translateElements(silent) {
    const me = this, { top, _elementsArray } = me;
    if (me.lastTop !== top) {
      for (let i = 0, { length } = _elementsArray; i < length; i++) {
        _elementsArray[i].style.transform = `translate(0,${top}px)`;
      }
      !silent && me.rowManager.trigger("translateRow", { row: me });
      me.lastTop = top;
    }
  }
  /**
   * Sets css top to position elements at correct top position
   * @private
   */
  positionElements(silent) {
    const me = this, { top, _elementsArray } = me;
    if (me.lastTop !== top) {
      for (let i = 0, { length } = _elementsArray; i < length; i++) {
        _elementsArray[i].style.top = `${top}px`;
      }
      !silent && me.rowManager.trigger("translateRow", { row: me });
      me.lastTop = top;
    }
  }
  /**
   * Moves all row elements up or down and updates model.
   * @param {Number} offsetTop Pixels to offset the elements
   * @private
   */
  offset(offsetTop) {
    let newTop = this._top + offsetTop;
    if (newTop < 0) {
      offsetTop -= newTop;
      newTop = 0;
    }
    this.setTop(newTop);
    return offsetTop;
  }
  //endregion
  //region Render
  /**
   * Renders a record into this rows elements (trigger event that subgrids catch to do the actual rendering).
   * @param {Number} recordIndex
   * @param {Core.data.Model} record
   * @param {Boolean} [updatingSingleRow]
   * @param {Boolean} [batch]
   * @private
   */
  render(recordIndex, record, updatingSingleRow = true, batch = false, isExport = false) {
    var _a, _b, _c;
    const me = this, {
      cellContext,
      cls,
      elements,
      grid,
      rowManager,
      height: oldHeight,
      _id: oldId
    } = me, rowElData = DomDataStore.get(me._elementsArray[0]), rowHeight = rowManager._rowHeight, { store } = grid, { isTree } = store;
    let i = 0, size;
    if (!record && record !== false) {
      record = grid.store.getById(rowElData.id);
      recordIndex = grid.store.indexOf(record);
    }
    if (!record) {
      return;
    }
    const rCls = record == null ? void 0 : record.cls, recordCls = rCls ? rCls.isDomClassList ? rCls : new DomClassList(rCls) : null;
    cls.assign({
      // do not put updating class if we're exporting the row
      "b-grid-row-updating": updatingSingleRow && grid.transitionDuration && !isExport,
      "b-selected": grid.isSelected(record == null ? void 0 : record.id),
      "b-readonly": record.readOnly,
      "b-linked": record.isLinked,
      "b-original": record.hasLinks
    });
    if (me.lastRecordCls) {
      cls.remove(me.lastRecordCls);
    }
    if (recordCls) {
      cls.add(recordCls);
      me.lastRecordCls = Object.assign({}, recordCls);
    } else {
      me.lastRecordCls = null;
    }
    rowManager.trigger("beforeRenderRow", { row: me, record, recordIndex, oldId });
    grid.beforeRenderRow({ row: me, record, recordIndex, oldId, cls });
    me.updateCls(cls);
    if (updatingSingleRow && grid.transitionDuration && !isExport) {
      grid.setTimeout(() => {
        if (!me.isDestroyed) {
          cls.remove("b-grid-row-updating");
          me.updateCls(cls);
        }
      }, grid.transitionDuration + 50);
    }
    me.id = record.id;
    me.dataIndex = recordIndex;
    const height = !grid.fixedRowHeight && grid.getRowHeight(record) || rowHeight;
    let maxRequestedHeight = me.maxRequestedHeight = null;
    if (isTree) {
      for (const region in elements) {
        const el = elements[region];
        el.id = `${grid.id}-${region}-${me.id}`;
        DomHelper.setAttributes(el, {
          "aria-level": record.childLevel + 1,
          "aria-setsize": record.parent.children.length,
          "aria-posinset": record.parentIndex + 1
        });
        if (record.isExpanded(store)) {
          DomHelper.setAttributes(el, {
            "aria-expanded": true,
            // A branch node may be configured expanded, but yet have no children.
            // They may be added dynamically.
            "aria-owns": ((_a = record.children) == null ? void 0 : _a.length) ? (_b = record.children) == null ? void 0 : _b.map((r) => `${grid.id}-${region}-${r.id}`).join(" ") : null
          });
        } else {
          if (record.isLeaf) {
            el.removeAttribute("aria-expanded");
          } else {
            el.setAttribute("aria-expanded", false);
          }
          el.removeAttribute("aria-owns");
        }
      }
    }
    cellContext._record = record;
    cellContext._id = record.id;
    cellContext._rowIndex = recordIndex;
    for (i = 0; i < grid.columns.visibleColumns.length; i++) {
      const column = grid.columns.visibleColumns[i];
      cellContext._columnId = column.id;
      cellContext._column = column;
      cellContext._columnIndex = i;
      cellContext._cell = me.getCell(column.id, true);
      cellContext.height = height;
      cellContext.maxRequestedHeight = maxRequestedHeight;
      cellContext.updatingSingleRow = updatingSingleRow;
      size = me.renderCell(cellContext);
      if (!rowManager.fixedRowHeight) {
        if (size.height != null) {
          maxRequestedHeight = Math.max(maxRequestedHeight, size.height);
          if (!size.transient) {
            me.maxRequestedHeight = maxRequestedHeight;
          }
        }
      }
    }
    const useHeight = maxRequestedHeight != null ? maxRequestedHeight : height;
    me.height = (_c = grid.processRowHeight(record, useHeight)) != null ? _c : useHeight;
    me.updateElementsHeight(isExport);
    if (updatingSingleRow && !isExport) {
      if (oldHeight !== me.height) {
        rowManager.translateFromRow(me, batch);
      }
      rowManager.trigger("updateRow", { row: me, record, recordIndex, oldId });
      rowManager.trigger("renderDone");
    }
    grid.afterRenderRow({ row: me, record, recordIndex, oldId, oldHeight, isExport });
    rowManager.trigger("renderRow", { row: me, record, recordIndex, oldId, isExport });
    if (oldHeight && me.height !== oldHeight) {
      rowManager.trigger("rowRowHeight", { row: me, record, height: me.height, oldHeight });
    }
    me.forceInnerHTML = false;
  }
  /**
   * Renders a single cell, calling features to allow them to hook
   * @param {Grid.util.Location|HTMLElement} cellContext A {@link Grid.util.Location} which contains rendering
   * options, or a cell element which can be used to initialize a {@link Grid.util.Location}
   * @param {Number} [cellContext.height] Configured row height
   * @param {Number} [cellContext.maxRequestedHeight] Maximum proposed row height from renderers
   * @param {Boolean} [cellContext.updatingSingleRow] Rendered as part of updating a single row
   * @param {Boolean} [cellContext.isMeasuring] Rendered as part of a measuring operation
   * @internal
   */
  renderCell(cellContext) {
    var _a, _b, _c, _d;
    if (!cellContext.isLocation) {
      cellContext = new Location(cellContext);
    }
    let {
      cell: cellElement,
      record
    } = cellContext;
    const me = this, {
      grid,
      column,
      height,
      maxRequestedHeight,
      updatingSingleRow = true,
      isMeasuring = false
    } = cellContext, cellEdit = (_a = grid.features) == null ? void 0 : _a.cellEdit, cellElementData = DomDataStore.get(cellElement), rowElement = cellElementData.rowElement, rowElementData = DomDataStore.get(rowElement);
    if (!record) {
      record = cellContext._record = grid.store.getById(rowElementData.id);
      if (!record) {
        return;
      }
    }
    let cellContent = column.getRawValue(record);
    const dataField = record.fieldMap[column.field], size = { configuredHeight: height, height: null, maxRequestedHeight }, cellCls = column.getCellClass(cellContext), rendererData = {
      cellElement,
      dataField,
      rowElement,
      value: cellContent,
      record,
      column,
      size,
      grid,
      row: cellElementData.row,
      updatingSingleRow,
      isMeasuring
    }, useRenderer = column.renderer || column.defaultRenderer;
    grid.beforeRenderCell(rendererData);
    if (rendererData.cellElement !== cellElement) {
      cellElement = rendererData.cellElement;
    }
    DomHelper.syncClassList(cellElement, cellCls);
    let shouldSetContent = true;
    if (useRenderer) {
      cellContent = column.callback(useRenderer, column, [rendererData]);
      if (cellContent === void 0) {
        if (record.generatedParent && column.rendererReturningContent) {
          cellContent = "";
        } else if (column.alwaysClearCell === false) {
          shouldSetContent = false;
        }
      }
    } else if (dataField) {
      cellContent = dataField.print(cellContent);
    }
    const hasFrameworkRenderer = (_b = grid.hasFrameworkRenderer) == null ? void 0 : _b.call(grid, { cellContent, column });
    if (hasFrameworkRenderer && record.isSpecialRow) {
      cellContent = "";
    }
    const frameworkPerformsFullRendering = hasFrameworkRenderer && !column.data.tree && !record.isSpecialRow;
    if (shouldSetContent && !frameworkPerformsFullRendering) {
      let renderTarget = cellElement;
      if (((_c = cellEdit == null ? void 0 : cellEdit.editorContext) == null ? void 0 : _c.equals(cellContext)) && !cellEdit.editor.isFinishing) {
        renderTarget = me.moveContentFromCell(cellElement, cellEdit.editor.element);
      }
      const hasObjectContent = cellContent != null && typeof cellContent === "object", hasStringContent = typeof cellContent === "string", text = hasObjectContent || cellContent == null ? "" : String(cellContent);
      if (me.forceInnerHTML) {
        renderTarget.innerHTML = "";
        delete renderTarget._content;
        cellElement.lastDomConfig = null;
      }
      if (!hasObjectContent && column.htmlEncode && !column.disableHtmlEncode) {
        if (cellElement._hasHtml) {
          renderTarget.innerText = text;
          cellElement._hasHtml = false;
        } else {
          DomHelper.setInnerText(renderTarget, text);
        }
      } else {
        if (column.autoSyncHtml && (!hasStringContent || DomHelper.getChildElementCount(renderTarget))) {
          if (hasStringContent) {
            DomHelper.sync(text, renderTarget.firstElementChild);
          } else if (hasObjectContent) {
            DomSync.sync({
              domConfig: cellContent,
              targetElement: renderTarget
            });
          }
        } else if (hasObjectContent) {
          DomSync.sync({
            targetElement: renderTarget,
            domConfig: {
              onlyChildren: true,
              children: ArrayHelper.asArray(cellContent)
            }
          });
        } else if (renderTarget._content !== text) {
          renderTarget.innerHTML = renderTarget._content = text;
        }
      }
      if (renderTarget !== cellElement) {
        const { firstChild } = cellElement;
        for (const node of renderTarget.childNodes) {
          cellElement.insertBefore(node, firstChild);
        }
      }
    }
    if (!record.isSpecialRow) {
      (_d = grid.processCellContent) == null ? void 0 : _d.call(grid, {
        cellElementData,
        rendererData,
        // In case of TreeColumn we should prerender inner cell content like expand controls, bullets, etc
        // Then the framework renders the content into the nested "b-tree-cell-value" element.
        // rendererHtml is set in TreeColumn.treeRenderer
        rendererHtml: rendererData.rendererHtml || cellContent
      });
    }
    if (column.autoHeight && size.height == null) {
      cellElement.classList.add("b-measuring-auto-height");
      size.height = Math.max(cellElement.offsetHeight, grid.rowHeight);
      cellElement.classList.remove("b-measuring-auto-height");
    }
    if (!isMeasuring) {
      me.rowManager.trigger("renderCell", rendererData);
    }
    return size;
  }
  //#region Hooks for salesforce
  moveContentFromCell(cellElement, editorElement) {
    cellContentRange.setStart(cellElement, 0);
    cellContentRange.setEndBefore(editorElement);
    const renderTarget = document.createElement("div");
    renderTarget.appendChild(cellContentRange.extractContents());
    return renderTarget;
  }
  //#endregion
  //endregion
};
__publicField(Row, "$name", "Row");
Row.initClass();
Row._$name = "Row";

// ../Grid/lib/Grid/view/Bar.js
var Bar = class extends Widget {
  static get $name() {
    return "Bar";
  }
  // Factoryable type name
  static get type() {
    return "gridbar";
  }
  static get defaultConfig() {
    return {
      htmlCls: "",
      scrollable: {
        overflowX: "hidden-scroll"
      }
    };
  }
  //region Init
  get columns() {
    return this._columns || this.subGrid.columns;
  }
  // Only needed for tests which create standalone Headers with no owning SubGrid.
  set columns(columns) {
    this._columns = columns;
  }
  //endregion
  /**
   * Fix cell widths (flex or fixed width) after rendering.
   * Not a part of template any longer because of CSP
   * @private
   */
  fixCellWidths() {
    const me = this, { hasFlex } = me.columns;
    let flexBasis;
    me.columns.traverse((column) => {
      const cellEl = me.getBarCellElement(column.id), domWidth = DomHelper.setLength(column.width), domMinWidth = DomHelper.setLength(column.minWidth), domMaxWidth = DomHelper.setLength(column.maxWidth);
      if (cellEl) {
        flexBasis = domWidth;
        cellEl.style.maxWidth = domMaxWidth;
        if (column.isParent && column.width == null && column.flex == null) {
          const flex = column.children.reduce((result, child) => result += !child.hidden && child.flex || 0, 0);
          cellEl.style.flex = flex > 0 ? `${flex} 0 auto` : "";
          cellEl.style.minWidth = null;
          if (flex > 0) {
            column.traverse((col) => col.data.minWidth = null);
          }
        } else {
          if (parseInt(column.minWidth) >= 0) {
            cellEl.style.minWidth = domMinWidth;
          }
          cellEl.style.flex = cellEl.style.flexBasis = cellEl.style.width = "";
          if (column.flex) {
            if (!isNaN(parseInt(column.flex)) && column.children) {
              cellEl.style.flex = `${column.flex} 0 auto`;
            } else {
              cellEl.style.flex = column.flex;
            }
          } else if (parseInt(column.width) >= 0) {
            const parent = column.parent;
            if (me.isHeader && !parent.isRoot && !parent.width) {
              cellEl.style.width = domWidth;
            } else {
              cellEl.style.flexBasis = flexBasis;
            }
          }
        }
        if (column.height >= 0) {
          cellEl.style.height = DomHelper.setLength(column.height);
        }
      }
    });
    me.scrollable.element.classList.toggle("b-has-flex", hasFlex);
  }
  getLrPadding(cellEl) {
    if (!this.cellLrPadding) {
      const s = cellEl.ownerDocument.defaultView.getComputedStyle(cellEl);
      this.cellLrPadding = parseInt(s.getPropertyValue("padding-left")) + parseInt(s.getPropertyValue("padding-right")) + parseInt(s.getPropertyValue("border-left-width")) + parseInt(s.getPropertyValue("border-right-width"));
    }
    return this.cellLrPadding;
  }
  /**
   * Get the header or footer cell element for the specified column.
   * @param {String} columnId Column id
   * @returns {HTMLElement} Header or footer element, depending on which subclass is in use.
   * @private
   */
  getBarCellElement(columnId) {
    return this.element.querySelector(`[data-column-id="${columnId}"]`);
  }
};
Bar.initClass();
Bar._$name = "Bar";

// ../Grid/lib/Grid/view/Footer.js
var Footer = class extends Bar {
  static get $name() {
    return "Footer";
  }
  // Factoryable type name
  static get type() {
    return "gridfooter";
  }
  get subGrid() {
    return this._subGrid;
  }
  set subGrid(subGrid) {
    this._subGrid = this.owner = subGrid;
  }
  refreshContent() {
    this.element.firstElementChild.innerHTML = this.contentTemplate();
    this.fixFooterWidths();
  }
  onInternalPaint({ firstPaint }) {
    if (firstPaint) {
      this.refreshContent();
    }
  }
  template() {
    const region = this.subGrid.region;
    return TemplateHelper.tpl`
            <div class="b-grid-footer-scroller b-grid-footer-scroller-${region}" role="presentation">
                <div data-reference="footersElement" class="b-grid-footers b-grid-footers-${region}" data-region="${region}" role="presentation"></div>
            </div>
        `;
  }
  get overflowElement() {
    return this.footersElement;
  }
  //region Getters
  /**
   * Get the footer cell element for the specified column.
   * @param {String} columnId Column id
   * @returns {HTMLElement} Footer cell element
   */
  getFooter(columnId) {
    return this.getBarCellElement(columnId);
  }
  //endregion
  /**
   * Footer template. Iterates leaf columns to create content.
   * Style not included because of CSP. Widths are fixed up in
   * {@link #function-fixFooterWidths}
   * @private
   */
  contentTemplate() {
    const me = this;
    return me.columns.visibleColumns.map((column) => {
      return TemplateHelper.tpl`
                <div
                    class="b-grid-footer ${column.align ? `b-grid-footer-align-${column.align}` : ""} ${column.cls || ""}"
                    data-column="${column.field || ""}" data-column-id="${column.id}" data-all-index="${column.allIndex}"
                    role="presentation">
                    ${column.footerText || ""}
                </div>`;
    }).join("");
  }
  /**
   * Fix footer widths (flex or fixed width) after rendering. Not a part of template any longer because of CSP
   * @private
   */
  fixFooterWidths() {
    this.fixCellWidths();
  }
};
Footer.initClass();
Footer._$name = "Footer";

// ../Grid/lib/Grid/row/RowManager.js
var cloneRowEl = (el) => {
  const p = el.parentElement, result = el.cloneNode(true);
  result.classList.add("b-removing");
  p.insertBefore(result, el);
  return result;
};
var RowManager = class extends InstancePlugin {
  //region Config
  // Plugin configuration.
  static get pluginConfig() {
    return {
      chain: [
        "destroy"
      ],
      assign: [
        "topRow",
        "bottomRow",
        "firstVisibleRow",
        "lastVisibleRow",
        "firstFullyVisibleRow",
        "lastFullyVisibleRow",
        "getRowById",
        "getRecordCoords",
        "getRow",
        "getRowFor",
        "getRowFromElement"
      ]
    };
  }
  static get defaultConfig() {
    return {
      rowClass: Row,
      /**
       * Number of rows to render above current viewport
       * @config {Number}
       * @default
       */
      prependRowBuffer: 5,
      /**
       * Number of rows to render below current viewport
       * @config {Number}
       * @default
       */
      appendRowBuffer: 5,
      /**
       * Default row height, assigned from Grid at construction (either from config
       * {@link Grid.view.Grid#config-rowHeight} or CSS). Can be set from renderers
       * @config {Number}
       * @default
       */
      rowHeight: null,
      /**
       * Set to `true` to get a small performance boost in applications that uses fixed row height
       * @config {Boolean}
       */
      fixedRowHeight: null,
      autoHeight: false
    };
  }
  static get properties() {
    return {
      idMap: {},
      topIndex: 0,
      lastScrollTop: 0,
      _rows: [],
      // Record id -> row height mapping
      heightMap: /* @__PURE__ */ new Map(),
      // Sum of entries in heightMap
      totalKnownHeight: 0,
      // Will be calculated in `estimateTotalHeight()`, as totalKnownHeight + an estimate for unknown rows
      _totalHeight: 0,
      // Average of the known heights, kept up to date when entries in the heightMap are updated
      averageRowHeight: 0,
      scrollTargetRecordId: null,
      refreshDetails: {
        topRowIndex: 0,
        topRowTop: 0
      }
    };
  }
  //endregion
  //region Init
  construct(config) {
    config.grid._rowManager = this;
    super.construct(config.grid, config);
  }
  // Chained to grids doDestroy
  doDestroy() {
    this._rows.forEach((row) => row.destroy());
    super.doDestroy();
  }
  /**
   * Initializes the RowManager with Rows to fit specified height.
   * @param {Number} height
   * @param {Boolean} [isRendering]
   * @private
   * @category Init
   */
  initWithHeight(height, isRendering = false) {
    const me = this;
    if (me.autoHeight) {
      height = me.store.allCount * me.preciseRowOffsetHeight;
    }
    me.viewHeight = height;
    me.calculateRowCount(isRendering);
    return height;
  }
  /**
   * Releases all elements (not from dom), calculates how many are needed, creates those and renders
   */
  reinitialize(returnToTop = false) {
    const me = this;
    me.calculateRowCount(false, true, true);
    if (me.topIndex + me.rowCount - 1 > me.store.count) {
      returnToTop = true;
    }
    if (returnToTop) {
      me.topIndex = me.lastScrollTop = 0;
    }
    me.scrollTargetRecordId = null;
    const { topRow } = me;
    if (topRow) {
      topRow.dataIndex = me.topIndex;
      topRow.setTop(me.calculateTop(me.topIndex), true);
    }
    me.estimateTotalHeight();
    me.renderFromRow(topRow);
  }
  //endregion
  //region Rows
  /**
   * Add or remove rows to fit row count
   * @private
   * @category Rows
   */
  matchRowCount(skipRender = false) {
    var _a, _b;
    const me = this, { rows, grid, rowClass } = me, numRows = rows.length, delta = numRows - me.rowCount;
    if (delta) {
      if (delta < 0) {
        const newRows = [];
        for (let index = numRows, dataIndex = numRows ? rows[numRows - 1].dataIndex + 1 : 0; index < me.rowCount; index++, dataIndex++) {
          newRows.push(rowClass.new({
            cls: grid.rowCls,
            rowManager: me,
            grid,
            index,
            dataIndex
          }));
        }
        rows.push.apply(rows, newRows);
        me.trigger("addRows", { rows: newRows });
        if (!skipRender) {
          me.renderFromRow(rows[Math.max(0, numRows - 1)]);
        }
      } else {
        const { focusedCell } = grid, rowActive = (focusedCell == null ? void 0 : focusedCell.id) != null && ((_a = focusedCell == null ? void 0 : focusedCell.cell) == null ? void 0 : _a.contains(DomHelper.getActiveElement(grid))), removedRows = rows.splice(numRows - delta, delta);
        if (rowActive) {
          if (delta === numRows) {
            grid.onFocusedRowDerender();
          } else if (((_b = me.getRowFor(focusedCell._record)) == null ? void 0 : _b.index) >= rows.length) {
            rows[rows.length - 1].cells[focusedCell.columnIndex].focus();
          }
        }
        me.trigger("removeRows", { rows: removedRows });
        removedRows.forEach((row) => row.destroy());
      }
    }
  }
  /**
   * Calculates how many rows fit in the available height (view height)
   * @private
   * @category Rows
   */
  calculateRowCount(skipMatchRowCount = false, allowRowCountShrink = true, skipRender = false) {
    var _a, _b;
    const me = this, { store } = me, visibleRowCount = Math.ceil(me.viewHeight / me.minRowOffsetHeight), maxRenderRowCount = visibleRowCount + me.prependRowBuffer + me.appendRowBuffer;
    if (!((_a = me.grid.columns) == null ? void 0 : _a.count) || isNaN(visibleRowCount)) {
      me.rowCount = 0;
      return 0;
    }
    if (maxRenderRowCount < me.rowCount && !allowRowCountShrink) {
      return me.rowCount;
    }
    me.visibleRowCount = visibleRowCount;
    me.rowCount = Math.min(store.count, maxRenderRowCount);
    if (!skipMatchRowCount) {
      if (me.rows && me.rowCount !== me.rows.length) {
        me.matchRowCount(skipRender);
        if (((_b = me.bottomRow) == null ? void 0 : _b.dataIndex) >= store.count && me.topRow.dataIndex !== 0) {
          const indexDelta = me.bottomRow.dataIndex - store.count + 1;
          for (const row of me.rows) {
            row.dataIndex -= indexDelta;
          }
          me.topIndex -= indexDelta;
        }
      } else if (!me.rowCount) {
        me.trigger("changeTotalHeight", { totalHeight: me.totalHeight });
      }
      me.grid.toggleEmptyText();
    }
    return me.rowCount;
  }
  /**
   * Animate adding or removing rows to/from the rows array.
   * @internal
   * @param {Number} index The index at which to insert or remove
   * @param {Number} count The number of rows to add. May be negative to remove.
   */
  insert(index, count) {
    var _a, _b, _c;
    const me = this, {
      rows,
      rowCount,
      rowClass,
      grid,
      rowHeight
    } = me, {
      rowCls
    } = grid, newRowDataIndex = ((_a = rows[index - 1]) == null ? void 0 : _a.dataIndex) + 1 || 0, removingLast = index >= grid.store.count, addedRows = [], durationMS = DateHelper.as("ms", DomHelper.getStyleValue(grid.element, "--row-splice-duration")), visibleRowsBelow = me.lastVisibleRow.index + 1 - index;
    if (count < 0) {
      count = Math.abs(count);
      const visualRemoveCount = Math.min(count, visibleRowsBelow), visuallyRemovedRows = rows.slice(index, index + visualRemoveCount), visuallyRemovedHeight = visualRemoveCount ? visuallyRemovedRows[visuallyRemovedRows.length - 1].bottom - visuallyRemovedRows[0].top : 0, ougoingElements = [];
      for (let i = 0, { length } = visuallyRemovedRows; i < length; i++) {
        ougoingElements.push(...visuallyRemovedRows[i]._elementsArray.map(cloneRowEl));
      }
      grid.setTimeout(() => {
        ougoingElements.forEach((e) => e.remove());
      }, durationMS);
      if (removingLast) {
        return me.calculateRowCount(false, true, true);
      } else {
        for (let i = index; i < rowCount; i++) {
          rows[i].setTop(rows[i].top + visuallyRemovedHeight);
        }
      }
      (_b = ougoingElements[0]) == null ? void 0 : _b.getBoundingClientRect();
      DomHelper.addTemporaryClass(grid.element, "b-splicing-rows", durationMS, grid);
    } else if (count > 0) {
      count = me.grid.hasVerticalOverflow ? Math.min(count, me.lastVisibleRow.index + 1 - index) : count;
      let newIndex = index, dataIndex = newRowDataIndex;
      for (let i = 0; i < count; i++, newIndex++, dataIndex++) {
        addedRows.push(rowClass.new({
          cls: `${rowCls} b-adding`,
          rowManager: me,
          grid,
          index: newIndex,
          dataIndex
        }));
      }
      for (let i = index; i < me.rowCount; i++, newIndex++, dataIndex++) {
        rows[i].index = newIndex;
        rows[i].dataIndex = dataIndex;
      }
      grid.setTimeout(() => {
        addedRows.forEach((r) => !r.isDestroyed && r.removeCls("b-adding"));
      }, durationMS);
      rows.splice(index, 0, ...addedRows);
      me.rowCount += count;
      if (count) {
        me.trigger("addRows", { rows: addedRows });
      }
      for (let i = 0, top = (((_c = rows[index - 1]) == null ? void 0 : _c.bottom) || 0) - rowHeight; i < count; i++, top += rowHeight) {
        addedRows[i].setTop(top);
      }
      DomHelper.addTemporaryClass(grid.element, "b-splicing-rows", durationMS, grid);
    }
    me.renderFromRow(rows[index]);
    return addedRows;
  }
  removeAllRows() {
    const me = this, { topRow } = me, result = topRow ? me.refreshDetails = {
      topRowIndex: topRow.dataIndex,
      topRowTop: topRow.top
    } : me.refreshDetails, removedRows = me.rows.slice();
    me.trigger("removeRows", { rows: removedRows });
    me.rows.forEach((row) => row.destroy());
    me.rows.length = 0;
    me.idMap = {};
    return result;
  }
  setPosition(refreshDetails) {
    const { topRow } = this, { topRowIndex, topRowTop } = refreshDetails;
    if (topRow) {
      topRow.setTop(topRowTop);
      topRow.dataIndex = topRowIndex;
    }
  }
  //endregion
  //region Rows - Getters
  get store() {
    return this.client.store;
  }
  /**
   * Get all Rows
   * @property {Grid.row.Row[]}
   * @readonly
   * @category Rows
   */
  get rows() {
    return this._rows;
  }
  /**
   * Get the Row at a specified store index. Returns `undefined` if the row index is not rendered.
   * @param {Number} index
   * @returns {Grid.row.Row|undefined}
   * @category Rows
   */
  getRow(index) {
    if (this.rowCount) {
      return this.rows[index - this.topIndex];
    }
  }
  /**
   * Get Row for specified record id
   * @param {Core.data.Model|String|Number} recordOrId Record id (or a record)
   * @returns {Grid.row.Row|null} Found Row or null if record not rendered
   * @category Rows
   */
  getRowById(recordOrId) {
    if (recordOrId && recordOrId.isModel) {
      recordOrId = recordOrId.id;
    }
    return this.idMap[recordOrId];
  }
  /**
   * Get a Row from an HTMLElement
   * @param {HTMLElement} element
   * @returns {Grid.row.Row|null} Found Row or null if record not rendered
   * @category Rows
   */
  getRowFromElement(element) {
    element = element.closest(".b-grid-row");
    return element && this.getRow(element.dataset.index);
  }
  /**
   * Get the row at the specified Y coordinate, which is by default viewport-based.
   * @param {Number} y The `Y` coordinate to find the Row for.
   * @param {Boolean} [local=false] Pass `true` if the `Y` coordinate is local to the SubGrid's element.
   * @returns {Grid.row.Row} Found Row or null if no row is rendered at that point.
   */
  getRowAt(y, local = false) {
    if (!local) {
      y -= Rectangle.from(this.grid.bodyContainer, null, true).roundPx(1).top;
      y += this.grid.scrollable.y;
    }
    y = DomHelper.roundPx(y);
    return this.rows.find((r) => y >= r.top && y < r.bottom);
  }
  /**
   * Get a Row for either a record, a record id or an HTMLElement
   * @param {HTMLElement|Core.data.Model|String|Number} recordOrId Record or record id or HTMLElement
   * @returns {Grid.row.Row} Found Row or null if record not rendered
   * @category Rows
   */
  getRowFor(recordOrId) {
    if (recordOrId instanceof HTMLElement) {
      return this.getRowFromElement(recordOrId);
    }
    return this.getRowById(recordOrId);
  }
  /**
   * Gets the Row following the specified Row (by index or object). Wraps around the end.
   * @param {Number|Grid.row.Row} indexOrRow index or Row
   * @returns {Grid.row.Row}
   * @category Rows
   */
  getNextRow(indexOrRow) {
    const index = typeof indexOrRow === "number" ? indexOrRow : indexOrRow.index;
    return this.getRow((index + 1) % this.rowCount);
  }
  /**
   * Get the Row that is currently displayed at top.
   * @property {Grid.row.Row}
   * @readonly
   * @category Rows
   */
  get topRow() {
    return this.rows[0];
  }
  /**
   * Get the Row currently displayed furthest down.
   * @property {Grid.row.Row}
   * @readonly
   * @category Rows
   */
  get bottomRow() {
    const rowCount = Math.min(this.rowCount, this.store.count);
    return this.rows[rowCount - 1];
  }
  /**
   * Get the topmost visible Row
   * @property {Grid.row.Row}
   * @readonly
   * @category Rows
   */
  get firstVisibleRow() {
    return this.rows.find((r) => r.bottom > Math.ceil(this.grid.scrollable.y));
  }
  get firstFullyVisibleRow() {
    return this.rows.find((r) => r.top >= Math.ceil(this.grid.scrollable.y));
  }
  /**
   * Get the last visible Row
   * @property {Grid.row.Row}
   * @readonly
   * @category Rows
   */
  get lastVisibleRow() {
    const { grid } = this;
    return ArrayHelper.findLast(this.rows, (r) => r.top < grid.scrollable.y + grid.bodyHeight);
  }
  get lastFullyVisibleRow() {
    const { grid } = this;
    return ArrayHelper.findLast(this.rows, (r) => r.bottom < grid.scrollable.y + grid.bodyHeight);
  }
  /**
   * Calls offset() for each Row passing along offset parameter
   * @param {Number} offset Pixels to translate Row elements.
   * @private
   * @category Rows
   */
  offsetRows(offset) {
    if (offset !== 0) {
      const { rows } = this, { length } = rows;
      for (let i = 0; i < length; i++) {
        rows[i].offset(offset);
      }
    }
    this.trigger("offsetRows", { offset });
  }
  //endregion
  //region Row height
  get prependBufferHeight() {
    return this.prependRowBuffer * this.rowOffsetHeight;
  }
  get appendBufferHeight() {
    return this.appendRowBuffer * this.rowOffsetHeight;
  }
  /**
   * Set a fixed row height (can still be overridden by renderers) or get configured row height. Setting refreshes all rows
   * @type {Number}
   * @on-owner
   * @category Rows
   */
  get rowHeight() {
    return this._rowHeight;
  }
  set rowHeight(height) {
    const me = this, { grid, fixedRowHeight } = me, oldHeight = me.rowHeight;
    if (oldHeight === height) {
      return;
    }
    ObjectHelper.assertNumber(height, "rowHeight");
    if (height < 10) {
      height = 10;
    }
    me.trigger("beforeRowHeight", { height });
    me.minRowHeight = me._rowHeight = height;
    if (fixedRowHeight) {
      me.averageRowHeight = height;
    }
    if (me.rows.length) {
      const oldY = grid.scrollable.y, topRow = me.getRowAt(oldY, true), edgeOffset = topRow ? topRow.top - oldY : 0;
      let average, oldAverage;
      if (fixedRowHeight) {
        average = height;
        oldAverage = oldHeight;
      } else {
        oldAverage = average = me.averageRowHeight;
        me.clearKnownHeights();
        average *= height / oldHeight;
      }
      me.calculateRowCount(false, true, true);
      me.topRow.setTop(me.topRow.dataIndex * (average + grid._rowBorderHeight), true);
      me.refresh();
      const newY = oldY * (average / oldAverage);
      if (newY !== oldY) {
        grid.scrollRowIntoView(topRow.id, {
          block: "start",
          edgeOffset
        });
      }
    }
    me.trigger("rowHeight", { height, oldHeight });
  }
  /**
   * Get actually used row height, which includes any border and might be an average if using variable row height.
   * @property {Number}
   */
  get rowOffsetHeight() {
    return Math.floor(this.preciseRowOffsetHeight);
  }
  get preciseRowOffsetHeight() {
    return (this.averageRowHeight || this._rowHeight) + this.grid._rowBorderHeight;
  }
  get minRowOffsetHeight() {
    return (this.minRowHeight || this._rowHeight) + this.grid._rowBorderHeight;
  }
  /*
  * How store CRUD affects the height map:
  *
  * | Operation | Result                            |
  * |-----------|-----------------------------------|
  * | add       | No. Appears on render             |
  * | insert    | No. Appears on render             |
  * | remove    | Remove entry                      |
  * | removeAll | Clear                             |
  * | update    | No                                |
  * | replace   | Height might differ, remove entry |
  * | move      | No                                |
  * | filter    | No                                |
  * | sort      | No                                |
  * | group     | No                                |
  * | dataset   | Clear                             |
  *
  * The above is handled in GridBase
  */
  /**
   * Returns `true` if all rows have a known height. They do if all rows are visited, or if RowManager is configured
   * with `fixedRowHeight`. If so, all tops can be calculated exactly, no guessing needed
   * @property {Boolean}
   * @private
   */
  get allHeightsKnown() {
    return this.fixedRowHeight || this.heightMap.size >= this.store.count;
  }
  /**
   * Store supplied `height` using `id` as key in the height map. Called by `Row` when it gets its height.
   * Keeps `averageRowHeight` and `totalKnownHeight` up to date. Ignored when configured with `fixedRowHeight`
   * @param {String|Number} id
   * @param {Number} height
   * @internal
   */
  storeKnownHeight(id, height) {
    const me = this, { heightMap } = me;
    if (!me.fixedRowHeight) {
      if (heightMap.has(id)) {
        me.totalKnownHeight -= heightMap.get(id);
      }
      heightMap.set(id, height);
      me.totalKnownHeight += height;
      if (height < me.minRowHeight) {
        me.minRowHeight = height;
      }
      me.averageRowHeight = me.totalKnownHeight / heightMap.size;
    }
  }
  /**
   * Get the known or estimated offset height for the specified record id
   * @param {Core.data.Model} record
   * @returns {Number}
   * @private
   */
  getOffsetHeight(record) {
    const me = this;
    return (record && me.heightMap.get(record.id) || record && me.grid.getRowHeight(record) || me.averageRowHeight || me.rowHeight) + me.grid._rowBorderHeight;
  }
  /**
   * Invalidate cached height for a record. Removing it from `totalKnownHeight` and factoring it out of
   * `averageRowHeight`.
   * @param {Core.data.Model|Core.data.Model[]} records
   */
  invalidateKnownHeight(records) {
    const me = this;
    if (!me.fixedRowHeight) {
      const { heightMap } = me;
      records = ArrayHelper.asArray(records);
      records.forEach((record) => {
        if (record) {
          if (heightMap.has(record.id)) {
            me.totalKnownHeight -= heightMap.get(record.id);
            heightMap.delete(record.id);
          }
        }
      });
      me.averageRowHeight = me.totalKnownHeight / heightMap.size;
    }
  }
  /**
   * Invalidates all cached height and resets `averageRowHeight` and `totalKnownHeight`
   */
  clearKnownHeights() {
    this.heightMap.clear();
    this.averageRowHeight = this.totalKnownHeight = 0;
  }
  /**
   * Calculates a row top from its data index. Uses known values from the height map, unknown are substituted with
   * the average row height. When configured with `fixedRowHeight`, it will always calculate a correct value
   * @param {Number} index Index in store
   * @private
   */
  calculateTop(index) {
    if (this.fixedRowHeight) {
      return index * this.rowOffsetHeight;
    }
    const { store } = this;
    let top = 0;
    for (let i = 0; i < index; i++) {
      const record = store.getAt(i);
      top += this.getOffsetHeight(record);
    }
    return Math.floor(top);
  }
  //endregion
  //region Calculations
  /**
   * Returns top and bottom for rendered row or estimated coordinates for unrendered.
   * @param {Core.data.Model|String|Number} recordOrId Record or record id
   * @param {Boolean} [local] Pass true to get relative record coordinates
   * @param {Boolean} [roughly] Pass true to allow a less exact but cheaper estimate
   * @returns {Core.helper.util.Rectangle} Record bounds with format { x, y, width, height, bottom, right }
   * @category Calculations
   */
  getRecordCoords(recordOrId, local = false, roughly = false) {
    const me = this, row = me.getRowById(recordOrId);
    let scrollingViewport = me.client._bodyRectangle;
    if (!local) {
      scrollingViewport = me.client.refreshBodyRectangle();
    }
    if (row) {
      return new Rectangle(
        scrollingViewport.x,
        local ? Math.round(row.top) : Math.round(row.top + scrollingViewport.y - me.client.scrollable.y),
        scrollingViewport.width,
        row.offsetHeight
      );
    }
    return me.getRecordCoordsByIndex(me.store.indexOf(recordOrId), local, roughly);
  }
  /**
   * Returns estimated top and bottom coordinates for specified row.
   * @param {Number} recordIndex Record index
   * @param {Boolean} [local]
   * @returns {Core.helper.util.Rectangle} Estimated record bounds with format { x, y, width, height, bottom, right }
   * @category Calculations
   */
  getRecordCoordsByIndex(recordIndex, local = false, roughly = false) {
    var _a;
    const me = this, { topRow, bottomRow } = me, scrollingViewport = me.client._bodyRectangle, { id } = me.store.getAt(recordIndex), height = me.preciseRowOffsetHeight, currentTopIndex = topRow.dataIndex, currentBottomIndex = bottomRow.dataIndex, calculateFrom = (
      // bottomRow is closest, calculate from it
      recordIndex > currentBottomIndex ? { index: recordIndex - currentBottomIndex - 1, y: bottomRow.bottom, from: "bottomRow" } : recordIndex > currentTopIndex / 2 ? { index: recordIndex - currentTopIndex, y: topRow.top, from: "topRow" } : { index: recordIndex, y: 0, from: "top" }
    ), top = me.allHeightsKnown && !roughly ? me.calculateTop(recordIndex) : Math.floor(calculateFrom.y + calculateFrom.index * height), maybeKnownHeight = Math.floor((_a = me.heightMap.get(id)) != null ? _a : height), recordY = local ? calculateFrom.from === "topRow" ? top + height - maybeKnownHeight : top : top + scrollingViewport.y - me.client.scrollable.y, result = new Rectangle(scrollingViewport.x, recordY, scrollingViewport.width, maybeKnownHeight);
    result.virtual = true;
    result.block = result.bottom < scrollingViewport.y ? "start" : result.y > scrollingViewport.bottom ? "end" : "nearest";
    return result;
  }
  /**
   * Total estimated grid height (used for scroller)
   * @property {Number}
   * @readonly
   * @category Calculations
   */
  get totalHeight() {
    return this._totalHeight;
  }
  //endregion
  //region Iteration etc.
  /**
   * Calls a function for each Row
   * @param {Function} fn Function that will be called with Row as first parameter
   * @category Iteration
   */
  forEach(fn) {
    this.rows.forEach(fn);
  }
  /**
   * Iterator that allows you to do for (let row of rowManager)
   * @category Iteration
   */
  [Symbol.iterator]() {
    return this.rows[Symbol.iterator]();
  }
  //endregion
  //region Scrolling & rendering
  /**
   * Refresh a single cell.
   * @param {Core.data.Model} record Record for row holding the cell that should be updated
   * @param {String|Number} columnId Column id to identify the cell within the row
   * @returns {Boolean} Returns `true` if cell was found and refreshed, `false` if not
   */
  refreshCell(record, columnId) {
    const cellContext = new Location({ grid: this.grid, record, columnId });
    return Boolean(cellContext.cell && cellContext.row.renderCell(cellContext));
  }
  /**
   * Renders from the top of the grid, also resetting scroll to top. Used for example when collapsing all groups.
   * @category Scrolling & rendering
   */
  returnToTop() {
    const me = this;
    me.topIndex = 0;
    me.lastScrollTop = 0;
    if (me.topRow) {
      me.topRow.dataIndex = 0;
      me.topRow.setTop(0, true);
    }
    me.refresh();
    me.grid.scrollable.y = 0;
  }
  /**
   * Renders from specified records row and down (used for example when collapsing a group, does not affect rows above).
   * @param {Core.data.Model} record Record of first row to render
   * @category Scrolling & rendering
   */
  renderFromRecord(record) {
    const row = this.getRowById(record.id);
    if (row) {
      this.renderFromRow(row);
    }
  }
  /**
   * Renders from specified row and down (used for example when collapsing a group, does not affect rows above).
   * @param {Grid.row.Row} fromRow First row to render
   * @category Scrolling & rendering
   */
  renderFromRow(fromRow = null) {
    const me = this, {
      rows,
      store,
      topIndex,
      topRow
    } = me, storeCount = store.count;
    let fromRowIndex = fromRow ? rows.indexOf(fromRow) : 0;
    if (me.calculateRowCount(false, storeCount < rows.length, true) === 0) {
      me.estimateTotalHeight(true);
      return;
    }
    if (me.topIndex < topIndex) {
      me.topRow.setTop(me.calculateTop(me.topIndex), true);
      fromRowIndex = 0;
      fromRow = me.topRow;
    } else if (fromRow && rows.indexOf(fromRow) < 0) {
      fromRow = rows[fromRowIndex] || topRow;
    }
    let dataIndex = fromRow ? fromRow.dataIndex : rows[0].dataIndex;
    const recordsAfter = storeCount - dataIndex - 1, toRowIndex = Math.min(rows.length - 1, fromRowIndex + recordsAfter);
    let leftOverCount = rows.length - toRowIndex - 1, top = fromRowIndex > 0 ? rows[fromRowIndex - 1].bottom : rows[fromRowIndex].top, row;
    for (let i = fromRowIndex; i <= toRowIndex; i++) {
      row = rows[i];
      row.dataIndex = dataIndex;
      row.setTop(top, true);
      row.render(dataIndex, store.getAt(dataIndex++), false);
      top += row.offsetHeight;
    }
    while (leftOverCount-- > 0) {
      me.displayRecordAtTop();
    }
    if (me.bottomRow.bottom < me.viewHeight) {
      me.calculateRowCount();
    }
    me.estimateTotalHeight(true);
    me.trigger("renderDone");
  }
  /**
   * Renders the passed array (or [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)) of {@link Grid.row.Row rows}
   * @param {Grid.row.Row[]|Set} rows The rows to render
   * @category Scrolling & rendering
   */
  renderRows(rows) {
    let oldHeight, heightChanged = false;
    rows = Array.from(rows);
    rows.sort((a, b) => a.dataIndex - b.dataIndex);
    for (const row of rows) {
      oldHeight = row.height;
      row.render(null, null, false);
      heightChanged |= row.height !== oldHeight;
    }
    if (heightChanged) {
      this.translateFromRow(rows[0]);
    }
    this.trigger("renderDone");
  }
  /**
   * Translates all rows after the specified row. Used when a single rows height is changed and the others should
   * rearrange. (Called from Row#render)
   * @param {Grid.row.Row} fromRow
   * @private
   * @category Scrolling & rendering
   */
  translateFromRow(fromRow, batch = false) {
    const me = this;
    let top = fromRow.bottom, row, index;
    for (index = fromRow.dataIndex + 1, row = me.getRow(index); row; row = me.getRow(++index)) {
      top = row.translate(top);
    }
    if (!batch) {
      me.estimateTotalHeight(true);
    }
  }
  /**
   * Rerender all rows
   * @category Scrolling & rendering
   * @privateparam {Boolean} force Force re-rendering even if there are no rows currently
   */
  refresh(force = false) {
    const me = this, { topRow } = me;
    if (!topRow && !force || me.grid.refreshSuspended) {
      return;
    }
    me.idMap = {};
    me.renderFromRow(topRow);
    me.trigger("refresh");
  }
  /**
   * Makes sure that specified record is displayed in view
   * @param newScrollTop Top of visible section
   * @param [forceRecordIndex] Index of record to display at center
   * @private
   * @category Scrolling & rendering
   */
  jumpToPosition(newScrollTop, forceRecordIndex) {
    const me = this, { store, heightMap } = me, storeCount = store.count;
    if (me.allHeightsKnown && !me.fixedRowHeight) {
      const top = newScrollTop - me.prependBufferHeight, border = me.grid._rowBorderHeight;
      let accumulated = 0, targetIndex = 0;
      while (accumulated < top) {
        const record = store.getAt(targetIndex);
        accumulated += heightMap.get(record.id) + border;
        targetIndex++;
      }
      const startIndex = Math.max(Math.min(targetIndex, storeCount - me.rowCount), 0);
      me.lastScrollTop = newScrollTop;
      me.topRow.dataIndex = me.topIndex = startIndex;
      me.topRow.setTop(me.calculateTop(startIndex), false);
      me.refresh();
    } else {
      const rowHeight = me.preciseRowOffsetHeight, targetIndex = forceRecordIndex == null ? Math.floor(newScrollTop / rowHeight) - me.prependRowBuffer : forceRecordIndex - Math.floor(me.rowCount / 2), startIndex = Math.max(Math.min(targetIndex, storeCount - me.rowCount), 0), viewportTop = me.client.scrollable.y, viewportBottom = Math.min(me.client._bodyRectangle.height + viewportTop + me.appendBufferHeight, me.totalHeight);
      me.lastScrollTop = newScrollTop;
      me.topRow.dataIndex = me.topIndex = startIndex;
      me.topRow.setTop(Math.floor(startIndex * rowHeight), false);
      me.refresh();
      if (me.bottomRow.bottom < viewportBottom) {
        me.calculateRowCount(false, false, false);
        while (me.bottomRow.bottom < viewportBottom && me._rows[me.prependRowBuffer].top < viewportTop && me.bottomRow.dataIndex < storeCount - 1) {
          me.displayRecordAtBottom();
        }
      }
      me.estimateTotalHeight();
    }
    if (forceRecordIndex != null) {
      const { scrollable } = me.grid, targetRow = me.getRow(forceRecordIndex), rowCenter = targetRow && Rectangle.from(targetRow._elementsArray[0]).center.y, viewportCenter = scrollable.viewport.center.y;
      if (targetRow) {
        scrollable.y = newScrollTop = Math.floor(scrollable.y + (rowCenter - viewportCenter));
      }
    }
    return newScrollTop;
  }
  /**
   * Jumps to a position if it is far enough from current position. Otherwise does nothing.
   * @private
   * @category Scrolling & rendering
   */
  warpIfNeeded(newScrollTop) {
    const me = this, result = { newScrollTop, deltaTop: newScrollTop - me.lastScrollTop };
    if (Math.abs(result.deltaTop) > me.rowCount * me.rowOffsetHeight * 3) {
      let index;
      if (me.scrollTargetRecordId) {
        index = me.store.indexOf(me.scrollTargetRecordId);
      }
      me.grid.onFocusedRowDerender();
      result.newScrollTop = me.jumpToPosition(newScrollTop, index);
      result.deltaTop = 0;
    }
    return result;
  }
  /**
   * Handles virtual rendering (only visible rows + buffer are in dom) for rows
   * @param {Number} newScrollTop The `Y` scroll position for which to render rows.
   * @param {Boolean} [force=false] Pass `true` to update the rendered row block even if the scroll position has not changed.
   * @returns {Number} Adjusted height required to fit rows
   * @private
   * @category Scrolling & rendering
   */
  updateRenderedRows(newScrollTop, force, ignoreError = false) {
    const me = this, clientRect = me.client._bodyRectangle;
    if (me.rowCount === 0) {
      return 0;
    }
    let result = me.totalHeight;
    if (force || // Only react if we have scrolled by one row or more
    Math.abs(newScrollTop - me.lastScrollTop) >= me.rowOffsetHeight || // or if we have a gap at top/bottom (#9375)
    me.topRow.top > newScrollTop || me.bottomRow.bottom < newScrollTop + clientRect.height) {
      const posInfo = me.warpIfNeeded(newScrollTop);
      me.scrollTargetRecordId = null;
      me.lastScrollTop = posInfo.newScrollTop;
      if (posInfo.deltaTop > 0) {
        me.fillBelow(posInfo.newScrollTop);
      } else if (posInfo.deltaTop < 0) {
        me.fillAbove(posInfo.newScrollTop);
      }
      if (!me.fixedRowHeight && !ignoreError) {
        me.correctError(posInfo, clientRect, newScrollTop);
      }
      result = me.estimateTotalHeight();
    }
    return result;
  }
  correctError(posInfo, clientRect, newScrollTop) {
    const me = this;
    let error = 0;
    if (me.allHeightsKnown) {
      error = me.topRow.top - me.calculateTop(me.topRow.dataIndex);
    } else {
      if (
        // Scrolling up within top zone
        posInfo.deltaTop < 0 && newScrollTop < clientRect.height * 2 || // Scrolling down within bottom zone
        posInfo.deltaTop > 0 && newScrollTop > me.totalHeight - clientRect.height * 2 - 3
      ) {
        error = me.topRow.top - me.calculateTop(me.topRow.dataIndex);
      }
    }
    if (error) {
      me.offsetRows(-error);
      me.grid.scrollable.y = me.lastScrollTop = me.grid.scrollable.y - error;
    }
  }
  /**
   * Moves as many rows from the bottom to the top that are needed to fill to current scroll pos.
   * @param newTop Scroll position
   * @private
   * @category Scrolling & rendering
   */
  fillAbove(newTop) {
    const me = this, fillHeight = newTop - me.topRow.top - me.prependBufferHeight;
    let accumulatedHeight = 0;
    while (accumulatedHeight > fillHeight && me.topIndex > 0) {
      accumulatedHeight -= me.displayRecordAtTop();
    }
    me.trigger("renderDone");
  }
  /**
   * Moves as many rows from the top to the bottom that are needed to fill to current scroll pos.
   * @param newTop Scroll position
   * @private
   * @category Scrolling & rendering
   */
  fillBelow(newTop) {
    const me = this, fillHeight = newTop - me.topRow.top - me.prependBufferHeight, recordCount = me.store.count, rowCount = me.rowCount;
    let accumulatedHeight = 0;
    while (accumulatedHeight < fillHeight && // fill empty height
    me.topIndex + rowCount < recordCount && // as long as we have records left
    me.topRow.top + me.topRow.offsetHeight < newTop) {
      accumulatedHeight += me.displayRecordAtBottom();
    }
    me.trigger("renderDone");
  }
  /**
   * Estimates height needed to fit all rows, based on average row height. Also offsets rows if needed to not be above
   * the reachable area of the view.
   * @param {Boolean} [immediate] Specify true to pass the `immediate` flag on to any listeners (probably only Grid
   * cares. Used to bypass buffered element resize)
   * @returns {Number}
   * @private
   * @category Scrolling & rendering
   */
  estimateTotalHeight(immediate = false) {
    const me = this;
    if (me.grid.renderingRows) {
      return;
    }
    const recordCount = me.store.count, unknownCount = recordCount - me.heightMap.size, { bottomRow } = me;
    let estimate;
    if (me.fixedRowHeight) {
      estimate = recordCount * me.rowOffsetHeight;
    } else {
      estimate = // Known height, from entries in heightMap
      me.totalKnownHeight + // Those heights are "clientHeights", estimate needs to include borders
      me.heightMap.size * me.grid._rowBorderHeight + // Add estimate for rows with unknown height
      unknownCount * me.preciseRowOffsetHeight;
      if (bottomRow && unknownCount) {
        const bottom = bottomRow.bottom;
        if (bottom > estimate || me.topIndex + me.rowCount >= recordCount && estimate > bottom && bottom > 0) {
          estimate = bottom;
          if (bottomRow.dataIndex < recordCount - 1) {
            estimate += (recordCount - 1 - bottomRow.dataIndex) * me.preciseRowOffsetHeight;
          }
        }
      }
      estimate = Math.floor(estimate);
    }
    if (estimate !== me.totalHeight) {
      if (me.trigger("changeTotalHeight", { totalHeight: estimate, immediate }) !== false) {
        me._totalHeight = estimate;
      }
    }
    return estimate;
  }
  /**
   * Moves a row from bottom to top and renders the corresponding record to it.
   * @returns {Number} New row height
   * @private
   * @category Scrolling & rendering
   */
  displayRecordAtTop() {
    var _a;
    const me = this, { grid } = me, recordIndex = me.topIndex - 1, record = me.store.getAt(recordIndex), bottomRow = me.bottomRow, bottomRowTop = bottomRow.top;
    me.trigger("beforeTranslateRow", {
      row: bottomRow,
      newRecord: record
    });
    if (bottomRow.dataIndex === ((_a = grid.focusedCell) == null ? void 0 : _a.rowIndex)) {
      grid.onFocusedRowDerender();
    }
    bottomRow._top = me.topRow.top - me.getOffsetHeight(record);
    bottomRow.estimatedTop = !me.fixedRowHeight;
    bottomRow.render(recordIndex, record, false);
    bottomRow._top = bottomRowTop;
    bottomRow.setBottom(me.topRow.top);
    bottomRow.estimatedTop = false;
    me.topIndex--;
    me._rows.unshift(me._rows.pop());
    me.fixIndices();
    return bottomRow.offsetHeight;
  }
  /**
   * Moves a row from top to bottom and renders the corresponding record to it.
   * @returns {Number} New row height
   * @private
   * @category Scrolling & rendering
   */
  displayRecordAtBottom() {
    var _a;
    const me = this, { grid } = me, recordIndex = me.topIndex + me.rowCount, record = me.store.getAt(recordIndex), topRow = me.topRow;
    me.trigger("beforeTranslateRow", {
      row: topRow,
      newRecord: record
    });
    if (topRow.dataIndex === ((_a = grid.focusedCell) == null ? void 0 : _a.rowIndex)) {
      grid.onFocusedRowDerender();
    }
    topRow.dataIndex = recordIndex;
    topRow.setTop(me.bottomRow.bottom);
    topRow.render(recordIndex, record, false);
    me.topIndex++;
    me._rows.push(me._rows.shift());
    me.fixIndices();
    return topRow.offsetHeight;
  }
  fixIndices() {
    for (let i = 0, { rows } = this, { length } = rows; i < length; i++) {
      rows[i].index = i;
    }
  }
  //endregion
};
RowManager.featureClass = "";
RowManager._$name = "RowManager";

// ../Grid/lib/Grid/view/Header.js
var Header = class extends Bar {
  get subGrid() {
    return this._subGrid;
  }
  set subGrid(subGrid) {
    this._subGrid = this.owner = subGrid;
  }
  get region() {
    var _a;
    return (_a = this.subGrid) == null ? void 0 : _a.region;
  }
  changeElement(element, was) {
    const { region } = this;
    this.getConfig("columns");
    return super.changeElement({
      className: {
        "b-grid-header-scroller": 1,
        [`b-grid-header-scroller-${region}`]: region
      },
      children: [{
        reference: "headersElement",
        className: {
          "b-grid-headers": 1,
          [`b-grid-headers-${region}`]: region
        },
        dataset: {
          region,
          reference: "headersElement",
          maxDepth: this.maxDepth
        }
      }]
    }, was);
  }
  get overflowElement() {
    return this.headersElement;
  }
  /**
   * Recursive column header config creator.
   * Style not included because of CSP. Widths are fixed up in
   * {@link #function-fixHeaderWidths}
   * @private
   */
  getColumnConfig(column) {
    const {
      id,
      align,
      resizable,
      isLeaf,
      isParent,
      isLastInSubGrid,
      cls,
      childLevel,
      field,
      tooltip,
      children,
      isFocusable,
      grid
    } = column, focusedCell = grid == null ? void 0 : grid.focusedCell, isFocused = (focusedCell == null ? void 0 : focusedCell.rowIndex) === -1 && (focusedCell == null ? void 0 : focusedCell.column) === column, style = {};
    if (column.isVisible) {
      if (column.flex) {
        style.flex = column.flex;
      } else if (column.width) {
        style.width = DomHelper.setLength(column.width);
      }
      return {
        style,
        className: {
          "b-grid-header": 1,
          "b-grid-header-parent": isParent,
          [`b-level-${childLevel}`]: 1,
          [`b-depth-${column.meta.depth}`]: 1,
          [`b-grid-header-align-${align}`]: align,
          "b-grid-header-resizable": resizable && isLeaf,
          [cls]: cls,
          "b-collapsible": column.collapsible,
          "b-last-parent": isParent && isLastInSubGrid,
          "b-last-leaf": isLeaf && isLastInSubGrid
        },
        role: isFocusable ? "columnheader" : "presentation",
        "aria-sort": "none",
        "aria-label": column.ariaLabel,
        [isFocusable ? "tabIndex" : ""]: isFocused ? 0 : -1,
        dataset: {
          ...Tooltip.encodeConfig(tooltip),
          columnId: id,
          [field ? "column" : ""]: field
        },
        children: [
          {
            className: "b-grid-header-text",
            children: [{
              [grid && isFocusable ? "id" : ""]: `${grid == null ? void 0 : grid.id}-column-${column.id}`,
              className: "b-grid-header-text-content"
            }]
          },
          children ? {
            className: "b-grid-header-children",
            children: children.map((child) => this.getColumnConfig(child)),
            syncOptions: {
              syncIdField: "columnId"
            }
          } : null,
          {
            className: "b-grid-header-resize-handle"
          }
        ]
      };
    }
  }
  // used by safari to fix flex when rows width shrink below this value
  calculateMinWidthForSafari() {
    let minWidth = 0;
    this.columns.visibleColumns.forEach((column) => {
      minWidth += column.calculateMinWidth();
    });
    return minWidth;
  }
  /**
   * Fix header widths (flex or fixed width) after rendering. Not a part of template any longer because of CSP
   * @private
   */
  fixHeaderWidths() {
    this.fixCellWidths();
  }
  refreshHeaders() {
    const me = this;
    me.columns.traverse((column) => me.refreshColumn(column));
    me.fixHeaderWidths();
  }
  refreshColumn(column) {
    const me = this, headerElement = me.getBarCellElement(column.id);
    if (headerElement) {
      let html = column.headerText;
      if (column.headerRenderer) {
        html = column.headerRenderer.call(column.thisObj || me, { column, headerElement });
      }
      if (column.headerWidgetMap) {
        Object.values(column.headerWidgetMap).forEach((widget) => {
          widget.render(column.textWrapper);
        });
      }
      if (column.icon) {
        html = `<i class="${StringHelper.encodeHtml(column.icon)}"></i>` + (html || "");
      }
      const innerEl = headerElement.querySelector(".b-grid-header-text-content");
      if (innerEl) {
        innerEl.innerHTML = html || "";
      }
    }
  }
  get columns() {
    const me = this, result = super.columns;
    if (!me.columnsDetacher) {
      me.columnsDetacher = result.ion({
        change() {
          me.initDepths();
        },
        thisObj: me
      });
      me.initDepths();
    }
    return result;
  }
  set columns(columns) {
    super.columns = columns;
  }
  /**
   * Depths are used for styling of grouped headers. Sets them on meta.
   * @private
   */
  initDepths(columns = this.columns.topColumns, parent = null) {
    const me = this;
    let maxDepth = 0;
    if (parent == null ? void 0 : parent.meta) {
      parent.meta.depth++;
    }
    for (const column of columns) {
      const { meta } = column;
      meta.depth = 0;
      if (column.children) {
        me.initDepths(column.children.filter(me.columns.chainedFilterFn), column);
        if (meta.depth && parent) {
          parent.meta.depth += meta.depth;
        }
      }
      if (meta.depth > maxDepth) {
        maxDepth = meta.depth;
      }
    }
    if (!parent) {
      me.maxDepth = maxDepth;
    }
    return maxDepth;
  }
  //endregion
  //region Getters
  /**
   * Get the header cell element for the specified column.
   * @param {String} columnId Column id
   * @returns {HTMLElement} Header cell element
   */
  getHeader(columnId) {
    return this.getBarCellElement(columnId);
  }
  //endregion
  get contentElement() {
    return this.element.firstElementChild;
  }
  refreshContent() {
    const me = this;
    DomSync.sync({
      domConfig: {
        children: me.columns.topColumns.map((col) => me.getColumnConfig(col)),
        onlyChildren: true
      },
      targetElement: me.contentElement,
      strict: true,
      syncIdField: "columnId",
      releaseThreshold: 0
    });
    me.refreshHeaders();
  }
  onInternalPaint({ firstPaint }) {
    if (firstPaint) {
      this.refreshContent();
    }
  }
};
__publicField(Header, "$name", "Header");
__publicField(Header, "type", "gridheader");
Header.initClass();
Header._$name = "Header";

// ../Grid/lib/Grid/view/mixin/GridElementEvents.js
var gridBodyElementEventHandlers = {
  touchstart: "onElementTouchStart",
  touchmove: "onElementTouchMove",
  touchend: "onElementTouchEnd",
  pointerover: "onElementMouseOver",
  mouseout: "onElementMouseOut",
  mousedown: "onElementMouseDown",
  mousemove: "onElementMouseMove",
  mouseup: "onElementMouseUp",
  click: "onHandleElementClick",
  dblclick: "onElementDblClick",
  keyup: "onElementKeyUp",
  keypress: "onElementKeyPress",
  contextmenu: "onElementContextMenu",
  pointerdown: "onElementPointerDown",
  pointerup: "onElementPointerUp"
};
var eventProps = [
  "pageX",
  "pageY",
  "clientX",
  "clientY",
  "screenX",
  "screenY"
];
function toggleHover(element, add = true) {
  element == null ? void 0 : element.classList.toggle("b-hover", add);
}
function setCellHover(columnId, row, add = true) {
  row && columnId && toggleHover(row.getCell(columnId), add);
}
var GridElementEvents_default = (Target) => class GridElementEvents extends (Target || Base) {
  static get $name() {
    return "GridElementEvents";
  }
  //region Config
  static get configurable() {
    return {
      /**
       * The currently hovered grid cell
       * @member {HTMLElement}
       * @readonly
       * @category Misc
       */
      hoveredCell: null,
      /**
       * Time in ms until a longpress is triggered
       * @prp {Number}
       * @default
       * @category Misc
       */
      longPressTime: 400,
      /**
       * Set to true to listen for CTRL-Z (CMD-Z on Mac OS) keyboard event and trigger undo (redo when SHIFT is
       * pressed). Only applicable when using a {@link Core.data.stm.StateTrackingManager}.
       * @prp {Boolean}
       * @default
       * @category Misc
       */
      enableUndoRedoKeys: true,
      keyMap: {
        "Ctrl+z": "undoRedoKeyPress",
        "Ctrl+Shift+z": "undoRedoKeyPress",
        " ": { handler: "clickCellByKey", weight: 1e3 }
      }
    };
  }
  //endregion
  //region Events
  /**
   * Fired when user clicks in a grid cell
   * @event cellClick
   * @param {Grid.view.Grid} grid The grid instance
   * @param {Core.data.Model} record The record representing the row
   * @param {Grid.column.Column} column The column to which the cell belongs
   * @param {HTMLElement} cellElement The cell HTML element
   * @param {HTMLElement} target The target element
   * @param {MouseEvent} event The native DOM event
   */
  /**
   * Fired when user double clicks a grid cell
   * @event cellDblClick
   * @param {Grid.view.Grid} grid The grid instance
   * @param {Core.data.Model} record The record representing the row
   * @param {Grid.column.Column} column The column to which the cell belongs
   * @param {HTMLElement} cellElement The cell HTML element
   * @param {HTMLElement} target The target element
   * @param {MouseEvent} event The native DOM event
   */
  /**
   * Fired when user activates contextmenu in a grid cell
   * @event cellContextMenu
   * @param {Grid.view.Grid} grid The grid instance
   * @param {Core.data.Model} record The record representing the row
   * @param {Grid.column.Column} column The column to which the cell belongs
   * @param {HTMLElement} cellElement The cell HTML element
   * @param {HTMLElement} target The target element
   * @param {MouseEvent} event The native DOM event
   */
  /**
   * Fired when user moves the mouse over a grid cell
   * @event cellMouseOver
   * @param {Grid.view.Grid} grid The grid instance
   * @param {Core.data.Model} record The record representing the row
   * @param {Grid.column.Column} column The column to which the cell belongs
   * @param {HTMLElement} cellElement The cell HTML element
   * @param {HTMLElement} target The target element
   * @param {MouseEvent} event The native DOM event
   */
  /**
   * Fired when a user moves the mouse out of a grid cell
   * @event cellMouseOut
   * @param {Grid.view.Grid} grid The grid instance
   * @param {Core.data.Model} record The record representing the row
   * @param {Grid.column.Column} column The column to which the cell belongs
   * @param {HTMLElement} cellElement The cell HTML element
   * @param {HTMLElement} target The target element
   * @param {MouseEvent} event The native DOM event
   */
  //endregion
  //region Event handling
  /**
   * Init listeners for a bunch of dom events. All events are handled by handleEvent().
   * @private
   * @category Events
   */
  initInternalEvents() {
    const handledEvents = Object.keys(gridBodyElementEventHandlers), len = handledEvents.length, listeners = {
      element: this.bodyElement,
      thisObj: this
    };
    for (let i = 0; i < len; i++) {
      const eventName = handledEvents[i];
      listeners[eventName] = {
        handler: "handleEvent"
      };
      if (eventName.startsWith("touch")) {
        listeners[eventName].passive = false;
      }
    }
    EventHelper.on(listeners);
    EventHelper.on({
      focusin: "onGridBodyFocusIn",
      element: this.bodyElement,
      thisObj: this,
      capture: true
    });
  }
  /**
   * This method finds the cell location of the passed event. It returns an object describing the cell.
   * @param {Event} event A Mouse, Pointer or Touch event targeted at part of the grid.
   * @param {Boolean} [includeSingleAxisMatch] Set to `true` to return a cell from xy either above or below the Grid's
   * body or to the left or right.
   * @returns {Object} An object containing the following properties:
   * - `cellElement` - The cell element clicked on.
   * - `column` - The {@link Grid.column.Column column} clicked under.
   * - `columnId` - The `id` of the {@link Grid.column.Column column} clicked under.
   * - `record` - The {@link Core.data.Model record} clicked on.
   * - `id` - The `id` of the {@link Core.data.Model record} clicked on.
   * @internal
   * @category Events
   */
  getCellDataFromEvent(event, includeSingleAxisMatch = false) {
    var _a, _b;
    const me = this, { columns } = me, { target } = event, targetIsRow = target.classList.contains("b-grid-row");
    let cellElement = target.closest(".b-grid-cell");
    if (!cellElement && includeSingleAxisMatch && !targetIsRow && !target.classList.contains("b-grid-subgrid")) {
      const {
        top,
        left,
        right,
        bottom
      } = me.bodyContainer.getBoundingClientRect();
      let match, { x, y } = event;
      if (x >= left && x <= right) {
        y = match = Math.ceil(me[`${y < top ? "first" : "last"}FullyVisibleRow`].element.getBoundingClientRect().y);
      } else if (y >= top && y <= bottom) {
        x = match = Math.ceil(columns.visibleColumns[x < left ? 0 : columns.visibleColumns.length - 1].element.getBoundingClientRect().x);
      }
      if (match !== void 0) {
        cellElement = (_a = DomHelper.childFromPoint(event.target, event.offsetX, event.offsetY)) == null ? void 0 : _a.closest(".b-grid-cell");
      }
    } else if (targetIsRow) {
      cellElement = (_b = DomHelper.childFromPoint(event.target, event.offsetX, event.offsetY - target.offsetHeight / 2)) == null ? void 0 : _b.closest(".b-grid-cell");
    }
    if (cellElement) {
      const cellData = DomDataStore.get(cellElement), { id, columnId } = cellData, record = me.store.getById(id), column = columns.getById(columnId);
      return record ? {
        cellElement,
        cellData,
        columnId,
        id,
        record,
        column,
        cellSelector: { id, columnId }
      } : null;
    }
  }
  /**
   * This method finds the header location of the passed event. It returns an object describing the header.
   * @param {Event} event A Mouse, Pointer or Touch event targeted at part of the grid.
   * @returns {Object} An object containing the following properties:
   * - `headerElement` - The header element clicked on.
   * - `column` - The {@link Grid.column.Column column} clicked under.
   * - `columnId` - The `id` of the {@link Grid.column.Column column} clicked under.
   * @internal
   * @category Events
   */
  getHeaderDataFromEvent(event) {
    const headerElement = event.target.closest(".b-grid-header");
    if (headerElement) {
      const headerData = ObjectHelper.assign({}, headerElement.dataset), { columnId } = headerData, column = this.columns.getById(columnId);
      return column ? {
        headerElement,
        headerData,
        columnId,
        column
      } : null;
    }
  }
  /**
   * Handles all dom events, routing them to correct functions (touchstart -> onElementTouchStart)
   * @param event
   * @private
   * @category Events
   */
  handleEvent(event) {
    if (!this.disabled && gridBodyElementEventHandlers[event.type]) {
      this[gridBodyElementEventHandlers[event.type]](event);
    }
  }
  //endregion
  //region Touch events
  /**
   * Touch start, chain this function in features to handle the event.
   * @param event
   * @category Touch events
   * @internal
   */
  onElementTouchStart(event) {
    const me = this, cellData = me.getCellDataFromEvent(event);
    DomHelper.isTouchEvent = true;
    if (event.touches.length === 1) {
      me.longPressTimeout = me.setTimeout(() => {
        me.onElementLongPress(event);
        event.preventDefault();
        me.longPressPerformed = true;
      }, me.longPressTime);
    }
    if (cellData && !event.defaultPrevented) {
      me.onFocusGesture(event);
    }
  }
  /**
   * Touch move, chain this function in features to handle the event.
   * @param event
   * @category Touch events
   * @internal
   */
  onElementTouchMove(event) {
    const me = this, {
      lastTouchTarget
    } = me, touch = event.changedTouches[0], {
      pageX,
      pageY
    } = touch, touchTarget = document.elementFromPoint(pageX, pageY);
    if (me.longPressTimeout) {
      me.clearTimeout(me.longPressTimeout);
      me.longPressTimeout = null;
    }
    if (touchTarget !== lastTouchTarget) {
      if (lastTouchTarget) {
        const mouseoutEvent = new MouseEvent("mouseout", ObjectHelper.copyProperties({
          relatedTarget: touchTarget,
          pointerType: "touch",
          bubbles: true
        }, touch, eventProps));
        mouseoutEvent.preventDefault = () => event.preventDefault();
        lastTouchTarget == null ? void 0 : lastTouchTarget.dispatchEvent(mouseoutEvent);
      }
      if (touchTarget) {
        const mouseoverEvent = new MouseEvent("mouseover", ObjectHelper.copyProperties({
          relatedTarget: lastTouchTarget,
          pointerType: "touch",
          bubbles: true
        }, touch, eventProps));
        mouseoverEvent.preventDefault = () => event.preventDefault();
        touchTarget == null ? void 0 : touchTarget.dispatchEvent(mouseoverEvent);
      }
    }
    me.lastTouchTarget = touchTarget;
  }
  /**
   * Touch end, chain this function in features to handle the event.
   * @param event
   * @category Touch events
   * @internal
   */
  onElementTouchEnd(event) {
    const me = this;
    if (me.longPressPerformed) {
      if (event.cancelable) {
        event.preventDefault();
      }
      me.longPressPerformed = false;
    }
    if (me.longPressTimeout) {
      me.clearTimeout(me.longPressTimeout);
      me.longPressTimeout = null;
    }
  }
  onElementLongPress(event) {
  }
  //endregion
  //region Mouse events
  // Trigger events in same style when clicking, dblclicking and for contextmenu
  triggerCellMouseEvent(name, event, cellData = this.getCellDataFromEvent(event)) {
    var _a;
    const me = this;
    if (cellData) {
      const column = me.columns.getById(cellData.columnId), eventData = {
        grid: me,
        record: cellData.record,
        column,
        cellSelector: cellData.cellSelector,
        cellElement: cellData.cellElement,
        target: event.target,
        event
      };
      me.trigger("cell" + StringHelper.capitalize(name), eventData);
      if (name === "click") {
        (_a = column.onCellClick) == null ? void 0 : _a.call(column, eventData);
      }
    }
  }
  /**
   * Mouse down, chain this function in features to handle the event.
   * @param event
   * @category Mouse events
   * @internal
   */
  onElementMouseDown(event) {
    const me = this, cellData = me.getCellDataFromEvent(event);
    me.skipFocusSelection = true;
    if (me.isScrollbarOrRowBorderOrSplitterClick(event)) {
      event.preventDefault();
    } else {
      me.triggerCellMouseEvent("mousedown", event, cellData);
      if (cellData && !event.defaultPrevented) {
        me.onFocusGesture(event);
      }
    }
  }
  isScrollbarOrRowBorderOrSplitterClick({ target, x, y }) {
    if (target.closest(".b-grid-splitter") || target.matches(".b-grid-row, .b-virtual-width")) {
      return true;
    }
    if (target.matches(".b-vertical-overflow")) {
      const rect = target.getBoundingClientRect();
      return x > rect.right - DomHelper.scrollBarWidth;
    } else if (target.matches(".b-horizontal-overflow")) {
      const rect = target.getBoundingClientRect();
      return y > rect.bottom - DomHelper.scrollBarWidth - 1;
    }
  }
  /**
   * Mouse move, chain this function in features to handle the event.
   * @param event
   * @category Mouse events
   * @internal
   */
  onElementMouseMove(event) {
    this.mouseMoveEvent = event;
  }
  /**
   * Mouse up, chain this function in features to handle the event.
   * @param event
   * @category Mouse events
   * @internal
   */
  onElementMouseUp(event) {
  }
  onElementPointerDown(event) {
  }
  /**
   * Pointer up, chain this function in features to handle the event.
   * @param event
   * @category Mouse events
   * @internal
   */
  onElementPointerUp(event) {
  }
  /**
   * Called before {@link #function-onElementClick}.
   * Fires 'beforeElementClick' event which can return false to cancel further onElementClick actions.
   * @param event
   * @fires beforeElementClick
   * @category Mouse events
   * @internal
   */
  onHandleElementClick(event) {
    if (this.trigger("beforeElementClick", { event }) !== false) {
      this.onElementClick(event);
    }
  }
  /**
   * Click, select cell on click and also fire 'cellClick' event.
   * Chain this function in features to handle the dom event.
   * @param event
   * @fires cellClick
   * @category Mouse events
   * @internal
   */
  onElementClick(event) {
    const me = this, cellData = me.getCellDataFromEvent(event);
    if (cellData) {
      me.triggerCellMouseEvent("click", event, cellData);
    }
  }
  onFocusGesture(event) {
    var _a;
    const me = this, { navigationEvent } = me, { target } = event, isContextMenu = event.button === 2, isTreeExpander = !isContextMenu && target.matches(".b-icon-tree-expand, .b-icon-tree-collapse"), isUnfocusedRightClick = !document.hasFocus() && BrowserHelper.isMac && isContextMenu;
    if (isTreeExpander || isUnfocusedRightClick) {
      event.preventDefault();
    } else {
      me.navigationEvent = event;
      const location = new Location(target);
      if (isContextMenu || ((_a = me.focusedCell) == null ? void 0 : _a.equals(location))) {
        let focusOptions;
        if (globalThis.TouchEvent && event instanceof MouseEvent && navigationEvent instanceof TouchEvent && target === navigationEvent.target) {
          focusOptions = { doSelect: false };
        }
        me.focusCell(location, focusOptions);
      }
    }
  }
  /**
   * Double click, fires 'cellDblClick' event.
   * Chain this function in features to handle the dom event.
   * @param {Event} event
   * @fires cellDblClick
   * @category Mouse events
   * @internal
   */
  onElementDblClick(event) {
    const { target } = event;
    this.triggerCellMouseEvent("dblClick", event);
    if (target.classList.contains("b-grid-header-resize-handle")) {
      const header = target.closest(".b-grid-header"), column = this.columns.getById(header.dataset.columnId);
      column.resizeToFitContent();
    }
  }
  /**
   * Mouse over, adds 'hover' class to elements.
   * @param event
   * @fires mouseOver
   * @category Mouse events
   * @internal
   */
  onElementMouseOver(event) {
    var _a;
    if (!this.scrolling) {
      const me = this, { hoveredCell } = me, shouldHover = (typeof event.buttons !== "number" || event.buttons === 0) && event.pointerType !== "touch";
      let cellElement = event.target.closest(".b-grid-cell");
      if (!cellElement && event.target.classList.contains("b-grid-row")) {
        cellElement = (_a = DomHelper.childFromPoint(event.target, event.offsetX, event.offsetY - 2)) == null ? void 0 : _a.closest(".b-grid-cell");
      }
      if (cellElement) {
        if (shouldHover) {
          me.hoveredCell = cellElement;
        }
        if (hoveredCell !== me.hoveredCell) {
          me.triggerCellMouseEvent("mouseOver", event);
        }
      }
      me.trigger("mouseOver", { event });
    }
  }
  /**
   * Mouse out, removes 'hover' class from elements.
   * @param event
   * @fires mouseOut
   * @category Mouse events
   * @internal
   */
  onElementMouseOut(event) {
    var _a;
    const me = this, { target, relatedTarget } = event;
    if (relatedTarget && target.matches(".b-grid-cell") && !target.contains(relatedTarget)) {
      if (!relatedTarget.matches(".b-grid-row")) {
        me.hoveredCell = relatedTarget.closest(".b-grid-cell");
      }
    } else if (!(relatedTarget == null ? void 0 : relatedTarget.matches(".b-grid-row,.b-grid-cell")) && !((_a = me.hoveredCell) == null ? void 0 : _a.contains(relatedTarget))) {
      me.hoveredCell = null;
    }
    if (!me.scrolling) {
      if ((relatedTarget == null ? void 0 : relatedTarget.closest(".b-grid-cell")) !== (target == null ? void 0 : target.closest(".b-grid-cell"))) {
        if (target == null ? void 0 : target.closest(".b-grid-cell")) {
          me.triggerCellMouseEvent("mouseOut", event);
        }
      }
      me.trigger("mouseOut", { event });
    }
  }
  // The may be chained in features
  updateHoveredCell(cellElement, was) {
    var _a, _b, _c;
    const me = this, { selectionMode } = me, rowNumberColumnId = selectionMode.rowNumber && ((_a = me.columns.find((c) => c.type == "rownumber")) == null ? void 0 : _a.id), checkboxSelectionColumnId = selectionMode.checkbox && ((_b = me.checkboxSelectionColumn) == null ? void 0 : _b.id);
    if (was) {
      toggleHover(was, false);
      const prevSelector = DomDataStore.get(was), { row: prevRow } = prevSelector;
      if (prevRow && !prevRow.isDestroyed) {
        setCellHover(rowNumberColumnId, prevRow, false);
        setCellHover(checkboxSelectionColumnId, prevRow, false);
      }
      if (prevSelector == null ? void 0 : prevSelector.columnId) {
        toggleHover((_c = me.columns.getById(prevSelector.columnId)) == null ? void 0 : _c.element, false);
      }
    }
    if (me._hoveredRow && !me._hoveredRow.isDestroyed) {
      me._hoveredRow.removeCls("b-hover");
    }
    me._hoveredRow = null;
    if (cellElement && !me.scrolling) {
      const selector = DomDataStore.get(cellElement), { row } = selector;
      if (row) {
        if (selectionMode.cell && selector.columnId !== rowNumberColumnId && selector.columnId !== checkboxSelectionColumnId) {
          const column = me.columns.getById(selector.columnId);
          toggleHover(cellElement);
          setCellHover(checkboxSelectionColumnId, row);
          setCellHover(rowNumberColumnId, row);
          if ((column == null ? void 0 : column.element) && column.headerHoverable !== false) {
            toggleHover(column.element);
          }
        } else {
          me._hoveredRow = row;
          row.addCls("b-hover");
        }
      } else {
        me.hoveredCell = null;
      }
    }
  }
  //endregion
  //region Keyboard events
  // Hooks on to keyMaps keydown-listener to be able to run before
  keyMapOnKeyDown(event) {
    if (this.element.contains(event.target)) {
      this.onElementKeyDown(event);
      super.keyMapOnKeyDown(event);
    }
  }
  /**
   * To catch all keydowns. For more specific keydown actions, use keyMap.
   * @param event
   * @category Keyboard events
   * @internal
   */
  onElementKeyDown(event) {
    var _a, _b;
    if (event.handled || !this.element.contains(event.target)) {
      return;
    }
    const me = this, focusedCell = me.focusedCell;
    if ((focusedCell == null ? void 0 : focusedCell.isCell) && !focusedCell.isActionable) {
      const cellElement = focusedCell.cell;
      (_b = (_a = me.columns.getById(cellElement.dataset.columnId)).onCellKeyDown) == null ? void 0 : _b.call(_a, { event, cellElement });
    }
  }
  undoRedoKeyPress(event) {
    var _a;
    const { stm } = this.store;
    if (stm && this.enableUndoRedoKeys && !((_a = this.features.cellEdit) == null ? void 0 : _a.isEditing)) {
      stm.onUndoKeyPress(event);
      return true;
    }
    return false;
  }
  // Trigger column.onCellClick when space bar is pressed
  clickCellByKey(event) {
    const me = this, focusedCell = me.focusedCell, cellElement = focusedCell == null ? void 0 : focusedCell.cell, column = me.columns.getById(cellElement.dataset.columnId);
    if ((focusedCell == null ? void 0 : focusedCell.isCell) && !focusedCell.isActionable) {
      if (column.onCellClick) {
        column.onCellClick({
          grid: me,
          column,
          record: me.store.getById(focusedCell.id),
          cellElement,
          target: event.target,
          event
        });
        return true;
      }
    }
    return false;
  }
  /**
   * Key press, chain this function in features to handle the dom event.
   * @param event
   * @category Keyboard events
   * @internal
   */
  onElementKeyPress(event) {
  }
  /**
   * Key up, chain this function in features to handle the dom event.
   * @param event
   * @category Keyboard events
   * @internal
   */
  onElementKeyUp(event) {
  }
  //endregion
  //region Other events
  /**
   * Context menu, chain this function in features to handle the dom event.
   * In most cases, include ContextMenu feature instead.
   * @param event
   * @category Other events
   * @internal
   */
  onElementContextMenu(event) {
    const me = this, cellData = me.getCellDataFromEvent(event);
    if (cellData) {
      me.triggerCellMouseEvent("contextMenu", event, cellData);
      if (DomHelper.isTouchEvent) {
        me.onFocusGesture(event);
      }
    }
  }
  /**
   * Overrides empty base function in View, called when view is resized.
   * @fires resize
   * @param element
   * @param width
   * @param height
   * @param oldWidth
   * @param oldHeight
   * @category Other events
   * @internal
   */
  onInternalResize(element, width, height, oldWidth, oldHeight) {
    const me = this;
    if (me._devicePixelRatio && me._devicePixelRatio !== globalThis.devicePixelRatio) {
      DomHelper.resetScrollBarWidth();
    }
    me._devicePixelRatio = globalThis.devicePixelRatio;
    me._bodyRectangle = Rectangle.client(me.bodyContainer);
    super.onInternalResize(...arguments);
    if (height !== oldHeight) {
      me._bodyHeight = me.bodyContainer.offsetHeight;
      if (me.isPainted) {
        me.rowManager.initWithHeight(me._bodyHeight);
      }
    }
    me.refreshVirtualScrollbars();
    if (width !== oldWidth) {
      me.setTimeout(() => {
        if (!me.isDestroyed) {
          me.updateResponsive(width, oldWidth);
        }
      }, 0);
    }
  }
  //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Grid/lib/Grid/view/mixin/GridFeatures.js
var validConfigTypes = {
  string: 1,
  object: 1,
  function: 1
  // used by CellTooltip
};
var GridFeatures_default = (Target) => class GridFeatures extends (Target || Base) {
  static get $name() {
    return "GridFeatures";
  }
  //region Init
  /**
   * Specify which features to use on the grid. Most features accepts a boolean, some also accepts a config object.
   * Please note that if you are not using the bundles you might need to import the features you want to use.
   *
   * ```javascript
   * const grid = new Grid({
   *     features : {
   *         stripe : true,   // Enable stripe feature
   *         sort   : 'name', // Configure sort feature
   *         group  : false   // Disable group feature
   *     }
   * }
   * ```
   *
   * @config {Object} features
   * @category Common
   */
  /**
   * Map of the features available on the grid. Use it to access them on your grid object
   *
   * ```javascript
   * grid.features.group.expandAll();
   * ```
   *
   * @readonly
   * @member {Object} features
   * @category Common
   */
  set features(features) {
    const me = this, defaultFeatures = GridFeatureManager.getInstanceDefaultFeatures(this);
    features = me._features = ObjectHelper.assign({}, features);
    if (defaultFeatures) {
      Object.keys(defaultFeatures).forEach((feature) => {
        if (!(feature in features)) {
          features[feature] = true;
        }
      });
    }
    const registeredInstanceFeatures = GridFeatureManager.getInstanceFeatures(this);
    for (const featureName of Object.keys(features)) {
      const config = features[featureName];
      if (config) {
        const throwIfError = !globalThis.__bryntum_code_editor_changed;
        if (StringHelper.uncapitalize(featureName) !== featureName) {
          const errorMessage = `Invalid feature name '${featureName}', must start with a lowercase letter`;
          if (throwIfError) {
            throw new Error(errorMessage);
          }
          console.error(errorMessage);
          me._errorDuringConfiguration = errorMessage;
        }
        const featureClass = registeredInstanceFeatures[featureName];
        if (!featureClass) {
          const errorMessage = `Feature '${featureName}' not available, make sure you have imported it`;
          if (throwIfError) {
            throw new Error(errorMessage);
          }
          console.error(errorMessage);
          me._errorDuringConfiguration = errorMessage;
          return;
        }
        Reflect.defineProperty(features, featureName, me.createFeatureInitializer(
          features,
          featureName,
          featureClass,
          config
        ));
      }
    }
  }
  get features() {
    return this._features;
  }
  createFeatureInitializer(features, featureName, featureClass, config) {
    const constructorArgs = [this], construct = featureClass.prototype.construct;
    if (config === true) {
      config = {};
    }
    if (validConfigTypes[typeof config]) {
      constructorArgs[1] = config;
    }
    return {
      configurable: true,
      get() {
        delete features[featureName];
        featureClass.prototype.construct = function(...args) {
          features[featureName] = this;
          construct.apply(this, args);
          featureClass.prototype.construct = construct;
        };
        return new featureClass(...constructorArgs);
      }
    };
  }
  //endregion
  //region Other stuff
  /**
   * Check if a feature is included
   * @param {String} name Feature name, as registered with `GridFeatureManager.registerFeature()`
   * @returns {Boolean}
   * @category Misc
   */
  hasFeature(name) {
    const { features } = this;
    if (features) {
      const featureProp = Object.getOwnPropertyDescriptor(this.features, name);
      if (featureProp) {
        return Boolean(featureProp.value || featureProp.get);
      }
    }
    return false;
  }
  hasActiveFeature(name) {
    var _a, _b;
    return Boolean(((_a = this.features) == null ? void 0 : _a[name]) && !((_b = this.features) == null ? void 0 : _b[name].disabled));
  }
  //endregion
  //region Extract config
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs for the features
  getConfigValue(name, options) {
    var _a, _b;
    if (name === "features") {
      const result = {};
      for (const feature in this.features) {
        const featureConfig = (_b = (_a = this.features[feature]) == null ? void 0 : _a.getCurrentConfig) == null ? void 0 : _b.call(_a, options);
        if (featureConfig) {
          if (ObjectHelper.isEmpty(featureConfig)) {
            if (!GridFeatureManager.isDefaultFeatureForInstance(this.features[feature].constructor, this)) {
              result[feature] = true;
            }
          } else {
            result[feature] = featureConfig;
          }
        } else {
          result[feature] = false;
        }
      }
      return result;
    }
    return super.getConfigValue(name, options);
  }
  //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Grid/lib/Grid/view/mixin/GridResponsive.js
var GridResponsive_default = (Target) => class GridResponsive extends (Target || Base) {
  static get $name() {
    return "GridResponsive";
  }
  static get defaultConfig() {
    return {
      /**
       * "Break points" for which responsive config to use for columns and css.
       * @config {Object<String,Number|String>}
       * @category Misc
       * @default { small : 400, medium : 600, large : '*' }
       */
      responsiveLevels: Object.freeze({
        small: 400,
        medium: 600,
        large: "*"
      })
    };
  }
  /**
   * Find closes bigger level, aka level we want to use.
   * @private
   * @category Misc
   */
  getClosestBiggerLevel(width) {
    const me = this, levels = Object.keys(ObjectHelper.assign({}, me.responsiveLevels));
    let useLevel = null, minDelta = 99995, biggestLevel = null;
    levels.forEach((level) => {
      let levelSize = me.responsiveLevels[level];
      if (!["number", "string"].includes(typeof levelSize)) {
        levelSize = levelSize.levelWidth;
      }
      if (levelSize === "*") {
        biggestLevel = level;
      } else if (width < levelSize) {
        const delta = levelSize - width;
        if (delta < minDelta) {
          minDelta = delta;
          useLevel = level;
        }
      }
    });
    return useLevel || biggestLevel;
  }
  /**
   * Get currently used responsive level (as string)
   * @property {String}
   * @readonly
   * @category Misc
   */
  get responsiveLevel() {
    return this.getClosestBiggerLevel(this.width);
  }
  /**
   * Check if resize lead to a new responsive level and take appropriate actions
   * @private
   * @fires responsive
   * @param width
   * @param oldWidth
   * @category Misc
   */
  updateResponsive(width, oldWidth) {
    const me = this, oldLevel = me.getClosestBiggerLevel(oldWidth), level = me.getClosestBiggerLevel(width);
    if (oldWidth === 0 || oldLevel !== level) {
      const levelConfig = me.responsiveLevels[level];
      if (!["number", "string"].includes(typeof levelConfig)) {
        me.applyState(levelConfig);
      }
      me.columns.forEach((column) => {
        const levels = column.responsiveLevels;
        if (levels) {
          if (levels[level]) {
            column.applyState(levels[level]);
          } else if (levels["*"]) {
            column.applyState(levels["*"]);
          }
        }
      });
      me.element.classList.remove("b-responsive-" + oldLevel);
      me.element.classList.add("b-responsive-" + level);
      me.trigger("responsive", { level, width, oldLevel, oldWidth });
    }
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Grid/lib/Grid/view/mixin/GridSelection.js
var validIdTypes = {
  string: 1,
  number: 1
};
var isDataLoadAction = {
  dataset: 1,
  batch: 1
};
var GridSelection_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static get $name() {
      return "GridSelection";
    }
    construct(config) {
      this._selectedCells = [];
      this._selectedRows = [];
      super.construct(config);
      if (config == null ? void 0 : config.selectedRecords) {
        this.selectedRecords = config.selectedRecords;
      }
    }
    //region Init
    getDefaultGridSelection(clas) {
      if (clas.$name === "GridSelection") {
        return clas.configurable.selectionMode;
      } else if (clas.superclass) {
        return this.getDefaultGridSelection(clas.superclass);
      }
    }
    changeSelectionMode(mode) {
      const me = this;
      if (me.selectionMode) {
        ObjectHelper.assign(me.selectionMode, mode);
        return me.selectionMode;
      }
      me.$defaultGridSelection = me.getDefaultGridSelection(me.constructor);
      return new Proxy(mode, {
        set(obj, prop, value) {
          const old = ObjectHelper.assign({}, obj);
          obj[prop] = value;
          me.updateSelectionMode(obj, old);
          return true;
        }
      });
    }
    /**
     * The selectionMode configuration has been changed.
     * @event selectionModeChange
     * @param {Object} selectionMode The new {@link #config-selectionMode}
     */
    // Will be called if selectionMode config object changes or if one of its properties changes
    updateSelectionMode(mode, oldMode = this.$defaultGridSelection) {
      var _a2, _b;
      const me = this, {
        columns,
        checkboxSelectionColumn
      } = me, changed = {}, { rowReorder } = me.features;
      for (const property in mode) {
        if (mode[property] != oldMode[property]) {
          changed[property] = mode[property];
        }
      }
      if (mode.rowCheckboxSelection && !mode.checkboxOnly) {
        mode.checkboxOnly = true;
        delete mode.rowCheckboxSelection;
      }
      if (changed.column) {
        mode.cell = true;
        mode.multiSelect = true;
      }
      if (changed.cell) {
        mode.checkboxOnly = false;
      }
      if (changed.cell === false) {
        mode.column = false;
      }
      if (changed.checkboxOnly) {
        if (!mode.checkbox) {
          mode.checkbox = true;
        }
        mode.cell = false;
      }
      if (changed.checkbox === false) {
        changed.checkboxOnly = false;
        changed.showCheckAll = false;
      }
      if (changed.showCheckAll) {
        mode.checkbox = mode.checkbox || true;
        mode.multiSelect = true;
      }
      if (changed.includeChildren || changed.includeParents) {
        mode.multiSelect = true;
      }
      if (changed.multiSelect === false) {
        mode.column = mode.showCheckAll = mode.dragSelect = mode.includeChildren = mode.includeParents = false;
      }
      if (changed.dragSelect) {
        if ((rowReorder == null ? void 0 : rowReorder.enabled) && rowReorder.gripOnly !== true) {
          rowReorder.showGrip = rowReorder.gripOnly = true;
        }
        mode.multiSelect = true;
        me._selectionListenersDetachers = {};
      }
      if (changed.dragSelect === false && me._selectionListenersDetachers) {
        (_b = (_a2 = me._selectionListenersDetachers).selectiondrag) == null ? void 0 : _b.call(_a2);
        delete me._selectionListenersDetachers.selectiondrag;
      }
      if (oldMode && (changed.cell !== void 0 || changed.deselectFilteredOutRecords !== void 0 || changed.multiSelect !== void 0)) {
        me.deselectAll();
      }
      if (changed.rowNumber) {
        if (!columns.findRecord("type", "rownumber")) {
          columns.insert(0, {
            ...typeof mode.rowNumber == "object" ? mode.rowNumber : {},
            type: "rownumber"
          });
          me._selectionAddedRowNumberColumn = true;
        }
      } else if (changed.rowNumber === false && me._selectionAddedRowNumberColumn) {
        columns.remove(columns.findRecord("type", "rownumber"));
        delete me._selectionAddedRowNumberColumn;
      }
      if (mode.checkbox !== (oldMode == null ? void 0 : oldMode.checkbox) || mode.checkbox && mode.showCheckAll !== (oldMode == null ? void 0 : oldMode.showCheckAll)) {
        if (me.isConfiguring) {
          me.shouldInitCheckboxSelection = true;
        } else {
          if (oldMode) {
            me.deselectAll();
          }
          me.initCheckboxSelection();
        }
      }
      if (oldMode && mode.checkbox && oldMode.checkbox && mode.checkboxIndex !== oldMode.checkboxIndex && checkboxSelectionColumn) {
        checkboxSelectionColumn.parent.insertChild(checkboxSelectionColumn, columns.getAt(me.checkboxSelectionColumnInsertIndex));
      }
      me.trigger("selectionModeChange", ObjectHelper.clone(mode));
      me.afterSelectionModeChange(mode);
    }
    afterConfigure() {
      if (this.shouldInitCheckboxSelection) {
        this.shouldInitCheckboxSelection = false;
        this.initCheckboxSelection();
      }
      super.afterConfigure();
    }
    initCheckboxSelection() {
      var _a2, _b;
      const me = this, {
        selectionMode,
        columns,
        checkboxSelectionColumn
      } = me, { checkbox } = selectionMode;
      if (checkboxSelectionColumn) {
        me.checkboxSelectionColumn = null;
        columns.remove(checkboxSelectionColumn);
      }
      if (checkbox) {
        const checkColumnClass = ColumnStore.getColumnClass("check"), config = checkbox === true ? null : checkbox;
        if (!checkColumnClass) {
          throw new Error("CheckColumn must be imported for checkbox selection mode to work");
        }
        const col = me.checkboxSelectionColumn = new checkColumnClass(ObjectHelper.assign({
          id: `${me.id}-selection-column`,
          width: "4em",
          minWidth: "4em",
          // Needed because 4em is below Column's default minWidth
          field: null,
          sortable: false,
          filterable: false,
          hideable: false,
          cellCls: "b-checkbox-selection",
          // Always put the checkcolumn in the first region
          region: (_b = (_a2 = me.items) == null ? void 0 : _a2[0]) == null ? void 0 : _b.region,
          showCheckAll: selectionMode.showCheckAll,
          draggable: false,
          resizable: false,
          widgets: [{
            type: "checkbox",
            valueProperty: "checked",
            ariaLabel: "L{Checkbox.toggleRowSelect}"
          }]
        }, config), columns, { isSelectionColumn: true });
        col.meta.depth = 0;
        col._grid = me;
        const checkboxRenderer = col.renderer;
        col.renderer = (renderData) => {
          renderData.value = me.isSelected(renderData.record);
          checkboxRenderer.call(col, renderData);
        };
        col.ion({
          toggle: "onCheckChange",
          toggleAll: "onCheckAllChange",
          thisObj: me
        });
        columns.insert(me.checkboxSelectionColumnInsertIndex, col);
      }
    }
    // Used internally to get the index where to insert checkboxselectioncolumn
    // Default : Insert the checkbox after any rownumber column. If not there, -1 means in at 0.
    // If provided, insert at provided index
    get checkboxSelectionColumnInsertIndex() {
      const { columns } = this;
      let { checkboxIndex } = this.selectionMode;
      if (!checkboxIndex) {
        checkboxIndex = columns.indexOf(columns.findRecord("type", "rownumber")) + 1;
      } else if (typeof checkboxIndex === "string") {
        checkboxIndex = columns.indexOf(columns.getById(checkboxIndex));
      }
      return checkboxIndex;
    }
    //endregion
    // region Events docs & Hooks
    /**
     * The selection has been changed.
     * @event selectionChange
     * @param {'select'|'deselect'} action `'select'`/`'deselect'`
     * @param {'row'|'cell'} mode `'row'`/`'cell'`
     * @param {Grid.view.Grid} source
     * @param {Core.data.Model[]} deselected The records deselected in this operation.
     * @param {Core.data.Model[]} selected The records selected in this operation.
     * @param {Core.data.Model[]} selection The records in the new selection.
     * @param {Grid.util.Location[]} deselectedCells The cells deselected in this operation.
     * @param {Grid.util.Location[]} selectedCells The cells selected in this operation.
     * @param {Grid.util.Location[]} cellSelection The cells in the new selection.
     */
    /**
     * Fires before the selection changes. Returning `false` from a listener prevents the change
     * @event beforeSelectionChange
     * @preventable
     * @param {String} action `'select'`/`'deselect'`
     * @param {'row'|'cell'} mode `'row'`/`'cell'`
     * @param {Grid.view.Grid} source
     * @param {Core.data.Model[]} deselected The records to be deselected in this operation.
     * @param {Core.data.Model[]} selected The records to be selected in this operation.
     * @param {Core.data.Model[]} selection The records in the current selection, before applying `selected` and
     * `deselected`
     * @param {Grid.util.Location[]} deselectedCells The cells to be deselected in this operation.
     * @param {Grid.util.Location[]} selectedCells The cells to be selected in this operation.
     * @param {Grid.util.Location[]} cellSelection  The cells in the current selection, before applying `selectedCells`
     * and `deselectedCells`
     */
    afterSelectionChange() {
    }
    afterSelectionModeChange() {
    }
    // endregion
    // region selectedRecordCollection
    changeSelectedRecordCollection(collection) {
      if (collection == null ? void 0 : collection.isCollection) {
        if (!collection.owner) {
          collection.owner = this;
        }
        return collection;
      }
      return Collection.new(collection, { owner: this });
    }
    updateSelectedRecordCollection(collection) {
      collection.ion({
        change: "onSelectedRecordCollectionChange",
        thisObj: this
      });
    }
    onSelectedRecordCollectionChange({ added = [], removed }) {
      if (this.selectedRecordCollection._fromSelection !== this) {
        added = added.filter((row) => this.isSelectable(row));
        this.performSelection({
          selectedCells: [],
          deselectedCells: [],
          selectedRecords: added,
          deselectedRecords: removed
        });
      }
    }
    changeSelectedRecordCollectionSilent(fn) {
      this.selectedRecordCollection._fromSelection = this;
      const result = fn(this.selectedRecordCollection);
      delete this.selectedRecordCollection._fromSelection;
      return result;
    }
    // endregion
    // region Store
    bindStore(store) {
      var _a2;
      this.detachListeners("selectionStoreFilter");
      store.ion({
        name: "selectionStoreFilter",
        filter: "onStoreFilter",
        thisObj: this
      });
      (_a2 = super.bindStore) == null ? void 0 : _a2.call(this, store);
    }
    unbindStore(oldStore) {
      this.detachListeners("selectionStoreFilter");
      super.unbindStore(oldStore);
    }
    onStoreFilter({ source }) {
      const me = this, deselect = [];
      for (const selectedRecord of me.selectedRows) {
        if (!source.includes(selectedRecord)) {
          deselect.push(selectedRecord);
        }
      }
      const selectionChange = me.prepareSelection(me.selectionMode.deselectFilteredOutRecords ? deselect : []);
      if (me.isCellSelectionMode) {
        const { deselectedCells } = me.prepareSelection(me.getSelectedCellsForRecords(deselect));
        if (deselectedCells == null ? void 0 : deselectedCells.length) {
          selectionChange.deselectedCells = (selectionChange.deselectedCells || []).concat(deselectedCells);
        }
      }
      if (selectionChange.deselectedCells.length || selectionChange.deselectedRecords.length) {
        me.performSelection(selectionChange, false);
        me.updateCheckboxHeader();
      }
    }
    /**
     * Triggered from Grid view when the id of a record has changed.
     * Update the collection indices.
     * @private
     * @category Selection
     */
    onStoreRecordIdChange({ record, oldValue }) {
      var _a2;
      (_a2 = super.onStoreRecordIdChange) == null ? void 0 : _a2.call(this, ...arguments);
      const item = this.selectedRecordCollection.get(oldValue);
      if (item === record) {
        this.selectedRecordCollection.rebuildIndices();
      }
    }
    /**
     * Triggered from Grid view when records get removed from the store.
     * Deselects all records which have been removed.
     * @private
     * @category Selection
     */
    onStoreRemove(event) {
      var _a2;
      (_a2 = super.onStoreRemove) == null ? void 0 : _a2.call(this, event);
      if (!event.isCollapse) {
        const me = this, deselectedRecords = event.records.filter((rec) => this.isSelected(rec));
        if (deselectedRecords.length) {
          const selectionChange = me.prepareSelection(deselectedRecords);
          if (me.isCellSelectionMode) {
            const { deselectedCells } = me.prepareSelection(me.getSelectedCellsForRecords(deselectedRecords));
            if (deselectedCells == null ? void 0 : deselectedCells.length) {
              selectionChange.deselectedCells = (selectionChange.deselectedCells || []).concat(deselectedCells);
            }
          }
          me.performSelection(selectionChange);
        }
      }
    }
    /**
     * Triggered from Grid view when the store changes. This might happen
     * if store events are batched and then resumed.
     * Deselects all records which have been removed.
     * @private
     * @category Selection
     */
    onStoreDataChange({ action, source: store }) {
      var _a2;
      const me = this, { selectionMode } = me;
      let selectionChange;
      (_a2 = super.onStoreDataChange) == null ? void 0 : _a2.call(this, ...arguments);
      if (action === "pageLoad") {
        if (!selectionMode.preserveSelectionOnPageChange) {
          selectionChange = me.prepareSelection(null, null, true);
        }
        me.updateCheckboxHeader();
      } else if (isDataLoadAction[action]) {
        const deselect = [];
        if (selectionMode.preserveSelectionOnDatasetChange === false) {
          selectionChange = me.prepareSelection(null, null, true);
        } else {
          deselect.push(...me.changeSelectedRecordCollectionSilent((c) => c.match(store.storage)));
          for (const selectedCell of me._selectedCells) {
            if (!store.getById(selectedCell.id)) {
              deselect.push(selectedCell);
            }
          }
          selectionChange = me.prepareSelection(deselect);
        }
      }
      if (selectionChange && (selectionChange.deselectAll || selectionChange.deselectedCells.length || selectionChange.deselectedRecords.length || selectionChange.selectedCells.length || selectionChange.selectedRecords.length)) {
        me.performSelection(selectionChange, false);
        me.updateCheckboxHeader();
      }
    }
    /**
     * Triggered from Grid view when all records get removed from the store.
     * Deselects all records.
     * @private
     * @category Selection
     */
    onStoreRemoveAll() {
      var _a2;
      (_a2 = super.onStoreRemoveAll) == null ? void 0 : _a2.call(this);
      this.performSelection(this.prepareSelection(null, null, true), false);
    }
    //endregion
    // region Checkbox selection
    onCheckChange({ checked, record, checkbox }) {
      const me = this, { multiSelect } = me.selectionMode, deselectAll = !multiSelect && checked, deselect = !deselectAll && !checked ? [record] : null, select = checked ? [record] : null;
      me._isCheckboxSelecting = true;
      if (checked && !GlobalEvents_default.shiftKeyDown) {
        me._lastSelectionChecked = record;
      }
      if (checked && multiSelect && me._lastSelectionChecked && GlobalEvents_default.shiftKeyDown) {
        me.performSelection(me.internalSelectRange(me._lastSelectionChecked, record, true));
      } else if (me.performSelection(me.prepareSelection(deselect, select, deselectAll, true)) === false) {
        checkbox.checked = !checkbox.checked;
      }
      me._isCheckboxSelecting = false;
    }
    // Update header checkbox
    updateCheckboxHeader() {
      const { selectionMode, checkboxSelectionColumn, store } = this;
      if (!this._isCheckAllSelecting && selectionMode.checkbox && selectionMode.showCheckAll && (checkboxSelectionColumn == null ? void 0 : checkboxSelectionColumn.headerCheckbox)) {
        const allSelected = store.count && !store.some((record) => this.isSelectable(record) && !this.isSelected(record));
        if (checkboxSelectionColumn.headerCheckbox.checked !== allSelected) {
          checkboxSelectionColumn.suspendEvents();
          checkboxSelectionColumn.headerCheckbox.checked = allSelected;
          checkboxSelectionColumn.resumeEvents();
        }
      }
    }
    onCheckAllChange({ checked }) {
      const me = this;
      me._isCheckboxSelecting = me._isCheckAllSelecting = true;
      me[checked ? "selectAll" : "deselectAll"](me.store.isPaged && me.selectionMode.preserveSelectionOnPageChange);
      me._isCheckboxSelecting = me._isCheckAllSelecting = false;
    }
    //endregion
    // region Selection drag
    // Hook for SalesForce-code to overwrite
    get selectionDragMouseEventListenerElement() {
      return globalThis;
    }
    // Creates new selection range on mouseover. Listener is initiated on mousedown
    onSelectionDrag(event) {
      var _a2;
      const me = this, { _selectionStartCell } = me;
      if (!GlobalEvents_default.isMouseDown()) {
        me.onSelectionEnd();
      }
      if (!_selectionStartCell) {
        return;
      }
      const { items, _lastSelectionDragRegion } = me, cellData = me.getCellDataFromEvent(event, true), region = cellData == null ? void 0 : cellData.column.region, cellSelector = (cellData == null ? void 0 : cellData.cellSelector) && me.normalizeCellContext(cellData.cellSelector);
      if (cellSelector && !cellSelector.equals(me._lastSelectionDragCell, true)) {
        if (!me._isSelectionDragging) {
          me.enableScrollingCloseToEdges(items);
        }
        if (me._clearSelectionOnSelectionDrag && !_selectionStartCell.equals(cellSelector, true)) {
          me.deselectAll();
          delete me._clearSelectionOnSelectionDrag;
        }
        if (_lastSelectionDragRegion && region !== _lastSelectionDragRegion) {
          const leavingSubGrid = me.subGrids[_lastSelectionDragRegion], enteringSubGrid = me.subGrids[region], leavingScrollable = leavingSubGrid.scrollable, enteringScrollable = enteringSubGrid.scrollable, goingForward = items.indexOf(leavingSubGrid) - items.indexOf(enteringSubGrid) < 0;
          enteringScrollable.x = goingForward ? 0 : enteringScrollable.maxX;
          if (goingForward ? leavingScrollable.x < leavingScrollable.maxX - 1 : leavingScrollable.x > 1) {
            return;
          }
          const activeHorizontalScroll = (_a2 = me.scrollManager._activeScroll) == null ? void 0 : _a2.horizontal;
          if (activeHorizontalScroll && activeHorizontalScroll.element !== enteringScrollable.element) {
            activeHorizontalScroll.stopScroll(true);
          }
        }
        me._lastSelectionDragRegion = region;
        me._lastSelectionDragCell = cellSelector;
        me._isSelectionDragging = true;
        const selectionChange = me._lastSelectionDragChange = me.internalSelectRange(
          _selectionStartCell,
          cellSelector,
          me.isRowNumberSelecting(cellSelector) || me.isRowNumberSelecting(_selectionStartCell)
        );
        selectionChange.deselectedCells = selectionChange.deselectedCells.filter((cell) => !me.isCellSelected(cell));
        selectionChange.deselectedRecords = selectionChange.deselectedRecords.filter((record) => !me.isSelected(record));
        me.refreshGridSelectionUI(selectionChange);
        me.trigger("dragSelecting", selectionChange);
      }
    }
    // Tells onSelectionDrag that it's not dragging any longer
    onSelectionEnd() {
      var _a2, _b;
      const me = this, lastChange = me._lastSelectionDragChange;
      if (me._isSelectionDragging && !me._selectionStartCell.equals(me._lastSelectionDragCell, true) && lastChange) {
        me.performSelection(lastChange, false);
      }
      me.disableScrollingCloseToEdges(me.items);
      me._isSelectionDragging = false;
      me._lastSelectionDragChange = me._lastSelectionDragCell = me._lastSelectionDragRegion = null;
      (_b = (_a2 = me._selectionListenersDetachers).selectiondrag) == null ? void 0 : _b.call(_a2);
      delete me._selectionListenersDetachers.selectiondrag;
    }
    // endregion
    // region Column selection
    onHandleElementClick(event) {
      const me = this;
      if (me.selectionMode.rowNumber && event.target.closest(".b-rownumber-header")) {
        event.handled = true;
        if (me.store.count && me.store.some((record) => !me.isSelected(record))) {
          me.selectAll();
        } else {
          me.deselectAll();
        }
      } else if (me.selectionMode.column && event.target.closest(".b-grid-header")) {
        event.handled = true;
        me.selectColumn(event, event.ctrlKey);
      }
      super.onHandleElementClick(event);
    }
    selectColumn(event, addToSelection = false) {
      const me = this, { store } = me, { columnId } = me.getHeaderDataFromEvent(event);
      me._shiftSelectRange = null;
      if (!event.shiftKey) {
        me._shiftSelectColumn = columnId;
      }
      const fromColumnId = event.shiftKey && me._shiftSelectColumn || columnId, selectionChange = me.internalSelectRange(
        me.normalizeCellContext({ id: store.first.id, columnId: fromColumnId }),
        me.normalizeCellContext({ id: store.last.id, columnId })
      );
      if (addToSelection && !selectionChange.selectedCells.some((sc) => !me.isCellSelected(sc))) {
        selectionChange.deselectedCells = selectionChange.selectedCells;
        selectionChange.selectedCells = [];
      }
      if (!addToSelection) {
        selectionChange.deselectedCells = me._selectedCells;
      }
      me.cleanSelectionChange(selectionChange);
      me.performSelection(selectionChange);
    }
    // endregion
    // region Public row/record selection
    /**
     * Checks whether a row is selected. Will not check if any of a row's cells are selected.
     * @param {LocationConfig|String|Number|Core.data.Model} cellSelectorOrId Cell selector { id: x, column: xx } or row
     * id, or record
     * @returns {Boolean} true if row is selected, otherwise false
     * @category Selection
     */
    isSelected(cellSelectorOrId) {
      if (cellSelectorOrId == null ? void 0 : cellSelectorOrId.id) {
        cellSelectorOrId = cellSelectorOrId.id;
      }
      if (validIdTypes[typeof cellSelectorOrId]) {
        return this.selectedRows.some((rec) => rec.id === cellSelectorOrId);
      }
      return false;
    }
    /**
     * Checks whether a cell is selected.
     * @param {LocationConfig|Location} cellSelector Cell selector { id: x, column: xx }
     * @param {Boolean} includeRow to also check if row is selected
     * @returns {Boolean} true if cell is selected, otherwise false
     * @category Selection
     */
    isCellSelected(cellSelector, includeRow) {
      cellSelector = this.normalizeCellContext(cellSelector);
      return this.isCellSelectionMode && this._selectedCells.some((cell) => cellSelector.equals(cell, true)) || includeRow && this.isSelected(cellSelector);
    }
    /**
     * Checks whether a cell or row can be selected.
     * @param {Core.data.Model|LocationConfig|String|Number} recordCellOrId Record or cell or record id
     * @returns {Boolean} true if cell or row can be selected, otherwise false
     * @category Selection
     */
    isSelectable(recordCellOrId) {
      return this.normalizeCellContext({ id: recordCellOrId.id || recordCellOrId }).isSelectable;
    }
    /**
     * The last selected record. Set to select a row or use Grid#selectRow. Set to null to
     * deselect all
     * @property {Core.data.Model}
     * @category Selection
     */
    get selectedRecord() {
      return this.selectedRecords[this.selectedRecords.length - 1] || null;
    }
    set selectedRecord(record) {
      this.selectRow({ record });
    }
    /**
     * Selected records.
     *
     * If {@link #config-selectionMode deselectFilteredOutRecords} is `false` (default) this will include selected
     * records which has been filtered out.
     *
     * If {@link #config-selectionMode preserveSelectionOnPageChange} is `true` (defaults to `false`) this will include
     * selected records on all pages.
     *
     * If {@link #config-selectionMode selectRecordOnCell} is `true` (default) this will include any record which has at
     * least one cell selected.
     *
     * Can be set as array of ids:
     *
     * ```javascript
     * grid.selectedRecords = [1, 2, 4, 6]
     * ```
     *
     * @property {Core.data.Model[]}
     * @accepts {Core.data.Model[]|Number[]}
     * @category Selection
     */
    get selectedRecords() {
      return this.selectedRecordCollection.values;
    }
    set selectedRecords(selectedRecords) {
      this.selectRows(selectedRecords);
    }
    /**
     * Selected records. Records selected via cell selection is excluded.
     *
     * If {@link #config-selectionMode deselectFilteredOutRecords} is `false` (default) this will include selected
     * records which has been filtered out.
     *
     * If {@link #config-selectionMode preserveSelectionOnPageChange} is `true` (defaults to `false`) this will include
     * selected records on all pages.
     *
     * if {@link #config-selectionMode selectRecordOnCell} is `false` this will return same records as
     * {@link #property-selectedRecords}.
     *
     * Can be set as array of ids:
     *
     * ```javascript
     * grid.selectedRecords = [1, 2, 4, 6]
     * ```
     *
     * @property {Core.data.Model[]}
     * @accepts {Core.data.Model[]|Number[]}
     * @category Selection
     */
    get selectedRows() {
      return [...this._selectedRows];
    }
    set selectedRows(selectedRows) {
      this.selectRows(selectedRows);
    }
    /**
     * Removes and adds records to/from the selection at the same time. Analogous
     * to the `Array` `splice` method.
     *
     * Note that if items that are specified for removal are also in the `toAdd` array,
     * then those items are *not* removed then appended. They remain in the same position
     * relative to all remaining items.
     *
     * @param {Number} index Index at which to remove a block of items. Only valid if the
     * second, `toRemove` argument is a number.
     * @param {Object[]|Number} toRemove Either the number of items to remove starting
     * at the passed `index`, or an array of items to remove (If an array is passed, the `index` is ignored).
     * @param  {Object[]|Object} toAdd An item, or an array of items to add.
     * @category Selection
     */
    spliceSelectedRecords(index, toRemove, toAdd) {
      const me = this;
      if (typeof toRemove == "number") {
        const select = [...me.selectedRecords];
        select.splice(index, toRemove, ...ArrayHelper.asArray(toAdd));
        me.performSelection(me.prepareSelection(null, select, true, true));
      } else {
        me.performSelection(me.prepareSelection(toRemove, toAdd, false, true));
      }
    }
    /**
     * Select one row
     * @param {Object|Core.data.Model|String|Number} options A record or id to select or a config object describing the
     * selection
     * @param {Core.data.Model|String|Number} options.record Record or record id, specifying null will deselect all
     * @param {Grid.column.Column} [options.column] The column to scroll into view if `scrollIntoView` is not specified as
     * `false`. Defaults to the grid's first column.
     * @param {Boolean} [options.scrollIntoView] Specify `false` to prevent row from being scrolled into view
     * @param {Boolean} [options.addToSelection] Specify `true` to add to selection, defaults to `false` which replaces
     * @fires selectionChange
     * @category Selection
     */
    selectRow(options) {
      if (typeof options === "number" || options.isModel || !("record" in options)) {
        options = {
          records: [options]
        };
      }
      ObjectHelper.assignIf(options, {
        scrollIntoView: true
      });
      this.selectRows(options);
    }
    /**
     * Select one or more rows
     * @param {Object|Core.data.Model[]|String[]|Number[]} options An array of records or ids for a record or a
     * config object describing the selection
     * @param {Core.data.Model[]|String[]|Number[]} options.records An array of records or ids for a record
     * @param {Grid.column.Column} options.column The column to scroll into view if `scrollIntoView` is not specified as
     * `false`. Defaults to the grid's first column.
     * @param {Boolean} [options.scrollIntoView] Specify `false` to prevent row from being scrolled into view
     * @param {Boolean} [options.addToSelection] Specify `true` to add to selection, defaults to `false` which replaces
     * @category Selection
     */
    selectRows(options) {
      if (!options || Array.isArray(options) || options.isModel || typeof options === "number" || !("records" in options) && !("record" in options)) {
        options = {
          records: ArrayHelper.asArray(options) || []
        };
      }
      const me = this, { store } = me, toSelect = [], {
        records = options.record ? [options.record] : [],
        // Got a record instead of records
        column = me.columns.visibleColumns[0],
        // Default
        scrollIntoView,
        addToSelection = arguments[1]
        // Backwards compatibility
      } = options;
      for (let record of records) {
        record = store.getById(record);
        if (record) {
          toSelect.push(record);
        }
      }
      if (!addToSelection) {
        me._shiftSelectRange = null;
      }
      me.performSelection(me.prepareSelection(null, toSelect, !addToSelection, true));
      if (toSelect.length && scrollIntoView) {
        me.scrollRowIntoView(toSelect[0].id, {
          column
        });
      }
    }
    /**
     * This selects all rows. If store is filtered, this will merge the selection of all visible rows with any selection
     * made prior to filtering.
     * @privateparam {Boolean} [silent] Pass `true` not to fire any event upon selection change
     * @category Selection
     */
    selectAll(silent = false) {
      const { store } = this, records = (store.isGrouped ? store.allRecords : store.records).filter((r) => !r.isSpecialRow);
      this.performSelection(this.prepareSelection(null, records, false, true), true, silent);
    }
    /**
     * Deselects all selected rows and cells. If store is filtered, this will unselect all visible rows only. Any
     * selections made prior to filtering remains.
     * @param {Boolean} [removeCurrentRecordsOnly] Pass `false` to clear all selected records, and `true` to only
     * clear selected records in the current set of records
     * @param {Boolean} [silent] Pass `true` not to fire any event upon selection change
     * @category Selection
     */
    deselectAll(removeCurrentRecordsOnly = false, silent = false) {
      const { store } = this, records = removeCurrentRecordsOnly ? (store.isGrouped ? store.allRecords : store.records).filter((r) => !r.isSpecialRow) : null;
      this.performSelection(this.prepareSelection(records, null, !removeCurrentRecordsOnly), true, silent);
    }
    /**
     * Deselect one row
     * @param {Core.data.Model|String|Number} recordOrId Record or an id for a record
     * @category Selection
     */
    deselectRow(record) {
      this.deselectRows(record);
    }
    /**
     * Deselect one or more rows
     * @param {Core.data.Model|String|Number|Core.data.Model[]|String[]|Number[]} recordOrIds An array of records or ids
     * for a record
     * @category Selection
     */
    deselectRows(recordsOrIds) {
      const { store } = this, records = ArrayHelper.asArray(recordsOrIds).map((recordOrId) => store.getById(recordOrId)).filter((rec) => rec);
      this.performSelection(this.prepareSelection(records));
    }
    /**
     * Selects rows corresponding to a range of records (from fromId to toId)
     * @param {String|Number} fromId
     * @param {String|Number} toId
     * @category Selection
     */
    selectRange(fromId, toId, addToSelection = false) {
      const me = this, { store } = me, selection = me.internalSelectRange(store.getById(fromId), store.getById(toId), true);
      me._shiftSelectRange = null;
      me.performSelection(selection);
    }
    // endregion
    // region Public cell selection
    /**
     * In cell selection mode, this will get the cell selector for the (last) selected cell. Set to an available cell
     * selector to select only that cell. Or use {@link #function-selectCell()} instead.
     * @property {Grid.util.Location}
     * @category Selection
     */
    get selectedCell() {
      return this._selectedCells[this._selectedCells.length - 1];
    }
    set selectedCell(cellSelector) {
      this.selectCells([cellSelector]);
    }
    /**
     * In cell selection mode, this will get the cell selectors for all selected cells. Set to an array of available
     * cell selectors. Or use {@link #function-selectCells()} instead.
     * @property {Grid.util.Location[]}
     * @category Selection
     */
    get selectedCells() {
      return [...this._selectedCells];
    }
    set selectedCells(cellSelectors) {
      this.selectCells(cellSelectors);
    }
    /**
     * CSS selector for the currently selected cell. Format is "[data-index=index] [data-column-id=column]".
     * @type {String}
     * @category Selection
     * @readonly
     */
    get selectedCellCSSSelector() {
      const cell = this.selectedCell, row = cell && this.getRowById(cell.id);
      if (!cell || !row)
        return "";
      return `[data-index=${row.dataIndex}] [data-column-id=${cell.columnId}]`;
    }
    /**
     * If in cell selection mode, this selects one cell. If not, this selects the cell's record.
     * @param {LocationConfig|Object} options A cell selector ({ id: rowId, columnId: 'columnId' }) or a config object
     * @param {LocationConfig} options.cell  A cell selector ({ id: rowId, columnId: 'columnId' })
     * @param {Boolean} [options.scrollIntoView] Specify `false` to prevent row from being scrolled into view
     * @param {Boolean} [options.addToSelection] Specify `true` to add to selection, defaults to `false` which replaces
     * @param {Boolean} [options.silent] Specify `true` to not trigger any events when selecting the cell
     * @returns {Grid.util.Location} Cell selector
     * @fires selectionChange
     * @category Selection
     */
    selectCell(options) {
      var _a2;
      if ("id" in options) {
        options = {
          cell: options
        };
        options = Object.assign({
          scrollIntoView: arguments[1],
          addToSelection: arguments[2],
          silent: arguments[3]
        }, options);
      }
      return (_a2 = this.selectCells(options)) == null ? void 0 : _a2[0];
    }
    /**
     * If in cell selection mode, this selects a number of cells. If not, this selects corresponding records.
     * @param {Object|LocationConfig[]} options An array of cell selectors ({ id: rowId, columnId: 'columnId' }) or a config
     * object
     * @param {LocationConfig[]} options.cells An array of cell selectors { id: rowId, columnId: 'columnId' }
     * @param {Boolean} [options.scrollIntoView] Specify `false` to prevent row from being scrolled into view
     * @param {Boolean} [options.addToSelection] Specify `true` to add to selection, defaults to `false` which replaces
     * @param {Boolean} [options.silent] Specify `true` to not trigger any events when selecting the cell
     * @returns {Grid.util.Location[]} Cell selectors
     * @returns {Grid.util.Location[]} Cell selectors
     * @fires selectionChange
     * @category Selection
     */
    selectCells(options) {
      if (Array.isArray(options)) {
        options = {
          cells: options
        };
      }
      const me = this, {
        cells = options.cell ? [options.cell] : [],
        // Got a cell instead of cells
        scrollIntoView = true,
        addToSelection = false,
        silent = false
      } = options, selectionChange = me.prepareSelection(null, cells, !addToSelection);
      if (!addToSelection) {
        me._shiftSelectRange = null;
      }
      me.performSelection(selectionChange, true, silent);
      if (scrollIntoView) {
        me.scrollRowIntoView(cells[0].id, {
          column: cells[0].columnId
        });
      }
      return me.isCellSelectionMode ? selectionChange.selectedCells : selectionChange.selectedRecords;
    }
    /**
     * If in cell selection mode, this deselects one cell. If not, this deselects the cell's record.
     * @param {LocationConfig} cellSelector
     * @returns {Grid.util.Location} Normalized cell selector
     * @category Selection
     */
    deselectCell(cellSelector) {
      var _a2;
      return (_a2 = this.deselectCells([cellSelector])) == null ? void 0 : _a2[0];
    }
    /**
     * If in cell selection mode, this deselects a number of cells. If not, this deselects corresponding records.
     * @param {LocationConfig[]} cellSelectors
     * @returns {Grid.util.Location[]} Normalized cell selectors
     * @category Selection
     */
    deselectCells(cellSelectors) {
      const selectionChange = this.prepareSelection(cellSelectors);
      this.performSelection(selectionChange);
      return this.isCellSelectionMode ? selectionChange.deselectedCells : selectionChange.deselectedRecords;
    }
    // Used by keymap to toggle selection of currently focused cell.
    toggleSelection(keyEvent) {
      const me = this, {
        _focusedCell,
        selectionMode
      } = me, isRowNumber = me.isRowNumberSelecting(_focusedCell), isSelected = me.isCellSelected(_focusedCell, true);
      if (selectionMode.selectOnKeyboardNavigation === true || _focusedCell.isActionable) {
        return false;
      }
      me.performSelection(
        me.prepareSelection(
          isSelected ? _focusedCell : null,
          isSelected ? null : _focusedCell,
          !selectionMode.multiSelect,
          isRowNumber
        )
      );
      keyEvent.preventDefault();
    }
    /**
     * Selects a range of cells, from a cell selector (Location) to another
     * @param {Grid.util.Location|LocationConfig} from
     * @param {Grid.util.Location|LocationConfig} to
     * @category Selection
     */
    selectCellRange(from, to) {
      this.performSelection(this.internalSelectRange(from, to));
    }
    // endregion
    // region Private convenience functions & properties
    getSelection() {
      if (this.isRowSelectionMode) {
        return this.selectedRecords;
      } else {
        return this.selectedCells;
      }
    }
    // Makes sure the same record or cell isn't deselected and selected at the same time. Selection will take precedence
    cleanSelectionChange(selectionChange) {
      var _a2, _b;
      const {
        deselectedRecords,
        deselectedCells,
        selectedCells,
        deselectedCellRecords
      } = selectionChange, selectedRecordIds = (_a2 = selectionChange.selectedRecords) == null ? void 0 : _a2.map((r) => r.id), selectedCellRecordIds = (_b = selectionChange.selectedCellRecords) == null ? void 0 : _b.map((r) => r.id);
      if ((deselectedRecords == null ? void 0 : deselectedRecords.length) && (selectedRecordIds == null ? void 0 : selectedRecordIds.length)) {
        selectionChange.deselectedRecords = deselectedRecords.filter((dr) => !selectedRecordIds.includes(dr.id));
      }
      if ((deselectedCells == null ? void 0 : deselectedCells.length) && (selectedCells == null ? void 0 : selectedCells.length)) {
        selectionChange.deselectedCells = deselectedCells.filter((dc) => !selectedCells.some((sc) => dc.equals(sc, true)));
      }
      if (deselectedCellRecords.length && (selectedCellRecordIds.length || (selectedRecordIds == null ? void 0 : selectedRecordIds.length))) {
        selectionChange.deselectedCellRecords = deselectedCellRecords.filter((dcr) => {
          return !selectedCellRecordIds.includes(dcr.id) && !selectedRecordIds.includes(dcr.id);
        });
      }
      return selectionChange;
    }
    getSelectedCellsForRecords(records) {
      return this._selectedCells.filter((cell) => cell.id && records.some((record) => record.id === cell.id));
    }
    delayUntilMouseUp(fn) {
      const detacher = EventHelper.on({
        element: globalThis,
        blur: (ev) => fn(ev, detacher),
        mouseup: (ev) => fn(ev, detacher),
        thisObj: this,
        once: true
      });
    }
    get isRowSelectionMode() {
      return !this.isCellSelectionMode;
    }
    get isCellSelectionMode() {
      return this.selectionMode.cell === true;
    }
    // Checks if rowNumber is activated and that all arguments (cellselectors) is of type rownumber
    isRowNumberSelecting(...selectors) {
      return this.selectionMode.rowNumber && !selectors.some((cs) => cs.column.type !== "rownumber");
    }
    selectionShouldIncludeChildren(record) {
      var _a2;
      const { includeChildren, multiSelect } = this.selectionMode;
      return (includeChildren === "always" || includeChildren === true && this._isCheckboxSelecting) && multiSelect && !record.isLeaf && ((_a2 = record.allChildren) == null ? void 0 : _a2.length);
    }
    // endregion
    //region Navigation
    // Used by keyMap to extend selection range
    extendSelectionLeft() {
      this.extendSelection("Left");
    }
    // Used by keyMap to extend selection range
    extendSelectionRight() {
      this.extendSelection("Right");
    }
    // Used by keyMap to extend selection range
    extendSelectionUp() {
      this.extendSelection("Up");
    }
    // Used by keyMap to extend selection range
    extendSelectionDown() {
      this.extendSelection("Down");
    }
    // Used by keyMap to extend selection range
    extendSelection(dir) {
      this._isKeyboardRangeSelecting = true;
      this["navigate" + dir]();
      this._isKeyboardRangeSelecting = false;
    }
    // Called from GridNavigation on mouse or keyboard events
    // Single entry point for all default user selection actions
    onCellNavigate(me, fromCellSelector, toCellSelector, doSelect) {
      var _a2, _b;
      const {
        selectionMode,
        _selectionListenersDetachers
      } = me, { multiSelect, deselectOnClick, dragSelect } = selectionMode, { ctrlKeyDown, shiftKeyDown } = GlobalEvents_default, isMouseLeft = GlobalEvents_default.isMouseDown(), isMouseRight = GlobalEvents_default.isMouseDown(2), currentEvent = GlobalEvents_default.currentMouseDown || GlobalEvents_default.currentKeyDown;
      toCellSelector = me.normalizeCellContext(toCellSelector);
      if (me.selectionDisabled || !doSelect || // Do not affect selection if navigating into header row.
      toCellSelector.rowIndex === -1 || ((_a2 = toCellSelector.record) == null ? void 0 : _a2.isGroupHeader) || // Don't allow keyboard selection if keyboardNavigation is deactivated
      (currentEvent == null ? void 0 : currentEvent.fromKeyMap) && !selectionMode.selectOnKeyboardNavigation || // CheckColumn events are handled by the CheckColumn itself.
      me.columns.getById(toCellSelector.columnId) === me.checkboxSelectionColumn || selectionMode.checkboxOnly || // Don't select if event was handled elsewhere
      (currentEvent == null ? void 0 : currentEvent.handled) === true) {
        return;
      }
      if (!shiftKeyDown) {
        me._isAddingToSelection = ctrlKeyDown && multiSelect;
        me._selectionStartCell = toCellSelector;
      }
      if (multiSelect && dragSelect && isMouseLeft && !_selectionListenersDetachers.selectiondrag && !me.preventDragSelect) {
        _selectionListenersDetachers.selectiondrag = EventHelper.on({
          name: "selectiondrag",
          element: me.selectionDragMouseEventListenerElement,
          blur: "onSelectionEnd",
          mouseup: {
            handler: "onSelectionEnd",
            element: globalThis
          },
          mousemove: "onSelectionDrag",
          thisObj: me
        });
      }
      me.preventDragSelect = false;
      const startCell = me._selectionStartCell, adding = me._isAddingToSelection;
      if ((shiftKeyDown && isMouseLeft || me._isKeyboardRangeSelecting) && startCell && multiSelect) {
        me.performSelection(
          me.internalSelectRange(
            startCell,
            toCellSelector,
            me.isRowNumberSelecting(startCell, toCellSelector)
          )
        );
      } else {
        let delay = false, continueSelecting = true, deselect;
        if (me.isCellSelected(toCellSelector, true)) {
          if (isMouseRight) {
            return;
          }
          if (adding || deselectOnClick) {
            deselect = deselectOnClick ? null : [toCellSelector];
            continueSelecting = false;
          } else if (me.selectedRecords.length + (me.isCellSelectionMode ? me._selectedCells.length : 0) <= 1) {
            return;
          }
          delay = deselectOnClick || multiSelect;
        }
        if (!deselect && !adding) {
          deselect = null;
          if (dragSelect && delay && _selectionListenersDetachers.selectiondrag) {
            me._clearSelectionOnSelectionDrag = true;
          }
        }
        const finishSelection = (mouseUpEvent, detacher) => {
          var _a3;
          detacher == null ? void 0 : detacher();
          if (((_a3 = mouseUpEvent == null ? void 0 : mouseUpEvent.target) == null ? void 0 : _a3.nodeType) === Node.ELEMENT_NODE) {
            const mouseUpSelector = new Location(mouseUpEvent.target);
            if ((mouseUpSelector == null ? void 0 : mouseUpSelector.grid) && !mouseUpSelector.equals(toCellSelector, true)) {
              return;
            }
          }
          if (!shiftKeyDown) {
            me._shiftSelectRange = null;
          }
          me.performSelection(
            me.prepareSelection(
              deselect,
              continueSelecting && [toCellSelector],
              deselect === null,
              continueSelecting && me.isRowNumberSelecting(toCellSelector)
            )
          );
        };
        if ((_b = me.features.rowReorder) == null ? void 0 : _b.isDragging) {
          return;
        }
        if (delay) {
          me.delayUntilMouseUp(finishSelection);
        } else {
          finishSelection();
        }
      }
    }
    // endregion
    // region Internal selection & deselection functions
    /**
     * Used internally to prepare a number of cells or records for selection/deselection depending on if cell
     * selectionMode is activated. This function will not select/deselect anything by itself
     * (that's done in performSelection).
     * @param {LocationConfig[]|Core.data.Model[]} cellSelectorsToDeselect Array of cell selectors or records.
     * @param {LocationConfig[]|Core.data.Model[]} cellSelectorsToSelect Array of cell selectors or records.
     * @param {Boolean} deselectAll Set to `true` to clear all selected records and cells.
     * @param {Boolean} forceRecordSelection Set to `true` to force record selection even if cell selection is active.
     * @returns {Object} selectionChange object to use for UI update
     * @private
     * @category Selection
     */
    prepareSelection(cellSelectorsToDeselect, cellSelectorsToSelect, deselectAll = false, forceRecordSelection = false) {
      const me = this, isDragging = me._isSelectionDragging, {
        includeParents,
        selectRecordOnCell
      } = me.selectionMode, selectedCells = [], deselectedCells = deselectAll ? me._selectedCells : [], selectedRecords = [], deselectedRecords = deselectAll ? me._selectedRows : [], deselectedRecordIndex = ArrayHelper.keyBy(deselectedRecords, "id", () => 1), deselectedCellRecords = deselectAll ? me.selectedRecords.filter((r) => !deselectedRecordIndex[r.id]) : [];
      let selectedCellRecords = [];
      if (!deselectAll && cellSelectorsToDeselect) {
        for (const selector of ArrayHelper.asArray(cellSelectorsToDeselect)) {
          const cellSelector = me.normalizeCellContext(selector), record = (cellSelector == null ? void 0 : cellSelector.record) || (selector.isModel ? selector : me.store.getById(cellSelector.id));
          if (cellSelector.isSpecialRow) {
            continue;
          }
          deselectedCells.push(cellSelector);
          if (record && !deselectedRecordIndex[record.id]) {
            if (isDragging || me.isSelected(record)) {
              deselectedRecords.push(record);
              deselectedRecordIndex[record.id] = 1;
            } else if (selectRecordOnCell && me.selectedRecordCollection.get(record.id) && !deselectedCellRecords.some((dr) => dr.id === record.id)) {
              deselectedCellRecords.push(record);
            }
            if (me.selectionShouldIncludeChildren(record)) {
              for (const child of record.allChildren) {
                if (!deselectedRecordIndex[child.id] && (isDragging || me.isSelected(child))) {
                  deselectedRecords.push(child);
                  deselectedRecordIndex[record.id] = 1;
                }
              }
            }
          }
        }
      }
      if (cellSelectorsToSelect) {
        const selectedRecordIndex = {};
        for (const selector of ArrayHelper.asArray(cellSelectorsToSelect)) {
          const cellSelector = me.normalizeCellContext(selector), record = (cellSelector == null ? void 0 : cellSelector.record) || (selector.isModel ? selector : me.store.getById(cellSelector.id));
          if (!record || cellSelector.isSpecialRow) {
            continue;
          }
          if (me.isCellSelectionMode && !forceRecordSelection) {
            selectedCells.push(cellSelector);
          }
          if ((me.isRowSelectionMode || forceRecordSelection) && !selectedRecordIndex[record.id]) {
            selectedRecords.push(record);
            selectedRecordIndex[record.id] = 1;
            if (me.selectionShouldIncludeChildren(record)) {
              for (const child of record.allChildren) {
                if (!selectedRecordIndex[child.id]) {
                  selectedRecords.push(child);
                  selectedRecordIndex[child.id] = 1;
                }
              }
            }
          }
        }
        if (selectRecordOnCell && selectedCells.length) {
          selectedCellRecords = ArrayHelper.unique(selectedCells.map((c) => c.record)).filter((r) => !selectedRecordIndex[r.id]);
        }
      }
      if (includeParents && (deselectedRecords.length || selectedRecords.length)) {
        const allChanges = [...deselectedRecords, ...selectedRecords], lowestLevelParents = ArrayHelper.unique(
          allChanges.filter((rec) => rec.parent && !rec.allChildren.some((child) => allChanges.includes(child))).map((rec) => rec.parent)
        );
        lowestLevelParents.forEach((parent) => me.toggleParentSelection(parent, selectedRecords, deselectedRecords));
      }
      return me.cleanSelectionChange({
        selectedCells,
        selectedRecords,
        deselectedCells,
        deselectedRecords,
        deselectAll,
        action: (selectedRecords == null ? void 0 : selectedRecords.length) || (selectedCells == null ? void 0 : selectedCells.length) ? "select" : "deselect",
        selectedCellRecords,
        deselectedCellRecords
      });
    }
    toggleParentSelection(parent, toSelect, toDeselect) {
      if (!parent || parent.isRoot) {
        return;
      }
      const isSelected = this.isSelected(parent), inToSelect = toSelect.includes(parent), inToDeselect = toDeselect.includes(parent), childIsSelected = (child) => this.isSelected(child) && !toDeselect.includes(child) || toSelect.includes(child);
      if (this.selectionMode.includeParents === "some") {
        if (parent.allChildren.some(childIsSelected)) {
          if ((!isSelected || inToDeselect) && !inToSelect) {
            toSelect.push(parent);
          }
        } else if (isSelected && !inToDeselect) {
          toDeselect.push(parent);
        }
      } else {
        if (isSelected) {
          if (!inToDeselect && !inToSelect && parent.allChildren.some((child) => toDeselect.includes(child))) {
            toDeselect.push(parent);
          }
        } else if (!inToSelect) {
          if (parent.allChildren.every(childIsSelected)) {
            toSelect.push(parent);
          }
        }
      }
      if (parent.parent) {
        this.toggleParentSelection(parent.parent, toSelect, toDeselect);
      }
    }
    /**
     * Used internally to select a range of cells or records depending on selectionMode. Used in both shift-selection
     * and for drag selection. Will remember current selection range and replace it with new one when it changes. But a
     * range which is completed (drag select mouse up or a new shift range starting point has been set) will remain.
     * This function will not update UI (that's done in refreshGridSelectionUI).
     * @param {LocationConfig} fromSelector
     * @param {LocationConfig} toSelector
     * @returns {Object} selectionChange object to use for UI update
     * @private
     * @category Selection
     */
    internalSelectRange(fromSelector, toSelector, forceRecordSelection = false) {
      const me = this, selectRecords = me.isRowSelectionMode || forceRecordSelection, selectionChange = me.prepareSelection(
        me._shiftSelectRange,
        me.getRange(fromSelector, toSelector, selectRecords),
        false,
        forceRecordSelection
      );
      me._shiftSelectRange = selectionChange[`selected${selectRecords ? "Records" : "Cells"}`];
      return selectionChange;
    }
    /**
     * Used internally to get a range of cell selectors from a start selector to an end selector.
     * @private
     */
    getRange(fromSelector, toSelector, selectRecords = false) {
      const me = this, { store } = me, fromCell = me.normalizeCellContext(fromSelector), toCell = me.normalizeCellContext(toSelector), startRowIndex = Math.min(fromCell.rowIndex, toCell.rowIndex), endRowIndex = Math.max(fromCell.rowIndex, toCell.rowIndex), toSelect = [], startColIndex = Math.min(fromCell.columnIndex, toCell.columnIndex), endColIndex = Math.max(fromCell.columnIndex, toCell.columnIndex);
      if (startRowIndex === -1 || endRowIndex === -1) {
        throw new Error("Record not found in selectRange");
      }
      if (selectRecords) {
        const range = store.getRange(startRowIndex, endRowIndex + 1, false);
        if (toCell.rowIndex < fromCell.rowIndex) {
          range.reverse();
        }
        toSelect.push(...range);
      } else {
        for (let rIx = startRowIndex; rIx <= endRowIndex; rIx++) {
          for (let cIx = startColIndex; cIx <= endColIndex; cIx++) {
            toSelect.push({ rowIndex: rIx, columnIndex: cIx });
          }
        }
      }
      return toSelect.map((s) => me.normalizeCellContext(s));
    }
    // endregion
    // region Update UI & trigger events
    performSelection(selectionChange, updateUI = true, silent = false) {
      const me = this, {
        selectedRecords = [],
        selectedCells = [],
        selectedCellRecords = [],
        deselectedRecords = [],
        deselectedCells = [],
        deselectedCellRecords = [],
        action
      } = selectionChange, allSelectedRecords = [...selectedRecords, ...selectedCellRecords], allDeselectedRecords = [...deselectedRecords, ...deselectedCellRecords], rowMode = me.isRowSelectionMode;
      if (me.trigger("beforeSelectionChange", {
        mode: rowMode ? "row" : "cell",
        action,
        selected: allSelectedRecords,
        deselected: allDeselectedRecords,
        selection: me.selectedRecords,
        selectedCells,
        deselectedCells,
        cellSelection: me.selectedCells
      }) === false) {
        return false;
      }
      if (me._selectedCells === deselectedCells) {
        me._selectedCells = [];
      } else {
        const keepCells = [];
        for (const selectedCell of me._selectedCells) {
          if (!deselectedCells.some((cellSelector) => selectedCell.equals(cellSelector, true))) {
            keepCells.push(selectedCell);
          }
        }
        me._selectedCells = keepCells;
      }
      selectionChange.deselectedRecords = [...selectionChange.deselectedRecords];
      if (deselectedRecords === me._selectedRows) {
        me.changeSelectedRecordCollectionSilent((c) => c.clear());
        me._selectedRows.length = 0;
      } else {
        const keepRecords = [], keepInCollection = [], allDeselectedRecordsIndex = ArrayHelper.keyBy(allDeselectedRecords, "id", () => 1);
        for (const selectedRecord of me.selectedRecords) {
          if (!allDeselectedRecordsIndex[selectedRecord.id]) {
            if (me.isSelected(selectedRecord)) {
              keepRecords.push(selectedRecord);
            } else {
              keepInCollection.push(selectedRecord);
            }
          }
        }
        me.changeSelectedRecordCollectionSilent((c) => c.values = [...keepRecords, ...keepInCollection]);
        me._selectedRows = keepRecords;
      }
      if (selectedCells.length) {
        for (const selectedCell of selectedCells) {
          if (!me._selectedCells.some((cellSelector) => cellSelector.equals(selectedCell, true))) {
            me._selectedCells.push(selectedCell);
          }
        }
      }
      if (selectedRecords.length) {
        me.changeSelectedRecordCollectionSilent((c) => c.add(...selectedRecords));
        me._selectedRows.push(...selectedRecords.filter((r) => !me._selectedRows.some((sr) => sr.id === r.id)));
      }
      if (selectedCellRecords.length) {
        me.changeSelectedRecordCollectionSilent((c) => c.add(...selectedCellRecords));
      }
      if (updateUI) {
        me.refreshGridSelectionUI(selectionChange);
      }
      me.afterSelectionChange(selectionChange);
      if (!silent) {
        me.triggerSelectionChangeEvent(selectionChange);
      }
    }
    // Makes sure the DOM is up-to-date with current selection.
    refreshGridSelectionUI({ selectedRecords, selectedCells, deselectedRecords, deselectedCells }) {
      const me = this, { checkboxSelectionColumn } = me;
      checkboxSelectionColumn == null ? void 0 : checkboxSelectionColumn.suspendEvents();
      me.updateGridSelectionRecords(selectedRecords, true);
      me.updateGridSelectionRecords(deselectedRecords, false);
      me.updateCheckboxHeader();
      checkboxSelectionColumn == null ? void 0 : checkboxSelectionColumn.resumeEvents();
      if (me.isCellSelectionMode) {
        me.updateGridSelectionCells(selectedCells, true);
        if (me.selectionMode.column) {
          me.updateGridSelectionColumns(selectedCells);
        }
      }
      me.updateGridSelectionCells(deselectedCells, false);
    }
    // Loops through records and updates Grid rows
    updateGridSelectionRecords(records, selected) {
      const { checkboxSelectionColumn } = this;
      if (records == null ? void 0 : records.length) {
        for (let i = 0; i < records.length; i++) {
          const row = this.getRowFor(records[i]);
          if (row) {
            row.toggleCls("b-selected", selected);
            row.setAttribute("aria-selected", selected);
            if (checkboxSelectionColumn && !checkboxSelectionColumn.hidden && !records[i].isSpecialRow) {
              row.getCell(checkboxSelectionColumn.id).widget.checked = selected;
            }
          }
        }
      }
    }
    // Loops through cell selectors and updates Grid cell's
    updateGridSelectionCells(cells, selected) {
      if (cells == null ? void 0 : cells.length) {
        for (let i = 0; i < cells.length; i++) {
          const cell = this.getCell(cells[i]);
          if (cell) {
            cell.setAttribute("aria-selected", selected);
            cell.classList.toggle("b-selected", selected);
          }
        }
      }
    }
    // Loops through columns to toggle their selected state
    updateGridSelectionColumns(selectedCells) {
      var _a2;
      const { count } = this.store;
      for (const column of this.columns.visibleColumns) {
        (_a2 = column.element) == null ? void 0 : _a2.classList.toggle(
          "b-selected",
          (selectedCells == null ? void 0 : selectedCells.filter((s) => s.columnId === column.id).length) === count
        );
      }
    }
    triggerSelectionChangeEvent(selectionChange) {
      const {
        selectedRecords = [],
        selectedCells = [],
        selectedCellRecords = [],
        deselectedRecords = [],
        deselectedCells = [],
        deselectedCellRecords = []
      } = selectionChange, allSelectedRecords = [...selectedRecords, ...selectedCellRecords], allDeselectedRecords = [...deselectedRecords, ...deselectedCellRecords], rowMode = this.isRowSelectionMode;
      this.trigger("selectionChange", {
        mode: rowMode ? "row" : "cell",
        action: selectionChange.action,
        selected: allSelectedRecords,
        deselected: allDeselectedRecords,
        selection: this.selectedRecords,
        selectedCells,
        deselectedCells,
        cellSelection: this.selectedCells
      });
    }
    //endregion
    doDestroy() {
      var _a2;
      ((_a2 = this.selectedRecordCollection) == null ? void 0 : _a2.owner) === this && this.selectedRecordCollection.destroy();
      this._selectedCells.length = 0;
      this._selectedRows.length = 0;
      for (const detacher in this._selectionListenersDetachers) {
        this._selectionListenersDetachers[detacher]();
      }
      super.doDestroy();
    }
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "configurable", {
    /**
     * The selection settings, where you can set these boolean flags to control what is selected. Options below:
     * @config {Object} selectionMode
     * @param {Boolean} selectionMode.cell Set to `true` to enable cell selection. This takes precedence over
     * row selection, but rows can still be selected programmatically or with checkbox or RowNumber selection.
     * Required for `column` selection
     * @param {Boolean} selectionMode.multiSelect Allow multiple selection with ctrl and shift+click or with
     * `checkbox` selection. Required for `dragSelect` and `column` selection
     * @param {Boolean|CheckColumnConfig} selectionMode.checkbox Set to `true` to add a checkbox selection column to
     * the grid, or pass a config object for the {@link Grid.column.CheckColumn}
     * @param {Number|String} selectionMode.checkboxIndex Positions the checkbox column at the provided index or to
     * the right of a provided column id. Defaults to 0 or to the right of an included `RowNumberColumn`
     * @param {Boolean} selectionMode.checkboxOnly Select rows only when clicking in the checkbox column. Requires
     * cell selection config to be `false` and checkbox to be set to `true`. This setting was previously named
     * `rowCheckboxSelection`
     * @param {Boolean} selectionMode.showCheckAll Set to `true` to add a checkbox to the selection column header to
     * select/deselect all rows. Requires checkbox to also be set to `true`
     * @param {Boolean} selectionMode.deselectFilteredOutRecords Set to `true` to deselect records when they are
     * filtered out
     * @param {Boolean|String} selectionMode.includeChildren Set to `true` to also select/deselect child nodes
     * when a parent node is selected by toggling the checkbox. Set to `always` to always select/deselect child
     * nodes.
     * @param {Boolean|'all'|'some'} selectionMode.includeParents Set to `all` or `true` to auto select
     * parent if all its children gets selected. If one gets deselected, the parent will also be deselected. Set to
     * 'some' to select parent if one of its children gets selected. The parent will be deselected if all children
     * gets deselected.
     * @param {Boolean} selectionMode.preserveSelectionOnPageChange In `row` selection mode, this flag controls
     * whether the Grid should preserve its selection when loading a new page of a paged data store. Defaults to
     * `false`
     * @param {Boolean} selectionMode.preserveSelectionOnDatasetChange In `row` selection mode, this flag
     * controls whether the Grid should preserve its selection of cells / rows when loading a new dataset
     * (assuming the selected records are included in the newly loaded dataset)
     * @param {Boolean} selectionMode.deselectOnClick Toggles whether the Grid should deselect a selected row or
     * cell when clicking it
     * @param {Boolean} selectionMode.dragSelect Set to `true` to enable multiple selection by dragging.
     * Requires `multiSelect` to also be set to `true`. Also requires the {@link Grid.feature.RowReorder} feature
     * to be set to {@link Grid.feature.RowReorder#config-gripOnly}.
     * @param {Boolean} selectionMode.selectOnKeyboardNavigation Set to `false` to disable auto-selection by keyboard
     * navigation. This will activate the `select` keyboard shortcut.
     * @param {Boolean} selectionMode.column Set to `true` to be able to select whole columns of cells by clicking the header.
     * Requires cell to be set to `true`
     * @param {Boolean|RowNumberColumnConfig} selectionMode.rowNumber Set to `true` or a config object to add a RowNumberColumn
     * which, when clicked, selects the row.
     * @param {Boolean} selectionMode.selectRecordOnCell Set to `false` not to include the record in the
     * `selectedRecords` array when one of the record row's cells is selected.
     * @default
     * @category Selection
     */
    selectionMode: {
      cell: false,
      multiSelect: true,
      checkboxOnly: false,
      checkbox: false,
      checkboxPosition: null,
      showCheckAll: false,
      deselectFilteredOutRecords: false,
      includeChildren: false,
      includeParents: false,
      preserveSelectionOnPageChange: false,
      preserveSelectionOnDatasetChange: true,
      deselectOnClick: false,
      dragSelect: false,
      selectOnKeyboardNavigation: true,
      column: false,
      rowNumber: false,
      selectRecordOnCell: true
    },
    keyMap: {
      "Shift+ArrowUp": "extendSelectionUp",
      "Shift+ArrowDown": "extendSelectionDown",
      "Shift+ArrowLeft": "extendSelectionLeft",
      "Shift+ArrowRight": "extendSelectionRight",
      " ": { handler: "toggleSelection", weight: 10 }
    },
    selectedRecordCollection: {},
    selectionDisabled: false
  }), _a;
};

// ../Grid/lib/Grid/view/mixin/GridState.js
var suspendStoreEvents = (subGrid) => subGrid.columns.suspendEvents();
var resumeStoreEvents = (subGrid) => subGrid.columns.resumeEvents();
var fillSubGridColumns = (subGrid) => {
  subGrid.columns.clearCaches();
  subGrid.columns.fillFromMaster();
};
var compareStateSortIndex = (a, b) => a.stateSortIndex - b.stateSortIndex;
var GridState_default = (Target) => class GridState extends (Target || Base) {
  static get $name() {
    return "GridState";
  }
  static get configurable() {
    return {
      statefulEvents: ["subGridCollapse", "subGridExpand", "horizontalScrollEnd", "stateChange"]
    };
  }
  /**
   * Gets or sets grid's state. Check out {@link Grid.view.mixin.GridState} mixin for details.
   * @member {Object} state
   * @property {Object[]} state.columns
   * @property {Number} state.rowHeight
   * @property {Object} state.scroll
   * @property {Number} state.scroll.scrollLeft
   * @property {Number} state.scroll.scrollTop
   * @property {Array} state.selectedRecords
   * @property {String} state.style
   * @property {String} state.selectedCell
   * @property {Object} state.store
   * @property {Object} state.store.sorters
   * @property {Object} state.store.groupers
   * @property {Object} state.store.filters
   * @property {Object} state.subGrids
   * @category State
   */
  updateStore(store, was) {
    var _a;
    (_a = super.updateStore) == null ? void 0 : _a.call(this, store, was);
    this.detachListeners("stateStoreListeners");
    store == null ? void 0 : store.ion({
      name: "stateStoreListeners",
      filter: "triggerUpdate",
      group: "triggerUpdate",
      sort: "triggerUpdate",
      thisObj: this
    });
  }
  updateColumns(columns, was) {
    var _a;
    (_a = super.updateColumns) == null ? void 0 : _a.call(this, columns, was);
    this.detachListeners("stateColumnListeners");
    columns.ion({
      name: "stateColumnListeners",
      change: "triggerUpdate",
      thisObj: this
    });
  }
  updateRowManager(manager, was) {
    var _a;
    (_a = super.updateRowManager) == null ? void 0 : _a.call(this, manager, was);
    this.detachListeners("stateRowManagerListeners");
    manager.ion({
      name: "stateRowManagerListeners",
      rowHeight: "triggerUpdate",
      thisObj: this
    });
  }
  triggerUpdate() {
    this.trigger("stateChange");
  }
  finalizeInit() {
    super.finalizeInit();
    this.ion({
      selectionChange: "triggerUpdate",
      thisObj: this
    });
  }
  /**
   * Get grid's current state for serialization. State includes rowHeight, headerHeight, selectedCell,
   * selectedRecordId, column states and store state etc.
   * @returns {Object} State object to be serialized
   * @private
   */
  getState() {
    const me = this, style = me.element.style.cssText, state = {
      rowHeight: me.rowHeight
    };
    if (style) {
      state.style = style;
    }
    if (me.selectedCell) {
      const { id, columnId } = me.selectedCell;
      state.selectedCell = { id, columnId };
    }
    state.selectedRecords = me.selectedRecords.map((entry) => entry.id);
    state.columns = me.columns.allRecords.map((column) => column.getState());
    state.store = me.store.state;
    state.scroll = me.storeScroll();
    state.subGrids = {};
    me.eachSubGrid((subGrid) => {
      var _a;
      const config = state.subGrids[subGrid.region] = state.subGrids[subGrid.region] || {};
      if (subGrid.isPainted) {
        if (subGrid.flex == null) {
          config.width = subGrid.width;
        }
      } else {
        if (subGrid.config.width != null) {
          config.width = subGrid.config.width;
        } else {
          config.flex = subGrid.config.flex;
        }
      }
      config.collapsed = (_a = subGrid.collapsed) != null ? _a : false;
      if (config.collapsed) {
        config._beforeCollapseState = subGrid._beforeCollapseState;
      }
    });
    return state;
  }
  /**
   * Apply previously stored state.
   * @param {Object} state
   * @private
   */
  applyState(state) {
    const me = this;
    me.suspendRefresh();
    if ("columns" in state) {
      let columnsChanged = false, needSort = false;
      me.columns.suspendEvents();
      me.eachSubGrid(suspendStoreEvents);
      state.columns.forEach((columnState, index) => {
        const column = me.columns.getById(columnState.id);
        if (column) {
          const columnGeneration = column.generation;
          if ("region" in columnState && !(columnState.region in me.subGrids)) {
            delete columnState.region;
            delete columnState.locked;
          }
          column.applyState(columnState);
          columnsChanged = columnsChanged || column.generation !== columnGeneration;
          column.stateSortIndex = index;
          if (column.allIndex !== index) {
            needSort = columnsChanged = true;
          }
        }
      });
      if (columnsChanged) {
        me.eachSubGrid(fillSubGridColumns);
      }
      if (needSort) {
        me.eachSubGrid((subGrid) => {
          subGrid.columns.records.sort(compareStateSortIndex);
          subGrid.columns.allRecords.sort(compareStateSortIndex);
        });
        me.columns.sort({
          fn: compareStateSortIndex,
          // always sort ascending
          ascending: true
        });
      }
      if (me.isPainted && columnsChanged) {
        me.renderContents();
      }
      me.columns.resumeEvents();
      me.eachSubGrid(resumeStoreEvents);
    }
    if ("subGrids" in state) {
      me.eachSubGrid((subGrid) => {
        if (subGrid.region in state.subGrids) {
          const subGridState = state.subGrids[subGrid.region];
          if ("width" in subGridState) {
            subGrid.width = subGridState.width;
          } else if ("flex" in subGridState) {
            subGrid.flex = subGridState.flex;
          }
          if ("collapsed" in subGridState) {
            subGrid.collapsed = subGridState.collapsed;
            subGrid._beforeCollapseState = subGridState._beforeCollapseState;
          }
        }
        subGrid.clearWidthCache();
      });
    }
    if ("rowHeight" in state) {
      me.rowHeight = state.rowHeight;
    }
    if ("style" in state) {
      me.style = state.style;
    }
    if ("selectedCell" in state) {
      me.selectedCell = state.selectedCell;
    }
    if ("store" in state) {
      me.store.state = state.store;
    }
    if ("selectedRecords" in state) {
      me.selectedRecords = state.selectedRecords;
    }
    me.resumeRefresh(true);
    me.whenVisible(() => me.applyScrollState(state));
  }
  applyScrollState(state) {
    const me = this;
    me.eachSubGrid((s) => s.refreshFakeScroll());
    if ("scroll" in state) {
      me.restoreScroll(state.scroll);
      if (state.scroll.scrollTop) {
        me.element.querySelectorAll(".b-resize-monitored").forEach((element) => {
          const widget = WidgetHelper.fromElement(element);
          if (widget) {
            widget.onElementResize(element);
          }
        });
      }
    }
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Grid/lib/Grid/util/SubGridScroller.js
var immediatePromise = Promise.resolve();
var defaultScrollOptions = {
  block: "nearest"
};
var SubGridScroller = class extends Scroller {
  // The Grid's main Y scroller keeps a list of the X scrollers
  updateYScroller(yScroller) {
    yScroller == null ? void 0 : yScroller.addScroller(this);
  }
  scrollIntoView(element, options = defaultScrollOptions) {
    const me = this, { xDelta, yDelta } = me.getDeltaTo(element, options);
    let result = xDelta || yDelta ? me.scrollBy(xDelta, yDelta, options) : immediatePromise;
    if (options.highlight || options.focus) {
      const scrollPromise = result;
      result = result.then(() => {
        var _a, _b;
        if (scrollPromise.cancelled) {
          return;
        }
        element = element instanceof Rectangle ? element : (_b = (_a = options.elementAfterScroll) == null ? void 0 : _a.call(options)) != null ? _b : element;
        if (options.highlight) {
          if (element instanceof Rectangle) {
            element.translate(-xDelta, -yDelta).highlight();
          } else {
            DomHelper.highlight(element);
          }
        }
        if (options.focus) {
          DomHelper.focusWithoutScrolling(element);
        }
      });
      result.cancel = () => {
        var _a;
        return (_a = scrollPromise.cancel) == null ? void 0 : _a.call(scrollPromise);
      };
    }
    return result;
  }
  scrollBy(xDelta, yDelta, options) {
    const yPromise = yDelta && this.yScroller.scrollBy(0, yDelta, options), xPromise = xDelta && super.scrollBy(xDelta, 0, options);
    const result = Promise.all([xPromise, yPromise]);
    result.cancel = () => {
      var _a, _b;
      (_a = xPromise == null ? void 0 : xPromise.cancel) == null ? void 0 : _a.call(xPromise);
      (_b = yPromise == null ? void 0 : yPromise.cancel) == null ? void 0 : _b.call(yPromise);
      result.cancelled = true;
    };
    if ((xPromise == null ? void 0 : xPromise.cancel) && (yPromise == null ? void 0 : yPromise.cancel)) {
      options.force = true;
    }
    return result;
  }
  scrollTo(toX, toY, options) {
    const yPromise = toY != null && this.yScroller.scrollTo(null, toY, options), xPromise = toX != null && super.scrollTo(toX, null, options);
    if (!(options && options.animate)) {
      this.syncPartners();
    }
    const result = Promise.all([xPromise, yPromise]);
    result.cancel = () => {
      var _a, _b;
      (_a = xPromise == null ? void 0 : xPromise.cancel) == null ? void 0 : _a.call(xPromise);
      (_b = yPromise == null ? void 0 : yPromise.cancel) == null ? void 0 : _b.call(yPromise);
      result.cancelled = true;
    };
    if ((xPromise == null ? void 0 : xPromise.cancel) && (yPromise == null ? void 0 : yPromise.cancel)) {
      options.force = true;
    }
    return result;
  }
  get viewport() {
    const elementBounds = Rectangle.from(this.element), viewport = elementBounds.intersect(Rectangle.from(this.yScroller.element));
    return viewport || new Rectangle(elementBounds.x, elementBounds.y, elementBounds.width, 0);
  }
  set y(y) {
    if (this.yScroller) {
      this.yScroller.y = y;
    }
  }
  get y() {
    return this.yScroller ? this.yScroller.y : 0;
  }
  get maxY() {
    return this.yScroller ? this.yScroller.maxY : 0;
  }
  get scrollHeight() {
    return this.yScroller ? this.yScroller.scrollHeight : 0;
  }
  get clientHeight() {
    return this.yScroller ? this.yScroller.clientHeight : 0;
  }
  suspendEvents() {
    var _a;
    super.suspendEvents();
    (_a = this.yScroller) == null ? void 0 : _a.suspendEvents();
  }
  resumeEvents() {
    var _a;
    super.resumeEvents();
    (_a = this.yScroller) == null ? void 0 : _a.resumeEvents();
  }
};
// SubGrids do not drive the scrollWidth of their partners (Header and Footer)
// SubGrids scrollWidth is propagated from the Header by SubGrid.refreshFakeScroll.
__publicField(SubGridScroller, "configurable", {
  propagate: false,
  overflowX: "hidden-scroll",
  yScroller: null
});
SubGridScroller._$name = "SubGridScroller";

// ../Grid/lib/Grid/view/SubGrid.js
var sumWidths = (t, e) => t + e.getBoundingClientRect().width;
var SubGrid = class extends Widget {
  //region Config
  static get $name() {
    return "SubGrid";
  }
  // Factoryable type name
  static get type() {
    return "subgrid";
  }
  /**
   * Region (name) for this SubGrid
   * @config {String} region
   */
  /**
   * Column store, a store containing the columns for this SubGrid
   * @config {Grid.data.ColumnStore} columns
   */
  static get defaultConfig() {
    return {
      insertRowsBefore: null,
      appendTo: null,
      monitorResize: true,
      headerClass: null,
      footerClass: null,
      /**
       * The subgrid "weight" determines its position among its SubGrid siblings.
       * Higher weights go further right.
       * @config {Number}
       * @category Layout
       */
      weight: null,
      /**
       * Set `true` to start subgrid collapsed. To operate collapsed state on subgrid use
       * {@link #function-collapse}/{@link #function-expand} methods.
       * @config {Boolean}
       * @default false
       */
      collapsed: null,
      scrollable: {
        // Each SubGrid only handles scrolling in the X axis.
        // The owning Grid handles the Y axis.
        overflowX: "hidden-scroll"
      },
      scrollerClass: SubGridScroller,
      // Will be set to true by GridSubGrids if it calculates the subgrids width based on its columns.
      // Used to determine if hiding a column should affect subgrids width
      hasCalculatedWidth: null,
      /**
       * Set `true` to disable moving columns into or out of this SubGrid.
       * @config {Boolean}
       * @default false
       * @private
       */
      sealedColumns: null
    };
  }
  static get configurable() {
    return {
      element: true,
      header: {},
      footer: {},
      virtualScrollerElement: true,
      splitterElement: true,
      headerSplitter: true,
      scrollerSplitter: true,
      footerSplitter: true,
      /**
       * Set to `false` to prevent this subgrid being resized with the {@link Grid.feature.RegionResize} feature
       * @config {Boolean}
       * @default true
       */
      resizable: null,
      role: "presentation"
    };
  }
  //endregion
  //region Init
  /**
   * SubGrid constructor
   * @param config
   * @private
   */
  construct(config) {
    const me = this;
    super.construct(config);
    this.rowManager.ion({ addRows: "onAddRow", thisObj: this });
    if (BrowserHelper.isFirefox) {
      const { element } = me, verticalScroller = me.grid.scrollable;
      let lastScrollTop = 0;
      element.addEventListener("wheel", ({ ctrlKey, deltaY, deltaX }) => {
        const isVerticalScroll = Math.abs(deltaY) > Math.abs(deltaX);
        if (!ctrlKey && isVerticalScroll && !me.scrollEndDetacher && verticalScroller.y !== lastScrollTop) {
          element.style.pointerEvents = "none";
          lastScrollTop = verticalScroller.y;
          me.scrollEndDetacher = verticalScroller.ion({
            scrollEnd: async () => {
              lastScrollTop = verticalScroller.y;
              element.style.pointerEvents = "";
              me.scrollEndDetacher = null;
            },
            once: true
          });
        }
      });
    }
    if (VersionHelper.isTestEnv) {
      me.hideOverlayScroller.delay = 50;
    }
  }
  doDestroy() {
    var _a;
    const me = this;
    me.header.destroy();
    me.footer.destroy();
    (_a = me.fakeScroller) == null ? void 0 : _a.destroy();
    me.virtualScrollerElement.remove();
    me.splitterElements.forEach((element) => element.remove());
    super.doDestroy();
  }
  get barConfig() {
    const me = this, { width, flex } = me.element.style, config = {
      subGrid: me,
      parent: me,
      // Contained widgets need to know their parents
      maxWidth: me.maxWidth || void 0,
      minWidth: me.minWidth || void 0
    };
    if (flex) {
      config.flex = flex;
    } else if (width) {
      config.width = width;
    }
    return config;
  }
  changeHeader(header) {
    return new this.headerClass(ObjectHelper.assign({
      id: this.id + "-header"
    }, this.barConfig, header));
  }
  changeFooter(footer) {
    return new this.footerClass(ObjectHelper.assign({
      id: this.id + "-footer"
    }, this.barConfig, footer));
  }
  //endregion
  //region Splitters
  get splitterElements() {
    return [this.splitterElement, this.headerSplitter, this.scrollerSplitter, this.footerSplitter];
  }
  /**
   * Toggle (add/remove) class for splitters
   * @param {String} cls class name
   * @param {Boolean} [add] actions. Set to `true` to add class, `false` to remove
   * @private
   */
  toggleSplitterCls(cls, add = true) {
    this.splitterElements.forEach((el) => el == null ? void 0 : el.classList[add ? "add" : "remove"](cls));
  }
  hideSplitter() {
    this.splitterElements.forEach((el) => el.classList.add("b-hide-display"));
    this.$showingSplitter = false;
  }
  showSplitter() {
    this.splitterElements.forEach((el) => el.classList.remove("b-hide-display"));
    this.$showingSplitter = true;
  }
  //endregion
  //region Template
  changeElement(element, was) {
    const { region } = this;
    return super.changeElement({
      "aria-label": region,
      className: {
        "b-grid-subgrid": 1,
        [`b-grid-subgrid-${region}`]: region,
        "b-grid-subgrid-collapsed": this.collapsed
      },
      dataset: {
        region
      }
    }, was);
  }
  get rowElementConfig() {
    const { grid } = this;
    return {
      role: "row",
      className: grid.rowCls,
      children: this.columns.visibleColumns.map((column, columnIndex) => ({
        role: "gridcell",
        "aria-colindex": columnIndex + 1,
        tabIndex: grid.cellTabIndex,
        className: "b-grid-cell",
        dataset: {
          column: column.field || "",
          columnId: column.id
        }
      }))
    };
  }
  // Added to DOM in Grid `get bodyConfig`
  changeVirtualScrollerElement() {
    const references = DomHelper.createElement({
      role: "presentation",
      reference: "virtualScrollerElement",
      className: "b-virtual-scroller",
      tabIndex: -1,
      dataset: {
        region: this.region
      },
      children: [
        {
          reference: "virtualScrollerWidth",
          className: "b-virtual-width"
        }
      ]
    });
    this.virtualScrollerWidth = references.virtualScrollerWidth;
    return references.virtualScrollerElement;
  }
  changeSplitterElement() {
    const references = DomHelper.createElement({
      reference: "splitterElement",
      className: {
        "b-grid-splitter": 1,
        "b-grid-splitter-collapsed": this.collapsed,
        "b-hide-display": 1
        // GridSubGrids determines visibility
      },
      dataset: {
        region: this.region
      },
      children: [
        BrowserHelper.isTouchDevice ? { className: "b-splitter-touch-area" } : null,
        {
          className: "b-grid-splitter-inner b-grid-splitter-main",
          children: [
            {
              className: "b-grid-splitter-buttons",
              reference: "splitterButtons",
              children: [
                {
                  className: "b-grid-splitter-button-collapse",
                  children: [
                    BrowserHelper.isTouchDevice ? { className: "b-splitter-button-touch-area" } : null,
                    {
                      tag: "svg",
                      ns: "http://www.w3.org/2000/svg",
                      version: "1.1",
                      className: "b-grid-splitter-button-icon b-gridregion-collapse-arrow",
                      viewBox: "0 0 256 512",
                      children: [
                        {
                          tag: "path",
                          d: "M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z"
                        }
                      ]
                    }
                  ]
                },
                {
                  className: "b-grid-splitter-button-expand",
                  children: [
                    BrowserHelper.isTouchDevice ? { className: "b-splitter-button-touch-area" } : null,
                    {
                      tag: "svg",
                      ns: "http://www.w3.org/2000/svg",
                      version: "1.1",
                      className: "b-grid-splitter-button-icon b-gridregion-expand-arrow",
                      viewBox: "0 0 256 512",
                      children: [
                        {
                          tag: "path",
                          d: "M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
    this.splitterButtons = references.splitterButtons;
    return references.splitterElement;
  }
  get splitterConfig() {
    return {
      className: this.splitterElement.className.trim(),
      children: [
        BrowserHelper.isTouchDevice ? { className: "b-splitter-touch-area" } : null,
        {
          className: "b-grid-splitter-inner"
        }
      ],
      dataset: {
        region: this.region
      }
    };
  }
  changeHeaderSplitter() {
    return DomHelper.createElement(this.splitterConfig);
  }
  changeScrollerSplitter() {
    return DomHelper.createElement(this.splitterConfig);
  }
  changeFooterSplitter() {
    return DomHelper.createElement(this.splitterConfig);
  }
  //endregion
  //region Render
  render(...args) {
    const me = this;
    super.render(...args);
    if (me.grid) {
      me.updateHasFlex();
      me.element.parentNode.insertBefore(me.splitterElement, me.element.nextElementSibling);
      me.splitterElements.forEach(
        (element) => EventHelper.on({
          element,
          mouseenter: "onSplitterMouseEnter",
          mouseleave: "onSplitterMouseLeave",
          thisObj: me
        })
      );
      me._collapsed && me.collapse();
    }
  }
  toggleHeaders(hide) {
    const me = this;
    if (hide) {
      me.headerSplitter.remove();
      me.header.element.remove();
      me.scrollable.removePartner(me.header.scrollable, "x");
    } else {
      const { grid } = me;
      if (!me.isConfiguring) {
        const index = grid.items.indexOf(me) * 2;
        DomHelper.insertAt(grid.headerContainer, me.headerSplitter, index);
        DomHelper.insertAt(grid.headerContainer, me.header.element, index);
        me.refreshHeader();
      }
      me.scrollable.addPartner(me.header.scrollable, "x");
    }
  }
  refreshHeader() {
    this.header.refreshContent();
  }
  refreshColumnHeader(column) {
    this.header.refreshColumn(column);
  }
  refreshFooter() {
    var _a;
    (_a = this.footer) == null ? void 0 : _a.refreshContent();
  }
  // Override to iterate header and footer.
  eachWidget(fn, deep = true) {
    const me = this, widgets = [me.header, me.footer];
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      if (fn(widget) === false) {
        return;
      }
      if (deep && widget.eachWidget) {
        widget.eachWidget(fn, deep);
      }
    }
  }
  //endregion
  //region Size & resize
  /**
   * Sets cell widths. Cannot be done in template because of CSP
   * @private
   */
  fixCellWidths(rowElement) {
    const { visibleColumns } = this.columns;
    let cell = rowElement.firstElementChild, i = 0;
    while (cell) {
      const column = visibleColumns[i], { element } = column;
      if (column.minWidth) {
        cell.style.minWidth = DomHelper.setLength(column.minWidth);
      }
      if (column.maxWidth) {
        cell.style.maxWidth = DomHelper.setLength(column.maxWidth);
      }
      if (column.flex) {
        if (column.childLevel && element) {
          cell.style.flex = `0 0 ${element.getBoundingClientRect().width}px`;
          cell.style.width = "";
        } else {
          cell.style.flex = column.flex;
          cell.style.width = "";
        }
      } else if (column.width) {
        cell.style.width = DomHelper.setLength(column.width);
      } else {
        cell.style.flex = cell.style.width = cell.style.minWidth = "";
      }
      cell = cell.nextElementSibling;
      i++;
    }
  }
  get totalFixedWidth() {
    return this.columns.totalFixedWidth;
  }
  get headerScrollWidth() {
    return [...this.header.contentElement.children].reduce(sumWidths, 0) || this.columns.totalFixedWidth;
  }
  /**
   * Sets header width and scroller width (if needed, depending on if using flex). Might also change the subgrids
   * width, if it uses a width calculated from its columns.
   * @private
   */
  fixWidths() {
    const me = this, {
      element,
      header,
      footer
    } = me;
    if (!me.collapsed) {
      if (me.flex) {
        header.flex = me.flex;
        if (footer) {
          footer.flex = me.flex;
        }
        element.style.flex = me.flex;
      } else {
        if (me.hasCalculatedWidth && !me.columns.some((col) => !col.hidden && col.flex) && me.totalFixedWidth !== me.width) {
          me.width = me.totalFixedWidth;
          me.hasCalculatedWidth = true;
          return;
        }
        let totalWidth = me.width;
        if (!totalWidth && me.hasCalculatedWidth) {
          totalWidth = 0;
          for (const col of me.columns) {
            if (!col.flex && !col.hidden)
              totalWidth += col.width;
          }
        }
        element.style.width = `${totalWidth}px`;
        header.width = totalWidth;
        if (footer) {
          footer.width = totalWidth;
        }
      }
      me.handleHorizontalScroll(false);
    }
  }
  // Safari does not shrink cells the same way as chrome & ff does without having a width set on the row
  fixRowWidthsInSafariEdge() {
    if (BrowserHelper.isSafari) {
      const me = this, { region, header } = me, minWidth = header.calculateMinWidthForSafari();
      me.rowManager.forEach((row) => {
        const element = row.getElement(region);
        if (element) {
          element.style.width = `${minWidth}px`;
        }
      });
      header.headersElement.style.width = `${minWidth}px`;
    }
  }
  /**
   * Get/set SubGrid width, which also sets header and footer width (if available).
   * @property {Number}
   */
  set width(width) {
    var _a, _b;
    const me = this;
    me.hasCalculatedWidth = false;
    super.width = width;
    me.header.width = width;
    me.footer.width = width;
    if (me.isPainted) {
      me.onElementResize();
    }
    if (!me.isExpanding && !me.isCollapsing && !me.isConfiguring) {
      (_b = (_a = me.grid).syncSplits) == null ? void 0 : _b.call(_a, (other) => other.subGrids[me.region] && (other.subGrids[me.region].width = width));
    }
  }
  get width() {
    return super.width;
  }
  /**
   * Get/set SubGrid flex, which also sets header and footer flex (if available).
   * @property {Number|String}
   */
  set flex(flex) {
    var _a, _b;
    const me = this;
    me.hasCalculatedWidth = false;
    me.header.flex = flex;
    me.footer.flex = flex;
    super.flex = flex;
    if (me.isPainted) {
      me.onElementResize();
    }
    if (!me.isExpanding && !me.isCollapsing && !me.isConfiguring) {
      (_b = (_a = me.grid).syncSplits) == null ? void 0 : _b.call(_a, (other) => other.subGrids[me.region] && (other.subGrids[me.region].flex = flex));
    }
  }
  get flex() {
    return super.flex;
  }
  /**
   * Called when grid changes size. SubGrid determines if it has changed size and triggers scroll (for virtual
   * rendering in cells to work when resizing etc.)
   * @private
   */
  onInternalResize(element, newWidth, newHeight, oldWidth, oldHeight) {
    const me = this, { grid } = me;
    super.onInternalResize(...arguments);
    if (grid == null ? void 0 : grid.isPainted) {
      me.syncSplitterButtonPosition();
      if (newWidth !== oldWidth) {
        me.trigger("beforeInternalResize", me);
        grid.trigger("horizontalScroll", {
          grid,
          subGrid: me,
          scrollLeft: me.scrollable.scrollLeft,
          scrollX: me.scrollable.x
        });
        grid.trigger("horizontalScrollEnd", { subGrid: me });
        me.fakeScroller && me.refreshFakeScroll();
        grid.syncFlexedSubCols();
        me.fixRowWidthsInSafariEdge();
      }
      if (newHeight !== oldHeight) {
        grid.onHeightChange();
      }
      me.trigger("afterInternalResize", me);
    }
  }
  /**
   * Keeps the parallel splitters in the header, footer and fake scroller synced in terms
   * of being collapsed or not.
   * @private
   */
  syncParallelSplitters(collapsed) {
    const me = this, { grid } = me;
    if (me.splitterElement && me.$showingSplitter) {
      me.toggleSplitterCls("b-grid-splitter-collapsed", collapsed);
    } else {
      const prevGrid = grid.getSubGrid(grid.getPreviousRegion(me.region));
      if (prevGrid && prevGrid.splitterElement) {
        prevGrid.syncParallelSplitters(collapsed);
      }
    }
  }
  onSplitterMouseEnter() {
    const me = this, { nextSibling } = me;
    if (!me.collapsed && (!nextSibling || !nextSibling.collapsed)) {
      me.toggleSplitterCls("b-hover");
    }
    me.startSplitterButtonSyncing();
  }
  onSplitterMouseLeave() {
    const me = this, { nextSibling } = me;
    me.toggleSplitterCls("b-hover", false);
    if (!me.collapsed && (!nextSibling || !nextSibling.collapsed)) {
      me.stopSplitterButtonSyncing();
    }
  }
  startSplitterButtonSyncing() {
    const me = this;
    if (me.splitterElement) {
      me.syncSplitterButtonPosition();
      if (!me.splitterSyncScrollListener) {
        me.splitterSyncScrollListener = me.grid.scrollable.ion({
          scroll: "syncSplitterButtonPosition",
          thisObj: me
        });
      }
    }
  }
  stopSplitterButtonSyncing() {
    if (this.splitterSyncScrollListener) {
      this.splitterSyncScrollListener();
      this.splitterSyncScrollListener = null;
    }
  }
  syncSplitterButtonPosition() {
    const { grid } = this;
    this.splitterButtons.style.top = `${grid.scrollable.y + (grid.bodyHeight - (this.headerSplitter ? grid.headerHeight : 0)) / 2}px`;
  }
  /**
   * Get the "viewport" for the SubGrid as a Rectangle
   * @property {Core.helper.util.Rectangle}
   * @readonly
   */
  get viewRectangle() {
    const { scrollable } = this;
    return new Rectangle(scrollable.x, scrollable.y, this.width || 0, this.rowManager.viewHeight);
  }
  /**
   * Called when updating column widths to apply 'b-has-flex' which is used when fillLastColumn is configured.
   * @internal
   */
  updateHasFlex() {
    this.scrollable.element.classList.toggle("b-has-flex", this.columns.hasFlex);
  }
  updateResizable(resizable) {
    this.splitterElements.forEach((splitter) => DomHelper.toggleClasses(splitter, ["b-disabled"], !resizable));
  }
  /**
   * Resize all columns in the SubGrid to fit their width, according to their configured
   * {@link Grid.column.Column#config-fitMode}
   */
  resizeColumnsToFitContent() {
    this.grid.beginGridMeasuring();
    this.columns.visibleColumns.forEach((column) => {
      column.resizeToFitContent(null, null, true);
    });
    this.grid.endGridMeasuring();
  }
  //endregion
  //region Scroll
  get overflowingHorizontally() {
    return !this.collapsed && (this.hideHeaders ? this.scrollable.hasOverflow("x") : this.header.scrollable.hasOverflow("x"));
  }
  get overflowingVertically() {
    return false;
  }
  /**
   * Fixes widths of fake scrollers
   * @private
   */
  refreshFakeScroll() {
    const me = this, {
      element,
      virtualScrollerElement,
      virtualScrollerWidth,
      header,
      footer,
      scrollable
    } = me, totalFixedWidth = [...header.contentElement.children].reduce(sumWidths, 0);
    scrollable.scrollWidth = totalFixedWidth;
    element.style.setProperty("--total-column-width", `${me.headerScrollWidth}px`);
    virtualScrollerElement.style.width = element.style.width;
    virtualScrollerElement.style.flex = element.style.flex;
    virtualScrollerElement.style.minWidth = element.style.minWidth;
    virtualScrollerElement.style.maxWidth = element.style.maxWidth;
    header.scrollable.syncOverflowState();
    footer.scrollable.syncOverflowState();
    if (!me.collapsed) {
      if (me.overflowingHorizontally) {
        virtualScrollerWidth.style.width = `${scrollable.scrollWidth || 0}px`;
        me.grid.virtualScrollers.classList.remove("b-hide-display");
      } else {
        virtualScrollerWidth.style.width = 0;
      }
    }
  }
  /**
   * Init scroll syncing for header and footer (if available).
   * @private
   */
  initScroll() {
    const me = this, {
      scrollable,
      virtualScrollerElement,
      grid
    } = me;
    if (BrowserHelper.isFirefox) {
      scrollable.element.addEventListener("wheel", (event) => {
        if (event.deltaX) {
          scrollable.x += event.deltaX;
          event.preventDefault();
        }
      });
    }
    me.fakeScroller = new Scroller({
      element: virtualScrollerElement,
      overflowX: true,
      widget: me
      // To avoid more expensive style lookup for RTL
    });
    scrollable.ion({
      scroll: "onSubGridScroll",
      scrollend: "onSubGridScrollEnd",
      thisObj: me
    });
    if (!grid.hideHorizontalScrollbar) {
      scrollable.addPartner(me.fakeScroller, "x");
      me.refreshFakeScroll();
    }
    if (!grid.hideHeaders) {
      scrollable.addPartner(me.header.scrollable, "x");
    }
    if (!grid.hideFooters) {
      scrollable.addPartner(me.footer.scrollable, "x");
    }
  }
  onSubGridScrollEnd(event) {
    const me = this, { grid } = me;
    me.scrollingToCenter = event == null ? void 0 : event.scrollingToCenter;
    me.scrolling = false;
    me.handleHorizontalScroll(false);
    if (!DomHelper.scrollBarWidth) {
      grid.virtualScrollers.classList.remove("b-scrolling");
      me.hideOverlayScroller();
    }
    grid.trigger("horizontalScrollEnd", { subGrid: me });
  }
  onSubGridScroll(event) {
    const me = this;
    me.scrollingToCenter = event == null ? void 0 : event.scrollingToCenter;
    me.handleHorizontalScroll();
  }
  showOverlayScroller() {
    this.hideOverlayScroller.cancel();
    this.virtualScrollerElement.classList.add("b-show-virtual-scroller");
  }
  // Buffered 1500ms, hides virtual scrollers after scrolling has ended
  hideOverlayScroller() {
    this.virtualScrollerElement.classList.remove("b-show-virtual-scroller");
  }
  set scrolling(scrolling) {
    this._scrolling = scrolling;
  }
  get scrolling() {
    return this._scrolling;
  }
  /**
   * Triggers the 'horizontalScroll' event + makes sure overlay scrollbar is reachable with pointer for a substantial
   * amount of time after scrolling starts
   * @internal
   */
  handleHorizontalScroll(addCls = true) {
    const subGrid = this, { grid } = subGrid;
    if (!subGrid.scrolling && addCls) {
      subGrid.scrolling = true;
      if (!DomHelper.scrollBarWidth) {
        grid.virtualScrollers.classList.add("b-scrolling");
        subGrid.showOverlayScroller();
      }
    }
    grid.trigger("horizontalScroll", {
      subGrid,
      grid,
      scrollLeft: subGrid.scrollable.scrollLeft,
      scrollX: subGrid.scrollable.x,
      scrollingToCenter: subGrid == null ? void 0 : subGrid.scrollingToCenter
    });
  }
  /**
   * Scrolls a column into view (if it is not already). Called by Grid#scrollColumnIntoView, use it instead to not
   * have to care about which SubGrid contains a column.
   * @param {Grid.column.Column|String|Number} column Column name (data) or column index or actual column object.
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} If the column exists, a promise which is resolved when the column header element has been
   * scrolled into view.
   */
  scrollColumnIntoView(column, options) {
    const { columns, header } = this, scroller = header.scrollable;
    column = column instanceof Column ? column : columns.get(column) || columns.getById(column) || columns.getAt(column);
    if (column) {
      const columnHeaderElement = header.getHeader(column.id);
      if (columnHeaderElement) {
        return scroller.scrollIntoView(Rectangle.from(columnHeaderElement, null, true), options);
      }
    }
  }
  //endregion
  //region Rows
  /**
   * Creates elements for the new rows when RowManager has determined that more rows are needed
   * @private
   */
  onAddRow({ source = this.grid.rowManager, rows, isExport }) {
    var _a;
    const me = this, { region } = me, config = me.rowElementConfig, frag = document.createDocumentFragment(), insertRowsBefore = (_a = source.rows[rows[rows.length - 1].index + 1]) == null ? void 0 : _a.elements[region];
    rows.forEach((row) => {
      const rowElement = DomHelper.createElement(config);
      DomHelper.syncClassList(rowElement, row.cls);
      frag.appendChild(rowElement);
      row.addElement(region, rowElement);
      me.fixCellWidths(rowElement);
    });
    if (!isExport) {
      me.fixRowWidthsInSafariEdge();
      me.element.insertBefore(frag, insertRowsBefore || me.insertRowsBefore);
    }
  }
  /**
   * Get all row elements for this SubGrid.
   * @property {HTMLElement[]}
   * @readonly
   */
  get rowElements() {
    return this.fromCache(".b-grid-row", true);
  }
  /**
   * Removes all row elements from the subgrids body and empties cache
   * @private
   */
  clearRows() {
    this.emptyCache();
    const all = this.element.querySelectorAll(".b-grid-row"), range = document.createRange();
    if (all.length) {
      range.setStartBefore(all[0]);
      range.setEndAfter(all[all.length - 1]);
      range.deleteContents();
    }
  }
  // only called when RowManager.rowScrollMode = 'dom', which is not intended to be used
  addNewRowElement() {
    const rowElement = DomHelper.append(this.element, this.rowElementConfig);
    this.fixCellWidths(rowElement);
    return rowElement;
  }
  get store() {
    return this.grid.store;
  }
  get rowManager() {
    var _a;
    return (_a = this.grid) == null ? void 0 : _a.rowManager;
  }
  //endregion
  // region Expand/collapse
  // All usages are commented, uncomment when this is resolved: https://app.assembla.com/spaces/bryntum/tickets/5472
  toggleTransitionClasses(doRemove = false) {
    const me = this, grid = me.grid, nextRegion = grid.getSubGrid(grid.getNextRegion(me.region)), splitter = grid.resolveSplitter(nextRegion);
    nextRegion.element.classList[doRemove ? "remove" : "add"]("b-grid-subgrid-animate-collapse");
    nextRegion.header.element.classList[doRemove ? "remove" : "add"]("b-grid-subgrid-animate-collapse");
    me.element.classList[doRemove ? "remove" : "add"]("b-grid-subgrid-animate-collapse");
    me.header.element.classList[doRemove ? "remove" : "add"]("b-grid-subgrid-animate-collapse");
    splitter.classList[doRemove ? "remove" : "add"]("b-grid-splitter-animate");
  }
  /**
   * Get/set collapsed state
   * @property {Boolean}
   */
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(collapsed) {
    if (this.isConfiguring) {
      this._collapsed = collapsed;
    } else {
      if (collapsed) {
        this.collapse();
      } else {
        this.expand();
      }
    }
  }
  /**
   * Collapses subgrid. If collapsing subgrid is the only one expanded, next subgrid to the right (or previous) will
   * be expanded.
   *
   * ```javascript
   * let locked = grid.getSubGrid('locked');
   * locked.collapse().then(() => {
   *     console.log(locked.collapsed); // Logs 'True'
   * });
   *
   * let normal = grid.getSubGrid('normal');
   * normal.collapse().then(() => {
   *     console.log(locked.collapsed); // Logs 'False'
   *     console.log(normal.collapsed); // Logs 'True'
   * });
   * ```
   *
   * @returns {Promise} A Promise which resolves when this SubGrid is fully collapsed.
   */
  async collapse() {
    var _a;
    const me = this, { grid, element } = me, nextRegion = grid.getSubGrid(grid.getNextRegion(me.region)), splitterOwner = me.splitterElement ? me : me.previousSibling;
    let { _beforeCollapseState } = me, expandedRegions = 0;
    if (grid.rendered && me._collapsed === true) {
      return;
    }
    me.isCollapsing = true;
    grid.eachSubGrid((subGrid) => {
      subGrid !== me && !subGrid._collapsed && ++expandedRegions;
    });
    (_a = grid.syncSplits) == null ? void 0 : _a.call(grid, (other) => {
      var _a2;
      return (_a2 = other.subGrids[me.region]) == null ? void 0 : _a2.collapse();
    });
    if (expandedRegions === 0) {
      if (!nextRegion) {
        return;
      }
      await nextRegion.expand();
    }
    return new Promise((resolve) => {
      if (!_beforeCollapseState) {
        _beforeCollapseState = me._beforeCollapseState = {};
        let widthChanged = false;
        if (me.width) {
          widthChanged = true;
          me.ion({
            afterinternalresize: () => {
              resolve(me);
            },
            thisObj: me,
            once: true
          });
        }
        _beforeCollapseState.width = me.width;
        _beforeCollapseState.elementWidth = element.style.width;
        if (nextRegion.element.style.flex === "") {
          _beforeCollapseState.nextRegionWidth = nextRegion.width;
          nextRegion.width = "";
          nextRegion.flex = "1";
        }
        if (element.style.flex !== "") {
          _beforeCollapseState.flex = element.style.flex;
          me.header.element.style.flex = element.style.flex = "";
        }
        element.classList.add("b-grid-subgrid-collapsed");
        me.virtualScrollerElement.classList.add("b-collapsed");
        me.header.element.classList.add("b-collapsed");
        me.footer.element.classList.add("b-collapsed");
        me._collapsed = true;
        me.width = "";
        if (!widthChanged) {
          me.syncParallelSplitters(true);
          resolve(false);
        }
      } else {
        resolve();
      }
      grid.trigger("subGridCollapse", { subGrid: me });
      grid.afterToggleSubGrid({ subGrid: me, collapsed: true });
      me.isCollapsing = false;
    }).then((value) => {
      var _a2;
      if (!me.isDestroyed) {
        if (value !== false) {
          grid.refreshVirtualScrollbars();
          me.syncParallelSplitters(true);
          (_a2 = splitterOwner.startSplitterButtonSyncing) == null ? void 0 : _a2.call(splitterOwner);
        }
      }
    });
  }
  /**
   * Expands subgrid.
   *
   * ```javascript
   * grid.getSubGrid('locked').expand().then(() => console.log('locked grid expanded'));
   * ```
   *
   * @returns {Promise} A Promise which resolves when this SubGrid is fully expanded.
   */
  async expand() {
    var _a;
    const me = this, {
      grid,
      _beforeCollapseState
    } = me, nextRegion = grid.getSubGrid(grid.getNextRegion(me.region)), splitterOwner = me.splitterElement ? me : me.previousSibling;
    if (grid.rendered && me._collapsed !== true) {
      return;
    }
    me.isExpanding = true;
    (_a = grid.syncSplits) == null ? void 0 : _a.call(grid, (other) => {
      var _a2;
      return (_a2 = other.subGrids[me.region]) == null ? void 0 : _a2.expand();
    });
    return new Promise((resolve) => {
      if (_beforeCollapseState != null) {
        let widthChanged = false;
        if (me.width !== _beforeCollapseState.elementWidth) {
          widthChanged = true;
          me.ion({
            afterinternalresize() {
              me.setTimeout(() => resolve(me), 10);
            },
            thisObj: me,
            once: true
          });
        }
        if (_beforeCollapseState.nextRegionWidth) {
          nextRegion.width = _beforeCollapseState.nextRegionWidth;
          nextRegion.flex = null;
        }
        me.element.classList.remove("b-grid-subgrid-collapsed");
        me._collapsed = false;
        me.virtualScrollerElement.classList.remove("b-collapsed");
        me.header.element.classList.remove("b-collapsed");
        me.footer.element.classList.remove("b-collapsed");
        if (_beforeCollapseState.flex) {
          me.width = _beforeCollapseState.width;
          me.header.flex = me.flex = _beforeCollapseState.flex;
          me.footer.flex = _beforeCollapseState.flex;
          me._width = null;
        } else {
          me.width = _beforeCollapseState.elementWidth;
        }
        me.element.classList.remove("b-grid-subgrid-collapsed");
        me._collapsed = false;
        if (!widthChanged) {
          resolve(false);
        } else {
          splitterOwner.stopSplitterButtonSyncing();
          me.syncParallelSplitters(false);
        }
        delete me._beforeCollapseState;
      } else {
        resolve();
      }
      grid.trigger("subGridExpand", { subGrid: me });
      grid.afterToggleSubGrid({ subGrid: me, collapsed: false });
      me.isExpanding = false;
    });
  }
  hide() {
    var _a, _b;
    (_a = this.header) == null ? void 0 : _a.hide();
    (_b = this.footer) == null ? void 0 : _b.hide();
    this.hideSplitter();
    return super.hide();
  }
  show() {
    var _a, _b;
    const me = this;
    (_a = me.header) == null ? void 0 : _a.show();
    (_b = me.footer) == null ? void 0 : _b.show();
    if (me.region !== me.grid.regions[me.grid.regions.length - 1]) {
      me.showSplitter();
    }
    return super.show();
  }
  //endregion
};
__publicField(SubGrid, "delayable", {
  // This uses a shorter delay for tests, see construct()
  hideOverlayScroller: 1e3
});
SubGrid.initClass();
SubGrid._$name = "SubGrid";

// ../Grid/lib/Grid/view/mixin/GridSubGrids.js
var GridSubGrids_default = (Target) => class GridSubGrids extends (Target || Base) {
  static get $name() {
    return "GridSubGrids";
  }
  static get properties() {
    return {
      /**
       * An object containing the {@link Grid.view.SubGrid} region instances, indexed by subGrid id ('locked', normal'...)
       * @member {Object<String,Grid.view.SubGrid>} subGrids
       * @readonly
       * @category Common
       */
      subGrids: {}
    };
  }
  //region Init
  changeSubGridConfigs(configs) {
    const me = this, usedRegions = /* @__PURE__ */ new Set();
    for (const column of me.columns) {
      const { region } = column;
      if (region) {
        if (!configs[region]) {
          configs[region] = {};
        }
        usedRegions.add(region);
      }
    }
    if (configs.normal && ObjectHelper.isEmpty(configs.normal)) {
      configs.normal = { flex: 1 };
    }
    for (const region of usedRegions) {
      me.createSubGrid(region, configs[region]);
    }
    me.items = me.subGrids;
    return configs;
  }
  createSubGrid(region, config = null) {
    const me = this, subGridColumns = me.columns.makeChained((column) => column.region === region, ["region"]), subGridConfig = ObjectHelper.assign({
      type: "subgrid",
      id: `${me.id}-${region}Subgrid`,
      parent: me,
      grid: me,
      region,
      headerClass: me.headerClass,
      footerClass: me.footerClass,
      columns: subGridColumns,
      // Sort by region unless weight is explicitly defined
      weight: region,
      // SubGridScrollers know about the main grid's scroller so that if asked to
      // scroll vertically they know how to do it.
      scrollable: {
        yScroller: me.scrollable
      }
    }, config || me.subGridConfigs[region]);
    let hasCalculatedWidth = false;
    if (!subGridConfig.flex && !subGridConfig.width) {
      subGridConfig.width = subGridColumns.totalFixedWidth;
      hasCalculatedWidth = true;
    }
    const subGrid = me.subGrids[region] = SubGrid.create(subGridConfig);
    subGrid.element.style.setProperty("--total-column-width", subGridColumns.totalFixedWidth);
    subGrid.hasCalculatedWidth = hasCalculatedWidth;
    if (region === me.regions[0]) {
      subGrid.isFirstRegion = true;
    }
    return subGrid;
  }
  // A SubGrid is added to Grid, add its header etc. too
  onChildAdd(subGrid) {
    if (subGrid.isSubGrid) {
      const me = this, {
        items,
        headerContainer,
        virtualScrollers,
        footerContainer
      } = me, index = items.indexOf(subGrid) * 2;
      if (!me.hideHeaders || me.columns.some((c) => c.flex)) {
        DomHelper.insertAt(headerContainer, subGrid.headerSplitter, index);
        DomHelper.insertAt(headerContainer, subGrid.header.element, index);
      }
      DomHelper.insertAt(virtualScrollers, subGrid.scrollerSplitter, index);
      DomHelper.insertAt(virtualScrollers, subGrid.virtualScrollerElement, index);
      DomHelper.insertAt(footerContainer, subGrid.footerSplitter, index);
      DomHelper.insertAt(footerContainer, subGrid.footer.element, index);
      items.forEach((subGrid2, i) => {
        if (i < items.length - 1) {
          subGrid2.showSplitter();
        }
      });
      if (index === 0 && me.emptyTextEl) {
        subGrid.element.appendChild(me.emptyTextEl);
      }
    }
    return super.onChildAdd(subGrid);
  }
  // A SubGrid is remove from grid, remove its header etc. too
  onChildRemove(subGrid) {
    super.onChildRemove(subGrid);
    if (subGrid.isSubGrid) {
      const { items } = this;
      delete this.subGrids[subGrid.region];
      ArrayHelper.remove(this.regions, subGrid.region);
      subGrid.destroy();
      if (items.length) {
        items[items.length - 1].hideSplitter();
      }
    }
  }
  doDestroy() {
    this.eachSubGrid((subGrid) => subGrid.destroy());
    super.doDestroy();
  }
  //endregion
  //region Iteration & calling
  /**
   * Iterate over all subGrids, calling the supplied function for each.
   * @param {Function} fn Function to call for each instance
   * @param {Object} thisObj `this` reference to call the function in, defaults to the subGrid itself
   * @category SubGrid
   * @internal
   */
  eachSubGrid(fn, thisObj = null) {
    this.items.forEach((subGrid, i) => {
      subGrid.isSubGrid && fn.call(thisObj || subGrid, subGrid, i++);
    });
  }
  /**
   * Call a function by name for all subGrids (that have the function).
   * @param {String} fnName Name of function to call, uses the subGrid itself as `this` reference
   * @param params Parameters to call the function with
   * @returns {*} Return value from first SubGrid is returned
   * @category SubGrid
   * @internal
   */
  callEachSubGrid(fnName, ...params) {
    let returnValue = null;
    this.items.forEach((subGrid, i) => {
      if (subGrid.isSubGrid && subGrid[fnName]) {
        const partialReturnValue = subGrid[fnName](...params);
        if (i === 0)
          returnValue = partialReturnValue;
      }
    });
    return returnValue;
  }
  //endregion
  //region Getters
  get regions() {
    return this.items.map((item) => item.region);
  }
  /**
   * This method should return names of the two last regions in the grid as they are visible in the UI. In case
   * `regions` property cannot be trusted, use different approach. Used by SubGrid and RegionResize to figure out
   * which region should collapse or expand.
   * @returns {String[]}
   * @private
   * @category SubGrid
   */
  getLastRegions() {
    const result = this.regions.slice(-2);
    return result.length === 2 ? result : [result[0], result[0]];
  }
  /**
   * This method should return right neighbour for passed region, or left neighbour in case last visible region is passed.
   * This method is used to decide which subgrid should take space of the collapsed one.
   * @param {String} region
   * @returns {String}
   * @private
   * @category SubGrid
   */
  getNextRegion(region) {
    const regions = this.regions;
    return regions[regions.indexOf(region) + 1] || regions[regions.length - 2];
  }
  getPreviousRegion(region) {
    return this.regions[this.regions.indexOf(region) - 1];
  }
  /**
   * Returns the subGrid for the specified region.
   * @param {String} region Region, eg. locked or normal (per default)
   * @returns {Grid.view.SubGrid} A subGrid
   * @category SubGrid
   */
  getSubGrid(region) {
    return this.subGrids[region];
  }
  /**
   * Get the SubGrid that contains specified column
   * @param {String|Grid.column.Column} column Column "name" or column object
   * @returns {Grid.view.SubGrid}
   * @category SubGrid
   */
  getSubGridFromColumn(column) {
    column = column instanceof Column ? column : this.columns.getById(column) || this.columns.get(column);
    return this.getSubGrid(column.region);
  }
  //endregion
  /**
   * Returns splitter element for subgrid
   * @param {Grid.view.SubGrid|String} subGrid
   * @returns {HTMLElement}
   * @private
   * @category SubGrid
   */
  resolveSplitter(subGrid) {
    const regions = this.getLastRegions();
    let region = subGrid instanceof SubGrid ? subGrid.region : subGrid;
    if (regions[1] === region) {
      region = regions[0];
    }
    return this.subGrids[region].splitterElement;
  }
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.
  get widgetClass() {
  }
};

// ../Grid/lib/Grid/util/GridScroller.js
var xAxis = {
  x: 1
};
var subGridFilter = (w) => w.isSubGrid;
var GridScroller = class extends Scroller {
  addScroller(scroller) {
    (this.xScrollers || (this.xScrollers = [])).push(scroller);
  }
  addPartner(otherScroller, axes = xAxis) {
    if (typeof axes === "string") {
      axes = {
        [axes]: 1
      };
    }
    if (axes.x) {
      otherScroller.owner.initScroll();
      const subGrids = this.widget.items.filter(subGridFilter), otherSubGrids = otherScroller.widget.items.filter(subGridFilter);
      for (let i = 0, { length } = subGrids; i < length; i++) {
        subGrids[i].scrollable.addPartner(otherSubGrids[i].scrollable, "x");
      }
    }
    if (axes.y) {
      super.addPartner(otherScroller, "y");
    }
  }
  removePartner(otherScroller) {
    this.xScrollers.forEach((scroller, i) => {
      if (!scroller.isDestroyed) {
        scroller.removePartner(otherScroller.xScrollers[i]);
      }
    });
    super.removePartner(otherScroller);
  }
  updateOverflowX(overflowX) {
    var _a;
    const hideScroll = overflowX === false;
    (_a = this.xScrollers) == null ? void 0 : _a.forEach((s) => s.overflowX = hideScroll ? "hidden" : "hidden-scroll");
    this.widget.virtualScrollers.classList.toggle("b-hide-display", hideScroll);
  }
  scrollIntoView(element, options) {
    if (element.nodeType === Element.ELEMENT_NODE && this.element.contains(element)) {
      for (const subGridScroller of this.xScrollers) {
        if (subGridScroller.element.contains(element)) {
          return subGridScroller.scrollIntoView(element, options);
        }
      }
    } else {
      return super.scrollIntoView(element, options);
    }
  }
  hasOverflow(axis = "y") {
    return axis === "y" ? this.scrollHeight > this.clientHeight : false;
  }
  set x(x) {
    if (this.xScrollers) {
      this.xScrollers[0].x = x;
    }
  }
  get x() {
    return this.xScrollers ? this.xScrollers[0].x : 0;
  }
};
GridScroller._$name = "GridScroller";

// ../Grid/lib/Grid/view/mixin/GridNavigation.js
var defaultFocusOptions = Object.freeze({});
var disableScrolling = Object.freeze({
  x: false,
  y: false
});
var containedFocusable = function(e) {
  if (!this.focusableFinderCell.contains(e)) {
    return DomHelper.NodeFilter.FILTER_REJECT;
  }
  if (DomHelper.isFocusable(e) && !e.disabled) {
    return DomHelper.NodeFilter.FILTER_ACCEPT;
  }
  return DomHelper.NodeFilter.FILTER_SKIP;
};
var GridNavigation_default = (Target) => {
  var _a;
  return _a = class extends (Target || Base) {
    static get $name() {
      return "GridNavigation";
    }
    onStoreRecordIdChange(event) {
      var _a2;
      (_a2 = super.onStoreRecordIdChange) == null ? void 0 : _a2.call(this, event);
      const { focusedCell } = this, { oldValue, value } = event;
      if (focusedCell && focusedCell.id === oldValue) {
        focusedCell._id = value;
      }
    }
    /**
     * Called by the RowManager when the row which contains the focus location is derendered.
     *
     * This keeps focus in a consistent place.
     * @protected
     */
    onFocusedRowDerender() {
      const me = this, { focusedCell } = me;
      if ((focusedCell == null ? void 0 : focusedCell.id) != null && focusedCell.cell) {
        const isActive = focusedCell.cell.contains(DomHelper.getActiveElement(me));
        if (me.hideHeaders) {
          if (isActive) {
            me.revertFocus();
          }
        } else {
          const headerContext = me.normalizeCellContext({
            rowIndex: -1,
            columnIndex: isActive ? focusedCell.columnIndex : 0
          });
          if (isActive) {
            me.focusCell(headerContext);
          } else {
            headerContext.cell.tabIndex = 0;
          }
        }
        focusedCell.cell.tabIndex = -1;
      }
    }
    navigateFirstCell() {
      this.focusCell(Location.FIRST_CELL);
    }
    navigateFirstColumn() {
      this.focusCell(Location.FIRST_COLUMN);
    }
    navigateLastCell() {
      this.focusCell(Location.LAST_CELL);
    }
    navigateLastColumn() {
      this.focusCell(Location.LAST_COLUMN);
    }
    navigatePrevPage() {
      this.focusCell(Location.PREV_PAGE);
    }
    navigateNextPage() {
      this.focusCell(Location.NEXT_PAGE);
    }
    activateHeader(keyEvent) {
      var _a2;
      if (keyEvent.target.classList.contains("b-grid-header") && this.focusedCell.isColumnHeader) {
        const { column } = this.focusedCell;
        (_a2 = column.onKeyDown) == null ? void 0 : _a2.call(column, keyEvent);
        this.getHeaderElement(column.id).click();
      }
      return false;
    }
    onEscape(keyEvent) {
      var _a2, _b;
      const me = this, { focusedCell } = me;
      if (!keyEvent.target.closest(".b-dragging") && (focusedCell == null ? void 0 : focusedCell.isActionable)) {
        keyEvent.stopImmediatePropagation();
        me._focusedCell = null;
        me.focusCell({
          rowIndex: focusedCell.rowIndex,
          column: focusedCell.column
        }, {
          disableActionable: true
        });
      } else if (me.isNested && me.owner && !((_b = (_a2 = me.owner).catchFocus) == null ? void 0 : _b.call(_a2, { source: me }))) {
        me.revertFocus(true);
      }
    }
    onTab(keyEvent) {
      const { target } = keyEvent, {
        focusedCell,
        bodyElement
      } = this, {
        isActionable,
        actionTargets
      } = focusedCell, isEditable = isActionable && DomHelper.isEditable(target) && !target.readOnly;
      if (isEditable && target === actionTargets[actionTargets.length - 1]) {
        keyEvent.preventDefault();
        this.navigateRight(keyEvent);
      } else if (!isActionable || target === actionTargets[actionTargets.length - 1]) {
        bodyElement.style.display = "none";
        this.requestAnimationFrame(() => bodyElement.style.display = "");
        return false;
      }
    }
    onShiftTab(keyEvent) {
      const me = this, { target } = keyEvent, {
        focusedCell,
        bodyElement
      } = me, {
        cell,
        isActionable,
        actionTargets
      } = focusedCell, isEditable = isActionable && DomHelper.isEditable(target) && !target.readOnly, onFirstCell = focusedCell.columnIndex === 0 && focusedCell.rowIndex === (me.hideHeaders ? 0 : -1);
      if (!onFirstCell && isEditable && target === actionTargets[0]) {
        keyEvent.preventDefault();
        me.navigateLeft(keyEvent);
      } else if (!isActionable || target === actionTargets[0]) {
        const f = !onFirstCell && !me.hideHeaders && me.focusCell({
          rowIndex: -1,
          column: 0
        }, {
          disableActionable: true
        });
        if (f) {
          f.cell.tabIndex = -1;
          cell.tabIndex = 0;
          me._focusedCell = focusedCell;
        } else {
          bodyElement.style.display = "none";
          me.requestAnimationFrame(() => bodyElement.style.display = "");
        }
        return false;
      }
    }
    onSpace(keyEvent) {
      if (!this.focusedCell.isActionable) {
        keyEvent.preventDefault();
      }
      return false;
    }
    //region Cell
    /**
     * Triggered when a user navigates to a grid cell
     * @event navigate
     * @param {Grid.view.Grid} grid The grid instance
     * @param {Grid.util.Location} last The previously focused location
     * @param {Grid.util.Location} location The new focused location
     * @param {Event} [event] The UI event which caused navigation.
     */
    /**
     * Grid Location which encapsulates the currently focused cell.
     * Set to focus a cell or use {@link #function-focusCell}.
     * @property {Grid.util.Location}
     */
    get focusedCell() {
      return this._focusedCell;
    }
    /**
     * This property is `true` if an element _within_ a cell is focused.
     * @property {Boolean}
     * @readonly
     */
    get isActionableLocation() {
      var _a2;
      return (_a2 = this._focusedCell) == null ? void 0 : _a2.isActionable;
    }
    set focusedCell(cellSelector) {
      this.focusCell(cellSelector);
    }
    get focusedRecord() {
      var _a2;
      return (_a2 = this._focusedCell) == null ? void 0 : _a2.record;
    }
    /**
     * CSS selector for currently focused cell. Format is "[data-index=index] [data-column-id=columnId]".
     * @property {String}
     * @readonly
     */
    get cellCSSSelector() {
      const cell = this._focusedCell;
      return cell ? `[data-index=${cell.rowIndex}] [data-column-id=${cell.columnId}]` : "";
    }
    afterHide() {
      super.afterHide(...arguments);
      this.lastFocusedCell = null;
    }
    /**
     * Checks whether a cell is focused.
     * @param {LocationConfig|String|Number} cellSelector Cell selector { id: x, columnId: xx } or row id
     * @returns {Boolean} true if cell or row is focused, otherwise false
     */
    isFocused(cellSelector) {
      var _a2;
      return Boolean((_a2 = this._focusedCell) == null ? void 0 : _a2.equals(this.normalizeCellContext(cellSelector)));
    }
    get focusElement() {
      var _a2;
      if (!this.isDestroying) {
        let focusCell;
        if (this.store.count && this._focusedCell) {
          focusCell = this._focusedCell.target;
        } else {
          focusCell = this.normalizeCellContext({
            rowIndex: -1,
            columnIndex: ((_a2 = this._focusedCell) == null ? void 0 : _a2.columnIndex) || 0
          }).target;
        }
        const superFocusEl = super.focusElement;
        if (superFocusEl && (!focusCell || focusCell.compareDocumentPosition(superFocusEl) === Node.DOCUMENT_POSITION_PRECEDING)) {
          return superFocusEl;
        }
        return focusCell;
      }
    }
    onInternalPaint({ firstPaint }) {
      var _a2;
      const me = this;
      (_a2 = super.onInternalPaint) == null ? void 0 : _a2.call(this, ...arguments);
      const defaultFocus = this.normalizeCellContext({
        rowIndex: me.hideHeaders ? 0 : -1,
        column: me.hideHeaders ? 0 : me.columns.find((col) => !col.hidden && col.isFocusable)
      });
      if (defaultFocus.cell) {
        defaultFocus._isDefaultFocus = true;
        me._focusedCell = defaultFocus;
        const { target } = defaultFocus;
        if (target === defaultFocus.cell) {
          defaultFocus.cell.tabIndex = 0;
        }
      }
    }
    /**
     * This function handles focus moving into, or within the grid.
     * @param {Event} focusEvent
     * @private
     */
    onGridBodyFocusIn(focusEvent) {
      var _a2, _b, _c;
      const me = this, { bodyElement } = me, lastFocusedCell = me.focusedCell, lastTarget = (lastFocusedCell == null ? void 0 : lastFocusedCell.initialTarget) || (lastFocusedCell == null ? void 0 : lastFocusedCell.target), {
        target,
        relatedTarget
      } = focusEvent, targetCell = target.closest(me.focusableSelector);
      if (targetCell && (!GlobalEvents_default.currentMouseDown || GlobalEvents_default.isMouseDown(0) || GlobalEvents_default.isMouseDown(2))) {
        const cellSelector = new Location(target), { cell } = cellSelector, lastCell = lastFocusedCell == null ? void 0 : lastFocusedCell.cell, actionTargets = cellSelector.actionTargets = me.findFocusables(targetCell), doSelect = (!me._fromFocusCell || me.selectOnFocus) && (target === cell || me._selectActionCell) && !(target == null ? void 0 : target._isRevertingFocus);
        if (!me.store.getById(targetCell.parentNode.dataset.id) && cell !== targetCell) {
          cell.focus({ preventScroll: true });
          return;
        }
        if (target.matches(me.focusableSelector)) {
          if (me.disableActionable) {
            cellSelector._target = cell;
          } else if (actionTargets.length) {
            me._selectActionCell = ((_a2 = GlobalEvents_default.currentMouseDown) == null ? void 0 : _a2.target) === target;
            actionTargets[0].focus();
            delete me._selectActionCell;
            return;
          }
        } else {
          if ((lastFocusedCell == null ? void 0 : lastFocusedCell.target) && relatedTarget && (!GlobalEvents_default.isMouseDown() || !bodyElement.contains((_b = GlobalEvents_default.currentMouseDown) == null ? void 0 : _b.target)) && !bodyElement.contains(relatedTarget) && !cellSelector.equals(lastFocusedCell)) {
            lastTarget.focus();
            return;
          }
          cellSelector._target = target;
        }
        if (lastCell) {
          lastCell.classList.remove("b-focused");
          lastCell.tabIndex = -1;
        }
        if (cell) {
          cell.classList.add("b-focused");
          cellSelector.column.onCellFocus(cellSelector);
          if (cell === target) {
            cell.tabIndex = 0;
          }
          if (cell.contains(focusEvent.relatedTarget)) {
            if (lastTarget === target) {
              return;
            }
          }
        }
        me._focusedCell = cellSelector;
        (_c = me.onCellNavigate) == null ? void 0 : _c.call(me, me, lastFocusedCell, cellSelector, doSelect);
        me.trigger("navigate", { lastFocusedCell, focusedCell: cellSelector, event: focusEvent });
      } else if (!target.closest(".b-rowexpander-body")) {
        lastTarget == null ? void 0 : lastTarget.focus({ preventScroll: true });
      }
    }
    findFocusables(cell) {
      const { focusableFinder } = this, result = [];
      focusableFinder.currentNode = this.focusableFinderCell = cell;
      for (let focusable = focusableFinder.nextNode(); focusable; focusable = focusableFinder.nextNode()) {
        result.push(focusable);
      }
      return result;
    }
    get focusableFinder() {
      const me = this;
      if (!me._focusableFinder) {
        me._focusableFinder = me.setupTreeWalker(me.bodyElement, DomHelper.NodeFilter.SHOW_ELEMENT, {
          acceptNode: containedFocusable.bind(me)
        });
      }
      return me._focusableFinder;
    }
    /**
     * Sets the passed record as the current focused record for keyboard navigation and selection purposes.
     * This API is used by Combo to activate items in its picker.
     * @param {Core.data.Model|Number|String} activeItem The record, or record index, or record id to highlight as the active ("focused") item.
     * @internal
     */
    restoreActiveItem(item = this._focusedCell) {
      if (this.rowManager.count) {
        if (!isNaN(item)) {
          item = this.store.getAt(item);
        } else if (!item.isModel) {
          item = this.store.getById(item);
        }
        return this.focusCell(item);
      }
    }
    /**
     * Navigates to a cell and/or its row (depending on selectionMode)
     * @param {LocationConfig} cellSelector Cell location descriptor
     * @param {Object} options Modifier options for how to deal with focusing the cell. These
     * are used as the {@link Core.helper.util.Scroller#function-scrollTo} options.
     * @param {BryntumScrollOptions|Boolean} [options.scroll=true] Pass `false` to not scroll the cell into view, or a
     * scroll options object to affect the scroll.
     * @returns {Grid.util.Location} A Location object representing the focused location.
     * @fires navigate
     */
    focusCell(cellSelector, options = defaultFocusOptions) {
      var _a2, _b, _c, _d;
      const me = this, { _focusedCell } = me, {
        scroll,
        disableActionable
      } = options, isDown = cellSelector === Location.DOWN, isUp = cellSelector === Location.UP;
      if ((cellSelector == null ? void 0 : cellSelector.rowIndex) === -1 && me.hideHeaders) {
        me.revertFocus();
        return;
      }
      cellSelector = typeof cellSelector === "number" && (_focusedCell == null ? void 0 : _focusedCell.isLocation) ? _focusedCell.move(cellSelector) : me.normalizeCellContext(cellSelector);
      const doSelect = "doSelect" in options ? options.doSelect : !cellSelector.isActionable || cellSelector.initialTarget === cellSelector.cell;
      if (cellSelector.equals(_focusedCell)) {
        if (me.isNested && (isDown || isUp)) {
          if (!((_b = (_a2 = me.owner) == null ? void 0 : _a2.catchFocus) == null ? void 0 : _b.call(_a2, { source: me, navigationDirection: isDown ? "down" : "up" }))) {
            me.revertFocus(true);
          }
        } else {
          (_c = me.onCellNavigate) == null ? void 0 : _c.call(me, me, _focusedCell, cellSelector, doSelect);
        }
        return _focusedCell;
      }
      const subGrid = me.getSubGridFromColumn(cellSelector.columnId), { cell } = cellSelector, testCell = cell || me.getCell({
        rowIndex: me.rowManager.topIndex,
        columnId: cellSelector.columnId
      }), subGridRect = Rectangle.from(subGrid.element), bodyRect = Rectangle.from(me.bodyElement), cellRect = Rectangle.from(testCell).moveTo(null, subGridRect.y);
      if (scroll === false || cellSelector.rowIndex === -1) {
        options = Object.assign({}, options, disableScrolling);
      } else {
        options = Object.assign({}, options, scroll);
        if (cellRect.width > subGridRect.width || cellRect.height > bodyRect.height) {
          options.x = options.y = false;
        } else {
          options.column = cellSelector.columnId;
        }
        me.scrollRowIntoView(cellSelector.id, options);
      }
      if (me._hoveredRow || me.hoveredCell) {
        me.hoveredCell = null;
      }
      me.disableActionable = disableActionable;
      me.selectOnFocus = doSelect;
      me._fromFocusCell = true;
      (_d = cellSelector[disableActionable ? "cell" : "target"]) == null ? void 0 : _d.focus({ preventScroll: true });
      me.disableActionable = me.selectOnFocus = false;
      delete me._fromFocusCell;
      return cellSelector;
    }
    blurCell(cellSelector) {
      const me = this, cell = me.getCell(cellSelector);
      if (cell) {
        cell.classList.remove("b-focused");
      }
    }
    clearFocus(fullClear) {
      const me = this;
      if (me._focusedCell) {
        me.lastFocusedCell = fullClear ? null : me._focusedCell;
        me.blurCell(me._focusedCell);
        me._focusedCell = null;
      }
    }
    // For override-ability
    catchFocus() {
    }
    /**
     * Selects the cell before or after currently focused cell.
     * @private
     * @param next Specify true to select the next cell, false to select the previous
     * @returns {Object} Used cell selector
     */
    internalNextPrevCell(next = true) {
      const me = this, cellSelector = me._focusedCell;
      if (cellSelector) {
        return me.focusCell({
          id: cellSelector.id,
          columnId: me.columns.getAdjacentVisibleLeafColumn(cellSelector.column, next, true).id
        });
      }
      return null;
    }
    /**
     * Select the cell after the currently focused one.
     * @param {Event} [event] [DEPRECATED] unused param
     * @returns {Grid.util.Location} Cell selector
     */
    navigateRight() {
      var _a2;
      if ((_a2 = arguments[0]) == null ? void 0 : _a2.fromKeyMap) {
        return this.focusCell(this.rtl ? Location.PREV_CELL : Location.NEXT_CELL);
      }
      if (arguments[0]) {
        VersionHelper.deprecate("Grid", "6.0.0", "Event argument removed, unused param");
      }
      return this.internalNextPrevCell(!this.rtl);
    }
    /**
     * Select the cell before the currently focused one.
     * @param {Event} [event] [DEPRECATED] unused param
     * @returns {Grid.util.Location} Cell selector
     */
    navigateLeft() {
      var _a2;
      if ((_a2 = arguments[0]) == null ? void 0 : _a2.fromKeyMap) {
        return this.focusCell(this.rtl ? Location.NEXT_CELL : Location.PREV_CELL);
      }
      if (arguments[0]) {
        VersionHelper.deprecate("Grid", "6.0.0", "Event argument removed, unused param");
      }
      return this.internalNextPrevCell(Boolean(this.rtl));
    }
    //endregion
    //region Row
    /**
     * Selects the next or previous record in relation to the current selection. Scrolls into view if outside.
     * @private
     * @param next Next record (true) or previous (false)
     * @param {Boolean} [skipSpecialRows=true] True to not return specialRows like headers
     * @param {Boolean} [moveToHeader=true] True to allow focus to move to a header
     * @returns {Grid.util.Location|Boolean} Selection context for the focused row (& cell) or false if no selection was made
     */
    internalNextPrevRow(next, skipSpecialRows = true, moveToHeader = true) {
      const me = this, cell = me._focusedCell;
      if (!cell)
        return false;
      const record = me.store[`get${next ? "Next" : "Prev"}`](cell.id, false, skipSpecialRows);
      if (record) {
        return me.focusCell({
          id: record.id,
          columnId: cell.columnId,
          scroll: {
            x: false
          }
        });
      } else if (!next && moveToHeader && !cell.isColumnHeader) {
        this.clearFocus();
        this.getHeaderElement(cell.columnId).focus();
      }
      return false;
    }
    /**
     * Navigates to the cell below the currently focused cell
     * @param {Event} [event] [DEPRECATED] unused param
     * @returns {Grid.util.Location} Selector for focused row (& cell)
     */
    navigateDown() {
      var _a2;
      if ((_a2 = arguments[0]) == null ? void 0 : _a2.fromKeyMap) {
        return this.focusCell(Location.DOWN);
      }
      if (arguments[0]) {
        VersionHelper.deprecate("Grid", "6.0.0", "Event argument removed, unused param");
      }
      return this.internalNextPrevRow(true, false);
    }
    /**
     * Navigates to the cell above the currently focused cell
     * @param {Event} [event] [DEPRECATED] unused param
     * @returns {Grid.util.Location} Selector for focused row (& cell)
     */
    navigateUp() {
      var _a2;
      if ((_a2 = arguments[0]) == null ? void 0 : _a2.fromKeyMap) {
        return this.focusCell(Location.UP);
      }
      if (arguments[0]) {
        VersionHelper.deprecate("Grid", "6.0.0", "Event argument removed, unused param");
      }
      return this.internalNextPrevRow(false, false);
    }
    //endregion
    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {
    }
  }, __publicField(_a, "configurable", {
    focusable: false,
    focusableSelector: ".b-grid-cell,.b-grid-header.b-depth-0",
    // Set to true to revert focus on Esc or on ArrowUp/ArrowDown above/below first/last row
    isNested: false,
    // Documented on Grid
    keyMap: {
      ArrowUp: { handler: "navigateUp", weight: 10 },
      ArrowRight: { handler: "navigateRight", weight: 10 },
      ArrowDown: { handler: "navigateDown", weight: 10 },
      ArrowLeft: { handler: "navigateLeft", weight: 10 },
      "Ctrl+Home": "navigateFirstCell",
      Home: "navigateFirstColumn",
      "Ctrl+End": "navigateLastCell",
      End: "navigateLastColumn",
      PageUp: "navigatePrevPage",
      PageDown: "navigateNextPage",
      Enter: "activateHeader",
      // Private
      Escape: { handler: "onEscape", weight: 10 },
      "Shift+Tab": { handler: "onShiftTab", preventDefault: false, weight: 200 },
      Tab: { handler: "onTab", preventDefault: false, weight: 200 },
      " ": { handler: "onSpace", preventDefault: false }
    }
  }), _a;
};

// ../Grid/lib/Grid/localization/En.js
var emptyString = new String();
var locale = {
  localeName: "En",
  localeDesc: "English (US)",
  localeCode: "en-US",
  ColumnPicker: {
    column: "Column",
    columnsMenu: "Columns",
    hideColumn: "Hide column",
    hideColumnShort: "Hide",
    newColumns: "New columns"
  },
  Filter: {
    applyFilter: "Apply filter",
    filter: "Filter",
    editFilter: "Edit filter",
    on: "On",
    before: "Before",
    after: "After",
    equals: "Equals",
    lessThan: "Less than",
    moreThan: "More than",
    removeFilter: "Remove filter",
    disableFilter: "Disable filter"
  },
  FilterBar: {
    enableFilterBar: "Show filter bar",
    disableFilterBar: "Hide filter bar"
  },
  Group: {
    group: "Group",
    groupAscending: "Group ascending",
    groupDescending: "Group descending",
    groupAscendingShort: "Ascending",
    groupDescendingShort: "Descending",
    stopGrouping: "Stop grouping",
    stopGroupingShort: "Stop"
  },
  HeaderMenu: {
    moveBefore: (text) => `Move before "${text}"`,
    moveAfter: (text) => `Move after "${text}"`,
    collapseColumn: "Collapse column",
    expandColumn: "Expand column"
  },
  ColumnRename: {
    rename: "Rename"
  },
  MergeCells: {
    mergeCells: "Merge cells",
    menuTooltip: "Merge cells with same value when sorted by this column"
  },
  Search: {
    searchForValue: "Search for value"
  },
  Sort: {
    sort: "Sort",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    multiSort: "Multi sort",
    removeSorter: "Remove sorter",
    addSortAscending: "Add ascending sorter",
    addSortDescending: "Add descending sorter",
    toggleSortAscending: "Change to ascending",
    toggleSortDescending: "Change to descending",
    sortAscendingShort: "Ascending",
    sortDescendingShort: "Descending",
    removeSorterShort: "Remove",
    addSortAscendingShort: "+ Ascending",
    addSortDescendingShort: "+ Descending"
  },
  Split: {
    split: "Split",
    unsplit: "Unsplit",
    horizontally: "Horizontally",
    vertically: "Vertically",
    both: "Both"
  },
  Column: {
    columnLabel: (column) => `${column.text ? `${column.text} column. ` : ""}SPACE for context menu${column.sortable ? ", ENTER to sort" : ""}`,
    cellLabel: emptyString
  },
  Checkbox: {
    toggleRowSelect: "Toggle row selection",
    toggleSelection: "Toggle selection of entire dataset"
  },
  RatingColumn: {
    cellLabel: (column) => {
      var _a;
      return `${column.text ? column.text : ""} ${((_a = column.location) == null ? void 0 : _a.record) ? `rating : ${column.location.record.get(column.field) || 0}` : ""}`;
    }
  },
  GridBase: {
    loadFailedMessage: "Data loading failed!",
    syncFailedMessage: "Data synchronization failed!",
    unspecifiedFailure: "Unspecified failure",
    networkFailure: "Network error",
    parseFailure: "Failed to parse server response",
    serverResponse: "Server response:",
    noRows: "No records to display",
    moveColumnLeft: "Move to left section",
    moveColumnRight: "Move to right section",
    moveColumnTo: (region) => `Move column to ${region}`
  },
  CellMenu: {
    removeRow: "Delete"
  },
  RowCopyPaste: {
    copyRecord: "Copy",
    cutRecord: "Cut",
    pasteRecord: "Paste",
    rows: "rows",
    row: "row"
  },
  CellCopyPaste: {
    copy: "Copy",
    cut: "Cut",
    paste: "Paste"
  },
  PdfExport: {
    "Waiting for response from server": "Waiting for response from server...",
    "Export failed": "Export failed",
    "Server error": "Server error",
    "Generating pages": "Generating pages...",
    "Click to abort": "Cancel"
  },
  ExportDialog: {
    width: "40em",
    labelWidth: "12em",
    exportSettings: "Export settings",
    export: "Export",
    printSettings: "Print settings",
    print: "Print",
    exporterType: "Control pagination",
    cancel: "Cancel",
    fileFormat: "File format",
    rows: "Rows",
    alignRows: "Align rows",
    columns: "Columns",
    paperFormat: "Paper format",
    orientation: "Orientation",
    repeatHeader: "Repeat header"
  },
  ExportRowsCombo: {
    all: "All rows",
    visible: "Visible rows"
  },
  ExportOrientationCombo: {
    portrait: "Portrait",
    landscape: "Landscape"
  },
  SinglePageExporter: {
    singlepage: "Single page"
  },
  MultiPageExporter: {
    multipage: "Multiple pages",
    exportingPage: ({ currentPage, totalPages }) => `Exporting page ${currentPage}/${totalPages}`
  },
  MultiPageVerticalExporter: {
    multipagevertical: "Multiple pages (vertical)",
    exportingPage: ({ currentPage, totalPages }) => `Exporting page ${currentPage}/${totalPages}`
  },
  RowExpander: {
    loading: "Loading",
    expand: "Expand",
    collapse: "Collapse"
  },
  TreeGroup: {
    group: "Group by",
    stopGrouping: "Stop grouping",
    stopGroupingThisColumn: "Ungroup column"
  }
};
var En_default = LocaleHelper.publishLocale(locale);

// ../Grid/lib/Grid/view/GridBase.js
var resolvedPromise = new Promise((resolve) => resolve());
var storeListenerName = "GridBase:store";
var defaultScrollOptions2 = {
  block: "nearest",
  inline: "nearest"
};
var datasetReplaceActions = {
  dataset: 1,
  pageLoad: 1,
  filter: 1
};
var emptyArray2 = Object.freeze([]);
var ascending = (l, r) => l - r;
var GridBase = class extends Panel.mixin(
  Pluggable_default,
  State_default,
  GridElementEvents_default,
  GridFeatures_default,
  GridNavigation_default,
  GridResponsive_default,
  GridSelection_default,
  GridState_default,
  GridSubGrids_default,
  LoadMaskable_default
) {
  //region Config
  static get $name() {
    return "GridBase";
  }
  // Factoryable type name
  static get type() {
    return "gridbase";
  }
  static get delayable() {
    return {
      onGridVerticalScroll: {
        type: "raf"
      },
      // These use a shorter delay for tests, see finishConfigure()
      bufferedAfterColumnsResized: 250,
      bufferedElementResize: 250
    };
  }
  static get configurable() {
    return {
      //region Hidden configs
      /**
       * @hideconfigs autoUpdateRecord, defaults, hideWhenEmpty, itemCls, items, layout, layoutStyle, lazyItems, namedItems, record, textContent, defaultAction, html, htmlCls, tag, textAlign, trapFocus, content, defaultBindProperty, ripple, defaultFocus, align, anchor, centered, constrainTo, draggable, floating, hideAnimation, positioned, scrollAction, showAnimation, x, y, localeClass, localizableProperties, showTooltipWhenDisabled, tooltip, strictRecordMapping, maximizeOnMobile
       */
      /**
       * @hideproperties html, isSettingValues, isValid, items, record, values, content, layoutStyle, firstItem, lastItem, anchorSize, x, y, layout, strictRecordMapping, visibleChildCount, maximizeOnMobile
       */
      /**
       * @hidefunctions attachTooltip, add, getWidgetById, insert, processWidgetConfig, remove, removeAll, getAt, alignTo, setXY, showBy, showByPoint, toFront
       */
      //endregion
      /**
       * Set to `true` to make the grid read-only, by disabling any UIs for modifying data.
       *
       * __Note that checks MUST always also be applied at the server side.__
       * @prp {Boolean} readOnly
       * @default false
       * @category Misc
       */
      /**
       * Automatically set grids height to fit all rows (no scrolling in the grid). In general you should avoid
       * using `autoHeight: true`, since it will bypass Grids virtual rendering and render all rows at once, which
       * in a larger grid is really bad for performance.
       * @config {Boolean}
       * @default false
       * @category Layout
       */
      autoHeight: null,
      /**
       * Configure this as `true` to allow elements within cells to be styled as `position: sticky`.
       *
       * Columns which contain sticky content will need to be configured with
       *
       * ```javascript
       *    cellCls : 'b-sticky-cell',
       * ```
       *
       * Or a custom renderer can add the class to the passed cell element.
       *
       * It is up to the application author how to style the cell content. It is recommended that
       * a custom renderer create content with CSS class names which the application author
       * will use to apply the `position`, and matching `margin-top` and `top` styles to keep the
       * content stuck at the grid's top.
       *
       * Note that not all browsers support this CSS feature. A cross browser alternative
       * is to use the {link Grid.feature.StickyCells StickyCells} Feature.
       * @config {Boolean}
       * @category Misc
       */
      enableSticky: null,
      /**
       * Set to true to allow text selection in the grid cells. Note, this cannot be used simultaneously with the
       * `RowReorder` feature.
       * @config {Boolean}
       * @default false
       * @category Selection
       */
      enableTextSelection: null,
      /**
       * Set to `true` to stretch the last column in a grid with all fixed width columns
       * to fill extra available space if the grid's width is wider than the sum of all
       * configured column widths.
       * @config {Boolean}
       * @default
       * @category Layout
       */
      fillLastColumn: true,
      /**
       * See {@link Grid.view.Grid#keyboard-shortcuts Keyboard shortcuts} for details
       * @config {Object<String,String>} keyMap
       * @category Common
       */
      positionMode: "translate",
      // translate, translate3d, position
      /**
       * Configure as `true` to have the grid show a red "changed" tag in cells who's
       * field value has changed and not yet been committed.
       *
       * Set `showDirty.duringEdit` to `true` to show the red tag while editing a cell
       * ```javascript
       * showDirty : {
       *     duringEdit : true
       * }
       * ```
       *
       * @config {Boolean|Object}
       * @property {Boolean} showDirty.duringEdit Set to `true` to show the red tag while editing a cell
       * @default false
       * @category Misc
       */
      showDirty: null,
      /**
       * An object containing sub grid configuration objects keyed by a `region` property.
       * By default, grid has a 'locked' region (if configured with locked columns) and a 'normal' region.
       * The 'normal' region defaults to use `flex: 1`.
       *
       * This config can be used to reconfigure the "built-in" sub grids or to define your own.
       *
       * Redefining the default regions:
       *
       * {@frameworktabs}
       * {@js}
       * ```javascript
       * new Grid({
       *   subGridConfigs : {
       *     locked : { flex : 1 },
       *     normal : { width : 100 }
       *   }
       * });
       * ```
       * {@endjs}
       * {@react}
       * ```jsx
       * const App = props => {
       *     const subGridConfigs = {
       *         locked : { flex : 1 },
       *         normal : { width : 100 }
       *     };
       *
       *     return <bryntum-grid subGridConfigs={subGridConfigs} />
       * }
       * ```
       * {@endreact}
       * {@vue}
       * ```html
       * <bryntum-grid :sub-grid-configs="subGridConfigs" />
       * ```
       * ```javascript
       * export default {
       *     setup() {
       *         return {
       *             subGridConfigs : [
       *                 locked : { flex : 1 },
       *                 normal : { width : 100 }
       *             ]
       *         };
       *     }
       * }
       * ```
       * {@endvue}
       * {@angular}
       * ```html
       * <bryntum-grid [subGridConfigs]="subGridConfigs"></bryntum-grid>
       * ```
       * ```typescript
       * export class AppComponent {
       *      subGridConfigs = [
       *          locked : { flex : 1 },
       *          normal : { width : 100 }
       *      ]
       *  }
       * ```
       * {@endangular}
       * {@endframeworktabs}
       *
       * Defining your own multi region grid:
       *
       * ```javascript
       * new Grid({
       *   subGridConfigs : {
       *     left   : { width : 100 },
       *     middle : { flex : 1 },
       *     right  : { width  : 100 }
       *   },
       *
       *   columns : [
       *     { field : 'manufacturer', text: 'Manufacturer', region : 'left' },
       *     { field : 'model', text: 'Model', region : 'middle' },
       *     { field : 'year', text: 'Year', region : 'middle' },
       *     { field : 'sales', text: 'Sales', region : 'right' }
       *   ]
       * });
       * ```
       * @config {Object<String,SubGridConfig>}
       * @category Misc
       */
      subGridConfigs: {
        normal: { flex: 1 }
      },
      /**
       * Store that holds records to display in the grid, or a store config object. If the configuration contains
       * a `readUrl`, an `AjaxStore` will be created.
       *
       * Note that a store will be created during initialization if none is specified.
       *
       * Supplying a store config object at initialization time:
       *
       * ```javascript
       * const grid = new Grid({
       *     store : {
       *         fields : ['name', 'powers'],
       *         data   : [
       *             { id : 1, name : 'Aquaman', powers : 'Decent swimmer' },
       *             { id : 2, name : 'Flash', powers : 'Pretty fast' },
       *         ]
       *     }
       * });
       * ```
       *
       * Accessing the store at runtime:
       *
       * ```javascript
       * grid.store.sort('powers');
       * ```
       *
       * @prp {Core.data.Store}
       * @accepts {Core.data.Store|StoreConfig}
       * @typings {Core.data.Store|StoreConfig|Core.data.AjaxStore|AjaxStoreConfig}
       * @category Common
       */
      store: {
        value: {},
        $config: "nullify"
      },
      rowManager: {
        value: {},
        $config: ["nullify", "lazy"]
      },
      /**
       * Configuration values for the {@link Core.util.ScrollManager} class on initialization. Returns the
       * {@link Core.util.ScrollManager} at runtime.
       *
       * @prp {Core.util.ScrollManager}
       * @accepts {ScrollManagerConfig|Core.util.ScrollManager}
       * @readonly
       * @category Scrolling
       */
      scrollManager: {
        value: {},
        $config: ["nullify", "lazy"]
      },
      /**
       * Accepts column definitions for the grid during initialization. They will be used to create
       * {@link Grid/column/Column} instances that are added to a {@link Grid/data/ColumnStore}.
       *
       * At runtime it is read-only and returns the {@link Grid/data/ColumnStore}.
       *
       * Initialization using column config objects:
       *
       * ```javascript
       * new Grid({
       *   columns : [
       *     { text : 'Alias', field : 'alias' },
       *     { text : 'Superpower', field : 'power' }
       *   ]
       * });
       * ```
       *
       * Also accepts a store config object:
       *
       * ```javascript
       * new Grid({
       *   columns : {
       *     data : [
       *       { text : 'Alias', field : 'alias' },
       *       { text : 'Superpower', field : 'power' }
       *     ],
       *     listeners : {
       *       update() {
       *         // Some update happened
       *       }
       *     }
       *   }
       * });
       * ```
       *
       * Access the {@link Grid/data/ColumnStore} at runtime to manipulate columns:
       *
       * ```javascript
       * grid.columns.add({ field : 'column', text : 'New column' });
       * ```
       * @prp {Grid.data.ColumnStore}
       * @accepts {Grid.data.ColumnStore|GridColumnConfig[]|ColumnStoreConfig}
       * @readonly
       * @category Common
       */
      columns: {
        value: [],
        $config: "nullify"
      },
      /**
       * Grid's `min-height`. Defaults to `10em` to be sure that the Grid always has a height wherever it is
       * inserted.
       *
       * Can be either a String or a Number (which will have 'px' appended).
       *
       * Note that _reading_ the value will return the numeric value in pixels.
       *
       * @config {String|Number}
       * @category Layout
       */
      minHeight: "10em",
      /**
       * Set to `true` to hide the column header elements
       * @prp {Boolean}
       * @default false
       * @category Misc
       */
      hideHeaders: null,
      /**
       * Set to `true` to hide the footer elements
       * @prp {Boolean}
       * @default
       * @category Misc
       */
      hideFooters: true,
      /**
       * Set to `true` to hide the Grid's horizontal scrollbar(s)
       * @config {Boolean}
       * @default false
       * @category Misc
       */
      hideHorizontalScrollbar: null,
      contentElMutationObserver: false,
      trapFocus: false,
      ariaElement: "bodyElement",
      cellTabIndex: -1,
      rowCls: {
        value: "b-grid-row",
        $config: {
          merge: this.mergeCls
        }
      },
      cellCls: {
        value: "b-grid-cell",
        $config: {
          merge: this.mergeCls
        }
      },
      /**
       * Text or HTML to display when there is no data to display in the grid
       * @prp {String}
       * @default
       * @category Common
       */
      emptyText: "L{noRows}",
      sortFeatureStore: "store",
      /**
       * Row height in pixels. This allows the default height for rows to be controlled. Note that it may be
       * overriden by specifying a {@link Grid/data/GridRowModel#field-rowHeight} on a per record basis, or from
       * a column {@link Grid/column/Column#config-renderer}.
       *
       * When initially configured as `null`, an empty row will be measured and its height will be used as default
       * row height, enabling it to be controlled using CSS
       *
       * @prp {Number}
       * @category Common
       */
      rowHeight: null,
      /**
       * Preserve the grid's vertical scroll position when changesets are applied, as in the case of remote
       * changes, or when stores are configured with {@link Core.data.Store#config-syncDataOnLoad}.
       *
       * @prp {PreserveScrollOptions|Boolean}
       * @default
       * @category Common
       */
      preserveScroll: false,
      /**
       * When the {@link Grid.feature.Tree} feature is in use and the Store is a tree store, this
       * config may be set to `true` to visually animate branch node expand and collapse operations.
       * {@note}This is not supported in Scheduler and Gantt{/@note}
       * @prp {Boolean}
       * @default false
       */
      animateTreeNodeToggle: VersionHelper.checkVersion("core", "6.0", ">="),
      /**
       * Set to `false` to not show column lines. End result might be overruled by/differ between themes.
       *
       * @prp {Boolean}
       * @default
       * @category Misc
       */
      columnLines: true,
      /**
       * Set to `false` to not show row lines. End result might be overruled by/differ between themes.
       *
       * @prp {Boolean}
       * @default
       * @category Misc
       */
      rowLines: true
    };
  }
  // Default settings, applied in grids constructor.
  static get defaultConfig() {
    return {
      /**
       * Use fixed row height. Setting this to `true` will configure the underlying RowManager to use fixed row
       * height, which sacrifices the ability to use rows with variable height to gain a fraction better
       * performance.
       *
       * Using this setting also ignores the {@link Grid.view.GridBase#config-getRowHeight} function, and thus any
       * row height set in data. Only Grids configured {@link Grid.view.GridBase#config-rowHeight} is used.
       *
       * @config {Boolean}
       * @category Layout
       */
      fixedRowHeight: null,
      /**
       * A function called for each row to determine its height. It is passed a {@link Core.data.Model record} and
       * expected to return the desired height of that records row. If the function returns a falsy value, Grids
       * configured {@link Grid.view.GridBase#config-rowHeight} is used.
       *
       * The default implementation of this function returns the row height from the records
       * {@link Grid.data.GridRowModel#field-rowHeight rowHeight field}.
       *
       * Override this function to take control over how row heights are determined:
       *
       * ```javascript
       * new Grid({
       *    getRowHeight(record) {
       *        if (record.low) {
       *            return 20;
       *        }
       *        else if (record.high) {
       *            return 60;
       *        }
       *
       *        // Will use grids configured rowHeight
       *        return null;
       *    }
       * });
       * ```
       *
       * NOTE: Height set in a Column renderer takes precedence over the height returned by this function.
       *
       * @config {Function} getRowHeight
       * @param {Core.data.Model} getRowHeight.record Record to determine row height for
       * @returns {Number} Desired row height
       * @category Layout
       */
      // used if no rowHeight specified and none found in CSS. not public since our themes have row height
      // specified and this is more of an internal failsafe
      defaultRowHeight: 45,
      /**
       * Refresh entire row when a record changes (`true`) or, if possible, only the cells affected (`false`).
       *
       * When this is set to `false`, then if a column uses a renderer, cells in that column will still
       * be updated because it is impossible to know whether the cells value will be affected.
       *
       * If a standard, provided Column class is used with no custom renderer, its cells will only be updated
       * if the column's {@link Grid.column.Column#config-field} is changed.
       * @config {Boolean}
       * @default
       * @category Misc
       */
      fullRowRefresh: true,
      /**
       * Specify `true` to preserve vertical scroll position after store actions that trigger a `refresh` event,
       * such as loading new data and filtering.
       * @config {Boolean}
       * @default false
       * @category Misc
       */
      preserveScrollOnDatasetChange: null,
      /**
       * True to preserve focused cell after loading new data
       * @config {Boolean}
       * @default
       * @category Misc
       */
      preserveFocusOnDatasetChange: true,
      /**
       * Convenient shortcut to set data in grids store both during initialization and at runtime. Can also be
       * used to retrieve data at runtime, although we do recommend interacting with Grids store instead using
       * the {@link #property-store} property.
       *
       * Setting initial data during initialization:
       *
       * ```javascript
       * const grid = new Grid({
       *     data : [
       *       { id : 1, name : 'Batman' },
       *       { id : 2, name : 'Robin' },
       *       ...
       *     ]
       * });
       * ```
       *
       * Setting data at runtime:
       *
       * ```javascript
       * grid.data = [
       *     { id : 3, name : 'Joker' },
       *     ...
       * ];
       * ```
       *
       * Getting data at runtime:
       *
       * ```javascript
       * const records = store.data;
       * ```
       *
       * Note that a Store will be created during initialization if none is specified.
       *
       * @prp {Core.data.Model[]}
       * @accepts {Object[]|Core.data.Model[]}
       * @category Common
       */
      data: null,
      /**
       * Region to which columns are added when they have none specified
       * @config {String}
       * @default
       * @category Misc
       */
      defaultRegion: "normal",
      /**
       * true to destroy the store when the grid is destroyed
       * @config {Boolean}
       * @default false
       * @category Misc
       */
      destroyStore: null,
      /**
       * Grids change the `maskDefaults` to cover only their `body` element.
       * @config {MaskConfig}
       * @category Misc
       */
      maskDefaults: {
        cover: "body",
        target: "element"
      },
      /**
       * Set to `false` to only measure cell contents when double clicking the edge between column headers.
       * @config {Boolean}
       * @default
       * @category Layout
       */
      resizeToFitIncludesHeader: true,
      /**
       * Set to `false` to prevent remove row animation and remove the delay related to that.
       * @config {Boolean}
       * @default
       * @category Misc
       */
      animateRemovingRows: true,
      /**
       * Set to `true` to not get a warning when using another base class than GridRowModel for your grid data. If
       * you do, and would like to use the full feature set of the grid then include the fields from GridRowModel
       * in your model definition.
       * @config {Boolean}
       * @default false
       * @category Misc
       */
      disableGridRowModelWarning: null,
      headerClass: Header,
      footerClass: Footer,
      testPerformance: false,
      rowScrollMode: "move",
      // move, dom, all
      /**
       * Grid monitors window resize by default.
       * @config {Boolean}
       * @default true
       * @category Misc
       */
      monitorResize: true,
      /**
       * An object containing Feature configuration objects (or `true` if no configuration is required)
       * keyed by the Feature class name in all lowercase.
       * @config {Object}
       * @category Common
       */
      features: true,
      /**
       * Configures whether the grid is scrollable in the `Y` axis. This is used to configure a {@link Grid.util.GridScroller}.
       * See the {@link #config-scrollerClass} config option.
       * @config {Boolean|ScrollerConfig|Core.helper.util.Scroller}
       * @category Scrolling
       */
      scrollable: {
        // Just Y for now until we implement a special grid.view.Scroller subclass
        // Which handles the X scrolling of subgrids.
        overflowY: true
      },
      /**
       * The class to instantiate to use as the {@link #config-scrollable}. Defaults to {@link Grid.util.GridScroller}.
       * @config {Core.helper.util.Scroller}
       * @typings {typeof Scroller}
       * @category Scrolling
       */
      scrollerClass: GridScroller,
      refreshSuspended: 0,
      /**
       * Animation transition duration in milliseconds.
       * @prp {Number}
       * @default
       * @category Misc
       */
      transitionDuration: 500,
      /**
       * Event which is used to show context menus.
       * Available options are: 'contextmenu', 'click', 'dblclick'.
       * @config {'contextmenu'|'click'|'dblclick'}
       * @category Misc
       * @default
       */
      contextMenuTriggerEvent: "contextmenu",
      localizableProperties: ["emptyText"],
      asyncEventSuffix: "",
      fixElementHeightsBuffer: 350,
      testConfig: {
        transitionDuration: 50,
        fixElementHeightsBuffer: 50
      }
    };
  }
  static get properties() {
    return {
      _selectedRecords: [],
      _verticalScrollHeight: 0,
      virtualScrollHeight: 0,
      _scrollTop: null
    };
  }
  // Keep this commented out to have easy access to the syntax next time we need to use it
  // static get deprecatedEvents() {
  //     return {
  //         cellContextMenuBeforeShow : {
  //             product            : 'Grid',
  //             invalidAsOfVersion : '5.0.0',
  //             message            : '`cellContextMenuBeforeShow` event is deprecated, in favor of `cellMenuBeforeShow` event. Please see https://bryntum.com/products/grid/docs/guide/Grid/upgrades/4.0.0 for more information.'
  //         }
  //     };
  // }
  //endregion
  //region Init-destroy
  finishConfigure(config) {
    const me = this, { initScroll } = me;
    me.initScroll = () => !me.scrollInitialized && initScroll.call(me);
    if (VersionHelper.isTestEnv) {
      me.bufferedAfterColumnsResized.delay = 50;
      me.bufferedElementResize.delay = 50;
    }
    super.finishConfigure(config);
    LocaleManager_default.ion({
      locale: "onBeforeLocaleChange",
      prio: 1,
      thisObj: me
    });
    LocaleManager_default.ion({
      locale: "onLocaleChange",
      prio: -1,
      thisObj: me
    });
    GlobalEvents_default.ion({
      theme: "onThemeChange",
      thisObj: me
    });
    me.ion({
      subGridExpand: "onSubGridExpand",
      prio: -1,
      thisObj: me
    });
    me.bufferedFixElementHeights = me.buffer("fixElementHeights", me.fixElementHeightsBuffer, me);
    me.setGridClassList(me.element.classList);
    me.verticalScroller.classList.remove("b-content-element", "b-auto-container");
    me.bodyWrapElement.classList.remove("b-auto-container-panel");
  }
  onSubGridExpand() {
    this.renderContents();
  }
  onBeforeLocaleChange() {
    this._suspendRenderContentsOnColumnsChanged = true;
  }
  onLocaleChange() {
    this._suspendRenderContentsOnColumnsChanged = false;
    if (this.isPainted) {
      this.renderContents();
    }
  }
  finalizeInit() {
    super.finalizeInit();
    if (this.store.isLoading) {
      this.onStoreBeforeRequest();
    }
  }
  changeScrollManager(scrollManager, oldScrollManager) {
    oldScrollManager == null ? void 0 : oldScrollManager.destroy();
    if (scrollManager) {
      return ScrollManager.new({
        element: this.element,
        owner: this
      }, scrollManager);
    } else {
      return null;
    }
  }
  /**
   * Cleanup
   * @private
   */
  doDestroy() {
    var _a, _b;
    const me = this;
    me.detachListeners(storeListenerName);
    (_a = me.scrollManager) == null ? void 0 : _a.destroy();
    for (const feature of Object.values(me.features)) {
      (_b = feature.destroy) == null ? void 0 : _b.call(feature);
    }
    me._focusedCell = null;
    me.columns.destroy();
    super.doDestroy();
  }
  /**
   * Adds extra classes to the Grid element after it's been configured.
   * Also iterates through features, thus ensuring they have been initialized.
   * @private
   */
  setGridClassList(classList) {
    const me = this;
    Object.values(me.features).forEach((feature) => {
      if (feature.disabled || feature === false) {
        return;
      }
      let featureClass;
      if (Object.prototype.hasOwnProperty.call(feature.constructor, "featureClass")) {
        featureClass = feature.constructor.featureClass;
      } else {
        featureClass = `b-${feature instanceof Base ? feature.$$name : feature.constructor.name}`;
      }
      if (featureClass) {
        classList.add(featureClass.toLowerCase());
      }
    });
  }
  //endregion
  // region Feature events
  // For documentation & typings purposes
  /**
   * Fires after a sub grid is collapsed.
   * @event subGridCollapse
   * @param {Grid.view.Grid} source The firing Grid instance
   * @param {Grid.view.SubGrid} subGrid The sub grid instance
   */
  /**
   * Fires after a sub grid is expanded.
   * @event subGridExpand
   * @param {Grid.view.Grid} source The firing Grid instance
   * @param {Grid.view.SubGrid} subGrid The sub grid instance
   */
  /**
   * Fires before a row is rendered.
   * @event beforeRenderRow
   * @param {Grid.view.Grid} source The firing Grid instance.
   * @param {Grid.row.Row} row The row about to be rendered.
   * @param {Core.data.Model} record The record for the row.
   * @param {Number} recordIndex The zero-based index of the record.
   */
  /**
   * Fires after a row is rendered.
   * @event renderRow
   * @param {Grid.view.Grid} source The firing Grid instance.
   * @param {Grid.row.Row} row The row that has been rendered.
   * @param {Core.data.Model} record The record for the row.
   * @param {Number} recordIndex The zero-based index of the record.
   */
  //endregion
  //region Grid template & elements
  compose() {
    const { autoHeight, enableSticky, enableTextSelection, fillLastColumn, positionMode, showDirty } = this;
    return {
      class: {
        [`b-grid-${positionMode}`]: 1,
        "b-enable-sticky": enableSticky,
        "b-grid-notextselection": !enableTextSelection,
        "b-autoheight": autoHeight,
        "b-fill-last-column": fillLastColumn,
        "b-show-dirty": showDirty,
        "b-show-dirty-during-edit": showDirty == null ? void 0 : showDirty.duringEdit
      }
    };
  }
  get cellCls() {
    const { _cellCls } = this;
    return _cellCls.value || _cellCls;
  }
  get bodyConfig() {
    const { autoHeight, hideFooters, hideHeaders } = this;
    return {
      reference: "bodyElement",
      className: {
        "b-autoheight": autoHeight,
        "b-grid-panel-body": 1
      },
      // Only include aria-labelled-by if we have a header
      [this.hasHeader ? "ariaLabelledBy" : ""]: `${this.id}-panel-title`,
      children: {
        headerContainer: {
          tag: "header",
          role: "row",
          "aria-rowindex": 1,
          className: {
            "b-grid-header-container": 1,
            "b-hidden": hideHeaders
          }
        },
        bodyContainer: {
          className: "b-grid-body-container",
          tabIndex: -1,
          // Explicitly needs this because it's in theory focusable
          // and DomSync won't add a default role
          role: "presentation",
          children: {
            verticalScroller: {
              className: "b-grid-vertical-scroller"
            }
          }
        },
        virtualScrollers: {
          className: "b-virtual-scrollers b-hide-display",
          style: BrowserHelper.isFirefox && DomHelper.scrollBarWidth ? {
            height: `${DomHelper.scrollBarWidth}px`
          } : void 0
        },
        footerContainer: {
          tag: "footer",
          className: {
            "b-grid-footer-container": 1,
            "b-hidden": hideFooters
          }
        }
      }
    };
  }
  get contentElement() {
    return this.verticalScroller;
  }
  get overflowElement() {
    return this.bodyContainer;
  }
  updateHideHeaders(hide) {
    var _a;
    hide = Boolean(hide);
    (_a = this.headerContainer) == null ? void 0 : _a.classList.toggle("b-hidden", hide);
    this.eachSubGrid((subGrid) => subGrid.toggleHeaders(hide));
  }
  updateHideFooters(hide) {
    var _a;
    hide = Boolean(hide);
    (_a = this.footerContainer) == null ? void 0 : _a.classList.toggle("b-hidden", hide);
    this.eachSubGrid((subGrid) => {
      subGrid.scrollable[hide ? "removePartner" : "addPartner"](subGrid.footer.scrollable, "x");
    });
  }
  updateHideHorizontalScrollbar(hide) {
    hide = Boolean(hide);
    this.eachSubGrid((subGrid) => {
      subGrid.virtualScrollerElement.classList.toggle("b-hide-display", hide);
      subGrid.scrollable[hide ? "removePartner" : "addPartner"](subGrid.fakeScroller, "x");
      if (!hide) {
        subGrid.refreshFakeScroll();
      }
    });
  }
  //endregion
  //region Columns
  changeColumns(columns, currentStore) {
    const me = this;
    if (!columns && currentStore) {
      if (me.isDestroying) {
        currentStore.owner === me && currentStore.destroy();
      } else {
        currentStore.removeAll();
      }
      return currentStore;
    }
    if (columns.isStore) {
      (currentStore == null ? void 0 : currentStore.owner) === me && currentStore.destroy();
      columns.grid = me;
      return columns;
    }
    if (Array.isArray(columns)) {
      if (currentStore) {
        const columnsBefore = currentStore.allRecords.slice();
        currentStore.data = columns;
        for (const oldColumn of columnsBefore) {
          if (!currentStore.includes(oldColumn)) {
            oldColumn.destroy();
          }
        }
        return currentStore;
      }
      columns = { data: columns };
    }
    if (currentStore) {
      throw new Error("Replacing ColumnStore is not supported");
    }
    return ColumnStore.new({
      grid: me,
      owner: me
    }, columns);
  }
  updateColumns(columns, was) {
    var _a, _b;
    const me = this;
    (_a = super.updateColumns) == null ? void 0 : _a.call(this, columns, was);
    columns.ion({
      refresh: me.onColumnsChanged,
      sort: me.onColumnsChanged,
      change: me.onColumnsChanged,
      move: me.onColumnsChanged,
      thisObj: me
    });
    columns.ion(columnResizeEvent(me.onColumnsResized, me));
    if (BrowserHelper.isTouchDevice) {
      me.touch = true;
      columns.forEach((column) => {
        const { touchConfig } = column;
        if (touchConfig) {
          column.applyState(touchConfig);
        }
      });
    }
    (_b = me.bodyElement) == null ? void 0 : _b.setAttribute("aria-colcount", columns.visibleColumns.length);
  }
  onColumnsChanged({ type, action, changes, record: column, records: changedColumns, isMove }) {
    var _a;
    const me = this, {
      columns,
      checkboxSelectionColumn
    } = me, isSingleFieldChange = changes && Object.keys(changes).length === 1;
    isMove = isMove === true ? true : isMove && Object.values(isMove).some((field) => field);
    if (isMove || type === "refresh" && action !== "batch" && action !== "sort" || // Ignore the update of parentIndex following a column move (we redraw on the insert)
    action === "update" && isSingleFieldChange && "parentIndex" in changes || // Ignore sort caused by sync, will refresh on the batch instead
    action === "sort" && columns.isSyncingDataOnLoad) {
      return;
    }
    const addingColumnToNonExistingSubGrid = action === "add" && changedColumns.some((col) => col.region && !me.subGrids[col.region]);
    if (me.isConfiguring || !addingColumnToNonExistingSubGrid && (!me.isPainted || isMove && action === "remove")) {
      return;
    }
    if (action === "add") {
      for (const column2 of changedColumns) {
        const { region } = column2;
        if (!me.subGrids[region]) {
          me.add(me.createSubGrid(region, (_a = me.subGridConfigs) == null ? void 0 : _a[region]));
        }
      }
    }
    if (action === "update") {
      if (("width" in changes || "minWidth" in changes || "maxWidth" in changes || "flex" in changes) && !("region" in changes)) {
        const { region } = column;
        columns.visibleColumns.forEach((col) => {
          if (col.region === region && col.repaintOnResize) {
            me.refreshColumn(col);
          }
        });
        me.afterColumnsChange({ action, changes, column });
        return;
      }
      if ("text" in changes && isSingleFieldChange) {
        column.subGrid.refreshHeader();
        return;
      }
      if ("hidden" in changes) {
        const subGrid = me.getSubGridFromColumn(column.id);
        subGrid.header.fixHeaderWidths();
        subGrid.footer.fixFooterWidths();
        subGrid.updateHasFlex();
      }
    }
    if (action === "dataset" || action === "batch" || action === "update" && "region" in changes) {
      const regions = columns.getDistinctValues("region", true), { toRemove, toAdd } = ArrayHelper.delta(regions, me.regions, true);
      me.remove(toRemove.map((region) => me.getSubGrid(region)));
      me.add(toAdd.map((region) => me.createSubGrid(region, me.subGridConfigs[region])));
    }
    if (checkboxSelectionColumn && !columns.includes(checkboxSelectionColumn)) {
      const insertIndex = columns.indexOf(columns.findRecord("type", "rownumber")) + 1;
      columns.insert(insertIndex, checkboxSelectionColumn, true);
    }
    if (!me._suspendRenderContentsOnColumnsChanged) {
      me.renderContents();
    }
    me.syncFlexedSubCols();
    me.bodyElement.setAttribute("aria-colcount", columns.visibleColumns.length);
    me.afterColumnsChange({ action, changes, column, columns: changedColumns });
  }
  onColumnsResized({ changes, record: column }) {
    var _a;
    const me = this;
    if (me.isConfiguring) {
      return;
    }
    const domWidth = DomHelper.setLength(column.width), domMinWidth = DomHelper.setLength(column.minWidth), domMaxWidth = DomHelper.setLength(column.maxWidth), subGrid = me.getSubGridFromColumn(column.id);
    subGrid.header.fixHeaderWidths();
    subGrid.footer.fixFooterWidths();
    subGrid.updateHasFlex();
    if (!(column.flex && column.childLevel)) {
      if (!me.cellEls || column !== me.lastColumnResized) {
        me.cellEls = DomHelper.children(
          me.element,
          `.b-grid-cell[data-column-id="${column.id}"]`
        );
        me.lastColumnResized = column;
      }
      for (const cell of me.cellEls) {
        if ("width" in changes) {
          cell.style.width = domWidth;
        }
        if ("minWidth" in changes) {
          cell.style.minWidth = domMinWidth;
        }
        if ("maxWidth" in changes) {
          cell.style.maxWidth = domMaxWidth;
        }
        if ("flex" in changes) {
          cell.style.flex = (_a = column.flex) != null ? _a : null;
        }
      }
    }
    if (!me.resizingColumns) {
      me.afterColumnsResized(column);
    }
    me.syncFlexedSubCols();
  }
  afterColumnsResized(column) {
    const me = this;
    me.eachSubGrid((subGrid) => {
      if (!subGrid.collapsed && (!column || column.region === subGrid.region)) {
        subGrid.fixWidths();
        subGrid.fixRowWidthsInSafariEdge();
      }
    });
    me.lastColumnResized = me.cellEls = null;
    me.bufferedAfterColumnsResized(column);
    me.onHeightChange();
  }
  syncFlexedSubCols() {
    const flexedSubCols = this.columns.query((c) => c.flex && c.childLevel && c.element);
    if (flexedSubCols) {
      for (const column of flexedSubCols) {
        const width = column.element.getBoundingClientRect().width, cellEls = DomHelper.children(
          this.element,
          `.b-grid-cell[data-column-id="${column.id}"]`
        );
        for (const cell of cellEls) {
          cell.style.flex = `0 0 ${width}px`;
        }
      }
    }
  }
  bufferedAfterColumnsResized(column) {
    if (this.columns.usesAutoHeight) {
      this.refreshRows();
    }
    this.refreshVirtualScrollbars();
    this.eachSubGrid((subGrid) => {
      if (!subGrid.collapsed && (!column || column.region === subGrid.region)) {
        subGrid.refreshFakeScroll();
      }
    });
  }
  bufferedElementResize() {
    this.refreshRows();
  }
  onInternalResize(element, newWidth, newHeight, oldWidth, oldHeight) {
    if (DomHelper.scrollBarWidth && newWidth < oldWidth) {
      this.eachSubGrid((subGrid) => {
        if (subGrid.flex) {
          subGrid.onElementResize(subGrid.element);
        }
      });
    }
    super.onInternalResize(...arguments);
    if (this.isPainted && newWidth !== oldWidth && this.columns.usesFlexAutoHeight) {
      this.bufferedElementResize();
    }
  }
  //endregion
  //region Rows
  /**
   * Get the topmost visible grid row
   * @member {Grid.row.Row} firstVisibleRow
   * @readonly
   * @category Rows
   */
  /**
   * Get the last visible grid row
   * @member {Grid.row.Row} lastVisibleRow
   * @readonly
   * @category Rows
   */
  /**
   * Get the Row that is currently displayed at top.
   * @member {Grid.row.Row} topRow
   * @readonly
   * @category Rows
   * @private
   */
  /**
   * Get the Row currently displayed furthest down.
   * @member {Grid.row.Row} bottomRow
   * @readonly
   * @category Rows
   * @private
   */
  /**
   * Get Row for specified record id.
   * @function getRowById
   * @param {Core.data.Model|String|Number} recordOrId Record id (or a record)
   * @returns {Grid.row.Row} Found Row or null if record not rendered
   * @category Rows
   * @private
   */
  /**
   * Returns top and bottom for rendered row or estimated coordinates for unrendered.
   * @function getRecordCoords
   * @param {Core.data.Model|String|Number} recordOrId Record or record id
   * @returns {Object} Record bounds with format { top, height, bottom }
   * @category Calculations
   * @private
   */
  /**
   * Get the Row at specified index. "Wraps" index if larger than available rows.
   * @function getRow
   * @param {Number} index
   * @returns {Grid.row.Row}
   * @category Rows
   * @private
   */
  /**
   * Get a Row for either a record, a record id or an HTMLElement
   * @function getRowFor
   * @param {HTMLElement|Core.data.Model|String|Number} recordOrId Record or record id or HTMLElement
   * @returns {Grid.row.Row} Found Row or `null` if record not rendered
   * @category Rows
   */
  /**
   * Get a Row from an HTMLElement
   * @function getRowFromElement
   * @param {HTMLElement} element
   * @returns {Grid.row.Row} Found Row or `null` if record not rendered
   * @category Rows
   * @private
   */
  changeRowManager(rowManager, oldRowManager) {
    const me = this;
    if (!me._isRowMeasured) {
      me.measureRowHeight();
    }
    oldRowManager == null ? void 0 : oldRowManager.destroy();
    if (rowManager) {
      const result = RowManager.new({
        grid: me,
        rowHeight: me.rowHeight,
        rowScrollMode: me.rowScrollMode || "move",
        autoHeight: me.autoHeight,
        fixedRowHeight: me.fixedRowHeight,
        internalListeners: {
          changeTotalHeight: "onRowManagerChangeTotalHeight",
          requestScrollChange: "onRowManagerRequestScrollChange",
          thisObj: me
        }
      }, rowManager);
      me.relayEvents(result, ["beforeRenderRow", "renderRow"]);
      me._rowManager = null;
      return result;
    }
  }
  // Manual relay needed for Split feature to catch the config change
  updateRowHeight(rowHeight) {
    if (!this.isConfiguring && this.rowManager) {
      this.rowManager.rowHeight = rowHeight;
    }
  }
  get rowHeight() {
    var _a, _b;
    return (_b = (_a = this._rowManager) == null ? void 0 : _a.rowHeight) != null ? _b : this._rowHeight;
  }
  // Default implementation, documented in `defaultConfig`
  getRowHeight(record) {
    return record.rowHeight;
  }
  // Hook for features that need to alter the row height
  processRowHeight(record, height) {
  }
  //endregion
  //region Store
  getAsyncEventSuffixForStore(store) {
    return this.asyncEventSuffix;
  }
  /**
   * Hooks up data store listeners
   * @private
   * @category Store
   */
  bindStore(store) {
    const suffix = this.getAsyncEventSuffixForStore(store);
    store.ion({
      name: storeListenerName,
      [`refresh${suffix}`]: "onStoreDataChange",
      [`add${suffix}`]: "onStoreAdd",
      [`remove${suffix}`]: "onStoreRemove",
      [`replace${suffix}`]: "onStoreReplace",
      [`removeAll${suffix}`]: "onStoreRemoveAll",
      [`move${suffix}`]: store.tree ? null : "onFlatStoreMove",
      change: "relayStoreDataChange",
      idChange: "onStoreRecordIdChange",
      update: "onStoreUpdateRecord",
      beforeRequest: "onStoreBeforeRequest",
      afterRequest: "onStoreAfterRequest",
      exception: "onStoreException",
      commit: "onStoreCommit",
      startApplyChangeset: "internalOnStoreStartApplyChangeset",
      endApplyChangeset: "internalOnStoreEndApplyChangeset",
      thisObj: this
    });
    super.bindStore(store);
  }
  unbindStore(oldStore) {
    this.detachListeners(storeListenerName);
    if (this.destroyStore) {
      oldStore.destroy();
    }
  }
  changeStore(store) {
    var _a;
    if (store == null) {
      return null;
    }
    if (typeof store === "string") {
      store = Store.getStore(store);
    }
    if (!store.isStore) {
      store = ObjectHelper.assign({
        data: this.data,
        tree: Boolean((_a = this.initialConfig.features) == null ? void 0 : _a.tree)
      }, store);
      if (!store.data) {
        delete store.data;
      }
      if (!store.modelClass) {
        store.modelClass = GridRowModel;
      }
      store = new (store.readUrl ? AjaxStore : Store)(store);
    }
    return store;
  }
  updateStore(store, was) {
    var _a, _b;
    const me = this;
    (_a = super.updateStore) == null ? void 0 : _a.call(this, store, was);
    if (was) {
      me.unbindStore(was);
    }
    if (store) {
      if (was) {
        me.deselectAll();
      }
      me.bindStore(store);
    }
    me.trigger("bindStore", { store, oldStore: was });
    if (!me.isDestroying && me.isPainted && !me.refreshSuspended) {
      (_b = me._rowManager) == null ? void 0 : _b.reinitialize();
    }
  }
  /**
   * Rerenders a cell if a record is updated in the store
   * @private
   * @category Store
   */
  onStoreUpdateRecord({ source: store, record, changes }) {
    const me = this;
    if (me.refreshSuspended) {
      return;
    }
    if (me.forceFullRefresh) {
      me.rowManager.refresh();
      me.forceFullRefresh = false;
    } else {
      let row;
      if (record.isFieldModified("id")) {
        row = me.getRowFor(record.meta.modified.id);
      }
      row = row || me.getRowFor(record);
      if (!row) {
        return;
      }
      if (me.fullRowRefresh || record.isSpecialRow) {
        const index = store.indexOf(record);
        if (index !== -1) {
          row.render(index, record);
        }
      } else {
        me.columns.visibleColumns.forEach((column) => {
          const field = column.field, isSafe = column.constructor.simpleRenderer && !Object.prototype.hasOwnProperty.call(column.data, "renderer");
          if (!isSafe || changes[field]) {
            const cellElement = row.getCell(field);
            if (cellElement) {
              row.renderCell(cellElement);
            }
          }
        });
      }
    }
  }
  refreshFromRowOnStoreAdd(row, context) {
    const me = this, { rowManager } = me;
    rowManager.renderFromRow(row);
    rowManager.trigger("changeTotalHeight", { totalHeight: rowManager.totalHeight });
    if (me.store.count === 1) {
      me.callEachSubGrid("refreshFakeScroll");
    }
  }
  onMaskAutoClose(mask) {
    super.onMaskAutoClose(mask);
    this.toggleEmptyText();
  }
  /**
   * Refreshes rows when data is added to the store
   * @private
   * @category Store
   */
  onStoreAdd({ source: store, records, index, oldIndex, isChild, oldParent, parent, isMove, isExpand, isExpandAll }) {
    const me = this, { rowManager } = me;
    if (!me.isPainted || isExpandAll || me.refreshSuspended) {
      return;
    }
    if (isExpand && me.animateTreeNodeToggle) {
      return rowManager.insert(index, records.length);
    }
    const hasExpandedOldParent = isMove && records.some((record) => {
      if (isMove[record.id]) {
        const oldParent2 = store.getById(record.meta.modified.parentId);
        return (oldParent2 == null ? void 0 : oldParent2.isExpanded(store)) && (oldParent2 == null ? void 0 : oldParent2.ancestorsExpanded(store));
      }
    });
    if (isChild && !records[0].ancestorsExpanded(store) && !hasExpandedOldParent) {
      if (!parent.isLeaf) {
        const parentRow = rowManager.getRowById(parent);
        if (parentRow) {
          rowManager.renderRows([parentRow]);
        }
      }
      return;
    }
    rowManager.calculateRowCount(false, true, true);
    if (store.isFiltered) {
      index = store.indexOf(records[0]);
    }
    const {
      topIndex,
      rows,
      rowCount
    } = rowManager, bottomIndex = rowManager.topIndex + rowManager.rowCount - 1, dataStart = index, dataEnd = index + records.length - 1, atEnd = bottomIndex >= store.count - records.length - 1;
    if (oldParent || oldIndex > -1 || isChild && isMove && Object.values(isMove).some((v) => v)) {
      rowManager.refresh();
    } else if (dataStart >= topIndex && dataStart < topIndex + rowCount) {
      me.refreshFromRowOnStoreAdd(rows[dataStart - topIndex], ...arguments);
    } else if (dataEnd >= topIndex && dataEnd < topIndex + rowCount) {
      rowManager.refresh();
    } else {
      if (atEnd && index > bottomIndex) {
        rowManager.fillBelow(me._scrollTop || 0);
      }
      rowManager.estimateTotalHeight(true);
    }
  }
  /**
   * Responds to exceptions signalled by the store
   * @private
   * @category Store
   */
  onStoreException({ action, type, response, exceptionType, error }) {
    var _a;
    const me = this;
    let message;
    switch (type) {
      case "server":
        message = response.message || me.L("L{unspecifiedFailure}");
        break;
      case "exception":
        message = exceptionType === "network" ? me.L("L{networkFailure}") : (error == null ? void 0 : error.message) || ((_a = response == null ? void 0 : response.parsedJson) == null ? void 0 : _a.message) || me.L("L{parseFailure}");
        break;
    }
    me.applyMaskError(
      `<div class="b-grid-load-failure">
                <div class="b-grid-load-fail">${me.L(action === "read" ? "L{loadFailedMessage}" : "L{syncFailedMessage}")}</div>
                ${(response == null ? void 0 : response.url) ? `<div class="b-grid-load-fail">${response.url}</div>` : ""}
                <div class="b-grid-load-fail">${me.L("L{serverResponse}")}</div>
                <div class="b-grid-load-fail">${message}</div>
            </div>`
    );
  }
  /**
   * Refreshes rows when data is changed in the store
   * @private
   * @category Store
   */
  onStoreDataChange({ action, changes, source: store, syncInfo }) {
    var _a;
    (_a = super.onStoreDataChange) == null ? void 0 : _a.call(this, ...arguments);
    const me = this;
    if (me.refreshSuspended || !me.rowManager) {
      return;
    }
    if (action === "dataset") {
      me.rowManager.clearKnownHeights();
      if (store.isTree && store.isFiltered) {
        return;
      }
    }
    const isGroupFieldChange = store.isGrouped && changes && store.groupers.some((grp) => grp.field in changes);
    if (me.isPainted && !isGroupFieldChange) {
      me.renderRows(Boolean(!(action in datasetReplaceActions) || me.preserveScrollOnDatasetChange));
    }
    me.toggleEmptyText();
  }
  /**
   * The hook is called when the id of a record has changed.
   * @private
   * @category Store
   */
  onStoreRecordIdChange() {
    var _a;
    (_a = super.onStoreRecordIdChange) == null ? void 0 : _a.call(this, ...arguments);
  }
  /**
   * Shows a load mask while the connected store is loading
   * @private
   * @category Store
   */
  onStoreBeforeRequest() {
    this.applyLoadMask();
  }
  /**
   * Hides load mask after a load request ends either in success or failure
   * @private
   * @category Store
   */
  onStoreAfterRequest(event) {
    if (this.loadMask && !event.exception) {
      this.masked = null;
      this.toggleEmptyText();
    }
  }
  needsFullRefreshOnStoreRemove({ isCollapse }) {
    var _a, _b;
    const { store } = this;
    return ((_b = (_a = this.features) == null ? void 0 : _a.group) == null ? void 0 : _b.enabled) && store.isGrouped || // Need to redraw parents when children are removed since they might be converted to leaves
    store.tree && !isCollapse && store.modelClass.convertEmptyParentToLeaf;
  }
  /**
   * Animates removal of record.
   * @private
   * @category Store
   */
  onStoreRemove({ source: store, records, isCollapse, isChild, isMove, isCollapseAll }) {
    var _a;
    if (!this.isPainted || isMove || isCollapseAll) {
      return;
    }
    (_a = super.onStoreRemove) == null ? void 0 : _a.call(this, ...arguments);
    const me = this, { rowManager } = me;
    rowManager.invalidateKnownHeight(records);
    if (me.refreshSuspended) {
      return;
    }
    if (me.animateRemovingRows && !isCollapse && !isChild) {
      const rowsToRemove = records.reduce((result, record) => {
        const row = rowManager.getRowById(record.id);
        row && result.push(row);
        return result;
      }, []);
      if (rowsToRemove.length) {
        const topRow = rowsToRemove[0];
        me.isAnimating = true;
        EventHelper.onTransitionEnd({
          element: topRow._elementsArray[0],
          property: "left",
          // Detach listener after timeout even if event wasn't fired
          duration: me.transitionDuration + 50,
          thisObj: me,
          handler: () => {
            me.isAnimating = false;
            rowsToRemove.forEach((row) => !row.isDestroyed && row.removeCls("b-removing"));
            rowManager.refresh();
            me.trigger("rowRemove");
            me.afterRemove(arguments[0]);
          }
        });
        rowsToRemove.forEach((row) => row.addCls("b-removing"));
      }
    } else if (isCollapse && me.animateTreeNodeToggle) {
      const indicesToRemove = records.flatMap((record) => {
        const row = rowManager.getRowFor(record);
        return row ? row.index : emptyArray2;
      }).sort(ascending), { length } = indicesToRemove;
      if (length && indicesToRemove[length - 1] === indicesToRemove[0] + length - 1) {
        return rowManager.insert(indicesToRemove[0], -indicesToRemove.length);
      }
    } else if (me.needsFullRefreshOnStoreRemove(...arguments)) {
      rowManager.refresh();
      me.afterRemove(arguments[0]);
    } else {
      const { rows } = rowManager, topRowIndex = records.reduce((result, record) => {
        const row = rowManager.getRowById(record.id);
        if (row) {
          result = Math.min(result, rows.indexOf(row));
        }
        return result;
      }, rows.length);
      if (rows[topRowIndex]) {
        !me.refreshSuspended && rowManager.renderFromRow(rows[topRowIndex]);
      } else {
        rowManager.trigger("changeTotalHeight", { totalHeight: rowManager.totalHeight });
      }
      me.trigger("rowRemove", { isCollapse });
      me.afterRemove(arguments[0]);
    }
  }
  onFlatStoreMove({ from, to }) {
    const { rowManager, store } = this, {
      topIndex,
      rowCount
    } = rowManager, [dataStart, dataEnd] = [from, to].sort((a, b) => a - b), visibleStart = store.indexOf(store.getAt(dataStart, true)), visibleEnd = store.indexOf(store.getAt(dataEnd, true));
    if (visibleStart >= topIndex && visibleStart < topIndex + rowCount) {
      rowManager.renderFromRow(rowManager.rows[visibleStart - topIndex]);
    } else if (visibleEnd >= topIndex && visibleEnd < topIndex + rowCount) {
      rowManager.refresh();
    }
  }
  onStoreReplace({ records, all }) {
    const { rowManager } = this;
    if (all) {
      rowManager.clearKnownHeights();
      rowManager.refresh();
    } else {
      const rows = records.reduce((rows2, [, record]) => {
        const row = this.getRowFor(record);
        if (row) {
          rows2.push(row);
        }
        return rows2;
      }, []);
      rowManager.invalidateKnownHeight(records);
      rowManager.renderRows(rows);
    }
  }
  relayStoreDataChange(event) {
    var _a;
    (_a = this.ariaElement) == null ? void 0 : _a.setAttribute("aria-rowcount", this.store.count + 1);
    if (!this.project) {
      return this.trigger("dataChange", { ...event, store: event.source, source: this });
    }
  }
  /**
   * Rerenders grid when all records have been removed
   * @private
   * @category Store
   */
  onStoreRemoveAll() {
    var _a;
    (_a = super.onStoreRemoveAll) == null ? void 0 : _a.call(this, ...arguments);
    if (this.isPainted) {
      this.rowManager.clearKnownHeights();
      this.renderRows(false);
      this.toggleEmptyText();
    }
  }
  // Refresh dirty cells on commit
  onStoreCommit({ changes }) {
    if (this.showDirty && changes.modified.length) {
      const rows = [];
      changes.modified.forEach((record) => {
        const row = this.rowManager.getRowFor(record);
        row && rows.push(row);
      });
      this.rowManager.renderRows(rows);
    }
  }
  internalOnStoreStartApplyChangeset() {
    this.suspendRefresh();
    if (this.constructor.bindStoreChangeset) {
      this.captureScrollTargetRow();
    }
  }
  internalOnStoreEndApplyChangeset() {
    this.resumeRefresh(true);
    if (this.constructor.bindStoreChangeset) {
      this.restoreScrollTargetRow();
    }
  }
  /**
   * Remember scroll position when store is about to apply a changeset
   * @private
   */
  captureScrollTargetRow() {
    const me = this;
    if (me.preserveScroll) {
      const { firstFullyVisibleRow: firstRow, lastVisibleRow: lastRow } = me.rowManager;
      if (firstRow) {
        me.lastVisibleRowIds = [firstRow.id];
        for (let index = firstRow.dataIndex + 1; index <= lastRow.dataIndex; index++) {
          me.lastVisibleRowIds.push(me.rowManager.getRow(index).id);
        }
        me.lastTopRowOffset = me.scrollable.getDeltaTo(
          firstRow.element,
          { block: "start", x: false, constrainToScrollable: false }
        );
      }
    }
  }
  /**
   * Restore scroll position. Go to the topmost row formerly in the view that is still present in the dataset.
   * @private
   */
  restoreScrollTargetRow() {
    const me = this;
    if (me.preserveScroll) {
      if (me.lastVisibleRowIds) {
        me.rowManager.refresh();
        const targetId = me.lastVisibleRowIds.find((rowId) => me.store.getById(rowId));
        if (targetId != void 0 && targetId !== me.rowManager.firstFullyVisibleRow.id) {
          if (me.preserveScroll.overscroll) {
            const scrollNeeded = me.scrollable.getDeltaTo(
              me.getRecordCoords(targetId),
              { block: "start", x: false, constrainToScrollable: false, edgeOffset: me.lastTopRowOffset.yDelta }
            ).yDelta;
            if (scrollNeeded > me.scrollable.maxY) {
              me.scrollable.scrollHeight += scrollNeeded;
            }
          }
          me.scrollRowIntoView(targetId, {
            block: "start",
            edgeOffset: me.lastTopRowOffset.yDelta,
            x: false
          });
        }
      }
      me.lastVisibleRowIds = void 0;
      me.lastTopRowOffset = void 0;
    }
  }
  // Documented with config
  get data() {
    if (this._store) {
      return this._store.records;
    } else {
      return this._data;
    }
  }
  set data(data) {
    if (this._store) {
      this._store.data = data;
    } else {
      this._data = data;
    }
  }
  //endregion
  //region Context menu items
  /**
   * Populates the header context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateHeaderMenu({ column, items }) {
    const me = this, { subGrids, regions } = me, { parent } = column;
    let first = true;
    Object.entries(subGrids).forEach(([region, subGrid]) => {
      if (subGrid.sealedColumns) {
        return;
      }
      if (column.draggable && region !== column.region && (!parent && subGrids[column.region].columns.count > 1 || parent && parent.children.length > 1)) {
        const preceding = subGrid.element.compareDocumentPosition(subGrids[column.region].element) === document.DOCUMENT_POSITION_PRECEDING, moveRight = me.rtl ? !preceding : preceding, text = regions.length > 2 ? me.L("L{moveColumnTo}", me.optionalL(region)) : me.L(moveRight ? "L{moveColumnRight}" : "L{moveColumnLeft}");
        items[`${region}Region`] = {
          targetSubGrid: region,
          text,
          icon: "b-fw-icon b-icon-column-move-" + (moveRight ? "right" : "left"),
          separator: first,
          disabled: !column.allowDrag,
          onItem: ({ item }) => {
            column.traverse((col) => col.region = region);
            me.columns.insert(me.columns.indexOf(subGrids[item.targetSubGrid].columns.last) + 1, column);
            me.scrollColumnIntoView(column);
          }
        };
        first = false;
      }
    });
  }
  /**
   * Populates the cell context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Core.data.Model} options.record Record for which the menu will be shown
   * @param {Object<String,MenuItemConfig|Boolean|null>} options.items A named object to describe menu items
   * @internal
   */
  populateCellMenu({ record, items }) {
  }
  getColumnDragToolbarItems(column, items) {
    return items;
  }
  //endregion
  //region Getters
  normalizeCellContext(cellContext) {
    const grid = this, { columns } = grid;
    if (cellContext.isLocation) {
      return cellContext;
    }
    if (cellContext.isModel) {
      return new Location({
        grid,
        id: cellContext.id,
        columnId: columns.visibleColumns[0].id
      });
    }
    return new Location(ObjectHelper.assign({ grid }, cellContext));
  }
  /**
   * Returns a cell if rendered or null if not found.
   * @param {LocationConfig} cellContext A cell location descriptor
   * @returns {HTMLElement|null}
   * @category Getters
   */
  getCell(cellContext) {
    const { store, columns } = this, { visibleColumns } = this.columns, rowIndex = !isNaN(cellContext.row) ? cellContext.row : !isNaN(cellContext.rowIndex) ? cellContext.rowIndex : store.indexOf(cellContext.record || cellContext.id), columnIndex = !isNaN(cellContext.column) ? cellContext.column : !isNaN(cellContext.columnIndex) ? cellContext.columnIndex : visibleColumns.indexOf(cellContext.column || columns.getById(cellContext.columnId) || columns.get(cellContext.field) || visibleColumns[0]);
    return rowIndex > -1 && rowIndex < store.count && columnIndex > -1 && columnIndex < visibleColumns.length && this.normalizeCellContext(cellContext).cell || null;
  }
  /**
   * Returns the header element for the column
   * @param {String|Number|Grid.column.Column} columnId or Column instance
   * @returns {HTMLElement} Header element
   * @category Getters
   */
  getHeaderElement(columnId) {
    if (columnId.isModel) {
      columnId = columnId.id;
    }
    return this.fromCache(`.b-grid-header[data-column-id="${columnId}"]`);
  }
  getHeaderElementByField(field) {
    const column = this.columns.get(field);
    return column ? this.getHeaderElement(column) : null;
  }
  /**
   * Body height
   * @member {Number}
   * @readonly
   * @category Layout
   */
  get bodyHeight() {
    return this._bodyHeight;
  }
  /**
   * Header height
   * @member {Number}
   * @readonly
   * @category Layout
   */
  get headerHeight() {
    const me = this;
    if (me.isPainted && !me._headerHeight) {
      me._headerHeight = me.headerContainer.offsetHeight;
    }
    return me._headerHeight;
  }
  /**
   * Footer height
   * @member {Number}
   * @readonly
   * @category Layout
   */
  get footerHeight() {
    const me = this;
    if (me.isPainted && !me._footerHeight) {
      me._footerHeight = me.footerContainer.offsetHeight;
    }
    return me._footerHeight;
  }
  get isTreeGrouped() {
    var _a;
    return Boolean((_a = this.features.treeGroup) == null ? void 0 : _a.isGrouped);
  }
  /**
   * Searches up from the specified element for a grid row and returns the record associated with that row.
   * @param {HTMLElement} element Element somewhere within a row or the row container element
   * @returns {Core.data.Model} Record for the row
   * @category Getters
   */
  getRecordFromElement(element) {
    const el = element.closest(".b-grid-row");
    if (!el)
      return null;
    return this.store.getAt(el.dataset.index);
  }
  /**
   * Searches up from specified element for a grid cell or an header and returns the column which the cell belongs to
   * @param {HTMLElement} element Element somewhere in a cell
   * @returns {Grid.column.Column} Column to which the cell belongs
   * @category Getters
   */
  getColumnFromElement(element) {
    const cell = element.closest(".b-grid-cell, .b-grid-header");
    if (!cell)
      return null;
    if (cell.matches(".b-grid-header")) {
      return this.columns.getById(cell.dataset.columnId);
    }
    const cellData = DomDataStore.get(cell);
    return this.columns.getById(cellData.columnId);
  }
  // Only added for type checking, since it seems common to get it wrong in react/angular
  updateAutoHeight(autoHeight) {
    ObjectHelper.assertBoolean(autoHeight, "autoHeight");
  }
  updateColumnLines(columnLines) {
    ObjectHelper.assertBoolean(columnLines, "columnLines");
    DomHelper.toggleClasses(this.element, "b-no-column-lines", !columnLines);
  }
  updateRowLines(rowLines) {
    DomHelper.toggleClasses(this.element, "b-no-row-lines", !rowLines);
  }
  get keyMapElement() {
    return this.bodyElement;
  }
  //endregion
  //region Fix width & height
  /**
   * Sets widths and heights for headers, rows and other parts of the grid as needed
   * @private
   * @category Width & height
   */
  fixSizes() {
    this.callEachSubGrid("fixWidths");
    const colHeaders = this.headerContainer.querySelectorAll(".b-grid-header.b-depth-0");
    for (let i = 0, { length } = colHeaders; i < length; i++) {
      colHeaders[i].setAttribute("aria-colindex", i + 1);
    }
  }
  onRowManagerChangeTotalHeight({ totalHeight, immediate }) {
    return this.refreshTotalHeight(totalHeight, immediate);
  }
  /**
   * Makes height of vertical scroller match estimated total height of grid. Called when scrolling vertically and
   * when showing/hiding rows.
   * @param {Number} [height] Total height supplied by RowManager
   * @param {Boolean} [immediate] Flag indicating if buffered element sizing should be bypassed
   * @private
   * @category Width & height
   */
  refreshTotalHeight(height = this.rowManager.totalHeight, immediate = false) {
    const me = this;
    if (me.renderingRows || !me.isVisible) {
      return false;
    }
    const scroller = me.scrollable, delta = Math.abs(me.virtualScrollHeight - height), clientHeight = me._bodyRectangle.height, newMaxY = height - clientHeight;
    if (delta) {
      const isCritical = newMaxY - me._scrollTop < clientHeight * 2 || // Or if we have scrolled pass visual height
      me._verticalScrollHeight && me._verticalScrollHeight - clientHeight < me._scrollTop;
      scroller.scrollHeight = me.virtualScrollHeight = height;
      if (me.isPainted && (me.scrolling && !isCritical || delta < 100) && !immediate) {
        me.bufferedFixElementHeights();
      } else {
        me.virtualScrollHeightDirty && me.virtualScrollHeightDirty();
        me.bufferedFixElementHeights.cancel();
        me.fixElementHeights();
      }
    }
  }
  fixElementHeights() {
    const me = this, height = me.virtualScrollHeight, heightInPx = `${height}px`;
    me._verticalScrollHeight = height;
    me.verticalScroller.style.height = heightInPx;
    me.virtualScrollHeightDirty = false;
    if (me.autoHeight) {
      me.bodyContainer.style.height = heightInPx;
      me._bodyHeight = height;
      me.refreshBodyRectangle();
    }
    me.refreshVirtualScrollbars();
  }
  refreshBodyRectangle() {
    return this._bodyRectangle = Rectangle.client(this.bodyContainer);
  }
  //endregion
  //region Scroll & virtual rendering
  set scrolling(scrolling) {
    this._scrolling = scrolling;
  }
  get scrolling() {
    return this._scrolling;
  }
  /**
   * Activates automatic scrolling of a subGrid when mouse is moved closed to the edges. Useful when dragging DOM
   * nodes from outside this grid and dropping on the grid.
   * @param {Grid.view.SubGrid|String|Grid.view.SubGrid[]|String[]} subGrid A subGrid instance or its region name or
   * an array of either
   * @category Scrolling
   */
  enableScrollingCloseToEdges(subGrids) {
    this.scrollManager.startMonitoring({
      scrollables: [
        {
          element: this.scrollable.element,
          direction: "vertical"
        },
        ...ArrayHelper.asArray(subGrids || []).map((subGrid) => ({ element: (typeof subGrid === "string" ? this.subGrids[subGrid] : subGrid).scrollable.element }))
      ],
      direction: "horizontal"
    });
  }
  /**
   * Deactivates automatic scrolling of a subGrid when mouse is moved closed to the edges
   * @param {Grid.view.SubGrid|String|Grid.view.SubGrid[]|String[]} subGrid A subGrid instance or its region name or
   * an array of either
   * @category Scrolling
   */
  disableScrollingCloseToEdges(subGrids) {
    this.scrollManager.stopMonitoring([
      this.scrollable.element,
      ...ArrayHelper.asArray(subGrids || []).map((subGrid) => (typeof subGrid === "string" ? this.subGrids[subGrid] : subGrid).element)
    ]);
  }
  /**
   * Responds to request from RowManager to adjust scroll position. Happens when jumping to a scroll position with
   * variable row height.
   * @param {Number} bottomMostRowY
   * @private
   * @category Scrolling
   */
  onRowManagerRequestScrollChange({ bottom }) {
    this.scrollable.y = bottom - this.bodyHeight;
  }
  /**
   * Scroll syncing for normal headers & grid + triggers virtual rendering for vertical scroll
   * @private
   * @fires scroll
   * @category Scrolling
   */
  initScroll() {
    const me = this, { scrollable } = me;
    if (!me.scrollInitialized) {
      me.scrollInitialized = true;
      scrollable.contentElement = me.contentElement;
      scrollable.ion({
        scroll: "onGridVerticalScroll",
        scrollend: "onGridVerticalScrollEnd",
        thisObj: me
      });
      me.callEachSubGrid("initScroll");
      if (BrowserHelper.isMobileSafari) {
        scrollable.element.style.transform = "translate3d(0, 0, 0)";
      }
    }
  }
  onGridVerticalScroll({ source: scrollable }) {
    const me = this, { y: scrollTop } = scrollable;
    if (scrollTop !== me._scrollTop) {
      me._scrollTop = scrollTop;
      if (!me.scrolling) {
        me.scrolling = true;
        me.eachSubGrid((s) => s.suspendResizeMonitor = true);
      }
      me.rowManager.updateRenderedRows(scrollTop);
      me.afterScroll({ scrollTop });
      me.trigger("scroll", { scrollTop });
    }
  }
  onGridVerticalScrollEnd() {
    this.scrolling = false;
    this.eachSubGrid((s) => s.suspendResizeMonitor = false);
  }
  /**
   * Scrolls a row into view. If row isn't rendered it tries to calculate position. Accepts the {@link BryntumScrollOptions}
   * `column` property
   * @param {Core.data.Model|String|Number} recordOrId Record or record id
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} A promise which resolves when the specified row has been scrolled into view.
   * @category Scrolling
   */
  async scrollRowIntoView(recordOrId, options = defaultScrollOptions2) {
    var _a;
    const me = this, blockPosition = options.block || "nearest", { rowManager } = me, record = me.store.getById(recordOrId);
    if (record) {
      let scrollPromise;
      if (me.store.indexOf(record) === -1) {
        return resolvedPromise;
      }
      let scroller = me.scrollable, recordRect = me.getRecordCoords(record);
      const scrollerRect = Rectangle.from(scroller.element);
      if (recordRect.virtual) {
        const virtualBlock = recordRect.block, innerOptions = blockPosition !== "nearest" ? options : {
          block: virtualBlock
        };
        scrollPromise = scroller.scrollIntoView(recordRect, {
          block: "center"
        });
        rowManager.scrollTargetRecordId = record;
        rowManager.updateRenderedRows(scroller.y, true);
        recordRect = me.getRecordCoords(record);
        rowManager.lastScrollTop = scroller.y;
        if (recordRect.virtual) {
          return resolvedPromise;
        }
        if (options.animate) {
          scroller.suspendEvents();
          if (blockPosition === "end" || blockPosition === "nearest" && virtualBlock === "end") {
            scroller.y -= scrollerRect.bottom - recordRect.bottom;
          } else if (blockPosition === "start" || blockPosition === "nearest" && virtualBlock === "start") {
            scroller.y += recordRect.y - scrollerRect.y;
          }
          rowManager.updateRenderedRows(scroller.y, false, true);
          if (virtualBlock === "end") {
            scroller.y -= rowManager.appendRowBuffer * rowManager.rowHeight - 1;
          } else {
            scroller.y += rowManager.prependRowBuffer * rowManager.rowHeight - 1;
          }
          scroller.resumeEvents();
          await scroller.scrollIntoView(me.getRecordCoords(record), Object.assign({}, options, innerOptions));
        } else {
          if (!options.recursive) {
            await scrollPromise;
          }
          await ((_a = me.scrollRowIntoView) == null ? void 0 : _a.call(me, record, Object.assign({ recursive: true }, options, innerOptions)));
        }
      } else {
        let { column } = options;
        if (column) {
          if (!column.isModel) {
            column = me.columns.getById(column) || me.columns.get(column);
          }
          if (column) {
            scroller = me.getSubGridFromColumn(column).scrollable;
            const cellRect = Rectangle.from(rowManager.getRowFor(record).getCell(column.id));
            recordRect.x = cellRect.x;
            recordRect.width = cellRect.width;
          }
        } else {
          options = ObjectHelper.assign({}, options, { x: false });
        }
        await scroller.scrollIntoView(recordRect, options);
      }
    }
  }
  /**
   * Scrolls a column into view (if it is not already)
   * @param {Grid.column.Column|String|Number} column Column name (data) or column index or actual column object.
   * @param {BryntumScrollOptions} [options] How to scroll.
   * @returns {Promise} If the column exists, a promise which is resolved when the column header element has been
   * scrolled into view.
   * @category Scrolling
   */
  scrollColumnIntoView(column, options) {
    column = column instanceof Column ? column : this.columns.get(column) || this.columns.getById(column) || this.columns.getAt(column);
    return this.getSubGridFromColumn(column).scrollColumnIntoView(column, options);
  }
  /**
   * Scrolls a cell into view (if it is not already)
   * @param {Object} cellContext Cell selector { id: recordId, column: 'columnName' }
   * @category Scrolling
   */
  scrollCellIntoView(cellContext, options) {
    return this.scrollRowIntoView(cellContext.id, Object.assign({
      column: cellContext.columnId
    }, typeof options === "boolean" ? { animate: options } : options));
  }
  /**
   * Scroll all the way down
   * @returns {Promise} A promise which resolves when the bottom is reached.
   * @category Scrolling
   */
  scrollToBottom(options) {
    return this.scrollRowIntoView(this.store.last, options);
  }
  /**
   * Scroll all the way up
   * @returns {Promise} A promise which resolves when the top is reached.
   * @category Scrolling
   */
  scrollToTop(options) {
    return this.scrollable.scrollBy(0, -this.scrollable.y, options);
  }
  /**
   * Stores the scroll state. Returns an objects with a `scrollTop` number value for the entire grid and a `scrollLeft`
   * object containing a left position scroll value per sub grid.
   * @returns {Object}
   * @category Scrolling
   */
  storeScroll() {
    const me = this, state = me.storedScrollState = {
      scrollTop: me.scrollable.y,
      scrollLeft: {}
    };
    me.eachSubGrid((subGrid) => {
      state.scrollLeft[subGrid.region] = subGrid.scrollable.x;
    });
    return state;
  }
  /**
   * Restore scroll state. If state is not specified, restores the last stored state.
   * @param {Object} [state] Scroll state, optional
   * @category Scrolling
   */
  restoreScroll(state = this.storedScrollState) {
    const me = this;
    me.eachSubGrid((subGrid) => {
      var _a;
      const x = state.scrollLeft[subGrid.region];
      if (x != null) {
        subGrid.scrollable.updateX(x);
        subGrid.header.scrollable.updateX(x);
        subGrid.footer.scrollable.updateX(x);
        (_a = subGrid.fakeScroller) == null ? void 0 : _a.updateX(x);
      }
    });
    me.scrollable.updateY(state.scrollTop);
  }
  //endregion
  //region Theme & measuring
  beginGridMeasuring() {
    const me = this;
    if (!me.$measureCellElements) {
      me.$measureCellElements = DomHelper.createElement({
        // For row height measuring, features are not yet there. Work around that for the stripe feature,
        // which removes borders
        className: "b-grid-subgrid " + (!me._isRowMeasured && me.hasFeature("stripe") ? "b-stripe" : ""),
        reference: "subGridElement",
        style: {
          position: "absolute",
          top: "-10000px",
          left: "-100000px",
          visibility: "hidden",
          contain: "strict"
        },
        children: [
          {
            className: "b-grid-row",
            reference: "rowElement",
            children: [
              {
                className: "b-grid-cell",
                reference: "cellElement",
                style: {
                  width: "auto",
                  contain: BrowserHelper.isFirefox ? "layout paint" : "layout style paint"
                }
              }
            ]
          }
        ]
      });
    }
    me.getConfig("element");
    me.verticalScroller.appendChild(me.$measureCellElements.subGridElement);
    if (!me.rendered) {
      const targetEl = me.appendTo || me.insertBefore || document.body, rootElement = DomHelper.getRootElement(typeof targetEl === "string" ? document.getElementById(targetEl) : targetEl) || document.body;
      if (!me.adopt || !rootElement.contains(me.element)) {
        rootElement.appendChild(me.element);
        me.$removeAfterMeasuring = true;
      }
    }
    return me.$measureCellElements;
  }
  endGridMeasuring() {
    if (this.$removeAfterMeasuring) {
      this.element.remove();
      this.$removeAfterMeasuring = false;
    }
    this.$measureCellElements.subGridElement.remove();
  }
  /**
   * Creates a fake subgrid with one row and measures its height. Result is used as rowHeight.
   * @private
   */
  measureRowHeight() {
    const me = this, { rowElement } = me.beginGridMeasuring(), styles = DomHelper.getStyleValue(rowElement, ["height", "border-top-width", "border-bottom-width"]), styleHeight = parseInt(styles.height), multiplier = BrowserHelper.isFirefox ? globalThis.devicePixelRatio / Math.max(Math.trunc(globalThis.devicePixelRatio), 1) : 1, borderTop = styles["border-top-width"] ? Math.round(multiplier * parseFloat(styles["border-top-width"])) : 0, borderBottom = styles["border-bottom-width"] ? Math.round(multiplier * parseFloat(styles["border-bottom-width"])) : 0;
    if (me.rowHeight == null || me.rowHeight === me._rowHeightFromStyle) {
      me.rowHeight = !isNaN(styleHeight) && styleHeight ? styleHeight : me.defaultRowHeight;
      me._rowHeightFromStyle = me.rowHeight;
    }
    me._rowBorderHeight = borderTop + borderBottom;
    me._isRowMeasured = true;
    me.endGridMeasuring();
  }
  /**
   * Handler for global theme change event (triggered by shared.js). Remeasures row height.
   * @private
   */
  onThemeChange({ theme }) {
    this.whenVisible("measureRowHeight");
    this.trigger("theme", { theme });
  }
  //endregion
  //region Rendering of rows
  /**
   * Triggers a render of records to all row elements. Call after changing order, grouping etc. to reflect changes
   * visually. Preserves scroll.
   * @category Rendering
   */
  refreshRows(returnToTop = false) {
    const { element, rowManager } = this;
    element.classList.add("b-notransition");
    if (returnToTop) {
      rowManager.returnToTop();
    } else {
      rowManager.refresh(true);
    }
    element.classList.remove("b-notransition");
  }
  /**
   * Triggers a render of all the cells in a column.
   * @param {Grid.column.Column} column
   * @category Rendering
   */
  refreshColumn(column) {
    if (column.isVisible) {
      if (column.isLeaf) {
        this.rowManager.forEach((row) => row.renderCell(row.getCell(column.id)));
      } else {
        column.children.forEach((child) => this.refreshColumn(child));
      }
    }
  }
  //endregion
  //region Render the grid
  /**
   * Recalculates virtual scrollbars widths and scrollWidth
   * @private
   */
  refreshVirtualScrollbars() {
    const me = this, {
      headerContainer,
      footerContainer,
      virtualScrollers,
      scrollable,
      hasVerticalOverflow
    } = me, { classList } = virtualScrollers, hadHorizontalOverflow = !classList.contains("b-hide-display"), hasHorizontalOverflow = Object.values(me.subGrids).some((subGrid) => subGrid.overflowingHorizontally), horizontalOverflowChanged = hasHorizontalOverflow !== hadHorizontalOverflow;
    if (horizontalOverflowChanged) {
      virtualScrollers.classList.toggle("b-hide-display", !hasHorizontalOverflow);
    }
    if (DomHelper.scrollBarWidth) {
      const needsPadding = hasVerticalOverflow || scrollable.overflowY === "scroll";
      headerContainer.classList.toggle("b-show-yscroll-padding", needsPadding);
      footerContainer.classList.toggle("b-show-yscroll-padding", needsPadding);
      virtualScrollers.classList.toggle("b-show-yscroll-padding", needsPadding);
      if (horizontalOverflowChanged) {
        if (hasHorizontalOverflow) {
          me.callEachSubGrid("refreshFakeScroll");
        }
        me.onHeightChange();
      }
    }
  }
  get hasVerticalOverflow() {
    return this.scrollable.hasOverflow("y");
  }
  /**
   * Returns content height calculated from row manager
   * @private
   */
  get contentHeight() {
    const rowManager = this.rowManager;
    return Math.max(rowManager.totalHeight, rowManager.bottomRow ? rowManager.bottomRow.bottom : 0);
  }
  onContentChange() {
    const me = this, rowManager = me.rowManager;
    if (me.isVisible) {
      rowManager.estimateTotalHeight();
      me.paintListener = null;
      me.refreshTotalHeight(me.contentHeight);
      me.callEachSubGrid("refreshFakeScroll");
      me.onHeightChange();
    } else if (!me.paintListener) {
      me.paintListener = me.ion({
        paint: "onContentChange",
        once: true,
        thisObj: me
      });
    }
  }
  triggerPaint() {
    if (!this.isPainted) {
      this.refreshBodyRectangle();
    }
    super.triggerPaint();
  }
  onHeightChange() {
    const me = this;
    me.refreshBodyRectangle();
    me._bodyHeight = me.autoHeight ? me.contentHeight : me.bodyContainer.offsetHeight;
  }
  suspendRefresh() {
    this.refreshSuspended++;
  }
  resumeRefresh(trigger) {
    if (this.refreshSuspended && !--this.refreshSuspended) {
      if (trigger) {
        this.refreshRows();
      }
      this.trigger("resumeRefresh", { trigger });
    }
  }
  /**
   * Rerenders all grid rows, completely replacing all row elements with new ones
   * @category Rendering
   */
  renderRows(keepScroll = true) {
    const me = this, scrollState = keepScroll && me.storeScroll();
    if (me.refreshSuspended) {
      return;
    }
    me.trigger("beforeRenderRows");
    me.renderingRows = true;
    me.element.classList.add("b-grid-refreshing");
    if (!keepScroll) {
      me.scrollable.y = me._scrollTop = 0;
    }
    me.rowManager.reinitialize(!keepScroll);
    me.trigger("renderRows");
    me.renderingRows = false;
    me.onContentChange();
    if (keepScroll) {
      me.restoreScroll(scrollState);
    }
    me.element.classList.remove("b-grid-refreshing");
  }
  /**
   * Rerenders the grids rows, headers and footers, completely replacing all row elements with new ones
   * @category Rendering
   */
  renderContents() {
    const me = this, { element, headerContainer, footerContainer, rowManager } = me;
    me.emptyCache();
    if (me.isPainted) {
      me._headerHeight = null;
      me.callEachSubGrid("refreshHeader");
      me.callEachSubGrid("refreshFooter");
      me.renderHeader(headerContainer, element);
      me.renderFooter(footerContainer, element);
      me.fixSizes();
      const refreshContext = rowManager.removeAllRows();
      rowManager.calculateRowCount(false, true, true);
      if (rowManager.rowCount) {
        rowManager.setPosition(refreshContext);
        me.renderRows();
      }
    }
  }
  /**
   * Rerenders all grid headers
   * @category Rendering
   */
  refreshHeaders() {
    this.callEachSubGrid("refreshHeader");
  }
  /**
   * Rerender a single grid header
   * @param {Grid.column.Column} column The column to refresh
   * @category Rendering
   */
  refreshHeader(column) {
    column.subGrid.refreshHeader();
  }
  onPaintOverride() {
  }
  // Render rows etc. on first paint, to make sure Grids element has been laid out
  onInternalPaint({ firstPaint }) {
    var _a;
    const me = this;
    me.ariaElement.setAttribute("aria-rowcount", me.store.count + 1);
    (_a = super.onInternalPaint) == null ? void 0 : _a.call(this, ...arguments);
    if (me.onPaintOverride() || !firstPaint) {
      return;
    }
    const {
      rowManager,
      store,
      element,
      headerContainer,
      bodyContainer,
      footerContainer
    } = me, scrollPad = DomHelper.scrollBarPadElement;
    let columnsChanged, maxDepth = 0;
    me.role = (store == null ? void 0 : store.isTree) ? "treegrid" : "grid";
    me.columns.ion({
      change: () => columnsChanged = true,
      once: true
    });
    me.updateResponsive(me.width, 0);
    if (columnsChanged) {
      me.callEachSubGrid("refreshHeader", headerContainer);
      me.callEachSubGrid("refreshFooter", footerContainer);
    }
    me.renderHeader(headerContainer, element);
    me.renderFooter(footerContainer, element);
    DomHelper.append(headerContainer, scrollPad);
    DomHelper.append(footerContainer, scrollPad);
    DomHelper.append(me.virtualScrollers, scrollPad);
    me.refreshBodyRectangle();
    const bodyOffsetHeight = me.bodyContainer.offsetHeight;
    if (me.autoHeight) {
      me._bodyHeight = rowManager.initWithHeight(element.offsetHeight - headerContainer.offsetHeight - footerContainer.offsetHeight, true);
      bodyContainer.style.height = me.bodyHeight + "px";
    } else {
      me._bodyHeight = bodyOffsetHeight;
      rowManager.initWithHeight(me._bodyHeight, true);
    }
    me.eachSubGrid((subGrid) => {
      if (subGrid.header.maxDepth > maxDepth) {
        maxDepth = subGrid.header.maxDepth;
      }
    });
    headerContainer.dataset.maxDepth = maxDepth;
    me.fixSizes();
    if (store.count || !store.isLoading) {
      me.renderRows();
    }
    if (me.columns.usesAutoHeight) {
      const { fonts } = document;
      if ((fonts == null ? void 0 : fonts.status) !== "loaded") {
        fonts.ready.then(() => !me.isDestroyed && me.refreshRows());
      }
    }
    me.initScroll();
    me.initInternalEvents();
  }
  render() {
    var _a;
    const me = this;
    me.requireSize = Boolean(me.owner);
    super.render(...arguments);
    me.setupFocusListeners();
    if (!me.autoHeight) {
      if (me.headerContainer.offsetHeight && !me.bodyContainer.offsetHeight) {
        console.warn("Grid element not sized correctly, please check your CSS styles and review how you size the widget");
      }
      if (!me.splitFrom && !((_a = me.features.split) == null ? void 0 : _a.owner) && // Don't warn for splits
      !("minHeight" in me.initialConfig) && !("height" in me.initialConfig) && parseInt(globalThis.getComputedStyle(me.element).minHeight) === me.height) {
        console.warn(
          `The ${me.$$name} is sized by its predefined minHeight, likely this is not intended. Please check your CSS and review how you size the widget, or assign a fixed height in the config. For more information, see the "Basics/Sizing the component" guide in docs.`
        );
      }
    }
  }
  //endregion
  //region Hooks
  /**
   * Called after headers have been rendered to the headerContainer.
   * This does not do anything, it's just for Features to hook in to.
   * @param {HTMLElement} headerContainer DOM element which contains the headers.
   * @param {HTMLElement} element Grid element
   * @private
   * @category Rendering
   */
  renderHeader(headerContainer, element) {
  }
  /**
   * Called after footers have been rendered to the footerContainer.
   * This does not do anything, it's just for Features to hook in to.
   * @param {HTMLElement} footerContainer DOM element which contains the footers.
   * @param {HTMLElement} element Grid element
   * @private
   * @category Rendering
   */
  renderFooter(footerContainer, element) {
  }
  // Hook for features to affect cell rendering before renderers are run
  beforeRenderCell() {
  }
  // Hooks for features to react to a row being rendered
  beforeRenderRow() {
  }
  afterRenderRow() {
  }
  // Hook for features to react to scroll
  afterScroll() {
  }
  // Hook that can be overridden to prepare custom editors, can be used by framework wrappers
  processCellEditor(editorConfig) {
  }
  // Hook for features to react to column changes
  afterColumnsChange() {
  }
  // Hook for features to react to record removal (which might be transitioned)
  afterRemove(removeEvent) {
  }
  // Hook for features to react to groups being collapsed/expanded
  afterToggleGroup() {
  }
  // Hook for features to react to subgrid being collapsed
  afterToggleSubGrid() {
  }
  // Hook into Base, to trigger another hook for features to hook into :)
  // If features hook directly into this, it will be called both for Grid's changes + feature's changes,
  // since they also extend Base.
  onConfigChange(info) {
    super.onConfigChange(info);
    if (!this.isConfiguring) {
      this.afterConfigChange(info);
    }
  }
  afterConfigChange(info) {
  }
  afterAddListener(eventName, listener) {
  }
  afterRemoveListener(eventName, listener) {
  }
  //endregion
  //region Masking and Appearance
  syncMaskCover(mask = this.masked) {
    if (mask) {
      const bodyRect = mask.cover === "body" && this.rectangleOf("bodyContainer"), scrollerRect = bodyRect && this.rectangleOf("virtualScrollers"), { style } = mask.element;
      style.marginTop = bodyRect ? `${bodyRect.y}px` : "";
      style.height = bodyRect ? `${bodyRect.height + ((scrollerRect == null ? void 0 : scrollerRect.height) || 0)}px` : "";
    }
  }
  /**
   * Show a load mask with a spinner and the specified message. When using an AjaxStore masking and unmasking is
   * handled automatically, but if you are loading data in other ways you can call this function manually when your
   * load starts.
   * ```
   * myLoadFunction() {
   *   // Show mask before initiating loading
   *   grid.maskBody('Loading data');
   *   // Your custom loading code
   *   load.then(() => {
   *      // Hide the mask when loading is finished
   *      grid.unmaskBody();
   *   });
   * }
   * ```
   * @param {String|MaskConfig} loadMask The message to show in the load mask (next to the spinner) or a config object
   * for a {@link Core.widget.Mask}.
   * @returns {Core.widget.Mask}
   * @category Misc
   */
  maskBody(loadMask) {
    let ret;
    if (this.bodyContainer) {
      this.masked = Mask.mergeConfigs(this.loadMaskDefaults, loadMask);
      ret = this.masked;
    }
    return ret;
  }
  /**
   * Hide the load mask.
   * @category Misc
   */
  unmaskBody() {
    this.masked = null;
  }
  updateEmptyText(emptyText) {
    var _a, _b;
    (_a = this.emptyTextEl) == null ? void 0 : _a.remove();
    this.emptyTextEl = DomHelper.createElement({
      parent: (_b = this.firstItem) == null ? void 0 : _b.element,
      className: "b-empty-text",
      [(emptyText == null ? void 0 : emptyText.includes("<")) ? "html" : "text"]: emptyText
    });
  }
  toggleEmptyText() {
    const { bodyContainer, store } = this;
    bodyContainer == null ? void 0 : bodyContainer.classList.toggle("b-grid-empty", !(store.count > 0 || store.isLoading || store.isCommitting));
  }
  // Notify columns when our read-only state is toggled
  updateReadOnly(readOnly, old) {
    var _a;
    super.updateReadOnly(readOnly, old);
    if (!this.isConfiguring) {
      for (const column of this.columns.bottomColumns) {
        (_a = column.updateReadOnly) == null ? void 0 : _a.call(column, readOnly);
      }
    }
  }
  //endregion
  //region Extract config
  // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs for the grid, with special handling for inline data
  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options), { store } = this, data = store.getInlineData(options), storeState = store.getCurrentConfig(options) || result.store;
    if (data.length) {
      result.data = data;
    }
    if (storeState && store.originalModelClass === GridRowModel) {
      delete storeState.modelClass;
    }
    if (!ObjectHelper.isEmpty(storeState)) {
      result.store = storeState;
    }
    if (result.store) {
      delete result.store.data;
    }
    return result;
  }
  //endregion
};
__publicField(GridBase, "bindStoreChangeset", true);
GridBase.initClass();
VersionHelper.setVersion("grid", "5.6.2");
GridBase._$name = "GridBase";

export {
  Location,
  Column,
  ColumnStore,
  WidgetColumn,
  CheckColumn,
  RowNumberColumn,
  CopyPasteBase,
  GridFeatureManager,
  CellEdit,
  CellMenu,
  ColumnDragToolbar,
  ColumnPicker,
  ColumnReorder,
  ColumnResize,
  GridFieldFilterPicker,
  GridFieldFilterPickerGroup,
  Filter,
  FilterBar,
  Group,
  HeaderMenu,
  RegionResize,
  Sort,
  Stripe,
  Row,
  Bar,
  Footer,
  RowManager,
  Header,
  GridElementEvents_default,
  GridFeatures_default,
  GridResponsive_default,
  GridSelection_default,
  GridState_default,
  SubGrid,
  GridSubGrids_default,
  GridBase
};
//# sourceMappingURL=chunk-GGOYEX2W.js.map
