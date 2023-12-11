import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import Factoryable from '../../Core/mixin/Factoryable.js';

/**
 * @module TaskBoard/feature/TaskBoardFeature
 */

/**
 * The abstract base class for TaskBoard features.
 *
 * @extends Core/mixin/InstancePlugin
 * @abstract
 */
export default class TaskBoardFeature extends InstancePlugin.mixin(Factoryable) {
    static factoryable = {};

    static configurable = {};

    // This makes all feature config changes after initialization recompose TaskBoard
    onConfigChange(args) {
        if (!this.isConfiguring && !this.isDestroying) {
            this.client.recompose();
        }
        super.onConfigChange(args);
    }
}
