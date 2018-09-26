function create() {
   
    //Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.time.desiredFps = 60;
    this.physics.arcade.gravity.y = 1000;

    //Background
    this.stage.backgroundColor = "#333333";

    //Create the player
    player = new PlayerAvatar();
    gameObjects.push(player);
}
