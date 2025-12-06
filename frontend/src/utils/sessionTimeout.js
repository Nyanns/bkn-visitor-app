// File: frontend/src/utils/sessionTimeout.js
// Session timeout utility for auto-logout after idle time

class SessionTimeout {
    constructor(timeoutMinutes, onTimeout) {
        this.timeoutMinutes = timeoutMinutes;
        this.onTimeout = onTimeout;
        this.timeoutId = null;
        this.warningTimeoutId = null;
        this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        this.resetTimer = this.resetTimer.bind(this);
    }

    start() {
        // Add event listeners for user activity
        this.events.forEach(event => {
            document.addEventListener(event, this.resetTimer, true);
        });

        this.resetTimer();
    }

    stop() {
        // Remove all event listeners
        this.events.forEach(event => {
            document.removeEventListener(event, this.resetTimer, true);
        });

        // Clear any active timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    }

    resetTimer() {
        // Clear existing timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);

        // Set new timeout (convert minutes to milliseconds)
        const timeoutMs = this.timeoutMinutes * 60 * 1000;

        this.timeoutId = setTimeout(() => {
            this.onTimeout();
        }, timeoutMs);
    }
}

export default SessionTimeout;
