const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

const movieRoutes = require("./routes/movies");
const genresRoutes = require("./routes/genres");

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/movies", movieRoutes);
app.use("/genres", genresRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
