const dotenv = require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const {login, signup} = require("./backend-api/authentication");
const apartment = require("./backend-api/apartment");
const expenses = require("./backend-api/expenses");
const invites = require("./backend-api/invites");
const list = require("./backend-api/list");

require('./databaseConnection');	//usata per creare e manterene la connessione al mongodb

const {app} = require("./app")
const PORT = process.env.PORT;

// Shopping List
app.get   (PREFIX + "/apartment/list/view"  , auth.verifyToken, list.view   );
app.post  (PREFIX + "/apartment/list/add"   , auth.verifyToken, list.add    );
app.patch (PREFIX + "/apartment/list/modify", auth.verifyToken, list.modify );
app.delete(PREFIX + "/apartment/list/delete", auth.verifyToken, list._delete);

//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(     express.static(__dirname + '/site'));

//-------------------DOCUMENTATION SECTION------------------\\
const swaggerDefinition = {
  openapi: '3.0.0',
  components: {},
  info: {
    title: 'HouseMate',
    description: 'This API allows users residing in the same apartment to share expenses and see their contributions.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000' + PREFIX,
      description: 'Development server',
    }
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./backend-api/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT);