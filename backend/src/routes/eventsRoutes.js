const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");

const { authenticateToken, authorization,organizerAuthorization, validatePayload, verifyUserId, debug } = require('../middleware/middleware');

router.route("/")
.post(
    authenticateToken,            
    authorization(["manager", "superuser"]),  
    validatePayload({ 
        required: ["name", "description", "location", "startTime", "endTime", "points"],
        optional: ["capacity"]
    }, "body"),
    eventsController.register
).get(
    authenticateToken,            
    authorization(["regular","cashier","manager","superuser"]),  
    validatePayload({ 
        optional: ["name", "location", "started", "ended", "showFull", "page", "limit", "published"]
    }, "query"),
    eventsController.getEvents
)

router.post(
  "/:eventId/transactions",
  authenticateToken,
  organizerAuthorization(["manager", "superuser"]),
  validatePayload({
    required: ["type", "amount"], optional: ["utorid"]
  }, "body"),
  eventsController.createEventTransaction
)

router.route("/:eventId/organizers")
.post(
    authenticateToken,            
    authorization(["manager", "superuser"]),  
    validatePayload({ 
        required: ["utorid"],
    }, "body"),
    eventsController.organizeEvent
)

router.route("/:eventId/organizers/:userId")
.delete(
    authenticateToken,            
    authorization(["manager", "superuser"]),
    eventsController.kickOrganizer
)

router.route("/:eventId")
.delete(
    authenticateToken, 
    authorization(["manager", "superuser"]),
    eventsController.deleteEvent)
.get(authenticateToken, 
    authorization(["regular","cashier","manager", "superuser"]),
    eventsController.getEvent)
.patch(
    authenticateToken,
    organizerAuthorization(["manager", "superuser"]),
    validatePayload({ optional: ["name", "description", "location", "startTime", "endTime", "capacity", "points", "published"] }, "body"),
    eventsController.updateEvent
)

router.route("/:eventId/guests/me")
  .post(
    authenticateToken,
    eventsController.registerMyselfAsGuest
  )
  .delete(
    authenticateToken,
    eventsController.removeMyselfAsGuest
  )

router.route("/:eventId/guests/:userId")
.delete(
    authenticateToken,
    authorization(["manager", "superuser"]),
    eventsController.kickGuest
)

router.route("/:eventId/guests")
.post(
    authenticateToken,
    organizerAuthorization(["manager", "superuser"]),
    validatePayload({ required: ["utorid"] }, "body"),
    eventsController.registerGuest
)

module.exports = router;