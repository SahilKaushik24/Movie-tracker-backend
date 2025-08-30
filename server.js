const express = require("express");
const app = express();

app.use(express.json());

const movieRoutes = require("./routes/movies");

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/movies", movieRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
