export default class Snake  {
  constructor(coords, index, map, layer, grid)  {
    this.map = map
    this.index = index
    this.layer = layer
    this.grid = grid
    this.alive = true
    
    // lookup table for frames of various body parts    
    this.indexes = {
      head: this.index+1,
      straight: this.index+2,
      bent: this.index+3,
      tail: this.index+4
    }
    
    // create an tile for each coord in the array, and store within arr
    this.segments = coords.map((c) => {
      return map.getTile(c[0], c[1], layer)
    })

    // add getters for head/tail tiles
    let headTile = { get: () => this.segments[0] }
    Object.defineProperty(this, 'headTile', headTile)
    let tailTile = { get: () => this.segments[this.segments.length-1] }
    Object.defineProperty(this, 'tailTile', tailTile)

    this.segments[0].sorted = true
    
    let counter = 0
    let segs = this.segments

  while (!segs.every((s) => s.sorted )) {
    // split segments into sorted and unsorted
    let sorted = segs.filter((s) => s.sorted)
    let unsorted = segs.filter((s) => !s.sorted)

    // get the last sorted segment and its neighbours
    let last_sorted = sorted[sorted.length-1]
    if (!last_sorted) return

    // get all neighbours of the last sorted elemnt
    let neighbours = this.getSnakeNeighbours(last_sorted, false)

    // initialize or load its array of attempted neighbours
    last_sorted.attempted = last_sorted.attempted || [0]

    // try the first neighbour/ next if last time failed to use all segs
    let next_index = last_sorted.attempted[last_sorted.attempted.length-1]
    
    // and get the unsorted neighbour
    let next_unsorted = neighbours.filter((s) => !s.sorted)[next_index]

    // if there is no unsorted neighbour is there are still segs to sort
    // we need to bail out and try a different neighbour on the next run
    if (!next_unsorted) {
      
      // reset all the sort data
      sorted.forEach((s) => s.sorted = false)
      
      // except for the head (it's always unshifted into the segment data)
      sorted[0].sorted = true
      
      // add the last attempted neighbour to the blacklast
      if (!(next_index > neighbours.length-1)) {
        last_sorted.attempted.push(next_index+1)
      }

      // put the array back together
      this.segments = sorted.concat(unsorted)

      let tile = segs.splice(segs.indexOf(last_sorted), 1)
      this.grid.updateTile(tile, 1)

      continue
    }

    // otherwise, pop out the first unsorted neighbour
    // and place it after the last sorted neighbour
    unsorted.splice(unsorted.indexOf(next_unsorted), 1)
    sorted.push(next_unsorted)
    next_unsorted.sorted = true

    // merge em back together and try again
    segs = sorted.concat(unsorted)
  }

    this.segments = segs

    // draw the initial state of the snakes
    this.update()
  }

  moveTo(new_tile) {
    let n = (this.indexes['head']-13)/4
    if (new_tile === this.headTile) return
    let is_edible = new_tile.index === game.edible_types['cake'] || new_tile.index === game.edible_types['broc'] || new_tile.index < 5
    if (!is_edible && new_tile.index > game.edible_types['cake']) {
      is_edible = this.indexes['head'] === (new_tile.index + (((4 * n) + 6) -n))
    }

    if (this.headTile === new_tile || !is_edible) return

    let new_tile_is_adjacent = this.getNeighbours().some((neighbour) => {
      return neighbour === new_tile
    })

    if (new_tile_is_adjacent) this.doMove(new_tile)
  }

  doMove(new_tile) {
    let shrinking = new_tile.index === 5
    let growing = new_tile.index > 5 && new_tile.index < 12
    // Add new_tile to head of snake
    this.segments.unshift(new_tile)
    this.grid.updateTile(new_tile, this.indexes.head)

    // clear the tail if we arent growing
    if (!growing) {
      this.clearTail()
    } else {
      game.increaseScore(game.edible_types.cake, new_tile.worldX, new_tile.worldY)
    }
    
    // clear again if we are shrinking
    if (shrinking) {
      this.clearTail()
      game.increaseScore(game.edible_types.broc, new_tile.worldX, new_tile.worldY)
    }

      
    if (this.segments.length < 2) {
      game.triggerSnakeKilled()
      this.destroy()
    }

    this.update(new_tile)
  }

  destroy(){
    this.alive = false
    this.clearTail()
    this.grid.active_snake = null
  }

