import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class NewsFeed extends Scene {
    private score: number = 0;
    private timeRemaining: number = 12; // 5 minutes in seconds
    private scoreText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private selectedPostContainer: Phaser.GameObjects.Container | null = null;
    private selectedPost: any = null;
    private feedbackText!: Phaser.GameObjects.Text;
    private linkDropZone!: Phaser.GameObjects.Zone;
    private imageDropZone!: Phaser.GameObjects.Zone;
    private feedY: number = 200;
    private postsData: any;
    private posts: any[];
    private avatarKeys = Array.from({ length: 10 }, (_, i) => `profil${i + 1}`);
    private usernames: string[] = [
        'FactFinder', 'NewsNinja', 'MemeQueen', 'TrollHunter', 'InfoGuru', 'SatireSam', 'ViralVicky', 'TruthSeeker', 'ClickbaitCarl', 'DebunkDaisy'
    ];
    private maxPostsOnScreen: number = 5;

    constructor() {
        super({ key: 'NewsFeed' });
    }

    preload() {
        /* Load UI assets
        this.load.image('post-bg', 'assets/post-bg.png');
        this.load.image('tool-bg', 'assets/tool-bg.png');
        this.load.image('chat-bg', 'assets/chat-bg.png');
        
        // Load tool icons
        this.load.image('check-image', 'assets/check-image.png');
        this.load.image('check-source', 'assets/check-source.png');
        this.load.image('report', 'assets/report.png');*/

        // Load json Data
        this.load.json('postsData', 'src/data/posts.json');

        //Load avatars
        this.avatarKeys.forEach((key) => {
        this.load.image(key, `public/assets/profil/${key}.png`);
        });

        // Preload complete event
        this.load.on('complete', () => {
            this.setupData();
        });
    }

    setupData() {
        // Get current level
        const currentLevel = this.registry.get('currentLevel');
        
        // Find postSetID
        this.postsData = this.cache.json.get('postsData');
        
        // Get posts for current level
        this.posts = this.postsData[currentLevel.toString()];

        if (!this.posts) {
            console.error(`No posts found for level ${currentLevel}`);
            return;
        }

        // Dynamically load images after posts data is available
        if (currentLevel === 3) {
            // Load images dynamically
            this.load.image('postImg1', this.posts[0].img);
            this.load.image('postImg2', this.posts[1].img);
            this.load.image('postImg5', this.posts[4].img);
            this.load.image('postImg6', this.posts[5].img);
            
            // Start loading these images
            this.load.start();
        }
    }    

    create() {
        // Get current level
        const currentLevel = this.registry.get('currentLevel');
        
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Create UI elements
        this.createScorePanel();
        this.createToolPanel();
        this.createDropZones();
        this.createLegendPanel();

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
        this.feedbackText = this.add.text(300, 650, '', {
            fontSize: '24px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            align: 'center',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        }).setOrigin(0.5).setDepth(100);
        this.feedY = 200;

        // Spawn the first news post immediately
        this.spawnNewPost(this.posts);
    }

    private createScorePanel() {
        // score and time
        this.scoreText = this.add.text(1120, 30, 'Score: 0', {
            fontSize: '28px',
            color: '#1976d2',
            fontStyle: 'bold',
            fontFamily: 'Roboto'
        });
        this.timeText = this.add.text(1120, 70, 'Time: 05:00', {
            fontSize: '22px',
            color: '#222',
            fontFamily: 'Roboto'
        });
    }

    private createToolPanel() {
        const toolPanel = this.add.container(150, 50);
        // Link Checker button
        const linkChecker = this.add.text(-35, 0, 'Link Checker', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);
        const linkCheckerBox = this.add.text(170, 95, 'Ziehe den Link hierher ...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
            backgroundColor: '#ffffff',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                linkCheckerBox.setStyle({ backgroundColor: '#bbdefb' });
                this.useTool('linkChecker');
            })
            .on('pointerup', () => {
                linkCheckerBox.setStyle({ backgroundColor: '#e3eafc' });
            });
        // Check Source button
        const checkSource = this.add.text(350, 0, 'Foogle - Suche', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);
        const checkSourceBox = this.add.text(525, 95, 'Suche mehr Infos ...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
            backgroundColor: '#ffffff',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                checkSourceBox.setStyle({ backgroundColor: '#bbdefb' });
                this.useTool('check-source');
            })
            .on('pointerup', () => {
                checkSourceBox.setStyle({ backgroundColor: '#e3eafc' });
            });
        // Check Image button
        const checkImage = this.add.text(700, 0, 'Reverse Image Suche', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);
        const checkImageBox = this.add.text(845, 95, 'Suche Fotos/Bilder ...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
            backgroundColor: '#ffffff',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                checkImageBox.setStyle({ backgroundColor: '#bbdefb' });
                this.useTool('check-image');
            })
            .on('pointerup', () => {
                checkImageBox.setStyle({ backgroundColor: '#e3eafc' });
            });
        toolPanel.add([linkChecker, checkImage, checkSource]);
    }

    private createDropZones() {
        // Link-Checker drop zone
        this.linkDropZone = this.add.zone(100, 150, 200, 120).setRectangleDropZone(200, 120);
        
        // Image drop zone 
        this.imageDropZone = this.add.zone(700, 150, 200, 120).setRectangleDropZone(200, 120);
    
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
                fontSize: '18px', color: '#1976d2', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, -70, '😏 Remember: If it sounds too wild, it probably is.', {
                fontSize: '18px', color: '#222', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 0, '😂 Some posts are just memes in disguise.', {
                fontSize: '18px', color: '#888', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 70, '🧐 Double-check the source, always!', {
                fontSize: '18px', color: '#1976d2', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 140, '🔥 Don\'t let fake news go viral!', {
                fontSize: '18px', color: '#d32f2f', fontFamily: 'Roboto', wordWrap: { width: 270 }
            })
        ];
        legendPanel.add([bg, ...chatBubbles]);
    }

    private spawnNewPost(
        posts:{   
            id: string; 
            content: string; 
            source?: string; 
            img?: string;
            category: string 
        }[]) {
        // Only spawn if fewer than maxPostsOnScreen posts are on screen
        const activePosts = this.children.list.filter(obj =>
            obj instanceof Phaser.GameObjects.Container
        ).length;
        if (activePosts >= this.maxPostsOnScreen) {
            return;
        }
        if (posts.length === 0) return;
        // Always use the first post in the array (as before)
        const post = posts[0];
        const postContainer = this.createPostElement(post);
        // Add animation for post appearing
        postContainer.setAlpha(0);
        this.tweens.add({
            targets: postContainer,
            alpha: 1,
            duration: 500
        });
    }

    private createPostElement(
        post:{   
            id: string; 
            content: string; 
            source?: string; 
            img?: string;
            category: string 
        }): Phaser.GameObjects.Container {
        // Smaller post card
        const cardWidth = 750;
        const cardHeight = 150;
        const container = this.add.container(450, this.feedY);
        this.feedY += cardHeight + 25; // Stack posts vertically with margin
        container.setSize(cardWidth, cardHeight);
        container.setInteractive();
        this.input.setDraggable(container);
        const bg = this.add.rectangle(450, 220, cardWidth, cardHeight, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x1976d2)
            .setAlpha(0.99);
        // Pick random avatar and username for each card
        const randomIndex = Math.floor(Math.random() * this.avatarKeys.length);
        const randomAvatarKey = this.avatarKeys[randomIndex];
        const username = this.usernames[Math.floor(Math.random() * this.usernames.length)];
        const generatedDate = this.getRandomDate();
        const timestamp = generatedDate + ' • ' + (Math.floor(Math.random() * 23) + 1) + 'h ago';
        // Top row: avatar, username, timestamp (left), date (right)
        const topRowY = cardHeight + 25;
        const avatar = this.add.image(cardWidth/8 + 15, topRowY, randomAvatarKey)
        .setDisplaySize(30,30)
        .setOrigin(0.5);
        const usernameText = this.add.text(cardWidth/8 + 45, topRowY, username, {
            fontSize: '20px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        const timeText = this.add.text(cardWidth/9 + 75 + usernameText.width, topRowY, timestamp, {
            fontSize: '13px', color: '#888', fontFamily: 'Roboto', fontStyle: 'normal'
        }).setOrigin(0, 0.5);

        // Content (centered, smaller, more margin)
        const content = this.add.text(cardWidth/2 + 95, topRowY + 32, post.content, {
            fontSize: '20px', color: '#222', fontFamily: 'Roboto', fontStyle: 'bold', wordWrap: { width: cardWidth - 75 }, align: 'center'
        }).setOrigin(0.5);

        /*


        const viralLabel = this.add.text(cardWidth/2 + 20, -bottomRowY, 'Viral:', {
            fontSize: '15px', color: '#d32f2f', fontFamily: 'Roboto', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        //const barWidth = 220;
        //const barHeight = 10;
        const viralBarBg = this.add.rectangle(-cardWidth/2 + 120, -bottomRowY, 100, 10, 0xe0e0e0).setOrigin(0, 0.5);
        const viralBar = this.add.rectangle(-cardWidth/2 + 120, -bottomRowY, 0, 10, post.category == 'fake' ? 0xd32f2f : 0x388e3c).setOrigin(0, 0.5);
        
        // Add button for fake, real new
                        /* Date only, right-aligned
        const date = this.add.text(cardWidth/2 - 20, topRowY, generatedDate, {
            fontSize: '13px', color: '#666', fontFamily: 'Roboto', fontStyle: 'normal'
        }).setOrigin(1, 0.5);
        const centerX = cardWidth/2 - 20;
        const centerY = topRowY;
        const spacing = 30; // distance between buttons

        // Color of buttons
        const colors = [0x00cc00, 0xe74c3c, 0x95a5a6]; 

        // Array buttons
        //const buttons: Phaser.GameObjects.Arc[] = [];

        // Create selected button
        let selectionCircle: Phaser.GameObjects.Arc | null = null;

        colors.forEach((color, index) => {
            const x = centerX + index * spacing;

            const button = this.add.circle(x, centerY, 10, color)
                .setInteractive({ useHandCursor: true });

            button.on('pointerdown', () => {
                selectionCircle = this.add.circle(button.x, button.y, 14)
                    .setStrokeStyle(2, 0xffffff)
                    .setDepth(0);
            });

            //buttons.push(button);
        });


        /* Source
        const bottomRowY = 40;
        let source = null;
        let image = null;
        if(post.source) {
            source = this.add.text(-cardWidth/2 + 20, bottomRowY, `Source: ${post.source}`, {
            fontSize: '15px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'normal'
        }).setOrigin(0, 0.5);
        }
        // Image
        if(post.img) {
            image = this.add.image(cardWidth/2 -80, 0, `postImg${post.id}`).setOrigin(0.5).setDisplaySize(120, 100);;
        }
        // Add all elements to the container
        container.add([bg, avatar, usernameText, timeText, content, viralLabel, viralBarBg, viralBar]);
        if(source != null) container.add(source);
        if (image != null) container.add(image);
        //(container as any).isNewsPost = true;
        (container as any).viralBar = viralBar;
        (container as any).viralText = viralLabel;
        
        // Post selection logic
        source?.on('pointerdown', () => {
            if (this.selectedPostContainer) {
                (this.selectedPostContainer.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(4, 0xe0e0e0);
            }
            this.selectedPostContainer = container;
            this.selectedPost = post;
            (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(6, 0x1976d2);
        });

        // Drag and drop logic
        source?.on('dragstart', () => {
            source.setDepth(10);
        });
        source?.on('drag', (pointer: any, dragX: number, dragY: number) => {
            source.x = dragX;
            source.y = dragY;
        });
        source?.on('dragend', (pointer: any, dragX: number, dragY: number, dropped: boolean) => {
            // Do something: come back to its position
        });*/

        /* Drop zone logic
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
        });*/
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

    /*update(time: number, delta: number, 
        posts: {
            id: string; 
            content: string; 
            source?: string; 
            img?: string;
            category: string 
    }[]) {
        // Each post's viral score increases so it reaches 100 in 90 seconds (1.11 per second)
        const viralIncrement = (100 / 90) * (delta / 1000); // delta is ms
        let gameOver = false;
        this.children.list.forEach(obj => {
            if (obj instanceof Phaser.GameObjects.Container && (obj as any).isNewsPost === true) {
                const post = posts[0]; // For now, just use the first post
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
    }*/

    private getRandomDate(): string {
        const today = new Date();
        const daysAgo = Math.floor(Math.random() * 7);
        today.setDate(today.getDate() - daysAgo);
        return today.toLocaleDateString('de-DE'); // for example: "20.06.2025"
    }
} 