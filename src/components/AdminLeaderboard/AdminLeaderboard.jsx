import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Space, Divider, List } from "antd";
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
import moment from "moment";
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
	const [formOfficer, setFormOfficer] = useState("Officer");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [logs, setLogs] = useState([]);

    const makeSingleLogText = (text) => {
        let officer = text.officer.split("");
		officer[0] = officer[0].toUpperCase();
		officer = officer.join("");

		let log = text.log
			.replace(": ", ":\n\n")
			.replace("{", "")
			.replace("}", "")
			.replaceAll(",", "\n")
			.replaceAll(":", ": ")
			.replaceAll('"', "");

		text.date = text.date.substring(0, 19) + "." + text.date.substring(20);

        return (moment(Date(text.date)).local().format("DD MMM HH:mm A") +
        "\n" +
        officer +
        " " +
        log);
    }

	const makeCard = (text) => {
		let officer = text.officer.split("");
		officer[0] = officer[0].toUpperCase();
		officer = officer.join("");

		let log = text.log
			.replace(": ", ":\n\n")
			.replace("{", "")
			.replace("}", "")
			.replaceAll(",", "\n")
			.replaceAll(":", ": ")
			.replaceAll('"', "");

		text.date = text.date.substring(0, 19) + "." + text.date.substring(19 + 1);

		return (
			<Card>{
			makeSingleLogText(text)
			}</Card>
		);
	};

	const updateLatestLog = async () => {
		let dbLogs = await getFromDatabase("logs/");
        console.log(Object.entries(dbLogs));
		let array = Object.entries(dbLogs).sort((a, b) => {
            console.log(Date(a[0]));
			return Date(a[0]) > Date(b[0]) ? -1 : 1;
		});

        //console.log(array);

		let temp = [];
		for (let value of array) {
            //console.log(value);
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

	const updatePlayers = () => {
		if (Object.keys(playersToUpdate).length > 0 && formOfficer !== "Officer") {
			updatePlayersInDatabase(playersToUpdate, formOfficer, () => {
				message.success("Player scores updated!");
				setIsRefreshing(true);
				updateLatestLog();
			});
			setPlayersToUpdate({});
		} else {
			if (Object.keys(playersToUpdate).length === 0) {
				message.error("No score changes have been made!", 5);
			} else if (formOfficer === "Officer") {
				message.error("Please select a submitting officer", 5);
			} else {
				message.error("General Error", 5);
			}
		}
	};

	const submitLogin = async () => {
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
			setPassword("");
		}
	};

	const submitFormPlayer = () => {
		if (formPlayerName !== "" && formOfficer !== "Officer") {
			createPlayerInDatabase(
				formPlayerName,
				formPlayerScore,
				formOfficer,
				() => {
					setFormPlayerName("");
					setFormPlayerScore(0);
					setIsRefreshing(true);
					updateLatestLog();
					message.success("Player " + formPlayerName + " added!");
				}
			);
		} else if (formPlayerName === "") {
			message.error("No player name has been entered!", 5);
		} else if (formOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const deletePlayer = (name) => {
		if (formOfficer !== "Officer") {
			removePlayerInDatabase(name, formOfficer, () => {
				setIsRefreshing(true);
				updateLatestLog();
				message.success("Player " + name + " removed!");
			});
		} else if (formOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const deleteAllPlayers = () => {
		if (formOfficer !== "Officer") {
			removeAllPlayersInDatabase(formOfficer, () => {
				setIsRefreshing(true);
				updateLatestLog();
				showDeleteAllModal(false);
				message.success("Removed all players!");
			});
		} else if (formOfficer === "Officer") {
			showDeleteAllModal(false);
			message.error("Please select a submitting officer", 5);
		}
	};

	return (
		<Layout style={{ margin: "24px" }}>
			<Row gutter={24}>
				{/* Leaderboard Column */}
				<Col xs={24} md={12}>
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
									</Form>
								</Modal>
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
													<Form.Item>
														<Select
															defaultValue="Officer"
															showSearch
															value={formOfficer}
															onChange={(val) => {
																setFormOfficer(val);
															}}
														>
															<Option value="yurina">Yurina</Option>
															<Option value="oriane">Oriane</Option>
															<Option value="autumn">Autumn</Option>
															<Option value="r'aeyon">R'aeyon</Option>
															<Option value="reina">Reina</Option>
														</Select>
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
								<Button
									onClick={() => {
										updateLatestLog();
									}}
								>
									Force Update
								</Button>
								{/* <p style={{ whiteSpace: "pre-wrap" }}>
									{logs.map((key, index) => {
										return makeCard(logs[index]);
									})}
								</p> */}
								<List
									header={<div>Header</div>}
									footer={<div>Footer</div>}
									dataSource={logs}
									renderItem={(item) => (
										<List.Item>
											<Typography.Text style={{ whiteSpace: "pre-wrap" }}>
												{item}
											</Typography.Text>
										</List.Item>
									)}
								/>
							</Card>
						</Col>
					</Row>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
