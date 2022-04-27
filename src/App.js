import './App.css';
import 'antd/dist/antd.dark.css';
import { Table, Tag, Space } from 'antd';


const SortScores = (data) => {
  data.sort((a, b) => { return b[1] - a[1]; });
  return data;
}

const MakePlayerEntry = (place, name, score) => {
    return {place: place, name: name, paniks: score};
}

const Leaderboard = () => {

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
        }
    ];
    const data = [];
    const scores = [["Alcara", 7], ["Av'yana", 45], ["Ayleth", 9], ["Crimson", 7], ["Ki'sae", 30], ["Miniya", 3], ["Mitsue", 5], ["Otaku", 4], ["R'aeyon", 11], ["Reina", 12], ["Reshina", 10], ["Rien", 11], ["Rorik", 2], ["Shiro", 6], ["Yuza", 2], ["Al", 1], ["Anna", 5], ["Agnes", 1], ["Banana", 3], ["Renlino", 2], ["Chungwoo", 1]];

    SortScores(scores);

    for(var i = 0; i < scores.length; i++) {
        let place = 0;

        if(i>1 && scores[i][1] == scores[i-1][1])
            place = data[i - 1].place;
        else
            place = i + 1;

        data.push(MakePlayerEntry(place, scores[i][0], scores[i][1]));
    }

    console.log(scores.length);
    console.log(data);

    return <Table columns={columns} dataSource={data} pagination={false} />;
}

function App() {
  return <Leaderboard />;
}

export default App;