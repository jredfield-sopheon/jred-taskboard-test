import LocaleHelper from '../../Core/localization/LocaleHelper.js';
import '../../Core/localization/FrFr.js';

const locale = {

    localeName : 'FrFr',
    localeDesc : 'Français (France)',
    localeCode : 'fr-FR',

    GridBase : {
        loadFailedMessage : 'Échec du chargement des données !',
        syncFailedMessage : 'Échec de la synchronisation des données !'
    },

    CrudManagerView : {
        serverResponseLabel : 'Réponse du serveur :'
    },

    TaskBoard : {
        column           : 'colonne',
        columns          : 'colonnes',
        Columns          : 'Colonnes',
        swimlane         : 'couloir',
        swimlanes        : 'couloirs',
        Swimlanes        : 'Couloirs',
        task             : 'tâche',
        tasks            : 'tâches',
        addTask          : 'Ajouter L{TaskBoard.task}',
        cancel           : 'Annuler',
        changeColumn     : 'Changer de L{TaskBoard.column}',
        changeSwimlane   : 'Changer de L{TaskBoard.swimlane}',
        collapse         : text => `Réduire ${text}`,
        color            : 'Couleur',
        description      : 'Description',
        editTask         : 'Éditer L{TaskBoard.task}',
        expand           : text => `Développer ${text}`,
        filterColumns    : 'Filtrer L{TaskBoard.columns}',
        filterSwimlanes  : 'Filtrer L{TaskBoard.swimlanes}',
        filterTasks      : 'Filtrer L{TaskBoard.tasks}',
        moveColumnLeft   : 'Déplacer L{TaskBoard.column} à gauche',
        moveColumnRight  : 'Déplacer L{TaskBoard.column} vers la droite',
        name             : 'Nom',
        newTaskName      : 'Nouveau L{TaskBoard.task}',
        removeTask       : 'Supprimer L{TaskBoard.task}',
        removeTasks      : 'Supprimer L{TaskBoard.tasks}',
        resources        : 'Ressources',
        save             : 'Enregistrer',
        scrollToColumn   : "Faire défiler jusqu'à L{TaskBoard.column}",
        scrollToSwimlane : "Faire défiler jusqu'à L{TaskBoard.swimlane}",
        zoom             : 'Agrandir'
    },

    TodoListField : {
        add     : 'Ajouter',
        newTodo : 'Nouvelle tâche à effectuer'
    },

    UndoRedo : {
        UndoLastAction : 'Annuler',
        RedoLastAction : 'Rétablir'
    }
};

export default LocaleHelper.publishLocale(locale);
