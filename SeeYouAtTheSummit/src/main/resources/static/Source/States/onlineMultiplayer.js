var onlineMultiplayerState = function(game) {

}

onlineMultiplayerState.prototype = {

    GameStates: {
        PreGame : 0,
        GameInProgress : 1,
        PlayerWon : 2,
        PlayerLost : 3,
        Draw : 4,
        WaitingForRematch: 5,
        Abandoned: 6
    },

    //Initialization
    preload: function() 
    {
        game.startLoadingScreen();

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
        game.stopLoadingScreen();
        
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
        this.controlledPlayer.isDead = false;

        //The number that isn't the player's
        var opponentNumber = (this.controlledPlayerNumber == 1) ? 2 : 1;
        this.onlineSyncedPlayer = game.createPlayer(opponentNumber,
            (opponentNumber == 1) ? player1x : player2x,
            this.ground.y - 100,
            this.playerPhysicsGroup,
            false
        );
        this.onlineSyncedPlayer.playerNumber = opponentNumber;
        this.onlineSyncedPlayer.isDead = false;
        this.initializeOpponentTetrisUpdateBuffer();

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
            this.processOpponentTetrisUpdates(this.opponentTetrisUpdateBuffer);

            //Camera control
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);

            //Gamestate control
            this.checkForPlayerDeath();
            this.checkForGameEnd(this.controlledPlayer, this.onlineSyncedPlayer);
        }
        //Game end
        else if (this.currentGameState == this.GameStates.PlayerLost || this.currentGameState == this.GameStates.Draw || this.currentGameState == this.GameStates.PlayerWon)
        {
            this.serverUpdate(this.controlledPlayer);
            this.checkForBackToMenuOrRematch();
            this.pollForRematch();
        }
        //Waiting for rematch
        else if (this.currentGameState == this.GameStates.WaitingForRematch)
        {
            this.serverUpdate(this.controlledPlayer);
            this.checkForBackToMenuOnly();
            this.pollForRematch();
        }
        //Left alone
        else if (this.currentGameState == this.GameStates.Abandoned)
        {
            this.checkForBackToMenuOnly();
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
            animationCode: player.animationCode,
            isDead: player.isDead
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
     
        if (opponent)
        {
            opponent.x = opponentUpdate.x;
            opponent.y = opponentUpdate.y;
            opponent.animationCode = opponentUpdate.animationCode;
            game.updatePlayerAnimation(opponent);

            opponent.isDead = opponentUpdate.isDead;
        }
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
                //dataType: "json",
                processData: false,
                headers:
                {
                    "Content-Type": "application/json"
                },
                
                //success: function(data) { console.log("Sent " + data.actionCode);},
                error: function() {
                    $.ajax(this);
                    console.log("Retrying");
                }
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
                },
                error: function() {
                    $.ajax(this);
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
                },
                error: function() {
                    $.ajax(this);
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

                success: this.bufferOpponentTetrisUpdate
            }
        )
    },

    initializeOpponentTetrisUpdateBuffer: function(piece)
    {
        this.opponentTetrisUpdateBuffer = new Array();
    },

    bufferOpponentTetrisUpdate: function(update)
    {
        var buffer = game.state.getCurrentState().opponentTetrisUpdateBuffer;

        buffer.push(update);
        
        //Comentado para mejorar la latencia. Si ocurren problemas de orden de comandos, esto puede descomentarse.
        //Ordena los comandos en función de su timeStamp
        /*
        buffer.sort(function(a, b) {
            return a.timeStamp - b.timeStamp;
        })
        */
    },

    processOpponentTetrisUpdates: function(buffer)
    {
        var piece;
        //Process every buffered update
        for (let i = 0; i < buffer.length; i++)
        {
            piece = this.onlineSyncedPiece;
            //Unbuffers the update
            var update = buffer.shift();

            if (update.actionCode != "NULL") console.log("Processing " + update.actionCode);
        
            switch (update.actionCode)
            {
                case "NULL":
                    break;

                case "CREATE":
                    game.createPiece(update.shape, update.xPosition, update.yPosition, update.playerId, 
                        game.state.getCurrentState().piecePhysicsGroup, null, 
                        function(state, piece) {state.onlineSyncedPiece = piece;}, false);
                    break;

                case "ROTATE":
                    game.rotatePiece(piece);
                    break;

                case "RIGHT":
                    game.movePiece(piece, 1);
                    break;

                case "LEFT":
                    game.movePiece(piece, -1);
                    break;
                
                case "DOWN":
                    var state = game.state.getCurrentState();
                    game.lowerPiece(piece, state);
                    break;

                case "FREEZE":
                    var state = game.state.getCurrentState();
                    game.freezePiece(piece, state);
                    break;
            }
        }
        
    },

    //////////////
    //GAME STATE//
    //////////////
    checkForPlayerDeath: function()
    {
        //Is the local player onscreen?
        var localPlayerNotOnScreen = !this.controlledPlayer.inCamera;
        

        //If a player is off-screen, are they below the top of the screen?
        var localPlayerLost = false;
        if (localPlayerNotOnScreen && game.getPlayerScreenTopOvershoot(this.controlledPlayer) == 0)
        {
            this.controlledPlayer.isDead = true;
        }
    },

    checkForGameEnd: function(localPlayer, onlinePlayer)
    {
        if (localPlayer.isDead)
        {
            if (onlinePlayer.isDead)
            {
                this.currentGameState = this.GameStates.Draw;
                game.announce("Everybody loses.");
            }
            else
            {
                this.currentGameState = this.GameStates.PlayerLost;
                game.announce("Only you lose.");
            }
        }
        else if (onlinePlayer.isDead)
        {
            this.currentGameState = this.GameStates.PlayerWon;
            game.announce("Everybody but you loses.");
        }
    },

    //After the game
    checkForBackToMenuOrRematch: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC))
        {
            this.goBackToMainMenu();
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            $.ajax(
                "/rematch",
                {
                    method:"POST",
                    data: JSON.stringify(
                        {
                            matchId: matchId,
                            playerId: playerId
                        }
                    ),
                    processData: false,
                    headers:{
                        "Content-Type": "application/json"
                    },

                    success: this.startWaitingForRematch
                }
            )
        }
    },

    checkForBackToMenuOnly: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC))
        {
            this.goBackToMainMenu();
        }
    },

    startWaitingForRematch: function()
    {
        var state = game.state.getCurrentState();

        state.currentGameState = state.GameStates.WaitingForRematch;

        game.announce("You can't have enough");
    },

    goBackToMainMenu: function()
    {
        $.ajax(
            "/match",
            {
                method: "DELETE",
                data: JSON.stringify(
                    {
                        matchId: matchId,
                        playerId: playerId
                    }
                ),
                processData: false,
                headers:{
                    "Content-Type": "application/json"
                }
            }
        );

        game.state.start("mainMenuState");
    },


    pollForRematch: function()
    {
        $.ajax(
            "/rematch",
            {
                method: "PUT",
                data: JSON.stringify({
                    matchId: matchId,
                    playerId: playerId
                }),
                processData: false,
                headers:{
                    "Content-Type": "application/json"
                },
                success: this.processRematchResponse
            }
        )
    },

    processRematchResponse: function(response)
    {
        var state = game.state.getCurrentState();

        if (response == -1)
        {
            state.startAbandonedState();
        }
        else if (response == 1)
        {
            game.state.start("onlineMultiplayerState");
        }
    },

    startAbandonedState: function()
    {
        this.currentGameState = this.GameStates.Abandoned;
        game.announce("You were abandoned");
    }
}