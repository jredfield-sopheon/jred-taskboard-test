import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Da.js';

const locale = {

    localeName : 'Da',
    localeDesc : 'Dansk',
    localeCode : 'da',

    GridBase : {
        loadFailedMessage : 'Dataindlæsning mislykkedes!',
        syncFailedMessage : 'Datasynkronisering mislykkedes!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Server svar:'
    },

    TaskBoard : {
        column           : 'kolonne',
        columns          : 'kolonner',
        Columns          : 'kolonner',
        swimlane         : 'svømmebane',
        swimlanes        : 'svømmebane',
        Swimlanes        : 'svømmebane',
        task             : 'opgave',
        tasks            : 'opgaver',
        addTask          : 'Tilføje L{TaskBoard.task}',
        cancel           : 'Afbestille',
        changeColumn     : 'Ændre kolonne{TaskBoard.column}',
        changeSwimlane   : 'Ændre svømmebane{TaskBoard.swimlane}',
        collapse         : text => `Samle ${text}`,
        color            : 'Farve',
        description      : 'Beskrivelse',
        editTask         : 'Redigere L{TaskBoard.task}',
        expand           : text => `Udvid ${text}`,
        filterColumns    : 'Filter L{TaskBoard.columns}',
        filterSwimlanes  : 'Filter L{TaskBoard.swimlanes}',
        filterTasks      : 'Filter L{TaskBoard.tasks}',
        moveColumnLeft   : 'Bevæge sig L{TaskBoard.column} venstre',
        moveColumnRight  : 'Bevæge sig L{TaskBoard.column} højre',
        name             : 'Navn',
        newTaskName      : 'Ny L{TaskBoard.task}',
        removeTask       : 'Fjerne L{TaskBoard.task}',
        removeTasks      : 'Fjerne L{TaskBoard.tasks}',
        resources        : 'Ressourcer',
        save             : 'Gem',
        scrollToColumn   : 'Rul til L{TaskBoard.column}',
        scrollToSwimlane : 'Rul til L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Tilføje',
        newTodo : 'Ny opgave'
    },

    UndoRedo : {
        UndoLastAction : 'Fortryd',
        RedoLastAction : 'Gentag'
    }
};

export default LocaleHelper.publishLocale(locale);
