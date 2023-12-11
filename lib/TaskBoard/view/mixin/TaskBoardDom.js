import Base from '../../../Core/Base.js';
import DomHelper from '../../../Core/helper/DomHelper.js';
import DomSync from '../../../Core/helper/DomSync.js';

/**
 * @module TaskBoard/view/mixin/TaskBoardDom
 */

/**
 * Mixin that handles resolving elements from records and vice versa.
 *
 * ```javascript
 * // Resolve task record from an element
 * const task = taskBoard.resolveTaskRecord(someElement);
 *
 * // Get tasks element
 * const element = taskBoard.getTaskElement(taskBoard.taskStore.first);
 * ```
 *
 * @mixin
 */
export default Target => class TaskBoardDom extends (Target || Base) {

    //region Config

    static $name = 'TaskBoardDom';

    get widgetClass() {}

    //endregion

    //region Resolve record from element

    /**
     * Retrieves a task record corresponding to the supplied element. Has to be a `.b-taskboard-card` element or
     * descendant thereof.
     *
     * ```javascript
     * const taskRecord = taskBoard.resolveTaskRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.TaskModel}
     * @category DOM
     */
    resolveTaskRecord(element) {
        element = element.closest('.b-taskboard-card');
        // If element is a drop indicator, it wont have elementData
        return element && this.project.taskStore.getById(element.elementData?.taskId);
    }

    /**
     * Retrieves a column record resolved from the supplied element. Has to be a `.b-taskboard-column` element or
     * descendant thereof (such as a card).
     *
     * ```javascript
     * const columnRecord = taskBoard.resolveColumnRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.ColumnModel}
     * @category DOM
     */
    resolveColumnRecord(element) {
        element = element.closest('.b-taskboard-column, .b-taskboard-column-header');
        // Headers are b-taskboard-column but without elementData, for now
        return element && this.columns.getById(element.elementData?.columnId);
    }

    /**
     * Retrieves a swimlane record resolved from the supplied element. Has to be a `.b-taskboard-swimlane` element or
     * descendant thereof.
     *
     * ```javascript
     * const swimlaneRecord = taskBoard.resolveSwimlaneRecord(taskElement);
     * ```
     *
     * @param {HTMLElement} element
     * @returns {TaskBoard.model.SwimlaneModel}
     * @category DOM
     */
    resolveSwimlaneRecord(element) {
        element = element.closest('.b-taskboard-swimlane');
        return element && this.swimlanes?.getById(element.elementData.laneId);
    }

    //endregion

    //region Get element from record

    /**
     * Retrieves the task element (card) corresponding to the supplied task record.
     *
     * ```javascript
     * const cardElement = taskBoard.getTaskElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskElement(taskRecord) {
        const taskColumnElement = this.getTaskColumnElement(taskRecord);
        return taskColumnElement && DomSync.getChild(taskColumnElement, `body.inner.${taskRecord.domId}`);
    }

    /**
     * Retrieves the element for the column that holds the supplied task record.
     *
     * ```javascript
     * const columnElement = taskBoard.getColumnElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskColumnElement(taskRecord) {
        const columnRecord = this.columns.getById(taskRecord.getValue(this.columnField));
        return columnRecord && DomSync.getChild(this.getTaskSwimlaneElement(taskRecord), `body.${columnRecord.domId}`);
    }

    /**
     * Retrieves the element for the swimlane that holds the supplied task record.
     *
     * ```javascript
     * const swimlaneElement = taskBoard.getTaskSwimlaneElement(taskRecord);
     * ```
     *
     * @param {TaskBoard.model.TaskModel} taskRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getTaskSwimlaneElement(taskRecord) {
        // When not using swimlanes, we still create one called 'default'
        const laneId = this.swimlanes?.count
            ? this.swimlanes.getById(taskRecord.getValue(this.swimlaneField))?.domId
            : 'default';

        return DomSync.getChild(this.bodyElement, laneId);
    }

    /**
     * Retrieves the element for the supplied swimlane.
     *
     * ```javascript
     * const swimlaneElement = taskBoard.getSwimlaneElement(taskBoard.swimlanes.first);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getSwimlaneElement(swimlaneRecord) {
        // Get a swimlane element, does not query DOM and is thus cheap
        return DomSync.getChild(this.bodyElement, swimlaneRecord.domId);
    }

    /**
     * Retrieves the element for the supplied swimlane / column intersection.
     *
     * ```javascript
     * const element = taskBoard.getSwimlaneColumnElement(taskBoard.swimlanes.first, taskBoard.columns.last);
     * ```
     *
     * @param {TaskBoard.model.SwimlaneModel} swimlaneRecord
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getSwimlaneColumnElement(swimlaneRecord, columnRecord) {
        // Called with a swimlaneRecord (public API)
        if (swimlaneRecord) {
            // Get the column element for specified column / swimlane intersection, does not query DOM and is thus cheap
            return DomSync.getChild(this.getSwimlaneElement(swimlaneRecord), `body.${columnRecord.domId}`);
        }
        // Called without, happens internally when not using swimlanes - to have simpler code paths
        else {
            return this.getColumnElement(columnRecord);
        }
    }

    /**
     * Retrieves the element for the supplied column.
     *
     * Only applicable when not using swimlanes. If you are using swimlanes, see {@link #function-getColumnElements}.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnElement(columnRecord) {
        return this.getColumnElements(columnRecord)?.[0];
    }

    /**
     * Retrieves the elements for the supplied column. When using swimlanes, a column has one element per swimlane.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnElements(columnRecord) {
        // A column can span multiple swimlanes, it will have one element per swimlane.
        // If we have multiple swimlanes, iterate them and retrieve column elements.
        // This approach avoids querying DOM and is thus cheap
        if (this.swimlanes?.count) {
            return this.swimlanes.reduce((result, lane) => {
                if (!lane.hidden) {
                    result.push(this.getSwimlaneColumnElement(lane, columnRecord));
                }
                return result;
            }, []);
        }

        // No swimlanes, still return as array for consistency
        return [this.getSwimlaneColumnElement({ domId : 'default' }, columnRecord)];
    }

    /**
     * Retrieves the header element for the supplied column.
     *
     * @param {TaskBoard.model.ColumnModel} columnRecord
     * @returns {HTMLElement}
     * @category DOM
     */
    getColumnHeaderElement(columnRecord) {
        return DomSync.getChild(this.bodyElement, `header.${columnRecord.domId}`);
    }

    //endregion

    //region Position based

    /**
     * Get the card element at (x, y)
     * @param {Number} x
     * @param {Number} y
     * @param {String} cardSelector
     * @returns {HTMLElement}
     * @internal
     */
    getCardAt(x, y, cardSelector = '.b-taskboard-card') {
        return this.documentRoot.elementFromPoint(x, y)?.closest(cardSelector);
    }

    //endregion

    //region Cached measurements



    cacheCSSVar(name, defaultValue) {
        const me = this;

        let size = me[`_${name}`];

        if (size == null) {
            const value = me.css[name];

            size  = DomHelper.measureSize(value || defaultValue, me.element);

            if (value) {
                me[`_${name}`] = size;
            }
        }

        return size;
    }

    // Cached card gap
    get cardGap() {
        return this.cacheCSSVar('cardGap', '1em');
    }

    //endregion

};
