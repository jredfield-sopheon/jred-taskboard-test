import SchedulerProjectCombo from '../../Scheduler/widget/ProjectCombo.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/ProjectCombo
 */

/**
 * Combo that allows picking a dataset to use for a {@link TaskBoard.model.ProjectModel}. Each item holds a title and
 * a load url to reconfigure the project with.
 *
 * {@inlineexample TaskBoard/widget/ProjectCombo.js}
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *     tbar : [
 *         {
 *             type : 'taskboardprojectcombo',
 *             items : [
 *                 { title : 'Important project', url : 'data/load.php?id=1' },
 *                 { title : 'Another project', url : 'data/load.php?id=2' }
 *             ]
 *         }
 *     ],
 *
 *     project : {
 *         transport : {
 *             load : {
 *                 url : 'data/load.php?id=1'
 *             }
 *         },
 *
 *         autoLoad : true
 *     }
 * });
 * ```
 *
 * @extends Scheduler/widget/ProjectCombo
 * @mixes TaskBoard/widget/mixin/TaskBoardLinked
 * @classtype taskboardprojectcombo
 * @widget
 *
 * @typings Scheduler.widget.ProjectCombo -> Scheduler.widget.SchedulerProjectCombo
 */
export default class ProjectCombo extends SchedulerProjectCombo.mixin(TaskBoardLinked) {
    static $name = 'ProjectCombo';
    static type = 'taskboardprojectcombo';

    static configurable = {
        /**
         * Project to reconfigure when picking an item. Resolved automatically if a TaskBoard is configured or detected.
         * @config {TaskBoard.model.ProjectModel}
         * @category Common
         */
        project : null
    };

    updateTaskBoard(taskBoard) {
        if (taskBoard) {
            this.project = taskBoard.project;
        }
    }

    afterConfigure() {
        // Force linking to project if TaskBoard is auto detected
        if (!this._taskBoard) {
            this.updateTaskBoard(this.taskBoard);
        }
    }
}

// Register this widget type with its Factory
ProjectCombo.initClass();
