package RedWireWire.SeeYouAtTheSummit;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class PlayerController {

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
}





