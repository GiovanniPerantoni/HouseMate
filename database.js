const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}