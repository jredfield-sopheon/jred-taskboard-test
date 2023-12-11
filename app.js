import './shared/shared.js'; // not required, our example styling etc.
import TaskBoard from './lib/TaskBoard/view/TaskBoard.js';
import './lib/TaskBoard/feature/ColumnDrag.js';
import './lib/TaskBoard/feature/SwimlaneDrag.js';
import './lib/TaskBoard/feature/TaskTooltip.js';
import './lib/TaskBoard/widget/SwimlanePickerButton.js';
import './lib/TaskBoard/widget/SwimlaneFilterField.js';
import './lib/TaskBoard/widget/TaskFilterField.js';

var parentViewUID = null;

const taskBoard = new TaskBoard({
    appendTo : 'container',

    // Experimental, transition moving cards using the editor
    useDomTransition : true,

    features : {
        columnDrag   : true,
        swimlaneDrag : true,
        taskTooltip  : true,
        taskMenu   : {
            items : {
                viewStory: {
                    text   : 'View Story',
                    onItem({item, taskRecord}) {
                        taskBoard.widgetMap.addButton.disabled = true;
                        taskBoard.project.taskStore.clearFilters();
                        taskBoard.project.taskStore.addFilter({
                            id: "parentUID",
                            filterBy: record => record.parentUID == taskRecord.id
                        });
                        parentViewUID = taskRecord.id;
                        console.log(parentViewUID)
                    }
                }
            },
            processItems({ taskRecord, columnRecord, items }) {
                if (taskRecord.parentUID) {
                    items.viewStory = null
                }
            }
        }
    },

    columns : [
        'Backlog',
        'In Progress',
        'Done'
    ],

    columnField : 'status',

    // Cards expand to fill available space if there are fewer than tasksPerRow
    stretchCards : true,

    tbar : [
        {
            type    : 'button',
            text    : 'Back',
            onClick : 'up.onBackClick'
        },
        {
            type     : 'button',
            text     : 'View Sprint/Epic/Release',
            onClick  : 'up.onViewSprint',
        },
        {
            type     : 'button',
            text     : 'View by Priority',
            onClick  : 'up.onPriorityView',
        },
        {
            type     : 'button',
            ref      : 'addButton',
            text     : 'Add User Story',
            onClick  : 'up.onAddUserStory',
            disabled : true
        },
        '->',
        { type : 'taskfilterfield' },
        // Field for filtering swimlanes
        { type : 'swimlanefilterfield' },
        // Button for picking which swimlanes to show
        { type : 'swimlanepickerbutton' }
    ],

    taskRenderer({ taskRecord, cardConfig }) {
        const headerContent = cardConfig.children.header.children;
        const bodyContent = cardConfig.children.body.children;

        // Header items are hidden in really small cards, make sure it exists before trying to update its text
        if (headerContent.text) {
            headerContent.text.html = `<b>${taskRecord.hasGeneratedId ? '✻' : taskRecord.id} ${taskRecord.name}</b>`;
        }

        if( bodyContent.text && taskRecord.parentUID == null) {
            bodyContent.text.html = `${taskRecord.description}<br/><br/><b>Tasks</b>`;
            taskBoard.project.taskStore.allRecords.forEach(t => {
                if(t.parentUID == taskRecord.id) {
                    bodyContent.text.html += `<br/>* ${t.name}`;
                }
            });
        }
    },

    project : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    },

    onBackClick() {
        taskBoard.widgetMap.addButton.disabled = true;
        taskBoard.swimlanes.removeAll();
        taskBoard.project.taskStore.clearFilters();
        taskBoard.project.taskStore.addFilter({
            id: "parentUID",
            filterBy: record => record.parentUID == null
        })
    },

    onViewSprint() {
        taskBoard.widgetMap.addButton.disabled = false;
        taskBoard.swimlanes.removeAll();
        taskBoard.project.taskStore.clearFilters();
        parentViewUID = null;
        taskBoard.swimlaneField = "parentUID";
        taskBoard.project.taskStore.allRecords.forEach(t => {
            if(t.parentUID == null) {
                taskBoard.swimlanes.add({ id: t.id, text : t.name });
            }
        })
    },

    onPriorityView() {
        taskBoard.widgetMap.addButton.disabled = true;
        taskBoard.swimlanes.removeAll();
        //taskBoard.project.taskStore.clearFilters();
        parentViewUID = null;
        taskBoard.swimlaneField = "prio";
       
        taskBoard.swimlanes.add({ id: "High", text : "High" });
        taskBoard.swimlanes.add({ id: "Medium", text : "Medium" });
        taskBoard.swimlanes.add({ id: "Low", text : "Low" });

    },

    async onAddUserStory() {
        var t = taskBoard.project.taskStore.add({ name: "New Story", parentUID: null});
        await taskBoard.project.commitAsync();
        console.log(t);
        taskBoard.swimlanes.add({ id: t[0].id, text : t[0].name });
    },
});

taskBoard.project.onLoad = () => {
    taskBoard.project.taskStore.addFilter({
        id: "parentUID",
        filterBy: record => record.parentUID == null
    })
}

taskBoard.project.taskStore.onAdd = ({records}) => {
    if(parentViewUID == null && records[0].parentUID == null) records[0].name = "New Story";
    records[0].description = " ";
    records[0].status = "Backlog";
    if(records[0].parentUID == null) records[0].parentUID = parentViewUID;
}