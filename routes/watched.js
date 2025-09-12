const express = require("express");
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, movieId, rating } = req.body;

    if (!userId || !movieId) {
      return res.status(400).json({ error: "userId and movieId are required" });
    }

    const watched = await prisma.watched.create({
      data: {
        user: { connect: { id: userId } },
        movie: { connect: { id: movieId } },
        rating,
      },
      include: {
        movie: {
          include: {
            movieGenres: { include: { genre: true } },
          },
        },
      },
    });

    res.json({
      id: watched.movie.id,
      title: watched.movie.title,
      releaseYear: watched.movie.releaseYear,
      director: watched.movie.director,
      rating: watched.movie.rating,
      genres: watched.movie.movieGenres.map((g) => g.genre.name),
      poster: watched.movie.poster || "/placeholder.png",
      userRating: watched.rating,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add watched movie" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const watchedMovies = await prisma.watched.findMany({
      where: { userId: Number(userId) },
      include: {
        movie: {
          include: {
            movieGenres: { include: { genre: true } },
          },
        },
      },
    });

    const mapped = watchedMovies.map((w) => ({
      id: w.movie.id,
      title: w.movie.title,
      releaseYear: w.movie.releaseYear,
      director: w.movie.director,
      rating: w.movie.rating,
      genres: w.movie.movieGenres.map((g) => g.genre.name),
      poster: w.movie.poster || "/placeholder.png",
      userRating: w.rating,
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watched movies" });
  }
});

router.delete("/:userId/:movieId", async (req, res) => {
  try {
    const { userId, movieId } = req.params;

    await prisma.watched.delete({
      where: {
        userId_movieId: {
          userId: Number(userId),
          movieId: Number(movieId),
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete watched movie" });
  }
});

module.exports = router;
