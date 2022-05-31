import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Space, Divider, List } from "antd";
import { Form, Input, InputNumber, Button, message, Popconfirm } from "antd";
import { Modal } from "antd";
import { Select } from "antd";
import { Card } from "antd";
import { Typography } from "antd";
import { DatePicker } from "antd";
import moment from "moment";
import BaseLeaderboard from "../BaseLeaderboard/BaseLeaderboard";
import {
	createPlayerInDatabase,
	removePlayerInDatabase,
	updatePlayersInDatabase,
	removeAllPlayersInDatabase,
	removeInDatabase,
	getFromDatabase,
	createInDatabase,
	getPlayerFromDatabase,
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";
import { login, logout } from "../../helpers/loginHelper";
const { Option } = Select;

const AdminLeaderboard = () => {
	const [playersToUpdate, setPlayersToUpdate] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [loginModalVisible, setLoginModalVisible] = useState(!loggedIn);
	const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [waitingForLogin, setWaitingForLogin] = useState(false);
	const [formPlayerName, setFormPlayerName] = useState("");
	const [formPlayerScore, setFormPlayerScore] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [logs, setLogs] = useState([]);
	const [selectedDate, setSelectedDate] = useState(moment());
	const [leaderboardLoadedEmpty, setLeaderboardLoadedEmpty] = useState(false);

	const renameOldLogs = async () => {
		let dbLogs = await getFromDatabase("logs/");

		for (let value of Object.keys(dbLogs)) {
			dbLogs[value.substring(0, 19) + "Z"] = dbLogs[value];
			delete dbLogs[value];
		}

		removeInDatabase("logs/");
		createInDatabase("logs/", dbLogs);
	};

	// useEffect(() => {
	// 	console.log(playersToUpdate);
	// }, [playersToUpdate]);

	const getDateFormattedUTC = (date) => {
		return date.utc().format("YYYY-MM-DD");
	};

	const getPrevDayScore = async (date, player) => {
		let s = await getPlayerFromDatabase(
			getDateFormattedUTC(moment(date).subtract(1, "day")),
			player
		);
		return s?.score;
	};

	const getScoreChange = async (date, players) => {
		for (let key of Object.keys(players)) {
			let sc = await getPrevDayScore(date, key);

			if (sc != null) {
				players[key].scorechange = players[key].score - sc;
			} else {
				players[key].scorechange = players[key].score;
			}
		}
	};

	const makeSingleLogText = (text) => {
		let officer = capitaliseProperNoun(text.officer);

		let log = text.log
			.replace(": ", ":\n\n")
			.replace("{", "")
			.replace("}", "")
			.replaceAll(",", "\n")
			.replaceAll(":", ": ")
			.replaceAll('"', "");

		return (
			moment(text.date).local().format("DD MMM HH:mm A") +
			"\n" +
			officer +
			" " +
			log
		);
	};

	const CopyScoresFromDate = async (date) => {
		let players = await getPlayersFromDatabase(getDateFormattedUTC(date));

		updatePlayersInDatabase(
			getDateFormattedUTC(selectedDate),
			players,
			username,
			() => {
				message.success("Players copied from previous day!");
			}
		);
		setIsRefreshing(true);
	};

	const UpdateFutureScores = async () => {
		if (selectedDate.date() !== moment().date()) {
			message.info("Updating future scores, please wait...");

			let dateA = selectedDate;
			let maxDate = moment();

			//while dateA is still earlier than today, and dateA is not exceeding the month of selectedDate
			while (dateA < maxDate && dateA.month === selectedDate.month) {
				//Get all players for dateA
				let dateAPlayers = await getPlayersFromDatabase(
					getDateFormattedUTC(dateA)
				);

				let dateB = moment(dateA).add(1, "day");
				//Get all players for dateB
				let dateBPlayers = await getPlayersFromDatabase(
					getDateFormattedUTC(dateB)
				);
				let update = false;

				if (dateAPlayers != null && dateBPlayers != null) {
					//For each player in dateA
					for (let player of Object.keys(dateAPlayers)) {
						//Check if dateBplayer scorechange is less than dateb score - datea score
						if (
							dateBPlayers[player] != null &&
							dateBPlayers.score !==
								dateBPlayers[player].score - dateAPlayers[player].score
						) {
							dateBPlayers[player].score =
								dateAPlayers[player].score + dateBPlayers[player].scorechange;
							update = true;
						}
					}
				}

				if (update) {
					await getScoreChange(dateB, dateBPlayers);
					updatePlayersInDatabase(
						getDateFormattedUTC(dateB),
						dateBPlayers,
						username,
						() => {
							updateLatestLog();
							message.info("Updated scores for " + getDateFormattedUTC(dateB));
						}
					);
				}

				//Shift dateA one day forward
				dateA = dateB;
			}

			message.success("Finished updating future scores");
		}
	};

	const updateLatestLog = async () => {
		let dbLogs = await getFromDatabase("logs/", 100);

		let array = Object.entries(dbLogs).sort((a, b) => {
			return moment(a[0]) < moment(b[0]);
		});

		let temp = [];
		for (let value of array) {
			value[1].date = value[0];
			temp.push(makeSingleLogText(value[1]));
		}

		setLogs(temp);
	};

	const showLoginModal = (show) => {
		setLoginModalVisible(show);
	};

	const showDeleteAllModal = (show) => {
		setDeleteAllModalVisible(show);
	};

	const submitLogin = async () => {
		if (username !== "" && password !== "") {
			setWaitingForLogin(true);
			let success = await login("officer@eto.com", password);
			setWaitingForLogin(false);
			if (success) {
				showLoginModal(false);
				setLoggedIn(true);
				updateLatestLog();
				setPassword("");

				if (leaderboardLoadedEmpty) {
					CopyScoresFromDate(moment(selectedDate).subtract(1, "day"));
				}
			} else {
				message.error("Invalid password", 5);
				setPassword("");
			}
		} else if (username === "") {
			message.error("Please select an officer", 5);
		} else if (password === "") {
			message.error("Please enter a password", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const updatePlayers = async () => {
		if (Object.keys(playersToUpdate).length > 0) {
			console.log("Players to update:", playersToUpdate);
			// for (let key of Object.keys(playersToUpdate)) {
			// 	let sc = await getPrevDayScore(selectedDate, key);

			// 	if (sc != null) {
			// 		playersToUpdate[key].scorechange = playersToUpdate[key].score - sc;
			// 	} else {
			// 		playersToUpdate[key].scorechange = playersToUpdate[key].score;
			// 	}
			// }

			await getScoreChange(selectedDate, playersToUpdate);

			updatePlayersInDatabase(
				getDateFormattedUTC(selectedDate),
				playersToUpdate,
				username,
				() => {
					setIsRefreshing(true);
					updateLatestLog();
					setPlayersToUpdate({});
					message.success("Player scores updated!");
					UpdateFutureScores();
				}
			);
		} else {
			if (Object.keys(playersToUpdate).length === 0) {
				message.error("No score changes have been made!", 5);
			} else {
				message.error("General Error", 5);
			}
		}
	};

	const submitFormPlayer = async () => {
		if (formPlayerName !== "") {
			console.log(
				"Prev date:",
				getDateFormattedUTC(moment(selectedDate).subtract(1, "days"))
			);
			let sc = await getPrevDayScore(
				getDateFormattedUTC(selectedDate),
				formPlayerName
			);

			createPlayerInDatabase(
				getDateFormattedUTC(selectedDate),
				formPlayerName,
				{
					score: formPlayerScore,
					scorechange: sc ?? formPlayerScore
				},
				username,
				() => {
					setFormPlayerName("");
					setFormPlayerScore(0);
					setIsRefreshing(true);
					updateLatestLog();
					message.success("Player " + formPlayerName + " added!");
					UpdateFutureScores();
				}
			);
		} else if (formPlayerName === "") {
			message.error("No player name has been entered!", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const deletePlayer = (name) => {
		removePlayerInDatabase(
			getDateFormattedUTC(selectedDate),
			name,
			username,
			() => {
				setIsRefreshing(true);
				updateLatestLog();
				message.success("Player " + name + " removed!");
			}
		);
	};

	const deleteAllPlayers = () => {
		removeAllPlayersInDatabase(
			getDateFormattedUTC(selectedDate),
			username,
			() => {
				setIsRefreshing(true);
				updateLatestLog();
				showDeleteAllModal(false);
				message.success("Removed all players!");
			}
		);
	};

	const capitaliseProperNoun = (string) => {
		return string.length > 0
			? string[0].toUpperCase() + string.substring(1, string.length)
			: "";
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
						{/* Player Add/Update Panel */}
						<Col style={{ width: "100%" }}>
							<Card>
								<Typography.Title style={{ textAlign: "center" }}>
									Admin Panel
								</Typography.Title>
								<Typography.Text
									hidden={!loggedIn}
									style={{ textAlign: "center" }}
								>
									Signed in as {capitaliseProperNoun(username)}
								</Typography.Text>
								<Button
									style={{ width: "100%" }}
									type="primary"
									onClick={() => {
										UpdateFutureScores();
									}}
								>
									Test
								</Button>
								{/* Signin/out Panel */}
								<Button
									hidden={loggedIn}
									style={{ width: "100%" }}
									type="primary"
									onClick={() => {
										showLoginModal(true);
									}}
								>
									Sign in
								</Button>
								<Button
									hidden={!loggedIn}
									style={{ width: "100%" }}
									danger={true}
									onClick={() => {
										logout();
										setLoggedIn(false);
									}}
								>
									Sign Out
								</Button>
								<Modal
									title="Login"
									visible={loginModalVisible}
									onCancel={() => {
										showLoginModal(false);
									}}
									footer={[
										<Button
											key="back"
											onClick={() => {
												showLoginModal(false);
											}}
										>
											Cancel
										</Button>,
										<Button
											key="submit"
											loading={waitingForLogin}
											onClick={() => {
												submitLogin();
											}}
										>
											Sign in
										</Button>
									]}
								>
									<Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
										<Form.Item label="Officer">
											<Select
												showSearch
												placeholder="Officer"
												onChange={(val) => {
													setUsername(val);
												}}
											>
												<Option value="autumn">Autumn</Option>
												<Option value="oriane">Oriane</Option>
												<Option value="r'aeyon">R'aeyon</Option>
												<Option value="reina">Reina</Option>
												<Option value="yurina">Yurina</Option>
											</Select>
										</Form.Item>
										<Form.Item label="Password">
											<Input.Password
												placeholder="Password"
												value={password}
												onChange={(val) => {
													setPassword(val.target.value);
												}}
												onPressEnter={submitLogin}
											/>
										</Form.Item>
									</Form>
								</Modal>
								<Divider />
								{/* Add/Update Players Panel */}
								<div hidden={!loggedIn}>
									<Popconfirm
										title="Are you sure you want to overwrite this day's scores?"
										onConfirm={() => {
											CopyScoresFromDate(
												moment(selectedDate).subtract(1, "day")
											);
										}}
										okText="Overwrite"
										cancelText="Cancel"
									>
										<Button
											disabled={!loggedIn}
											style={{ width: "100%", marginTop: "20px" }}
											type="primary"
											onClick={() => {}}
										>
											Copy previous day's scores
										</Button>
									</Popconfirm>
									<Popconfirm
										title="Updating a date in the past may take some time in order to update future scores"
										disabled={selectedDate.date() === moment().date()}
										onConfirm={() => {
											updatePlayers();
										}}
										okText="Update"
										cancelText="Cancel"
									>
										<Button
											disabled={!loggedIn}
											style={{ width: "100%", marginTop: "20px" }}
											type="primary"
											onClick={() => {
												if (selectedDate.date() === moment().date()) {
													updatePlayers();
												}
											}}
										>
											Update Players
										</Button>
									</Popconfirm>
									<Card style={{ maxWidth: "1000px" }}>
										<Form
											labelCol={{
												span: 4
											}}
											wrapperCol={{
												span: 32
											}}
										>
											<Form.Item label="Player">
												<Input.Group compact>
													<Form.Item>
														<Input
															placeholder="Player name"
															value={formPlayerName}
															onChange={(val) => {
																setFormPlayerName(val.target.value);
															}}
														/>
													</Form.Item>
													<Form.Item>
														<InputNumber
															placeholder="Score"
															value={formPlayerScore}
															min={0}
															onChange={(val) => {
																setFormPlayerScore(val);
															}}
														/>
													</Form.Item>
												</Input.Group>
											</Form.Item>
										</Form>
										<Button
											disabled={!loggedIn}
											style={{ width: "50%", marginLeft: "25%" }}
											type="primary"
											onClick={() => {
												submitFormPlayer();
											}}
										>
											Add/Update Player
										</Button>
									</Card>
									<Divider />
									<Button
										danger
										style={{ width: "100%" }}
										onClick={() => {
											showDeleteAllModal(true);
										}}
									>
										Delete all players
									</Button>

									<Modal
										title="Delete All Players"
										visible={deleteAllModalVisible}
										onCancel={() => {
											showDeleteAllModal(false);
										}}
										footer={[
											<Button
												key="back"
												onClick={() => {
													showDeleteAllModal(false);
												}}
											>
												Cancel
											</Button>,
											<Popconfirm
												title="Are you sure you want to delete all players? (This is not reversable)"
												onConfirm={() => {
													deleteAllPlayers();
												}}
												okText="Delete"
												cancelText="Cancel"
											>
												<Button key="submit">Delete all players</Button>
											</Popconfirm>
										]}
									>
										Delete all players from the leaderboard?
									</Modal>
								</div>
							</Card>
						</Col>
						{/* Latest Log Panel */}
						<Col style={{ width: "100%" }}>
							<Card hidden={!loggedIn}>
								<Typography.Title style={{ textAlign: "center" }}>
									Logs
								</Typography.Title>
								<div style={{ maxHeight: "302px", overflowY: "scroll" }}>
									<List
										header={<div>Displaying latest {logs.length} logs</div>}
										dataSource={logs}
										renderItem={(item) => (
											<List.Item>
												<Typography.Text style={{ whiteSpace: "pre-wrap" }}>
													{item}
												</Typography.Text>
											</List.Item>
										)}
									/>
								</div>
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
