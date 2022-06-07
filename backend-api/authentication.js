const sha256 = require('js-sha256').sha256;

const auth = require("../backend-db/authentication");
const com = require("./common");

const apt = require('../backend-db/apartment');

/**
 * @swagger
 * /login:
 *  post:
 *   summary: Login
 *   description: 'This method is used to generate a new authentication `token` by giving the correct **user credentials**.'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *       - email
 *       - pass
 *       properties:
 *        email:
 *         type: string
 *         description: user's email (can be used only for 1 account)
 *        pass:
 *         type: string
 *         description: user's password (clear text)
 *       example:
 *        email: 'user@example.com'
 *        pass: 'password'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - token
 *        - userID
 *        properties:
 *         token:
 *          type: string
 *       example:
 *        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *    '400':
 *     description: 'This response is sent when the body parameters are of the **wrong type** or if any body parameter is **missing**.'
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
 *        motivation: 'Invalid parameters in request.'
 *    '401':
 *     description: 'This response is sent in case of **invalid credentials**.'
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
 *        motivation: 'Invalid credentials.'
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
async function login(req, res) {
	try {
		const { email, pass } = req.body;

		if (!com.checkObligatoryParameters(res, [email, pass], ["string", "string"]))
			return;

		const user = await auth.login(email, sha256(pass));
		if (user == null)
			res.status(401).send({ "motivation": "Invalid credentials." });
		else
			res.status(200).json(com.cleanObjectData(user, ["token", "userID"]));

	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." })
		console.log(err);
	}
}

/**
 * @swagger
 * /signup:
 *  post:
 *   summary: Sign Up
 *   description: 'This method is used to create a new account by giving the required information and, if successful, retrieve a new authentication `token`.'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *       - email
 *       - first_name
 *       - last_name
 *       - pass
 *       properties:
 *        email:
 *         type: string
 *         description: user's email (can be used only for 1 account)
 *        first_name:
 *         type: string
 *         description: user's fist name(s).
 *        last_name:
 *         type: string
 *         description: user's last name(s).
 *        pass:
 *         type: string
 *         description: user's password (clear text)
 *       example:
 *        email: 'user@example.com'
 *        first_name: 'John'
 *        last_name: 'Doe'
 *        pass: 'password'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - token
 *        properties:
 *         token:
 *          type: string
 *       example:
 *        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *    '400':
 *     description: 'This response is sent if the email is already used or when the body parameters are of the **wrong type** or if any body parameter is **missing**.'
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
 *        motivation: 'Invalid parameters in request.'
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
async function signup(req, res) {
	try {
		const { first_name, last_name, email, pass } = req.body;

		if (!com.checkObligatoryParameters(res, [first_name, last_name, email, pass], ["string", "string", "email", "string"]))
			return;

		const user = await auth.createAccount(first_name, last_name, email, sha256(pass));
		if (user == null)
			res.status(400).send({ "motivation": "Email already used." });
		else
		{
			res.status(200).json(com.cleanObjectData(user, ["token", "userID"]));
		}

	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}


module.exports = { login, signup };