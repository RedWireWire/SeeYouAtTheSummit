var platformGameplayState = function(game) {

}

var gravityStrength = 50;

var playerJumpStrength = 1000;
var playerMoveAcceleration = 500;
var playerMaxHorizontalSpeed = 500;
var playerHorizontalDrag = 1200;

var playerAirborneAccelFactor = 0.4;
var playerAirborneDragFactor = 0.1;

var playerJumpLeeway = 20;

platformGameplayState.prototype = {

    liftedJumpKey: true,

    preload: function() 
    {
        //Load sprites
        game.load.image("personaje", "Assets/Sprites/TestCharacter.png");
        game.load.image("suelo", "Assets/Sprites/TestGround.png");
    },

    create: function() {
        //Background
        this.stage.backgroundColor = "#333333";

        //Create the ground
        this.suelo = game.add.sprite(0, gameHeight - 100, "suelo");
        this.suelo.scale.setTo(3, 1);

        //Create the player
        this.jugador = game.add.sprite(0, 0,"personaje");

        //Ground physics
        this.groundPhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.suelo);
        this.suelo.body.allowGravity = false;
        this.suelo.body.immovable = true;
        this.suelo.body.moves = false;
        this.suelo.body.enable = true;
        this.groundPhysicsGroup.add(this.suelo);
        this.suelo.body.collideWorldBounds = true;
       
        //Player phsyics
        this.playerPhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.jugador);
        this.jugador.body.allowGravity = false;     //We'll use our own gravity
        this.jugador.body.drag = 0;                 //We'll use our own drag
        this.jugador.body.enable = true;
        this.playerPhysicsGroup.add(this.jugador);

        this.jugador.body.maxVelocity.x = playerMaxHorizontalSpeed;
        this.jugador.body.drag.x = playerHorizontalDrag;
    },

    update: function() {
        //Player input
        this.reactToPlayerInput(this.jugador);

        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.playerPhysicsGroup)
    },

    //Player control
    reactToPlayerInput: function(player)
    {
        //Reset acceleration
        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;
        
        //Read the input
        var rightInput = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D);
        var leftInput = game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A);
        var jumpKey = game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.keyboard.isDown(Phaser.Keyboard.UP) || game.input.keyboard.isDown(Phaser.Keyboard.W);

        //Check if we will allow jump input 
        if (!this.liftedJumpKey)
        {
            //console.log("Haven't lifted jump key");
            if (!jumpKey)
            {
                this.liftedJumpKey = true;
            }
        }
        var jumpInputIsAllowed = this.liftedJumpKey;

        //Check for airborne
        var isGrounded = this.playerIsGrounded(player);
        
        //Horizontal movement
        if (leftInput && !rightInput)
        {
            player.body.acceleration.x += -playerMoveAcceleration * ((isGrounded) ? 1 : playerAirborneAccelFactor);
        }
        else if (rightInput && !leftInput)
        {
            player.body.acceleration.x += playerMoveAcceleration * ((isGrounded) ? 1 : playerAirborneAccelFactor);
        }
        else 
        {
            player.body.acceleration.x += 0;
        }

        //Jumping
        if (jumpInputIsAllowed && jumpKey && isGrounded)
        {
            player.body.y -= 1;     //This ugly hack prevents the player from technically being inside the ground and thus not jumping
            player.body.velocity.y = -playerJumpStrength;
            this.liftedJumpKey = false;
        }
    
        //Gravity
        player.body.velocity.y += gravityStrength;

        //Drag
        var horSpeedBeforeDrag = player.body.velocity.x ;
        var horDirection = Math.sign(horSpeedBeforeDrag);
        var newHorSpeed = player.body.velocity.x - (horDirection * (playerHorizontalDrag * ((isGrounded) ? 1 : playerAirborneDragFactor)));
        if (horDirection == -1)
        {
            player.body.velocity.x = Math.min(newHorSpeed, 0);
        }
        else if (horDirection == 1)
        {
            player.body.velocity.x = Math.max(newHorSpeed, 0);
        }
        else if (horDirection == 0)
        {
            player.body.velocity.x = 0;
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
    }
}