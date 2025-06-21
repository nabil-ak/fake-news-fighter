import { Scene } from 'phaser';

export type LevelData = {
  levelID: number;
  requirements: string;
  postSetId: string;
};

const levels: LevelData[] = [
  {
    "levelID": 1,
    "requirements": "- Verwende den Link-Checker, um den Link im Beitrag zu überprüfen.\n- Ist er grün? Nicht sofort vertrauen - klicke drauf und überprüfe die Seite.\n- Markiere den Beitrag als fake    , echt     oder irrelevant    .\n*Achtung:\nEin Klick auf einen gefährlichen Link = Game Over!\nFalsche Einordnung = Punktabzug!",
    "postSetId": "set1"
  },
  {
    "levelID": 2,
    "requirements": "Sehr gut, du hast das erste Level geschafft!\nJetzt wird/'s schwieriger: Manche Posts haben keinen Link.\nBei solchen musst du unser neues Tool verwenden - die Foogle-Suche.\n -> Was sagen andere Quellen? Gibt es Belege?\nDann entscheidest du wieder: Fake News, echt oder irrelevant.",
    "postSetId": "set2"
  },
  {
    "levelID": 3,
    "requirements": "Willkommen in der Meisterstufe!\nWas tun, wenn es um ein Bild geht?\n-> Zieh das Bild mit Drag & Drop ins neue Tool: Reverse Image Search.\nEs zeigt dir z.B.\n- dieselbes Bild auf einer seriösen Seite,\n- ein ähnliches Bild, das ein bisschen anders aussieht? (-> vielleicht bearbeitet?),\n- oder gar kein Ergebnis (-> womöglich generiert oder manipuliert).\n- Kombiniere jetzt alle Tools! Nur wer genau prüft, erkennt die Wahrheit hinter den Posts.",
    "postSetId": "set3"
  }
];


export class LevelRequirement extends Scene {

    constructor() {
        super({ key: 'LevelRequirement' });
    }

    preload(){
        // Load button
        this.load.image('nonameButton2', 'assets/button/nonameButton2.png');
    }

    create() {
        // Get current level
        const currentLevel = this.registry.get('currentLevel');

        // Find levelID
        const currentLevelData = levels.find(level => level.levelID === currentLevel);
        if (!currentLevelData) {
            console.error(`No data found for level ${currentLevel}`);
            return;
        }

        // Add background
        this.add.rectangle(0, 0, 1280, 720, 0xcfd8dc).setOrigin(0);

        // Card panel for the level requirement
        this.add.rectangle(775, 280, 700, 425, 0xffffff, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xe0e0e0);

        // Add instructions
        this.add.text(475, 100, 
            `Level ${currentLevel}:\n${currentLevelData.requirements}`, {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#444',
            align: 'left',
            lineSpacing: 10,
            wordWrap: { width: 600 }
        }).setOrigin(0);

        // Add start button
        const buttonBg = this.add.image(775, 570, 'nonameButton2');
        
        const buttonContent = this.add.text(775, 570, 'Los geht\'s!', {
            fontFamily: 'Roboto',
            fontSize: '38px',
            color: '#ffffff',
        }).setOrigin(0.5);

        buttonBg.setDisplaySize(286,91)
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('NewsFeed');
        })
        .on('pointerover', () => {
            buttonBg.setScale(0.45);
            buttonContent.scale = 1.15;
        })
        .on('pointerout', () => {
            buttonBg.setScale(0.375);
            buttonContent.scale = 1;
        });
    }

}
