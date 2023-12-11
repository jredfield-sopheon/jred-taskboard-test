import Base from '../../../Core/Base.js';
import ProjectModel from '../../model/ProjectModel.js';
import StringHelper from '../../../Core/helper/StringHelper.js';
import TimeZoneHelper from '../../../Core/helper/TimeZoneHelper.js';

/**
 * @module Scheduler/data/mixin/ProjectConsumer
 */

const engineStoreNames = [
    'assignmentStore',
    'dependencyStore',
    'eventStore',
    'resourceStore'
];

/**
 * Creates a Project using any configured stores, and sets the stores configured into the project into
 * the host object.
 *
 * @mixin
 */
export default Target => class ProjectConsumer extends (Target || Base) {
    static get $name() {
        return 'ProjectConsumer';
    }

    //region Default config

    static get declarable() {
        return ['projectStores'];
    }

    static get configurable() {
        return {
            projectModelClass : ProjectModel,

            /**
             * A {@link Scheduler.model.ProjectModel} instance or a config object. The project holds all Scheduler data.
             * Can be omitted in favor of individual store configs or {@link Scheduler.view.mixin.SchedulerStores#config-crudManager} config.
             *
             * **Note:** In SchedulerPro the project is instance of SchedulerPro.model.ProjectModel class.
             * @prp {Scheduler.model.ProjectModel|ProjectModelConfig} project
             * @typings {ProjectModel|ProjectModelConfig}
             * @category Data
             */
            project : {},

            /**
             * Configure as `true` to destroy the Project and stores when `this` is destroyed.
             * @config {Boolean}
             * @category Data
             */
            destroyStores : null,

            // Will be populated by AttachToProjectMixin which features mix in
            projectSubscribers : []
        };
    }

    #suspendedByRestore;

    //endregion

    startConfigure(config) {
        // process the project first which ingests any configured data sources,
        this.getConfig('project');

        super.startConfigure(config);
    }

    //region Project

    // This is where all the ingestion happens.
    // At config time, the changers inject incoming values into the project config object
    // that we are building. At the end we instantiate the project with all incoming
    // config values filled in.
    changeProject(project, oldProject) {
        const
            me = this,
            {
                projectStoreNames,
                projectDataNames
            }  = me.constructor;

        me.projectCallbacks = new Set();

        if (project) {
            // Flag for changes to know what stage we are at
            me.buildingProjectConfig = true;

            if (!project.isModel) {
                // When configuring, prio order:
                // 1. If using an already existing CrudManager, it is assumed to already have the stores we should use,
                //    adopt them as ours.
                // 2. If a supplied store already has a project, it is assumed to be shared with another scheduler and
                //    that project is adopted as ours. Unless we are given some store not part of that project,
                //    in which case we create a new project.
                // 3. Use stores from a supplied project config.
                // 4. Use stores configured on scheduler.
                // + Pass on inline data (events, resources, dependencies, assignments -> xxData on the project config)
                //
                // What happens during project initialization is this:
                // this._project is the project *config* object.
                // changeXxxx methods put incoming values directly into it through this.project
                // to be used as its configuration.
                // So when it is instantiated, it has had all configs injected.
                if (me.isConfiguring) {
                    // Set property for changers to put incoming values into
                    me._project = project;

                    // crudManager will be a clone of the raw config if it is a raw config.
                    const { crudManager } = me;

                    // Pull in stores from the crudManager config first
                    if (crudManager) {
                        const { isCrudManager } = crudManager;

                        for (const storeName of projectStoreNames) {
                            if (crudManager[storeName]) {

                                // We configure the project with the stores, and *not* the CrudManager.
                                // The CrudManager ends up having its project set and thereby adopting ours.
                                me[storeName] = crudManager[storeName];

                                // If it's just a config, take the stores out.
                                // We will *configure* it with this project and it will ingest
                                // its stores from there.
                                if (!isCrudManager) {
                                    delete crudManager[storeName];
                                }
                            }
                        }
                    }

                    // Pull in all our configured stores into the project config object.
                    // That also extracts any project into this._sharedProject
                    me.getConfig('projectStores');

                    // Referencing these data configs causes them to be pulled into
                    // the _project.xxxData config property if they are present.
                    for (const dataName of projectDataNames) {
                        me.getConfig(dataName);
                    }
                }

                const { eventStore } = project;
                let { _sharedProject : sharedProject } = me;

                // Delay autoLoading until listeners are set up, to be able to inject params
                if (eventStore && !eventStore.isEventStoreMixin && eventStore.autoLoad && !eventStore.count) {
                    eventStore.autoLoad = false;
                    me.delayAutoLoad = true;
                }

                // We should not adopt a project from a store if we are given any store not part of that project
                if (sharedProject && engineStoreNames.some(store => project[store] && project[store] !== sharedProject[store])) {
                    // We have to chain any store used by the other project, they can only belong to one
                    for (const store of engineStoreNames) {
                        if (project[store] && project[store] === sharedProject[store]) {
                            project[store] = project[store].chain();
                        }
                    }

                    sharedProject = null;
                }

                // Use sharedProject if found, else instantiate our config.
                project = sharedProject || new me.projectModelClass(project);

                // Clear the property so that the updater is called.
                delete me._project;
            }

            // In the updater, configs are live
            me.buildingProjectConfig = false;
        }

        return project;
    }

    /**
     * Implement in subclass to take action when project is replaced.
     *
     * __`super.updateProject(...arguments)` must be called first.__
     *
     * @param {Scheduler.model.ProjectModel} project
     * @category Data
     */
    updateProject(project, oldProject) {
        const
            me = this,
            {
                projectListeners,
                crudManager
            }  = me;

        me.detachListeners('projectConsumer');

        // When we set the crudManager now, it will go through to the CrudManagerVIew
        delete me._crudManager;

        if (project) {
            projectListeners.thisObj = me;
            project.ion(projectListeners);

            // If the project is a CrudManager, use it as such.
            if (project.isCrudManager) {
                me.crudManager = project;
            }
            // Apply the project to CrudManager, making sure the same stores are used there and here
            else if (crudManager) {
                crudManager.project = project;

                // CrudManager goes through the changer as usual and is initialized
                // from the Project, not any stores it was originally configured with.
                me.crudManager = crudManager;
            }

            // Notifies classes that mix AttachToProjectMixin that we have a new project
            me.projectSubscribers.forEach(subscriber => {
                subscriber.detachFromProject(oldProject);
                subscriber.attachToProject(project);
            });

            // Sets the project's stores into the host object
            for (const storeName of me.constructor.projectStoreNames) {
                me[storeName] = project[storeName];
            }

            // Listeners are set up, if EventStore was configured with autoLoad now is the time to load
            if (me.delayAutoLoad) {
                // Restore the flag, not needed but to look good on inspection
                project.eventStore.autoLoad = true;
                project.eventStore.load();
            }

            project.stm?.ion({
                name           : 'projectConsumer',
                restoringStart : 'onProjectRestoringStart',
                restoringStop  : 'onProjectRestoringStop',
                thisObj        : me
            });

        }

        me.trigger('projectChange', { project });
    }

    // Implementation here because we need to get first look at it to adopt its stores
    changeCrudManager(crudManager) {
        // Set the property to be scanned for incoming stores.
        // If it's a config, it will be stripped of those stores prior to construction.
        if (this.buildingProjectConfig) {
            this._crudManager = crudManager.isCrudManager ? crudManager : Object.assign({}, crudManager);
        }
        else {
            return super.changeCrudManager(crudManager);
        }
    }

    // Called when project changes are committed, after data is written back to records
    onProjectDataReady() {
        const me = this;

        // Only update the UI when we are visible
        me.whenVisible(() => {
            if (me.projectCallbacks.size) {
                me.projectCallbacks.forEach(callback => callback());
                me.projectCallbacks.clear();
            }
        }, null, null, 'onProjectDataReady');
    }

    onProjectRestoringStart({ stm }) {
        const { rawQueue } = stm;
        // Suspend refresh if undo/redo potentially leads to multiple refreshes
        if (rawQueue.length && rawQueue[rawQueue.length - 1].length > 1) {
            this.#suspendedByRestore = true;
            this.suspendRefresh();
        }
    }

    onProjectRestoringStop() {
        if (this.#suspendedByRestore) {
            this.#suspendedByRestore = false;
            this.resumeRefresh(true);
        }
    }

    // Overridden in CalendarStores.js
    onBeforeTimeZoneChange() {}

    // When project changes time zone, change start and end dates
    onTimeZoneChange({ timeZone, oldTimeZone }) {
        const me = this;

        // The timeAxis timeZone could be equal to timeZone if we are a partnered scheduler
        if (me.startDate && me.timeAxis.timeZone !== timeZone) {
            const startDate = oldTimeZone != null ? TimeZoneHelper.fromTimeZone(me.startDate, oldTimeZone) : me.startDate;
            me.startDate = timeZone != null ? TimeZoneHelper.toTimeZone(startDate, timeZone) : startDate;

            // Saves the timeZone on the timeAxis as it is shared between partnered schedulers
            me.timeAxis.timeZone = timeZone;
        }
    }

    onStartApplyChangeset() {
        this.suspendRefresh();
    }

    onEndApplyChangeset() {
        this.resumeRefresh(true);
    }

    /**
     * Accepts a callback that will be called when the underlying project is ready (no commit pending and current commit
     * finalized)
     * @param {Function} callback
     * @category Data
     */
    whenProjectReady(callback) {
        // Might already be ready, call directly
        if (this.isEngineReady) {
            callback();
        }
        else {
            this.projectCallbacks.add(callback);
        }
    }

    /**
     * Returns `true` if engine is in a stable calculated state, `false` otherwise.
     * @property {Boolean}
     * @category Misc
     */
    get isEngineReady() {
        // NonWorkingTime calls this during destruction, hence the ?.
        return Boolean(this.project.isEngineReady?.());
    }

    //endregion

    //region Destroy

    // Cleanup, destroys stores if this.destroyStores is true.
    doDestroy() {
        super.doDestroy();

        if (this.destroyStores) {
            // Shared project might already be destroyed
            !this.project.isDestroyed && this.project.destroy();
        }
    }

    //endregion

    get projectStores() {
        const { projectStoreNames } = this.constructor;

        return projectStoreNames.map(storeName => this[storeName]);
    }

    static get projectStoreNames() {
        return Object.keys(this.projectStores);
    }

    static get projectDataNames() {
        return this.projectStoreNames.reduce((result, storeName) => {
            const { dataName } = this.projectStores[storeName];

            if (dataName) {
                result.push(dataName);
            }
            return result;
        }, []);
    }

    static setupProjectStores(cls, meta) {
        const { projectStores } = cls;

        if (projectStores) {
            const
                projectListeners  = {
                    name                 : 'projectConsumer',
                    dataReady            : 'onProjectDataReady',
                    change               : 'relayProjectDataChange',
                    beforeTimeZoneChange : 'onBeforeTimeZoneChange',
                    timeZoneChange       : 'onTimeZoneChange',
                    startApplyChangeset  : 'onStartApplyChangeset',
                    endApplyChangeset    : 'onEndApplyChangeset'
                },
                storeConfigs      = {
                    projectListeners
                };

            let previousDataName;

            // Create a property and updater for each dataName and a changer for each store
            for (const storeName in projectStores) {
                const { dataName } = projectStores[storeName];

                // Define "eventStore" and "events" configs
                storeConfigs[storeName] = storeConfigs[dataName] = null;

                // Define up the "events" property
                if (dataName) {
                    // Getter to return store data
                    Object.defineProperty(meta.class.prototype, dataName, {
                        configurable : true, // So that Config can add its setter.
                        get() {
                            // get events() { return this.project.eventStore.records; }
                            return this.project[storeName]?.records;
                        }
                    });

                    // Create an updater for the data name;
                    this.createDataUpdater(storeName, dataName, previousDataName, meta);
                }

                this.createStoreDescriptor(meta, storeName, projectStores[storeName], projectListeners);

                // The next data updater must reference this data name
                previousDataName = dataName;
            }

            // Create the projectListeners config.
            this.setupConfigs(meta, storeConfigs);
        }
    }

    static createDataUpdater(storeName, dataName, previousDataName, meta) {
        // Create eg "updateEvents(data)".
        // We need it to call this.getConfig('resources') so that ordering of
        // data ingestion is corrected.
        meta.class.prototype[`update${StringHelper.capitalize(dataName)}`] = function(data) {
            const { project } = this;

            // Ensure a dataName that we depend on is called in.
            // For example dependencies must load in order after the events.
            previousDataName && this.getConfig(previousDataName);

            if (this.buildingProjectConfig) {
                // Set the property in the project config object.
                // eg project.eventsData = [...]
                project[`${dataName}Data`] = data;
            }
            else {
                // Live update the project when in use.
                project[storeName].data = data;
            }
        };
    }

    // eslint-disable-next-line bryntum/no-listeners-in-lib
    static createStoreDescriptor(meta, storeName, { listeners }, projectListeners) {
        const
            { prototype : clsProto } = meta.class,
            storeNameCap             = StringHelper.capitalize(storeName);

        // Set up onProjectEventStoreChange to set this.eventStore
        projectListeners[`${storeName}Change`] = function({ store }) {
            this[storeName] = store;
        };

        // create changeEventStore
        clsProto[`change${storeNameCap}`] = function(store, oldStore) {
            const
                me           = this,
                { project }  = me,
                storeProject = store?.project;

            if (me.buildingProjectConfig) {
                // Capture any project found at project config time
                // to use as our shared project
                if (storeProject?.isProjectModel) {
                    me._sharedProject = storeProject;
                }

                // Set the property in the project config object.
                // Must not go through the updater. It's too early to
                // inform host of store change.
                project[storeName] = store;
                return;
            }

            // Live update the project when in use.
            if (!me.initializingProject) {
                if (project[storeName] !== store) {
                    project[`set${storeNameCap}`](store);
                    store = project[storeName];
                }
            }

            // Implement processing here instead of creating a separate updater.
            // Subclasses can implement updaters.
            if (store !== oldStore) {
                if (listeners) {
                    listeners.thisObj = me;
                    listeners.name = `${storeName}Listeners`;
                    // Ensure we don't trigger one refresh per record during data loading
                    listeners.startApplyChangeset = 'onProjectStoreStartApplyChangeset';
                    listeners.endApplyChangeset = 'onProjectStoreEndApplyChangeset';

                    me.detachListeners(listeners.name);

                    store.ion(listeners);
                }

                // Set backing var temporarily, so it can be accessed from AttachToProjectMixin subscribers
                me[`_${storeName}`] = store;

                // Notifies classes that mix AttachToProjectMixin that we have a new XxxxxStore
                me.projectSubscribers.forEach(subscriber => {
                    subscriber[`attachTo${storeNameCap}`]?.(store);
                });

                me[`_${storeName}`] = null;
            }
            return store;
        };
    }

    onProjectStoreStartApplyChangeset() {
        this.suspendRefresh();
    }

    onProjectStoreEndApplyChangeset() {
        this.resumeRefresh(true);
    }

    relayProjectDataChange(event) {
        // Don't trigger change event for tree node collapse/expand
        if ((event.isExpand || event.isCollapse) && !event.records[0].fieldMap.expanded.persist) {
            return;
        }

        /**
         * Fired when data in any of the projects stores changes.
         *
         * Basically a relayed version of each store's own change event, decorated with which store it originates from.
         * See the {@link Core.data.Store#event-change store change event} documentation for more information.
         *
         * @event dataChange
         * @param {Scheduler.data.mixin.ProjectConsumer} source Owning component
         * @typings source -> {typeof Scheduler.data.mixin.ProjectConsumer||any}
         * @param {Scheduler.model.mixin.ProjectModelMixin} project Project model
         * @typings project -> {typeof Scheduler.model.mixin.ProjectModelMixin||any}
         * @param {Core.data.Store} store Affected store
         * @param {'remove'|'removeAll'|'add'|'updatemultiple'|'clearchanges'|'filter'|'update'|'dataset'|'replace'} action
         * Name of action which triggered the change. May be one of:
         * * `'remove'`
         * * `'removeAll'`
         * * `'add'`
         * * `'updatemultiple'`
         * * `'clearchanges'`
         * * `'filter'`
         * * `'update'`
         * * `'dataset'`
         * * `'replace'`
         * @param {Core.data.Model} record Changed record, for actions that affects exactly one record (`'update'`)
         * @param {Core.data.Model[]} records Changed records, passed for all actions except `'removeAll'`
         * @param {Object} changes Passed for the `'update'` action, info on which record fields changed
         */
        return this.trigger('dataChange', { project : event.source, ...event, source : this });
    }

    //region WidgetClass

    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {}

    //endregion
};
