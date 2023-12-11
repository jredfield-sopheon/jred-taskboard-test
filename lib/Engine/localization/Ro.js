import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Ro',
    localeDesc: 'Română',
    localeCode: 'ro',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Eliminare dependență'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Dezactivare dependență'
    },
    CycleEffectDescription: {
        descriptionTpl: 'A fost găsit un ciclu format de: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'Calendarul "{0}" nu oferă intervale de timp de lucru.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Folosiți calendarul de 24 de ore cu zilele de sâmbătă și duminică nelucrătoare.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Folosiți un calendar de 8 ore (08:00-12:00, 13:00-17:00) cu zilele de sâmbătă și duminică nelucrătoare.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignorați granița proiectului și continuați cu modificarea.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Ați mutat sarcina „{0}” pentru a porni {1}. Aceasta este înainte de data de începere a proiectului {2}.',
        endDescriptionTpl: 'Ați mutat sarcina „{0}” pentru a termina {1}. Aceasta este după data de încheiere a proiectului {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Ajustați sarcina pentru a onora granița proiectului.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'A fost găsit un conflict de programare: {0} este în conflict cu {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Data de începere a proiectului {0}',
        endDateDescriptionTpl: 'Data de finalizare a proiectului {0}'
    },
    DependencyType: {
        long: [
            'Start-la-start',
            'Start-la-finalizare',
            'Finalizare-la-start',
            'Finalizare-la-finalizare'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: '"{2}" programat manual îi forțează pe copiii săi să înceapă nu mai devreme de {0}',
        endDescriptionTpl: '"{2}" programat manual îi forțează pe copiii săi să termine nu mai târziu de {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Dezactivați programarea manuală pentru "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Dependența ({2}) de la "{3}" la "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Eliminați dependența de la "{1}" la "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Dezactivați dependența de la "{1}" la "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Constrângere sarcina "{2}" {3} {0}',
        endDateDescriptionTpl: 'Constrângere sarcina "{2}" {3} {1}',
        constraintTypeTpl: {
            startnoearlierthan: 'Începutul nu mai devreme de',
            finishnoearlierthan: 'Finalizare nu mai devreme de',
            muststarton: 'Trebuie să înceapă la',
            mustfinishon: 'Trebuie finalizat la',
            startnolaterthan: 'Începutul nu mai târziu de',
            finishnolaterthan: 'Finalizare nu mai târziu de'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Eliminați constrângerea "{1}" a sarcinii "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
