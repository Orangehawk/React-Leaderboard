import firebase from "../config/firebaseConfig";

export const login = async (email, password) => {
	let userCredential;
	try {
		userCredential = await firebase
			.auth()
			.signInWithEmailAndPassword(email, password);
	} catch (e) {
        console.log(e);
	} finally {
		return userCredential;
	}
};

export const logout = async () => {
	return await firebase.auth().signOut();
};
