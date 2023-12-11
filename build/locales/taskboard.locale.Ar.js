/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
(function(c,s){var i=typeof exports=="object";if(typeof define=="function"&&define.amd)define([],s);else if(typeof module=="object"&&module.exports)module.exports=s();else{var d=s(),p=i?exports:c;for(var u in d)p[u]=d[u]}})(typeof self<"u"?self:void 0,()=>{var c={},s={exports:c},i=Object.defineProperty,d=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,u=Object.prototype.hasOwnProperty,y=(o,e,a)=>e in o?i(o,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):o[e]=a,v=(o,e)=>{for(var a in e)i(o,a,{get:e[a],enumerable:!0})},k=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of p(e))!u.call(o,t)&&t!==a&&i(o,t,{get:()=>e[t],enumerable:!(l=d(e,t))||l.enumerable});return o},h=o=>k(i({},"__esModule",{value:!0}),o),T=(o,e,a)=>(y(o,typeof e!="symbol"?e+"":e,a),a),f={};v(f,{default:()=>w}),s.exports=h(f);var n=typeof self<"u"?self:typeof globalThis<"u"?globalThis:null,g=class m{static mergeLocales(...e){let a={};return e.forEach(l=>{Object.keys(l).forEach(t=>{typeof l[t]=="object"?a[t]={...a[t],...l[t]}:a[t]=l[t]})}),a}static trimLocale(e,a){let l=(t,r)=>{e[t]&&(r?e[t][r]&&delete e[t][r]:delete e[t])};Object.keys(a).forEach(t=>{Object.keys(a[t]).length>0?Object.keys(a[t]).forEach(r=>l(t,r)):l(t)})}static normalizeLocale(e,a){if(!e)throw new Error('"nameOrConfig" parameter can not be empty');if(typeof e=="string"){if(!a)throw new Error('"config" parameter can not be empty');a.locale?a.name=e||a.name:a.localeName=e}else a=e;let l={};if(a.name||a.locale)l=Object.assign({localeName:a.name},a.locale),a.desc&&(l.localeDesc=a.desc),a.code&&(l.localeCode=a.code),a.path&&(l.localePath=a.path);else{if(!a.localeName)throw new Error(`"config" parameter doesn't have "localeName" property`);l=Object.assign({},a)}for(let t of["name","desc","code","path"])l[t]&&delete l[t];if(!l.localeName)throw new Error("Locale name can not be empty");return l}static get locales(){return n.bryntum.locales||{}}static set locales(e){n.bryntum.locales=e}static get localeName(){return n.bryntum.locale||"En"}static set localeName(e){n.bryntum.locale=e||m.localeName}static get locale(){return m.localeName&&this.locales[m.localeName]||this.locales.En||Object.values(this.locales)[0]||{localeName:"",localeDesc:"",localeCoode:""}}static publishLocale(e,a){let{locales:l}=n.bryntum,t=m.normalizeLocale(e,a),{localeName:r}=t;return!l[r]||a===!0?l[r]=t:l[r]=this.mergeLocales(l[r]||{},t||{}),l[r]}};T(g,"skipLocaleIntegrityCheck",!1);var b=g;n.bryntum=n.bryntum||{},n.bryntum.locales=n.bryntum.locales||{},b._$name="LocaleHelper";var L={localeName:"Ar",localeDesc:"اللغة العربية",localeCode:"ar",Object:{Yes:"نعم",No:"لا",Cancel:"إلغاء",Ok:"موافق",Week:"الأسبوع",None:"لا شيء"},ColorPicker:{noColor:"لا لون"},Combo:{noResults:"لا نتائج",recordNotCommitted:"لا يمكن إضافة السجل",addNewValue:o=>`${o} إضافة`},FilePicker:{file:"ملف"},Field:{badInput:"قيمة الحقل غير صالحة",patternMismatch:"يجب أن تتطابق القيمة مع نمط معين",rangeOverflow:o=>`${o.max} يجب أن تكون القيمة أقل من أو تساوي`,rangeUnderflow:o=>`${o.min} يجب أن تكون القيمة أكبر من أو تساوي`,stepMismatch:"يجب أن تتناسب القيمة مع الخطوة",tooLong:"يجب أن تكون القيمة أقصر",tooShort:"يجب أن تكون القيمة أكبر",typeMismatch:"يجب أن تكون القيمة بتنسيق خاص",valueMissing:"هذا الحقل مطلوب",invalidValue:"قيمة حقل غير صالحة",minimumValueViolation:"تجاوز حد القيمة الأدنى",maximumValueViolation:"تجاوز حد القيمة الأقصى",fieldRequired:"هذا الحقل مطلوب",validateFilter:"يجب تحديد القيمة من القائمة"},DateField:{invalidDate:"تم إدخال تاريخ غير صالح"},DatePicker:{gotoPrevYear:"اذهب إلى السنة السابقة",gotoPrevMonth:"اذهب إلى الشهر السابق",gotoNextMonth:"اذهب إلى الشهر القادم",gotoNextYear:"اذهب إلى السنة القادمة"},NumberFormat:{locale:"ar",currency:"USD"},DurationField:{invalidUnit:"وحدة غير صالحة"},TimeField:{invalidTime:"تم إدخال توقيت غير صالح"},TimePicker:{hour:"ساعة",minute:"دقيقة",second:"ثانية"},List:{loading:"...جارٍ التحميل",selectAll:"اختر الكل"},GridBase:{loadMask:"...جارٍ التحميل",syncMask:"...حفظ التغييرات، يُرجى الانتظار"},PagingToolbar:{firstPage:"اذهب للصفحة الأولى",prevPage:"اذهب للصفحة الثانية",page:"صفحة",nextPage:"اذهب للصفحة التالية",lastPage:"اذهب للصفحة الأخيرة",reload:"إعادة تحميل الصفحة الحالية",noRecords:"لا توجد سجلات لعرضها",pageCountTemplate:o=>`${o.lastPage} من`,summaryTemplate:o=>`${o.allCount} من ${o.end} - ${o.start} عرض السجلات`},PanelCollapser:{Collapse:"تصغير",Expand:"توسيع"},Popup:{close:"أغلق النافذة"},UndoRedo:{Undo:"إلغاء",Redo:"إعادة",UndoLastAction:"إلغاء الإجراء الأخير",RedoLastAction:"إعادة آخر إجراء تم إلغاؤه",NoActions:"لا توجد عناصر في قائمة انتظار الإلغاء"},FieldFilterPicker:{equals:"يساوي",doesNotEqual:"لا يساوي",isEmpty:"فارغ",isNotEmpty:"ليس فارغًا",contains:"يحتوي على",doesNotContain:"لا يحتوي على",startsWith:"يبدأ بـ",endsWith:"ينتهي بـ",isOneOf:"واحد من",isNotOneOf:"ليس واحدًا من",isGreaterThan:"أكبر من",isLessThan:"أقل من",isGreaterThanOrEqualTo:"أكبر من أو يساوي",isLessThanOrEqualTo:"أقل من أو يساوي",isBetween:"يتراوح ما بين",isNotBetween:"لا يتراوح ما بين",isBefore:"قبل",isAfter:"بعد",isToday:"اليوم",isTomorrow:"غدًا",isYesterday:"أمس",isThisWeek:"هذا الأسبوع",isNextWeek:"الأسبوع القادم",isLastWeek:"الأسبوع الماضي",isThisMonth:"هذا الشهر",isNextMonth:"الشهر القادم",isLastMonth:"الشهر الماضي",isThisYear:"هذا العام",isNextYear:"العام القادم",isLastYear:"العام الماضي",isYearToDate:"منذ بداية العام حتى الآن",isTrue:"صحيح",isFalse:"خطأ",selectAProperty:"اختر خاصية",selectAnOperator:"اختر مشغلاً",caseSensitive:"حساسية الموضوع",and:"و",dateFormat:"D/M/YY",selectValue:"اختر قيمة",selectOneOrMoreValues:"اختر قيمة أو أكثر",enterAValue:"أدخل قيمة",enterANumber:"أدخل رقم",selectADate:"اختر تاريخًا",selectATime:"اختر الوقت"},FieldFilterPickerGroup:{addFilter:"أضف عامل تصفية"},DateHelper:{locale:"ar-u-nu-latn",weekStartDay:6,nonWorkingDays:{0:!0,6:!0},weekends:{0:!0,6:!0},unitNames:[{single:"ملليثانية",plural:"مث",abbrev:"مث"},{single:"ثانية",plural:"ثوانٍ",abbrev:"ث"},{single:"دقيقة",plural:"دقائق",abbrev:"د"},{single:"ساعة",plural:"ساعات",abbrev:"س"},{single:"يوم",plural:"أيام",abbrev:"ي"},{single:"أسبوع",plural:"أسابيع",abbrev:"أ"},{single:"شهر",plural:"أشهر",abbrev:"ش"},{single:"ربعسنة",plural:"أرباعسنوات",abbrev:"ر"},{single:"سنة",plural:"سنوات",abbrev:"سن"},{single:"عقد",plural:"عقود",abbrev:"ع"}],unitAbbreviations:[["ملليث"],["ث","ثانية"],["د","دقيقة"],["س","ساعة"],["ي"],["أ","أسبوع"],["ش","شهر","شهر"],["ر","ربعسنة","ربعسنة"],["سن","سنة"],["د"]],parsers:{L:"DD/MM/YYYY",LT:"HH:mm",LTS:"HH:mm:ss A"},ordinalSuffix:o=>o}},P=b.publishLocale(L),N={localeName:"Ar",localeDesc:"اللغة العربية",localeCode:"ar",GridBase:{loadFailedMessage:"!فشل تحميل البيانات",syncFailedMessage:"!فشل تزامن البيانات"},CrudManagerView:{serverResponseLabel:":استجابة الخادم"},TaskBoard:{column:"عمود",columns:"أعمدة",Columns:"أعمدة",swimlane:"حارة السباحة",swimlanes:"حارات السباحة",Swimlanes:"حارات السباحة",task:"المهمة",tasks:"المهام",addTask:"L{TaskBoard.task} إضافة",cancel:"إلغاء",changeColumn:"L{TaskBoard.column} تغيير",changeSwimlane:"L{TaskBoard.swimlane} تغيير",collapse:o=>`${o} تصغير`,color:"لون",description:"وصف",editTask:"L{TaskBoard.task} تعديل",expand:o=>`${o} توسيع`,filterColumns:"L{TaskBoard.columns} تصفية",filterSwimlanes:"L{TaskBoard.swimlanes} تصفية",filterTasks:"L{TaskBoard.tasks} تصفية",moveColumnLeft:" اليسارL{TaskBoard.column} نقل",moveColumnRight:" الحقL{TaskBoard.column} نقل",name:"اسم",newTaskName:"L{TaskBoard.task} جديد",removeTask:"L{TaskBoard.task} إزالة",removeTasks:"L{TaskBoard.tasks} إزالة",resources:"موارد",save:"حفظ",scrollToColumn:"L{TaskBoard.column} التمرير حتى",scrollToSwimlane:"L{TaskBoard.swimlane} التمرير حتى",zoom:"تكبير"},TodoListField:{add:"إضافة",newTodo:"جديدة مهمة"},UndoRedo:{UndoLastAction:"إلغاء",RedoLastAction:"إعادة"}},w=b.publishLocale(N);if(typeof s.exports=="object"&&typeof c=="object"){var O=(o,e,a,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of Object.getOwnPropertyNames(e))!Object.prototype.hasOwnProperty.call(o,t)&&t!==a&&Object.defineProperty(o,t,{get:()=>e[t],enumerable:!(l=Object.getOwnPropertyDescriptor(e,t))||l.enumerable});return o};s.exports=O(s.exports,c)}return s.exports});
