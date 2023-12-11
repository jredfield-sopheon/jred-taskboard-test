import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Cs.js';

const locale = {

    localeName : 'Cs',
    localeDesc : 'Česky',
    localeCode : 'cs',

    GridBase : {
        loadFailedMessage : 'Načítání dat se nezdařilo!',
        syncFailedMessage : 'Synchronizace dat se nezdařila!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Odezva serveru:'
    },

    TaskBoard : {
        column           : 'sloupec',
        columns          : 'sloupce',
        Columns          : 'Sloupce',
        swimlane         : 'plavecká dráha',
        swimlanes        : 'plavecké dráhy',
        Swimlanes        : 'Plavecké dráhy',
        task             : 'úkol',
        tasks            : 'úkoly',
        addTask          : 'Přidat L{TaskBoard.task}',
        cancel           : 'Zrušit',
        changeColumn     : 'Změnit L{TaskBoard.column}',
        changeSwimlane   : 'Změnit L{TaskBoard.swimlane}',
        collapse         : text => `Sbalit ${text}`,
        color            : 'Barva',
        description      : 'Popis',
        editTask         : 'Upravit L{TaskBoard.task}',
        expand           : text => `Expand ${text}`,
        filterColumns    : 'Filtr L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtr L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtr L{TaskBoard.tasks}',
        moveColumnLeft   : 'Pohyb L{TaskBoard.column} doleva',
        moveColumnRight  : 'Pohyb L{TaskBoard.column} doprava',
        name             : 'Název',
        newTaskName      : 'Nový L{TaskBoard.task}',
        removeTask       : 'Odebrat L{TaskBoard.task}',
        removeTasks      : 'Odebrat L{TaskBoard.tasks}',
        resources        : 'Zdroje',
        save             : 'Uložit',
        scrollToColumn   : 'Přejít na L{TaskBoard.column}',
        scrollToSwimlane : 'Přejít na L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Přidat',
        newTodo : 'Nový úkol'
    },

    UndoRedo : {
        UndoLastAction : 'Vrátit',
        RedoLastAction : 'Zopakovat'
    }
};

export default LocaleHelper.publishLocale(locale);
