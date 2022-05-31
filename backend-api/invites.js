const com = require("./common");
const apt = require("../backend-db/apartment")
const auth = require("../backend-db/authentication");
const invites = require("../backend-db/invites");

// /apartment/invites/new
async function _new(req, res) {
    try {
        let owner = req.user;
        let { users } = req.body;

        if (!com.checkObligatoryParameters(res, [users], ["array-email"])) {
            return;
        }

        if (!await apt.isOwner(owner)) {
            com.returnErrorMessage(res, 403, "User isn't the owner of the apartment.");
            return;
        }

        var usersIDs = [];
        for (let i = 0; i < users.length; i++) {
            let user = await auth.getUserByEmail(users[i]);
            if (!user) {
                com.returnErrorMessage(res, 400, "Invalid invited list.");
                return;
            }
            usersIDs[i] = user.userID;
        }
        
        let token = await invites._new(owner, usersIDs);

        res.status(200).json({ "invite" : token });

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

// /apartment/invites/accept
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