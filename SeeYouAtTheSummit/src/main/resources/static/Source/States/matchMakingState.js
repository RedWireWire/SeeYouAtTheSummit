var matchMakingState = function(game) {

}

matchMakingState.prototype = {

    //Enables some skipping functionality for testing
    allowShortcuts: true,

    preload: function() {
        
    },

    create: function() {
        if (this.allowShortcuts) this.showMatchMakingShortcuts();
    },

    update: function() {
        if (this.allowShortcuts)
        {
            if (game.input.keyboard.isDown(Phaser.Keyboard.ONE))
            {
                onlineMultiplayerState.controlledPlayerNumber = 1;
                game.state.start("onlineMultiplayerState");
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.TWO))
            {
                onlineMultiplayerState.controlledPlayerNumber = 2;
                game.state.start("onlineMultiplayerState");
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.THREE))
            {
                game.state.start("localMultiplayerState");
            }
        }
        
    },

    showMatchMakingShortcuts: function()
    {
        var style = { font: "65px Arial", fill: "#DF4BB3", align: "center" };
        var message = "Press 1 for player 1.\n 2 for player 2.\n 3 for local.";

        var announcementText = game.add.text(gameWidth / 2, gameHeight / 2, message, style);
        console.log(message);
    }
}