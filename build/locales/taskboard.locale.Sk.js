/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(d,l){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],l);else if(typeof module=="object"&&module.exports)module.exports=l();else{var m=l(),p=i?exports:d;for(var u in m)p[u]=m[u]}})(typeof self<"u"?self:void 0,()=>{var d={},l={exports:d},i=Object.defineProperty,m=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,y=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,j=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},h=(o,e,a,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of p(e))!u.call(o,t)&&t!==a&&i(o,t,{get:()=>e[t],enumerable:!(n=m(e,t))||n.enumerable});return o},f=o=>h(i({},"__esModule",{value:!0}),o),g=(o,e,a)=>(y(o,typeof e!="symbol"?e+"":e,a),a),v={};j(v,{default:()=>P}),l.exports=f(v);var s=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,k=class c{static mergeLocales(...e){let a={};return e.forEach(n=>{Object.keys(n).forEach(t=>{typeof n[t]=="object"?a[t]={...a[t],...n[t]}:a[t]=n[t]})}),a}static trimLocale(e,a){let n=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(r=>n(t,r)):n(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let n={};if(a.name||a.locale)n=Object.assign({localeName:a.name},a.locale),a.desc&&(n.localeDesc=a.desc),a.code&&(n.localeCode=a.code),a.path&&(n.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);n=Object.assign({},a)}for(let t of["name","desc","code","path"])n[t]&&delete n[t];if(!n.localeName)throw new Error("Locale name can not be empty");return n}static get locales(){return s.bryntum.locales||{}}static set locales(e){s.bryntum.locales=e}static get localeName(){return s.bryntum.locale||"En"}static set localeName(e){s.bryntum.locale=e||c.localeName}static get locale(){return c.localeName&&this.locales[c.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:n}=s.bryntum,t=c.normalizeLocale(e,a),{localeName:r}=t;return!n[r]||a===!0?n[r]=t:n[r]=this.mergeLocales(n[r]||{},t||{}),n[r]}};g(k,"skipLocaleIntegrityCheck",!1);var b=k;s.bryntum=s.bryntum||{},s.bryntum.locales=s.bryntum.locales||{},b._$name="LocaleHelper";var T={localeName:"Sk",localeDesc:"Slovenský",localeCode:"sk",Object:{Yes:"Áno",No:"Nie",Cancel:"Zrušiť",Ok:"OK",Week:"Týždeň",None:"Žiadny"},ColorPicker:{noColor:"Žiadna farba"},Combo:{noResults:"Žiadne výsledky",recordNotCommitted:"Záznam sa nepodarilo pridať",addNewValue:o=>`Pridať ${o}`},FilePicker:{file:"Súbor"},Field:{badInput:"Neplatná hodnota poľa",patternMismatch:"Hodnota by sa mala zhodovať so špecifickým vzorom",rangeOverflow:o=>`Hodnota mus byť menšia alebo rovná ${o.max}`,rangeUnderflow:o=>`Hodnota musí byť väčšia alebo rovná ${o.min}`,stepMismatch:"Hodnota by sa mala zhodovať s krokom",tooLong:"Hodnota by mala byť kratšia",tooShort:"Hodnota by mala byť dlhšia",typeMismatch:"Požaduje sa, aby hodnota bola v špeciálnom formáte",valueMissing:"Toto políčko sa požaduje",invalidValue:"Neplatná hodnota políčka",minimumValueViolation:"Narušenie minimálnej hodnoty",maximumValueViolation:"Narušenie maximálnej hodnoty",fieldRequired:"Toto políčko sa požaduje",validateFilter:"Hodnota musí byť zvolená zo zoznamu"},DateField:{invalidDate:"Vloženie neplatného dátumu"},DatePicker:{gotoPrevYear:"Prejsť na predchádzajúci rok",gotoPrevMonth:"Prejsť na predchádzajúci mesiac",gotoNextMonth:"Prejsť na nasledujúci mesiac",gotoNextYear:"Prejsť na nalsedujúci rok"},NumberFormat:{locale:"sk",currency:"EUR"},DurationField:{invalidUnit:"Neplatná jednotka"},TimeField:{invalidTime:"Vloženie neplatného času"},TimePicker:{hour:"Hodina",minute:"Minúta",second:"Sekunda"},List:{loading:"Načítavanie...",selectAll:"Vybrať všetko"},GridBase:{loadMask:"Načítavanie...",syncMask:"ukladajú sa zmeny, čakajte..."},PagingToolbar:{firstPage:"Prejsť na prvú stranu",prevPage:"Prejsť na predchádzajúcu stranu",page:"Strana",nextPage:"Prejsť na nasledujúcu stranu",lastPage:"Prejsť na poslednú stranu",reload:"Znovu načítať súčasnú stranu",noRecords:"Žiadne záznamy na zobrazenie",pageCountTemplate:o=>`z ${o.lastPage}`,summaryTemplate:o=>`Zobrazujú sa záznamy ${o.start} - ${o.end} z ${o.allCount}`},PanelCollapser:{Collapse:"Zbaliť",Expand:"Rozbaliť"},Popup:{close:"Zatvoriť vyskakovacie okno"},UndoRedo:{Undo:"Vrátiť späť",Redo:"Znovu vykonať",UndoLastAction:"Vrátiť späť poslednú akciu",RedoLastAction:"Znovu urobiť poslednú nevykonanú akciu",NoActions:"Žiadne položky v rade na vrátenie späť"},FieldFilterPicker:{equals:"rovná sa",doesNotEqual:"nerovná sa",isEmpty:"je prázdne",isNotEmpty:"nie je prázdne",contains:"obsahuje",doesNotContain:"neobsahuje",startsWith:"začína na",endsWith:"končí na",isOneOf:"je jeden z",isNotOneOf:"nie je jedno z",isGreaterThan:"je väčšie než",isLessThan:"je menšie než",isGreaterThanOrEqualTo:"je väčšie alebo sa rovná",isLessThanOrEqualTo:"je menšie alebo sa rovná",isBetween:"je medzi",isNotBetween:"nie je medzi",isBefore:"je pred",isAfter:"je po",isToday:"je dnes",isTomorrow:"je zajtra",isYesterday:"je včera",isThisWeek:"je tento týždeň",isNextWeek:"je budúci týždeň",isLastWeek:"je minulý týždeň",isThisMonth:"je tento mesiac",isNextMonth:"je budúci mesiac",isLastMonth:"je minulý mesiac",isThisYear:"je tento rok",isNextYear:"je budúci rok",isLastYear:"je minulý rok",isYearToDate:"je rok do dnešného dňa",isTrue:"je správne",isFalse:"je nesprávne",selectAProperty:"Vyberte vlastnosť",selectAnOperator:"Vyberte operátora",caseSensitive:"Rozlišuje malé a veľké písmená",and:"a",dateFormat:"D/M/YY",selectValue:"Vyberte hodnotu",selectOneOrMoreValues:"Vyberte jednu alebo viac hodnôt",enterAValue:"Zadajte hodnotu",enterANumber:"Zadajte číslo",selectADate:"Vyberte dátum",selectATime:"Vybrať čas"},FieldFilterPickerGroup:{addFilter:"Pridajte filter"},DateHelper:{locale:"sk",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"milisekunda",plural:"ms",abbrev:"ms"},{single:"sekunda",plural:"sekundy",abbrev:"s"},{single:"minúta",plural:"minúty",abbrev:"min"},{single:"hodina",plural:"hodiny",abbrev:"h"},{single:"deň",plural:"dni",abbrev:"d"},{single:"týždeň",plural:"týždne",abbrev:"tžd"},{single:"mesiac",plural:"mesiace",abbrev:"msc"},{single:"štvrť",plural:"štvrtiny",abbrev:""},{single:"rok",plural:"roky",abbrev:"rk"},{single:"dekáda",plural:"dekády",abbrev:"dek"}],unitAbbreviations:[["mil"],["s","sec"],["m","min"],["h","h"],["d"],["tžd","tžd"],["msc","msc","msc"],["štvrť","štvrť","štvrť"],["rk","rk"],["dek"]],parsers:{L:"D. M. YYYY.",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>o+"."}},w=b.publishLocale(T),N={localeName:"Sk",localeDesc:"Slovenský",localeCode:"sk",GridBase:{loadFailedMessage:"Načítanie údajov zlyhalo!",syncFailedMessage:"Synchronizácia údajov zlyhala!"},CrudManagerView:{serverResponseLabel:"Odpoveď servera:"},TaskBoard:{column:"stĺpec",columns:"stĺpce",Columns:"Stĺpce",swimlane:"swimlane",swimlanes:"swimlane diagram",Swimlanes:"Swimlane",task:"úloha",tasks:"úlohy",addTask:"Pridať L{TaskBoard.task}",cancel:"Zrušiť",changeColumn:"Zmena L{TaskBoard.column}",changeSwimlane:"Zmena L{TaskBoard.swimlane}",collapse:o=>`Kolaps ${o}`,color:"Farba",description:"Popis",editTask:"Upraviť L{TaskBoard.task}",expand:o=>`Expand ${o}`,filterColumns:"Filtrovať L{TaskBoard.columns}",filterSwimlanes:"Filtrovať L{TaskBoard.swimlanes}",filterTasks:"Filtrovať L{TaskBoard.tasks}",moveColumnLeft:"Posunúť L{TaskBoard.column} doľava",moveColumnRight:"Posunúť L{TaskBoard.column} doprava",name:"Názov",newTaskName:"Nový L{TaskBoard.task}",removeTask:"Odstrániť L{TaskBoard.task}",removeTasks:"Odstrániť L{TaskBoard.tasks}",resources:"Zdroje",save:"Uložiť",scrollToColumn:"Prejsť na L{TaskBoard.column}",scrollToSwimlane:"Prejsť na L{TaskBoard.swimlane}",zoom:"Zoom"},TodoListField:{add:"Pridať",newTodo:"Nová úloha"},UndoRedo:{UndoLastAction:"Vrátiť späť",RedoLastAction:"Prepracovať"}},P=b.publishLocale(N);if(typeof l.exports=="object"&&typeof d=="object"){var L=(o,e,a,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,t)&&t!==a&&Object.defineProperty(o,t,{get:()=>e[t],enumerable:!(n=Object.getOwnPropertyDescriptor(e,t))||n.enumerable});return o};l.exports=L(l.exports,d)}return l.exports});
