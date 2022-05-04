import React, { useState, useEffect } from "react";
import { Layout, Row } from "antd";
import { Table, Tag, Space, Spin } from "antd";
import { Divider } from "antd";
import { Form, Input, InputNumber, Button, message } from "antd";
import { Select } from "antd";
import { Card } from "antd";
import {
	createPlayerInDatabase,
	updatePlayersInDatabase,
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";
const { Option } = Select;

const AdminLeaderboard = () => {
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
					onChange={(value) => {
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

	const updateLeaderboard = async () => {
		try {
			const response = await getPlayersFromDatabase("players");
			setScore(Object.entries(response));
		} catch (e) {
			console.log(`Failed: to fetch data: `, e);
		}
	};

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

		updateLeaderboard();
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

			if (i > 1 && score[i][1] === score[i - 1][1]) {
				place = tempData[i - 1].place;
			} else {
				place = i + 1;
			}

			tempData.push(makePlayerEntry(place, score[i][0], score[i][1]));
		}

		return tempData;
	};

	return (
		<Layout style={{margin:"auto", width: "50%"}}>
			<Card style={{ maxWidth: "1000px" }}>
				<Table
					size="small"
					columns={editColumns}
					dataSource={data}
					pagination={false}
					loading={{ indicator: <Spin />, spinning: data.length === 0 }}
				/>
			<Button
            style={{width: "100%", marginTop: "20px"}}
				type="primary"
				onClick={() => {
					if (Object.keys(playersToUpdate).length > 0) {
						updatePlayersInDatabase(playersToUpdate, () => {
							updateLeaderboard();
							message.success("Player list updated!");
						});
						setPlayersToUpdate({});
					}
				}}
			>
				Update Players
			</Button>
			</Card>

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
			    <Button style={{width: "50%", marginLeft: "25%"}} type="primary">Add/Update Player</Button>
			</Card>

			<Button
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
						updateLeaderboard();
						message.success("Player list updated!");
					});
				}}
			>
				Write Hardcoded Players
			</Button>
		</Layout>
	);
};

export default AdminLeaderboard;
