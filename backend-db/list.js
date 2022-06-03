const mongoose = require('mongoose');
const apt = require('./apartment.js');

const itemSchema = new mongoose.Schema({
	userID: { type: mongoose.Schema.Types.ObjectId },
	product: String,
	date: Date,
});
itemSchema.virtual('itemID').get(function(){
	return this._id.toHexString();
});
itemSchema.set('toJSON', {
	virtuals: true
});
const Item = mongoose.model("item", itemSchema);

async function createProduct(user, item) {
	const apartment = await apt.getApartment(user);
	if (!apartment) return false;			//se l'utente non fa parte di nessun appartamento non cotinuo

	const newItem = await Item.create(item);
	await apt.Apartment.updateOne(
		{ users: user.userID },
		{ $push: { list: newItem._id } }
	);
	return true;
}

async function modifyProduct(user, item) {
	return false;
}

module.exports = { Item, createProduct, modifyProduct }
