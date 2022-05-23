const expenses = require("../backend-db/expenses");
const com = require("./common");

//  /apartment/expenses/view
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

//  /apartment/expenses/add
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

//  /apartment/expenses/modify
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

//  /apartment/expenses/delete
//I've used an underline because delete is a reserved word
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