var matchMakingState = function(game) {

}

var webSocketSession = null;

matchMakingState.prototype = {

    preload: function() {
        this.registered = false;
        webSocketSession = null;
    },

    create: function() {
        if (this.allowShortcuts) this.showMatchMakingShortcuts();
        game.startLoadingScreen();
        this.attemptToJoinMatch();
    },

    attemptToJoinMatch: function()
    {
        var url = new URL('/websocket', window.location.href);
        url.protocol = url.protocol.replace('http', 'ws');

        var path = url.href;


        connection = new WebSocket(path);

        connection.onerror = function(e) {
            console.log("WS error: " + e);
        }

        connection.onopen = function(e)
        {
            connection.onmessage = game.state.getCurrentState().processWebSocketMessage;
        }

        connection.onclose = function() {
            console.log("Closing socket");
            game.state.start("mainMenuState");
	    }
    },

    //TODO: close the websocket instead
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

    goToGameplay: function()
    {
        game.state.start("onlineMultiplayerState");
    },

    processWebSocketMessage: function(msg)
    {
        var parsedMessage = JSON.parse(msg.data);

        switch(parsedMessage.operationCode)
        {
            case "FULL":
                game.state.getCurrentState().goToGameplay();
                break;
        }
    }

    
    
}

