var bootState = function(game) {

}

var groundCollisionGroup;
var playerCollisionGroup;

bootState.prototype = {

    preload: function() {
        //Inicializa el sistema de f�sicas
        //game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.physics.p2.restitution = 0.8;

        //Collision groups
        //groundCollisionGroup = game.physics.p2.createCollisionGroup();
        //playerCollisionGroup = game.physics.p2.createCollisionGroup();


        //Framerate
        game.time.desiredFps = 60;

        //Gravity
        //game.physics.p2.gravity.x = 0;
        //game.physics.p2.gravity.y = 500;
        //game.physics.arcade.gravity.y = 500;

    },

    create: function() {
        game.state.start("mainMenuState");
    },

    update: function() {

    }
}