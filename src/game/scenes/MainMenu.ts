import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('nonameButton', 'assets/nonameButton.png');
        this.load.image('musicButton', 'assets/musicButton.png');
        this.load.image('muteButton', 'assets/muteButton.png');
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);
        
        const logo = this.add.image(640, 280, 'logo');
        logo.setDisplaySize(564,440);
        

        // Add title
        /*const title = this.add.text(640, 180, 'Fake News Fighter', {
            fontFamily: 'Roboto',
            fontSize: '72px',
            color: '#222222',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        */

        // Add subtitle
        const subtitle = this.add.text(640, 520, 'Stop the spread. Seek the truth.', {
            fontFamily: 'Roboto',
            fontSize: '32px',
            color: '#1976d2',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Add start button
        const buttonBg = this.add.image(640, 600, 'nonameButton');
        
        const buttonContent = this.add.text(640, 600, 'Start', {
            fontFamily: 'Roboto',
            fontSize: '38px',
            color: '#ffffff',
        }).setOrigin(0.5);

        buttonBg.setDisplaySize(202,90)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('LevelRequirement');
        })
        .on('pointerover', () => {
            buttonBg.setScale(0.45);
            buttonContent.scale = 1.15;
        })
        .on('pointerout', () => {
            buttonBg.setScale(0.375);
            buttonContent.scale = 1;
        });

        // Add music button
        const musicButton = this.add.image(1200, 50, 'musicButton')
        .setDisplaySize(50,50).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setVisible(true);

        const muteButton = this.add.image(1200, 50, 'muteButton')
        .setDisplaySize(50,50).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

        // mute
        musicButton.on('pointerdown', () => {
            musicButton.setVisible(false);
            muteButton.setVisible(true);
        });

        // unmute
        muteButton.on('pointerdown', () => {
            muteButton.setVisible(false);
            musicButton.setVisible(true);
        });

    }

} 