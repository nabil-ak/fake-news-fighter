import { Scene } from 'phaser';
import { Mission } from './MissionLevel1';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xffffff).setOrigin(0);
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

        //this.scene.start("Mission");
        //this.scene.remove("MainMenu");

        // Add start button
        const startButton = this.add.text(640, 600, 'Start Mission', {
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
            this.scene.start('Mission');
        })
        .on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#115293'});
            startButton.scale = 1.15;
        })
        .on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#1976d2'});
            startButton.scale = 1;
        });

        //needs music button

    }

    /*resize() {
        this.background!.setPosition(0, this.getTopBarHeight());
        this.background!.setDisplaySize(this.game.scale.width, (this.game.scale.height) - this.getTopBarHeight());
        this.logo!.setPosition(this.game.scale.width / 2, this.getLogoY());
        this.logo!.setFontSize(this.getLogoFontSize());
        this.startButton!.setPosition(this.game.scale.width / 2, this.getStartButtonY());
        this.startButton!.setFontSize(this.getMainButtonFontSize());
        this.startButton!.setPadding(this.getMainButtonPaddingX(), this.getMainButtonPaddingY());
        this.settingsButton!.setPosition(this.game.scale.width / 2, this.getSettingsButtonY());
        this.settingsButton!.setFontSize(this.getMainButtonFontSize());
        this.settingsButton!.setPadding(this.getMainButtonPaddingX(), this.getMainButtonPaddingY());
        this.exitButton!.setPosition(this.game.scale.width / 2, this.getExitButtonY());
        this.exitButton!.setFontSize(this.getMainButtonFontSize());
        this.exitButton!.setPadding(this.getMainButtonPaddingX(), this.getMainButtonPaddingY());
        this.betaButton!.setPosition(this.getBetaButtonX(), this.getTopButtonY());
        this.betaButton!.setFontSize(this.getTopButtonFontSize());
        this.betaButton!.setPadding(this.getTopButtonPaddingX(), this.getTopButtonPaddingY());
        this.profileButton!.setPosition(this.getProfileButtonX(), this.getTopButtonY());
        this.profileButton!.setFontSize(this.getTopButtonFontSize());
        this.profileButton!.setPadding(this.getTopButtonPaddingX(), this.getTopButtonPaddingY());
        this.chartButton!.setPosition(this.getChartButtonX(), this.getTopButtonY());
        this.chartButton!.setFontSize(this.getTopButtonFontSize());
        this.chartButton!.setPadding(this.getTopButtonPaddingX(), this.getTopButtonPaddingY());

        if (this.settingsPanel) {
            this.settingsPanel.resize();
        }
        if (this.profilePanel) {
            this.profilePanel.resize();
        }
        if (this.loginPanel) {
            this.loginPanel.resize();
        }
    }*/
} 