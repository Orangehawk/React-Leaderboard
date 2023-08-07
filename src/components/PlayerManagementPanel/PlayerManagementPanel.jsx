import React, { useState, useRef } from "react";
import {
	Card,
	Typography,
	Button,
	Modal,
	Form,
	Input,
	InputNumber,
	Divider,
	Popconfirm,
	message
} from "antd";
import moment from "moment";
import {
	createPlayerInDatabase,
	updatePlayersInDatabase,
	removeAllPlayersInDatabase,
	getPlayerFromDatabase,
	getPlayersFromDatabase,
	playersToString,
	getDateFormattedUTC
} from "../../helpers/firebaseHelper";
import { createDatabaseLog } from "../../helpers/databaseLogger";

const PlayerManagementPanel = ({
	hidden,
	selectedDate,
	playersToUpdate,
	username,
	setPlayersToUpdate,
	setIsRefreshing,
	setLogIsUpdating,
	CopyScoresFromDate
}) => {
	const [formPlayerName, setFormPlayerName] = useState("");
	const [formPlayerScore, setFormPlayerScore] = useState(1);
	const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);

	const playernamefield = useRef(null);

	const handleKeyDown = (event) => {
		if (event.keyCode === 13) {
			submitFormPlayer();
			playernamefield.current.focus();
		}
	};

	const submitFormPlayer = async () => {
		if (formPlayerName !== "") {
			let sc = null;
			if (moment(selectedDate).date() !== 1) {
				sc = await getPrevDayScore(selectedDate, formPlayerName);
			}

			createPlayerInDatabase(
				selectedDate,
				formPlayerName,
				{
					score: formPlayerScore,
					scorechange: sc ?? formPlayerScore
				},
				username,
				() => {
					setFormPlayerName("");
					setFormPlayerScore(1);
					setIsRefreshing(true);
					setLogIsUpdating(true);
					message.success("Player " + formPlayerName + " added!");
					UpdateFutureScores({
						[formPlayerName]: {
							score: formPlayerScore,
							scorechange: sc ?? formPlayerScore
						}
					});
				}
			);
		} else if (formPlayerName === "") {
			message.error("No player name has been entered!", 5);
		} else {
			message.error("General Error", 5);
		}
	};

	const updatePlayers = async () => {
		if (Object.keys(playersToUpdate).length > 0) {

			await getScoreChange(selectedDate, playersToUpdate);

			updatePlayersInDatabase(selectedDate, playersToUpdate, username, () => {
				setIsRefreshing(true);
				setLogIsUpdating(true);
				message.success("Player scores updated!");
				UpdateFutureScores(playersToUpdate, () => {
					setPlayersToUpdate({});
				});
			});
		} else {
			if (Object.keys(playersToUpdate).length === 0) {
				message.error("No score changes have been made!", 5);
			} else {
				message.error("General Error", 5);
			}
		}
	};

	const getPrevDayScore = async (date, player) => {
		let s = await getPlayerFromDatabase(
			moment(date).subtract(1, "day"),
			player
		);
		return s?.score;
	};

	const getScoreChange = async (date, players) => {
		for (let key of Object.keys(players)) {
			let sc = await getPrevDayScore(date, key);

			if (sc != null && moment(date).date() !== 1) {
				players[key].scorechange = players[key].score - sc;
			} else {
				players[key].scorechange = players[key].score;
			}
		}
	};

	const UpdateFutureScores = async (players, onComplete = () => {}) => {
		if (selectedDate.dayOfYear() !== moment().dayOfYear()) {
			message.info("Updating future scores, please wait...");

			let startDate = selectedDate;
			let endDate;
			let dateA = selectedDate;
			let maxDate = moment();

			//while dateA is still earlier than today, and dateA is not exceeding the month of selectedDate
			while (
				dateA.dayOfYear() < maxDate.dayOfYear() &&
				moment(dateA).add(1, "day").month === selectedDate.month
			) {
				//Get all players for dateA
				let dateAPlayers = await getPlayersFromDatabase(dateA);

				let dateB = moment(dateA).add(1, "day");
				//Get all players for dateB
				let dateBPlayers = await getPlayersFromDatabase(dateB);
				let playerList = {};
				let update = false;

				if (dateAPlayers != null) {
					if (dateBPlayers === null) {
						dateBPlayers = {};
					}

					if (Object.keys(dateBPlayers).length === 0) {
						dateB.add(1, "day");
						if (
							dateB.day() > maxDate.day() ||
							dateB.month !== selectedDate.month
						) {
							break;
						}
                        
                        continue;
					}

					//For each player in dateA
					for (let player of Object.keys(players)) {
						//Update dateB player's total score with reference to dateA
						if (dateBPlayers[player] != null) {
							playerList[player] = dateBPlayers[player];
							playerList[player].score =
								dateAPlayers[player].score + dateBPlayers[player].scorechange;
							update = true;
						} else if (dateBPlayers[player] == null) { //Copy missing player from dateA to dateB
							playerList[player] = dateAPlayers[player];
							playerList[player].scorechange = 0; //Make sure not to carry over the scorechange when propagating scores
							update = true;
						}
					}
				}

				if (update) {
					await getScoreChange(dateB, dateBPlayers);
					updatePlayersInDatabase(
						dateB,
						playerList,
						username,
						() => {
							message.info("Updated scores for " + getDateFormattedUTC(dateB));
						},
						true
					);
				}

				//Shift dateA one day forward
				dateA = dateB;

				endDate = dateB;
			}

			message.success("Finished updating future scores");
			if (endDate) {
				await createDatabaseLog(
					`Updated future scores for:\n\n${playersToString(
						players,
						false
					)}\n\nfrom ${getDateFormattedUTC(startDate)} to ${getDateFormattedUTC(
						endDate
					)}`,
					username
				);
				setLogIsUpdating(true);
			}
			onComplete();
		}
	};

	const showDeleteAllModal = (show) => {
		setDeleteAllModalVisible(show);
	};

	const deleteAllPlayers = () => {
		removeAllPlayersInDatabase(selectedDate, username, () => {
			setIsRefreshing(true);
			setLogIsUpdating(true);
			showDeleteAllModal(false);
			message.success(
				`Removed all players for ${getDateFormattedUTC(selectedDate)}!`
			);
		});
	};

	return (
		<Card hidden={hidden}>
			<Typography.Title style={{ textAlign: "center" }}>
				Player Management
			</Typography.Title>
			<Popconfirm
				title="Are you sure you want to overwrite today's scores with the previous day's scores?"
				onConfirm={() => {
					CopyScoresFromDate(moment(selectedDate).subtract(1, "day"));
				}}
				okText="Overwrite"
				cancelText="Cancel"
			>
				<Button
					disabled={hidden}
					style={{ width: "100%", marginTop: "20px" }}
					type="primary"
				>
					Copy scores from previous day
				</Button>
			</Popconfirm>
			<Popconfirm
				title="Updating a date in the past may take some time in order to update future scores"
				disabled={selectedDate.dayOfYear() === moment().dayOfYear()}
				onConfirm={() => {
					updatePlayers();
				}}
				okText="Update"
				cancelText="Cancel"
			>
				<Button
					disabled={hidden}
					style={{ width: "100%", marginTop: "20px" }}
					type="primary"
					onClick={() => {
						if (selectedDate.dayOfYear() === moment().dayOfYear()) {
							updatePlayers();
						}
					}}
				>
					Update Players
				</Button>
			</Popconfirm>
			<Card style={{ maxWidth: "1000px" }}>
				<Form
					labelCol={{
						span: 4
					}}
					wrapperCol={{
						span: 32
					}}
					onKeyDown={handleKeyDown}
				>
					<Form.Item label="Player">
						<Input.Group compact>
							<Form.Item>
								<Input
									placeholder="Player name"
									value={formPlayerName}
									onChange={(val) => {
										setFormPlayerName(val.target.value);
									}}
									ref={playernamefield}
								/>
							</Form.Item>
							<Form.Item>
								<InputNumber
									placeholder="Score"
									value={formPlayerScore}
									min={0}
									onChange={(val) => {
										setFormPlayerScore(val);
									}}
								/>
							</Form.Item>
						</Input.Group>
					</Form.Item>
				</Form>
				<Button
					disabled={hidden}
					style={{ width: "50%", marginLeft: "25%" }}
					type="primary"
					onClick={() => {
						submitFormPlayer();
					}}
				>
					Add/Update Player
				</Button>
			</Card>
			<Divider />
			<Button
				danger
				style={{ width: "100%" }}
				onClick={() => {
					showDeleteAllModal(true);
				}}
			>
				Delete all players for selected day
			</Button>

			<Modal
				title="Delete All Players for selected day"
				visible={deleteAllModalVisible}
				onCancel={() => {
					showDeleteAllModal(false);
				}}
				footer={[
					<Button
						key="back"
						onClick={() => {
							showDeleteAllModal(false);
						}}
					>
						Cancel
					</Button>,
					<Popconfirm
						title={`Are you sure you want to delete all players for ${getDateFormattedUTC(
							selectedDate
						)}? (This is not reversable)`}
						onConfirm={() => {
							deleteAllPlayers();
						}}
						okText="Delete"
						cancelText="Cancel"
					>
						<Button key="submit">Delete all players for selected day</Button>
					</Popconfirm>
				]}
			>
				Delete all players for {getDateFormattedUTC(selectedDate)} from the
				leaderboard?
			</Modal>
		</Card>
	);
};

export default PlayerManagementPanel;
