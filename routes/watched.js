import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { authenticateToken } from "../middleware/middleware.js";

const router = express.Router();
const prisma = new PrismaClient();

//watched movies for logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const watchedMovies = await prisma.watched.findMany({
      where: { userId: req.user.userId, isDeleted: false }, // FIXED
      include: {
        movie: {
          include: {
            movieGenres: {
              include: { genre: true },
            },
          },
        },
      },
    });

    res.json(watchedMovies);
  } catch (err) {
    console.error("Error fetching watched movies:", err);
    res.status(500).json({ error: "Failed to fetch watched movies" });
  }
});

// add a watched movie
router.post("/", authenticateToken, async (req, res) => {
  const { movieId, rating } = req.body;

  try {
    // Check if already exists
    const existing = await prisma.watched.findFirst({
      where: {
        userId: req.user.userId, // FIXED
        movieId: Number(movieId),
      },
    });

    let watched;
    if (existing) {
      if (existing.isDeleted) {
        // Reactivate soft-deleted movie
        watched = await prisma.watched.update({
          where: { id: existing.id },
          data: {
            isDeleted: false,
            rating: rating ? Number(rating) : null,
            createdAt: new Date(),
          },
          include: { movie: true },
        });
      } else {
        return res.status(400).json({ error: "Movie already in watched list" });
      }
    } else {
      // Create new entry
      watched = await prisma.watched.create({
        data: {
          userId: req.user.userId, // FIXED
          movieId: Number(movieId),
          rating: rating ? Number(rating) : null,
        },
        include: { movie: true },
      });
    }

    res.status(201).json(watched);
  } catch (error) {
    console.error("Error adding watched movie:", error);
    res.status(500).json({ error: "Failed to save watched movie" });
  }
});

// soft delete watched movie
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const watched = await prisma.watched.findUnique({
      where: { id: Number(id) },
    });

    // FIXED: check against req.user.userId
    if (!watched || watched.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this movie" });
    }

    const deleted = await prisma.watched.update({
      where: { id: Number(id) },
      data: { isDeleted: true },
    });

    res.json({ message: "Watched movie removed (soft delete)", deleted });
  } catch (error) {
    console.error("Error deleting watched movie:", error);
    res.status(500).json({ error: "Failed to delete watched movie" });
  }
});

export default router;
