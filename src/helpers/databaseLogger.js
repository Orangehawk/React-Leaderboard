import publicIp from "public-ip";
import { createInDatabase, getFromDatabase } from "./firebaseHelper";
import moment from "moment";

const getIp = async () => {
	return await publicIp.v4();
};

export const getMomentDateTime = () => {
	var dt = moment.utc().format();
	return dt;
};

//Name Format: yyyy-mm-ddThh:MM:ss:mmmZ
export const createDatabaseLog = async (
	text,
	officer = "Unknown",
	onComplete = () => {}
) => {
	createInDatabase(
		"logs/" + getMomentDateTime(),
		{
			ip: await getIp(),
			log: text,
			officer: officer
		},
		onComplete
	);
};

export const updateLastUpdatedTime = () => {
	createInDatabase("lastUpdated", getMomentDateTime());
};

export const getLastUpdatedTime = async () => {
	return await getFromDatabase("lastUpdated");
};
