/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,s){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],s);else if(typeof module=="object"&&module.exports)module.exports=s();else{var d=s(),p=i?exports:c;for(var u in d)p[u]=d[u]}})(typeof self<"u"?self:void 0,()=>{var c={},s={exports:c},i=Object.defineProperty,d=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,y=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,k=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},v=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of p(e))!u.call(o,t)&&t!==a&&i(o,t,{get:()=>e[t],enumerable:!(l=d(e,t))||l.enumerable});return o},h=o=>v(i({},"__esModule",{value:!0}),o),T=(o,e,a)=>(y(o,typeof e!="symbol"?e+"":e,a),a),f={};k(f,{default:()=>N}),s.exports=h(f);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,g=class m{static mergeLocales(...e){let a={};return e.forEach(l=>{Object.keys(l).forEach(t=>{typeof l[t]=="object"?a[t]={...a[t],...l[t]}:a[t]=l[t]})}),a}static trimLocale(e,a){let l=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(r=>l(t,r)):l(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let l={};if(a.name||a.locale)l=Object.assign({localeName:a.name},a.locale),a.desc&&(l.localeDesc=a.desc),a.code&&(l.localeCode=a.code),a.path&&(l.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},a)}for(let t of["name","desc","code","path"])l[t]&&delete l[t];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(e){n.bryntum.locales=e}static get localeName(){return n.bryntum.locale||"En"}static set localeName(e){n.bryntum.locale=e||m.localeName}static get locale(){return m.localeName&&this.locales[m.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:l}=n.bryntum,t=m.normalizeLocale(e,a),{localeName:r}=t;return!l[r]||a===!0?l[r]=t:l[r]=this.mergeLocales(l[r]||{},t||{}),l[r]}};T(g,"skipLocaleIntegrityCheck",!1);var b=g;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},b._$name="LocaleHelper";var L={localeName:"Bg",localeDesc:"Български",localeCode:"bg",Object:{Yes:"Да",No:"Не",Cancel:"Отказ",Ok:"ОК",Week:"Седмица",None:"Няма"},ColorPicker:{noColor:"Няма цвят"},Combo:{noResults:"Няма резултати",recordNotCommitted:"Записът не може да бъде добавен",addNewValue:o=>`Добавете ${o}`},FilePicker:{file:"Файл"},Field:{badInput:"Невалидна стойност на полето",patternMismatch:"Стойността трябва да съответства на определен шаблон",rangeOverflow:o=>`Стойността трябва да е по-малка или равна на ${o.max}`,rangeUnderflow:o=>`Стойността трябва да е по-голяма или равна на ${o.min}`,stepMismatch:"Стойността трябва да съответства на стъпката",tooLong:"Стойността трябва да е по-къса",tooShort:"Стойността трябва да е по-дълга",typeMismatch:"Стойността трябва да бъде в специален формат",valueMissing:"Това поле е задължително",invalidValue:"Невалидна стойност на полето",minimumValueViolation:"Нарушение на минималната стойност",maximumValueViolation:"Нарушение на максималната стойност",fieldRequired:"Това поле е задължително",validateFilter:"Стойността трябва да бъде избрана от списъка"},DateField:{invalidDate:"Невалидно въвеждане на дата"},DatePicker:{gotoPrevYear:"Преминаване към предишната година",gotoPrevMonth:"Преминаване към предишния месец",gotoNextMonth:"Преминаване към следващия месец",gotoNextYear:"Преминаване към следващата година"},NumberFormat:{locale:"bg",currency:"BGN"},DurationField:{invalidUnit:"Невалидна единица"},TimeField:{invalidTime:"Невалидно въведено време"},TimePicker:{hour:"Час",minute:"Минута",second:"Секунда"},List:{loading:"Зареждане...",selectAll:"Избери всички"},GridBase:{loadMask:"Зареждане...",syncMask:"Запазване на промените, моля, изчакайте..."},PagingToolbar:{firstPage:"Преминаване на първа страница",prevPage:"Преминаване на предишната страница",page:"Стр.",nextPage:"Преминаване на следващата страница",lastPage:"Преминаване на последната страница",reload:"Презареждане на текущата страница",noRecords:"Няма записи за показване",pageCountTemplate:o=>`от ${o.lastPage}`,summaryTemplate:o=>`Показване на записи ${o.start} - ${o.end} от ${o.allCount}`},PanelCollapser:{Collapse:"Свиване",Expand:"Разгръщане"},Popup:{close:"Затваряне на изскачащ прозорец"},UndoRedo:{Undo:"Отмяна",Redo:"Повтаряне",UndoLastAction:"Отмяна на последното действие",RedoLastAction:"Повторно извършване на последното отменено действие",NoActions:"Няма елементи в опашката за отмяна"},FieldFilterPicker:{equals:"е равно на",doesNotEqual:"не е равно на",isEmpty:"е празно",isNotEmpty:"не е празно",contains:"съдържа",doesNotContain:"не съдържа",startsWith:"започва с",endsWith:"свършва с",isOneOf:"е част от",isNotOneOf:"не е част от",isGreaterThan:"е по-голямо от",isLessThan:"е по-малко от",isGreaterThanOrEqualTo:"е по-голямо от или равно на",isLessThanOrEqualTo:"е по-малко от или равно на",isBetween:"е между",isNotBetween:"не е между",isBefore:"е преди",isAfter:"е след",isToday:"е днес",isTomorrow:"е утре",isYesterday:"е вчера",isThisWeek:"е тази седмица",isNextWeek:"е следващата седмица",isLastWeek:"е миналата седмица",isThisMonth:"е този месец",isNextMonth:"е следващият месец",isLastMonth:"е миналият месец",isThisYear:"е тази година",isNextYear:"е следващата година",isLastYear:"е миналата година",isYearToDate:"е от началото на годината до днес",isTrue:"е вярно",isFalse:"е грешно",selectAProperty:"Избор на свойство",selectAnOperator:"Избор на оператор",caseSensitive:"Чувствителност към малки и големи букви",and:"и",dateFormat:"D/M/YY",selectValue:"Изберете стойност",selectOneOrMoreValues:"Избор на една или повече стойности",enterAValue:"Въвеждане на стойност",enterANumber:"Въвеждане на число",selectADate:"Избор на дата",selectATime:"Изберете час"},FieldFilterPickerGroup:{addFilter:"Добавяне на филтър"},DateHelper:{locale:"bg",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"милисекунда",plural:"милисекунди",abbrev:"мсек"},{single:"секунда",plural:"секунди",abbrev:"сек"},{single:"минута",plural:"минути",abbrev:"мин"},{single:"час",plural:"часа",abbrev:"ч"},{single:"ден",plural:"дни",abbrev:"д"},{single:"седмица",plural:"седмици",abbrev:"сед"},{single:"месец",plural:"месеци",abbrev:"мес"},{single:"тримесечие",plural:"тримесечия",abbrev:"трим"},{single:"година",plural:"години",abbrev:"год"},{single:"десетилетие",plural:"десетилетия",abbrev:"десетил"}],unitAbbreviations:[["милисек"],["с","сек"],["м","мин"],["ч","часа"],["д"],["с","сед"],["ме","мес","мсц"],["тр","трим","тримес"],["г","год"],["дес"]],parsers:{L:"DD.MM.YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>{let e=o[o.length-1],a={1:"-во",2:"-ро",3:"-то"}[e]||"-ти";return o+a}}},P=b.publishLocale(L),w={localeName:"Bg",localeDesc:"Български",localeCode:"bg",GridBase:{loadFailedMessage:"Зареждането на данните е неуспешно!",syncFailedMessage:"Синхронизацията на данните е неуспешна!"},CrudManagerView:{serverResponseLabel:"Отговор на сървъра:"},TaskBoard:{column:"колона",columns:"колони",Columns:"Колони",swimlane:"swimlane диаграма",swimlanes:"swimlane диаграми",Swimlanes:"Swimlane диаграми",task:"задача",tasks:"задачи",addTask:"Добавяне на L{TaskBoard.task}",cancel:"Отказ",changeColumn:"Промяна на L{TaskBoard.column}",changeSwimlane:"Промяна на L{TaskBoard.swimlane}",collapse:o=>`Свиване ${o}`,color:"Цвят",description:"Описание",editTask:"Редактиране на L{TaskBoard.task}",expand:o=>`Разгъване на ${o}`,filterColumns:"Филтър L{TaskBoard.columns}",filterSwimlanes:"Филтър L{TaskBoard.swimlanes}",filterTasks:"Филтър L{TaskBoard.tasks}",moveColumnLeft:"Преместване L{TaskBoard.column} наляво",moveColumnRight:"Преместване L{TaskBoard.column} надясно",name:"Име",newTaskName:"Нов L{TaskBoard.task}",removeTask:"Премахване на L{TaskBoard.task}",removeTasks:"Премахване на L{TaskBoard.tasks}",resources:"Ресурси",save:"Запис",scrollToColumn:"Превъртане до L{TaskBoard.column}",scrollToSwimlane:"Превъртане до L{TaskBoard.swimlane}",zoom:"Увеличаване"},TodoListField:{add:"Добавяне",newTodo:"Нова задача"},UndoRedo:{UndoLastAction:"Отмяна",RedoLastAction:"Възстановяване"}},N=b.publishLocale(w);if(typeof s.exports=="object"&&typeof c=="object"){var O=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,t)&&t!==a&&Object.defineProperty(o,t,{get:()=>e[t],enumerable:!(l=Object.getOwnPropertyDescriptor(e,t))||l.enumerable});return o};s.exports=O(s.exports,c)}return s.exports});