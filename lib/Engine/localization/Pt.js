import LocaleHelper from '../../Core/localization/LocaleHelper.js';
const locale = {
    localeName: 'Pt',
    localeDesc: 'Português',
    localeCode: 'pt',
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Remover dependência'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Desativar dependência'
    },
    CycleEffectDescription: {
        descriptionTpl: 'Foi encontrado um ciclo, formado por: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'O calendário "{0}" não fornece quaisquer intervalos de tempo de trabalho.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Utilize o calendário de 24 horas com sábados e domingos não úteis.'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Utilize o calendário de 8 horas (08:00-12:00, 13:00-17:00) com sábados e domingos não úteis.'
    },
    IgnoreProjectConstraintResolution: {
        descriptionTpl: 'Ignore a fronteira do projeto e prossiga com a mudança.'
    },
    ProjectConstraintConflictEffectDescription: {
        startDescriptionTpl: 'Você moveu a tarefa "{0}" para iniciar {1}. Isso é antes da data de início do projeto {2}.',
        endDescriptionTpl: 'Você moveu a tarefa "{0}" para terminar {1}. Isso ocorre após a data final do projeto {2}.'
    },
    HonorProjectConstraintResolution: {
        descriptionTpl: 'Ajuste a tarefa para honrar a fronteira do projeto.'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'Foi encontrado um conflito de agendamento: {0} está em conflito com {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Data de início do projeto {0}',
        endDateDescriptionTpl: 'Data do fim do projeto {0}'
    },
    DependencyType: {
        long: [
            'Início a Início',
            'Início a Fim',
            'Fim a Início',
            'Fim a Fim'
        ]
    },
    ManuallyScheduledParentConstraintIntervalDescription: {
        startDescriptionTpl: 'Agendamento manual "{2}" obriga os seus filhos a não começar antes de {0}',
        endDescriptionTpl: 'Agendamento manual "{2}" obriga os seus filhos a terminar o mais tardar a {1}'
    },
    DisableManuallyScheduledConflictResolution: {
        descriptionTpl: 'Desativar agendamento manual para "{0}"'
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Dependência ({2}) de "{3}" para "{4}"'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Remover dependência de "{1}" para "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Desativar dependência de "{1}" para "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Restrições {3} {0} da tarefa "{2}"',
        endDateDescriptionTpl: 'Restrições {3} {1} da tarefa "{2}"',
        constraintTypeTpl: {
            startnoearlierthan: 'Iniciar não antes de',
            finishnoearlierthan: 'Terminar não antes de',
            muststarton: 'Tem de começar em',
            mustfinishon: 'Tem de terminar em',
            startnolaterthan: 'Iniciar não depois de',
            finishnolaterthan: 'Terminar não depois de'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Remover a restrição "{1}" da tarefa "{0}"'
    }
};
export default LocaleHelper.publishLocale(locale);
