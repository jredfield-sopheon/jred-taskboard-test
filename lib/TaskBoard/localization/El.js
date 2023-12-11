import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/El.js';

const locale = {

    localeName : 'El',
    localeDesc : 'Ελληνικά',
    localeCode : 'el',

    GridBase : {
        loadFailedMessage : 'Η φόρτωση των δεδομένων απέτυχε!',
        syncFailedMessage : 'Ο συγχρονισμός των δεδομένων απέτυχε!'
    },

    CrudManagerView : {
        serverResponseLabel : 'Απόκριση διακομιστή:'
    },

    TaskBoard : {
        column           : 'στήλη',
        columns          : 'στήλες',
        Columns          : 'Στήλες',
        swimlane         : 'κλειστή λωρίδα',
        swimlanes        : 'κλειστές λωρίδες',
        Swimlanes        : 'Κλειστές λωρίδες',
        task             : 'διεργασία',
        tasks            : 'διεργασίες',
        addTask          : 'Προσθήκη L{TaskBoard.task}',
        cancel           : 'Ακύρωση',
        changeColumn     : 'Αλλαγή L{TaskBoard.column}',
        changeSwimlane   : 'Αλλαγή L{TaskBoard.swimlane}',
        collapse         : text => `Κλείσιμο ${text}`,
        color            : 'Χρώμα',
        description      : 'Περιγραφή',
        editTask         : 'Επεξεργασία L{TaskBoard.task}',
        expand           : text => `Άνοιγμα ${text}`,
        filterColumns    : 'Φίλτρο L{TaskBoard.columns}',
        filterSwimlanes  : 'Φίλτρο L{TaskBoard.swimlanes}',
        filterTasks      : 'Φίλτρο L{TaskBoard.tasks}',
        moveColumnLeft   : 'Μετακίνηση του L{TaskBoard.column} αριστερά',
        moveColumnRight  : 'Μετακίνηση του L{TaskBoard.column} δεξιά',
        name             : 'Όνομα',
        newTaskName      : 'Δημιουργία νέου L{TaskBoard.task}',
        removeTask       : 'Κατάργηση L{TaskBoard.task}',
        removeTasks      : 'Κατάργηση L{TaskBoard.tasks}',
        resources        : 'Πόροι',
        save             : 'Αποθήκευση',
        scrollToColumn   : 'Κύλιση σε L{TaskBoard.column}',
        scrollToSwimlane : 'Κύλιση σε L{TaskBoard.swimlane}',
        zoom             : 'Εστίαση'
    },

    TodoListField : {
        add     : 'Προσθήκη',
        newTodo : 'Νέα εργασία'
    },

    UndoRedo : {
        UndoLastAction : 'Αναίρεση',
        RedoLastAction : 'Επανάληψη'
    }
};

export default LocaleHelper.publishLocale(locale);
