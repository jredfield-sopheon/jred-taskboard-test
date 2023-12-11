import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/SvSE.js';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',

    GridBase : {
        loadFailedMessage : 'Ett fel har uppstått, vänligen försök igen!',
        syncFailedMessage : 'Datasynkronisering misslyckades!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Serversvar:'
    },

    TaskBoard : {
        column           : 'kolumn',
        columns          : 'kolumner',
        Columns          : 'Kolumner',
        swimlane         : 'simbana',
        swimlanes        : 'simbanor',
        Swimlanes        : 'Simbanor',
        task             : 'uppgift',
        tasks            : 'uppgifter',
        addTask          : 'Lägg till L{TaskBoard.task}',
        cancel           : 'Cancel',
        changeColumn     : 'Byt L{TaskBoard.column}',
        changeSwimlane   : 'Byt L{TaskBoard.swimlane}',
        collapse         : text => `Collapse ${text}`,
        color            : 'Färg',
        description      : 'Beskrivning',
        editTask         : 'Redigera L{TaskBoard.task}',
        expand           : text => `Expandera ${text}`,
        filterColumns    : 'Filtrera L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrera L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrera L{TaskBoard.tasks}',
        moveColumnLeft   : 'Flytta L{TaskBoard.column} vänster',
        moveColumnRight  : 'Flytta L{TaskBoard.column} höger',
        name             : 'Namn',
        newTaskName      : 'Ny L{TaskBoard.task}',
        removeTask       : 'Ta bort L{TaskBoard.task}',
        removeTasks      : 'Ta bort L{TaskBoard.tasks}',
        resources        : 'Resurser',
        save             : 'Spara',
        scrollToColumn   : 'Scrolla till L{TaskBoard.column}',
        scrollToSwimlane : 'Scrolla till L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Lägg till',
        newTodo : 'Ny "att göra"'
    },

    UndoRedo : {
        UndoLastAction : 'Ångra',
        RedoLastAction : 'Gör om'
    }
};

export default LocaleHelper.publishLocale(locale);
