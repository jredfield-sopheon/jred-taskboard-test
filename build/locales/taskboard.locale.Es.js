/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,t){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],t);else if(typeof module=="object"&&module.exports)module.exports=t();else{var m=t(),p=i?exports:c;for(var u in m)p[u]=m[u]}})(typeof self<"u"?self:void 0,()=>{var c={},t={exports:c},i=Object.defineProperty,m=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,f=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,h=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},y=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of p(e))!u.call(o,r)&&r!==a&&i(o,r,{get:()=>e[r],enumerable:!(l=m(e,r))||l.enumerable});return o},k=o=>y(i({},"__esModule",{value:!0}),o),T=(o,e,a)=>(f(o,typeof e!="symbol"?e+"":e,a),a),g={};h(g,{default:()=>E}),t.exports=k(g);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,v=class d{static mergeLocales(...e){let a={};return e.forEach(l=>{Object.keys(l).forEach(r=>{typeof l[r]=="object"?a[r]={...a[r],...l[r]}:a[r]=l[r]})}),a}static trimLocale(e,a){let l=(r,s)=>{e[r]&&(s?e[r][s]&&delete e[r][s]:delete e[r])};Object.keys(a).forEach(r=>{Object.keys(a[r]).length>0?Object.keys(a[r]).forEach(s=>l(r,s)):l(r)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let l={};if(a.name||a.locale)l=Object.assign({localeName:a.name},a.locale),a.desc&&(l.localeDesc=a.desc),a.code&&(l.localeCode=a.code),a.path&&(l.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},a)}for(let r of["name","desc","code","path"])l[r]&&delete l[r];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(e){n.bryntum.locales=e}static get localeName(){return n.bryntum.locale||"En"}static set localeName(e){n.bryntum.locale=e||d.localeName}static get locale(){return d.localeName&&this.locales[d.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:l}=n.bryntum,r=d.normalizeLocale(e,a),{localeName:s}=r;return!l[s]||a===!0?l[s]=r:l[s]=this.mergeLocales(l[s]||{},r||{}),l[s]}};T(v,"skipLocaleIntegrityCheck",!1);var b=v;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},b._$name="LocaleHelper";var L={localeName:"Es",localeDesc:"Español",localeCode:"es",Object:{Yes:"Sí",No:"No",Cancel:"Cancelar",Ok:"Correcto",Week:"Semana",None:"Ninguno"},ColorPicker:{noColor:"Sin color"},Combo:{noResults:"Sin resultados",recordNotCommitted:"No se ha podido añadir un registro",addNewValue:o=>`Agregar ${o}`},FilePicker:{file:"Archivo"},Field:{badInput:"Valor de campo no válido",patternMismatch:"El valor debe coincidir con un patrón específico",rangeOverflow:o=>`El valor debe ser inferior o igual a ${o.max}`,rangeUnderflow:o=>`El valor debe ser superior o igual a ${o.min}`,stepMismatch:"El valor debe adaptarse al paso",tooLong:"El valor debe ser más corto",tooShort:"El valor debe ser más largo",typeMismatch:"El valor debe estar en un formato especial",valueMissing:"Este campo es obligatorio",invalidValue:"Valor de campo no válido",minimumValueViolation:"Infracción de valor mínimo",maximumValueViolation:"Infracción de valor máximo",fieldRequired:"Este campo es obligatorio",validateFilter:"El valor debe seleccionarse de la lista"},DateField:{invalidDate:"Entrada de fecha no válida"},DatePicker:{gotoPrevYear:"Ir al año anterior",gotoPrevMonth:"Ir al mes anterior",gotoNextMonth:"Ir al mes siguiente",gotoNextYear:"Ir al año siguiente"},NumberFormat:{locale:"es",currency:"EUR"},DurationField:{invalidUnit:"Unidad no válida"},TimeField:{invalidTime:"Entrada de hora no válida"},TimePicker:{hour:"Hora",minute:"Minuto",second:"Segundo"},List:{loading:"Cargando...",selectAll:"Seleccionar todo"},GridBase:{loadMask:"Cargando...",syncMask:"Guardando cambios, espere..."},PagingToolbar:{firstPage:"Ir a la primera página",prevPage:"Ir a la página anterior",page:"Página",nextPage:"Ir a la página siguiente",lastPage:"Ir a la última página",reload:"Refrescar la página actual",noRecords:"Sin registros que mostrar",pageCountTemplate:o=>`de ${o.lastPage}`,summaryTemplate:o=>`Mostrando registros ${o.start} - ${o.end} de ${o.allCount}`},PanelCollapser:{Collapse:"Contrar",Expand:"Expandir"},Popup:{close:"Cerrar desplegable"},UndoRedo:{Undo:"Deshacer",Redo:"Rehacer",UndoLastAction:"Deshacer la última acción",RedoLastAction:"Rehacer la última acción deshecha",NoActions:"Sin elementos en la cola de deshacer"},FieldFilterPicker:{equals:"equivale a",doesNotEqual:"no equivale a",isEmpty:"está vacío",isNotEmpty:"no está vacío",contains:"contiene",doesNotContain:"no contiene",startsWith:"empieza por",endsWith:"termina por",isOneOf:"es uno de",isNotOneOf:"no es uno de",isGreaterThan:"es mayor que",isLessThan:"es menor que",isGreaterThanOrEqualTo:"es mayor que o igual a",isLessThanOrEqualTo:"es menor que o igual a",isBetween:"está entre",isNotBetween:"no está entre",isBefore:"es anterior",isAfter:"es posterior",isToday:"es hoy",isTomorrow:"es mañana",isYesterday:"fue ayer",isThisWeek:"es esta semana",isNextWeek:"es la semana que viene",isLastWeek:"fue la semana pasada",isThisMonth:"es este mes",isNextMonth:"es el mes que viene",isLastMonth:"fue el mes pasado",isThisYear:"es este año",isNextYear:"es el año que viene",isLastYear:"fue el año pasado",isYearToDate:"es el año hasta la fecha",isTrue:"es cierto",isFalse:"es falso",selectAProperty:"Seleccionar una propiedad",selectAnOperator:"Seleccionar un operador",caseSensitive:"Diferencia entre mayúsculas y minúsculas",and:"y",dateFormat:"D/M/YY",selectValue:"Seleccione valor",selectOneOrMoreValues:"Seleccionar uno o más valores",enterAValue:"Introducir un valor",enterANumber:"Introducir un número",selectADate:"Seleccionar fecha",selectATime:"Seleccionar hora"},FieldFilterPickerGroup:{addFilter:"Añadir filtro"},DateHelper:{locale:"es",weekStartDay:1,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"milisegundo",plural:"ms",abbrev:"ms"},{single:"segundo",plural:"segundos",abbrev:"s"},{single:"minuto",plural:"minutos",abbrev:"min"},{single:"hora",plural:"horas",abbrev:"h"},{single:"día",plural:"días",abbrev:"d"},{single:"semana",plural:"semanas",abbrev:"sem."},{single:"mes",plural:"meses",abbrev:"mes"},{single:"trimestre",plural:"trimestres",abbrev:"trim."},{single:"año",plural:"años",abbrev:"a."},{single:"década",plural:"décadas",abbrev:"déc."}],unitAbbreviations:[["mil"],["s","seg"],["m","min"],["h","hr"],["d"],["sem.","sem"],["m","mes"],["T","trim"],["a","añ"],["déc"]],parsers:{L:"DD/MM/YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>o+"°"}},C=b.publishLocale(L),N={localeName:"Es",localeDesc:"Español",localeCode:"es",GridBase:{loadFailedMessage:"Fallo al cargar los datos",syncFailedMessage:"Fallo al sincronizar los datos"},CrudManagerView:{serverResponseLabel:"Respuesta del servidor:"},TaskBoard:{column:"columna",columns:"columnas",Columns:"Columnas",swimlane:"carril",swimlanes:"carriles",Swimlanes:"Carriles",task:"tarea",tasks:"tareas",addTask:"Añadir L{TaskBoard.task}",cancel:"Cancelar",changeColumn:"Cambiar L{TaskBoard.column}",changeSwimlane:"Cambiar L{TaskBoard.swimlane}",collapse:o=>`Contraer ${o}`,color:"Color",description:"Descripción",editTask:"Editar L{TaskBoard.task}",expand:o=>`Expandir ${o}`,filterColumns:"Filtrar L{TaskBoard.columns}",filterSwimlanes:"Filtrar L{TaskBoard.swimlanes}",filterTasks:"Filtrar L{TaskBoard.tasks}",moveColumnLeft:"Mover L{TaskBoard.column} a la izquierda",moveColumnRight:"Mover L{TaskBoard.column} a la derecha",name:"Nombre",newTaskName:"Nueva L{TaskBoard.task}",removeTask:"Quitar L{TaskBoard.task}",removeTasks:"Quitar L{TaskBoard.tasks}",resources:"Recursos",save:"Guardar",scrollToColumn:"Desplazarse hasta L{TaskBoard.column}",scrollToSwimlane:"Desplazarse hasta L{TaskBoard.swimlane}",zoom:"Zoom"},TodoListField:{add:"Añadir",newTodo:"Nueva tarea pendiente"},UndoRedo:{UndoLastAction:"Deshacer",RedoLastAction:"Rehacer"}},E=b.publishLocale(N);if(typeof t.exports=="object"&&typeof c=="object"){var w=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,r)&&r!==a&&Object.defineProperty(o,r,{get:()=>e[r],enumerable:!(l=Object.getOwnPropertyDescriptor(e,r))||l.enumerable});return o};t.exports=w(t.exports,c)}return t.exports});