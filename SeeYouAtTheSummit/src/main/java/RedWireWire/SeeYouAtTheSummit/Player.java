package RedWireWire.SeeYouAtTheSummit;

import java.util.*;

public class Player {

	public boolean inAcceptance = false;
	
	public PlayerUpdate lastUpdate = null;
	
	
	
	//Tetris updates
	private ArrayList<TetrisUpdate> tetrisUpdates;
	
	public void EnterTetrisUpdate(TetrisUpdate update)
	{
		System.out.println("Recieved " + update.actionCode);
		
		//Delete any read updates
		for (int i = 0; i < tetrisUpdates.size(); i++)
		{
			if (tetrisUpdates.get(i).hasBeenRead)
			{
				tetrisUpdates.remove(i);
				i--;
			}
		}
		
		if (tetrisUpdates == null) 
		{
			System.out.println("Tetrisupdates does not exist");
			return;
		}
		if (tetrisUpdates.size() == 0)
		{
			tetrisUpdates.add(update);
		}
		else
		{
			//Find the correct in which to enter it, sorting by timestamp
			boolean entered = false;
			for (int i = 0; i < tetrisUpdates.size(); i++)
			{
				if (update.timeStamp < tetrisUpdates.get(i).timeStamp)
				{
					tetrisUpdates.add(i, update);
					entered = true;
				}
			}
			//If we haven't entered it by this point, it's the last one
			if (!entered)
			{
				tetrisUpdates.add(update);
			}
		}
	}
	
	public TetrisUpdate GetTetrisUpdate()
	{
		//Return null if empty
		if (tetrisUpdates.size() == 0)
		{
			return TetrisUpdate.NullUpdate();
		}
		//If not empty, return the oldest available update and remove it
		else
		{
			for (int i = 0; i < tetrisUpdates.size(); i++)
			{
				TetrisUpdate update = tetrisUpdates.get(0);
				if (!update.hasBeenRead)
				{
					update.hasBeenRead = true;
					return update;
				}
			}
		}
		
		return TetrisUpdate.NullUpdate();
	}
	
	//Constructor
	public Player()
	{
		tetrisUpdates = new ArrayList<TetrisUpdate>();
	}
}
