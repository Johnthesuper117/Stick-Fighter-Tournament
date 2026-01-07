export default class ComboManager {
    constructor(scene) {
        this.scene = scene;
        this.combos = new Map(); // Store combo data by Fighter ID
    }

    // Called when a fighter lands a hit
    registerHit(attacker, victim, damage) {
        if (!this.combos.has(attacker)) {
            this.combos.set(attacker, { count: 0, damageScale: 1.0, totalDamage: 0 });
        }

        const combo = this.combos.get(attacker);
        
        // 1. Increment Count
        combo.count++;

        // 2. Calculate Scaled Damage
        // Damage reduces by 10% for every hit beyond the first, capped at 10% minimum
        // Formula: Damage * (0.9 ^ (count - 1))
        let scale = Math.max(0.1, 1.0 - (combo.count * 0.05)); 
        const actualDamage = Math.floor(damage * scale);

        combo.totalDamage += actualDamage;

        // 3. UI Updates (Trigger an event for the Scene to update text)
        this.scene.events.emit('combo_update', attacker, combo.count, actualDamage);

        return actualDamage;
    }

    // Called when the victim recovers from Stun (Combo Over)
    resetCombo(attacker) {
        if (this.combos.has(attacker)) {
            const data = this.combos.get(attacker);
            if (data.count > 1) {
                console.log(`Combo Finished! ${data.count} hits, ${data.totalDamage} dmg`);
                this.scene.events.emit('combo_end', attacker);
            }
            this.combos.delete(attacker);
        }
    }
}