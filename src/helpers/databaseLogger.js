import publicIp from 'public-ip';
import { createInDatabase, updateInDatabase, removeInDatabase, getFromDatabase } from './firebaseHelper';

const getIp = async () => {
	return await publicIp.v4();
};

//Returns current time in UTC ISO string format
const getCurrentDateTime = () => {
    return new Date().toISOString().replace(".", ":");
}

//Name Format: yymmdd_hhMMssmm
export const createDatabaseLog = async (text, officer = "Unknown") => {
    createInDatabase("logs/" + getCurrentDateTime(), {ip: await getIp(), log: text, officer:officer});
}