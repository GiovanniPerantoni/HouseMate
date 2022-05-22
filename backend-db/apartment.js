const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./database.js');
const auth = require('./authentication.js');

// TODO: complete the schema with all the necessary fields
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

async function createOrUpdate(user, apartment) {
	const apt = await getApartment(user);
	if (apt) {
		if (await isOwner(user)) {
			await Apartment.updateOne({ owners: user.userID }, apartment);
			return true;
		} else {
			return false;
		}
	} else {
		await Apartment.create({
			owners: [user.userID],
			users: [user.userID],
			name: apartment.name,
			rules: apartment.rules,
			address: apartment.address,
			totals: [{userID: user.userID, total: 0}]
		});
		return true;
	}
}

module.exports = { Apartment, getUsers, getApartment, getInfo, isOwner, createOrUpdate }