import alphaData from '../data/alpha.json' assert { type: "json" };
import betaData from '../data/beta.json' assert { type: "json" };

export default class SelectScene extends Phaser.Scene {
    constructor() { super('SelectScene'); }

    create() {
        this.add.text(400, 50, 'SELECT YOUR FIGHTER', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
        this.add.text(400, 550, '[ ESC ] to Return', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5);

        // Characters available
        this.characters = [
            { name: 'Alpha', data: alphaData, x: 250 },
            { name: 'Beta', data: betaData, x: 550 }
        ];

        this.selectedCharacter = 0; // Index of selected character
        this.createCharacterSelectors();

        // Keyboard input
        this.input.keyboard.on('keydown-LEFT', () => this.selectCharacter(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.selectCharacter(1));
        this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
    }

    createCharacterSelectors() {
        this.characters.forEach((char, index) => {
            const x = char.x;
            const isSelected = index === this.selectedCharacter;

            // Background box
            const bg = this.add.rectangle(x, 300, 180, 250, isSelected ? 0x444444 : 0x222222);
            bg.setStrokeStyle(3, isSelected ? 0x00ffff : 0x666666);

            // Character name
            this.add.text(x, 200, char.name, {
                fontSize: '32px',
                color: isSelected ? '#00ffff' : '#fff'
            }).setOrigin(0.5);

            // Simple character preview (color box for now)
            const previewColor = parseInt(char.data.color);
            this.add.rectangle(x, 300, 100, 100, previewColor).setAlpha(0.7);

            // Stats
            const stats = char.data.stats;
            const statsText = `Walk: ${stats.walkSpeed}\nHealth: ${stats.maxHealth}`;
            this.add.text(x, 420, statsText, {
                fontSize: '14px',
                color: isSelected ? '#00ffff' : '#aaa',
                align: 'center'
            }).setOrigin(0.5);

            // Store reference for update
            char.bgElement = bg;
            char.nameElement = this.add.text(x, 200, char.name, {
                fontSize: '32px',
                color: isSelected ? '#00ffff' : '#fff'
            }).setOrigin(0.5);
        });

        // Help text
        this.add.text(400, 500, 'Arrow Keys: Select | Enter: Confirm', {
            fontSize: '16px',
            color: '#aaa',
            align: 'center'
        }).setOrigin(0.5);
    }

    selectCharacter(direction) {
        this.selectedCharacter = (this.selectedCharacter + direction + this.characters.length) % this.characters.length;
        this.scene.restart(); // Restart to update visuals
    }

    confirmSelection() {
        const selectedData = this.characters[this.selectedCharacter].data;
        // Pass selected character to FightScene
        this.scene.start('FightScene', { selectedCharacter: selectedData });
    }
}
