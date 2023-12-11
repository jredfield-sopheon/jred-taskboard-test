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
  Checkbox,
  Combo,
  Delayable_default,
  DomClassList,
  DomDataStore,
  DomHelper,
  EventHelper,
  Events_default,
  Factoryable_default,
  IdHelper,
  Identifiable_default,
  ObjectHelper,
  Objects,
  StringHelper,
  Tooltip,
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Core/lib/Core/data/stm/state/StateBase.js
var throwAbstractMethodCall = () => {
  throw new Error("Abstract method call!");
};
var throwInvalidMethodCall = () => {
  throw new Error("Method cannot be called at this state!");
};
var StateBase = class extends Base {
  canUndo(stm) {
    throwAbstractMethodCall();
  }
  canRedo(stm) {
    throwAbstractMethodCall();
  }
  onUndo(stm) {
    throwAbstractMethodCall();
  }
  onRedo(stm) {
    throwAbstractMethodCall();
  }
  onStartTransaction(stm) {
    throwAbstractMethodCall();
  }
  onStopTransaction(stm) {
    throwAbstractMethodCall();
  }
  onStopTransactionDelayed(stm) {
    throwAbstractMethodCall();
  }
  onRejectTransaction(stm) {
    throwAbstractMethodCall();
  }
  onEnable(stm) {
    throwAbstractMethodCall();
  }
  onDisable(stm) {
    throwAbstractMethodCall();
  }
  onAutoRecordOn(stm) {
    throwAbstractMethodCall();
  }
  onAutoRecordOff(stm) {
    throwAbstractMethodCall();
  }
  onResetQueue(stm) {
    throwAbstractMethodCall();
  }
  onModelUpdate(stm) {
    throwAbstractMethodCall();
  }
  onStoreModelAdd(stm) {
    throwAbstractMethodCall();
  }
  onStoreModelInsert(stm) {
    throwAbstractMethodCall();
  }
  onStoreModelRemove(stm) {
    throwAbstractMethodCall();
  }
  onStoreModelRemoveAll(stm) {
    throwAbstractMethodCall();
  }
  onModelInsertChild(stm) {
    throwAbstractMethodCall();
  }
  onModelRemoveChild(stm) {
    throwAbstractMethodCall();
  }
};
StateBase._$name = "StateBase";

// ../Core/lib/Core/data/stm/Transaction.js
var ACTION_QUEUE_PROP = Symbol("ACTION_QUEUE_PROP");
var Transaction = class extends Base {
  get defaultConfig() {
    return {
      /**
       * Transaction title
       *
       * @config {String}
       */
      title: null
    };
  }
  construct(...args) {
    this[ACTION_QUEUE_PROP] = [];
    super.construct(...args);
  }
  /**
   * Gets transaction's actions queue
   *
   * @property {Core.data.stm.action.ActionBase[]}
   */
  get queue() {
    return this[ACTION_QUEUE_PROP].slice(0);
  }
  /**
   * Gets transaction's actions queue length
   *
   * @property {Number}
   */
  get length() {
    return this[ACTION_QUEUE_PROP].length;
  }
  /**
   * Adds an action to the transaction.
   *
   * @param {Core.data.stm.action.ActionBase|Object} action
   */
  addAction(action) {
    this[ACTION_QUEUE_PROP].push(action);
  }
  /**
   * Undoes actions held
   */
  undo() {
    const queue = this[ACTION_QUEUE_PROP];
    for (let i = queue.length - 1; i >= 0; --i) {
      queue[i].undo();
    }
  }
  /**
   * Redoes actions held
   */
  redo() {
    const queue = this[ACTION_QUEUE_PROP];
    for (let i = 0, len = queue.length; i < len; ++i) {
      queue[i].redo();
    }
  }
};
Transaction._$name = "Transaction";

// ../Core/lib/Core/data/stm/action/ActionBase.js
var throwAbstractMethodCall2 = () => {
  throw new Error("Abstract method call!");
};
var ActionBase = class extends Base {
  /**
   * Gets the type of the action (stringified class name).
   * @readonly
   * @property {String}
   */
  get type() {
    return this.constructor.name;
  }
  /**
   * Undoes an action
   */
  undo() {
    throwAbstractMethodCall2();
  }
  /**
   * Redoes an action
   */
  redo() {
    throwAbstractMethodCall2();
  }
};
ActionBase._$name = "ActionBase";

// ../Core/lib/Core/data/stm/action/UpdateAction.js
var MODEL_PROP = Symbol("MODEL_PROP");
var NEW_DATA_PROP = Symbol("NEW_DATA_PROP");
var OLD_DATA_PROP = Symbol("OLD_DATA_PROP");
var UpdateAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a model which has been updated.
       *
       * @prp {Core.data.Model}
       * @readonly
       * @default
       */
      model: void 0,
      /**
       * Map of updated properties with new values.
       *
       * @prp {Object}
       * @readonly
       * @typings {{[key: string]:any}}
       * @default
       */
      newData: void 0,
      /**
       * Map of updated properties with old values.
       *
       * @prp {Object}
       * @readonly
       * @typings {{[key: string]:any}}
       * @default
       */
      oldData: void 0,
      isInitialUserAction: false
    };
  }
  get type() {
    return "UpdateAction";
  }
  get model() {
    return this[MODEL_PROP];
  }
  set model(value) {
    this[MODEL_PROP] = value;
  }
  get newData() {
    return this[NEW_DATA_PROP];
  }
  set newData(value) {
    this[NEW_DATA_PROP] = { ...value };
  }
  get oldData() {
    return this[OLD_DATA_PROP];
  }
  set oldData(value) {
    this[OLD_DATA_PROP] = { ...value };
  }
  undo() {
    const { model, oldData } = this;
    if (model.$) {
      Object.assign(model, oldData);
    }
    model.set(oldData, null, null, null, Boolean(model.$));
  }
  redo() {
    const { model, newData } = this;
    if (model.$) {
      Object.assign(model, newData);
    }
    model.set(newData, null, null, null, Boolean(model.$));
  }
};
UpdateAction._$name = "UpdateAction";

// ../Core/lib/Core/data/stm/action/InsertChildAction.js
var PARENT_MODEL_PROP = Symbol("PARENT_MODEL_PROP");
var CHILD_MODELS_PROP = Symbol("CHILD_MODELS_PROP");
var INSERT_INDEX_PROP = Symbol("INSERT_INDEX_PROP");
var CONTEXT_PROP = Symbol("CONTEXT_PROP");
var InsertChildAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a parent model a child model has been added to.
       *
       * @prp {Core.data.Model}
       * @readonly
       * @default
       */
      parentModel: void 0,
      /**
       * Children models inserted.
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      childModels: void 0,
      /**
       * Index a children models are inserted at
       *
       * @prp {Number}
       * @readonly
       * @default
       */
      insertIndex: void 0,
      /**
       * Map having children models as keys and values containing previous parent
       * of each model and index at the previous parent.
       *
       * @prp {Object}
       * @readonly
       * @default
       */
      context: void 0
    };
  }
  get type() {
    return "InsertChildAction";
  }
  get parentModel() {
    return this[PARENT_MODEL_PROP];
  }
  set parentModel(model) {
    this[PARENT_MODEL_PROP] = model;
  }
  get childModels() {
    return this[CHILD_MODELS_PROP];
  }
  set childModels(models) {
    this[CHILD_MODELS_PROP] = models.slice(0);
  }
  get insertIndex() {
    return this[INSERT_INDEX_PROP];
  }
  set insertIndex(index) {
    this[INSERT_INDEX_PROP] = index;
  }
  get context() {
    return this[CONTEXT_PROP];
  }
  set context(ctx) {
    this[CONTEXT_PROP] = ctx;
  }
  undo() {
    const { parentModel, context, childModels } = this, byFromParent = /* @__PURE__ */ new Map(), newlyAdded = /* @__PURE__ */ new Set();
    for (const childModel of childModels) {
      const ctx = context.get(childModel);
      if (!ctx) {
        newlyAdded.add(childModel);
      } else {
        let undoTaskData = byFromParent.get(ctx.parent);
        if (!undoTaskData) {
          undoTaskData = { moveRight: [], moveLeft: [], moveFromAnotherParent: [] };
          byFromParent.set(ctx.parent, undoTaskData);
        }
        if (ctx.parent === parentModel) {
          if (ctx.index > childModel.parentIndex) {
            undoTaskData.moveRight.push({ parent: ctx.parent, model: childModel, index: ctx.index + 1 });
          } else {
            undoTaskData.moveLeft.push({ parent: ctx.parent, model: childModel, index: ctx.index });
          }
        } else {
          undoTaskData.moveFromAnotherParent.push({ parent: ctx.parent, model: childModel, index: ctx.index });
        }
      }
    }
    for (const undoTaskData of byFromParent.values()) {
      const { moveRight, moveLeft } = undoTaskData;
      moveLeft.sort((a, b) => a.index - b.index);
      moveRight.sort((a, b) => b.index - a.index);
    }
    newlyAdded.forEach((model) => model.parent.removeChild(model));
    for (const undoTaskData of byFromParent.values()) {
      const { moveRight, moveLeft, moveFromAnotherParent } = undoTaskData;
      moveLeft.forEach((task) => {
        task.parent.insertChild(task.model, task.index);
      });
      moveRight.forEach((task) => {
        task.parent.insertChild(task.model, task.index);
      });
      moveFromAnotherParent.forEach((task) => {
        task.parent.insertChild(task.model, task.index);
      });
    }
  }
  redo() {
    var _a, _b;
    const { parentModel, insertIndex, childModels } = this, insertBefore = (_a = parentModel.children) == null ? void 0 : _a[insertIndex];
    parentModel.insertChild(childModels, insertBefore, false, {
      orderedBeforeNode: (_b = insertBefore == null ? void 0 : insertBefore.previousSibling) == null ? void 0 : _b.nextOrderedSibling
    });
  }
};
InsertChildAction._$name = "InsertChildAction";

// ../Core/lib/Core/data/stm/action/RemoveChildAction.js
var PARENT_MODEL_PROP2 = Symbol("PARENT_MODEL_PROP");
var CHILD_MODELS_PROP2 = Symbol("CHILD_MODELS_PROP");
var CONTEXT_PROP2 = Symbol("CONTEXT_PROP");
var RemoveChildAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a parent model a child model has been removed to.
       *
       * @prp {Core.data.Model}
       * @readonly
       * @default
       */
      parentModel: void 0,
      /**
       * Children models removed.
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      childModels: void 0,
      /**
       * Map having children models as keys and values containing previous parent
       * index at the parent.
       *
       * @prp {Object}
       * @readonly
       * @default
       */
      context: void 0
    };
  }
  get type() {
    return "RemoveChildAction";
  }
  get parentModel() {
    return this[PARENT_MODEL_PROP2];
  }
  set parentModel(model) {
    this[PARENT_MODEL_PROP2] = model;
  }
  get childModels() {
    return this[CHILD_MODELS_PROP2];
  }
  set childModels(models) {
    this[CHILD_MODELS_PROP2] = models.slice(0);
  }
  get context() {
    return this[CONTEXT_PROP2];
  }
  set context(ctx) {
    this[CONTEXT_PROP2] = ctx;
  }
  undo() {
    const { parentModel, context, childModels } = this;
    childModels.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs), rhsIndex = context.get(rhs);
      return lhsIndex - rhsIndex;
    });
    childModels.forEach((m) => {
      const ctx = context.get(m);
      parentModel.insertChild(m, ctx.parentIndex, void 0, { orderedParentIndex: ctx.orderedParentIndex });
    });
  }
  redo() {
    this.parentModel.removeChild(this.childModels);
  }
};
RemoveChildAction._$name = "RemoveChildAction";

// ../Core/lib/Core/data/stm/action/AddAction.js
var STORE_PROP = Symbol("STORE_PROP");
var MODEL_LIST_PROP = Symbol("MODEL_LIST_PROP");
var AddAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been added into.
       *
       * @prp {Core.data.Store}
       * @readonly
       * @default
       */
      store: void 0,
      /**
       * List of models added into the store.
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      modelList: void 0,
      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @prp {Boolean}
       * @readonly
       * @default
       */
      silent: false
    };
  }
  get type() {
    return "AddAction";
  }
  get store() {
    return this[STORE_PROP];
  }
  set store(store) {
    this[STORE_PROP] = store;
  }
  get modelList() {
    return this[MODEL_LIST_PROP];
  }
  set modelList(list) {
    this[MODEL_LIST_PROP] = list.slice(0);
  }
  undo() {
    this.store.remove(this.modelList, this.silent);
  }
  redo() {
    this.store.add(this.modelList, this.silent);
  }
};
AddAction._$name = "AddAction";

