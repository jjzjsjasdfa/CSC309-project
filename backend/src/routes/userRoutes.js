const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/avatars' });
const { authenticateToken, authorization, validatePayload, verifyUserId, debug } = require('../middleware/middleware');
const userController = require("../controllers/userController");
const transactionController = require("../controllers/transactionController");


router.route("/me/transactions")
  .post(
    authenticateToken,
    authorization(["regular", "cashier", "manager", "superuser"]),
    validatePayload({ required: ["type", "amount"], optional: ["remark"] }, "body"),
    userController.redeemPoints
  )
  .get(
    authenticateToken,
    authorization(["regular", "cashier", "manager", "superuser"]),
    validatePayload(
      { optional: ["type", "relatedId", "promotionId", "amount", "operator", "page", "limit"] },
      "query"),
    userController.getMyTransactions
  )

router.patch(
  "/me/password",
  authenticateToken,
  authorization(["regular", "cashier", "manager", "superuser"]),
  validatePayload({ required: ["old", "new"] }, "body"),
  userController.updateMyPassword
);

router.route("/me")
  .patch(
    authenticateToken,
    authorization(["regular", "cashier", "manager", "superuser"]),
    validatePayload({ optional: ["name", "email", "birthday", "avatar"] }, "body"),
    upload.single('avatar'),
    userController.updateMyself
  )
  .get(
    authenticateToken,
    authorization(["regular", "cashier", "manager", "superuser"]),
    validatePayload({}, "query"),
    userController.getMyself
  );

router.post(
  "/:userId/transactions",
  authenticateToken,
  authorization(["regular", "cashier", "manager", "superuser"]),
  validatePayload({ required: ["type", "amount"], optional: ["remark"] }, "body"),
  userController.transferPoints
)

router.route("/:userId")
  .get(
    authenticateToken,
    authorization(["cashier", "manager", "superuser"]),
    verifyUserId,
    validatePayload({}, "query"),
    userController.getUser
  )
  .patch(
    authenticateToken,
    authorization(["manager", "superuser"]),
    verifyUserId,
    validatePayload({ optional: ["email", "verified", "suspicious", "role"] }, "body"),
    userController.updateUser
  )
  .all((req, res) => {
    return res.set('Allow', 'GET, PATCH').status(405).json({ error: "Method not allowed" });
  });

router.route("/")
  .post(
    authenticateToken,
    authorization(["cashier", "manager", "superuser"]),
    validatePayload({ required: ["utorid", "name", "email"] }, "body"),
    userController.register
  )
  .get(
    authenticateToken,
    authorization(["manager", "superuser"]),
    validatePayload({ optional: ["name", "role", "verified", "activated", "page", "limit"] }, "query"),
    userController.getUsers
  )
  .all((req, res) => {
    return res.set('Allow', 'GET, POST').status(405).json({ error: "Method not allowed" });
  });

module.exports = router;