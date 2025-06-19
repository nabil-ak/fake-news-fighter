import { Scene } from 'phaser';
import { MusicManager } from './MusicManager';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    private backgroundMusic?: Phaser.Sound.BaseSound;
    private musicManager?: MusicManager;
    
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('bgStartGame2', 'assets/background/bgStartGame2.jpg');
        this.load.image('logo', 'assets/logo.png');
        this.load.audio('ByteKnightLightClouding2', 'assets/music/ByteKnightLightClouding2.mp3');
        this.load.image('nonameButton', 'assets/button/nonameButton.png');
        this.load.image('musicButton', 'assets/button/musicButton.png');
        this.load.image('muteButton', 'assets/button/muteButton.png');
    }

    create() {
        // Add background
        this.add.image(640, 360, 'bgStartGame2').setDisplaySize(1280, 720);
        // Light transparent background overlay
        this.add.rectangle(0, 0, 1280, 720, 0xffffff, 0.25).setOrigin(0);
        
        const logo = this.add.image(640, 245, 'logo');
        logo.setDisplaySize(670,543);
        
        // Add subtitle
        const subtitle = this.add.text(640, 510, 'Stop the spread. Seek the truth.', {
            fontFamily: 'Roboto',
            fontSize: '32px',
            color: '#FFFF66',
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

        // Add music 
        this.backgroundMusic = this.sound.add('ByteKnightLightClouding2', {
            volume: 0.2,
            loop: true
        });

        if (!this.sound.get('globalBgMusic')) {
            (this.backgroundMusic as any).key = 'globalBgMusic';
            this.backgroundMusic.play();
        }

        // Create music controller
        this.musicManager = new MusicManager(this, this.backgroundMusic);
        
        // Create buttons
        this.musicManager.createMusicButtons(1200, 50);

    }

} 