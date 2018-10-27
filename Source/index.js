var gameWidth = 1280;
var gameHeight  = 720;


var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '')
  
//Estados del juego
game.state.add('bootState', bootState);
game.state.add("mainMenuState", mainMenuState);
game.state.add("platformGameplayState", platformGameplayState);
//game.state.add("platformPiezasState", platformPiezasState);
  
game.state.start('bootState');
