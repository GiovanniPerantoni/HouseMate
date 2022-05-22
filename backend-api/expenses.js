const expenses = require("./backend-db/expenses");
const mongoose = require('mongoose');

const moment = require('moment');

async function view (req, res) {
	try {
		var { limit } = req.body;
		if (!limit)
			limit = 20;
		
		if (!Number.isInteger(limit)) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}
		if (limit < 1) {
			res.status(400).send({ "motivation": "Invalid limit." });
			return;
		}
		const exps = await expenses.getExpenses(req.user, limit);
		res.status(200).json(exps);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

async function add (req, res) {
	try {
		const { product, date, price } = req.body;
		if (!(product && date && price)) {
			res.status(400).send({ "motivation": "Missing parameters in request." });
			return;
		}
		if ((typeof product != "string") ||
			(!Number.isFinite(price)) ||
			(!moment(date).isValid())) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}
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
			res.status(200).send(exp);
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

async function modify (req, res) {
	try {
		const { expenseID, product, date, price } = req.body;
		if (!expenseID) {
			res.status(400).send({ "motivation": "Missing parameters in the request." });
			return;
		}
		if ((!mongoose.isValidObjectId(expenseID)) ||
			(price && !Number.isFinite(price)) ||
			(product && (typeof product != "string")) ||
			(date && !moment(date).isValid())) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}
		if (price <= 0) {
			res.status(400).send({ "motivation": "Invalid price." });
			return;
		}

		const expense = { _id: expenseID };
		if (product) expense.product = product;
		if (date) expense.date = date;
		if (price) expense.price = price;
		const result = await expenses.modifyExpense(req.user, expense)
		if (!result)
			res.status(400).send({ "motivation": "Can't access expense." });
		else
			res.status(200).json("");
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

async function _delete (req, res) {
	try {
		const { expenseID } = req.body;
		if (!expenseID) {
			res.status(400).send({ "motivation": "Missing parameters in the request." });
			return;
		}
		if (!mongoose.isValidObjectId(expenseID)) {
			res.status(400).send({ "motivation": "Invalid parameters in request." });
			return;
		}

		const result = await expenses.deleteExpense(req.user, { _id: expenseID });
		if (!result)
			res.status(400).send({ "motivation": "Can't access expense." });
		else
			res.status(200).json("");
	} catch (err) {
		res.status(500).send({ "motivation": "Unexpected error." });
		console.log(err);
	}
}

module.exports = { view, add, modify, _delete };