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
export const createPlayerInDatabase = (name, score, officer, onComplete = () => {}) => {
	createInDatabase(`players/` + name, score, onComplete);
    createDatabaseLog(`Added player \"${name}\" with score \"${score}\"`, officer);
    updateLastUpdatedTime();
};

export const updatePlayersInDatabase = (players, officer, onComplete = () => {}) => {
	updateInDatabase(`players/`, players, onComplete);
    createDatabaseLog(`Updated players: ${JSON.stringify(players)}`, officer);
    updateLastUpdatedTime();
};

export const removePlayerInDatabase = (name, officer, onComplete = () => {}) => {
	removeInDatabase(`players/` + name, onComplete);
    createDatabaseLog(`Removed player \"${name}\"`, officer);
    updateLastUpdatedTime();
};

export const removeAllPlayersInDatabase = (officer, onComplete = () => {}) => {
    removeInDatabase(`players`, onComplete);
    createDatabaseLog(`Removed all players`, officer);
    updateLastUpdatedTime();
}

export const getPlayersFromDatabase = async (path) => {
	return await getFromDatabase(path);
};
