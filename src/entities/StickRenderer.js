export default class StickRenderer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, color) {
        super(scene, x, y);
        scene.add.existing(this);

        this.color = color;
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        // Core joint positions (relative to container 0,0)
        // Keep an immutable base that we copy each frame so state changes don't accumulate
        this.baseJoints = {
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

        // Smoothing configuration (tweakable)
        this.smoothingSpeed = 8.0; // per-second smoothing speed for joint interpolation
        this.positionSmoothingSpeed = 20.0; // per-second smoothing speed for container position
        this._animTime = 0;
    }

    // Trigger a named pose (short sequence) that blends into the current pose
    triggerPose(poseData, duration = 200) {
        this.activePose = {
            poseData,
            duration,
            elapsed: 0,
            weight: 1.0
        };
    }

    update(fighterState, velocity, delta = null) {
        // Use provided delta (ms) or fallback to game's loop delta
        delta = typeof delta === 'number' ? delta : (this.scene ? this.scene.game.loop.delta : 16.6);
        const dt = Math.max(1, delta); // ms

        this.graphics.clear();
        this.graphics.lineStyle(4, this.color, 1);

        // Keep an internal anim clock (ms) to avoid using Date.now() which breaks when timeScale changes (hitstop)
        this._animTime = (this._animTime || 0) + dt;

        // Procedural Animation Logic
        // 1. Lean body based on speed (clamped)
        const speedX = (velocity && velocity.x) ? velocity.x : 0;
        const lean = Phaser.Math.Clamp(speedX * 0.02, -10, 10);

        // Copy base joints each frame to avoid cumulative mutation
        if (!this.renderJoints) this.renderJoints = JSON.parse(JSON.stringify(this.baseJoints));

        // Build target joint pose based on state
        const target = JSON.parse(JSON.stringify(this.baseJoints));

        if (fighterState === 'RUN') {
            const time = this._animTime * 0.02;
            target.leftHand.x = -20 + Math.sin(time) * 15;
            target.leftHand.y = Math.cos(time) * 10;
            target.rightHand.x = 20 - Math.sin(time) * 15;
            target.rightHand.y = -Math.cos(time) * 10;

            target.leftFoot.x = -15 - Math.sin(time) * 20;
            target.leftFoot.y = 40 + Math.cos(time) * 10;
            target.rightFoot.x = 15 + Math.sin(time) * 20;
            target.rightFoot.y = 40 - Math.cos(time) * 10;
        } else if (fighterState === 'IDLE') {
            const breathe = Math.sin(this._animTime * 0.005) * 2;
            target.head.y = -40 + breathe;
            target.leftHand.y = 0 + breathe;
            target.rightHand.y = 0 + breathe;
        }

        // If a pose is active, blend it into the target
        if (this.activePose) {
            const pose = this.activePose.poseData;
            const t = this.activePose.weight || 1.0;
            for (const key of Object.keys(pose)) {
                if (target[key]) {
                    target[key].x += (pose[key].x || 0) * t;
                    target[key].y += (pose[key].y || 0) * t;
                }
            }
        }

        // Time-based smoothing: compute alpha from smoothingSpeed per second
        const smoothingSpeed = this.smoothingSpeed || 8.0; // larger = snappier
        const alpha = 1 - Math.exp(-smoothingSpeed * (dt / 1000));
        const lerp = (a, b, aLerp) => a + (b - a) * aLerp;

        for (const jointName of Object.keys(this.renderJoints)) {
            this.renderJoints[jointName].x = lerp(this.renderJoints[jointName].x, target[jointName].x, alpha);
            this.renderJoints[jointName].y = lerp(this.renderJoints[jointName].y, target[jointName].y, alpha);
        }

        // If activePose has a decay/timeout, update it using dt
        if (this.activePose && this.activePose.duration !== undefined) {
            this.activePose.elapsed = (this.activePose.elapsed || 0) + dt;
            if (this.activePose.elapsed >= this.activePose.duration) {
                this.activePose = null;
            } else {
                // Fade weight over time (smooth fade)
                const remain = 1 - (this.activePose.elapsed / this.activePose.duration);
                this.activePose.weight = Phaser.Math.Easing.Quadratic.Out(Math.max(0, remain));
            }
        }

        const j = this.renderJoints;

        // DRAWING THE STICKMAN (apply lean to head/neck offset)
        this.graphics.strokeCircle(j.head.x - lean, j.head.y, 12);
        this.graphics.lineBetween(j.neck.x - lean, j.neck.y, j.pelvis.x, j.pelvis.y);
        this.graphics.lineBetween(j.neck.x - lean, j.neck.y, j.leftHand.x, j.leftHand.y);
        this.graphics.lineBetween(j.neck.x - lean, j.neck.y, j.rightHand.x, j.rightHand.y);
        this.graphics.lineBetween(j.pelvis.x, j.pelvis.y, j.leftFoot.x, j.leftFoot.y);
        this.graphics.lineBetween(j.pelvis.x, j.pelvis.y, j.rightFoot.x, j.rightFoot.y);
    }
}