const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./database.js');
const apt = require('./apartment.js');

const expenseSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId },
    product: String,
    date: Date,
    price: Number
});
const Expense = mongoose.model("expense", expenseSchema);

async function getExpenses(user, limit) {
    const apartment = await apt.getApartment(user);
    const expenses = await Expense.find({
        _id: { $in : apartment.expenses }
    }).
    sort('-date').
    limit(limit);
    return {expenses: expenses, totals: apartment.totals};
}

async function updateTotal(user) {
    const agg = await Expense.aggregate().
        match({ user_id: { $eq: mongoose.Types.ObjectId(user.user_id) } }).
        group({ _id: '$user_id', total: { $sum: "$price" }});
    const total = agg[0].total;
    const apartment = await apt.Apartment.findOne({
        users: user.user_id
    });
    for (const index in apartment.totals) {
        if (apartment.totals[index].user_id == user.user_id) {
            apartment.totals[index].total = total;
        } 
    }
    await apartment.save();
}

async function createExpense(user, expense) {
    const exp = await Expense.create(expense);
    await apt.Apartment.updateOne(
        { users: user.user_id },
        { $push: { expenses: exp._id } }
    );
    await updateTotal(user);
    return exp;
}

async function modifyExpense(user, expense) {
    const exp = await Expense.findOne({ _id: expense._id });
    if ((user.user_id == exp.user_id) || apt.isOwner(user)) {
        await Expense.updateOne(
            { _id: expense._id },
            expense
        );
        await updateTotal(user);
        return await Expense.findOne({ _id: expense._id });
    }
    return null;
}

async function deleteExpense(user, expense) {
    const exp = Expense.findOne({ _id: expense._id });
    if ((user.user_id == exp.user_id) || apt.isOwner(user)) {
        await Expense.deleteOne({ _id: expense._id });
        await updateTotal(user);
        return true;
    }
    return false;
}

module.exports = {Expense, getExpenses, createExpense, modifyExpense, deleteExpense};