const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const sha256 = require('js-sha256').sha256;
const db = require('./database.js');

const PREFIX = process.env.PREFIX;
const PORT = process.env.PORT;

const app = express()
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

//---------------------API SECTION---------------------\\
const auth = require("./middleware");
// TODO: check
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.post(PREFIX + "/login", async (req, res) => {
    
    const { email, pass } = req.body;
    if (!(email && pass)) {
      res.status(400).send({"motivation":"Missing parameters in request."});
      return;
    }

    const user = await db.login(email, sha256(pass));
    if (!user) {
        res.status(400).send({"motivation":"Invalid credentials."});
    } else {
        res.status(200).json(user)
    }

});


app.post(PREFIX + "/signup", async (req, res) => {

    const { first_name, last_name, email, pass } = req.body;
    if (!(email && pass && first_name && last_name)) {
        res.status(400).send({"motivation":"Missing parameters in request."});
        return;
    }

    const user = await db.createAccount(first_name, last_name, email, sha256(pass));
    if (!user) {
        res.status(400).send({"motivation":"Email already used."});
    } else {
        res.status(200).json(user)
    }
});

//---------------------WEBSITE SECTION---------------------\\
app.listen(PORT)