////////////////////
//TETRIS VARIABLES//
////////////////////
//Visual settings
game.pieceSpriteScale = 0.5;
game.unscaledCubeSize = 100;
game.scaledCubeSize = game.unscaledCubeSize * game.pieceSpriteScale;
game.nonFrozenAlpha = 0.5;

//Spawn points
game.pieceSpawnScreenBottomMarginInCubes = 15;
game.pieceSpawnXFromCenterInCubes = 5;

//Timings
game.autoDescendTime = 30;
game.nextPieceWaitTime = 2000;  //In miliseconds

//Brick system
game.startingBrickPositionsArraySize = 3;
game.deleteCondition = 5;


//Creation
game.nextPiece = function(playerNumber, state, controlScheme, savingFunction, mustBeSentToServer, singlePlayer = false)
{
    //Create the piece
    var screenCenterX = gameWidth / 2;
    screenCenterX -= screenCenterX % game.scaledCubeSize;

    var x;
    if (singlePlayer)
    {
        x = screenCenterX + game.scaledCubeSize / 2;
    }
    else
    {
        x = screenCenterX + ((playerNumber == 1) ? -1 : 1) * game.pieceSpawnXFromCenterInCubes * game.scaledCubeSize + game.scaledCubeSize / 2;
    }
    
    var y = game.camera.view.y + game.camera.view.height;
    y -= y % game.scaledCubeSize;
    y -= game.scaledCubeSize / 2;
    y -= game.pieceSpawnScreenBottomMarginInCubes * game.scaledCubeSize;


    game.createPiece(game.randomPieceShape(), x, y, playerNumber, state.piecePhysicsGroup, controlScheme, savingFunction, mustBeSentToServer, singlePlayer);
}

//Null controlScheme means it's online controlled
game.createPiece = function(estilo,Xpieza,Ypieza,playerNumber, piecePhysicsGroup, controlScheme, savingFunction, mustBeSentToServer, singlePlayer)
{
    var pieza = new Object();
    pieza.playerNumber = playerNumber;
    pieza.spawnX = Xpieza;
    pieza.spawnY = Ypieza;
    pieza.mustBeSentToServer = mustBeSentToServer;
    pieza.singlePlayer = singlePlayer;
    pieza.isFrozen = false;
    
    //Creation of the desired shape
    pieza.shape = estilo;
    switch(estilo){
        case 1:
        //Creación de la pieza L
            pieza.bricks = new Array(4);
            
            pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
            pieza.bricks[1] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza ,"piece");
            pieza.bricks[2] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza-game.scaledCubeSize, "piece");
            pieza.bricks[3] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza-(2*game.scaledCubeSize), "piece");
            for(let i=0;i<=3;i++){
                pieza.bricks[i].code="L";
                pieza.bricks[i].index=i;
            }
            break;
        case 2:
        //Creación de la pieza T.
            pieza.bricks = new Array(4);
            
            pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
            pieza.bricks[1] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza, "piece");
            pieza.bricks[2] = game.add.sprite(Xpieza+game.scaledCubeSize, Ypieza, "piece");
            pieza.bricks[3] = game.add.sprite(Xpieza, Ypieza-game.scaledCubeSize, "piece");
            for(let i=0;i<=3;i++){
                pieza.bricks[i].code="T";
                pieza.bricks[i].index=i;
            }
            
            break;
        case 3:
        //Creación de la pieza Z.
            pieza.bricks = new Array(4);
            
            pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
            pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza+game.scaledCubeSize, "piece");
            pieza.bricks[2] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza+game.scaledCubeSize, "piece");
            pieza.bricks[3] = game.add.sprite(Xpieza+game.scaledCubeSize, Ypieza, "piece");
            for(let i=0;i<=3;i++){
                pieza.bricks[i].code="Z";
                pieza.bricks[i].index=i; 
            }
            break;
        case 4:
        //Creación de la pieza I
            pieza.bricks = new Array(4);

            pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
            pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza-game.scaledCubeSize, "piece");
            pieza.bricks[2] = game.add.sprite(Xpieza, Ypieza-(2*game.scaledCubeSize), "piece");
            pieza.bricks[3] = game.add.sprite(Xpieza, Ypieza-(3*game.scaledCubeSize), "piece");
            for(let i=0;i<=3;i++){
                pieza.bricks[i].code="I";
                pieza.bricks[i].index=i; 
            }
            break;
        case 5:
        //Creación de la pieza O
            pieza.bricks = new Array(4);  
            
            pieza.bricks[0] = game.add.sprite(Xpieza, Ypieza, "piece");
            pieza.bricks[1] = game.add.sprite(Xpieza, Ypieza-game.scaledCubeSize, "piece");
            pieza.bricks[2] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza-game.scaledCubeSize, "piece");
            pieza.bricks[3] = game.add.sprite(Xpieza-game.scaledCubeSize, Ypieza, "piece");
            break;
    }
    
    //Brick initialization
    for (let i = 0; i <= 3; i++) {
        //Physics
        game.physics.arcade.enable(pieza.bricks[i]);
        pieza.bricks[i].body.allowGravity = false;
        pieza.bricks[i].body.immovable = false;
        
        
        //TMP
        //pieza.bricks[i].body.moves = true;
        pieza.bricks[i].body.moves = false;
        pieza.bricks[i].body.enable = true;
        piecePhysicsGroup.add(pieza.bricks[i]);

        //Sprite
        pieza.bricks[i].anchor.setTo(0.5, 0.5);
        pieza.bricks[i].scale.x = game.pieceSpriteScale;
        pieza.bricks[i].scale.y = game.pieceSpriteScale;
        pieza.bricks[i].alpha = game.nonFrozenAlpha;
    }
    
    pieza.moveTimer = 0;
    
    //Color
    switch (playerNumber)
    {
        case 1:
            pieza.allowRotate=true;
            for(let i=0;i<=3;i++){
                pieza.bricks[i].tint=game.player1Color;
            }
            break;
        case 2:
            pieza.allowRotate=true;
            for(let i=0;i<=3;i++){
                pieza.bricks[i].tint=game.player2Color;
            }
            break;
    }

    //Input
    pieza.controlScheme = controlScheme;

    //Saving
    pieza.savingFunction = savingFunction;
    pieza.savingFunction(game.state.getCurrentState(), pieza);

    return pieza;
}

