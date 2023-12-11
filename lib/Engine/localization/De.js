import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'De',
    localeDesc: 'Deutsch',
    localeCode: 'de-DE',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Abhängigkeiten entfernen'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Abhängigkeit deaktivieren'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Es wurde ein Zyklus gefunden, bestehend aus: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" Kalender bietet keine Arbeitszeitintervalle.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: '24-Stunden-Kalender mit arbeitsfreien Samstagen und Sonntagen verwenden.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: '8-Stunden-Kalender (08:00-12:00, 13:00-17:00) mit arbeitsfreien Samstagen und Sonntagen verwenden.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignorieren Sie die Projektgrenze und fahren Sie mit der Änderung fort.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Sie haben die Aufgabe "{0}" bewegt, {1} zu starten. Dies ist vor dem Projekt Startdatum {2}.',
        endDescriptionTpl: 'Sie haben die Aufgabe "{0}" bewegt, {1} zu beenden. Dies ist nach dem Projektenddatum {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Passen Sie die Aufgabe an, die Projektgrenze zu ehren.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Es wurde ein Terminkonflikt gefunden: {0} steht im Konflikt mit {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Datum Projektbeginn {0}',
        endDateDescriptionTpl: ' Datum Projektende {0}'
    },
    DependencyType: {
        long: [
            'Start-zu-Start',
            'Start-zu-Ende',
            'Ende-zu-Start',
            'Ende-zu-Ende'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Manuell terminiertes  "{2}" zwingt seine untergeordneten Elemente, nicht früher zu starten als {0}',
        endDescriptionTpl: 'Manuell terminiertes  "{2}" zwingt seine untergeordneten Elemente, spätestens am {1} zu enden'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Manuelle Terminierung deaktivieren für "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Abhängigkeit ({2}) von "{3}" bis "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Abhängigkeit von "{1}" bis "{2}" entfernen'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Abhängigkeit von "{1}" bis "{2}" deaktivieren'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Aufgabe "{2}" {3} {0} Einschränkung',
        endDateDescriptionTpl: 'Aufgabe "{2}" {3} {1} Einschränkung',
        constraintTypeTpl: {
            startnoearlierthan: 'Darf nicht fürher als (starten)',
            finishnoearlierthan: 'Nicht früher als (enden)',
            muststarton: 'Muss starten am',
            mustfinishon: 'Muss fertig sein am',
            startnolaterthan: 'Nicht später als (starten)',
            finishnolaterthan: 'Nicht später als (enden)'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Einschränkung "{1}" der Aufgabe "{0}" entfernen'
    }
};
export default LocaleHelper.publishLocale(locale);
