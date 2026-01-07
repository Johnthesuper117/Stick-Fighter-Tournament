/**
 * CommandInputManager recognizes fighting game command sequences
 * and maps them to move keys.
 */
export default class CommandInputManager {
    constructor() {
        // Standard fighting game command patterns
        this.commands = {
            // QCF (Quarter Circle Forward): Down -> Down-Right -> Right
            'QCF': ['down', 'down-right', 'right'],
            // QCB (Quarter Circle Back): Down -> Down-Left -> Left
            'QCB': ['down', 'down-left', 'left'],
            // HCF (Half Circle Forward): Left -> Down-Left -> Down -> Down-Right -> Right
            'HCF': ['left', 'down-left', 'down', 'down-right', 'right'],
            // HCB (Half Circle Back): Right -> Down-Right -> Down -> Down-Left -> Left
            'HCB': ['right', 'down-right', 'down', 'down-left', 'left'],
            // DP (Dragon Punch): Right -> Down -> Down-Right
            'DP': ['right', 'down', 'down-right'],
            // RDP (Reverse Dragon Punch): Left -> Down -> Down-Left
            'RDP': ['left', 'down', 'down-left'],
            // Shun Goku Satsu: Left -> Left -> Down -> Right (for joke moves)
            'SGS': ['left', 'left', 'down', 'right']
        };
    }

    /**
     * Get the pattern for a named command
     */
    getCommand(name) {
        return this.commands[name] || null;
    }

    /**
     * Register a custom command pattern
     */
    registerCommand(name, pattern) {
        this.commands[name] = pattern;
    }

    /**
     * Get all available command names
     */
    getCommandNames() {
        return Object.keys(this.commands);
    }
}
