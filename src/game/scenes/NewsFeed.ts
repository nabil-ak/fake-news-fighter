import { Scene } from 'phaser';
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
    private score: number = 0;
    private timeRemaining: number = 300; // 5 minutes in seconds
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

    private feedY: number = 240;
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
        this.load.image('exitButton', 'assets/button/exitButton.png');
        // Load json Data
        this.load.json('postsData', 'src/data/posts.json');

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

        // Find postSetID
        this.postsData = this.cache.json.get('postsData');
        // console.log("this posts data includes: ", this.postsData);
        // Get posts for current level
        this.posts = this.postsData[currentLevel.toString()];
        //console.log("this posts includes: ",this.posts);
        if (!this.posts) {
            //console.error(`No posts found for level ${currentLevel}`);
            return;
        }

        if (!this.imagesLoaded) {
            this.loadImages();
        }
    }

    loadImages() {
        if (!this.posts || this.posts.length === 0) return;

        this.posts.forEach(post => {
            const id = post.id;

            if (post.img && !this.textures.exists(`postImg${id}`)) {
                this.load.image(`postImg${id}`, post.img);
            }
            if (post.imgWithFoogle && !this.textures.exists(`foogleImg${id}`)) {
                this.load.image(`foogleImg${id}`, post.imgWithFoogle);
            } else if (post.imgWithFoogle) {
                console.warn(`post.imgWithFoogle is undefined for post.id = ${id}`, post);
            }
        });

        this.load.once('complete', () => {
            this.imagesLoaded = true;
        });
        this.load.start();
    }

    create() {
        // Get current level
        const currentLevel = this.registry.get('currentLevel');

        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Create UI elements
        this.createScorePanel();
        //this.createToolPanel();

        this.createLinkCheckerBox();
        this.createFoogleSearchBox(this.posts);
        this.createImageSearchBox();

        this.createLegendPanel();


        // Start the game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        this.selectedPostContainer = null;
        this.selectedPost = null;
        this.feedbackText = this.add.text(640, 660, '', {
            fontSize: '24px',
            color: '#1976d2',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            align: 'center',
            padding: { left: 16, right: 16, top: 8, bottom: 8 },
        }).setOrigin(0.5).setDepth(4);
        this.feedY = 240;
        // Start post spawning
        // ✅ Tạo postsContainer
        
        const checkLoadedEvent = this.time.addEvent({
            delay: 100, // mỗi 100ms kiểm tra 1 lần
            callback: () => {
                if (this.imagesLoaded) {
                    // Khi đã load xong ảnh, bắt đầu spawn post
                    this.time.addEvent({
                        delay: 5000,
                        callback: this.spawnNewPost,
                        callbackScope: this,
                        loop: true
                    });

                    this.spawnNewPost(); // gọi lần đầu

                    // 🛑 Dừng vòng lặp kiểm tra
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
        this.timeText = this.add.text(1230, 85, 'Time: 05:00', {
            fontSize: '24px',
            color: '#222',
            fontFamily: 'Roboto'
        }).setOrigin(1, 0);
    }

    /*    private createToolPanel() {
            const toolPanel = this.add.container(150, 50);
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
                    //this.useTool('check-source');
                })
                .on('pointerup', () => {
                    checkSourceBox.setStyle({ backgroundColor: '#e3eafc' });
                });
           
            toolPanel.add([ checkImage, checkSource]);
        }*/

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
        console.log('Keywords:', keywords);

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
        const selectedText = this.add.text(boxX, boxY, 'Nach Stichwort suchen...', {
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
                .setOrigin(0.5).setDepth(159)
                .setInteractive({ useHandCursor: true })
                .setVisible(false);

            itemText.on('pointerdown', () => {
                selectedText.setText(word);
                selectedText.setColor('#1976d2').setStroke('#1976d2', 1.15);
                isExpanded = false;
                dropdownItems.forEach(item => item.setVisible(false));
                this.popupSearchingWindow(posts, word);
                console.log('Chosen word:', word);
            });

            dropdownItems.push(itemText);
        });
    }

    popupSearchingWindow(posts: any[], word: string){
        // Pop-up background
        const cardWidth = 750;
        const cardHeight = 150;
        const popupBg = this.add.rectangle(cardWidth + 275, cardHeight + 240, 400, 450, 0xffffff)
            .setStrokeStyle(3, 0x1976d2)
            .setDepth(100);
        
        // find post with "key" = word
        const post = posts.find(post => post.key === word);

        if (post) {
            // Pop-up text
            let popupText: Phaser.GameObjects.Text | null = null;
            if (post.contentFoogleSearch) {
                popupText = this.add.text(cardWidth + 110, cardHeight + 50, post.contentFoogleSearch, {
                fontSize: '20px',
                color: '#000',
                fontFamily: 'Roboto',
                align: 'left',
                wordWrap: { width: 350, useAdvancedWrap: true }
                }).setOrigin(0).setDepth(101);
            } else {
                popupText = this.add.text(cardWidth + 110, cardHeight + 50, 'Keine Informationen darüber', {
                fontSize: '20px',
                color: '#000',
                fontFamily: 'Roboto',
                align: 'left'
                }).setOrigin(0).setDepth(101);
            }

            let popupImage: Phaser.GameObjects.Image | null = null;
            console.log("img in pop up ", post.imgWithFoogle);
            if (post.imgWithFoogle) {
                popupImage = this.add.image(cardWidth + 250, cardHeight + 300, `foogleImg${post.id}`)
                .setDisplaySize(275, 275)
                .setDepth(101);
                console.log("popup image: ", popupImage);
                console.log("popup image: x = ", popupImage.x);
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
                exitButton.destroy();
                console.log('Button destroyed');
                this.time.delayedCall(1000, () => {
                    if (this.imageText && this.imageText.active) {
                        this.imageText.setText('Ziehe das Bild hierher ...').setColor('#888888');
                        console.log('Text updated successfully');
                    } else {
                        console.error('imageText is null, undefined, or destroyed');
                    }
                });
            });       
        } else {
            console.log(`Found nothing with key = "${word}"`);
        }
         
    }


    // private createFoogleSearchBox(posts:any[]) {
    //     const boxWidth = 280;
    //     const boxHeight = 50;
    //     const boxX = 550;
    //     const boxY = 100;

    //     // Create drop zone 
    //     const foogleSearch = this.add.text(boxX - 60, boxY - 48, 'Foogle - Suche', {
    //         fontFamily: 'Roboto',
    //         fontSize: '24px',
    //         color: '#1976d2',
    //     }).setOrigin(0.5);
    //     // Background for textBox
    //     this.foogleSearchBox = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xffffff)
    //         .setStrokeStyle(3, 0x1976d2)
    //         .setAlpha(0.8);

    //     // Text in box
    //     this.foogleSearchText = this.add.text(boxX + 10, boxY, 'Nach Stichwort suchen...', {
    //         fontSize: '20px',
    //         color: '#888888',
    //         fontFamily: 'Roboto',
    //         fontStyle: 'italic',
    //         align: 'left'
    //     }).setOrigin(0.5);
    // }

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

    private spawnNewPost() {
        // Only spawn if fewer than maxPostsOnScreen posts are on screen
        const activePosts = this.children.list.filter(obj =>
            obj instanceof Phaser.GameObjects.Container
        ).length;
        if (activePosts >= this.maxPostsOnScreen) {
            return;
        }
        if (!this.posts || this.posts.length === 0 || this.currentPostIndex >= this.posts.length) {
            console.warn('No posts available to spawn');
            return;
        }
        //console.log("currentPostIndex: ", this.currentPostIndex);
        const post = this.posts[this.currentPostIndex];
        //console.log('Selected post:', post);

        const postContainer = this.createPostElement(post);
        // Add animation for post appearing
        postContainer.setAlpha(0);
        this.tweens.add({
            targets: postContainer,
            alpha: 1,
            duration: 500
        });
        this.currentPostIndex++;
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
        console.log(post);
        // Smaller post card

        const cardWidth = 750;
        const cardHeight = 150;

        const container = this.add.container(420, this.feedY)
            .setSize(cardWidth, cardHeight).setInteractive();


        this.feedY += cardHeight + 35; // Stack posts vertically with margin
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
        const topRowY = -cardHeight/2 +25;
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
        const content = this.add.text(-cardWidth / 2 + 32, topRowY + 25, `cONTENT OF POST: ${post.content}`, {
            fontSize: '20px', color: '#222', fontFamily: 'Roboto', fontStyle: 'bold', wordWrap: { width: cardWidth - 80 }, align: 'left'
        }).setOrigin(0);

        // Source
        let source: Phaser.GameObjects.Text | null = null;
        if (post.source) {
            source = this.add.text(-cardWidth / 2 + 32, topRowY + content.height + 35, post.source, {
                fontSize: '18px', color: '#1976d2', fontFamily: 'Roboto', fontStyle: 'normal'
            }).setOrigin(0).setDepth(20);
            // save position
            source.setData('originalX', content.x + source.x); // container
            source.setData('originalY', content.y + source.y);

            //(source as any).isSourceLink = true;

            source.setInteractive({ draggable: true });
            this.input.setDraggable(source);

            // Drag logic
            let draggedClone: Phaser.GameObjects.Text | null = null;
            source.on('dragstart', (pointer: any) => {
                console.log('Drag started for source!');

                // set position for clone
                const globalX = source!.getData('originalX');
                const globalY = source!.getData('originalY') - 20;
                draggedClone = this.add.text(globalX, globalY, source!.text, {
                    fontSize: '18px',
                    color: '#1976d2',
                    fontFamily: 'Roboto',
                    fontStyle: 'normal'
                }).setOrigin(0).setDepth(10).setAlpha(0.8).setScale(1.1);

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
        console.log('aaaa: ', post.img)
        if (post.img) {
            if (!post.source) image = this.add.image(-cardWidth / 2 + 32, topRowY + content.height + 45, `postImg${post.id}`).setOrigin(0).setDisplaySize(360, 300).setDepth(20);
            else image = this.add.image(-cardWidth / 2 + 48, topRowY + content.height + 75, `postImg${post.id}`).setOrigin(0).setDisplaySize(360, 300).setDepth(20);
            // save position
            image.setData('originalX', content.x + image.x);
            image.setData('originalY', content.y + image.y);

            image.setInteractive({ draggable: true });
            this.input.setDraggable(image);

            // Drag logic
            let igmaeDraggedClone: Phaser.GameObjects.Image | null = null;
            image.on('dragstart', (pointer: any) => {
                console.log('Drag started for image!');

                // set position for clone
                const globalX = image!.getData('originalX');
                const globalY = image!.getData('originalY') - 20;
                igmaeDraggedClone = this.add.image(globalX, globalY, `postImg${post.id}`).setOrigin(0).setDepth(10).setAlpha(0.8).setDisplaySize(360, 300);

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
                        igmaeDraggedClone.setDepth(15).setAlpha(1).setScale(1);

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
                        // Pop-up background
                        const popupBg = this.add.rectangle(cardWidth + 275, cardHeight + 240, 400, 450, 0xffffff)
                            .setStrokeStyle(3, 0x1976d2)
                            .setDepth(100);

                        // Pop-up text
                        let popupText: Phaser.GameObjects.Text | null = null;
                        if (post.contentFoogleSearch) {
                            popupText = this.add.text(cardWidth + 110, cardHeight + 50, post.contentFoogleSearch, {
                                fontSize: '20px',
                                color: '#000',
                                fontFamily: 'Roboto',
                                align: 'left',
                                wordWrap: { width: 350, useAdvancedWrap: true }
                            }).setOrigin(0).setDepth(101);
                        } else {
                            popupText = this.add.text(cardWidth + 110, cardHeight + 30, 'Keine Informationen darüber', {
                                fontSize: '20px',
                                color: '#000',
                                fontFamily: 'Roboto',
                                align: 'left'
                            }).setOrigin(0).setDepth(101);
                        }

                        // Pop-up image
                        //console.log("post object:", post);
                        //console.log("imgWithFoogle:", post.imgWithFoogle);
                        let popupImage: Phaser.GameObjects.Image | null = null;
                        console.log("img in pop up ", post.imgWithFoogle);
                        if (post.imgWithFoogle) {
                            popupImage = this.add.image(cardWidth, cardHeight, `foogleImg${post.id}`)
                                .setDisplaySize(275, 275)
                                .setDepth(101);
                            console.log("popup image: ", popupImage);
                            console.log("popup image: x = ", popupImage.x);
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
                            exitButton.destroy();
                            console.log('Button destroyed');
                            this.time.delayedCall(1000, () => {
                                if (this.imageText && this.imageText.active) {
                                    this.imageText.setText('Ziehe das Bild hierher ...').setColor('#888888');
                                    console.log('Text updated successfully');
                                } else {
                                    console.error('imageText is null, undefined, or destroyed');
                                }
                            });
                        });
                    });
                }
            });
        }

        /*const minTopForContainer = 165;

        let containerCurrentHeight = avatar.height + content.height;
        if (source) containerCurrentHeight += source.height;
        if (image) {
            console.log("image: ", image);
            containerCurrentHeight += 300;}

        console.log("final height: ", containerCurrentHeight);

        // Tính toán vị trí Y cho container để đảm bảo top không đè lên buttons
        const containerTop = this.feedY - containerCurrentHeight / 2; // Top hiện tại của container
        const requiredFeedY = minTopForContainer + containerCurrentHeight / 2; // FeedY cần thiết

        // Điều chỉnh feedY nếu cần
        if (containerTop < minTopForContainer) {
            this.feedY = requiredFeedY;
        }
        const container = this.add.container(420, this.feedY)
            .setSize(cardWidth, containerCurrentHeight).setInteractive();


        this.feedY += minTopForContainer + containerCurrentHeight + 25; // Stack posts vertically with margin
        //this.input.setDraggable(container);
        const bg = this.add.rectangle(0, 0, cardWidth, containerCurrentHeight + 15, 0xffffff)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x1976d2)
            .setAlpha(0.99);
        */

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
                    .setDepth(2);
                container.add(selectionCircle);
                if (color === 0x00cc00) {
                    if (post.category === 'real') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        this.score -= 5;
                        this.showFeedback('🤦 Hm... Das war leider falsch. Überprüfe nächstes Mal genauer!', '#d32f2f');
                    }
                } else if (color === 0xe74c3c) {
                    if (post.category === 'fake') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        this.score -= 5;
                        this.showFeedback('🤦 Hm... Das war leider falsch. Überprüfe nächstes Mal genauer!', '#d32f2f');
                    }
                } else {
                    if (post.category === 'normal') {
                        this.score += 10;
                        this.showFeedback('🕵️‍♂️ Toll! Du hast die Wahrheit herausgefunden.', '#388e3c');
                    } else {
                        this.score -= 5;
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
        if (image != null) container.add(image);
        (container as any).isNewsPost = true;
        (container as any).viralBar = viralBar;
        (container as any).viralText = viralLabel;
        container.setDepth(10);
        return container;
    }

    /*private useTool(tool: string) {
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
    }*/
    
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
                const post = this.posts[0];
                if (post) {
                    post.viralScore = Math.min(100, post.viralScore + viralIncrement);
                    // Update viral bar and text
                    const viralBar = (obj as any).viralBar as Phaser.GameObjects.Rectangle;
                    const viralText = (obj as any).viralText as Phaser.GameObjects.Text;
                    if (viralBar && viralText) {
                        viralBar.width = 2 * post.viralScore;
                        viralText.setText(`Viral: ${Math.round(post.viralScore)}%`);
                    }
                    // If fake news and viralScore hits 100, game over
                    if (post.category === "fake" && post.viralScore >= 100) {
                        this.time.delayedCall(3000, () => { gameOver = true; });
                    }
                }
            }
        });
        if (gameOver) {
            this.scene.start('GameOver', { score: this.score });
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