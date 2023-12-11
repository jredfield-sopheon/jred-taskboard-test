import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Hr',
    localeDesc : 'Hrvatski',
    localeCode : 'hr',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Ukloni ovisnost'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Deaktiviraj ovisnost'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Pronađen je ciklus, oblikovan od: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" kalendar ne daje nikakve radne vremenske intervale.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Koristi 24-satni kalendar s neradnim subotama i nedjeljama.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Koristi 8-satni kalendar (08:00-12:00, 13:00-17:00) s neradnim subotama i nedjeljama.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Zanemarite granicu projekta i nastavite s promjenom.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Pomaknuo si "{0}" zadatak za početak {1}. To je prije datuma početka projekta {2}.',
        endDescriptionTpl   : 'Pomaknuo si "{0}" zadatak za završetak {1}. To je nakon datuma završetka projekta {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Prilagodite zadatak u čast projektnoj granici.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Pronađeno je preklapanje u rasporedu: {0} se preklapa s {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Datum početka projekta {0}',
        endDateDescriptionTpl   : 'Datum završetka projekta {0}'
    },

    DependencyType : {
        long : [
            'Od početka na početak',
            'Od početka na završetak',
            'Od završetka na početak',
            'Od završetka na završetak'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Ručno zakazano "{2}" tjera podređene elemente da započnu ranije od {0}',
        endDescriptionTpl   : 'Ručno zakazano "{2}" tjera podređene elemente da završe kasnije od {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Onemogući ručno zakazivanje za "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Ovisnost ({2}) od "{3}" do "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Ukloni ovisnost od "{1}" do "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Deaktiviraj ovisnost od "{1}" do "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Zadatak "{2}" {3} {0} ograničen',
        endDateDescriptionTpl   : 'Zadatak "{2}" {3} {1} ograničen',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Započeti ne ranije od',
            finishnoearlierthan : 'Završiti ne ranije od',
            muststarton         : 'Treba započeti na',
            mustfinishon        : 'Treba završiti na',
            startnolaterthan    : 'Započeti ne kasnije od',
            finishnolaterthan   : 'Završiti ne kasnije od'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Ukloni "{1}" ograničenje zadatka "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
