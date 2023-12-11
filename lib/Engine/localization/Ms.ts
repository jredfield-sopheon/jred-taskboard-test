import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Ms',
    localeDesc : 'Melayu',
    localeCode : 'ms',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Buang kebergantungan'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Nyahaktifkan kebergantungan'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Kitaran telah ditemui, dibentuk oleh: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" kalendar tidak memberikan sebarang jeda masa bekerja.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Guna kalendar 24 jam dengan Sabtu dan Ahad tidak bekerja.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Guna kalendar 8 jam (08:00-12:00, 13:00-17:00) dengan Sabtu dan Ahad tidak bekerja.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Abaikan sempadan projek dan teruskan dengan perubahan.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Anda memindahkan tugas "{0}" untuk memulakan {1}. Ini adalah sebelum tarikh permulaan projek {2}.',
        endDescriptionTpl   : 'Anda memindahkan tugas "{0}" untuk menyelesaikan {1}. Ini adalah selepas tarikh akhir projek {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Laraskan tugas untuk menghormati sempadan projek.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Konflik penjadualan telah ditemui: {0} berkonflik dengan {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Tarikh mula projek {0}',
        endDateDescriptionTpl   : 'Tarikh tamat projek {0}'
    },

    DependencyType : {
        long : [
            'Mula ke Mula',
            'Mula ke Selesai',
            'Selesai ke Mula',
            'Selesai ke Selesai'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Dijadualkan secara manual "{2}" memaksa anak-anaknya untuk bermula tidak lewat daripada {0}',
        endDescriptionTpl   : 'Dijadualkan secara manual "{2}" memaksa anak-anaknya menyelesaikan tidak lewat daripada {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Dinyahdayakan penjadualan manual untuk "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Kebergantungan ({2}) daripada "{3}" kepada "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Buang kebergantugan daripada "{1}" kepada "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Nyahaktifkan kebergantungan daripada "{1}" kepada "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Tugas "{2}" {3} {0} kekangan',
        endDateDescriptionTpl   : 'Tugas "{2}" {3} {1} kekangan',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Mula tidak awal daripada',
            finishnoearlierthan : 'Selesai tidak awal daripada',
            muststarton         : 'Mesti mula pada',
            mustfinishon        : 'Mesti selesai ada',
            startnolaterthan    : 'Mula tidak lewat daripada',
            finishnolaterthan   : 'Selesai tidak lewat daripada'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Buang "{1}" kekangan tugas "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
