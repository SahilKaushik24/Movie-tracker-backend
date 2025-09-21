import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

// utility function to get full poster URL
function getPosterUrl(path) {
  if (!path) return "/placeholder.png"; // fallback if no poster
  return `https://image.tmdb.org/t/p/w500${path}`;
}

// get movies list
router.get("/", async (req, res) => {
  try {
    const { title, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = { status: true };
    if (title) where.title = { contains: title, mode: "insensitive" };

    const movies = await prisma.movie.findMany({
      where,
      include: { movieGenres: { include: { genre: true } } },
      skip,
      take: limitNum,
    });

    const totalMovies = await prisma.movie.count({ where });
    const totalPages = Math.ceil(totalMovies / limitNum);

    const moviesWithPoster = movies.map((m) => ({
      ...m,
      poster: getPosterUrl(m.poster_path),
    }));

    res.json({
      pages: pageNum,
      limit: limitNum,
      totalPages,
      totalMovies,
      movies: moviesWithPoster,
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// GET movie details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id: Number(id) },
      include: { movieGenres: { include: { genre: true } } },
    });

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const movieWithPoster = {
      ...movie,
      poster: getPosterUrl(movie.poster_path),
    };

    res.json(movieWithPoster);
  } catch (err) {
    console.error("Error fetching movie:", err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

// POST new movie
router.post("/", async (req, res) => {
  try {
    const { title, director, releaseYear, overview, rating, genres } = req.body;
    if (!title || !director || !releaseYear)
      return res.status(400).json({ error: "Missing required fields" });

    const movieData = {
      title,
      director,
      releaseYear: Number(releaseYear),
      overview,
      rating: rating ? Number(rating) : null,
      movieGenres: genres?.length
        ? {
            create: genres.map((genreId) => ({
              genre: { connect: { id: genreId } },
            })),
          }
        : undefined,
    };

    const newMovie = await prisma.movie.create({
      data: movieData,
      include: { movieGenres: { include: { genre: true } } },
    });

    res
      .status(201)
      .json({ ...newMovie, poster: getPosterUrl(newMovie.poster_path) });
  } catch (err) {
    console.error("Error creating movie:", err);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

export default router;
