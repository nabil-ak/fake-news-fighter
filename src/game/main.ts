import { MainMenu } from './scenes/MainMenu';
import { NewsFeed } from './scenes/NewsFeed';
import { GameOver } from './scenes/GameOver';
import { AUTO, Game, Types } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1440,
    height: 900,
    parent: 'game-container',
    backgroundColor: '#f5f7fa',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        MainMenu,
        NewsFeed,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
