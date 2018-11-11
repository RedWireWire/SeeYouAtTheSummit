var platformGameplayState = function(game) {

}

var GameStates = {
    PreGame : 0,
    GameInProgress : 1,
    PlayerLost : 2,
    Draw : 3
};

////////////////////
//PLAYER VARIABLES//
////////////////////
//Player movement parameters
var gravityStrength = 50;

var playerJumpStrength = 1000;
var playerJumpLeeway = 15;

var playerWallGrabLeeway = 10;
var wallJumpYComponentFactor = 0.7;
var wallJumpXComponentFactor = 0.5;

var playerMoveAcceleration = 1200;
var playerMaxHorizontalSpeed = 500;
var playerHorizontalDrag = 20;

var playerAirborneAccelFactor = 0.4;
var playerAirborneDragFactor = 0.1;

//Player sprite settings
var playerUnscaledSpriteWidth = 250;
var playerUnscaledSpriteHeight = 200;
var playerSpriteScale = 0.5;

var playerSpriteCenterX = 0.47;
var playerSpriteCenterY = 0.5;

var playerHitboxLeftMargin = 75;
var playerHitboxRightMargin = 90;
var playerHitboxUpMargin = 60;
var playerHitboxDownMargin = 3;

var player1Color = 0xff608b;
var player2Color = 0xff9068;

//Player input settings
var player1JumpKey = Phaser.Keyboard.SPACEBAR;
var player1LeftMoveKey = Phaser.Keyboard.A;
var player1RightMoveKey = Phaser.Keyboard.D;

var player2JumpKey = Phaser.Keyboard.UP;
var player2LeftMoveKey = Phaser.Keyboard.LEFT;
var player2RightMoveKey = Phaser.Keyboard.RIGHT;

//Player spawnpoints
var playerSpawnDistanceFromCenterXFraction = 4;

////////////////////
//TETRIS VARIABLES//
////////////////////

//Visual settings
var pieceSpriteScale = 0.5;
var unscaledCubeSize = 100;
var scaledCubeSize = unscaledCubeSize * pieceSpriteScale;
var nonFrozenAlpha = 0.5;

//Spawn points
var pieceSpawnScreenBottomMarginInCubes = 15;
var pieceSpawnXFromCenterInCubes = 5;

//Timings
var autoDescendTime = 45;
var nextPieceWaitTime = 2000;  //In miliseconds

//Player piece input
var player1PieceRotate = Phaser.Keyboard.T;
var player1PieceLeft = Phaser.Keyboard.F;
var player1PieceRight = Phaser.Keyboard.H;
var player1PieceDown = Phaser.Keyboard.G;
var player1PieceFreeze = Phaser.Keyboard.R;

var player2PieceRotate = Phaser.Keyboard.I;
var player2PieceLeft = Phaser.Keyboard.J;
var player2PieceRight = Phaser.Keyboard.L;
var player2PieceDown = Phaser.Keyboard.K;
var player2PieceFreeze = Phaser.Keyboard.U;

//Brick system
var startingBrickPositionsArraySize = 3;
var deleteCondition = 5;

///////////////
//ENVIRONMENT//
///////////////

var groundHeightInCubes = 5;

//Camera
var cameraAutoScrollSpeed = 0.3;
var cameraCatchupDistanceToSpeedIncreaseFactor = 0.05;

//Background
var numberOfBackgrounds = 5;
var backgroundParallaxFactor = 0.3;


