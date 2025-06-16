import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1440, 900, 0xf5f7fa).setOrigin(0);

        // Card panel for menu
        const panel = this.add.rectangle(720, 450, 700, 500, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe0e0e0);

        // Add title
        const title = this.add.text(720, 270, 'Fake News Fighter', {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#222222',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(720, 330, 'Become a Digital Detective', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#1976d2',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Add start button
        const startButton = this.add.text(720, 400, 'Start Mission', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#1976d2',
            padding: {
                left: 40,
                right: 40,
                top: 16,
                bottom: 16
            },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#115293', scale: 1.05 });
        })
        .on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#1976d2', scale: 1 });
        });

        // Add instructions
        const instructions = this.add.text(720, 530, 
            'Your Mission:\n' +
            '• Analyze news posts in the feed\n' +
            '• Use fact-checking tools\n' +
            '• Stop fake news from going viral\n' +
            '• Complete your mission within 20 minutes!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#444',
            align: 'center',
            lineSpacing: 10,
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
    }
} 