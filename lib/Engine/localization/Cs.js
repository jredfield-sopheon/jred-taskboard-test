import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Cs',
    localeDesc: 'Česky',
    localeCode: 'cs',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Odebrat závislost'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Deaktivovat závislost'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Byl nalezen cyklus vytvořený: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'Kalendář "{0}" neuvádí žádné intervaly pracovní doby.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Použijte 24-hodinový kalendář s nepracovními sobotami a nedělemi.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Použijte 8-hodinový kalendář (8:00-12:00, 13:00-17:00) s nepracovními sobotami a nedělemi).'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignorujte hranici projektu a pokračujte se změnou.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Přesunuli jste úkol "{0}" a spustíte {1}. Toto je před datem zahájení projektu {2}.',
        endDescriptionTpl: 'Přesunuli jste úkol "{0}" dokončit {1}. Toto je po datu ukončení projektu {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Upravte úkol na počest hranice projektu.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Byl nalezen střed plánování: {0} se kryje s {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Datum zahájení projektu {0}',
        endDateDescriptionTpl: 'Datum ukončení projektu {0}'
    },
    DependencyType: {
        long: [
            'Začátek-Začátek',
            'Začátek-Konec',
            'Konec-Začátek',
            'Konec-Konec'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Manuálně naplánované "{2}" nutí děti nezačínat dříve než {0}',
        endDescriptionTpl: 'Manuálně naplánované "{2}" nutí děti dokončit ne později než {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Deaktivovat manuální plánování pro "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Závislost ({2}) od "{3}" do "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Odebrat závislost od "{1}" do "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Deaktivovat závislost od "{1}" do "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Omezení úkolu "{2}" {3} {0}',
        endDateDescriptionTpl: 'Omezení úkolu "{2}" {3} {1}',
        constraintTypeTpl: {
            startnoearlierthan: 'Nespouštět dříve než',
            finishnoearlierthan: 'Nedokončovat dříve než',
            muststarton: 'Musí začít',
            mustfinishon: 'Musí skončit',
            startnolaterthan: 'Nespouštět později než',
            finishnolaterthan: 'Nedokončovat později než'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Odebrat "{1}" omezení úkolu "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
