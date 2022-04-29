import publicIp from 'public-ip';
import { createInDatabase, updateInDatabase, removeInDatabase, getFromDatabase } from './firebaseHelper';

const getIp = async () => {
	return await publicIp.v4();
};

//Returns current time in UTC ISO string format
const getCurrentDateTime = () => {
    //var date = new Date();
    //console.log()
    //return `${date.getUTCFullYear()} ${date.getUTCMonth() + 1}`;
    return new Date().toISOString().replace(".", ":");
}

//Name Format: yymmdd_hhMMssmm
export const createDatabaseLog = async (text) => {
    createInDatabase("logs/" + getCurrentDateTime(), {ip: await getIp(), log: text});
}