import React, { useState, useEffect } from "react";
import { Layout, Row } from "antd";
import { Table, Tag, Space, Spin, Popconfirm } from "antd";
import { Divider } from "antd";
import { Form, Input, InputNumber, Button, message } from "antd";
import { Select } from "antd";
import { Card } from "antd";
import {
	getPlayersFromDatabase
} from "../../helpers/firebaseHelper";
import { getLastUpdatedTime } from "../../helpers/databaseLogger";
import { Typography } from "antd";
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;

const Leaderboard = ({
	editable = false,
	setPlayersToUpdate,
	deletePlayer,
	isRefreshing,
	setIsRefreshing
}) => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();
	//const [editable, setEditable] = useState(enableEdit);
	const [lastUpdated, setLastUpdated] = useState("Unknown");

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
					min={0}
					onChange={(value) => {
						setPlayersToUpdate((prevState) => ({
							...prevState,
							[record.name]: value
						}));
						updateData(index, value);
					}}
				/>
			)
		},
		{
			title: "Delete",
			dataindex: "delete",
			render: (record) => {
				return (
					<Popconfirm
						title="Are you sure you want to delete this player?"
						onConfirm={() => {deletePlayer(record.name)}}
						okText="Delete"
						cancelText="Cancel"
					>
						<Button danger icon={<DeleteOutlined />}></Button>
					</Popconfirm>
				);
			}
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

	const updateLastUpdated = async () => {
		let val = await getLastUpdatedTime();
		setLastUpdated(moment(val).local().format("DD MMM HH:mm A"));
	};

	// Runs on first render
	useEffect(() => {
		updateLeaderboard();
		updateLastUpdated();
	}, []);

	useEffect(() => {
		if (score) {
			setScore(sortScores(score));
			setData(createTableFromScores());
		}
	}, [score]);

	useEffect(() => {
		if (isRefreshing) {
			updateLeaderboard();
			updateLastUpdated();
			setIsRefreshing(false);
		}
	}, [isRefreshing]);

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
		<Card>
			<Typography.Title style={{ textAlign: "center" }}>
				Panik Leaderboard
			</Typography.Title>
			<Card size="small">
				<Typography.Text>{"Last Updated: " + lastUpdated}</Typography.Text>
			</Card>
			<Table
				size="small"
				columns={editable ? editColumns : columns}
				dataSource={data}
				pagination={false}
				loading={{ indicator: <Spin />, spinning: data.length === 0 }}
			/>
		</Card>
	);
};

export default Leaderboard;
