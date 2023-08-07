import React, { useState, useEffect } from "react";
import { Card, Typography, List } from "antd";
import moment from "moment";
import { getFromDatabase } from "../../helpers/firebaseHelper";

const LogPanel = ({ hidden, logIsUpdating, setLogIsUpdating }) => {
	const [logs, setLogs] = useState([]);

	useEffect(() => {
		if (logIsUpdating === true) {
			updateLatestLog();
			setLogIsUpdating(false);
		}
	}, [logIsUpdating]);

	const capitaliseProperNoun = (string) => {
		return string.length > 0
			? string[0].toUpperCase() + string.substring(1, string.length)
			: "";
	};

	const makeSingleLogText = (text) => {
		let officer = capitaliseProperNoun(text.officer);

		let log = text.log
			.replace(": ", ":\n\n")
			.replace("{", "")
			.replace("}", "")
			.replaceAll(",", "\n")
			.replaceAll(":", ": ")
			.replaceAll('"', "");

		return (
			moment(text.date).local().format("DD MMM HH:mm A") +
			"\n" +
			officer +
			" " +
			log
		);
	};

	const updateLatestLog = async () => {
		let dbLogs = await getFromDatabase("logs/", 100);

		// let array = Object.entries(dbLogs).sort((a, b) => {
		// 	return moment(a[0]) < moment(b[0]);
		// });

		let array = Object.entries(dbLogs).reverse();

		let temp = [];
		for (let value of array) {
			value[1].date = value[0];
			temp.push(makeSingleLogText(value[1]));
		}

		setLogs(temp);
	};

	return (
		<Card hidden={hidden}>
			<Typography.Title style={{ textAlign: "center" }}>Logs</Typography.Title>
			<div style={{ maxHeight: "302px", overflowY: "scroll" }}>
				<List
					header={<div>Displaying latest {logs.length} logs</div>}
					dataSource={logs}
					renderItem={(item) => (
						<List.Item>
							<Typography.Text style={{ whiteSpace: "pre-wrap" }}>
								{item}
							</Typography.Text>
						</List.Item>
					)}
				/>
			</div>
		</Card>
	);
};

export default LogPanel;
