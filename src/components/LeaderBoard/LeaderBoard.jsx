import React, { useState, useEffect } from "react";
import { Layout, Row } from "antd";
import { Table, Tag, Space } from "antd";
import { Divider } from "antd";
import { Form, Input, InputNumber, Button } from "antd";
import {
	createPlayerInDatabase,
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
		dataIndex: "score"
	}
];

const Leaderboard = () => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();
    const [playersToUpdate, setPlayersToUpdate] = useState({});

	const editColumns = [
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
			dataIndex: "score",
			render: (text, record, index) => (
				<InputNumber
					value={text}
					onStep={(value) => {
                        setPlayersToUpdate(prevState => ({...prevState, [record.name]: value}));
						updateData(index, value);
					}}
				/>
			)
		}
	];

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
			setScore(sortScores(score));
			setData(createTableFromScores());
		}
	}, [score]);

	useEffect(() => {}, [data]);

	const updateData = (index, score) => {
		let items = [...data];
		let item = data[index];
		item.score = score;
		items[index] = item;

		setData(items);
	};

	const sortScores = (array) => {
		array.sort((a, b) => {
			return b[1] - a[1];
		});
	};

	const makePlayerEntry = (place, name, score) => {
		return { key: name, place: place, name: name, score: score };
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

		return tempData;
	};

	const getUpdatedPlayers = () => {};

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
							createPlayerInDatabase("Test", 999, console.log("Pushed!"));
						}}
					>
						Write Test Player
					</Button>
					<Button
						onClick={() => {
							updatePlayersInDatabase(
								{ Test: 888, Oriane: 50 },
								console.log("Updated!")
							);
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

			<Table columns={editColumns} dataSource={data} pagination={false} />

			<Button
				onClick={() => {
					updatePlayersInDatabase("Test", console.log("Removed!"));
				}}
			>
				Update Players
			</Button>
		</Layout>
	);
};

export default Leaderboard;
