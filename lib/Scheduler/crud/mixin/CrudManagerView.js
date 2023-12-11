/**
 * @module Scheduler/crud/mixin/CrudManagerView
 */

import LoadMaskable from '../../../Core/mixin/LoadMaskable.js';
import Mask from '../../../Core/widget/Mask.js';

/**
 * Mixin to track Crud Manager requests to the server and mask the view during them. For masking, it
 * uses the {@link Core.mixin.LoadMaskable#config-loadMask} and {@link Core.mixin.LoadMaskable#config-syncMask}
 * properties.
 *
 * @mixin
 * @extends Core/mixin/LoadMaskable
 */
export default Target => class CrudManagerView extends Target.mixin(LoadMaskable) {



    static get $name() {
        return 'CrudManagerView';
    }

    static config = {
        clearMaskDelay : null,

        // Test environment may be in a poll wait for mask to disappear.
        // Hiding the mask immediately, before the load sequence ends releases it too early
        testConfig : {
            clearMaskDelay : 0
        }
    };

    //region Init

    afterConstruct() {
        super.afterConstruct();

        const { crudManager, project } = this;

        if (this.loadMask && (crudManager || project).isCrudManagerLoading) {
            // Show loadMask if crud manager is already loading
            this.onCrudManagerLoadStart();
        }
    }

    //endregion

    /**
     * Applies the {@link Scheduler.crud.mixin.CrudManagerView#config-syncMask} as the
     * {@link Core.widget.Widget#config-masked mask} for this widget.
     * @internal
     */
    applySyncMask() {
        const { syncMask } = this;

        if (syncMask) {
            this.masked = Mask.mergeConfigs(this.loadMaskDefaults, syncMask);
        }
    }

    /**
     * Hooks up crud manager listeners
     * @private
     * @category Store
     */
    bindCrudManager(crudManager) {
        this.detachListeners('crudManager');

        let additionalListeners = {};

        // TaskBoard does not need suspending/resuming refreshes
        if (!this.isTaskBoardBase) {
            additionalListeners = {
                beforeApplyResponse       : 'onCrudManagerBeforeApplyResponse',
                applyResponse             : 'onCrudManagerApplyResponse',
                beforeLoadCrudManagerData : 'onCrudManagerBeforeLoadCrudManagerData',
                loadCrudManagerData       : 'onCrudManagerLoadCrudManagerData'
            };
        }

        crudManager?.ion({
            name             : 'crudManager',
            loadStart        : 'onCrudManagerLoadStart',
            beforeSend       : 'onCrudManagerBeforeSend',
            load             : 'onCrudManagerLoad',
            loadCanceled     : 'onCrudManagerLoadCanceled',
            syncStart        : 'onCrudManagerSyncStart',
            sync             : 'onCrudManagerSync',
            syncCanceled     : 'onCrudManagerSyncCanceled',
            requestFail      : 'onCrudManagerRequestFail',
            responseReceived : 'onAjaxTransportResponseReceived',
            ...additionalListeners,
            thisObj          : this
        });
    }

    onCrudManagerBeforeSend({ params }) {
        this.applyStartEndParameters?.(params);
    }

    onCrudManagerLoadStart() {
        // Show loadMask before crud manager starts loading
        this.applyLoadMask();
        this.toggleEmptyText?.();
    }

    onCrudManagerSyncStart() {
        this.applySyncMask();
    }

    onCrudManagerBeforeApplyResponse() {
        // Prevent redrawing for each applied change, instead do it once after all changes are applied
        this.suspendRefresh();
    }

    onCrudManagerApplyResponse() {
        // Repaint rows once after applying changes
        this.resumeRefresh(true);
    }

    onCrudManagerBeforeLoadCrudManagerData() {
        // Suspend when app calls loadCrudManagerData() directly
        if (!this.crudManager.applyingLoadResponse) {
            this.suspendRefresh();
        }
    }

    async onCrudManagerLoadCrudManagerData() {
        if (!this.crudManager.applyingLoadResponse) {
            await this.project.commitAsync();

            !this.isDestroyed && this.resumeRefresh(true);
        }
    }

    onCrudManagerRequestFinalize(successful = true, requestType, response) {
        const me = this;

        if (successful) {
            me.toggleEmptyText?.();
        }
        else {
            if (!me.masked) {
                me.applyLoadMask();
            }
            me.applyMaskError(
                `<div class="b-grid-load-failure">
                    <div class="b-grid-load-fail">${me.L(`L{GridBase.${requestType}FailedMessage}`)}</div>
                    ${response && response.message ? `<div class="b-grid-load-fail">${me.L('L{CrudManagerView.serverResponseLabel}')} ${response.message}</div>` : ''}
                </div>`);
        }
    }

    onCrudManagerLoadCanceled() {
        this.onCrudManagerRequestFinalize(true, 'load');
    }

    onCrudManagerSyncCanceled() {
        this.onCrudManagerRequestFinalize(true, 'sync');
    }

    onCrudManagerLoad() {
        this.onCrudManagerRequestFinalize(true, 'load');
    }

    onCrudManagerSync() {
        this.onCrudManagerRequestFinalize(true, 'sync');
    }

    onCrudManagerRequestFail({ requestType, response }) {
        this.onCrudManagerRequestFinalize(false, requestType, response);
    }

    onAjaxTransportResponseReceived() {
        const me = this;
        if (me.clearMaskDelay != null) {
            me.setTimeout(() => me.masked = null, me.clearMaskDelay);
        }
        else {
            me.masked = null;
        }
    }

    get widgetClass() {}
};
