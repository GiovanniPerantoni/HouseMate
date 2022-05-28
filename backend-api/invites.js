const com = require("./common");
const apt = require("../backend-db/apartment")
const auth = require("../backend-db/authentication");
const invites = require("../backend-db/invites");

async function _new(req, res) {
    try {
        let owner = req.user;
        let { users } = req.body;

        if (!apt.isOwner(owner)) {
            com.returnErrorMessage(res, 403, "User isn't the owner of the apartment.");
            return;
        }

        if (!com.checkObligatoryParameters(res, [users], ["array-string"])) {
            return;
        }

        for (let i = 0; i < users.lenght; i++) {
            if (!auth.exists(users[i])) {
                com.returnErrorMessage(res, 400, "Invalid invited list.");
                return;
            }
        }
        
        let token = await invites._new(owner, users);

        res.status(200).json({ "invite" : token });

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

async function accept(req, res) {
    try {
        let { invite } = req.body;
        let users = invites.getUsers(invite);
        let user = req.user;

        if (!com.checkObligatoryParameters(res, [invite], ["string"])) {
            return;
        }

        if (await apt.getApartment(user)) {
            com.returnErrorMessage(res, 400, "The user is already assigned to an apartment.");
            return;
        }

        for (let i = 0; i < users.length; i++) {
            if (users[i] == user.userID) {
                if (await invites.accept(invite, user)) {
                    res.status(200).send();
                    return;
                } else {
                    com.returnErrorMessage(res, 403, "Invalid or expired invite.");
                    return;
                }
            }
        }
        com.returnErrorMessage(res, 400, "The user is uninvited.");

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error.");
        console.log(err);
    }
}

module.exports = {_new, accept};