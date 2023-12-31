import Model from '../../Core/data/Model.js';

/**
 * @module Grid/data/GridRowModel
 */

/**
 * Model extended with some fields related to grid rendering. Used as default model type in the grids store if nothing
 * else is specified.
 *
 * Using this model is optional. If you use a custom model instead and need the functionality of any of the fields
 * below, you just have to remember to add fields with the same name to your model.
 *
 * @extends Core/data/Model
 */
export default class GridRowModel extends Model {
    static get fields() {
        return [
            /**
             * Icon for row (used automatically in tree, feel free to use it in renderer in other cases)
             * @field {String} iconCls
             * @category Styling
             */
            {
                name     : 'iconCls',
                internal : true
            },

            /**
             * CSS class (or several classes divided by space) to append to row elements
             * @field {String} cls
             * @category Styling
             */
            {
                name     : 'cls',
                internal : true
            },

            /**
             * Used by the default implementation of {@link Grid.view.GridBase#config-getRowHeight} to determine row
             * height. Set it to use another height than the default for a the records row.
             * @field {Number} rowHeight
             * @category Styling
             */
            {
                name     : 'rowHeight',
                internal : true
            },

            /**
             * A link to use for this record when rendered into a {@link Grid.column.TreeColumn}.
             * @field {String} href
             * @category Tree
             */
            {
                name     : 'href',
                internal : true
            },

            /**
             * The target to use if this tree node provides a value for the {@link #field-href} field.
             * @field {'_self'|'_blank'|'_parent'|'_top'|null} target
             * @category Tree
             */
            {
                name     : 'target',
                internal : true
            }
        ];
    }
}

GridRowModel.exposeProperties();
