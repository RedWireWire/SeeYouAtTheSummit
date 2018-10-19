var platformPiezasState = function(game) {

}

var tamañoCubo=50;
var time=45;
var spawnizq=600;
var pieceSpriteScale = 0.5;
var pararPieza=false;
platformPiezasState.prototype = {

    preload: function() {
         //Cargar sprites
         game.load.image("piece", "Assets/Sprites/cuboPrueba.png");
         game.load.image("suelo", "Assets/Sprites/TestGround.png");
    },

    create: function() {
        //Fondo
        this.stage.backgroundColor = "#2d2d2d";

        
        //Create the ground
        this.suelo = game.add.sprite(0, gameHeight - 75, "suelo");
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
        //Creacion de pieza
        this.pieza=this.createPiece(1);
        //Pieza detenida physics
        this.pieceStopPhysicsGroup = game.add.physicsGroup();


    },

    update: function() {
        pararPieza=false;
        for (var i = 0; i <= 3; i++) {
            this.dirijirPieza(this.pieza[i]);
        }
    },

    dirijirPieza: function(piezaTetris)
    {
        //Entrada por teclado.
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        
    
            //Compruebo si ENTER esta pulsado si una parte de la pieza ha colisionado y por tanto la pieza completa lo hará. 
            if (!enterKey.isDown && !piezaTetris.colision && !pararPieza) {
                //Compruebo si está colisionando con el suelo o con otra pieza.
                var tocando = this.tocandoSuelo(piezaTetris);
                if (tocando) {
                    //Desactivo colision, movimiento, activo colision de la parte de la pieza y por tanto de la pieza completa.
                    piezaTetris.body.immovable = true;
                    piezaTetris.body.moves = false;
                    piezaTetris.colision = true;
                    pararPieza=true;
                    //Añado la pieza al grupo de piezas de piezas colisionando.
                    this.pieceStopPhysicsGroup.add(piezaTetris);
                }
                //Temporizador que marca el ritmo de bajada de la pieza, cada pieza tiene su propio temporizador.
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
        //Desactivo moviento para manipularla.
        piezaTetris.body.moves = false;
        
        var originalY = piezaTetris.body.y;
        
        piezaTetris.body.y += tamañoCubo;

        //Comprubo colision con el suelo.
        var tocandoSuelo = game.physics.arcade.overlap(piezaTetris, this.groundPhysicsGroup);

        //Compruebo colision con piezas que estén colisionando.
        if(!tocandoSuelo){
            tocandoSuelo = game.physics.arcade.overlap(piezaTetris, this.pieceStopPhysicsGroup);
        }

        piezaTetris.body.y = originalY;
        piezaTetris.body.moves = true;
        
        //Devuelvo resultado.
        return tocandoSuelo;

    },
    createPiece: function(estilo){
        switch(estilo){
            case 1:
            //Creación de la pieza L
                this.pieza = new Array(3);
                
                this.pieza[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                this.pieza[1] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                this.pieza[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+tamañoCubo), "piece");
                this.pieza[3] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+(2*tamañoCubo)), "piece");
            
                break;
            case 2:
            //Creación de la pieza T.
                this.pieza = new Array(3);
                
                this.pieza[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                this.pieza[1] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                this.pieza[2] = game.add.sprite(gameWidth - (spawnizq-tamañoCubo), gameHeight - spawnizq, "piece");
                this.pieza[3] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");

                break;
            case 3:
            //Creación de la pieza Z.
                this.pieza = new Array(3);
                
                this.pieza[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                this.pieza[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq-tamañoCubo), "piece");
                this.pieza[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq-tamañoCubo), "piece");
                this.pieza[3] = game.add.sprite(gameWidth - (spawnizq-tamañoCubo), gameHeight - spawnizq, "piece");

                break;
            case 4:
            //Creación de la pieza I
                this.pieza = new Array(3);
                
                this.pieza[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                this.pieza[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");
                this.pieza[2] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+(2*tamañoCubo)), "piece");
                this.pieza[3] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+(3*tamañoCubo)), "piece");
                break;
            case 5:
            //Creación de la pieza O
                this.pieza = new Array(3);
                
                this.pieza[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                this.pieza[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");
                this.pieza[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+tamañoCubo), "piece");
                this.pieza[3] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                break;
        }
        //Inicializacion de los parametros de las piezas.
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
            //Escalando
            this.pieza[i].anchor.setTo(0.5, 0.5);
            this.pieza[i].scale.x = pieceSpriteScale;
            this.pieza[i].scale.y = pieceSpriteScale;
            this.piecePhysicsGroup.add(this.pieza[i]);
        }

        return this.pieza;
    }
}