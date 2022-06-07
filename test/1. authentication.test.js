const {app} = require('../app')
const request = require('supertest');
const com = require('./common');

let {validToken} = require('./common');

commonOptions = {
	'Accept': 'application/json'
}

//#region /signup [POST]
// test: 2
test("controllare l'api /api/v1/signup risponda", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 2.1
test("controllare l'api /api/v1/signup funzioni", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions).send({
		first_name: "test",
		last_name: "test",
		email: com.generateValue("email"),
		pass: "admin"
	}).then((res) => {
		expect(res.status).toBe(200);
	});
});


// test: 2.2
test("controllare parametri mancanti per /api/v1/signup", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions).send({
		first_name: "test",
		email: "test@test.com",
		pass: "admin"
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 2.3
test("controllare tipo di parametri per l'api /api/v1/signup", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions).send({
		first_name: "test",
		last_name: "test",
		email: "testtest.com",
		pass: "admin"
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});


// test: 2.7
test("controllare che l'api /api/v1/signup restituisca solo i parametri descritti nella documentazione", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions).send({
		first_name: "test",
		last_name: "test",
		email: com.generateValue("email"),
		pass: "admin"
	}).then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["token"]);
	});
});


// test: 2.9
test("controllare che l'api /api/v1/signup restituisca un errore se richiedo un nuovo account con un email già usata", async () => {
	return request(app).post('/api/v1/signup').set(commonOptions).send({
		first_name: "test",
		last_name: "test",
		email: global.email,
		pass: "admin"
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Email already used."});
	});
});

//#endregion



//#region /login [POST]
// test: 1
test("controllare l'api /api/v1/login risponda", async () => {
	return request(app).post('/api/v1/login').set(commonOptions)
	.then((res) => {
		expect(res.status).toBeLessThan(500);
	});
});

// test: 1.1
test("controllare l'api /api/v1/login funzioni", async () => {
	return request(app).post('/api/v1/login').set(commonOptions).send({
		email: global.email,
		pass: global.pass
	}).then((res) => {
		expect(res.status).toBe(200);
	});
});

// test: 1.2
test("controllare parametri mancanti per /api/v1/login", async () => {
	return request(app).post('/api/v1/login').set(commonOptions).send({
		email: global.email,
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Missing parameters in the request."});
	});
});

// test: 1.3
test("controllare tipo di parametri per l'api /api/v1/login", async () => {
	return request(app).post('/api/v1/login').set(commonOptions).send({
		email: global.email,
		pass: 1234
	}).then((res) => {
		expect(res.status).toBe(400);
		expect(res.body).toStrictEqual({"motivation": "Invalid parameters in request."});
	});
});

// test: 1.7
test("controllare che l'api /api/v1/login restituisca solo i parametri descritti nella documentazione", async () => {
	return request(app).post('/api/v1/login').set(commonOptions).send({
		email: global.email,
		pass: global.pass
	})
	.then((res) => {
		expect(res.status).toBe(200);
		com.expectArguments(res, ["token"]);
	});
});

// test: 1.9
test("controllare che l'api /api/v1/login restituisca un errore se l'utente prova ad utilizzare credenziali sbagliate", async () => {
	return request(app).post('/api/v1/login').set(commonOptions).send({
		email: global.email,
		pass: "1234"
	})
	.then((res) => {
		expect(res.status).toBe(401);
		expect(res.body).toStrictEqual({"motivation": "Invalid credentials."});
	});
});

//#endregion
