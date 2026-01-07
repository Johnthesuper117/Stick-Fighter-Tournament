import StickRenderer from './StickRenderer.js';
import Projectile from './Projectile.js';
export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, dataStr, isDummy = false) {
        super(scene, x, y, ''); // Placeholder texture
        this.renderer = new StickRenderer(scene, 0, 0, parseInt(this.data.color));
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Load Data
        this.data = JSON.parse(JSON.stringify(dataStr)); // Deep copy
        this.name = this.data.name;
        
        // Physics
        this.setDisplaySize(50, 100);
        this.setTint(parseInt(this.data.color));
        this.setCollideWorldBounds(true);
        this.body.setGravityY(this.data.stats.gravity);

        // Combat State
        this.hp = this.data.stats.maxHealth;
        this.state = 'IDLE'; // IDLE, RUN, JUMP, ATTACK, HITSTUN
        this.facingRight = true;
        this.isDummy = isDummy;

        // Combo & Timers
        this.comboCounter = 0;
        this.busyTimer = 0;   // How long until we can move again
        this.stunTimer = 0;   // How long we are stunned

        // In Fighter constructor
        this.lastAttacker = null;

        // In Fighter update(), inside the Stun Timer check:
        if (this.stunTimer > 0) {
            this.stunTimer -= delta;
            if (this.stunTimer <= 0) {
                // RECOVERY LOGIC
                this.state = 'IDLE';
                this.setTint(parseInt(this.data.color));
                
                // Tell the scene to reset the combo of whoever hit me last
                if (this.lastAttacker) {
                    this.scene.events.emit('fighter_recover', this.lastAttacker);
                    this.lastAttacker = null;
                }
            }
            return;
        }

    }

    update(inputs, delta) {
        // 1. Handle Stun (Getting Hit)
        if (this.stunTimer > 0) {
            this.stunTimer -= delta;
            this.setTint(0xffffff); // Flash white (visual feedback)
            if (this.stunTimer <= 0) {
                this.state = 'IDLE';
                this.setTint(parseInt(this.data.color)); // Reset color
                this.comboCounter = 0; // Reset combo when escape
            }
            return; // Can't move while stunned
        }

        // 2. Handle Attack Recovery (Busy)
        if (this.busyTimer > 0) {
            this.busyTimer -= delta;
            return;
        }

        // 3. AI / Dummy Logic
        if (this.isDummy) {
            this.setVelocityX(0);
            return;
        }

        this.handleMovement(inputs);
        this.handleAttacks(inputs);

        // Sync renderer position to physics body
        this.renderer.setPosition(this.x, this.y);
        // Tell renderer to animate
        this.renderer.update(this.state, this.body.velocity);
    }

    handleMovement(inputs) {
        if (this.state === 'ATTACK') return; // Locked during attack

        // Run
        if (inputs.left) {
            this.setVelocityX(-this.data.stats.walkSpeed);
            this.facingRight = false;
        } else if (inputs.right) {
            this.setVelocityX(this.data.stats.walkSpeed);
            this.facingRight = true;
        } else {
            this.setVelocityX(0);
        }

        // Jump
        if (inputs.up && this.body.touching.down) {
            this.setVelocityY(this.data.stats.jumpForce);
        }
    }

    handleAttacks(inputs) {
        // Simple mapping for demonstration. 
        // In a full version, we check "inputs.down + inputs.light" for crouching attacks.
        
        let moveKey = null;

        if (inputs.light) moveKey = 'LIGHT_NEUTRAL';
        if (inputs.heavy && inputs.right) moveKey = 'HEAVY_FORWARD'; // Example directional
        // Add more logic here for Command Inputs (QCF, etc)

        if (moveKey && this.data.moves[moveKey]) {
            this.executeMove(moveKey);
        }

        if (inputs.special) {
            // Check if Alpha (or read from JSON if character has projectile capability)
            if (this.name === "Alpha") {
                this.fireProjectile();
            }
        }
    }

    fireProjectile() {
        if (this.state === 'ATTACK') return;
        
        this.state = 'ATTACK';
        this.busyTimer = 500; // Recovery time

        // Create Projectile
        const dir = this.facingRight ? 1 : -1;
        const p = new Projectile(this.scene, this.x + (40 * dir), this.y, dir, this);
        
        // Add to a group in the scene (we need to create this group in FightScene)
        this.scene.projectiles.add(p);
    }

    executeMove(key) {
        const move = this.data.moves[key];

        // Check type
        if (move.type === 'projectile') {
            this.fireProjectile(move); // Pass move data for custom damage
            return;
        }

        this.state = 'ATTACK';
        this.busyTimer = (move.startup + move.active + move.recovery) * 16.6;

        // Handle Dash Attacks
        if (move.velocity) {
            // Wait for startup frames, then apply velocity
            this.scene.time.delayedCall(move.startup * 16, () => {
                const dir = this.facingRight ? 1 : -1;
                this.setVelocityX(move.velocity.x * dir);
                if (move.velocity.y) this.setVelocityY(move.velocity.y);
            });
        }

        this.scene.events.emit('attack_start', this, move);
    }

    takeDamage(amount, stunFrames, knockback, attacker) {
        this.lastAttacker = attacker; // Remember who hit me
        
        // Calculate damage via Scene (or Manager directly if passed)
        // For modularity, we let the FightScene handle the calculation call
        this.hp -= amount; 
        
        this.stunTimer = stunFrames * 16.6; 
        this.state = 'HITSTUN';
        
        this.setVelocityX(knockback.x * (this.facingRight ? -1 : 1));
        this.setVelocityY(knockback.y);
    }

}