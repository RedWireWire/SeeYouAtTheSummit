var bootState = function(game) {

}

bootState.prototype = {

    preload: function() {
        //Configura phaser
        game.stage.disableVisibilityChange = true;

        
        //Inicializa el sistema de f�sicas
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Framerate
        game.time.desiredFps = 60;
    },

    create: function() {
        game.state.start("mainMenuState");
    },

    update: function() {

    }
}