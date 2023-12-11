/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Column as s,ColumnStore as f}from"./chunk-GGOYEX2W.js";import{DateHelper as o,__publicField as a}from"./chunk-MZVS5JQA.js";var e=class extends s{static get defaults(){return{format:"L",step:1,minWidth:85,filterType:"date"}}defaultRenderer({value:t}){return t?this.formatValue(t):""}groupRenderer({cellElement:t,groupRowFor:r}){t.innerHTML=this.formatValue(r)}formatValue(t){return typeof t=="string"&&(t=o.parse(t,this.format||void 0)),o.format(t,this.format||void 0)}set format(t){const{editor:r}=this.data;this.set("format",t),r&&(r.format=t)}get format(){return this.get("format")}get defaultEditor(){const t=this,{min:r,max:i,step:m,format:n}=t;return{name:t.field,type:"date",calendarContainerCls:"b-grid-cell-editor-related",weekStartDay:t.grid.weekStartDay,format:n,max:i,min:r,step:m}}};a(e,"$name","DateColumn"),a(e,"type","date"),a(e,"fieldType","date"),a(e,"fields",["format","pickerFormat","step","min","max"]),f.registerColumnType(e,!0),e.exposeProperties(),e._$name="DateColumn";export{e as DateColumn};
//# sourceMappingURL=chunk-UHVK6Q3O.js.map
