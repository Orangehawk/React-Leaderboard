import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button, Card, Chip, createTheme, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography } from '@mui/material'
import { dark } from '@mui/material/styles/createPalette'
import { getPlayersFromDatabase } from './firebaseHelper'
import moment from 'moment'

function TestDisplay() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button variant="contained" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function Leaderboard() {

  const fakeData = [
    {"name":"A", "score":Math.floor(Math.random() * 20)},
    {"name":"B", "score":Math.floor(Math.random() * 20)},
    {"name":"C", "score":Math.floor(Math.random() * 20)},
    {"name":"D", "score":Math.floor(Math.random() * 20)},
    {"name":"E", "score":Math.floor(Math.random() * 20)},
    {"name":"F", "score":Math.floor(Math.random() * 20)},
    {"name":"G", "score":Math.floor(Math.random() * 20)},
  ]

  fakeData.sort((a, b) => b.score - a.score)

  return (
    <Stack>
      <Card variant="outlined">
      <Typography variant="h3" gutterBottom>
        Panik Leaderboard
      </Typography>
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Place</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Paniks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              fakeData.map((row, i) =>(
                <TableRow key={row.name}>
                <TableCell>{i+1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.score}</TableCell>
              </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      </Card>
    </Stack>
  )
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  }
})

async function App()  {
  var date = moment().subtract(5, "days")
  var result = await getPlayersFromDatabase(date)
  console.log(result)
  return (
  <ThemeProvider theme={darkTheme}>
    <Leaderboard></Leaderboard>
  </ThemeProvider>
)
}

export default App
