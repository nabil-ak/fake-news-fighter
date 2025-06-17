import { Scene } from 'phaser';

export class Mission extends Scene {
    constructor() {
        super({ key: 'Mission' });
    }
    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Card panel for content of mission
        this.add.rectangle(775, 280, 650, 400, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe0e0e0);

        // Add instructions
        this.add.text(775, 280, 
            'Level 1:\n' +
            '• Analyze news posts in the feed\n' +
            '• Use fact-checking tools\n' +
            '• Stop fake news from going viral\n' +
            '• Complete your mission within 20 minutes!', {
            fontFamily: 'Roboto',
            fontSize: '28px',
            color: '#444',
            align: 'left',
            lineSpacing: 10,
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Add start button
        const playButton = this.add.text(775, 550, 'Ok! Let\'s start', {
            fontFamily: 'Roboto',
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
            playButton.setStyle({ backgroundColor: '#115293'});
            playButton.scale = 1.15;
        })
        .on('pointerout', () => {
            playButton.setStyle({ backgroundColor: '#1976d2'});
            playButton.scale = 1;
        });

    }


}