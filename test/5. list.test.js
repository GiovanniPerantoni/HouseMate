const {app} = require('../app')
const request = require('supertest');
const com = require('./common');

commonOptions = {
	'Accept': 'application/json'
}


//#region /apartment/list/view [GET]
// test: 12
test("controllare l'api /api/v1/apartment/list/view risponda", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 12.1
test("controllare l'api /api/v1/apartment/list/view funzioni", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		limit: 10
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 12.3
test("controllare tipo di parametri per l'api /api/v1/apartment/list/view", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		limit: "10"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 12.4
test("controllare che l'api /api/v1/apartment/list/view richieda il token di autenticazione", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).send({
		limit: 10
	})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 12.5
test("controllare che l'api /api/v1/apartment/list/view richieda il all'utente di avere i permessi necessari per compiere l'azione", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		limit: 10
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 12.7
test("controllare che l'api /api/v1/apartment/list/view restituisca solo i parametri descritti nella documentazione", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		limit: 10
	})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["products"]);
	});
});

// test: 12.8
test("controllare che l'api /api/v1/apartment/list/view restituisca un errore se il parametro limit è minore o uguale a 0", async () => {
	return request(app).get('/api/v1/apartment/list/view').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		limit: -10
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid limit."});
	});
});

//#endregion

//#region /apartment/list/add [POST]
// test: 13
test("controllare l'api /api/v1/apartment/list/add risponda", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 13.1
test("controllare l'api /api/v1/apartment/list/add funzioni", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		product: "mozzarella",
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 13.2
test("controllare parametri mancanti per /api/v1/apartment/list/add", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 13.3
test("controllare tipo di parametri per l'api /api/v1/apartment/list/add", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		product: 123,
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 13.4
test("controllare che l'api /api/v1/apartment/list/add richieda il token di autenticazione", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).send({
		product: "mozzarella",
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 13.5
test("controllare che l'api /api/v1/apartment/list/add richieda il all'utente di avere i permessi necessari per compiere l'azione", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		product: "mozzarella",
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

// test: 13.6
test("controllare che l'api /api/v1/apartment/list/add richieda che l'utente entri in un appartamento", async () => {
	return request(app).post('/api/v1/apartment/list/add').set(commonOptions).set('x-access-token', global.validNewUsers[2].token).send({
		product: "mozzarella",
		date: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Couldn't add list element."});
	});
});

//#endregion

//#region /apartment/list/modify [PATCH]
// test: 14
test("controllare l'api /api/v1/apartment/list/modify risponda", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 14.1
test("controllare l'api /api/v1/apartment/list/modify funzioni", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		productID: global.validProductId[0],
		product: "banana",
		lastBought: "2022-12-12T08:50:12+02:00"
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 14.2
test("controllare parametri mancanti per /api/v1/apartment/list/modify", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		product: "banana",
		lastBought: "2022-12-12T08:50:12+02:00"})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 14.3
test("controllare tipo di parametri per l'api /api/v1/apartment/list/modify", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		productID: "123",
		product: "banana",
		lastBought: "2022-12-12T08:50:12+02:00"})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 14.4
test("controllare che l'api /api/v1/apartment/list/modify richieda il token di autenticazione", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions).send({
		productID: global.validProductId[0],
		product: "banana",
		lastBought: "2022-12-12T08:50:12+02:00"})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 14.5
test("controllare che l'api /api/v1/apartment/list/modify richieda il all'utente di avere i permessi necessari per compiere l'azione", async () => {
	return request(app).patch('/api/v1/apartment/list/modify').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		productID: global.validProductId[0],
		product: "banana",
		lastBought: "2022-12-12T08:50:12+02:00"})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});

//#endregion


//#region /apartment/list/delete [DELETE]
// test: 15
test("controllare l'api /api/v1/apartment/list/delete risponda", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 15.1
test("controllare l'api /api/v1/apartment/list/delete funzioni", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		productID: global.validProductId[1]
	})
	.then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 15.2
test("controllare parametri mancanti per /api/v1/apartment/list/delete", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 15.3
test("controllare tipo di parametri per l'api /api/v1/apartment/list/delete", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions).set('x-access-token', global.validOwners[2].token).send({
		productID: "123"
	})
	.then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 15.4
test("controllare che l'api /api/v1/apartment/list/delete richieda il token di autenticazione", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions).send({
		productID: global.validProductId[2]
	})
	.then((res) => {
		expect(res.status).toBe(403);
		expect(res.body).toStrictEqual({"motivation": "A token is required for authentication."});
	});
});

// test: 15.5
test("controllare che l'api /api/v1/apartment/list/delete richieda il all'utente di avere i permessi necessari per compiere l'azione", async () => {
	return request(app).delete('/api/v1/apartment/list/delete').set(commonOptions).set('x-access-token', com.generateValue("string", 60)).send({
		productID: global.validProductId[2]
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid or expired token."});
	});
});


//#endregion
