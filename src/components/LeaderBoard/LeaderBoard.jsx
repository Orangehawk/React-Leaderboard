import React, { useState, useEffect } from "react";
import { Table, Tag, Space } from "antd";
import firebase from '../../config/firebaseConfig';

// TODO: Remove Hardcoded Scores
const scores = [
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
    ["Chungwoo", 1],
];

//Place	Name Paniks
const columns = [
    {
        title: "Place",
        dataIndex: "place",
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "Paniks",
        dataIndex: "paniks",
    },
];

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [score, setScore] = useState();

    // Runs on first render
    useEffect(() => {
        // getDatabasePlayers();

        // TODO: Remove Hardcoded Score
        setScore(scores);
    }, []);

    useEffect(() => {
        if (score) {
            sortScores();
            createTableFromScores();
        }
    }, [score]);

    const sortScores = () => {
        console.log('Sort');
        setScore(score.sort((a, b) => {
            return b[1] - a[1];
        }));
    };

    const makePlayerEntry = (place, name, score) => {
        return { place: place, name: name, paniks: score };
    };

    const createTableFromScores = () => {
        console.log('Create Table');
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

        setData(tempData);
    };

    const getDatabasePlayers = () => {
        console.log('Get Database')
        const dbRef = firebase.database().ref();
        dbRef.child("players").get().then((snapshot) => {
            if (snapshot.exists()) {
                console.log('exist', snapshot.val());
                // setScore(snapshot.val().player);
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    };

    return (
        <Table columns={columns} dataSource={data} pagination={false} />
    );
};

export default Leaderboard;