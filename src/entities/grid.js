import Snake from './snake'

export default class Grid  {
  constructor(opts)  {
    this.size = opts.tileSize
    this.extra_offset = opts.extra_offset
    this.offset = opts.offset
    this.snakes = []
  }

  newLevel(level, opts) {
    this.destroyLevel()

    // initialize a Phaser tilemap to keep track of walls
    this.map = game.add.tilemap('level'+level)

    // set up current theme tile set
    // need to make configurable to include multiple themes
    if (opts.theme == 'kawaii') {
      this.map.addTilesetImage('tile','kawaii')
    } else {
      this.map.addTilesetImage('tile')
    }

    // set up the tile layer to draw the current snakes/edibles
    this.layer = this.map.createLayer('Tile Layer 1')
    
    // adjust tile layer to be offset to center it and make room of the ui
    this.layer.cameraOffset = {
      x: this.offset.x, 
      y: this.offset.y
    }
    this.layer.crop = {
      x: this.offset.x,
      y: this.offset.y,
      width: this.layer.width - this.offset.x,
      height: this.layer.height - this.offset.y
    }
    this.layer.resizeWorld()

    // setup snakes based on loaded tile data
    let data = [].concat.apply([], this.layer.layer.data)
    let snake_coords = []

    // for each tile in each row of data
    for (var tile of data) { 
      // check for each type of snake
      for (var color of [0, 1, 2, 3, 4, 5]) {
        let head_index = color * 4 + 12
        snake_coords[color] = snake_coords[color] || []
        // add the coords to the array if they fall in range
        if (tile.index-1 >= head_index && tile.index-1 < head_index + 3) {
          // if its a head, add it to the front, otherwise to the end
          let method = (tile.index-1 == head_index) ? 'unshift' : 'push'
          snake_coords[color][method]([tile.x, tile.y])
        }
      }
    }

    // setup snakes for each type found in the data, filter out nils
    this.snakes = snake_coords.map((coord, index) => {
      return this.createSnake(coord, (index * 4) + 12)
    }).filter((s) => typeof s !== 'undefined')
  }

  destroyLevel() {
    this.snakes.forEach((s) => {
      s.alive = false
    })
    this.active_snake = null
    if (this.map) this.map.destroy()
    if (this.layer) this.layer.destroy()
  }

  createSnake(coords, index) {
    if (coords.length === 0) return 
    return new Snake(coords, index, this.map, this.layer, this)
  }

  getSnake(x, y) {
    let tile = this.getTile(x, y)
    if (tile && tile.index > 1) {
      for (var snake of this.snakes) {
        if (snake.headTile === tile) return snake
      }
    }
  }

  selectSnake(x, y) {
    this.active_snake = this.getSnake(x, y)
  }

  moveSnake(x, y) {
    if (this.active_snake == null) return
    let new_tile = this.getTile(x, y)
    if (this.active_snake && new_tile) {
      this.active_snake.moveTo(new_tile)
    }
  }

  getTile(x, y) {
    x = x - this.offset.x
    y = y - this.offset.y
    return this.map.getTileWorldXY(x, y, this.size, this.size, this.layer)
  }

  getEmptyTiles() {
    let merged = []
    merged = merged.concat.apply(merged, this.layer.layer.data)
    return merged.filter((t) => t.index === 1)
  }

  // update the image and data for a given tile
  updateTile(tile, index=this.active_snake.headTile.index, layer=this.layer) {
    this.map.putTile(index, tile.x, tile.y, layer)
    tile.index = index
  }

  createFood() {
    let options = this.getEmptyTiles()
    let tile = Phaser.ArrayUtils.getRandomItem(options)
    this.updateTile(tile, 5)
  }
}