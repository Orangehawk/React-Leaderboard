import React, { useState } from "react";
import { Layout, Row, Col } from "antd";
import { Divider } from "antd";
import { Form, Input, InputNumber, Button, message } from "antd";
import { Modal } from "antd";
import { Select } from "antd";
import { Card } from "antd";
import BaseLeaderboard from "../BaseLeaderboard/BaseLeaderboard";
import {
	createPlayerInDatabase,
	updatePlayersInDatabase,
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";
import { login, logout } from "../../helpers/loginHelper";
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
	const [formOfficer, setFormOfficer] = useState("");

	const showLoginForm = (show) => {
		setLoginFormVisible(show);
	};

	const updatePlayers = () => {
		if (Object.keys(playersToUpdate).length > 0) {
			updatePlayersInDatabase(playersToUpdate, () => {
				message.success("Player list updated!");
			});
			setPlayersToUpdate({});
			console.log(playersToUpdate);
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
			//createPlayerInDatabase(formPlayerName, formPlayerScore);
			console.log(
				"Success: N: ",
				formPlayerName,
				"S: ",
				formPlayerScore,
				"O: ",
				formOfficer
			);
			setFormPlayerName("");
			setFormPlayerScore(0);
			setFormOfficer("Officer");
		} else {
			console.log(
				"Fail: N: ",
				formPlayerName,
				"S: ",
				formPlayerScore,
				"O: ",
				formOfficer
			);
			setFormPlayerName("");
			setFormPlayerScore(0);
			setFormOfficer("Officer");
		}
	};

	return (
		<Layout>
			<Row>
				{/* Leaderboard */}
				<Col span={12}>
					<BaseLeaderboard
						enableEdit={true}
						setPlayersToUpdate={setPlayersToUpdate}
					/>
				</Col>
				{/* Admin Panel */}
				<Col span={12}>
					{/* Signin/out Panel */}
					<Layout>
						<Button
							hidden={loggedIn}
							type="primary"
							onClick={() => {
								showLoginForm(true);
							}}
						>
							Sign in
						</Button>
						<Button
							hidden={!loggedIn}
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
					</Layout>
					{/* Add/Update Players Panel */}
					<Layout>
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
										<Form.Item
											name="player"
											rules={[
												{
													required: true,
													message: "Please input the player's name"
												}
											]}
										>
											<Input
												placeholder="Player name"
												value={() => {
													console.log(formPlayerName);
													return formPlayerName;
												}}
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
										<Form.Item
											name="officer"
											rules={[
												{
													required: true,
													message: "Please select your name"
												}
											]}
										>
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
					</Layout>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
