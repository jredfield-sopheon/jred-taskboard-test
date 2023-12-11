import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ar.js';

const locale = {

    localeName : 'Ar',
    localeDesc : 'اللغة العربية',
    localeCode : 'ar',

    GridBase : {
        loadFailedMessage : '!فشل تحميل البيانات',
        syncFailedMessage : '!فشل تزامن البيانات'
    },

    CrudManagerView : {
        serverResponseLabel : ':استجابة الخادم'
    },

    TaskBoard : {
        column           : 'عمود',
        columns          : 'أعمدة',
        Columns          : 'أعمدة',
        swimlane         : 'حارة السباحة',
        swimlanes        : 'حارات السباحة',
        Swimlanes        : 'حارات السباحة',
        task             : 'المهمة',
        tasks            : 'المهام',
        addTask          : 'L{TaskBoard.task} إضافة',
        cancel           : 'إلغاء',
        changeColumn     : 'L{TaskBoard.column} تغيير',
        changeSwimlane   : 'L{TaskBoard.swimlane} تغيير',
        collapse         : text => `${text} تصغير`,
        color            : 'لون',
        description      : 'وصف',
        editTask         : 'L{TaskBoard.task} تعديل',
        expand           : text => `${text} توسيع`,
        filterColumns    : 'L{TaskBoard.columns} تصفية',
        filterSwimlanes  : 'L{TaskBoard.swimlanes} تصفية',
        filterTasks      : 'L{TaskBoard.tasks} تصفية',
        moveColumnLeft   : ' اليسارL{TaskBoard.column} نقل',
        moveColumnRight  : ' الحقL{TaskBoard.column} نقل',
        name             : 'اسم',
        newTaskName      : 'L{TaskBoard.task} جديد',
        removeTask       : 'L{TaskBoard.task} إزالة',
        removeTasks      : 'L{TaskBoard.tasks} إزالة',
        resources        : 'موارد',
        save             : 'حفظ',
        scrollToColumn   : 'L{TaskBoard.column} التمرير حتى',
        scrollToSwimlane : 'L{TaskBoard.swimlane} التمرير حتى',
        zoom             : 'تكبير'
    },

    TodoListField : {
        add     : 'إضافة',
        newTodo : 'جديدة مهمة'
    },

    UndoRedo : {
        UndoLastAction : 'إلغاء',
        RedoLastAction : 'إعادة'
    }
};

export default LocaleHelper.publishLocale(locale);
