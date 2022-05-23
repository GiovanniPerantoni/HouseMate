const apt = require("../backend-db/apartment");
const com = require("./common");

//  /apartment/users
async function users (req, res) {
	try {
		const users = await apt.getUsers(req.user);		//il parametro user viene messo in authentication/verifyToken prima di passare a questa funzione
		res.status(200).json(com.cleanObjectDataArray(users, ["first_name", "last_name", "color"]));
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

//  /apartment/manage/info GET
async function manageView (req, res) {
	try {
		const apartmentInfo = await apt.getInfo(req.user);		//il parametro user viene messo in authentication/verifyToken prima di passare a questa funzione
		res.status(200).send(com.cleanObjectData(apartmentInfo, ["rules", "name", "address"]));
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

//  /apartment/manage/info PATCH
async function manageInfo (req, res) {
	try {
		const { name, rules, address } = req.body;

		if(!com.checkOptionalParameters([name, rules, address], ["string", "string", "string"]))
			return;

		const apartment = {};
		if (name) apartment.name = name;
		if (rules) apartment.rules = rules;
		if (address) apartment.address = address;
		
		const result = await apt.createOrUpdate(req.user, apartment);
		if (!result)
			res.status(400).send({ "motivation": "Couldn't add or modify apartment." });
		else
			res.status(200).send();
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

<<<<<<< HEAD
module.exports = { users, manageView, manageInfo };
=======
module.exports = { users, manageInfoPOST, manageInfoPATCH };
>>>>>>> 79bcd6533401c3a469533d59613458e4bf762235
