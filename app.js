if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const bodyparser = require('body-parser');

const {login, signup} = require("./backend-api/authentication");
const apartment = require("./backend-api/apartment");
const expenses = require("./backend-api/expenses");
const invites = require("./backend-api/invites");
const list = require("./backend-api/list");

const auth = require("./backend-db/authentication");


const PREFIX = process.env.PREFIX;

const app = express()
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

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

//Apartment Users
app.get  (PREFIX + "/apartment/users"      , auth.verifyToken, apartment.users      );


// Invites
app.patch(PREFIX + "/apartment/invites/new"   , auth.verifyToken, invites._new     );
app.post (PREFIX + "/apartment/invites/accept", auth.verifyToken, invites.accept   );

// Shopping List
app.get   (PREFIX + "/apartment/list/view"  , auth.verifyToken, list.view   );
app.post  (PREFIX + "/apartment/list/add"   , auth.verifyToken, list.add    );
app.patch (PREFIX + "/apartment/list/modify", auth.verifyToken, list.modify );
app.delete(PREFIX + "/apartment/list/delete", auth.verifyToken, list._delete);


module.exports = {app}
