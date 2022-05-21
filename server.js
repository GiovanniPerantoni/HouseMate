const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const sha256 = require('js-sha256').sha256;
const moment = require('moment');
const cors = require('cors');

const db = require('./database.js');
const auth = require("./auth");
const apt = require("./apartment");
const expenses = require("./expenses");

const PREFIX = process.env.PREFIX;
const PORT = process.env.PORT;

const app = express()
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());

//---------------------API SECTION---------------------\\

// Authentication
app.post(PREFIX + "/login", async (req, res) => {
    try {
        const { email, pass } = req.body;
        if (!(email && pass)) {
            res.status(400).send({ "motivation": "Missing parameters in the request." });
            return;
        }
        if ((typeof email != "string") ||
            (typeof pass != "string")) {
            res.status(400).send({ "motivation": "Invalid parameters in request." });
            return;
        }

        const user = await auth.login(email, sha256(pass));
        if (!user) {
            res.status(401).send({ "motivation": "Invalid credentials." });
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." })
        console.log(err);
    }
});

app.post(PREFIX + "/signup", async (req, res) => {
    try {
        const { first_name, last_name, email, pass } = req.body;
        if (!(email && pass && first_name && last_name)) {
            res.status(400).send({ "motivation": "Missing parameters in the request." });
            return;
        }
        if ((typeof first_name != "string") ||
            (typeof last_name != "string") ||
            (typeof email != "string") ||
            (typeof pass != "string")) {
            res.status(400).send({ "motivation": "Invalid parameters in request." });
            return;
        }
        const user = await auth.createAccount(first_name, last_name, email, sha256(pass));
        if (!user) {
            res.status(400).send({ "motivation": "Email already used." });
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

// Apartment
app.post(PREFIX + "/apartment/users", auth.verifyToken, async (req, res) => {
    try {
        const users = await apt.getUsers(req.user);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
})

app.post(PREFIX + "/apartment/manage/info", auth.verifyToken, async (req, res) => {
    try {
        const info = await apt.getInfo(req.user);
        res.status(200).send(info);
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

app.patch(PREFIX + "/apartment/manage/info", auth.verifyToken, async (req, res) => {
    try {
        const { name, rules, address } = req.body;
        if ((name && (typeof name != "string")) ||
            (rules && (typeof rules != "string")) ||
            (address && (typeof address != "string"))) {
            res.status(400).send({ "motivation": "Invalid parameters in request." });
            return;
        }
        const apartment = {};
        if (name) apartment.name = name;
        if (rules) apartment.rules = rules;
        if (address) apartment.address = address;
        const result = await apt.createOrUpdate(req.user, apartment);
        if (result) {
            res.status(200).json("");
        } else {
            res.status(400).send({ "motivation": "Couldn't add or modify apartment." });
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

// Expenses
app.post(PREFIX + "/apartment/expenses/view", auth.verifyToken, async (req, res) => {
    try {
        var { limit } = req.body;
        if (!limit) {
            limit = 20;
        }
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
});

app.post(PREFIX + "/apartment/expenses/add", auth.verifyToken, async (req, res) => {
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
        if (!exp) {
            res.status(400).send({ "motivation": "Couldn't add expense." });
        } else {
            res.status(200).send(exp);
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

app.patch(PREFIX + "/apartment/expenses/modify", auth.verifyToken, async (req, res) => {
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
        if (!result) {
            res.status(400).send({ "motivation": "Can't access expense." });
        } else {
            res.status(200).json("");
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

app.delete(PREFIX + "/apartment/expenses/delete", auth.verifyToken, async (req, res) => {
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
        if (!result) {
            res.status(400).send({ "motivation": "Can't access expense." });
        } else {
            res.status(200).json("");
        }
    } catch (err) {
        res.status(500).send({ "motivation": "Unexpected error." });
        console.log(err);
    }
});

//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(express.static(__dirname + '/site'));

app.listen(PORT)