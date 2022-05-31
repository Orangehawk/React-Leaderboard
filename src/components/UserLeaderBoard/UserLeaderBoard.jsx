import React, { useState } from "react";
import { Card, Layout } from "antd";
import moment from "moment";
import BaseLeaderboard from "../BaseLeaderboard/BaseLeaderboard";

const UserLeaderboard = () => {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [selectedDate, setSelectedDate] = useState(moment());

	return (
		<Layout style={{ margin: "auto", maxWidth: "1000px" }}>
			<BaseLeaderboard
				selectedDate={selectedDate}
				setSelectedDate={setSelectedDate}
				isRefreshing={isRefreshing}
				setIsRefreshing={setIsRefreshing}
			/>
		</Layout>
	);
};

export default UserLeaderboard;
