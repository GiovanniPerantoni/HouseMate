const express = require('express')
const db = require('./database.js')
var sha256 = require('js-sha256').sha256;

const pre = "/api/v1"
const PORT = 3000;

const app = express()


//---------------------API SECTION---------------------\\
app.post(pre + "/login", (req, res) => {
    console.log(req.query)      //params sono quelli prima del ? (es: /login/123)

    //TODO controllare che i parametri passati ci siaono tutti quelli necessari
    let q = req.query;
    let token = db.login(q.email, sha256(q.pass));

    let status = token == null ? 400 : 200;
    let body;
    if(status == 400)
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


app.post(pre + "/singup", (req, res) => {
    console.log(req.query)      //params sono quelli prima del ? (es: /login/123)
    
    //TODO controllare che i parametri passati ci siaono tutti quelli necessari
    
    let q = req.query;
    let token = db.createAccount(q.nome, q.cognome, q.email, sha256(q.pass));

	//TODO provare mailer con gmail (mandare un token temporaneo di conferma email prima di inserire un nuovo utente)

    let status = token == null ? 400 : 200;
    let body;
    if(status == 400)
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


app.listen(PORT)
