const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const {login, signup} = require("./backend-api/authentication");
const apartment = require("./backend-api/apartment");
const expenses = require("./backend-api/expenses");

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

//Apartment Users
app.get  (PREFIX + "/apartment/users"      , auth.verifyToken, apartment.users      );

//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(     express.static(__dirname + '/site'));

//-------------------DOCUMENTATION SECTION------------------\\
const swaggerDefinition = {
  openapi: '3.0.0',
  components: {},
  info: {
    title: 'HouseMate',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./backend-api/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT);