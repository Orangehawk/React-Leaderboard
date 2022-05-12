import { DatePicker } from "antd";
import publicIp from "public-ip";
import {
	createInDatabase,
	updateInDatabase,
	removeInDatabase,
	getFromDatabase
} from "./firebaseHelper";
import moment from "moment";

const getIp = async () => {
	return await publicIp.v4();
};

//Returns current UTC date in DD/MM (e.g. "14 Mar")
// const getCurrentDate = () => {
// 	let date = new Date();
// 	let day = date.getUTCDate();
// 	let month;

// 	switch (date.getUTCMonth() + 1) {
// 		case 1:
// 			month = "Jan";
// 			break;
// 		case 2:
// 			month = "Feb";
// 			break;
// 		case 3:
// 			month = "Mar";
// 			break;
// 		case 4:
// 			month = "Apr";
// 			break;
// 		case 5:
// 			month = "May";
// 			break;
// 		case 6:
// 			month = "Jun";
// 			break;
// 		case 7:
// 			month = "Jul";
// 			break;
// 		case 8:
// 			month = "Aug";
// 			break;
// 		case 9:
// 			month = "Sep";
// 			break;
// 		case 10:
// 			month = "Oct";
// 			break;
// 		case 11:
// 			month = "Nov";
// 			break;
// 		case 12:
// 			month = "Dec";
// 			break;
// 		default:
// 			month = "Unk";
// 			break;
// 	}

// 	return day + " " + month;
// };

// //Returns current UTC time in HH:MM AM/PM (e.g. "10:43 AM")
// const getCurrentTime = () => {
// 	let date = new Date();
// 	let hour = date.getUTCHours();
// 	let minute = date.getUTCMinutes();

// 	return hour + ":" + minute + " " (hour <= 12 ? "AM" : "PM");
// };

// const getCurrentTimeOffset = () => {
// 	let date = new Date();
// 	let offset = date.getTimezoneOffset();

//     return offset;
// };

export const getMomentDateTime = () => {
    var dt = moment.utc().format();
    return dt;
}

//Name Format: yyyy-mm-ddThh:MM:ss:mmmZ
export const createDatabaseLog = async (text, officer = "Unknown", onComplete = () => {}) => {
	createInDatabase("logs/" + getMomentDateTime(), {
		ip: await getIp(),
		log: text,
		officer: officer
	}, onComplete);
};

export const updateLastUpdatedTime = () => {
	createInDatabase("lastUpdated", getMomentDateTime());
};

export const getLastUpdatedTime = async () => {
    return await getFromDatabase("lastUpdated");
}