  getNeighbours(tile=this.headTile) {
    if(!this.map.layers.length>0) return
    let output = [
      this.map.getTileAbove(0, tile.x, tile.y),
      this.map.getTileBelow(0, tile.x, tile.y),
      this.map.getTileLeft(0, tile.x, tile.y),
      this.map.getTileRight(0, tile.x, tile.y)
    ]
    output = output.filter((n) => n!=null)
    return output
  }

  getDirection(tile, other_tile=this.segments[1], invert=false) {
    let output
    if(!this.map.layers.length>0) return
    let thing = {
      above: this.map.getTileAbove(0, other_tile.x, other_tile.y),
      below: this.map.getTileBelow(0, other_tile.x, other_tile.y),
      left: this.map.getTileLeft(0, other_tile.x, other_tile.y),
      right: this.map.getTileRight(0, other_tile.x, other_tile.y)
    }
    for (var dir in thing) {
      if (!dir) return 
      if (thing[dir] === tile) output = dir
    }
    if (invert) return this.invertDirection(output)
    return output
  }

  rotateTile(dir, tile) {
    tile.rotation = (dir === 'above' || dir === 'below') ? 1.58 : 0
    tile.flipped = (dir === 'below' || dir === 'right')
  }

  hasNeighbours(neighbours, dir1, dir2){
    return neighbours.indexOf(dir1) !== -1 && neighbours.indexOf(dir2) !== -1
  }

  getSnakeNeighbours(tile=this.headTile, ignoreHead=true) {
    let neighbours = this.getNeighbours(tile)
    if (!neighbours) return
    return neighbours.filter((n) => {
      // first get the neighbours that are part of the snake
      let output = Object.keys(this.indexes).some((i) => n.index === this.indexes[i])
      return output
    })
  }

  getConnectedSnakeNeighbours(tile=this.headTile, ignoreHead=true) {
    let index = this.segments.indexOf(tile)
    let neighbours = [
      this.segments[index-1],
      this.segments[index+1]
    ]
    return neighbours.filter((segment) => segment != null)
  }

  invertDirection(dir) {
    if (dir=='left') return 'right'
    if (dir=='right') return 'left'
    if (dir=='above') return 'below'
    if (dir=='below') return 'above'
  }
  
  update(new_tile) {
    let prev_tile
    if (!this.alive) return

    this.segments.forEach((s) => {

      // get all the neighbours
      let neighbours = this.getConnectedSnakeNeighbours(s)

      // convert the tiles to relative direction strings
      neighbours = neighbours.map((n) => {
        return this.getDirection(s, n, true)
      })

      // if this isnt the head, rotate this tile the same as the part that came before it
      if (prev_tile) {
        let direction = this.getDirection(prev_tile, s)
        this.rotateTile(direction, s)
      }
      prev_tile = s

      // set all parts to be bent first
      this.grid.updateTile(s, this.indexes.bent)
      
      // find all the parts that should be straight
      if (neighbours.length == 2) {
        if ((this.hasNeighbours(neighbours, 'above', 'below') || this.hasNeighbours(neighbours, 'left', 'right')))
          this.grid.updateTile(s, this.indexes.straight)
      }

      // determine rotation for each part based on the direction of its neighbours
      if (this.hasNeighbours(neighbours, 'above', 'right')) {
        this.rotateTile('right',s)
      }
      if (this.hasNeighbours(neighbours, 'above', 'left')) {
        this.rotateTile('left',s)
      }
      if (this.hasNeighbours(neighbours, 'below', 'right')) {
        this.rotateTile('below',s)
      }
      if (this.hasNeighbours(neighbours, 'below', 'left')) {
        s.rotation = (1.573*2)
        s.flipped = true
      }
    })

    // direction of new tile relative to head
    if (!new_tile) {
      let neighbours = this.getSnakeNeighbours()
      let directions = neighbours.map((n) => {
        return this.getDirection(this.headTile, n, true)
      })
      let dir = this.invertDirection(directions[0])
      this.rotateTile(dir, this.headTile)
    } else {
      var dir = this.getDirection(new_tile)
      this.rotateTile(dir, this.headTile)
    }

    // ensure that the headtile and tailtile have the correct sprite
    this.grid.updateTile(this.headTile, this.indexes.head)
    this.grid.updateTile(this.tailTile, this.indexes.tail)
  }

  clearTail() {
    let tail_tile = this.segments.pop()
    this.grid.updateTile(tail_tile, 1)
  }
}