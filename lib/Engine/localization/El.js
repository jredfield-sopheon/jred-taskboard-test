import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'El',
    localeDesc: 'Ελληνικά',
    localeCode: 'el',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Κατάργηση εξάρτησης'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Απενεργοποίηση εξάρτησης'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Βρέθηκε ένας κύκλος, ο οποίος διαμορφώθηκε από: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'Το ημερολόγιο "{0}" δεν προσφέρει διαλείμματα εργασιακού χρόνου.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Χρήση ημερολογίου 24 ωρών με τα Σάββατα και τις Κυριακές ως μη εργάσιμες.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Χρήση ημερολογίου 8 ωρών (08:00-12:00, 13:00-17:00) με τα Σάββατα και τις Κυριακές ως μη εργάσιμες.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Αγνοήστε το έργο του έργου και προχωρήστε με την αλλαγή.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Μετακινήσατε "{0}" εργασία για να ξεκινήσετε {1}. Αυτό είναι πριν από την ημερομηνία έναρξης του έργου {2}.',
        endDescriptionTpl: 'Μετακινήσατε "{0}" Εργασία για να ολοκληρώσετε {1}. Αυτό είναι μετά την ημερομηνία λήξης του έργου {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Προσαρμόστε την εργασία για να τιμήσετε τα σύνορα του έργου.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Βρέθηκε μια διένεξη στον προγραμματισμό: Το στοιχείο {0} έρχεται σε διένεξη με το στοιχείο {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Ημερομηνία έναρξης έργου {0}',
        endDateDescriptionTpl: 'Ημερομηνία λήξης έργου {0}'
    },
    DependencyType: {
        long: [
            'Αρχή-με-Αρχή',
            'Αρχή-με-Τέλος',
            'Τέλος-με-Αρχή',
            'Τέλος-με-Τέλος'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Το χειροκίνητα προγραμματισμένο στοιχείο "{2}" αναγκάζει τα θυγατρικά στοιχεία του να ξεκινήσουν αργότερα από {0}',
        endDescriptionTpl: 'Το χειροκίνητα προγραμματισμένο στοιχείο "{2}" αναγκάζει τα θυγατρικά στοιχεία του να τελειώσουν νωρίτερα από {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Απενεργοποίηση χειροκίνητου προγραμματισμού για το στοιχείο "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Εξάρτηση ({2}) από "{3}" έως "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Κατάργηση εξάρτησης από "{1}" έως "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Απενεργοποίηση εξάρτησης από "{1}" έως "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Περιορισμός εργασίας "{2}" {3} {0}',
        endDateDescriptionTpl: 'Περιορισμός εργασίας "{2}" {3} {1}',
        constraintTypeTpl: {
            startnoearlierthan: 'Δεν μπορεί να ξεκινήσει νωρίτερα από τις',
            finishnoearlierthan: 'Δεν μπορεί να τελειώσει νωρίτερα από τις',
            muststarton: 'Πρέπει να ξεκινήσει στις',
            mustfinishon: 'Πρέπει να τελειώσει στις',
            startnolaterthan: 'Δεν μπορεί να ξεκινήσει αργότερα από τις',
            finishnolaterthan: 'Δεν μπορεί να τελειώσει αργότερα από τις'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Κατάργηση περιορισμού "{1}" της εργασίας "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
