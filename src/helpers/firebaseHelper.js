import { dbRef } from "../config/firebaseConfig";
import { createDatabaseLog, updateLastUpdatedTime } from "./databaseLogger";

//Database functions
export const createInDatabase = (path, value, onComplete = () => {}) => {
	dbRef.child(path).set(value, onComplete);
};

export const updateInDatabase = (path, values, onComplete = () => {}) => {
	dbRef.child(path).update(values, onComplete);
};

export const removeInDatabase = (path, onComplete = () => {}) => {
	dbRef.child(path).remove(onComplete);
};

export const getFromDatabase = async (path, limitToLast = null) => {
	let snapshot;
    
    if(limitToLast != null)
        snapshot = await dbRef.child(path).limitToLast(limitToLast).get();
    else
        snapshot = await dbRef.child(path).get();

	return snapshot.exists() ? snapshot.val() : null;
};

//Player functions
export const createPlayerInDatabase = (date, name, score, officer, onComplete = () => {}) => {
	createInDatabase(`scores/` + date + `/players/` + name, score, () => {
        createDatabaseLog(`Added (${date}) player \"${name}\" with score \"${score}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

export const updatePlayersInDatabase = (date, players, officer, onComplete = () => {}) => {
	updateInDatabase(`scores/` + date + `/players/`, players, () => {
        createDatabaseLog(`Updated (${date}) players: ${JSON.stringify(players)}`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

export const removePlayerInDatabase = (date, name, officer, onComplete = () => {}) => {
	removeInDatabase(`scores/` + date + `/players/` + name, () => {
        createDatabaseLog(`Removed (${date}) player \"${name}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

//Use date?
export const removeAllPlayersInDatabase = (date, officer, onComplete = () => {}) => {
    removeInDatabase(`scores/` + date + `/players`, () => {
        createDatabaseLog(`Removed all (${date}) players`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
}

export const getPlayersFromDatabase = async (date) => {
	return await getFromDatabase(`scores/` + date + `/players`);
};
