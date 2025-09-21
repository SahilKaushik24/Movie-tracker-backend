import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { authenticateToken } from "../middleware/middleware.js";
import { getPosterUrl } from "../utils.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET watched movies
router.get("/", authenticateToken, async (req, res) => {
  try {
    const watchedMovies = await prisma.watched.findMany({
      where: { userId: req.user.userId, isDeleted: false },
      include: { movie: true },
    });

    const moviesWithPoster = watchedMovies.map((w) => ({
      ...w,
      movie: {
        ...w.movie,
        poster: getPosterUrl(w.movie.poster_path),
      },
    }));

    res.json(moviesWithPoster);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watched movies" });
  }
});

// POST watched movie
router.post("/", authenticateToken, async (req, res) => {
  const { movieId, rating } = req.body;
  try {
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
    res
      .status(201)
      .json({
        ...watched,
        movie: { ...movie, poster: getPosterUrl(movie.poster_path) },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save watched movie" });
  }
});

// DELETE watched (soft delete)
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

    res.json({ message: "Deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete watched movie" });
  }
});

export default router;
