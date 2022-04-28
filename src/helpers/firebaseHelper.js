import firebase from "../config/firebaseConfig";
import { dbRef } from "../config/firebaseConfig";

export const pushToDatabase = (path) => {};

export const pushPlayerToDatabase = (name, score) => {
	dbRef.ref().set(`players/` + name, score);
};

export const updatePlayerInDatabase = (name, score) => {};

export const getFromDatabase = async (path) => {
	const snapshot = await dbRef.child(path).get();

	return snapshot.exists() ? snapshot.val() : null;
};
