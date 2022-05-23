const mongoose = require('mongoose');
const apt = require('./apartment.js');

const expenseSchema = new mongoose.Schema({
	userID: { type: mongoose.Schema.Types.ObjectId },
	product: String,
	date: Date,
	price: Number
});
expenseSchema.virtual('expenseID').get(function(){
	return this._id.toHexString();
});
expenseSchema.set('toJSON', {
	virtuals: true
});
const Expense = mongoose.model("expense", expenseSchema);




//selezioni le expenses dell'appartamento in cui si trova l'utente
async function getExpenses(user, limit) {
	const apartment = await apt.getApartment(user);
	const expenses = await Expense.find({
		_id: { $in : apartment.expenses }
	}).
	select('expenseID userID product price date').
	sort('-date').
	limit(limit)
	return {expenses: expenses, totals: apartment.totals};
}

//aggiorno il totale pagato da ogni utente dell'appartamento ogni volta che c'è una modifica alla lista delle expense
async function updateTotal(user) {

	//seleziono tutte le spese create dall'utente
	const agg = await Expense.aggregate().
		match({ userID: { $eq: mongoose.Types.ObjectId(user.userID) } }).
		group({ _id: '$userID', total: { $sum: "$price" }});
	const apartment = await apt.getApartment(user);
	const totals = apartment.totals;
	const total = agg[0].total;

	//rigenero i valori totali per l'utente
	for (const t in totals) {
		if (totals[t].userID.toString() == user.userID) {
			totals[t].total = total;
		}
	}

	//salvo i valori totali nel db per l'utente
	await apt.Apartment.updateOne(
		{ users: user.userID },
		{ 
			$set: { "totals" : totals }
		}
	);
}

//ritorno se l'utente fa parte o meno di un appartamento (se sono riusco a modificarla o meno)
async function createExpense(user, expense) {
	const apartment = await apt.getApartment(user);
	if (!apartment) return false;			//se l'utente non fa parte di nessun appartamento non cotinuo
	
	const exp = await Expense.create(expense);
	await apt.Apartment.updateOne(
		{ users: user.userID },
		{ $push: { expenses: exp._id } }
	);
	await updateTotal(user);
	return true;
}

//ritorno se sono riscito a modificare l'expense (expense esiste, ho i permessi per modificarla)
async function modifyExpense(user, expense) {
	const exp = await Expense.findOne({ _id: expense._id });
	if (!exp) return false;

	if ((user.userID == exp.userID) || (await apt.isOwner(user))) {
		await Expense.updateOne(
			{ _id: expense._id },
			expense
		);
		await updateTotal({userID: exp.userID});
		return await Expense.findOne({ _id: expense._id });
	}
	return false;
}

//ritorno se sono riscito a modificare l'expense (expense esiste, ho i permessi per modificarla)
async function deleteExpense(user, expense) {
	const exp = await Expense.findOne({ _id: expense._id });
	if (!exp) return false;
	
	if ((user.userID == exp.userID) || (await apt.isOwner(user))) {
		await Expense.deleteOne({ _id: expense._id });
		await apt.Apartment.updateOne(
			{ users: user.userID},
			{ $pull: { expenses: exp._id } }
		)
		await updateTotal({userID: exp.userID});
		return true;
	}
	return false;
}

module.exports = {Expense, getExpenses, createExpense, modifyExpense, deleteExpense};
