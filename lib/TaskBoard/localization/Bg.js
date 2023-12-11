import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Bg.js';

const locale = {

    localeName : 'Bg',
    localeDesc : 'Български',
    localeCode : 'bg',

    GridBase : {
        loadFailedMessage : 'Зареждането на данните е неуспешно!',
        syncFailedMessage : 'Синхронизацията на данните е неуспешна!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Отговор на сървъра:'
    },

    TaskBoard : {
        column           : 'колона',
        columns          : 'колони',
        Columns          : 'Колони',
        swimlane         : 'swimlane диаграма',
        swimlanes        : 'swimlane диаграми',
        Swimlanes        : 'Swimlane диаграми',
        task             : 'задача',
        tasks            : 'задачи',
        addTask          : 'Добавяне на L{TaskBoard.task}',
        cancel           : 'Отказ',
        changeColumn     : 'Промяна на L{TaskBoard.column}',
        changeSwimlane   : 'Промяна на L{TaskBoard.swimlane}',
        collapse         : text => `Свиване ${text}`,
        color            : 'Цвят',
        description      : 'Описание',
        editTask         : 'Редактиране на L{TaskBoard.task}',
        expand           : text => `Разгъване на ${text}`,
        filterColumns    : 'Филтър L{TaskBoard.columns}',
        filterSwimlanes  : 'Филтър L{TaskBoard.swimlanes}',
        filterTasks      : 'Филтър L{TaskBoard.tasks}',
        moveColumnLeft   : 'Преместване L{TaskBoard.column} наляво',
        moveColumnRight  : 'Преместване L{TaskBoard.column} надясно',
        name             : 'Име',
        newTaskName      : 'Нов L{TaskBoard.task}',
        removeTask       : 'Премахване на L{TaskBoard.task}',
        removeTasks      : 'Премахване на L{TaskBoard.tasks}',
        resources        : 'Ресурси',
        save             : 'Запис',
        scrollToColumn   : 'Превъртане до L{TaskBoard.column}',
        scrollToSwimlane : 'Превъртане до L{TaskBoard.swimlane}',
        zoom             : 'Увеличаване'
    },

    TodoListField : {
        add     : 'Добавяне',
        newTodo : 'Нова задача'
    },

    UndoRedo : {
        UndoLastAction : 'Отмяна',
        RedoLastAction : 'Възстановяване'
    }
};

export default LocaleHelper.publishLocale(locale);
