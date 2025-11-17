const {validatePayload} = require("./middleware");

function validateTransactionPayloads(req, res, next){
    const type = req.body.type;
    if (type !== "purchase" && type !== "adjustment") {
        return res.status(400).json({ error: "Type Error" });
    }

    if(type === "adjustment" && !["manager","superuser"].includes(req.user.role)) {
        return res.status(403).json({ error: "User cannot do adjustment transaction" });
    }

    const types = {
        purchase: {required: ["utorid", "type", "spent"],
            optional: ["promotionIds", "remark"],},
        adjustment: {required: ["utorid", "type", "amount", "relatedId"],
            optional: ["promotionIds", "remark"],},
    };

    validatePayload(types[type], "body")(req, res, next);
}

module.exports = { validateTransactionPayloads };
