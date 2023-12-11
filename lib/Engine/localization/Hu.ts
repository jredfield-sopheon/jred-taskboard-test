import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Hu',
    localeDesc : 'Magyar',
    localeCode : 'hu',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Függőség eltávolítása'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Függőség deaktiválása'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Ciklus észlelhető, létrehozta: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : 'A(z) "{0}" naptár nem tartalmaz munkaidő-intervallumokat.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : '24 órás naptár használata, a szombatok és vasárnapok nem munkanapok.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : '8 órás naptár (8:00–12:00, 13:00–17:00) használata, a szombatok és vasárnapok nem munkanapok.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Ne hagyja figyelmen kívül a projekt határát, és folytassa a változást.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Ön áthelyezte a "{0}" feladat elindításához {1}. Ez a projekt kezdési dátuma előtt van {2}.',
        endDescriptionTpl   : 'A "{0}" feladatot áthelyezte a {1} befejezéséhez. Ez a projekt befejezési dátuma után van {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Állítsa be a projekt határának tiszteletben tartásának feladatát.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Ütemezési ütközés észlelhető: {0} és {1} ütközik'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Projekt kezdő dátuma {0}',
        endDateDescriptionTpl   : 'Projekt befejező dátuma {0}'
    },

    DependencyType : {
        long : [
            'Kezdéstől kezdésig',
            'Kezdéstől a végéig',
            'Végétől a kezdésig',
            'Végétől a végéig'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'A kézileg ütemezett "{2}" kényszeríti a leszármazottait, hogy nem kezdődhetnek előbb mint {0}',
        endDescriptionTpl   : 'A kézileg ütemezett "{2}" kényszeríti a leszármazottait, hogy nem kezdődhetnek később mint {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : '"{0}" kézi ütemezésének kikapcsolása'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Függőség ({2}) ettől: "{3}"; eddig: "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Függőség eltávolítása ettől: "{1}"; eddig: "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Függőség deaktiválása ettől: "{1}"; eddig: "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'A(z) "{2}" feladat {3} {0} korlátozás',
        endDateDescriptionTpl   : 'A(z) "{2}" feladat {3} {1} korlátozás',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Nem kezdődhet előbb mint',
            finishnoearlierthan : 'Nem érhet véget előbb mint',
            muststarton         : 'El kell kezdődnie ekkor:',
            mustfinishon        : 'Be kell fejeződnie ekkor:',
            startnolaterthan    : 'Nem kezdődhet később mint',
            finishnolaterthan   : 'Nem érhet véget később mint'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : '"{0}" feladat "{1}" korlátozásának eltávolítása'
    }
}

export default LocaleHelper.publishLocale(locale)
