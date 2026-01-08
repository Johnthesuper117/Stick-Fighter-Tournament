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
        // Update timers but do not early-return; we need to keep renderer & physics in sync
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
        }

        // 2. Handle Attack Recovery (Busy) - still tracked for compatibility
        if (this.busyTimer > 0) {
            this.busyTimer -= delta;
            if (this.busyTimer <= 0) this.busyTimer = 0;
        }

        // 3. AI / Dummy Logic
        if (this.isDummy) {
            // Keep position in physics, and don't perform actions
            this.setVelocityX(0);
        }

        // Process current move timeline (if any)
        if (this.currentMove) {
            this.moveElapsed += delta; // ms
            const move = this.currentMove;
            const startupMs = (move.startup || 0) * 16.6;
            const activeMs = (move.active || 0) * 16.6;
            const recoveryMs = (move.recovery || 0) * 16.6;

            // Enter active phase
            if (!this._moveActive && this.moveElapsed >= startupMs) {
                this._moveActive = true;

                // If this is a projectile move, spawn it now
                if (move.type === 'projectile' || move.type === 'super_projectile') {
                    // Fire projectile once at active start
                    const dir = this.facingRight ? 1 : -1;
                    const p = new Projectile(this.scene, this.x + (40 * dir), this.y, dir, this, move);
                    if (this.scene.projectiles) this.scene.projectiles.add(p);
                    else this.scene.projectiles = this.scene.physics.add.group({ classType: Projectile, runChildUpdate: true });
                }

                // Apply move velocity (if.any) at active start
                if (move.velocity) {
                    const dir = this.facingRight ? 1 : -1;
                    this.setVelocityX((move.velocity.x || 0) * dir);
                    if (typeof move.velocity.y === 'number') this.setVelocityY(move.velocity.y);
                }

                // Emit attack_start so the scene can create hitboxes
                this.scene.events.emit('attack_start', this, move);

                // Trigger active pose for stronger visual if provided
                if (this.renderer) {
                    const actDur = Math.max(80, activeMs);
                    const pose = this._mirrorPoseForFacing(move.poseActive || move.pose || { rightHand: { x: 20, y: -10 }, leftHand: { x: -10, y: -8 } });
                    this.renderer.triggerPose(pose, actDur);
                }
            }

            // End of active phase - begin recovery
            if (!this._moveRecovery && this.moveElapsed >= (startupMs + activeMs)) {
                this._moveRecovery = true;
                // Optionally zero move-related velocity on recovery start
                if (!move.holdsVelocityOnRecovery) this.setVelocityX(0);

                // Trigger a subtle recovery pose
                if (this.renderer) {
                    const recDur = Math.max(80, recoveryMs);
                    const pose = this._mirrorPoseForFacing(move.poseRecovery || { rightHand: { x: 6, y: -4 }, leftHand: { x: -4, y: -2 } });
                    this.renderer.triggerPose(pose, recDur);
                }
            }

            // Move done
            if (this.moveElapsed >= (startupMs + activeMs + recoveryMs)) {
                // Clear move state
                this.currentMove = null;
                this._moveActive = false;
                this._moveRecovery = false;
                this.moveElapsed = 0;
                // Release attack state
                if (this.state === 'ATTACK') this.state = 'IDLE';
            }
        } else {
            // Determine if we can accept input/actions this frame
            const canAct = (this.stunTimer <= 0) && (this.busyTimer <= 0) && !this.isDummy && !this.paused;
            if (canAct) {
                this.handleMovement(inputs);
                this.handleAttacks(inputs);
            }
        }

        // Sync renderer position to physics body (always do this to avoid visual desync)
        if (this.renderer) {
            // Smoothly interpolate renderer container position toward physics body to avoid visual pops
            const posSmoothing = this.renderer.positionSmoothingSpeed || 20; // units per second
            const posAlpha = 1 - Math.exp(-posSmoothing * (delta / 1000));
            const nx = Phaser.Math.Linear(this.renderer.x, this.x, posAlpha);
            const ny = Phaser.Math.Linear(this.renderer.y, this.y, posAlpha);
            this.renderer.setPosition(nx, ny);

            // If we just started an attack, trigger a pose
            if (this.currentMove && this._moveActive && (!this._poseTriggered || this._poseTriggered !== this.currentMove)) {
                const pose = this.currentMove.pose || { rightHand: { x: 12, y: -8 }, leftHand: { x: -8, y: -6 } };
                this.renderer.triggerPose(pose, (this.currentMove.startup + (this.currentMove.active || 4)) * 16);
                this._poseTriggered = this.currentMove;
            }

            this.renderer.update(this.state, this.body ? this.body.velocity : { x: 0, y: 0 }, delta);
        }
        this._lastState = this.state;
    }

    handleMovement(inputs) {
        // Movement can be partially allowed during attacks depending on move settings
        let controlFactor = 1.0;
        if (this.state === 'ATTACK' && this.currentMove) {
            if (this.currentMove.lockMovement) {
                // Fully locked; no movement permitted
                return;
            }
            controlFactor = this.currentMove.moveControlFactor || 0.6; // reduced control during attacks
        } else if (this.state === 'ATTACK') {
            // If we are in attack state but have no move, reduce control
            controlFactor = 0.6;
        }

        // Run (apply control factor)
        const targetSpeed = this.data.stats.walkSpeed * controlFactor;
        if (inputs.left) {
            this.setVelocityX(-targetSpeed);
            this.facingRight = false;
        } else if (inputs.right) {
            this.setVelocityX(targetSpeed);
            this.facingRight = true;
        } else {
            // If in attack and partial control, allow momentum decay instead of abrupt stop
            if (this.state === 'ATTACK') {
                this.setVelocityX(Phaser.Math.Linear(this.body.velocity.x, 0, 0.12));
            } else {
                this.setVelocityX(0);
            }
        }

        // Jump allowed only when not mid-attack unless move allows it
        if (inputs.up && this.body.touching.down) {
            if (!(this.state === 'ATTACK' && this.currentMove && !this.currentMove.allowJump)) {
                this.setVelocityY(this.data.stats.jumpForce);
            }
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
            const newMove = this.data.moves[moveKey];

            // If we have a current move, check for cancel windows
            if (this.currentMove) {
                const cm = this.currentMove;
                const startupMs = (cm.startup || 0) * 16.6;
                const activeMs = (cm.active || 0) * 16.6;
                const cancelWindowMs = cm.cancelWindowMs || ((cm.cancelWindowFrames || 3) * 16.6);

                // Allow cancel if move is cancelable and we are within the cancel window
                if (cm.cancelable && this.moveElapsed >= Math.max(0, startupMs + activeMs - cancelWindowMs)) {
                    // Cancel the current move and start the new one
                    this.currentMove = null;
                    this._moveActive = false;
                    this._moveRecovery = false;
                    this.moveElapsed = 0;
                } else {
                    // Can't start a new move yet
                    return;
                }
            }

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

    fireProjectile(move = {}) {
        if (this.state === 'ATTACK' || this.currentMove) return;

        // Start a frame-based move timeline for projectile moves so the projectile fires on active frames
        this.state = 'ATTACK';
        this.currentMove = move;
        this.moveElapsed = 0;
        this._moveActive = false;
        this._moveRecovery = false;
        this._poseTriggered = null;

        // Keep busyTimer for external checks (ms)
        this.busyTimer = move.recovery ? (move.startup + move.active + move.recovery) * 16.6 : 500;

        // When active phase begins in update(), we will spawn the projectile and set velocity
        // To keep backwards compatibility with code that expected immediate projectile spawn, we don't spawn here
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

        // Prepare move object with cancel window and flags
        move.cancelable = move.cancelable || false;
        // Default cancel window slightly larger for smoother chaining
        move.cancelWindowFrames = move.cancelWindowFrames || move.cancelWindow || 5;
        move.cancelWindowMs = (move.cancelWindowFrames) * 16.6;

        // Default movement control during the move (1.0 = full control, 0 = locked)
        move.moveControlFactor = (typeof move.moveControlFactor === 'number') ? move.moveControlFactor : 0.6;
        move.lockMovement = !!move.lockMovement;

        // Trigger startup pose for visible feedback
        if (this.renderer) {
            const startupDur = Math.max(80, (move.startup || 0) * 16.6);
            const pose = this._mirrorPoseForFacing(move.poseStartup || move.pose || { rightHand: { x: 12, y: -8 }, leftHand: { x: -8, y: -6 } });
            this.renderer.triggerPose(pose, startupDur);
        }

        // Check type
        if (move.type === 'projectile' || move.type === 'super_projectile') {
            this.fireProjectile(move);
            return;
        }

        // Start frame-based move timeline
        this.state = 'ATTACK';
        this.currentMove = move;
        this.moveElapsed = 0;
        this._moveActive = false;
        this._moveRecovery = false;
        this._poseTriggered = null;

        // Busy timer for external checks
        this.busyTimer = (move.startup + move.active + move.recovery) * 16.6;

        // Emit attack start will happen at active start in update(); we keep compatibility by emitting when move becomes active
        // (handled in update loop)
        return;

        // Trigger renderer pose for stronger attacks
        if (this.renderer) {
            const pose = move.pose || { rightHand: { x: 12, y: -8 }, leftHand: { x: -8, y: -6 } };
            this.renderer.triggerPose(pose, (move.startup + move.active) * 16);
        }
    }

    takeDamage(amount, stunFrames, knockback, attacker) {
        this.lastAttacker = attacker; // Remember who hit me
        
        // Apply damage
        this.hp -= amount; 
        
        // Gain super meter on taking damage
        this.gainSuperMeter(amount * 0.5); // 50% of damage taken as meter
        
        this.stunTimer = stunFrames * 16.6; 
        this.state = 'HITSTUN';

        // Knockback should push the victim away from the attacker.
        const kb = knockback || { x: 0, y: 0 };
        let dir = 0;
        if (attacker && typeof attacker.facingRight === 'boolean') {
            dir = attacker.facingRight ? 1 : -1;
        } else if (attacker && typeof attacker.x === 'number') {
            dir = (this.x >= attacker.x) ? 1 : -1; // victim to right of attacker -> push right
        } else {
            // Fallback to flipping based on victim's facing
            dir = this.facingRight ? -1 : 1;
        }

        const knockX = (kb.x || 0) * dir;
        this.setVelocityX(knockX);
        this.setVelocityY(kb.y || 0);
    }

    gainSuperMeter(amount) {
        this.superMeter = Math.min(this.superMeter + amount, this.superMeterMax);
        this.updateSuperLevel();
    }

    _mirrorPoseForFacing(pose) {
        if (!pose) return pose;
        const copy = {};
        const flip = this.facingRight ? 1 : -1;
        for (const key of Object.keys(pose)) {
            copy[key] = { x: (pose[key].x || 0) * flip, y: (pose[key].y || 0) };
        }
        return copy;
    }

    updateSuperLevel() {
        const levelSize = this.superMeterMax / 3;
        this.superLevel = Math.floor(this.superMeter / levelSize);
        if (this.superLevel > 3) this.superLevel = 3;
    }

}