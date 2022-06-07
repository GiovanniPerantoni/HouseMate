//queste funzioni chiamate prima di aprire un files

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');
const sha256 = require('js-sha256').sha256;

const auth = require("../backend-db/authentication")
const apa = require("../backend-db/apartment")
const exp = require("../backend-db/expenses")
const invi = require("../backend-db/invites")
const list = require("../backend-db/list")
const com = require('../test/common');


beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI);


	let ownerUser;
	let listUsersValidInvitedUsers = []
	global.validOwners = []
	global.validNewUsers = []
	global.validInvitedUsers = []
	for (let i = 0; i < 20; i++) {
		let userInfo = {}
		userInfo.email = com.generateValue("email")
			//TODO controllare che non esista e se esiste provare con un'altra email casuale
		userInfo.pass = "admin"
		let user =  await auth.createAccount("admin", "admin", userInfo.email, sha256(userInfo.pass))
		userInfo.token = user.token;

		if(i <= 5)
		{
			//owners
			apa.createOrUpdate(user, {
				name: "apartment 1",
				rules: "no rules",
				address: "povo 1"
			})
			ownerUser = user;
			validOwners.push(userInfo);
		}
		else if(i <= 10)
		{
			//utenti appena creati (no appartamento)
			validNewUsers.push(userInfo);
		}
		else
		{
			//utenti invitati ad un appartamento
			validInvitedUsers.push(userInfo);
			listUsersValidInvitedUsers.push(user._id);
		}
	}
	//fare richiesta ai vari utenti
	global.inviteToken = await invi._new(ownerUser, listUsersValidInvitedUsers)

	
	//expenses
	global.validExpenseIDs = [];
	for (let i = 0; i < 4; i++) {
		let expense = await exp.createExpense(ownerUser, {
			userID: ownerUser.userID,
			product: "pizza",
			date: "1653917801188",
			price: 123
		});
		global.validExpenseIDs.push(expense._id.toString());
	}

	//expenses
	global.validProductId = [];
	for (let i = 0; i < 4; i++) {
		let listItem = await list.createProduct(ownerUser, {
			userID: ownerUser.userID,
			product: "pizza",
			date: "1653917801188",
		});
		global.validProductId.push(listItem._id.toString());
	}
});


afterAll((done) => {
	mongoose.connection.close(true);
	done()
});

