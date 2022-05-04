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

const Leaderboard = ({ enableEdit = true, setPlayersToUpdate, isRefreshing, setIsRefreshing }) => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();
	//const [playersToUpdate, setPlayersToUpdate] = useState({});
	const [editable, setEditable] = useState(enableEdit);

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
		updateLeaderboard();
	}, []);

	useEffect(() => {
		if (score) {
			setScore(sortScores(score));
			setData(createTableFromScores());
		}
	}, [score]);

	//useEffect(() => {}, [data]);

    useEffect(() => {
        if(isRefreshing) {
            updateLeaderboard();
            setIsRefreshing(false);
        }
    }, [isRefreshing])

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
		<Card style={{ maxWidth: "1000px" }}>
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
