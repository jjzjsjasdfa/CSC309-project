const express = require("express")
const router = express.Router();
const { authenticateToken, authorization, validatePayload, verifyUserId } = require('../middleware/middleware');
const authController = require("../controllers/authController");

router.post(
  "/tokens",
  validatePayload({ required: ["utorid", "password"] }, "body"),
  authController.authenticate
);

router.post(
  "/resets",
  validatePayload({ required: ["utorid"] }, "body"),
  authController.generateResetToken
);

router.post(
  "/resets/:resetToken",
  validatePayload({ required: ["utorid", "password"] }, "body"),
  authController.resetPassword
);

module.exports = router;