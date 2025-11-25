import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movies.js";
import genresRoutes from "./routes/genres.js";
import watchedRoutes from "./routes/watched.js";
import authRouter from "./routes/auth.js";
import users from "./routes/users.js";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/movies", movieRoutes);
app.use("/genres", genresRoutes);
app.use("/watched", watchedRoutes);
app.use("/auth", authRouter);
app.use("/users", users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
