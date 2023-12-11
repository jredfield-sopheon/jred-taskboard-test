import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Vi',
    localeDesc : 'Tiếng Việt',
    localeCode : 'vi',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Loại bỏ sự phụ thuộc'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Hủy kích hoạt sự phụ thuộc'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Một chu kỳ đã được tìm thấy, được hình thành bởi: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" lịch không cung cấp bất kỳ khoảng thời gian làm việc nào.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Sử dụng lịch 24 giờ với các ngày thứ bảy và chủ nhật không làm việc.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Sử dụng lịch 8 giờ (08: 00-12: 00, 13: 00-17: 00) với các ngày Thứ Bảy và Chủ Nhật không làm việc.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Bỏ qua biên giới dự án và tiến hành thay đổi.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'Bạn đã di chuyển "{0}" Nhiệm vụ để bắt đầu {1}. Đây là trước ngày bắt đầu dự án {2}.',
        endDescriptionTpl   : 'Bạn đã di chuyển "{0}" Nhiệm vụ để hoàn thành {1}. Đây là sau ngày kết thúc dự án {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Điều chỉnh nhiệm vụ để tôn vinh biên giới dự án.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Xung đột lập lịch đã được tìm thấy: {0} đang xung đột với{1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Ngày bắt đầu dự án{0}',
        endDateDescriptionTpl   : 'Ngày kết thúc dự án {0}'
    },

    DependencyType : {
        long : [
            'Bắt đầu đến Bắt đầu',
            'Bắt đầu đến Kết thúc',
            'Kết thúc đến Bắt đầu',
            'Kết thúc đến Kết thúc'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Lên lịch thủ công "{2}" buộc con cái của nó bắt đầu không sớm hơn {0}',
        endDescriptionTpl   : 'Lên lịch thủ công "{2}" buộc con cái của nó kết thúc không sớm hơn {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Hủy lên lịch thủ công cho "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Sự phụ thuộc {2}) từ "{3}" đến "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Loại bỏ sự phụ thuộc từ "{1}" đến "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Hủy kích hoạt sự phụ thuộc từ "{1}" đến "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Nhiệm vụ "{2}" {3} {0} Ràng buộc',
        endDateDescriptionTpl   : 'Nhiệm vụ "{2}" {3} {1} Ràng buộc',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Bắt đầu không sớm hơn',
            finishnoearlierthan : 'Hoàn thành không sớm hơn',
            muststarton         : 'Phải bắt đầu từ',
            mustfinishon        : 'Phải kết thúc từ',
            startnolaterthan    : 'Bắt đầu không muộn hơn',
            finishnolaterthan   : 'Hoàn thành không muộn hơn'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Loại bỏ "{1}" ràng buộc nhiệm vụ "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
