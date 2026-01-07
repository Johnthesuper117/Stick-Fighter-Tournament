import Fighter from '../entities/Fighter.js';
import InputManager from '../managers/InputManager.js';

// We import JSONs directly (using a bundler) or load them via Phaser Loader.
// For this simple setup, let's assume we load them in Preload.
import alphaData from '../data/alpha.json' assert { type: "json" };
import betaData from '../data/beta.json' assert { type: "json" };

export default class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    create() {
        this.inputs = new InputManager(this);
        this.inputs.setupKeys();

        // Environment
        this.createEnvironment();

        // Spawn Characters
        // Player 1 (Alpha)
        this.p1 = new Fighter(this, 200, 400, alphaData, false);
        // Player 2 (Dummy - Beta)
        this.p2 = new Fighter(this, 600, 400, betaData, true);

        this.physics.add.collider([this.p1, this.p2], this.ground);
        
        // Combat Collision
        // Instead of simple overlap, we create a Hitbox when an attack starts
        this.events.on('attack_start', (attacker, move) => {
            this.createHitbox(attacker, move);
        });

        // HUD
        this.comboText = this.add.text(10, 10, 'Combo: 0', { fontSize: '32px', color: '#fff' });
    }

    createEnvironment() {
        // "Good background" - A dark gradient with a floor
        this.add.rectangle(400, 300, 800, 600, 0x222222);
        this.ground = this.add.rectangle(400, 580, 800, 40, 0x888888);
        this.physics.add.existing(this.ground, true);
    }

    update(time, delta) {
        // Get inputs and pass to Player 1
        const cmds = this.inputs.getInputs();
        this.p1.update(cmds, delta);
        
        // Update Dummy (physics only)
        this.p2.update({}, delta);
    }

    createHitbox(attacker, move) {
        // Create an invisible box in front of the player
        const offsetX = attacker.facingRight ? 50 : -50;
        const hitbox = this.add.rectangle(attacker.x + offsetX, attacker.y, 60, 60, 0xff0000, 0.5);
        this.physics.add.existing(hitbox);
        
        // Physics check
        this.physics.add.overlap(hitbox, this.p2, () => {
            this.handleHit(attacker, this.p2, move);
            hitbox.destroy(); // Destroy immediately on hit (or keep for active frames)
        }, null, this);

        // Destroy hitbox after 'active' frames
        this.time.delayedCall(move.active * 16, () => hitbox.destroy());
    }

    handleHit(attacker, victim, move) {
        // Calculate Hit
        victim.takeDamage(move.damage, move.hitStun, move.knockback);
        
        // Combo Logic
        attacker.comboCounter++;
        this.comboText.setText(`Combo: ${attacker.comboCounter}`);

        // Alpha's Special Trait: Heal after 5 hits
        if (attacker.name === "Alpha" && attacker.comboCounter > 5) {
            attacker.hp = Math.min(attacker.hp + 5, attacker.data.stats.maxHealth);
            console.log("Alpha Healing!");
        }
        
        // Hitstop (Freeze game briefly for impact)
        this.cameras.main.shake(50, 0.01); // Camera shake
        this.time.timeScale = 0.1; // Slow motion
        this.time.delayedCall(50, () => { this.time.timeScale = 1; }); // Resume
    }
}