import Grid from './grid.js'
import level_data from './level_data'

export default class UserInterface {
  constructor() {
    this.tileSize = 144
    this.extra_offset = {x:20, y: 0}
    this.offset = {
      x: this.tileSize * 2 + this.extra_offset.x, 
      y:this.tileSize / 8
    }

    // set up grid Object for snakes/edibles
    this.grid = new Grid({
       tileSize: this.tileSize, 
       extra_offset: this.extra_offset, 
       offset: this.offset
    })

    // set up cursor/maker image
    // todo: should be a sprite
    this.marker = game.add.graphics()
    this.marker.lineStyle(2, 0xffffff, 1)
    this.marker.drawRect(0, 0, this.tileSize, this.tileSize)

    // set up initial game data for managing game state
    // todo: should be a sprite
    this.score = 0
    this.level = 1
    this.levels = level_data

    let text_opts = {
      font: "36px Arial",
      fill: "#ffffff",
      align: "center",
      stroke: '#000000',
      strokeThickness: 6
    }

    this.score_text = game.add.text(140, 120, "0", text_opts);
    this.level_text = game.add.text(140, 280, "0", text_opts);
    this.goal_text = game.add.text(140, 430, "0", text_opts);
    this.time_text = game.add.text(140, 590, "0", text_opts);

    this.opt_button = game.add.button(0, 657, "opt_button", this.showOptions, this);
    this.restart_button = game.add.button(100, 657, "restart_button", this.startLevel, this);

    this.score_text.anchor.x = Math.round(this.score_text.width * 0.5) / this.score_text.width;
    this.level_text.anchor.x = Math.round(this.level_text.width * 0.5) / this.level_text.width;
    this.goal_text.anchor.x = Math.round(this.goal_text.width * 0.5) / this.goal_text.width;
    this.time_text.anchor.x = Math.round(this.time_text.width * 0.5) / this.time_text.width;

    this.timer = game.time.create(false)
    this.timer.loop(1000, this.updateCounter, this)
    this.timer.start()

    this.sound_enabled = true
    this.normal_theme = true

    this.crumb_emitter = game.add.emitter(game.world.centerX, game.world.centerY)
    this.crumb_emitter.maxParticleAlpha = 1
    this.crumb_emitter.minParticleAlpha = 0.7
    this.crumb_emitter.makeParticles('crumb', 0, 400, 1, false, false)

    // add inputs for basic gameplay controls
    game.input.onDown.add(this.startDragging, this)
    game.input.onUp.add(this.stopDragging, this)
    game.input.addMoveCallback(this.updateMarker, this)

    // listener for increasing score
    game.increaseScore = (index,x,y) => {this.increaseScore(index,x,y)}
    game.triggerSnakeKilled = (index) => {this.triggerSnakeKilled()}

    // game.music = game.add.audio('normal_music')
    // game.music.play()
    // this.current_music = 'normal'

    this.startLevel()
  }

  startLevel() {
    // amount of tile elapsed
    this.time_elapsed = 0
    // amount of edibles collected
    this.collected = 0
    // number of edibles needed to progress
    this.point_goal = this.levels[this.level-1].count

    this.modal_is_open = false

    theme = this.levels[this.level-1].kawaii ? 'kawaii' : 'normal'

    let theme = (!this.levels[this.level-1].kawaii && this.normal_theme) ? 'normal' : 'kawaii'

    // let goal_string = this.levels[this.level-1].goal === 'kill' ? 'killed' : 'collected'

    this.level_text.text = this.level.toString()
    this.goal_text.text = `${this.collected} of ${this.point_goal}`
    this.time_text.text = "0"

    if (this.background) this.background.destroy()
    this.background = game.add.image(0,0,`${theme}_bg`).sendToBack()

    this.grid.snakes.forEach((s) => {s.alive = false})
    this.grid.newLevel(this.level, {theme: theme})

    if (this.foliage) this.foliage.destroy()
    this.foliage = game.add.image(0,0,`${theme}_foliage`).bringToTop()
    if (this.modal) this.modal.bringToTop()
    if (this.win_button) this.win_button.destroy()
  }

  showOptions() {
    this.openModal('modal-settings')

    let menu = game.add.button(game.width/2+50, game.height/2+80, null, this.backToMenu, this);
    let close = game.add.button(game.width/2-50, game.height/2+80, null, this.closeModal, this);
    let kawaii = game.add.button(game.width/2+132, game.height/2-70, 'switch', this.toggleKawaii, this);
    let sound = game.add.button(game.width/2+132, game.height/2+15, 'switch', this.toggleSound, this);
    close.width = 150; close.height = 50;
    menu.width = 150; menu.height = 50;
    this.buttons = [close, menu, kawaii, sound]
    this.buttons.forEach((b) => {b.anchor.x = 0.5})
  }