// ../Core/lib/Core/data/stm/action/InsertAction.js
var STORE_PROP2 = Symbol("STORE_PROP");
var MODEL_LIST_PROP2 = Symbol("MODEL_LIST_PROP");
var INSERT_INDEX_PROP2 = Symbol("INSERT_INDEX_PROP");
var CONTEXT_PROP3 = Symbol("CONTEXT_PROP");
var InsertAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been inserted into.
       *
       * @prp {Core.data.Store}
       * @readonly
       * @default
       */
      store: void 0,
      /**
       * List of models inserted into the store.
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      modelList: void 0,
      /**
       * Index the models have been inserted at.
       *
       * @prp {Number}
       * @readonly
       * @default
       */
      insertIndex: void 0,
      /**
       * Models move context (if models has been moved), if any.
       * Map this {@link Core/data/Model} instances as keys and their
       * previous index as values
       *
       * @prp {Map}
       * @readonly
       * @default
       */
      context: void 0,
      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @prp {Boolean}
       * @readonly
       * @default
       */
      silent: false
    };
  }
  get type() {
    return "InsertAction";
  }
  get store() {
    return this[STORE_PROP2];
  }
  set store(store) {
    this[STORE_PROP2] = store;
  }
  get modelList() {
    return this[MODEL_LIST_PROP2];
  }
  set modelList(list) {
    this[MODEL_LIST_PROP2] = list.slice(0);
  }
  get insertIndex() {
    return this[INSERT_INDEX_PROP2];
  }
  set insertIndex(index) {
    this[INSERT_INDEX_PROP2] = index;
  }
  get context() {
    return this[CONTEXT_PROP3];
  }
  set context(context) {
    this[CONTEXT_PROP3] = context;
  }
  undo() {
    const { store, modelList, context, silent } = this;
    modelList.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs), rhsIndex = context.get(rhs);
      return lhsIndex !== void 0 && rhsIndex !== void 0 ? lhsIndex - rhsIndex : 0;
    });
    modelList.forEach((m) => {
      const index = context.get(m);
      m._undoingInsertion = true;
      if (index !== void 0) {
        store.insert(index, m, silent);
      } else {
        store.remove(m, silent);
      }
      m._undoingInsertion = false;
    });
  }
  redo() {
    const me = this;
    me.store.insert(me.insertIndex, me.modelList, me.silent);
  }
};
InsertAction._$name = "InsertAction";

// ../Core/lib/Core/data/stm/action/RemoveAction.js
var STORE_PROP3 = Symbol("STORE_PROP");
var MODEL_LIST_PROP3 = Symbol("MODEL_LIST_PROP");
var CONTEXT_PROP4 = Symbol("CONTEXT_PROP");
var RemoveAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been removed from.
       *
       * @prp {Core.data.Store}
       * @readonly
       * @default
       */
      store: void 0,
      /**
       * List of models removed from the store.
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      modelList: void 0,
      /**
       * Models removing context.
       *
       * @prp {Object}
       * @readonly
       * @default
       */
      context: void 0,
      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @prp {Boolean}
       * @readonly
       * @default
       */
      silent: false
    };
  }
  get type() {
    return "RemoveAction";
  }
  get store() {
    return this[STORE_PROP3];
  }
  set store(store) {
    this[STORE_PROP3] = store;
  }
  get modelList() {
    return this[MODEL_LIST_PROP3];
  }
  set modelList(list) {
    this[MODEL_LIST_PROP3] = list.slice(0);
  }
  get context() {
    return this[CONTEXT_PROP4];
  }
  set context(context) {
    this[CONTEXT_PROP4] = context;
  }
  undo() {
    const { store, context, modelList, silent } = this;
    modelList.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs), rhsIndex = context.get(rhs);
      return lhsIndex - rhsIndex;
    });
    modelList.forEach((m) => {
      const index = context.get(m);
      store.insert(index, m, silent);
    });
  }
  redo() {
    this.store.remove(this.modelList, this.silent);
  }
};
RemoveAction._$name = "RemoveAction";

// ../Core/lib/Core/data/stm/action/RemoveAllAction.js
var STORE_PROP4 = Symbol("STORE_PROP");
var ALL_RECORDS_PROP = Symbol("ALL_RECORDS_PROP");
var RemoveAllAction = class extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store cleared.
       *
       * @prp {Core.data.Store}
       * @readonly
       * @default
       */
      store: void 0,
      /**
       * All store records removed
       *
       * @prp {Core.data.Model[]}
       * @readonly
       * @default
       */
      allRecords: void 0,
      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @prp {Boolean}
       * @readonly
       * @default
       */
      silent: false
    };
  }
  get type() {
    return "RemoveAllAction";
  }
  get store() {
    return this[STORE_PROP4];
  }
  set store(store) {
    this[STORE_PROP4] = store;
  }
  get allRecords() {
    return this[ALL_RECORDS_PROP];
  }
  set allRecords(records) {
    this[ALL_RECORDS_PROP] = records.slice(0);
  }
  undo() {
    const { store, allRecords, silent } = this;
    store.add(allRecords, silent);
  }
  redo() {
    this.store.removeAll(this.silent);
  }
};
RemoveAllAction._$name = "RemoveAllAction";

// ../Core/lib/Core/data/stm/Props.js
var STATE_PROP = Symbol("STATE_PROP");
var STORES_PROP = Symbol("STORES_PROP");
var QUEUE_PROP = Symbol("QUEUE_PROP");
var POS_PROP = Symbol("POS_PROP");
var TRANSACTION_PROP = Symbol("TRANSACTION_PROP");
var TRANSACTION_TIMER_PROP = Symbol("TRANSACTION_TIMER_PROP");
var AUTO_RECORD_PROP = Symbol("AUTO_RECORD_PROP");
var IS_APPLYING_STASH = Symbol("IS_APPLYING_STASH");
var PROPS = Object.freeze([
  STATE_PROP,
  STORES_PROP,
  QUEUE_PROP,
  POS_PROP,
  TRANSACTION_PROP,
  TRANSACTION_TIMER_PROP,
  AUTO_RECORD_PROP,
  IS_APPLYING_STASH
]);

// ../Core/lib/Core/data/stm/state/Registry.js
var registry = /* @__PURE__ */ new Map();
var registerStmState = (name, state) => {
  registry.set(name, state);
};
var resolveStmState = (state) => {
  if (typeof state === "string") {
    state = registry.get(state);
  }
  return state;
};
var Registry_default = {
  registerStmState,
  resolveStmState
};

// ../Core/lib/Core/data/stm/Helpers.js
var resetQueue = (stm, options) => {
  const { undo, redo } = options;
  let newProps;
  if (undo && !redo) {
    newProps = {
      [QUEUE_PROP]: stm[QUEUE_PROP].slice(stm.position),
      [POS_PROP]: 0
    };
  } else if (redo && !undo) {
    newProps = {
      [QUEUE_PROP]: stm[QUEUE_PROP].slice(0, stm.position)
    };
  } else {
    newProps = {
      [QUEUE_PROP]: [],
      [POS_PROP]: 0
    };
  }
  ;
  return [
    newProps,
    () => {
      stm.notifyStoresAboutQueueReset(options);
    }
  ];
};

// ../Core/lib/Core/data/stm/state/DisabledState.js
var DisabledStateClass = class extends StateBase {
  canUndo() {
    return false;
  }
  canRedo() {
    return false;
  }
  onUndo() {
    throwInvalidMethodCall();
  }
  onRedo() {
    throwInvalidMethodCall();
  }
  onEnable(stm) {
    return stm.autoRecord ? "autoreadystate" : "readystate";
  }
  onDisable() {
    throwInvalidMethodCall();
  }
  onAutoRecordOn() {
    return {
      [AUTO_RECORD_PROP]: true
    };
  }
  onAutoRecordOff() {
    return {
      [AUTO_RECORD_PROP]: false
    };
  }
  onStartTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }
  onRejectTransaction() {
    throwInvalidMethodCall();
  }
  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }
  onModelUpdate() {
  }
  onModelInsertChild() {
  }
  onModelRemoveChild() {
  }
  onStoreModelAdd() {
  }
  onStoreModelInsert() {
  }
  onStoreModelRemove() {
  }
  onStoreRemoveAll() {
  }
};
var DisabledState = new DisabledStateClass();
var DisabledState_default = DisabledState;
Registry_default.registerStmState("disabledstate", DisabledState);

// ../Core/lib/Core/data/stm/state/ReadyState.js
var ReadyStateClass = class extends StateBase {
  canUndo(stm) {
    return 0 < stm.position && stm.position <= stm.length;
  }
  canRedo(stm) {
    return 0 <= stm.position && stm.position < stm.length;
  }
  onUndo(stm, steps) {
    let curPos = stm.position;
    const queue = stm[QUEUE_PROP], newPos = Math.max(0, curPos - steps), next = () => {
      stm.notifyStoresAboutStateRestoringStart();
      const undoneTransactions = [];
      while (curPos !== newPos) {
        const transaction = queue[--curPos];
        transaction.undo();
        undoneTransactions.push(transaction);
      }
      return [stm.autoRecord ? "autoreadystate" : "readystate", () => {
        stm.notifyStoresAboutStateRestoringStop({ cause: "undo", transactions: undoneTransactions });
      }];
    };
    return [{
      [STATE_PROP]: "restoringstate",
      [POS_PROP]: newPos
    }, next];
  }
  onRedo(stm, steps) {
    let curPos = stm.position;
    const queue = stm[QUEUE_PROP], newPos = Math.min(queue.length, curPos + steps);
    const next = () => {
      stm.notifyStoresAboutStateRestoringStart();
      const redoneTransactions = [];
      do {
        const transaction = queue[curPos++];
        transaction.redo();
        redoneTransactions.push(transaction);
      } while (curPos !== newPos);
      return [stm.autoRecord ? "autoreadystate" : "readystate", () => {
        stm.notifyStoresAboutStateRestoringStop({ cause: "redo", transactions: redoneTransactions });
      }];
    };
    return [{
      [STATE_PROP]: "restoringstate",
      [POS_PROP]: newPos
    }, next];
  }
  onEnable() {
    throwInvalidMethodCall();
  }
  onDisable() {
    return "disabledstate";
  }
  onAutoRecordOn() {
    return {
      [STATE_PROP]: "autoreadystate",
      [AUTO_RECORD_PROP]: true
    };
  }
  onAutoRecordOff() {
    throwInvalidMethodCall();
  }
  onStartTransaction(stm, title) {
    const transaction = new Transaction({ title });
    return [{
      [STATE_PROP]: "recordingstate",
      [TRANSACTION_PROP]: transaction
    }, () => {
      stm.notifyStoresAboutStateRecordingStart(transaction);
    }];
  }
  onStopTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }
  onRejectTransaction() {
    throwInvalidMethodCall();
  }
  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }
  onModelUpdate() {
  }
  onModelInsertChild() {
  }
  onModelRemoveChild() {
  }
  onStoreModelAdd() {
  }
  onStoreModelInsert() {
  }
  onStoreModelRemove() {
  }
  onStoreRemoveAll() {
  }
};
var ReadyState = new ReadyStateClass();
var ReadyState_default = ReadyState;
Registry_default.registerStmState("readystate", ReadyState);

// ../Core/lib/Core/data/stm/state/RecordingState.js
var RecordingStateClass = class extends StateBase {
  canUndo() {
    return false;
  }
  canRedo() {
    return false;
  }
  onEnable() {
  }
  onDisable(stm) {
    const transaction = stm[TRANSACTION_PROP];
    stm.notifyStoresAboutStateRecordingStop(transaction, { disabled: true });
    return {
      [STATE_PROP]: "disabledstate",
      [TRANSACTION_PROP]: null
    };
  }
  onAutoRecordOn(stm) {
    return [{
      [STATE_PROP]: "autorecordingstate",
      [AUTO_RECORD_PROP]: true
    }, () => {
      stm.stopTransactionDelayed();
    }];
  }
  onAutoRecordOff() {
    throwInvalidMethodCall();
  }
  onStartTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransaction(stm, title) {
    const transaction = stm[TRANSACTION_PROP], queue = stm[QUEUE_PROP];
    let position = stm[POS_PROP];
    if (transaction.length) {
      if (!transaction.title && !title && stm.getTransactionTitle) {
        transaction.title = stm.getTransactionTitle(transaction);
      } else if (title) {
        transaction.title = title;
      }
      queue[position] = transaction;
      queue.length = ++position;
    }
    return [{
      [STATE_PROP]: "readystate",
      [POS_PROP]: position,
      [TRANSACTION_PROP]: null
    }, () => {
      stm.notifyStoresAboutStateRecordingStop(transaction, { stop: true });
    }];
  }
  onRejectTransaction(stm) {
    const transaction = stm[TRANSACTION_PROP];
    return [{
      [STATE_PROP]: "restoringstate",
      [TRANSACTION_PROP]: null
    }, () => {
      if (transaction.length) {
        transaction.undo();
      }
      return [
        "readystate",
        () => {
          stm.notifyStoresAboutStateRecordingStop(transaction, { rejected: true });
        }
      ];
    }];
  }
  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }
  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }
  onModelUpdate(stm, model, newData, oldData, isInitialUserAction) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelUpdateAction(model, newData, oldData, isInitialUserAction));
  }
  onModelInsertChild(stm, parentModel, index, childModel, previousParent, previousIndex) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelInsertChildAction(parentModel, index, childModel, previousParent, previousIndex));
  }
  onModelRemoveChild(stm, parentModel, childModels, context) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelRemoveChildAction(parentModel, childModels, context));
  }
  onStoreModelAdd(stm, store, models, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelAddAction(store, models, silent));
  }
  onStoreModelInsert(stm, store, index, models, context, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelInsertAction(store, index, models, context, silent));
  }
  onStoreModelRemove(stm, store, models, context, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelRemoveAction(store, models, context, silent));
  }
  onStoreRemoveAll(stm, store, allRecords, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreRemoveAllAction(store, allRecords, silent));
  }
};
var RecordingState = new RecordingStateClass();
var RecordingState_default = RecordingState;
Registry_default.registerStmState("recordingstate", RecordingState);

