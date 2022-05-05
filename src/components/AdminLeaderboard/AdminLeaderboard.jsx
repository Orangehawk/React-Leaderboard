import React, { useState } from "react";
import { Layout, Row, Col, Space } from "antd";
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
	removeInDatabase
} from "../../helpers/firebaseHelper";
import { login, logout } from "../../helpers/loginHelper";
import { DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;

const AdminLeaderboard = () => {
	const [playersToUpdate, setPlayersToUpdate] = useState({});
	const [loggedIn, setLoggedIn] = useState(false);
	const [loginFormVisible, setLoginFormVisible] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [waitingForLogin, setWaitingForLogin] = useState(false);
	const [formPlayerName, setFormPlayerName] = useState("");
	const [formPlayerScore, setFormPlayerScore] = useState(0);
	const [formOfficer, setFormOfficer] = useState("Officer");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const showLoginForm = (show) => {
		setLoginFormVisible(show);
	};

	const updatePlayers = () => {
		if (Object.keys(playersToUpdate).length > 0 && formOfficer !== "Officer") {
			updatePlayersInDatabase(playersToUpdate, formOfficer, () => {
				message.success("Player scores updated!");
				setIsRefreshing(true);
			});
			setPlayersToUpdate({});
		} else {
			if (Object.keys(playersToUpdate).length === 0) {
				message.error("No score changes have been made!", 5);
			} else if (formOfficer !== "Officer") {
				message.error("Please select a submitting officer", 5);
			}
		}
	};

	const submitLogin = async () => {
		setWaitingForLogin(true);
		let success = await login(username + "@eto.com", password);
		setWaitingForLogin(false);
		if (success) {
			showLoginForm(false);
			setLoggedIn(true);
			setUsername("");
			setPassword("");
			console.log("Login success");
		} else {
			setPassword("");
			console.log("Login failure");
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
					message.success("Player " + formPlayerName + " added!");
				}
			);
		} else if (formPlayerName === "") {
			message.error("No player name has been entered!", 5);
		} else if (formOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		}
	};

	const deletePlayer = (name) => {
		if (formOfficer !== "Officer") {
			removePlayerInDatabase(name, formOfficer, () => {
				setIsRefreshing(true);
				message.success("Player " + name + " removed!");
			});
		} else if (formOfficer === "Officer") {
			message.error("Please select a submitting officer", 5);
		}
	};

    // const deleteAllPlayers = (name) => {
	// 	if (formOfficer !== "Officer") {
	// 		removeInDatabase("players", formOfficer, () => {
	// 			setIsRefreshing(true);
	// 			message.success("Player " + name + " removed!");
	// 		});
	// 	} else if (formOfficer === "Officer") {
	// 		message.error("Please select a submitting officer", 5);
	// 	}
	// };

    const deleteAllPlayers = () => {
		if (formOfficer !== "Officer") {
			message.success("All players _would have_ been deleted!");
		} else if (formOfficer === "Officer") {
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
								showLoginForm(true);
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
							visible={loginFormVisible}
							onCancel={() => {
								showLoginForm(false);
							}}
							footer={[
								<Button
									key="back"
									onClick={() => {
										showLoginForm(false);
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
                            <Popconfirm
								title="Are you sure you want to delete all players? (This is not reversable)"
								onConfirm={() => {
                                    deleteAllPlayers();
								}}
								okText="Delete"
								cancelText="Cancel"
							>
								<Button danger style={{width: "100%"}}>Delete all players</Button>
							</Popconfirm>
						</div>
					</Card>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
