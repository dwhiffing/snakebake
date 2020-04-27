export default class Boot {
  preload() {
    this.load.baseURL = 'assets/'
    this.load.image('loader', 'images/loader.png')
  }

  create() {
    this.input.maxPointers = 1

    this.game.scale.maxWidth = 1067
    this.game.scale.maxHeight = 600

    // set up scale mode
    this.stage.disableVisibilityChange = true
    game.scale.scaleMode = window.Phaser.ScaleManager.SHOW_ALL
    game.scale.fullScreenScaleMode = window.Phaser.ScaleManager.SHOW_ALL
    // this.scale.pageAlignHorizontally = true
    // this.scale.pageAlignVertically = true
    // game.scale.setScreenSize(true)
    // this.scale.forceOrientation(true)

    game.state.start('load', true, false)
  }
}
