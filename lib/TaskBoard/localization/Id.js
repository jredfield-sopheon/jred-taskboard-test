import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Id.js';

const locale = {

    localeName : 'Id',
    localeDesc : 'Bahasa Indonesia',
    localeCode : 'id',

    GridBase : {
        loadFailedMessage : 'Pemuatan data gagal!',
        syncFailedMessage : 'Sinkronisasi data gagal!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Respons server:'
    },

    TaskBoard : {
        column           : 'kolom',
        columns          : 'kolom',
        Columns          : 'Kolom',
        swimlane         : 'swimlane',
        swimlanes        : 'swimlane',
        Swimlanes        : 'Swimlane',
        task             : 'tugas',
        tasks            : 'tugas',
        addTask          : 'Tambahkan L{TaskBoard.task}',
        cancel           : 'Batalkan',
        changeColumn     : 'Ubah L{TaskBoard.column}',
        changeSwimlane   : 'Ubah L{TaskBoard.swimlane}',
        collapse         : text => `Ciutkan ${text}`,
        color            : 'Warna',
        description      : 'Deskripsi',
        editTask         : 'Edit L{TaskBoard.task}',
        expand           : text => `Perluas ${text}`,
        filterColumns    : 'Filter L{TaskBoard.columns}',
        filterSwimlanes  : 'Filter L{TaskBoard.swimlanes}',
        filterTasks      : 'Filter L{TaskBoard.tasks}',
        moveColumnLeft   : 'Pindahkan L{TaskBoard.column} ke kiri',
        moveColumnRight  : 'Pindahkan L{TaskBoard.column} kanan',
        name             : 'Nama',
        newTaskName      : 'L{TaskBoard.task} baru',
        removeTask       : 'Pindahkan L{TaskBoard.task}',
        removeTasks      : 'Pindahkan L{TaskBoard.tasks}',
        resources        : 'Sumber daya',
        save             : 'Simpan',
        scrollToColumn   : 'Gulir ke L{TaskBoard.column}',
        scrollToSwimlane : 'Gulir ke L{TaskBoard.swimlane}',
        zoom             : 'Perbesar'
    },

    TodoListField : {
        add     : 'Tambahkan',
        newTodo : 'Daftar tugas baru'
    },

    UndoRedo : {
        UndoLastAction : 'Urungkan',
        RedoLastAction : 'Ulangi'
    }
};

export default LocaleHelper.publishLocale(locale);
