import playState from './states/play'
import loadState from './states/load'
import menuState from './states/menu'
import bootState from './states/boot'

window.game = new window.Phaser.Game(
  1334,
  750,
  Phaser.AUTO,
  'game-container',
  {},
)

game.state.add('play', playState)
game.state.add('load', loadState)
game.state.add('menu', menuState)
game.state.add('boot', bootState)
game.state.start('boot')
