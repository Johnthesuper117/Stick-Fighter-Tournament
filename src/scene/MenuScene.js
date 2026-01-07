export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        const cx = 400; // Center X
        this.add.text(cx, 100, 'STICK FIGHTER TOURNAMENT', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);

        // Buttons
        this.createButton(cx, 250, 'Training Mode', () => this.scene.start('SelectScene'));
        this.createButton(cx, 350, 'Settings', () => this.scene.start('SettingsScene'));
    }

    createButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 300, 50, 0x666666).setInteractive();
        const label = this.add.text(x, y, text, { fontSize: '24px' }).setOrigin(0.5);

        bg.on('pointerdown', callback);
        bg.on('pointerover', () => bg.setFillStyle(0x888888));
        bg.on('pointerout', () => bg.setFillStyle(0x666666));
    }
}