// ../Core/lib/Core/data/stm/state/RestoringState.js
var RestoringStateClass = class extends StateBase {
  static get $name() {
    return "RestoringStateClass";
  }
  canUndo() {
    return false;
  }
  canRedo() {
    return false;
  }
  onUndo() {
    throwInvalidMethodCall();
  }
  onRedo() {
    throwInvalidMethodCall();
  }
  onEnable() {
    throwInvalidMethodCall();
  }
  onDisable() {
    throwInvalidMethodCall();
  }
  onAutoRecordOn() {
    return {
      [AUTO_RECORD_PROP]: true
    };
  }
  onAutoRecordOff() {
    return {
      [AUTO_RECORD_PROP]: false
    };
  }
  onStartTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransaction() {
    throwInvalidMethodCall();
  }
  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }
  onRejectTransaction() {
    throwInvalidMethodCall();
  }
  onQueueReset() {
    throwInvalidMethodCall();
  }
  onModelUpdate() {
  }
  onModelInsertChild() {
  }
  onModelRemoveChild() {
  }
  onStoreModelAdd() {
  }
  onStoreModelInsert() {
  }
  onStoreModelRemove() {
  }
  onStoreRemoveAll() {
  }
};
var RestoringState = new RestoringStateClass();
var RestoringState_default = RestoringState;
Registry_default.registerStmState("restoringstate", RestoringState);

// ../Core/lib/Core/data/stm/state/AutoReadyState.js
var AutoReadyStateClass = class extends ReadyStateClass {
  onAutoRecordOn() {
    throwInvalidMethodCall();
  }
  onAutoRecordOff() {
    return {
      [STATE_PROP]: "readystate",
      [AUTO_RECORD_PROP]: false
    };
  }
  onStartTransaction(stm, title) {
    const transaction = new Transaction({ title });
    return [{
      [STATE_PROP]: "autorecordingstate",
      [TRANSACTION_PROP]: transaction
    }, () => {
      stm.notifyStoresAboutStateRecordingStart(transaction);
      stm.stopTransactionDelayed();
    }];
  }
  onModelUpdate(stm, model, newData, oldData) {
    stm.startTransaction();
    stm.onModelUpdate(model, newData, oldData);
  }
  onModelInsertChild(stm, parentModel, index, childModels, context) {
    stm.startTransaction();
    stm.onModelInsertChild(parentModel, index, childModels, context);
  }
  onModelRemoveChild(stm, parentModel, childModels, context) {
    stm.startTransaction();
    stm.onModelRemoveChild(parentModel, childModels, context);
  }
  onStoreModelAdd(stm, store, models, silent) {
    stm.startTransaction();
    stm.onStoreModelAdd(store, models, silent);
  }
  onStoreModelInsert(stm, store, index, models, context, silent) {
    stm.startTransaction();
    stm.onStoreModelInsert(store, index, models, context, silent);
  }
  onStoreModelRemove(stm, store, models, context, silent) {
    stm.startTransaction();
    stm.onStoreModelRemove(store, models, context, silent);
  }
  onStoreRemoveAll(stm, store, allRecords, silent) {
    stm.startTransaction();
    stm.onStoreRemoveAll(store, allRecords, silent);
  }
};
var AutoReadyState = new AutoReadyStateClass();
var AutoReadyState_default = AutoReadyState;
Registry_default.registerStmState("autoreadystate", AutoReadyState);

