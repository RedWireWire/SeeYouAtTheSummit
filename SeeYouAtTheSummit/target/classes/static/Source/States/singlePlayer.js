var singlePlayerState = function(game) {

}



singlePlayerState.prototype = {

    preload: function() 
    {
        game.startLoadingScreen();

        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", game.playerUnscaledSpriteWidth, game.playerUnscaledSpriteHeight, 11);
        game.load.image("piece", "Assets/Sprites/Bloque.png");

        game.loadSounds();

        //Initialize a bunch of variables
        //Game state
        this.currentGameState = game.GameStates.PreGame;
        this.loserPlayer = null;
        this.winnerPlayer = null;

        game.initializeBrickSystem(this);

        game.loadBackgrounds();
    },    

    create: function() {
        game.stopLoadingScreen();

        game.setupLevel(this);

        game.initializeBackgrounds(this);

        game.createSounds();

        //Physics initialization
        game.initializePhysicsGroups(this);
        
        //Create the ground
        game.createGround(this);

        //Create the players
        var screenCenterX = gameWidth / 2;
        this.player1 = game.createPlayer(1, screenCenterX , this.ground.y - 100, this.playerPhysicsGroup, true, game.ControlSchemes.NotShared);

        //Player pieces
        game.nextPiece(1, this, this.player1.controlScheme, 
            function(state, piece) { state.player1Piece = piece;}, false, true);
    },

    update: function() {
        
        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.playerPhysicsGroup);
        game.physics.arcade.collide(this.frozenPiecesPhysicsGroup, this.playerPhysicsGroup);

        if (this.currentGameState == game.GameStates.PreGame)
        {
            this.startMatch();
        }
        else 
        {
            //Player input
            game.reactToPlayerInput(this.player1, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);

            game.updatePlayerAnimation(this.player1);

            //Tetris input
            if (this.currentGameState == game.GameStates.GameInProgress)
            {
                if (this.player1Piece) game.directPiece(this.player1Piece, this);

                //this.updateScore();
            }
        
            //Camera control
            game.updateCameraPosition(this, this.player1);

            //Gamestate control
            if (this.currentGameState == game.GameStates.GameInProgress) this.checkForGameEnd();
        }

        if (this.currentGameState == game.GameStates.PlayerLost || this.currentGameState == game.GameStates.Draw)
        {
            this.checkForBackToMenu();
        }
    },

    //TMP
    updateScore: function()
    {
        var newScore = game.world.height - game.camera.y - game.groundHeightInCubes * game.scaledCubeSize;
        newScore = Math.round(newScore / game.scaledCubeSize);
        //console.log(newScore);

        
        var path = "/score";
        var queryData = newScore.toString();
        
        
        //$.post(path, queryData, function() { console.log("yes")});
        
        $.ajax(
            path,
            {
                type: "post",
                data: queryData,
                success: function() { console.log("Success");},
                error: function() { console.log("Error");}
            }
        );

    },


    //////////////
    //GAME STATE//
    //////////////
    startMatch: function()
    {
        this.currentGameState = game.GameStates.GameInProgress;
        calmMusic.stop();
        matchMusic.play();
    },

    checkForGameEnd: function()
    {
        //are the players on screen?
        var player1NotOnScreen = !this.player1.inCamera;

        //If a player is off-screen, are they below the top of the screen?
        var player1Lost = false;
        if (player1NotOnScreen && game.getPlayerScreenTopOvershoot(this.player1) == 0)
        {
            player1Lost = true;
        }
        
        //Check if the game is over, and what the result is
        if (player1Lost) 
        {
            this.currentGameState = game.GameStates.PlayerLost;
            this.loserPlayer = this.player1;
            game.announce("That one's completely on you.");
            game.sfxLose.play();
        }
    },



    checkForBackToMenu: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC) || game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            game.state.start("mainMenuState");
        }
    }
}