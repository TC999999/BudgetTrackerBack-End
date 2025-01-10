const app = require("./app");
const { PORT } = require("./config");

app.get("/", (req, res, next) => {
  return res.json({ message: "HELLO" });
});

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
