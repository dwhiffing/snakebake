export default class Load {
  constructor() {
    this.loadingSprite = null
  }

  preload() {
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this)

    for (var i = 1; i <= 16; i++) {
      let string = i
      if (i < 10) {
        string = `0${i}`
      }
      this.load.tilemap(
        `level${i}`,
        `levels/level_${string}.json`,
        null,
        window.Phaser.Tilemap.TILED_JSON,
      )
    }

    this.load.image('tile', 'images/tile.png')
    this.load.image('kawaii', 'images/kawaii.png')

    // this.load.audio('normal_music', 'normal.mp3');
    // this.load.audio('kawaii_music', 'kawaii.mp3');

    this.load.image('modal-instructions', 'images/modal-instructions.png')
    this.load.image('modal-settings', 'images/modal-settings.png')
    this.load.image('modal-win', 'images/modal-win.png')

    this.load.image('opt_button', 'images/opt_button.png')
    this.load.image('restart_button', 'images/restart_button.png')
    this.load.spritesheet('switch', 'images/switch-left.png', 70, 42)
    this.load.spritesheet('win', 'images/win.png', 257, 247)

    this.load.image('title', 'images/title.jpg')

    this.load.image('crumb', 'images/crumb.png')
    this.load.image('broc', 'images/broc.png')

    this.load.image('kawaii_bg', 'images/kawaii_bg.jpg')
    this.load.image('kawaii_foliage', 'images/kawaii_foliage.png')

    this.load.image('normal_bg', 'images/jungle.jpg')
    this.load.image('normal_foliage', 'images/foliage.png')
  }

  onLoadComplete() {
    game.state.start('menu', true, false)
    // game.state.start('play', true, false);
  }
}
