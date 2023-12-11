import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Pl.js';

const locale = {

    localeName : 'Pl',
    localeDesc : 'Polski',
    localeCode : 'pl',

    GridBase : {
        loadFailedMessage : 'Ładowanie danych nie powiodło się',
        syncFailedMessage : 'Synchronizacja danych nie powiodła się! '
    },

    CrudManagerView : {
        serverResponseLabel : 'Odpowiedź serwera:'
    },

    TaskBoard : {
        column           : 'kolumna',
        columns          : 'kolumny',
        Columns          : 'Kolumny',
        swimlane         : 'swimlane',
        swimlanes        : 'diagramy sekwencji działań',
        Swimlanes        : 'Diagramy sekwencji działań',
        task             : 'zadanie',
        tasks            : 'zadania',
        addTask          : 'DodajL{TaskBoard.task}',
        cancel           : 'Anuluj',
        changeColumn     : 'Zmień L{TaskBoard.column}',
        changeSwimlane   : 'Zmień L{TaskBoard.swimlane}',
        collapse         : text => `Zwiń ${text}`,
        color            : 'Pokoloruj',
        description      : 'Opis',
        editTask         : 'Edytuj L{TaskBoard.task}',
        expand           : text => `Expand ${text}`,
        filterColumns    : 'Filtr L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtr L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtr L{TaskBoard.tasks}',
        moveColumnLeft   : 'Przenieś na lewo {TaskBoard.column}',
        moveColumnRight  : 'Przenieś na prawo{TaskBoard.column}',
        name             : 'Nazwa',
        newTaskName      : 'Nowy L{TaskBoard.task}',
        removeTask       : 'Usuń L{TaskBoard.task}',
        removeTasks      : 'Usuń L{TaskBoard.tasks}',
        resources        : 'Zasoby',
        save             : 'Zapisz',
        scrollToColumn   : 'Przewiń do L{TaskBoard.column}',
        scrollToSwimlane : 'Przewiń do L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Dodaj',
        newTodo : 'Nowa lista zadań do wykonania'
    },

    UndoRedo : {
        UndoLastAction : 'Cofnij',
        RedoLastAction : 'Powtórz'
    }
};

export default LocaleHelper.publishLocale(locale);
