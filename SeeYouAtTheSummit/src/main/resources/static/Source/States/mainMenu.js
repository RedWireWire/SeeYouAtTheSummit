var mainMenuState = function(game) {

}

//Background
var mainMenuBackgroundColor = 0xFFC658;

//Clouds
var numberOfClouds = 10;

var minimumCloudHeightRelativeToBackground = 0.3;

var nominalCloudSpriteScale = 0.3;
var maxCloudSpriteScaleVariance = 0.2;

var nominalCloudMoveSpeed = 0.4;
var maxCloudMoveSpeedVariance = 0.3;

//Title 
var titleSpriteScale = 0.6;
var titleHeightRelativeToBackground = 0.6;
var titleFadeOffsetInMiliseconds = 2000;
var titleFadeDuration = 3000;

//Start 
var startSpriteScale = 1;
var startHeightRelativeToBackground = 0.2;
var startFadeOffsetInMiliseconds = 5000;
var startFadeDuration = 3000;

//Input
var gameStartKey = Phaser.Keyboard.ENTER;

//Buttons
var buttonsColorOut=0xFF9068;
var buttonsColorOver=0xDF4BB3;
var firstMenu=false;
var secondMenu=false;

mainMenuState.prototype = {

    preload: function() {
        //Load sprites
        game.load.image("cloud", "Assets/MainMenu/NubeMenuPrincipal.png");
        game.load.image("title", "Assets/MainMenu/TituloDeJuego.png");
        game.load.image("pressEnter", "Assets/MainMenu/PressEnter.png");
        game.load.image("menuBackground", "Assets/MainMenu/FondoMenuPrincipalSinCielo.png");
        this.loadButtons();

        //Initialize variables
        this.clouds = new Array(0);
    },

    create: function() {
        
        //Use for sorting
        this.group = game.add.group();

        //Background
        game.stage.backgroundColor = mainMenuBackgroundColor;
        this.background = this.createBackground();

        //Title
        this.title = this.createTitle();

        //Start message
        this.startMessage = this.createStartMessage();

        //Clouds
        for (let i = 0; i < numberOfClouds; i++)
        {
            this.createCloud(true);
        }

        this.group.sort("renderOrder", Phaser.Group.SORT_ASCENDING);

        //this.testRest();
    },

    createFirstMenuButtons:function(){
        var generalX=500;
        var initialY=300;
        var variacion=100;
        firstMenu=true;

        buttonMultiplayer = game.add.button(generalX,initialY, 'buttonMultiplayer', this.createSecondMenuButtons, this, 0);
        buttonSingleplayer = game.add.button(generalX,300+variacion, 'buttonSinglePlayer', this.SinglePlayer, this, 0);
        buttonTraining = game.add.button(generalX,300+(2*variacion), 'buttonTraining', this.Training, this, 0);
        //Escalado de botones.
        buttonMultiplayer.scale.x = 0.7;
        buttonMultiplayer.scale.y = 0.7;
        buttonTraining.scale.x = 0.7;
        buttonTraining.scale.y = 0.7;
        //Tintado de botones
        buttonMultiplayer.tint=buttonsColorOut;
        buttonSingleplayer.tint=buttonsColorOut;
        buttonTraining.tint=buttonsColorOut;
    },

    destroyButtons:function(){
        if(!firstMenu){
            buttonMultiplayer.destroy();
            buttonSingleplayer.destroy();
            buttonTraining.destroy();
        }
        if(!secondMenu){
            buttonOnline.destroy();
            buttonLocal.destroy();
        }
    },

    createSecondMenuButtons:function(){
        var generalX=500;
        var initialY=300;
        var variacion=100;
        var setgeneralx=20;

        firstMenu=false;
        secondMenu=true;
        this.destroyButtons();
        buttonOnline = game.add.button(generalX + (setgeneralx*2),initialY, 'buttonOnline', this.OnlineMultiplayer, this, 0);
        buttonLocal = game.add.button(generalX + setgeneralx,initialY+variacion, 'buttonLocal', this.LocalMultiplayer, this, 0);
        //Tintado de botones.
        buttonOnline.tint=buttonsColorOut;
        buttonLocal.tint=buttonsColorOut;
        
    },

    LocalMultiplayer: function(){
        game.state.start("localMultiplayerState");
    },

    OnlineMultiplayer: function(){
        game.state.start("onlineMultiplayerState");
    },

    SinglePlayer: function(){
        game.state.start("singlePlayerState");
    },

    Training: function (){
        game.state.start("trainingState");
    },

    ColorOver: function (button){
        button.tint=buttonsColorOver;
    },

    ColorOut:function (button){
        button.tint=buttonsColorOut;
    },

    changeButtonsColors: function(button){
        button.onInputOver.add(this.ColorOver,this);
        button.onInputOut.add(this.ColorOut,this);
    },
    
    createBackground: function()
    {
        var background = this.group.create(0, 0, "menuBackground");
        
        //Placement
        background.anchor.x = 0;
        background.anchor.y = 1;
        background.x = 0;
        background.y = gameHeight;
        background.renderOrder = 0;
        
        //Scaling
        var aspectRatio = background.height / background.width;
        background.width = gameWidth;
        background.height = gameWidth * aspectRatio;

        return background;
    },

    createTitle: function()
    {
        var title = this.group.create(0, 0, "title");

        //Scaling
        title.anchor.x = 0.5;
        title.anchor.y = 0.5
        title.scale.x = titleSpriteScale;
        title.scale.y = titleSpriteScale;

        //Positioning
        title.x = gameWidth / 2;
        title.y = gameHeight - this.background.height * titleHeightRelativeToBackground;
        title.renderOrder = 2;

        //Fading
        title.alpha = 0;
        title.fadeStartTime = game.time.now + titleFadeOffsetInMiliseconds;
        title.fadeEndTime = title.fadeStartTime + titleFadeDuration;
        
        return title;
    },

    createStartMessage: function()
    {
        var start = this.group.create(0, 0, "pressEnter");

        //Scaling
        start.anchor.x = 0.5;
        start.anchor.y = 0.5
        start.scale.x = startSpriteScale;
        start.scale.y = startSpriteScale;

        //Positioning
        start.x = gameWidth / 2;
        start.y = gameHeight - this.background.height * startHeightRelativeToBackground;
        start.renderOrder = 2;

        //Fading
        start.alpha = 0;
        start.fadeStartTime = game.time.now + startFadeOffsetInMiliseconds;
        start.fadeEndTime = start.fadeStartTime + startFadeDuration;
        
        return start;
    },

    createCloud: function(startOnScreen)
    {
        var cloud = this.group.create(0, 0, "cloud");
        var signArray = [-1, 1];

        //Scaling
        cloud.anchor.x = 0.5;
        cloud.anchor.y = 0.5;
        
        var scale = nominalCloudSpriteScale + game.rnd.realInRange(-maxCloudSpriteScaleVariance, maxCloudSpriteScaleVariance);
        
        cloud.scale.x = scale * game.rnd.pick(signArray);
        cloud.scale.y = scale * game.rnd.pick(signArray);

        //Movement
        cloud.movementSpeed = nominalCloudMoveSpeed + game.rnd.realInRange(-maxCloudMoveSpeedVariance, maxCloudMoveSpeedVariance);
        cloud.movementSpeed *= game.rnd.pick(signArray);

        //Y positioning
        var maxY = gameHeight - this.background.height * minimumCloudHeightRelativeToBackground;
        var minY = 0;
        cloud.y = game.rnd.realInRange(minY, maxY);

        //X positioning
        if (startOnScreen)
        {
            var maxX = gameWidth;
            var minX = 0;
            cloud.x = game.rnd.realInRange(minX, maxX);
        }
        else
        {
            var screenMarginX;
            var movementDirection = Math.sign(cloud.movementSpeed);
            if (movementDirection == -1) screenMarginX = gameWidth;
            else screenMarginX = 0;

            cloud.x = screenMarginX - movementDirection * Math.abs(cloud.width); 
        }
    
        //Layering
        cloud.renderOrder = game.rnd.pick(signArray);

        //Save the cloud
        this.clouds.push(cloud);

        cloud.enteredScreen = startOnScreen;
    },

    replaceCloud: function(cloud)
    {
        var index = this.clouds.indexOf(cloud);
        this.clouds.splice(index, 1);
        this.createCloud(false);
        cloud.destroy();
        this.group.sort("renderOrder", Phaser.Group.SORT_ASCENDING);
    },

    update: function() {
        this.checkForGameStart();
        this.updateTitleFade();
        this.updateStartMessageFade();
        this.updateClouds();
        if(firstMenu){
            this.changeButtonsColors(buttonMultiplayer);
            this.changeButtonsColors(buttonSingleplayer);
            this.changeButtonsColors(buttonTraining);
        }else if(secondMenu){
            this.changeButtonsColors(buttonLocal);
            this.changeButtonsColors(buttonOnline);
        }
    },

    updateTitleFade: function()
    {
        var now = game.time.now;

        if (now > this.title.fadeStartTime)
        {
            if (now < this.title.fadeEndTime)
            {
                var progress = (now - this.title.fadeStartTime) / (titleFadeDuration);
                this.title.alpha = progress;
            }
            else
            {
                this.title.alpha = 1;
            }
        }
    },

    updateStartMessageFade: function()
    {
        var now = game.time.now;

        if (now > this.startMessage.fadeStartTime)
        {
            if (now < this.startMessage.fadeEndTime)
            {
                var progress = (now - this.startMessage.fadeStartTime) / (startFadeDuration);
                this.startMessage.alpha = progress;
            }
            else
            {
                this.startMessage.alpha = 1;
            }
        }
    },

    updateClouds: function()
    {
        //Move the clouds
        for (let i = 0; i < this.clouds.length; i++)
        {
            this.clouds[i].x += this.clouds[i].movementSpeed;
        }

        //Check if any cloud needs to be replaced
        for (let i = 0; i < this.clouds.length; i++)
        {
            let cloud = this.clouds[i];
            let onCamera = cloud.inCamera;

            if (!cloud.enteredScreen)
            {
                cloud.enteredScreen = onCamera;
            }
            else if (!onCamera)
            {
                this.replaceCloud(cloud);
            }
        }
    },

    checkForGameStart: function()
    {
        if (game.input.keyboard.isDown(gameStartKey))
        {
            if(!firstMenu){
                this.startMessage.destroy();
                this.createFirstMenuButtons();
            }
        }
    },

    testRest: function()
    {
        var object = JSON.stringify({playerID: 11});
        $.ajax("/test", 
        {
            method: "POST",
            data: object,
            processData: false,
            
            success: function() { console.log("yes");},
            
            headers:{
                "Content-Type": "application/json"
            },
        });
    },

    loadButtons: function(){
        game.load.image("buttonMultiplayer", "Assets/MainMenu/Multiplayer.png");
        game.load.image("buttonSinglePlayer", "Assets/MainMenu/SinglePlayer.png");
        game.load.image("buttonTraining", "Assets/MainMenu/Training.png");
        game.load.image("buttonOnline", "Assets/MainMenu/Online.png");
        game.load.image("buttonLocal", "Assets/MainMenu/Local.png");
    },
}