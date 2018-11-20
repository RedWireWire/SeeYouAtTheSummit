package RedWireWire.SeeYouAtTheSummit;

public class TetrisUpdate {

	public int playerId;
	public int timeStamp;
	
	public String actionCode;
	
	//Not used by all operations
	public int xPosition;
	public int yPosition;
	public int shape;
	
	public boolean hasBeenRead = false;
	
	
	public static TetrisUpdate NullUpdate()
	{
		TetrisUpdate value = new TetrisUpdate();
		value.actionCode = "NULL";
		return value;
	}
	
	public TetrisUpdate()
	{
		
	}
}
