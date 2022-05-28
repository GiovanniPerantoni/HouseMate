const apt = require("../backend-db/apartment");
const com = require("./common");

/**
 * @swagger
 * /apartment/users:
 *  get:
 *   summary: Get apartment users
 *   description: 'This method is used to get all the public information related to the users residing in the same apartment as the user.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         type: object
 *         required:
 *         - userID
 *         - first_name
 *         - last_name
 *         - color
 *         properties:
 *          userID:
 *           type: string
 *          first_name:
 *           type: string
 *          last_name:
 *           type: string
 *          color:
 *           type: color
 *       example:
 *        - userID: '6290ec70f...'
 *          first_name: 'John'
 *          last_name: 'Doe'
 *          color: '#ffffff'
 *        - userID: '2df0a1f9a...'
 *          first_name: 'Alice'
 *          last_name: 'Smith'
 *          color: '#a01eff'
 *    '401':
 *     description: 'This response is sent if the provided authentication `token` is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Invalid or expired token.'
 *    '403':
 *     description: 'This response is sent if no authentication `token` is provided.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'A token is required for authentication.'
 *    '500':
 *     description: 'This response is sent if some **unexpected internal error** occurs during execution.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Unexpected error.'
 */
async function users (req, res) {
	try {
		const users = await apt.getUsers(req.user);		//il parametro user viene messo in authentication/verifyToken prima di passare a questa funzione
		res.status(200).json(com.cleanObjectDataArray(users, ["userID", "first_name", "last_name", "color"]));
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

/**
 * @swagger
 * /apartment/manage/info:
 *  get:
 *   summary: Get apartment information
 *   description: 'This method is used to get all the **general information** (name, address and rules) of the apartment where the user resides.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *     content:
 *      application/json:
 *       schema:
 *        required:
 *        - name
 *        - address
 *        - rules
 *        properties:
 *         name:
 *          type: string
 *         address:
 *          type: string
 *         rules:
 *           type: string
 *       example:
 *        name: 'Johns Apartment'
 *        address: 'Via Dante Alighieri 12 Roma 00100'
 *        rules: '- NO overnight guests, NO loud music at night.'
 *    '401':
 *     description: 'This response is sent if the provided authentication `token` is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Invalid or expired token.'
 *    '403':
 *     description: 'This response is sent if no authentication `token` is provided.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'A token is required for authentication.'
 *    '500':
 *     description: 'This response is sent if some **unexpected internal error** occurs during execution.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Unexpected error.'
 */
async function manageView (req, res) {
	try {
		const apartmentInfo = await apt.getInfo(req.user);		//il parametro user viene messo in authentication/verifyToken prima di passare a questa funzione
		res.status(200).send(com.cleanObjectData(apartmentInfo, ["rules", "name", "address"]));
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

/**
 * @swagger
 * /apartment/manage/info:
 *  patch:
 *   summary: Add a new apartment or change apartment information
 *   description: 'This method is used to create or modify the **general information** (name, address and rules) of the apartment where the user is owner.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         name:
 *          type: string
 *         address:
 *          type: string
 *         rules:
 *           type: string
 *       example:
 *        name: 'Johns&Alices Apartment'
 *        address: 'Via Dante Alighieri 12 Roma 00100'
 *        rules: '- NO overnight guests, NO loud music at night, NO pets.'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *    '401':
 *     description: 'This response is sent if the provided authentication `token` is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Invalid or expired token.'
 *    '403':
 *     description: 'This response is sent if no authentication `token` is provided.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'A token is required for authentication.'
 *    '500':
 *     description: 'This response is sent if some **unexpected internal error** occurs during execution.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Unexpected error.'
 */
async function manageInfo (req, res) {
	try {
		const { name, rules, address } = req.body;

		if(!com.checkOptionalParameters(res, [name, rules, address], ["string", "string", "string"]))
			return;

		const apartment = {};
		if (name) apartment.name = name;
		if (rules) apartment.rules = rules;
		if (address) apartment.address = address;
		
		const result = await apt.createOrUpdate(req.user, apartment);
		if (!result)
			res.status(400).send({ "motivation": "Couldn't add or modify apartment." });
		else
			res.status(200).send();
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

module.exports = { users, manageView, manageInfo };
