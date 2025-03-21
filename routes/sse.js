const express = require("express");
const { cronEvent } = require("../cron/cronEvents");
const router = express.Router();

router.get("/:id", (req, res) => {
  console.log(`*****SSE Connection with User ${req.params.id} Open*****`);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendUpdateData = (updateData) => {
    res.write(`data: ${JSON.stringify(updateData)}\n\n`);
  };

  // console.log(cronEvent.listenerCount(`income_for_${req.params.id}`));
  cronEvent.on(`income_for_${req.params.id}`, sendUpdateData);
  // console.log(cronEvent.listenerCount(`income_for_${req.params.id}`));

  res.write(
    `data: ${JSON.stringify({ message: `Hello User ${req.params.id}` })} \n\n`
  );

  req.on("error", (err) => {
    console.log(err);
    // console.log(`*****SSE Connnection with User ${req.params.id} Closed*****`);
    // cronEvent.off(`income_for_${req.params.id}`, sendUpdateData);
    // res.end();
  });

  req.on("close", () => {
    console.log(`*****SSE Connnection with User ${req.params.id} Closed*****`);
    cronEvent.off(`income_for_${req.params.id}`, sendUpdateData);
    res.end();
  });
});

module.exports = router;
