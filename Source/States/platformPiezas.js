var platformPiezasState = function(game) {

}

var tamañoCubo=100;
var time=45;

platformPiezasState.prototype = {

    preload: function() {
         //Cargar sprites
         game.load.image("piece", "Assets/Sprites/cuboPrueba.png");
         game.load.image("suelo", "Assets/Sprites/TestGround.png");
    },

    create: function() {
        //Fondo
        this.stage.backgroundColor = "#2d2d2d";
        this.pieza = new Array(3);

        this.pieza[0] = game.add.sprite(gameWidth - 650, gameHeight - 600, "piece");
        this.pieza[1] = game.add.sprite(gameWidth - 650, gameHeight - 600, "piece");
        this.pieza[2] = game.add.sprite(gameWidth - 650, gameHeight - 700, "piece");
        this.pieza[3] = game.add.sprite(gameWidth - 650, gameHeight - 800, "piece");
        
            
        
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
        for (var i = 0; i <= 3; i++) {
            game.physics.arcade.enable(this.pieza[i]);
            this.pieza[i].body.allowGravity = false;
            this.pieza[i].body.immovable = false;
            this.pieza[i].body.moves = true;
            this.pieza[i].body.enable = true;
            this.pieza[i].colision = false;
            this.pieza[i].temporizador = 0;
            this.pieza[i].keydown = false;
            this.pieza[i].keyleft = false;
            this.pieza[i].keyright = false;
            this.piecePhysicsGroup.add(this.pieza[i]);
        }
        //Pieza detenida physics
        this.pieceStopPhysicsGroup = game.add.physicsGroup();


    },

    update: function() {
        for (var i = 0; i <= 3; i++) {
            this.dirijirPieza(this.pieza[i]);
        }
    },

    dirijirPieza: function(piezaTetris)
    {
        
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);


            if (!enterKey.isDown && !piezaTetris.colision) {
                var tocando = this.tocandoSuelo(piezaTetris);
                if (tocando) {
                    piezaTetris.body.immovable = true;
                    piezaTetris.body.moves = false;
                    piezaTetris.colision = true;
                    this.pieceStopPhysicsGroup.add(piezaTetris);
                }

                if (piezaTetris.temporizador >= time) {
                    piezaTetris.body.y = piezaTetris.body.y + tamañoCubo;
                    piezaTetris.temporizador = 0;
                }

                if (!downKey.isDown) { piezaTetris.keydown = false; }
                if (downKey.isDown && !piezaTetris.keydown) {
                    piezaTetris.body.y = piezaTetris.body.y + tamañoCubo;
                    piezaTetris.keydown = true;
                }
                if (!leftKey.isDown) { piezaTetris.keyleft = false; }
                if (leftKey.isDown && !piezaTetris.keyleft) {
                    piezaTetris.body.x = piezaTetris.body.x - tamañoCubo;
                    piezaTetris.keyleft = true;
                }
                if (!rightKey.isDown) { piezaTetris.keyright = false; }
                if (rightKey.isDown && !piezaTetris.keyright) {
                    piezaTetris.body.x = piezaTetris.body.x + tamañoCubo;
                    piezaTetris.keyright = true;
                }
            } else {
                piezaTetris.body.immovable = true;
                piezaTetris.body.moves = false;
                piezaTetris.colision = true;
                this.pieceStopPhysicsGroup.add(piezaTetris);
            }
        
        piezaTetris.temporizador++;
       
    },
    
    tocandoSuelo: function(piezaTetris)
    {
       
        piezaTetris.body.moves = false;
        
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