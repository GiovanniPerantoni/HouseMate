//queste funzioni chiamate prima di aprire un files

const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const sha256 = require('js-sha256').sha256;

const auth = require("../backend-db/authentication")
const exp = require("../backend-db/expenses")


beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI);

	//TODO fare direttamente il signup e che l'utente sia invitato in un appartamento normalmente
	let user = await auth.login(global.email, sha256(global.pass))
	global.validToken = user.token;
	
	//TODO scriverlo meglio
	let expense = await exp.createExpense(user, {
			userID: user.userID,
			product: "pizza",
			date: "1653917801188",
			price: 123
		})
	global.validExpenseID = expense._id;

	expense = await exp.createExpense(user, {
			userID: user.userID,
			product: "pizza",
			date: "1653917801188",
			price: 123
		})
	global.validExpenseID1 = expense._id;
	expense = await exp.createExpense(user, {
			userID: user.userID,
			product: "pizza",
			date: "1653917801188",
			price: 123
		})
	global.validExpenseID2 = expense._id;
	expense = await exp.createExpense(user, {
			userID: user.userID,
			product: "pizza",
			date: "1653917801188",
			price: 123
		})
	global.validExpenseID3 = expense._id;
});
afterAll((done) => {
	mongoose.connection.close(true);
	done()
});

