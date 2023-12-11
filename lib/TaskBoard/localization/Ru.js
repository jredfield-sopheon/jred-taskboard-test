import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ru.js';

const locale = {

    localeName : 'Ru',
    localeDesc : 'Русский',
    localeCode : 'ru',

    GridBase : {
        loadFailedMessage : 'Не удалось загрузить!',
        syncFailedMessage : 'Не удалось синхронизировать!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Ответ сервера:'
    },

    TaskBoard : {
        column           : 'колонку',
        columns          : 'колонки',
        Columns          : 'Колонки',
        swimlane         : 'полосу',
        swimlanes        : 'полосы',
        Swimlanes        : 'Полосы',
        task             : 'задачу',
        tasks            : 'задачи',
        addTask          : 'Добавить L{TaskBoard.task}',
        cancel           : 'Отмена',
        changeColumn     : 'Изменить L{TaskBoard.column}',
        changeSwimlane   : 'Изменить L{TaskBoard.swimlane}',
        collapse         : text => `Сжать ${text}`,
        color            : 'Цвет',
        description      : 'Описание',
        editTask         : 'Изменить L{TaskBoard.task}',
        expand           : text => `Расширить ${text}`,
        filterColumns    : 'Фильтровать L{TaskBoard.columns}',
        filterSwimlanes  : 'Фильтровать L{TaskBoard.swimlanes}',
        filterTasks      : 'Фильтровать L{TaskBoard.tasks}',
        moveColumnLeft   : 'Переместить L{TaskBoard.column} влево',
        moveColumnRight  : 'Переместить L{TaskBoard.column} вправо',
        name             : 'Имя',
        newTaskName      : 'Создать L{TaskBoard.task}',
        removeTask       : 'Удалить L{TaskBoard.task}',
        removeTasks      : 'Удалить L{TaskBoard.tasks}',
        resources        : 'Ресурсы',
        save             : 'Сохранить',
        scrollToColumn   : 'Переместиться в L{TaskBoard.column}',
        scrollToSwimlane : 'Переместиться в L{TaskBoard.swimlane}',
        zoom             : 'Увеличить'
    },

    TodoListField : {
        add     : 'Добавить',
        newTodo : 'Новая задача'
    },

    UndoRedo : {
        UndoLastAction : 'Повторить',
        RedoLastAction : 'Отменить'
    }
};

export default LocaleHelper.publishLocale(locale);