game.randomPieceShape = function()
{
    return game.rnd.integerInRange(1, 5);
}

//Movement
game.directPiece = function(piezaTetris, state)
{
    //Entrada por teclado.
    enterKey = game.input.keyboard.addKey(piezaTetris.controlScheme.pieceFreeze);
    Rkey = game.input.keyboard.addKey(piezaTetris.controlScheme.pieceRotate);
    downKey = game.input.keyboard.addKey(piezaTetris.controlScheme.pieceDown);
    leftKey = game.input.keyboard.addKey(piezaTetris.controlScheme.pieceLeft);
    rightKey = game.input.keyboard.addKey(piezaTetris.controlScheme.pieceRight);

    if (!piezaTetris.isFrozen)
    {
        if (!enterKey.isDown) {

            //Rotation
            if (!Rkey.isDown) { piezaTetris.keyR = false; }
            if (Rkey.isDown && !piezaTetris.keyR ){

                var success = game.attemptToRotatePiece(
                    piezaTetris, state.groundPhysicsGroup, state.frozenPiecesPhysicsGroup);
                    
                piezaTetris.keyR = true;
                if (success && piezaTetris.mustBeSentToServer)
                {
                    state.postTetrisRotate();
                }
            }

            //Temporizador que marca el ritmo de bajada de la pieza, cada pieza tiene su propio temporizador.
            if (piezaTetris.moveTimer >= game.autoDescendTime) {
                game.lowerPiece(piezaTetris, state);
                piezaTetris.moveTimer = 0;
            }

            //Forzar el bajar
            if (!downKey.isDown) { piezaTetris.keydown = false; }
            if (downKey.isDown && !piezaTetris.keydown) {
                game.lowerPiece(piezaTetris, state);
                piezaTetris.keydown = true;
                piezaTetris.moveTimer = 0;
            }
            //Mover pieza a la izquierda.
            if (!leftKey.isDown) { piezaTetris.keyleft = false; }
            if (leftKey.isDown && !piezaTetris.keyleft) {
                var success = game.attemptToMovePiece(piezaTetris, -1);
                piezaTetris.keyleft = true;
                if (success && piezaTetris.mustBeSentToServer)
                {
                    state.postTetrisMove(piezaTetris, "LEFT");
                }
                
            }
            //Mover pieza a la derecha.
            if (!rightKey.isDown) { piezaTetris.keyright = false; }
            if (rightKey.isDown && !piezaTetris.keyright) {
                var success = game.attemptToMovePiece(piezaTetris, 1);
                piezaTetris.keyright = true;
                
                if (success && piezaTetris.mustBeSentToServer)
                {
                    state.postTetrisMove(piezaTetris, "RIGHT");
                }
            }
            piezaTetris.moveTimer++;
        }
        else
        {
            game.freezePiece(piezaTetris, state);
        }
    }    
}

