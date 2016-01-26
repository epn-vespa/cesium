/*global define*/
define([
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/DeveloperError',
        '../Core/getTimestamp',
        './JobType'
    ], function(
        defined,
        defineProperties,
        DeveloperError,
        getTimestamp,
        JobType) {
    "use strict";

    function JobTypeBudget(total) {
        /**
         * Total budget, in milliseconds, allowed for one frame
         */
        this._total = total;

        /**
         * Time, in milliseconds, used so far during this frame
         */
        this.usedThisFrame = 0.0;

        /**
         * Time, in milliseconds, that other job types stole this frame
         */
        this.stolenFromMeThisFrame = 0.0;

        /**
         * Indicates if this job type was starved this frame, i.e., a job
         * tried to run but didn't have budget
         */
        this.starvedThisFrame = false;

        /**
         * Indicates if this job was starved last frame.  This prevents it
         * from being stolen from this frame.
         */
        this.starvedLastFrame = false;
    }

    defineProperties(JobTypeBudget.prototype, {
        total : {
            get : function() {
                return this._total;
            }
        }
    });

    /**
     * Engine for time slicing jobs during a frame to amortize work over multiple frames.  This supports:
     * <ul>
     *   <li>
     *     Separate budgets for different job types, e.g., texture, shader program, and buffer creation.  This
     *     allows all job types to make progress each frame.
     *   </li>
     *   <li>
     *     Stealing from other jobs type budgets if they were not exhausted in the previous frame.  This allows
     *     using the entire budget for all job types each frame even if, for example, all the jobs are the same type.
     *   </li>
     *   <li>
     *     Guaranteed progress on all job types each frame, even if it means exceeding the total budget for the frame.
     *     This prevents, for example, several expensive texture uploads over many frames from prevent a shader compile.
     *   </li>
     * </ul>
     *
     * @private
     */
    function JobScheduler(budgets) {
        if (defined(budgets) && (budgets.length !== JobType.NUMBER_OF_JOB_TYPES)) {
            throw new DeveloperError('A budget must be specified for each job type; budgets.length should equal JobType.NUMBER_OF_JOB_TYPES.');
        }

        // Total for defaults is half of of one frame at 10 fps
        var jobBudgets = new Array(JobType.NUMBER_OF_JOB_TYPES);
        jobBudgets[JobType.TEXTURE] = new JobTypeBudget(defined(budgets) ? budgets[JobType.TEXTURE] : 10.0);
        // On cache miss, this most likely only allows one shader compile per frame
        jobBudgets[JobType.PROGRAM] = new JobTypeBudget(defined(budgets) ? budgets[JobType.PROGRAM] : 10.0);
        jobBudgets[JobType.BUFFER] = new JobTypeBudget(defined(budgets) ? budgets[JobType.BUFFER] : 30.0);

        var length = jobBudgets.length;
        var i;

        var totalBudget = 0.0;
        for (i = 0; i < length; ++i) {
            totalBudget += jobBudgets[i].total;
        }

        var executedThisFrame = new Array(length);
        for (i = 0; i < length; ++i) {
            executedThisFrame[i] = false;
        }

        this._totalBudget = totalBudget;
        this._totalUsedThisFrame = 0.0;
        this._budgets = jobBudgets;
        this._executedThisFrame = executedThisFrame;
    }

    // For unit testing
    JobScheduler.getTimestamp = getTimestamp;

    defineProperties(JobScheduler.prototype, {
        totalBudget : {
            get : function() {
                return this._totalBudget;
            }
        }
    });

    JobScheduler.prototype.disableThisFrame = function() {
        // Prevent jobs from running this frame
        this._totalUsedThisFrame = this._totalBudget;
    };

    JobScheduler.prototype.resetBudgets = function() {
        var budgets = this._budgets;
        var length = budgets.length;
        for (var i = 0; i < length; ++i) {
            var budget = budgets[i];
            budget.starvedLastFrame = budget.starvedThisFrame;
            budget.starvedThisFrame = false;
            budget.usedThisFrame = 0.0;
            budget.stolenFromMeThisFrame = 0.0;
        }
        this._totalUsedThisFrame = 0.0;
    };

    JobScheduler.prototype.execute = function(job, jobType) {
        var budgets = this._budgets;
        var budget = budgets[jobType];

        // This ensures each job type makes progress each frame by executing at least once
        var progressThisFrame = this._executedThisFrame[jobType];

        if ((this._totalUsedThisFrame >= this._totalBudget) && progressThisFrame) {
            // No budget left this frame for jobs of any type
            budget.starvedThisFrame = true;
            return false;
        }

        var stolenBudget;

        if ((budget.usedThisFrame + budget.stolenFromMeThisFrame >= budget.total)) {
            // No budget remaining for jobs of this type. Try to steal from other job types.
            var length = budgets.length;
            for (var i = 0; i < length; ++i) {
                stolenBudget = budgets[i];

                // Steal from this budget if it has time left and it wasn't starved last fame
                if ((stolenBudget.usedThisFrame + stolenBudget.stolenFromMeThisFrame < stolenBudget.total) &&
                    (!stolenBudget.starvedLastFrame)) {
                    break;
                }
            }

            if ((i === length) && progressThisFrame) {
                // No other job types can give up their budget this frame, and
                // this job type already progressed this frame
                return false;
            }

            if (progressThisFrame) {
                // It is considered "starved" even if it executes using stolen time so that
                // next frame, no other job types can steal time from it.
                budget.starvedThisFrame = true;
            }
        }

        var startTime = JobScheduler.getTimestamp();
        job.execute();
        var duration = JobScheduler.getTimestamp() - startTime;

        // Track both time remaining for this job type and all jobs
        // so budget stealing does send us way over the total budget.
        this._totalUsedThisFrame += duration;

        if (stolenBudget) {
            stolenBudget.stolenFromMeThisFrame += duration;
        } else {
            budget.usedThisFrame += duration;
        }
        this._executedThisFrame[jobType] = true;

        return true;
    };

    return JobScheduler;
});