package RedWireWire.SeeYouAtTheSummit;

public class Match {

	private int id;
	
	private Player player1;
	private Player player2;
	
	
	public Player GetPlayerById(int id)
	{
		if (id == 1) return player1;
		else return player2;
	}
	
	public int GetOpenPosition()
	{
		if (player1 == null) return 1;
		else if (player2 == null) return 2;
		else return -1;
	}
	
	public void SetPlayerById(Player player, int id)
	{
		if (id==1) player1 = player;
		else player2 = player;
		
		player.playerID = id;
	}
	
	
	public Match(int _id)
	{
		id = _id;
	}
}
