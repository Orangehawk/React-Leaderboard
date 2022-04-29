import "./App.css";
import "antd/dist/antd.dark.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Leaderboard from "./components/LeaderBoard/LeaderBoard";
import PlayerEditor from "./components/PlayerEditor/PlayerEditor";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<Leaderboard />} />
				<Route path="officerAdminPanel" element={<PlayerEditor />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
