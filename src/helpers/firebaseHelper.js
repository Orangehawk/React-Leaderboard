import { dbRef } from "../config/firebaseConfig";
import { createDatabaseLog } from "./databaseLogger";

//Database functions
export const createInDatabase = (path, value, onSuccess = () => {}) => {
	dbRef.child(path).set(value, onSuccess);
};

export const updateInDatabase = (path, values, onSuccess = () => {}) => {
	dbRef.child(path).update(values, onSuccess);
};

export const removeInDatabase = (path, onSuccess = () => {}) => {
	dbRef.child(path).remove(onSuccess);
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
export const createPlayerInDatabase = (name, score, officer, onSuccess = () => {}) => {
	createInDatabase(`players/` + name, score, onSuccess);
    createDatabaseLog(`Added player \"${name}\" with score \"${score}\"`, officer);
};

export const updatePlayersInDatabase = (players, officer, onSuccess = () => {}) => {
	updateInDatabase(`players/`, players, onSuccess);
    createDatabaseLog(`Updated players: ${JSON.stringify(players)}`, officer);
};

export const removePlayerInDatabase = (name, officer, onSuccess = () => {}) => {
	removeInDatabase(`players/` + name, onSuccess);
    createDatabaseLog(`Removed player \"${name}\"`, officer);
};

export const getPlayersFromDatabase = async (path) => {
	return await getFromDatabase(path);
};
