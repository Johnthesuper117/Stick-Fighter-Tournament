export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, dataStr, isDummy = false) {
        super(scene, x, y, 'texture'); // Placeholder texture
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
    }

    executeMove(key) {
        const move = this.data.moves[key];
        
        this.state = 'ATTACK';
        this.busyTimer = (move.startup + move.active + move.recovery) * 16.6; // Convert frames to ms
        
        // Visual debug for attack
        this.scene.events.emit('attack_start', this, move);
    }

    takeDamage(amount, stunFrames, knockback) {
        this.hp -= amount;
        this.stunTimer = stunFrames * 16.6; // Convert frames to ms
        this.state = 'HITSTUN';
        
        // Apply Knockback
        this.setVelocityX(knockback.x * (this.facingRight ? -1 : 1)); // Push opposite way
        this.setVelocityY(knockback.y);

        // Alpha's Special Ability: Heal on high combo
        // Note: This logic usually goes on the ATTACKER, not the victim.
        // We will implement the attacker logic in the Scene collision handler.
    }
}