var platformPiezasState = function(game) {

}

var tamañoCubo=100;
var temporizador=0;
var time=45;
var keydown=false;
var keyleft=false;
var keyright=false;

platformPiezasState.prototype = {

    preload: function() {
         //Cargar sprites
         game.load.image("piece", "Assets/Sprites/cuboPrueba.png");
         game.load.image("suelo", "Assets/Sprites/TestGround.png");
    },

    create: function() {
        //Fondo
        this.stage.backgroundColor = "#2d2d2d";
        
        this.pieza = game.add.sprite(gameWidth - 550, gameHeight - 550,"piece");
        
        //Create the ground
        this.suelo = game.add.sprite(0, gameHeight - 100, "suelo");
        this.suelo.scale.setTo(3, 1);

        //Ground physics
        this.groundPhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.suelo);
        this.suelo.body.allowGravity = false;
        this.suelo.body.immovable = true;
        this.suelo.body.moves = false;
        this.suelo.body.enable = true;
        this.groundPhysicsGroup.add(this.suelo);
        this.suelo.body.collideWorldBounds = true;

        //Pieza physics
        this.piecePhysicsGroup = game.add.physicsGroup();
        game.physics.arcade.enable(this.pieza); 
        this.pieza.body.allowGravity = false;
        this.pieza.body.immovable = false;
        this.pieza.body.moves = true;
        this.pieza.body.enable = true;
        this.pieza.colision=false; 
        this.piecePhysicsGroup.add(this.pieza);

        //Pieza detenida physics
        this.pieceStopPhysicsGroup = game.add.physicsGroup();


    },

    update: function() {
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        if(!enterKey.isDown && !this.pieza.colision){
            this.dirijirPieza(this.pieza);
        }else{
            this.pieza.body.immovable = true;
            this.pieza.body.moves = false;
            this.pieza.colision = true;
            this.pieceStopPhysicsGroup.add(this.pieza);
        }
    },

    dirijirPieza: function(piezaTetris)
    {

        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        
        var tocando = this.tocandoSuelo(piezaTetris);
        if(tocando){
            piezaTetris.body.immovable = true;
            piezaTetris.body.moves = false;
            piezaTetris.colision = true;
            this.pieceStopPhysicsGroup.add(piezaTetris);
        }

        if(temporizador>=time){
            piezaTetris.body.y=piezaTetris.body.y+tamañoCubo;
            temporizador=0;
        }
        
        if(!downKey.isDown){keydown=false;}
        if (downKey.isDown && !keydown)
        {
            piezaTetris.body.y=piezaTetris.body.y+tamañoCubo;
            keydown=true;
        }
        if(!leftKey.isDown){keyleft=false;}
        if (leftKey.isDown && !keyleft)
        {
            piezaTetris.body.x=piezaTetris.body.x-tamañoCubo;
            keyleft=true;
        }
        if(!rightKey.isDown){keyright=false;}
        if (rightKey.isDown && !keyright)
        {
            piezaTetris.body.x=piezaTetris.body.x+tamañoCubo;
            keyright=true;
        }
        temporizador++;
    },
    
    tocandoSuelo: function(piezaTetris)
    {
       
        piezaTetris.body.moves = false;
        this.pieceStopPhysicsGroup.add(piezaTetris);
        
        var originalY = piezaTetris.body.y;
        
        piezaTetris.body.y += tamañoCubo;

        
        var tocandoSuelo = game.physics.arcade.overlap(piezaTetris, this.groundPhysicsGroup);

        if(!tocandoSuelo){
            tocandoSuelo = game.physics.arcade.overlap(piezaTetris, this.pieceStopPhysicsGroup);
        }

        piezaTetris.body.y = originalY;
        piezaTetris.body.moves = true;

        return tocandoSuelo;
    }
}