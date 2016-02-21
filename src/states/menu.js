export default class Menu {
  create() {
    game.add.image(0,0,`title`)
      game.input.onDown.add(function() {
    	game.state.start('play', true, false);
    }, this)
  }
}