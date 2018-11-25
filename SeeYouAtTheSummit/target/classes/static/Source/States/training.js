var trainingState = function(game) {

}

var GameStates = {
    PreGame : 0,
    GameInProgress : 1,
    PlayerLost : 2,
    Draw : 3
};

trainingState.prototype = {

    preload: function() 
    {
        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", game.playerUnscaledSpriteWidth, game.playerUnscaledSpriteHeight, 10);
        game.load.image("piece", "Assets/Sprites/Bloque.png");
        game.loadBackgroundTraining();
        //Initialize a bunch of variables
        //Game state
        this.currentGameState = GameStates.PreGame;
        this.loserPlayer = null;
        this.winnerPlayer = null;

        game.initializeBrickSystem(this);

    },    

    create: function () {

        game.setupLevel(this);

        game.initializeBackgroundTraining(this);

        //Physics initialization
        game.initializePhysicsGroups(this);

        //Create the ground
        game.createGround(this);

        //Create the players
        var screenCenterX = gameWidth / 2;
        this.player1 = game.createPlayer(1, screenCenterX , this.ground.y - 100, this.playerPhysicsGroup, true, game.ControlSchemes.NotShared);

        game.camera.y = game.camera.y - 250;
        //Player pieces
        game.nextPiece(1, this, this.player1.controlScheme, 
            function(state, piece) { state.player1Piece = piece;}, false, true);
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

            game.updatePlayerAnimation(this.player1);

            //Tetris input
            if (this.currentGameState == GameStates.GameInProgress)
            {
                if (this.player1Piece) game.directPiece(this.player1Piece, this);

                //this.updateScore();
            }

            //Gamestate control
            if (this.currentGameState == GameStates.GameInProgress) this.checkForGameEnd();
        }

        if (this.currentGameState == GameStates.PlayerLost || this.currentGameState == GameStates.Draw)
        {
            this.checkForBackToMenu();
        }
    },


   

    //////////////
    //GAME STATE//
    //////////////
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
            this.currentGameState = GameStates.PlayerLost;
            this.loserPlayer = this.player1;
            game.announce("That's why you're training.")
        }
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
    },
}