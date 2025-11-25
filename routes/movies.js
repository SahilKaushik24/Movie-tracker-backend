import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function getPosterUrl(url) {
  return url || "/placeholder.png";
}

router.get("/", async (req, res) => {
  try {
    const { title, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = title
      ? { title: { contains: title, mode: "insensitive" } }
      : {};

    const movies = await prisma.movie.findMany({
      where,
      include: {
        movieGenres: {
          include: { genre: { select: { name: true } } },
        },
      },
      skip,
      take: limitNum,
      orderBy: { title: "asc" },
    });

    const totalMovies = await prisma.movie.count({ where });

    const moviesWithPoster = movies.map((m) => ({
      id: m.id,
      title: m.title,
      director: m.director,
      metaScore: m.metaScore,
      poster: getPosterUrl(m.posterURL),
      stars: m.stars,
      votes: m.votes,
      writers: m.writers,
      description: m.description,
      imdbRating: m.imdbRating,
      videoURL: m.videoURL,
      genres: m.movieGenres.map((mg) => mg.genre.name),
      status: m.status,
    }));

    res.json({
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalMovies / limitNum),
      totalMovies,
      movies: moviesWithPoster,
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id: Number(id) },
      include: {
        movieGenres: { include: { genre: { select: { name: true } } } },
      },
    });

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.json({
      id: movie.id,
      title: movie.title,
      director: movie.director,
      metaScore: movie.metaScore,
      poster: getPosterUrl(movie.posterURL),
      stars: movie.stars,
      votes: movie.votes,
      writers: movie.writers,
      description: movie.description,
      imdbRating: movie.imdbRating,
      videoURL: movie.videoURL,
      genres: movie.movieGenres.map((mg) => mg.genre.name),
      status: movie.status,
    });
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      posterURL,
      videoURL,
      imdbRating,
      votes,
      metaScore,
      director,
      writers,
      stars,
      genres,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const newMovie = await prisma.movie.create({
      data: {
        title,
        description: description || null,
        posterURL: posterURL || null,
        videoURL: videoURL || null,
        imdbRating: imdbRating ? Number(imdbRating) : null,
        votes: votes ? Number(votes) : null,
        metaScore: metaScore ? Number(metaScore) : null,
        director: director || null,
        writers: writers || null,
        stars: stars || null,
        movieGenres: genres?.length
          ? {
              create: genres.map((genreId) => ({
                genre: { connect: { id: genreId } },
              })),
            }
          : undefined,
      },
      include: {
        movieGenres: { include: { genre: { select: { name: true } } } },
      },
    });

    res.status(201).json({
      id: newMovie.id,
      title: newMovie.title,
      poster: getPosterUrl(newMovie.posterURL),
      genres: newMovie.movieGenres.map((mg) => mg.genre.name),
    });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

export default router;
