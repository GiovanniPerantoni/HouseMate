const express = require('express')
const db = require('./database.js')
var sha256 = require('js-sha256').sha256;
const jwt = require("jsonwebtoken");
require("dotenv").config()

const app = express()


//---------------------API SECTION---------------------\\

const auth = require("./middleware");

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

function checkParams(query, paramsList)
{
    for (let i = 0; i < paramsList.length; i++) {
        console.log(query, paramsList[i]);
        if(!query[paramsList[i]])
            return false;
    }
    return true;
}


app.post(process.env.prefixAPI + "/login", (req, res) => {
    console.log(req.query)      //params sono quelli prima del ? (es: /login/123)

    let q = req.query;
    if(!checkParams(q, ["email", "pass"]))
    {
        res.status(400).send({
            "motivation": "required parameters missing"
        });
        return;
    }
    let token = db.login(q.email, sha256(q.pass));

    let status = token == null ? 409 : 200;
    let body;
    if(status == 409)
    {
        body = {
            "motivation": "user not present"
        }
    }
    else 
    {
        body = {
            "token": token
        }
    }

    res.status(status).send(body);
});


app.post(process.env.prefixAPI + "/singup", (req, res) => {
    console.log(req.query)      //params sono quelli prima del ? (es: /login/123)
    
    //TODO controllare che i parametri passati ci siaono tutti quelli necessari
    let q = req.query;
    if(!checkParams(q, ["email", "pass"]))
    {
        res.status(400).send({
            "motivation": "required parameters missing"
        });
        return;
    }
    let token = db.createAccount(q.nome, q.cognome, q.email, sha256(q.pass));

	//TODO provare mailer con gmail (mandare un token temporaneo di conferma email prima di inserire un nuovo utente)

    let status = token == null ? 409 : 200;
    let body;
    if(status == 409)
    {
        body = {
            "motivation": "email already used"
        }
    }
    else 
    {
        body = {
            "token": token
        }
    }

    res.status(status).send(body);
});

//---------------------WEBSITE SECTION---------------------\\


app.listen(process.env.PORT)
