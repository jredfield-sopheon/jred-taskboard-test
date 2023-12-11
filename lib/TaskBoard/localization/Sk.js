import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Sk.js';

const locale = {

    localeName : 'Sk',
    localeDesc : 'Slovenský',
    localeCode : 'sk',

    GridBase : {
        loadFailedMessage : 'Načítanie údajov zlyhalo!',
        syncFailedMessage : 'Synchronizácia údajov zlyhala!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Odpoveď servera:'
    },

    TaskBoard : {
        column           : 'stĺpec',
        columns          : 'stĺpce',
        Columns          : 'Stĺpce',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlane diagram',
        Swimlanes        : 'Swimlane',
        task             : 'úloha',
        tasks            : 'úlohy',
        addTask          : 'Pridať L{TaskBoard.task}',
        cancel           : 'Zrušiť',
        changeColumn     : 'Zmena L{TaskBoard.column}',
        changeSwimlane   : 'Zmena L{TaskBoard.swimlane}',
        collapse         : text => `Kolaps ${text}`,
        color            : 'Farba',
        description      : 'Popis',
        editTask         : 'Upraviť L{TaskBoard.task}',
        expand           : text => `Expand ${text}`,
        filterColumns    : 'Filtrovať L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrovať L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrovať L{TaskBoard.tasks}',
        moveColumnLeft   : 'Posunúť L{TaskBoard.column} doľava',
        moveColumnRight  : 'Posunúť L{TaskBoard.column} doprava',
        name             : 'Názov',
        newTaskName      : 'Nový L{TaskBoard.task}',
        removeTask       : 'Odstrániť L{TaskBoard.task}',
        removeTasks      : 'Odstrániť L{TaskBoard.tasks}',
        resources        : 'Zdroje',
        save             : 'Uložiť',
        scrollToColumn   : 'Prejsť na L{TaskBoard.column}',
        scrollToSwimlane : 'Prejsť na L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Pridať',
        newTodo : 'Nová úloha'
    },

    UndoRedo : {
        UndoLastAction : 'Vrátiť späť',
        RedoLastAction : 'Prepracovať'
    }
};

export default LocaleHelper.publishLocale(locale);
