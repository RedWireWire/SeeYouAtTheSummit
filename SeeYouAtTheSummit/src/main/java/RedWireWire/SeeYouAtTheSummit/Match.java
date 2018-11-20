package RedWireWire.SeeYouAtTheSummit;

public class Match {
	
	public boolean hasStarted = false;
	
	private Player player1;
	private Player player2;
	
	private boolean isReady = false; 
	
	//Registering
	public int GetOpenPosition()
	{
		if (hasStarted) return -1;
		if (player1 == null) return 1;
		else if (player2 == null) return 2;
		else return -1;
	}
	
	public boolean GetIsReady()
	{
		return isReady;
	}
	
	//Player management
	public Player GetPlayerById(int id)
	{
		if (id == 1) return player1;
		else return player2;
	}
	
	public Player GetOtherPlayerById(int id)
	{
		if (id == 1) return player2;
		else return player1;
	}
	
 	public void SetPlayerById(Player player, int id)
	{
		if (id==1) player1 = player;
		else player2 = player;
		
		if (IsFull())
		{
			isReady = true;
		}
		else
		{
			isReady = false;
		}
	}
 	
 	
	
 	
 	//Match start
 	public boolean BothAreInAcceptance()
 	{
 		if (player1.inAcceptance && player2.inAcceptance)
 		{
 			hasStarted = true;
 			return true;
 		}
 		else return false;
 	}
 	
 	public boolean BothWantRematch()
 	{
 		return (player1.wantsRematch && player2.wantsRematch);
 	}
 	
 	public boolean BothKnowAboutRematch()
 	{
 		return (player1.notifiedAboutRematch && player2.notifiedAboutRematch);
 	}
 	
 	
 	
 	public boolean IsFull()
	{
		if (player1 != null && player2 != null) return true;
		else return false;
	}
	
	public Match()
	{
		
	}
}
