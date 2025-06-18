import { Scene } from 'phaser';

export class GameOver extends Scene {
    private score: number = 0;

    constructor() {
        super({ key: 'GameOver' });
    }

    preload() {
        this.load.image('bg1', 'assets/bg1.jpg');
        this.load.image('playAgainButton', 'assets/playAgainButton.png');
        this.load.image('homeButton', 'assets/homeButton.png');
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        this.add.tileSprite(640, 360, 1280, 720, 'bg1');
        // Add game over text
        const gameOverText = this.add.text(640, 200, 'Game Over', {
            fontFamily: 'Roboto',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add final score
        const scoreText = this.add.text(640, 300, `Final Score: ${this.score}`, {
            fontFamily: 'Roboto',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.image(550, 420, 'playAgainButton')
        .setDisplaySize(80,80).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            restartButton.setScale(0.45);
        })
        .on('pointerout', () => {
            restartButton.setScale(0.375);
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
            homeButton.setScale(0.375);
        });
        
    }
} 