import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Id',
    localeDesc : 'Bahasa Indonesia',
    localeCode : 'id',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Hapus dependensi'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Nonaktifkan dependensi'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Siklus ditemukan, dibentuk oleh: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" kalender tidak menyediakan interval waktu kerja.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'gunakan kalender 24 jam dengan Sabtu dan Minggu libur.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'gunakan kalender 8 jam (08:00-12:00, 13:00-17:00) dengan Sabtu dan Minggu libur.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Abaikan perbatasan proyek dan lanjutkan dengan perubahan.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Anda memindahkan "{0}" tugas untuk memulai {1}. Ini sebelum tanggal mulai proyek {2}.',
        endDescriptionTpl   : 'Anda memindahkan "{0}" tugas untuk menyelesaikan {1}. Ini setelah tanggal akhir proyek {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Sesuaikan tugas untuk menghormati perbatasan proyek.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Konflik penjadwalan ditemukan: {0} mengalami konflik dengan {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Tanggal mulai proyek {0}',
        endDateDescriptionTpl   : 'Tanggal selesai proyek {0}'
    },

    DependencyType : {
        long : [
            'Mulai-hingga-Mulai',
            'Mulai-hingga-Selesai',
            'Selesai-hingga-Mulai',
            'Selesai-hingga-Selesai'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Dijadwalkan secara manual "{2}" memaksa anak-anaknya untuk mulai secepatnya pada {0}',
        endDescriptionTpl   : 'Dijadwalkan secara manual "{2}" memaksa anak-anaknya untuk selesai selambatnya pada {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Nonaktifkan penjadwalan manual untuk "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Dependensi ({2}) dari "{3}" hingga "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Hapus dependensi dari "{1}" hingga "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Nonaktifkan dependensi dari "{1}" hingga "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Pembatas "{2}" {3} {0} tugas',
        endDateDescriptionTpl   : 'Pembatas "{2}" {3} {1} tugas',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Dimulai secepatnya pada',
            finishnoearlierthan : 'Diselesaikan secepatnya pada',
            muststarton         : 'Harus dimulai pada',
            mustfinishon        : 'Harus diselesaikan pada',
            startnolaterthan    : 'Dimulai selambatnya pada',
            finishnolaterthan   : 'Diselesaikan selambatnya pada'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Hapus "{1}" pembatas tugas "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
