/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Base as y,BrowserHelper as Ne,Checkbox as Ue,Combo as Fe,Delayable_default as Z,DomClassList as $e,DomDataStore as I,DomHelper as x,EventHelper as _,Events_default as ze,Factoryable_default as Ke,IdHelper as je,Identifiable_default as Be,ObjectHelper as Qe,Objects as Xe,StringHelper as He,Tooltip as qe,__publicField as P}from"./chunk-MZVS5JQA.js";var h=()=>{throw new Error("Abstract method call!")},u=()=>{throw new Error("Method cannot be called at this state!")},A=class extends y{canUndo(e){h()}canRedo(e){h()}onUndo(e){h()}onRedo(e){h()}onStartTransaction(e){h()}onStopTransaction(e){h()}onStopTransactionDelayed(e){h()}onRejectTransaction(e){h()}onEnable(e){h()}onDisable(e){h()}onAutoRecordOn(e){h()}onAutoRecordOff(e){h()}onResetQueue(e){h()}onModelUpdate(e){h()}onStoreModelAdd(e){h()}onStoreModelInsert(e){h()}onStoreModelRemove(e){h()}onStoreModelRemoveAll(e){h()}onModelInsertChild(e){h()}onModelRemoveChild(e){h()}};A._$name="StateBase";var M=Symbol("ACTION_QUEUE_PROP"),N=class extends y{get defaultConfig(){return{title:null}}construct(...e){this[M]=[],super.construct(...e)}get queue(){return this[M].slice(0)}get length(){return this[M].length}addAction(e){this[M].push(e)}undo(){const e=this[M];for(let r=e.length-1;r>=0;--r)e[r].undo()}redo(){const e=this[M];for(let r=0,t=e.length;r<t;++r)e[r].redo()}};N._$name="Transaction";var ee=()=>{throw new Error("Abstract method call!")},D=class extends y{get type(){return this.constructor.name}undo(){ee()}redo(){ee()}};D._$name="ActionBase";var te=Symbol("MODEL_PROP"),re=Symbol("NEW_DATA_PROP"),oe=Symbol("OLD_DATA_PROP"),K=class extends D{static get defaultConfig(){return{model:void 0,newData:void 0,oldData:void 0,isInitialUserAction:!1}}get type(){return"UpdateAction"}get model(){return this[te]}set model(e){this[te]=e}get newData(){return this[re]}set newData(e){this[re]={...e}}get oldData(){return this[oe]}set oldData(e){this[oe]={...e}}undo(){const{model:e,oldData:r}=this;e.$&&Object.assign(e,r),e.set(r,null,null,null,!!e.$)}redo(){const{model:e,newData:r}=this;e.$&&Object.assign(e,r),e.set(r,null,null,null,!!e.$)}};K._$name="UpdateAction";var ne=Symbol("PARENT_MODEL_PROP"),ae=Symbol("CHILD_MODELS_PROP"),se=Symbol("INSERT_INDEX_PROP"),ie=Symbol("CONTEXT_PROP"),j=class extends D{static get defaultConfig(){return{parentModel:void 0,childModels:void 0,insertIndex:void 0,context:void 0}}get type(){return"InsertChildAction"}get parentModel(){return this[ne]}set parentModel(e){this[ne]=e}get childModels(){return this[ae]}set childModels(e){this[ae]=e.slice(0)}get insertIndex(){return this[se]}set insertIndex(e){this[se]=e}get context(){return this[ie]}set context(e){this[ie]=e}undo(){const{parentModel:e,context:r,childModels:t}=this,o=new Map,n=new Set;for(const a of t){const s=r.get(a);if(!s)n.add(a);else{let i=o.get(s.parent);i||(i={moveRight:[],moveLeft:[],moveFromAnotherParent:[]},o.set(s.parent,i)),s.parent===e?s.index>a.parentIndex?i.moveRight.push({parent:s.parent,model:a,index:s.index+1}):i.moveLeft.push({parent:s.parent,model:a,index:s.index}):i.moveFromAnotherParent.push({parent:s.parent,model:a,index:s.index})}}for(const a of o.values()){const{moveRight:s,moveLeft:i}=a;i.sort((d,l)=>d.index-l.index),s.sort((d,l)=>l.index-d.index)}n.forEach(a=>a.parent.removeChild(a));for(const a of o.values()){const{moveRight:s,moveLeft:i,moveFromAnotherParent:d}=a;i.forEach(l=>{l.parent.insertChild(l.model,l.index)}),s.forEach(l=>{l.parent.insertChild(l.model,l.index)}),d.forEach(l=>{l.parent.insertChild(l.model,l.index)})}}redo(){var e,r;const{parentModel:t,insertIndex:o,childModels:n}=this,a=(e=t.children)==null?void 0:e[o];t.insertChild(n,a,!1,{orderedBeforeNode:(r=a==null?void 0:a.previousSibling)==null?void 0:r.nextOrderedSibling})}};j._$name="InsertChildAction";var le=Symbol("PARENT_MODEL_PROP"),de=Symbol("CHILD_MODELS_PROP"),ce=Symbol("CONTEXT_PROP"),B=class extends D{static get defaultConfig(){return{parentModel:void 0,childModels:void 0,context:void 0}}get type(){return"RemoveChildAction"}get parentModel(){return this[le]}set parentModel(e){this[le]=e}get childModels(){return this[de]}set childModels(e){this[de]=e.slice(0)}get context(){return this[ce]}set context(e){this[ce]=e}undo(){const{parentModel:e,context:r,childModels:t}=this;t.sort((o,n)=>{const a=r.get(o),s=r.get(n);return a-s}),t.forEach(o=>{const n=r.get(o);e.insertChild(o,n.parentIndex,void 0,{orderedParentIndex:n.orderedParentIndex})})}redo(){this.parentModel.removeChild(this.childModels)}};B._$name="RemoveChildAction";var ue=Symbol("STORE_PROP"),ge=Symbol("MODEL_LIST_PROP"),Q=class extends D{static get defaultConfig(){return{store:void 0,modelList:void 0,silent:!1}}get type(){return"AddAction"}get store(){return this[ue]}set store(e){this[ue]=e}get modelList(){return this[ge]}set modelList(e){this[ge]=e.slice(0)}undo(){this.store.remove(this.modelList,this.silent)}redo(){this.store.add(this.modelList,this.silent)}};Q._$name="AddAction";var he=Symbol("STORE_PROP"),fe=Symbol("MODEL_LIST_PROP"),ve=Symbol("INSERT_INDEX_PROP"),me=Symbol("CONTEXT_PROP"),X=class extends D{static get defaultConfig(){return{store:void 0,modelList:void 0,insertIndex:void 0,context:void 0,silent:!1}}get type(){return"InsertAction"}get store(){return this[he]}set store(e){this[he]=e}get modelList(){return this[fe]}set modelList(e){this[fe]=e.slice(0)}get insertIndex(){return this[ve]}set insertIndex(e){this[ve]=e}get context(){return this[me]}set context(e){this[me]=e}undo(){const{store:e,modelList:r,context:t,silent:o}=this;r.sort((n,a)=>{const s=t.get(n),i=t.get(a);return s!==void 0&&i!==void 0?s-i:0}),r.forEach(n=>{const a=t.get(n);n._undoingInsertion=!0,a!==void 0?e.insert(a,n,o):e.remove(n,o),n._undoingInsertion=!1})}redo(){const e=this;e.store.insert(e.insertIndex,e.modelList,e.silent)}};X._$name="InsertAction";var pe=Symbol("STORE_PROP"),Se=Symbol("MODEL_LIST_PROP"),Re=Symbol("CONTEXT_PROP"),H=class extends D{static get defaultConfig(){return{store:void 0,modelList:void 0,context:void 0,silent:!1}}get type(){return"RemoveAction"}get store(){return this[pe]}set store(e){this[pe]=e}get modelList(){return this[Se]}set modelList(e){this[Se]=e.slice(0)}get context(){return this[Re]}set context(e){this[Re]=e}undo(){const{store:e,context:r,modelList:t,silent:o}=this;t.sort((n,a)=>{const s=r.get(n),i=r.get(a);return s-i}),t.forEach(n=>{const a=r.get(n);e.insert(a,n,o)})}redo(){this.store.remove(this.modelList,this.silent)}};H._$name="RemoveAction";var ye=Symbol("STORE_PROP"),be=Symbol("ALL_RECORDS_PROP"),q=class extends D{static get defaultConfig(){return{store:void 0,allRecords:void 0,silent:!1}}get type(){return"RemoveAllAction"}get store(){return this[ye]}set store(e){this[ye]=e}get allRecords(){return this[be]}set allRecords(e){this[be]=e.slice(0)}undo(){const{store:e,allRecords:r,silent:t}=this;e.add(r,t)}redo(){this.store.removeAll(this.silent)}};q._$name="RemoveAllAction";var c=Symbol("STATE_PROP"),E=Symbol("STORES_PROP"),m=Symbol("QUEUE_PROP"),S=Symbol("POS_PROP"),g=Symbol("TRANSACTION_PROP"),p=Symbol("TRANSACTION_TIMER_PROP"),R=Symbol("AUTO_RECORD_PROP"),L=Symbol("IS_APPLYING_STASH"),vt=Object.freeze([c,E,m,S,g,p,R,L]),De=new Map,Ye=(e,r)=>{De.set(e,r)},Ge=e=>(typeof e=="string"&&(e=De.get(e)),e),b={registerStmState:Ye,resolveStmState:Ge},U=(e,r)=>{const{undo:t,redo:o}=r;let n;return t&&!o?n={[m]:e[m].slice(e.position),[S]:0}:o&&!t?n={[m]:e[m].slice(0,e.position)}:n={[m]:[],[S]:0},[n,()=>{e.notifyStoresAboutQueueReset(r)}]},We=class extends A{canUndo(){return!1}canRedo(){return!1}onUndo(){u()}onRedo(){u()}onEnable(e){return e.autoRecord?"autoreadystate":"readystate"}onDisable(){u()}onAutoRecordOn(){return{[R]:!0}}onAutoRecordOff(){return{[R]:!1}}onStartTransaction(){u()}onStopTransaction(){u()}onStopTransactionDelayed(){u()}onRejectTransaction(){u()}onResetQueue(e,r){return U(e,r)}onModelUpdate(){}onModelInsertChild(){}onModelRemoveChild(){}onStoreModelAdd(){}onStoreModelInsert(){}onStoreModelRemove(){}onStoreRemoveAll(){}},Te=new We,Ve=Te;b.registerStmState("disabledstate",Te);var Ae=class extends A{canUndo(e){return 0<e.position&&e.position<=e.length}canRedo(e){return 0<=e.position&&e.position<e.length}onUndo(e,r){let t=e.position;const o=e[m],n=Math.max(0,t-r),a=()=>{e.notifyStoresAboutStateRestoringStart();const s=[];for(;t!==n;){const i=o[--t];i.undo(),s.push(i)}return[e.autoRecord?"autoreadystate":"readystate",()=>{e.notifyStoresAboutStateRestoringStop({cause:"undo",transactions:s})}]};return[{[c]:"restoringstate",[S]:n},a]}onRedo(e,r){let t=e.position;const o=e[m],n=Math.min(o.length,t+r),a=()=>{e.notifyStoresAboutStateRestoringStart();const s=[];do{const i=o[t++];i.redo(),s.push(i)}while(t!==n);return[e.autoRecord?"autoreadystate":"readystate",()=>{e.notifyStoresAboutStateRestoringStop({cause:"redo",transactions:s})}]};return[{[c]:"restoringstate",[S]:n},a]}onEnable(){u()}onDisable(){return"disabledstate"}onAutoRecordOn(){return{[c]:"autoreadystate",[R]:!0}}onAutoRecordOff(){u()}onStartTransaction(e,r){const t=new N({title:r});return[{[c]:"recordingstate",[g]:t},()=>{e.notifyStoresAboutStateRecordingStart(t)}]}onStopTransaction(){u()}onStopTransactionDelayed(){u()}onRejectTransaction(){u()}onResetQueue(e,r){return U(e,r)}onModelUpdate(){}onModelInsertChild(){}onModelRemoveChild(){}onStoreModelAdd(){}onStoreModelInsert(){}onStoreModelRemove(){}onStoreRemoveAll(){}},Ee=new Ae,F=Ee;b.registerStmState("readystate",Ee);var Pe=class extends A{canUndo(){return!1}canRedo(){return!1}onEnable(){}onDisable(e){const r=e[g];return e.notifyStoresAboutStateRecordingStop(r,{disabled:!0}),{[c]:"disabledstate",[g]:null}}onAutoRecordOn(e){return[{[c]:"autorecordingstate",[R]:!0},()=>{e.stopTransactionDelayed()}]}onAutoRecordOff(){u()}onStartTransaction(){u()}onStopTransaction(e,r){const t=e[g],o=e[m];let n=e[S];return t.length&&(!t.title&&!r&&e.getTransactionTitle?t.title=e.getTransactionTitle(t):r&&(t.title=r),o[n]=t,o.length=++n),[{[c]:"readystate",[S]:n,[g]:null},()=>{e.notifyStoresAboutStateRecordingStop(t,{stop:!0})}]}onRejectTransaction(e){const r=e[g];return[{[c]:"restoringstate",[g]:null},()=>(r.length&&r.undo(),["readystate",()=>{e.notifyStoresAboutStateRecordingStop(r,{rejected:!0})}])]}onStopTransactionDelayed(){u()}onResetQueue(e,r){return U(e,r)}onModelUpdate(e,r,t,o,n){e[g].addAction(e.makeModelUpdateAction(r,t,o,n))}onModelInsertChild(e,r,t,o,n,a){e[g].addAction(e.makeModelInsertChildAction(r,t,o,n,a))}onModelRemoveChild(e,r,t,o){e[g].addAction(e.makeModelRemoveChildAction(r,t,o))}onStoreModelAdd(e,r,t,o){e[g].addAction(e.makeStoreModelAddAction(r,t,o))}onStoreModelInsert(e,r,t,o,n,a){e[g].addAction(e.makeStoreModelInsertAction(r,t,o,n,a))}onStoreModelRemove(e,r,t,o,n){e[g].addAction(e.makeStoreModelRemoveAction(r,t,o,n))}onStoreRemoveAll(e,r,t,o){e[g].addAction(e.makeStoreRemoveAllAction(r,t,o))}},_e=new Pe,Je=_e;b.registerStmState("recordingstate",_e);var Ze=class extends A{static get $name(){return"RestoringStateClass"}canUndo(){return!1}canRedo(){return!1}onUndo(){u()}onRedo(){u()}onEnable(){u()}onDisable(){u()}onAutoRecordOn(){return{[R]:!0}}onAutoRecordOff(){return{[R]:!1}}onStartTransaction(){u()}onStopTransaction(){u()}onStopTransactionDelayed(){u()}onRejectTransaction(){u()}onQueueReset(){u()}onModelUpdate(){}onModelInsertChild(){}onModelRemoveChild(){}onStoreModelAdd(){}onStoreModelInsert(){}onStoreModelRemove(){}onStoreRemoveAll(){}},Me=new Ze,et=Me;b.registerStmState("restoringstate",Me);var tt=class extends Ae{onAutoRecordOn(){u()}onAutoRecordOff(){return{[c]:"readystate",[R]:!1}}onStartTransaction(e,r){const t=new N({title:r});return[{[c]:"autorecordingstate",[g]:t},()=>{e.notifyStoresAboutStateRecordingStart(t),e.stopTransactionDelayed()}]}onModelUpdate(e,r,t,o){e.startTransaction(),e.onModelUpdate(r,t,o)}onModelInsertChild(e,r,t,o,n){e.startTransaction(),e.onModelInsertChild(r,t,o,n)}onModelRemoveChild(e,r,t,o){e.startTransaction(),e.onModelRemoveChild(r,t,o)}onStoreModelAdd(e,r,t,o){e.startTransaction(),e.onStoreModelAdd(r,t,o)}onStoreModelInsert(e,r,t,o,n,a){e.startTransaction(),e.onStoreModelInsert(r,t,o,n,a)}onStoreModelRemove(e,r,t,o,n){e.startTransaction(),e.onStoreModelRemove(r,t,o,n)}onStoreRemoveAll(e,r,t,o){e.startTransaction(),e.onStoreRemoveAll(r,t,o)}},Ce=new tt,Y=Ce;b.registerStmState("autoreadystate",Ce);var rt=class extends Pe.mixin(Z){onDisable(e){const r=e[g],t=e[p];return t&&this.clearTimeout(t),e.notifyStoresAboutStateRecordingStop(r,{disabled:!0}),{[c]:"disabledstate",[g]:null,[p]:null}}onAutoRecordOn(e){u()}onAutoRecordOff(e){const r=e[p];return r&&this.clearTimeout(r),{[c]:"recordingstate",[R]:!1,[p]:null}}onStopTransaction(e,r){const t=e[g],o=e[p],n=e[m];let a=e[S];return o&&this.clearTimeout(o),t.length&&(!t.title&&!r&&e.getTransactionTitle?t.title=e.getTransactionTitle(t):r&&(t.title=r),n[a]=t,n.length=++a),[{[c]:"autoreadystate",[S]:a,[g]:null,[p]:null},()=>{e.notifyStoresAboutStateRecordingStop(t,{stop:!0})}]}onStopTransactionDelayed(e){let r=e[p];return r&&this.clearTimeout(r),r=this.setTimeout(()=>{e.stopTransaction()},e.autoRecordTransactionStopTimeout),{[c]:G,[p]:r}}onResetQueue(e,r){return U(e,r)}onRejectTransaction(e){const r=e[g],t=e[p];return t&&this.clearTimeout(t),[{[c]:"restoringstate",[g]:null,[p]:null},()=>(r.length&&r.undo(),["autoreadystate",()=>{e.notifyStoresAboutStateRecordingStop(r,{rejected:!0})}])]}onModelUpdate(e,...r){super.onModelUpdate(e,...r),e.stopTransactionDelayed()}onModelInsertChild(e,...r){super.onModelInsertChild(e,...r),e.stopTransactionDelayed()}onModelRemoveChild(e,...r){super.onModelRemoveChild(e,...r),e.stopTransactionDelayed()}onStoreModelAdd(e,...r){super.onStoreModelAdd(e,...r),e.stopTransactionDelayed()}onStoreModelInsert(e,...r){super.onStoreModelInsert(e,...r),e.stopTransactionDelayed()}onStoreModelRemove(e,...r){super.onStoreModelRemove(e,...r),e.stopTransactionDelayed()}onStoreRemoveAll(e,...r){super.onStoreRemoveAll(e,...r),e.stopTransactionDelayed()}},G=new rt,ot=G;b.registerStmState("autorecordingstate",G);var nt=(e,r,t,o)=>new K({model:e,newData:r,oldData:t,isInitialUserAction:o}),at=(e,r,t,o)=>new j({parentModel:e,childModels:t,insertIndex:r,context:o}),st=(e,r,t)=>new B({parentModel:e,childModels:r,context:t}),it=(e,r,t)=>new Q({store:e,modelList:r,silent:t}),lt=(e,r,t,o,n)=>new X({store:e,insertIndex:r,modelList:t,context:o,silent:n}),dt=(e,r,t,o)=>new H({store:e,modelList:r,context:t,silent:o}),ct=(e,r,t)=>new q({store:e,allRecords:r,silent:t}),f=(e,r,...t)=>{const o=e.state,n=r.call(e[c],e,...t);if(typeof n=="string")e[c]=b.resolveStmState(n);else if(n instanceof A)e[c]=n;else if(Array.isArray(n)){const[a,s]=n;typeof a=="string"?e[c]=b.resolveStmState(a):a instanceof A?e[c]=a:a&&typeof a=="object"&&(e=Object.assign(e,a),e[c]=b.resolveStmState(e[c])),typeof s=="function"&&f(e,s,...t)}else n&&typeof n=="object"&&(e=Object.assign(e,n),e[c]=b.resolveStmState(e[c]));o!==F&&o!==Y&&n!==F&&n!==Y&&e.trigger("ready")},Oe=class extends ze(y){static get defaultConfig(){return{disabled:!0,autoRecord:!1,autoRecordTransactionStopTimeout:100,makeModelUpdateAction:nt,makeModelInsertChildAction:at,makeModelRemoveChildAction:st,makeStoreModelAddAction:it,makeStoreModelInsertAction:lt,makeStoreModelRemoveAction:dt,makeStoreRemoveAllAction:ct,getTransactionTitle:null}}construct(...e){Object.assign(this,{[c]:F,[E]:[],[m]:[],[S]:0,[g]:null,[p]:null,[R]:!1,[L]:!1,stashedTransactions:{}}),super.construct(...e)}get state(){return this[c]}get position(){return this[S]}get length(){return this[m].length}get stores(){return Array.from(this[E])}hasStore(e){return this[E].includes(e)}addStore(e){this.hasStore(e)||(this[E].push(e),e.stm=this,e.forEach(r=>r.stm=this),e.isTree&&(e.rootNode.stm=this))}removeStore(e){this.hasStore(e)&&(this[E]=this[E].filter(r=>r!==e),e.stm=null,e.forEach(r=>r.stm=null))}forEachStore(e){this[E].forEach(r=>e(r,r.id))}get disabled(){return this.state===Ve}set disabled(e){const r=this;r.disabled!==e&&(e?f(r,r.state.onDisable,r):f(r,r.state.onEnable,r),r.trigger("stmDisabled",{disabled:e}),r.trigger("disabled",{disabled:e}))}get enabled(){return!this.disabled}enable(){this.disabled=!1}disable(){this.disabled=!0}get isReady(){return this.state===F||this.state===Y}waitForReadiness(){return this.await("ready",!1)}get isRecording(){return this.state===Je||this.state===ot}get isApplyingStash(){return this[L]}get autoRecord(){return this[R]}set autoRecord(e){const r=this;r.autoRecord!=e&&(e?f(r,r.state.onAutoRecordOn,r):f(r,r.state.onAutoRecordOff,r))}startTransaction(e=null){f(this,this.state.onStartTransaction,e)}stopTransaction(e=null){f(this,this.state.onStopTransaction,e)}stopTransactionDelayed(){f(this,this.state.onStopTransactionDelayed)}rejectTransaction(){f(this,this.state.onRejectTransaction)}get transaction(){return this[g]}get queue(){return this[m].map(e=>e.title)}get rawQueue(){return this[m]}get isRestoring(){return this.state===et||this.isApplyingStash}get canUndo(){return this.state.canUndo(this)}get canRedo(){return this.state.canRedo(this)}async undo(e=1){this.isReady||await this.waitForReadiness(),f(this,this.state.onUndo,e)}async undoAll(){this.isReady||await this.waitForReadiness(),this.undo(this.length)}async redo(e=1){this.isReady||await this.waitForReadiness(),f(this,this.state.onRedo,e)}async redoAll(){this.isReady||await this.waitForReadiness(),this.redo(this.length)}resetQueue(e={undo:!0,redo:!0}){f(this,this.state.onResetQueue,e)}resetUndoQueue(){this.resetQueue({undo:!0})}resetRedoQueue(){this.resetQueue({redo:!0})}notifyStoresAboutStateRecordingStart(e){this.forEachStore(r=>{var t;return(t=r.onStmRecordingStart)==null?void 0:t.call(r,this,e)}),this.trigger("recordingStart",{stm:this,transaction:e})}notifyStoresAboutStateRecordingStop(e,r){this.forEachStore(t=>{var o;return(o=t.onStmRecordingStop)==null?void 0:o.call(t,this,e,r)}),this.trigger("recordingStop",{stm:this,transaction:e,reason:r})}notifyStoresAboutStateRestoringStart(){this.forEachStore(e=>{var r;return(r=e.onStmRestoringStart)==null?void 0:r.call(e,this)}),this.trigger("restoringStart",{stm:this})}notifyStoresAboutStateRestoringStop({cause:e,transactions:r}){this.forEachStore(t=>{var o;return(o=t.onStmRestoringStop)==null?void 0:o.call(t,this)}),this.trigger("restoringStop",{stm:this,cause:e,transactions:r})}notifyStoresAboutQueueReset(e){this.forEachStore(r=>{var t;return(t=r.onStmQueueReset)==null?void 0:t.call(r,this,e)}),this.trigger("queueReset",{stm:this,options:e})}onModelUpdate(e,r,t,o){f(this,this.state.onModelUpdate,e,r,t,o)}onModelInsertChild(e,r,t,o){f(this,this.state.onModelInsertChild,e,r,t,o)}onModelRemoveChild(e,r,t){f(this,this.state.onModelRemoveChild,e,r,t)}onStoreModelAdd(e,r,t){f(this,this.state.onStoreModelAdd,e,r,t)}onStoreModelInsert(e,r,t,o,n){f(this,this.state.onStoreModelInsert,e,r,t,o,n)}onStoreModelRemove(e,r,t,o){f(this,this.state.onStoreModelRemove,e,r,t,o)}onStoreRemoveAll(e,r,t){f(this,this.state.onStoreRemoveAll,e,r,t)}onUndoKeyPress(e){const r=this;r.enabled&&(e.shiftKey?r.canRedo&&(e.preventDefault(),r.redo()):r.canUndo&&(e.preventDefault(),r.undo()))}stash(){const e=this;if(this.transaction){const r=je.generateId("_stashedTransactionGeneratedId_");return e.stashedTransactions[r]=e.transaction,e.rejectTransaction(),r}}applyStash(e){const r=this,t=r.stashedTransactions[e];r[L]=!0,t&&(r.startTransaction(t.title),t.redo(),delete r.stashedTransactions[e]),r[L]=!1}};Oe._$name="StateTrackingManager";var Ie=e=>class extends(e||y){static get $name(){return"Finalizable"}construct(...t){super.construct(...t),this.finalizer=null,this.finalizing=null,this.isFinalized=!1,this.isFinalizing=!1}doFinalize(){this.destroy()}finalize(){const t=this;let o=t.finalizing;return!o&&!t.isFinalized&&(t.isFinalizing=!0,t.finalizing=o=t._awaitFinalizer()),o}async _awaitFinalizer(){const t=this;try{await t.finalizer}finally{t.finalizing=null,t.isFinalized=!0,t.doFinalize()}}},W=Symbol("dragAbort"),$=Symbol("dragInit"),xe=Symbol("dragDrag"),V=Symbol("dragDrop"),ut={x:"horizontal",y:"vertical"},C=class extends y.mixin(Ie,Z,Be){static get configurable(){return{itemElement:null,scrollManager:null,monitoringConfig:null,source:null,target:null,targetElement:null,threshold:5,touchStartDelay:300}}static get identifiable(){return{}}construct(...e){super.construct(...e);const r=this,{event:t}=r;Object.assign(r,{altKey:null,cleaners:[],ctrlKey:null,data:new Map,element:t.target,endEvent:null,lastMoveEvent:null,metaKey:null,previousTarget:null,scrollerAction:null,shiftKey:null,state:$,startEvent:t,touchStartTimer:null,_valid:!0}),"touches"in t&&r.touchStartDelay&&(r.touchStartTimer=r.setTimeout(()=>r.touchStartTimer=null,r.touchStartDelay,"touchStartDelay")),_.on({element:globalThis,blur:"onWindowBlur",thisObj:r})}doDestroy(){const e=this,{source:r,target:t}=e;e.cleanup(),(t==null?void 0:t.dropping)===e&&(t.dropping=null),(r==null?void 0:r.dragging)===e&&(r.dragging=null),super.doDestroy()}onWindowBlur(){this.started&&this.abort()}get aborted(){return this.state===W}get completed(){return this.isDestroying||this.aborted||this.endEvent!==null}get pending(){return this.state===$}get started(){return this.state!==$&&!this.aborted}get valid(){return this.started&&this.targetElement!=null&&this._valid}set valid(e){this._valid=e}async get(e){if(this.aborted)throw new Error("Data is not available on aborted drag");if(!this.completed)throw new Error("Data is not available until drag completion");if(Array.isArray(e))return Promise.all(e.map(t=>this.get(t)));let r=this.data.get(e);return typeof r=="function"&&(r=await r(),this.data.set(e,r)),r}has(e){return this.data.has(e)}peek(e){if(this.aborted)throw new Error("Data is not available on aborted drag");if(Array.isArray(e))return e.map(t=>this.peek(t));let r=this.data.get(e);return typeof r=="function"&&(r=!0),r}set(e,r){this.data.set(e,r)}changeTarget(e,r){if(e!==r){const t=this;t._target=e,t.previousTarget=r,r&&(r.dropping=null),e&&(e.dropping=t,e.dropping!==t&&(e=null,t.valid=!1)),t._target=r}return e}updateTarget(e,r){const t=this;r&&t.source.dragLeaveTarget(t,r),e&&(t.valid=!0,e.dragMove(t),t.source.dragEnterTarget(t))}updateTargetElement(e){let r,t,o,n,a;for(a=e;a;a=a.parentElement)if(t=I.get(a,"droppables"),t){for(n=0;n<t.length;++n)if(r=t[n],r.dropRootElement.contains(e)&&(o=r.droppableSelector,(!o||e.closest(`#${x.getId(r.dropRootElement)} ${o}`))&&(this.target=r,this.target===r)))return}}abort(){const e=this,{element:r,source:t}=e;r==null||r.getBoundingClientRect(),e.state!==V&&(e.state=W,e.cleanup()),t==null||t.endDrag(e)}begin(){const e=this,{source:r}=e,t=r.beforeDrag(e);return t!==!1&&(r.dragging=e),t}cleanup(){let e;for(;e=this.cleaners.pop();)e()}end(e){const r=this,{lastMoveEvent:t,target:o}=r,{dragSwallowClickTime:n}=r.source;r.event=r.domEvent=r.endEvent=e,r.syncFlags(),r.started&&(((t==null?void 0:t.clientX)!==e.clientX||(t==null?void 0:t.clientY)!==e.clientY||(t==null?void 0:t.target)!==e.target)&&r.track(),n&&_.on({element:document,capture:!0,expires:n,once:!0,click(a){a.stopPropagation()}}),r.state=V,o!==r.source&&(o==null||o.dragDrop(r)))}fakeKey(e,r){const t=this,{lastMoveEvent:o}=t;if(o&&t.element){let n;o.isKey=!0,e.key==="Alt"?t.altKey!==r&&(t.altKey=r,n=!0):e.key==="Control"&&t.ctrlKey!==r&&(t.ctrlKey=r,n=!0),n&&(t.event=t.domEvent=o,t.track())}}keyDown(e){this.completed||(e.key==="Escape"?this.abort():this.isDragToggleKey(e.key)&&this.fakeKey(e,!0))}keyUp(e){!this.completed&&this.isDragToggleKey(e.key)&&this.fakeKey(e,!1)}getDistance(e){return _.getDistanceBetween(this.startEvent,e)}isDragToggleKey(e){return e==="Control"||e==="Alt"}move(e){const r=this,{target:t}=e,o=r.getDistance(e),n=o>=r.threshold;if(r.syncFlags(),r.touchStartTimer){n&&r.abort();return}if(t&&t.nodeType===Node.ELEMENT_NODE){if(n&&!r.started&&(r.event=r.domEvent=e,r.start()===!1)){r.abort();return}r.started&&!r.completed&&(r.lastMoveEvent=r.event=r.domEvent=e,e.type==="touchmove"&&(e.preventDefault(),e.stopImmediatePropagation()),r.track())}}start(){const e=this,{scrollManager:r,monitoringConfig:t,source:o}=e,{draggingBodyCls:n,dragLock:a}=o,s=o.dragRootElement;if(e.state=xe,e.startEvent.type==="touchstart"&&Ne.isMobileSafari){for(let d=e.startEvent.target.parentElement;d;d=d.parentElement){const{style:l}=d,v=x.getStyleValue(d,"overflow");(v==="auto"||v=="scroll")&&(e.scrollingAncestors||(e.scrollingAncestors=[]),e.scrollingAncestors.push([d,l.overflow,l.overflowX,l.overflowY]),l.overflow="hidden")}e.requestAnimationFrame(()=>{e.scrollingAncestors.forEach(([{style:d},l,v,T])=>{d.overflow=l,d.overflowX=v,d.overflowY=T}),e.scrollingAncestors=null})}if(r){const d=r.startMonitoring(Xe.merge({scrollables:[{element:s}],direction:ut[a]||a||"both",callback(l){const{lastMoveEvent:v}=e;v&&e.element&&(v.isScroll=!0,e.event=e.domEvent=v,e.scrollerAction=l,e.track(),e.scrollerAction=null)}},t));e.cleaners.push(d)}const i=o.dragRootElement.closest(".b-outer")||document.body;if(i.classList.add(n),e.cleaners.push(()=>i.classList.remove(n)),o.startDrag(e)===!1)return e.cleanup(),!1}syncFlags(){const e=this,{event:r}=e;e.altKey=r.altKey,e.ctrlKey=r.ctrlKey||r.metaKey,e.metaKey=r.metaKey,e.shiftKey=r.shiftKey}track(){const e=this,{event:r,source:t,target:o}=e;let n=r.target,a;r.type==="touchmove"&&(a=r.changedTouches[0],n=x.elementFromPoint(a.clientX,a.clientY)),e.targetElement=n,o===e.target&&(o==null||o.dragMove(e)),t.trackDrag(e)}};P(C,"$name","DragContext"),C.prototype.STATE=C.STATE=Object.freeze({ABORTED:W,INIT:$,DRAGGING:xe,DROPPED:V}),C._$name="DragContext";var z=class ke extends y.mixin(Ke){static get type(){return"default"}static get configurable(){return{dragging:null}}static get factoryable(){return{defaultType:ke}}updateDragging(r,t){t&&this.close(t),r&&this.open(r)}close(r){}open(r){}dragStart(r){this.dragging=r}dragMove(r){}dragEnd(r){this.dragging=null}};z.initClass(),z._$name="DragProxy";var gt=e=>class extends(e||y){static get $name(){return"Draggable"}static get configurable(){return{dragging:{$config:"nullify",value:null},draggingClsSelector:null,dragDocumentListeners:{element:document,keydown:"onDragKeyDown",keyup:"onDragKeyUp",contextmenu:"onDragContextMenu",mousemove:"onDragPointerMove",mouseup:"onDragPointerUp",pointerup:"onDragPointerUp",touchend:"onDragPointerUp",touchmove:{handler:"onDragPointerMove",passive:!1}},dragItemSelector:null,dragItemOverCls:null,dragLock:null,dragMinDistance:1,dragProxy:{$config:["lazy","nullify"],value:null},dragRootElement:{$config:"nullify",value:null},dragSameTargetDrop:!1,dragSelector:null,ignoreSelector:null,dragSwallowClickTime:50,dragThreshold:5,dragTouchStartDelay:300,dropTargetSelector:null,overItem:null,testConfig:{dragSwallowClickTime:50}}}static get properties(){return{draggingCls:"b-draggable-active",draggingBodyCls:"b-draghelper-active",draggingItemCls:"b-dragging-item",draggingStartedCls:"b-draggable-started",draggableCls:"b-draggable"}}beforeDrag(t){const{dragRootElement:o,dragSelector:n,ignoreSelector:a}=this,s=n&&t.element.closest(n);return!n||!!(s&&s===o||o.contains(s)&&(!a||!t.element.matches(a)))}dragStart(t){}dragOver(t){}dragEnterTarget(t){}dragLeaveTarget(t,o){}dragDrop(t){}dragEnd(t){}get activeDrag(){const{dragging:t}=this;return t!=null&&t.started&&!t.completed?t:null}get dragEventer(){return this.trigger?this:null}get draggingClassElement(){const{draggingClsSelector:t,dragRootElement:o}=this;return t?o==null?void 0:o.closest(t):o}beginDrag(t){const{draggingCls:o,draggingClassElement:n}=this;o&&n&&(n.classList.add(o),t.cleaners.push(()=>n.classList.remove(o)))}async endDrag(t){const o=this,{dragEventer:n,dragProxy:a}=o;t.valid&&await o.dragDrop(t),!o.isDestroyed&&(t.pending?t.destroy():(o.dragEnd(t),a==null||a.dragEnd(t),n==null||n.trigger(t.valid?"drop":"dragCancel",{drag:t,event:t.event}),o.finalizeDrag(t)))}async finalizeDrag(t){var o;await((o=t.finalize)==null?void 0:o.call(t))}moveDrag(t){if(this.dragOver(t)!==!1){const{dragEventer:o,dragProxy:n}=this;n==null||n.dragMove(t),o==null||o.trigger("drag",{drag:t,event:t.event})}}setupDragContext(t){const o=this,{dragItemSelector:n,id:a}=o,{target:s}=t;return{event:t,id:a?`${a}-drag-${o._nextDragId=(o._nextDragId||0)+1}`:null,itemElement:n?s.closest(n):s,touchStartDelay:o.dragTouchStartDelay,source:o,threshold:o.dragThreshold}}startDrag(t){const{draggingStartedCls:o,draggingClassElement:n,draggingItemCls:a,dragEventer:s,dragProxy:i}=this,{itemElement:d}=t;if((s==null?void 0:s.trigger("beforeDragStart",{drag:t,event:t.event}))===!1)return!1;o&&n&&(n.classList.add(o),t.cleaners.push(()=>n.classList.remove(o))),a&&d&&(d.classList.add(a),t.cleaners.push(()=>d.classList.remove(a))),i==null||i.dragStart(t);const l=this.dragStart(t);return l!==!1&&(s==null||s.trigger("dragStart",{drag:t,event:t.event})),l}trackDrag(t){var o;const{dropTargetSelector:n}=this;t.valid=!(n&&!((o=t.targetElement)!=null&&o.closest(n))),this.moveDrag(t)}configureListeners(t){const o=this,n=Qe.assign({thisObj:o},o.dragDocumentListeners);return"touches"in t.startEvent?(delete n.mousemove,delete n.mouseup):(delete n.contextmenu,delete n.touchmove,delete n.touchend,delete n.pointerup),n}updateDragging(t,o){const n=this;if(t){const a=n.configureListeners(t);t.cleaners.push(_.on(a)),n.beginDrag(t)}else o&&o.destroy()}changeDragProxy(t,o){return z.reconfigure(o,t,{owner:this,defaults:{owner:this}})}updateDragRootElement(t,o){var n;const a=this,{draggableCls:s,dragItemSelector:i,onDragItemMouseMove:d}=a;if(o==null||o.classList.remove(s),(n=a._dragRootDetacher)==null||n.call(a),t){const l={thisObj:a,element:t,mousedown:"onDragMouseDown",touchstart:"onDragTouchStart",pointerdown:v=>{var T,k;return v.pointerId&&((k=(T=v.target).releasePointerCapture)==null?void 0:k.call(T,v.pointerId))}};d&&(l.mousemove={delegate:i,handler:"onDragItemMouseMove"}),(a.dragItemOverCls||d||a.onDragItemMouseEnter||a.onDragItemMouseLeave)&&Object.assign(l,{mouseover:{delegate:i,handler:"onDragItemMouseOver"},mouseout:{delegate:i,handler:"onDragItemMouseOut"}}),t.classList.add(s),a._dragRootDetacher=_.on(l)}}onDragItemMouseOver(t){this.overItem=t}onDragItemMouseOut(t){this.dragging||(this.overItem=t)}changeOverItem(t){var o;return this.enterLeaveEvent=t,t.type==="mouseout"?((o=t.relatedTarget)==null?void 0:o.closest(this.dragItemSelector))||null:t.target.closest(this.dragItemSelector)}updateOverItem(t,o){var n,a;const s=this,{dragItemOverCls:i}=s;o&&(i&&o.classList.remove(i),(n=s.onDragItemMouseLeave)==null||n.call(s,s.enterLeaveEvent,o)),t&&(i&&t.classList.add(i),(a=s.onDragItemMouseEnter)==null||a.call(s,s.enterLeaveEvent,t))}onDragContextMenu(t){t.preventDefault()}onDragKeyDown(t){this.dragging.keyDown(t)}onDragKeyUp(t){this.dragging.keyUp(t)}onDragMouseDown(t){t.button===0&&this.onDragPointerDown(t)}onDragPointerDown(t){let{dragging:o}=this;o?o.isFinalizing||o.abort():(o=this.setupDragContext(t),o&&(o=new C(o),o.begin()===!1&&o.destroy()))}changeDragging(t,o){return o==null||o.destroy(),t}onDragPointerMove(t){const{dragging:o}=this;o&&!o.completed&&(o==null||o.move(t))}onDragPointerUp(t){const{dragging:o}=this;o&&!o.completed&&(o.end(t),this.endDrag(o))}onDragTouchStart(t){t.touches.length===1&&this.onDragPointerDown(t)}},ht=e=>class extends(e||y){static get $name(){return"Droppable"}static get configurable(){return{droppableSelector:null,dropping:null,dropRootElement:{$config:"nullify",value:null}}}get dropEventer(){return this.trigger?this:null}get droppableCls(){return"b-droppable"}dragEnter(t){var o;return(o=this.dropEventer)==null?void 0:o.trigger("dragEnter",{drag:t,event:t.event})}dragMove(t){var o;return(o=this.dropEventer)==null?void 0:o.trigger("dragMove",{drag:t,event:t.event})}dragDrop(t){var o;return(o=this.dropEventer)==null?void 0:o.trigger("drop",{drag:t,event:t.event})}dragLeave(t){var o;return(o=this.dropEventer)==null?void 0:o.trigger("dragLeave",{drag:t,event:t.event})}changeDropping(t,o){if(t!==o){const n=this;o&&(o.aborted||!o.completed)&&n.dragLeave(o),t&&(n._dropping=t,n.dragEnter(t)===!1&&(t=null),n._dropping=o)}return t}updateDropRootElement(t,o){const n=this,{droppableCls:a}=n;let s,i,d;o&&(s=I.get(o,"droppables"),d=!0,Array.isArray(s)&&(i=s.indexOf(n))>-1&&(s.length<2?I.remove(o,"droppables"):(s.splice(i,1),s.forEach(l=>{a===l.droppableCls&&(d=!1)}))),d&&o.classList.remove(a)),t&&(s=I.get(t,"droppables"),s?s.push(n):I.set(t,"droppables",[n]),t.classList.add(a))}},O=class extends Fe{configure(e){var r;const t=(r=e.picker)!=null?r:{};e.colors&&(t.colors=e.colors),"addNoColorItem"in e&&(t.addNoColorItem=e.addNoColorItem),e.picker=t,super.configure(e)}updatePicker(e){e&&(this.items=e.store.records)}updateColors(e){this.isConfiguring||(this.picker.colors=e)}updateAddNoColorItem(e){this.isConfiguring||(this.picker.addNoColorItem=e)}set value(e){this.store||(this.items=[],this.store=this.picker.store),e||(e=this.store.findRecord("color",null)),super.value=e}showPicker(){this.picker.refresh(),super.showPicker(...arguments)}get value(){return super.value}syncInputFieldValue(...e){var r;const t=this,{value:o}=t;let n=(r=t.picker)==null?void 0:r.getColorClassName(o);n||(t.colorBox.style.color=o),n="b-colorbox "+n,t.colorBox.className=n,t.showBoxForNoColor||t.element.classList.toggle("b-colorless",!o),super.syncInputFieldValue(...e)}get innerElements(){return[{reference:"colorBox",className:"b-colorbox"},...super.innerElements]}};P(O,"$name","ColorField"),P(O,"type","colorfield"),P(O,"configurable",{displayField:"text",valueField:"color",editable:!1,picker:{type:"colorpicker",align:{align:"t100-b100",matchSize:!1}},showBoxForNoColor:!0,colors:null,addNoColorItem:!0}),O.initClass(),O._$name="ColorField";var w=class extends Ue{static get properties(){return{toggledCls:"b-slidetoggle-checked"}}construct(e){e.checked&&(e.cls=$e.from(e.cls)||{},e.cls[this.constructor.properties.toggledCls]=1),super.construct(e)}get innerElements(){const e=super.innerElements;return e.splice(1,0,this.toggleElement),this.text?e[e.length-1].class="b-slidetoggle-label":e.pop(),e}get toggleElement(){return{class:"b-slidetoggle-toggle",reference:"slideToggle",children:[{class:"b-slidetoggle-thumb",reference:"slideThumb"}]}}internalOnChange(){super.internalOnChange(),this.element.classList[this.value?"add":"remove"](this.toggledCls)}};P(w,"$name","SlideToggle"),P(w,"type","slidetoggle"),w.initClass(),w._$name="SlideToggle";var Le=class J extends y{static get configurable(){return{element:null,colorPrefix:"b-sch-",tooltip:null,size:null}}doDestroy(){var r;(r=this.tooltip)==null||r.destroy(),super.doDestroy()}updateElement(r){_.on({element:r,delegate:".b-resource-image",error:"onImageErrorEvent",thisObj:this,capture:!0})}changeTooltip(r){return qe.new({forElement:this.element,forSelector:".b-resource-avatar",cls:"b-resource-avatar-tooltip"},r)}static get failedUrls(){return this._failedUrls||(this._failedUrls=new Set),this._failedUrls}getResourceAvatar(r){if(Array.isArray(r))return r.map(k=>this.getResourceAvatar(k));const{initials:t,color:o,iconCls:n,imageUrl:a,defaultImageUrl:s,dataset:i={},resourceRecord:d,alt:l=He.encodeHtml(d==null?void 0:d.name)}=r,v=this.getImageConfig(t,o,a,s,i,l)||this.getIconConfig(n,i)||this.getResourceInitialsConfig(t,o,i),{size:T}=this;return Object.assign(v.style,{...T?{height:T,width:T}:void 0}),v}getImageConfig(r,t,o,n,a,s){if(o=J.failedUrls.has(o)?n:o||n,o)return{tag:"img",draggable:"false",loading:"lazy",class:{"b-resource-avatar":1,"b-resource-image":1},style:{},alt:s,elementData:{defaultImageUrl:n,imageUrl:o,initials:r,color:t,dataset:a},src:o,dataset:a}}getIconConfig(r,t){if(r)return r&&{tag:"i",style:{},class:{"b-resource-avatar":1,"b-resource-icon":1,[r]:1},dataset:t}}getResourceInitialsConfig(r,t,o){const n=x.isNamedColor(t)&&t,a=!n&&t,{size:s}=this;return{tag:"div",class:{"b-resource-avatar":1,"b-resource-initials":1,[`${this.colorPrefix}${n}`]:n},style:{backgroundColor:a||null,...s?{height:s,width:s}:void 0},children:[r],dataset:o}}onImageErrorEvent({target:r}){if(!r.matches(".b-resource-avatar"))return;const{defaultImageUrl:t,initials:o,color:n,imageUrl:a,dataset:s}=r.elementData;if(t&&!r.src.endsWith(t.replace(/^[./]*/gm,"")))r.src=t;else{const i=x.createElement(this.getResourceInitialsConfig(o,n,s));i.elementData=r.elementData,r.parentElement.replaceChild(i,r)}J.failedUrls.add(a)}};P(Le,"$name","AvatarRendering");var we=Le;we._$name="AvatarRendering";export{D as ActionBase,Q as AddAction,we as AvatarRendering,O as ColorField,C as DragContext,z as DragProxy,gt as Draggable_default,ht as Droppable_default,Ie as Finalizable_default,X as InsertAction,j as InsertChildAction,H as RemoveAction,q as RemoveAllAction,B as RemoveChildAction,w as SlideToggle,A as StateBase,Oe as StateTrackingManager,N as Transaction,K as UpdateAction};
//# sourceMappingURL=chunk-4LHHPUQ6.js.map