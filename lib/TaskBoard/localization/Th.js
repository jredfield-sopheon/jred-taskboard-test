import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Th.js';

const locale = {

    localeName : 'Th',
    localeDesc : 'ไทย',
    localeCode : 'th',

    GridBase : {
        loadFailedMessage : 'การโหลดข้อมูลล้มเหลว!',
        syncFailedMessage : 'การซิงค์ข้อมูลล้มเหลว!'
    },

    CrudManagerView : {
        serverResponseLabel : 'การตอบสนองของเซิร์ฟเวอร์:'
    },

    TaskBoard : {
        column           : 'คอลัมน์',
        columns          : 'คอลัมน์',
        Columns          : 'คอลัมน์',
        swimlane         : 'ลู่กระแสงาน',
        swimlanes        : 'ลู่กระแสงาน',
        Swimlanes        : 'ลู่กระแสงาน',
        task             : 'งาน',
        tasks            : 'งาน',
        addTask          : 'เพิ่ม L{TaskBoard.task}',
        cancel           : 'ยกเลิก',
        changeColumn     : 'เปลี่ยน L{TaskBoard.column}',
        changeSwimlane   : 'เปลี่ยน L{TaskBoard.swimlane}',
        collapse         : text => `ย่อ ${text}`,
        color            : 'สี',
        description      : 'คำอธิบาย',
        editTask         : 'แก้ไข L{TaskBoard.task}',
        expand           : text => `ขยาย ${text}`,
        filterColumns    : 'กรอง L{TaskBoard.columns}',
        filterSwimlanes  : 'กรอง L{TaskBoard.swimlanes}',
        filterTasks      : 'กรอง L{TaskBoard.tasks}',
        moveColumnLeft   : 'ย้าย L{TaskBoard.column} ไปด้านซ้าย',
        moveColumnRight  : 'ย้าย L{TaskBoard.column} ไปด้านขวา',
        name             : 'ชื่อ',
        newTaskName      : 'L{TaskBoard.task} ใหม่',
        removeTask       : 'นำ L{TaskBoard.task} ออก',
        removeTasks      : 'นำ L{TaskBoard.tasks} ออก',
        resources        : 'ทรัพยากร',
        save             : 'บันทึก',
        scrollToColumn   : 'เลื่อนไปยัง L{TaskBoard.column}',
        scrollToSwimlane : 'เลื่อนไปยัง L{TaskBoard.swimlane}',
        zoom             : 'ขยาย'
    },

    TodoListField : {
        add     : 'เพิ่ม',
        newTodo : 'สิ่งที่ต้องทำใหม่'
    },

    UndoRedo : {
        UndoLastAction : 'เลิกทำ',
        RedoLastAction : 'ทำซ้ำ'
    }
};

export default LocaleHelper.publishLocale(locale);
