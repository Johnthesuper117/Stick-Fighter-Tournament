import FightScene from './scenes/FightScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }, // High gravity for snappy jumps
            debug: true // Shows hitboxes (crucial for fighting games)
        }
    },
    scene: [FightScene]
};

const game = new Phaser.Game(config);