// ../Core/lib/Core/data/stm/state/AutoRecordingState.js
var AutoRecordingStateClass = class extends RecordingStateClass.mixin(Delayable_default) {
  onDisable(stm) {
    const transaction = stm[TRANSACTION_PROP], timer = stm[TRANSACTION_TIMER_PROP];
    if (timer) {
      this.clearTimeout(timer);
    }
    stm.notifyStoresAboutStateRecordingStop(transaction, { disabled: true });
    return {
      [STATE_PROP]: "disabledstate",
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    };
  }
  onAutoRecordOn(stm) {
    throwInvalidMethodCall();
  }
  onAutoRecordOff(stm) {
    const timer = stm[TRANSACTION_TIMER_PROP];
    if (timer) {
      this.clearTimeout(timer);
    }
    return {
      [STATE_PROP]: "recordingstate",
      [AUTO_RECORD_PROP]: false,
      [TRANSACTION_TIMER_PROP]: null
    };
  }
  onStopTransaction(stm, title) {
    const transaction = stm[TRANSACTION_PROP], timer = stm[TRANSACTION_TIMER_PROP], queue = stm[QUEUE_PROP];
    let position = stm[POS_PROP];
    if (timer) {
      this.clearTimeout(timer);
    }
    if (transaction.length) {
      if (!transaction.title && !title && stm.getTransactionTitle) {
        transaction.title = stm.getTransactionTitle(transaction);
      } else if (title) {
        transaction.title = title;
      }
      queue[position] = transaction;
      queue.length = ++position;
    }
    return [{
      [STATE_PROP]: "autoreadystate",
      [POS_PROP]: position,
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    }, () => {
      stm.notifyStoresAboutStateRecordingStop(transaction, { stop: true });
    }];
  }
  onStopTransactionDelayed(stm) {
    let timer = stm[TRANSACTION_TIMER_PROP];
    if (timer) {
      this.clearTimeout(timer);
    }
    timer = this.setTimeout(
      () => {
        stm.stopTransaction();
      },
      stm.autoRecordTransactionStopTimeout
    );
    return {
      [STATE_PROP]: AutoRecordingState,
      [TRANSACTION_TIMER_PROP]: timer
    };
  }
  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }
  onRejectTransaction(stm) {
    const transaction = stm[TRANSACTION_PROP], timer = stm[TRANSACTION_TIMER_PROP];
    if (timer) {
      this.clearTimeout(timer);
    }
    return [{
      [STATE_PROP]: "restoringstate",
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    }, () => {
      if (transaction.length) {
        transaction.undo();
      }
      return [
        "autoreadystate",
        () => {
          stm.notifyStoresAboutStateRecordingStop(transaction, { rejected: true });
        }
      ];
    }];
  }
  onModelUpdate(stm, ...rest) {
    super.onModelUpdate(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onModelInsertChild(stm, ...rest) {
    super.onModelInsertChild(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onModelRemoveChild(stm, ...rest) {
    super.onModelRemoveChild(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onStoreModelAdd(stm, ...rest) {
    super.onStoreModelAdd(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onStoreModelInsert(stm, ...rest) {
    super.onStoreModelInsert(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onStoreModelRemove(stm, ...rest) {
    super.onStoreModelRemove(stm, ...rest);
    stm.stopTransactionDelayed();
  }
  onStoreRemoveAll(stm, ...rest) {
    super.onStoreRemoveAll(stm, ...rest);
    stm.stopTransactionDelayed();
  }
};
var AutoRecordingState = new AutoRecordingStateClass();
var AutoRecordingState_default = AutoRecordingState;
Registry_default.registerStmState("autorecordingstate", AutoRecordingState);

// ../Core/lib/Core/data/stm/StateTrackingManager.js
var makeModelUpdateAction = (model, newData, oldData, isInitialUserAction) => {
  return new UpdateAction({
    model,
    newData,
    oldData,
    isInitialUserAction
  });
};
var makeModelInsertChildAction = (parentModel, insertIndex, childModels, context) => {
  return new InsertChildAction({
    parentModel,
    childModels,
    insertIndex,
    context
  });
};
var makeModelRemoveChildAction = (parentModel, childModels, context) => {
  return new RemoveChildAction({
    parentModel,
    childModels,
    context
  });
};
var makeStoreModelAddAction = (store, modelList, silent) => {
  return new AddAction({
    store,
    modelList,
    silent
  });
};
var makeStoreModelInsertAction = (store, insertIndex, modelList, context, silent) => {
  return new InsertAction({
    store,
    insertIndex,
    modelList,
    context,
    silent
  });
};
var makeStoreModelRemoveAction = (store, modelList, context, silent) => {
  return new RemoveAction({
    store,
    modelList,
    context,
    silent
  });
};
var makeStoreRemoveAllAction = (store, allRecords, silent) => {
  return new RemoveAllAction({
    store,
    allRecords,
    silent
  });
};
var stateTransition = (stm, event, ...args) => {
  const oldState = stm.state, newState = event.call(stm[STATE_PROP], stm, ...args);
  if (typeof newState === "string") {
    stm[STATE_PROP] = Registry_default.resolveStmState(newState);
  } else if (newState instanceof StateBase) {
    stm[STATE_PROP] = newState;
  } else if (Array.isArray(newState)) {
    const [state, next] = newState;
    if (typeof state === "string") {
      stm[STATE_PROP] = Registry_default.resolveStmState(state);
    } else if (state instanceof StateBase) {
      stm[STATE_PROP] = state;
    } else if (state && typeof state === "object") {
      stm = Object.assign(stm, state);
      stm[STATE_PROP] = Registry_default.resolveStmState(stm[STATE_PROP]);
    }
    if (typeof next === "function") {
      stateTransition(stm, next, ...args);
    }
  } else if (newState && typeof newState === "object") {
    stm = Object.assign(stm, newState);
    stm[STATE_PROP] = Registry_default.resolveStmState(stm[STATE_PROP]);
  }
  if (oldState !== ReadyState_default && oldState !== AutoReadyState_default && (newState !== ReadyState_default && newState !== AutoReadyState_default)) {
    stm.trigger("ready");
  }
};
var StateTrackingManager = class extends Events_default(Base) {
  static get defaultConfig() {
    return {
      /**
       * Default manager disabled state
       *
       * @config {Boolean}
       * @default
       */
      disabled: true,
      /**
       * Whether to start transaction recording automatically in case the Manager is enabled.
       *
       * In the auto recording mode, the manager waits for the first change in any store being managed and starts a transaction, i.e.
       * records any changes in its monitored stores. The transaction lasts for {@link #config-autoRecordTransactionStopTimeout} and
       * afterwards creates one undo/redo step, including all changes in the stores during that period of time.
       *
       * In non auto recording mode you have to call {@link #function-startTransaction} / {@link #function-stopTransaction} to start and end
       * a transaction.
       *
       * @config {Boolean}
       * @default
       */
      autoRecord: false,
      /**
       * The transaction duration (in ms) for the auto recording mode {@link #config-autoRecord}
       *
       * @config {Number}
       * @default
       */
      autoRecordTransactionStopTimeout: 100,
      /**
       * Store model update action factory
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelUpdateAction,
      /**
       * Store insert child model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelInsertChildAction,
      /**
       * Store remove child model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelRemoveChildAction,
      /**
       * Store add model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelAddAction,
      /**
       * Store insert model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelInsertAction,
      /**
       * Store remove model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelRemoveAction,
      /**
       * Store remove all models action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreRemoveAllAction,
      /**
       * Function to create a transaction title if none is provided.
       * The function receives a transaction and should return a title.
       *
       * @config {Function}
       * @param {Core.data.stm.Transaction} transaction
       * @returns {String}
       * @default
       */
      getTransactionTitle: null
    };
  }
  construct(...args) {
    Object.assign(this, {
      [STATE_PROP]: ReadyState_default,
      [STORES_PROP]: [],
      [QUEUE_PROP]: [],
      [POS_PROP]: 0,
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null,
      [AUTO_RECORD_PROP]: false,
      [IS_APPLYING_STASH]: false,
      stashedTransactions: {}
    });
    super.construct(...args);
  }
  /**
   * Gets current state of the manager
   *
   * @property {Core.data.stm.state.StateBase}
   */
  get state() {
    return this[STATE_PROP];
  }
  /**
   * Gets current undo/redo queue position
   *
   * @property {Number}
   */
  get position() {
    return this[POS_PROP];
  }
  /**
   * Gets current undo/redo queue length
   *
   * @property {Number}
   */
  get length() {
    return this[QUEUE_PROP].length;
  }
  /**
   * Gets all the stores registered in STM
   *
   * @property {Core.data.Store[]}
   */
  get stores() {
    return Array.from(this[STORES_PROP]);
  }
  /**
   * Checks if a store has been added to the manager
   *
   * @param  {Core.data.Store} store
   * @returns {Boolean}
   */
  hasStore(store) {
    return this[STORES_PROP].includes(store);
  }
  /**
   * Adds a store to the manager
   *
   * @param {Core.data.Store} store
   */
  addStore(store) {
    if (!this.hasStore(store)) {
      this[STORES_PROP].push(store);
      store.stm = this;
      store.forEach((model) => model.stm = this);
      if (store.isTree) {
        store.rootNode.stm = this;
      }
    }
  }
  /**
   * Removes a store from the manager
   *
   * @param {Core.data.Store} store
   */
  removeStore(store) {
    if (this.hasStore(store)) {
      this[STORES_PROP] = this[STORES_PROP].filter((s) => s !== store);
      store.stm = null;
      store.forEach((model) => model.stm = null);
    }
  }
  /**
   * Calls `fn` for each store registered in STM.
   *
   * @param {Function} fn (store, id) => ...
   */
  forEachStore(fn) {
    this[STORES_PROP].forEach((s) => fn(s, s.id));
  }
  //#region Disabled state
  /**
   * Get/set manager disabled state
   *
   * @property {Boolean}
   */
  get disabled() {
    return this.state === DisabledState_default;
  }
  set disabled(val) {
    const me = this;
    if (me.disabled !== val) {
      if (val) {
        stateTransition(me, me.state.onDisable, me);
      } else {
        stateTransition(me, me.state.onEnable, me);
      }
      me.trigger("stmDisabled", { disabled: val });
      me.trigger("disabled", { disabled: val });
    }
  }
  get enabled() {
    return !this.disabled;
  }
  /**
   * Enables manager
   */
  enable() {
    this.disabled = false;
  }
  /**
   * Disables manager
   */
  disable() {
    this.disabled = true;
  }
  //#endregion
  /**
   * Checks manager ready state
   * @readonly
   * @property {Boolean}
   */
  get isReady() {
    return this.state === ReadyState_default || this.state === AutoReadyState_default;
  }
  waitForReadiness() {
    return this.await("ready", false);
  }
  /**
   * Checks manager recording state
   * @readonly
   * @property {Boolean}
   */
  get isRecording() {
    return this.state === RecordingState_default || this.state === AutoRecordingState_default;
  }
  /**
   * Checks if STM is restoring a stash
   * @readonly
   * @property {Boolean}
   * @internal
   */
  get isApplyingStash() {
    return this[IS_APPLYING_STASH];
  }
  /**
   * Gets/sets manager auto record option
   *
   * @property {Boolean}
   */
  get autoRecord() {
    return this[AUTO_RECORD_PROP];
  }
  set autoRecord(value) {
    const me = this;
    if (me.autoRecord != value) {
      if (value) {
        stateTransition(me, me.state.onAutoRecordOn, me);
      } else {
        stateTransition(me, me.state.onAutoRecordOff, me);
      }
    }
  }
  /**
   * Starts undo/redo recording transaction.
   *
   * @param {String} [title]
   */
  startTransaction(title = null) {
    stateTransition(this, this.state.onStartTransaction, title);
  }
  /**
   * Stops undo/redo recording transaction
   *
   * @param {String} [title]
   */
  stopTransaction(title = null) {
    stateTransition(this, this.state.onStopTransaction, title);
  }
  /**
   * Stops undo/redo recording transaction after {@link #config-autoRecordTransactionStopTimeout} delay.
   *
   * @private
   */
  stopTransactionDelayed() {
    stateTransition(this, this.state.onStopTransactionDelayed);
  }
  /**
   * Rejects currently recorded transaction.
   */
  rejectTransaction() {
    stateTransition(this, this.state.onRejectTransaction);
  }
  /**
   * Gets currently recording STM transaction.
   * @readonly
   * @property {Core.data.stm.Transaction}
   */
  get transaction() {
    return this[TRANSACTION_PROP];
  }
  /**
   * Gets titles of all recorded undo/redo transactions
   * @readonly
   * @property {String[]}
   */
  get queue() {
    return this[QUEUE_PROP].map((t) => t.title);
  }
  get rawQueue() {
    return this[QUEUE_PROP];
  }
  /**
   * Gets manager restoring state.
   * @readonly
   * @property {Boolean}
   */
  get isRestoring() {
    return this.state === RestoringState_default || this.isApplyingStash;
  }
  /**
   * Checks if the manager can undo.
   *
   * @property {Boolean}
   */
  get canUndo() {
    return this.state.canUndo(this);
  }
  /**
   * Checks if the manager can redo.
   *
   * @property {Boolean}
   */
  get canRedo() {
    return this.state.canRedo(this);
  }
  /**
   * Undoes current undo/redo transaction.
   * @param {Number} [steps=1]
   * @returns {Promise} A promise which is resolved when undo action has been performed
   */
  async undo(steps = 1) {
    if (!this.isReady) {
      await this.waitForReadiness();
    }
    stateTransition(this, this.state.onUndo, steps);
  }
  /**
   * Undoes all transactions.
   * @returns {Promise} A promise which is resolved when undo actions has been performed
   */
  async undoAll() {
    if (!this.isReady) {
      await this.waitForReadiness();
    }
    this.undo(this.length);
  }
  /**
   * Redoes current undo/redo transaction.
   *
   * @param {Number} [steps=1]
   * @returns {Promise} A promise which is resolved when redo action has been performed
   */
  async redo(steps = 1) {
    if (!this.isReady) {
      await this.waitForReadiness();
    }
    stateTransition(this, this.state.onRedo, steps);
  }
  /**
   * Redoes all transactions.
   * @returns {Promise} A promise which is resolved when redo actions has been performed
   */
  async redoAll() {
    if (!this.isReady) {
      await this.waitForReadiness();
    }
    this.redo(this.length);
  }
  /**
   * Resets undo/redo queue.
   */
  resetQueue(options = { undo: true, redo: true }) {
    stateTransition(this, this.state.onResetQueue, options);
  }
  /**
   * Resets undo queue.
   */
  resetUndoQueue() {
    this.resetQueue({ undo: true });
  }
  /**
   * Resets redo queue.
   */
  resetRedoQueue() {
    this.resetQueue({ redo: true });
  }
  notifyStoresAboutStateRecordingStart(transaction) {
    this.forEachStore((store) => {
      var _a;
      return (_a = store.onStmRecordingStart) == null ? void 0 : _a.call(store, this, transaction);
    });
    this.trigger("recordingStart", { stm: this, transaction });
  }
  notifyStoresAboutStateRecordingStop(transaction, reason) {
    this.forEachStore((store) => {
      var _a;
      return (_a = store.onStmRecordingStop) == null ? void 0 : _a.call(store, this, transaction, reason);
    });
    this.trigger("recordingStop", { stm: this, transaction, reason });
  }
  notifyStoresAboutStateRestoringStart() {
    this.forEachStore((store) => {
      var _a;
      return (_a = store.onStmRestoringStart) == null ? void 0 : _a.call(store, this);
    });
    this.trigger("restoringStart", { stm: this });
  }
  /**
   * @param {'undo'|'redo'} cause The cause of the restore, if applicable
   * @internal
   */
  notifyStoresAboutStateRestoringStop({ cause, transactions }) {
    this.forEachStore((store) => {
      var _a;
      return (_a = store.onStmRestoringStop) == null ? void 0 : _a.call(store, this);
    });
    this.trigger("restoringStop", { stm: this, cause, transactions });
  }
  notifyStoresAboutQueueReset(options) {
    this.forEachStore((store) => {
      var _a;
      return (_a = store.onStmQueueReset) == null ? void 0 : _a.call(store, this, options);
    });
    this.trigger("queueReset", { stm: this, options });
  }
  /**
   * Method to call from model STM mixin upon model update
   *
   * @param {Core.data.Model} model
   * @param {Object} newData
   * @param {Object} oldData
   *
   * @private
   */
  onModelUpdate(model, newData, oldData, isInitialUserAction) {
    stateTransition(this, this.state.onModelUpdate, model, newData, oldData, isInitialUserAction);
  }
  /**
   * Method to call from model STM mixin upon tree model child insertion
   *
   * @param {Core.data.Model} parentModel Parent model
   * @param {Number} index Insertion index
   * @param {Core.data.Model[]} childModels Array of models inserted
   * @param {Map} context Map with inserted models as keys and objects with previous parent,
   *                      and index at previous parent.
   *
   * @private
   */
  onModelInsertChild(parentModel, index, childModels, context) {
    stateTransition(this, this.state.onModelInsertChild, parentModel, index, childModels, context);
  }
  /**
   * Method to call from model STM mixin upon tree model child removal
   *
   * @param {Core.data.Model} parentModel
   * @param {Core.data.Model[]} childModels
   * @param {Map} context
   *
   * @private
   */
  onModelRemoveChild(parentModel, childModels, context) {
    stateTransition(this, this.state.onModelRemoveChild, parentModel, childModels, context);
  }
  /**
   * Method to call from store STM mixin upon store models adding
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} models
   * @param {Boolean} silent
   *
   * @private
   */
  onStoreModelAdd(store, models, silent) {
    stateTransition(this, this.state.onStoreModelAdd, store, models, silent);
  }
  /**
   * Method to call from store STM mixin upon store models insertion
   *
   * @param {Core.data.Store} store
   * @param {Number} index
   * @param {Core.data.Model[]} models
   * @param {Map} context
   * @param {Boolean} silent
   *
   * @private
   */
  onStoreModelInsert(store, index, models, context, silent) {
    stateTransition(this, this.state.onStoreModelInsert, store, index, models, context, silent);
  }
  /**
   * Method to call from store STM mixin upon store models removal
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} models
   * @param {Object} context
   * @param {Boolean} silent
   *
   * @private
   */
  onStoreModelRemove(store, models, context, silent) {
    stateTransition(this, this.state.onStoreModelRemove, store, models, context, silent);
  }
  /**
   * Method to call from store STM mixin upon store clear
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} allRecords
   * @param {Boolean} silent
   *
   * @private
   */
  onStoreRemoveAll(store, allRecords, silent) {
    stateTransition(this, this.state.onStoreRemoveAll, store, allRecords, silent);
  }
  // UI key event handling
  onUndoKeyPress(event) {
    const me = this;
    if (me.enabled) {
      if (event.shiftKey) {
        if (me.canRedo) {
          event.preventDefault();
          me.redo();
        }
      } else if (me.canUndo) {
        event.preventDefault();
        me.undo();
      }
    }
  }
  stash() {
    const me = this;
    if (this.transaction) {
      const id = IdHelper.generateId("_stashedTransactionGeneratedId_");
      me.stashedTransactions[id] = me.transaction;
      me.rejectTransaction();
      return id;
    }
  }
  applyStash(id) {
    const me = this, transaction = me.stashedTransactions[id];
    me[IS_APPLYING_STASH] = true;
    if (transaction) {
      me.startTransaction(transaction.title);
      transaction.redo();
      delete me.stashedTransactions[id];
    }
    me[IS_APPLYING_STASH] = false;
  }
};
StateTrackingManager._$name = "StateTrackingManager";

// ../Core/lib/Core/mixin/Finalizable.js
var Finalizable_default = (Target) => class Finalizable extends (Target || Base) {
  static get $name() {
    return "Finalizable";
  }
  construct(...args) {
    super.construct(...args);
    this.finalizer = null;
    this.finalizing = null;
    this.isFinalized = false;
    this.isFinalizing = false;
  }
  /**
   * This template method is called at the end of {@link #function-finalize}. By default it calls `destroy()`, but
   * can be replaced by the derived class. This can be useful if it is not the `Finalizable` instance that awaits
   * the {@link #function-finalize} method.
   */
  doFinalize() {
    this.destroy();
  }
  /**
   * This method is called (typically by this instance or its owner) to cleanup this instance while possibly first
   * waiting for the {@link #property-finalizer} promise to settle. Once settled, the {@link #function-doFinalize}
   * method is called.
   * @async
   */
  finalize() {
    const me = this;
    let ret = me.finalizing;
    if (!ret && !me.isFinalized) {
      me.isFinalizing = true;
      me.finalizing = ret = me._awaitFinalizer();
    }
    return ret;
  }
  async _awaitFinalizer() {
    const me = this;
    try {
      await me.finalizer;
    } finally {
      me.finalizing = null;
      me.isFinalized = true;
      me.doFinalize();
    }
  }
};

// ../Core/lib/Core/util/drag/DragContext.js
var ABORTED = Symbol("dragAbort");
var INIT = Symbol("dragInit");
var DRAGGING = Symbol("dragDrag");
var DROPPED = Symbol("dragDrop");
var lockDirections = {
  x: "horizontal",
  y: "vertical"
};
var DragContext = class extends Base.mixin(Finalizable_default, Delayable_default, Identifiable_default) {
  static get configurable() {
    return {
      /**
       * The element that will have the {@link Core.mixin.Draggable#property-draggingItemCls}. This element is
       * determined by the {@link Core.mixin.Draggable#config-dragItemSelector}.
       * @config {HTMLElement}
       */
      itemElement: null,
      /**
       * The `ScrollManager` instance to use for scrolling while dragging.
       * @config {Core.util.ScrollManager}
       * @private
       */
      scrollManager: null,
      /**
       * Config for `startMonitoring` call.
       * @config {Object}
       * @private
       */
      monitoringConfig: null,
      /**
       * The source of the drag operation.
       * @config {Core.mixin.Draggable}
       * @default
       * @readonly
       * @private
       */
      source: null,
      /**
       * The current target of the drag.
       * @member {Core.mixin.Droppable}
       * @readonly
       * @private
       */
      target: null,
      /**
       * The current target element of the drag.
       * @member {HTMLElement}
       * @private
       */
      targetElement: null,
      /**
       * The minimum distance from the touchstart/mousedown/pointerdown that must be moved to actually start a
       * drag operation.
       * @config {Number}
       * @default
       * @readonly
       */
      threshold: 5,
      /**
       * The minimum amount of time a touch must be maintained before it will initiate a drag. Movement prior to
       * this time will cancel the drag in order to allow touch scrolling.
       * @config {Number}
       * @default
       */
      touchStartDelay: 300
    };
  }
  static get identifiable() {
    return {};
  }
  /**
   * The current DOM event being processed.
   * @member {Event} event
   * @readonly
   */
  construct(...args) {
    super.construct(...args);
    const me = this, { event } = me;
    Object.assign(me, {
      /**
       * This property holds the `altKey` state of the most recent event.
       * @member {Boolean}
       */
      altKey: null,
      /**
       * An array of functions to call when cleaning up the context instance.
       * @member {Function[]}
       * @private
       */
      cleaners: [],
      /**
       * This property holds the `ctrlKey` state of the most recent event.
       * @member {Boolean}
       */
      ctrlKey: null,
      /**
       * Container for data associated with the drag. Data items are added by the {@link Core.mixin.Draggable}
       * when the drag starts.
       * @member {Map}
       * @private
       */
      data: /* @__PURE__ */ new Map(),
      /**
       * The element from which the drag operation started.
       * @member {HTMLElement}
       * @readonly
       */
      element: event.target,
      /**
       * The event that completed the drag (a `mouseup`, `pointerup` or `touchend`).
       * @member {Event}
       * @readonly
       */
      endEvent: null,
      /**
       * The most recent `mousemove`, `pointermove` or `touchmove` event.
       * @member {Event}
       * @private
       */
      lastMoveEvent: null,
      /**
       * This property holds the `metaKey` state of the most recent event.
       * @member {Boolean}
       */
      metaKey: null,
      /**
       * The previous {@link #property-target} of the drag.
       * @member {Core.mixin.Droppable}
       * @readonly
       * @private
       */
      previousTarget: null,
      /**
       * The scroll actions reported by the {@link #config-scrollManager}.
       * @member {Object}
       * @private
       */
      scrollerAction: null,
      /**
       * This property holds the `shiftKey` state of the most recent event.
       * @member {Boolean}
       */
      shiftKey: null,
      /**
       * This property holds the current state of the drag process.
       *
       * This will be one of the following values:
       *
       *  - `DragContext.STATE.INIT` - The button is down but there is insufficient movement to start the drag.
       *  - `DragContext.STATE.DRAGGING` - The button is down and movement has started the drag.
       *  - `DragContext.STATE.DROPPED` - The button has been released and drop has occurred.
       *  - `DragContext.STATE.ABORTED` - The drag has been aborted (this happens if the user presses the `ESC`
       *    key or if the {@link #function-abort} method is called).
       *
       * @member {Symbol}
       * @readonly
       * @internal
       */
      state: INIT,
      /**
       * The event that started the drag operation.
       * @member {Event}
       * @readonly
       */
      startEvent: event,
      /**
       * The timer that fires when a touch pointermove is allowed to start the drag. A touch pointermove event
       * prior to this will `abort()` the drag to allow touch scrolling.
       * @member {Number}
       * @private
       */
      touchStartTimer: null,
      /**
       * Stores the value from writes to the {@link #property-valid} property.
       * @member {Boolean}
       * @private
       */
      _valid: true
    });
    if ("touches" in event && me.touchStartDelay) {
      me.touchStartTimer = me.setTimeout(() => me.touchStartTimer = null, me.touchStartDelay, "touchStartDelay");
    }
    EventHelper.on({
      element: globalThis,
      blur: "onWindowBlur",
      thisObj: me
    });
  }
  doDestroy() {
    const me = this, { source, target } = me;
    me.cleanup();
    if ((target == null ? void 0 : target.dropping) === me) {
      target.dropping = null;
    }
    if ((source == null ? void 0 : source.dragging) === me) {
      source.dragging = null;
    }
    super.doDestroy();
  }
  onWindowBlur() {
    if (this.started) {
      this.abort();
    }
  }
  /**
   * This property is `true` if the {@link #function-abort} method was called and `false` otherwise. This
   * is typically because the user pressed the ESC key, however, a drag can be aborted for other reasons.
   * @property {Boolean}
   * @readonly
   */
  get aborted() {
    return this.state === ABORTED;
  }
  /**
   * Returns `true` if the drag has completed either by mouse/pointerup or the {@link #function-abort} method.
   * @property {Boolean}
   * @readonly
   */
  get completed() {
    return this.isDestroying || this.aborted || this.endEvent !== null;
  }
  /**
   * This property is `true` if the drag {@link #config-threshold} has not yet been reached.
   * @property {Boolean}
   * @readonly
   */
  get pending() {
    return this.state === INIT;
  }
  /**
   * This property is `true` if the drag {@link #config-threshold} has been reached and the drag operation is active.
   * @property {Boolean}
   * @readonly
   */
  get started() {
    return this.state !== INIT && !this.aborted;
  }
  /**
   * This property is `true` when the drag is in a valid drop state. This can be set to `false` to indicate the drop
   * is invalid. Setting to `true` does not ensure that the property will be `true` when next read due to other factors
   * that are required to make the drop valid. For example, setting `valid = true` will still return `false` if called
   * before the drag {@link #config-threshold} has not been reached or if the {@link #function-abort} method has been
   * called.
   * @property {Boolean}
   */
  get valid() {
    return this.started && this.targetElement != null && this._valid;
  }
  set valid(v) {
    this._valid = v;
  }
  //region Data Access
  /**
   * Retrieves a data item from the drag source. This method can only be called after the drag has completed.
   * @param {String|String[]} name The name of the data item.
   * @returns {*}
   */
  async get(name) {
    if (this.aborted) {
      throw new Error("Data is not available on aborted drag");
    }
    if (!this.completed) {
      throw new Error("Data is not available until drag completion");
    }
    if (Array.isArray(name)) {
      return Promise.all(name.map((s) => this.get(s)));
    }
    let value = this.data.get(name);
    if (typeof value === "function") {
      value = await value();
      this.data.set(name, value);
    }
    return value;
  }
  /**
   * Returns `true` if the named data item is present.
   * @param {String} name The name of the data item.
   * @returns {Boolean}
   */
  has(name) {
    return this.data.has(name);
  }
  /**
   * Retrieves a data item from the drag source if it is available. This will return `true` for an item that was
   * {@link #function-set} using a renderer function.
   * @param {String|String[]} name The name of the data item.
   * @returns {*}
   */
  peek(name) {
    if (this.aborted) {
      throw new Error("Data is not available on aborted drag");
    }
    if (Array.isArray(name)) {
      return name.map((s) => this.peek(s));
    }
    let value = this.data.get(name);
    if (typeof value === "function") {
      value = true;
    }
    return value;
  }
  /**
   * Sets a data item for the drag. If a function is passed, it is called to render the data only if that data is
   * actually requested via the {@link #function-get} method. A data renderer function can be `async`.
   * @param {String} name The name of the data item.
   * @param {*} value The value of the data item.
   */
  set(name, value) {
    this.data.set(name, value);
  }
  //endregion
  //region Configs
  changeTarget(target, was) {
    if (target !== was) {
      const me = this;
      me._target = target;
      me.previousTarget = was;
      if (was) {
        was.dropping = null;
      }
      if (target) {
        target.dropping = me;
        if (target.dropping !== me) {
          target = null;
          me.valid = false;
        }
      }
      me._target = was;
    }
    return target;
  }
  updateTarget(target, was) {
    const me = this;
    if (was) {
      me.source.dragLeaveTarget(me, was);
    }
    if (target) {
      me.valid = true;
      target.dragMove(me);
      me.source.dragEnterTarget(me);
    }
  }
  updateTargetElement(targetElement) {
    let droppable, droppables, droppableSelector, i, t;
    for (t = targetElement; t; t = t.parentElement) {
      droppables = DomDataStore.get(t, "droppables");
      if (droppables) {
        for (i = 0; i < droppables.length; ++i) {
          droppable = droppables[i];
          if (droppable.dropRootElement.contains(targetElement)) {
            droppableSelector = droppable.droppableSelector;
            if (!droppableSelector || targetElement.closest(`#${DomHelper.getId(droppable.dropRootElement)} ${droppableSelector}`)) {
              this.target = droppable;
              if (this.target === droppable) {
                return;
              }
            }
          }
        }
      }
    }
  }
  //endregion
  //region Operations
  /**
   * Aborts the drag. After calling this method, {@link #property-aborted} will be `true`, {@link #property-valid}
   * will be `false` and {@link #property-completed} will be `true`.
   */
  abort() {
    const me = this, { element, source } = me;
    element == null ? void 0 : element.getBoundingClientRect();
    if (me.state !== DROPPED) {
      me.state = ABORTED;
      me.cleanup();
    }
    source == null ? void 0 : source.endDrag(me);
  }
  begin() {
    const me = this, { source } = me, ret = source.beforeDrag(me);
    if (ret !== false) {
      source.dragging = me;
    }
    return ret;
  }
  cleanup() {
    let cleaner;
    while (cleaner = this.cleaners.pop()) {
      cleaner();
    }
  }
  end(event) {
    const me = this, { lastMoveEvent: lastEvent, target } = me, { dragSwallowClickTime } = me.source;
    me.event = me.domEvent = me.endEvent = event;
    me.syncFlags();
    if (me.started) {
      if ((lastEvent == null ? void 0 : lastEvent.clientX) !== event.clientX || (lastEvent == null ? void 0 : lastEvent.clientY) !== event.clientY || (lastEvent == null ? void 0 : lastEvent.target) !== event.target) {
        me.track();
      }
      if (dragSwallowClickTime) {
        EventHelper.on({
          element: document,
          capture: true,
          expires: dragSwallowClickTime,
          // In case a click did not ensue, remove the listener
          once: true,
          click(event2) {
            event2.stopPropagation();
          }
        });
      }
      me.state = DROPPED;
      if (target !== me.source) {
        target == null ? void 0 : target.dragDrop(me);
      }
    }
  }
  fakeKey(event, down) {
    const me = this, { lastMoveEvent } = me;
    if (lastMoveEvent && me.element) {
      let changed;
      lastMoveEvent.isKey = true;
      if (event.key === "Alt") {
        if (me.altKey !== down) {
          me.altKey = down;
          changed = true;
        }
      } else if (event.key === "Control") {
        if (me.ctrlKey !== down) {
          me.ctrlKey = down;
          changed = true;
        }
      }
      if (changed) {
        me.event = me.domEvent = lastMoveEvent;
        me.track();
      }
    }
  }
  keyDown(event) {
    if (!this.completed) {
      if (event.key === "Escape") {
        this.abort();
      } else if (this.isDragToggleKey(event.key)) {
        this.fakeKey(event, true);
      }
    }
  }
  keyUp(event) {
    if (!this.completed && this.isDragToggleKey(event.key)) {
      this.fakeKey(event, false);
    }
  }
  getDistance(event) {
    return EventHelper.getDistanceBetween(this.startEvent, event);
  }
  isDragToggleKey(key) {
    return key === "Control" || key === "Alt";
  }
  move(event) {
    const me = this, { target } = event, distance = me.getDistance(event), significant = distance >= me.threshold;
    me.syncFlags();
    if (me.touchStartTimer) {
      if (significant) {
        me.abort();
      }
      return;
    }
    if (target && target.nodeType === Node.ELEMENT_NODE) {
      if (significant && !me.started) {
        me.event = me.domEvent = event;
        if (me.start() === false) {
          me.abort();
          return;
        }
      }
      if (me.started && !me.completed) {
        me.lastMoveEvent = me.event = me.domEvent = event;
        if (event.type === "touchmove") {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        me.track();
      }
    }
  }
  start() {
    const me = this, { scrollManager, monitoringConfig, source } = me, { draggingBodyCls: activeCls, dragLock } = source, element = (
      /* source.dragWithin || */
      source.dragRootElement
    );
    me.state = DRAGGING;
    if (me.startEvent.type === "touchstart" && BrowserHelper.isMobileSafari) {
      for (let node = me.startEvent.target.parentElement; node; node = node.parentElement) {
        const { style } = node, overflow = DomHelper.getStyleValue(node, "overflow");
        if (overflow === "auto" || overflow == "scroll") {
          if (!me.scrollingAncestors) {
            me.scrollingAncestors = [];
          }
          me.scrollingAncestors.push([node, style.overflow, style.overflowX, style.overflowY]);
          style.overflow = "hidden";
        }
      }
      me.requestAnimationFrame(() => {
        me.scrollingAncestors.forEach(([{ style }, overflow, overflowX, overflowY]) => {
          style.overflow = overflow;
          style.overflowX = overflowX;
          style.overflowY = overflowY;
        });
        me.scrollingAncestors = null;
      });
    }
    if (scrollManager) {
      const detacher = scrollManager.startMonitoring(Objects.merge({
        scrollables: [{
          element
        }],
        direction: lockDirections[dragLock] || dragLock || "both",
        callback(scrollerAction) {
          const { lastMoveEvent } = me;
          if (lastMoveEvent && me.element) {
            lastMoveEvent.isScroll = true;
            me.event = me.domEvent = lastMoveEvent;
            me.scrollerAction = scrollerAction;
            me.track();
            me.scrollerAction = null;
          }
        }
      }, monitoringConfig));
      me.cleaners.push(detacher);
    }
    const rootEl = source.dragRootElement.closest(".b-outer") || document.body;
    rootEl.classList.add(activeCls);
    me.cleaners.push(() => rootEl.classList.remove(activeCls));
    if (source.startDrag(me) === false) {
      me.cleanup();
      return false;
    }
  }
  syncFlags() {
    const me = this, { event } = me;
    me.altKey = event.altKey;
    me.ctrlKey = event.ctrlKey || event.metaKey;
    me.metaKey = event.metaKey;
    me.shiftKey = event.shiftKey;
  }
  track() {
    const me = this, { event, source, target } = me;
    let targetElement = event.target, touch;
    if (event.type === "touchmove") {
      touch = event.changedTouches[0];
      targetElement = DomHelper.elementFromPoint(touch.clientX, touch.clientY);
    }
    me.targetElement = targetElement;
    if (target === me.target) {
      target == null ? void 0 : target.dragMove(me);
    }
    source.trackDrag(me);
  }
  //endregion
};
__publicField(DragContext, "$name", "DragContext");
DragContext.prototype.STATE = DragContext.STATE = Object.freeze({
  ABORTED,
  INIT,
  DRAGGING,
  DROPPED
});
DragContext._$name = "DragContext";

// ../Core/lib/Core/util/drag/DragProxy.js
var DragProxy = class _DragProxy extends Base.mixin(Factoryable_default) {
  static get type() {
    return "default";
  }
  static get configurable() {
    return {
      /**
       * The currently active `DragContext`. This context will be active prior to be passed to the proxy. This
       * config is set by {@link #function-dragStart} and cleared by {@link #function-dragEnd}.
       * @config {Core.util.drag.DragContext}
       */
      dragging: null
    };
  }
  static get factoryable() {
    return {
      defaultType: _DragProxy
    };
  }
  /**
   * The `Draggable` instance that owns this drag proxy.
   * @member {Core.mixin.Draggable} owner
   * @readonly
   */
  //region Configs
  updateDragging(drag, was) {
    if (was) {
      this.close(was);
    }
    if (drag) {
      this.open(drag);
    }
  }
  //endregion
  //region Operations
  /**
   * This template method is called when {@link #config-dragging} is reset to `null`.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */
  close(drag) {
  }
  /**
   * This template method is called when {@link #config-dragging} is set to a non-`null` value.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */
  open(drag) {
  }
  //endregion
  //region Drag Processing
  /**
   * This template method is called by the `Draggable` instance when the drag officially starts.
   * This sets the {@link #config-dragging} config to `drag`, which triggers the call to {@link #function-open}.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */
  dragStart(drag) {
    this.dragging = drag;
  }
  /**
   * This template method is called by the `Draggable` instance as drag movement occurs.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */
  dragMove(drag) {
  }
  /**
   * This template method is called by the `Draggable` instance when the drag completes.
   *
   * This sets the {@link #config-dragging} config to `null`, which triggers the call to {@link #function-close}.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */
  dragEnd(drag) {
    this.dragging = null;
  }
  //endregion
};
DragProxy.initClass();
DragProxy._$name = "DragProxy";

// ../Core/lib/Core/mixin/Draggable.js
var Draggable_default = (Target) => class Draggable extends (Target || Base) {
  static get $name() {
    return "Draggable";
  }
  //region Configs
  static get configurable() {
    return {
      /**
       * The current `DragContext`. This is created immediately on pointerdown but does not become active until
       * some movement occurs. This {@link #config-dragThreshold threshold} is configurable.
       * @member {Core.util.drag.DragContext}
       * @readonly
       */
      dragging: {
        $config: "nullify",
        value: null
      },
      /**
       * A CSS selector to use to ascend from the {@link #config-dragRootElement} to find the element that will
       * gain the {@link #property-draggingCls} and {@link #property-draggingStartedCls} CSS classes.
       * @config {String}
       */
      draggingClsSelector: null,
      /**
       * The listeners to add to the `document` during a drag.
       * @config {Object}
       * @private
       */
      dragDocumentListeners: {
        element: document,
        keydown: "onDragKeyDown",
        keyup: "onDragKeyUp",
        // On mobile, a long-press will (sometimes) trigger a context menu, so we suppress it:
        contextmenu: "onDragContextMenu",
        // We don't use pointermove/up because they get snared in the "touch-action" vs "pan-x/y" trap and we
        // cannot prevent panning (aka scrolling) in response to move events if we go that way:
        mousemove: "onDragPointerMove",
        mouseup: "onDragPointerUp",
        // Touch desktops don't fire touchend event when touch has ended, instead pointerup is fired. iOS does
        // fire touchend:
        pointerup: "onDragPointerUp",
        touchend: "onDragPointerUp",
        touchmove: {
          handler: "onDragPointerMove",
          passive: false
          // We need to be able to preventDefault on the touchmove
        }
      },
      /**
       * A CSS selector to use to ascend from the drag element to find the element that will gain the
       * {@link #property-draggingItemCls} CSS class. If not supplied, the drag element will gain this CSS
       * class.
       * @config {String}
       */
      dragItemSelector: null,
      /**
       * A CSS class to add to items identified by the {@link #config-dragItemSelector} when the mouse
       * enters.
       * @config {String}
       */
      dragItemOverCls: null,
      /**
       * A function to call when the pointer enters a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseEnter
       * @param {MouseEvent} event Pointer event
       * @param {HTMLElement} element Over element
       * @returns {void}
       */
      /**
       * A function to call when the pointer moves inside a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseMove
       * @param {MouseEvent} event Pointer event
       * @param {HTMLElement} element Over element
       * @returns {void}
       */
      /**
       * A function to call when the pointer leaves a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseLeave
       * @param {MouseEvent} event Pointer event
       * @param {HTMLElement} element Over element
       * @returns {void}
       */
      /**
       * Configure as `'x'` to lock dragging to the `X` axis (the drag will only move horizontally) or `'y'`
       * to lock dragging to the `Y` axis (the drag will only move vertically).
       * @config {'x'|'y'|null}
       */
      dragLock: null,
      /**
       * The minimum distance a drag must move to be considered a drop and not
       * {@link Core.util.drag.DragContext#property-aborted}.
       * @config {Number}
       * @default
       */
      dragMinDistance: 1,
      /**
       * The {@link Core.util.drag.DragProxy drag proxy} is a helper object that can be used to display feedback
       * during a drag.
       * @config {DragProxyConfig|Core.util.drag.DragProxy}
       */
      dragProxy: {
        $config: ["lazy", "nullify"],
        value: null
      },
      /**
       * The outer element where dragging will operate (attach events to it and use as root limit when looking
       * for ancestors).
       * @config {HTMLElement}
       */
      dragRootElement: {
        $config: "nullify",
        value: null
      },
      /**
       * Set to `true` to allow a drag to drop on to the same element from which the drag started.
       * @config {Boolean}
       * @default
       */
      dragSameTargetDrop: false,
      /**
       * A CSS selector used to determine which element(s) can be dragged.
       * @config {String}
       * @default
       */
      dragSelector: null,
      /**
       * A CSS selector used to identify child element(s) that should not trigger drag.
       * @config {String}
       */
      ignoreSelector: null,
      /**
       * The number of milliseconds after a pointerup to ignore click events on the document. This
       * is used to avoid the "up" event itself generating a `click` on the target.
       * @config {Number}
       * @default
       */
      dragSwallowClickTime: 50,
      /**
       * The amount of pixels to move pointer/mouse before it counts as a drag operation.
       * @config {Number}
       * @default
       */
      dragThreshold: 5,
      /**
       * The number of milliseconds that must elapse after a `touchstart` event before it is considered a drag. If
       * movement occurs before this time, the drag is aborted. This is to allow touch swipes and scroll gestures.
       * @config {Number}
       * @default
       */
      dragTouchStartDelay: 300,
      /**
       * The CSS selector to use to identify the closest valid target from the event target.
       * @config {String}
       */
      dropTargetSelector: null,
      /**
       * The {@link #config-dragSelector} item the mouse is currently over.
       * @member {HTMLElement} overItem
       * @readonly
       */
      overItem: null,
      testConfig: {
        dragSwallowClickTime: 50
      }
    };
  }
  static get properties() {
    return {
      /**
       * The CSS class to add to the {@link #config-dragRootElement} (or {@link #config-draggingClsSelector} from
       * there) as soon as the pointerdown event occurs.
       * @member {String}
       * @readonly
       */
      draggingCls: "b-draggable-active",
      /**
       * The CSS class to add to the `body` element as soon as the {@link #config-dragThreshold} is reached and
       * an actual drag is in progress.
       * @member {String}
       * @readonly
       */
      draggingBodyCls: "b-draghelper-active",
      // match DragHelper since we need the same treatment
      /**
       * The CSS class to add to the element being dragged as soon as the pointerdown event occurs.
       * @member {String}
       * @readonly
       */
      draggingItemCls: "b-dragging-item",
      /**
       * The CSS class to add to the {@link #config-dragRootElement} (or {@link #config-draggingClsSelector} from
       * there) as soon as the {@link #config-dragThreshold} is reached and an actual drag is in progress.
       * @member {String}
       * @readonly
       */
      draggingStartedCls: "b-draggable-started",
      /**
       * The CSS class that is added to the {@link #config-dragRootElement}, i.e., `'b-draggable'`.
       * @property {String}
       * @readonly
       */
      draggableCls: "b-draggable"
    };
  }
  //endregion
  //region Drag Processing
  // These template methods are implemented by derived classes as desired. There is only one overlap with Droppable's
  // template methods (dragDrop) so that a class can easily mixin both Draggable and Droppable and always distinguish
  // whether it is acting as the source, the target, or both.
  /**
   * This template method is called when the mousedown of a potential drag operation occurs. This happens before the
   * gesture is known to be a drag, meaning the {@link #config-dragThreshold} has not been reached. This method
   * should initialize the {@link Core.util.drag.DragContext} using the {@link Core.util.drag.DragContext#function-set}
   * method. Alternatively, this method may return `false` to prevent the drag operation.
   *
   * *Important:* Because no drag has occurred at the time this method is called, only minimal processing should be
   * done (such as initializing the {@link Core.util.drag.DragContext}). Anything more should be done in the
   * {@link #function-dragStart} method or in response to the {@link #event-dragStart} event which happen only if
   * the user drags the mouse before releasing the mouse button.
   * @param {Core.util.drag.DragContext} drag
   */
  beforeDrag(drag) {
    const { dragRootElement, dragSelector, ignoreSelector } = this, target = dragSelector && drag.element.closest(dragSelector);
    return !dragSelector || Boolean(
      target && target === dragRootElement || dragRootElement.contains(target) && (!ignoreSelector || !drag.element.matches(ignoreSelector))
    );
  }
  /**
   * This template method is called when the drag operation starts. This occurs when the {@link #config-dragThreshold}
   * has been reached.
   * Your implementation may return `false` to prevent the startup of the drag operation.
   * @param {Core.util.drag.DragContext} drag
   */
  dragStart(drag) {
  }
  /**
   * This template method is called as the drag moves. This occurs on each mouse/pointer/touchmove event.
   * @param {Core.util.drag.DragContext} drag
   */
  dragOver(drag) {
  }
  /**
   * This template method is called when the drag enters a {@link Core.mixin.Droppable target}.
   * @param {Core.util.drag.DragContext} drag
   */
  dragEnterTarget(drag) {
  }
  /**
   * This template method is called when the drag leaves a {@link Core.mixin.Droppable target}.
   * @param {Core.util.drag.DragContext} drag
   * @param {Core.mixin.Droppable} oldTarget The previous value of `drag.target`.
   */
  dragLeaveTarget(drag, oldTarget) {
  }
  /**
   * This template method is called when the drag operation completes. This occurs on the pointerup event.
   *
   * This method is not called if the drag is {@link Core.util.drag.DragContext#property-aborted}.
   * @param {Core.util.drag.DragContext} drag
   */
  dragDrop(drag) {
  }
  /**
   * This template method is called when the drag operation completes. This occurs on the pointerup event or perhaps
   * a keypress event.
   *
   * This method is always called, even if the drag is {@link Core.util.drag.DragContext#property-aborted}.
   * @param {Core.util.drag.DragContext} drag
   */
  dragEnd(drag) {
  }
  //endregion
  //region Drag Management
  // These methods are called by the DragContext and generally manage element updates (adding/removing classes) or
  // event firing. In most cases these methods then call a corresponding Drag Processing template method intended
  // for derived classes to implement.
  get activeDrag() {
    const { dragging: drag } = this;
    return (drag == null ? void 0 : drag.started) && !drag.completed ? drag : null;
  }
  /**
   * Return the `Events` instance from which drag events are fired.
   * @internal
   * @property {Core.mixin.Events}
   */
  get dragEventer() {
    return this.trigger ? this : null;
  }
  get draggingClassElement() {
    const { draggingClsSelector, dragRootElement } = this;
    return draggingClsSelector ? dragRootElement == null ? void 0 : dragRootElement.closest(draggingClsSelector) : dragRootElement;
  }
  beginDrag(drag) {
    const { draggingCls, draggingClassElement } = this;
    if (draggingCls && draggingClassElement) {
      draggingClassElement.classList.add(draggingCls);
      drag.cleaners.push(() => draggingClassElement.classList.remove(draggingCls));
    }
  }
  async endDrag(drag) {
    const me = this, { dragEventer, dragProxy } = me;
    if (drag.valid) {
      await me.dragDrop(drag);
    }
    if (me.isDestroyed) {
      return;
    }
    if (drag.pending) {
      drag.destroy();
    } else {
      me.dragEnd(drag);
      dragProxy == null ? void 0 : dragProxy.dragEnd(drag);
      dragEventer == null ? void 0 : dragEventer.trigger(drag.valid ? "drop" : "dragCancel", { drag, event: drag.event });
      me.finalizeDrag(drag);
    }
  }
  async finalizeDrag(drag) {
    var _a;
    await ((_a = drag.finalize) == null ? void 0 : _a.call(drag));
  }
  moveDrag(drag) {
    if (this.dragOver(drag) !== false) {
      const { dragEventer, dragProxy } = this;
      dragProxy == null ? void 0 : dragProxy.dragMove(drag);
      dragEventer == null ? void 0 : dragEventer.trigger("drag", { drag, event: drag.event });
    }
  }
  setupDragContext(event) {
    const me = this, { dragItemSelector, id } = me, { target } = event;
    return {
      event,
      id: id ? `${id}-drag-${me._nextDragId = (me._nextDragId || 0) + 1}` : null,
      itemElement: dragItemSelector ? target.closest(dragItemSelector) : target,
      touchStartDelay: me.dragTouchStartDelay,
      source: me,
      threshold: me.dragThreshold
    };
  }
  startDrag(drag) {
    const { draggingStartedCls, draggingClassElement, draggingItemCls, dragEventer, dragProxy } = this, { itemElement } = drag;
    if ((dragEventer == null ? void 0 : dragEventer.trigger("beforeDragStart", { drag, event: drag.event })) === false) {
      return false;
    }
    if (draggingStartedCls && draggingClassElement) {
      draggingClassElement.classList.add(draggingStartedCls);
      drag.cleaners.push(() => draggingClassElement.classList.remove(draggingStartedCls));
    }
    if (draggingItemCls && itemElement) {
      itemElement.classList.add(draggingItemCls);
      drag.cleaners.push(() => itemElement.classList.remove(draggingItemCls));
    }
    dragProxy == null ? void 0 : dragProxy.dragStart(drag);
    const result = this.dragStart(drag);
    if (result !== false) {
      dragEventer == null ? void 0 : dragEventer.trigger("dragStart", { drag, event: drag.event });
    }
    return result;
  }
  trackDrag(drag) {
    var _a;
    const { dropTargetSelector } = this;
    drag.valid = !(dropTargetSelector && !((_a = drag.targetElement) == null ? void 0 : _a.closest(dropTargetSelector)));
    this.moveDrag(drag);
  }
  //endregion
  //region Configs
  configureListeners(drag) {
    const me = this, listeners = ObjectHelper.assign({
      thisObj: me
    }, me.dragDocumentListeners);
    if ("touches" in drag.startEvent) {
      delete listeners.mousemove;
      delete listeners.mouseup;
    } else {
      delete listeners.contextmenu;
      delete listeners.touchmove;
      delete listeners.touchend;
      delete listeners.pointerup;
    }
    return listeners;
  }
  //endregion
  //region Configs
  updateDragging(drag, old) {
    const me = this;
    if (drag) {
      const listeners = me.configureListeners(drag);
      drag.cleaners.push(EventHelper.on(listeners));
      me.beginDrag(drag);
    } else if (old) {
      old.destroy();
    }
  }
  changeDragProxy(config, existing) {
    return DragProxy.reconfigure(existing, config, {
      owner: this,
      defaults: {
        owner: this
      }
    });
  }
  updateDragRootElement(rootEl, was) {
    var _a;
    const me = this, {
      draggableCls,
      dragItemSelector,
      onDragItemMouseMove
    } = me;
    was == null ? void 0 : was.classList.remove(draggableCls);
    (_a = me._dragRootDetacher) == null ? void 0 : _a.call(me);
    if (rootEl) {
      const listeners = {
        thisObj: me,
        element: rootEl,
        mousedown: "onDragMouseDown",
        // We have touchstart listener in place since Siesta/Chrome can send these events even on non-touch
        // devices:
        touchstart: "onDragTouchStart",
        // On iOS, because we use pointerup to represent the drop gesture,
        // the initiating pointerdown event is captured, and its target is
        // the original start target. We must always release pointer capture.
        // https://github.com/bryntum/support/issues/4111
        pointerdown: (e) => {
          var _a2, _b;
          return e.pointerId && ((_b = (_a2 = e.target).releasePointerCapture) == null ? void 0 : _b.call(_a2, e.pointerId));
        }
      };
      if (onDragItemMouseMove) {
        listeners.mousemove = {
          delegate: dragItemSelector,
          handler: "onDragItemMouseMove"
        };
      }
      if (me.dragItemOverCls || onDragItemMouseMove || me.onDragItemMouseEnter || me.onDragItemMouseLeave) {
        Object.assign(listeners, {
          mouseover: {
            delegate: dragItemSelector,
            handler: "onDragItemMouseOver"
          },
          mouseout: {
            delegate: dragItemSelector,
            handler: "onDragItemMouseOut"
          }
        });
      }
      rootEl.classList.add(draggableCls);
      me._dragRootDetacher = EventHelper.on(listeners);
    }
  }
  //endregion
  //region Events
  onDragItemMouseOver(event) {
    this.overItem = event;
  }
  onDragItemMouseOut(event) {
    if (!this.dragging) {
      this.overItem = event;
    }
  }
  changeOverItem(event) {
    var _a;
    this.enterLeaveEvent = event;
    if (event.type === "mouseout") {
      return ((_a = event.relatedTarget) == null ? void 0 : _a.closest(this.dragItemSelector)) || null;
    } else {
      return event.target.closest(this.dragItemSelector);
    }
  }
  updateOverItem(overItem, oldOverItem) {
    var _a, _b;
    const me = this, { dragItemOverCls } = me;
    if (oldOverItem) {
      dragItemOverCls && oldOverItem.classList.remove(dragItemOverCls);
      (_a = me.onDragItemMouseLeave) == null ? void 0 : _a.call(me, me.enterLeaveEvent, oldOverItem);
    }
    if (overItem) {
      dragItemOverCls && overItem.classList.add(dragItemOverCls);
      (_b = me.onDragItemMouseEnter) == null ? void 0 : _b.call(me, me.enterLeaveEvent, overItem);
    }
  }
  onDragContextMenu(event) {
    event.preventDefault();
  }
  onDragKeyDown(event) {
    this.dragging.keyDown(event);
  }
  onDragKeyUp(event) {
    this.dragging.keyUp(event);
  }
  /**
   * Grab draggable element on mouse down.
   * @param {Event} event
   * @private
   */
  onDragMouseDown(event) {
    if (event.button === 0) {
      this.onDragPointerDown(event);
    }
  }
  /**
   * Grab draggable element on pointerdown.
   * @param {Event} event
   * @private
   */
  onDragPointerDown(event) {
    let { dragging: drag } = this;
    if (!drag) {
      drag = this.setupDragContext(event);
      if (drag) {
        drag = new DragContext(drag);
        if (drag.begin() === false) {
          drag.destroy();
        }
      }
    } else if (!drag.isFinalizing) {
      drag.abort();
    }
  }
  // Set by the DragContext in its begin method, and auto-nullified at destruction.
  changeDragging(value, was) {
    was == null ? void 0 : was.destroy();
    return value;
  }
  onDragPointerMove(event) {
    const { dragging: drag } = this;
    if (drag && !drag.completed) {
      drag == null ? void 0 : drag.move(event);
    }
  }
  onDragPointerUp(event) {
    const { dragging: drag } = this;
    if (drag && !drag.completed) {
      drag.end(event);
      this.endDrag(drag);
    }
  }
  /**
   * @param {Event} event
   * @private
   */
  onDragTouchStart(event) {
    if (event.touches.length === 1) {
      this.onDragPointerDown(event);
    }
  }
  //endregion
};

// ../Core/lib/Core/mixin/Droppable.js
var Droppable_default = (Target) => class Droppable extends (Target || Base) {
  static get $name() {
    return "Droppable";
  }
  //region Configs
  static get configurable() {
    return {
      /**
       * A selector, which, if specified, narrows the dropability to child elements of the
       * {@link #config-dropRootElement} which match this selector.
       * @config {String}
       */
      droppableSelector: null,
      /**
       * The current `DragContext`. This is set when a drag enters this target. Changing this config causes the
       * {@link #function-dragEnter} and {@link #function-dragLeave} methods to be called. If `dragEnter` returns
       * `false` for a drag, this value will be set to `null`.
       * @member {Core.util.drag.DragContext}
       * @readonly
       */
      dropping: null,
      /**
       * Set this config to the element where drops should be received. When set, the `b-droppable` CSS class is
       * added to the element and the `Droppable` instance is associated with that element so that it can be
       * found by {@link Core.mixin.Draggable draggables}.
       * @config {HTMLElement}
       */
      dropRootElement: {
        $config: "nullify",
        value: null
      }
    };
  }
  /**
   * Return the `Events` instance from which drop events are fired.
   * @internal
   * @property {Core.mixin.Events}
   */
  get dropEventer() {
    return this.trigger ? this : null;
  }
  /**
   * Returns the CSS class that is added to the {@link #config-dropRootElement}, i.e., `'b-droppable'`.
   * @property {String}
   * @readonly
   */
  get droppableCls() {
    return "b-droppable";
  }
  //endregion
  //region Drop Management
  /**
   * This method is called when a drag enters this droppable's `dropRootElement`. In many cases, this method is used
   * to create some sort of drop indicator to provide user feedback.
   *
   * If this method does not return `false`, the {@link #property-dropping} config will retain the given `drag` context
   * which was set prior to this method being called.
   *
   * If this method returns `false`, the drop will not be accepted. Neither {@link #function-dragDrop} nor
   * {@link #function-dragLeave} will be called for this drop. If the drag leaves this target and re-enters, this
   * method will be called again. While `dropping` will already be updated before this method is called, it will be
   * reset to `null` in this case.
   *
   * The base class implementation of this method fires the {@link #event-dragEnter} event.
   * @param {Core.util.drag.DragContext} drag
   * @returns {Boolean}
   */
  dragEnter(drag) {
    var _a;
    return (_a = this.dropEventer) == null ? void 0 : _a.trigger("dragEnter", { drag, event: drag.event });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} moves to a new
   * position. This is typically where drop indicators are updated to reflect the new position.
   *
   * The base class implementation of this method fires the {@link #event-dragMove} event.
   * @param {Core.util.drag.DragContext} drag
   */
  dragMove(drag) {
    var _a;
    return (_a = this.dropEventer) == null ? void 0 : _a.trigger("dragMove", { drag, event: drag.event });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} has ended with
   * a drop. In addition to any cleanup (since {@link #function-dragLeave} will not be called), this method handles
   * any updates associated with the data from the drag context and the position of the drop.
   *
   * The base class implementation of this method fires the {@link #event-drop} event.
   * @param {Core.util.drag.DragContext} drag
   */
  dragDrop(drag) {
    var _a;
    return (_a = this.dropEventer) == null ? void 0 : _a.trigger("drop", { drag, event: drag.event });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} leaves this
   * droppable's `dropRootElement`, or the drag is {@link Core.util.drag.DragContext#property-aborted} by the user
   * pressing the `ESC` key, or the {@link Core.util.drag.DragContext#function-abort} method is called.
   *
   * This is the time to cleanup anything created by `dragEnter`.
   *
   * The base class implementation of this method fires the {@link #event-dragLeave} event.
   * @param {Core.util.drag.DragContext} drag
   */
  dragLeave(drag) {
    var _a;
    return (_a = this.dropEventer) == null ? void 0 : _a.trigger("dragLeave", { drag, event: drag.event });
  }
  //endregion
  //region Configs
  changeDropping(dropping, was) {
    if (dropping !== was) {
      const me = this;
      if (was) {
        if (was.aborted || !was.completed) {
          me.dragLeave(was);
        }
      }
      if (dropping) {
        me._dropping = dropping;
        if (me.dragEnter(dropping) === false) {
          dropping = null;
        }
        me._dropping = was;
      }
    }
    return dropping;
  }
  updateDropRootElement(rootEl, was) {
    const me = this, { droppableCls } = me;
    let droppables, i, removeCls;
    if (was) {
      droppables = DomDataStore.get(was, "droppables");
      removeCls = true;
      if (Array.isArray(droppables) && (i = droppables.indexOf(me)) > -1) {
        if (droppables.length < 2) {
          DomDataStore.remove(was, "droppables");
        } else {
          droppables.splice(i, 1);
          droppables.forEach((d) => {
            if (droppableCls === d.droppableCls) {
              removeCls = false;
            }
          });
        }
      }
      removeCls && was.classList.remove(droppableCls);
    }
    if (rootEl) {
      droppables = DomDataStore.get(rootEl, "droppables");
      if (droppables) {
        droppables.push(me);
      } else {
        DomDataStore.set(rootEl, "droppables", [me]);
      }
      rootEl.classList.add(droppableCls);
    }
  }
  //endregion
};

// ../Core/lib/Core/widget/ColorField.js
var ColorField = class extends Combo {
  configure(config) {
    var _a;
    const pickerCfg = (_a = config.picker) != null ? _a : {};
    if (config.colors) {
      pickerCfg.colors = config.colors;
    }
    if ("addNoColorItem" in config) {
      pickerCfg.addNoColorItem = config.addNoColorItem;
    }
    config.picker = pickerCfg;
    super.configure(config);
  }
  updatePicker(picker) {
    if (picker) {
      this.items = picker.store.records;
    }
  }
  updateColors(colors) {
    if (!this.isConfiguring) {
      this.picker.colors = colors;
    }
  }
  updateAddNoColorItem(addNoColorItem) {
    if (!this.isConfiguring) {
      this.picker.addNoColorItem = addNoColorItem;
    }
  }
  set value(value) {
    if (!this.store) {
      this.items = [];
      this.store = this.picker.store;
    }
    if (!value) {
      value = this.store.findRecord("color", null);
    }
    super.value = value;
  }
  showPicker() {
    this.picker.refresh();
    super.showPicker(...arguments);
  }
  get value() {
    return super.value;
  }
  syncInputFieldValue(...args) {
    var _a;
    const me = this, { value } = me;
    let className = (_a = me.picker) == null ? void 0 : _a.getColorClassName(value);
    if (!className) {
      me.colorBox.style.color = value;
    }
    className = "b-colorbox " + className;
    me.colorBox.className = className;
    if (!me.showBoxForNoColor) {
      me.element.classList.toggle("b-colorless", !value);
    }
    super.syncInputFieldValue(...args);
  }
  get innerElements() {
    return [
      {
        reference: "colorBox",
        className: "b-colorbox"
      },
      ...super.innerElements
    ];
  }
};
__publicField(ColorField, "$name", "ColorField");
__publicField(ColorField, "type", "colorfield");
__publicField(ColorField, "configurable", {
  /*
   * @hideconfigs text,color,editable,picker
   */
  displayField: "text",
  valueField: "color",
  editable: false,
  picker: {
    type: "colorpicker",
    align: {
      align: "t100-b100",
      matchSize: false
    }
  },
  showBoxForNoColor: true,
  /**
   * Array of CSS color strings to be able to chose from. This will override the
   * {@link Core.widget.ColorPicker#config-colors pickers default colors}.
   *
   * Provide an array of string CSS colors:
   * ```javascript
   * new ColorField({
   *     colors : ['#00FFFF', '#F0FFFF', '#89CFF0', '#0000FF', '#7393B3']
   * });
   * ```
   *
   * @prp {String[]}
   */
  colors: null,
  /**
   * Adds an option in the picker to set no background color
   * @prp {Boolean}
   */
  addNoColorItem: true
});
ColorField.initClass();
ColorField._$name = "ColorField";

// ../Core/lib/Core/widget/SlideToggle.js
var SlideToggle = class extends Checkbox {
  static get properties() {
    return {
      toggledCls: "b-slidetoggle-checked"
    };
  }
  construct(config) {
    if (config.checked) {
      config.cls = DomClassList.from(config.cls) || {};
      config.cls[this.constructor.properties.toggledCls] = 1;
    }
    super.construct(config);
  }
  get innerElements() {
    const innerEls = super.innerElements;
    innerEls.splice(1, 0, this.toggleElement);
    if (this.text) {
      innerEls[innerEls.length - 1].class = "b-slidetoggle-label";
    } else {
      innerEls.pop();
    }
    return innerEls;
  }
  get toggleElement() {
    return {
      class: "b-slidetoggle-toggle",
      reference: "slideToggle",
      children: [
        {
          class: "b-slidetoggle-thumb",
          reference: "slideThumb"
        }
      ]
    };
  }
  internalOnChange() {
    super.internalOnChange();
    this.element.classList[this.value ? "add" : "remove"](this.toggledCls);
  }
};
__publicField(SlideToggle, "$name", "SlideToggle");
__publicField(SlideToggle, "type", "slidetoggle");
SlideToggle.initClass();
SlideToggle._$name = "SlideToggle";

// ../Core/lib/Core/widget/util/AvatarRendering.js
var _AvatarRendering = class _AvatarRendering extends Base {
  static get configurable() {
    return {
      /**
       * Element used to listen for load errors. Normally the owning widgets own element.
       * @config {HTMLElement}
       */
      element: null,
      /**
       * Prefix prepended to a supplied color to create a CSS class applied when showing initials.
       * @config {String}
       * @default
       */
      colorPrefix: "b-sch-",
      /**
       * A tooltip config object to enable using a custom tooltip for the avatars. Listen for `beforeShow` and set
       * your html there.
       * @config {TooltipConfig}
       */
      tooltip: null,
      size: null
    };
  }
  doDestroy() {
    var _a;
    (_a = this.tooltip) == null ? void 0 : _a.destroy();
    super.doDestroy();
  }
  updateElement(element) {
    EventHelper.on({
      element,
      delegate: ".b-resource-image",
      error: "onImageErrorEvent",
      thisObj: this,
      capture: true
    });
  }
  changeTooltip(config) {
    return Tooltip.new({
      forElement: this.element,
      forSelector: ".b-resource-avatar",
      cls: "b-resource-avatar-tooltip"
    }, config);
  }
  static get failedUrls() {
    if (!this._failedUrls) {
      this._failedUrls = /* @__PURE__ */ new Set();
    }
    return this._failedUrls;
  }
  /**
   * Returns a DOM config object containing a resource avatar, icon or resource initials. Display priority in that
   * order.
   * @param {AvatarConfig|AvatarConfig[]} options A single avatar config object or an array of the same.
   * @returns {DomConfig}
   */
  getResourceAvatar(options) {
    if (Array.isArray(options)) {
      return options.map((item) => this.getResourceAvatar(item));
    }
    const { initials, color, iconCls, imageUrl, defaultImageUrl, dataset = {}, resourceRecord, alt = StringHelper.encodeHtml(resourceRecord == null ? void 0 : resourceRecord.name) } = options, config = this.getImageConfig(initials, color, imageUrl, defaultImageUrl, dataset, alt) || this.getIconConfig(iconCls, dataset) || this.getResourceInitialsConfig(initials, color, dataset), { size } = this;
    Object.assign(config.style, {
      ...size ? { height: size, width: size } : void 0
    });
    return config;
  }
  getImageConfig(initials, color, imageUrl, defaultImageUrl, dataset, alt) {
    imageUrl = _AvatarRendering.failedUrls.has(imageUrl) ? defaultImageUrl : imageUrl || defaultImageUrl;
    if (imageUrl) {
      return {
        tag: "img",
        draggable: "false",
        loading: "lazy",
        class: {
          "b-resource-avatar": 1,
          "b-resource-image": 1
        },
        style: {},
        alt,
        elementData: {
          defaultImageUrl,
          imageUrl,
          initials,
          color,
          dataset
        },
        src: imageUrl,
        dataset
      };
    }
  }
  getIconConfig(iconCls, dataset) {
    if (iconCls) {
      return iconCls && {
        tag: "i",
        style: {},
        class: {
          "b-resource-avatar": 1,
          "b-resource-icon": 1,
          [iconCls]: 1
        },
        dataset
      };
    }
  }
  getResourceInitialsConfig(initials, color, dataset) {
    const namedColor = DomHelper.isNamedColor(color) && color, hexColor = !namedColor && color, { size } = this;
    return {
      tag: "div",
      class: {
        "b-resource-avatar": 1,
        "b-resource-initials": 1,
        [`${this.colorPrefix}${namedColor}`]: namedColor
      },
      style: {
        backgroundColor: hexColor || null,
        ...size ? { height: size, width: size } : void 0
      },
      children: [initials],
      dataset
    };
  }
  onImageErrorEvent({ target }) {
    if (!target.matches(".b-resource-avatar")) {
      return;
    }
    const { defaultImageUrl, initials, color, imageUrl, dataset } = target.elementData;
    if (defaultImageUrl && !target.src.endsWith(defaultImageUrl.replace(/^[./]*/gm, ""))) {
      target.src = defaultImageUrl;
    } else {
      const initialsEl = DomHelper.createElement(this.getResourceInitialsConfig(initials, color, dataset));
      initialsEl.elementData = target.elementData;
      target.parentElement.replaceChild(initialsEl, target);
    }
    _AvatarRendering.failedUrls.add(imageUrl);
  }
};
__publicField(_AvatarRendering, "$name", "AvatarRendering");
var AvatarRendering = _AvatarRendering;
AvatarRendering._$name = "AvatarRendering";

export {
  StateBase,
  Transaction,
  ActionBase,
  UpdateAction,
  InsertChildAction,
  RemoveChildAction,
  AddAction,
  InsertAction,
  RemoveAction,
  RemoveAllAction,
  StateTrackingManager,
  Finalizable_default,
  DragContext,
  DragProxy,
  Draggable_default,
  Droppable_default,
  ColorField,
  SlideToggle,
  AvatarRendering
};
//# sourceMappingURL=chunk-4LHHPUQ6.js.map
