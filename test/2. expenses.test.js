const {app} = require('../app')
const request = require('supertest');
const com = require('./common');

const PREFIX = process.env.PREFIX;

commonOptions = {
	'Accept': 'application/json'
}

//#region /apartment/expenses/view [GET]
// test: 3
test(`controllare l'api ${PREFIX}/apartment/expenses/view risponda`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/view').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 3.1
test(`controllare l'api ${PREFIX}/apartment/expenses/view funzioni`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		limit: 1 
	}).then((res) => {
		expect(res.status).toBe(200);
	});
});


// test: 3.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/expenses/view`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		limit: "1"
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 3.4
test(`controllare che l'api ${PREFIX}/apartment/expenses/view richieda il token di autenticazione`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).send({}).then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 3.5
test(`controllare che l'api ${PREFIX}/apartment/expenses/view richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		limit: "1"
	}).then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 3.7
test(`controllare che l'api ${PREFIX}/apartment/expenses/view restituisca solo i parametri descritti nella documentazione`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["totals", "expenses"]);
	});
});

// test: 3.8
test(`controllare che l'api ${PREFIX}/apartment/expenses/view restituisca un errore se il parametro limit è minore o uguale a 0`, async () => {
	return request(app).get(PREFIX + '/apartment/expenses/view').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		limit: -1
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid limit."});
	});
});

//#endregion

//#region /apartment/expenses/add [POST]
// test: 4
test(`controllare l'api ${PREFIX}/apartment/expenses/add risponda`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 4.1
test(`controllare l'api ${PREFIX}/apartment/expenses/add funzioni`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123.0
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 4.2
test(`controllare parametri mancanti per ${PREFIX}/apartment/expenses/add`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		product: "pizza",
		price: 123
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 4.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/expenses/add`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		product: 567,
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 4.4
test(`controllare che l'api ${PREFIX}/apartment/expenses/add richieda il token di autenticazione`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).send({
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	}).then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 4.5
test(`controllare che l'api ${PREFIX}/apartment/expenses/add richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	}).then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 4.8
test(`controllare che l'api ${PREFIX}/apartment/expenses/add restituisca un errore se il parametro price è minore o uguale a 0`, async () => {
	return request(app).post(PREFIX + '/apartment/expenses/add').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: -10
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid price."});
	});
});

//#endregion


//#region /apartment/expenses/modify [POST]
// test: 5
test(`controllare l'api ${PREFIX}/apartment/expenses/modify risponda`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', global.validOwners[0].token)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 5.1
test(`controllare l'api ${PREFIX}/apartment/expenses/modify funzioni`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		expenseID: global.validExpenseIDs[0],
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});


// test: 5.2
test(`controllare parametri mancanti per ${PREFIX}/apartment/expenses/modify`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 5.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/expenses/modify`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		expenseID: global.validExpenseIDs[0],
		product: 1234,
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 5.4
test(`controllare che l'api ${PREFIX}/apartment/expenses/modify richieda il token di autenticazione`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).send({
		expenseID: global.validExpenseIDs[0],
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	}).then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 5.5
test(`controllare che l'api ${PREFIX}/apartment/expenses/modify richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		expenseID: global.validExpenseIDs[0],
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: 123
	}).then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 5.8
test(`controllare che l'api ${PREFIX}/apartment/expenses/modify restituisca un errore se il parametro price è minore o uguale a 0`, async () => {
	return request(app).patch(PREFIX + '/apartment/expenses/modify').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		expenseID: global.validExpenseIDs[0],
		product: "pizza",
		date: "2022-12-12T08:50:12+02:00",
		price: -10
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid price."});
	});
});


//#endregion

//#region /apartment/expenses/delete [PATCH]
// test: 6
test(`controllare l'api ${PREFIX}/apartment/expenses/delete risponda`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).set('x-access-token', global.validOwners[0].token)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 6.1
test(`controllare l'api ${PREFIX}/apartment/expenses/delete funzioni`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		expenseID: global.validExpenseIDs[1],
	}).then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 6.2
test(`controllare parametri mancanti per ${PREFIX}/apartment/expenses/delete`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 6.3
test(`controllare tipo di parametri per l'api ${PREFIX}/apartment/expenses/delete`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).set('x-access-token', global.validOwners[0].token).send({
		expenseID: "abc",
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 6.4
test(`controllare che l'api ${PREFIX}/apartment/expenses/delete richieda il token di autenticazione`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).send({
		expenseID: global.validExpenseIDs[2],
	}).then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 6.5
test(`controllare che l'api ${PREFIX}/apartment/expenses/delete richieda il all'utente di avere i permessi necessari per compiere l'azione`, async () => {
	return request(app).delete(PREFIX + '/apartment/expenses/delete').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		expenseID: global.validExpenseIDs[3],
	}).then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});
//#endregion
