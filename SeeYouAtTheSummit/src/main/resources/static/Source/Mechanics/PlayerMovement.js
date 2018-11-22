////////////////////
//PLAYER VARIABLES//
////////////////////
//Player movement parameters
game.gravityStrength = 50;

game.playerJumpStrength = 1000;
game.playerJumpLeeway = 15;

game.playerWallGrabLeeway = 10;
game.wallJumpYComponentFactor = 0.7;
game.wallJumpXComponentFactor = 0.5;

game.playerMoveAcceleration = 1200;
game.playerMaxHorizontalSpeed = 500;
game.playerHorizontalDrag = 20;

game.playerAirborneAccelFactor = 0.4;
game.playerAirborneDragFactor = 0.1;

//Player sprite settings
game.playerUnscaledSpriteWidth = 250;
game.playerUnscaledSpriteHeight = 200;
game.playerSpriteScale = 0.5;

game.playerSpriteCenterX = 0.47;
game.playerSpriteCenterY = 0.5;

game.playerHitboxLeftMargin = 75;
game.playerHitboxRightMargin = 90;
game.playerHitboxUpMargin = 60;
game.playerHitboxDownMargin = 3;

game.player1Color = 0xff608b;
game.player2Color = 0xff9068;

//Player input settings
game.ControlSchemes = 
{
    NotShared: {
        jump: Phaser.Keyboard.SPACEBAR,
        right: Phaser.Keyboard.D,
        left: Phaser.Keyboard.A,
        pose: Phaser.Keyboard.P,
        pieceFreeze: Phaser.Keyboard.ENTER,
        pieceRotate: Phaser.Keyboard.UP,
        pieceLeft: Phaser.Keyboard.LEFT,
        pieceRight: Phaser.Keyboard.RIGHT,
        pieceDown: Phaser.Keyboard.DOWN
    },
    Shared1: {
        jump: Phaser.Keyboard.SPACEBAR,
        right: Phaser.Keyboard.D,
        left: Phaser.Keyboard.A,
        pose: Phaser.Keyboard.W,
        pieceFreeze: Phaser.Keyboard.R,
        pieceRotate: Phaser.Keyboard.T,
        pieceLeft: Phaser.Keyboard.F,
        pieceRight: Phaser.Keyboard.H,
        pieceDown: Phaser.Keyboard.G
    },
    Shared2: 
    {
        jump: Phaser.Keyboard.UP,
        right: Phaser.Keyboard.RIGHT,
        left: Phaser.Keyboard.LEFT,
        pose: Phaser.Keyboard.P,
        pieceFreeze: Phaser.Keyboard.U,
        pieceRotate: Phaser.Keyboard.I,
        pieceLeft: Phaser.Keyboard.J,
        pieceRight: Phaser.Keyboard.L,
        pieceDown: Phaser.Keyboard.K
    }
}

//Animation codes
game.AnimationCodes = {
    NoChange: 0,
    Idle: 1,
    Run: 2,
    Jump: 3,
    Wallgrab: 4,
    Pose: 5
}


//Creation
game.createPlayer = function(playerNumber, xPosition, yPosition, playerPhysicsGroup, playerControlled = true, controlScheme)
{
    //Sprite
    var player = game.add.sprite(xPosition, yPosition, "playerSpriteSheet");
    player.name = "Player " + playerNumber;
    switch (playerNumber)
    {
        case 1:
            player.tint = game.player1Color;
            break;
        case 2:
            player.tint = game.player2Color;
        break;
        default:
            console.log("Unsupported player number " + playerNumber);
    }
    player.playerId = playerNumber;
    
    //Animation
    player.animations.add("walk", [1, 2, 3, 4, 5], 10, true);
    player.animations.add("idle", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 8, 9, 8], 4, true);
    player.animations.add("jump", [6], 1, true);
    player.animations.add("grabWall", [7], 1, true);
    player.animations.add("pose", [10], 1, true);

    player.animationCode = game.AnimationCodes.Idle;

    //Scaling
    player.anchor.setTo(game.playerSpriteCenterX, game.playerSpriteCenterY);
    player.scale.x = game.playerSpriteScale;
    player.scale.y = game.playerSpriteScale;

    //Physics
    game.physics.arcade.enable(player);
    player.body.allowGravity = false;     //We'll use our own gravity
    player.body.drag = 0;                 //We'll use our own drag
    player.body.enable = true;

    if (playerControlled)
    {
        player.body.maxVelocity.x = game.playerMaxHorizontalSpeed;
        player.body.drag.x = game.playerHorizontalDrag;
    }
    
    playerPhysicsGroup.add(player);

    //Hitbox
    player.body.setSize(
        game.playerUnscaledSpriteWidth - game.playerHitboxLeftMargin - game.playerHitboxRightMargin,
        game.playerUnscaledSpriteHeight - game.playerHitboxUpMargin - game.playerHitboxDownMargin,
        game.playerHitboxLeftMargin,
        game.playerHitboxUpMargin
    );

    //Input variables
    if (playerControlled)
    {
        player.controlScheme = controlScheme;
    }

    player.liftedJumpKey = true;

    player.playerControlled = playerControlled;
    return player;
}

