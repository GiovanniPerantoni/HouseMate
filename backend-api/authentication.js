const sha256 = require('js-sha256').sha256;

const auth = require("../backend-db/authentication");
const com = require("./common");

const apt = require('../backend-db/apartment');

//  /login
async function login (req, res)
{
	try {
		const { email, pass } = req.body;

		if(!com.checkObligatoryParameters(res, [email, pass], ["string", "string"]))
			return;

		const user = await auth.login(email, sha256(pass));
		if (user == null)
			res.status(401).send({ "motivation": "Invalid credentials." });
		else
			res.status(200).json(com.cleanObjectData(user, ["token"]));
		
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." })
		console.log(err);
	}
}


//  /signup
async function signup(req, res)
{
	try {
		const { first_name, last_name, email, pass } = req.body;

		if(!com.checkObligatoryParameters(res, [first_name, last_name, email, pass], ["string", "string", "email", "string"]))
			return;

		const user = await auth.createAccount(first_name, last_name, email, sha256(pass));
		if (user == null)
			res.status(400).send({ "motivation": "Email already used." });
		else
		{
			res.status(200).json(com.cleanObjectData(user, ["token"]));
		}

	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}


module.exports = { login, signup };