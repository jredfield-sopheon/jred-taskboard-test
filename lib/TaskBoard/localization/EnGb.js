import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/EnGb.js';

const locale = {

    localeName : 'EnGb',
    localeDesc : 'English (GB)',
    localeCode : 'en-GB',

    GridBase : {
        loadFailedMessage : 'Data loading failed!',
        syncFailedMessage : 'Data synchronisation failed!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Server response:'
    },

    TaskBoard : {
        column           : 'column',
        columns          : 'columns',
        Columns          : 'Columns',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlanes',
        Swimlanes        : 'Swimlanes',
        task             : 'task',
        tasks            : 'tasks',
        addTask          : 'Add L{TaskBoard.task}',
        cancel           : 'Cancel',
        changeColumn     : 'Change L{TaskBoard.column}',
        changeSwimlane   : 'Change L{TaskBoard.swimlane}',
        collapse         : text => `Collapse ${text}`,
        color            : 'Color',
        description      : 'Description',
        editTask         : 'Edit L{TaskBoard.task}',
        expand           : text => `Expand ${text}`,
        filterColumns    : 'Filter L{TaskBoard.columns}',
        filterSwimlanes  : 'Filter L{TaskBoard.swimlanes}',
        filterTasks      : 'Filter L{TaskBoard.tasks}',
        moveColumnLeft   : 'Move L{TaskBoard.column} left',
        moveColumnRight  : 'Move L{TaskBoard.column} right',
        name             : 'Name',
        newTaskName      : 'New L{TaskBoard.task}',
        removeTask       : 'Remove L{TaskBoard.task}',
        removeTasks      : 'Remove L{TaskBoard.tasks}',
        resources        : 'Resources',
        save             : 'Save',
        scrollToColumn   : 'Scroll to L{TaskBoard.column}',
        scrollToSwimlane : 'Scroll to L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Add',
        newTodo : 'New todo'
    },

    UndoRedo : {
        UndoLastAction : 'Undo',
        RedoLastAction : 'Redo'
    }
};

export default LocaleHelper.publishLocale(locale);
