var matchMakingState = function(game) {

}

var matchId;
var playerId;

matchMakingState.prototype = {

    //Enables some skipping functionality for testing
    allowShortcuts: true,

    preload: function() {
        this.registered = false;
    },

    create: function() {
        if (this.allowShortcuts) this.showMatchMakingShortcuts();
    },

    //TMP
    
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
        
        if (matchMakingState.registered)
        {
            this.pollMatchFullness(matchId)
        }
    },

    //Menu
    beenUp: true,
    showMatchMakingShortcuts: function()
    {
        var style = { font: "65px Arial", fill: "#DF4BB3", align: "center" };
        var message = "0 to join server. \n1 for player 1.\n 2 for player 2.\n 3 for local.";

        var announcementText = game.add.text(gameWidth / 2, gameHeight / 2, message, style);
        console.log(message);
    },


    //AJAX requests
    attemptToJoinMatch: function()
    {
        $.ajax(
            "/match",
            {
                method: "POST",
                
                success: this.registerMatchId,
            }
        )
    },

    leaveMatch: function()
    {   
        $.ajax(
            "/match",
            {
                method: "DELETE",
                data: {
                    matchId: matchId,
                    playerId: playerId
                },
                success: this.unregisterFromMatch
            }
        )
    },

    pollMatchFullness: function(matchId)
    {
        $.ajax(
            "/match/" + matchId,
            {
                method: "GET",
                success: function(matchIsFull) { if (matchIsFull) matchMakingState.prototype.goToGameplay();}
            }
        )
    },

    goToGameplay: function()
    {
        game.state.start("onlineMultiplayerState");
    },

    //Registration callbacks
    registerMatchId: function(result)
    {
        if (result.matchId != -1 && result.playerId != -1)
        {
            matchId = result.matchId;
            playerId = result.playerId;
        }
        
        console.log("Match: " + matchId + " Player: " + playerId);

        matchMakingState.registered = true;
    },

    unregisterFromMatch: function()
    {
        navigator.sendBeacon("unregister", 
            JSON.stringify({
                matchId: matchId,
                playerId: playerId
            })
        );
    }

    
    
}

