///////////////
//ENVIRONMENT//
///////////////

game.skyColor = 0xFFC658;

game.playerSpawnDistanceFromCenterXFraction = 4;

game.groundHeightInCubes = 5;


//Camera
game.cameraAutoScrollSpeed = 0.3;
game.cameraCatchupDistanceToSpeedIncreaseFactor = 0.05;

//Background
game.numberOfBackgrounds = 5;
game.backgroundParallaxFactor = 0.3;

//Loading
game.loadLoadingScreen = function()
{
    game.load.image("loadingScreenBackground", "Assets/EscenarioYFondos/Loading.png");
}

game.startLoadingScreen = function()
{
    var loadingScreen = game.add.sprite(0, 0, "loadingScreenBackground");
    loadingScreen.anchor.setTo(0, 0);
    loadingScreen.width = gameWidth;
    loadingScreen.height = gameHeight;
    loadingScreen.x = 0;
    loadingScreen.y = 0;

    game.loadingBackground = loadingScreen;
}

game.stopLoadingScreen = function()
{
    game.loadingBackground.destroy();
}


game.loadBackgrounds = function()
{
    for (let i = 0; i < game.numberOfBackgrounds; i++)
    {
        game.load.image("background" + i, "Assets/EscenarioYFondos/Fondo" + i + ".png");
    }
}

game.loadBackgroundTraining = function () {
        game.load.image("background", "Assets/EscenarioYFondos/FondoEntrenamiento.png");
}

//Initialization
game.initializePhysicsGroups = function(state)
{
    state.groundPhysicsGroup = game.add.physicsGroup();
    state.playerPhysicsGroup = game.add.physicsGroup();
    state.piecePhysicsGroup = game.add.physicsGroup();
    state.frozenPiecesPhysicsGroup = game.add.physicsGroup();
}

game.initializeBrickSystem = function(state)
{
    var brickSystem = new Array(game.startingBrickPositionsArraySize);
    
    for(let i=0;i < game.startingBrickPositionsArraySize; i++){
        brickSystem[i] = new Array(game.startingBrickPositionsArraySize);
    }

    state.brickPositions = brickSystem;
}

game.initializeTrainingBackground = function () {

    //Load background
    var background = game.add.sprite(0, 0, "background");
    background.visible = true;
    background.y = game.world.height - background.height/1.2;
    //Scaling
    background.anchor.x = 0;
    background.anchor.y = 0;
    var backgroundAspectRatio = background.height / background.width;
    background.width = gameWidth;
    background.height = gameWidth * backgroundAspectRatio;
    
}

game.initializeBackgrounds = function(state)
{
    //Create variables
    state.freeBackgrounds = new Array(game.numberOfBackgrounds);
    state.currentBackground;
    state.queuedBackground;

    //Load backgrounds
    for (let i = 0; i < game.numberOfBackgrounds; i++)
    {
        var background = game.add.sprite(0, 0, "background" + i);
        background.visible = false;

        //Scaling
        background.anchor.x = 0;
        background.anchor.y = 0;
        var backgroundAspectRatio = background.height / background.width;
        background.width = gameWidth;
        background.height = gameWidth * backgroundAspectRatio;

        state.freeBackgrounds[i] = background;
    }
        
    //Queue two backgrounds. Force the first one as current, and the second one as queued
    game.queueRandomBackground(true, state);
    game.queueRandomBackground(false, state);
}

//Level setup
game.setupLevel = function(state)
{
    //Background
    state.stage.backgroundColor = game.skyColor;

    //World initialization
    game.world.setBounds(0, 0, gameWidth, 100000);

    //Camera initialization
    game.camera.y = game.world.height;
    game.camera.roundPx = false;
}
game.createGround = function(state)
{
    var ground = game.add.sprite(0, 0, "ground");
    
    //Positioning
    ground.y = game.world.height - ground.height;

    //Physics
    game.physics.arcade.enable(ground);
    ground.body.allowGravity = false;
    ground.body.immovable = true;
    ground.body.moves = false;
    ground.body.enable = true;
    ground.body.collideWorldBounds = true;
    state.groundPhysicsGroup.add(ground);

    state.ground = ground;
}

//Background system
game.queueRandomBackground = function(forceAsCurrent, state)
{
    //Get the background
    var backgroundIndex = game.rnd.integerInRange(0, state.freeBackgrounds.length - 1);
    var background = state.freeBackgrounds[backgroundIndex];
    state.freeBackgrounds.splice(backgroundIndex, 1);

    //Get the height
    var yPosition;
    if (forceAsCurrent)
    {
        yPosition = game.camera.view.y;
    }
    else
    {
        yPosition = state.currentBackground.y - background.height;
    }

    //Activate it
    background.visible = true;
    background.x = 0;
    background.y = yPosition;
    
    //Remember it
    if (forceAsCurrent) state.currentBackground = background;
    else state.queuedBackground = background;
}
game.updateBackgrounds = function(cameraHeightDelta, state)
{
    //Move backgrounds
    var backgroundHeightDelta = cameraHeightDelta * game.backgroundParallaxFactor;
    state.currentBackground.y -= backgroundHeightDelta;
    state.queuedBackground.y -= backgroundHeightDelta; 

    //Check if it's time to queue a background
    var swapTime = (state.currentBackground.y > game.camera.view.y + game.camera.view.height);

    if (swapTime)
    {
        //Deactivate the current background
        state.freeBackgrounds.push(state.currentBackground);
        state.currentBackground.visible = false;

        //Swap the backgrounds
        state.currentBackground = state.queuedBackground;

        //Queue a new background
        game.queueRandomBackground(false, state);
    }
}

//Camera system
game.updateCameraPosition = function(state, player1, player2 = undefined)
{
    //See if we need to cath up
    var cathupDistance;
    var player1Overshoot = game.getPlayerScreenTopOvershoot(player1);
    var player2Overshoot = 0;
    if (player2 != undefined) player2Overshoot = game.getPlayerScreenTopOvershoot(player2);

    cathupDistance = player1Overshoot;
    if (player2Overshoot > player1Overshoot) cathupDistance = player2Overshoot;

    //Compute the needed speed
    var addedSpeed = cathupDistance * game.cameraCatchupDistanceToSpeedIncreaseFactor;
    var finalSpeed = game.cameraAutoScrollSpeed + addedSpeed;
    game.camera.y -= finalSpeed;

    game.updateBackgrounds(finalSpeed, state);
}
game.getPlayerScreenTopOvershoot = function(player)
{
    var difference = game.camera.view.y - player.y;
    if (difference > 0)
    {
        //The player is over the top of the screen
        return difference;
    }
    else 
    {
        //The player is not over the top of the screen
        return 0;
    }
}

//Others
game.announce = function(message)
{ 
    game.deletePreviousAnnouncement();

    //Message setup
    var style = { font: "65px Arial", fill: "#DF4BB3", align: "right" };

    //Show it
    game.announcementText = game.add.text(gameWidth / 2 - 150, gameHeight / 2, message, style);
    game.announcementText.anchor.setTo(1, 0.5);
    game.announcementText.x = gameWidth - 25;
    game.announcementText.y = gameHeight / 2 + 75;
    console.log(message);
    game.announcementText.fixedToCamera = true;
}

game.deletePreviousAnnouncement = function ()
{
    if (game.announcementText)
    {
        game.announcementText.destroy();
    }
}