const {app} = require('../app')
const request = require('supertest');
const com = require('./common');

const PREFIX = process.env.PREFIX;

commonOptions = {
	'Accept': 'application/json'
}

//#region /apartment/manage/info [GET]
// test: 7
test(`controllare l'api ${PREFIX}/apartment/manage/info risponda`, async () => {
	return request(app).get(PREFIX + '/apartment/manage/info').set(commonOptions).send({})
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 7.1
test(`controllare l'api ${PREFIX}/apartment/manage/info funzioni`, async () => {
	return request(app).get(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 7.4
test(`controllare che l'api ${PREFIX}/apartment/manage/info richieda il token di autenticazione`, async () => {
	return request(app).get(PREFIX + '/apartment/manage/info').set(commonOptions).send({})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 7.5
test(`controllare che l'api ${PREFIX}/apartment/manage/info richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).get(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 7.7
test(`controllare che l'api ${PREFIX}/apartment/manage/info restituisca solo i parametri descritti nella documentazione`, async () => {
	return request(app).get(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["rules", "name", "address"]);
	});
});

//#endregion


//#region /apartment/manage/info [PATCH]
// test: 8
test(`controllare l'api ${PREFIX}/apartment/manage/info risponda`, async () => {
	return request(app).patch(PREFIX + '/apartment/manage/info').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 8.1
test(`controllare l'api ${PREFIX}/apartment/manage/info funzioni`, async () => {
	return request(app).patch(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		name: "nuovo nome appartamento",
		rules: "nuove regole",
		address: "nuovo indirizzo"
	}).then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 8.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/manage/info`, async () => {
	return request(app).patch(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		name: 456,
		rules: "nuove regole",
		address: "nuovo indirizzo"
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 8.4
test(`controllare che l'api ${PREFIX}/apartment/manage/info richieda il token di autenticazione`, async () => {
	return request(app).patch(PREFIX + '/apartment/manage/info').set(commonOptions).send({
		name: "nuovo nome appartamento",
		rules: "nuove regole",
		address: "nuovo indirizzo"
	}).then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 8.5
test(`controllare che l'api ${PREFIX}/apartment/manage/info richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).patch(PREFIX + '/apartment/manage/info').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		name: "nuovo nome appartamento",
		rules: "nuove regole",
		address: "nuovo indirizzo"
	}).then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

//#endregion


//#region /apartment/users [GET]
// test: 9
test(`controllare l'api ${PREFIX}/apartment/users risponda`, async () => {
	return request(app).get(PREFIX + '/apartment/users').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 9.1
test(`controllare l'api ${PREFIX}/apartment/users funzioni`, async () => {
	return request(app).get(PREFIX + '/apartment/users').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 9.4
test(`controllare che l'api ${PREFIX}/apartment/users richieda il token di autenticazione`, async () => {
	return request(app).get(PREFIX + '/apartment/users').set(commonOptions).send({})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 9.5
test(`controllare che l'api ${PREFIX}/apartment/users richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).get(PREFIX + '/apartment/users').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 9.7
test(`controllare che l'api ${PREFIX}/apartment/users restituisca solo i parametri descritti nella documentazione`, async () => {
	return request(app).get(PREFIX + '/apartment/users').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArgumentsArray(res, ["userID", "first_name", "last_name", "color"]);
	});
});

//#endregion
