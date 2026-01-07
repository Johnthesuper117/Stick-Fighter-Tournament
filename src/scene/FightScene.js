import Fighter from '../entities/Fighter.js';
import InputManager from '../managers/InputManager.js';
import ComboManager from '../managers/ComboManager.js';
import betaData from '../data/beta.json' assert { type: "json" };

export default class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    create(data) {
        this.inputs = new InputManager(this);
        this.inputs.setupKeys();

        // Environment
        this.createEnvironment();

        // Get selected character (or default to Alpha)
        const selectedCharacter = data.selectedCharacter || { name: 'Alpha', color: '0x3399ff', stats: { walkSpeed: 350, jumpForce: -650, gravity: 1200, maxHealth: 1000 }, moves: {} };

        // Spawn Characters
        // Player 1 (Selected Character)
        this.p1 = new Fighter(this, 200, 400, selectedCharacter, false);
        // Player 2 (Dummy - Beta)
        this.p2 = new Fighter(this, 600, 400, betaData, true);

        this.physics.add.collider([this.p1, this.p2], this.ground);
        
        // Combat Collision
        // Instead of simple overlap, we create a Hitbox when an attack starts
        this.events.on('attack_start', (attacker, move) => {
            this.createHitbox(attacker, move);
        });

        // HUD
        this.createHUD();

        this.projectiles = this.physics.add.group();

        this.physics.add.overlap(this.projectiles, this.p2, (projectile, enemy) => {
            if (projectile.owner !== enemy) {
                enemy.takeDamage(projectile.damage, 20, {x: 100, y: -100}, projectile.owner);
                projectile.destroy();
            }
        });
        
        this.comboManager = new ComboManager(this);

        this.events.on('fighter_recover', (attacker) => {
            this.comboManager.resetCombo(attacker);
        });
    }

    createHUD() {
        // Player 1 Health Bar
        this.hud = {
            p1HealthBg: this.add.rectangle(100, 30, 150, 20, 0x333333),
            p1HealthBar: this.add.rectangle(100, 30, 150, 20, 0x00ff00),
            p1Name: this.add.text(20, 10, this.p1.name, { fontSize: '20px', color: '#fff' }),
            
            // Player 1 Super Meter
            p1SuperBg: this.add.rectangle(100, 55, 150, 15, 0x1a1a1a),
            p1SuperBar: this.add.rectangle(100, 55, 0, 15, 0xffff00),
            p1SuperLevelText: this.add.text(20, 50, 'Level: 0', { fontSize: '14px', color: '#ffff00' }),
            
            // Player 2 Health Bar
            p2HealthBg: this.add.rectangle(700, 30, 150, 20, 0x333333),
            p2HealthBar: this.add.rectangle(700, 30, 150, 20, 0xff0000),
            p2Name: this.add.text(620, 10, this.p2.name, { fontSize: '20px', color: '#fff' }),
            
            // Player 2 Super Meter
            p2SuperBg: this.add.rectangle(700, 55, 150, 15, 0x1a1a1a),
            p2SuperBar: this.add.rectangle(700, 55, 0, 15, 0xffff00),
            p2SuperLevelText: this.add.text(620, 50, 'Level: 0', { fontSize: '14px', color: '#ffff00' }),
            
            // Combo Counter
            comboText: this.add.text(400, 10, 'Combo: 0', { fontSize: '32px', color: '#fff' }).setOrigin(0.5),
            
            // Debug text for input buffer
            debugText: this.add.text(400, 150, '', { fontSize: '12px', color: '#aaa' }).setOrigin(0.5)
        };
    }

    createEnvironment() {
        // "Good background" - A dark gradient with a floor
        this.add.rectangle(400, 300, 800, 600, 0x222222);
        this.ground = this.add.rectangle(400, 580, 800, 40, 0x888888);
        this.physics.add.existing(this.ground, true);
    }

    update(time, delta) {
        // Get inputs and pass to Player 1
        const cmds = this.inputs.getInputs(time);
        this.p1.update(cmds, delta);
        
        // Update Dummy (physics only)
        this.p2.update({}, delta);

        // Update HUD
        this.updateHUD();
    }

    updateHUD() {
        // Update health bars
        const p1HealthPercent = (this.p1.hp / this.p1.data.stats.maxHealth) * 150;
        const p2HealthPercent = (this.p2.hp / this.p2.data.stats.maxHealth) * 150;
        
        this.hud.p1HealthBar.setDisplaySize(Math.max(0, p1HealthPercent), 20);
        this.hud.p2HealthBar.setDisplaySize(Math.max(0, p2HealthPercent), 20);

        // Update super meter bars
        const p1SuperPercent = (this.p1.superMeter / this.p1.superMeterMax) * 150;
        const p2SuperPercent = (this.p2.superMeter / this.p2.superMeterMax) * 150;
        
        this.hud.p1SuperBar.setDisplaySize(Math.max(0, p1SuperPercent), 15);
        this.hud.p2SuperBar.setDisplaySize(Math.max(0, p2SuperPercent), 15);

        // Update super level text
        this.hud.p1SuperLevelText.setText(`Level: ${this.p1.superLevel}`);
        this.hud.p2SuperLevelText.setText(`Level: ${this.p2.superLevel}`);

        // Update combo counter
        const comboData = this.comboManager.combos.get(this.p1);
        const comboCount = comboData ? comboData.count : 0;
        this.hud.comboText.setText(`Combo: ${comboCount}`);

        // Debug text (show recent inputs)
        this.hud.debugText.setText(`Inputs: ${this.p1.inputBuffer.getLastInputs(6)}`);
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

        // 2. Gain super meter on hit
        const superGain = move.superGain || 10;
        attacker.gainSuperMeter(superGain);

        // 3. Apply to Victim
        victim.takeDamage(finalDamage, move.hitStun, move.knockback, attacker);

        // 4. Alpha's Passive (Heal on 5+ hits)
        // We check the internal combo count from the manager
        const comboData = this.comboManager.combos.get(attacker);
        if (attacker.name === "Alpha" && comboData && comboData.count >= 5) {
            attacker.hp = Math.min(attacker.hp + 2, attacker.data.stats.maxHealth);
            // Visual Heal Effect (Green Tint briefly)
            attacker.setTint(0x00ff00);
            this.time.delayedCall(100, () => attacker.setTint(parseInt(attacker.data.color)));
        }

        // 5. Hitstop & Shake
        this.cameras.main.shake(50, 0.005);
        this.time.timeScale = 0.1;
        this.time.delayedCall(50, () => { this.time.timeScale = 1; });
    }
}