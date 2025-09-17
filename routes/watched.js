import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";
const router = express.Router();
const prisma = new PrismaClient();

// GET watched movies for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const watchedMovies = await prisma.watched.findMany({
      where: { userId: Number(userId), isDeleted: false },
      include: {
        movie: {
          include: {
            movieGenres: {
              include: {
                genre: true,
              },
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

/**
 * ADD a new watched movie
 */
router.post("/", async (req, res) => {
  const { userId, movieId, rating } = req.body;

  try {
    const watched = await prisma.watched.create({
      data: {
        userId: Number(userId),
        movieId: Number(movieId),
        rating: rating ? Number(rating) : null,
      },
      include: { movie: true },
    });

    res.status(201).json(watched);
  } catch (error) {
    console.error("Error adding watched movie:", error);
    res.status(500).json({ error: "Failed to save watched movie" });
  }
});

/**
 * DELETE a watched movie by watchedId
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await prisma.watched.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Watched movie deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting watched movie:", error);
    res.status(500).json({ error: "Failed to delete watched movie" });
  }
});

export default router;
