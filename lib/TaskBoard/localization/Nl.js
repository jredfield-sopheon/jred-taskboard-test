import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Nl.js';

const locale = {

    localeName : 'Nl',
    localeDesc : 'Nederlands',
    localeCode : 'nl',

    GridBase : {
        loadFailedMessage : 'Laden mislukt!',
        syncFailedMessage : 'Gegevenssynchronisatie mislukt!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Server respons:'
    },

    TaskBoard : {
        column           : 'kolom',
        columns          : 'kolommen',
        Columns          : 'Kolommen',
        swimlane         : 'zwembaan',
        swimlanes        : 'zwembanen',
        Swimlanes        : 'Zwembanen',
        task             : 'taak',
        tasks            : 'taken',
        addTask          : 'Toevoegen L{TaskBoard.task}',
        cancel           : 'Annuleren',
        changeColumn     : 'wijzig L{TaskBoard.column}',
        changeSwimlane   : 'wijzig L{TaskBoard.swimlane}',
        collapse         : text => `Kollapse ${text}`,
        color            : 'Kleur',
        description      : 'Beschrijving',
        editTask         : 'Bewerk L{TaskBoard.task}',
        expand           : text => `Utvide ${text}`,
        filterColumns    : 'Filter L{TaskBoard.columns}',
        filterSwimlanes  : 'Filter L{TaskBoard.swimlanes}',
        filterTasks      : 'Filter L{TaskBoard.tasks}',
        moveColumnLeft   : 'Bevege seg L{TaskBoard.column} venstre',
        moveColumnRight  : 'Bevege seg L{TaskBoard.column} riktig',
        name             : 'Naam',
        newTaskName      : 'Nieuw L{TaskBoard.task}',
        removeTask       : 'Verwijder L{TaskBoard.task}',
        removeTasks      : 'Verwijder L{TaskBoard.tasks}',
        resources        : 'Resources',
        save             : 'Bewaar',
        scrollToColumn   : 'Scroll naar L{TaskBoard.column}',
        scrollToSwimlane : 'Scroll naar L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Toevoegen',
        newTodo : 'Nieuw'
    },

    UndoRedo : {
        UndoLastAction : 'Ongedaan maken',
        RedoLastAction : 'Opnieuw uitvoeren'
    }
};

export default LocaleHelper.publishLocale(locale);
