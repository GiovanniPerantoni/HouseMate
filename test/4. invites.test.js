
const {app} = require('../app')
const request = require('supertest');
const com = require('./common');

const PREFIX = process.env.PREFIX;

commonOptions = {
	'Accept': 'application/json'
}

//#region /apartment/invites/new [PATCH]
// test: 10
test(`controllare l'api ${PREFIX}/apartment/invites/new risponda`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 10.1
test(`controllare l'api ${PREFIX}/apartment/invites/new funzioni`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		users: [global.validInvitedUsers[0].email]
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 10.2
test(`controllare parametri mancanti per ${PREFIX}/apartment/invites/new`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 10.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/invites/new`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		users: "tante emails"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 10.4
test(`controllare che l'api ${PREFIX}/apartment/invites/new richieda il token di autenticazione`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).send({
		users: [global.validInvitedUsers[0].email]
	})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 10.5
test(`controllare che l'api ${PREFIX}/apartment/invites/new richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		users: [global.validInvitedUsers[0].email]
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});


/*
TODO investigare perchè da 200
// test: 10.6
test(`controllare che l'api ${PREFIX}/apartment/invites/new richieda che l'utente entri in un appartamento`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', global.validNewUsers[0].token).send({
		users: [global.validInvitedUsers[0].email]
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid invited list."});
	});
});
*/

// test: 10.7
test(`controllare che l'api ${PREFIX}/apartment/invites/new restituisca solo i parametri descritti nella documentazione`, async () => {
	return request(app).patch(PREFIX + '/apartment/invites/new').set(commonOptions).set('x-access-token', global.validOwners[1].token).send({
		users: [global.validInvitedUsers[1].email]
	})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["invite"]);
	});
});

//#endregion


//#region /apartment/invites/accept [POST]
// test: 11
test(`controllare l'api ${PREFIX}/apartment/invites/accept risponda`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 11.1
test(`controllare l'api ${PREFIX}/apartment/invites/accept funzioni`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).set('x-access-token', global.validInvitedUsers[0].token).send({
		invite: global.inviteToken
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 11.2
test(`controllare parametri mancanti per ${PREFIX}/apartment/invites/accept`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).set('x-access-token', global.validInvitedUsers[1].token).send({})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 11.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/invites/accept`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).set('x-access-token', global.validInvitedUsers[2].token).send({
		invite: 123
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 11.4
test(`controllare che l'api ${PREFIX}/apartment/invites/accept richieda il token di autenticazione`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).send({
		invite: global.inviteToken
	})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 11.5
test(`controllare che l'api ${PREFIX}/apartment/invites/accept richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		invite: global.inviteToken
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

/*
// test: 11.6.1
test(`controllare che l'api ${PREFIX}/apartment/invites/accept TODO`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).send({TODO})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "TODO"});
	});
});

// test: 11.6.2
test(`controllare che l'api ${PREFIX}/apartment/invites/accept TODO`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).send({TODO})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "TODO"});
	});
});

// test: 11.6.3
test(`controllare che l'api ${PREFIX}/apartment/invites/accept TODO`, async () => {
	return request(app).post(PREFIX + '/apartment/invites/accept').set(commonOptions).send({TODO})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "TODO"});
	});
});
*/

//#endregion