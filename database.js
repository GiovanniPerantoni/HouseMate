const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
  }); 
const User = mongoose.model("User", userSchema);
module.exports = mongoose.model("user", userSchema);

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

module.exports = { login, createAccount }