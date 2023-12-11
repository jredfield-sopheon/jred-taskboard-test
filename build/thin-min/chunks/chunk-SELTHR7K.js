/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{RecurrenceFrequencyCombo as H,TaskEditStm_default as z}from"./chunk-MS4QMERY.js";import{GridFeatureManager as x}from"./chunk-GGOYEX2W.js";import{DateField as W,DatePicker as N}from"./chunk-6ZLMCHE5.js";import{RecurrenceDayRuleEncoder as E,TimeSpan as q}from"./chunk-KVD75ID2.js";import{ArrayHelper as U,AsyncHelper as K,Base as Y,Button as G,Combo as Q,Config as J,DateHelper as f,Delayable_default as X,DomHelper as y,InstancePlugin as Z,List as ee,Localizable_default as te,ObjectHelper as C,Objects as re,Popup as $,Store as ne,StringHelper as ie,VersionHelper as j,Widget as b}from"./chunk-MZVS5JQA.js";var S=class extends te(){static get $name(){return"RecurrenceLegend"}static get allDaysValueAsArray(){return["SU","MO","TU","WE","TH","FR","SA"]}static get allDaysValue(){return this.allDaysValueAsArray.join(",")}static get workingDaysValue(){return this.allDaysValueAsArray.filter((e,r)=>!f.nonWorkingDays[r]).join(",")}static get nonWorkingDaysValue(){return this.allDaysValueAsArray.filter((e,r)=>f.nonWorkingDays[r]).join(",")}static getLegend(e,r){const t=this,{timeSpan:n,interval:a,days:i,monthDays:s,months:l,positions:u}=e,d=r||n.startDate,c={interval:a};let g;switch(e.frequency){case"DAILY":return a===1?t.L("L{Daily}"):t.L("L{Every {0} days}",c);case"WEEKLY":return i&&i.length?c.days=t.getDaysLegend(i):d&&(c.days=f.getDayName(d.getDay())),t.L(a===1?"L{Weekly on {1}}":"L{Every {0} weeks on {1}}",c);case"MONTHLY":return i&&i.length&&u&&u.length?c.days=t.getDaysLegend(i,u):s&&s.length?(s.sort((o,h)=>o-h),c.days=t.arrayToText(s)):d&&(c.days=d.getDate()),t.L(a===1?"L{Monthly on {1}}":"L{Every {0} months on {1}}",c);case"YEARLY":return i&&i.length&&u&&u.length?c.days=t.getDaysLegend(i,u):c.days=d.getDate(),l&&l.length?(l.sort((o,h)=>o-h),l.length>2?g=o=>f.getMonthShortName(o-1):g=o=>f.getMonthName(o-1),c.months=t.arrayToText(l,g)):c.months=f.getMonthName(d.getMonth()),t.L(a===1?"L{Yearly on {1} of {2}}":"L{Every {0} years on {1} of {2}}",c)}}static getDaysLegend(e,r){const t=this,n={position:""};let a;if(r&&r.length&&(n.position=t.arrayToText(r,i=>t.L(`L{position${i}}`))),e.length)switch(e.sort((i,s)=>E.decodeDay(i)[0]-E.decodeDay(s)[0]),e.join(",")){case t.allDaysValue:n.days=t.L("L{day}");break;case t.workingDaysValue:n.days=t.L("L{weekday}");break;case t.nonWorkingDaysValue:n.days=t.L("L{weekend day}");break;default:e.length>2?a=i=>f.getDayShortName(E.decodeDay(i)[0]):a=i=>f.getDayName(E.decodeDay(i)[0]),n.days=t.arrayToText(e,a)}return t.L("L{daysFormat}",n)}static arrayToText(e,r){return r&&(e=e.map(r)),e.join(", ").replace(/,(?=[^,]*$)/,this.L("L{ and }"))}};S._$name="RecurrenceLegend";var m=f,ae=["startDate","endDate","resource","recurrenceRule"],I=e=>{if(e.length===1)return e[0].value;if(e.length===2){const[r,t]=e[0]instanceof W?e:e.reverse(),n=m.parse(r.value);return n&&t.value&&n.setHours(t.value.getHours(),t.value.getMinutes(),t.value.getSeconds(),t.value.getMilliseconds()),n?f.clone(n):null}return null},D=(e,r)=>{const t=new Date(e.getTime());return t.setHours(r.getHours(),r.getMinutes()),t},F=(e,r,t)=>{if(!t.editor.assigningValues&&e&&r&&t.endDateField&&t.endTimeField){const n=m.add(D(t.startDateField.value,t.startTimeField.value),t._durationMS,"milliseconds");t.endDateField.value=n,t.endTimeField.value=m.clone(n)}},L=class extends Z{static get configurable(){return{saveAndCloseOnEnter:!0,triggerEvent:null,dateFormat:"L",timeFormat:"LT",editorConfig:null,items:null,weekStartDay:null}}construct(e,r){const t=this;e.eventEdit=t,super.construct(e,C.assign({weekStartDay:e.weekStartDay},r)),t.clientListenersDetacher=e.ion({[t.triggerEvent]:"onActivateEditor",dragCreateEnd:"onDragCreateEnd",eventAutoCreated:"onEventAutoCreated",thisObj:t})}doDestroy(){var e;this.clientListenersDetacher(),(e=this._editor)==null||e.destroy(),super.doDestroy()}onEventAutoCreated(){}changeEditorConfig(e){const{items:r}=this;return r&&(e=re.clone(e),e.items=J.merge(r,e.items)),e}changeItems(e){return this.cleanItemsConfig(e),e}cleanItemsConfig(e){for(const r in e){const t=e[r];t===!0?delete e[r]:t!=null&&t.items&&this.cleanItemsConfig(t.items)}}onDatesChange({value:e,source:r}){var t,n,a,i,s,l,u,d,c,g;const o=this;if((r===o.endDateField||r===o.endTimeField)&&o.startDateField){const h=(t=o.endTimeField)!=null&&t.value&&((n=o.endDateField)!=null&&n.value)?D(o.endDateField.value,o.endTimeField.value):(a=o.endDateField)==null?void 0:a.value,v=(i=o.startTimeField)!=null&&i.value&&((s=o.startDateField)!=null&&s.value)?D(o.startDateField.value,o.startTimeField.value):(l=o.startDateField)==null?void 0:l.value;h&&v&&(o._durationMS=h-v)}switch(o.startDateField&&o.endDateField&&(o.endDateField.min=o.startDateField.value),o.endTimeField&&(m.isEqual(m.clearTime((u=o.startDateField)==null?void 0:u.value),m.clearTime((d=o.endDateField)==null?void 0:d.value))?o.endTimeField.min=o.startTimeField.value:o.endTimeField.min=null),r.ref){case"startDateField":(c=o.startTimeField)!=null&&c.value&&F(e,o.startTimeField.value,o);break;case"startTimeField":(g=o.startDateField)!=null&&g.value&&F(o.startDateField.value,e,o);break}}async save(){throw new Error("Implement in subclass")}get values(){const e=this,{editor:r}=e,t=[],n=[],{values:a}=r;return ae.forEach(i=>delete a[i]),r.eachWidget(i=>{var s;const{name:l}=i;if(!l||i.hidden||i.up(u=>u===e.recurrenceEditor)){delete a[l];return}switch(l){case"startDate":t.push(i);break;case"endDate":n.push(i);break;case"resource":a[l]=i.record;break;case"recurrenceRule":a[l]=((s=r.widgetMap.recurrenceCombo)==null?void 0:s.value)==="none"?"":i.value;break}},!0),a.allDay&&!e.eventRecord.allDay&&(t.push(e.startTimeField),n.push(e.endTimeField)),t.length&&(a.startDate=I(t)),n.length&&(a.endDate=I(n)),"startDate"in a&&"endDate"in a&&(a.duration=m.diff(a.startDate,a.endDate,e.editor.record.durationUnit,!0)),a}onBeforeSave(e){}onAfterSave(e){}updateRecord(e){var r;const{values:t}=this;return this.assignmentStore&&delete t.resource,this._durationMS=f.asMilliseconds((r=t.duration)!=null?r:e.duration,e.durationUnit),e.set(t)}onBeforeEditorShow(){const{eventRecord:e,editor:r}=this.editingContext,{nameField:t}=r.widgetMap;t&&e.isCreating&&(r.assigningValues=!0,t.value="",r.assigningValues=!1,t._configuredPlaceholder=t.placeholder,t.placeholder=e.name)}resetEditingContext(){var e;const r=this;if(!r.editingContext)return;const{client:t}=r,{editor:n,eventRecord:a}=r.editingContext,{eventStore:i}=t,{nameField:s}=n.widgetMap;a.isCreating&&(t.isTimelineBase&&((e=r.editingContext.eventElement)==null||e.closest("[data-event-id]").classList.add("b-released")),i.remove(a),a.isCreating=!1),s&&(s.placeholder=s._configuredPlaceholder),t.element.classList.remove("b-eventeditor-editing"),r.targetEventElement=r.editingContext=n._record=null}onPopupKeyDown({event:e}){const r=this;!r.readOnly&&e.key==="Enter"&&r.saveAndCloseOnEnter&&e.target.tagName.toLowerCase()==="input"&&(e.preventDefault(),e.target.name==="startDate"&&r.startTimeField&&F(r.startDateField.value,r.startTimeField.value,r),r.onSaveClick())}async finalizeStmCapture(e){}async onSaveClick(){this.editor.focus(),this.isFinalizingEventSave=!0;const e=await this.save();return this.isFinalizingEventSave=!1,e&&(await this.finalizeStmCapture(!1),this.editor.close(),this.client.trigger("afterEventEdit")),e}async onDeleteClick(){this.isDeletingEvent=!0;const e=await this.deleteEvent();if(this.isDeletingEvent=!1,e){await this.finalizeStmCapture(!1);const{editor:r}=this;(!r.autoClose||r.containsFocus)&&r.close(),this.client.trigger("afterEventEdit")}}async onCancelClick(){this.isCancelingEdit=!0,this.editor.close(),this.isCancelingEdit=!1,this.hasStmCapture&&await this.finalizeStmCapture(!0),this.client.trigger("afterEventEdit")}};L._$name="EditBase";var R=class extends ${static get type(){return"eventeditor"}static get $name(){return"EventEditor"}static get configurable(){return{items:[],draggable:{handleSelector:":not(button,.b-field-inner)"},axisLock:"flexible",scrollable:{overflowY:!0},readOnly:null,titleRenderer:null,maximizeOnMobile:!0}}updateLocalization(){super.updateLocalization(...arguments),this.initialTitle=this.title||""}chainResourceStore(){return this.eventEditFeature.resourceStore.chain(e=>!e.isSpecialRow,null,{storeClass:ne,excludeCollapsedRecords:!1})}processWidgetConfig(e){var r;if((r=e.type)!=null&&r.includes("date")&&e.weekStartDay==null&&(e.weekStartDay=this.weekStartDay),e.type==="extraItems")return!1;const{eventEditFeature:t}=this,n={};if(e.ref==="resourceField"){const{store:a}=e;e.store=this.chainResourceStore(),a&&e.store.setConfig(a),"multiSelect"in e||(e.multiSelect=!t.eventStore.usesSingleAssignment)}return(e.name==="startDate"||e.name==="endDate")&&e.type==="date"&&(n.format=t.dateFormat),(e.name==="startDate"||e.name==="endDate")&&e.type==="time"&&(n.format=t.timeFormat),Object.assign(e,n),super.processWidgetConfig(e)}setupEditorButtons(){const{record:e}=this,{deleteButton:r}=this.widgetMap;r&&(r.hidden=this.readOnly||e.isCreating)}onBeforeShow(...e){var r;this.setupUIForEditing(),(r=super.onBeforeShow)==null||r.call(this,...e)}onBeforeToggleReveal({reveal:e}){e&&this.setupUIForEditing()}setupUIForEditing(){const e=this,{record:r,titleRenderer:t}=e;e.setupEditorButtons(),t?e.title=e.callback(t,e,[r]):e.title=e.initialTitle}onInternalKeyDown(e){this.trigger("keyDown",{event:e}),super.onInternalKeyDown(e)}updateReadOnly(e){const{deleteButton:r,saveButton:t,cancelButton:n}=this.widgetMap;super.updateReadOnly(e),r&&(r.hidden=e),t&&(t.hidden=e),n&&(n.hidden=e)}};R.initClass(),R._$name="EventEditor";var w=class extends H{static get $name(){return"RecurrenceCombo"}static get type(){return"recurrencecombo"}static get defaultConfig(){return{customValue:"custom",placeholder:"None",splitCls:"b-recurrencecombo-split",items:!0,highlightExternalChange:!1}}buildItems(){const e=this;return[{value:"none",text:"L{None}"},...super.buildItems(),{value:e.customValue,text:"L{Custom}",cls:e.splitCls}]}set value(e){e=e||"none",super.value=e}get value(){return super.value}set recurrence(e){const r=this;e?r.value=r.isCustomRecurrence(e)?r.customValue:e.frequency:r.value=null}isCustomRecurrence(e){const{interval:r,days:t,monthDays:n,months:a}=e;return!!(r>1||t&&t.length||n&&n.length||a&&a.length)}};w.initClass(),w._$name="RecurrenceCombo";var _=class extends G{static get $name(){return"RecurrenceLegendButton"}static get type(){return"recurrencelegendbutton"}static get defaultConfig(){return{localizableProperties:[],recurrence:null}}set recurrence(e){this._recurrence=e,this.updateLegend()}get recurrence(){return this._recurrence}set eventStartDate(e){this._eventStartDate=e,this.updateLegend()}get eventStartDate(){return this._eventStartDate}updateLegend(){const{recurrence:e}=this;this.text=e?S.getLegend(e,this.eventStartDate):""}onLocaleChange(){this.updateLegend()}updateLocalization(){this.onLocaleChange(),super.updateLocalization()}};_.initClass(),_._$name="RecurrenceLegendButton";var T=class extends ${static get $name(){return"RecurrenceEditor"}static get type(){return"recurrenceeditor"}static get configurable(){return{draggable:!0,closable:!0,floating:!0,cls:"b-recurrenceeditor",title:"L{Repeat event}",autoClose:!0,width:470,items:{recurrenceEditorPanel:{type:"recurrenceeditorpanel",title:null}},bbar:{defaults:{localeClass:this},items:{foo:{type:"widget",cls:"b-label-filler",weight:100},saveButton:{color:"b-green",text:"L{Save}",onClick:"up.onSaveClick",weight:200},cancelButton:{color:"b-gray",text:"L{Object.Cancel}",onClick:"up.onCancelClick",weight:300}}},scrollable:{overflowY:!0}}}updateReadOnly(e){super.updateReadOnly(e),this.bbar.hidden=e}get recurrenceEditorPanel(){return this.widgetMap.recurrenceEditorPanel}updateRecord(e){this.recurrenceEditorPanel.record=e}onSaveClick(){const e=this;e.saveHandler?e.saveHandler.call(e.thisObj||e,e,e.record):(e.recurrenceEditorPanel.syncEventRecord(),e.close())}onCancelClick(){const e=this;e.cancelHandler?e.cancelHandler.call(e.thisObj||e,e,e.record):e.close()}};T.initClass(),T._$name="RecurrenceEditor";var V=e=>class extends(e||Y){static get $name(){return"RecurringEventEdit"}static get configurable(){return{recurringEventsItems:{recurrenceCombo:{type:"recurrencecombo",label:"L{EventEdit.Repeat}",ref:"recurrenceCombo",weight:700},editRecurrenceButton:{type:"recurrencelegendbutton",ref:"editRecurrenceButton",name:"recurrenceRule",color:"b-gray",menuIcon:null,flex:1,weight:800,ignoreParentReadOnly:!0}},showRecurringUI:null}}changeEditorConfig(t){return t.items={...t.items,...this.recurringEventsItems},t=super.changeEditorConfig(t),t}doDestroy(){var t,n;(t=this._recurrenceConfirmation)==null||t.destroy(),(n=this._recurrenceEditor)==null||n.destroy(),super.doDestroy()}onEditorConstructed(t){var n;const a=this;t.ion({hide:a.onRecurringEventEditorHide,thisObj:a}),a.editRecurrenceButton&&(a.editRecurrenceButton.menu=a.recurrenceEditor),(n=a.recurrenceCombo)==null||n.ion({change:a.onRecurrenceComboChange,thisObj:a})}updateReadOnly(t){this._recurrenceEditor&&(this._recurrenceEditor.readOnly=t)}internalShowEditor(){this.toggleRecurringFieldsVisibility(this.client.enableRecurringEvents&&this.showRecurringUI!==!1)}toggleRecurringFieldsVisibility(t=!0){var n,a,i,s;const l=t?"show":"hide";(a=(n=this.editRecurrenceButton)==null?void 0:n[l])==null||a.call(n),(s=(i=this.recurrenceCombo)==null?void 0:i[l])==null||s.call(i)}onRecurringEventEditorHide(){var t,n;(t=this.recurrenceEditor)!=null&&t.isVisible&&this.recurrenceEditor.hide(),(n=this.recurrenceConfirmation)!=null&&n.isVisible&&this.recurrenceConfirmation.hide()}makeRecurrence(t){const n=this.eventRecord,a=n.copy();let i=n.recurrence;return!t&&i?i=i.copy():i=new n.recurrenceModel(t?{rule:t}:{}),i.timeSpan=a,a.setStartDate(this.values.startDate),i.suspendTimeSpanNotifying(),i}onRecurrableEventBeforeSave({eventRecord:t,context:n}){const a=this;a.isEditing&&!t.isCreating&&t.supportsRecurring&&(t.isRecurring||t.isOccurrence)&&(a.recurrenceConfirmation.confirm({actionType:"update",eventRecord:t,changerFn(){n.finalize(!0)},cancelFn(){n.finalize(!1)}}),n.async=!0)}set recurrenceConfirmation(t){this._recurrenceConfirmation=t}get recurrenceConfirmation(){const t=this;let n=t._recurrenceConfirmation;return(!n||!n.$$name)&&(n=b.create({type:"recurrenceconfirmation",owner:t.editor,...n}),t._recurrenceConfirmation=n),n}set recurrenceEditor(t){this._recurrenceEditor=t}get recurrenceEditor(){const t=this;let n=t._recurrenceEditor;return(!n||!n.$$name)&&(t._recurrenceEditor=n=b.create({type:"recurrenceeditor",autoShow:!1,centered:!0,modal:!0,minWidth:"auto",constrainTo:globalThis,anchor:!1,rootElement:t.rootElement,saveHandler:t.recurrenceEditorSaveHandler,onBeforeShow:t.onBeforeShowRecurrenceEditor.bind(t),thisObj:t,...n}),n.readOnly=t._readOnly),n}onBeforeShowRecurrenceEditor(){const t=this,{recurrenceEditor:n,eventRecord:a}=t;n&&(a!=null&&a.supportsRecurring)&&(t.recurrence||(t.recurrence=t.makeRecurrence()),t.recurrence.timeSpan.setStartDate(t.values.startDate),n.record=t.recurrence,n.centered=!0)}loadRecurrenceData(t){this.recurrence=t,this.updateRecurrenceFields(t)}updateRecurrenceFields(t){const n=this,{editRecurrenceButton:a}=n;n.recurrenceCombo&&(n.recurrenceCombo.recurrence=t),a&&(a.recurrence=t,a.value=t?t.rule:null,t&&n.client.enableRecurringEvents&&n.showRecurringUI!==!1?a.show():a.hide())}onRecurrenceComboChange({source:t,value:n,userAction:a}){if(a){const i=this,{recurrenceEditor:s}=i;n===t.customValue?(i.recurrenceCombo.recurrence=i.makeRecurrence(),s.centered?s.show():s.show((i.editRecurrenceButton||t).element)):i.loadRecurrenceData(n&&n!=="none"?i.makeRecurrence(`FREQ=${n}`):null)}}recurrenceEditorSaveHandler(t,n){t.recurrenceEditorPanel.syncEventRecord(n),this.updateRecurrenceFields(n),t.close()}onDatesChange(...t){if(super.onDatesChange(...t),!this.loadingRecord&&this.editRecurrenceButton){const{startDate:n}=this.values;n&&(this.editRecurrenceButton.eventStartDate=n)}}internalLoadRecord(t){t!=null&&t.supportsRecurring&&this.loadRecurrenceData(t.recurrence?this.makeRecurrence():null)}updateRecord(t){return t.recurrenceRule&&!this.recurrence&&(t.recurrenceRule=null),super.updateRecord(t)}},k=class extends Q{static get $name(){return"ResourceCombo"}static get type(){return"resourcecombo"}static get configurable(){return{showEventColor:null,displayField:"name",valueField:"id",picker:{cls:"b-resourcecombo-picker",itemIconTpl(e){if(this.owner.showEventColor){const{eventColor:r}=e,t=!y.isNamedColor(r),n=r?t?` style="color:${r}"`:"":' style="display:none"';return`<div class="b-icon b-icon-square${!r||t?"":` b-sch-foreground-${r}`}"${n}></div>`}return this.multiSelect?'<div class="b-icon b-icon-square"></div>':""}}}}changeShowEventColor(e){return!!e}updateShowEventColor(e){var r;this.element.classList.toggle("b-show-event-color",!!e),(r=this._picker)==null||r.element.classList.toggle("b-show-event-color",!!e)}changePicker(e,r){return e=super.changePicker(e,r),e==null||e.element.classList.toggle("b-show-event-color",!!this.showEventColor),e}get innerElements(){return[{class:"b-icon b-resource-icon b-icon-square b-hide-display",reference:"resourceIcon"},this.inputElement]}syncInputFieldValue(){var e,r;const t=this,{resourceIcon:n,lastResourceIconCls:a}=t,{classList:i}=n,s=(r=(e=t.selected)==null?void 0:e.eventColor)!=null?r:"";super.syncInputFieldValue(),n.style.color="",a&&i.remove(a),t.lastResourceIconCls=null,s?(y.isNamedColor(s)?(t.lastResourceIconCls=`b-sch-foreground-${s}`,i.add(t.lastResourceIconCls)):n.style.color=s,i.remove("b-hide-display")):i.add("b-hide-display")}};k.initClass(),k._$name="ResourceCombo";var P=/[^\w\d]/g,p=class extends L.mixin(z,V,X){static get $name(){return"EventEdit"}static get configurable(){return{triggerEvent:"eventdblclick",typeField:"eventType",eventRecord:null,readOnly:null,editorConfig:{type:"eventeditor",title:"L{EventEdit.Edit event}",closable:!0,localeClass:this,defaults:{localeClass:this},items:{nameField:{type:"text",label:"L{Name}",clearable:!0,name:"name",weight:100,required:!0},resourceField:{type:"resourcecombo",label:"L{Resource}",name:"resource",editable:!0,valueField:"id",displayField:"name",highlightExternalChange:!1,destroyStore:!0,weight:200},startDateField:{type:"date",clearable:!1,required:!0,label:"L{Start}",name:"startDate",validateDateOnly:!0,weight:300},startTimeField:{type:"time",clearable:!1,required:!0,name:"startDate",cls:"b-match-label",weight:400},endDateField:{type:"date",clearable:!1,required:!0,label:"L{End}",name:"endDate",validateDateOnly:!0,weight:500},endTimeField:{type:"time",clearable:!1,required:!0,name:"endDate",cls:"b-match-label",weight:600},colorField:{label:"L{SchedulerBase.color}",type:"eventColorField",name:"eventColor",weight:700}},bbar:{hideWhenEmpty:!0,defaults:{localeClass:this},items:{saveButton:{color:"b-blue",cls:"b-raised",text:"L{Save}",weight:100},deleteButton:{text:"L{Delete}",weight:200},cancelButton:{text:"L{Object.Cancel}",weight:300}}}},targetEventElement:null}}static get pluginConfig(){return{chain:["populateEventMenu","onEventEnterKey","editEvent"]}}construct(e,r){this.readOnly=e.readOnly,super.construct(e,r),e.ion({projectChange:"onChangeProject",readOnly:"onClientReadOnlyToggle",thisObj:this})}get scheduler(){return this.client}get project(){return this.client.project}get readOnly(){return this._editor?this.editor.readOnly:this._readOnly}updateReadOnly(e){super.updateReadOnly(e),this._editor&&(this.editor.readOnly=e)}onClientReadOnlyToggle({readOnly:e}){this.readOnly=e}get editor(){var e,r,t,n,a;const i=this,s={beforehide:"resetEditingContext",beforeshow:"onBeforeEditorShow",keydown:"onPopupKeyDown",thisObj:i};let{_editor:l}=i;if(l)return l;l=i._editor=b.create(i.getEditorConfig());const{startDateField:u,startTimeField:d,endDateField:c,endTimeField:g}=l.widgetMap;return!u&&d&&(d.keepDate=!0,d.label=i.L("Start"),d.flex="1 0 100%"),!c&&g&&(g.keepDate=!0,g.label=i.L("End"),g.flex="1 0 100%"),!l.floating&&!l.positioned&&(l.element.parentNode||i.client.add(l),delete s.beforehide,delete s.beforeshow,s.beforeToggleReveal="onBeforeEditorToggleReveal"),l.readOnly=i._readOnly,l.items.length===0&&console.warn("Event Editor configured without any `items`"),l.ion(s),i.scheduler.relayEvents(l,["beforeSetRecord"],"eventEdit"),Object.values(l.widgetMap).forEach(o=>{const h=o.ref||o.id;if(h&&!i[h])switch(i[h]=o,o.name){case"startDate":case"endDate":o.ion({change:"onDatesChange",thisObj:i});break}}),(e=i.onEditorConstructed)==null||e.call(i,l),(r=i.eventTypeField)==null||r.ion({change:"onEventTypeChange",thisObj:i}),(t=i.saveButton)==null||t.ion({click:"onSaveClick",thisObj:i}),(n=i.deleteButton)==null||n.ion({click:"onDeleteClick",thisObj:i}),(a=i.cancelButton)==null||a.ion({click:"onCancelClick",thisObj:i}),l}getEditorConfig(){const e=this,{cls:r,scheduler:t}=e,n=C.assign({owner:t,eventEditFeature:e,weekStartDay:e.weekStartDay,align:"b-t",id:`${t.id}-event-editor`,autoShow:!1,anchor:!0,scrollAction:"realign",constrainTo:globalThis,cls:r},e.editorConfig);return b.prototype.getRenderContext(n)[0]&&(n.floating=!1),n.floating===!1&&!n.positioned&&(n.collapsible={type:"overlay",direction:"right",autoClose:!1,tool:null,recollapseTool:null},n.collapsed=!0,n.hidden=n.anchor=!1,n.hide=function(){this.collapsible.toggleReveal(!1)}),!t.showEventColorPickers&&n.items.colorField&&(n.items.colorField.hidden=!0),n.onElementCreated=e.updateCSSVars.bind(this),n}updateCSSVars({element:e}){const r=new Date(2e3,12,31,23,55,55),t=f.format(r,this.dateFormat).replace(P,"").length,n=f.format(r,this.timeFormat).replace(P,"").length,a=t+n;e.style.setProperty("--date-time-length",`${a}em`),e.style.setProperty("--date-width-difference",`${(t-n)/2}em`)}async internalShowEditor(e,r,t=null){var n,a;const i=this,{scheduler:s}=i,{useInitialAnimation:l}=s,u=((n=t==null?void 0:t.target)==null?void 0:n.nodeType)===Element.ELEMENT_NODE?t.target:s.getElementFromEventRecord(e,r),d=e.isPartOfStore(s.eventStore);if(t=t!=null?t:{target:u,anchor:!0},t.target||!d||e.resources.length===0||e.isCreating){s.element.classList.add("b-eventeditor-editing"),i.resourceRecord=r;const{editor:c}=i;i.editingContext={eventRecord:e,resourceRecord:r,eventElement:u,editor:c,isPartOfStore:d},(a=super.internalShowEditor)==null||a.call(this,e,r,t),i.typeField&&i.toggleEventType(e.getValue(i.typeField)),i.loadRecord(e,r),c.collapsed?(await K.sleep(100),await c.collapsible.toggleReveal(!0),c.focus()):c.centered||!c.anchor||!c.floating?c.show():u&&(!e.isCreating||!l||l===!0||l==="fade-in")?(i.targetEventElement=u,c.showBy(t)):(c.show(),c.updateCentered(!0));const g=s.timeAxisViewModel.timeResolution;if(g.unit==="hour"||g.unit==="minute"){const o=`${g.increment}${g.unit}`;i.startTimeField&&(i.startTimeField.step=o),i.endTimeField&&(i.endTimeField.step=o)}i.detachListeners("changesWhileEditing"),s.eventStore.ion({change:i.onChangeWhileEditing,refresh:i.onChangeWhileEditing,thisObj:i,name:"changesWhileEditing"})}}onChangeWhileEditing(){const e=this;!e.editor.autoUpdateRecord&&!e.isFinalizingEventSave&&e.isEditing&&e.editingContext.isPartOfStore&&!e.eventRecord.isPartOfStore(e.scheduler.eventStore)&&e.onCancelClick()}onBeforeEditorShow(){super.onBeforeEditorShow(...arguments),this.scheduler.trigger("beforeEventEditShow",{eventEdit:this,...this.editingContext})}updateTargetEventElement(e,r){e==null||e.classList.add("b-editing"),r==null||r.classList.remove("b-editing")}editEvent(e,r,t=null,n=null){var a;const i=this,{client:s}=i,{simpleEventEdit:l}=s.features;if(i.isEditing&&i.resetEditingContext(),!(i.disabled||e.readOnly||e.isCreating&&(l!=null&&l.enabled)))return s.trigger("beforeEventEdit",{eventEdit:i,eventRecord:e,resourceRecord:r,eventElement:((a=s.getElementFromEventRecord)==null?void 0:a.call(s,e,r))||t})===!1?(s.element.classList.remove("b-eventeditor-editing"),!1):(n?(i.applyStmCapture(n),i.hasStmCapture=!0,n.transferred=!0):n!==!1&&!s.isCalendar&&!i.hasStmCapture&&i.captureStm(!0),i.doEditEvent(...arguments).then(u=>{if(!i.isDestroying&&!i.isEditing&&!s.isCalendar&&!i.rejectingStmTransaction)return u!==!1&&i.hasStmCapture?i.freeStm(!1):i.freeStm()}))}get isEditing(){const{_editor:e}=this;return!!(e!=null&&e.isVisible&&!(e.collapsed&&!e.revealed))}async doEditEvent(e,r,t=null){const n=this,{scheduler:a}=n,i=e.isCreating;if(r||(r=e.resource||n.resourceStore.getById(e.resourceId)),i&&q.prototype.normalize.call(e),t||i||e.resources.length===0)return n.internalShowEditor(e,r,t?{target:t}:null);await a.scrollResourceEventIntoView(r,e,{animate:!0,edgeOffset:0,extendTimeAxis:!1}),a.isDestroyed||(await n.internalShowEditor(e,r),a.isDestroyed||a.element.classList.remove("b-eventeditor-editing"))}loadRecord(e,r){this.loadingRecord=!0,this.internalLoadRecord(e,r),this.loadingRecord=!1}get eventRecord(){var e;return(e=this._editor)==null?void 0:e.record}internalLoadRecord(e,r){var t;const n=this,{eventStore:a}=n.client,{editor:i,resourceField:s}=n;if(n.resourceRecord=r,s&&((t=s.store)==null?void 0:t.masterStore)!==n.resourceStore&&(s.store=i.chainResourceStore()),i.record=e,s){const l=a.assignmentStore.getResourcesForEvent(e);i.assigningValues=!0,!e.isOccurrence&&!a.storage.includes(e,!0)&&r?n.resourceField.value=r.getValue(n.resourceField.valueField):n.assignmentStore&&(n.resourceField.value=l.map(u=>u.getValue(n.resourceField.valueField))),i.assigningValues=!1}super.internalLoadRecord(e,r)}toggleEventType(e){this.editor.element.dataset.eventType=e||"",this.editor.eachWidget(r=>{var t;(t=r.dataset)!=null&&t.eventType&&(r.hidden=r.dataset.eventType!==e)})}async finalizeEventSave(e,r,t,n){const a=this,{scheduler:i,assignmentStore:s}=a,l=!1;s.suspendAutoCommit(),i.suspendRefresh(),a.onBeforeSave(e),e.beginBatch(),a.updateRecord(e),e.endBatch(),e.isOccurrence?r&&e.set("resourceRecords",r):a.resourceField&&s.assignEventToResource(e,r,null,!0),e.isCreating=!1,l||await i.project.commitAsync(),s.resumeAutoCommit(),i.resumeRefresh(!0),l||(i.trigger("afterEventSave",{eventRecord:e}),a.onAfterSave(e)),t(l?!1:e)}save(){return new Promise((e,r)=>{var t;const n=this,{scheduler:a,eventRecord:i}=n;if(!i||!n.editor.isValid){e(!1);return}const{eventStore:s,values:l}=n,u=((t=n.resourceField)==null?void 0:t.records)||(n.resourceRecord?[n.resourceRecord]:[]);if(!n.scheduler.allowOverlap&&s){let{startDate:o,endDate:h}=l;if(h||("duration"in l?h=f.add(o,l.duration,l.durationUnit||i.durationUnit):"fullDuration"in l?h=f.add(o,l.fullDuration):h=i.endDate),u.some(A=>!s.isDateRangeAvailable(o,h,i,A))){e(!1);return}}const d={finalize(o){try{o!==!1?n.finalizeEventSave(i,u,e,r):e(!1)}catch(h){r(h)}}},c=a.trigger("beforeEventSave",{eventRecord:i,resourceRecords:u,values:l,context:d});function g(o,h,v){o===!1?e(!1):(n.onRecurrableEventBeforeSave({eventRecord:h,context:v}),v.async||v.finalize())}C.isPromise(c)?c.then(o=>g(o,i,d)):g(c,i,d)})}deleteEvent(){return this.detachListeners("changesWhileEditing"),new Promise((e,r)=>{const t=this,{eventRecord:n,editor:a}=t;t.scheduler.removeEvents([n],i=>{i&&a.containsFocus&&a.revertFocus(),e(i)},a)})}onChangeProject(){this.resourceField&&(this.resourceField.store={})}get eventStore(){return this.scheduler.project.eventStore}get resourceStore(){return this.scheduler.project.resourceStore}get assignmentStore(){return this.scheduler.project.assignmentStore}onActivateEditor({eventRecord:e,resourceRecord:r,eventElement:t}){this.editEvent(e,r,t)}onDragCreateEnd({eventRecord:e,resourceRecord:r,proxyElement:t,stmCapture:n}){this.editEvent(e,r,t,n)}onEventEnterKey({assignmentRecord:e,eventRecord:r,target:t}){const{client:n}=this,a=t[t.matches(n.eventSelector)?"querySelector":"closest"](n.eventInnerSelector);e?this.editEvent(r,e.resource,a):r&&this.editEvent(r,r.resource,a)}onEventTypeChange({value:e}){this.toggleEventType(e)}populateEventMenu({eventRecord:e,resourceRecord:r,items:t}){!this.scheduler.readOnly&&!this.disabled&&(t.editEvent={text:"L{EventEdit.Edit event}",localeClass:this,icon:"b-icon b-icon-edit",weight:100,disabled:e.readOnly,onItem:()=>{this.editEvent(e,r)}})}onBeforeEditorToggleReveal({reveal:e}){e&&this.editor.setupEditorButtons(),this[e?"onBeforeEditorShow":"resetEditingContext"]()}async resetEditingContext(){const e=this;e.detachListeners("changesWhileEditing"),super.resetEditingContext(),e.hasStmCapture&&!e.isDeletingEvent&&!e.isCancelingEdit&&await e.freeStm(!1),e.resourceRecord=null}finalizeStmCapture(e){return this.freeStm(!e)}updateLocalization(){this._editor&&this.updateCSSVars({element:this._editor.element}),super.updateLocalization(...arguments)}};p._$name="EventEdit",x.registerFeature(p,!0,"Scheduler"),x.registerFeature(p,!1,["SchedulerPro","ResourceHistogram"]),p.initClass();var O=class extends ee{static get $name(){return"ResourceFilter"}static get type(){return"resourcefilter"}static get delayable(){return{applyFilters:"raf"}}static get configurable(){return{eventStore:null,multiSelect:!0,toggleAllIfCtrlPressed:!0,collapsibleGroups:!0,itemTpl:e=>ie.encodeHtml(e.name||""),masterFilter:e=>!0,filterResources:null}}itemIconTpl(e,r){const{eventColor:t}=e,n=y.isNamedColor(t)?` b-sch-foreground-${t}`:"",a=!n&&t?` style="color:${t}"`:"";return this.multiSelect?`<div class="b-selected-icon b-icon${n}"${a}></div>`:""}changeStore(e){if(this.eventStore)return super.changeStore(...arguments);this._storeConfig=e}changeEventStore(e){return this.getConfig("store"),e}updateEventStore(e){const r=this,t=r._storeConfig||{},{resourceStore:n}=e,a=r.store=n.chain(r.masterFilter,null,{...t,syncOrder:!0}),i={change:"onStoreChange",thisObj:r};a.un(i),n.ion(i),n.count?r.initFilter():n.project.ion({name:"project",refresh:"initFilter",thisObj:r})}changeMasterFilter(e){const r=this;if(!r.filterResources)return function(t){return r.callback(e,r,[t])}}initFilter(){var e;const r=this;if(r.eventStore.resourceStore.count){const{selected:t}=r;t.count||(((e=r.initialConfig.selected)==null?void 0:e.length)===0?r.onInternalSelectionChange({source:t,added:[],removed:[]}):t.add(r.store.allRecords.filter(n=>!n.isGroupHeader))),r.detachListeners("project")}}onStoreRefresh({source:e,action:r}){if(r==="filter"&&this.eventStoreFilter){const{eventStoreFilter:t}=this,{disabled:n}=t,a=!e.isFiltered&&this.allSelected;a!==n&&(t.disabled=a,this.applyFilters())}super.onStoreRefresh(...arguments)}onInternalSelectionChange({source:e,added:r,removed:t}){const n=this,a=!n.store.isFiltered&&n.allSelected;super.onInternalSelectionChange(...arguments);let i=!1;if(n.eventStoreFilter||(n.eventStoreFilter=n.eventStore.addFilter({id:`${n.id}-filter-instance`,filterBy:s=>!s.resource||n.selected.includes(s.resources),disabled:a},(r==null?void 0:r.length)===n.store.count),i=!0),n.filterResources&&!n.resourceStoreFilter&&(n.resourceStoreFilter=n.eventStore.resourceStore.addFilter({id:`${n.id}-filter-instance`,filterBy:s=>n.selected.includes(s),disabled:a},(r==null?void 0:r.length)===n.store.count),i=!0),!i&&(n.eventStoreFilter.disabled=a,n.resourceStoreFilter&&(n.resourceStoreFilter.disabled=a),n.applyFilters(),n.eventListeners.change)){const s=e.values,l=s.concat(t);U.remove(l,...r),n.triggerFieldChange({value:s,oldValue:l})}}get value(){return this.selected.values}applyFilters(){this.eventStore.filter(),this.filterResources&&this.eventStore.resourceStore.filter()}doDestroy(){var e;(e=this.store)==null||e.destroy(),super.doDestroy()}};O.initClass(),O._$name="ResourceFilter";var B=class M extends N{static get $name(){return"SchedulerDatePicker"}static get type(){return"datepicker"}static get configurable(){return{showEvents:null,eventStore:null,eventFilter:{$config:"lazy",value:null}}}construct(r){"events"in r&&(r={...r,showEvents:r.events},delete r.events,j.deprecate(j.calendar?"Calendar":"Scheduler","6.0.0","DatePicker#events should be configured as showEvents")),super.construct(r)}changeEventFilter(r){if(typeof r=="string"){const{handler:t,thisObj:n}=this.resolveCallback(r);r=t.bind(n)}return r}doRefresh(){if(this.isVisible||!this.showEvents)return this.refreshEventsMap(),super.doRefresh(...arguments);this.whenVisible("doRefresh")}updateShowEvents(r,t){const n=this,{classList:a}=n.contentElement;let{eventStore:i}=n;if(n.requestAnimationFrame(()=>{var s;n.element.classList.toggle("b-datepicker-with-events",!!r),(s=n.owner)==null||s.element.classList.toggle("b-datepicker-with-events",!!r),r&&a.add(`b-show-events-${r}`),a.remove(`b-show-events-${t}`)}),r){if(!i){const s=n.up(l=>l.eventStore);if(s)i=s.eventStore;else throw new Error("DatePicker configured with events but no eventStore")}}else n.eventsMap=null;n.isConfiguring||(n.updateEventStore(i),n.doRefresh())}refreshEventsMap(){const r=this;r.showEvents&&(r.eventsMap=r.eventStore.getEventCounts({startDate:r.startDate,endDate:r.endDate,dateMap:r.eventsMap,filter:r.eventFilter}))}updateEventStore(r){var t;r.findListener("change","refresh",this)===-1&&((t=r==null?void 0:r[this.showEvents?"on":"un"])==null||t.call(r,{change:"refresh",thisObj:this}))}cellRenderer({cell:r,date:t}){var n,a;const{showEvents:i}=this,s=(a=(n=this.eventCounts)==null?void 0:n.get)==null?void 0:a.call(n,f.makeKey(t)),l=i==="count";delete r.dataset.btip,s&&(!l&&this.eventCountTip&&(r.dataset.btip=this.L("L{ResourceInfoColumn.eventCountText}",s)),y.createElement({dataset:{count:s},class:{[l?"b-cell-events-badge":"b-icon b-icon-circle"]:1,[M.getEventCountClass(s)]:1},parent:r,[l?"text":""]:s}))}static getEventCountClass(r){return r?r<4?"b-datepicker-1-to-3-events":r<7?"b-datepicker-4-to-6-events":"b-calendar-7-or-more-events":""}static setupClass(r){r.replaceType=!0,super.setupClass(r)}};B.initClass(),B._$name="SchedulerDatePicker";export{L as EditBase,p as EventEdit,R as EventEditor,w as RecurrenceCombo,T as RecurrenceEditor,S as RecurrenceLegend,_ as RecurrenceLegendButton,V as RecurringEventEdit_default,k as ResourceCombo,O as ResourceFilter,B as SchedulerDatePicker};
//# sourceMappingURL=chunk-SELTHR7K.js.map
