import "./App.css";
import "antd/dist/antd.dark.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLeaderboard from "./components/UserLeaderBoard/UserLeaderBoard";
import AdminLeaderboard from "./components/AdminLeaderboard/AdminLeaderboard";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<UserLeaderboard />} />
				<Route path="officerAdminPanel" element={<AdminLeaderboard />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
