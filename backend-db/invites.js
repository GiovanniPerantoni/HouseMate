const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const apt = require('./apartment.js');

async function _new(owner, users) {
    const token = jwt.sign(
		{ users: users, owner: owner },
		process.env.TOKEN_KEY,
	);
    await apt.Apartment.updateOne(
        { owners: owner.userID },
        { invite: token }
    );
    return token;
}

async function accept(invite, user) {
    try {
		const decoded = jwt.verify(invite, process.env.TOKEN_KEY);
		if (decoded.users.some(id => id == user.userID)) {
            await apt.Apartment.updateOne(
                { owners: decoded.owner.userID },
                { $push: { users: user.userID } }
            );
            return true;
        }
        return false;
	} catch (err) {
		return false;
	}
}

function getUsers(invite) {
    try {
		const decoded = jwt.verify(invite, process.env.TOKEN_KEY);
        return decoded.users;
	} catch (err) {
		return [];
	}
}

module.exports = {_new, accept, getUsers };