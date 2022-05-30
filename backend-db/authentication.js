const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const res = require('express/lib/response');

const userSchema = new mongoose.Schema({
		first_name: { type: String, default: null },
		last_name: { type: String, default: null },
		email: { type: String, unique: true },
		password: { type: String },
		color: { type: String },
		token: { type: String },
});
userSchema.virtual('userID').get(function(){ return this._id.toHexString(); });
userSchema.set('toJSON', { virtuals: true });
const User = mongoose.model("User", userSchema);

async function login(email, password) {
	const user = await User.findOne({email});	//cerco se trovo un utente con l'email datami
	if (user && user.password == password) {	//controllo che l'hash della password sia corretto
		var token = jwt.sign(					//genero il token
			{ userID: user._id, email },
			process.env.TOKEN_KEY,
			{
				expiresIn: "1d",
			}
		);
		user.token = token;
		await user.save();
		return user;
	}
	return null;
}

async function createAccount(first_name, last_name, email, password) {
	// Checks if the user already exist
	const existingUser = await User.findOne({email});
	if (existingUser)													//se esiste un utente con la stessa email mi viene ritornato e se quindi e se questo dovesse accedere allora l'email è già stata utilizzata
		return null;

	const user = await User.create({
		first_name,
		last_name,
		email: email.toLowerCase(),
		password: password,
		color: "#" + Math.floor(Math.random()*0xFFFFFF).toString(16)		//genero un numero tra 0 e FFFFFF e lo traduco a stringa in base 16 (per generare l'hex del colore)
	});

	const token = jwt.sign(
		{ userID: user._id, email },
		process.env.TOKEN_KEY,
		{
			expiresIn: "1d",
		}
	);
	user.token = token;
	await user.save();

	return user;
}

async function exists(user) {
	return await User.findOne({ userID: user.userID });
}

//questa funzione viene chiamata per controllare che l'utente che manda una richiesta abbia i
function verifyToken(req, res, next) {
	const token = req.body.token || req.query.token || req.headers["x-access-token"];
	
	if (!token)
		return res.status(403).json({"motivation":"A token is required for authentication."});
	
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);		//decodifico il token estraendo le info all'interno (userID dell'utente che ha fatto la richiesta)
		req.user = decoded;
	} catch (err) {
		return res.status(401).json({"motivation":"Invalid or expired token."});
	}
	return next();
}

module.exports = { User, login, createAccount, exists, verifyToken };