var matchMakingState = function(game) {

}

var webSocketSession = null;

var playerId;

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

    //Creates a websocket to the server and registers the player if successful.
    attemptToJoinMatch: function()
    {
        var url = new URL('/websocket', window.location.href);
        url.protocol = url.protocol.replace('http', 'ws');

        var path = url.href;


        webSocketSession = new WebSocket(path);

        webSocketSession.onerror = function(e) {
            console.log("WS error: " + e);
        }

        webSocketSession.onopen = function(e)
        {
            webSocketSession.onmessage = game.state.getCurrentState().processWebSocketMessage;
        }

        webSocketSession.onclose = function() {
            console.log("Closing socket");
            game.state.start("mainMenuState");

            webSocketSession = null;
	    }
    },

    //TODO: close the websocket instead
    leaveMatch: function()
    {   
        webSocketSession.close();
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
            case "LOAD_MATCH":
                playerId = parsedMessage.playerId;
                game.state.getCurrentState().goToGameplay();
                break;
        }
    }

    
    
}

