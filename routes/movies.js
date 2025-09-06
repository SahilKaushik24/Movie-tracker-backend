const express = require("express");
const { PrismaClient } = require("../generated/prisma");

const router = express.Router();
const prisma = new PrismaClient();

//specific PUT route
router.put("/deactivate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMovie = await prisma.movie.update({
      where: { id: Number(id) },
      data: { status: false },
    });
    res.json(updatedMovie);
  } catch (error) {
    console.error("Error deactivating movie:", error);
    res.status(500).json({ error: "Failed to deactivate movie" });
  }
});

//general PUT route
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, director, releaseYear, description, rating } = req.body;
    const updatedMovie = await prisma.movie.update({
      where: { id: Number(id) },
      data: {
        title,
        director,
        releaseYear: Number(releaseYear),
        description,
        rating: rating ? Number(rating) : undefined,
      },
    });
    res.json(updatedMovie);
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ error: "Failed to update movie" });
  }
});

//GET all movies with search
router.get("/", async (req, res) => {
  try {
    const { title } = req.query;

    const findManyOptions = {
      where: {
        status: true,
      },
      include: { movieGenres: { include: { genre: true } } },
    };

    if (title) {
      findManyOptions.where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    const movies = await prisma.movie.findMany(findManyOptions);
    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch movies", details: error.message });
  }
});

//GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id: Number(id) },
    });
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, director, releaseYear, description, rating, genres } =
      req.body;
    if (!title || !director || !releaseYear) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const movieData = {
      title,
      director,
      releaseYear: Number(releaseYear),
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

    res.status(201).json(newMovie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

module.exports = router;
