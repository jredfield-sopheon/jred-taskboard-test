import LocaleHelper from '../../lib/Core/localization/LocaleHelper.js';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',

    Button : {
        'Display hints' : 'Visa tips',
        Apply           : 'Verkställ'
    },

    Checkbox : {
        'Auto apply'  : 'Auto applicera',
        Automatically : 'Automatiskt'
    },

    CodeEditor : {
        'Code editor'   : 'Kodredigerare',
        'Download code' : 'Ladda ner kod'
    },

    Combo : {
        Theme    : 'Välj tema',
        Language : 'Välj språk',
        Size     : 'Välj storlek'
    },

    Shared : {
        'Full size'      : 'Full storlek',
        'Locale changed' : 'Språk ändrat',
        'Phone size'     : 'Telefonstorlek'
    },

    Tooltip : {
        infoButton       : 'Klicka för att visa information och byta tema eller språk',
        codeButton       : 'Klicka för att visa den inbyggda kodredigeraren',
        hintCheck        : 'Markera för att automatiskt visa tips när du laddar exemplet',
        fullscreenButton : 'Fullskärm'
    }
};

export default LocaleHelper.publishLocale(locale);
