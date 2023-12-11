import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/He.js';

const locale = {

    localeName : 'He',
    localeDesc : 'עִברִית',
    localeCode : 'he',

    GridBase : {
        loadFailedMessage : 'טעינת הנתונים נכשלה',
        syncFailedMessage : 'סנכרון הנתונים נכשל'
    },

    CrudManagerView : {
        serverResponseLabel : ':תגובת השרת'
    },

    TaskBoard : {
        column           : 'עמודה',
        columns          : 'עמודות',
        Columns          : 'עמודות',
        swimlane         : 'מסלול שחייה',
        swimlanes        : 'מסלולי שחייה',
        Swimlanes        : 'מסלולי שחייה',
        task             : 'משימה',
        tasks            : 'משימות',
        addTask          : 'L{TaskBoard.task} הוסף',
        cancel           : 'בטל',
        changeColumn     : 'L{TaskBoard.column} שנה',
        changeSwimlane   : 'L{TaskBoard.swimlane} שנה',
        collapse         : text => `${text} מזער`,
        color            : 'צבע',
        description      : 'תיאור',
        editTask         : 'L{TaskBoard.task} ערוך',
        expand           : text => `${text} הרחב`,
        filterColumns    : 'L{TaskBoard.columns} סנן',
        filterSwimlanes  : 'L{TaskBoard.swimlanes} סנן',
        filterTasks      : 'L{TaskBoard.tasks} סנן',
        moveColumnLeft   : ' שמאלהL{TaskBoard.column} הזז',
        moveColumnRight  : ' ימינהL{TaskBoard.column} הזז',
        name             : 'שם',
        newTaskName      : 'L{TaskBoard.task} חדש',
        removeTask       : 'L{TaskBoard.task} הסר',
        removeTasks      : 'L{TaskBoard.tasks} הסר',
        resources        : 'משאבים',
        save             : 'שמור',
        scrollToColumn   : 'L{TaskBoard.column}-גלול ל',
        scrollToSwimlane : 'L{TaskBoard.swimlane}-גלול ל',
        zoom             : 'זום'
    },

    TodoListField : {
        add     : 'הוסף',
        newTodo : 'רשימת משימות חדשה'
    },

    UndoRedo : {
        UndoLastAction : 'בטל',
        RedoLastAction : 'בצע שוב'
    }
};

export default LocaleHelper.publishLocale(locale);
