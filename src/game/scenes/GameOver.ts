import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class GameOver extends Scene {
    private score: number = 0;

    constructor() {
        super({ key: 'GameOver' });
    }

    init(data: { score: number }) {
        this.score = data.score;
    }

    create() {
        // Add game over text
        const gameOverText = this.add.text(640, 200, 'Game Over', {
            fontFamily: 'Roboto',
            fontSize: '64px',
            color: '#000000'
        }).setOrigin(0.5);

        // Add final score
        const scoreText = this.add.text(640, 280, `Final Score: ${this.score}`, {
            fontFamily: 'Roboto',
            fontSize: '32px',
            color: '#000000'
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.text(640, 400, 'Play Again', {
            fontFamily: 'Roboto',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            restartButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            restartButton.setStyle({ backgroundColor: '#000000' });
        });

        // Add main menu button
        const menuButton = this.add.text(640, 500, 'Main Menu', {
            fontFamily: 'Roboto',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MainMenu');
        })
        .on('pointerover', () => {
            menuButton.setStyle({ backgroundColor: '#333333' });
        })
        .on('pointerout', () => {
            menuButton.setStyle({ backgroundColor: '#000000' });
        });
    }
} 