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
        // Convert string names to Phaser Key objects
        Object.keys(this.keyMap).forEach(action => {
            const keyName = this.keyMap[action];
            this.keys[action] = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyName]);
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