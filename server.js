const dotenv = require('dotenv').config();
const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('./databaseConnection');	//usata per creare e manterene la connessione al mongodb

const {app} = require("./app")
const PORT = process.env.PORT;
const PREFIX = process.env.PREFIX;

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
