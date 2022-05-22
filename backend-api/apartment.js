const apt = require("../backend-db/apartment");

async function users (req, res) {
	try {
		const users = await apt.getUsers(req.user);
		res.status(200).json(users);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

async function manageInfoPOST (req, res) {
	try {
		const info = await apt.getInfo(req.user);
		res.status(200).send(info);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}
async function manageInfoPATCH (req, res) {
	try {
		const { name, rules, address } = req.body;
		if ((name && (typeof name != "string")) ||
			(rules && (typeof rules != "string")) ||
			(address && (typeof address != "string"))) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}
		const apartment = {};
		if (name) apartment.name = name;
		if (rules) apartment.rules = rules;
		if (address) apartment.address = address;
		
		const result = await apt.createOrUpdate(req.user, apartment);
		if (result)
			res.status(200).json("");
		else
			res.status(400).send({ "motivation": "Couldn't add or modify apartment." });
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

module.exports = { users, manageInfoPOST, manageInfoPATCH };
