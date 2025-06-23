import { Scene } from 'phaser';

export class GameOver extends Scene {
    private score: number = 0;

    constructor() {
        super({ key: 'GameOver' });
    }

    preload() {
        this.load.image('playAgainButton', 'assets/button/playAgainButton.png');
        this.load.image('homeButton', 'assets/button/homeButton.png');
        this.load.image('bgEndGame', 'assets/background/bgEndgame.jpg');
        //this.load.image('nonameButton2', 'assets/button/nonameButton2.png');
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        // Add background
        this.add.image(640, 360, 'bgEndGame').setDisplaySize(1280, 720);

        const gameOverText = this.add.text(640, 270, 'Game Over', {
            fontFamily: 'Roboto',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add final score
        const scoreText = this.add.text(640, 330, `Final Score: ${this.registry.get('finalScore')}`, {
            fontFamily: 'Roboto',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add home button
        const homeButton = this.add.image(640, 420, 'homeButton')
        .setDisplaySize(80,80).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            //this.scene.start('MainMenu');
            //this.registry.set('currentLevel', 1);
            window.location.reload();
        })
        .on('pointerover', () => {
            homeButton.setScale(0.45);
        })
        .on('pointerout', () => {
            homeButton.setScale(0.35);
        });
        
    }
} 