const list = require("../backend-db/list");
const com = require("./common");

// /apartment/list/add
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
        const { itemID, product, lastBought } = req.body;
        // tipo itemID
        if(!com.checkObligatoryParameters(res, [itemID], ["mongooseObjectID"])) {
            return;
        }
        if(!com.checkOptionalParameters(res, [product, lastBought], ["string", "date"])) {
            return;
        }
        // controllo last bougth

        const listElem = { _id: itemID, userID: req.user.userID };
        if (product) { listElem.product = product; }
        if (lastBought) { listElem.lastBought = lastBought; }

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

// /apartment/list/delete
async function _delete(req, res) {
    try {
        const { itemID } = req.body;
        if(!com.checkObligatoryParameters(res, [itemID], ["mongooseObjectID"])) {
            return;
        }

        const result = await list.deleteProduct(req.user, { _id: itemID });
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
