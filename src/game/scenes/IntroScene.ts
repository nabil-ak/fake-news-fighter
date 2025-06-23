import { Scene } from 'phaser';

export class IntroScene extends Scene {

    constructor() {
        super({ key: 'IntroScene' });
    }

    preload(){
        this.load.image('nonameButton', 'assets/button/nonameButton.png');
        this.load.image('exitButton', 'assets/button/exitButton.png');
        this.load.image('yesButton', 'assets/button/yesButton.png');
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Card panel for the level requirement
        this.add.rectangle(775, 280, 650, 400, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe0e0e0);

        // Add instructions 1,2
        const text1 = this.add.text(500, 120, 'Willkommen bei den Fake News Fightern!\nDu bist unser neuester Rekrut im Kampf gegen Fake News.', {
            fontFamily: 'Roboto',
            fontSize: '26px',
            color: '#444',
            align: 'left',
            lineSpacing: 10,
            wordWrap: { width: 550 }
        }).setOrigin(0);

        const text2 = this.add.text(500, 120, 'Deine Aufgabe ist es, Beiträge im Netz zu analysieren und zu entscheiden, ob sie echt, falsch oder einfach nur irrelevant sind.\nAber sei vorsichtig - manche Links sind gefährlich!\nIch begleite dich durch drei Trainingsstufen. Bist du bereit?', {
            fontFamily: 'Roboto',
            fontSize: '26px',
            color: '#444',
            align: 'left',
            lineSpacing: 10,
            wordWrap: { width: 550 }
        }).setOrigin(0).setVisible(false);

        // Add button 1
        const buttonBg1 = this.add.image(775, 550, 'nonameButton').setDisplaySize(182,81)
            .setOrigin(0.5);
        const buttonContent1 = this.add.text(775, 550, 'Weiter', {
            fontFamily: 'Roboto',
            fontSize: '38px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Add yes/no buttons
        const yesButton = this.add.image(700, 550, 'yesButton').setDisplaySize(75,75)
            .setOrigin(0.5).setVisible(false);
        const noButton = this.add.image(850, 550, 'exitButton').setDisplaySize(75,75)
            .setOrigin(0.5).setVisible(false);
        
        // Event handler
        buttonBg1.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                text1.setVisible(false);
                text2.setVisible(true);
                buttonBg1.setVisible(false);
                buttonContent1.setVisible(false);
                yesButton.setVisible(true);
                noButton.setVisible(true);
            })
            .on('pointerover', () => {
                buttonBg1.setScale(0.45);
                buttonContent1.scale = 1.3;
            })
            .on('pointerout', () => {
                buttonBg1.setScale(0.35);
                buttonContent1.scale = 1;
        });

        yesButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('LevelRequirement');
            })
            .on('pointerover', () => {
                yesButton.setScale(0.45);
            })
            .on('pointerout', () => {
                yesButton.setScale(0.35);
        });

        noButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            })
            .on('pointerover', () => {
                noButton.setScale(0.45);
            })
            .on('pointerout', () => {
                noButton.setScale(0.35);
        });
        this.registry.set('currentLevel', 1);
    }

}