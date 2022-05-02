import React, { useState, useEffect } from "react";
import { Layout, Row } from "antd";
import { Table, Tag, Space } from "antd";
import { getPlayersFromDatabase } from "../../helpers/firebaseHelper";

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
		<Layout>
			<Table columns={columns} dataSource={data} pagination={false} />
		</Layout>
	);
};

export default Leaderboard;
