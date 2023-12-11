/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{EventHelper as _,ObjectHelper as j,Objects as k,PickerField as T,StringHelper as H,VersionHelper as V,__publicField as F}from"./chunk-MZVS5JQA.js";var P=class{static convertFromObject(n,e={}){k.assignIf(e,{rootName:"root",elementName:"element",includeHeader:!0,rootElementForArray:!0});const{rootName:t,elementName:i,includeHeader:r,rootElementForArray:a}=e;let{xmlns:o}=e;o=o?` xmlns="${o}"`:"";const E=r?'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>':"",h=f=>{const s=[];for(const l in f){const u=f[l];if(Array.isArray(u)){a&&s.push(`<${l}>`);for(const p of u)i.length?s.push(`<${i}>`):s.push(`<${l}>`),s.push(h(p)),i.length?s.push(`</${i}>`):s.push(`</${l}>`);a&&s.push(`</${l}>`)}else k.isObject(u)?s.push(`<${l}>${h(u)}</${l}>`):u==null?s.push(`<${l}/>`):s.push(`<${l}>${H.encodeHtml(u)}</${l}>`)}return s.join("")};return`${E}<${t}${o}>${h(n)}</${t}>`}};P._$name="XMLHelper";var w=class{constructor(){this.random100=[46,2,36,46,54,59,18,20,71,55,88,98,13,61,61,40,2,15,3,32,51,45,64,25,81,85,54,13,57,49,64,22,81,94,0,62,17,7,11,2,33,99,85,26,83,83,96,26,20,89,91,38,26,13,11,79,32,30,5,51,70,7,5,56,58,77,37,89,40,80,78,59,26,36,8,51,60,23,86,5,11,96,64,94,87,64,4,78,17,85,35,0,90,86,23,55,53,9,35,59,29,2,64,42,8,49,43,73,6,53,38,9,39,31,32,40,49,13,78,68,20,99,24,78,35,91,73,46,67,76,89,69,30,69,25,3,4,55,1,65,66,76,83,19,67,1,95,24,54,45,56,40,67,92,72,4,69,8,47,50,27,2,38,9,14,83,12,14,62,95,22,47,35,18,38,14,86,64,68,61,52,69,39,93,20,73,32,52,74,6,56,68,99,29,24,92,40,67,6,72,31,41,91,53,80,55,33,97,97,99,18,20,5,27,82,84,61,78,27,67,7,42,75,95,91,25,63,21,70,36,46,0,1,45,84,6,86,15,10,62,96,94,10,23,93,83,94,47,5,29,29,52,51,37,77,96,43,72,43,14,54,14,72,52,4,39,15,26,68,28,25,76,60,50,22,40,72,74,68,58,8,48,40,62,52,24,9,26,47,44,49,96,7,77,90,45,76,47,5,86,1,36,18,42,19,90,34,23,70,32,69,79,0,99,57,80,72,21,19,72,85,68,4,40,86,62,0,63,4,11,69,31,78,31,21,78,29,84,13,53,57,10,26,50,24,30,90,42,51,96,93,21,99,23,81,0,89,43,86,63,93,19,54,71,92,36,4,95,37,99,60,29,23,50,68,95,57,95,77,53,99,78,75,12,92,47,23,14,0,41,98,11,34,64,26,90,50,23,38,31,74,76,16,76,66,23,22,72,48,50,20,36,37,58,5,43,49,64,81,30,8,21,98,75,60,17,50,42,27,38,90,74,45,68,67,27,31,15,58,76,41,99,23,98,53,98,56,19,79,2,4,38,96,24,65,51,43,42,41,60,46,7,90,65,3,27,63,99,51,44,86,1,54,40,15,74,3,81,51,63,87,79,84,72,22,38,96,95,33,41,21,99,21,69,7,49,40,52,41,6,91,19,76,40,54,17,33,11,11,0,1,32,94,33,13,18,45,7,85,61,42,54,45,72,78,96,17,9,80,87,41,96,66,0,8,59,18,21,2,28,64,75,97,32,80,86,97,97,55,2,73,75,11,89,67,58,70,76,12,46,64,17,22,97,25,35,93,57,82,46,57,61,31,74,27,4,32,85,53,86,53,53,42,5,28,50,65,63,70,61,73,37,13,80,7,34,22,3,26,6,62,78,12,56,87,41,58,64,31,27,45,35,18,66,62,43,89,69,94,93,33,74,2,43,85,37,82,41,74,9,15,44,33,42,65,19,1,49,78,12,29,9,78,7,55,12,45,40,33,16,86,14,52,16,73,76,0,98,75,91,78,46,99,95,90,69,78,45,62,55,37,88,49,77,27,83,38,73,39,1,75,40,65,83,54,95,7,73,4,30,26,36,89,21,5,95,11,14,87,45,36,21,77,55,5,66,51,98,48,62,74,58,23,82,30,28,19,53,89,76,98,8,34,70,28,54,16,52,35,93,54,54,72,49,18,93,72,90,71,73,15,60,38,80,76,53,70,39,69,25,5,31,61,46,6,54,34,31,52,33,36,79,76,44,29,28,38,1,66,2,90,91,1,76,78,31,55,37,71,2,3,38,85,0,95,42,2,39,57,87,61,77,98,2,24,80,48,27,47,71,15,7,49,60,86,3,2,29,38,54,36,59,83,27,47,9,36,42,8,73,85,9,16,73,60,39,12,43,25,23,29,28,47,40,77,20,89,22,30,41,59,96,19,56,20,76,73,39,46,72,40,47,37,52,29,79,37,39,50,41,87,66,17,75,31,45,26,88,70,11,90,40,74,9,32,65,72,61,6,93,54,15,84,22,99,47,10,96,4,84,19,85,73,45,25,16,8,94,99,39,28,26,68,87,48,1,65,86,46,86,7,60,82,45,75,38,56,41,35,30,86,91,97,85,45,5,14,69,85,96,37,18,26,16,38,16,1,44,94,85,58,60,20,5,47,52,41,50,71,43,42,67,64,38,65,83,99,78,96,33,20,98,24,6,2,25,16,16,44,63,24,68,56,49,91,15,59,99,27,43,34,28,36,45,1,10,19,54,26,75,17,88,96,63,24,71,93,72,97,66,87,18,86],this.randomCache={},this.rndIndex=0}nextRandom(n){const{randomCache:e}=this;let t;return e[n]?t=e[n]:(t=this.random100.filter(i=>i<n),e[n]=t),t[this.rndIndex++%t.length]}reset(){this.rndIndex=0}fromArray(n){return n[this.nextRandom(n.length)]}randomArray(n,e){const t=[],i=this.nextRandom(e+1),r={};for(let a=0,o=this.nextRandom(n.length);a<i;a++){for(;r[o];)o=this.nextRandom(n.length);r[o]=!0,t.push(n[o])}return t}};w._$name="RandomGenerator";var K=0,I=new WeakMap,M=(...n)=>n.map(e=>{let t;return e&&typeof e=="object"||typeof e=="function"?(t=I.get(e),t===void 0&&(t=++K,I.set(e,t))):t=String(e),t}).join("-"),c=n=>{const e=new Map;return(...t)=>{const i=M(t);let r=e.get(i);return r===void 0&&(r=n(...t),e.set(i,r)),r}},d=n=>{const e=new Map,t=s=>s[0],i=s=>s[1],r=(s,l)=>t(s).push(l),a=(s,l)=>i(s).push(l),o=(s,l)=>i(s).some(u=>j.isEqual(u,l)),E=()=>[[],[]],h=s=>!i(s).length&&!t(s).length,f=s=>{let l=e.get(s);return l===void 0&&(l=E(),e.set(s,l)),l};return(s,l)=>{const u=f(s);h(u)?(r(u,l),n(s,p=>{o(u,p)||(a(u,p),t(u).forEach(S=>S(p)))})):(r(u,l),i(u).forEach(p=>l(p)))}},C=Symbol("success"),L=Symbol("failure"),g=(n,e)=>[C,n,e],x=n=>[L,n],b=n=>n.length&&n[0]===C,m=n=>typeof n=="function"&&!n.length?n():n,y=c(n=>d((e,t)=>t(g(n,e)))),N=c(n=>d((e,t)=>{const i=Math.min(n.length,e.length),r=e.substr(0,i),a=e.substr(i);t(r===n?g(r,a):x(a))})),v=(n,e)=>(t,i)=>m(n)(t,r=>{if(b(r)){const[,a,o]=r;e(a)(o,i)}else i(r)}),W=c((...n)=>{const e=c((t,i)=>d(v(t,r=>v(i,a=>y([].concat(r,a))))));return n.reduce(e,y([]))}),z=c((...n)=>d((e,t)=>n.forEach(i=>m(i)(e,t)))),q=c(n=>(e,t)=>{const i=new RegExp(`^${n}`),r=i.exec(e);if(r){const a=r[0],o=e.substr(a.length);t(g(a,o))}else t(x(e))}),U=c((n,e)=>v(n,(...t)=>y(e(...[].concat.apply([],t))))),R=(n,e)=>{const t=[];return n(e,i=>{if(b(i)){const[,,r]=i;r===""&&t.push(i)}}),t},D=n=>(e,t)=>t?m(n)(e,t):R(m(n),e),G={memo:c,memoCps:d,success:g,failure:x,isSuccess:b,resolveParser:m,succeed:y,string:N,bind:v,seq:W,alt:z,regexp:q,red:U,runParser:R,defineParser:D},$=class O extends T{static get configurable(){return{picker:{type:"widget",tag:"textarea",cls:"b-textareapickerfield-picker",scrollAction:"realign",align:{align:"t-b",axisLock:!0},autoShow:!1},triggers:{expand:{cls:"b-icon-picker",handler:"onTriggerClick"}},resize:"none",inputType:null}}startConfigure(e){typeof e.inline=="boolean"&&V.deprecate("Core","6.0.0","TextAreaPickerField.inline config is no longer supported"),super.startConfigure(e)}get inputElement(){const e=super.inputElement;return e.readOnly="readonly",e.reference="displayElement",this.ariaElement="displayElement",e}get focusElement(){var e;return(e=this._picker)!=null&&e.isVisible?this.input:this.displayElement}get needsInputSync(){var e;return this.displayElement[this.inputValueAttr]!==String((e=this.inputValue)!=null?e:"")}showPicker(){const e=this,{picker:t}=e;e.inline||(t.width=e.pickerWidth||e[e.pickerAlignElement].offsetWidth,super.showPicker(!0))}focusPicker(){this.input.focus()}onPickerKeyDown(e){const t=this,i=t.input;switch(e.key.trim()||e.code){case"Escape":t.picker.hide();return;case"Enter":e.ctrlKey&&(t.syncInputFieldValue(),t.picker.hide());break}t.input=t.displayElement;const r=super.onPickerKeyDown(e);return t.input=i,r}syncInputFieldValue(e){this.displayElement&&(this.displayElement.value=this.inputValue),super.syncInputFieldValue(e)}changeValue(e){return e==null?"":e}changePicker(e,t){var i;const r=this,a=r.pickerWidth||(e==null?void 0:e.width);if(e=O.reconfigure(t,e?k.merge({owner:r,forElement:r[r.pickerAlignElement],align:{matchSize:a==null,anchor:r.overlayAnchor,target:r[r.pickerAlignElement]},id:r.id+"-input",style:{resize:r.resize},html:(i=r.value)!=null?i:""},e):null,r),e){const o=r.input=e.element;r.inputListenerRemover=_.on({element:o,thisObj:r,focus:"internalOnInputFocus",change:"internalOnChange",input:"internalOnInput",keydown:"internalOnKeyEvent",keypress:"internalOnKeyEvent",keyup:"internalOnKeyEvent"})}return e}};F($,"$name","TextAreaPickerField"),F($,"type","textareapickerfield");var A=$;A.initClass(),A._$name="TextAreaPickerField";export{G as Parser_default,w as RandomGenerator,A as TextAreaPickerField,P as XMLHelper};
//# sourceMappingURL=chunk-6MQ7MMXD.js.map
