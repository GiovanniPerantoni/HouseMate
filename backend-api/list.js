const list = require("../backend-db/list");
const com = require("./common");

/**
 * @swagger
 * /apartment/list/add:
 *  post:
 *   summary: Add a new element to the shopping list
 *   description: 'This method is used to add a **new element** to the shopping list'
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
 *        - product
 *        - date
 *        properties:
 *         product:
 *          type: string
 *         date:
 *           type: date
 *       example:
 *        product: 'Mozzarella'
 *        date: '2022-01-01T12:00'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent when the user doesn't reside in an apartment or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
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
 *         motivation: >-
 *          Couldn't add expense.
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

/**
 * @swagger
 * /apartment/list/modify:
 *  patch:
 *   summary: Modify an entry of the shopping list
 *   description: >-
 *    This method is used to change one of the **entries of the shopping list** which either has to belong to the current user if the user isn't the owner or doesn't have to, if the user is the owner.
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
 *        - productID
 *        properties:
 *         productID:
 *          type: string
 *         product:
 *          type: string
 *         buyer:
 *          type: string
 *         lastBougth:
 *          type: date
 *       example:
 *        productID: '4e5dcba29...'
 *        product: 'Pasta'
 *        Buyer: 'Polnareff'
 *        date: '2022-01-02T13:45'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the expense either doesn't exist or isn't modifiable by the user, or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
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
 *         motivation: >-
 *          Can't access list element.
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
async function modify(req, res) {
    try {
        const { productID, product, buyer, lastBought } = req.body;
        // tipo productID
        if(!com.checkObligatoryParameters(res, [productID], ["mongooseObjectID"])) {
            return;
        }
        if(!com.checkOptionalParameters(res, [product, lastBought], ["string", "date"])) {
            return;
        }
        // controllo last bougth

        const listElem = { _id: productID };
        if (product) { listElem.product = product; }
        if (lastBought) { listElem.lastBought = lastBought; }
        if (buyer) { listElem.userID = buyer; }

        const result = await list.modifyProduct(req.user, listElem);
        if (!result) {
            com.returnErrorMessage(res, 400, "Can't access list element");
        } else {
            res.status(200).send();
        }
    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

/**
 * @swagger
 * /apartment/list/delete:
 *  patch:
 *   summary: Delete an entry of the shopping list
 *   description: >-
 *    This method is used to delete one of the **entries of the shpping list** which either has to belong to the current user if the user isn't the owner or doesn't have to, if the user is the owner.
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
 *        - ProductID
 *        properties:
 *         ProductID:
 *          type: string
 *       example:
 *        ProductID: '4e5dcba29...'
 *   responses:
 *    '200':
 *      description: 'Everything went smoothly.'
 *    '400':
 *      description: >-
 *       This response is sent if the shopping list element either doesn't exist or isn't modifiable by the user, or when the body parameters are of the **wrong type** or if any body parameter is **missing**.
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
 *         motivation: >-
 *          Can't access list element.
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
async function _delete(req, res) {
    try {
        const { productID } = req.body;
        if(!com.checkObligatoryParameters(res, [productID], ["mongooseObjectID"])) {
            return;
        }

        const result = await list.deleteProduct(req.user, { _id: productID });
        if (!result) {
            com.returnErrorMessage(res, 400, "Can't access list element.");
        } else {
            res.status(200).send();
        }
    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error.");
        console.log(err);
    }
}

module.exports = {add, modify, _delete}
