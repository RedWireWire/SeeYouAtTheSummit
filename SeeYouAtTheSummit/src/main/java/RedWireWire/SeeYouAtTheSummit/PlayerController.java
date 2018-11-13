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
	
	
	/*
	private String currentScore = "0";
	private Player currentTest;
	
	@GetMapping(value = "/score")
	public ResponseEntity<String> GetScore()
	{
		return new ResponseEntity<String>(currentScore, HttpStatus.ACCEPTED);
	}
	
	@PostMapping(value = "/score")
	public ResponseEntity<Boolean> SetScore(@RequestBody String newScore)
	{
		currentScore = newScore;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED);
	}
	
	@GetMapping(value = "/test")
	public ResponseEntity<Player> GetTest()
	{
		return new ResponseEntity<Player>(currentTest, HttpStatus.ACCEPTED);
	}
	
	@PostMapping(value = "/test")
	public ResponseEntity<Boolean> SetTest(@RequestBody Player newScore)
	{
		System.out.println(newScore.playerID);
		currentTest = newScore;
		return new ResponseEntity<Boolean>(true, HttpStatus.ACCEPTED);
	}
	
	/*
	public List<Player> players = new ArrayList<>();

	@GetMapping(value = "/players")
	public List<Player> GetPlayers()
	{
		return players;
	}
	@PostMapping(value = "/players")
	public ResponseEntity<Integer> AddPlayer(@RequestBody Player newPlayer)
	{
		players.add(newPlayer);
		newPlayer.playerID = players.size() - 1;
		return new ResponseEntity<Integer>(newPlayer.playerID, HttpStatus.CREATED);
	}

	
	
	@GetMapping(value = "/playerpositionx/{playerID}")
	public ResponseEntity<Integer> GetPlayerXPosition(@PathVariable int playerID)
	{
		return new ResponseEntity<Integer>(players.get(playerID).xPosition, HttpStatus.CREATED);
	}
	
	@PutMapping(value = "/playerpositionx/{playerID}")
	public ResponseEntity<Boolean> SetPlayerXPosition(@PathVariable int playerID, RequestBody int newXPosition)
	{
		players.get(playerID).xPosition = newXPosition;
	}
	*/
	
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





