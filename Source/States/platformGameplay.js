var platformGameplayState = function(game) {

}

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

var player1Color = 0xff0000;
var player2Color = 0x00ff00;

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

var GameStates = {
    PreGame : 0,
    GameInProgress : 1,
    PlayerLost : 2,
    Draw : 3
};
var currentGameState = GameStates.PreGame;
var loserPlayer = null;
var winnerPlayer = null;

///////////////
//ENVIRONMENT//
///////////////
var groundHeightInCubes = 5;

//Camera
var cameraAutoScrollSpeed = 0.23232322;

platformGameplayState.prototype = {

    preload: function() 
    {
        //Load sprites
        game.load.image("suelo", "Assets/Sprites/TestGround.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetJ1.png", playerUnscaledSpriteWidth, playerUnscaledSpriteHeight, 10);
        game.load.image("piece", "Assets/Sprites/cuboPrueba.png");
    },    

    create: function() {
        //Background
        this.stage.backgroundColor = 0x333333;

        //World initialization
        game.world.setBounds(0, 0, gameWidth, 100000);

        //Camera initialization
        game.camera.y = game.world.height;
        game.camera.roundPx = false;

        //Physics initialization
        this.createPhysicGroups();
        
        //Create the ground
        this.ground = this.createWall(0, game.world.height - scaledCubeSize * groundHeightInCubes, 5, 10);
        //this.wall = this.createWall(600, 0, 1, 5);

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
                for(var i=0;i<=3;i++){
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
                for(var i=0;i<=3;i++){
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
                for(var i=0;i<=3;i++){
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
                for(var i=0;i<=3;i++){
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
        for (var i = 0; i <= 3; i++) {
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
                for(var i=0;i<=3;i++){
                    pieza.bricks[i].tint=player1Color;
                }

                break;
            case 2:
                pieza.keyrotateC=player2PieceRotate;
                pieza.keyfreezeC=player2PieceFreeze;
                pieza.keyleftC=player2PieceLeft;
                pieza.keyrightC=player2PieceRight;
                pieza.keydownC=player2PieceDown;
                for(var i=0;i<=3;i++){
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

        if (currentGameState == GameStates.PreGame)
        {
            currentGameState = GameStates.GameInProgress;
        }
        else if (currentGameState == GameStates.GameInProgress)
        {
            //Player input
            this.reactToPlayerInput(this.player1);
            this.reactToPlayerInput(this.player2);

            //Tetris input
            if (this.player1Piece) this.dirijirPieza(this.player1Piece);
            if (this.player2Piece) this.dirijirPieza(this.player2Piece);

            //Camera control
            this.updateCameraPosition();

            //Gamestate control
            this.checkForGameEnd();
        }
    },

    //PLAYER MOVEMENT
    reactToPlayerInput: function(player)
    {
        //Reset acceleration
        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;
        
        //Read the input
        var rightInput = game.input.keyboard.isDown(player.rightMoveKey);
        var leftInput = game.input.keyboard.isDown(player.leftMoveKey);
        var jumpKey = game.input.keyboard.isDown(player.jumpKey);

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
    
                //forzar el bajar
                if (!downKey.isDown) { piezaTetris.keydown = false; }
                if (downKey.isDown && !piezaTetris.keydown) {
                    this.lowerPiece(piezaTetris);
                    piezaTetris.keydown = true;
                    piezaTetris.moveTimer = 0;
                }
    
                if (!leftKey.isDown) { piezaTetris.keyleft = false; }
                if (leftKey.isDown && !piezaTetris.keyleft) {
                    this.movePiece(piezaTetris, -1);
                    piezaTetris.keyleft = true;
                }
    
                if (!rightKey.isDown) { piezaTetris.keyright = false; }
                if (rightKey.isDown && !piezaTetris.keyright) {
                    this.movePiece(piezaTetris, 1);
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

    piezaTocandoSuelo: function(piezaTetris)
    {
        for (i = 0; i < 4; i++)
        {
            var brick = piezaTetris.bricks[i];

            //Desactivo moviento para manipularla.
            brick.body.moves = false;
            
            var originalY = brick.body.y;
            
            brick.body.y += scaledCubeSize;

            //Comprubo colision con el suelo.
            var tocandoSuelo = game.physics.arcade.overlap(brick, this.groundPhysicsGroup);
            
            //Compruebo colision con piezas que estén colisionando.
            if(!tocandoSuelo){
                tocandoSuelo = game.physics.arcade.overlap(brick, this.frozenPiecesPhysicsGroup);
            }

            brick.body.y = originalY;
            brick.body.moves = true;

            if (tocandoSuelo) return true;
        }
        
        return false;
    },

    rotatePiece: function(piece)
    {
        for (i = 0; i < 4; i++)
        {
            this.rotateBrick(piece.bricks[i]);
        }

        if (this.piezaTocandoSuelo(piece)) piece.moveTimer = 0;
    },

    rotateBrick:function(brick){ 
        
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
    },

    lowerPiece:function(piezaTetris)
    {
        if (this.piezaTocandoSuelo(piezaTetris))
        {
            this.freezePiece(piezaTetris);
        }
        else
        {
            for (i = 0; i < 4; i++)
            {
                piezaTetris.bricks[i].body.y += scaledCubeSize;
            }
        }
    },

    movePiece: function(piezaTetris, direction)
    {
        for (i = 0; i < 4; i++)
        {
            piezaTetris.bricks[i].body.x += direction * scaledCubeSize;
        }
    },

    freezePiece: function(piezaTetris)
    {
        if (!this.pieceIsAllowedToFreeze(piezaTetris)) return;

        piezaTetris.frozen = true;
        for (i = 0; i < 4; i++)
        {
            brick = piezaTetris.bricks[i];

            //Stop movement
            brick.body.immovable = true;
            brick.body.moves = false;
        
            //Start collisions
            this.frozenPiecesPhysicsGroup.add(brick);
            this.piecePhysicsGroup.remove(brick);

            //Sprite
            brick.alpha = 1;
        }

        setTimeout(this.nextPiece, nextPieceWaitTime, piezaTetris.playerNumber, this);
        this.getGridCoordinates(piezaTetris.bricks[0].x, piezaTetris.bricks[0].y);
    },

    nextPiece: function(playerNumber, stateObject)
    {
        //Create the piece
        var screenCenterX = gameWidth / 2;
        screenCenterX -= screenCenterX % scaledCubeSize;

        var x = screenCenterX + ((playerNumber == 1) ? -1 : 1) * pieceSpawnXFromCenterInCubes * scaledCubeSize + scaledCubeSize / 2;
        var y = game.camera.bounds.bottom - pieceSpawnScreenBottomMarginInCubes * scaledCubeSize - scaledCubeSize / 2;
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

    randomPieceShape: function()
    {
        return game.rnd.integerInRange(1, 5);
    },

    pieceIsAllowedToFreeze: function(piece)
    {
        var placeOccupied = false;
        for (i = 0; i < 4; i++)
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

        console.log(yCoordinate);
        return {
            x: xCoordinate,
            y: yCoordinate
        };
    },

    updateCameraPosition: function()
    {
        game.camera.y -= cameraAutoScrollSpeed;
    },

    checkForGameEnd: function()
    {
        var player1Lost = !this.player1.inCamera;
        var player2Lost = !this.player2.inCamera;
        
        if (player1Lost && !player2Lost) 
        {
            currentGameState = GameStates.PlayerLost;
            winnerPlayer = this.player2;
            loserPlayer = this.player1;
            this.announceGameEnd();
        }
        else if (player2Lost && !player1Lost)
        {
            currentGameState = GameStates.PlayerLost;
            winnerPlayer = this.player1;
            loserPlayer = this.player2;
            this.announceGameEnd();
        }
        else if (player1Lost && player2Lost)
        {
            currentGameState = GameStates.Draw;
            this.announceGameEnd();
        }
    },

    announceGameEnd: function()
    {
        if (currentGameState == GameStates.PlayerLost)
        {
            var announcementText = game.stage.add.text(gameWidth / 2, gameHeight / 2, winnerPlayer.name + "wins!");
        }
        else if (currentGameState == GameStates.Draw)
        {
            var announcementText = game.stage.add.text(gameWidth / 2, gameHeight / 2, "Everybody loses.");
        }
    }   
}