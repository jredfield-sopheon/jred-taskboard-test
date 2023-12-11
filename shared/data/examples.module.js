const examples = {

    Features : {
        items : [
            { folder : 'auto-columns',  title : 'Auto generate columns' },
            { folder : 'column-toolbars',  title : 'Column toolbars', updated : '4.2.3' },
            { folder : 'config-panel',  title : 'Configuration panel', updated : '4.2.3' },
            { folder : 'column-drag',  title : 'Dragging columns', since : '4.2.3' },
            { folder : 'task-drag',  title : 'Dragging tasks', since : '4.2.3' },
            { folder : 'filtering',  title : 'Filtering tasks, columns & swimlanes' },
            { folder : 'group-by',  title : 'Group-by' },
            { folder : 'simple-task-edit',  title : 'Inline task editing', updated : '5.0.1' },
            { folder : 'responsive',  title : 'Responsive layout' },
            { folder : 'scrolling',  title : 'Scrolling to tasks, columns & swimlanes', updated : '5.0.4' },
            { folder : 'sorting',  title : 'Sorting tasks' },
            { folder : 'todo-list',  title : 'Todo list', updated : '4.2.3' },
            { folder : 'undo-redo',  title : 'Undo/redo support' },
            { folder : 'zooming',  title : 'Zooming' }
        ]
    },

    Basics : {
        items : [
            { folder : 'basic', title : 'Basic setup' },
            { folder : 'bigdataset', title : 'Big data set', since : '5.3.0', updated : '5.5.4' },
            { folder : 'columns', title : 'Handling columns' },
            { folder : 'swimlanes', title : 'Handling swimlanes' },
            { folder : 'themes', title : 'Theme browser', updated : '5.0' }
        ]
    },

    Customization : {
        items : [
            { folder : 'column-header-menu',  title : 'Customized column header menu', updated : '4.2.3' },
            { folder : 'swimlanes-content',  title : 'Customized swimlane content' },
            { folder : 'task-items',  title : 'Customized task contents using task items', updated : '4.2.3' },
            { folder : 'task-edit',  title : 'Customized task editor', updated : '5.0.4' },
            { folder : 'task-menu',  title : 'Customized task menu', updated : '5.0.4' },
            { folder : 'tooltips',  title : 'Customized tooltips', updated : '4.2.3' },
            { folder : 'localization',  title : 'Localization' }
        ]
    },

    Integration : {
        items : [
            { folder : 'backend-sync',  title : 'Syncing with backend', overlay : 'php', offline : true, updated : '5.3.7' },
            { folder : 'webcomponents',  title : 'Web component' },
            {
                folder    : 'salesforce',
                title     : 'Integrate with Salesforce Lightning',
                globalUrl : 'https://bryntum-dev-ed.develop.lightning.force.com/lightning/n/BryntumTaskBoard',
                since     : '5.3.7',
                updated   : '5.4.1',
                overlay   : 'salesforce'
            },
            { folder : 'frameworks/webpack',  title : 'Custom build using WebPack', overlay : 'webpack', version : 'WebPack 4', offline : true },
            { folder : 'frameworks/ionic/ionic-4',  title : 'Integrate with Ionic', build : true, overlay : 'ionic', version : 'Ionic 5, Angular 10' }
        ]
    },

    'Angular examples' : {
        overlay : 'angular',
        tab     : 'angular',
        build   : true,
        items   : [
            { folder : 'frameworks/angular/angular-11',  title : 'Angular 11',  version : 'Angular 11', updated : '5.3.3' },
            { folder : 'frameworks/angular/auto-columns',  title : 'Auto generate columns', version : 'Angular 13', since : '5.1.0' },
            { folder : 'frameworks/angular/column-drag',  title : 'Dragging columns', version : 'Angular 13', since : '5.1.0' },
            { folder : 'frameworks/angular/column-header-menu',  title : 'Customized column header menu', version : 'Angular 13', since : '5.1.0' },
            { folder : 'frameworks/angular/inline-data',  title : 'Inline data', version : 'Angular 15', since : '5.0.3', updated : '5.3.3' },
            { folder : 'frameworks/angular/undo-redo',  title : 'Undo/redo support', version : 'Angular 13', since : '5.1.0' }
        ]
    },

    'React examples' : {
        overlay : 'react',
        tab     : 'react',
        build   : true,
        items   : [
            { folder : 'frameworks/react/javascript/auto-columns',  title : 'Auto generate columns', version : 'React 18', since : '5.1.0' },
            { folder : 'frameworks/react/javascript/column-drag',  title : 'Dragging columns', version : 'React 16', since : '5.1.0' },
            { folder : 'frameworks/react/javascript/column-header-menu',  title : 'Customized column header menu', version : 'React 16', since : '5.1.0' },
            { folder : 'frameworks/react/javascript/inline-data',  title : 'Inline data', version : 'React 16', since : '5.0.3' },
            { folder : 'frameworks/react/javascript/simple',  title : 'Simple setup', version : 'React 16' },
            { folder : 'frameworks/react/javascript/undo-redo',  title : 'Undo/redo support', version : 'React 18', since : '5.1.0' },
            { folder : 'frameworks/react/typescript/basic',  title : 'Basic setup with TypeScript', version : 'React 17', since : '5.0.3' }
        ]
    },

    'React + Vite examples' : {
        overlay : 'react',
        tab     : 'react',
        build   : true,
        items   : [
            { folder : 'frameworks/react-vite/task-items', title : 'JSX Task items (React + Vite)', version : 'React 18 + Vite 4', since : '5.6.0' }
        ]
    },

    'Vue 3 examples' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            { folder : 'frameworks/vue-3/javascript/auto-columns',  title : 'Auto generate columns', version : 'Vue 3', since : '5.1.0', updated : '5.3.0' },
            { folder : 'frameworks/vue-3/javascript/column-drag',  title : 'Dragging columns', version : 'Vue 3', since : '5.1.0', updated : '5.3.0' },
            { folder : 'frameworks/vue-3/javascript/column-header-menu',  title : 'Customized column header menu', version : 'Vue 3', since : '5.1.0', updated : '5.3.0' },
            { folder : 'frameworks/vue-3/javascript/inline-data',  title : 'Inline data', version : 'Vue 3', since : '5.0.3', updated : '5.3.0' },
            { folder : 'frameworks/vue-3/javascript/simple',  title : 'Simple setup', version : 'Vue 3', updated : '5.3.0' },
            { folder : 'frameworks/vue-3/javascript/undo-redo',  title : 'Undo/redo support', version : 'Vue 3', since : '5.1.0', updated : '5.3.0' }
        ]
    },

    'Vue 2 examples' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            { folder : 'frameworks/vue/javascript/simple',  title : 'Simple setup', version : 'Vue 2' }
        ]
    }
};

// Flatten examples tree
window.examples = Object.entries(examples).map(([group, parent]) => parent.items.map(item => Object.assign(item, parent, { group, items : undefined }))).flat();
