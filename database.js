//!! file scaffolding usato per testare le funzionalità delle api !!!

var utenti = [
    { 
        "nome" : "admin",
        "cognome" : "admin",
        "email": "na@na.com",
        "pass": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
        "token": ""
    },  //admin
    { 
        "nome": "enrico",
        "cognome": "enrico",
        "email": "na2@na.com",
        "pass": "d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1",
        "token": ""
    }   //pass
]

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const tokenLen = 20;
function generateToken() {
    let result  = "";
    for (let i = 0; i < tokenLen; i++ )
       result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}


function login(email, sha) {
    for (let i = 0; i < utenti.length; i++) {
        const user = utenti[i];
        
        if(user.email == email && user.pass == sha)
        {
            let token = generateToken()
            user.token = token;
            return token;
        }
    }

    return null;
}

function emailExists(email) {
    for (let i = 0; i < utenti.length; i++) {
        const user = utenti[i];
        
        if(user.email == email)
            return true;
    }

    return false;
}


function createAccount(nome, cognome, email, sha) {

    if(emailExists(email))
        return null;

    let token = generateToken();
    utenti.push({ 
        "nome": nome,
        "cognome": cognome,
        "email": email,
        "pass": sha,
        "token": token
    });

    return token;
}

module.exports = {login, createAccount}