game.attemptToMovePiece = function(piece, direction)
{
    if(game.isAllowedToMove(piece, direction)){
        game.movePiece(piece, direction);
        game.sfxTetrisMove.play();
        return true;
    }
    else return false;
}

game.movePiece = function(piece, direction)
{
    for (let i = 0; i < 4; i++)
    {
        piece.bricks[i].body.x += direction * game.scaledCubeSize;
    }
}

game.isAllowedToMove = function(piece, direction)
{
    var condicionDeMovimiento=true;

    //Muevo la pieza en la dirección deseada.
    game.movePiece(piece, direction);

    //Compruebo sino está fuera de los limites del mapa, si lo está devuelvo false.
    if(!game.limitesLateralesPiezas(piece,condicionDeMovimiento)){
        condicionDeMovimiento=false;
    }
    //Vuelvo a dejar la pieza en su posición.
    game.movePiece(piece,-direction);

    return condicionDeMovimiento;
}

game.limitesLateralesPiezas = function(piece, condition)
{
    var rightLimit = gameWidth;
    var leftLimit = -game.scaledCubeSize;
    
    for (let i = 0; i < 4; i++){
        if(piece.bricks[i].body.x>=rightLimit || piece.bricks[i].body.x<=leftLimit){
            condition=false;
        }
    }
    return condition;
}

game.lowerPiece = function(piece, state)
{
    //Comprueba si la pieza está colisionando con el suelo.
    if (game.piezaTocandoSuelo(piece, state.groundPhysicsGroup, state.frozenPiecesPhysicsGroup)  && 
        game.pieceIsOnScreenOrUnder(piece))
    {
        game.freezePiece(piece, state);
    }
    else
    {
        for (let i = 0; i < 4; i++)
        {
            piece.bricks[i].y += game.scaledCubeSize;
        }
        if (piece.mustBeSentToServer) state.postTetrisMove(piece, "DOWN");
        game.sfxTetrisMove.play();
    }
}

//Rotation
game.attemptToRotatePiece = function(piece, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
/*
    //TMP
    game.rotatePiece(piece);
    return true;
*/


    
    //Comprueba si la pieza se puede rotar, si se puede lo hace.
    if(game.allowRotate(piece, groundPhysicsGroup, frozenPiecesPhysicsGroup)){
        game.rotatePiece(piece);
        //Se pone el temporizador de caida de la pieza a 0.
        if (game.piezaTocandoSuelo(piece, groundPhysicsGroup, frozenPiecesPhysicsGroup)) piece.moveTimer = 0;
        game.sfxTetrisRotate.play();
        return true;
    }
    else return false;
    
}

