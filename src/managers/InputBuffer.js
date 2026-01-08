/**
 * InputBuffer tracks the last N inputs and can recognize command patterns.
 * Used for detecting motion inputs like Quarter-Circle-Forward (QCF), etc.
 */
export default class InputBuffer {
    constructor(bufferSize = 20) {
        this.buffer = []; // Array of {direction, time}
        this.bufferSize = bufferSize;
        this.maxAge = 1000; // Max age of a command in ms (1 second)
    }

    /**
     * Record a directional input
     * direction: 'neutral', 'left', 'right', 'up', 'down', 'up-left', 'up-right', 'down-left', 'down-right'
     */
    recordInput(direction, currentTime) {
        if (direction === 'neutral') return; // Don't record neutral

        this.buffer.push({
            direction,
            time: currentTime
        });

        // Keep buffer size in check
        if (this.buffer.length > this.bufferSize) {
            this.buffer.shift();
        }

        // Clean old inputs
        this.cleanOldInputs(currentTime);
    }

    /**
     * Remove inputs older than maxAge
     */
    cleanOldInputs(currentTime) {
        this.buffer = this.buffer.filter(input => currentTime - input.time < this.maxAge);
    }

    /**
     * Check if a command pattern was executed
     * pattern: array of directions like ['down', 'down-right', 'right']
     * Returns true if the pattern was found in the recent buffer
     */
    checkCommand(pattern, currentTime) {
        if (pattern.length === 0) return false;

        this.cleanOldInputs(currentTime);

        // Search for the pattern in the buffer
        for (let i = this.buffer.length - pattern.length; i >= 0; i--) {
            let match = true;
            for (let j = 0; j < pattern.length; j++) {
                if (this.buffer[i + j].direction !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clear the input buffer (useful after executing a move)
     */
    clear() {
        this.buffer = [];
    }

    /**
     * Check if a specific input was pressed recently
     * input: the input type (e.g., 'light', 'heavy', 'special')
     * currentTime: current time
     * windowMs: time window in ms
     */
    checkRecentInput(input, currentTime, windowMs = 100) {
        this.cleanOldInputs(currentTime);
        // Note: This assumes inputs are recorded with direction, but for buttons, we need to extend buffer
        // For now, since buttons are not in buffer, return false and handle separately
        return false; // Placeholder, will handle in Fighter
    }

    /**
     * Get the last N inputs as a string for debugging
     */
    getLastInputs(count = 5) {
        return this.buffer.slice(-count).map(i => i.direction).join(' -> ');
    }
}
