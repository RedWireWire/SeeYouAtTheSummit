package RedWireWire.SeeYouAtTheSummit;

import java.util.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
public class PlayerController extends TextWebSocketHandler {
	
	private final int MAX_MATCH_COUNT = 30;
	
	public Match[] matches = new Match[MAX_MATCH_COUNT];
	public Map<WebSocketSession, Player> players = new ConcurrentHashMap<WebSocketSession, Player>();
	
	//Web socket operations
	private ObjectMapper mapper = new ObjectMapper();
	
	//Creates and saves a player after establishing a connection with them. 
	//If the server is full, it closes the connection.
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception
	{
		System.out.println("Established connection with " + session.getId());
		Player newPlayer = RegisterPlayer();
		if (newPlayer == null)
		{
			//Close the connection
			session.close(CloseStatus.SERVICE_OVERLOAD);
		}
		else 
		{
			//Save the player
			players.put(session,  newPlayer);
			newPlayer.webSocketSession = session;
			TellPlayersToLoadMatch(matches[newPlayer.matchRegistration.matchId]);
		}
	}
	
	//Unregisters the player that disconnected. Their opponent will be notified.
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception
	{
		Player unregisteredPlayer = players.remove(session);
		if (unregisteredPlayer != null)
		{
			UnregisterPlayer(unregisteredPlayer);
		}
	}
	
	//Receives and distributes the client's messages.
	@Override 
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception
	{
		//Get the payload
		JsonNode node = mapper.readTree(message.getPayload());
		
		//Get the player
		Player player = players.get(session);
		
		//Get the code
		String operationCode = node.get("operationCode").asText();
		
		//Distribute the message
		switch (operationCode)
		{
			case "ACCEPTANCE":
				boolean isInAcceptance = node.get("isInAcceptance").asBoolean();
				//System.out.println("Received ACCEPTANCE: " + Boolean.toString(isInAcceptance) + " from " + session.getId());
				SetAcceptance(player, isInAcceptance);
				break;
			case "PLAYER_UPDATE":
				//System.out.println("Received PLAYER_UPDATE from " + session.getId());
				PlayerUpdate newUpdate = SetNewPlayerUpdate(player, node);
				if (newUpdate != null)
				{
					SendOpponentPlayerUpdate(matches[player.matchRegistration.matchId].
							GetOtherPlayerById(player.matchRegistration.playerId), newUpdate);
				}	
				break;
			case "TETRIS_UPDATE":
				TetrisUpdate update = AddTetrisUpdate(player, node);
				Player opponent = matches[player.matchRegistration.matchId].
						GetOtherPlayerById(player.matchRegistration.playerId);
				SendTetrisUpdate(opponent, update);
				break;
			default:
				System.out.println(operationCode);
			}
		
	}
	
	///////////////
	//Matchmaking//
	///////////////
	
	//Searches for a match with free space, creating one if necessary, and creates a player. Returns said player.
	//Returns null if there was no empty space and no match could be created.
	private Player RegisterPlayer() throws Exception
	{
		MatchRegisterResult matchRegistration;
		matchRegistration = FindOpenMatch();
		if (matchRegistration == null) matchRegistration = CreateMatch();
		
		//If something went wrong
		if (matchRegistration == null)
		{
			return null;
		}
		
		//Add to match
		Match newMatch = matches[matchRegistration.matchId];
		Player newPlayer = new Player();
		newMatch.SetPlayerById(newPlayer, matchRegistration.playerId);
		newPlayer.matchRegistration = matchRegistration;
		
		return newPlayer;
	}

	private void UnregisterPlayer(Player playerToUnregister)
	{
		Match match = matches[playerToUnregister.matchRegistration.matchId];
		
		//Notify the opponent
		Player opponent = match.GetOtherPlayerById(playerToUnregister.matchRegistration.playerId);
		//TODO: notify them
		
		//Delete the player
		match.SetPlayerById(null,  playerToUnregister.matchRegistration.playerId);
	}
	
	private MatchRegisterResult FindOpenMatch()
	{
		System.out.println("Looking for an open match");
		
		for (int i = 0; i  < matches.length; i++)
		{
			if (matches[i] != null)
			{
				int openPosition = matches[i].GetOpenPosition();
				if (openPosition != -1)
				{
					System.out.println("Found open position " + openPosition + " at match " + i);
					return new MatchRegisterResult(i, openPosition);
				}
			}
		}
		
		System.out.println("No open match found.");
		return null;
	}
	
	private MatchRegisterResult CreateMatch() throws IndexOutOfBoundsException
	{
		for (int i = 0; i  < matches.length; i++)
		{
			if (matches[i] == null)
				{
					System.out.println("Creating match with id " + i);
					matches[i] = new Match();
					return new MatchRegisterResult(i, 1);
				}
		}
		
		throw(new IndexOutOfBoundsException());
	}
	
	private void TellPlayersToLoadMatch(Match match) throws Exception
	{
		if (match.GetIsReady())
		{
			ObjectNode node = mapper.createObjectNode();
			node.put("operationCode","LOAD_MATCH");
			
			node.put("playerId", 1);			
			TextMessage message = new TextMessage(node.toString());
			Player player = match.GetPlayerById(1);
			synchronized (player.webSocketSession)
			{
				player.webSocketSession.sendMessage(message);;
			}
			
			
			node.put("playerId", 2);
			message = new TextMessage(node.toString());
			player = match.GetPlayerById(2);
			synchronized (player.webSocketSession)
			{
				player.webSocketSession.sendMessage(message);;
			}
		}
	}
	


	///////////////
	//Match start//
	///////////////
	
