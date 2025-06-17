import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

interface NewsPost {
    id: number;
    content: string;
    image: string;
    source: string;
    date: string;
    isFake: boolean;
    viralScore: number;
    username?: string;
}

export class NewsFeed extends Scene {
    private posts: NewsPost[] = [];
    private score: number = 0;
    private timeRemaining: number = 1200; // 20 minutes in seconds
    private scoreText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private selectedPostContainer: Phaser.GameObjects.Container | null = null;
    private selectedPost: NewsPost | null = null;
    private feedbackText!: Phaser.GameObjects.Text;
    private realDropZone!: Phaser.GameObjects.Zone;
    private fakeDropZone!: Phaser.GameObjects.Zone;
    private realDropZoneLabel!: Phaser.GameObjects.Text;
    private fakeDropZoneLabel!: Phaser.GameObjects.Text;
    private feedY: number = 200;
    private avatars: string[] = [
        '🕵️', '👩‍💻', '🧑', '👨‍🎤', '🤖', '🦸', '🧙', '👽', '🦹'
    ];
    private usernames: string[] = [
        'FactFinder', 'NewsNinja', 'MemeQueen', 'TrollHunter', 'InfoGuru', 'SatireSam', 'ViralVicky', 'TruthSeeker', 'ClickbaitCarl', 'DebunkDaisy'
    ];
    private maxPostsOnScreen: number = 3;

    constructor() {
        super({ key: 'NewsFeed' });
    }

    preload() {
        // Load UI assets
        this.load.image('post-bg', 'assets/post-bg.png');
        this.load.image('tool-bg', 'assets/tool-bg.png');
        this.load.image('chat-bg', 'assets/chat-bg.png');
        
        // Load tool icons
        this.load.image('check-image', 'assets/check-image.png');
        this.load.image('check-source', 'assets/check-source.png');
        this.load.image('report', 'assets/report.png');
    }

