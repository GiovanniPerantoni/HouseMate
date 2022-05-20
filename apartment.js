const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./database.js');
const auth = require('./auth.js');

// TODO: complete the schema with all the necessary fields
const apartmentSchema = new mongoose.Schema({
    name: { type: String, default: null },
    owners: { type: [mongoose.Schema.Types.ObjectId] },
    users: { type: [mongoose.Schema.Types.ObjectId] },
    expenses: { type: [mongoose.Schema.Types.ObjectId]},
    totals: { type: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId },
            total: Number
        }
    ]}
});
const Apartment = mongoose.model("apartment", apartmentSchema);

async function getApartment(user) {
    const apartment = await Apartment.findOne({
        users: user.user_id
    });
    return apartment;
}

async function getUsers(user) {
    const apartment = await Apartment.findOne({
        users: user.user_id
    });
    const users = await auth.User.find({
        _id: { $in : apartment.users }
    }).select("_id first_name last_name color");
    return users;
}

async function isOwner(user) {
    return await Apartment.find({ "owners" : user.user_id}).count() > 0;
}

module.exports = { Apartment, getUsers, getApartment, isOwner }