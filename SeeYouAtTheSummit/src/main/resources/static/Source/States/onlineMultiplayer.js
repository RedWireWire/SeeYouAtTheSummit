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

    //Initialization
    preload: function() 
    {
        this.isInAcceptance = false;
        this.controlledPlayerNumber = playerId;

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
            true, 
            game.ControlSchemes.NotShared
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
        
        //Player piece
        game.nextPiece(this.controlledPlayerNumber, this, this.controlledPlayer.controlScheme, 
            function(state, piece) { state.controlledPiece = piece; state.postTetrisCreate(piece)}, true);
    },

    update: function() {
        
        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.controlledPlayer);
        game.physics.arcade.collide(this.frozenPiecesPhysicsGroup, this.controlledPlayer);

        //Pregame state
        if (this.currentGameState == this.GameStates.PreGame)
        {
            this.isInAcceptance = true;
            $.ajax(
                "/acceptance/" + matchId,
                {
                    method: "PUT",
                    data: JSON.stringify({
                        playerId: playerId,
                        isInAcceptance: this.isInAcceptance
                    }),
                    processData: false,
                    headers: {
                        "Content-Type": "application/json"
                    },

                    success: function(goTime) { if (goTime) game.state.getCurrentState().startMatch();}
                }
            )

        }
        //Gameplay state
        else if (this.currentGameState == this.GameStates.GameInProgress)
        {
            //Player movement
            game.reactToPlayerInput(this.controlledPlayer, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);
            game.updatePlayerAnimation(this.controlledPlayer);

            //Tetris input
            if (this.controlledPiece) game.directPiece(this.controlledPiece, this);            
        
            //Server syncing. Handles opponent syncing too.
            this.serverUpdate(this.controlledPlayer);
            this.pollOpponentTetrisAction();

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


    //State management
    startMatch: function()
    {
        this.currentGameState = this.GameStates.GameInProgress;
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



    //Server operations
    serverUpdate: function(player)
    {
        var object = {
            playerId: player.playerId,
            x: player.x,
            y: player.y,
            animationCode: player.animationCode
        }

        $.ajax(
            "/playerupdate/" + matchId,
            {
                method: "PUT",
                data: JSON.stringify(object),
                processData: false,

                headers: {
                    "Content-Type": "application/json"
                },

                success: this.updateOpponent
            }
        )
    },

    updateOpponent: function(opponentUpdate)
    {
        var state = game.state.getCurrentState();
        var opponent = state.onlineSyncedPlayer;
        
        opponent.x = opponentUpdate.x;
        opponent.y = opponentUpdate.y;
        opponent.animationCode = opponentUpdate.animationCode;
        game.updatePlayerAnimation(opponent);
    },

    postTetrisCreate: function(piece)
    {
        var tetrisUpdate = JSON.stringify({
            playerId: piece.playerNumber,
            timeStamp: game.time.now,
            actionCode: "CREATE",

            xPosition: piece.spawnX,
            yPosition: piece.spawnY,
            shape: piece.shape
        });
        var path = "/tetrisupdate/" + matchId;

        console.log("Sending CREATE");

        $.ajax(
            path,
            {
                method: "POST",
                data: tetrisUpdate,
                processData: false,
                headers: {
                    "Content-Type": "application/json"
                },

                //Retry if the server didn't recive the update.
                error: function() {
                    $.ajax(this);
                }
            }
        )
    },

    postTetrisMove: function(piece, direction)
    {
        console.log("Sending " + direction);

        var path = "tetrisupdate/" + matchId;
        var sentData = JSON.stringify(
            {
                playerId: piece.playerNumber,
                timeStamp: game.time.now,
                actionCode: direction,
                xPosition: 0,
                yPosition: 0,
                shape: 0
            }
        )

        $.ajax(
            path, 
            {
                method: "POST",
                data: sentData,
                dataType: "json",
                processData: false,
                headers:
                {
                    "Content-Type": "application/json"
                },
                
                //success: function(data) { console.log("Sent " + data.actionCode);},
                //error: function(){ $.ajax(this); } 
            }
        )
    },

    postTetrisRotate: function()
    {
        var update = {
            playerId: this.controlledPlayer.playerNumber,
            timeStamp: game.time.now,
            actionCode: "ROTATE"
        }

        console.log("Sending ROTATE");

        $.ajax(
            "tetrisupdate/" + matchId,
            {
                method: "POST",
                data: JSON.stringify(update),
                processData: false,
                headers:
                {
                    "Content-Type": "application/json"
                }
            }
        )
    },

    postTetrisFreeze: function()
    {
        var update = {
            playerId: this.controlledPlayer.playerNumber,
            timeStamp: game.time.now,
            actionCode: "FREEZE"
        }

        console.log("Sending FREEZE");
        $.ajax(
            "tetrisupdate/" + matchId,
            {
                method: "POST",
                data: JSON.stringify(update),
                processData: false,
                headers:
                {
                    "Content-Type": "application/json"
                }
            }
        )
    },

    pollOpponentTetrisAction: function()
    {
        var sentData = JSON.stringify({ id: playerId});
        $.ajax(
            "/tetrisupdate/" + matchId,
            {
                method: "PUT",
                data: sentData,
                processData: false,
                headers:
                {
                    "Content-Type": "application/json"
                },

                success: this.processOpponentTetrisUpdate
            }
        )
    },

    processOpponentTetrisUpdate: function(update)
    {
        if (update.actionCode != "NULL") console.log("Processing " + update.actionCode);
        
        switch (update.actionCode)
        {
            case "NULL":
                return;

            case "CREATE":
                game.createPiece(update.shape, update.xPosition, update.yPosition, update.playerId, 
                    game.state.getCurrentState().piecePhysicsGroup, null, 
                    function(state, piece) {state.onlineSyncedPiece = piece;}, false);
                break;

            case "ROTATE":
                game.rotatePiece(game.state.getCurrentState().onlineSyncedPiece);
                break;

            case "RIGHT":
                game.movePiece(game.state.getCurrentState().onlineSyncedPiece, 1);
                break;

            case "LEFT":
                game.movePiece(game.state.getCurrentState().onlineSyncedPiece, -1);
                break;
            
            case "DOWN":
                var state = game.state.getCurrentState();
                game.lowerPiece(state.onlineSyncedPiece, state);
                break;

            case "FREEZE":
                var state = game.state.getCurrentState();
                game.freezePiece(state.onlineSyncedPiece, state);
                break;
        }
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
                message = "Everybody but you loses."
                break;
            case this.GameStates.Draw:
                message = "Everybody loses."
                break;
        }

        //Show it
        var announcementText = game.add.text(gameWidth / 2 - 100, gameHeight / 2, message, style);
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