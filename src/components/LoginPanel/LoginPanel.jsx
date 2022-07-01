import React, { useState } from "react";
import { Typography, Button, Form, Input, Modal, Select, message } from "antd";
import moment from "moment";
import { login, logout } from "../../helpers/loginHelper";
const { Option } = Select;

const LoginPanel = ({
	hidden,
	selectedDate,
	username,
	leaderboardLoadedEmpty,
	setUsername,
	setLoggedIn,
	setLogIsUpdating,
	CopyScoresFromDate
}) => {
	const [loginModalVisible, setLoginModalVisible] = useState(hidden);
	const [password, setPassword] = useState("");
	const [waitingForLogin, setWaitingForLogin] = useState(false);

	const capitaliseProperNoun = (string) => {
		return string.length > 0
			? string[0].toUpperCase() + string.substring(1, string.length)
			: "";
	};

	const submitLogin = async () => {
		if (username !== "" && password !== "") {
			setWaitingForLogin(true);
			let success = await login("officer@eto.com", password);
			setWaitingForLogin(false);
			if (success) {
				showLoginModal(false);
				setLoggedIn(true);
				setLogIsUpdating(true);
				setPassword("");

				if (leaderboardLoadedEmpty && moment(selectedDate).date() !== 1) {
                    console.log("Copying: ", selectedDate, moment(selectedDate).date());
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

	const showLoginModal = (show) => {
		setLoginModalVisible(show);
	};

	return (
		<>
			<Typography.Text hidden={hidden} style={{ textAlign: "center" }}>
				Signed in as {capitaliseProperNoun(username)}
			</Typography.Text>
			{/* Signin/out Panel */}
			<Button
				hidden={!hidden}
				style={{ width: "100%" }}
				type="primary"
				onClick={() => {
					showLoginModal(true);
				}}
			>
				Sign in
			</Button>
			<Button
				hidden={hidden}
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
		</>
	);
};

export default LoginPanel;
