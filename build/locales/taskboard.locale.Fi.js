/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(u,n){var r=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],n);else if(typeof module=="object"&&module.exports)module.exports=n();else{var c=n(),d=r?exports:u;for(var k in c)d[k]=c[k]}})(typeof self<"u"?self:void 0,()=>{var u={},n={exports:u},r=Object.defineProperty,c=Object.getOwnPropertyDescriptor,d=Object.getOwnPropertyNames,k=Object.prototype.hasOwnProperty,b=(i,e,a)=>e in i?r(i,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):i[e]=a,h=(i,e)=>{for(var a in e)r(i,a,{get:e[a],enumerable:!0})},f=(i,e,a,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of d(e))!k.call(i,t)&&t!==a&&r(i,t,{get:()=>e[t],enumerable:!(o=c(e,t))||o.enumerable});return i},T=i=>f(r({},"__esModule",{value:!0}),i),g=(i,e,a)=>(b(i,typeof e!="symbol"?e+"":e,a),a),p={};h(p,{default:()=>N}),n.exports=T(p);var s=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,y=class m{static mergeLocales(...e){let a={};return e.forEach(o=>{Object.keys(o).forEach(t=>{typeof o[t]=="object"?a[t]={...a[t],...o[t]}:a[t]=o[t]})}),a}static trimLocale(e,a){let o=(t,l)=>{e[t]&&(l?e[t][l]&&delete e[t][l]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(l=>o(t,l)):o(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let o={};if(a.name||a.locale)o=Object.assign({localeName:a.name},a.locale),a.desc&&(o.localeDesc=a.desc),a.code&&(o.localeCode=a.code),a.path&&(o.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);o=Object.assign({},a)}for(let t of["name","desc","code","path"])o[t]&&delete o[t];if(!o.localeName)throw new Error("Locale name can not be empty");return o}static get locales(){return s.bryntum.locales||{}}static set locales(e){s.bryntum.locales=e}static get localeName(){return s.bryntum.locale||"En"}static set localeName(e){s.bryntum.locale=e||m.localeName}static get locale(){return m.localeName&&this.locales[m.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:o}=s.bryntum,t=m.normalizeLocale(e,a),{localeName:l}=t;return!o[l]||a===!0?o[l]=t:o[l]=this.mergeLocales(o[l]||{},t||{}),o[l]}};g(y,"skipLocaleIntegrityCheck",!1);var v=y;s.bryntum=s.bryntum||{},s.bryntum.locales=s.bryntum.locales||{},v._$name="LocaleHelper";var L={localeName:"Fi",localeDesc:"Suomi",localeCode:"fi",Object:{Yes:"Kyllä",No:"Ei",Cancel:"Peruuta",Ok:"OK",Week:"Viikko",None:"Ei mitään"},ColorPicker:{noColor:"Ei väriä"},Combo:{noResults:"Ei tuloksia",recordNotCommitted:"Tietuetta ei voitu lisätä",addNewValue:i=>`Lisää ${i}`},FilePicker:{file:"Tiedosto"},Field:{badInput:"Virheellinen kentän arvo",patternMismatch:"Arvon tulee vastata tiettyä mallia",rangeOverflow:i=>`Arvon tulee olla pienempi tai yhtä suuri kuin ${i.max}`,rangeUnderflow:i=>`Arvon tulee olla suurempi tai yhtä suuri kuin ${i.min}`,stepMismatch:"Arvon pitäisi sopia vaiheeseen",tooLong:"Arvon tulee olla lyhyempi",tooShort:"Arvon tulee olla pidempi",typeMismatch:"Arvon on oltava tietyssä muodossa",valueMissing:"Tämä kenttä on pakollinen",invalidValue:"Virheellinen kentän arvo",minimumValueViolation:"Vähimmäisarvon ylitys",maximumValueViolation:"Enimmäisarvon ylitys",fieldRequired:"Tämä kenttä on pakollinen",validateFilter:"Arvo pitää valita listasta"},DateField:{invalidDate:"Virheellinen päivämäärän syöttö"},DatePicker:{gotoPrevYear:"Siirry edelliseen vuoteen",gotoPrevMonth:"Siirry edelliseen kuukauteen",gotoNextMonth:"Siirry seuraavaan kuukauteen",gotoNextYear:"Siirry seuraavaan vuoteen"},NumberFormat:{locale:"fi",currency:"EUR"},DurationField:{invalidUnit:"Virheellinen yksikkö"},TimeField:{invalidTime:"Virheellinen aika"},TimePicker:{hour:"Tunti",minute:"Minuutti",second:"Sekunti"},List:{loading:"Lataa...",selectAll:"Valitse kaikki"},GridBase:{loadMask:"Lataa...",syncMask:"Tallentaa muutoksia, odota hetki..."},PagingToolbar:{firstPage:"Siirry ensimmäiselle sivulle",prevPage:"Siirry edelliselle sivulle",page:"Sivu",nextPage:"Siirry seuraavalle sivulle",lastPage:"Siirry viimeiselle sivulle",reload:"Lataa nykyinen sivu uudelleen",noRecords:"Ei näytettäviä tietueita",pageCountTemplate:i=>`/ ${i.lastPage}`,summaryTemplate:i=>`Näytetään tietueita ${i.start} - ${i.end} / ${i.allCount}`},PanelCollapser:{Collapse:"Pienennä",Expand:"Laajenna"},Popup:{close:"Sulje ponnahdusikkuna"},UndoRedo:{Undo:"Peruuta",Redo:"Tee uudelleen",UndoLastAction:"Peruuta edellinen toiminto",RedoLastAction:"Viimeisimmän tekemättömän toiminnon palauttaminen",NoActions:"Peruutusjonossa ei ole kohteita"},FieldFilterPicker:{equals:"on sama",doesNotEqual:"ei ole sama",isEmpty:"on tyhjä",isNotEmpty:"ei ole tyhjä",contains:"sisältää",doesNotContain:"ei sisällä",startsWith:"alkaa",endsWith:"päättyy",isOneOf:"on yksi /",isNotOneOf:"ei ole yksi /",isGreaterThan:"on suurempi kuin",isLessThan:"on vähemmän kuin",isGreaterThanOrEqualTo:"on suurempi tai yhtä suuri kuin",isLessThanOrEqualTo:"on pienempi tai yhtä suuri kuin",isBetween:"on välillä",isNotBetween:"ei ole välillä",isBefore:"on ennen",isAfter:"on jälkeen",isToday:"on tänään",isTomorrow:"on huomenna",isYesterday:"on eilinen",isThisWeek:"on tämä viikko",isNextWeek:"on seuraava viikko",isLastWeek:"on viimeinen viikko",isThisMonth:"on tämä kuukausi",isNextMonth:"on seuraava kuukausi",isLastMonth:"on edellinen kuukausi",isThisYear:"on tämä vuosi",isNextYear:"on seuraava vuosi",isLastYear:"on edellinen vuosi",isYearToDate:"on vuosi tähän päivään",isTrue:"on tosi",isFalse:"on väärin",selectAProperty:"Valitse ominaisuus",selectAnOperator:"Valitse käyttäjä",caseSensitive:"Huomioi merkkikoko",and:"ja",dateFormat:"D/M/YY",selectValue:"Valitse arvo",selectOneOrMoreValues:"Valitse yksi tai useampi arvo",enterAValue:"Syötä arvo",enterANumber:"Syötä numero",selectADate:"Valitse päivämäärä",selectATime:"Valitse aika"},FieldFilterPickerGroup:{addFilter:"Lisää suodatin"},DateHelper:{locale:"fi",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"millisekunti",plural:"ms",abbrev:"ms"},{single:"sekunti",plural:"sekunttia",abbrev:"s"},{single:"minuutti",plural:"minuuttia",abbrev:"min"},{single:"tunti",plural:"tuntia",abbrev:"h"},{single:"päivä",plural:"päivää",abbrev:"p"},{single:"viikko",plural:"viikkoa",abbrev:"vko"},{single:"kuukausi",plural:"kuukautta",abbrev:"kk"},{single:"kvartaali",plural:"kvartaalia",abbrev:"q"},{single:"vuosi",plural:"vuotta",abbrev:"v"},{single:"vuosikymmen",plural:"vuosikymmen",abbrev:"vuosikymmen"}],unitAbbreviations:[["mil"],["s","sek"],["min","min"],["tunti","h"],["d"],["viikko","vko"],["kuukausi","kuukausi","kk"],["kvartaali","kvartaali","q"],["vuosi","v"],["vuosikymmen"]],parsers:{L:"D.M.YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:i=>i+"."}},P=v.publishLocale(L),w={localeName:"Fi",localeDesc:"Suomi",localeCode:"fi",GridBase:{loadFailedMessage:"Tietojen lataus epäonnistui!",syncFailedMessage:"Tietojen synkronisointi epäonnistui!"},CrudManagerView:{serverResponseLabel:"Palvelimen vastaus:"},TaskBoard:{column:"sarake",columns:"sarakkeet",Columns:"Sarakkeet",swimlane:"swimlane",swimlanes:"swimlanes",Swimlanes:"Swimlanes",task:"tehtävä",tasks:"tehtävät",addTask:"Lisää L{TaskBoard.task}",cancel:"Peruuta",changeColumn:"Vaihda L{TaskBoard.column}",changeSwimlane:"Vaihda L{TaskBoard.swimlane}",collapse:i=>`Kaatuminen ${i}`,color:"Väri",description:"Kuvaus",editTask:"Muokkaa L{TaskBoard.task}",expand:i=>`Expand ${i}`,filterColumns:"Suodata L{TaskBoard.columns}",filterSwimlanes:"Suodata L {TaskBoard.swimlanes}",filterTasks:"Suodata L {TaskBoard.tasks}",moveColumnLeft:"Siirrä L{TaskBoard.column} vasemmalle",moveColumnRight:"Siirrä L{TaskBoard.column} oikealle",name:"Nimi",newTaskName:"Uusi L{TaskBoard.task}",removeTask:"Poista L{TaskBoard.task}",removeTasks:"Poista L{TaskBoard.tasks}",resources:"Lähteet",save:"Tallenna",scrollToColumn:"Vieritä L{TaskBoard.column}",scrollToSwimlane:"Vieritä L{TaskBoard.swimlane}",zoom:"Zoom"},TodoListField:{add:"Lisää",newTodo:"Uusi todo"},UndoRedo:{UndoLastAction:"Kumoa",RedoLastAction:"Tee uudelleen"}},N=v.publishLocale(w);if(typeof n.exports=="object"&&typeof u=="object"){var O=(i,e,a,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(i,t)&&t!==a&&Object.defineProperty(i,t,{get:()=>e[t],enumerable:!(o=Object.getOwnPropertyDescriptor(e,t))||o.enumerable});return i};n.exports=O(n.exports,u)}return n.exports});
