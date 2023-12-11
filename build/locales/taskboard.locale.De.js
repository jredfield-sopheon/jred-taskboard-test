/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,l){var o=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],l);else if(typeof module=="object"&&module.exports)module.exports=l();else{var m=l(),h=o?exports:c;for(var d in m)h[d]=m[d]}})(typeof self<"u"?self:void 0,()=>{var c={},l={exports:c},o=Object.defineProperty,m=Object.getOwnPropertyDescriptor,h=Object.getOwnPropertyNames,d=Object.prototype.hasOwnProperty,f=(t,e,a)=>e in t?o(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a,k=(t,e)=>{for(var a in e)o(t,a,{get:e[a],enumerable:!0})},w=(t,e,a,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of h(e))!d.call(t,n)&&n!==a&&o(t,n,{get:()=>e[n],enumerable:!(r=m(e,n))||r.enumerable});return t},v=t=>w(o({},"__esModule",{value:!0}),t),y=(t,e,a)=>(f(t,typeof e!="symbol"?e+"":e,a),a),p={};k(p,{default:()=>D}),l.exports=v(p);var i=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,b=class u{static mergeLocales(...e){let a={};return e.forEach(r=>{Object.keys(r).forEach(n=>{typeof r[n]=="object"?a[n]={...a[n],...r[n]}:a[n]=r[n]})}),a}static trimLocale(e,a){let r=(n,s)=>{e[n]&&(s?e[n][s]&&delete e[n][s]:delete e[n])};Object.keys(a).forEach(n=>{Object.keys(a[n]).length>0?Object.keys(a[n]).forEach(s=>r(n,s)):r(n)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let r={};if(a.name||a.locale)r=Object.assign({localeName:a.name},a.locale),a.desc&&(r.localeDesc=a.desc),a.code&&(r.localeCode=a.code),a.path&&(r.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);r=Object.assign({},a)}for(let n of["name","desc","code","path"])r[n]&&delete r[n];if(!r.localeName)throw new Error("Locale name can not be empty");return r}static get locales(){return i.bryntum.locales||{}}static set locales(e){i.bryntum.locales=e}static get localeName(){return i.bryntum.locale||"En"}static set localeName(e){i.bryntum.locale=e||u.localeName}static get locale(){return u.localeName&&this.locales[u.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:r}=i.bryntum,n=u.normalizeLocale(e,a),{localeName:s}=n;return!r[s]||a===!0?r[s]=n:r[s]=this.mergeLocales(r[s]||{},n||{}),r[s]}};y(b,"skipLocaleIntegrityCheck",!1);var g=b;i.bryntum=i.bryntum||{},i.bryntum.locales=i.bryntum.locales||{},g._$name="LocaleHelper";var T={localeName:"De",localeDesc:"Deutsch",localeCode:"de-DE",Object:{Yes:"Ja",No:"Nein",Cancel:"Abbrechen",Ok:"OK",Week:"Woche",None:"Keine"},ColorPicker:{noColor:"Keine Farbe"},Combo:{noResults:"Keine Ergebnisse",recordNotCommitted:"Datensatz konnte nicht hinzugefügt werden",addNewValue:t=>`Hinzufügen ${t}`},FilePicker:{file:"Datei"},Field:{badInput:"Ungültiger Feldwert",patternMismatch:"Wert sollte einem bestimmten Muster entsprechen",rangeOverflow:t=>`Der Wert muss kleiner oder gleich sein als ${t.max}`,rangeUnderflow:t=>`Der Wert muss größer oder gleich sein als ${t.min}`,stepMismatch:"Der Wert sollte zum Schritt passen",tooLong:"Der Wert sollte kürzer sein",tooShort:"Wert sollte länger sein",typeMismatch:"Wert muss in einem speziellen Format vorliegen",valueMissing:"Dieses Feld ist erforderlich",invalidValue:"Ungültiger Feldwert",minimumValueViolation:"Verletzung des Mindestwerts",maximumValueViolation:"Verletzung des Maximalwerts",fieldRequired:"Dieses Feld ist erforderlich",validateFilter:"Wert muss aus der Liste ausgewählt werden"},DateField:{invalidDate:"Ungültige Datumseingabe"},DatePicker:{gotoPrevYear:"Zum vorherigen Jahr gehen",gotoPrevMonth:"Zum vorherigen Monat gehen",gotoNextMonth:"Zum nächsten Monat gehen",gotoNextYear:"Zum nächsten Jahr gehen"},NumberFormat:{locale:"de-DE",currency:"EUR"},DurationField:{invalidUnit:"Ungültige Einheit"},TimeField:{invalidTime:"Ungültige Zeiteingabe"},TimePicker:{hour:"Stunde",minute:"Minute",second:"Sekunde"},List:{loading:"Wird geladen...",selectAll:"Alle auswählen"},GridBase:{loadMask:"Wird geladen...",syncMask:"Änderung werden gespeichert, bitte warten..."},PagingToolbar:{firstPage:"Zur ersten Seite gehen",prevPage:"Zur vorherigen Seite gehen",page:"Seite",nextPage:"Zur nächsten Seite gehen",lastPage:"Zur letzten Seite gehen",reload:"Aktuelle Seite neu laden",noRecords:"Keine Datensätze anzuzeigen",pageCountTemplate:t=>`von${t.lastPage}`,summaryTemplate:t=>` Datensätze anzeigen ${t.start} - ${t.end} von ${t.allCount}`},PanelCollapser:{Collapse:"Zusammenklappen",Expand:"Aufklappen"},Popup:{close:"Popup schließen"},UndoRedo:{Undo:"Rückgängig machen",Redo:"Wiederholen",UndoLastAction:"Letzte Aktion rückgängig machen",RedoLastAction:"Letzte rückgängig gemachte Aktion wiederholen",NoActions:"Keine Einträge in der Rückgängig-Warteschlange"},FieldFilterPicker:{equals:"ist gleich",doesNotEqual:"ist nicht gleich",isEmpty:"ist leer",isNotEmpty:"ist nicht leer",contains:"enthält",doesNotContain:"enthält nicht",startsWith:"beginnt mit",endsWith:"endet mit",isOneOf:"ist eins von",isNotOneOf:"ist nicht eins von",isGreaterThan:"ist größer als",isLessThan:"ist kleiner als",isGreaterThanOrEqualTo:"ist größer oder gleich wie",isLessThanOrEqualTo:"ist kleiner oder gleich wie",isBetween:"ist zwischen",isNotBetween:"ist nicht zwischen",isBefore:"ist vor",isAfter:"ist nach",isToday:"ist heute",isTomorrow:"ist morgen",isYesterday:"ist gestern",isThisWeek:"ist diese Woche",isNextWeek:"ist nächste Woche",isLastWeek:"ist letzte Woche",isThisMonth:"ist dieser Monat",isNextMonth:"ist nächster Monat",isLastMonth:"ist letzter Monat",isThisYear:"ist dieses Jahr",isNextYear:"ist nächstes Jahr",isLastYear:"ist letztes Jahr",isYearToDate:"ist Jahr bis dato",isTrue:"ist wahr",isFalse:"ist falsch",selectAProperty:"Eine Eigenschaft auswählen",selectAnOperator:"Einen Operator auswählen",caseSensitive:"Groß-/Kleinschreibung",and:"und",dateFormat:"D/M/YY",selectValue:"Wert auswählen",selectOneOrMoreValues:"Einen oder mehrere Wert(e) auswählen",enterAValue:"Einen Wert eingeben",enterANumber:"Eine Zahl eingeben",selectADate:"Ein Datum auswählen",selectATime:"Uhrzeit auswählen"},FieldFilterPickerGroup:{addFilter:"Filter hinzufügen"},DateHelper:{locale:"de-DE",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"millisekunde",plural:"ms",abbrev:"ms"},{single:"sekunde",plural:"sekunden",abbrev:"s"},{single:"minute",plural:"minuten",abbrev:"min"},{single:"stunde",plural:"stunden",abbrev:"std"},{single:"tag",plural:"tage",abbrev:"t"},{single:"woche",plural:"wochen",abbrev:"w"},{single:"monat",plural:"monate",abbrev:"mon"},{single:"quartal",plural:"quartale",abbrev:"q"},{single:"jahr",plural:"jahre",abbrev:"yr"},{single:"jahrzehnt",plural:"jahrzehnte",abbrev:"jahrz"}],unitAbbreviations:[["mil"],["s","sek"],["m","min"],["std","hr"],["t"],["w","wn"],["mo","mon","mnt"],["q","quar","qrt"],["j","jr"],["jahrz"]],parsers:{L:"DD.MM.YYYY",LT:"HH:mm",LTS:"HH:mm:ss"},ordinalSuffix:t=>t+"."}},O=g.publishLocale(T),L={localeName:"De",localeDesc:"Deutsch",localeCode:"de-DE",GridBase:{loadFailedMessage:"Das Laden der Daten ist fehlgeschlagen!",syncFailedMessage:"Datensynchronisation fehlgeschlagen!"},CrudManagerView:{serverResponseLabel:"Serverantwort:"},TaskBoard:{column:"spalte",columns:"spalten",Columns:"Spalten",swimlane:"swimlane",swimlanes:"swimlanes",Swimlanes:"Swimlanes",task:"Aufgabe",tasks:"Aufgaben",addTask:"Hinzufügen L{TaskBoard.task}",cancel:"Abbrechen",changeColumn:"ändern L{TaskBoard.column}",changeSwimlane:"ändern L{TaskBoard.swimlane}",collapse:t=>`Einklappen ${t}`,color:"farbe",description:"Beschreibung",editTask:"bearbeiten L{TaskBoard.task}",expand:t=>`Ausklappen${t}`,filterColumns:"Filtern L{TaskBoard.columns}",filterSwimlanes:"Filtern L{TaskBoard.swimlanes}",filterTasks:"Filtern L{TaskBoard.tasks}",moveColumnLeft:"Bewegen L{TaskBoard.column} nach links",moveColumnRight:"Bewegen L{TaskBoard.column} nach rechts",name:"Name",newTaskName:"Neu L{TaskBoard.task}",removeTask:"Löschen L{TaskBoard.task}",removeTasks:"Löschen L{TaskBoard.tasks}",resources:"Ressourcen",save:"Speichern",scrollToColumn:"Scrollen zu L{TaskBoard.column}",scrollToSwimlane:"Scrollen zu L{TaskBoard.swimlane}",zoom:"Zoomen"},TodoListField:{add:"Hinzufügen",newTodo:"Neues To-Do"},UndoRedo:{UndoLastAction:"Rückgängig machen",RedoLastAction:"Wiederholen"}},D=g.publishLocale(L);if(typeof l.exports=="object"&&typeof c=="object"){var N=(t,e,a,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(t,n)&&n!==a&&Object.defineProperty(t,n,{get:()=>e[n],enumerable:!(r=Object.getOwnPropertyDescriptor(e,n))||r.enumerable});return t};l.exports=N(l.exports,c)}return l.exports});