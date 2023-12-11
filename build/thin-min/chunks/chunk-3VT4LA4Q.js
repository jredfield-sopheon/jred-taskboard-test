/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Combo as r}from"./chunk-MZVS5JQA.js";var o=class extends r{static get $name(){return"ProjectCombo"}static get type(){return"projectcombo"}static get configurable(){return{project:null,displayField:"title",valueField:"url",highlightExternalChange:!1,editable:!1}}updateProject(t){var e;(e=t.transport.load)!=null&&e.url&&(this.value=t.transport.load.url)}onChange({value:t,userAction:e}){e&&this.project&&(this.project.transport.load.url=t,this.project.load())}};o.initClass(),o._$name="ProjectCombo";export{o as ProjectCombo};
//# sourceMappingURL=chunk-3VT4LA4Q.js.map
