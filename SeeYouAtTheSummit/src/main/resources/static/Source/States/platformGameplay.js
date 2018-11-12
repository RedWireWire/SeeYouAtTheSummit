var platformGameplayState = function(game) {

}

var GameStates = {
    PreGame : 0,
    GameInProgress : 1,
    PlayerLost : 2,
    Draw : 3
};

platformGameplayState.prototype = {

    preload: function() 
    {
        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", game.playerUnscaledSpriteWidth, game.playerUnscaledSpriteHeight, 10);
        game.load.image("piece", "Assets/Sprites/Bloque.png");

        //Initialize a bunch of variables
        //Game state
        this.currentGameState = GameStates.PreGame;
        this.loserPlayer = null;
        this.winnerPlayer = null;

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
        this.player1 = game.createPlayer(1, screenCenterX - playerSpawnDistanceFromCenterX, this.ground.y - 100, this.playerPhysicsGroup);
        this.player2 = game.createPlayer(2, screenCenterX + playerSpawnDistanceFromCenterX, this.ground.y - 100, this.playerPhysicsGroup);

        //Player pieces
        game.nextPiece(1, this);
        game.nextPiece(2, this);
    },

    update: function() {
        
        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.playerPhysicsGroup);
        game.physics.arcade.collide(this.frozenPiecesPhysicsGroup, this.playerPhysicsGroup);

        if (this.currentGameState == GameStates.PreGame)
        {
            this.currentGameState = GameStates.GameInProgress;
        }
        else 
        {
            //Player input
            game.reactToPlayerInput(this.player1, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);
            game.reactToPlayerInput(this.player2, this.currentGameState, this.groundPhysicsGroup, this.frozenPiecesPhysicsGroup);

            //Tetris input
            if (this.currentGameState == GameStates.GameInProgress)
            {
                if (this.player1Piece) game.directPiece(this.player1Piece, this);
                if (this.player2Piece) game.directPiece(this.player2Piece, this);    

                //this.updateScore();
            }
        
            //Camera control
            game.updateCameraPosition(this, this.player1, this.player2);

            //Gamestate control
            if (this.currentGameState == GameStates.GameInProgress) this.checkForGameEnd();
        }

        if (this.currentGameState == GameStates.PlayerLost || this.currentGameState == GameStates.Draw)
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
        var player1NotOnScreen = !this.player1.inCamera;
        var player2NotOnScreen = !this.player2.inCamera;

        //If a player is off-screen, are they below the top of the screen?
        var player1Lost = false;
        if (player1NotOnScreen && game.getPlayerScreenTopOvershoot(this.player1) == 0)
        {
            player1Lost = true;
        }

        var player2Lost = false;
        if (player2NotOnScreen && game.getPlayerScreenTopOvershoot(this.player2) == 0)
        {
            player2Lost = true;
        }
        
        //Check if the game is over, and what the result is
        if (player1Lost && !player2Lost) 
        {
            this.currentGameState = GameStates.PlayerLost;
            this.winnerPlayer = this.player2;
            this.loserPlayer = this.player1;
            this.announceGameEnd();
        }
        else if (player2Lost && !player1Lost)
        {
            this.currentGameState = GameStates.PlayerLost;
            this.winnerPlayer = this.player1;
            this.loserPlayer = this.player2;
            this.announceGameEnd();
        }
        else if (player1Lost && player2Lost)
        {
            this.currentGameState = GameStates.Draw;
            this.announceGameEnd();
        }
    },

    announceGameEnd: function()
    {

        var style = { font: "65px Arial", fill: "#DF4BB3", align: "center" };
        var message = "";
        if (this.currentGameState == GameStates.PlayerLost)
        {
            message = this.winnerPlayer.name + " wins!";
        }
        else if (this.currentGameState == GameStates.Draw)
        {
            message = "Everybody loses.";
        }
        var announcementText = game.add.text(gameWidth / 2, gameHeight / 2, message, style);
        console.log(message);
        announcementText.fixedToCamera = true;
        this.getCurrentScore();
    },


    getCurrentScore: function()
    {
        var path = "/score";
        $.ajax(
            path,
            {
                type: "get",
                success: function(data) { console.log(data);},
                error: function() { console.log("Error");}
            }
        );
    },
    
    checkForBackToMenu: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC) || game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            game.state.start("mainMenuState");
        }
    }
}