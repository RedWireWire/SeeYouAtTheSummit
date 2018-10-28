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


mainMenuState.prototype = {

    preload: function() {
        //Load sprites
        game.load.image("cloud", "Assets/MainMenu/NubeMenuPrincipal.png");
        game.load.image("title", "Assets/MainMenu/TituloDeJuego.png");
        game.load.image("pressEnter", "Assets/MainMenu/PressEnter.png");
        game.load.image("menuBackground", "Assets/MainMenu/FondoMenuPrincipal.png");

        //Initialize variables
        this.clouds = new Array(0);
    },

    create: function() {
        
        game.stage.backgroundColor = mainMenuBackgroundColor;
        this.background = this.createBackground();

        for (let i = 0; i < numberOfClouds; i++)
        {
            this.createCloud(true);
        }
    },

    createBackground: function()
    {
        var background = game.add.image(0, 0, "menuBackground");
        
        //Placement
        background.anchor.x = 0;
        background.anchor.y = 1;
        background.x = 0;
        background.y = gameHeight;
        
        //Scaling
        var aspectRatio = background.height / background.width;
        background.width = gameWidth;
        background.height = gameWidth * aspectRatio;

        return background;
    },

    createCloud: function(startOnScreen)
    {
        var cloud = game.add.sprite(0, 0, "cloud");
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
            console.log("Creating onscreen")
        }
        else
        {
            var screenMarginX;
            var movementDirection = Math.sign(cloud.movementSpeed);
            if (movementDirection == -1) screenMarginX = gameWidth;
            else screenMarginX = 0;

            cloud.x = screenMarginX - movementDirection * Math.abs(cloud.width); 
        }
    
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
    },

    update: function() {
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
    }
}