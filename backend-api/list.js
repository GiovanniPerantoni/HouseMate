const list = require("../backend-db/list");
const com = require("./common");

// Tipo userID
// Refactor product into elem

/**
 * @swagger
 * /apartment/list/view:
 *  get:
 *   summary: Get the elements of the shopping list
 *   description: 'This method is used to get the **entries of the shopping list** of the users residing in the same apartment.'
 *   parameters:
 *   - name: x-access-token
 *     in: header
 *     description: Authentication token required for access.
 *     required: true
 *     example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...'
 *   responses:
 *    '200':
 *     description: 'Everything went smoothly.'
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         products:
 *          type: array
 *          items:
 *           type: object
 *           properties:
 *            productID:
 *             type: string
 *            product:
 *             type: string
 *            userID:
 *             type: string
 *            date:
 *             type: date
 *       example:
 *        products:
 *         - itemID: '6290ec70f...'
 *           product: 'Earl Grey tea'
 *           userID: 'Jonathan'
 *           date: '2022-01-01T12:00'
 *         - itemID: '2df0a1f9a...'
 *           product: 'Coca Cola'
 *           userID: 'Joseph'
 *           date: '2022-01-01T12:00'
 *         - itemID: '3cdf90d8a...'
 *           product: 'Matcha Tea'
 *           userID: 'Jotaro'
 *           date: '2022-01-01T12:00'
 *    '400':
 *      description: >-
 *       This response is sent if the limit is not valid or if the body parameters are of the **wrong type**.
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
 *         motivation: 'Invalid limit.'
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
async function view(req, res) {
    try {
        var { limit } = req.body;
        if (!limit) {
            limit = 20;
        }
        if(!com.checkOptionalParameters(res, [limit], ["int"])) {
            return;
        }
        if (limit < 1) {
            com.returnErrorMessage(res, 400, "Invalid limit.");
        }

        const shoppingList = await list.getProducts(req.user, limit);
        
        products = [];
        for (let i=0; i<shoppingList.length; i++) {
            products.push(com.cleanObjectData(shoppingList[i], ["productID", "product", "userID", "date"]));
        }

        res.status(200).json({ "products" : products});
        
    } catch (err) {
        com.returnErrorMessage(res, 500, "Unexpected error");
        console.log(err);
    }
}

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
 *          Couldn't add list element.
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
            com.returnErrorMessage(res, 400, "Couldn't add list element.");
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
 *         userID:
 *          type: string
 *         lastBougth:
 *          type: date
 *       example:
 *        productID: '4e5dcba29...'
 *        product: 'Pasta'
 *        userID: 'Polnareff'
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
        const { productID, product, userID, date } = req.body;
        // tipo productID
        if(!com.checkObligatoryParameters(res, [productID], ["mongooseObjectID"])) {
            return;
        }
        if(!com.checkOptionalParameters(res, [product, userID, date], ["string", "string", "date"])) {
            return;
        }
        // controllo last bougth

        const listElem = { _id: productID };
        if (product) { listElem.product = product; }
        if (date) { listElem.date = date; }
        if (userID) { listElem.userID = userID; }

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

module.exports = {view, add, modify, _delete}
