const auth = require("../backend-db/authentication");
const sha256 = require('js-sha256').sha256;

async function login (req, res)
{
	try {
		const { email, pass } = req.body;
		if (!(email && pass)) {
			res.status(400).send({ "motivation": "Missing parameters in the request." });
			return;
		}
		if ((typeof email != "string") ||
			(typeof pass != "string")) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}

		const user = await auth.login(email, sha256(pass));
		if (!user)
			res.status(401).send({ "motivation": "Invalid credentials." });
		else
			res.status(200).json(user);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." })
		console.log(err);
	}
}

async function signup(req, res)
{
	try {
		const { first_name, last_name, email, pass } = req.body;
		if (!(email && pass && first_name && last_name)) {
			res.status(400).send({ "motivation": "Missing parameters in the request." });
			return;
		}
		if ((typeof first_name != "string") ||
			(typeof last_name != "string") ||
			(typeof email != "string") ||
			(typeof pass != "string")) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}
		const user = await auth.createAccount(first_name, last_name, email, sha256(pass));
		if (!user)
			res.status(400).send({ "motivation": "Email already used." });
		else
			res.status(200).json(user);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}


module.exports = { login, signup };