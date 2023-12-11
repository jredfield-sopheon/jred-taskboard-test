import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'It',
    localeDesc: 'Italiano',
    localeCode: 'it',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Rimuovi dipendenza'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Disattiva dipendenza'
    },
    CycleEffectDescription: {
        descriptionTpl: 'È stato trovato un ciclo, formato da: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'Il calendario "{0}" non fornisce alcun intervallo di lavoro.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Usa il calendario di 24 ore con sabati e domeniche non lavorativi.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Usa il calendario di 8 ore (08:00-12:00, 13:00-17:00) con sabati e domeniche non lavorativi.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignora il bordo del progetto e procedi con il cambiamento.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: "Hai spostato l'attività \"{0}\" per farla iniziare in data {1}, ma è antecedente alla data di inizio progetto: {2}.",
        endDescriptionTpl: "Hai spostato l'attività \"{0}\" per finire {1}. Questo è dopo la data di fine del progetto {2}."
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Regola il compito per onorare il bordo del progetto.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'È stato trovato un conflitto di programmazione: {0} è in conflitto con {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Data d’inizio del progetto {0}',
        endDateDescriptionTpl: 'Data di fine del progetto {0}'
    },
    DependencyType: {
        long: [
            'Inizio-Inizio',
            'Inizio-Fine',
            'Fine-Inizio',
            'Fine-Fine'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: '"{2}" programmato manualmente forza l’avvio degli elementi secondari a non prima di {0}',
        endDescriptionTpl: '"{2}" programmato manualmente forza la fine degli elementi secondari entro e non oltre {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Disabilita programmazione manuale per "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Dipendenza ({2}) da "{3}" a "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Rimuovi dipendenza da "{1}" a "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Disattiva dipendenza da "{1}" a "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Vincolo compito "{2}" {3} {0}',
        endDateDescriptionTpl: 'Vincolo compito "{2}" {3} {1}',
        constraintTypeTpl: {
            startnoearlierthan: 'Inizio non prima di',
            finishnoearlierthan: 'Fine non prima di',
            muststarton: 'Deve iniziare il',
            mustfinishon: 'Deve finire il',
            startnolaterthan: 'Inizio non oltre',
            finishnolaterthan: 'Fine non oltre'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Rimuovi vincolo "{1}" del compito "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
