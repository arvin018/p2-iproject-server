const express = require('express');
const Controller = require('./Controller/controller');
const app = express()
const port = 1812
const cors =require('cors');
const { authorized } = require('./middleware/auth');
const steamid = '76561198192946697'

const steamApiKey = 'FBDD4952A898BE1A214681A570F40B41';

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) 

app.post('/register',Controller.register)

app.post('/login',Controller.login)

app.use(authorized)

app.get('/games',Controller.fetchGames)

app.post('/generateMitransToken',Controller.generateMitransToken)

app.get('/newsTechnlogies',Controller.fetchNewsTechnologies)

app.get('/gamesData',Controller.fetchDataGamesSteamAppId)

app.get('/games/:id',Controller.fetchGamesById)




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})