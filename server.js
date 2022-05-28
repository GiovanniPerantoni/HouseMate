const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const {login, signup} = require("./backend-api/authentication");
const apartment = require("./backend-api/apartment");
const expenses = require("./backend-api/expenses");
const invites = require("./backend-api/invites");

const auth = require("./backend-db/authentication");
require('./databaseConnection');	//usata per creare e manterene la connessione al mongodb


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

// Expenses
app.get   (PREFIX + "/apartment/expenses/view"  , auth.verifyToken, expenses.view   );
app.post  (PREFIX + "/apartment/expenses/add"   , auth.verifyToken, expenses.add    );
app.patch (PREFIX + "/apartment/expenses/modify", auth.verifyToken, expenses.modify );
app.delete(PREFIX + "/apartment/expenses/delete", auth.verifyToken, expenses._delete);

// Apartment Manage
app.get  (PREFIX + "/apartment/manage/info", auth.verifyToken, apartment.manageView );
app.patch(PREFIX + "/apartment/manage/info", auth.verifyToken, apartment.manageInfo );

// Apartment Users
app.get  (PREFIX + "/apartment/users"      , auth.verifyToken, apartment.users      );

// Invites
app.patch(PREFIX + "/apartment/invites/new"   , auth.verifyToken, invites._new     );
app.post (PREFIX + "/apartment/invites/accept", auth.verifyToken, invites.accept   );

//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(     express.static(__dirname + '/site'));

app.listen(PORT)