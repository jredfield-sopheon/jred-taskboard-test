import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/No.js';

const locale = {

    localeName : 'No',
    localeDesc : 'Norsk',
    localeCode : 'no',

    GridBase : {
        loadFailedMessage : 'Datainnlasting mislyktes!',
        syncFailedMessage : 'Datasynkroniserg mislyktes!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Serversvar:'
    },

    TaskBoard : {
        column           : 'kolonne',
        columns          : 'kolonner',
        Columns          : 'Kolonner',
        swimlane         : 'svømmebanediagram',
        swimlanes        : 'svømmebanediagrammer',
        Swimlanes        : 'Svømmebanediagrammer',
        task             : 'oppgave',
        tasks            : 'oppgaver',
        addTask          : 'Legg til L{TaskBoard.task}',
        cancel           : 'Avbryt',
        changeColumn     : 'Endre L{TaskBoard.column}',
        changeSwimlane   : 'Endre L{TaskBoard.swimlane}',
        collapse         : text => `Skjul ${text}`,
        color            : 'Farge',
        description      : 'Beskrivelse',
        editTask         : 'Rediger L{TaskBoard.task}',
        expand           : text => `Utvid ${text}`,
        filterColumns    : 'Filtrer L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrer L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrer L{TaskBoard.tasks}',
        moveColumnLeft   : 'Flytt L{TaskBoard.column} venstre',
        moveColumnRight  : 'Flytt L{TaskBoard.column} høyre',
        name             : 'Navn',
        newTaskName      : 'Ny L{TaskBoard.task}',
        removeTask       : 'Fjern L{TaskBoard.task}',
        removeTasks      : 'Fjern L{TaskBoard.tasks}',
        resources        : 'Ressurser',
        save             : 'Lagre',
        scrollToColumn   : 'Bla til L{TaskBoard.column}',
        scrollToSwimlane : 'Bla til L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Legg til',
        newTodo : 'Nytt gjøremål'
    },

    UndoRedo : {
        UndoLastAction : 'Angre',
        RedoLastAction : 'Gjør om'
    }
};

export default LocaleHelper.publishLocale(locale);
