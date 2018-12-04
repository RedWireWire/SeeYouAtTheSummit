var onlineMultiplayerState = function(game) {

}

var doMovementPrediction = true;
var predictedMomentumFactor = 0.6;

onlineMultiplayerState.prototype = {
    //////////////////
    //Initialization//
    //////////////////
    preload: function() 
    {
        game.startLoadingScreen();

        webSocketSession.onmessage = this.processWebSocketMessage;

        this.isInAcceptance = false;
        this.controlledPlayerNumber = playerId;

        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", game.playerUnscaledSpriteWidth, game.playerUnscaledSpriteHeight, 11);
        game.load.image("piece", "Assets/Sprites/Bloque.png");

        //Initialize a bunch of variables
        //Game state
        this.currentGameState = game.GameStates.PreGame;

        game.initializeBrickSystem(this);

        game.loadBackgrounds();

        this.timeStamp = 0;
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
        this.onlineSyncedPlayer.lastUpdate = null;
        this.onlineSyncedPlayer.previousUpdate = null;
        this.onlineSyncedPlayer.predictedSpeedPerFrame = null;
        
        this.initializeOpponentTetrisUpdateBuffer();
    },

    initializeOpponentTetrisUpdateBuffer: function(piece)
    {
        this.opponentTetrisUpdateBuffer = new Array();
    },

    ////////////
    //Gameplay//
    ////////////
    startMatch: function()
    {
        this.currentGameState = game.GameStates.GameInProgress;
        //Player piece
        game.nextPiece(this.controlledPlayerNumber, this, this.controlledPlayer.controlScheme, 
            function(state, piece) { state.controlledPiece = piece; state.postTetrisCreate(piece)}, true);
    },

    update: function() {
        
        this.timeStamp += game.time.physicsElapsedMS;
        

        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.controlledPlayer);
        game.physics.arcade.collide(this.frozenPiecesPhysicsGroup, this.controlledPlayer);

        //Pregame state
        if (this.currentGameState == game.GameStates.PreGame)
        {
            //Move player
            game.reactToPlayerInput(this.controlledPlayer, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);
            game.updatePlayerAnimation(this.controlledPlayer);
            
            //Move opponent
            this.sendPlayerUpdate(this.controlledPlayer);
            this.updateOpponent(this.onlineSyncedPlayer);

            //Check acceptance
            this.sendAcceptance(this.controlledPlayer.isInAcceptance);

        }
        //Gameplay state
        else if (this.currentGameState == game.GameStates.GameInProgress)
        {
            //Player movement
            game.reactToPlayerInput(this.controlledPlayer, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);
            game.updatePlayerAnimation(this.controlledPlayer);

            //Tetris input
            if (this.controlledPiece) game.directPiece(this.controlledPiece, this);            
        
            //Server syncing.
            this.sendPlayerUpdate(this.controlledPlayer);
            this.updateOpponent(this.onlineSyncedPlayer);
            this.processOpponentTetrisUpdates(this.opponentTetrisUpdateBuffer);

            //Camera control
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);

            //Gamestate control
            this.checkForPlayerDeath();
            this.checkForGameEnd(this.controlledPlayer, this.onlineSyncedPlayer);
        }
        //Game end
        else if (this.currentGameState == game.GameStates.PlayerLost || this.currentGameState == game.GameStates.Draw || this.currentGameState == game.GameStates.PlayerWon)
        {
            this.sendPlayerUpdate(this.controlledPlayer);
            this.checkForBackToMenuOnly();
            //this.checkForBackToMenuOrRematch();
            //this.pollForRematch();
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);
        }
        //Waiting for rematch
        else if (this.currentGameState == game.GameStates.WaitingForRematch)
        {
            this.sendPlayerUpdate(this.controlledPlayer);
            this.checkForBackToMenuOnly();
            this.pollForRematch();
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);
        }
        //Left alone
        else if (this.currentGameState == game.GameStates.Abandoned)
        {
            this.checkForBackToMenuOnly();
            game.updateCameraPosition(this, this.controlledPlayer, this.onlineSyncedPlayer);
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

    //////////////////////////////
    //Web socket send operations//
    //////////////////////////////
    sendAcceptance: function(isInAcceptance)
    {
        if (webSocketSession.readyState != 1) return;
        var payload = {
            operationCode: "ACCEPTANCE",
            
            isInAcceptance: isInAcceptance
        };

        webSocketSession.send(JSON.stringify(payload));
    },

    sendPlayerUpdate: function(player)
    {
        if (webSocketSession.readyState != 1) return;
        var payload = {
            operationCode: "PLAYER_UPDATE",

            x: player.x,
            y: player.y,
            animationCode: player.animationCode,
            isDead: player.isDead,
            timeStamp: this.timeStamp
        };

        webSocketSession.send(JSON.stringify(payload));
    },

    postTetrisCreate: function(piece)
    {
        if (webSocketSession.readyState != 1) return;

        var tetrisUpdate = JSON.stringify({
            operationCode: "TETRIS_UPDATE",
            
            timeStamp: this.timeStamp,
            actionCode: "CREATE",

            xPosition: piece.spawnX,
            yPosition: piece.spawnY,
            shape: piece.shape
        });
        
        webSocketSession.send(tetrisUpdate);
    },

    postTetrisMove: function(piece, direction)
    {
        if (webSocketSession.readyState != 1) return;
        
        var sentData = JSON.stringify(
            {
                operationCode: "TETRIS_UPDATE",

                timeStamp: this.timeStamp,
                actionCode: direction,
                xPosition: 0,
                yPosition: 0,
                shape: 0
            }
        )

        webSocketSession.send(sentData);
    },

    postTetrisRotate: function()
    {
        if (webSocketSession.readyState != 1) return;
        
        var update = {
            operationCode: "TETRIS_UPDATE",

            timeStamp: this.timeStamp,
            actionCode: "ROTATE",
            xPosition: 0,
            yPosition: 0,
            shape: 0
        };
        webSocketSession.send(JSON.stringify(update));
    },

    postTetrisFreeze: function()
    {
        if (webSocketSession.readyState != 1) return;
        
        var update = {
            operationCode: "TETRIS_UPDATE",

            timeStamp: this.timeStamp,
            actionCode: "FREEZE",
            xPosition: 0,
            yPosition: 0,
            shape: 0
        }

        webSocketSession.send(JSON.stringify(update));
    },

    /////////////////////////////////
    //Web socket recieve operations//
    /////////////////////////////////
    processWebSocketMessage: function(message)
    {
        var parsedMessage = JSON.parse(message.data);
        var state = game.state.getCurrentState();
        switch(parsedMessage.operationCode)
        {
            case "START_MATCH":
                state.startMatch();
                break;
            case "OPPONENT_UPDATE":
                if (state.onlineSyncedPlayer != null) 
                {
                    state.saveOpponentUpdate(parsedMessage);
                }
                break;
            case "TETRIS_UPDATE":
                state.bufferOpponentTetrisUpdate(parsedMessage);
                break;
        }
    },

    saveOpponentUpdate: function(update)
    {
        var opponent = game.state.getCurrentState().onlineSyncedPlayer;

        //Save the update if it's more recent than what we already have
        if ((opponent.lastUpdate != null && opponent.lastUpdate.timeStamp >= update.timeStamp) ||
        (opponent.previousUpdate != null && opponent.previousUpdate.timeStamp >= update.timeStamp))
        {
            console.log("Bad timeStamp");
            return;
        }

        opponent.previousUpdate = opponent.lastUpdate;
        opponent.lastUpdate = update;

        if (doMovementPrediction)
        {
            //Predict the speed, provided we have two updates.
            if (opponent.lastUpdate == null || opponent.previousUpdate == null) return;
            var timeBetweenUpdates = opponent.lastUpdate.timeStamp - opponent.previousUpdate.timeStamp;
            var movementVector = {
                x: opponent.lastUpdate.x - opponent.previousUpdate.x,
                y: opponent.lastUpdate.y - opponent.previousUpdate.y
            }

            var timePerFrame = (1 / game.time.desiredFps) * 1000;

            movementVector.x = (movementVector.x / timeBetweenUpdates) * timePerFrame;
            movementVector.y = (movementVector.y / timeBetweenUpdates) * timePerFrame;

            opponent.predictedSpeedPerFrame = movementVector;
        }
        else
        {
            opponent.predictedSpeedPerFrame = {
                x: 0,
                y: 0
            }
        }
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

    //////////////////////////////////////////////
    //Processing of buffered received operations//
    //////////////////////////////////////////////
    updateOpponent: function(opponent)
    {
        //There is an update we haven't processed yet
        if (opponent.lastUpdate != null)
        {
            //Process it
            opponent.x = opponent.lastUpdate.x;
            opponent.y = opponent.lastUpdate.y;
            opponent.animationCode = opponent.lastUpdate.animationCode;
            game.updatePlayerAnimation(opponent);
            opponent.isDead = opponent.lastUpdate.isDead;

            //Mark it as processed
            opponent.previousUpdate = opponent.lastUpdate;
            opponent.lastUpdate = null;
        }
        //There is no new update. Prediction time! (provided we have already predicted a speed)
        else if (opponent.predictedSpeedPerFrame != null)
        {
            var resultingSpeedPerFrame = {
                x: 0,
                y: 0
            }

            if (opponent.lastPredictedSpeedPerFrame != null)
            {
                resultingSpeedPerFrame.x += predictedMomentumFactor * lastOpponentPredictedSpeedPerFrame.x;
                resultingSpeedPerFrame.y += predictedMomentumFactor * lastOpponentPredictedSpeedPerFrame.y;
            }

            resultingSpeedPerFrame.x = (1 - predictedMomentumFactor) * opponent.predictedSpeedPerFrame.x;
            resultingSpeedPerFrame.y = (1 - predictedMomentumFactor) * opponent.predictedSpeedPerFrame.y;
            

            opponent.x += resultingSpeedPerFrame.x;
            opponent.y += resultingSpeedPerFrame.y;

            opponent.lastPredictedSpeedPerFrame = opponent.resultingSpeedPerFrame;
        }
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

            //if (update.actionCode != "NULL") console.log("Processing " + update.actionCode);
        
            switch (update.actionCode)
            {
                case "NULL":
                    break;

                case "CREATE":
                    game.createPiece(update.shape, update.xPosition, update.yPosition, game.state.getCurrentState().onlineSyncedPlayer.playerNumber, 
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
                    game.freezePiece(piece, state, true);
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
                this.currentGameState = game.GameStates.Draw;
                game.announce("Everybody loses.");
            }
            else
            {
                this.currentGameState = game.GameStates.PlayerLost;
                game.announce("Only you lose.");
            }
        }
        else if (onlinePlayer.isDead)
        {
            this.currentGameState = game.GameStates.PlayerWon;
            game.announce("Everybody but you loses.");
        }
    },

    //////////////////
    //After the game//
    //////////////////
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
        /*
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
        */
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
        this.currentGameState = game.GameStates.Abandoned;
        game.announce("You were abandoned");
    }
}