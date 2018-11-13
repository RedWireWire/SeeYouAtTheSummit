var gameWidth = 1280;
var gameHeight  = 720;


var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '')
  
//Estados del juego
game.state.add('bootState', bootState);
game.state.add("mainMenuState", mainMenuState);
game.state.add("matchMakingState", matchMakingState);
game.state.add("localMultiplayerState", localMultiplayerState);
game.state.add("onlineMultiplayerState", onlineMultiplayerState);
  
game.state.start('bootState');
