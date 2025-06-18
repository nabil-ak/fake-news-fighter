import { Scene } from 'phaser';

export class LevelRequirement extends Scene {
    constructor() {
        super({ key: 'LevelRequirement' });
    }

    preload(){
        this.load.image('nonameButton2', 'assets/nonameButton2.png');
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Card panel for the level requirement
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
        const buttonBg = this.add.image(775, 550, 'nonameButton2');
        
        const buttonContent = this.add.text(775, 550, 'Ok! Let\'s start', {
            fontFamily: 'Roboto',
            fontSize: '38px',
            color: '#ffffff',
        }).setOrigin(0.5);

        buttonBg.setDisplaySize(286,91)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            buttonBg.setScale(0.45);
            buttonContent.scale = 1.15;
        })
        .on('pointerout', () => {
            buttonBg.setScale(0.375);
            buttonContent.scale = 1;
        });

    }


}