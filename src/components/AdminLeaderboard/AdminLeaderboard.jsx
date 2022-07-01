import React, { useState } from "react";
import { Layout, Card, Typography, Row, Col, message } from "antd";
import moment from "moment";
import BaseLeaderboard from "../BaseLeaderboard/BaseLeaderboard";
import LogPanel from "../LogPanel/LogPanel";
import LoginPanel from "../LoginPanel/LoginPanel";
import PlayerManagementPanel from "../PlayerManagementPanel/PlayerManagementPanel";
import {
	removePlayerInDatabase,
	updatePlayersInDatabase,
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";

const AdminLeaderboard = () => {
	const [playersToUpdate, setPlayersToUpdate] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [username, setUsername] = useState("");

	const [logIsUpdating, setLogIsUpdating] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false); //Leaderboard refresh
	const [selectedDate, setSelectedDate] = useState(moment());
	const [leaderboardLoadedEmpty, setLeaderboardLoadedEmpty] = useState(false);

	const CopyScoresFromDate = async (date) => {
		let players = await getPlayersFromDatabase(date);

		if (players !== null) {
			for (let player of Object.keys(players)) {
				players[player].scorechange = 0;
			}

			updatePlayersInDatabase(
				selectedDate,
				players,
				username,
				() => {
					message.success("Players copied from previous day!");
				},
				true
			);
			setIsRefreshing(true);
		} else {
			message.warn("Failed to copy scores from previous day (empty?)");
		}
	};

	const deletePlayer = (name) => {
		removePlayerInDatabase(selectedDate, name, username, () => {
			setIsRefreshing(true);
			setLogIsUpdating(true);
			message.success("Player " + name + " removed!");
		});
	};

	return (
		<Layout style={{ margin: "24px" }}>
			<Row gutter={24}>
				{/* Leaderboard Column */}
				<Col hidden={!loggedIn} xs={24} md={12}>
					<BaseLeaderboard
						editable={true}
						selectedDate={selectedDate}
						setSelectedDate={setSelectedDate}
						deletePlayer={deletePlayer}
						setPlayersToUpdate={setPlayersToUpdate}
						isRefreshing={isRefreshing}
						setIsRefreshing={setIsRefreshing}
						setLeaderboardLoadedEmpty={setLeaderboardLoadedEmpty}
					/>
				</Col>
				{/* Admin Column */}
				<Col xs={24} md={12}>
					<Row gutter={[0, 24]}>
						<Col style={{ width: "100%" }}>
							<Card>
								<Typography.Title style={{ textAlign: "center" }}>
									Admin Panel
								</Typography.Title>
								<LoginPanel
									hidden={!loggedIn}
									selectedDate={selectedDate}
									username={username}
									leaderboardLoadedEmpty={leaderboardLoadedEmpty}
									setUsername={setUsername}
									setLoggedIn={setLoggedIn}
									setLogIsUpdating={setLogIsUpdating}
									CopyScoresFromDate={CopyScoresFromDate}
								/>
							</Card>
						</Col>
						{/* Add/Update Players Panel */}
						<Col style={{ width: "100%" }}>
							<PlayerManagementPanel
								hidden={!loggedIn}
								selectedDate={selectedDate}
								playersToUpdate={playersToUpdate}
								username={username}
								setPlayersToUpdate={setPlayersToUpdate}
								setIsRefreshing={setIsRefreshing}
								setLogIsUpdating={setLogIsUpdating}
								CopyScoresFromDate={CopyScoresFromDate}
							/>
						</Col>
						{/* Latest Log Panel */}
						<Col style={{ width: "100%" }}>
							<LogPanel
								hidden={!loggedIn}
								logIsUpdating={logIsUpdating}
								setLogIsUpdating={setLogIsUpdating}
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
