const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./database.js');
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

async function updateTotal(user) {
    const agg = await Expense.aggregate().
        match({ userID: { $eq: mongoose.Types.ObjectId(user.userID) } }).
        group({ _id: '$userID', total: { $sum: "$price" }});
    const apartment = await apt.getApartment(user);
    const totals = apartment.totals;
    const total = agg[0].total;
    console.log(totals);
    for (const t in totals) {
        if (totals[t].userID.toString() == user.userID) {
            totals[t].total = total;
        }
    }
    await apt.Apartment.updateOne(
        { users: user.userID },
        { 
            $set: { "totals" : totals }
        }
    );
}

async function createExpense(user, expense) {
    const exp = await Expense.create(expense);
    await apt.Apartment.updateOne(
        { users: user.userID },
        { $push: { expenses: exp._id } }
    );
    await updateTotal(user);
    return exp;
}

async function modifyExpense(user, expense) {
    var exp = await Expense.findOne({ _id: expense._id });
    if ((user.userID == exp.userID) || (await apt.isOwner(user))) {
        await Expense.updateOne(
            { _id: expense._id },
            expense
        );
        await updateTotal({userID: exp.userID});
        return await Expense.findOne({ _id: expense._id });
    }
    return null;
}

async function deleteExpense(user, expense) {
    const exp = Expense.findOne({ _id: expense._id });
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