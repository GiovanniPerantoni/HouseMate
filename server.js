
const express = require('express');
require('./databaseConnection');	//usata per creare e manterene la connessione al mongodb


const {app} = require("./app")
const PORT = process.env.PORT;


//---------------------WEBSITE SECTION---------------------\\
app.use('/', express.static(__dirname + '/site'));
app.use(     express.static(__dirname + '/site'));

app.listen(PORT)
