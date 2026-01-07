export default class StickRenderer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, color) {
        super(scene, x, y);
        scene.add.existing(this);

        this.color = color;
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        // Core joint positions (relative to container 0,0)
        this.joints = {
            head: { x: 0, y: -40 },
            neck: { x: 0, y: -25 },
            pelvis: { x: 0, y: 10 },
            leftHand: { x: -20, y: 0 },
            rightHand: { x: 20, y: 0 },
            leftFoot: { x: -15, y: 40 },
            rightFoot: { x: 15, y: 40 }
        };

        // Animation offsets (target positions)
        this.animOffset = { x: 0, y: 0 };
    }

    update(fighterState, velocity) {
        this.graphics.clear();
        this.graphics.lineStyle(4, this.color, 1);

        // Procedural Animation Logic
        // 1. Lean body based on speed
        const lean = velocity.x * 0.02;
        
        // 2. Animate Limbs based on state
        if (fighterState === 'RUN') {
            const time = new Date().getTime() * 0.02; // Speed of animation
            this.joints.leftHand.x = -20 + Math.sin(time) * 15;
            this.joints.leftHand.y = Math.cos(time) * 10;
            this.joints.rightHand.x = 20 - Math.sin(time) * 15;
            this.joints.rightHand.y = -Math.cos(time) * 10;
            
            this.joints.leftFoot.x = -15 - Math.sin(time) * 20;
            this.joints.leftFoot.y = 40 + Math.cos(time) * 10; // Lift feet
            this.joints.rightFoot.x = 15 + Math.sin(time) * 20;
            this.joints.rightFoot.y = 40 - Math.cos(time) * 10;
        } else if (fighterState === 'IDLE') {
            // Breathing effect
            const breathe = Math.sin(new Date().getTime() * 0.005) * 2;
            this.joints.head.y = -40 + breathe;
            this.joints.leftHand.y = 0 + breathe;
            this.joints.rightHand.y = 0 + breathe;
        }

        // DRAWING THE STICKMAN
        // Head
        this.graphics.strokeCircle(this.joints.head.x - lean, this.joints.head.y, 12);

        // Spine (Neck to Pelvis)
        this.graphics.lineBetween(
            this.joints.neck.x - lean, this.joints.neck.y, 
            this.joints.pelvis.x, this.joints.pelvis.y
        );

        // Arms (Neck to Hands)
        this.graphics.lineBetween(this.joints.neck.x - lean, this.joints.neck.y, this.joints.leftHand.x, this.joints.leftHand.y);
        this.graphics.lineBetween(this.joints.neck.x - lean, this.joints.neck.y, this.joints.rightHand.x, this.joints.rightHand.y);

        // Legs (Pelvis to Feet)
        this.graphics.lineBetween(this.joints.pelvis.x, this.joints.pelvis.y, this.joints.leftFoot.x, this.joints.leftFoot.y);
        this.graphics.lineBetween(this.joints.pelvis.x, this.joints.pelvis.y, this.joints.rightFoot.x, this.joints.rightFoot.y);
    }
}