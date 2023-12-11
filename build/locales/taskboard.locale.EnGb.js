/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,r){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],r);else if(typeof module=="object"&&module.exports)module.exports=r();else{var u=r(),p=i?exports:c;for(var m in u)p[m]=u[m]}})(typeof self<"u"?self:void 0,()=>{var c={},r={exports:c},i=Object.defineProperty,u=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,m=Object.prototype.hasOwnProperty,g=(o,a,e)=>a in o?i(o,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[a]=e,v=(o,a)=>{for(var e in a)i(o,e,{get:a[e],enumerable:!0})},y=(o,a,e,l)=>{if(a&&typeof a=="object"||typeof a=="function")for(let t of p(a))!m.call(o,t)&&t!==e&&i(o,t,{get:()=>a[t],enumerable:!(l=u(a,t))||l.enumerable});return o},k=o=>y(i({},"__esModule",{value:!0}),o),w=(o,a,e)=>(g(o,typeof a!="symbol"?a+"":a,e),e),b={};v(b,{default:()=>N}),r.exports=k(b);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,f=class d{static mergeLocales(...a){let e={};return a.forEach(l=>{Object.keys(l).forEach(t=>{typeof l[t]=="object"?e[t]={...e[t],...l[t]}:e[t]=l[t]})}),e}static trimLocale(a,e){let l=(t,s)=>{a[t]&&(s?a[t][s]&&delete a[t][s]:delete a[t])};Object.keys(e).forEach(t=>{Object.keys(e[t]).length>0?Object.keys(e[t]).forEach(s=>l(t,s)):l(t)})}static normalizeLocale(a,e){if(!a)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof a=="string"){if(!e)throw new Error('"config" parameter can not be empty');e.locale?e.name=a||e.name:e.localeName=a}else e=a;let l={};if(e.name||e.locale)l=Object.assign({localeName:e.name},e.locale),e.desc&&(l.localeDesc=e.desc),e.code&&(l.localeCode=e.code),e.path&&(l.localePath=e.path);else{if(!e.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},e)}for(let t of["name","desc","code","path"])l[t]&&delete l[t];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(a){n.bryntum.locales=a}static get localeName(){return n.bryntum.locale||"En"}static set localeName(a){n.bryntum.locale=a||d.localeName}static get locale(){return d.localeName&&this.locales[d.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(a,e){let{locales:l}=n.bryntum,t=d.normalizeLocale(a,e),{localeName:s}=t;return!l[s]||e===!0?l[s]=t:l[s]=this.mergeLocales(l[s]||{},t||{}),l[s]}};w(f,"skipLocaleIntegrityCheck",!1);var h=f;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},h._$name="LocaleHelper";var T={localeName:"EnGb",localeDesc:"English (GB)",localeCode:"en-GB",Object:{Yes:"Yes",No:"No",Cancel:"Cancel",Ok:"OK",Week:"Week",None:"None"},ColorPicker:{noColor:"No colour"},Combo:{noResults:"No results",recordNotCommitted:"Record could not be added",addNewValue:o=>`Add ${o}`},FilePicker:{file:"File"},Field:{badInput:"Invalid field value",patternMismatch:"Value should match a specific pattern",rangeOverflow:o=>`Value must be less than or equal to ${o.max}`,rangeUnderflow:o=>`Value must be greater than or equal to ${o.min}`,stepMismatch:"Value should fit the step",tooLong:"Value should be shorter",tooShort:"Value should be longer",typeMismatch:"Value is required to be in a special format",valueMissing:"This field is required",invalidValue:"Invalid field value",minimumValueViolation:"Minimum value violation",maximumValueViolation:"Maximum value violation",fieldRequired:"This field is required",validateFilter:"Value must be selected from the list"},DateField:{invalidDate:"Invalid date input"},DatePicker:{gotoPrevYear:"Go to previous year",gotoPrevMonth:"Go to previous month",gotoNextMonth:"Go to next month",gotoNextYear:"Go to next year"},NumberFormat:{locale:"en-GB",currency:"GBP"},DurationField:{invalidUnit:"Invalid unit"},TimeField:{invalidTime:"Invalid time input"},TimePicker:{hour:"Hour",minute:"Minute",second:"Second"},List:{loading:"Loading...",selectAll:"Select All"},GridBase:{loadMask:"Loading...",syncMask:"Saving changes, please wait..."},PagingToolbar:{firstPage:"Go to first page",prevPage:"Go to previous page",page:"Page",nextPage:"Go to next page",lastPage:"Go to last page",reload:"Reload current page",noRecords:"No records to display",pageCountTemplate:o=>`of ${o.lastPage}`,summaryTemplate:o=>`Displaying records ${o.start} - ${o.end} of ${o.allCount}`},PanelCollapser:{Collapse:"Collapse",Expand:"Expand"},Popup:{close:"Close Popup"},UndoRedo:{Undo:"Undo",Redo:"Redo",UndoLastAction:"Undo last action",RedoLastAction:"Redo last undone action",NoActions:"No items in the undo queue"},FieldFilterPicker:{equals:"equals",doesNotEqual:"does not equal",isEmpty:"empty",isNotEmpty:"not empty",contains:"contains",doesNotContain:"does not contain",startsWith:"starts with",endsWith:"ends with",isOneOf:"one of",isNotOneOf:"not one of",isGreaterThan:"greater than",isLessThan:"less than",isGreaterThanOrEqualTo:"greater or equals",isLessThanOrEqualTo:"less or equals",isBetween:"between",isNotBetween:"not between",isBefore:"before",isAfter:"after",isToday:"today",isTomorrow:"tomorrow",isYesterday:"yesterday",isThisWeek:"this week",isNextWeek:"next week",isLastWeek:"last week",isThisMonth:"this month",isNextMonth:"next month",isLastMonth:"last month",isThisYear:"this year",isNextYear:"next year",isLastYear:"last year",isYearToDate:"year to date",isTrue:"true",isFalse:"false",selectAProperty:"Select property",selectAnOperator:"Select operator",caseSensitive:"Case-sensitive",and:"and",dateFormat:"D/M/YY",selectValue:"Select value",selectOneOrMoreValues:"Select value(s)",enterAValue:"Enter value",enterANumber:"Enter number",selectADate:"Select date",selectATime:"Select time"},FieldFilterPickerGroup:{addFilter:"Add filter"},DateHelper:{locale:"en-GB",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"millisecond",plural:"ms",abbrev:"ms"},{single:"second",plural:"seconds",abbrev:"s"},{single:"minute",plural:"minutes",abbrev:"min"},{single:"hour",plural:"hours",abbrev:"h"},{single:"day",plural:"days",abbrev:"d"},{single:"week",plural:"weeks",abbrev:"w"},{single:"month",plural:"months",abbrev:"mon"},{single:"quarter",plural:"quarters",abbrev:"q"},{single:"year",plural:"years",abbrev:"yr"},{single:"decade",plural:"decades",abbrev:"dec"}],unitAbbreviations:[["mil"],["s","sec"],["m","min"],["h","hr"],["d"],["w","wk"],["mo","mon","mnt"],["q","quar","qrt"],["y","yr"],["dec"]],parsers:{L:"DD/MM/YYYY",LT:"HH:mm A",LTS:"HH:mm:ss A"},ordinalSuffix:o=>{let a=["11","12","13"].find(l=>o.endsWith(l)),e="th";if(!a){let l=o[o.length-1];e={1:"st",2:"nd",3:"rd"}[l]||"th"}return o+e}}},C=h.publishLocale(T),L={localeName:"EnGb",localeDesc:"English (GB)",localeCode:"en-GB",GridBase:{loadFailedMessage:"Data loading failed!",syncFailedMessage:"Data synchronisation failed!"},CrudManagerView:{serverResponseLabel:"Server response:"},TaskBoard:{column:"column",columns:"columns",Columns:"Columns",swimlane:"swimlane",swimlanes:"swimlanes",Swimlanes:"Swimlanes",task:"task",tasks:"tasks",addTask:"Add L{TaskBoard.task}",cancel:"Cancel",changeColumn:"Change L{TaskBoard.column}",changeSwimlane:"Change L{TaskBoard.swimlane}",collapse:o=>`Collapse ${o}`,color:"Color",description:"Description",editTask:"Edit L{TaskBoard.task}",expand:o=>`Expand ${o}`,filterColumns:"Filter L{TaskBoard.columns}",filterSwimlanes:"Filter L{TaskBoard.swimlanes}",filterTasks:"Filter L{TaskBoard.tasks}",moveColumnLeft:"Move L{TaskBoard.column} left",moveColumnRight:"Move L{TaskBoard.column} right",name:"Name",newTaskName:"New L{TaskBoard.task}",removeTask:"Remove L{TaskBoard.task}",removeTasks:"Remove L{TaskBoard.tasks}",resources:"Resources",save:"Save",scrollToColumn:"Scroll to L{TaskBoard.column}",scrollToSwimlane:"Scroll to L{TaskBoard.swimlane}",zoom:"Zoom"},TodoListField:{add:"Add",newTodo:"New todo"},UndoRedo:{UndoLastAction:"Undo",RedoLastAction:"Redo"}},N=h.publishLocale(L);if(typeof r.exports=="object"&&typeof c=="object"){var O=(o,a,e,l)=>{if(a&&typeof a=="object"||typeof a=="function")for(let t of Object.getOwnPropertyNames(a))!Object.prototype.hasOwnProperty.call(o,t)&&t!==e&&Object.defineProperty(o,t,{get:()=>a[t],enumerable:!(l=Object.getOwnPropertyDescriptor(a,t))||l.enumerable});return o};r.exports=O(r.exports,c)}return r.exports});