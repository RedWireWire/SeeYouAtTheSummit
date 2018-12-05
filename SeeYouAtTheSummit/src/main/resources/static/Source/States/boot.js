var bootState = function(game) {

}

var debugMode = false;

bootState.prototype = {

    preload: function() {
        game.loadLoadingScreen();
        
        if (debugMode)
        {
            game.autoDescendTime = 800000;
            game.cameraAutoScrollSpeed = 0;
        }

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