const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const sha256 = require('js-sha256').sha256;

const auth = require("./auth");
const apt = require("./apartment");
const expenses = require("./expenses");

const PREFIX = process.env.PREFIX;
const PORT = process.env.PORT;

const app = express()
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

//---------------------API SECTION---------------------\\

// Authentication
app.post(PREFIX + "/login", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!(email && pass)) {
      res.status(400).send({"motivation":"Missing parameters in the request."});
      return;
    }

    const user = await auth.login(email, sha256(pass));
    if (!user) {
        res.status(400).send({"motivation":"Invalid credentials."});
    } else {
        res.status(200).json(user);
    }

});

app.post(PREFIX + "/signup", async (req, res) => {

    const { first_name, last_name, email, pass } = req.body;
    if (!(email && pass && first_name && last_name)) {
        res.status(400).send({"motivation":"Missing parameters in the request."});
        return;
    }

    const user = await auth.createAccount(first_name, last_name, email, sha256(pass));
    if (!user) {
        res.status(400).send({"motivation":"Email already used."});
    } else {
        res.status(200).json(user);
    }
});

// Apartment
app.post(PREFIX + "/apartment/users", auth.verifyToken, async (req, res) => {
    await apt.Apartment.updateOne({ name: "test" }, 
    {
        $push: { totals: { user_id: req.user.user_id, total: 0 } }
    });
    const users = await apt.getUsers(req.user);
    res.status(200).json(users);
})

// Expenses
app.post(PREFIX + "/apartment/expenses/view", auth.verifyToken, async (req, res) => {
    var { limit } = req.body;
    if (!limit) {
        limit = 50;
    }
    const exps = await expenses.getExpenses(req.user, limit);
    res.status(200).json(exps);
});

app.post(PREFIX + "/apartment/expenses/create", auth.verifyToken, async (req, res) => {
    
    const { product, date, price } = req.body;
    if (!(product && date && price)) {
      res.status(400).send({"motivation":"Missing parameters in request."});
      return;
    }
    if (price <= 0) {
        res.status(400).send({"motivation":"Invalid price."});
        return;
    }
    const exp = await expenses.createExpense(req.user, 
        {
            user_id: req.user.user_id,
            product: product,
            date: date,
            price: price
        }
    );
    if (!exp) {
        res.status(400).send({"motivation":"Couldn't add expense."});
    } else {
        res.status(200).json(exp);
    }

});

app.post(PREFIX + "/apartment/expenses/modify", auth.verifyToken, async (req, res) => {
    
    const { _id, product, date, price } = req.body;
    if (!(_id && product && date && price)) {
      res.status(400).send({"motivation":"Missing parameters in the request."});
      return;
    }
    if (price <= 0) {
        res.status(400).send({"motivation":"Invalid price."});
        return;
    }
    const exp = await expenses.modifyExpense(req.user, 
        {
            _id: _id,
            product: product,
            date: date,
            price: price
        }
    );
    if (!exp) {
        res.status(400).send({"motivation":"Couldn't modify expense."});
    } else {
        res.status(200).json(exp);
    }

});

app.post(PREFIX + "/apartment/expenses/delete", auth.verifyToken, async (req, res) => {

    const { _id } = req.body;
    if (!_id) {
        res.status(400).send({"motivation":"Missing parameters in the request."});
        return;
    }
    const result = await expenses.deleteExpense(user, { _id: _id });
    if (!result) {
        res.status(400).send({"motivation":"Couldn't modify expense."});
    } else {
        res.status(200).json({"message":"Ok."});
    }

});

//---------------------WEBSITE SECTION---------------------\\
app.listen(PORT)