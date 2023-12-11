import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Hr.js';

const locale = {

    localeName : 'Hr',
    localeDesc : 'Hrvatski',
    localeCode : 'hr',

    GridBase : {
        loadFailedMessage : 'Učitavanje podataka nije uspjelo!',
        syncFailedMessage : 'Sinkronizacija podataka nije uspjela!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Odgovor poslužitelja:'
    },

    TaskBoard : {
        column           : 'stupac',
        columns          : 'stupci',
        Columns          : 'Stupci',
        swimlane         : 'staza',
        swimlanes        : 'staze',
        Swimlanes        : 'Staze',
        task             : 'zadatak',
        tasks            : 'zadaci',
        addTask          : 'Dodaj L{TaskBoard.task}',
        cancel           : 'Otkaži',
        changeColumn     : 'Promijeni L{TaskBoard.column}',
        changeSwimlane   : 'Promijeni L{TaskBoard.swimlane}',
        collapse         : text => `Sažmi ${text}`,
        color            : 'Boja',
        description      : 'Opis',
        editTask         : 'Uredi L{TaskBoard.task}',
        expand           : text => `Proširi ${text}`,
        filterColumns    : 'Filtriraj L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtriraj L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtriraj L{TaskBoard.tasks}',
        moveColumnLeft   : 'Pomakni L{TaskBoard.column} lijevo',
        moveColumnRight  : 'Pomakni L{TaskBoard.column} desno',
        name             : 'Naziv',
        newTaskName      : 'Novi L{TaskBoard.task}',
        removeTask       : 'Ukloni L{TaskBoard.task}',
        removeTasks      : 'Ukloni L{TaskBoard.tasks}',
        resources        : 'Resursi',
        save             : 'Spremi',
        scrollToColumn   : 'Pomakni se do L{TaskBoard.column}',
        scrollToSwimlane : 'Pomakni se do L{TaskBoard.swimlane}',
        zoom             : 'Povećaj ili smanji'
    },

    TodoListField : {
        add     : 'Dodaj',
        newTodo : 'Nova obaveza'
    },

    UndoRedo : {
        UndoLastAction : 'Poništi',
        RedoLastAction : 'Vrati poništeno'
    }
};

export default LocaleHelper.publishLocale(locale);
