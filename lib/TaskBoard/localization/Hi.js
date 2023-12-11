import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Hi.js';

const locale = {

    localeName : 'Hi',
    localeDesc : 'हिन्दी',
    localeCode : 'hi',

    GridBase : {
        loadFailedMessage : 'डेटा लोडिंग विफल रहा!',
        syncFailedMessage : 'डेटा सिक्रोनाइजेशन विफल रहा!'
    },

    CrudManagerView : {
        serverResponseLabel : 'सर्वर प्रतिक्रिया:'
    },

    TaskBoard : {
        column           : 'कॉलम',
        columns          : 'कॉलम',
        Columns          : 'कॉलम',
        swimlane         : 'स्विमलेन',
        swimlanes        : 'स्विमलेन्स',
        Swimlanes        : 'स्विमलेन्स',
        task             : 'टास्क',
        tasks            : 'टास्क',
        addTask          : 'L{TaskBoard.task} जोड़ें',
        cancel           : 'रद्द करें',
        changeColumn     : 'L{TaskBoard.column} बदलें',
        changeSwimlane   : 'L{TaskBoard.swimlane} बदलें',
        collapse         : text => `${text} समेटें`,
        color            : 'रंग',
        description      : 'विवरण',
        editTask         : 'L{TaskBoard.task} संपादित करें',
        expand           : text => `${text} फैलाएं`,
        filterColumns    : 'L{TaskBoard.columns} फिल्टर करें',
        filterSwimlanes  : 'L{TaskBoard.swimlanes} फिल्टर करें',
        filterTasks      : 'L{TaskBoard.tasks} फिल्टर करें',
        moveColumnLeft   : 'L{TaskBoard.column} बाएं ले जाएं',
        moveColumnRight  : 'L{TaskBoard.column} दाएं ले जाएं',
        name             : 'नाम',
        newTaskName      : 'L{TaskBoard.task} नया',
        removeTask       : 'L{TaskBoard.task} निकालें',
        removeTasks      : 'L{TaskBoard.tasks} निकालें',
        resources        : 'संसाधन',
        save             : 'सहेजें',
        scrollToColumn   : 'L{TaskBoard.column} पर स्क्रोल करें',
        scrollToSwimlane : 'L{TaskBoard.swimlane} पर स्क्रोल करें',
        zoom             : 'ज़ूम करें'
    },

    TodoListField : {
        add     : 'जोड़ें',
        newTodo : 'नया कार्य'
    },

    UndoRedo : {
        UndoLastAction : 'अनडू करें',
        RedoLastAction : 'रीडू करें'
    }
};

export default LocaleHelper.publishLocale(locale);
