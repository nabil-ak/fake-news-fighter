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

  create(data: { score?: number; time?: number } = {}){
    // Add background
    this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

    // Card panel for the result
    this.add.rectangle(640, 360, 480, 480, 0xffffff, 1)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x000000);

    // Add title
    this.add.text(640, 170, 'LEVEL COMPLETE!', {
      fontSize: '40px',
      color: '#222',
      fontFamily: 'Roboto',
    }).setOrigin(0.5);

    // Add 3 yellow stars
    const starY = 260;
    const starSpacing = 120;
    for (let i = 0; i < 3; i++) {
      this.add.image(640 + (i - 1) * starSpacing, starY, 'star')
        .setDisplaySize(100, 100)
        .setOrigin(0.5)
        .setTint(0xFFFF00);
    }

    // Show score and time
    const score = data.score ?? 0;
    this.add.text(640, 360, `Score: ${score}`,
      { fontSize: '35px', color: '#222', fontFamily: 'Roboto' })
      .setOrigin(0.5);

    // Button positions
    const buttonY = 520;
    const buttonSpacing = 140;
    const currentLevel = this.registry.get('currentLevel') || 1;
    const currentFinalScore = this.registry.get('finalScore') || 0;
    const maxLevel = 3;

    // Home button
    const homeButton = this.add.image(640 - buttonSpacing, buttonY, 'homebutton')
      .setDisplaySize(80, 80).setOrigin(0.5).setDepth(101)
      .setInteractive({ useHandCursor: true });
    homeButton.on('pointerdown', () => {
      this.registry.set('currentLevel', 1);
      this.scene.start('MainMenu');
    })
    .on('pointerover', () => { homeButton.setScale(0.45); })
    .on('pointerout', () => { homeButton.setScale(0.375); });

    // Repeat button
    const repeatButton = this.add.image(640, buttonY, 'playAgainButton')
      .setDisplaySize(80, 80).setOrigin(0.5).setDepth(101)
      .setInteractive({ useHandCursor: true });
    repeatButton.on('pointerdown', () => {
      // Restart current level
      this.registry.set('currentLevel', currentLevel - 1);
      this.registry.set('finalScore', currentFinalScore - score);
      this.scene.start('LevelRequirement');
    })
    .on('pointerover', () => { repeatButton.setScale(0.45); })
    .on('pointerout', () => { repeatButton.setScale(0.375); });

    // Next button (only if not last level)
    const nextButton = this.add.image(640 + buttonSpacing, buttonY, 'nextButton')
      .setDisplaySize(80, 80).setOrigin(0.5).setDepth(101)
      .setInteractive({ useHandCursor: true });
    nextButton.on('pointerdown', () => {
      if (currentLevel <= maxLevel) {
        this.scene.start('LevelRequirement');
      } else {
        // If last level, go to MainMenu or show a message
        this.scene.start('MainMenu');
      }
    })
    .on('pointerover', () => { nextButton.setScale(0.45); })
    .on('pointerout', () => { nextButton.setScale(0.375); });
  }
}