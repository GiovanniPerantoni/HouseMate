const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const {login, signup} = require("./backend-api/authentication");
const apartment = require("./backend-api/apartment");
const expenses = require("./backend-api/expenses");

const auth = require("./backend-db/authentication");


const PREFIX = process.env.PREFIX;
const PORT = process.env.PORT;

const app = express()
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());

//---------------------API SECTION---------------------\\

// Authentication
app.post(PREFIX + "/login" , login );
app.post(PREFIX + "/signup", signup);

// Apartment
app.post (PREFIX + "/apartment/users"      , auth.verifyToken, apartment.users          );
app.post (PREFIX + "/apartment/manage/info", auth.verifyToken, apartment.manageInfoPOST );
app.patch(PREFIX + "/apartment/manage/info", auth.verifyToken, apartment.manageInfoPATCH);

// Expenses
app.post  (PREFIX + "/apartment/expenses/view"  , auth.verifyToken, expenses.view   );
app.post  (PREFIX + "/apartment/expenses/add"   , auth.verifyToken, expenses.add    );
app.patch (PREFIX + "/apartment/expenses/modify", auth.verifyToken, expenses.modify );
app.delete(PREFIX + "/apartment/expenses/delete", auth.verifyToken, expenses._delete);

//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(express.static(__dirname + '/site'));

app.listen(PORT)