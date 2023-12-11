import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'Th',
    localeDesc : 'ไทย',
    localeCode : 'th',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'ลบการพึ่งพา'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'ปิดใช้งานการพึ่งพา'
    },

    CycleEffectDescription : {
        descriptionTpl : 'พบรอบที่เกิดขึ้นโดย: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" ปฏิทินไม่ได้ระบุช่วงเวลาการทำงานใด ๆ'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'ใช้ปฏิทิน 24 ชั่วโมงกับวันเสาร์และวันอาทิตย์ที่ไม่ได้ทำงาน'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'ใช้ปฏิทิน 8 ชั่วโมง (08:00-12:00 น., 13:00-17:00 น.) กับวันเสาร์และอาทิตย์ที่ไม่ได้ทำงาน'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'ไม่สนใจชายแดนโครงการและดำเนินการเปลี่ยนแปลง'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'คุณย้ายงาน "{0}" เพื่อเริ่มต้น {1} นี่คือก่อนวันที่เริ่มต้นโครงการ {2}',
        endDescriptionTpl   : 'คุณย้ายงาน "{0}" ไปให้เสร็จ {1} นี่คือหลังจากวันที่สิ้นสุดโครงการ {2}'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'ปรับงานเพื่อเป็นเกียรติแก่ชายแดนโครงการ'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'พบข้อขัดแย้งด้านกำหนดการ: {0} ขัดแย้งกับ {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'วันที่เริ่มโครงการ {0}',
        endDateDescriptionTpl   : 'วันที่สิ้นสุดโครงการ {0}'
    },

    DependencyType : {
        long : [
            'เริ่มต้นถึงเริ่มต้น',
            'เริ่มต้นถึงสิ้นสุด',
            'สิ้นสุดถึงเริ่มต้น',
            'สิ้นสุดถึงสิ้นสุด'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : '"{2}" ที่กำหนดเวลาด้วยตนเองบังคับให้เด็ก ๆ เริ่มต้นไม่เร็วกว่า {0}',
        endDescriptionTpl   : '"{2}" ที่กำหนดเวลาด้วยตนเองบังคับให้เด็ก ๆ เสร็จไม่ช้ากว่า {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'ปิดใช้งานการจัดกำหนดการด้วยตนเองสำหรับ "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'การพึ่งพา ({2}) จาก "{3}" ถึง "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'ลบการพึ่งพาจาก "{1}" ถึง "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'ปิดใช้งานการพึ่งพาจาก "{1}" ถึง "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'งาน "{2}" {3} {0} ข้อจำกัด',
        endDateDescriptionTpl   : 'งาน "{2}" {3} {1} ข้อจำกัด',
        constraintTypeTpl       : {
            startnoearlierthan  : 'ต้องไม่เริ่มต้นก่อน',
            finishnoearlierthan : 'ต้องไม่สิ้นสุดก่อน',
            muststarton         : 'ต้องเริ่มตั้งแต่',
            mustfinishon        : 'ต้องสิ้นสุดเมื่อ',
            startnolaterthan    : 'ต้องไม่เริ่มต้นหลังจาก',
            finishnolaterthan   : 'ต้องไม่สิ้นสุดหลังจาก'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'ลบ "{1}" ข้อจำกัดของงาน "{0}"'
    }
}

export default LocaleHelper.publishLocale(locale)
