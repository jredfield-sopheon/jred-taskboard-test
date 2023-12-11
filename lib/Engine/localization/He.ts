import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'He',
    localeDesc : 'עִברִית',
    localeCode : 'he',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'הסר תלות'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'בטל את הפעלת התלות'
    },

    CycleEffectDescription : {
        descriptionTpl : 'נמצא מחזור אשר נוצר ע"י: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : 'לוח שנה "{0}" אינו מספק מרווחי זמן עבודה כלשהם.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'השתמש בלוח שנה 24 שעות עם ימי שבת וראשון ללא עבודה.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'השתמש בלוח שנה של 8 שעות (08:00-12:00, 13:00-17:00) עם ימי שבת וראשון ללא עבודה.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'התעלם מגבול הפרויקט והמשיך בשינוי.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'העברת את המשימה "{0}" להתחיל {1}. זה לפני תאריך ההתחלה של הפרויקט {2}.',
        endDescriptionTpl   : 'העברת את המשימה "{0}" לסיום {1}. זה אחרי תאריך סיום הפרויקט {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'התאם את המשימה לכבוד גבול הפרויקט.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'נמצאה התנגשות בקביעת לוח שנה: {0} מתנגש עם {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'תאריך תחילת הפרויקט {0}',
        endDateDescriptionTpl   : 'תאריך סיום הפרויקט {0}'
    },

    DependencyType : {
        long : [
            'מההתחלה להתחלה',
            'מהסוף להתחלה',
            'מהסוף להתחלה',
            'מהסוף לסוף'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : '"{2}" שנקבע ידנית מאלץ את הילדים שלו להתחיל לא לפני {0}',
        endDescriptionTpl   : '"{2}" שנקבע ידנית מאלץ את הילדים שלו לסיים לא יאוחר מ {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'השבת תזמון ידני עבור "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'תלות ({2}) מ-"{3}" ל-"{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'הסר תלות מ-"{1}" ל-"{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'בטל את הפעלת התלות מ-"{1}" ל-"{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'אילוץ משימה "{2}" {3‏} {0}',
        endDateDescriptionTpl   : 'אילוץ משימה "{2}" {‏3} {1}',
        constraintTypeTpl       : {
            startnoearlierthan  : 'התחל לא לפני',
            finishnoearlierthan : 'סיים לא לפני',
            muststarton         : 'חייב להתחיל ב-',
            mustfinishon        : 'חייב להסתיים ב-',
            startnolaterthan    : 'התחל לא יאוחר מ-',
            finishnolaterthan   : 'סיים לא יאוחר מ-'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'הסר אילוץ "{1}" של משימה "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
