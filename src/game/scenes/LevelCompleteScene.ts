import { Scene } from 'phaser';
export class LevelCompleteScene extends Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(): void {
    // Dark transparent background overlay
    this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.5).setOrigin(0);

    // Card panel for the result
    this.add.rectangle(640, 360, 400, 300, 0xffffff, 1)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x000000);

    // Add title
    this.add.text(1280, 650, 'Level Complete!', {
      fontSize: '32px',
      color: '#222',
      fontFamily: 'Roboto',
    }).setOrigin(0.5);

    // Add continue button
    const continueButton = this.add.text(640, 420, 'Tiếp tục', {
      fontSize: '28px',
      color: '#007bff',
      fontFamily: 'Roboto',
      backgroundColor: '#ddd',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    continueButton.on('pointerup', () => {
      this.scene.stop('LevelCompleteScene');
      this.scene.stop('NewsFeed'); 
      this.scene.start('NextLevel'); 
    });
  }
}