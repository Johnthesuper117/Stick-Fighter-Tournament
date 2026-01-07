import MenuScene from './scene/MenuScene.js';
import SelectScene from './scene/SelectScene.js';
import SettingsScene from './scene/SettingsScene.js';
import FightScene from './scene/FightScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
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