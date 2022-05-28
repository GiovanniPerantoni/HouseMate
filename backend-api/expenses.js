const expenses = require("../backend-db/expenses");
const com = require("./common");

/**
 * @swagger
 * /apartment/expenses/view:
 *  get:
 *   summary: Get shared expenses
 *   description: 'This method is used to get the **shared expenses** of the users residing in the same apartment and the **total amount** of money spent by each.'
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
 *        type: object
 *        properties:
 *         totals:
 *          type: array
 *          items:
 *           type: object
 *           properties:
 *            userID:
 *             type: string
 *            total:
 *             type: number
 *         expenses:
 *          type: array
 *          items:
 *           type: object
 *           properties:
 *            userID:
 *             type: string
 *            expenseID:
 *             type: string
 *            date:
 *             type: date
 *            price:
 *             type: number
 *            product:
 *             type: string
 *       example:
 *        totals:
 *         - userID: '6290ec70f...'
 *           total: 25
 *         - userID: '2df0a1f9a...'
 *           total: 50.5
 *        expenses:
 *         - userID: '6290ec70f...'
 *           expenseID: '13a0fd10a...'
 *           price: 25
 *           product: 'Small chair'
 *         - userID: '2df0a1f9a...'
 *           expenseID: '4e5dcba29...'
 *           price: 45
 *           product: 'Weekly groceries'
 *         - userID: '2df0a1f9a...'
 *           expenseID: '9fe1731ad...'
 *           price: 5.5
 *           product: 'Beverages'
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
async function view (req, res) {
	try {
		var { limit } = req.body;
		if (!limit)
			limit = 20;
		
		if(!com.checkOptionalParameters(res, [limit], ["int"]))
			return;
		if (limit < 1) {
			res.status(400).send({ "motivation": "Invalid limit." });
			return;
		}

		const exps = await expenses.getExpenses(req.user, limit);

		let toRet = {
			"totals": [],
			"expenses": []
		};
		for (let i = 0; i < exps.expenses.length; i++)
			toRet.expenses.push(com.cleanObjectData(exps.expenses[i], ["expenseID", "date", "userID", "price", "product"]));
		for (let i = 0; i < exps.totals.length; i++)
			toRet.totals.push(com.cleanObjectData(exps.totals[i], ["userID", "total"]));

		res.status(200).json(toRet);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

/**
 * @swagger
 * /apartment/expenses/add:
 *  post:
 *   summary: Add a new expense
 *   description: 'This method is used to add **shared expenses**'
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
 *        required:
 *        - date
 *        - price
 *        - product
 *        properties:
 *         date:
 *          type: date
 *         price:
 *          type: number
 *         product:
 *           type: string
 *       example:
 *        date: '2022-01-01T12:00'
 *        price: 10
 *        product: 'Hamburger'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the price is negative, if the user doesn't reside in an apartment or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - motivation
 *         properties:
 *          motivation:
 *           type: string
 *        example:
 *         motivation: 'Invalid price.'
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
async function add (req, res) {
	try {
		const { product, date, price } = req.body;

		if(!com.checkObligatoryParameters(res, [product, date, price], ["string", "date", "float"]))
			return;
		if (price <= 0) {
			res.status(400).send({ "motivation": "Invalid price." });
			return;
		}

		const exp = await expenses.createExpense(req.user,
			{
				userID: req.user.userID,
				product: product,
				date: date,
				price: price
			}
		);

		if (!exp)
			res.status(400).send({ "motivation": "Couldn't add expense." });
		else
			res.status(200).send();
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}


/**
 * @swagger
 * /apartment/expenses/modify:
 *  patch:
 *   summary: Modify an expense
 *   description: >-
 *    This method is used to change one of the **shared expenses** which either has to belong to the current user if the user isn't the owner or doesn't have to, if the user is the owner.
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
 *        required:
 *        - expenseID
 *        properties:
 *         expenseID:
 *          type: string
 *         date:
 *          type: date
 *         price:
 *          type: number
 *         product:
 *           type: string
 *       example:
 *        expenseID: '4e5dcba29...'
 *        date: '2022-01-02T13:45'
 *        price: 5
 *        product: 'Table spoons'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the price is negative, if the expense either doesn't exist or isn't modifiable by the user, or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - motivation
 *         properties:
 *          motivation:
 *           type: string
 *        example:
 *         motivation: >-
 *          Can't access expense.
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
async function modify (req, res) {
	try {
		const { expenseID, product, date, price } = req.body;
		if(!com.checkObligatoryParameters(res, [expenseID], ["mongooseObjectID"]))
			return;
		if(!com.checkOptionalParameters(res, [product, date, price], ["string", "date", "float"]))
			return;
		if (price <= 0) {
			res.status(400).send({ "motivation": "Invalid price." });
			return;
		}

		//genero un oggetto con solo i parametri passati
		const expense = { _id: expenseID };
		if (product) expense.product = product;
		if (date) expense.date = date;
		if (price) expense.price = price;


		const result = await expenses.modifyExpense(req.user, expense)
		if (!result)
			res.status(400).send({ "motivation": "Can't access expense." });
		else
			res.status(200).send();
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

/**
 * @swagger
 * /apartment/expenses/delete:
 *  patch:
 *   summary: Delete an expense
 *   description: >-
 *    This method is used to delete one of the **shared expenses** which either has to belong to the current user if the user isn't the owner or doesn't have to, if the user is the owner.
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
 *        required:
 *        - expenseID
 *        properties:
 *         expenseID:
 *          type: string
 *       example:
 *        expenseID: '4e5dcba29...'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the price is negative, if the expense either doesn't exist or isn't modifiable by the user, or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - motivation
 *         properties:
 *          motivation:
 *           type: string
 *        example:
 *         motivation: >-
 *          Can't access expense.
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
async function _delete (req, res) {
	try {
		const { expenseID } = req.body;
		if(!com.checkObligatoryParameters(res, [expenseID], ["mongooseObjectID"]))
			return;

		const result = await expenses.deleteExpense(req.user, { _id: expenseID });
		if (!result)
			res.status(400).send({ "motivation": "Can't access expense." });
		else
			res.status(200).send();
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

module.exports = { view, add, modify, _delete };
