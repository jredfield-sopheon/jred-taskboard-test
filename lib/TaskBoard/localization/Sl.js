import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Sl.js';

const locale = {

    localeName : 'Sl',
    localeDesc : 'Slovensko',
    localeCode : 'sl',

    GridBase : {
        loadFailedMessage : 'Nalaganje podatkov ni uspelo!',
        syncFailedMessage : 'Sinhronizacija podatkov ni uspela!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Odziv strežnika:'
    },

    TaskBoard : {
        column           : 'stolpec',
        columns          : 'stolpci',
        Columns          : 'Stolpci',
        swimlane         : 'opravilna proga',
        swimlanes        : 'opravilne proge',
        Swimlanes        : 'Opravilne proge',
        task             : 'opravilo',
        tasks            : 'opravila',
        addTask          : 'Dodaj L{TaskBoard.task}',
        cancel           : 'Prekliči',
        changeColumn     : 'Spremeni L{TaskBoard.column}',
        changeSwimlane   : 'Spremeni L{TaskBoard.swimlane}',
        collapse         : text => ` Strni ${text}`,
        color            : 'Barva',
        description      : 'Opis',
        editTask         : 'Uredi L{TaskBoard.task}',
        expand           : text => `Razširi ${text}`,
        filterColumns    : 'Filtriraj L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtriraj L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtriraj L{TaskBoard.tasks}',
        moveColumnLeft   : 'Premakni L{TaskBoard.column} levo',
        moveColumnRight  : 'Premakni L{TaskBoard.column} desno',
        name             : 'Ime',
        newTaskName      : 'Nov L{TaskBoard.task}',
        removeTask       : 'Odstrani L{TaskBoard.task}',
        removeTasks      : 'Odstrani L{TaskBoard.tasks}',
        resources        : 'Viri',
        save             : 'Shrani',
        scrollToColumn   : 'Pomakni se do L{TaskBoard.column}',
        scrollToSwimlane : 'Pomakni se do L{TaskBoard.swimlane}',
        zoom             : 'Povečava'
    },

    TodoListField : {
        add     : 'Dodaj',
        newTodo : 'Nov seznam opravil'
    },

    UndoRedo : {
        UndoLastAction : 'Razveljavi',
        RedoLastAction : 'Ponovno uveljavi'
    }
};

export default LocaleHelper.publishLocale(locale);
