import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Spin } from "antd";
import { DatePicker, InputNumber, Button, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { getPlayersFromDatabase } from "../../helpers/firebaseHelper";
import { getLastUpdatedTime } from "../../helpers/databaseLogger";

const Leaderboard = ({
	editable = false,
	selectedDate,
	setSelectedDate,
	setPlayersToUpdate,
	deletePlayer,
	isRefreshing,
	setIsRefreshing,
	setLeaderboardLoadedEmpty = () => {}
}) => {
	const [data, setData] = useState([]);
	const [score, setScore] = useState();
	const [lastUpdated, setLastUpdated] = useState("Unknown");
	const [isLoading, setIsLoading] = useState(false);

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
			dataIndex: "score",
			render: (text, record, index) => (
				<>
					{text}
					{record?.scorechange > 0 && (
						<span style={{ color: "green", paddingLeft: "5px" }}>
							{"+" + record.scorechange}
						</span>
					)}
				</>
			)
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
            width: 150,
			render: (text, record, index) => (
				<>
					<InputNumber
						value={text}
						min={0}
						style={{ maxWidth: "70px" }}
						onChange={(value) => {
							setPlayersToUpdate((prevState) => ({
								...prevState,
								[record.name]: { score: value }
							}));
							updateData(index, value);
						}}
					/>
					{record?.scorechange > 0 && (
						<span style={{ color: "green", paddingLeft: "5px" }}>
							{"+" + record.scorechange}
						</span>
					)}
                    {record?.scorechange < 0 && (
                        <Tooltip title="Score less than previous day!">
                            <span style={{ color: "red", paddingLeft: "5px" }}>
                                {"!!!"}
                            </span>
                        </Tooltip>
					)}
				</>
			)
		},
		{
			title: "Delete",
			dataindex: "delete",
			render: (record) => {
				return (
					<Popconfirm
						title="Are you sure you want to delete this player?"
						onConfirm={() => {
							deletePlayer(record.name);
						}}
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
			setIsLoading(true);
			const response = await getPlayersFromDatabase(selectedDate);
			if (response) {
				setScore(Object.entries(response));
			} else {
				setScore(null);
			}
		} catch (e) {
			console.log(`Failed: to fetch data: `, e);
		} finally {
			setIsLoading(false);
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
			setLeaderboardLoadedEmpty(false);
		} else {
			setData(null);
			setLeaderboardLoadedEmpty(true);
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
        item.scorechange = item.scorechange + (score - item.score);
		item.score = score;
		items[index] = item;

		setData(items);
	};

	const sortScores = (array) => {
		var temp = array;
		temp.sort((a, b) => {
			return b[1].score - a[1].score;
		});
		return temp;
	};

	const makePlayerEntry = (place, name, score, scorechange) => {
		return { key: name, place: place, name: name, score: score, scorechange };
	};

	const createTableFromScores = () => {
		let tempData = [];

		for (var i = 0; i < score.length; i++) {
			let place = 0;

			if (i >= 1 && score[i][1].score === score[i - 1][1].score) {
				place = tempData[i - 1].place;
			} else {
				place = i + 1;
			}

			tempData.push(
				makePlayerEntry(
					place,
					score[i][0],
					score[i][1].score,
					score[i][1].scorechange
				)
			);
		}

		return tempData;
	};

	return (
		<Card>
			<Typography.Title style={{ textAlign: "center" }}>
				Panik Leaderboard
				<Card size="small">
					<Typography.Text>{"Last Updated: " + lastUpdated}</Typography.Text>
				</Card>
			</Typography.Title>
			<DatePicker
				value={selectedDate}
				format={"DD-MMM-YYYY"}
				disabledDate={(current) => {
					return current.isAfter(moment(), "day");
				}}
				onChange={(date) => {
					setSelectedDate(date);
					setIsRefreshing(true);
				}}
			/>
			<Tooltip title="Refresh Leaderboard">
				<Button
					style={{ float: "right" }}
					icon={<ReloadOutlined />}
					onClick={() => {
						setIsRefreshing(true);
					}}
				></Button>
			</Tooltip>
			<Table
				size="small"
				columns={editable ? editColumns : columns}
				dataSource={data}
				pagination={false}
				loading={{ indicator: <Spin />, spinning: isLoading }}
			/>
		</Card>
	);
};

export default Leaderboard;
