import StickRenderer from './StickRenderer.js';
import Projectile from './Projectile.js';
import InputBuffer from '../managers/InputBuffer.js';
import CommandInputManager from '../managers/CommandInputManager.js';

export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, dataStr, isDummy = false) {
        super(scene, x, y, ''); // Placeholder texture
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Load Data
        this.data = JSON.parse(JSON.stringify(dataStr)); // Deep copy
        this.name = this.data.name;
        
        // Create renderer AFTER data is loaded
        this.renderer = new StickRenderer(scene, 0, 0, parseInt(this.data.color));
        
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
        this.lastAttacker = null; // Remember who hit me

        // Super Meter (3 levels max)
        this.superMeter = 0;
        this.superMeterMax = this.data.stats.maxSuperMeter || 300;
        this.superLevel = 0; // 0, 1, 2, 3 (each level = 100 meter)

        // Command Input System
        this.inputBuffer = new InputBuffer();
        this.commandInputManager = new CommandInputManager();
    }

    update(inputs, delta) {
        // 1. Handle Stun (Getting Hit)
        if (this.stunTimer > 0) {
            this.stunTimer -= delta;
            this.setTint(0xffffff); // Flash white (visual feedback)
            if (this.stunTimer <= 0) {
                this.state = 'IDLE';
                this.setTint(parseInt(this.data.color)); // Reset color
                
                // Tell the scene to reset the combo of whoever hit me last
                if (this.lastAttacker) {
                    this.scene.events.emit('fighter_recover', this.lastAttacker);
                    this.lastAttacker = null;
                }
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
        const currentTime = Date.now();
        
        // Record direction in input buffer
        this.inputBuffer.recordInput(inputs.direction, currentTime);

        let moveKey = null;

        // Check for super moves with command inputs first
        if ((inputs.light || inputs.heavy || inputs.special) && this.superMeter >= 100) {
            moveKey = this.checkCommandMoves(inputs, currentTime);
        }

        // If no command move, check for standard attacks
        if (!moveKey) {
            // Light attacks with directions
            if (inputs.light) {
                if (inputs.direction === 'right') moveKey = 'LIGHT_FORWARD';
                else if (inputs.direction === 'down' || inputs.direction === 'down-right' || inputs.direction === 'down-left') moveKey = 'LIGHT_DOWN';
                else if (inputs.direction === 'up' || inputs.direction === 'up-right' || inputs.direction === 'up-left') moveKey = 'LIGHT_UP';
                else moveKey = 'LIGHT_NEUTRAL';
            }
            
            // Heavy attacks with directions
            if (inputs.heavy) {
                if (inputs.direction === 'right') moveKey = 'HEAVY_FORWARD';
                else if (inputs.direction === 'down' || inputs.direction === 'down-right' || inputs.direction === 'down-left') moveKey = 'HEAVY_DOWN';
                else if (inputs.direction === 'up' || inputs.direction === 'up-right' || inputs.direction === 'up-left') moveKey = 'HEAVY_UP';
                else moveKey = 'HEAVY_NEUTRAL';
            }
            
            // Special attacks
            if (inputs.special) {
                // Check for special command moves
                if (this.name === "Alpha") {
                    // Alpha can do QCF for Hadoken
                    if (this.inputBuffer.checkCommand(this.commandInputManager.getCommand('QCF'), currentTime)) {
                        moveKey = 'SPECIAL_QCF';
                        this.inputBuffer.clear();
                    } else {
                        moveKey = 'SPECIAL_NEUTRAL';
                    }
                } else if (this.name === "Beta") {
                    // Beta can do QCB for Rising Slash
                    if (this.inputBuffer.checkCommand(this.commandInputManager.getCommand('QCB'), currentTime)) {
                        moveKey = 'SPECIAL_QCB';
                        this.inputBuffer.clear();
                    } else {
                        moveKey = 'SPECIAL_NEUTRAL';
                    }
                }
            }
        }

        if (moveKey && this.data.moves[moveKey]) {
            this.executeMove(moveKey, currentTime);
        }
    }

    checkCommandMoves(inputs, currentTime) {
        // Check for super moves based on commands
        const moves = this.data.moves;

        for (const [moveKey, moveData] of Object.entries(moves)) {
            // Skip non-super moves
            if (!moveData.superCost) continue;

            // Check if button matches
            let buttonMatch = false;
            if (moveData.buttonReq === 'light' && inputs.light) buttonMatch = true;
            if (moveData.buttonReq === 'heavy' && inputs.heavy) buttonMatch = true;
            if (moveData.buttonReq === 'special' && inputs.special) buttonMatch = true;

            if (!buttonMatch) continue;

            // Check if command matches
            if (moveData.command) {
                const pattern = this.commandInputManager.getCommand(moveData.command);
                if (pattern && this.inputBuffer.checkCommand(pattern, currentTime)) {
                    // Check if we have enough super meter
                    if (this.superMeter >= moveData.superCost) {
                        this.inputBuffer.clear();
                        return moveKey;
                    }
                }
            }
        }

        return null;
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

    executeMove(key, currentTime) {
        const move = this.data.moves[key];

        // Check if this is a super move and if we have enough meter
        if (move.superCost && this.superMeter < move.superCost) {
            return; // Not enough meter
        }

        // Spend super meter if required
        if (move.superCost) {
            this.superMeter -= move.superCost;
            this.updateSuperLevel();
        }

        // Check type
        if (move.type === 'projectile' || move.type === 'super_projectile') {
            this.fireProjectile(move);
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
        
        // Gain super meter on taking damage
        this.gainSuperMeter(amount * 0.5); // 50% of damage taken as meter
        
        this.stunTimer = stunFrames * 16.6; 
        this.state = 'HITSTUN';
        
        this.setVelocityX(knockback.x * (this.facingRight ? -1 : 1));
        this.setVelocityY(knockback.y);
    }

    gainSuperMeter(amount) {
        this.superMeter = Math.min(this.superMeter + amount, this.superMeterMax);
        this.updateSuperLevel();
    }

    updateSuperLevel() {
        const levelSize = this.superMeterMax / 3;
        this.superLevel = Math.floor(this.superMeter / levelSize);
        if (this.superLevel > 3) this.superLevel = 3;
    }

}