//Initialize the game. new Phaser.Game(xResolution, yResolution, renderingType, HTMLtag, {callbacks}
var gameObjects = [];
var game = new Phaser.Game(1080, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });



