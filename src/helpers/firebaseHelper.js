import { dbRef } from "../config/firebaseConfig";
import { createDatabaseLog, updateLastUpdatedTime } from "./databaseLogger";

//-----Database functions-----
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
    
    if (limitToLast != null)
        snapshot = await dbRef.child(path).limitToLast(limitToLast).get();
    else
        snapshot = await dbRef.child(path).get();

	return snapshot.exists() ? snapshot.val() : null;
};

export const PlayersToString = (players, includeScore = true) => {
    let string = "";

    let keys = Object.keys(players);
    let count = 0;

    for(let key of keys) {
        string += key;

        if(includeScore) {
            string += ":" + players[key].score;
        }

        if(count++ < keys.length - 1) {
            string += "\n";
        }
    }

    return string;
}

//-----Player functions-----
export const createPlayerInDatabase = (date, name, score, officer, onComplete = () => {}) => {
	createInDatabase(`scores/` + date + `/players/` + name, score, () => {
        createDatabaseLog(`Added (${date}) player \"${name}\" with score \"${score.score}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

//players = Object -> Object (player) -> score, scorechange
export const updatePlayersInDatabase = (date, players, officer, onComplete = () => {}, ignoreLog = false) => {
	updateInDatabase(`scores/` + date + `/players/`, players, () => {
        if(!ignoreLog) {
            createDatabaseLog(`Updated (${date}) players: ${PlayersToString(players)}`, officer, onComplete);
        } else {
            onComplete();
        }
    });
    
    updateLastUpdatedTime();
};

export const removePlayerInDatabase = async (date, name, officer, onComplete = () => {}) => {
    let player = await getPlayerFromDatabase(date, name);
	removeInDatabase(`scores/` + date + `/players/` + name, () => {
        createDatabaseLog(`Removed (${date}) player \"${name}\" with score \"${player.score}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

export const removeAllPlayersInDatabase = (date, officer, onComplete = () => {}) => {
    removeInDatabase(`scores/` + date + `/players`, () => {
        createDatabaseLog(`Removed all (${date}) players`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
}

export const getPlayersFromDatabase = async (date) => {
	return await getFromDatabase(`scores/` + date + `/players`);
};

export const getPlayerFromDatabase = async (date, player) => {
	return await getFromDatabase(`scores/` + date + `/players/` + player);
};
