require("babel/polyfill");
window.game = new Phaser.Game(1334, 750, Phaser.AUTO, 'game-container');

game.state.add('play', require('./states/play.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.start('boot');
