import Fighter from '../entities/Fighter.js';

export default class FightScene extends Phaser.Scene {
    constructor() {
        super('FightScene');
    }

    preload() {
        // Create a simple texture on the fly so we don't need external images yet
        const graphics = this.make.graphics().fillStyle(0xffffff).fillRect(0, 0, 10, 10);
        graphics.generateTexture('texture', 10, 10);
        graphics.destroy();
    }

    create() {
        // Create Ground
        const ground = this.add.rectangle(400, 580, 800, 40, 0x666666);
        this.physics.add.existing(ground, true); // true = static body

        // Create Player 1
        this.player1 = new Fighter(this, 200, 400, 0x0000ff);
        this.physics.add.collider(this.player1, ground);

        // Define Keys
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
        };
    }

    update() {
        this.player1.update(this.keys);
    }
}