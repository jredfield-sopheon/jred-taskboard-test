import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Fi.js';

const locale = {

    localeName : 'Fi',
    localeDesc : 'Suomi',
    localeCode : 'fi',

    GridBase : {
        loadFailedMessage : 'Tietojen lataus epäonnistui!',
        syncFailedMessage : 'Tietojen synkronisointi epäonnistui!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Palvelimen vastaus:'
    },

    TaskBoard : {
        column           : 'sarake',
        columns          : 'sarakkeet',
        Columns          : 'Sarakkeet',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlanes',
        Swimlanes        : 'Swimlanes',
        task             : 'tehtävä',
        tasks            : 'tehtävät',
        addTask          : 'Lisää L{TaskBoard.task}',
        cancel           : 'Peruuta',
        changeColumn     : 'Vaihda L{TaskBoard.column}',
        changeSwimlane   : 'Vaihda L{TaskBoard.swimlane}',
        collapse         : text => `Kaatuminen ${text}`,
        color            : 'Väri',
        description      : 'Kuvaus',
        editTask         : 'Muokkaa L{TaskBoard.task}',
        expand           : text => `Expand ${text}`,
        filterColumns    : 'Suodata L{TaskBoard.columns}',
        filterSwimlanes  : 'Suodata L {TaskBoard.swimlanes}',
        filterTasks      : 'Suodata L {TaskBoard.tasks}',
        moveColumnLeft   : 'Siirrä L{TaskBoard.column} vasemmalle',
        moveColumnRight  : 'Siirrä L{TaskBoard.column} oikealle',
        name             : 'Nimi',
        newTaskName      : 'Uusi L{TaskBoard.task}',
        removeTask       : 'Poista L{TaskBoard.task}',
        removeTasks      : 'Poista L{TaskBoard.tasks}',
        resources        : 'Lähteet',
        save             : 'Tallenna',
        scrollToColumn   : 'Vieritä L{TaskBoard.column}',
        scrollToSwimlane : 'Vieritä L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Lisää',
        newTodo : 'Uusi todo'
    },

    UndoRedo : {
        UndoLastAction : 'Kumoa',
        RedoLastAction : 'Tee uudelleen'
    }
};

export default LocaleHelper.publishLocale(locale);
