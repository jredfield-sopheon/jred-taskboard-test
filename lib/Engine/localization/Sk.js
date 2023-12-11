import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Sk',
    localeDesc: 'Slovenský',
    localeCode: 'sk',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Odstrániť súvislosti'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Deaktivovať súvislosti'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Bol nájdený cyklus, ktorý tvoria: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" kalendár neposkytuje žiadne intervaly pracovnej doby.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Používajte 24-hodinový kalendár s nepracovnými sobotami a nedeľami.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Používajte 8 hodinový kalendár (08:00-12:00, 13:00-17:00) s nepracovnými sobotami a nedeľami.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignorujte hranicu projektu a pokračujte v zmene.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Presunuli ste úlohu "{0}", aby ste spustili {1}. Toto je pred dátumom začiatku projektu {2}.',
        endDescriptionTpl: 'Presunuli ste úlohu "{0}" na dokončenie {1}. Toto je po dátume konca projektu {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Upravte úlohu na počesť projektovej hranice.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Bol zistený konflikt pri plánovaní: {0} je v rozpore s {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Dátum začiatku projektu {0}',
        endDateDescriptionTpl: 'Dátum skončenia projektu {0}'
    },
    DependencyType: {
        long: [
            'Od začiatku po začiatok',
            'Od začiatku po koniec',
            'Od konca po začiatok',
            'Od konca po koniec'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Manuálne naplánovaný "{2}" núti svoje deti začať najskôr {0}',
        endDescriptionTpl: 'Manuálne naplánovaný "{2}" núti svoje deti skončiť najskôr{1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Vypnúť manuálne plánovanie pre "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Závislosť ({2}) od "{3}" do "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Odstrániť závislosť od "{1}" do "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Vypnúť závislosť od "{1}" do "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Úloha "{2}" {3} {0} ohraničená',
        endDateDescriptionTpl: 'Úloha "{2}" {3} {1} ohraničená',
        constraintTypeTpl: {
            startnoearlierthan: 'Nezačať skôr ako',
            finishnoearlierthan: 'Neskončiť skôr ako',
            muststarton: 'Musí začať v',
            mustfinishon: 'Musí skončiť v',
            startnolaterthan: 'Nezačať neskôr ako',
            finishnolaterthan: 'neskončiť neskôr ako'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Odstrániť "{1}" ohraničenie úlohy "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
