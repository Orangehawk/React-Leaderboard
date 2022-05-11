import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
	apiKey: "AIzaSyCHLe7qOuLEdE9E1WQVAkeEAxbPD8fhzew",
	authDomain: "eto-leaderboard.firebaseapp.com",
	databaseURL:
		"https://eto-leaderboard-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "eto-leaderboard",
	storageBucket: "eto-leaderboard.appspot.com",
	messagingSenderId: "945120510792",
	appId: "1:945120510792:web:4496d3860bfa892b1b297d"
};

const firebaseDevConfig = () => {
	console.warn("Using Dev Database, DO NOT RELEASE TO PROD");
	return {
		apiKey: "AIzaSyBcnmfkHiDn5k6BzXO756FrnrE31PL7PFI",
		authDomain: "eto-leaderboard-dev.firebaseapp.com",
		databaseURL:
			"https://eto-leaderboard-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
		projectId: "eto-leaderboard-dev",
		storageBucket: "eto-leaderboard-dev.appspot.com",
		messagingSenderId: "833288849527",
		appId: "1:833288849527:web:348b89e4e40ccb6c981e72"
	};
};

firebase.initializeApp(firebaseDevConfig());

export const dbRef = firebase.database().ref();
export default firebase;
