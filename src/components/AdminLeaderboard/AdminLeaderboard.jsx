import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Space, Divider } from "antd";
import { Form, Input, InputNumber, Button, message, Popconfirm } from "antd";
import { Modal } from "antd";
import { Select } from "antd";
import { Card } from "antd";
import { Typography } from "antd";
import BaseLeaderboard from "../BaseLeaderboard/BaseLeaderboard";
import {
	createPlayerInDatabase,
	removePlayerInDatabase,
	updatePlayersInDatabase,
	removeAllPlayersInDatabase,
	getFromDatabase
} from "../../helpers/firebaseHelper";
import { login, logout } from "../../helpers/loginHelper";
import { DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;

const AdminLeaderboard = () => {
	const [playersToUpdate, setPlayersToUpdate] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [loginModalVisible, setLoginModalVisible] = useState(
		loggedIn ? false : true
	);
	const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [waitingForLogin, setWaitingForLogin] = useState(false);
	const [formPlayerName, setFormPlayerName] = useState("");
	const [formPlayerScore, setFormPlayerScore] = useState(0);
	const [loggedInOfficer, setLoggedInOfficer] = useState("Officer");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [latestLog, setLatestLog] = useState("");

	const updateLatestLog = async () => {
		var l = await getFromDatabase("logs/", 1);
		l = l[Object.keys(l)];

		var officer = l.officer.split("");
		officer[0] = officer[0].toUpperCase();
		officer = officer.join("");

		var log = l.log
			.replace(": ", ":\n\n")
			.replace("{", "")
			.replace("}", "")
			.replaceAll(",", "\n")
			.replaceAll(":", ": ")
			.replaceAll('"', "");
		setLatestLog(officer + " " + log);
	};

	const showLoginModal = (show) => {
		setLoginModalVisible(show);
	};

	const showDeleteAllModal = (show) => {
		setDeleteAllModalVisible(show);
	};

	const updatePlayers = () => {
		if (
			Object.keys(playersToUpdate).length > 0 &&
			loggedInOfficer !== "Officer"
		) {
			updatePlayersInDatabase(playersToUpdate, loggedInOfficer, () => {
				message.success("Player scores updated!");
				setIsRefreshing(true);
			});
			setPlayersToUpdate({});
		} else {
			if (Object.keys(playersToUpdate).length === 0) {
				message.error("No score changes have been made!", 5);
			} else if (loggedInOfficer === "Officer") {
				message.error("Please select a submitting officer", 5);
			} else {
				message.error("General Error", 5);
			}
		}
	};

	const submitLogin = async () => {
		if (username !== "" && password !== "" && loggedInOfficer !== "Officer") {
			setWaitingForLogin(true);
			let success = await login(username + "@eto.com", password);
			setWaitingForLogin(false);
			if (success) {
				showLoginModal(false);
				setLoggedIn(true);
				updateLatestLog();
				setUsername("");
				setPassword("");
			} else {
			    message.error("Invalid username or password", 5);
				setPassword("");
			}
		} else if (username === "") {
			message.error("Please enter a username", 5);
		} else if (password === "") {
			message.error("Please enter a password", 5);
		} else if (loggedInOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const submitFormPlayer = () => {
		if (formPlayerName !== "" && loggedInOfficer !== "Officer") {
			createPlayerInDatabase(
				formPlayerName,
				formPlayerScore,
				loggedInOfficer,
				() => {
					setFormPlayerName("");
					setFormPlayerScore(0);
					setIsRefreshing(true);
					message.success("Player " + formPlayerName + " added!");
				}
			);
		} else if (formPlayerName === "") {
			message.error("No player name has been entered!", 5);
		} else if (loggedInOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const deletePlayer = (name) => {
		if (loggedInOfficer !== "Officer") {
			removePlayerInDatabase(name, loggedInOfficer, () => {
				setIsRefreshing(true);
				message.success("Player " + name + " removed!");
			});
		} else if (loggedInOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const deleteAllPlayers = () => {
		if (loggedInOfficer !== "Officer") {
			removeAllPlayersInDatabase(loggedInOfficer, () => {
				setIsRefreshing(true);
				showDeleteAllModal(false);
				message.success("Removed all players!");
			});
		} else if (loggedInOfficer === "Officer") {
			showDeleteAllModal(false);
			message.error("Please select a submitting officer", 5);
		}
	};

	return (
		<Layout style={{ margin: "24px" }}>
			<Row gutter={24}>
				{/* Leaderboard Column */}
				<Col hidden={!loggedIn} xs={24} md={12}>
					<BaseLeaderboard
						editable={true}
						deletePlayer={deletePlayer}
						setPlayersToUpdate={setPlayersToUpdate}
						isRefreshing={isRefreshing}
						setIsRefreshing={setIsRefreshing}
					/>
				</Col>
				{/* Admin Column */}
				<Col xs={24} md={12}>
					<Row gutter={[0, 24]}>
						{/* Player Panel */}
						<Col style={{ width: "100%" }}>
							<Card>
								<Typography.Title style={{ textAlign: "center" }}>
									Admin Panel
								</Typography.Title>
								<Typography.Text
									hidden={!loggedIn}
									style={{ textAlign: "center" }}
								>
									Signed in as {loggedInOfficer[0].toUpperCase() + loggedInOfficer.substring(1, loggedInOfficer.length)}
								</Typography.Text>
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
										<Form.Item label="Username">
											<Input
												placeholder="Username"
												value={username}
												onChange={(val) => {
													setUsername(val.target.value);
												}}
												onPressEnter={submitLogin}
											/>
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
										<Form.Item label="Officer">
											<Select
												showSearch
												placeholder="Officer"
												onChange={(val) => {
													setLoggedInOfficer(val);
												}}
											>
												<Option value="yurina">Yurina</Option>
												<Option value="oriane">Oriane</Option>
												<Option value="autumn">Autumn</Option>
												<Option value="r'aeyon">R'aeyon</Option>
												<Option value="reina">Reina</Option>
											</Select>
										</Form.Item>
									</Form>
								</Modal>
                                <Divider/>
								{/* Add/Update Players Panel */}
								<div hidden={!loggedIn}>
									<Button
										disabled={!loggedIn}
										style={{ width: "100%", marginTop: "20px" }}
										type="primary"
										onClick={() => {
											updatePlayers();
										}}
									>
										Update Players
									</Button>
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
									Latest log
								</Typography.Title>
								<p style={{ "white-space": "pre-wrap" }}>{latestLog}</p>
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
