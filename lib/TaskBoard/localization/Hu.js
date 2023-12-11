import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Hu.js';

const locale = {

    localeName : 'Hu',
    localeDesc : 'Magyar',
    localeCode : 'hu',

    GridBase : {
        loadFailedMessage : 'Adatok betöltése sikertelen!',
        syncFailedMessage : 'Adatszinkronizálás sikertelen!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Szerverválasz:'
    },

    TaskBoard : {
        column           : 'oszlop',
        columns          : 'oszlop',
        Columns          : 'Oszlopok',
        swimlane         : 'sáv',
        swimlanes        : 'sáv',
        Swimlanes        : 'Sáv',
        task             : 'feladat',
        tasks            : 'feladat',
        addTask          : 'L{TaskBoard.task} hozzáadása',
        cancel           : 'Mégse',
        changeColumn     : 'L{TaskBoard.column} módosítása',
        changeSwimlane   : 'L{TaskBoard.swimlane} módosítása',
        collapse         : text => ` ${text} összecsukása`,
        color            : 'Szín',
        description      : 'Leírás',
        editTask         : 'L{TaskBoard.task} szerkesztése',
        expand           : text => ` ${text} kibontása`,
        filterColumns    : 'L{TaskBoard.columns} szűrése',
        filterSwimlanes  : 'L{TaskBoard.swimlanes} szűrése',
        filterTasks      : 'L{TaskBoard.tasks} szűrése',
        moveColumnLeft   : 'L{TaskBoard.column} mozgatása balra',
        moveColumnRight  : 'L{TaskBoard.column} mozgatása jobbra',
        name             : 'Név',
        newTaskName      : 'Új L{TaskBoard.task}',
        removeTask       : 'L{TaskBoard.task} eltávolítása',
        removeTasks      : 'L{TaskBoard.tasks} eltávolítása',
        resources        : 'Erőforrások',
        save             : 'Mentés',
        scrollToColumn   : 'Görgetés ide: L{TaskBoard.column}',
        scrollToSwimlane : 'Görgetés ide: L{TaskBoard.swimlane}',
        zoom             : 'Nagyítás'
    },

    TodoListField : {
        add     : 'Hozzáadás',
        newTodo : 'Új teendő'
    },

    UndoRedo : {
        UndoLastAction : 'Mégse',
        RedoLastAction : 'Mégis'
    }
};

export default LocaleHelper.publishLocale(locale);