//Movement
game.reactToPlayerInput = function(player, gameState, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
    //Reset acceleration
    player.body.acceleration.x = 0;
    player.body.acceleration.y = 0;
    
    //Read the input
    var rightInput = false;
    var leftInput = false;
    var jumpKey = false;
    var poseKey = false;

    if (gameState == GameStates.GameInProgress)
    {
        rightInput = game.input.keyboard.isDown(player.controlScheme.right);
        leftInput = game.input.keyboard.isDown(player.controlScheme.left);
        jumpKey = game.input.keyboard.isDown(player.controlScheme.jump);
        poseKey = game.input.keyboard.isDown(player.controlScheme.pose);
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
    var isGrounded = game.playerIsGrounded(player, groundPhysicsGroup, frozenPiecesPhysicsGroup);
    var isGrabbingWall = game.playerIsGrabbingWall(player, groundPhysicsGroup, frozenPiecesPhysicsGroup);
    
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
        player.body.acceleration.x += pushDirection * game.playerMoveAcceleration * ((isGrounded) ? 1 : game.playerAirborneAccelFactor);
    }

    //Apply drag
    if (doDrag)
    {
        var newHorSpeed = player.body.velocity.x - (movementDirection * (game.playerHorizontalDrag * ((isGrounded) ? 1 : game.playerAirborneDragFactor)));
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
    
    //Pose
    if(poseKey){
        player.animationCode = game.AnimationCodes.Pose;
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
            player.body.velocity.y = -game.playerJumpStrength * game.wallJumpYComponentFactor;
            player.body.velocity.x = -wallDirection * game.playerJumpStrength * game.wallJumpYComponentFactor;
        }
        else if (isGrounded)
        {
            player.body.y -= 1;     //This ugly hack prevents the player from technically being inside the ground and thus not jumping
            player.body.velocity.y = -game.playerJumpStrength;
        }
        
        player.liftedJumpKey = false;
    }

    
    //Gravity
    player.body.velocity.y += game.gravityStrength;

    //Set animation
    if (isGrounded)
    {
        if (pushDirection == 0)
        {
            player.animationCode = game.AnimationCodes.Idle;
        }
        else 
        {
            player.animationCode = pushDirection * game.AnimationCodes.Run;
        }
    }
    else
    {
        if (isGrabbingWall != 0)
        {
            player.animationCode = Math.sign(isGrabbingWall) * game.AnimationCodes.Wallgrab;
        } 
        else 
        player.animationCode = game.AnimationCodes.Jump;
    }
    
}

game.updatePlayerAnimation = function(player)
{
    var sign = Math.sign(player.animationCode);
    switch (Math.abs(player.animationCode))
    {
        case game.AnimationCodes.Idle: 
            player.animations.play("idle");
            player.scale.x = Math.abs(player.scale.x);
            break;
        case game.AnimationCodes.Run:
            player.scale.x = Math.abs(player.scale.x) * sign;
            player.animations.play("walk");
            break;
        case game.AnimationCodes.Jump:
            player.animations.play("jump");
            break;
        case game.AnimationCodes.Wallgrab:
            player.scale.x = Math.abs(player.scale.x) * sign;
            player.animations.play("grabWall");
            break;
        case game.AnimationCodes.Pose:
            player.animations.play("pose");
            break;
    }
}

game.playerIsGrounded = function(player, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
    //Prepare everything
    player.body.moves = false;
    var originalY = player.body.y;

    //Move the player
    player.body.y += game.playerJumpLeeway;

    //Test for collisions
    var touchingGround = game.physics.arcade.overlap(player, groundPhysicsGroup);
    if (!touchingGround) touchingGround = game.physics.arcade.overlap(player, frozenPiecesPhysicsGroup);

    //Put everything in its place
    player.body.y = originalY;
    player.body.moves = true;

    //Return the result
    return touchingGround;
}

game.playerIsGrabbingWall = function(player, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
    //Prepare everything
    player.body.moves = false;
    var originalX = player.body.x;
    
    //Check left
    player.body.x -= game.playerWallGrabLeeway;
    var grabbingLeft = game.physics.arcade.overlap(player, groundPhysicsGroup);
    if (!grabbingLeft) grabbingLeft = game.physics.arcade.overlap(player, frozenPiecesPhysicsGroup);
    player.body.x = originalX;

    //Check right
    player.body.x += game.playerWallGrabLeeway;
    var grabbingRight = game.physics.arcade.overlap(player, groundPhysicsGroup);
    if (!grabbingRight) grabbingRight = game.physics.arcade.overlap(player, frozenPiecesPhysicsGroup);
    player.body.x = originalX;
    
    //Put everything back
    player.body.moves = true;

    if (grabbingLeft) return -1;
    else if (grabbingRight) return 1;
    else return 0;
}