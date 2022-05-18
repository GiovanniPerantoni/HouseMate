const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const db = require('./database.js');
const res = require('express/lib/response');

const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    color: { type: String },
    token: { type: String },
}); 

const User = mongoose.model("User", userSchema);

async function login(email, password) {
    const user = await User.findOne({email});
    if (user && user.password==password) {
      var token = jwt.sign(
        { user_id: user._id, email },
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
  const oldUser = await User.findOne({email});
  if (oldUser) {
    console.log(oldUser);
    return null;
  }

  const user = await User.create({
    first_name,
    last_name,
    email: email.toLowerCase(),
    password: password,
  });

  const token = jwt.sign(
    { user_id: user._id, email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "1d",
    }
  );
  user.token = token;
  await user.save();

  return user;
}

function verifyToken(req, res, next) {
	const token = req.body.token || req.query.token || req.headers["x-access-token"];
  
	if (!token) {
		return res.status(403).json({"motivation":"A token is required for authentication."});
	}
	try {
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		req.user = decoded;
	} catch (err) {
		return res.status(401).json({"motivation":"Invalid or expired token."});
	}
	return next();
}

module.exports = { User, login, createAccount, verifyToken };