import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Et.js';

const locale = {

    localeName : 'Et',
    localeDesc : 'Eesti keel',
    localeCode : 'et',

    GridBase : {
        loadFailedMessage : 'Andmete laadimine nurjus!',
        syncFailedMessage : 'Andmete sünkroonimine nurjus!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Serveri vastus:'
    },

    TaskBoard : {
        column           : 'veerg',
        columns          : 'veerud',
        Columns          : 'Veerud',
        swimlane         : 'rada',
        swimlanes        : 'rajad',
        Swimlanes        : 'Rajad',
        task             : 'ülesanne',
        tasks            : 'ülesanded',
        addTask          : 'Lisa L{TaskBoard.task}',
        cancel           : 'Tühista',
        changeColumn     : 'Muuda L{TaskBoard.column}',
        changeSwimlane   : 'Muuda L{TaskBoard.swimlane}',
        collapse         : text => `Koonda ${text}`,
        color            : 'Värv',
        description      : 'Kirjeldus',
        editTask         : 'Redigeeri L{TaskBoard.task}',
        expand           : text => `Laienda ${text}`,
        filterColumns    : 'Filtreeri L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtreeri L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtreeri L{TaskBoard.tasks}',
        moveColumnLeft   : 'Liiguta L{TaskBoard.column} vasakule',
        moveColumnRight  : 'Liiguta L{TaskBoard.column} paremale',
        name             : 'Nimi',
        newTaskName      : 'Uus L{TaskBoard.task}',
        removeTask       : 'Eemalda L{TaskBoard.task}',
        removeTasks      : 'Eemalda L{TaskBoard.tasks}',
        resources        : 'Ressursid',
        save             : 'Salvesta',
        scrollToColumn   : 'Keri kuni L{TaskBoard.column}',
        scrollToSwimlane : 'Keri kuni L{TaskBoard.swimlane}',
        zoom             : 'Suumi'
    },

    TodoListField : {
        add     : 'Lisa',
        newTodo : 'Uus ülesanne'
    },

    UndoRedo : {
        UndoLastAction : 'Ennista',
        RedoLastAction : 'Tee uuesti'
    }
};

export default LocaleHelper.publishLocale(locale);
