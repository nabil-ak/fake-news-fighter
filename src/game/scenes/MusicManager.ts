import { Scene } from 'phaser';

export class MusicManager{
  
  private scene: Scene;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private musicButton?: Phaser.GameObjects.Image;
  private muteButton?: Phaser.GameObjects.Image;
  private isMuted: boolean = false;

  constructor(scene: Scene, backgroundMusic?: Phaser.Sound.BaseSound) {
    this.scene = scene;
    this.backgroundMusic = backgroundMusic;

    // Get mute status from localStorage or registry
    this.isMuted = this.scene.registry.get('musicMuted') || false;
  }
  
  // Add mute/unmute buttons
  createMusicButtons(x: number = 1200, y: number = 50): void {
    // unmute button (when music on)
    this.musicButton = this.scene.add.image(x, y, 'musicButton')
      .setDisplaySize(50, 50)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(!this.isMuted);

    // mute button (when music off)
    this.muteButton = this.scene.add.image(x, y, 'muteButton')
      .setDisplaySize(50, 50)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(this.isMuted);

    // Event handler (mute)
    this.musicButton.on('pointerdown', () => {
      this.muteMusic();
    });

    // Event handler (unmute)
    this.muteButton.on('pointerdown', () => {
      this.unmuteMusic();
    });
    }

    // Function: music off
    private muteMusic(): void {
      this.isMuted = true;
      this.musicButton?.setVisible(false);
      this.muteButton?.setVisible(true);
      this.backgroundMusic?.stop();
      
      this.scene.registry.set('musicMuted', true);
    }

    // Function: Music on
    private unmuteMusic(): void {
      this.isMuted = false;
      this.muteButton?.setVisible(false);
      this.musicButton?.setVisible(true);
        
      this.backgroundMusic?.play();
      
      this.scene.registry.set('musicMuted', false);
      
    }

}