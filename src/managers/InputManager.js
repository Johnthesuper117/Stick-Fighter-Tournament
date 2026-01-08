import InputBuffer from './InputBuffer.js';

export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        // Default Keybinds
        this.keyMap = {
            up: 'W', down: 'S', left: 'A', right: 'D',
            light: 'J', heavy: 'K', special: 'L'
        };
        this.keys = {};
        
        // Input buffering for command inputs
        this.inputBuffer = new InputBuffer();
        this.lastDirection = 'neutral';
        this.directionPressTime = 0;
    }

    setupKeys() {
        Object.keys(this.keyMap).forEach(action => {
            // Check if user has a custom bind
            const savedKey = localStorage.getItem('key_' + action);
            const keyName = savedKey ? savedKey : this.keyMap[action]; // Fallback to default
            
            // Phaser key codes lookup can be tricky with raw strings.
            // We might need a mapper, but usually Phaser.Input.Keyboard.KeyCodes[keyName] works for A-Z.
            if (Phaser.Input.Keyboard.KeyCodes[keyName]) {
                this.keys[action] = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyName]);
            }
        });
    }

    // Call this to update bindings from a settings menu
    remapKey(action, newKeyName) {
        this.scene.input.keyboard.removeKey(this.keys[action]);
        this.keyMap[action] = newKeyName;
        this.keys[action] = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[newKeyName]);
    }

    getInputs(currentTime = Date.now()) {
        // Determine direction based on held keys
        const up = this.keys.up.isDown;
        const down = this.keys.down.isDown;
        const left = this.keys.left.isDown;
        const right = this.keys.right.isDown;

        let direction = 'neutral';
        if (down && left) direction = 'down-left';
        else if (down && right) direction = 'down-right';
        else if (up && left) direction = 'up-left';
        else if (up && right) direction = 'up-right';
        else if (down) direction = 'down';
        else if (up) direction = 'up';
        else if (left) direction = 'left';
        else if (right) direction = 'right';

        // Record direction change in input buffer
        if (direction !== this.lastDirection) {
            this.inputBuffer.recordInput(direction, currentTime);
            this.lastDirection = direction;
            this.directionPressTime = currentTime;
        }

        // Buffer attack inputs for more lenient input
        const lightPressed = Phaser.Input.Keyboard.JustDown(this.keys.light);
        const heavyPressed = Phaser.Input.Keyboard.JustDown(this.keys.heavy);
        const specialPressed = Phaser.Input.Keyboard.JustDown(this.keys.special);

        // Record in buffer
        if (lightPressed) this.inputBuffer.recordInput('light', currentTime);
        if (heavyPressed) this.inputBuffer.recordInput('heavy', currentTime);
        if (specialPressed) this.inputBuffer.recordInput('special', currentTime);

        // Return clear boolean states
        return {
            up,
            down,
            left,
            right,
            direction,
            light: lightPressed,
            heavy: heavyPressed,
            special: specialPressed
        };
    }
}