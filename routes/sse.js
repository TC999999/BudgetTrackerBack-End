const express = require("express");
const { startEvent } = require("../controllers/sse");
const router = express.Router();

// route that starts server-side event
router.get("/:id", startEvent);

module.exports = router;
