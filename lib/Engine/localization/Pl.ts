import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Pl',
    localeDesc : 'Polski',
    localeCode : 'pl',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Usuń zależność'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Wyłączenie zależności'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Znaleziono cykl, utworzony przez: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" kalendarz nie przewiduje żadnych roboczych przedziałów czasowych.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Stosuj kalendarz 24-godzinny z niepracującymi sobotami i niedzielami.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Stosuj kalendarz 8-godzinny (08:00-12:00, 13:00-17:00) z niepracującymi sobotami i niedzielami.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Zignoruj ​​granicę projektu i kontynuuj zmianę.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Prowadziłeś zadanie „{0}”, aby uruchomić {1}. Jest to przed datą rozpoczęcia projektu {2}.',
        endDescriptionTpl   : 'Prowadziłeś zadanie „{0}”, aby zakończyć {1}. Dzieje się tak po dacie zakończenia projektu {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Dostosuj zadanie, aby uhonorować granicę projektu.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Stwierdzono konflikt w harmonogramie: {0} jest niezgodne z {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Data rozpoczęcia projektu {0}',
        endDateDescriptionTpl   : 'Data zakończenia projektu {0}'
    },

    DependencyType : {
        long : [
            'Od początku do początku',
            'Od początku do końca',
            'Od końca do początku',
            'Od końca do końca'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Ręcznie zaplanowane "{2}" zmusza dzieci do rozpoczęcia nie wcześniej niż {0}',
        endDescriptionTpl   : 'Ręcznie zaplanowane "{2}" zmusza dzieci do zakończenia pracy nie później niż {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Wyłączenie ręcznego planowania dla "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Zależność ({2}) od "{3}" do "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Usuń zależność od "{1}" do "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Wyłączenie zależności od "{1}" do "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Ograniczenie {3} {0} zagania "{2}"',
        endDateDescriptionTpl   : 'Ograniczenie {3} {1} zagania "{2}"',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Rozpocznie się nie wcześniej niż',
            finishnoearlierthan : 'Zakończy się nie wcześniej niż',
            muststarton         : 'Musi rozpocząć się dnia',
            mustfinishon        : 'Musi zakończyć się dnia',
            startnolaterthan    : 'Rozpocznie się nie później niż',
            finishnolaterthan   : 'Zakończy się nie później niż'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Usuń ograniczenie "{1}" z zadania "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
