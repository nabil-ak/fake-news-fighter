import { Scene } from 'phaser';

export class LevelCompleteScene extends Scene {
  
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  preload(){
    // Load button
    this.load.image('homebutton', 'assets/button/homeButton.png');
    this.load.image('nextButton', 'assets/button/nextButton.png');
    this.load.image('playAgainButton', 'assets/button/playAgainButton.png');
    this.load.image('star', 'assets/star.png');
  }

  create(){
    // Add background
    this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

    // Card panel for the result
    this.add.rectangle(640, 360, 480, 480, 0xffffff, 1)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x000000);

    // Add title
    this.add.text(640, 200, 'LEVEL GESCHAFFT!', {
      fontSize: '40px',
      color: '#222',
      fontFamily: 'Roboto',
    }).setOrigin(0.5);

    // Add home button 
    const homeButton = this.add.image(490, 520, 'homebutton')
      .setDisplaySize(80, 80).setOrigin(0.5).setDepth(101)
      .setInteractive();

    homeButton.on('pointerdown', () => {
            this.scene.start('LevelRequirement');
            const nextLevel = this.registry.get('currentLevel') + 1;
            this.registry.set('currentLevel', nextLevel);
            //score
        })
        .on('pointerover', () => {
            homeButton.setScale(0.45);
        })
        .on('pointerout', () => {
            homeButton.setScale(0.375);
        });
  }
}