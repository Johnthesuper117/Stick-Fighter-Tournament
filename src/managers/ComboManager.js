export default class ComboManager {
    constructor(scene) {
        this.scene = scene;
        this.combos = new Map(); // Store combo data by Fighter ID
    }

    // Called when a fighter lands a hit
    registerHit(attacker, victim, damage) {
        if (!this.combos.has(attacker)) {
            this.combos.set(attacker, {
                count: 0,
                damageScale: 1.0,
                totalDamage: 0,
                lastHitTime: 0,
                isAirCombo: false,
                maxReach: 0 // Track highest combo count in this combo
            });
        }

        const combo = this.combos.get(attacker);
        const currentTime = Date.now();

        // 1. Increment Count
        combo.count++;
        combo.lastHitTime = currentTime;

        // 2. Check if this is an air combo (both fighters airborne)
        const attackerAirborne = !attacker.body.touching.down;
        const victimAirborne = !victim.body.touching.down;
        
        if (attackerAirborne && victimAirborne && combo.count > 1) {
            combo.isAirCombo = true;
        }

        // 3. Track max combo reach for this sequence
        if (combo.count > combo.maxReach) {
            combo.maxReach = combo.count;
        }

        // 4. Calculate Scaled Damage
        // Damage reduces by 5% per hit, minimum 10%
        let scale = Math.max(0.1, 1.0 - (combo.count * 0.05));
        const actualDamage = Math.floor(damage * scale);

        combo.totalDamage += actualDamage;

        // 5. UI Updates - Trigger events for scene to display
        this.scene.events.emit('combo_update', {
            attacker: attacker,
            count: combo.count,
            damage: actualDamage,
            totalDamage: combo.totalDamage,
            isAirCombo: combo.isAirCombo,
            scale: scale
        });

        // Combo milestone effects (visual/audio cues)
        this.emitComboMilestone(combo.count, attacker);

        return actualDamage;
    }

    // Emit effects at combo milestones
    emitComboMilestone(count, attacker) {
        const milestones = [3, 5, 10, 15, 20];
        
        if (milestones.includes(count)) {
            this.scene.events.emit('combo_milestone', {
                fighter: attacker,
                count: count
            });

            // Screen shake intensity increases with combo
            const intensity = Math.min(0.05 + (count * 0.01), 0.2);
            this.scene.cameras.main.shake(50, intensity);
        }
    }

    // Called when the victim recovers from Stun (Combo Over)
    resetCombo(attacker) {
        if (this.combos.has(attacker)) {
            const data = this.combos.get(attacker);
            if (data.count > 1) {
                // Determine combo quality
                let quality = 'Normal';
                if (data.count >= 5 && data.count < 10) quality = 'Great';
                if (data.count >= 10 && data.count < 15) quality = 'Awesome';
                if (data.count >= 15) quality = 'Legendary';
                
                const message = `${quality} Combo! ${data.count} hits, ${data.totalDamage} damage${data.isAirCombo ? ' (AIR COMBO!)' : ''}`;
                console.log(message);
                
                this.scene.events.emit('combo_end', {
                    attacker: attacker,
                    count: data.count,
                    totalDamage: data.totalDamage,
                    isAirCombo: data.isAirCombo,
                    quality: quality
                });
            }
            this.combos.delete(attacker);
        }
    }

    // Get current combo data without resetting
    getComboData(attacker) {
        return this.combos.get(attacker) || {
            count: 0,
            totalDamage: 0,
            isAirCombo: false
        };
    }

    // Check if fighter is currently in a combo
    isInCombo(fighter) {
        return this.combos.has(fighter) && this.combos.get(fighter).count > 0;
    }

    // Get combo count for a fighter
    getComboCount(fighter) {
        if (!this.combos.has(fighter)) return 0;
        return this.combos.get(fighter).count;
    }
}