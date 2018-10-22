var platformPiezasState = function(game) {

}

var tamañoCubo=50;
var time=45;
var spawnizq=600;
var pieceSpriteScale = 0.5;

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
        this.frozenPiecesPhysicsGroup = game.add.physicsGroup();
        //Creacion de pieza
        this.pieza = this.createPiece(1);

    },

    update: function() {
        this.dirijirPieza(this.pieza)
    },

    dirijirPieza: function(piezaTetris)
    {
        //Entrada por teclado.
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        Rkey = game.input.keyboard.addKey(Phaser.Keyboard.R);

        if (!piezaTetris.frozen)
        {
            if (!enterKey.isDown) {
        
                //Compruebo si está colisionando con el suelo o con otra pieza.
                var tocando = this.tocandoSuelo(piezaTetris);
                
                //Rotation
                if (!Rkey.isDown) { piezaTetris.keyR = false; }
                if(Rkey.isDown && !piezaTetris.keyR ){
                    this.rotatePiece(piezaTetris);
                    piezaTetris.keyR = true;
                }
    
                //Freezing
                if (tocando) {
                    this.freezePiece(piezaTetris);
                }
    
                //Temporizador que marca el ritmo de bajada de la pieza, cada pieza tiene su propio temporizador.
                if (piezaTetris.moveTimer >= time) {
                    this.lowerPiece(piezaTetris);
                    piezaTetris.moveTimer = 0;
                }
    
                //forzar el bajar
                if (!downKey.isDown) { piezaTetris.keydown = false; }
                if (downKey.isDown && !piezaTetris.keydown) {
                    this.lowerPiece(piezaTetris);
                    piezaTetris.keydown = true;
                    piezaTetris.moveTimer = 0;
                }
    
                if (!leftKey.isDown) { piezaTetris.keyleft = false; }
                if (leftKey.isDown && !piezaTetris.keyleft) {
                    this.movePiece(piezaTetris, -1);
                    piezaTetris.keyleft = true;
                }
    
                if (!rightKey.isDown) { piezaTetris.keyright = false; }
                if (rightKey.isDown && !piezaTetris.keyright) {
                    this.movePiece(piezaTetris, 1);
                    piezaTetris.keyright = true;
                }
                piezaTetris.moveTimer++;
            }
            else
            {
                freezePiece(piezaTetris);
            }
        }
    },
    
    tocandoSuelo: function(piezaTetris)
    {
        for (i = 0; i < 4; i++)
        {
            var brick = piezaTetris.bricks[i];

            //Desactivo moviento para manipularla.
            brick.body.moves = false;
            
            var originalY = brick.body.y;
            
            brick.body.y += tamañoCubo;

            //Comprubo colision con el suelo.
            var tocandoSuelo = game.physics.arcade.overlap(brick, this.groundPhysicsGroup);
            
            //Compruebo colision con piezas que estén colisionando.
            if(!tocandoSuelo){
                tocandoSuelo = game.physics.arcade.overlap(brick, this.frozenPiecePhysicsGroup);
            }

            brick.body.y = originalY;
            brick.body.moves = true;

            if (tocandoSuelo) return true;
        }
        
        return false;
    },
    createPiece: function(estilo){
        var pieza = new Object();
        
        switch(estilo){
            case 1:
            //Creación de la pieza L
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                pieza.bricks[1] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                pieza.bricks[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+tamañoCubo), "piece");
                pieza.bricks[3] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+(2*tamañoCubo)), "piece");
                for(var i=0;i<=3;i++){
                    pieza.bricks[i].code="L";
                    pieza.bricks[i].index=i;
                }
                break;
            case 2:
            //Creación de la pieza T.
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                pieza.bricks[1] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                pieza.bricks[2] = game.add.sprite(gameWidth - (spawnizq-tamañoCubo), gameHeight - spawnizq, "piece");
                pieza.bricks[3] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");
                for(var i=0;i<=3;i++){
                    pieza.bricks[i].code="T";
                    pieza.bricks[i].index=i;
                }
                
                break;
            case 3:
            //Creación de la pieza Z.
                pieza.bricks = new Array(4);
                
                pieza.bricks[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                pieza.bricks[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq-tamañoCubo), "piece");
                pieza.bricks[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq-tamañoCubo), "piece");
                pieza.bricks[3] = game.add.sprite(gameWidth - (spawnizq-tamañoCubo), gameHeight - spawnizq, "piece");
                for(var i=0;i<=3;i++){
                    pieza.bricks[i].code="Z";
                    pieza.bricks[i].index=i; 
                }
                break;
            case 4:
            //Creación de la pieza I
                pieza.bricks = new Array(4);

                pieza.bricks[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                pieza.bricks[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");
                pieza.bricks[2] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+(2*tamañoCubo)), "piece");
                pieza.bricks[3] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+(3*tamañoCubo)), "piece");
                for(var i=0;i<=3;i++){
                    pieza.bricks[i].code="I";
                    pieza.bricks[i].index=i; 
                }
                break;
            case 5:
            //Creación de la pieza O
                pieza.bricks = new Array(4);  
                
                pieza.bricks[0] = game.add.sprite(gameWidth - spawnizq, gameHeight - spawnizq, "piece");
                pieza.bricks[1] = game.add.sprite(gameWidth - spawnizq, gameHeight - (spawnizq+tamañoCubo), "piece");
                pieza.bricks[2] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - (spawnizq+tamañoCubo), "piece");
                pieza.bricks[3] = game.add.sprite(gameWidth - (spawnizq+tamañoCubo), gameHeight - spawnizq, "piece");
                break;
        }
        
        //Inicializacion de los parametros de las piezas.
        for (var i = 0; i <= 3; i++) {
            game.physics.arcade.enable(pieza.bricks[i]);
            pieza.bricks[i].body.allowGravity = false;
            pieza.bricks[i].body.immovable = false;
            pieza.bricks[i].body.moves = true;
            pieza.bricks[i].body.enable = true;
            pieza.bricks[i].colision = false;
            
            //Escalando
            pieza.bricks[i].anchor.setTo(0.5, 0.5);
            pieza.bricks[i].scale.x = pieceSpriteScale;
            pieza.bricks[i].scale.y = pieceSpriteScale;
            this.piecePhysicsGroup.add(pieza.bricks[i]);
        }
        
        pieza.moveTimer = 0;

        return pieza;
    },
    rotatePiece: function(piece)
    {
        for (i = 0; i < 4; i++)
        {
            this.rotateBrick(piece.bricks[i]);
        }
    },
    rotateBrick:function(piezaTetris){ //Cambia el nombre del parámetro a brick
        //code2 ahora es index
        
        switch(piezaTetris.code){

            case "L":
            //Rotación de L
                if(piezaTetris.code2==0){
                    piezaTetris.body.x=piezaTetris.body.x -(2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==1 || piezaTetris.code2==11){
                    piezaTetris.body.x=piezaTetris.body.x -tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y-tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==3 || piezaTetris.code2==9){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==4){
                    piezaTetris.body.x=piezaTetris.body.x;
                    piezaTetris.body.y=piezaTetris.body.y-(2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==5 || piezaTetris.code2==15){
                    piezaTetris.body.x=piezaTetris.body.x +tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y-tamañoCubo;
                    if(piezaTetris.code2==15){piezaTetris.code2=3;}
                    else{piezaTetris.code2+=4;}
                }else if(piezaTetris.code2==7 || piezaTetris.code2==13){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    if(piezaTetris.code2==13){piezaTetris.code2=1;}
                    else{piezaTetris.code2+=4;}
                }else if(piezaTetris.code2==8){
                    piezaTetris.body.x=piezaTetris.body.x + (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==12){
                    piezaTetris.code2=0;
                    piezaTetris.body.x=piezaTetris.body.x;
                    piezaTetris.body.y=piezaTetris.body.y+(2*tamañoCubo);
                }
            break;
        
            case "T":
                //Rotacion de T
                if(piezaTetris.code2==1 || piezaTetris.code2==10 || piezaTetris.code2==15){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y - tamañoCubo;
                    if(piezaTetris.code2==15){piezaTetris.code2=3;}
                    else{piezaTetris.code2+=4;}
                }else if(piezaTetris.code2==2 || piezaTetris.code2==7 || piezaTetris.code2==9){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==3 || piezaTetris.code2==5 || piezaTetris.code2==14){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    if(piezaTetris.code2==14){piezaTetris.code2=2;}
                    else{piezaTetris.code2+=4;}
                }else if(piezaTetris.code2==6 || piezaTetris.code2==11 || piezaTetris.code2==13){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y - tamañoCubo;
                    if(piezaTetris.code2==13){piezaTetris.code2=1;}
                    else{piezaTetris.code2+=4;}
                }
            break;

            case "Z":
                //Rotación de Z
                if(piezaTetris.code2==1 ||piezaTetris.code2==7){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y - tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==2){
                    piezaTetris.body.x=piezaTetris.body.x ;
                    piezaTetris.body.y=piezaTetris.body.y - (2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==3 || piezaTetris.code2==13){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    if(piezaTetris.code2==3){piezaTetris.code2+=4;}
                    else {piezaTetris.code2=1;}
                }else if(piezaTetris.code2==5 || piezaTetris.code2==11){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y -tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==6){
                    piezaTetris.body.x=piezaTetris.body.x + (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y ;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==9 || piezaTetris.code2==15){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    if(piezaTetris.code2==9){piezaTetris.code2+=4;}
                    else {piezaTetris.code2=3;}
                }else if(piezaTetris.code2==10){
                    piezaTetris.body.x=piezaTetris.body.x;
                    piezaTetris.body.y=piezaTetris.body.y + (2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==14){
                    piezaTetris.code2=2;
                    piezaTetris.body.x=piezaTetris.body.x - (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y ;
                }
        break;
        
        case "I":
            //Rotación de I
                if(piezaTetris.code2==0){
                    piezaTetris.body.x=piezaTetris.body.x - (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y - (2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==1 || piezaTetris.code2==11){
                    piezaTetris.body.x=piezaTetris.body.x -tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y - tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==2 || piezaTetris.code2==10 || piezaTetris.code2==5 || piezaTetris.code2==13){
                    piezaTetris.body.x=piezaTetris.body.x;
                    piezaTetris.body.y=piezaTetris.body.y;
                    if(piezaTetris.code2==13){piezaTetris.code2=1;}
                    else{piezaTetris.code2+=4}
                }else if(piezaTetris.code2==3 || piezaTetris.code2==9){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==4 || piezaTetris.code2==14){
                    piezaTetris.body.x=piezaTetris.body.x + tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y - tamañoCubo;
                    if(piezaTetris.code2==4){piezaTetris.code2+=4;}
                    else{piezaTetris.code2=2}
                }else if(piezaTetris.code2==6 || piezaTetris.code2==12){
                    piezaTetris.body.x=piezaTetris.body.x - tamañoCubo;
                    piezaTetris.body.y=piezaTetris.body.y + tamañoCubo;
                    if(piezaTetris.code2==6){piezaTetris.code2+=4;}
                    else{piezaTetris.code2=0}
                }else if(piezaTetris.code2==7){
                    piezaTetris.body.x=piezaTetris.body.x - (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y + (2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==8){
                    piezaTetris.body.x=piezaTetris.body.x + (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y + (2*tamañoCubo);
                    piezaTetris.code2+=4;
                }else if(piezaTetris.code2==15){
                    piezaTetris.code2=3;
                    piezaTetris.body.x=piezaTetris.body.x + (2*tamañoCubo);
                    piezaTetris.body.y=piezaTetris.body.y - (2*tamañoCubo);
                }
            break;
        
        }
    },

    lowerPiece:function(piezaTetris)
    {
        for (i = 0; i < 4; i++)
        {
            piezaTetris.bricks[i].body.y += tamañoCubo;
        }
    },

    movePiece: function(piezaTetris, direction)
    {
        for (i = 0; i < 4; i++)
        {
            piezaTetris.bricks[i].body.x += direction * tamañoCubo;
        }
    },

    freezePiece: function(piezaTetris)
    {
        piezaTetris.frozen = true;
        for (i = 0; i < 4; i++)
        {
            brick = piezaTetris.bricks[i];

            //Desactivo colision, movimiento, activo colision de la parte de la pieza y por tanto de la pieza completa.
            brick.body.immovable = true;
            brick.body.moves = false;
            

            this.frozenPiecesPhysicsGroup.add(brick);
            this.piecePhysicsGroup.remove(brick);
        }
    }
}