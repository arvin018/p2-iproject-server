const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models/index");
const games = require('../games.json');
const axios = require('axios');
const fs = require("fs");
const midtransClient = require('midtrans-client');
const { log } = require("console");


class Controller {

    static async register(req, res) {
        try {
            let { email, password, username } = req.body
            let dataRegister = await User.create({
                email,
                password,
                username
            })
            let dataResult = {
                id: dataRegister.id,
                email: dataRegister.email,
                username: dataRegister, username
            }
            res.status(200).json(dataResult)
        } catch (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
                res.status(400).json({ message: err.errors[0].message })
            } else if (err.name === "SequelizeValidationError") {
                res.status(400).json({ message: err.errors[0].message })
            } else {
                res.status(500).json({ message: "Internal server error", err })
            }
        }
    }

    static async login(req, res) {
        try {
            let { email, password } = req.body
            if (!email) {
                throw ({ name: "Email is required" })
            }

            if (!password) {
                throw ({ name: "Password is required" })
            }
            let dataLogin = await User.findOne({
                where: {
                    email
                }
            })

            if (!dataLogin) {
                throw ({ name: "Invalid email/password" })
            }

            if (!comparePassword(password, dataLogin.password)) {
                throw ({ name: "Invalid email/password" })
            }

            let access_token = signToken({ id: dataLogin.id, email: dataLogin.email })

            res.status(200).json({ access_token })
        } catch (err) {
            if (err.name === "Invalid email/password") {
                res.status(401).json({ message: err.name })
            } else if (err.name) {
                res.status(400).json({ message: err.name })
            } else {
                res.status(500).json({ message: "Internal server error" })
            }
        }
    }

    static async fetchGames(req, res) {
        try {

            res.status(200).json(games)
        } catch (err) {
            res.status(500).json({ message: "Internal server error" })
        }
    }

    static async fetchGamesById(req, res) {
        try {
            let { id } = req.params
            let result = []
            games.find(el => {
                if (el.steam_appid === +(id)) {
                    return result = el
                }
            })

            if (result.length === 0) {
                throw ({ name: "Data Not Found" })
            }

            res.status(200).json(result)

        } catch (err) {
            if (err.name === "Data Not Found") {
                res.status(400).json({ message: "Data Not Found" })
            } else {
                res.status(500).json({ message: "Internal server error" })

            }
        }
    }


    static fetchNewsTechnologies(req, res) {
        const options = {
            method: 'GET',
            url: ' https://newsapi.org/v2/top-headlines',
            params: {
                'country': 'us',
                'category': 'technology',
                'apiKey': '3224442aca354406b000d716385f5412'
            }
        };
        axios.request(options).then(function (response) {
            // console.log(response.data);
            let dataNews = response.data
            let resultNews = dataNews.articles.map(el => {

                if (el.source.name === null || el.urlToImage === null) {
                    delete el.name,
                        delete el.source,
                        delete el.title,
                        delete el.urlToImage
                    delete el.publishedAt
                    delete el.content

                } else if (el.author === null || el.content === null) {
                    return {
                        "source": el.source.name,
                        "author": "anonymous",
                        "title": el.title,
                        "urlToImage": el.urlToImage,
                        "publishedAt": el.publishedAt.substring(0, 10),
                        "content": "anonymous"
                    }

                } else {
                    return {
                        "source": el.source.name,
                        "author": el.author,
                        "title": el.title,
                        "urlToImage": el.urlToImage,
                        "publishedAt": el.publishedAt.substring(0, 10),
                        "content": el.content
                    }
                }



            })
            res.status(200).json(resultNews)

        }).catch(function (error) {

            res.status(500).json({ message: "Internal server error" })
        });
    }




    static async fetchDataGamesSteamAppId(req, res) {
        try {

            // const id = 985810
            const dataId = [570, 985810, 500, 1748528, 578080, 1172470, 601150, 397540, 1811950]

            const dataTotalUrl = []
            for (let i = 0; i < dataId.length; i++) {
                let options = {
                    method: 'GET',
                    url: 'https://store.steampowered.com/api/appdetails',
                    params: {
                        appids: dataId[i]
                    }
                }
                dataTotalUrl.push(options)
            }
            // console.log(dataTotalUrl);

            const secondGetSteam = async (payload) => {
                const { data } = await axios(payload)
                return data
            }

            let array = []

            for (const steam of dataTotalUrl) {
                let dataSteam = await secondGetSteam(steam)
                // console.log(dataSteam)

                let resultDataSteam = '';
                for (let key in dataSteam) {
                    resultDataSteam = dataSteam[`${key}`].data
                }

                let finalDataSteam = {}
                for (let gameSteam in resultDataSteam) {
                    if (resultDataSteam['is_free'] === false) {

                        finalDataSteam = {
                            name: resultDataSteam['name'],
                            steam_appid: resultDataSteam['steam_appid'],
                            price: resultDataSteam['price_overview'].final_formatted,
                            about_the_game: resultDataSteam['about_the_game'],
                            detailed_description: resultDataSteam['detailed_description'],
                            image: resultDataSteam['header_image'],
                            platforms: resultDataSteam['platforms']
                        }

                    } else {

                        finalDataSteam = {
                            name: resultDataSteam['name'],
                            steam_appid: resultDataSteam['steam_appid'],
                            price: "Rp 0",
                            detailed_description: resultDataSteam['detailed_description'],
                            supported_languages: resultDataSteam['supported_languages'],
                            image: resultDataSteam['header_image'],
                            platforms: resultDataSteam['platforms']
                        }
                    }
                }
                array.push(finalDataSteam)
            }
            // console.log(array)


            const jsonData = JSON.stringify(array);

            fs.writeFile("games.json", jsonData, "utf8", (error) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log("Data saved to data.json file");
                }
            });

            res.status(200).json(array)
        } catch (err) {
            res.status(500).json({ message: "Internal server eror" })
        }
    }

    static async generateMitransToken(req, res) {
        try {
            // console.log(req.userLogin.id,"iniiiii");
            let findUser = await User.findOne({
                where: {
                    id: req.userLogin.id
                }
            })
            if (findUser.status === "paid") {
                throw ({ name: "Already paid" })
            }

            let snap = new midtransClient.Snap({
                // Set to true if you want Production Environment (accept real transaction).
                isProduction: false,
                // serverKey: process.env.MITRANS-SERVER-KEY
                serverKey:"SB-Mid-server-8zF3hYnLlqiwn_pfBbqMw0MR"
            });

            let parameter = {
                "transaction_details": {
                    "order_id": "Transaction" + Math.floor(10000 * Math.random + 900000),
                    "gross_amount": 100000
                },
                "credit_card": {
                    "secure": true
                },
                "customer_details": {
                    "email": req.userLogin.email

                }
            };
            const mitransToken = await snap.createTransaction(parameter)
            console.log(mitransToken);
            res.status(201).json(mitransToken)
        } catch (err) {
            console.log(err);
            if (err.name === "Already paid") {
                res.status(400).json({ message: "Already paid" })
            } else {
                res.status(500).json({ message: "Internal server eror" })
            }

        }
    }
}
module.exports = Controller