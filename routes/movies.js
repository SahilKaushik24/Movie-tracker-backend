const express = require("express");
const { PrismaClient } = require("../generated/prisma");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});
router.post("/", async (req, res) => {
  const { title, director, releaseYear } = req.body;
  const newMovie = await prisma.movie.create({
    data: { title, director, releaseYear },
  });
  res.json(newMovie);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const movie = await prisma.movie.findUnique({
    where: { id: Number(id) },
  });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, director, releaseYear } = req.body;
  const updatedMovie = await prisma.movie.update({
    where: { id: Number(id) },
    data: { title, director, releaseYear },
  });
  res.json(updatedMovie);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.movie.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "Movie deleted successfully" });
});

module.exports = router;
