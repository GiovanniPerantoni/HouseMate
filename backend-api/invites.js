const com = require("./common");
const apt = require("../backend-db/apartment")
const auth = require("../backend-db/authentication");
const invites = require("../backend-db/invites");

/**
 * @swagger
 * /apartment/invites/new:
 *  patch:
 *   summary: Create new invite
 *   description: 'This method is used to create the **invitation token** required to join an apartment.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        required:
 *        - users
 *        properties:
 *         users:
 *          type: array
 *          items:
 *           type: string
 *       example:
 *        users:
 *         - test@email.com
 *         - test2@email.com
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - invite
 *         properties:
 *          invite:
 *           type: string
 *        example:
 *         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *    '400':
 *      description: 'This response is sent if one of the emails is not present in the database, if the body parameters are of the **wrong type** or if any body parameter is **missing**.'
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - motivation
 *         properties:
 *          motivation:
 *           type: string
 *        example:
 *         motivation: 'Invalid invites list.'
 *    '401':
 *     description: 'This response is sent if the provided authentication `token` is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Invalid or expired token.'
 *    '403':
 *     description: 'This response is sent if no authentication `token` is provided or if the user is not the owner of the apartment.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: User is not the owner of the apartment.
 *    '500':
 *     description: 'This response is sent if some **unexpected internal error** occurs during execution.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Unexpected error.'
 */
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
                com.returnErrorMessage(res, 400, "Invalid invites list.");
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

/**
 * @swagger
 * /apartment/invites/accept:
 *  post:
 *   summary: Accept invitation
 *   description: 'This method is used to **accept an invitation** sent by the apartment owner.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        required:
 *        - invite
 *        properties:
 *         invite:
 *          type: string
 *       example:
 *        invite: '6f51cba29...'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: 'This response is sent if the token is used by an uninvited user, if the user using the token is already in an apartment, if the body parameters are of the **wrong type** or if any body parameter is **missing**.'
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         required:
 *         - motivation
 *         properties:
 *          motivation:
 *           type: string
 *        example:
 *         motivation: 'The user is uninvited.'
 *    '401':
 *     description: 'This response is sent if the provided authentication `token` is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Invalid or expired token.'
 *    '403':
 *     description: 'This response is sent if no authentication `token` is provided or if the invite is invalid or expired.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: Invalid or expired invite.
 *    '500':
 *     description: 'This response is sent if some **unexpected internal error** occurs during execution.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        required:
 *        - motivation
 *        properties:
 *         motivation:
 *          type: string
 *       example:
 *        motivation: 'Unexpected error.'
 */
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