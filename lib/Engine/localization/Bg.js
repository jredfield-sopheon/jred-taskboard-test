import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Bg',
    localeDesc: 'Български',
    localeCode: 'bg',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Премахване на зависимост'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Деактивиране на зависимост'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Открит е цикъл, формиран от: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: '"{0}" календарът не предоставя интервали от време за работа.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Използвайте 24-часов календар с неработни съботи и недели.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Използвайте 8-часов календар (08:00-12:00, 13:00-17:00) с неработни съботи и недели.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Игнорирайте границата на проекта и продължете с промяната.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Преместихте задача "{0}" да започнете {1}. Това е преди началната дата на проекта {2}.',
        endDescriptionTpl: 'Преместихте задача "{0}" да завършите {1}. Това е след крайната дата на проекта {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Коригирайте задачата, за да почетете границата на проекта.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Открит е конфликт в графика: {0} е в конфликт с {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Начална дата на проекта {0}',
        endDateDescriptionTpl: 'Крайна дата на проекта {0}'
    },
    DependencyType: {
        long: [
            'От начало до начало',
            'От начало до край',
            'От край до начало',
            'От край до край'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Ръчно планираният "{2}" принуждава децата си да започват не по-рано от {0}',
        endDescriptionTpl: 'Ръчно планираното "{2}" принуждава децата си да приключат не по-късно от {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Деактивиране на ръчното планиране за "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Зависимост ({2}) от "{3}" към "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Премахване на зависимостта от "{1}" към "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Деактивиране на зависимостта от "{1}" към "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Задача "{2}" {3} {0} ограничение',
        endDateDescriptionTpl: 'Задача "{2}" {3} {1} ограничение',
        constraintTypeTpl: {
            startnoearlierthan: 'Начало не по-рано от',
            finishnoearlierthan: 'Край не по-рано от',
            muststarton: 'Трябва да започне на',
            mustfinishon: 'Трябва да свърши на',
            startnolaterthan: 'Начало не по-късно от',
            finishnolaterthan: 'Край не по-късно от'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Премахване на ограничението "{1}" на задачата "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
