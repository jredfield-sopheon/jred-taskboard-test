/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,s){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],s);else if(typeof module=="object"&&module.exports)module.exports=s();else{var d=s(),p=i?exports:c;for(var u in d)p[u]=d[u]}})(typeof self<"u"?self:void 0,()=>{var c={},s={exports:c},i=Object.defineProperty,d=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,y=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,h=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},v=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of p(e))!u.call(o,t)&&t!==a&&i(o,t,{get:()=>e[t],enumerable:!(l=d(e,t))||l.enumerable});return o},k=o=>v(i({},"__esModule",{value:!0}),o),T=(o,e,a)=>(y(o,typeof e!="symbol"?e+"":e,a),a),f={};h(f,{default:()=>w}),s.exports=k(f);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,g=class m{static mergeLocales(...e){let a={};return e.forEach(l=>{Object.keys(l).forEach(t=>{typeof l[t]=="object"?a[t]={...a[t],...l[t]}:a[t]=l[t]})}),a}static trimLocale(e,a){let l=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(r=>l(t,r)):l(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let l={};if(a.name||a.locale)l=Object.assign({localeName:a.name},a.locale),a.desc&&(l.localeDesc=a.desc),a.code&&(l.localeCode=a.code),a.path&&(l.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},a)}for(let t of["name","desc","code","path"])l[t]&&delete l[t];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(e){n.bryntum.locales=e}static get localeName(){return n.bryntum.locale||"En"}static set localeName(e){n.bryntum.locale=e||m.localeName}static get locale(){return m.localeName&&this.locales[m.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:l}=n.bryntum,t=m.normalizeLocale(e,a),{localeName:r}=t;return!l[r]||a===!0?l[r]=t:l[r]=this.mergeLocales(l[r]||{},t||{}),l[r]}};T(g,"skipLocaleIntegrityCheck",!1);var b=g;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},b._$name="LocaleHelper";var L={localeName:"He",localeDesc:"עִברִית",localeCode:"he",Object:{Yes:"כן",No:"לא",Cancel:"בטל",Ok:"אוקיי",Week:"שבוע",None:"אף אחד"},ColorPicker:{noColor:"אין צבע"},Combo:{noResults:"אין תוצאות",recordNotCommitted:"לא תאפשר להוסיף את הרשומה",addNewValue:o=>`${o} הוסף`},FilePicker:{file:"קובץ"},Field:{badInput:"ערך שדה בלתי-חוקי",patternMismatch:"הערך נדרש להתאים לתבנית מסוימת",rangeOverflow:o=>`${o.max}-הערך חייב להיות קטן או שווה ל`,rangeUnderflow:o=>`${o.min}-הערך חייב להיות גדול או שווה ל`,stepMismatch:"הערך אמור להתאים לשלב",tooLong:"הערכים חייבים להיות קצרים יותר",tooShort:"הערך חייב להיות ארוך יותר",typeMismatch:"הערך נדרש להיות בפורמט מיוחד",valueMissing:"שדה זה נדרש",invalidValue:"ערך שדה בלתי-חוקי",minimumValueViolation:"הפרת ערך מינימום",maximumValueViolation:"הפרת ערך מקסימום",fieldRequired:"שדה זה נדרש",validateFilter:"יש לבחור את הערך מרשימה"},DateField:{invalidDate:"הזנת תאריך בלתי-חוקי"},DatePicker:{gotoPrevYear:"עבור לשנה הקודמת",gotoPrevMonth:"עבור לחודש הקודם",gotoNextMonth:"עבור לחודש הבא",gotoNextYear:"עבור לשנה הבאה"},NumberFormat:{locale:"he",currency:"דולר ארה”ב"},DurationField:{invalidUnit:"יחידה בלתי-חוקית"},TimeField:{invalidTime:"הזנת זמן בלתי-חוקי"},TimePicker:{hour:"שעה",minute:"דקה",second:"שנייה"},List:{loading:"מתבצעת טעינה...",selectAll:"בחר הכל"},GridBase:{loadMask:"...מתבצעת טעינה",syncMask:"...שומר שינויים, אנא המתן"},PagingToolbar:{firstPage:"עבור לעמוד הראשון",prevPage:"עבור לעמוד הקודם",page:"עמוד",nextPage:"עבור לעמוד הבא",lastPage:"עבור לעמוד האחרון",reload:"טען מחדש את העמוד הנוכחי",noRecords:"אין רשומות להצגה",pageCountTemplate:o=>`${o.lastPage} מתוך`,summaryTemplate:o=>`${o.allCount} מתוך ${o.end}-${o.start} מציג רשומות`},PanelCollapser:{Collapse:"מזער",Expand:"הרחב"},Popup:{close:"סגור חלון קופץ"},UndoRedo:{Undo:"בטל",Redo:"בצע שוב",UndoLastAction:"בטל פעולה אחרונה",RedoLastAction:"בצע שוב את הפעולה האחרונה שלא בוצעה",NoActions:"אין פריטים בטור הפעולות לביטול"},FieldFilterPicker:{equals:"שווה",doesNotEqual:"לא שווה",isEmpty:"ריק",isNotEmpty:"אינו ריק",contains:"מכיל",doesNotContain:"אינו מכיל",startsWith:"מתחיל עם",endsWith:"מסתיים עם",isOneOf:"הוא אחד מ-",isNotOneOf:"אינו אחד מ-",isGreaterThan:"גדול מ-",isLessThan:"קטן מ-",isGreaterThanOrEqualTo:"גדול או שווה ל-",isLessThanOrEqualTo:"קטן או שווה ל-",isBetween:"נמצא בין",isNotBetween:"אינו נמצא בין",isBefore:"נמצא לפני",isAfter:"נמצא אחרי",isToday:"מתקיים היום",isTomorrow:"יתקיים מחר",isYesterday:"התקיים אתמול",isThisWeek:"יתקיים השבוע",isNextWeek:"יתקיים בשבוע הבא",isLastWeek:"התקיים בשבוע שעבר",isThisMonth:"יתקיים החודש",isNextMonth:"יתקיים בחודש הבא",isLastMonth:"התקיים בחודש שעבר",isThisYear:"יתקיים השנה",isNextYear:"יתקיים בשנה הבאה",isLastYear:"התקיים בשנה שעברה",isYearToDate:"מתחילת השנה עד היום",isTrue:"נכון",isFalse:"לא נכון",selectAProperty:"בחר תכונה",selectAnOperator:"בחר אופרטור",caseSensitive:"תלוי רישיות",and:"ו-",dateFormat:"D/M/YY",selectValue:"בחר ערך",selectOneOrMoreValues:"בחר ערך אחד או יותר",enterAValue:"הזן ערך",enterANumber:"הזן מספר",selectADate:"בחר תאריך",selectATime:"בחר שעה"},FieldFilterPickerGroup:{addFilter:"הוסף פילטר"},DateHelper:{locale:"he",weekStartDay:0,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"מילי-שנייה",plural:"מ”ש",abbrev:"מ”ש"},{single:"שנייה",plural:"שניות",abbrev:"ש"},{single:"דקה",plural:"דקות",abbrev:"דקה"},{single:"שעה",plural:"שעות",abbrev:"ש"},{single:"יום",plural:"ימים",abbrev:"י"},{single:"שבוע",plural:"שבועות",abbrev:"ש"},{single:"חודש",plural:"חודשים",abbrev:"חודש"},{single:"רבעון",plural:"רבעונים",abbrev:"ר"},{single:"שנה",plural:"שנים",abbrev:"שנה"},{single:"עשור",plural:"עשורים",abbrev:"עש"}],unitAbbreviations:[["מיל"],["ש","שנ"],["ד","דק"],["ש","שע"],["י"],["ש","שב"],["חו","חוד","חודש"],["ר","רבעון","רבעון"],["ש","שנה"],["עשור"]],parsers:{L:"DD/MM/YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>o}},P=b.publishLocale(L),N={localeName:"He",localeDesc:"עִברִית",localeCode:"he",GridBase:{loadFailedMessage:"טעינת הנתונים נכשלה",syncFailedMessage:"סנכרון הנתונים נכשל"},CrudManagerView:{serverResponseLabel:":תגובת השרת"},TaskBoard:{column:"עמודה",columns:"עמודות",Columns:"עמודות",swimlane:"מסלול שחייה",swimlanes:"מסלולי שחייה",Swimlanes:"מסלולי שחייה",task:"משימה",tasks:"משימות",addTask:"L{TaskBoard.task} הוסף",cancel:"בטל",changeColumn:"L{TaskBoard.column} שנה",changeSwimlane:"L{TaskBoard.swimlane} שנה",collapse:o=>`${o} מזער`,color:"צבע",description:"תיאור",editTask:"L{TaskBoard.task} ערוך",expand:o=>`${o} הרחב`,filterColumns:"L{TaskBoard.columns} סנן",filterSwimlanes:"L{TaskBoard.swimlanes} סנן",filterTasks:"L{TaskBoard.tasks} סנן",moveColumnLeft:" שמאלהL{TaskBoard.column} הזז",moveColumnRight:" ימינהL{TaskBoard.column} הזז",name:"שם",newTaskName:"L{TaskBoard.task} חדש",removeTask:"L{TaskBoard.task} הסר",removeTasks:"L{TaskBoard.tasks} הסר",resources:"משאבים",save:"שמור",scrollToColumn:"L{TaskBoard.column}-גלול ל",scrollToSwimlane:"L{TaskBoard.swimlane}-גלול ל",zoom:"זום"},TodoListField:{add:"הוסף",newTodo:"רשימת משימות חדשה"},UndoRedo:{UndoLastAction:"בטל",RedoLastAction:"בצע שוב"}},w=b.publishLocale(N);if(typeof s.exports=="object"&&typeof c=="object"){var O=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,t)&&t!==a&&Object.defineProperty(o,t,{get:()=>e[t],enumerable:!(l=Object.getOwnPropertyDescriptor(e,t))||l.enumerable});return o};s.exports=O(s.exports,c)}return s.exports});