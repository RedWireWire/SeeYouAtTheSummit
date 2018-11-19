package RedWireWire.SeeYouAtTheSummit;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class PlayerController {
	
	private final int MAX_MATCH_COUNT = 30;
	
	public Match[] matches = new Match[MAX_MATCH_COUNT];
	
	public void ResetServer()
	{
		for (int i = 0; i < matches.length; i++)
		{
			matches[i] = null;
		}
	}

	//Registration
	@PostMapping(value = "/match")
	public MatchRegisterResult RegisterToMatch()
	{
		MatchRegisterResult match;
		match = FindOpenMatch();
		if (match == null) match = CreateMatch();
		
		//If something went wrong
		if (match == null)
		{
			return new MatchRegisterResult(-1, -1);
		}
		
		//Add to match
		Match newMatch = matches[match.matchId];
		Player newPlayer = new Player();
		newMatch.SetPlayerById(newPlayer, match.playerId);
		
		//Return the acquired Ids
		return match;
	}

	@DeleteMapping(value = "/match")
	public void UnregisterFromMatch(MatchRegisterResult matchRegistration)
	{
		if (matches[matchRegistration.matchId] != null)
		{
			matches[matchRegistration.matchId].SetPlayerById(null, matchRegistration.playerId);
			System.out.println("Unregistering player " + matchRegistration.playerId + " from match " + matchRegistration.matchId);
		}
		else
		{
			System.out.println("Non existant match" + matchRegistration.matchId + " could not be unregistered from by player " + matchRegistration.playerId);
		}
	}
	
	@GetMapping(value = "/match/{matchId}")
	public boolean GetMatchReadiness(@PathVariable int matchId)
	{
		Match match = matches[matchId];
		if (match != null && match.GetIsReady())
		{
			return true;
		}
		else 
		{
			return false;
		}
	}

	
	//Match start
	@PutMapping(value = "/acceptance/{matchId}")
	public boolean SetAcceptance(@PathVariable int matchId, @RequestBody PlayerAcceptance player)
	{
		//Set the acceptance for the player, and return true if both are now in acceptance
		Match match = matches[matchId];
		match.GetPlayerById(player.playerId).inAcceptance = player.isInAcceptance;
		
		return match.BothAreInAcceptance();
	}
	
	//Gameplay
	@PutMapping(value = "/playerupdate/{matchId}")
	public PlayerUpdate Update(@PathVariable int matchId, @RequestBody PlayerUpdate receivedUpdate)
	{
		Match match = matches[matchId];
		int playerId = receivedUpdate.playerId;
		
		//Process the update
		match.GetPlayerById(playerId).lastUpdate = receivedUpdate;
		
		//Return the opponent's update
		return match.GetOtherPlayerById(playerId).lastUpdate;
	}
	
	@PostMapping(value = "/tetrisupdate/{matchId}")
	public void AddTetrisUpdate(@PathVariable int matchId, @RequestBody TetrisUpdate update)
	{
		int playerId = update.playerId;
		Player player = matches[matchId].GetPlayerById(playerId);
		player.EnterTetrisUpdate(update);
	}
	
	@PutMapping(value = "/tetrisupdate/{matchId}")
	public TetrisUpdate GetTetrisUpdate(@PathVariable int matchId, @RequestBody IDWrapper requestingPlayerId)
	{
		Player opponent = matches[matchId].GetOtherPlayerById((requestingPlayerId.id));
		return opponent.GetTetrisUpdate();
	}
	
	
	
	
	//Matchmaking utilities
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
					matches[i] = new Match(i);
					return new MatchRegisterResult(i, 1);
				}
		}
		
		throw(new IndexOutOfBoundsException());
	}
	
	
	
	//Input types
	private class MatchRegisterResult
	{
		public int matchId;
		public int playerId;
		
		public MatchRegisterResult(int _matchId, int _playerId)
		{
			matchId = _matchId;
			playerId = _playerId;
		}
	}
}







