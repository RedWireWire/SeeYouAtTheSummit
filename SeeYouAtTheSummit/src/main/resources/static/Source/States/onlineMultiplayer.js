var onlineMultiplayerState = function(game) {

}

onlineMultiplayerState.prototype = {

    GameStates: {
        PreGame : 0,
        GameInProgress : 1,
        PlayerWon : 2,
        PlayerLost : 3,
        Draw : 4
    },

    //This identifier will be provided by the server
    controlledPlayerNumber: 1,

    //Initialization
    preload: function() 
    {
        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", game.playerUnscaledSpriteWidth, game.playerUnscaledSpriteHeight, 10);
        game.load.image("piece", "Assets/Sprites/Bloque.png");

        //Initialize a bunch of variables
        //Game state
        this.currentGameState = this.GameStates.PreGame;

        game.initializeBrickSystem(this);

        game.loadBackgrounds();
    },    


    create: function() {
        game.setupLevel(this);

        game.initializeBackgrounds(this);

        //Physics initialization
        game.initializePhysicsGroups(this);
        
        //Create the ground
        game.createGround(this);

        //Create the players
        var screenCenterX = gameWidth / 2;
        var playerSpawnDistanceFromCenterX = gameWidth / game.playerSpawnDistanceFromCenterXFraction;
        var player1x = screenCenterX - playerSpawnDistanceFromCenterX;
        var player2x = screenCenterX + playerSpawnDistanceFromCenterX;

        this.controlledPlayer = game.createPlayer(this.controlledPlayerNumber, 
            (this.controlledPlayerNumber == 1) ? player1x : player2x,
            this.ground.y - 100,
            this.playerPhysicsGroup,
            true
        );
        this.controlledPlayer.playerNumber = this.controlledPlayerNumber;

        //The number that isn't the player's
        var opponentNumber = (this.controlledPlayerNumber == 1) ? 2 : 1;
        this.onlineSyncedPlayer = game.createPlayer(opponentNumber,
            (opponentNumber == 1) ? player1x : player2x,
            this.ground.y - 100,
            this.playerPhysicsGroup,
            false
        );
        this.onlineSyncedPlayer.playerNumber = opponentNumber;

        //Player pieces
        game.nextPiece(this.controlledPlayerNumber, this);
    },

    update: function() {
        
        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.controlledPlayer);
        game.physics.arcade.collide(this.frozenPiecesPhysicsGroup, this.controlledPlayer);

        //Pregame state
        if (this.currentGameState == this.GameStates.PreGame)
        {
            this.currentGameState = this.GameStates.GameInProgress;
        }
        //Gameplay state
        else 
        {
            //Player movement
            game.reactToPlayerInput(this.controlledPlayer, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);
            game.updatePlayerAnimation(this.controlledPlayer);

            game.updatePlayerAnimation(this.onlineSyncedPlayer);

            
            //Tetris input
            if (this.currentGameState == this.GameStates.GameInProgress)
            {
                if (this.player1Piece) game.directPiece(this.player1Piece, this);
            }
        
            //Camera control
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);

            //Gamestate control
            if (this.currentGameState == this.GameStates.GameInProgress) this.checkForGameEnd();
        }

        //Game end
        if (this.currentGameState == this.GameStates.PlayerLost || this.currentGameState == this.GameStates.Draw || this.currentGameState == this.GameStates.PlayerWon)
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
        
        /*
        var data = newScore;
        $.post(path, 0, function()
        {
            console.log("Done, I think");
        })
        */


    },


    //////////////
    //GAME STATE//
    //////////////
    checkForGameEnd: function()
    {
        //are the players on screen?
        var localPlayerNotOnScreen = !this.controlledPlayer.inCamera;
        var onlineSyncedPlayerNotOnScreen= !this.onlineSyncedPlayer.inCamera;

        //If a player is off-screen, are they below the top of the screen?
        var localPlayerLost = false;
        if (localPlayerNotOnScreen && game.getPlayerScreenTopOvershoot(this.controlledPlayer) == 0)
        {
            localPlayerLost = true;
        }

        var onlineSyncedPlayerLost = false;
        if (onlineSyncedPlayerNotOnScreen && game.getPlayerScreenTopOvershoot(this.onlineSyncedPlayer) == 0)
        {
            onlineSyncedPlayerLost = true;
        }
        
        //Check if the game is over, and what the result is
        if (localPlayerLost && !onlineSyncedPlayerLost) 
        {
            this.currentGameState = this.GameStates.PlayerLost;
            this.announceGameEnd();
        }
        else if (onlineSyncedPlayerLost && !localPlayerLost)
        {
            this.currentGameState = this.GameStates.PlayerWon;
            this.announceGameEnd();
        }
        else if (localPlayerLost && onlineSyncedPlayerLost)
        {
            this.currentGameState = this.GameStates.Draw;
            this.announceGameEnd();
        }
    },

    announceGameEnd: function()
    {
        //Message setup
        var style = { font: "65px Arial", fill: "#DF4BB3", align: "center" };
        var message = "";

        //Write the message string
        switch (this.currentGameState)
        {
            case this.GameStates.PlayerLost:
                message = "Only you lose.";
                break;
            case this.GameStates.PlayerWon:
                message = "Everbody but you loses."
                break;
            case this.GameStates.Draw:
                message = "Everybody loses."
                break;
        }

        //Show it
        var announcementText = game.add.text(gameWidth / 2, gameHeight / 2, message, style);
        console.log(message);
        announcementText.fixedToCamera = true;
    },

    
    checkForBackToMenu: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC) || game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            game.state.start("mainMenuState");
        }
    }
}