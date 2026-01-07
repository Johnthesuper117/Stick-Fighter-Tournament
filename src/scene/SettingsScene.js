import InputManager from '../managers/InputManager.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() { super('SettingsScene'); }

    create() {
        this.add.text(400, 50, 'CONTROLS', { fontSize: '40px' }).setOrigin(0.5);
        this.add.text(400, 550, '[ ESC ] to Return', { fontSize: '20px' }).setOrigin(0.5);

        // Get the shared input manager (Assuming it's passed or singleton, 
        // but here we will instantiate a temp one to read defaults)
        // Ideally, InputManager should be a Singleton or attached to the Game Registry.
        // For now, let's mock the keys we want to change.
        this.binds = [
            { action: 'left', label: 'Move Left' },
            { action: 'right', label: 'Move Right' },
            { action: 'up', label: 'Jump' },
            { action: 'light', label: 'Light Attack' },
            { action: 'heavy', label: 'Heavy Attack' },
            { action: 'special', label: 'Special' }
        ];

        this.currentKeyIndex = 0;
        this.createMenu();

        // Listen for ESC to go back
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }

    createMenu() {
        let y = 120;
        this.binds.forEach((bind, index) => {
            // Retrieve current key from Registry or default
            const currentKey = localStorage.getItem('key_' + bind.action) || 'Unknown';
            
            const text = this.add.text(200, y, `${bind.label}: ${currentKey}`, { 
                fontSize: '28px', 
                color: '#ffffff' 
            }).setInteractive();

            text.on('pointerdown', () => {
                this.startRebinding(bind, text);
            });

            y += 60;
        });
    }

    startRebinding(bind, textObj) {
        textObj.setColor('#ffff00'); // Turn Yellow
        textObj.setText(`${bind.label}: PRESS KEY...`);

        // One-time listener for the next key press
        const listener = (event) => {
            const keyName = event.key.toUpperCase();
            
            // Save to LocalStorage (Persistent)
            localStorage.setItem('key_' + bind.action, keyName);
            
            // Update UI
            textObj.setText(`${bind.label}: ${keyName}`);
            textObj.setColor('#ffffff');
            
            // Remove listener
            window.removeEventListener('keydown', listener);
        };

        window.addEventListener('keydown', listener);
    }
}