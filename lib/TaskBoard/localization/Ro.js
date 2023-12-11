import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ro.js';

const locale = {

    localeName : 'Ro',
    localeDesc : 'Română',
    localeCode : 'ro',

    GridBase : {
        loadFailedMessage : 'Încărcarea datelor a eșuat!',
        syncFailedMessage : 'Sincronizarea datelor a eșuat!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Răspuns de la server:'
    },

    TaskBoard : {
        column           : 'coloană',
        columns          : 'coloane',
        Columns          : 'Coloane',
        swimlane         : 'culoar',
        swimlanes        : 'culoare',
        Swimlanes        : 'Culoare',
        task             : 'sarcină',
        tasks            : 'sarcini',
        addTask          : 'Adăugare L{TaskBoard.task}',
        cancel           : 'Anulare',
        changeColumn     : 'Modificare L{TaskBoard.column}',
        changeSwimlane   : 'Modificare L{TaskBoard.swimlane}',
        collapse         : text => `Restrângere ${text}`,
        color            : 'Culoare',
        description      : 'Descriere',
        editTask         : 'Editare L{TaskBoard.task}',
        expand           : text => `Extindere ${text}`,
        filterColumns    : 'Filtrare L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrare L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrare L{TaskBoard.tasks}',
        moveColumnLeft   : 'Mutare L{TaskBoard.column} la stânga',
        moveColumnRight  : 'Mutare L{TaskBoard.column} la dreapta',
        name             : 'Nume',
        newTaskName      : 'Nou L{TaskBoard.task}',
        removeTask       : 'Eliminare L{TaskBoard.task}',
        removeTasks      : ' Eliminare L{TaskBoard.tasks}',
        resources        : 'Resurse',
        save             : 'Salvare',
        scrollToColumn   : 'Derulare la L{TaskBoard.column}',
        scrollToSwimlane : 'Derulare la L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Adăugare',
        newTodo : 'Sarcină nouă'
    },

    UndoRedo : {
        UndoLastAction : 'Anulare',
        RedoLastAction : 'Refacere'
    }
};

export default LocaleHelper.publishLocale(locale);
