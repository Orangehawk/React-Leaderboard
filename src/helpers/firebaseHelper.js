import firebase from "../config/firebaseConfig";
import { dbRef } from "../config/firebaseConfig";

export const pushToDatabase = (path) => {};

export const pushPlayerToDatabase = (name, score, onSuccess = ()=> {} ) => {
	dbRef.child(`players/` + name).set(score, onSuccess);
};

export const updatePlayersInDatabase = (players, onSuccess = ()=> {} ) => {
	dbRef.child(`players/`).update(players, onSuccess);
};

export const removePlayerInDatabase = (name, onSuccess = ()=> {} ) => {
	dbRef.child(`players/` + name).remove(onSuccess);
}

export const getPlayersFromDatabase = async (path) => {
	const snapshot = await dbRef.child(path).get();

	return snapshot.exists() ? snapshot.val() : null;
};
