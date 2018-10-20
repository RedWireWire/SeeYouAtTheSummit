var platformGameplayState = function(game) {

}

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
var playerSpriteScale = 0.5;
var playerHitboxWidthFactor = 0.7;
var playerHitboxHeightFactor = 1;

var player1Color = 0xff0000;
var player2Color = 0x00ff00;

//Player input settings
var player1JumpKey = Phaser.Keyboard.SPACEBAR;
var player1LeftMoveKey = Phaser.Keyboard.A;
var player1RightMoveKey = Phaser.Keyboard.D;

var player2JumpKey = Phaser.Keyboard.UP;
var player2LeftMoveKey = Phaser.Keyboard.LEFT;
var player2RightMoveKey = Phaser.Keyboard.RIGHT;


platformGameplayState.prototype = {

    liftedJumpKey: true,

    preload: function() 
    {
        //Load sprites
        game.load.image("personaje", "Assets/Sprites/TestCharacter.png");
        game.load.image("suelo", "Assets/Sprites/TestGround.png");
        game.load.spritesheet("playerSpriteSheet", "Assets/Sprites/SpriteSheetJ1.png", 250, 200, 10);
    },

    create: function() {
        //Background
        this.stage.backgroundColor = 0x333333;

        //Physics initialization
        this.createPhysicGroups();

        //Create the ground
        this.ground = this.createWall(0, gameHeight - 100, 5, 1);
        this.wall = this.createWall(600, 0, 1, 5);

        //Create the player
        this.player1 = this.createPlayer(1, 0, 0);
        this.player2 = this.createPlayer(2, 300, 0);
    },

    createPhysicGroups: function()
    {
        this.groundPhysicsGroup = game.add.physicsGroup();
        this.playerPhysicsGroup = game.add.physicsGroup();
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
        
        player.animations.add("walk", [1, 2, 3, 4, 5], 10, true);
        player.animations.add("idle", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 8, 9, 8], 4, true);
        player.animations.add("jump", [6], 1, true);
        player.animations.add("grabWall", [7], 1, true);
    
        //Scaling
        player.anchor.setTo(0.5, 0.5);
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
        player.body.width = player.body.width * playerHitboxWidthFactor;
        player.body.height = player.body.height * playerHitboxHeightFactor;

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

    update: function() {
        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.playerPhysicsGroup);

        //Player input
        this.reactToPlayerInput(this.player1);
        this.reactToPlayerInput(this.player2);

        
    },

    //Player control
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
        
        //Apply the push
        player.body.acceleration.x += pushDirection * playerMoveAcceleration * ((isGrounded) ? 1 : playerAirborneAccelFactor);

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
        var touchingGround = game.physics.arcade.overlap(player, this.groundPhysicsGroup)

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
        player.body.x = originalX;

        //Check right
        player.body.x += playerWallGrabLeeway;
        var grabbingRight = game.physics.arcade.overlap(player, this.groundPhysicsGroup);
        player.body.x = originalX;
        
        //Put everything back
        player.body.moves = true;

        if (grabbingLeft) return -1;
        else if (grabbingRight) return 1;
        else return 0;
    }
}