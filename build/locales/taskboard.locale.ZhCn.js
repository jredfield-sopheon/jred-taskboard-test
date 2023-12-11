/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,s){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],s);else if(typeof module=="object"&&module.exports)module.exports=s();else{var d=s(),p=i?exports:c;for(var u in d)p[u]=d[u]}})(typeof self<"u"?self:void 0,()=>{var c={},s={exports:c},i=Object.defineProperty,d=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,y=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,g=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},v=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of p(e))!u.call(o,t)&&t!==a&&i(o,t,{get:()=>e[t],enumerable:!(l=d(e,t))||l.enumerable});return o},k=o=>v(i({},"__esModule",{value:!0}),o),T=(o,e,a)=>(y(o,typeof e!="symbol"?e+"":e,a),a),f={};g(f,{default:()=>w}),s.exports=k(f);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,h=class m{static mergeLocales(...e){let a={};return e.forEach(l=>{Object.keys(l).forEach(t=>{typeof l[t]=="object"?a[t]={...a[t],...l[t]}:a[t]=l[t]})}),a}static trimLocale(e,a){let l=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(r=>l(t,r)):l(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let l={};if(a.name||a.locale)l=Object.assign({localeName:a.name},a.locale),a.desc&&(l.localeDesc=a.desc),a.code&&(l.localeCode=a.code),a.path&&(l.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},a)}for(let t of["name","desc","code","path"])l[t]&&delete l[t];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(e){n.bryntum.locales=e}static get localeName(){return n.bryntum.locale||"En"}static set localeName(e){n.bryntum.locale=e||m.localeName}static get locale(){return m.localeName&&this.locales[m.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:l}=n.bryntum,t=m.normalizeLocale(e,a),{localeName:r}=t;return!l[r]||a===!0?l[r]=t:l[r]=this.mergeLocales(l[r]||{},t||{}),l[r]}};T(h,"skipLocaleIntegrityCheck",!1);var b=h;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},b._$name="LocaleHelper";var L={localeName:"ZhCn",localeDesc:"中文（中国）",localeCode:"zh-CN",Object:{Yes:"是",No:"否",Cancel:"取消",Ok:"好",Week:"周",None:"无"},ColorPicker:{noColor:"无色"},Combo:{noResults:"无结果",recordNotCommitted:"无法添加记录",addNewValue:o=>`添加 ${o}`},FilePicker:{file:"文件"},Field:{badInput:"字段值无效",patternMismatch:"值应与特定模式相匹配",rangeOverflow:o=>`值必须小于或等于 ${o.max}`,rangeUnderflow:o=>`值必须大于或等于 ${o.min}`,stepMismatch:"值应符合步骤",tooLong:"值应更短",tooShort:"值应更长",typeMismatch:"值要采用特殊格式",valueMissing:"该字段为必填",invalidValue:"字段值无效",minimumValueViolation:"不符合最小值限制",maximumValueViolation:"不符合最大值限制",fieldRequired:"该字段为必填",validateFilter:"必须从列表中选择值"},DateField:{invalidDate:"日期输入无效"},DatePicker:{gotoPrevYear:"转至上一年",gotoPrevMonth:"转至上一月",gotoNextMonth:"转至下一月",gotoNextYear:"转至下一年"},NumberFormat:{locale:"zh-CN",currency:"CNY"},DurationField:{invalidUnit:"单位无效"},TimeField:{invalidTime:"时间输入无效"},TimePicker:{hour:"时",minute:"分",second:"秒"},List:{loading:"加载中……",selectAll:"全选"},GridBase:{loadMask:"加载中……",syncMask:"正在保存变更，请稍等……"},PagingToolbar:{firstPage:"转至第一页",prevPage:"转至上一页",page:"页",nextPage:"转至下一页",lastPage:"转至最后一页",reload:"重新载入当前页面",noRecords:"无记录显示",pageCountTemplate:o=>`的 ${o.lastPage}`,summaryTemplate:o=>`显示记录 ${o.start} - ${o.end} 的 ${o.allCount}`},PanelCollapser:{Collapse:"折叠",Expand:"展开"},Popup:{close:"关闭弹窗"},UndoRedo:{Undo:"撤销",Redo:"恢复",UndoLastAction:"撤销上个操作",RedoLastAction:"恢复上个撤销的操作",NoActions:"撤销队列中没有项目"},FieldFilterPicker:{equals:"等于",doesNotEqual:"不等于",isEmpty:"为空",isNotEmpty:"不为空",contains:"包含",doesNotContain:"不包含",startsWith:"开始为",endsWith:"结束为",isOneOf:"是之一",isNotOneOf:"不是之一",isGreaterThan:"大于",isLessThan:"小于",isGreaterThanOrEqualTo:"大于或等于",isLessThanOrEqualTo:"小于或等于",isBetween:"在之间",isNotBetween:"不在之间",isBefore:"在之前",isAfter:"在之后",isToday:"在今天",isTomorrow:"在明天",isYesterday:"在昨天",isThisWeek:"在本周",isNextWeek:"在下周",isLastWeek:"在上周",isThisMonth:"在本月",isNextMonth:"在下月",isLastMonth:"在上月",isThisYear:"在今年",isNextYear:"在明年",isLastYear:"在去年",isYearToDate:"是年初至今",isTrue:"为真",isFalse:"为假",selectAProperty:"选择一项属性",selectAnOperator:"选择操作员",caseSensitive:"区分大小写",and:"和",dateFormat:"年/月/日",selectValue:"选择一个值",selectOneOrMoreValues:"选择一个或多个值",enterAValue:"输入一个值",enterANumber:"输入一个数字",selectADate:"选择一个日期",selectATime:"选择时间"},FieldFilterPickerGroup:{addFilter:"增加过滤条件"},DateHelper:{locale:"zh-CN",weekStartDay:0,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"毫秒",plural:"毫秒",abbrev:"ms"},{single:"秒",plural:"秒",abbrev:"s"},{single:"分",plural:"分",abbrev:"min"},{single:"时",plural:"时",abbrev:"h"},{single:"天",plural:"天",abbrev:"d"},{single:"周",plural:"周",abbrev:"w"},{single:"月",plural:"月",abbrev:"mon"},{single:"季",plural:"季",abbrev:"q"},{single:"年",plural:"年",abbrev:"yr"},{single:"十年",plural:"十年",abbrev:"dec"}],unitAbbreviations:[["毫秒"],["s","秒"],["m","分"],["h","时"],["天"],["w","周"],["mo","月","月"],["q","季","季"],["y","年"],["十年"]],parsers:{L:"YYYY-MM-DD",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>"第"+o}},C=b.publishLocale(L),N={localeName:"ZhCn",localeDesc:"中文（中国）",localeCode:"zh-CN",GridBase:{loadFailedMessage:"数据加载失败！",syncFailedMessage:"数据同步失败！"},CrudManagerView:{serverResponseLabel:"服务器响应："},TaskBoard:{column:"栏",columns:"栏",Columns:"栏",swimlane:"泳道",swimlanes:"泳道",Swimlanes:"泳道",task:"任务",tasks:"任务",addTask:"添加L{TaskBoard.task}",cancel:"取消",changeColumn:"变更 L{TaskBoard.column}",changeSwimlane:"变更 L{TaskBoard.swimlane}",collapse:o=>`折叠 ${o}`,color:"颜色",description:"说明",editTask:"编辑 L{TaskBoard.task}",expand:o=>`展开${o}`,filterColumns:"筛选器 L{TaskBoard.column}",filterSwimlanes:"筛选器 L{TaskBoard.swimlanes}",filterTasks:"筛选器 L{TaskBoard.tasks}",moveColumnLeft:"向左移动 L{TaskBoard.column}",moveColumnRight:"向右移动 L{TaskBoard.column}",name:"名称",newTaskName:"新 L{TaskBoard.task}",removeTask:"移除 L{TaskBoard.task}",removeTasks:"移除 L{TaskBoard.tasks}",resources:"资源",save:"保存",scrollToColumn:"滚动到 L{TaskBoard.column}",scrollToSwimlane:"滚动到 L{TaskBoard.swimlane}",zoom:"缩放"},TodoListField:{add:"添加",newTodo:"新待办事项"},UndoRedo:{UndoLastAction:"撤销",RedoLastAction:"恢复"}},w=b.publishLocale(N);if(typeof s.exports=="object"&&typeof c=="object"){var O=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,t)&&t!==a&&Object.defineProperty(o,t,{get:()=>e[t],enumerable:!(l=Object.getOwnPropertyDescriptor(e,t))||l.enumerable});return o};s.exports=O(s.exports,c)}return s.exports});