    create() {
        // Create background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);
        
        // Create UI elements
        this.createScorePanel();
        this.createToolPanel();
        this.createDropZones();
        this.createLegendPanel();

        // Initialize sample posts
        this.initializePosts();

        // Start the game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Start post spawning
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnNewPost,
            callbackScope: this,
            loop: true
        });

        this.selectedPostContainer = null;
        this.selectedPost = null;
        this.feedbackText = this.add.text(300, 575, '', {
            fontSize: '28px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            align: 'center',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        }).setOrigin(0.5).setDepth(100);
        this.feedY = 200;

        // Spawn the first news post immediately
        this.spawnNewPost();
    }

    private createScorePanel() {
        // Group score/time in a card (no viral score)
        /*const panel = this.add.rectangle(160, 80, 260, 80, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe0e0e0);*/
        this.scoreText = this.add.text(1110, 30, 'Score: 0', {
            fontSize: '28px',
            color: '#1976d2',
            fontStyle: 'bold',
            fontFamily: 'Roboto'
        });
        this.timeText = this.add.text(1110, 70, 'Time: 20:00', {
            fontSize: '22px',
            color: '#222',
            fontFamily: 'Roboto'
        });
    }

    private createToolPanel() {
        const toolPanel = this.add.container(150, 50);
        // Responsive Check Image button
        const checkImage = this.add.text(-40, 0, '🔍 Img', {
            fontSize: '28px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            backgroundColor: '#e3eafc',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                checkImage.setStyle({ backgroundColor: '#bbdefb' });
                this.useTool('check-image');
            })
            .on('pointerup', () => {
                checkImage.setStyle({ backgroundColor: '#e3eafc' });
            })
            .on('pointerover', () => {
                checkImage.setStyle({ backgroundColor: '#bbdefb'});
                checkImage.scale = 1.15;
            })
            .on('pointerout', () => {
                checkImage.setStyle({ backgroundColor: '#e3eafc'});
                checkImage.scale = 1;
            });
        // Responsive Check Source button
        const checkSource = this.add.text(200, 0, '🔗 Src', {
            fontSize: '28px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            backgroundColor: '#e3eafc',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                checkSource.setStyle({ backgroundColor: '#bbdefb' });
                this.useTool('check-source');
            })
            .on('pointerup', () => {
                checkSource.setStyle({ backgroundColor: '#e3eafc' });
            })
            .on('pointerover', () => {
                checkSource.setStyle({ backgroundColor: '#bbdefb'});
                checkSource.scale = 1.15;
            })
            .on('pointerout', () => {
                checkSource.setStyle({ backgroundColor: '#e3eafc'});
                checkSource.scale = 1;
            });
        toolPanel.add([checkImage, checkSource]);
    }

    private createDropZones() {
        // Fake News drop zone (left)
        this.fakeDropZone = this.add.zone(320, 640, 450, 120).setRectangleDropZone(500, 120);
        this.fakeDropZoneLabel = this.add.text(320, 640, '🚫 Mark as Fake', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#d32f2f',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            padding: { left: 40, right: 40, top: 24, bottom: 24 },
        }).setOrigin(0.5);
        this.fakeDropZone.setData('type', 'fake');

        // Real News drop zone (right)
        this.realDropZone = this.add.zone(750, 640, 450, 120).setRectangleDropZone(500, 120);
        this.realDropZoneLabel = this.add.text(750, 640, '✅ Mark as Real', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#388e3c',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            padding: { left: 40, right: 40, top: 24, bottom: 24 },
        }).setOrigin(0.5);
        this.realDropZone.setData('type', 'real');
    }

    private createLegendPanel() {
        const legendPanel = this.add.container(1065, 350);
        const bg = this.add.rectangle(0, 0, 320, 390, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x1976d2)
            .setAlpha(0.98);
        // Chat bubbles / tips
        const chatBubbles = [
            this.add.text(-130, -140, '💬 Hey, need a tip? Use the tools below to research!', {
                fontSize: '18px', color: '#1976d2', fontFamily: 'Arial', wordWrap: { width: 270 }
            }),
            this.add.text(-130, -70, '😏 Remember: If it sounds too wild, it probably is.', {
                fontSize: '18px', color: '#222', fontFamily: 'Arial', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 0, '😂 Some posts are just memes in disguise.', {
                fontSize: '18px', color: '#888', fontFamily: 'Arial', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 70, '🧐 Double-check the source, always!', {
                fontSize: '18px', color: '#1976d2', fontFamily: 'Arial', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 140, '🔥 Don\'t let fake news go viral!', {
                fontSize: '18px', color: '#d32f2f', fontFamily: 'Arial', wordWrap: { width: 270 }
            })
        ];
        legendPanel.add([bg, ...chatBubbles]);
    }

    private initializePosts() {
        // Add some initial sample posts
        this.posts = [
            {
                id: 1,
                content: "Breaking: Scientists discover new planet in our solar system!",
                image: "planet.jpg",
                source: "SpaceNews.com",
                date: "2024-03-20",
                isFake: true,
                viralScore: 0
            },
            // Add more sample posts here
        ];
    }

    private spawnNewPost() {
        // Only spawn if fewer than maxPostsOnScreen posts are on screen
        const activePosts = this.children.list.filter(obj =>
            obj instanceof Phaser.GameObjects.Container && (obj as any).isNewsPost === true
        ).length;
        if (activePosts >= this.maxPostsOnScreen) {
            return;
        }
        if (this.posts.length === 0) return;
        // Always use the first post in the array (as before)
        const post = this.posts[0];
        const postContainer = this.createPostElement(post);
        // Add animation for post appearing
        postContainer.setAlpha(0);
        this.tweens.add({
            targets: postContainer,
            alpha: 1,
            duration: 500
        });
    }

    private createPostElement(post: NewsPost): Phaser.GameObjects.Container {
        // Smaller post card
        const cardWidth = 800;
        const cardHeight = 170;
        const container = this.add.container(450, this.feedY);
        this.feedY += cardHeight + 25; // Stack posts vertically with margin
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        this.input.setDraggable(container);
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x1976d2)
            .setAlpha(0.99);
        // Pick random avatar and username for each card
        const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
        const username = this.usernames[Math.floor(Math.random() * this.usernames.length)];
        const timestamp = post.date + ' • ' + (Math.floor(Math.random() * 23) + 1) + 'h ago';
        // Top row: avatar, username, timestamp (left), date (right)
        const topRowY = -cardHeight/2 + 32;
        const avatarText = this.add.text(-cardWidth/2 + 32, topRowY, avatar, {
            fontSize: '28px', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);
        const usernameText = this.add.text(-cardWidth/2 + 70, topRowY, username, {
            fontSize: '20px', color: '#1976d2', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        const timeText = this.add.text(-cardWidth/2 + 70 + usernameText.width + 12, topRowY, timestamp, {
            fontSize: '13px', color: '#888', fontFamily: 'Arial', fontStyle: 'normal'
        }).setOrigin(0, 0.5);
        // Date only, right-aligned
        const date = this.add.text(cardWidth/2 - 20, topRowY, post.date, {
            fontSize: '13px', color: '#666', fontFamily: 'Arial', fontStyle: 'normal'
        }).setOrigin(1, 0.5);
        // Content (centered, smaller, more margin)
        const content = this.add.text(0, 18, post.content, {
            fontSize: '20px', color: '#222', fontFamily: 'Arial', fontStyle: 'bold', wordWrap: { width: cardWidth - 80 }, align: 'center'
        }).setOrigin(0.5);
        // Bottom row: source (left), 'Viral' label, viral bar (right)
        const bottomRowY = 60;
        const source = this.add.text(-cardWidth/2 + 70, bottomRowY, `Source: ${post.source}`, {
            fontSize: '15px', color: '#1976d2', fontFamily: 'Arial', fontStyle: 'normal'
        }).setOrigin(0, 0.5);
        const viralLabel = this.add.text(cardWidth/2 - 270, bottomRowY, 'Viral:', {
            fontSize: '15px', color: '#d32f2f', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        const barWidth = 220;
        const barHeight = 10;
        const viralBarBg = this.add.rectangle(cardWidth/2 - barWidth - 30, bottomRowY, barWidth, barHeight, 0xe0e0e0).setOrigin(0, 0.5);
        const viralBar = this.add.rectangle(cardWidth/2 - barWidth - 30, bottomRowY, 0, barHeight, post.isFake ? 0xd32f2f : 0x388e3c).setOrigin(0, 0.5);
        // Add all elements to the container
        container.add([bg, avatarText, usernameText, timeText, date, content, source, viralLabel, viralBarBg, viralBar]);
        (container as any).isNewsPost = true;
        (container as any).viralBar = viralBar;
        (container as any).viralText = viralLabel;
        
        // Post selection logic
        container.on('pointerdown', () => {
            if (this.selectedPostContainer) {
                (this.selectedPostContainer.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(4, 0xe0e0e0);
            }
            this.selectedPostContainer = container;
            this.selectedPost = post;
            (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(6, 0x1976d2);
        });

        // Drag and drop logic
        container.on('dragstart', () => {
            container.setDepth(10);
        });
        container.on('drag', (pointer: any, dragX: number, dragY: number) => {
            container.x = dragX;
            container.y = dragY;
        });
        container.on('dragend', (pointer: any, dragX: number, dragY: number, dropped: boolean) => {
            // Do nothing: let the post stay where it was dragged
        });

        // Drop zone logic
        this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
            if (gameObject === container) {
                let correct = false;
                if (dropZone.getData('type') === 'fake' && post.isFake) {
                    correct = true;
                } else if (dropZone.getData('type') === 'real' && !post.isFake) {
                    correct = true;
                }
                if (correct) {
                    this.score += 25;
                    this.showFeedback('🕵️‍♂️ Nailed it! You sniffed out the truth.', '#388e3c');
                } else {
                    this.score -= 15;
                    this.showFeedback('🤦 Oops! The internet is laughing...', '#d32f2f');
                }
                container.destroy();
                if (this.selectedPostContainer === container) {
                    this.selectedPostContainer = null;
                    this.selectedPost = null;
                }
            }
        });
        return container;
    }

    private useTool(tool: string) {
        if (!this.selectedPost || !this.selectedPostContainer) {
            this.showFeedback('Select a post first!', '#d32f2f');
            return;
        }
        let feedback = '';
        let color = '#1976d2';
        if (tool === 'check-image') {
            feedback = 'Image search opened!';
            color = '#1976d2';
            // Example: window.open('https://images.google.com/', '_blank');
        } else if (tool === 'check-source') {
            // Open a new tab with a Google search for the source and title
            const url = `https://www.google.com/search?q=${encodeURIComponent(this.selectedPost.source + ' ' + this.selectedPost.content)}`;
            window.open(url, '_blank');
            feedback = 'Source opened in new tab!';
            color = '#1976d2';
        }
        this.showFeedback(feedback, color);
    }

    private showFeedback(message: string, color: string) {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(color);
        this.feedbackText.setAlpha(1);
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            duration: 2000,
            delay: 1000
        });
    }

    private updateTimer() {
        this.timeRemaining--;
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);

        if (this.timeRemaining <= 0) {
            this.scene.start('GameOver', { score: this.score });
        }
    }

    update(time: number, delta: number) {
        // Each post's viral score increases so it reaches 100 in 90 seconds (1.11 per second)
        const viralIncrement = (100 / 90) * (delta / 1000); // delta is ms
        let gameOver = false;
        this.children.list.forEach(obj => {
            if (obj instanceof Phaser.GameObjects.Container && (obj as any).isNewsPost === true) {
                const post = this.posts[0]; // For now, just use the first post
                if (post) {
                    post.viralScore = Math.min(100, post.viralScore + viralIncrement);
                    // Update viral bar and text
                    const viralBar = (obj as any).viralBar as Phaser.GameObjects.Rectangle;
                    const viralText = (obj as any).viralText as Phaser.GameObjects.Text;
                    if (viralBar && viralText) {
                        viralBar.width = 3 * post.viralScore;
                        viralText.setText(`Viral: ${Math.round(post.viralScore)}%`);
                    }
                    // If fake news and viralScore hits 100, game over
                    if (post.isFake && post.viralScore >= 100) {
                        gameOver = true;
                    }
                }
            }
        });
        if (gameOver) {
            this.scene.start('GameOver', { score: this.score });
        }
        this.scoreText.setText(`Score: ${this.score}`);
    }
} 