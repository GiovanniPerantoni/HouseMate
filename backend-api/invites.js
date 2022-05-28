const jwt = require("jsonwebtoken");
const com = require("./common");
const apt = require("../backend-db/apartment")
const auth = require("../backend-db/authentication");
const invites = require("../backend-db/invites");

/*
- PATCH /apartment/invite/new 
  req: { "users": ["id1", "id2", ...] }
  res: { "invite": "2ef34..." }
- POST /apartment/invite/accept
  req: { "invite" : "2ef34..." }
  res: "" 
*/

/*
apt.isOwner(user)
auth.exists(user)
invites._new(owner, users)
*/

async function _new(req, res) {
    try {
        let owner = req.user;
        let { users } = req.body;

        if (!apt.isOwner(owner)) {
            com.returnErrorMessage(res, 403, "User is not an administrator");
            return;
        }
        // com.checkObligatoryParameters ??
        for (let i=0; i<users.lenght; i++) {
            if (!auth.exists(users[i])) {
                com.returnErrorMessage(res, 400, "User does not exist");
                return;
            }
        }
        
        let token = invites._new(owner, users);

        let toRet = {
            "invite": token
        };
        res.status(200).json(toRet);

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

/*
invites.getUsers(invite)
invites.accept(invite)
*/

async function accept(req, res) {
    try {
        let { invite } = req.body;
        let users = invites.getUsers(invite);
        let user = req.user;

        if (!com.checkObligatoryParameters(res, [invite], ["string"])) {
            return;
        }

        for (let i=0; i<users.lenght; i++) {
            if (user == users[i]) {
                invites.accept(invite, user);
                res.status(200).send();
                return;
            }
        }
        com.returnErrorMessage(res, 400, "Uninvited user");

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

module.exports = {_new, accept};