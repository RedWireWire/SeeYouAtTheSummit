function PlayerAvatar()
{
    //Visualization
    this.phaserObject = game.add.sprite(0, 0, "testCharacter");

    //Set up references
    game.physics.enable(this.phaserObject, Phaser.Physics.ARCADE);
    this.body = this.phaserObject.body;

    //Physics
    
    this.body.collideWorldBounds = true;
    this.body.setSize(20, 32, 5, 16);

    //Input
    this.directionalInput = game.input.keyboard.createCursorKeys();
    this.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //Movement tracking variables
    this.facing = "Idle";
    this.jumpTimer = game.time.now;

    //Movement functions
    this.ReadMovementInput = function()
    {
        //Kills momentum
        this.body.velocity.x = 0;

        //Set facing and horizontal velocity
        if (this.directionalInput.left.isDown) {
            this.body.velocity.x = -150;
            if (this.facing !== "Left") {
                this.facing = "Left";
            }
        }
        else if (this.directionalInput.right.isDown) {
            this.body.velocity.x = 150;

            if (this.facing !== "Right") {
                this.facing = "Right!";
            }
        }
        else {
            if (this.facing !== "Idle") {
                this.facing = 'idle';
            }
        }
    }
    this.ReadJumpInput = function()
    {
        if (this.jumpKey.isDown && this.body.onFloor() && game.time.now > this.jumpTimer) {
            this.body.velocity.y = -500;
            this.jumpTimer = game.time.now + 750;
        }
    }

    //Callbacks
    this.Update = function () {
        this.ReadMovementInput();
        this.ReadJumpInput();
    }
    
}