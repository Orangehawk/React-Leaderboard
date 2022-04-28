import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Table, Tag, Space } from "antd";
import { Divider } from "antd";
import { Form, Input, InputNumber, Button } from "antd";
import {
	pushPlayerToDatabase,
	updatePlayersInDatabase,
    removePlayerInDatabase,
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";

//Place	Name Paniks
const columns = [
	{
		title: "Place",
		dataIndex: "place"
	},
	{
		title: "Name",
		dataIndex: "name"
	},
	{
		title: "Paniks",
		dataIndex: "paniks"
	}
];

const Leaderboard = () => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();

	// Runs on first render
	useEffect(() => {
		async function fetchData() {
			try {
				const response = await getPlayersFromDatabase("players");
				setScore(Object.entries(response));
			} catch (e) {
				console.log(`Failed: to fetch data: `, e);
			}
		}

		fetchData();
	}, []);

	useEffect(() => {
		if (score) {
			sortScores();
			createTableFromScores();
		}
	}, [score]);

	const sortScores = (array) => {
		setScore(
			score.sort((a, b) => {
				return b[1] - a[1];
			})
		);
	};

	const makePlayerEntry = (place, name, score) => {
		return { key: name, place: place, name: name, paniks: score };
	};

	const createTableFromScores = () => {
		let tempData = [];

		for (var i = 0; i < score.length; i++) {
			let place = 0;

			if (i > 1 && score[i][0] === score[i - 1][1]) {
				place = tempData[i - 1].place;
			} else {
				place = i + 1;
			}

			tempData.push(makePlayerEntry(place, score[i][0], score[i][1]));
		}

		setData(tempData);
	};

	return (
		<Layout>
			<Table columns={columns} dataSource={data} pagination={false} />
			<Divider></Divider>
			<Form
				labelCol={{
					span: 8
				}}
				wrapperCol={{
					span: 16
				}}
			>
				<Form.Item
					label="Player"
					name="player"
					rules={[
						{
							required: true,
							message: "Please input the player's name"
						}
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item>
					<Button
						onClick={() => {
							pushPlayerToDatabase("Test", 999, console.log("Pushed!"));
						}}
					>
						Write Test Player
					</Button>
					<Button
						onClick={() => {
							updatePlayersInDatabase({"Test": 888, "Oriane": 50}, console.log("Updated!"));
						}}
					>
						Update Test Player
					</Button>
					<Button
						onClick={() => {
							removePlayerInDatabase("Test", console.log("Removed!"));
						}}
					>
						Delete Test Player
					</Button>
				</Form.Item>
			</Form>
		</Layout>
	);
};

export default Leaderboard;
