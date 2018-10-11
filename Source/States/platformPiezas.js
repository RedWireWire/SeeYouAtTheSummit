var platformPiezasState = function(game) {

}
platformPiezasState.prototype = {

    preload: function() {
         //Cargar sprites
         game.load.image("pieza", "Assets/Sprites/cuboPrueba.png");
    },

    create: function() {
        //Fondo
        this.stage.backgroundColor = "#2d2d2d";
        
        this.pieza = game.add.sprite(300, 50,"pieza");

        
        game.physics.enable(this.pieza, Phaser.Physics.ARCADE);

        
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    },

    update: function() {
        
        this.pieza.y++;
        if (downKey.isDown)
        {
            this.pieza.y++;
        }

        if (leftKey.isDown)
        {
            this.pieza.x--;
        }
        else if (rightKey.isDown)
        {
            this.pieza.x++;
        }
    }
}