import UndoRedoBase from '../../Core/widget/base/UndoRedoBase.js';
import '../../Core/widget/Combo.js';
import TaskBoardLinked from './mixin/TaskBoardLinked.js';

/**
 * @module TaskBoard/widget/UndoRedo
 */

/**
 * A widget encapsulating undo/redo functionality for the {@link TaskBoard.model.ProjectModel project} of a TaskBoard.
 *
 * To make use of this, the project must be configured with a
 * {@link Scheduler.model.mixin.ProjectModelMixin#config-stm State Tracking Manager}.
 *
 * If inserted into a TaskBoard (such as into a `tbar`, or `bbar`), the project of the that TaskBoard will be used.
 *
 * If this widget is to be used "standalone" (rendered into the DOM outside of a TaskBoard), this must be configured
 * with a reference the TaskBoard.
 *
 * There are three child widgets encapsulated which may be referenced through the {@link Core.widget.Container#property-widgetMap}:
 *
 * - `undoBtn` - The button which operates the undo operation
 * - `transactionsCombo` - A combobox into which is pushed the list of transactions,
 * - `redoBtn` - The button which operates the redo operation
 *
 * The transactionsCombo may be configured away if only the buttons are required:
 *
 * ```javascript
 * {
 *     type      : 'undoredo',
 *     items     : {
 *         transactionsCombo : null
 *     }
 * }
 * ```
 *
 * The example below illustrated how to embed an `undoredo` widget in the top toolbar of a TaskBoard:
 *
 * {@inlineexample TaskBoard/widget/UndoRedo.js}
 *
 * @demo TaskBoard/undo-redo
 *
 * @extends Core/widget/base/UndoRedoBase
 * @classtype taskboardundoredo
 * @widget
 */
export default class UndoRedo extends UndoRedoBase.mixin(TaskBoardLinked) {

    static $name = 'UndoRedo';

    static type = 'taskboardundoredo';

    construct() {
        super.construct(...arguments);

        this.stm = this.taskBoard.project.stm;
    }
}

UndoRedo.initClass();
