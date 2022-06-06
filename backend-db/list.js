const mongoose = require('mongoose');
const apt = require('./apartment.js');

const itemSchema = new mongoose.Schema({
	userID: { type: mongoose.Schema.Types.ObjectId },
	product: String,
	date: Date,
});
itemSchema.virtual('productID').get(function(){
	return this._id.toHexString();
});
itemSchema.virtual('buyer').get(function(){
	return this.userID.toHexString();
});
itemSchema.set('toJSON', {
	virtuals: true
});
const Item = mongoose.model("item", itemSchema);

async function getProducts(user, limit) {
	const apartment = await apt.getApartment(user);
	const items = await Item.find({
		_id: { $in: apartment.list }
	}).
	select('productID userID product date').
	limit(limit);
	return items;
}

async function createProduct(user, item) {
	const apartment = await apt.getApartment(user);
	if (!apartment) return false;			//se l'utente non fa parte di nessun appartamento non cotinuo

	const itm = await Item.create(item);
	await apt.Apartment.updateOne(
		{ users: user.userID },
		{ $push: { list: itm._id } }
	);
	return true;
}

async function modifyProduct(user, item) {
	const itm = await Item.findOne({ _id: item._id });
	if (!itm) return false;

	await Item.updateOne(
		{ _id: item._id },
		item
	);
	return await Item.findOne({ _id: item._id });
}

async function deleteProduct(user, item) {
	const itm = await Item.findOne({ _id: item._id });
	if (!itm) return false;
	await Item.deleteOne({ _id: item._id });
	await apt.Apartment.updateOne(
		{ users: user.userID },
		{ $pull: { list: itm._id } }
	);
	return true;
}



module.exports = { Item, getProducts, createProduct, modifyProduct, deleteProduct }
