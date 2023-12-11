import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Hi',
    localeDesc: 'हिन्दी',
    localeCode: 'hi',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'निर्भरता हटाएं'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'निर्भरता निष्क्रिय करें'
    },
    CycleEffectDescription: {
        descriptionTpl: 'एक साइकिल मिला है, निर्माता: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" कैलेन्डर कोई कामकाजी समय अंतराल नहीं प्रदान करता है।'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'गैर-कामकाजी शनिवारों और रविवारों के साथ 24 घंटों वाला कैलेन्डर उपयोग करें।'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'गैर-कामकाजी शनिवारों और रविवारों के साथ 8 घंटों वाला कैलेन्डर (08:00-12:00, 13:00-17:00) उपयोग करें।'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'परियोजना सीमा को अनदेखा करें और परिवर्तन के साथ आगे बढ़ें।'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'आपने {1} शुरू करने के लिए "{0}" कार्य को स्थानांतरित कर दिया। यह प्रोजेक्ट प्रारंभ दिनांक {2} से पहले है।',
        endDescriptionTpl: 'आपने {1} को समाप्त करने के लिए "{0}" कार्य को स्थानांतरित कर दिया। यह परियोजना अंत तिथि {2} के बाद है।'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'परियोजना सीमा का सम्मान करने के लिए कार्य को समायोजित करें।'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'कोई शेड्यूलिंग संघर्ष मिला है: {0}  का {1} के साथ संघर्ष हो रहा है।'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'प्रोजेक्ट आरंभ तारीख {0}',
        endDateDescriptionTpl: 'प्रोजेक्ट अंत तारीख {0}'
    },
    DependencyType: {
        long: [
            'आरंभ से आरंभ तक',
            'आरंभ से अंत तक',
            'अंत से आरंभ तक',
            'अंत से अंत तक'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'मैनुअल रूप से शेड्यूल किया गया "{2}" इसके बच्चों को {0} से पहले कतई आरंभ नही करने देता है ',
        endDescriptionTpl: 'मैनुअल रूप से शेड्यूल किया गया "{2}" इसके बच्चों को {1} से पहले कतई अंत नही करने देता है'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: '"{0}" के मैनुअल शेड्यूलिंग अक्षम करें'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: '"{3}" से "{4}" पर निर्भरता ({2})'
    },
    RemoveDependencyResolution: {
        descriptionTpl: '"{1}" से "{2}" पर निर्भरता हटाएं'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: '"{1}" से "{2}" पर निर्भरता निष्क्रिय करें'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'टास्क "{2}" {3} {0} बाधा',
        endDateDescriptionTpl: 'टास्क "{2}" {3} {1} बाधा',
        constraintTypeTpl: {
            startnoearlierthan: 'से पहले शुरू न हो',
            finishnoearlierthan: 'से पहले समाप्त न हो',
            muststarton: 'पर शुरू होना चाहिए',
            mustfinishon: 'पर समाप्त होना चाहिए',
            startnolaterthan: 'के बाद शुरू न हो',
            finishnolaterthan: 'के बाद समाप्त न हो'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'टास्क "{0}" की "{1}" बाधा हटाएं'
    }
};
export default LocaleHelper.publishLocale(locale);
