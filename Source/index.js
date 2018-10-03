var game = new Phaser.Game(800, 600, Phaser.AUTO, '')
  
//Estados del juego
game.state.add('bootState', bootState);
game.state.add("mainMenuState", mainMenuState);
game.state.add("platformGameplayState", platformGameplayState);
  
game.state.start('bootState');
