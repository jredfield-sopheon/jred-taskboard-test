import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ja.js';
const locale = {

    localeName : 'Ja',
    localeDesc : '日本語',
    localeCode : 'ja',

    GridBase : {
        loadFailedMessage : 'データの読み込みに失敗しました',
        syncFailedMessage : 'データの同期に失敗しました'
    },

    CrudManagerView : {
        serverResponseLabel : 'サーバーの応答:'
    },

    TaskBoard : {
        column           : '列',
        columns          : '列',
        Columns          : '列',
        swimlane         : 'スイムレーン',
        swimlanes        : 'スイムレーン',
        Swimlanes        : 'スイムレーン',
        task             : 'タスク',
        tasks            : 'タスク',
        addTask          : '追加する L{TaskBoard.task}',
        cancel           : '取り消す',
        changeColumn     : '変更する L{TaskBoard.column}',
        changeSwimlane   : '変更する L{TaskBoard.swimlane}',
        collapse         : text => `縮小する ${text}`,
        color            : '色',
        description      : '説明',
        editTask         : '編集する L{TaskBoard.task}',
        expand           : text => `拡大する ${text}`,
        filterColumns    : 'フィルターする L{TaskBoard.columns}',
        filterSwimlanes  : 'フィルターする L{TaskBoard.swimlanes}',
        filterTasks      : 'フィルターする L{TaskBoard.tasks}',
        moveColumnLeft   : '移動する L{TaskBoard.column} 左',
        moveColumnRight  : '移動する L{TaskBoard.column} 右',
        name             : '名前',
        newTaskName      : '新規の L{TaskBoard.task}',
        removeTask       : '削除する L{TaskBoard.task}',
        removeTasks      : '削除する L{TaskBoard.tasks}',
        resources        : 'リソース',
        save             : '保存する',
        scrollToColumn   : 'スクロールする L{TaskBoard.column}',
        scrollToSwimlane : 'スクロールする L{TaskBoard.swimlane}',
        zoom             : 'ズーム'
    },

    TodoListField : {
        add     : '追加する',
        newTodo : '新規ToDo'
    },

    UndoRedo : {
        UndoLastAction : '元に戻す',
        RedoLastAction : 'やり直す'
    }
};

export default LocaleHelper.publishLocale(locale);
