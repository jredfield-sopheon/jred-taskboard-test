import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Pt.js';

const locale = {

    localeName : 'Pt',
    localeDesc : 'Português',
    localeCode : 'pt',

    GridBase : {
        loadFailedMessage : 'Falha no carregamento dos dados!',
        syncFailedMessage : 'Falha na sincronização dos dados!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Resposta do servidor:'
    },

    TaskBoard : {
        column           : 'coluna',
        columns          : 'colunas',
        Columns          : 'Colunas',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlanes',
        Swimlanes        : 'Swimlanes',
        task             : 'tarefa',
        tasks            : 'tarefas',
        addTask          : 'Adicionar L{TaskBoard.task}',
        cancel           : 'Cancelar',
        changeColumn     : 'Alterar L {TaskBoard.column}',
        changeSwimlane   : 'Alterar L {TaskBoard.swimlane}',
        collapse         : text => `Colapsar ${text}`,
        color            : 'Cor',
        description      : 'Descrição',
        editTask         : 'Editar L{TaskBoard.task}',
        expand           : text => `Expandir ${text}`,
        filterColumns    : 'Filtrar L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtar L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrar L{TaskBoard.tasks}',
        moveColumnLeft   : 'Mover L{TaskBoard.column} para a esquerda',
        moveColumnRight  : 'Mover L{TaskBoard.column} para a direita',
        name             : 'Nome',
        newTaskName      : 'Novo L{TaskBoard.task}',
        removeTask       : 'Remover L{TaskBoard.task}',
        removeTasks      : 'Remover L{TaskBoard.tasks}',
        resources        : 'Recursos',
        save             : 'Guardar',
        scrollToColumn   : 'Deslizar para L{TaskBoard.column}',
        scrollToSwimlane : 'Deslizar para L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Adicionar',
        newTodo : 'Novo todo'
    },

    UndoRedo : {
        UndoLastAction : 'Desfazer',
        RedoLastAction : 'Refazer'
    }
};

export default LocaleHelper.publishLocale(locale);
