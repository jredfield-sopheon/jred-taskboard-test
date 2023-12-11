import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/It.js';

const locale = {

    localeName : 'It',
    localeDesc : 'Italiano',
    localeCode : 'it',

    GridBase : {
        loadFailedMessage : 'Caricamento dati non riuscito!',
        syncFailedMessage : 'Sincronizzazione dati non riuscita!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Risposta del server:'
    },

    TaskBoard : {
        column           : 'colonna',
        columns          : 'colonne',
        Columns          : 'Colonne',
        swimlane         : 'swim lane',
        swimlanes        : 'swim lane',
        Swimlanes        : 'Swim lane',
        task             : 'attività',
        tasks            : 'attività',
        addTask          : 'Aggiungi L{TaskBoard.task}',
        cancel           : 'Annulla',
        changeColumn     : 'Cambia L{TaskBoard.column}',
        changeSwimlane   : 'Cambia L{TaskBoard.swimlane}',
        collapse         : text => `Comprimi ${text}`,
        color            : 'Colore',
        description      : 'Descrizione',
        editTask         : 'Modifica L{TaskBoard.task}',
        expand           : text => `Espandi ${text}`,
        filterColumns    : 'Filtra L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtra L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtra L{TaskBoard.tasks}',
        moveColumnLeft   : 'Sposta L{TaskBoard.column} a sinistra',
        moveColumnRight  : 'Sposta L{TaskBoard.column} a destra',
        name             : 'Nome',
        newTaskName      : 'Nuovo L{TaskBoard.task}',
        removeTask       : 'Rimuovi L{TaskBoard.task}',
        removeTasks      : 'Rimuovi L{TaskBoard.tasks}',
        resources        : 'Risorse',
        save             : 'Salva',
        scrollToColumn   : 'Scorri fino a L{TaskBoard.column}',
        scrollToSwimlane : 'Scorri fino a L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Aggiungi',
        newTodo : 'Nuovo elemento da fare'
    },

    UndoRedo : {
        UndoLastAction : 'Annulla',
        RedoLastAction : 'Ripeti'
    }
};

export default LocaleHelper.publishLocale(locale);
