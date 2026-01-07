import Fighter from '../entities/Fighter.js';
import InputManager from '../managers/InputManager.js';
import ComboManager from '../managers/ComboManager.js';

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

        this.projectiles = this.physics.add.group();

        this.physics.add.overlap(this.projectiles, this.p2, (projectile, enemy) => {
        if (projectile.owner !== enemy) {
            enemy.takeDamage(projectile.damage, 20, {x: 100, y: -100});
            projectile.destroy();
            // Add particle explosion effect here later
        }
    
    });
    
    this.comboManager = new ComboManager(this);

    this.events.on('fighter_recover', (attacker) => {
        this.comboManager.resetCombo(attacker);
    });

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
    // 1. Calculate Scaled Damage
    const finalDamage = this.comboManager.registerHit(attacker, victim, move.damage);

    // 2. Apply to Victim
    victim.takeDamage(finalDamage, move.hitStun, move.knockback, attacker);

    // 3. Alpha's Passive (Heal on 5+ hits)
    // We check the internal combo count from the manager
    const comboData = this.comboManager.combos.get(attacker);
    if (attacker.name === "Alpha" && comboData && comboData.count >= 5) {
        attacker.hp = Math.min(attacker.hp + 2, attacker.data.stats.maxHealth);
        // Visual Heal Effect (Green Tint briefly)
        attacker.setTint(0x00ff00);
        this.time.delayedCall(100, () => attacker.setTint(parseInt(attacker.data.color)));
    }

    // 4. Hitstop & Shake
    this.cameras.main.shake(50, 0.005);
    this.time.timeScale = 0.1;
    this.time.delayedCall(50, () => { this.time.timeScale = 1; });
    }
}