var platformGameplayState = function(game) {

}

var gravityStrength = 50;

var playerJumpStrength = 100000;
var playerMoveAcceleration = 500;
var playerMaxHorizontalSpeed = 300;
var playerHorizontalDrag = 1200;

var playerAirborneAccelFactor = 0.4;
var playerAirborneDragFactor = 0.1;

platformGameplayState.prototype = {

    liftedJumpKey: true,

    preload: function() {
        //alert("Entered platform gameplay state");

        //Cargar sprites
        game.load.image("personaje", "Assets/Sprites/TestCharacter.png");
        game.load.image("suelo", "Assets/Sprites/TestGround.png");
    },

    create: function() {
        //alert("Create");
        
        //Fondo
        this.stage.backgroundColor = "#333333";

        //Crear suelo
        this.suelo = game.add.sprite(0, gameHeight - 100, "suelo");
        this.suelo.scale.setTo(3, 1);

        //Crear jugador
        this.jugador = game.add.sprite(0, 0,"personaje");

        //Físicas suelo        
        this.groundPhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.suelo);
        this.suelo.body.allowGravity = false;
        this.suelo.body.inmovable = true;
        this.suelo.body.moves = false;
        this.suelo.body.enable = true;
        this.groundPhysicsGroup.add(this.suelo);
        this.suelo.body.collideWorldBounds = true;
        /*
        game.physics.p2.enable(this.suelo);
        this.suelo.body.collidesWithBounds = false;
        */
        //Físicas jugador       
        this.playerPhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.jugador);
        this.jugador.body.allowGravity = false;     //We'll use our own gravity
        this.jugador.body.enable = true;
        this.playerPhysicsGroup.add(this.jugador);

        this.jugador.body.maxVelocity.x = playerMaxHorizontalSpeed;
        this.jugador.body.drag.x = playerHorizontalDrag;

        

        
        
        /*
        game.physics.p2.enable(this.jugador);
        this.jugador.body.fixedRotation = true;
        */

    },

    update: function() {
        //Player input
        this.reactToPlayerInput(this.jugador);

        //Collisions
        game.physics.arcade.collide(this.groundPhysicsGroup, this.playerPhysicsGroup)

        
    },

    //Control de jugador
    reactToPlayerInput: function(player)
    {
        //Reset acceleration
        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;
        
        //Read the input
        var rightInput = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D);
        var leftInput = game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A);
        var jumpKey = game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.keyboard.isDown(Phaser.Keyboard.UP);
        
        //Check if the we will allow jump input 
        var jumpInputIsAllowed = this.liftedJumpKey;
        this.liftedJumpKey = !jumpKey;
        
        
        //Check for airborne
        var isGrounded = this.playerIsGrounded(player);
        if (isGrounded)
        {
            player.body.drag.x = playerHorizontalDrag;
        }
        else
        {
            player.body.drag.x = playerHorizontalDrag * playerAirborneDragFactor;
        }
        
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
            player.body.acceleration.y = -playerJumpStrength;
        }
    
        //Gravity
        player.body.velocity.y += gravityStrength;
    
    },

    playerIsGrounded: function(player)
    {
        return true;
    }
}