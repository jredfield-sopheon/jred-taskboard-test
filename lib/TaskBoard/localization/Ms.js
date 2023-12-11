import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Ms.js';

const locale = {

    localeName : 'Ms',
    localeDesc : 'Melayu',
    localeCode : 'ms',

    GridBase : {
        loadFailedMessage : 'Pemuatan data gagal!',
        syncFailedMessage : 'Penyegerakan data gagal!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Respons pelayan:'
    },

    TaskBoard : {
        column           : 'kolum',
        columns          : 'kolum',
        Columns          : 'Kolum',
        swimlane         : 'lorong renang',
        swimlanes        : 'lorong renang',
        Swimlanes        : 'Lorong renang',
        task             : 'tugas',
        tasks            : 'tugas',
        addTask          : 'Tambah L{TaskBoard.task}',
        cancel           : 'Batal',
        changeColumn     : 'Ubah L{TaskBoard.column}',
        changeSwimlane   : 'Ubah L{TaskBoard.swimlane}',
        collapse         : text => `Kecilkan ${text}`,
        color            : 'Warna',
        description      : 'Penerangan',
        editTask         : 'Edit L{TaskBoard.task}',
        expand           : text => `Kembang ${text}`,
        filterColumns    : 'Tapis L{TaskBoard.columns}',
        filterSwimlanes  : 'Tapis L{TaskBoard.swimlanes}',
        filterTasks      : 'Tapis L{TaskBoard.tasks}',
        moveColumnLeft   : 'Gerak L{TaskBoard.column} kiri',
        moveColumnRight  : 'Gerak L{TaskBoard.column} kanan',
        name             : 'Nama',
        newTaskName      : 'Baharu L{TaskBoard.task}',
        removeTask       : 'Buang L{TaskBoard.task}',
        removeTasks      : 'Buang L{TaskBoard.tasks}',
        resources        : 'Sumber',
        save             : 'Simpan',
        scrollToColumn   : 'Skrol ke L{TaskBoard.column}',
        scrollToSwimlane : 'Skrol ke L{TaskBoard.swimlane}',
        zoom             : 'Zum'
    },

    TodoListField : {
        add     : 'Tambah',
        newTodo : 'Untuk buat baharu'
    },

    UndoRedo : {
        UndoLastAction : 'Buat Asal',
        RedoLastAction : 'Buat Semula'
    }
};

export default LocaleHelper.publishLocale(locale);
