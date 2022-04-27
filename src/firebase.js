import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';


const firebaseConfig = {
    apiKey: "AIzaSyCHLe7qOuLEdE9E1WQVAkeEAxbPD8fhzew",
    authDomain: "eto-leaderboard.firebaseapp.com",
    databaseURL: "https://eto-leaderboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eto-leaderboard",
    storageBucket: "eto-leaderboard.appspot.com",
    messagingSenderId: "945120510792",
    appId: "1:945120510792:web:4496d3860bfa892b1b297d"
};

firebase.initializeApp(firebaseConfig);

export default firebase;