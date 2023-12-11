import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Et',
    localeDesc: 'Eesti keel',
    localeCode: 'et',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Eemalda sõltuvus'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Deaktiveeri sõltuvus'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Leiti tsükkel, mille moodustas: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" kalender ei paku tööaja intervalle.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Kasuta 24-tunnist kalendrit vabade laupäevade ja pühapäevadega.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Kasuta 8-tunnist kalendrit (08.00-12.00, 13.00-17.00) vabade laupäevade ja pühapäevadega.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignoreerige projekti piiri ja jätkake muudatust.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: '{1} käivitamiseks liikusite ülesande "{0}". See on enne projekti alguskuupäeva {2}.',
        endDescriptionTpl: 'Liigutasite ülesande "{0}", et lõpetada {1}. See on pärast projekti lõppkuupäeva {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Reguleerige ülesannet projekti piiri austamiseks.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Leiti graafiku konflikt: {0} on konfliktis üksusega {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Projekti alguskuupäev {0}',
        endDateDescriptionTpl: 'Projekti lõppkuupäev {0}'
    },
    DependencyType: {
        long: [
            'Algusest alguseni',
            'Algusest lõpuni',
            'Lõpust alguseni',
            'Lõpust lõpuni'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Käsitsi graafikusse pandud "{2}" sunnib oma alamaid alustama kõige varem {0}',
        endDescriptionTpl: 'Käsitsi graafikusse pandud "{2}" sunnib oma alamaid alustama kõige hiljem {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Keela käsitsi graafikusse panemine "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Sõltuvus ({2}) alates "{3}" kuni "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Eemalda sõltuvus alates "{1}" kuni "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Deaktiveeri sõltuvus alates "{1}" kuni "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Ülesande "{2}" {3} {0} piirang',
        endDateDescriptionTpl: 'Ülesande "{2}" {3} {1} piirang',
        constraintTypeTpl: {
            startnoearlierthan: 'Alusta kõige varem',
            finishnoearlierthan: 'Lõpeta kõige varem',
            muststarton: 'Peab algama',
            mustfinishon: 'Peab lõppema',
            startnolaterthan: 'Alusta hiljemalt',
            finishnolaterthan: 'Lõpeta hiljemalt'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Eemalda "{1}" piirang ülesandes "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
