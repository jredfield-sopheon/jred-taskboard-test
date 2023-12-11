import Override from '../../../Core/mixin/Override.js';
import TaskBoardBase from '../../view/TaskBoardBase.js';

class ResponsiveCardOverride {

    static target = {
        class : TaskBoardBase
    };

    static configurable = Object.assign(TaskBoardBase.configurable, {
        cardSizes : []
    });

    // LWC doesn't support ResizeObserver
    changeResizeObserver() {}
}

Override.apply(ResponsiveCardOverride);
