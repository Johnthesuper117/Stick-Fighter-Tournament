import MenuScene from './scene/MenuScene.js';
import SelectScene from './scene/SelectScene.js';
import SettingsScene from './scene/SettingsScene.js';
import FightScene from './scene/FightScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        // Phaser may be undefined in node import/smoke tests, so guard these references
        mode: (typeof Phaser !== 'undefined' && Phaser.Scale && Phaser.Scale.RESIZE) ? Phaser.Scale.RESIZE : undefined,
        autoCenter: (typeof Phaser !== 'undefined' && Phaser.Scale && Phaser.Scale.CENTER_BOTH) ? Phaser.Scale.CENTER_BOTH : undefined,
        width: (typeof window !== 'undefined') ? window.innerWidth : 800,
        height: (typeof window !== 'undefined') ? window.innerHeight : 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }, // High gravity for snappy jumps
            debug: false // Disable debug mode for cleaner visuals
        }
    },
    scene: [MenuScene, SelectScene, SettingsScene, FightScene]
};

const game = new Phaser.Game(config);