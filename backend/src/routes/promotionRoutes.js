const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { authenticateToken, authorization, validatePayload } = require("../middleware/middleware");

router.post(
  "/",
  authenticateToken,
  authorization(["manager", "superuser"]),
  promotionController.create
);

router.get(
  "/",
  authenticateToken,
  authorization(["regular", "cashier", "manager", "superuser"]),
  promotionController.getAll
);

router.get(
  "/:id",
  authenticateToken,
  authorization(["regular", "cashier", "manager", "superuser"]),
  promotionController.getById
);

router.patch(
  "/:id",
  authenticateToken,
  authorization(["manager", "superuser"]),
  validatePayload({ optional: ["name", "description", "type", "startTime", "endTime", "minSpending", "rate", "points"] }, "body"),
  promotionController.update
);

router.delete(
  "/:id",
  authenticateToken,
  authorization(["manager", "superuser"]),
  promotionController.remove
);

module.exports = router;