  showWinModal() {
    this.openModal('modal-win')

    this.win_animation = game.add.sprite(game.width/2, game.height/2-20, 'win');
    this.win_animation.anchor.x = 0.5
    this.win_animation.anchor.y = 0.5
    this.win_animation.scale.x = 0.9
    this.win_animation.scale.y = 0.9
    let anim = this.win_animation.animations.add('walk')

    anim.play(8, true)

    this.win_button = game.add.button(game.width/2, game.height/2, null, this.startNextLevel, this);
    this.win_button.width = 300; this.win_button.height = 300;
    this.win_button.anchor.x = 0.5
    this.win_button.anchor.y = 0.5
  }

  closeModal() {
    if (!this.modal) return
    this.modal_is_open = false
    this.modal.destroy()
    if (this.buttons) {
      this.buttons.forEach((b) => {b.destroy()})
    }
  }

  backToMenu() {
    this.closeModal()
  }

  openModal(modal) {
    this.modal_is_open = true;
    this.modal = game.add.image(0,0, modal)
  }

  toggleSound() {
    this.sound_enabled = !this.sound_enabled
    let thing = this.sound_enabled ? 0 : 1
    // todo: fix frames not changing for options
    this.buttons[2].frame = thing
    console.log(this.buttons[2])
  }

  toggleKawaii() {
    this.normal_theme = !this.normal_theme
    let thing = this.normal_theme ? 0 : 1
    // todo: fix frames not changing for options
    this.buttons[3].frame = thing
    console.log(this.buttons[3])
    this.startLevel()
  }

  startDragging() {
    if (this.modal_is_open) {

    } else {
      this.grid.selectSnake(this.marker.x, this.marker.y)
    }
  }

  stopDragging() {
    this.grid.active_snake = null
  }

  triggerSnakeKilled() {
    if (this.levels[this.level-1].goal === 'kill') this.increaseScore(66)
  }

  increaseScore(index, x, y) {
    if (index === game.edible_types.broc) {

    } else {
      this.launchCrumbs(x,y)
    }

    if (
        (index === game.edible_types.cake && this.levels[this.level-1].goal == 'collect') ||
        (index != game.edible_types.broc && this.levels[this.level-1].goal == 'collect_colored') ||
        (index === 66 && this.levels[this.level-1].goal == 'kill')
      ) {
      this.score += 50
      this.score_text.text = this.score.toString()
      this.collected++
      this.goal_text.text = `${this.collected} of ${this.point_goal}`
      this.checkWinCondition()
    }
    if (this.levels[this.level-1].spawnFood) {
      this.createFood()
    }
  }

  checkWinCondition() {
    if (this.collected === this.point_goal) {
      this.showWinModal()
    }
  }

  startNextLevel() {
    this.level++
    this.closeModal()
    if (this.win_animation) this.win_animation.destroy()
    this.startLevel()
  }

  updateMarker() {
    if (this.modal_is_open) return
    let pointer = game.input.activePointer
    if(!this.grid)return
    let tileX = this.grid.layer.getTileX(pointer.worldX)
    let tileY = this.grid.layer.getTileX(pointer.worldY)

    this.marker.x = tileX * this.tileSize + this.extra_offset.x
    this.marker.y = tileY * this.tileSize + this.offset.y

    if (pointer.isDown) {
      this.grid.moveSnake(this.marker.x, this.marker.y)
    }
  }

  createFood() {
    let times = this.levels[this.level-1].spawnCount || 1
    let type = this.levels[this.level-1].spawnType || 1
    let index = game.edible_types['cake']
    let chance = this.levels[this.level-1].chance || 30
    if (type === 2) {
      index = Phaser.Math.chanceRoll(chance) ? game.edible_types['cake'] : game.edible_types['broc']
    }

    for (var i = 0; i < times; i++) {
      let empty_tiles = this.grid.getEmptyTiles()
      let tile = Phaser.ArrayUtils.getRandomItem(empty_tiles)
      tile.rotation = 0
      tile.flipped = false
      this.grid.updateTile(tile, index)
    }
  }

  launchCrumbs(x,y) {
    x = x+this.offset.x+this.tileSize/2
    y = y+this.tileSize/2
    this.crumb_emitter.x = x
    this.crumb_emitter.y = y
    game.world.bringToTop(this.crumb_emitter)
    this.crumb_emitter.start(true, 5000, 30, 8)
  }

  updateCounter() {
    if (!this.modal_is_open){
      this.time_text.text = this.time_elapsed.toString()
      this.time_elapsed++;
    }
  }
}