game.rotatePiece = function(pieza)
{
    for(let i=0;i<4;i++){

        var brick=pieza.bricks[i];
        switch(brick.code){

            case "L":
            //Rotación de L
                if(brick.index==0){
                    brick.body.x -= (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==1 || brick.index==11){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    brick.index += 4;
                }else if(brick.index==3 || brick.index==9){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    brick.index+=4;
                }else if(brick.index==4){
                    brick.body.y -= (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==5 || brick.index==15){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    if(brick.index==15){brick.index=3;}
                    else{brick.index += 4;}
                }else if(brick.index==7 || brick.index==13){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    if(brick.index==13){brick.index=1;}
                    else{brick.index+=4;}
                }else if(brick.index==8){
                    brick.body.x += (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==12){
                    brick.index = 0;
                    brick.body.y += (2*game.scaledCubeSize);
                }
            break;
            
            case "T":
                //Rotacion de T
                if(brick.index==1 || brick.index==10 || brick.index==15){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    if(brick.index==15){brick.index=3;}
                    else{brick.index += 4;}
                }else if(brick.index==2 || brick.index==7 || brick.index==9){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    brick.index += 4;
                }else if(brick.index==3 || brick.index==5 || brick.index==14){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    if(brick.index==14){brick.index=2;}
                    else{brick.index+=4;}
                }else if(brick.index==6 || brick.index==11 || brick.index==13){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    if(brick.index==13){brick.index=1;}
                    else{brick.index += 4;}
                }
            break;

            case "Z":
                //Rotación de Z
                if(brick.index==1 ||brick.index==7){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    brick.index += 4;
                }else if(brick.index==2){
                    brick.body.y -= (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==3 || brick.index==13){
                    brick.body.x -= game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    if(brick.index==3){brick.index+=4;}
                    else {brick.index=1;}
                }else if(brick.index==5 || brick.index==11){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y -= game.scaledCubeSize;
                    brick.index += 4;
                }else if(brick.index==6){
                    brick.body.x += (2*game.scaledCubeSize);
                    brick.index+=4;
                }else if(brick.index==9 || brick.index==15){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    if(brick.index==9){brick.index+=4;}
                    else {brick.index=3;}
                }else if(brick.index==10){
                    brick.body.y += (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==14){
                    brick.index=2;
                    brick.body.x -= (2*game.scaledCubeSize);
                }
        break;
            
        case "I":
            //Rotación de I
                if(brick.index==0){
                    brick.body.x=brick.body.x - (2*game.scaledCubeSize);
                    brick.body.y=brick.body.y - (2*game.scaledCubeSize);
                    brick.index+=4;
                }else if(brick.index==1 || brick.index==11){
                    brick.body.x=brick.body.x -game.scaledCubeSize;
                    brick.body.y=brick.body.y - game.scaledCubeSize;
                    brick.index+=4;
                }else if(brick.index==2 || brick.index==10 || brick.index==5 || brick.index==13){
                    brick.body.x=brick.body.x;
                    brick.body.y=brick.body.y;
                    if(brick.index==13){brick.index=1;}
                    else{brick.index+=4}
                }else if(brick.index==3 || brick.index==9){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    brick.index+=4;
                }else if(brick.index==4 || brick.index==14){
                    brick.body.x += game.scaledCubeSize;
                    brick.body.y=brick.body.y - game.scaledCubeSize;
                    if(brick.index==4){brick.index+=4;}
                    else{brick.index=2}
                }else if(brick.index==6 || brick.index==12){
                    brick.body.x=brick.body.x - game.scaledCubeSize;
                    brick.body.y += game.scaledCubeSize;
                    if(brick.index==6){brick.index+=4;}
                    else{brick.index=0}
                }else if(brick.index==7){
                    brick.body.x=brick.body.x - (2*game.scaledCubeSize);
                    brick.body.y += (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==8){
                    brick.body.x += (2*game.scaledCubeSize);
                    brick.body.y += (2*game.scaledCubeSize);
                    brick.index += 4;
                }else if(brick.index==15){
                    brick.index=3;
                    brick.body.x += (2*game.scaledCubeSize);
                    brick.body.y -= (2*game.scaledCubeSize);
                }
            break;
        }   
    }

}

game.allowRotate = function(piece, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
    //Declaración de arrays donde se guardarán los parámetros originales de las piezas.
    var indOrg=new Array(4);
    var orgX=new Array(4);
    var orgY=new Array(4);

    var condicionDeRotacion=true;

    game.guardarPiece(piece,indOrg,orgX,orgY);
    //Rota la pieza.
    game.rotatePiece(piece);
    for (let i = 0; i < 4; i++){
        //Separo las piezas en diferentes ladrillos para tratarlos por separado.
        var brick = piece.bricks[i];
        //Compruebo si alguno de los ladrillos está colisionando o bien con el suelo o con alguna de las piezas, si lo está haciendo no permito rotar.
        if(game.physics.arcade.overlap(brick, groundPhysicsGroup) || game.physics.arcade.overlap(brick, frozenPiecesPhysicsGroup)){
            condicionDeRotacion=false;
        }
    }
    //Compruebo si alguno de los ladrillos está fuera de los límites del mapa.
    condicionDeRotacion=game.limitesLateralesPiezas(piece,condicionDeRotacion);

    game.cargarPiece(piece,indOrg,orgX,orgY);

    return condicionDeRotacion;
}

game.guardarPiece = function(piezaRotar,indOriginal,originalX,originalY)
{
    for(let i=0;i<4;i++){
        indOriginal[i]=piezaRotar.bricks[i].index;
        originalX[i]=piezaRotar.bricks[i].body.x;
        originalY[i]=piezaRotar.bricks[i].body.y;
    }
}

game.cargarPiece = function(piezaRotar,indOriginal,originalX,originalY)
{
    for(var i=0;i<4;i++){
        piezaRotar.bricks[i].index=indOriginal[i];
        piezaRotar.bricks[i].body.x=originalX[i];
        piezaRotar.bricks[i].body.y=originalY[i];
        
        //TMP?
        //piezaRotar.bricks[i].body.x = originalX[i];
        //piezaRotar.bricks[i].body.y = originalY[i];
    }
}

//Freezing
game.freezePiece = function(piece, state, forceFreeze = false)
{
    //Comprueba si la pieza se puede detener en el sitio en el que esté.
    if (!forceFreeze)
    {
        if (!game.pieceIsAllowedToFreeze(piece, state)) 
        {
            game.sfxTetrisCantFreeze.play();
            return;
        }
    }
    
    piece.isFrozen = true;
    for (let i = 0; i < 4; i++)
    {
        brick = piece.bricks[i];

        //Stop movement
        brick.body.immovable = true;
        brick.body.moves = false;
    
        //Start collisions
        state.frozenPiecesPhysicsGroup.add(brick);
        state.piecePhysicsGroup.remove(brick);

        //Remember this brick's position
        var brickPosition = game.getGridCoordinates(brick.x, brick.y);
        game.saveBrick(brick, brickPosition.x, brickPosition.y, state.brickPositions);
        
        //Sprite
        brick.alpha = 1;
    }

    game.sfxTetrisFreeze.play();

    if (piece.mustBeSentToServer)
    {
        state.postTetrisFreeze();
    }

    game.checkForBrickDestruction(state.brickPositions);

    

    //Create another if trhis isn't an online opponent's piece
    if (piece.controlScheme != null)
    {
        setTimeout(game.nextPiece, game.nextPieceWaitTime, piece.playerNumber, state, piece.controlScheme, piece.savingFunction, piece.mustBeSentToServer, piece.singlePlayer);
    }
}

game.pieceIsAllowedToFreeze = function(piece, state)
{
    if (!game.pieceIsOnScreenOrUnder(piece)) return false;

    var placeOccupied = false;
        for (let i = 0; i < 4; i++)
        {
            if (game.physics.arcade.overlap(piece.bricks[i], state.frozenPiecesPhysicsGroup) ||
                game.physics.arcade.overlap(piece.bricks[i], state.playerPhysicsGroup)
            )
            {
                placeOccupied = true;
                break;
            }
        }

        return !placeOccupied;
}

game.getGridCoordinates = function(xPosition, yPosition)
{
    var tmpY = yPosition;
    var tmpX = xPosition;
    //Align to grid
    tmpY += game.scaledCubeSize / 2;
    tmpX -= game.scaledCubeSize / 2;
    
    tmpY -= game.world.height - game.scaledCubeSize * game.groundHeightInCubes;
    
    //To grid
    var yCoordinate = -(tmpY / game.scaledCubeSize);
    var xCoordinate = tmpX / game.scaledCubeSize;

    return {
        x: xCoordinate,
        y: yCoordinate
    };
}

game.saveBrick = function(brick, x, y, brickPositions)
{
    game.resizeBrickArrayIfNeeded(x, y, brickPositions);
    brickPositions[x][y] = brick;
}

game.resizeBrickArrayIfNeeded = function(x, y, brickPositions)
{
    if (brickPositions.length <= x)
    {
        var originalLength = brickPositions.length;
        brickPositions.length = x + 1;

        for (let i = originalLength; i < brickPositions.length; i++)
        {
            brickPositions[i] = new Array(brickPositions[0].length);
        }
    }
    if (brickPositions[0].length <= y)
    {
        for (let i = 0; i < brickPositions.length; i++)
        {
            brickPositions[i].length = y + 1;
        }
    }
}

game.checkForBrickDestruction = function(brickPositions)
{
    //Checking for columns
    var currentGroupSize = 0;
    for (let i = 0; i < brickPositions.length; i++)
    {
        for (let j = 0; j < brickPositions[i].length; j++)
        {
            var brick = game.getBrick(i, j, brickPositions);
            var endGroup = false;
            var groupEndIndex;
            
            //First null after group
            if (!brick)
            {
                endGroup = true;
                groupEndIndex = j - 1;
            }
            //End of the column
            else if (j == brickPositions[i].length - 1)
            {
                endGroup = true;
                groupEndIndex = j;
            }
            
            //There is a brick here
            if (brick) 
            {
                currentGroupSize++;
            }

            //Check wether we need to destroy this group
            if (endGroup && currentGroupSize != 0)
            {
                if (currentGroupSize >= game.deleteCondition)
                {
                    var groupStartJ = groupEndIndex - currentGroupSize + 1;
                
                    for (let k = groupStartJ; k <= groupEndIndex; k++)
                    {
                        game.deleteBrick(i, k, brickPositions);
                    }
                }    
                currentGroupSize = 0;
            }
        }
    }

    //Checking for rows
    currentGroupSize = 0;
    for (let j = 0; j < brickPositions[0].length; j++)
    {
        for (let i = 0; i < brickPositions.length; i++)
        {
            var brick = game.getBrick(i, j, brickPositions);
            var endGroup = false;
            var groupEndIndex;
            
            //First null after group
            if (!brick)
            {
                endGroup = true;
                groupEndIndex = i - 1;
            }
            //End of the row
            else if (i == brickPositions.length - 1)
            {
                endGroup = true;
                groupEndIndex = i;
            }
            
            //There is a brick here
            if (brick) 
            {
                currentGroupSize++;
            }

            //Check wether we need to destroy this group
            if (endGroup && currentGroupSize != 0)
            {
                if (currentGroupSize >= game.deleteCondition)
                {
                    var groupStartI = groupEndIndex - currentGroupSize + 1;
                
                    for (let k = groupStartI; k <= groupEndIndex; k++)
                    {
                        game.deleteBrick(k, j, brickPositions);
                    }
                }    
                currentGroupSize = 0;
            }
        }
    }
}

game.getBrick = function(x, y, brickPositions)
{
    game.resizeBrickArrayIfNeeded(x, y, brickPositions);
    return brickPositions[x][y];
}

game.deleteBrick = function(x, y, brickPositions)
{
    var brick = game.getBrick(x, y, brickPositions);
    if (brick)
    {
        brick.destroy();
        brickPositions[x][y] = undefined;

        if (!game.sfxTetrisClear.isPlaying) game.sfxTetrisClear.play();
    }
}

//Checks
game.piezaTocandoSuelo = function(piece, groundPhysicsGroup, frozenPiecesPhysicsGroup)
{
    for (let i = 0; i < 4; i++)
    {
        //Separo las piezas en diferentes ladrillos para tratarlos por separado.
        var brick = piece.bricks[i];
        //Desactivo moviento para manipularla.
        brick.body.moves = false;
        //Guardo su y original.
        var originalY = brick.body.y;
        
        brick.body.y += game.scaledCubeSize;

        //Comprubo colision con el suelo.
        var tocandoSuelo = game.physics.arcade.overlap(brick, groundPhysicsGroup);
        
        //Compruebo colision con piezas que estén colisionando.
        if(!tocandoSuelo){
            tocandoSuelo = game.physics.arcade.overlap(brick, frozenPiecesPhysicsGroup);
        }
        //Restauro su y.
        brick.body.y = originalY;
        brick.body.moves = true;

        if (tocandoSuelo) return true;
    }
    
    return false;
}

game.pieceIsOnScreenOrUnder = function(piece)
{
    var onScreen = true;

    for (let i = 0; i < 4; i++)
    {
        if (!piece.bricks[i].inCamera) 
        {
            onScreen = false;
            break;
        }
    }
    
    if (onScreen)
    {
        return true;
    }
    else
    {
        //See if the piece is under the camera. Any brick will do.
        var brickPosition = piece.bricks[0].y;


        console.log("Brick: " + brickPosition + " Camera: " + game.camera.y);
        if (brickPosition > game.camera.y + game.camera.height / 2)
        {
            return true;
        }
        else return false;
    }
}

