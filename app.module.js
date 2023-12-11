import { TaskBoard } from './build/taskboard.module.js';
import shared from './shared/shared.module.js';

const taskBoard = new TaskBoard({
    appendTo : 'container',

    // Experimental, transition moving cards using the editor
    useDomTransition : true,

    features : {
        columnDrag   : true,
        swimlaneDrag : true,
        taskTooltip  : true
    },

    columns : [
        'todo',
        'doing',
        'review',
        'done'
    ],

    columnField : 'status',

    // Swimlanes, either as { id, text } objects or as strings. String will be used as is as id and capitalized as text
    swimlanes : [
        // id is used to match tasks, text is displayed in swimlanes header
        { id : 'critical', text : 'Critical!!', color : 'red' },
        { id : 'high', text : 'High', color : 'deep-orange' },
        { id : 'medium', text : 'Medium', color : 'orange' },
        // Display more tasks per row in the Low lane
        { id : 'low', text : 'Low', color : 'light-green', tasksPerRow : 3 }
    ],

    // Cards expand to fill available space if there are fewer than tasksPerRow
    stretchCards : true,

    swimlaneField : 'prio',

    tbar : [
        {
            type    : 'button',
            text    : 'Add swimlane',
            icon    : 'b-fa-plus-circle',
            onClick : 'up.onAddClick'
        },
        {
            type     : 'button',
            ref      : 'removeButton',
            text     : 'Remove swimlane',
            icon     : 'b-fa-trash',
            onClick  : 'up.onRemoveClick',
            disabled : true
        },
        '->',
        // Field for filtering swimlanes
        { type : 'swimlanefilterfield' },
        // Button for picking which swimlanes to show
        { type : 'swimlanepickerbutton' }
    ],

    taskRenderer({ taskRecord, cardConfig }) {
        const headerContent = cardConfig.children.header.children;

        // Header items are hidden in really small cards, make sure it exists before trying to update its text
        if (headerContent.text) {
            headerContent.text.text = `${taskRecord.hasGeneratedId ? '✻' : `#${taskRecord.id}`} ${taskRecord.name}`;
        }

        if (taskRecord.prio === 'critical') {
            headerContent.icon = {
                tag   : 'i',
                class : 'b-fa b-fa-exclamation-triangle'
            };
        }
    },

    project : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    },

    onAddClick() {
        const id = taskBoard.swimlanes.count;

        taskBoard.swimlanes.add({ id, text : `Swimlane #${id}` });
        taskBoard.scrollToSwimlane(id);

        taskBoard.widgetMap.removeButton.disabled = false;
    },

    onRemoveClick() {
        taskBoard.swimlanes.last.remove();

        taskBoard.widgetMap.removeButton.disabled = taskBoard.swimlanes.count < 5;
    }
});