platformGameplayState.prototype = {

    preload: function() 
    {
        //Load sprites
        game.load.image("ground", "Assets/EscenarioYFondos/Suelo.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetBlanco.png", playerUnscaledSpriteWidth, playerUnscaledSpriteHeight, 10);
        game.load.image("piece", "Assets/Sprites/Bloque.png");

        for (let i = 0; i < numberOfBackgrounds; i++)
        {
            game.load.image("background" + i, "Assets/EscenarioYFondos/Fondo" + i + ".png");
        }

        //Initialize a bunch of variables
        //Game state
        this.currentGameState = GameStates.PreGame;
        this.loserPlayer = null;
        this.winnerPlayer = null;

        //Brick system
        this.brickPositions = new Array(startingBrickPositionsArraySize);
        for(let i=0;i < startingBrickPositionsArraySize; i++){
            this.brickPositions[i] = new Array(startingBrickPositionsArraySize);
        }

        //Background system
        this.freeBackgrounds = new Array(numberOfBackgrounds);
        this.currentBackground;
        this.queuedBackground;
    },    

    //Creation
    create: function() {
        //Background
        this.stage.backgroundColor = 0x333333;

        //World initialization
        game.world.setBounds(0, 0, gameWidth, 100000);

        //Camera initialization
        game.camera.y = game.world.height;
        game.camera.roundPx = false;

        this.initializeBackgrounds();

        //Physics initialization
        this.createPhysicGroups();
        
        //Create the ground
        //this.ground = this.createWall(0, game.world.height - scaledCubeSize * groundHeightInCubes, 5, 10);
        this.ground = this.createGround();

        //Create the player
        var screenCenterX = gameWidth / 2;
        var playerSpawnDistanceFromCenterX = gameWidth / playerSpawnDistanceFromCenterXFraction;
        this.player1 = this.createPlayer(1, screenCenterX - playerSpawnDistanceFromCenterX, this.ground.y - 100);
        this.player2 = this.createPlayer(2, screenCenterX + playerSpawnDistanceFromCenterX, this.ground.y - 100);

        //Player pieces
        this.nextPiece(1, this);
        this.nextPiece(2, this);
    },

    createPhysicGroups: function()
    {
        this.groundPhysicsGroup = game.add.physicsGroup();
        this.playerPhysicsGroup = game.add.physicsGroup();
        this.piecePhysicsGroup = game.add.physicsGroup();
        this.frozenPiecesPhysicsGroup = game.add.physicsGroup();
    },

    createWall: function(xPosition, yPosition, xScale, yScale) {
        //Sprite
        wall = game.add.sprite(xPosition, yPosition, "suelo");
        wall.scale.setTo(xScale, yScale);

        //Physics
        game.physics.arcade.enable(wall);
        wall.body.allowGravity = false;
        wall.body.immovable = true;
        wall.body.moves = false;
        wall.body.enable = true;
        wall.body.collideWorldBounds = true;
        this.groundPhysicsGroup.add(wall);

        return wall;
    },

    createGround: function()
    {
        var ground = game.add.sprite(0, 0, "ground");
        
        //Positioning
        ground.y = game.world.height - ground.height;

        //Scaling

        //Physics
        game.physics.arcade.enable(ground);
        ground.body.allowGravity = false;
        ground.body.immovable = true;
        ground.body.moves = false;
        ground.body.enable = true;
        ground.body.collideWorldBounds = true;
        this.groundPhysicsGroup.add(ground);

        return ground;
    },

    createPlayer: function(playerNumber, xPosition, yPosition)
    {
        //Sprite
        player = game.add.sprite(xPosition, yPosition, "playerSpriteSheet");
        player.name = "Player " + playerNumber;
        switch (playerNumber)
        {
            case 1:
                player.tint = player1Color;
                break;
            case 2:
                player.tint = player2Color;
            break;
            default:
                console.log("Unsupported player number " + playerNumber);
        }
        
        //Animation
        player.animations.add("walk", [1, 2, 3, 4, 5], 10, true);
        player.animations.add("idle", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 8, 9, 8], 4, true);
        player.animations.add("jump", [6], 1, true);
        player.animations.add("grabWall", [7], 1, true);
    
        //Scaling
        player.anchor.setTo(playerSpriteCenterX, playerSpriteCenterY);
        player.scale.x = playerSpriteScale;
        player.scale.y = playerSpriteScale;

        //Physics
        game.physics.arcade.enable(player);
        player.body.allowGravity = false;     //We'll use our own gravity
        player.body.drag = 0;                 //We'll use our own drag
        player.body.enable = true;

        player.body.maxVelocity.x = playerMaxHorizontalSpeed;
        player.body.drag.x = playerHorizontalDrag;

        this.playerPhysicsGroup.add(player);

        //Hitbox
        player.body.setSize(
            playerUnscaledSpriteWidth - playerHitboxLeftMargin - playerHitboxRightMargin,
            playerUnscaledSpriteHeight - playerHitboxUpMargin - playerHitboxDownMargin,
            playerHitboxLeftMargin,
            playerHitboxUpMargin
        );

        //Input variables
        switch (playerNumber)
        {
            case 1:
                player.jumpKey = player1JumpKey;
                player.leftMoveKey = player1LeftMoveKey;
                player.rightMoveKey = player1RightMoveKey;
                break;
            case 2:
                player.jumpKey = player2JumpKey;
                player.leftMoveKey = player2LeftMoveKey;
                player.rightMoveKey = player2RightMoveKey;
                break;
        }

        player.liftedJumpKey = true;

        return player;
    },

    //Función donde se crean las distintas piezas del juego.
    //Recibe la forma de la pieza la posición de esta y a que jugador va a ir asociada.
    createPiece: function(estilo,Xpieza,Ypieza,playerNumber){
        
        var pieza = new Object();
        pieza.playerNumber = playerNumber;
        
        //Creation of the desired shape
        switch(estilo){
            case 1:
            //Creación de la pieza L
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
                pieza.bricks[1] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza ,"piece");
                pieza.bricks[2] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza-scaledCubeSize, "piece");
                pieza.bricks[3] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza-(2*scaledCubeSize), "piece");
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].code="L";
                    pieza.bricks[i].index=i;
                }
                break;
            case 2:
            //Creación de la pieza T.
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
                pieza.bricks[1] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza, "piece");
                pieza.bricks[2] = game.add.sprite(Xpieza+scaledCubeSize, Ypieza, "piece");
                pieza.bricks[3] = game.add.sprite(Xpieza, Ypieza-scaledCubeSize, "piece");
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].code="T";
                    pieza.bricks[i].index=i;
                }
                
                break;
            case 3:
            //Creación de la pieza Z.
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
                pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza+scaledCubeSize, "piece");
                pieza.bricks[2] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza+scaledCubeSize, "piece");
                pieza.bricks[3] = game.add.sprite(Xpieza+scaledCubeSize, Ypieza, "piece");
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].code="Z";
                    pieza.bricks[i].index=i; 
                }
                break;
            case 4:
            //Creación de la pieza I
                pieza.bricks = new Array(4);

                pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
                pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza-scaledCubeSize, "piece");
                pieza.bricks[2] = game.add.sprite(Xpieza, Ypieza-(2*scaledCubeSize), "piece");
                pieza.bricks[3] = game.add.sprite(Xpieza, Ypieza-(3*scaledCubeSize), "piece");
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].code="I";
                    pieza.bricks[i].index=i; 
                }
                break;
            case 5:
            //Creación de la pieza O
                pieza.bricks = new Array(4);  
                
                pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
                pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza-scaledCubeSize, "piece");
                pieza.bricks[2] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza-scaledCubeSize, "piece");
                pieza.bricks[3] = game.add.sprite(Xpieza-scaledCubeSize, Ypieza, "piece");
                break;
        }
        
        //Brick initialization
        for (let i = 0; i <= 3; i++) {
            //Physics
            game.physics.arcade.enable(pieza.bricks[i]);
            pieza.bricks[i].body.allowGravity = false;
            pieza.bricks[i].body.immovable = false;
            pieza.bricks[i].body.moves = true;
            pieza.bricks[i].body.enable = true;
            this.piecePhysicsGroup.add(pieza.bricks[i]);

            //Sprite
            pieza.bricks[i].anchor.setTo(0.5, 0.5);
            pieza.bricks[i].scale.x = pieceSpriteScale;
            pieza.bricks[i].scale.y = pieceSpriteScale;
            pieza.bricks[i].alpha = nonFrozenAlpha;
        }
        
        pieza.moveTimer = 0;
        //Input variables
        switch (playerNumber)
        {
            case 1:
                pieza.keyrotateC=player1PieceRotate;
                pieza.keyfreezeC=player1PieceFreeze;
                pieza.keyleftC=player1PieceLeft;
                pieza.keyrightC=player1PieceRight;
                pieza.keydownC=player1PieceDown;
                pieza.allowRotate=true;
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].tint=player1Color;
                }

                break;
            case 2:
                pieza.keyrotateC=player2PieceRotate;
                pieza.keyfreezeC=player2PieceFreeze;
                pieza.keyleftC=player2PieceLeft;
                pieza.keyrightC=player2PieceRight;
                pieza.keydownC=player2PieceDown;
                pieza.allowRotate=true;
                for(let i=0;i<=3;i++){
                    pieza.bricks[i].tint=player2Color;
                }

                break;
        }
        return pieza;
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
            this.reactToPlayerInput(this.player1);
            this.reactToPlayerInput(this.player2);

            //Tetris input
            if (this.currentGameState == GameStates.GameInProgress)
            {
                if (this.player1Piece) this.dirijirPieza(this.player1Piece);
                if (this.player2Piece) this.dirijirPieza(this.player2Piece);    
            }
        
            //Camera control
            this.updateCameraPosition();

            //Gamestate control
            if (this.currentGameState == GameStates.GameInProgress) this.checkForGameEnd();
        }

        if (this.currentGameState == GameStates.PlayerLost || this.currentGameState == GameStates.Draw)
        {
            this.checkForBackToMenu();
        }
    },

    //PLAYER MOVEMENT
    reactToPlayerInput: function(player)
    {
        //Reset acceleration
        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;
        
        //Read the input
        var rightInput = false;
        var leftInput = false;
        var jumpKey = false;

        if (this.currentGameState == GameStates.GameInProgress)
        {
            rightInput = game.input.keyboard.isDown(player.rightMoveKey);
            leftInput = game.input.keyboard.isDown(player.leftMoveKey);
            jumpKey = game.input.keyboard.isDown(player.jumpKey);
        }
        
        //Check if we will allow jump input 
        if (!player.liftedJumpKey)
        {
            if (!jumpKey)
            {
                player.liftedJumpKey = true;
            }
        }
        var jumpInputIsAllowed = player.liftedJumpKey;

        //Check for state
        var isGrounded = this.playerIsGrounded(player);
        var isGrabbingWall = this.playerIsGrabbingWall(player);
        
        //Get the push direction
        var pushDirection;
        if (leftInput && !rightInput)
        {
            pushDirection = -1;
        }
        else if (rightInput && !leftInput)
        {
            pushDirection = 1;
        }
        else
        {
            pushDirection = 0;
        }
        
        //Get the movement direction
        var movementDirection = Math.sign(player.body.velocity.x);

        //Should we apply horizontal drag?
        var doDrag;
        if (pushDirection == movementDirection) doDrag = false;
        else if (pushDirection != movementDirection)
        {
            if (movementDirection == 0) doDrag = false;
            else doDrag = true;
        }
        
        //Apply the push, unless we're pushing towards a wall we're grabbing onto
        if (isGrabbingWall == 0 || isGrabbingWall != pushDirection)
        {
            player.body.acceleration.x += pushDirection * playerMoveAcceleration * ((isGrounded) ? 1 : playerAirborneAccelFactor);
        }

        //Apply drag
        if (doDrag)
        {
            var newHorSpeed = player.body.velocity.x - (movementDirection * (playerHorizontalDrag * ((isGrounded) ? 1 : playerAirborneDragFactor)));
            if (movementDirection == -1)
            {
                player.body.velocity.x = Math.min(newHorSpeed, 0);
            }
            else if (movementDirection == 1)
            {
                player.body.velocity.x = Math.max(newHorSpeed, 0);
            }
            else if (movementDirection == 0)
            {
                player.body.velocity.x = 0;
            }
        }

        //Jumping
        if (jumpInputIsAllowed && jumpKey)
        {
            //Should we do a walljump?
            var doWallJump = false;
            if (isGrabbingWall)
            {
                if (!isGrounded) doWallJump = true;
            }

            if (doWallJump)
            {
                var wallDirection = isGrabbingWall;
                player.body.velocity.y = -playerJumpStrength * wallJumpYComponentFactor;
                player.body.velocity.x = -wallDirection * playerJumpStrength * wallJumpYComponentFactor;
            }
            else if (isGrounded)
            {
                player.body.y -= 1;     //This ugly hack prevents the player from technically being inside the ground and thus not jumping
                player.body.velocity.y = -playerJumpStrength;
            }
            
            player.liftedJumpKey = false;
        }
    
        //Gravity
        player.body.velocity.y += gravityStrength;

        //Set animation
        if (isGrounded)
        {
            if (pushDirection == 0)
            {
                player.animations.play("idle");
                player.scale.x = Math.abs(player.scale.x);
            }
            else
            {
                player.scale.x = Math.abs(player.scale.x) * pushDirection;
                player.animations.play("walk");
            }
        }
        else
        {
            if (isGrabbingWall != 0)
            {
                player.scale.x = Math.abs(player.scale.x) * isGrabbingWall;
                player.animations.play("grabWall");
            } 
            else player.animations.play("jump");
        }
    },

    playerIsGrounded: function(player)
    {
        //Prepare everything
        player.body.moves = false;
        var originalY = player.body.y;

        //Move the player
        player.body.y += playerJumpLeeway;

        //Test for collisions
        var touchingGround = game.physics.arcade.overlap(player, this.groundPhysicsGroup);
        if (!touchingGround) touchingGround = game.physics.arcade.overlap(player, this.frozenPiecesPhysicsGroup);

        //Put everything in its place
        player.body.y = originalY;
        player.body.moves = true;

        //Return the result
        return touchingGround;
    },

    //Returns -1 or 1 depending on the direction. 0 if not grabbing.
    playerIsGrabbingWall: function(player)
    {
        //Prepare everything
        player.body.moves = false;
        var originalX = player.body.x;
        
        //Check left
        player.body.x -= playerWallGrabLeeway;
        var grabbingLeft = game.physics.arcade.overlap(player, this.groundPhysicsGroup);
        if (!grabbingLeft) grabbingLeft = game.physics.arcade.overlap(player, this.frozenPiecesPhysicsGroup);
        player.body.x = originalX;

        //Check right
        player.body.x += playerWallGrabLeeway;
        var grabbingRight = game.physics.arcade.overlap(player, this.groundPhysicsGroup);
        if (!grabbingRight) grabbingRight = game.physics.arcade.overlap(player, this.frozenPiecesPhysicsGroup);
        player.body.x = originalX;
        
        //Put everything back
        player.body.moves = true;

        if (grabbingLeft) return -1;
        else if (grabbingRight) return 1;
        else return 0;
    },

    //TETRIS CONTROL
    dirijirPieza: function(piezaTetris)
    {

        //Entrada por teclado.
        enterKey = game.input.keyboard.addKey(piezaTetris.keyfreezeC);
        Rkey = game.input.keyboard.addKey(piezaTetris.keyrotateC);
        downKey = game.input.keyboard.addKey(piezaTetris.keydownC);
        leftKey = game.input.keyboard.addKey(piezaTetris.keyleftC);
        rightKey = game.input.keyboard.addKey(piezaTetris.keyrightC);

        if (!piezaTetris.frozen)
        {
            if (!enterKey.isDown) {
        
                //Rotation
                if (!Rkey.isDown) { piezaTetris.keyR = false; }
                if (Rkey.isDown && !piezaTetris.keyR ){
                    this.rotatePiece(piezaTetris);
                    piezaTetris.keyR = true;
                }
    
                //Temporizador que marca el ritmo de bajada de la pieza, cada pieza tiene su propio temporizador.
                if (piezaTetris.moveTimer >= autoDescendTime) {
                    this.lowerPiece(piezaTetris);
                    piezaTetris.moveTimer = 0;
                }
    
                //Forzar el bajar
                if (!downKey.isDown) { piezaTetris.keydown = false; }
                if (downKey.isDown && !piezaTetris.keydown) {
                    this.lowerPiece(piezaTetris);
                    piezaTetris.keydown = true;
                    piezaTetris.moveTimer = 0;
                }
                //Mover pieza a la izquierda.
                if (!leftKey.isDown) { piezaTetris.keyleft = false; }
                if (leftKey.isDown && !piezaTetris.keyleft) {
                    this.attemptToMovePiece(piezaTetris, -1);
                    piezaTetris.keyleft = true;
                }
                //Mover pieza a la derecha.
                if (!rightKey.isDown) { piezaTetris.keyright = false; }
                if (rightKey.isDown && !piezaTetris.keyright) {
                    this.attemptToMovePiece(piezaTetris, 1);
                    piezaTetris.keyright = true;
                }
                piezaTetris.moveTimer++;
            }
            else
            {
                this.freezePiece(piezaTetris);
            }
        }
    },

    checkForBrickDestruction: function()
    {
        //Checking for columns
        var currentGroupSize = 0;
        for (let i = 0; i < this.brickPositions.length; i++)
        {
            for (let j = 0; j < this.brickPositions[i].length; j++)
            {
                var brick = this.getBrick(i, j);
                var endGroup = false;
                var groupEndIndex;
                
                //First null after group
                if (!brick)
                {
                    endGroup = true;
                    groupEndIndex = j - 1;
                }
                //End of the column
                else if (j == this.brickPositions[i].length - 1)
                {
                    endGroup = true;
                    groupEndIndex = j;
                }
                
                //There is a brick here
                if (brick) 
                {
                    currentGroupSize++;
                }

                //Check wether we need to destroy this group
                if (endGroup && currentGroupSize != 0)
                {
                    if (currentGroupSize >= deleteCondition)
                    {
                        var groupStartJ = groupEndIndex - currentGroupSize + 1;
                    
                        for (let k = groupStartJ; k <= groupEndIndex; k++)
                        {
                            this.deleteBrick(i, k);
                        }
                    }    
                    currentGroupSize = 0;
                }
            }
        }

        //Checking for rows
        currentGroupSize = 0;
        for (let j = 0; j < this.brickPositions[0].length; j++)
        {
            for (let i = 0; i < this.brickPositions.length; i++)
            {
                var brick = this.getBrick(i, j);
                var endGroup = false;
                var groupEndIndex;
                
                //First null after group
                if (!brick)
                {
                    endGroup = true;
                    groupEndIndex = i - 1;
                }
                //End of the row
                else if (i == this.brickPositions.length - 1)
                {
                    endGroup = true;
                    groupEndIndex = i;
                }
                
                //There is a brick here
                if (brick) 
                {
                    currentGroupSize++;
                }

                //Check wether we need to destroy this group
                if (endGroup && currentGroupSize != 0)
                {
                    if (currentGroupSize >= deleteCondition)
                    {
                        var groupStartI = groupEndIndex - currentGroupSize + 1;
                    
                        for (let k = groupStartI; k <= groupEndIndex; k++)
                        {
                            this.deleteBrick(k, j);
                        }
                    }    
                    currentGroupSize = 0;
                }
            }
        }
    },

    deleteBrick: function(x, y)
    {
        var brick = this.getBrick(x, y);
        if (brick)
        {
            brick.destroy();
            this.brickPositions[x][y] = undefined;
        }

        
    },
    
    //Función que devuelve true si la pieza está colisionando con el suelo y false si no.
    //Recibe la pieza.
    piezaTocandoSuelo: function(piezaTetris)
    {
        for (let i = 0; i < 4; i++)
        {
            //Separo las piezas en diferentes ladrillos para tratarlos por separado.
            var brick = piezaTetris.bricks[i];

            //Desactivo moviento para manipularla.
            brick.body.moves = false;
            //Guardo su y original.
            var originalY = brick.body.y;
            
            brick.body.y += scaledCubeSize;

            //Comprubo colision con el suelo.
            var tocandoSuelo = game.physics.arcade.overlap(brick, this.groundPhysicsGroup);
            
            //Compruebo colision con piezas que estén colisionando.
            if(!tocandoSuelo){
                tocandoSuelo = game.physics.arcade.overlap(brick, this.frozenPiecesPhysicsGroup);
            }
            //Restauro su y.
            brick.body.y = originalY;
            brick.body.moves = true;

            if (tocandoSuelo) return true;
        }
        
        return false;
    },

    //Función que rota la pieza.
    //Recibe la pieza a rotar.
    rotatePiece: function(piece)
    {
        //Comprueba si la pieza se puede rotar, si se puede lo hace.
        if(this.allowRotate(piece)){
            this.rotateBrick(piece);
            //Se pone el temporizador de caida de la pieza a 0.
            if (this.piezaTocandoSuelo(piece)) piece.moveTimer = 0;
        }
    },

    //Función que devuelve true se la pieza puede rotar.
    //Recibe la pieza a rotar.
    allowRotate:function(piezaRotar){
        //Declaración de arrays donde se guardarán los parámetros originales de las piezas.
        var indOrg=new Array(4);
        var orgX=new Array(4);
        var orgY=new Array(4);
        
        var condicionDeRotacion=true;

        this.guardarPiece(piezaRotar,indOrg,orgX,orgY);
        //Rota la pieza.
        this.rotateBrick(piezaRotar);
        for (let i = 0; i < 4; i++){
            //Separo las piezas en diferentes ladrillos para tratarlos por separado.
            var brick = piezaRotar.bricks[i];
            //Compruebo si alguno de los ladrillos está colisionando o bien con el suelo o con alguna de las piezas, si lo está haciendo no permito rotar.
            if(game.physics.arcade.overlap(brick, this.groundPhysicsGroup) || game.physics.arcade.overlap(brick, this.frozenPiecesPhysicsGroup)){
                condicionDeRotacion=false;
            }
        }
        //Compruebo si alguno de los ladrillos está fuera de los límites del mapa.
        condicionDeRotacion=this.limitesLateralesPiezas(piezaRotar,condicionDeRotacion);

        this.cargarPiece(piezaRotar,indOrg,orgX,orgY);

        return condicionDeRotacion;
    },

    //Función que recibe la pieza y ciertos arrays para guardar los parámetros originales de las piezas.
    guardarPiece:function(piezaRotar,indOriginal,originalX,originalY){
        for(var i=0;i<4;i++){
            indOriginal[i]=piezaRotar.bricks[i].index;
            originalX[i]=piezaRotar.bricks[i].body.x;
            originalY[i]=piezaRotar.bricks[i].body.y;
        }
    },

    //Función que recibe la pieza y ciertos arrays (que poseen los parámetros originales de las piezas) para asignarlos a los parámetros de las piezas.
    cargarPiece:function(piezaRotar,indOriginal,originalX,originalY){
        for(var i=0;i<4;i++){
            piezaRotar.bricks[i].index=indOriginal[i];
            piezaRotar.bricks[i].body.x=originalX[i];
            piezaRotar.bricks[i].body.y=originalY[i];
        }
    },

    //Función que recibe la pieza la separa en ladrillos y rota cada uno de esos ladrillos.
    rotateBrick:function(pieza){ 
        for(var i=0;i<4;i++){

        var brick=pieza.bricks[i];
            switch(brick.code){

                case "L":
                //Rotación de L
                    if(brick.index==0){
                        brick.body.x -= (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==1 || brick.index==11){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        brick.index += 4;
                    }else if(brick.index==3 || brick.index==9){
                        brick.body.x += scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        brick.index+=4;
                    }else if(brick.index==4){
                        brick.body.y -= (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==5 || brick.index==15){
                        brick.body.x += scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        if(brick.index==15){brick.index=3;}
                        else{brick.index += 4;}
                    }else if(brick.index==7 || brick.index==13){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        if(brick.index==13){brick.index=1;}
                        else{brick.index+=4;}
                    }else if(brick.index==8){
                        brick.body.x += (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==12){
                        brick.index = 0;
                        brick.body.y += (2*scaledCubeSize);
                    }
                break;
                
                case "T":
                    //Rotacion de T
                    if(brick.index==1 || brick.index==10 || brick.index==15){
                        brick.body.x += scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        if(brick.index==15){brick.index=3;}
                        else{brick.index += 4;}
                    }else if(brick.index==2 || brick.index==7 || brick.index==9){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        brick.index += 4;
                    }else if(brick.index==3 || brick.index==5 || brick.index==14){
                        brick.body.x += scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        if(brick.index==14){brick.index=2;}
                        else{brick.index+=4;}
                    }else if(brick.index==6 || brick.index==11 || brick.index==13){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        if(brick.index==13){brick.index=1;}
                        else{brick.index += 4;}
                    }
                break;

                case "Z":
                    //Rotación de Z
                    if(brick.index==1 ||brick.index==7){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        brick.index += 4;
                    }else if(brick.index==2){
                        brick.body.y -= (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==3 || brick.index==13){
                        brick.body.x -= scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        if(brick.index==3){brick.index+=4;}
                        else {brick.index=1;}
                    }else if(brick.index==5 || brick.index==11){
                        brick.body.x += scaledCubeSize;
                        brick.body.y -= scaledCubeSize;
                        brick.index += 4;
                    }else if(brick.index==6){
                        brick.body.x += (2*scaledCubeSize);
                        brick.index+=4;
                    }else if(brick.index==9 || brick.index==15){
                        brick.body.x += scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        if(brick.index==9){brick.index+=4;}
                        else {brick.index=3;}
                    }else if(brick.index==10){
                        brick.body.y += (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==14){
                        brick.index=2;
                        brick.body.x -= (2*scaledCubeSize);
                    }
            break;
                
            case "I":
                //Rotación de I
                    if(brick.index==0){
                        brick.body.x=brick.body.x - (2*scaledCubeSize);
                        brick.body.y=brick.body.y - (2*scaledCubeSize);
                        brick.index+=4;
                    }else if(brick.index==1 || brick.index==11){
                        brick.body.x=brick.body.x -scaledCubeSize;
                        brick.body.y=brick.body.y - scaledCubeSize;
                        brick.index+=4;
                    }else if(brick.index==2 || brick.index==10 || brick.index==5 || brick.index==13){
                        brick.body.x=brick.body.x;
                        brick.body.y=brick.body.y;
                        if(brick.index==13){brick.index=1;}
                        else{brick.index+=4}
                    }else if(brick.index==3 || brick.index==9){
                        brick.body.x += scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        brick.index+=4;
                    }else if(brick.index==4 || brick.index==14){
                        brick.body.x += scaledCubeSize;
                        brick.body.y=brick.body.y - scaledCubeSize;
                        if(brick.index==4){brick.index+=4;}
                        else{brick.index=2}
                    }else if(brick.index==6 || brick.index==12){
                        brick.body.x=brick.body.x - scaledCubeSize;
                        brick.body.y += scaledCubeSize;
                        if(brick.index==6){brick.index+=4;}
                        else{brick.index=0}
                    }else if(brick.index==7){
                        brick.body.x=brick.body.x - (2*scaledCubeSize);
                        brick.body.y += (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==8){
                        brick.body.x += (2*scaledCubeSize);
                        brick.body.y += (2*scaledCubeSize);
                        brick.index += 4;
                    }else if(brick.index==15){
                        brick.index=3;
                        brick.body.x += (2*scaledCubeSize);
                        brick.body.y -= (2*scaledCubeSize);
                    }
                break;
            }
        }
    },

    //Función que recibe la pieza e incrementa su y para que la pieza baje.
    lowerPiece:function(piezaTetris)
    {
        //Comprueba si la pieza está colisionando con el suelo.
        if (this.piezaTocandoSuelo(piezaTetris))
        {
            this.freezePiece(piezaTetris);
        }
        else
        {
            for (let i = 0; i < 4; i++)
            {
                piezaTetris.bricks[i].body.y += scaledCubeSize;
            }
        }
    },

    attemptToMovePiece: function(piezaTetris, direction)
    {
        if(this.allowMove(piezaTetris, direction)){
            this.movePiece(piezaTetris, direction);
        }
    },

    //Función que recibe la pieza y una dirección y mueve la pieza una posición en la dirección indicada
    movePiece: function(piezaTetris, direction)
    {
        for (let i = 0; i < 4; i++)
        {
            piezaTetris.bricks[i].body.x += direction * scaledCubeSize;
        }
    },

    //Función que recibe la pieza y una dirección, devuelve true si la pieza se puede mover.
    allowMove:function(piezaMove, dir){
        var condicionDeMovimiento=true;

        //Muevo la pieza en la dirección deseada.
        this.movePiece(piezaMove,dir);

        //Compruebo sino está fuera de los limites del mapa, si lo está devuelvo false.
        if(!this.limitesLateralesPiezas(piezaMove,condicionDeMovimiento)){
            condicionDeMovimiento=false;
        }
        //Vuelvo a dejar la pieza en su posición.
        this.movePiece(piezaMove,-dir);

        return condicionDeMovimiento;
    },

    //Función que recibe una condición de movimiento y la pieza, devuelve true si la pieza no está fuera de los límites del mapa y por tanto se puede mover.
    limitesLateralesPiezas:function(piezaMove,condicion){
        var rightLimit = gameWidth;
        var leftLimit = -scaledCubeSize;
        
        for (let i = 0; i < 4; i++){
            if(piezaMove.bricks[i].body.x>=rightLimit || piezaMove.bricks[i].body.x<=leftLimit){
                condicion=false;
            }
        }
        return condicion;
    },

    //Función que recibe la pieza y la detiene en la posición en la que esté.
    freezePiece: function(piezaTetris)
    {
        //Comprueba si la pieza se puede detener en el sitio en el que esté.
        if (!this.pieceIsAllowedToFreeze(piezaTetris)) return;

        piezaTetris.frozen = true;
        for (let i = 0; i < 4; i++)
        {
            brick = piezaTetris.bricks[i];

            //Stop movement
            brick.body.immovable = true;
            brick.body.moves = false;
        
            //Start collisions
            this.frozenPiecesPhysicsGroup.add(brick);
            this.piecePhysicsGroup.remove(brick);

            //Remember this brick's position
            var brickPosition = this.getGridCoordinates(brick.x, brick.y);
            this.saveBrick(brick, brickPosition.x, brickPosition.y);
            
            //Sprite
            brick.alpha = 1;
        }

        this.checkForBrickDestruction();
        setTimeout(this.nextPiece, nextPieceWaitTime, piezaTetris.playerNumber, this);
    },

    saveBrick: function(brick, x, y)
    {
        this.resizeBrickArrayIfNeeded(x, y);
        this.brickPositions[x][y] = brick;
    },

    getBrick: function(x, y)
    {
        this.resizeBrickArrayIfNeeded(x, y);
        return this.brickPositions[x][y];
    },

    resizeBrickArrayIfNeeded(x, y)
    {
        if (this.brickPositions.length <= x)
        {
            var originalLength = this.brickPositions.length;
            this.brickPositions.length = x + 1;

            for (let i = originalLength; i < this.brickPositions.length; i++)
            {
                this.brickPositions[i] = new Array(this.brickPositions[0].length);
            }
        }
        if (this.brickPositions[0].length <= y)
        {
            for (let i = 0; i < this.brickPositions.length; i++)
            {
                this.brickPositions[i].length = y + 1;
            }
        }
    },

    nextPiece: function(playerNumber, stateObject)
    {
        //Create the piece
        var screenCenterX = gameWidth / 2;
        screenCenterX -= screenCenterX % scaledCubeSize;

        var x = screenCenterX + ((playerNumber == 1) ? -1 : 1) * pieceSpawnXFromCenterInCubes * scaledCubeSize + scaledCubeSize / 2;
        
        var y = game.camera.view.y + game.camera.view.height;
        y -= y % scaledCubeSize;
        y -= scaledCubeSize / 2;
        y -= pieceSpawnScreenBottomMarginInCubes * scaledCubeSize;


        var piece = stateObject.createPiece(stateObject.randomPieceShape(), x, y, playerNumber);

        //Assign the piece
        switch (playerNumber)
        {
            case 1: 
                stateObject.player1Piece = piece;
                break;
            case 2:
                stateObject.player2Piece = piece;
                break;
        }
    },

    //Función que devuelve un número aleatorio entre 1 y 5.
    randomPieceShape: function()
    {
        return game.rnd.integerInRange(1, 5);
    },

    pieceIsAllowedToFreeze: function(piece)
    {
        var placeOccupied = false;
        for (let i = 0; i < 4; i++)
        {
            if (game.physics.arcade.overlap(piece.bricks[i], this.frozenPiecesPhysicsGroup) ||
                game.physics.arcade.overlap(piece.bricks[i], this.playerPhysicsGroup)
            )
            {
                placeOccupied = true;
                break;
            }
        }

        return !placeOccupied;
    },

    getGridCoordinates: function(xPosition, yPosition)
    {
        var tmpY = yPosition;
        var tmpX = xPosition;
        //Align to grid
        tmpY += scaledCubeSize / 2;
        tmpX -= scaledCubeSize / 2;
        
        tmpY -= game.world.height - scaledCubeSize * groundHeightInCubes;
        
        //To grid
        var yCoordinate = -(tmpY / scaledCubeSize);
        var xCoordinate = tmpX / scaledCubeSize;

        return {
            x: xCoordinate,
            y: yCoordinate
        };
    },


    updateCameraPosition: function()
    {
        //See if we need to cath up
        var cathupDistance;
        var player1Overshoot = this.getPlayerScreenTopOvershoot(this.player1);
        var player2Overshoot = this.getPlayerScreenTopOvershoot(this.player2);

        if (player1Overshoot > player2Overshoot) cathupDistance = player1Overshoot;
        else cathupDistance = player2Overshoot;

        //Compute the needed speed
        var addedSpeed = cathupDistance * cameraCatchupDistanceToSpeedIncreaseFactor;
        var finalSpeed = cameraAutoScrollSpeed + addedSpeed;
        game.camera.y -= finalSpeed;

        this.updateBackgrounds(finalSpeed);
    },

    //Backgrounds
    initializeBackgrounds: function()
    {
        for (let i = 0; i < numberOfBackgrounds; i++)
        {
            var background = game.add.sprite(0, 0, "background" + i);
            background.visible = false;

            //Scaling
            background.anchor.x = 0;
            background.anchor.y = 0;
            var backgroundAspectRatio = background.height / background.width;
            background.width = gameWidth;
            background.height = gameWidth * backgroundAspectRatio;

            this.freeBackgrounds[i] = background;
        }
        
        //Queue two backgrounds. Force the first one as current, and the second one as queued
        this.queueRandomBackground(true);
        this.queueRandomBackground(false);
    },
    
    queueRandomBackground: function(forceAsCurrent)
    {
        //Get the background
        var backgroundIndex = game.rnd.integerInRange(0, this.freeBackgrounds.length - 1);
        var background = this.freeBackgrounds[backgroundIndex];
        this.freeBackgrounds.splice(backgroundIndex, 1);

        //Get the height
        var yPosition;
        if (forceAsCurrent)
        {
            yPosition = game.camera.view.y;
        }
        else
        {
            yPosition = this.currentBackground.y - background.height;
        }

        //Activate it
        background.visible = true;
        background.x = 0;
        background.y = yPosition;
        
        //Remember it
        if (forceAsCurrent) this.currentBackground = background;
        else this.queuedBackground = background;
    },

    updateBackgrounds: function(cameraHeightDelta)
    {
        //Move backgrounds
        var backgroundHeightDelta = cameraHeightDelta * backgroundParallaxFactor;
        this.currentBackground.y -= backgroundHeightDelta;
        this.queuedBackground.y -= backgroundHeightDelta; 

        //Check if it's time to queue a background
        var swapTime = (this.currentBackground.y > game.camera.view.y + game.camera.view.height);

        if (swapTime)
        {
            //Deactivate the current background
            this.freeBackgrounds.push(this.currentBackground);
            this.currentBackground.visible = false;

            //Swap the backgrounds
            this.currentBackground = this.queuedBackground;

            //Queue a new background
            this.queueRandomBackground(false);
        }
    },

    //If it's zero, the player is BELOW the top of the screen
    getPlayerScreenTopOvershoot: function(player)
    {    
        var difference = game.camera.view.y - player.y;
        if (difference > 0)
        {
            //The player is over the top of the screen
            return difference;
        }
        else 
        {
            //The player is not over the top of the screen
            return 0;
        }
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
        if (player1NotOnScreen && this.getPlayerScreenTopOvershoot(this.player1) == 0)
        {
            player1Lost = true;
        }

        var player2Lost = false;
        if (player2NotOnScreen && this.getPlayerScreenTopOvershoot(this.player2) == 0)
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
    },
    
    checkForBackToMenu: function()
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC) || game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            game.state.start("mainMenuState");
        }
    }
}