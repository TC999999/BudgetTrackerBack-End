// creates event emitter to be used whenever a cron job runs and listens in the SSE route
const EventEmitter = require("events");
let cronEvent = new EventEmitter();

module.exports = { cronEvent };
