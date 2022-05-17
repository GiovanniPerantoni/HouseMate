//https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/

const jwt = require("jsonwebtoken");

const config = process.env;

//TODO controllare che funzioni
const verifyToken = (req, res, next) => {
	const token = req.body.token || req.query.token || req.headers["x-access-token"];

	if (!token)
		return res.status(403).send("A token is required for authentication");
	
	try
	{
		const decoded = jwt.verify(token, config.TOKEN_KEY);
		req.user = decoded;
	}
	catch (err)
	{
		return res.status(401).send("Invalid Token");
	}
	return next();
};

module.exports = verifyToken;