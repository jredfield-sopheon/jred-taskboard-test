import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'No',
    localeDesc : 'Norsk',
    localeCode : 'no',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Fjern avhengighet'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Deaktiver avhengighet'
    },

    CycleEffectDescription : {
        descriptionTpl : 'En syklus har blitt funnet, dannet av: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" kalender gir ingen arbeidstidsintervaller.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Bruk 24 timers kalender med arbeidsfrie lørdager og søndager.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Bruk 8 timers kalender (08:00-12:00, 13:00-17:00) med arbeidsfrie lørdager og søndager.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Ignorer prosjektgrensen og fortsett med endringen.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Du flyttet "{0}" -oppgaven å starte {1}. Dette er før prosjektstartdatoen {2}.',
        endDescriptionTpl   : 'Du flyttet "{0}" -oppgaven å fullføre {1}. Dette er etter prosjektets sluttdato {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Juster oppgaven for å hedre prosjektgrensen.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'En planleggingskonflikt ble funnet: {0} er i konflikt med {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Prosjektstartdato {0}',
        endDateDescriptionTpl   : 'Prosjektsluttdato {0}'
    },

    DependencyType : {
        long : [
            'Start-til-start',
            'Start-til-slutt',
            'Slutt-til-start',
            'Slutt-til-slutt'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Manuelt planlagt "{2}" tvinger barna sine til å starte tidligst {0}',
        endDescriptionTpl   : 'Manuelt planlagt "{2}" tvinger barna sine til å avslutte senest {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Deaktiver manuell planlegging for "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Avhengighet ({2}) fra "{3}" til "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Fjern avhengighet fra "{1}" til "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Deaktiver avhengighet fra "{1}" til "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Oppgave "{2}" {3} {0} begrensning',
        endDateDescriptionTpl   : 'Oppgave "{2}" {3} {1} begrensning',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Start ikke tidligere enn',
            finishnoearlierthan : 'Avslutt ikke tidligere enn',
            muststarton         : 'Må starte på',
            mustfinishon        : 'Må starte på',
            startnolaterthan    : 'Start ikke senere enn',
            finishnolaterthan   : 'Avslutt ikke senere enn'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Fjern "{1}" begrensning av oppgave "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
