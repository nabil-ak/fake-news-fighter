import { Actions, Scene } from 'phaser';
import { EventBus } from '../EventBus';
interface Post {
    id: string;
    content: string;
    source?: string;
    img?: string;
    contentFoogleSearch?: string;
    imgWithFoogle?: string;
    category: string;
}


export class NewsFeed extends Scene {
    private imagesLoaded = false;
    private isCreated: boolean = false;
    private score: number = 0;
    private timeRemaining: number = 600; // 5 minutes in seconds
    private scoreText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private selectedPostContainer: Phaser.GameObjects.Container | null = null;
    private selectedPost: any = null;
    private currentPostIndex = 0;
    private warningButton: Phaser.GameObjects.Arc;
    private feedbackText!: Phaser.GameObjects.Text;
    private postsContainer!: Phaser.GameObjects.Container;

    private linkCheckerBox?: Phaser.GameObjects.Rectangle;
    private linkCheckerText?: Phaser.GameObjects.Text;
    private linkDropZone!: Phaser.GameObjects.Zone;

    private imageBox?: Phaser.GameObjects.Rectangle;
    private imageText?: Phaser.GameObjects.Text;
    private imageDropZone!: Phaser.GameObjects.Zone;

    private foogleSearchText?: Phaser.GameObjects.Text;
    private foogleSearchIsUsing: boolean = false;
    private imageSearchIsUsing: boolean = false;

    private isSpawning: boolean;
    private destroyedContainers: Set<any>;

    private feedY: number = 275;
    private postsData: any;
    private posts: any[];
    private avatarKeys = Array.from({ length: 10 }, (_, i) => `profil${i + 1}`);
    private usernames: string[] = [
        'FactFinder', 'NewsNinja', 'MemeQueen', 'TrollHunter', 'InfoGuru', 'SatireSam', 'ViralVicky', 'TruthSeeker', 'ClickbaitCarl', 'DebunkDaisy'
    ];

    private activeContainers: number = 0;
    private gameOver: boolean = false;
    constructor() {
        super({ key: 'NewsFeed' });
    }

    preload() {
        if (this.cache.json.exists('postsData')) {
            this.cache.json.remove('postsData');
        }
        this.load.image('exitButton', 'assets/button/exitButton.png');
        // Load json Data
        this.load.json('postsData', 'src/data/posts.json');
        console.log('this.cache.json.get: ',this.cache.json.get('postsData'))
        //Load avatars
        this.avatarKeys.forEach((key) => {
            this.load.image(key, `assets/profil/${key}.png`);
        });

        // Preload complete event
        this.load.once('complete', () => {
            this.setupData();
        });
        
    }

    setupData() {
        // Get current level
        const currentLevel = this.registry.get('currentLevel');
        //console.log("currentLevel", currentLevel);
        // Find postSetID
        this.postsData = this.cache.json.get('postsData');
        // Get posts for current level
        this.posts = this.postsData[currentLevel.toString()];
        console.log("this posts includes: ", this.posts);
        if (!this.posts) {
            //console.error(`No posts found for level ${currentLevel}`);
            return;
        }
        // DEBUG: Kiểm tra tất cả images trong posts
        /*console.log("Checking all images in posts:");
        this.posts.forEach((post, index) => {
            console.log(`Post ${index} (${post.id}):`, {
                imgWithFoogle: post.imgWithFoogle,
                fileExists: post.imgWithFoogle ? 'checking...' : 'undefined'
            });
        });*/

        if (!this.imagesLoaded) {
            this.loadImages();
        }
    }

    loadImages() {
        console.log('>>> loadImages() called');
        if (!this.posts || this.posts.length === 0) return;

        this.posts.forEach(post => {
            const id = post.id;
            const texturePrefix = `level${this.registry.get('currentLevel')}_`;
            if (post.img && !this.textures.exists(`${texturePrefix}postImg${id}`)) {
                console.log("load img: ", `${texturePrefix}postImg${id}`);
                this.load.image(`${texturePrefix}postImg${id}`, post.img);
            }
            if (post.imgWithFoogle && !this.textures.exists(`${texturePrefix}foogleImg${id}`)) {
                console.log("load img: ", `${texturePrefix}foogleImg${id}`);
                this.load.image(`${texturePrefix}foogleImg${id}`, post.imgWithFoogle);
            }
        });

        this.load.once('complete', () => {
            this.imagesLoaded = true;
        });
        this.load.start();
    }

