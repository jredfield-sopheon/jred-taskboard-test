import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Da',
    localeDesc: 'Dansk',
    localeCode: 'da',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Fjern afhængighed'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Deaktiver afhængighed'
    },
    CycleEffectDescription: {
        descriptionTpl: 'En cirkulær reference blev fundet mellem følgende opgaver: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}"-kalenderen har ingen arbejdsintervaller.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Brug 24-timers kalenderen (mandag - fredag).'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Brug 8-timers kalenderen (mandag - fredag 08:00 - 12:00, 13:00 - 17:00).'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignorer projektgrænsen og fortsæt med ændringen.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Du flyttede "{0}" opgave til at starte {1}. Dette er før projektets startdato {2}.',
        endDescriptionTpl: 'Du flyttede "{0}" opgave til at afslutte {1}. Dette er efter projektets slutdato {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Juster opgaven for at ære projektgrænsen.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Denne handling forårsager en planlægningskonflikt for: {0} og {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Projektets startdato {0}',
        endDateDescriptionTpl: 'Projektets slutdato {0}'
    },
    DependencyType: {
        long: [
            'Start-til-Start',
            'Start-til-Slut',
            'Slut-til-Start',
            'Slut-til-Slut'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Manuelt planlagt "{2}" tvinger sine underliggende elementer til ikke at starte tidligere end {0}',
        endDescriptionTpl: 'Manuelt planlagt "{2}" tvinger sine underliggende elementer til ikke at slutte senere end {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Deaktivér manuel planlægning for "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Afhængighed ({2}) fra "{3}" til "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Slet afhængighed af "{1}" til "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Deaktivér afhængighed af "{1}" til "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Opgave "{2}" {3} {0} begrænsning',
        endDateDescriptionTpl: 'Opgave "{2}" {3} {1} begrænsning',
        constraintTypeTpl: {
            startnoearlierthan: 'Start ikke tidligere end',
            finishnoearlierthan: 'Afslut ikke tidligere end',
            muststarton: 'Skal starte på',
            mustfinishon: 'Skal slutte på',
            startnolaterthan: 'Start ikke senere end',
            finishnolaterthan: 'Afslut ikke senere end'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Fjern "{1}" begrænsningen på opgave "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
