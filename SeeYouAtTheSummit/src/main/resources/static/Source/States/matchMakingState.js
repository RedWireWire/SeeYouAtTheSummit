var matchMakingState = function(game) {

}

var matchId;
var controlledPlayerNumber;
matchMakingState.prototype = {

    //Enables some skipping functionality for testing
    allowShortcuts: true,

    preload: function() {
        
    },

    create: function() {
        if (this.allowShortcuts) this.showMatchMakingShortcuts();
    },

    beenUp: true,
    update: function() {
        if (this.allowShortcuts)
        {
            if (game.input.keyboard.isDown(Phaser.Keyboard.ZERO) && this.beenUp)
            {
                this.attemptToJoinMatch();
                this.beenUp = false;
            }
            if (!game.input.keyboard.isDown(Phaser.Keyboard.ZERO))
            {
                this.beenUp = true;
            }
            if (game.input.keyboard.isDown(Phaser.Keyboard.ONE))
            {
                //controlledPlayerNumber = 1;
                game.state.start("onlineMultiplayerState");
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.TWO))
            {
                controlledPlayerNumber = 2;
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
        var message = "0 to join server. \n1 for player 1.\n 2 for player 2.\n 3 for local.";

        var announcementText = game.add.text(gameWidth / 2, gameHeight / 2, message, style);
        console.log(message);
    },

    attemptToJoinMatch: function()
    {
        $.ajax(
            "match",
            {
                method: "POST",
                
                success: this.registerMatchId,
            }
        )
    },

    leaveMatch: function()
    {   
        $.ajax(
            "match",
            {
                method: "DELETE",
                success: this.unregisterFromMatch
            }
        )
    },

    registerMatchId: function(result)
    {
        if (result.matchId != -1 && result.playerId != -1)
        {
            onlineMultiplayerState.controlledPlayerNumber = result.playerId;
            onlineMultiplayerState.matchId = result.matchId;
        }
        
        console.log(result.matchId + " " + result.playerId);

        window.onbeforeunload = this.unregisterFromMatch();
    },

    unregisterFromMatch: function()
    {
        onlineMultiplayerState.controlledPlayerNumber = -1;
        onlineMultiplayerState.matchId = -1;
        window.onbeforeunload = null;
    }
    
}

