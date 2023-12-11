import LocaleHelper from '../../Core/localization/LocaleHelper.js'

const locale = {

    localeName : 'ZhCn',
    localeDesc : '中文（中国）',
    localeCode : 'zh-CN',

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : '移除依附'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : '停用依附'
    },

    CycleEffectDescription : {
        descriptionTpl : '找到一个周期，构成如下：{0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : '"{0}" 日历不提供任何工作时间间隔。'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : '使用 24 小时日历，星期六和星期日不工作。'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : '使用 8 小时日历（08:00-12:00、13:00-17:00），星期六和星期日不工作。'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : '忽略项目边界并进行更改。'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : '您将" {0}"任务移动到 {1}，此起始日期是在项目开始日期{2}之前。',
        endDescriptionTpl   : '您将" {0}"任务移动到 {1}，此完成日期是在项目结束日期{2}之后。'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : '根据项目边界调整任务。'
    },

    ConflictEffectDescription : {
        descriptionTpl : '发现日程冲突：{0} 与 {1} 冲突'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : '项目开始日期 {0}',
        endDateDescriptionTpl   : '项目结束日期 {0}'
    },

    DependencyType : {
        long : [
            '开始到开始',
            '开始到结束',
            '结束到开始',
            '结束到结束'
        ]
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : '手动排程的 "{2}" 强制其子代不早于 {0} 开始',
        endDescriptionTpl   : '手动排程的 "{2}" 强制其子代不早于 {0} 结束'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : '禁用 "{0}" 的手动排程'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : '从 "{3}" 到 "{4}" 的依附 ({2})'
    },

    RemoveDependencyResolution : {
        descriptionTpl : '移除从 "{1}" 到 "{2}" 的依附'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : '停用从 "{1}" 到 "{2}" 的依附'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : '任务 "{2}" {3} {0} 限制',
        endDateDescriptionTpl   : '任务 "{2}" {3} {1} 限制',
        constraintTypeTpl       : {
            startnoearlierthan  : '不早于……开始',
            finishnoearlierthan : '不早于……结束',
            muststarton         : '必须于……开始',
            mustfinishon        : '必须于……结束',
            startnolaterthan    : '不迟于……开始',
            finishnolaterthan   : '不迟于……结束'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : '移除任务 "{0}" 的 "{1}" 限制'
    }
}

export default LocaleHelper.publishLocale(locale)
