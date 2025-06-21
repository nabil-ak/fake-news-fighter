import { Scene } from 'phaser';

export class GameOver extends Scene {
    private score: number = 0;

    constructor() {
        super({ key: 'GameOver' });
    }

    preload() {
        this.load.image('bgEndGame', 'assets/background/bgEndGame.jpg');
        this.load.image('playAgainButton', 'assets/button/playAgainButton.png');
        this.load.image('homeButton', 'assets/button/homeButton.png');
        //this.load.image('nonameButton2', 'assets/button/nonameButton2.png');
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        // Add background
        this.add.image(640, 360, 'bgEndGame').setDisplaySize(1280, 720);
        // Add game over text
        const gameOverText = this.add.text(640, 270, 'Game Over', {
            fontFamily: 'Roboto',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add final score
        const scoreText = this.add.text(640, 330, `Final Score: ${this.score}`, {
            fontFamily: 'Roboto',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add replay button
        const replayButton = this.add.image(550, 420, 'playAgainButton')
        .setDisplaySize(80,80).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            replayButton.setScale(0.45);
        })
        .on('pointerout', () => {
            replayButton.setScale(0.35);
        });

        // Add home button
        const homeButton = this.add.image(730, 420, 'homeButton')
        .setDisplaySize(80,80).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('MainMenu');
        })
        .on('pointerover', () => {
            homeButton.setScale(0.45);
        })
        .on('pointerout', () => {
            homeButton.setScale(0.35);
        });
        
    }
} 