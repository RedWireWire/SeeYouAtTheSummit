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
		System.out.println("Established connection");
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
			NotifyPlayersIfMatchFilled(matches[newPlayer.matchRegistration.matchId]);

		}
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception
	{
		Player unregisteredPlayer = players.remove(session);
		if (unregisteredPlayer != null)
		{
			UnregisterPlayer(unregisteredPlayer);
		}
	}
	
	@Override 
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception
	{
		JsonNode node = mapper.readTree(message.getPayload());
		//At this point, we have received the message from the client, and we can use the session to identify the player.
		
		String operationCode = node.get("operation").asText();
		switch (operationCode)
		{
		case "TEST1":
			System.out.println("TEST1");
			break;
		case "TEST2":
			System.out.println("TEST2");
			break;
		default:
			System.out.println("DEFAULT");
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
	
	private void NotifyPlayersIfMatchFilled(Match match) throws Exception
	{
		if (match.GetIsReady())
		{
			ObjectNode node = mapper.createObjectNode();
			node.put("operationCode","FULL");
			
			
			TextMessage message = new TextMessage(node.toString());
			match.GetPlayerById(1).webSocketSession.sendMessage(message);
			match.GetPlayerById(2).webSocketSession.sendMessage(message);
		}
	}
	


	
	//Match start
	//@PutMapping(value = "/acceptance/{matchId}")
	public boolean SetAcceptance(@PathVariable int matchId, @RequestBody PlayerAcceptance player)
	{
		//Set the acceptance for the player, and return true if both are now in acceptance
		Match match = matches[matchId];
		match.GetPlayerById(player.playerId).inAcceptance = player.isInAcceptance;
		if (match.BothAreInAcceptance()) {
			System.out.println("yes");
		}
		return match.BothAreInAcceptance();
	}
	
	//Gameplay
	//@PutMapping(value = "/playerupdate/{matchId}")
	public PlayerUpdate Update(@PathVariable int matchId, @RequestBody PlayerUpdate receivedUpdate)
	{
		Match match = matches[matchId];
		int playerId = receivedUpdate.playerId;
		
		//Process the update
		Player player = match.GetPlayerById(playerId);
		if (player.lastUpdate == null)
		{
			player.lastUpdate = receivedUpdate;
		}
		else
		{
			float previousUpdateTime = player.lastUpdate.timeStamp;
			if (receivedUpdate.timeStamp > previousUpdateTime)
			{
				player.lastUpdate = receivedUpdate;
			}
		}
		
		
		Player otherPlayer = match.GetOtherPlayerById(playerId);
		if (otherPlayer == null)
		{
			return new PlayerUpdate();
		}
		else return otherPlayer.lastUpdate;
	}
	
	//@PostMapping(value = "/tetrisupdate/{matchId}")
	public void AddTetrisUpdate(@PathVariable int matchId, @RequestBody TetrisUpdate update)
	{
		int playerId = update.playerId;
		Player player = matches[matchId].GetPlayerById(playerId);
		player.EnterTetrisUpdate(update);
	}
	
	//@PutMapping(value = "/tetrisupdate/{matchId}")
	public TetrisUpdate GetTetrisUpdate(@PathVariable int matchId, @RequestBody IDWrapper requestingPlayerId)
	{
		Player opponent = matches[matchId].GetOtherPlayerById((requestingPlayerId.id));
		return opponent.GetTetrisUpdate();
	}
	
	//After the match
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







