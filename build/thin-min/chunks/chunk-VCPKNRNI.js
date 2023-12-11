/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Base as g,ObjectHelper as n,StringHelper as i,__publicField as o}from"./chunk-MZVS5JQA.js";var d=u=>{var r;return r=class extends(u||g){changeCssVarPrefix(e){return n.assertString(e,"prefix"),e&&!e.endsWith("-")&&(e=e+"-"),e||""}changeCss(e){n.assertObject(e,"css");const t=this;if(!globalThis.Proxy)throw new Error("Proxy not supported");const l=new Proxy({},{get(m,a){var s;return(s=getComputedStyle(t.element||document.documentElement).getPropertyValue(`--${t.cssVarPrefix}${i.hyphenate(a)}`))==null?void 0:s.trim()},set(m,a,s){return(t.element||document.documentElement).style.setProperty(`--${t.cssVarPrefix}${i.hyphenate(a)}`,s),!0}});return e&&(t._element?n.assign(l,e):t.$initialCSS=e),l}updateElement(e,...t){super.updateElement(e,...t),this.$initialCSS&&n.assign(this.css,this.$initialCSS)}get widgetClass(){}},o(r,"$name","Styleable"),o(r,"configurable",{cssVarPrefix:"",css:{}}),r};export{d as Styleable_default};
//# sourceMappingURL=chunk-VCPKNRNI.js.map
