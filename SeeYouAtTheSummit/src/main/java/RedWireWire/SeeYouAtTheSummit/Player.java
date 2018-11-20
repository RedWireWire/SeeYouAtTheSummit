package RedWireWire.SeeYouAtTheSummit;

import java.util.*;

public class Player {

	public boolean inAcceptance = false;
	
	public PlayerUpdate lastUpdate = null;
	
	
	
	//Tetris updates
	private ArrayList<TetrisUpdate> tetrisUpdates;
	
	public void EnterTetrisUpdate(TetrisUpdate update)
	{	
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
		else
		{
			tetrisUpdates.add(update);
			SortTetrisUpdates();
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
					OutputTetrisUpdates();
					return update;
				}
			}
		}
		
		return TetrisUpdate.NullUpdate();
	}
	
	private void SortTetrisUpdates()
	{
		tetrisUpdates.sort((o1, o2) -> Integer.compare(o1.timeStamp,  o2.timeStamp));
	}
	
	private void OutputTetrisUpdates()
	{
		String s = "";
		for (int i = 0; i < tetrisUpdates.size(); i++)
		{
			s += tetrisUpdates.get(i).actionCode;
			s += "(" + Boolean.toString(tetrisUpdates.get(i).hasBeenRead) + ")";
			
		}
		
		System.out.println("Contained updates: " + s);
	}
	
	//Constructor
	public Player()
	{
		tetrisUpdates = new ArrayList<TetrisUpdate>();
	}
}
