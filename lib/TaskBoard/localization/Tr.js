import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/Tr.js';

const locale = {

    localeName : 'Tr',
    localeDesc : 'Türkçe',
    localeCode : 'tr',

    GridBase : {
        loadFailedMessage : 'Veri yükleme başarısız!',
        syncFailedMessage : 'Veri senkronizasyonu başarısız!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Sunucu yanıtı:'
    },

    TaskBoard : {
        column           : 'sütun',
        columns          : 'sütunlar',
        Columns          : 'Sütunlar',
        swimlane         : 'kulvar',
        swimlanes        : 'kulvarlar',
        Swimlanes        : 'Kulvarlar',
        task             : 'görev',
        tasks            : 'görevler',
        addTask          : 'Ekle L{TaskBoard.task}',
        cancel           : 'İptal et',
        changeColumn     : 'Değiştir L{TaskBoard.column}',
        changeSwimlane   : 'Değiştir L{TaskBoard.swimlane}',
        collapse         : text => `Daralt ${text}`,
        color            : 'Renk',
        description      : 'Açıklama',
        editTask         : 'Düzenle L{TaskBoard.task}',
        expand           : text => `Genişlet ${text}`,
        filterColumns    : 'Filtrele L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrele L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrele L{TaskBoard.tasks}',
        moveColumnLeft   : 'Taşı L{TaskBoard.column} sola',
        moveColumnRight  : 'Taşı L{TaskBoard.column} sağa',
        name             : 'Ad',
        newTaskName      : 'Yeni L{TaskBoard.task}',
        removeTask       : 'Kaldır L{TaskBoard.task}',
        removeTasks      : 'Kaldır L{TaskBoard.tasks}',
        resources        : 'Kaynaklar',
        save             : 'Kaydet',
        scrollToColumn   : 'Şuraya kaydır L{TaskBoard.column}',
        scrollToSwimlane : 'Şuraya kaydır L{TaskBoard.swimlane}',
        zoom             : 'Yakınlaştır'
    },

    TodoListField : {
        add     : 'Ekle',
        newTodo : 'Yeni yapılacaklar'
    },

    UndoRedo : {
        UndoLastAction : 'Geri al',
        RedoLastAction : 'Yinele'
    }
};

export default LocaleHelper.publishLocale(locale);
