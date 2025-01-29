const app = require("./app");
const mongoose = require("mongoose");
const { PORT, DATABASE_URL } = require("./config");

mongoose.connect(DATABASE_URL).then(() => {
  console.log("Successfully connected to database");
  app.listen(PORT, () => {
    console.log(`Server starting on port ${PORT}`);
  });
});
