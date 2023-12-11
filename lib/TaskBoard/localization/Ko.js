import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ko.js';

const locale = {

    localeName : 'Ko',
    localeDesc : '한국어',
    localeCode : 'ko',

    GridBase : {
        loadFailedMessage : '데이터 로드에 실패했습니다!',
        syncFailedMessage : '데이터 동기화에 실패했습니다!'
    },

    CrudManagerView : {
        serverResponseLabel : '서버 응답:'
    },

    TaskBoard : {
        column           : '열',
        columns          : '열',
        Columns          : '열',
        swimlane         : '업무 흐름도',
        swimlanes        : '업무 흐름도',
        Swimlanes        : '업무 흐름도',
        task             : '작업',
        tasks            : '작업',
        addTask          : 'L{TaskBoard.task} 추가 ',
        cancel           : '취소',
        changeColumn     : 'L{TaskBoard.column} 변경',
        changeSwimlane   : 'L{TaskBoard.swimlane} 변경',
        collapse         : text => `${text} 접기`,
        color            : '색상',
        description      : '설명',
        editTask         : 'L{TaskBoard.task} 편집',
        expand           : text => `${text} 펼치기`,
        filterColumns    : 'L{TaskBoard.columns} 필터링하기',
        filterSwimlanes  : ' L{TaskBoard.swimlanes} 필터링하기',
        filterTasks      : 'L{TaskBoard.tasks} 필터링하기',
        moveColumnLeft   : 'L{TaskBoard.column} 왼쪽으로 이동 ',
        moveColumnRight  : 'L{TaskBoard.column} 오른쪽으로 이동 ',
        name             : '이름',
        newTaskName      : '새 L{TaskBoard.task}',
        removeTask       : 'L{TaskBoard.task} 제거 ',
        removeTasks      : ' L{TaskBoard.tasks} 제거 ',
        resources        : '리소스',
        save             : '저장',
        scrollToColumn   : 'L{TaskBoard.column}로 스크롤하기 ',
        scrollToSwimlane : 'L{TaskBoard.swimlane}로 스크롤하기 ',
        zoom             : '확대/축소'
    },

    TodoListField : {
        add     : '추가',
        newTodo : '새로운 할 일'
    },

    UndoRedo : {
        UndoLastAction : '실행 취소',
        RedoLastAction : '다시 실행'
    }
};

export default LocaleHelper.publishLocale(locale);
