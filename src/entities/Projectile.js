export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, owner) {
        super(scene, x, y, 'projectile_texture'); 
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.owner = owner; // Who fired it? (To avoid hitting yourself)
        this.speed = 600;
        this.damage = 60;

        // Visuals (Simple ball of energy)
        // In real dev, load a sprite. Here we generate one.
        if (!scene.textures.exists('projectile_texture')) {
            const g = scene.make.graphics().fillStyle(0x00ffff).fillCircle(10, 10, 10);
            g.generateTexture('projectile_texture', 20, 20);
        }

        // Logic
        this.setVelocityX(direction * this.speed);
        this.body.setAllowGravity(false); // Energy balls float
        
        // Destroy after 2 seconds if it hits nothing
        scene.time.delayedCall(2000, () => { if(this.active) this.destroy(); });
    }
}