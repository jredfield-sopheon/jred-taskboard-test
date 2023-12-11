import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Sr.js';

const locale = {

    localeName : 'Sr',
    localeDesc : 'Srpski',
    localeCode : 'sr',

    GridBase : {
        loadFailedMessage : 'Učitavanje podataka nije uspelo!',
        syncFailedMessage : 'Sinhronizacija podataka nije uspela!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Odgovor servera:'
    },

    TaskBoard : {
        column           : 'kolona',
        columns          : 'kolone',
        Columns          : 'Kolone',
        swimlane         : 'traka korisnika',
        swimlanes        : 'trake korisnika',
        Swimlanes        : 'Trake korisnika',
        task             : 'zadatak',
        tasks            : 'zadaci',
        addTask          : 'Dodaj L{TaskBoard.task}',
        cancel           : 'Otkaži',
        changeColumn     : 'Promeni L{TaskBoard.column}',
        changeSwimlane   : 'Promeni L{TaskBoard.swimlane}',
        collapse         : text => `Skupi ${text}`,
        color            : 'Boja',
        description      : 'Opis',
        editTask         : 'Uredi L{TaskBoard.task}',
        expand           : text => `Proširi ${text}`,
        filterColumns    : 'Filtriraj L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtriraj L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtriraj L{TaskBoard.tasks}',
        moveColumnLeft   : 'Pomeri L{TaskBoard.column} nalevo',
        moveColumnRight  : 'Pomeri L{TaskBoard.column} udesno',
        name             : 'Ime',
        newTaskName      : 'Novi L{TaskBoard.task}',
        removeTask       : 'Ukloni L{TaskBoard.task}',
        removeTasks      : 'Ukloni L{TaskBoard.tasks}',
        resources        : 'Resursi',
        save             : 'Sačuvaj',
        scrollToColumn   : 'Idi na L{TaskBoard.column}',
        scrollToSwimlane : 'Idi na L{TaskBoard.swimlane}',
        zoom             : 'Zum'
    },

    TodoListField : {
        add     : 'Dodaj',
        newTodo : 'Novo zaduženje'
    },

    UndoRedo : {
        UndoLastAction : 'Opozovi',
        RedoLastAction : 'Uradi ponovo'
    }
};

export default LocaleHelper.publishLocale(locale);
