import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Vi.js';

const locale = {

    localeName : 'Vi',
    localeDesc : 'Tiếng Việt',
    localeCode : 'vi',

    GridBase : {
        loadFailedMessage : 'Tải dữ liệu không thành công!',
        syncFailedMessage : 'Đồng bộ hóa dữ liệu không thành công!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Phản hồi của máy chủ:'
    },

    TaskBoard : {
        column           : 'cột',
        columns          : 'cột',
        Columns          : 'Cột',
        swimlane         : 'làn nhiệm vụ',
        swimlanes        : 'làn nhiệm vụ',
        Swimlanes        : 'Làn nhiệm vụ',
        task             : 'nhiệm vụ',
        tasks            : 'nhiệm vụ',
        addTask          : 'Thêm nhiệm vụ L{TaskBoard.task}',
        cancel           : 'Hủy bỏ',
        changeColumn     : 'Thay đổi L{TaskBoard.column}',
        changeSwimlane   : 'Thay đổi L{TaskBoard.swimlane}',
        collapse         : text => `Thu gọn ${text}`,
        color            : 'Màu',
        description      : 'Mô tả',
        editTask         : 'Chỉnh sửa L{TaskBoard.task}',
        expand           : text => `Mở rộng ${text}`,
        filterColumns    : 'Lọc L{TaskBoard.columns}',
        filterSwimlanes  : 'Lọc L{TaskBoard.swimlanes}',
        filterTasks      : 'Lọc L{TaskBoard.tasks}',
        moveColumnLeft   : 'Di chuyển sang trái L{TaskBoard.column}',
        moveColumnRight  : 'Di chuyển sang phải L{TaskBoard.column}',
        name             : 'Tên',
        newTaskName      : 'L{TaskBoard.task} Tên nhiệm vụ mới',
        removeTask       : 'Xóa nhiệm vụ L{TaskBoard.task}',
        removeTasks      : 'Xóa nhiệm vụ L{TaskBoard.tasks}',
        resources        : 'Tài nguyên',
        save             : 'Lưu',
        scrollToColumn   : 'Di chuyển đến cột L{TaskBoard.column}',
        scrollToSwimlane : 'Di chuyển đến làn L{TaskBoard.swimlane}',
        zoom             : 'Thu phóng'
    },

    TodoListField : {
        add     : 'Thêm',
        newTodo : 'Danh sách cần làm mới'
    },

    UndoRedo : {
        UndoLastAction : 'Hoàn tác hành động cuối cùng',
        RedoLastAction : 'Làm lại hành động cuối cùng '
    }
};

export default LocaleHelper.publishLocale(locale);
