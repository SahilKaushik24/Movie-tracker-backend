import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { authenticateToken } from "../middleware/middleware.js";

const router = express.Router();
const prisma = new PrismaClient();

function getPosterUrl(url) {
  return url || "/placeholder.png";
}

router.get("/", authenticateToken, async (req, res) => {
  try {
    const watchedMovies = await prisma.watched.findMany({
      where: { userId: req.user.userId, isDeleted: false },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
    });

    const moviesWithPoster = watchedMovies.map((w) => ({
      ...w,
      movie: {
        ...w.movie,
        poster: getPosterUrl(w.movie.posterURL),
      },
    }));

    res.json(moviesWithPoster);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watched movies" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const { movieId, rating } = req.body;

  if (!movieId) return res.status(400).json({ error: "movieId is required" });

  try {
    // Check if already exists
    const existing = await prisma.watched.findFirst({
      where: { userId: req.user.userId, movieId: Number(movieId) },
    });

    let watched;
    if (existing) {
      if (existing.isDeleted) {
        watched = await prisma.watched.update({
          where: { id: existing.id },
          data: { isDeleted: false, rating: rating ? Number(rating) : null },
        });
      } else {
        return res.status(400).json({ error: "Movie already in watched list" });
      }
    } else {
      watched = await prisma.watched.create({
        data: {
          userId: req.user.userId,
          movieId: Number(movieId),
          rating: rating ? Number(rating) : null,
        },
      });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: Number(movieId) },
    });

    res.status(201).json({
      ...watched,
      movie: { ...movie, poster: getPosterUrl(movie.posterURL) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save watched movie" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const watched = await prisma.watched.findUnique({
      where: { id: Number(id) },
    });

    if (!watched || watched.userId !== req.user.userId)
      return res.status(403).json({ error: "Not allowed" });

    const deleted = await prisma.watched.update({
      where: { id: Number(id) },
      data: { isDeleted: true },
    });

    res.json({ message: "Deleted successfully", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete watched movie" });
  }
});

export default router;
