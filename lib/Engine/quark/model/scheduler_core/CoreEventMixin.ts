import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { Mixin, AnyConstructor } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CorePartOfProjectModelMixin } from "../mixin/CorePartOfProjectModelMixin.js"
import DateHelper from "../../../../Core/helper/DateHelper.js"
import { Duration, TimeUnit } from "../../../scheduling/Types.js"
import { CoreAssignmentMixin } from "./CoreAssignmentMixin.js"


/**
 * Core event entity mixin type.
 *
 * At this level event is only aware about its dates
 * The functionality, related to the assignments etc is provided in other mixins.
 */
export class CoreEventMixin extends Mixin(
    [ CorePartOfProjectModelMixin ],
    (base : AnyConstructor<CorePartOfProjectModelMixin, typeof CorePartOfProjectModelMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class CoreEventMixin extends base {

        inSetting    : boolean
        durationUnit : string
        _startDate   : Date        = null
        _endDate     : Date        = null
        _duration    : number      = null

        // Proper engine defines these fields since they enter graph, thus we need them
        static get fields () {
            return [
                { name : 'startDate', type : 'date' },
                { name : 'endDate', type : 'date' },
                { name : 'duration', type : 'number' },
                { name : 'durationUnit', type : 'durationunit', defaultValue : 'day' }
            ]
        }


        // Getters return current or proposed value
        get startDate () { return this._startDate ?? this.get('startDate') ?? null }
        get endDate () { return this._endDate ?? this.get('endDate') ?? null }
        get duration () { return this._duration ?? this.get('duration') ?? null }


        // Route all setting through applyXX (setStartDate, startDate = , set('startDate'), batching)
        set startDate (value : Date) { this.proposeStartDate(value) }
        set endDate (value : Date) { this.proposeEndDate(value) }
        set duration (value : number) { this.proposeDuration(value) }


        //region Edge case normalization

        inSet (field, value, silent, fromRelationUpdate, skipAccessors) {
            const me                            = this

            // Catch "normal" set calls
            if (me.project && !me.project.isWritingData && typeof field !== 'string' && !skipAccessors) {
                // Flag fields as changed even if we are given a no-change value, to let calculations take decision on
                // whether to keep duration or not
                if ('startDate' in field && !('startDate' in me.$changed)) {
                    me.$changed.startDate = true
                    me.invalidate()
                }
                if ('endDate' in field && !('endDate' in me.$changed)) {
                    me.$changed.endDate = true
                    me.invalidate()
                }
            }

            // @ts-ignore
            return superProto.inSet.call(me, field, value, silent, fromRelationUpdate, skipAccessors)
        }

        //endregion


        //region StartDate


        getStartDate () : Date {
            return this.startDate
        }


        proposeStartDate (startDate : Date, keepDuration : boolean = !('endDate' in this.$changed)) {
            if (this.inSetting || startDate?.getTime() !== this.startDate?.getTime()) {
                this._startDate = startDate
                this.propose({startDate, keepDuration})
            }
        }


        async setStartDate (startDate : Date, keepDuration : boolean = true) : Promise<CommitResult> {
            this.proposeStartDate(startDate, keepDuration)

            return this.project?.commitAsync()
        }


        //endregion


        //region EndDate


        getEndDate () : Date {
            return this.endDate
        }


        proposeEndDate (endDate : Date, keepDuration : boolean = false) {
            if (this.inSetting || endDate?.getTime() !== this.endDate?.getTime()) {
                this._endDate = endDate
                this.propose({endDate, keepDuration})
            }
        }


        async setEndDate (endDate : Date, keepDuration : boolean = false) : Promise<CommitResult> {
            this.proposeEndDate(endDate, keepDuration)

            return this.project?.commitAsync()
        }


        //endregion


        //region Duration


        getDuration () : number {
            return this.duration
        }


        proposeDuration (duration : Duration, unit? : TimeUnit, keepStart : boolean = true) {
            this._duration = duration
            this.propose({duration, keepStart})
            if (unit) this.propose({durationUnit: unit})
        }


        async setDuration (duration : Duration, unit? : TimeUnit, keepStart : boolean = true) : Promise<CommitResult> {
            this.proposeDuration(duration, unit, keepStart)

            return this.project?.commitAsync()
        }


        getDurationUnit () : string {
            return this.durationUnit
        }

        //endregion


        // When joining as part of inline data, store is available. If joining through load, it is passed
        joinProject () {
            const me              = this
            const changed         = me.$changed
            const startDate       = me.getCurrentOrProposed('startDate')
            const endDate         = me.getCurrentOrProposed('endDate')
            const duration        = me.getCurrentOrProposed('duration')

            // Initial values should be considered changed, to be normalized
            if (startDate != null) changed.startDate    = me._startDate     = startDate
            if (endDate != null)   changed.endDate      = me._endDate       = endDate
            if (duration != null)  changed.duration     = me._duration      = duration

            // Resolve assignments when event joins project after load
            if (me.eventStore && !me.eventStore.isLoadingData) {
                const unresolved = me.assignmentStore?.storage.findItem('event', null) as Set<CoreAssignmentMixin>
                if (unresolved) {
                    // To avoid n² iterations over raw assignments we cache them by raw eventId, which saves us
                    // some iterations over the storage
                    // https://github.com/bryntum/support/issues/3141
                    const cachedAssignments = me.assignmentStore?.storage.findItem('eventId', me.id) as Set<CoreAssignmentMixin>

                    if (cachedAssignments) {
                        for (const assignment of cachedAssignments) {
                            assignment.setChanged('event', me)
                        }
                    }
                    else {
                        for (const assignment of unresolved) {
                            if (assignment.getCurrentOrProposed('event') === me.id) {
                                assignment.setChanged('event', me)
                            }
                        }
                    }
                }
            }

            superProto.joinProject.call(me)
        }


        // Mimic how proper engine applies values
        applyValue (useProp : boolean, key : string, value : any, skipAccessors : boolean, field : any) {
            // @ts-ignore
            if ((this.project || this.recurringTimeSpan?.project) && field) {
                const { name } = field
                if (name === 'startDate' || name == 'duration' || name === 'endDate') {
                    useProp = true

                    // Update cached value
                    this['_' + name] = value
                }
                if (skipAccessors) {
                    useProp = false
                }
            }
            superProto.applyValue.call(this, useProp, key, value, skipAccessors, field)
        }

        // Catch changes from batches etc. In which case it is sometimes expected for data to be available directly
        afterChange (toSet : any, wasSet : any, silent : boolean, fromRelationUpdate : boolean, skipAccessors : boolean) {
            if (!this.$isCalculating && !skipAccessors) {
                // In certain scenarios data is expected to be available of the bat, messy!
                this.setData({
                    startDate    : this.getCurrentOrProposed('startDate'),
                    endDate      : this.getCurrentOrProposed('endDate'),
                    duration     : this.getCurrentOrProposed('duration'),
                    durationUnit : this.getCurrentOrProposed('durationUnit')
                })
            }

            superProto.afterChange.call(this, toSet, wasSet, silent, fromRelationUpdate, skipAccessors)
        }


        // Normalizes dates & duration
        calculateInvalidated () {
            const me                 = this
            const changed            = me.$changed
            const changedStart       = 'startDate' in changed
            const changedEnd         = 'endDate' in changed
            const changedDuration    = 'duration' in changed

            const { startDate, endDate, duration, keepDuration, keepStart } = changed

            let calculate : string = null

            // Only start changed
            if (changedStart && !changedEnd && !changedDuration) {
                // Also null end when nulling start (keeping duration)
                if (startDate === null) {
                    changed.endDate = null
                }
                // Start after end without keeping duration -> move end to start
                else if (me.hasCurrentOrProposed('endDate') && startDate > me.getCurrentOrProposed('endDate') && !keepDuration) {
                    changed.endDate  = startDate
                    changed.duration = 0
                }
                // Start changed and we either have a duration that we want to keep or no end -> calculate end
                else if (me.hasCurrentOrProposed('duration') && (keepDuration || !me.hasCurrentOrProposed('endDate'))) {
                    calculate = 'endDate'
                }
                // Start change and we have an end already -> calculate duration
                else if (me.hasCurrentOrProposed('endDate')) {
                    calculate = 'duration'
                }
            }

            // Only end changed
            else if (!changedStart && changedEnd && !changedDuration) {
                // Also null start when nulling end (keeping duration)
                if (endDate === null) {
                    changed.startDate = null
                }
                // End before start without keeping duration -> move start to end
                else if (me.hasCurrentOrProposed('startDate') && !keepDuration && endDate !== true && endDate < me.getCurrentOrProposed('startDate')) {
                    changed.startDate = endDate
                    changed.duration  = 0
                }
                // End changed and we either have a duration that we want to keep or no start -> calculate start
                else if (me.hasCurrentOrProposed('duration') && (keepDuration  || !me.hasCurrentOrProposed('startDate'))) {
                    calculate = 'startDate'
                }
                // End changed and we have a start already -> calculate duration
                else if (me.hasCurrentOrProposed('startDate')) {
                    calculate = 'duration'
                }
            }

            // Only duration changed
            else if (!changedStart && !changedEnd && changedDuration) {
                // Also null end when nulling duration (keeping start)
                if (duration === null) {
                    changed.endDate = null
                }
                // Duration changed and we either have a start that we want to keep or no end -> calculate end
                else if (me.hasCurrentOrProposed('startDate') && (keepStart || !me.hasCurrentOrProposed('endDate'))) {
                    if (keepStart && changed.duration < 0) {
                        changed.duration = 0
                    }

                    calculate = 'endDate'
                }
                // Duration changed and we have an end already -> calculate start
                else if (me.hasCurrentOrProposed('endDate')) {
                    calculate = 'startDate'
                }
            }

            // Start and end change, affect duration
            else if (changedStart && changedEnd && !changedDuration) {
                // Both nulled, null duration
                if (startDate === null && endDate === null) {
                    changed.duration = null
                }
                // Other cases -> calculate duration
                else {
                    calculate = 'duration'
                }
            }

            // Start and duration change -> calculate end
            else if (changedStart && !changedEnd && changedDuration) {
                calculate = 'endDate'
            }

            // End and duration changed -> calculate start
            else if (!changedStart && changedEnd && changedDuration) {
                calculate = 'startDate'
            }

            // All changed -> calculate whichever is null or by default end to be sure things add up
            else if (changedStart && changedEnd && changedDuration) {
                if (duration == null) {
                    calculate = 'duration'
                }
                else if (startDate == null) {
                    calculate = 'startDate'
                }
                else {
                    calculate = 'endDate'
                }
            }

            // Normalize if needed
            const currentOrProposedStartDate    = me.getCurrentOrProposed('startDate')
            const currentOrProposedEndDate      = me.getCurrentOrProposed('endDate')
            const currentOrProposedDuration     = me.getCurrentOrProposed('duration')
            const currentOrProposedDurationUnit = me.getCurrentOrProposed('durationUnit')

            const adjustDurationToDST           = me.getProject()?.adjustDurationToDST ?? false

            switch (calculate) {
                case 'startDate':
                    const newStartDate  = DateHelper.add(currentOrProposedEndDate, -currentOrProposedDuration, currentOrProposedDurationUnit)

                    if (adjustDurationToDST) {
                        const dstDiff   = currentOrProposedEndDate.getTimezoneOffset() - newStartDate.getTimezoneOffset()
                        newStartDate.setTime(newStartDate.getTime() - dstDiff * 60 * 1000)
                    }

                    changed.startDate   = newStartDate
                    break

                case 'endDate':
                    const newEndDate    = DateHelper.add(currentOrProposedStartDate, currentOrProposedDuration, currentOrProposedDurationUnit)

                    if (adjustDurationToDST) {
                        const dstDiff   = currentOrProposedStartDate.getTimezoneOffset() - newEndDate.getTimezoneOffset()
                        newEndDate.setTime(newEndDate.getTime() - dstDiff * 60 * 1000)
                    }

                    changed.endDate     = newEndDate
                    break

                case 'duration':
                    let newDuration     = DateHelper.diff(currentOrProposedStartDate, currentOrProposedEndDate, 'millisecond')

                    if (adjustDurationToDST) {
                        const dstDiff   = currentOrProposedStartDate.getTimezoneOffset() - currentOrProposedEndDate.getTimezoneOffset()
                        newDuration     += dstDiff * 60 * 1000
                    }

                    changed.duration    = DateHelper.as(currentOrProposedDurationUnit, newDuration, 'millisecond')
                    break
            }

            if ('startDate' in changed && changed.startDate !== true) this._startDate  = changed.startDate
            if ('endDate' in changed && changed.endDate !== true)     this._endDate    = changed.endDate
            if ('duration' in changed && changed.duration !== true)   this._duration   = changed.duration

            // Clean up flags, not intended to be actually set
            if (changed.startDate === true) delete changed.startDate
            if (changed.endDate === true)   delete changed.endDate

            delete changed.keepDuration
            delete changed.keepStart
        }


    }

    return CoreEventMixin
}){}