    create() {
        console.log("vao create()");
        if (this.isCreated) {
            return;
        }
        this.isCreated = true;
        // Get current level
        const currentLevel = this.registry.get('currentLevel');
        console.log('create curent level: ', currentLevel)
        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Create UI elements
        this.createScorePanel();
        //this.createToolPanel();

        this.createLinkCheckerBox();
        if (currentLevel > 1) this.createFoogleSearchBox(this.posts);
        if (currentLevel === 3) this.createImageSearchBox();

        this.createLegendPanel();
        this.createColorNotes();

        // Start the game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.currentPostIndex = 0;
        //console.log('Create(): currentPostIndex reset to', this.currentPostIndex);
        this.activeContainers = 0;
        //console.log("aaa active Containers: ", this.activeContainers);
        this.gameOver = false;
        this.score = 0;
        this.selectedPostContainer = null;
        this.selectedPost = null;
        this.isSpawning = false;
        this.destroyedContainers = new Set();

        this.feedbackText = this.add.text(640, 660, '', {
            fontSize: '24px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            align: 'center',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        }).setOrigin(0.5).setDepth(4);
        this.feedY = 275;

        // Start post spawning
        const checkLoadedEvent = this.time.addEvent({
            delay: 100, // mỗi 100ms kiểm tra 1 lần
            callback: () => {
                if (this.imagesLoaded && !this.isSpawning) {
                    //console.log('Images loaded, starting first spawn');
                    /* Khi đã load xong ảnh, bắt đầu spawn post
                    this.time.addEvent({
                        delay: 5000,
                        callback: this.spawnNewPost,
                        callbackScope: this,
                        loop: true
                    });*/

                    this.activeContainers = 0;
                    this.spawnNewPost(); // call first time

                    // Stop loop checking
                    checkLoadedEvent.remove(); // <- đây!
                }
            },
            callbackScope: this,
            loop: true
        });

    }

    private createScorePanel() {
        // score and time
        this.scoreText = this.add.text(1230, 40, 'Score: 0', {
            fontSize: '28px',
            color: '#1976d2',
            fontStyle: 'bold',
            fontFamily: 'Roboto'
        }).setOrigin(1, 0);
        this.timeText = this.add.text(1230, 85, 'Time: 10:00', {
            fontSize: '24px',
            color: '#222',
            fontFamily: 'Roboto'
        }).setOrigin(1, 0);
    }

    private createLinkCheckerBox() {
        const boxWidth = 280;
        const boxHeight = 50;
        const boxX = 185;
        const boxY = 100;

        // Create drop zone 
        this.linkDropZone = this.add.zone(boxX, boxY, boxWidth, boxHeight)
            .setRectangleDropZone(boxWidth, boxHeight).setData('type', 'link');
        const linkChecker = this.add.text(boxX - 70, boxY - 48, 'Link Checker', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);
        // Background for textBox
        this.linkCheckerBox = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setAlpha(0.8);

        // Text in box
        this.linkCheckerText = this.add.text(boxX + 10, boxY, 'Ziehe den Link hierher...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
            align: 'left'
        }).setOrigin(0.5);

        //Button
        this.warningButton = this.add.circle(350, 100, 10, 0x1976d2);
    }
    private createFoogleSearchBox(posts: any[]): void {
        const boxX = 550;
        const boxY = 100;
        const boxWidth = 280;
        const boxHeight = 50;
        const keywords = posts
            .map(post => post.key)
            .filter(key => key !== undefined && key !== null && key !== '');
        //console.log('Keywords:', keywords);

        // Tạo text tạm để đo kích thước lớn nhất
        const tempTextObjects = keywords.map(word =>
            this.add.text(0, 0, word, {
                fontSize: '20px',
                fontFamily: 'Roboto',
                fontStyle: 'italic'
            }).setVisible(false)
        );

        const maxWidth = Math.max(...tempTextObjects.map(text => text.width)) + 20; // thêm padding x2

        // Xoá text tạm
        tempTextObjects.forEach(text => text.destroy());
        // Title
        this.add.text(boxX - 60, boxY - 48, 'Foogle - Suche', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);

        // Background for textBox
        const selectBox = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setInteractive({ useHandCursor: true });

        // Text in Box
        this.foogleSearchText = this.add.text(boxX, boxY, 'Nach Stichwort suchen...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // dropdown
        let isExpanded = false;
        const dropdownItems: Phaser.GameObjects.Text[] = [];

        selectBox.on('pointerdown', () => {
            if (isExpanded) {
                dropdownItems.forEach(item => item.setVisible(false));
            } else {
                dropdownItems.forEach(item => item.setVisible(true));
            }
            isExpanded = !isExpanded;
        });

        // Create keywords-list
        keywords.forEach((word, index) => {
            const itemY = boxY + boxHeight + index * 35;

            const itemText = this.add.text(boxX, itemY, word, {
                fontSize: '20px',
                color: '#1976d2',
                fontFamily: 'Roboto',
                fontStyle: 'bold',
                backgroundColor: '#eeeeee',
                padding: { x: 10, y: 5 }
            })
                .setOrigin(0.5).setDepth(150)
                .setInteractive({ useHandCursor: true })
                .setVisible(false);

            itemText.on('pointerdown', () => {
                this.foogleSearchText?.setText(word);
                this.foogleSearchText?.setColor('#1976d2').setFontStyle('bold');
                isExpanded = false;
                dropdownItems.forEach(item => item.setVisible(false));
                this.popupFoogleSearchingWindow(posts, word);
                //console.log('Chosen word:', word);
            });

            dropdownItems.push(itemText);
        });
    }

    private popupFoogleSearchingWindow(posts: any[], word: string) {
        if (!this.checkUsingPopup()) {
            this.foogleSearchText?.setText('Nach Stichwort suchen...').setColor('#888888').setFontStyle('italic');
            return;
        }

        this.foogleSearchIsUsing = true;

        // Pop-up background
        const cardWidth = 750;
        const cardHeight = 150;
        const popupBg = this.add.rectangle(cardWidth + 268, cardHeight + 270, 430, 528, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setDepth(100);

        // find post with "key" = word
        const post = posts.find(post => post.key === word);

        if (post) {
            // Pop-up text
            let popupText: Phaser.GameObjects.Text | null = null;
            if (post.contentFoogleSearch) {
                popupText = this.add.text(cardWidth + 90, cardHeight + 40, post.contentFoogleSearch, {
                    fontSize: '20px',
                    color: '#000',
                    fontFamily: 'Roboto',
                    align: 'left',
                    wordWrap: { width: 364, useAdvancedWrap: true }
                }).setOrigin(0).setDepth(101);
            } else {
                popupText = this.add.text(cardWidth + 90, cardHeight + 40, 'Keine Informationen darüber!', {
                    fontSize: '20px',
                    color: '#000',
                    fontFamily: 'Roboto',
                    align: 'left',
                    wordWrap: { width: 364, useAdvancedWrap: true }
                }).setOrigin(0).setDepth(101);
            }

            const textureFoogleImgPrefix = `level${this.registry.get('currentLevel')}_`;
            let popupImage: Phaser.GameObjects.Image | null = null;
            //console.log("img in pop up ", post.imgWithFoogle);
            if (post.imgWithFoogle) {
                popupImage = this.add.image(cardWidth + 240, cardHeight + 375, `${textureFoogleImgPrefix}foogleImg${post.id}`)
                    .setDisplaySize(300, 250)
                    .setDepth(101);
                //console.log("popup image: ", popupImage);
                //console.log("popup image: x = ", popupImage.x);
            }


            // Exit button
            const exitButton = this.add.image(cardWidth + 470, cardHeight + 20, 'exitButton')
                .setDisplaySize(50, 50).setOrigin(0.5).setDepth(101)
                .setInteractive();

            exitButton.on('pointerdown', () => {
                //console.log('Button exists before destroy:', exitButton.active);
                popupBg.destroy();
                if (popupText) popupText.destroy();
                if (popupImage) popupImage.destroy();
                this.foogleSearchIsUsing = false;
                this.foogleSearchText?.setText('Nach Stichwort suchen...').setColor('#888888').setFontStyle('italic');
                exitButton.destroy();
                //console.log('Button destroyed');
            });
        } else {
            console.log(`Found nothing with key = "${word}"`);
        }
    }

    private popupImageSearchingWindow(post: any, image?: Phaser.GameObjects.Image) {
        if (!this.checkUsingPopup()) {
            this.imageText?.setText('Ziehe das Bild hierher...').setColor('#888888');
            return;
        }

        this.imageSearchIsUsing = true;

        // Pop-up background
        const cardWidth = 750;
        const cardHeight = 150;
        const popupBg = this.add.rectangle(cardWidth + 268, cardHeight + 270, 430, 528, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setDepth(100);

        // Pop-up text
        let popupText: Phaser.GameObjects.Text | null = null;
        if (post.contentFoogleSearch) {
            popupText = this.add.text(cardWidth + 90, cardHeight + 40, post.contentFoogleSearch, {
                fontSize: '20px',
                color: '#000',
                fontFamily: 'Roboto',
                align: 'left',
                wordWrap: { width: 364, useAdvancedWrap: true }
            }).setOrigin(0).setDepth(101);
        } else {
            popupText = this.add.text(cardWidth + 90, cardHeight + 40, 'Keine Informationen darüber!', {
                fontSize: '20px',
                color: '#000',
                fontFamily: 'Roboto',
                align: 'left',
                wordWrap: { width: 364, useAdvancedWrap: true }
            }).setOrigin(0).setDepth(101);
        }


        const textureFoogleImgPrefix = `level${this.registry.get('currentLevel')}_`;
        let popupImage: Phaser.GameObjects.Image | null = null;
        //console.log("img in pop up ", post.imgWithFoogle);
        if (post.imgWithFoogle) {
            popupImage = this.add.image(cardWidth + 240, cardHeight + 375, `${textureFoogleImgPrefix}foogleImg${post.id}`)
                .setDisplaySize(300, 250)
                .setDepth(101);
            //console.log("popup image: ", popupImage);
            //console.log("popup image: x = ", popupImage.x);
        }

        // Exit button
        const exitButton = this.add.image(cardWidth + 470, cardHeight + 20, 'exitButton')
            .setDisplaySize(50, 50).setOrigin(0.5).setDepth(101)
            .setInteractive();

        exitButton.on('pointerdown', () => {
            //console.log('Button exists before destroy:', exitButton.active);
            popupBg.destroy();
            if (popupText) popupText.destroy();
            if (popupImage) popupImage.destroy();
            this.imageSearchIsUsing = false;
            this.imageText?.setText('Nach Stichwort suchen...').setColor('#888888');
            exitButton.destroy();
            //console.log('Button destroyed');
        });
    }

    private showImagePopup(post: any) {
        const textureImgPrefix = `level${this.registry.get('currentLevel')}_`;
        // Create background
        const bgPopup = this.add.rectangle(420, 400, 550, 458, 0x000000, 0.85).setOrigin(0.5);
        // Create image
        const image = this.add.image(420, 400, `${textureImgPrefix}postImg${post.id}`).setOrigin(0.5).setDisplaySize(480, 400).setDepth(30);
        // save position

        image.setData('originalX', image.x);
        image.setData('originalY', image.y);

        image.setInteractive({ draggable: true });
        this.input.setDraggable(image);

        // Drag logic
        let igmaeDraggedClone: Phaser.GameObjects.Image | null = null;
        image.on('dragstart', (pointer: any) => {
            //console.log('Drag started for image!');

            // set position for clone
            const globalX = image!.getData('originalX');
            const globalY = image!.getData('originalY') - 20;
            igmaeDraggedClone = this.add.image(globalX, globalY, `${textureImgPrefix}postImg${post.id}`).setOrigin(0).setDepth(100).setAlpha(0.8).setDisplaySize(360, 300);

            igmaeDraggedClone.setInteractive({ draggable: true });
            this.input.setDraggable(igmaeDraggedClone);

            this.input.once('drag', (pointer: any, dragX: number, dragY: number) => {
                if (igmaeDraggedClone) {
                    igmaeDraggedClone.x = dragX;
                    igmaeDraggedClone.y = dragY;
                }
            });

            this.input.once('dragend', (pointer: any, dragX: number, dragY: number, dropped: boolean) => {
                if (igmaeDraggedClone) {
                    igmaeDraggedClone.setDepth(100).setAlpha(1).setScale(1);

                    if (!dropped) {
                        igmaeDraggedClone.destroy();
                    }
                }
            });
        });
        // Drop zone logic
        this.input.on('drop', (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: any) => {
            if (gameObject === image && dropZone.getData('type') === 'reverse-image-search') {
                this.imageText?.setText('Checking ...').setColor('#1976d2');

                this.time.delayedCall(1000, () => { // 1000ms = 1 s
                    this.popupImageSearchingWindow(post, igmaeDraggedClone ?? undefined);
                });
            }
        });
        // Add exit button (ví dụ chữ 'X')
        const closeText = this.add.text(662, 175, '✖', {
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(51).setInteractive({ useHandCursor: true });

        closeText.on('pointerdown', () => {
            image.destroy();
            bgPopup.destroy();
            closeText.destroy();
        });
    }

    private checkUsingPopup(): boolean {
        if (this.imageSearchIsUsing) {
            this.showFeedback('Schließe bitte zuerst das Fenster zur Bildersuche!', '#d32f2f');
            return false;
        };
        if (this.foogleSearchIsUsing) {
            this.showFeedback('Schließe bitte zuerst das Fenster zur Foogle - Suche!', '#d32f2f');
            return false;
        }
        return true;
    }

    private createImageSearchBox() {
        const boxWidth = 280;
        const boxHeight = 50;
        const boxX = 880;
        const boxY = 100;

        // Create drop zone 
        this.imageDropZone = this.add.zone(boxX, boxY, boxWidth, boxHeight)
            .setRectangleDropZone(boxWidth, boxHeight).setData('type', 'reverse-image-search');
        const checkImage = this.add.text(boxX - 25, boxY - 48, 'Reverse Image Suche', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#1976d2',
        }).setOrigin(0.5);

        // Background for textBox
        this.imageBox = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setAlpha(0.8);

        // Text in box
        this.imageText = this.add.text(boxX + 10, boxY, 'Ziehe das Bild hierher...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: 'Roboto',
            fontStyle: 'italic',
            align: 'left'
        }).setOrigin(0.5);
    }

    private createLegendPanel() {
        const legendPanel = this.add.container(1065, 380);
        const bg = this.add.rectangle(0, 0, 320, 450, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x1976d2)
            .setAlpha(0.98);
        // Chat bubbles / tips
        const chatBubbles = [
            this.add.text(-130, -185, '🔥 Lass Fake News nicht viral gehen!', {
                fontSize: '18px', color: '#1976d2', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, -125, '😏 Grün beim Link-Checker heißt nicht automatisch echt - klick und prüfe selbst.', {
                fontSize: '18px', color: '#008800', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, -45, '💬 Kein Link? Nutze die Foogle-Suche!', {
                fontSize: '18px', color: '#FF3333', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 15, '🧐 Bild dabei? Nutze die Reverse Image Suche!', {
                fontSize: '18px', color: '#3366CC', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 75, '💬 Vorsicht: Gefährlicher Link = Game Over', {
                fontSize: '18px', color: '#222', fontFamily: 'Roboto', wordWrap: { width: 270 }
            }),
            this.add.text(-130, 135, '😂 Manche Posts sind einfach nur Blödsinn.', {
                fontSize: '18px', color: '#CC00FF', fontFamily: 'Roboto', wordWrap: { width: 270 }
            })
        ];
        legendPanel.add([bg, ...chatBubbles]);
    }

    private createColorNotes() {
        // Original coordinates
        const baseX = 990;
        const baseY = 635;

        const circleRadius = 13;
        const gapX = 75; // distance of circles

        const buttons = [
            { color: 0x00cc00, label: 'Echt', key: 'real' },   // geen
            { color: 0xe74c3c, label: 'Fake', key: 'fake' },   // red
            { color: 0x95a5a6, label: 'Neutral', key: 'normal' } // grey
        ];

        buttons.forEach((btn, index) => {
            const x = baseX + index * gapX;

            const circle = this.add.circle(x, baseY, circleRadius, btn.color)
                .setInteractive()
                .setData('key', btn.key);

            // notes
            const label = this.add.text(x, baseY + 25, btn.label, {
                fontSize: '18px',
                color: '#000000',
                fontFamily: 'Roboto',
            }).setOrigin(0.5, 0)
        });
    }

    private spawnNewPost() {
        // Prevent multiple simultaneous spawning
        if (this.isSpawning) {
            //console.log('Already spawning, skipping');
            return;
        }
        if (this.activeContainers > 0) {
            //console.log('Active containers exist, skipping spawn');
            return;
        }
        if (!this.posts || this.posts.length === 0) {
            console.warn('No posts available to spawn');
            return;
        }
        //console.log("aaaaa: currentPostIndex:  ", this.currentPostIndex);
        if (this.currentPostIndex >= this.posts.length) {
            console.log("All posts completed for this level");
            this.time.delayedCall(3000, () => {
                this.gameOver = true;
                const currentFinalScore = this.registry.get('finalScore') || 0;
                this.registry.set('finalScore', currentFinalScore + this.score);
                if (this.registry.get('currentLevel') == 3) {
                    this.isCreated = false;
                    this.scene.start('GameOver');
                }
                else {
                    this.imagesLoaded = false;
                    this.currentPostIndex = 0;
                    this.isCreated = false;
                    //console.log("reset at spawn method currentPostIndex: ",this.currentPostIndex);
                    this.time.delayedCall(3000, () => {
                        this.scene.start('LevelCompleteScene', { score: this.score });
                    });
                }
            });
            return;
        }

        // Set spawning flag
        this.isSpawning = true;
        const containersToSpawn = Math.min(2, this.posts.length - this.currentPostIndex);
        const spawnedContainers = [];
        console.log('containersToSpawn: ', containersToSpawn)
        for (let i = 0; i < containersToSpawn; i++) {
            const post = this.posts[this.currentPostIndex];
            const postContainer = this.createPostElement(post);

            // Add animation for post
            postContainer.setAlpha(0);
            this.tweens.add({
                targets: postContainer,
                alpha: 1,
                duration: 500
            });

            // Increase active containers 
            this.activeContainers++;
            spawnedContainers.push(postContainer);
            this.currentPostIndex++;
        }

        // Clear spawning flag after containers are created
        this.isSpawning = false;

        // Destroy event
        // Destroy event
        spawnedContainers.forEach(container => {
            container.once('destroy', () => {
                this.activeContainers--;
                //console.log('Container destroyed, activeContainers:', this.activeContainers);
                // Spawn new containers when all are destroyed
                if (this.activeContainers === 0) {
                    this.feedY = 275;
                    this.time.delayedCall(200, () => {
                        console.log('destroy new post')
                        this.spawnNewPost();
                    });
                }
            });
        });
    }

    private createPostElement(

        post: {
            id: string;
            content: string;
            source?: string;
            img?: string;
            contentFoogleSearch?: string,
            imgWithFoogle?: string,
            category: string
        }): Phaser.GameObjects.Container {
        //console.log(post);
        // Smaller post card

        const cardWidth = 750;
        const cardHeight = 170;

        const container = this.add.container(420, this.feedY)
            .setSize(cardWidth, cardHeight).setInteractive();


        this.feedY += cardHeight + 45; // Stack posts vertically with margin
        //this.input.setDraggable(container);
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight + 15, 0xffffff)
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
        const topRowY = -cardHeight / 2 + 25;
        const avatar = this.add.image(-cardWidth / 2 + 32, topRowY, randomAvatarKey)
            .setDisplaySize(30, 30)
            .setOrigin(0, 0.5);
        const usernameText = this.add.text(-cardWidth / 2 + 70, topRowY, username, {
            fontSize: '20px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        const timeText = this.add.text(-cardWidth / 2 + 70 + usernameText.width + 12, topRowY, timestamp, {
            fontSize: '13px', color: '#888', fontFamily: 'Roboto', fontStyle: 'normal'
        }).setOrigin(0, 0.5);

        // viralbar
        const viralLabel = this.add.text(cardWidth / 2 - 240, topRowY, 'Viral:', {
            fontSize: '15px', color: '#d32f2f', fontFamily: 'Roboto', fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        const barWidth = 200;
        const barHeight = 10;
        const viralBarBg = this.add.rectangle(cardWidth / 2 - barWidth - 30, topRowY, barWidth, barHeight, 0xe0e0e0).setOrigin(0, 0.5);
        const viralBar = this.add.rectangle(cardWidth / 2 - barWidth - 30, topRowY, 0, barHeight, 0xd32f2f).setOrigin(0, 0.5);

        // Content (centered, smaller, more margin)
        const content = this.add.text(-cardWidth / 2 + 32, topRowY + 25, `Source: ${post.content}`, {
            fontSize: '20px', color: '#222', fontFamily: 'Roboto', fontStyle: 'bold', wordWrap: { width: cardWidth - 80 }, align: 'left'
        }).setOrigin(0);

        // Source
        let source: Phaser.GameObjects.Text | null = null;
        if (post.source) {
            source = this.add.text(-cardWidth / 2 + 32, topRowY + content.height + 35, post.source, {
                fontSize: '20px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'normal'
            }).setOrigin(0);
            // save position
            source.setData('originalX', content.x + source.x); // container
            source.setData('originalY', content.y + source.y);

            //(source as any).isSourceLink = true;

            source.setInteractive({ draggable: true });
            this.input.setDraggable(source);

            // Drag logic
            let draggedClone: Phaser.GameObjects.Text | null = null;
            source.on('dragstart', (pointer: any) => {
                //console.log('Drag started for source!');

                // set position for clone
                const globalX = source!.getData('originalX');
                const globalY = source!.getData('originalY') - 20;
                draggedClone = this.add.text(globalX, globalY, source!.text, {
                    fontSize: '20px',
                    color: '#1976d2',
                    fontFamily: 'Roboto',
                    fontStyle: 'normal'
                }).setOrigin(0).setDepth(15).setAlpha(0.8).setScale(1.1);

                //(draggedClone as any).isSourceLink = true;

                draggedClone.setInteractive({ draggable: true });
                this.input.setDraggable(draggedClone);

                this.input.once('drag', (pointer: any, dragX: number, dragY: number) => {
                    if (draggedClone) {
                        draggedClone.x = dragX;
                        draggedClone.y = dragY;
                    }
                });

                this.input.once('dragend', (pointer: any, dragX: number, dragY: number, dropped: boolean) => {
                    if (draggedClone) {
                        draggedClone.setDepth(15).setAlpha(1).setScale(1);

                        if (!dropped) {
                            draggedClone.destroy();
                        }
                    }
                });
            });
            /*source.on('dragstart', (pointer: any) => {
                    console.log('Drag started for source!');
                    source!.setDepth(10).setAlpha(0.8).setScale(1.1); 
                    if (this.selectedPostContainer) {
                        (this.selectedPostContainer.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(4, 0xe0e0e0);
                    }
                    this.selectedPostContainer = container;
                    this.selectedPost = post;
                    (bg as Phaser.GameObjects.Rectangle).setStrokeStyle(6, 0x1976d2);
                })
                .on('drag', (pointer: any, dragX: number, dragY: number) => {
                    console.log('Dragging source to:', dragX, dragY);
                    source!.x = dragX;
                    source!.y = dragY;
                })
                .on('dragend', (pointer: any, dragX: number, dragY: number, dropped: boolean) => {
                    console.log('Drag ended for source');
                    source!.setDepth(15).setAlpha(1).setScale(1);
                    if (!dropped) this.returnToOriginalPosition(source!);
                });*/

            // Drop zone logic
            this.input.on('drop', (pointer: any, gameObject: Phaser.GameObjects.Text, dropZone: any) => {
                if (gameObject === source && dropZone.getData('type') === 'link') {
                    this.linkCheckerText?.setText('Checking ...').setColor('#1976d2');

                    this.time.delayedCall(1000, () => { // 1000ms = 1 s
                        let newColor = 0x00cc00;
                        if (post.category === "fake") {
                            newColor = 0xe74c3c;
                        } else if (post.category === "normal") {
                            newColor = 0x95a5a6;
                        }
                        this.warningButton.setFillStyle(newColor);
                    });
                    this.time.delayedCall(4000, () => {
                        this.warningButton.setFillStyle(0x1976d2);
                        this.linkCheckerText?.setText('Ziehe den Link hierher ...').setColor('#888888');
                    });
                }
            });
        }

        // Image
        let image: Phaser.GameObjects.Image | null = null;
        let seeImageText: Phaser.GameObjects.Text | null = null;
        //console.log('aaaa: ', post.img)
        if (post.img) {
            if (!post.source) seeImageText = this.add.text(-cardWidth / 2 + 105, topRowY + content.height + 50, '👉 Bild ansehen', {
                fontSize: '20px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'italic'
            })
                .setOrigin(0.5).setInteractive().setDepth(16); //'#1976d2'
            else {
                seeImageText = this.add.text(-cardWidth / 2 + 105, topRowY + content.height + 75, '👉 Bild ansehen', {
                    fontSize: '20px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'italic'
                })
                    .setOrigin(0.5).setInteractive().setDepth(16);
            }
            //console.log("seeImageText: ", seeImageText);
            seeImageText.on('pointerdown', () => {
                this.showImagePopup(post);
            });
        }

        // Add button for fake, real new
        const centerX = cardWidth / 2 + 30;
        const centerY = cardHeight / 6 - 55;
        const spacing = 30; // distance between buttons

        // Color of buttons
        const colors = [0x00cc00, 0xe74c3c, 0x95a5a6];
        // Create selected button
        let selectionCircle: Phaser.GameObjects.Arc | null = null;

        colors.forEach((color, index) => {
            const y = centerY + index * spacing;
            const button = this.add.circle(centerX, y, 10, color)
                .setInteractive({ useHandCursor: true });

            container.add(button);

            button.on('pointerdown', () => {
                selectionCircle = this.add.circle(button.x, button.y, 14)
                    .setStrokeStyle(2, 0x00cccc)
                    .setDepth(15);
                container.add(selectionCircle);
                if (color === 0x00cc00) {
                    if (post.category === 'real') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        if (this.score < 5) this.score = 0;
                        else this.score -= 5;
                        this.showFeedback('🤦 Hm... Das war leider falsch. Überprüfe nächstes Mal genauer!', '#d32f2f');
                    }
                } else if (color === 0xe74c3c) {
                    if (post.category === 'fake') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        if (this.score < 5) this.score = 0;
                        else this.score -= 5;
                        this.showFeedback('🤦 Hm... Das war leider falsch. Überprüfe nächstes Mal genauer!', '#d32f2f');
                    }
                } else {
                    if (post.category === 'normal') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        if (this.score < 5) this.score = 0;
                        else this.score -= 5;
                        this.showFeedback('🤦 Hm... Das war leider falsch. Überprüfe nächstes Mal genauer!', '#d32f2f');
                    }
                }
                container.destroy();
                if (this.selectedPostContainer === container) {
                    this.selectedPostContainer = null;
                    this.selectedPost = null;
                }
            });
        });

        // Add all elements to the container
        container.add([bg, avatar, usernameText, timeText, content, viralLabel, viralBarBg, viralBar]);
        if (source != null) container.add(source);
        if (seeImageText != null) {
            container.add(seeImageText);
        }
        (container as any).isNewsPost = true;
        (container as any).viralBar = viralBar;
        (container as any).viralText = viralLabel;
        return container;
    }

    private showFeedback(message: string, color: string) {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(color);
        this.feedbackText.setAlpha(1).setDepth(110);
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
        let loser = false;
        let gameOver = false;
        this.children.list.forEach(obj => {
            if (obj instanceof Phaser.GameObjects.Container && (obj as any).isNewsPost === true) {
                console.log("currentIndex: ", this.currentPostIndex);
                const post2 = this.posts[this.currentPostIndex - 1];
                const post1 = this.posts[this.currentPostIndex - 2];
                console.log("post1: ", post1);
                console.log("post1.category is: ", post1.category);

                console.log("post2: ", post2);
                console.log("post2.category is: ", post2.category);
                if (post2) {
                    post2.viralScore = Math.min(100, post2.viralScore + viralIncrement);
                    // Update viral bar and text
                    const viralBar = (obj as any).viralBar as Phaser.GameObjects.Rectangle;
                    const viralText = (obj as any).viralText as Phaser.GameObjects.Text;
                    if (viralBar && viralText) {
                        viralBar.width = 2 * post2.viralScore;
                        viralText.setText(`Viral: ${Math.round(post2.viralScore)}%`);
                    }
                    // If fake news and viralScore hits 100, game over
                    console.log("oh no: ", this.currentPostIndex);
                    if (post2.category === "fake" && post2.viralScore >= 100) {
                        console.log("post is fake, viral 100%");
                        gameOver = true; loser = true;
                    }
                }
                if (post1) {
                    post1.viralScore = Math.min(100, post1.viralScore + viralIncrement);
                    // Update viral bar and text
                    const viralBar = (obj as any).viralBar as Phaser.GameObjects.Rectangle;
                    const viralText = (obj as any).viralText as Phaser.GameObjects.Text;
                    if (viralBar && viralText) {
                        viralBar.width = 2 * post1.viralScore;
                        viralText.setText(`Viral: ${Math.round(post1.viralScore)}%`);
                    }
                    // If fake news and viralScore hits 100, game over
                    console.log("oh no: ", this.currentPostIndex);
                    if (post1.category === "fake" && post1.viralScore >= 100) {
                        console.log("post is fake, viral 100%");
                        gameOver = true; loser = true;
                    }
                }
            }
        });
        if (gameOver) {
            const currentFinalScore = this.registry.get('finalScore') || 0;
            this.registry.set('finalScore', currentFinalScore + this.score);
            if (this.registry.get('currentLevel') == 3 || loser) {
                this.isCreated = false;
                this.scene.start('GameOver');
            }
            else {
                this.imagesLoaded = false;
                this.currentPostIndex = 0;
                this.isCreated = false;
                //console.log("reset at update method currentPostIndex: ",this.currentPostIndex);
                this.scene.start('LevelCompleteScene', { score: this.score });

            }
        }
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private getRandomDate(): string {
        const today = new Date();
        const daysAgo = Math.floor(Math.random() * 7);
        today.setDate(today.getDate() - daysAgo);
        return today.toLocaleDateString('de-DE'); // for example: "20.06.2025"
    }
} 