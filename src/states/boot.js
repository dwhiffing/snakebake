import Phaser from 'phaser'
export default class Boot {
  preload() {
    this.load.baseURL = 'assets/'
  }

  create() {
    this.input.maxPointers = 1

    // set up scale mode
    this.stage.disableVisibilityChange = true
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL
    this.scale.pageAlignHorizontally = true
    this.scale.pageAlignVertically = true
    game.scale.setScreenSize(true)
    this.scale.forceOrientation(true)

    game.state.start('load', true, false)
  }
}
