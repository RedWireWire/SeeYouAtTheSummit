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
game.player1JumpKey = Phaser.Keyboard.SPACEBAR;
game.player1LeftMoveKey = Phaser.Keyboard.A;
game.player1RightMoveKey = Phaser.Keyboard.D;

game.player2JumpKey = Phaser.Keyboard.UP;
game.player2LeftMoveKey = Phaser.Keyboard.LEFT;
game.player2RightMoveKey = Phaser.Keyboard.RIGHT;


game.createPlayer = function(playerNumber, xPosition, yPosition, playerPhysicsGroup)
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
    
    //Animation
    player.animations.add("walk", [1, 2, 3, 4, 5], 10, true);
    player.animations.add("idle", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 8, 9, 8], 4, true);
    player.animations.add("jump", [6], 1, true);
    player.animations.add("grabWall", [7], 1, true);

    //Scaling
    player.anchor.setTo(game.playerSpriteCenterX, game.playerSpriteCenterY);
    player.scale.x = game.playerSpriteScale;
    player.scale.y = game.playerSpriteScale;

    //Physics
    game.physics.arcade.enable(player);
    player.body.allowGravity = false;     //We'll use our own gravity
    player.body.drag = 0;                 //We'll use our own drag
    player.body.enable = true;

    player.body.maxVelocity.x = game.playerMaxHorizontalSpeed;
    player.body.drag.x = game.playerHorizontalDrag;

    playerPhysicsGroup.add(player);

    //Hitbox
    player.body.setSize(
        game.playerUnscaledSpriteWidth - game.playerHitboxLeftMargin - game.playerHitboxRightMargin,
        game.playerUnscaledSpriteHeight - game.playerHitboxUpMargin - game.playerHitboxDownMargin,
        game.playerHitboxLeftMargin,
        game.playerHitboxUpMargin
    );

    //Input variables
    switch (playerNumber)
    {
        case 1:
            player.jumpKey = game.player1JumpKey;
            player.leftMoveKey = game.player1LeftMoveKey;
            player.rightMoveKey = game.player1RightMoveKey;
            break;
        case 2:
            player.jumpKey = game.player2JumpKey;
            player.leftMoveKey = game.player2LeftMoveKey;
            player.rightMoveKey = game.player2RightMoveKey;
            break;
    }

    player.liftedJumpKey = true;

    return player;
}