//this file is used to create and mantain the connect with the mongo db database (local or remote)

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');

main().catch(err => console.log(err));
async function main() {
	await mongoose.connect(process.env.MONGO_URI);
}