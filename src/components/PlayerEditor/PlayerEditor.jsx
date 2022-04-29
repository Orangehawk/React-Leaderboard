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
import { getIp } from "../../helpers/databaseLogger";

const Leaderboard = () => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();
	const [playersToUpdate, setPlayersToUpdate] = useState({});

	//Place	Name Paniks
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
						setPlayersToUpdate((prevState) => ({
							...prevState,
							[record.name]: value
						}));
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

	return (
		<Layout>
        <h>Admin</h>
			

			<Table columns={editColumns} dataSource={data} pagination={false} />

			<Button
				onClick={() => {
                    if(playersToUpdate !== {}) {
                        updatePlayersInDatabase(playersToUpdate, console.log("Updated! list: ", playersToUpdate));
                        setPlayersToUpdate({});
                    }
				}}
			>
				Update Players
			</Button>
            <Divider/>
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
							let hardcoded = [
								["Alcara", 7],
								["Av'yana", 45],
								["Ayleth", 9],
								["Crimson", 7],
								["Ki'sae", 30],
								["Miniya", 3],
								["Mitsue", 5],
								["Otaku", 4],
								["R'aeyon", 11],
								["Reina", 12],
								["Reshina", 10],
								["Rien", 11],
								["Rorik", 2],
								["Shiro", 6],
								["Yuza", 2],
								["Al", 1],
								["Anna", 5],
								["Agnes", 1],
								["Banana", 3],
								["Renlino", 2],
								["Chungwoo", 1]
							];

							for (var player of hardcoded) {
								console.log(player);
								createPlayerInDatabase(
									player[0],
									player[1],
									console.log("Pushed!")
								);
							}
						}}
					>
						Write Hardcoded Player(s)
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
                    <Button
						onClick={() => {
						}}
					>
						Log IP
					</Button>
				</Form.Item>
			</Form>
		</Layout>
	);
};

export default Leaderboard;
