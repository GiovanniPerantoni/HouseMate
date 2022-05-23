const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const auth = require('./authentication.js');

const apartmentSchema = new mongoose.Schema({
	name: { type: String, default: null },
	rules: { type: String, default: null},
	address: { type: String, default: null },
	owners: { type: [mongoose.Schema.Types.ObjectId] },
	users: { type: [mongoose.Schema.Types.ObjectId] },
	expenses: { type: [mongoose.Schema.Types.ObjectId]},
	totals: { type: [
		{
			userID: { type: mongoose.Schema.Types.ObjectId },
			total: Number
		}
	]}
});
const Apartment = mongoose.model("apartment", apartmentSchema);

async function getApartment(user) {
	const apartment = await Apartment.findOne({
		users: user.userID
	});
	return apartment;
}

//prendo le info dell'appartamento in cui l'utente si trova
async function getInfo(user) {
	const apartment = await Apartment.findOne({
		users: user.userID
	}).
	select("name rules address");
	return apartment;
}

async function getUsers(user) {
	const apartment = await Apartment.findOne({
		users: user.userID
	});
	const users = await auth.User.find({
		_id: { $in : apartment.users }
	}).select("userID first_name last_name color");
	return users;
}

async function isOwner(user) {
	return await Apartment.find({ "owners" : user.userID}).count() > 0;
}


//!!! funzionalità temporanea dello sprint 1 da cambiare con l'implementazione del sistema di inviti
//se l'utente non fa parte di un appartamento viene creato, se invece ne fa parte ed è l'owner vigono modificate le info
async function createOrUpdate(user, apartmentInfo) {
	const apt = await getApartment(user);
	if (apt) {
		if (await isOwner(user)) {
			await Apartment.updateOne({ owners: user.userID }, apartmentInfo);
			return true;
		} else {
			return false;
		}
	} else {
		await Apartment.create({
			owners: [user.userID],
			users: [user.userID],
			name: apartmentInfo.name,
			rules: apartmentInfo.rules,
			address: apartmentInfo.address,
			totals: [{userID: user.userID, total: 0}]
		});
		return true;
	}
}

module.exports = { Apartment, getUsers, getApartment, getInfo, isOwner, createOrUpdate }