	//Sets a player as accepting. If we thery're both acccepting, they will both be notified.
	private void SetAcceptance(Player player, boolean isInAcceptance) throws Exception
	{
		player.inAcceptance = isInAcceptance;
		Match match = matches[player.matchRegistration.matchId];
		NotifyPlayersIfBothAccept(match);
	}
	
	//Sends an ACCEPTED message to both players. 
	private void NotifyPlayersIfBothAccept(Match match) throws Exception
	{
		if (match.BothAreInAcceptance())
		{
			ObjectNode node = mapper.createObjectNode();
			node.put("operationCode", "START_MATCH");
			
			TextMessage message = new TextMessage(node.toString());
			
			Player player = match.GetPlayerById(1); 
			synchronized (player.webSocketSession)
			{
				player.webSocketSession.sendMessage(message);
			}
			
			player = match.GetPlayerById(2);
			synchronized (player.webSocketSession)
			{
				player.webSocketSession.sendMessage(message);
			}
		}
	}
	
	////////////
	//Gameplay//
	////////////
	
	//Sets a new last player update if it is more recent than the last. 
	//Returns the new update, or null if it wasn't more recent.
	private PlayerUpdate SetNewPlayerUpdate(Player player, JsonNode node) throws Exception
	{
		float newUpdateTimeStamp = node.get("timeStamp").floatValue();
		
		//Ensure that the new update is more recent
		if (player != null && (player.lastUpdate == null || player.lastUpdate.timeStamp < newUpdateTimeStamp))
		{
			//Create the update
			PlayerUpdate newUpdate = new PlayerUpdate();
			newUpdate.x = node.get("x").floatValue();
			newUpdate.y = node.get("y").floatValue();
			newUpdate.animationCode = node.get("animationCode").asInt();
			newUpdate.isDead = node.get("isDead").asBoolean();
			newUpdate.timeStamp = newUpdateTimeStamp;
			
			//Set it
			player.lastUpdate = newUpdate;
			
			return newUpdate;
		}
		else
		{
			return null;
		}
	}
	
	//Send a player update to the specified opponent
	private void SendOpponentPlayerUpdate(Player opponent, PlayerUpdate update) throws Exception
	{
		if (opponent != null)
		{
			ObjectNode node = mapper.createObjectNode();
			node.put("operationCode", "OPPONENT_UPDATE");
			node.put("x", update.x);
			node.put("y", update.y);
			node.put("animationCode", update.animationCode);
			node.put("isDead", update.isDead);
			node.put("timeStamp", update.timeStamp);
			
			TextMessage message = new TextMessage(node.toString());
			synchronized (opponent.webSocketSession)
			{
				opponent.webSocketSession.sendMessage(message);
			}
			//System.out.println("Sending update to " + opponent.webSocketSession.getId());
		}
	}
	
	//Buffers a tetris update from the specified player
	private TetrisUpdate AddTetrisUpdate(Player player, JsonNode node) 

	{
		TetrisUpdate update = new TetrisUpdate();
		update.timeStamp = node.get("timeStamp").floatValue();
		update.actionCode = node.get("actionCode").asText();
		update.xPosition = node.get("xPosition").asInt();
		update.yPosition = node.get("yPosition").asInt();
		update.shape = node.get("shape").asInt();
				
		//player.EnterTetrisUpdate(update);
		return update;
	}
	
	private void SendTetrisUpdate(Player opponent, TetrisUpdate update) throws Exception
	{
		if (opponent != null)
		{
			ObjectNode node = mapper.createObjectNode();
			node.put("operationCode", "TETRIS_UPDATE");
			node.put("actionCode", update.actionCode);
			node.put("timeStamp", update.timeStamp);
			node.put("xPosition", update.xPosition);
			node.put("yPosition", update.yPosition);
			node.put("shape", update.shape);
			
			TextMessage message = new TextMessage(node.toString());
			synchronized (opponent.webSocketSession)
			{
				opponent.webSocketSession.sendMessage(message);
			}
			//System.out.println("Sending "+ update.actionCode +" to " + opponent.webSocketSession.getId());
		}
	}
	
	
	/*
	//@PutMapping(value = "/tetrisupdate/{matchId}")
	public TetrisUpdate GetTetrisUpdate(@PathVariable int matchId, @RequestBody IDWrapper requestingPlayerId)
	{
		Player opponent = matches[matchId].GetOtherPlayerById((requestingPlayerId.id));
		return opponent.GetTetrisUpdate();
	}
	*/
	
	///////////////////
	//After the match//
	///////////////////
	//@PostMapping(value = "/rematch")
	public void ApplyForRematch(@RequestBody MatchRegisterResult request)
	{
		Match match = matches[request.matchId];
		match.GetPlayerById(request.playerId).wantsRematch = true;
		
		match.GetPlayerById(1).notifiedAboutRematch = false;
		match.GetPlayerById(2).notifiedAboutRematch = false;
	}
	
	//@PutMapping(value = "/rematch")
	public int GetRematch(@RequestBody MatchRegisterResult request)
	{
		Match oldMatch = matches[request.matchId];
		
		//If a player left, -1
		if (!oldMatch.IsFull()) return -1;
		else if (oldMatch.BothWantRematch())
		{
			//Start the rematch once both players have been notified about it
			oldMatch.GetPlayerById(request.playerId).notifiedAboutRematch = true;
			if (oldMatch.BothKnowAboutRematch())
			{
				DoRematch(request.matchId);
			}
			
			return 1;
		}
		else return 0;
	}
	
	
	//Matchmaking utilities
	
	
	private void DoRematch(int matchId)
	{
		Match newMatch = new Match();
		matches[matchId] = newMatch;
		
		newMatch.SetPlayerById(new Player(), 1);
		newMatch.SetPlayerById(new Player(), 2);	
	}
	
	
}







