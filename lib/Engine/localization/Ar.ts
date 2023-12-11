import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Ar',
    localeDesc : 'اللغة العربية',
    localeCode : 'ar',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'إزالة التبعية'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'إلغاء تفعيل التبعية'
    },

    CycleEffectDescription : {
        descriptionTpl : 'تم العثور على دورة ، مكونة من: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : 'لا يوفر تقويم "{0}" أي فترات زمنية للعمل. '
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'استخدم تقويمًا لمدة 24 ساعة مع أيام السبت والأحد لغير عطلة. '
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'استخدم تقويمًا لمدة 8 ساعات (08: 00-12: 00 ، 13: 00-17: 00) مع أيام السبت والأحد عطلة. '
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'تجاهل حدود المشروع والمضي قدما في التغيير.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'قمت بنقل مهمة "{0}" لبدء {1}. هذا قبل تاريخ بدء المشروع {2}.',
        endDescriptionTpl   : 'لقد قمت بنقل مهمة "{0}" لإنهاء {1}. هذا بعد تاريخ نهاية المشروع {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'اضبط المهمة لتكريم حدود المشروع.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'تم العثور على تعارض في الجدولة: {0} يتعارض مع {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'تاريخ بدء المشروع {0}',
        endDateDescriptionTpl   : 'تاريخ نهاية المشروع {0}'
    },

    DependencyType : {
        long : [
            'من البداية إلى البداية',
            'من البداية إلى النهاية',
            'من النهاية إلى البداية',
            'من النهاية إلى النهاية'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'تفرض "{2}" المجدولة يدويًا على العناصر التابعة لها ألا تبدأ قبل {0}',
        endDescriptionTpl   : 'تفرض "{2}" المجدولة يدويًا على العناصر التابعة لها أن تنهي قبل {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'تعطيل الجدولة اليدوية لـ "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'التبعية ({2}) من "{3}" إلى "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'إزالة التبعية من "{1}" إلى "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'تعطيل التبعية من "{1}" إلى "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'قيد "{2}" {3} {0} المهمة',
        endDateDescriptionTpl   : 'قيد "{2}" {3} {1} المهمة',
        constraintTypeTpl       : {
            startnoearlierthan  : 'لا تبدأ قبل',
            finishnoearlierthan : 'لا تنهِ قبل',
            muststarton         : 'يجب أن يبدأ في',
            mustfinishon        : 'يجب أن ينتهي في',
            startnolaterthan    : 'ابدأ قبل',
            finishnolaterthan   : 'أنهِ قبل'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'إزالة قيد المهمة "{1}" "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
