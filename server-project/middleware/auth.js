
const { verifityToken } = require("../helpers/jwt");
const { User } = require("../models/index");


const authorized = async (req, res, next) => {

    try {
        // console.log(req.headers,"hahah");
        let { access_token } = req.headers
        // console.log(access_token,"hedarrssss");
        if (!access_token) {
            throw ({ name: "Invalid token" })
        }
        
        let decode = verifityToken(access_token)
        let data = await User.findOne({
            where: {
                id: decode.id
            }
        })
        // console.log(data,"iniii");
        if (!data) {
            throw ({ name: "Invalid token" })
        }
        req.userLogin = data
        
        next()
    } catch (err) {
        console.log(err);
        if (err.name === "Invalid token"  ||err.name === "JsonWebTokenError" ) {
            res.status(401).json({ message: "Invalid token"})
        }else{
            res.status(500).json({ message: "Internal server error"})
        }
        
    }

}

module.exports = { authorized }