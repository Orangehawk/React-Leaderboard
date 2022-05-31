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

//-----Helper Functions-----
export const playersToString = (players, includeScore = true) => {
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

export const getDateFormattedUTC = (date) => {
    return date.utc().format("YYYY-MM-DD");
};

//-----Player functions-----
export const createPlayerInDatabase = (date, name, score, officer, onComplete = () => {}) => {
	createInDatabase(`scores/` + getDateFormattedUTC(date) + `/players/` + name, score, () => {
        createDatabaseLog(`Added (${getDateFormattedUTC(date)}) player \"${name}\" with score \"${score.score}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

//players = Object -> Object (player) -> score, scorechange
export const updatePlayersInDatabase = (date, players, officer, onComplete = () => {}, ignoreLog = false) => {
	updateInDatabase(`scores/` + getDateFormattedUTC(date) + `/players/`, players, () => {
        if(!ignoreLog) {
            createDatabaseLog(`Updated (${getDateFormattedUTC(date)}) players: ${playersToString(players)}`, officer, onComplete);
        } else {
            onComplete();
        }
    });
    
    updateLastUpdatedTime();
};

export const removePlayerInDatabase = async (date, name, officer, onComplete = () => {}) => {
    let player = await getPlayerFromDatabase(date, name);
	removeInDatabase(`scores/` + getDateFormattedUTC(date) + `/players/` + name, () => {
        createDatabaseLog(`Removed (${getDateFormattedUTC(date)}) player \"${name}\" with score \"${player.score}\"`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
};

export const removeAllPlayersInDatabase = (date, officer, onComplete = () => {}) => {
    removeInDatabase(`scores/` + getDateFormattedUTC(date) + `/players`, () => {
        createDatabaseLog(`Removed all (${getDateFormattedUTC(date)}) players`, officer, onComplete);
    });
    
    updateLastUpdatedTime();
}

export const getPlayersFromDatabase = async (date) => {
	return await getFromDatabase(`scores/` + getDateFormattedUTC(date) + `/players`);
};

export const getPlayerFromDatabase = async (date, player) => {
	return await getFromDatabase(`scores/` + getDateFormattedUTC(date) + `/players/` + player);
};
