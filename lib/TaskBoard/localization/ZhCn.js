import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/ZhCn.js';

const locale = {

    localeName : 'ZhCn',
    localeDesc : '中文（中国）',
    localeCode : 'zh-CN',

    GridBase : {
        loadFailedMessage : '数据加载失败！',
        syncFailedMessage : '数据同步失败！'
    },

    CrudManagerView : {
        serverResponseLabel : '服务器响应：'
    },

    TaskBoard : {
        column           : '栏',
        columns          : '栏',
        Columns          : '栏',
        swimlane         : '泳道',
        swimlanes        : '泳道',
        Swimlanes        : '泳道',
        task             : '任务',
        tasks            : '任务',
        addTask          : '添加L{TaskBoard.task}',
        cancel           : '取消',
        changeColumn     : '变更 L{TaskBoard.column}',
        changeSwimlane   : '变更 L{TaskBoard.swimlane}',
        collapse         : text => `折叠 ${text}`,
        color            : '颜色',
        description      : '说明',
        editTask         : '编辑 L{TaskBoard.task}',
        expand           : text => `展开${text}`,
        filterColumns    : '筛选器 L{TaskBoard.column}',
        filterSwimlanes  : '筛选器 L{TaskBoard.swimlanes}',
        filterTasks      : '筛选器 L{TaskBoard.tasks}',
        moveColumnLeft   : '向左移动 L{TaskBoard.column}',
        moveColumnRight  : '向右移动 L{TaskBoard.column}',
        name             : '名称',
        newTaskName      : '新 L{TaskBoard.task}',
        removeTask       : '移除 L{TaskBoard.task}',
        removeTasks      : '移除 L{TaskBoard.tasks}',
        resources        : '资源',
        save             : '保存',
        scrollToColumn   : '滚动到 L{TaskBoard.column}',
        scrollToSwimlane : '滚动到 L{TaskBoard.swimlane}',
        zoom             : '缩放'
    },

    TodoListField : {
        add     : '添加',
        newTodo : '新待办事项'
    },

    UndoRedo : {
        UndoLastAction : '撤销',
        RedoLastAction : '恢复'
    }
};

export default LocaleHelper.publishLocale(locale);
