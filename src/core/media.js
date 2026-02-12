/**
 * Media Tracker Module
 * 
 * Standalone singleton that replaces the old AppMeasurement s.Media module.
 * Tracks video sessions and detects milestone crossings.
 * Survives across tracking calls so milestones can be accumulated per session.
 *
 * Heartbeat: While playing, a 1-second interval estimates the current position
 * and auto-fires videoMilestone events via appData.push when thresholds are crossed.
 */

const mediaTracker = {
    sessions: {},
    _pendingMilestones: [],

    /**
     * Milestone configuration.
     * Maps percentage thresholds to Adobe Analytics events.
     */
    config: {
        playerName: 'elsevier video player',
        milestones: {
            25: 'event358',
            50: 'event106'
        }
    },

    /**
     * Open a new video session (called on videoStart).
     * @param {string} id - Video identifier
     * @param {number} length - Video duration in seconds
     */
    open(id, length) {
        // Clear any previous session for this id
        if (this.sessions[id] && this.sessions[id]._heartbeatTimer) {
            clearInterval(this.sessions[id]._heartbeatTimer);
        }
        this.sessions[id] = {
            id,
            length: length || 0,
            timePlayed: 0,
            lastPosition: 0,
            milestonesReached: {},
            _playing: false,
            _playStartTime: null,
            _heartbeatTimer: null
        };
        this._pendingMilestones = [];
    },

    /**
     * Mark video as playing (called on videoPlay).
     * @param {string} id - Video identifier
     * @param {number} position - Current position in seconds
     */
    play(id, position) {
        const session = this.sessions[id];
        if (!session) return;
        session.lastPosition = position;
        session._playing = true;
        session._playStartTime = Date.now();
        this._checkMilestones(session, position);
        this._startHeartbeat(session);
    },

    /**
     * Stop/pause video (called on videoStop).
     * Accumulates timePlayed and checks milestones.
     * @param {string} id - Video identifier
     * @param {number} position - Current position in seconds
     * @returns {number} timePlayed delta
     */
    stop(id, position) {
        const session = this.sessions[id];
        if (!session) return 0;

        this._stopHeartbeat(session);
        session._playing = false;

        const delta = position - session.lastPosition;
        if (delta > 0) {
            session.timePlayed += delta;
        }
        session.lastPosition = position;
        this._checkMilestones(session, position);
        return delta > 0 ? delta : 0;
    },

    /**
     * Close a video session (called on videoComplete).
     * Checks final milestones and removes the session.
     * @param {string} id - Video identifier
     * @param {number} position - Final position
     * @returns {number} total timePlayed
     */
    close(id, position) {
        const session = this.sessions[id];
        if (!session) return 0;

        this._stopHeartbeat(session);
        session._playing = false;

        // Accumulate any remaining time
        if (typeof position === 'number') {
            const delta = position - session.lastPosition;
            if (delta > 0) {
                session.timePlayed += delta;
            }
            session.lastPosition = position;
            this._checkMilestones(session, position);
        }

        const timePlayed = session.timePlayed;
        delete this.sessions[id];
        return timePlayed;
    },

    /**
     * Get session data for a video.
     * @param {string} id - Video identifier
     * @returns {object|null}
     */
    getSession(id) {
        return this.sessions[id] || null;
    },

    /**
     * Get and clear pending milestones.
     * Called by tracker.js after each video event's triggerAlloy.
     * @returns {Array<{videoId: string, percent: number, event: string}>}
     */
    getPendingMilestones() {
        const milestones = this._pendingMilestones.slice();
        this._pendingMilestones = [];
        return milestones;
    },

    /**
     * Check if position has crossed any milestone thresholds.
     * Newly crossed milestones are queued in _pendingMilestones.
     * @private
     */
    /**
     * Start the internal heartbeat for a session.
     * Estimates position each second and fires milestones via appData.push.
     * @private
     */
    _startHeartbeat(session) {
        this._stopHeartbeat(session);
        session._heartbeatTimer = setInterval(() => {
            if (!session._playing || !session._playStartTime) return;
            const elapsed = (Date.now() - session._playStartTime) / 1000;
            const estimatedPos = session.lastPosition + elapsed;
            this._checkMilestonesHeartbeat(session, estimatedPos);
        }, 1000);
    },

    /**
     * Stop the heartbeat for a session.
     * @private
     */
    _stopHeartbeat(session) {
        if (session && session._heartbeatTimer) {
            clearInterval(session._heartbeatTimer);
            session._heartbeatTimer = null;
        }
    },

    /**
     * Heartbeat milestone check — fires via appData.push (outside trackEvent).
     * @private
     */
    _checkMilestonesHeartbeat(session, position) {
        if (!session.length || session.length <= 0) return;
        const percent = (position / session.length) * 100;

        for (const [threshold, event] of Object.entries(this.config.milestones)) {
            const t = Number(threshold);
            if (percent >= t && !session.milestonesReached[t]) {
                session.milestonesReached[t] = true;
                // Fire via the normal appData pipeline
                if (window.appData && typeof window.appData.push === 'function') {
                    window.appData.push({
                        event: 'videoMilestone',
                        video: { id: session.id },
                        _media: { milestoneEvent: event, percent: t }
                    });
                }
            }
        }
    },

    /**
     * Synchronous milestone check — queues into _pendingMilestones
     * (used by stop/close where we're already inside trackEvent).
     * @private
     */
    _checkMilestones(session, position) {
        if (!session.length || session.length <= 0) return;
        const percent = (position / session.length) * 100;

        for (const [threshold, event] of Object.entries(this.config.milestones)) {
            const t = Number(threshold);
            if (percent >= t && !session.milestonesReached[t]) {
                session.milestonesReached[t] = true;
                this._pendingMilestones.push({
                    videoId: session.id,
                    percent: t,
                    event: event
                });
            }
        }
    },

    /**
     * Reset all sessions and clear heartbeats. Used in test teardown.
     */
    reset() {
        for (const id of Object.keys(this.sessions)) {
            this._stopHeartbeat(this.sessions[id]);
        }
        this.sessions = {};
        this._pendingMilestones = [];
    }
};

export { mediaTracker };
