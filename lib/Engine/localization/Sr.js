import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Sr',
    localeDesc: 'Srpski',
    localeCode: 'sr',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Ukloni zavisnost'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Deaktiviraj zavisnost'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Pronađen je ciklus, koji je kreirao: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" Kalendar ne pruža radne vremenske intervale.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Koristi 24-časovni kalendar za neradne subote i nedelje.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Koristi 8-časovni kalendar (08.00-12-00, 13.00-17.00) za neradne subote i nedelje.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Zanemarite granicu projekta i nastavite sa promenom.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Premestili ste zadatak „{0}“ da biste pokrenuli {1}. Ovo je pre datuma početka projekta {2}.',
        endDescriptionTpl: 'Premestili ste zadatak „{0}“ da biste završili {1}. Ovo je posle datuma završetka projekta {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Prilagodite zadatak da poštuje granicu projekta.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Pronađen je konflikt u rasporedu: {0} je u konfliktu sa {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Datum početka projekta {0}',
        endDateDescriptionTpl: 'Datum završetka projekta {0}'
    },
    DependencyType: {
        long: [
            'Od početka do početka',
            'Od početka do kraja',
            'Od kraja do početka',
            'Od kraja do kraja'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Ručni raspored "{2}" primorava svoje zavisne događaje da počnu ne ranije od {0}',
        endDescriptionTpl: 'Ručni raspored "{2}" primorava svoje zavisne događaje da završe ne ranije od {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Onemogući ručno raspoređivanje za "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Zavisnost ({2}) od "{3}" do "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Ukloni zavisnost od "{1}" do "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Deaktiviraj zavisnost "{1}" do "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Zadatak "{2}" {3} {0} ograničenje',
        endDateDescriptionTpl: 'Zadatak "{2}" {3} {1} ograničenje',
        constraintTypeTpl: {
            startnoearlierthan: 'Počni ne ranije od',
            finishnoearlierthan: 'Završi ne ranije od',
            muststarton: 'Mora da počne',
            mustfinishon: 'Mora da se završi',
            startnolaterthan: 'Počni ne kasnije od',
            finishnolaterthan: 'Završi ne kasnije od'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Ukloni "{1}" ograničenje zadatka "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
