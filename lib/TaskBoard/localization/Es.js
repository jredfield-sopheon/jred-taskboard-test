import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Es.js';

const locale = {

    localeName : 'Es',
    localeDesc : 'Español',
    localeCode : 'es',

    GridBase : {
        loadFailedMessage : 'Fallo al cargar los datos',
        syncFailedMessage : 'Fallo al sincronizar los datos'
    },

    CrudManagerView : {
        serverResponseLabel : 'Respuesta del servidor:'
    },

    TaskBoard : {
        column           : 'columna',
        columns          : 'columnas',
        Columns          : 'Columnas',
        swimlane         : 'carril',
        swimlanes        : 'carriles',
        Swimlanes        : 'Carriles',
        task             : 'tarea',
        tasks            : 'tareas',
        addTask          : 'Añadir L{TaskBoard.task}',
        cancel           : 'Cancelar',
        changeColumn     : 'Cambiar L{TaskBoard.column}',
        changeSwimlane   : 'Cambiar L{TaskBoard.swimlane}',
        collapse         : text => `Contraer ${text}`,
        color            : 'Color',
        description      : 'Descripción',
        editTask         : 'Editar L{TaskBoard.task}',
        expand           : text => `Expandir ${text}`,
        filterColumns    : 'Filtrar L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrar L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrar L{TaskBoard.tasks}',
        moveColumnLeft   : 'Mover L{TaskBoard.column} a la izquierda',
        moveColumnRight  : 'Mover L{TaskBoard.column} a la derecha',
        name             : 'Nombre',
        newTaskName      : 'Nueva L{TaskBoard.task}',
        removeTask       : 'Quitar L{TaskBoard.task}',
        removeTasks      : 'Quitar L{TaskBoard.tasks}',
        resources        : 'Recursos',
        save             : 'Guardar',
        scrollToColumn   : 'Desplazarse hasta L{TaskBoard.column}',
        scrollToSwimlane : 'Desplazarse hasta L{TaskBoard.swimlane}',
        zoom             : 'Zoom'
    },

    TodoListField : {
        add     : 'Añadir',
        newTodo : 'Nueva tarea pendiente'
    },

    UndoRedo : {
        UndoLastAction : 'Deshacer',
        RedoLastAction : 'Rehacer'
    }
};

export default LocaleHelper.publishLocale(locale);
