export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, owner, move = {}) {
        // Use a texture key per-move if provided
        const tex = move.textureKey || 'projectile_texture';
        super(scene, x, y, tex);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.owner = owner; // Who fired it? (To avoid hitting yourself)
        this.speed = move.speed || 600;
        this.damage = move.damage || 60;

        // Visuals (Simple ball of energy)
        // In real dev, load a sprite. Here we generate one if missing.
        if (!scene.textures.exists(tex)) {
            const g = scene.make.graphics();
            g.fillStyle(move.color || 0x00ffff);
            g.fillCircle(10, 10, 10);
            g.generateTexture(tex, 20, 20);
            g.destroy();
        }

        // Ensure body exists and set physics properties safely
        if (this.body) {
            // Disable gravity by default unless the move explicitly sets it
            const allowGravity = move.allowGravity === undefined ? false : !!move.allowGravity;
            if (typeof this.body.setAllowGravity === 'function') this.body.setAllowGravity(allowGravity);
            // Also set the property directly to be safe in mixed environments
            this.body.allowGravity = allowGravity;

            // Prevent rotation and set size
            if (typeof this.body.setCircle === 'function') {
                try { this.body.setCircle(10); } catch (e) {}
            }
            this.setCollideWorldBounds(true);
            this.setBounce(move.bounce || 0);
        }

        // Apply velocities (ensure we zero Y velocity so it won't fall by default)
        this.setVelocityX(direction * this.speed);
        if (move.velocity && typeof move.velocity.y === 'number') {
            this.setVelocityY(move.velocity.y);
        } else {
            this.setVelocityY(0);
            if (this.body) this.body.velocity.y = 0; // force zero on body as an extra safety
        }

        // If the projectile should collide with ground, we can destroy it on collide
        if (scene.ground) {
            scene.physics.add.collider(this, scene.ground, () => {
                // If the move allows bouncing, don't destroy; otherwise disable/destroy safely
                if (!move.bounce) {
                    try {
                        if (typeof this.disableBody === 'function') this.disableBody(true, true);
                        else {
                            if (this.body) {
                                if (typeof this.body.setEnable === 'function') this.body.setEnable(false);
                                else this.body.enable = false;
                                if (typeof this.body.stop === 'function') this.body.stop();
                            }
                            if (typeof this.setActive === 'function') this.setActive(false);
                            if (typeof this.setVisible === 'function') this.setVisible(false);
                            this.destroy();
                        }
                    } catch (e) {
                        console.error('Failed to disable projectile on ground', e);
                        try { this.destroy(); } catch (e2) {}
                    }
                }
            });
        }

        // Destroy after 2 seconds if it hits nothing (or move.timeout)
        const ttl = move.timeout || 2000;
        scene.time.delayedCall(ttl, () => { if (this.active) this.destroy(); });
    }
}