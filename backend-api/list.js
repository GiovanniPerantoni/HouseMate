const list = require("../backend-db/list");
const com = require("./common");

// /apartment/list/add

/**
 * @swagger
 * /apartment/list/add:
 *  post:
 *   summary: Add a new expense
 *   description: 'This method is used to add **shared expenses**'
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
 *        - date
 *        - price
 *        - product
 *        properties:
 *         date:
 *          type: date
 *         price:
 *          type: number
 *         product:
 *           type: string
 *       example:
 *        date: '2022-01-01T12:00'
 *        price: 10
 *        product: 'Hamburger'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the price is negative, if the user doesn't reside in an apartment or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
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
 *         motivation: 'Invalid price.'
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
 *     description: 'This response is sent if no authentication `token` is provided.'
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
 *        motivation: 'A token is required for authentication.'
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
async function add(req, res) {
    try {
        const { product, date } = req.body;

        if(!com.checkObligatoryParameters(res, [product, date], ["string", "date"])) {
            return;
        }
        
        const exp = await list.createProduct(req.user,
            {
                userID: req.user.userID,
                product: product,
                date: date
            }
        );

        if (!exp) {
            com.returnErrorMessage(res, 400, "Couldn't add expense.");
        } else {
            res.status(200).send();
        }

    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

// /apartment/list/modify
async function modify(req, res) {
    try {
        const { itemID, product, buyer, lastBought } = req.body;
        // tipo itemID
        if(!com.checkObligatoryParameters(res, [itemID], ["mongooseObjectID"])) {
            return;
        }
        if(!com.checkOptionalParameters(res, [product, buyer, lastBought], ["string", "string", "date"])) {
            return;
        }
        // controllo last bougth

        const listElem = { _id: itemID };
        if (product) { listElem.product = product; }
        if (buyer) { listElem.buyer = buyer; }
        if (lastBought) { listElem.lastBought = lastBought; }

        const result = await list.modifyProduct(req.user, listElem);
        if (!result) {
            com.returnErrorMessage(res, 400, "Can't access list element");
        } else {
            res.status.send();
        }
    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

module.exports = {add, modify}