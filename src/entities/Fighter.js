export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color) {
        // Create a placeholder stick figure using a colored rectangle for now
        super(scene, x, y, 'texture'); 
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDisplaySize(50, 100); // Size of the stick figure
        this.setTint(color);

        // STATE MANAGEMENT
        // Possible states: IDLE, RUN, JUMP, ATTACK, STUN
        this.currentState = 'IDLE'; 
        
        // ATTACK DATA
        this.isAttacking = false;
        this.comboCount = 0;
        
        // MOVEMENT SPEEDS
        this.walkSpeed = 300;
        this.jumpForce = -600;

        // Input keys (assigned in scene)
        this.keys = {};
    }

    update(keys) {
        this.keys = keys;

        // 1. Handle State Transitions
        if (this.isAttacking) {
            // If attacking, lock movement (unless we implement canceling here later)
            return; 
        }

        // 2. Horizontal Movement
        if (this.keys.left.isDown) {
            this.setVelocityX(-this.walkSpeed);
            this.currentState = 'RUN';
        } else if (this.keys.right.isDown) {
            this.setVelocityX(this.walkSpeed);
            this.currentState = 'RUN';
        } else {
            this.setVelocityX(0);
            this.currentState = 'IDLE';
        }

        // 3. Jumping
        // Only jump if touching the ground
        if (this.keys.up.isDown && this.body.touching.down) {
            this.setVelocityY(this.jumpForce);
            this.currentState = 'JUMP';
        }

        // 4. Attacks (Simple Input)
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
            this.performAttack();
        }
    }

    performAttack() {
        if (this.isAttacking) return; // Prevent spamming for now

        this.isAttacking = true;
        this.currentState = 'ATTACK';
        
        // visual feedback
        this.setTint(0xff0000); 

        // TIMING LOGIC (The "Frame Data")
        // In 300ms, the attack ends and player can move again
        this.scene.time.delayedCall(300, () => {
            this.isAttacking = false;
            this.setTint(0xffffff); // Reset color
            this.currentState = 'IDLE';
        });

        console.log("Attack Frame 1 triggered!");
    }
}