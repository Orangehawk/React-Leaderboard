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

	const showLoginForm = (show) => {
		setLoginFormVisible(show);
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
							onOk={() => {} /*REPLACE*/}
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
									onClick={async () => {
										let success = await login(username, password);
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
										onChange={(val) => {
											setUsername(val.target.value + "@eto.com");
										}}
									/>
								</Form.Item>
								<Form.Item label="Password">
									<Input.Password
										placeholder="Password"
										onChange={(val) => {
											setPassword(val.target.value);
										}}
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
								if (Object.keys(playersToUpdate).length > 0) {
									updatePlayersInDatabase(playersToUpdate, () => {
										message.success("Player list updated!");
									});
									setPlayersToUpdate({});
									console.log(playersToUpdate);
								}
							}}
						>
							Update Players
						</Button>
						<Divider />
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
											<Input placeholder="Player name" />
										</Form.Item>
										<Form.Item>
											<InputNumber placeholder="Score" />
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
											<Select defaultValue="Officer" showSearch>
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
							>
								Add/Update Player
							</Button>
						</Card>
						<Button
							disabled={!loggedIn}
							onClick={() => {
								let hardcoded = {
									Alcara: 7,
									"Av'yana": 45,
									Ayleth: 9,
									Crimson: 7,
									"Ki'sae": 30,
									Miniya: 3,
									Mitsue: 5,
									Otaku: 4,
									"R'aeyon": 11,
									Reina: 12,
									Reshina: 10,
									Rien: 11,
									Rorik: 2,
									Shiro: 6,
									Yuza: 2,
									Al: 1,
									Anna: 5,
									Agnes: 1,
									Banana: 3,
									Renlino: 2,
									Chungwoo: 1
								};

								console.log(hardcoded);
								updatePlayersInDatabase(hardcoded, () => {
									message.success("Player list updated!");
								});
							}}
						>
							Write Hardcoded Players
						</Button>
					</Layout>
				</Col>
			</Row>
		</Layout>
	);
};

export default AdminLeaderboard;
