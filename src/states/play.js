import Phaser from 'phaser'
import UserInterface from '../entities/user_interface.js'

export default class SnakeAndBake {
  create() {
    let user_interface = new UserInterface()

    game.physics.startSystem(Phaser.Physics.ARCADE)

    if (!this.game.device.desktop) {
      game.input.onDown.add(this.goFull, this)
    }

    game.edible_types = {
      broc: 5,
      cake: 6,
    }

    game.snake_config = {
      numTiles: 4,
      numTypes: 6,
    }
  }

  goFull() {
    game.scale.startFullScreen(false)
  }
}
