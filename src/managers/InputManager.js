export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        // Default Keybinds
        this.keyMap = {
            up: 'W', down: 'S', left: 'A', right: 'D',
            light: 'J', heavy: 'K', special: 'L'
        };
        this.keys = {};
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

    getInputs() {
        // Return clear boolean states
        return {
            up: this.keys.up.isDown,
            down: this.keys.down.isDown,
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            light: Phaser.Input.Keyboard.JustDown(this.keys.light),
            heavy: Phaser.Input.Keyboard.JustDown(this.keys.heavy),
            special: Phaser.Input.Keyboard.JustDown(this.keys.special)
        };
    }
}