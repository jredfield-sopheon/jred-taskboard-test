import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/De.js';

const locale = {

    localeName : 'De',
    localeDesc : 'Deutsch',
    localeCode : 'de-DE',

    GridBase : {
        loadFailedMessage : 'Das Laden der Daten ist fehlgeschlagen!',
        syncFailedMessage : 'Datensynchronisation fehlgeschlagen!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Serverantwort:'
    },

    TaskBoard : {
        column           : 'spalte',
        columns          : 'spalten',
        Columns          : 'Spalten',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlanes',
        Swimlanes        : 'Swimlanes',
        task             : 'Aufgabe',
        tasks            : 'Aufgaben',
        addTask          : 'Hinzufügen L{TaskBoard.task}',
        cancel           : 'Abbrechen',
        changeColumn     : 'ändern L{TaskBoard.column}',
        changeSwimlane   : 'ändern L{TaskBoard.swimlane}',
        collapse         : text => `Einklappen ${text}`,
        color            : 'farbe',
        description      : 'Beschreibung',
        editTask         : 'bearbeiten L{TaskBoard.task}',
        expand           : text => `Ausklappen${text}`,
        filterColumns    : 'Filtern L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtern L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtern L{TaskBoard.tasks}',
        moveColumnLeft   : 'Bewegen L{TaskBoard.column} nach links',
        moveColumnRight  : 'Bewegen L{TaskBoard.column} nach rechts',
        name             : 'Name',
        newTaskName      : 'Neu L{TaskBoard.task}',
        removeTask       : 'Löschen L{TaskBoard.task}',
        removeTasks      : 'Löschen L{TaskBoard.tasks}',
        resources        : 'Ressourcen',
        save             : 'Speichern',
        scrollToColumn   : 'Scrollen zu L{TaskBoard.column}',
        scrollToSwimlane : 'Scrollen zu L{TaskBoard.swimlane}',
        zoom             : 'Zoomen'
    },

    TodoListField : {
        add     : 'Hinzufügen',
        newTodo : 'Neues To-Do'
    },

    UndoRedo : {
        UndoLastAction : 'Rückgängig machen',
        RedoLastAction : 'Wiederholen'
    }
};

export default LocaleHelper.publishLocale(locale);
