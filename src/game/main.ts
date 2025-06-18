import { MainMenu } from './scenes/MainMenu';
import { LevelRequirement } from './scenes/LevelRequirement';
import { NewsFeed } from './scenes/NewsFeed';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { GameOver } from './scenes/GameOver';
import { AUTO, Game, Types } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#f5f7fa',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    /*dom: {
        createContainer: true
    },
    scale:{
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },*/

    scene: [
        MainMenu,
        LevelRequirement,
        LevelCompleteScene,
        NewsFeed,
        GameOver
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    /*const onChangeScreen = () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
        if (game.scene.scenes.length > 0) {
            let currentScene = game.scene.scenes[0];

            if (currentScene instanceof MainMenu) {
                currentScene.resize();
            } else if (currentScene instanceof Mission) {
                currentScene.resize();
            } else if (currentScene instanceof NewsFeed) {
                currentScene.resize();
            } else if (currentScene instanceof GameOver) {
                currentScene.resize();
            }
        }
    }
    const _orientation = screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
    _orientation.addEventListener('change', () => {
        onChangeScreen();
    });
    window.addEventListener('resize', () => {
    onChangeScreen();
    });*/
    return game;
}

export default StartGame;
