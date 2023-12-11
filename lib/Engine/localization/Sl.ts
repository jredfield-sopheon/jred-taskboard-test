import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Sl',
    localeDesc : 'Slovensko',
    localeCode : 'sl',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Odstrani odvisnost'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Deaktiviraj odvisnost'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Najden je bil cikel, ki ga tvori: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" koledar ne predvideva delovnih časovnih intervalov.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Uporabi 24-urni koledar z dela prostimi sobotami in nedeljami.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Uporabi 8-urni koledar (08:00-12:00, 13:00-17:00) z dela prostimi sobotami in nedeljami.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Prezri mejo projekta in nadaljujte s spremembo.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Prestavili ste nalogo "{0}" za zagon {1}. To je pred datumom začetka projekta {2}.',
        endDescriptionTpl   : 'Prestavili ste nalogo "{0}" za dokončanje {1}. To je po končnem datumu projekta {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Prilagodite nalogo, da počastite mejo projekta.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Najden je bil konflikt pri razporedu {0} je v konfliktu z {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Datum začetka projekta {0}',
        endDateDescriptionTpl   : 'Datum konca projekta {0}'
    },

    DependencyType : {
        long : [
            'Od začetka do začetka',
            'Od začetka do konca',
            'Od konca do začetka',
            'Od konca do konca'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Ročno načrtovan "{2}" prisili podrejene zahtevke da se ne začnejo prej kot {0}',
        endDescriptionTpl   : 'Ročno načrtovan "{2}" prisili podrejene zahtevke da se ne začnejo prej kot {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Onemogoči ročno razporejanje za "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Odvisnost ({2}) od "{3}" do "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Odstrani odvisnost od "{1}" do "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Deaktiviraj odvisnost od "{1}" do "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Naloga "{2}" {3} {0} omejitev',
        endDateDescriptionTpl   : 'Naloga "{2}" {3} {1} omejitev',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Začetek ne prej kot',
            finishnoearlierthan : 'Končati ne prej kot',
            muststarton         : 'Začeti se mora na',
            mustfinishon        : 'Končati se mora na',
            startnolaterthan    : 'Začetek najkasneje',
            finishnolaterthan   : 'Končati najkasneje'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Odstrani "{1}" omejitev naloge "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
