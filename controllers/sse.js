const { cronEvent } = require("../cron/cronEvents");

// creates a server-side event to provide user with real time updates to their total
// assets at the intervals specified on their incomes
const startEvent = (req, res) => {
  console.log(`*****SSE Connection with User ${req.params.id} Open*****`);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // sends data to frontend
  const sendUpdateData = (updateData) => {
    res.write(`data: ${JSON.stringify(updateData)}\n\n`);
  };

  // listens for cront evets
  cronEvent.on(`income_for_${req.params.id}`, sendUpdateData);

  // closes connection
  req.on("close", () => {
    console.log(`*****SSE Connnection with User ${req.params.id} Closed*****`);
    cronEvent.off(`income_for_${req.params.id}`, sendUpdateData);
    res.end();
  });
};

module.exports = { startEvent };
