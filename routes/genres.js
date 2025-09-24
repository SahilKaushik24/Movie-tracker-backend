import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
    res.json(genres);
  } catch (err) {
    console.error("Error fetching genres:", err);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await prisma.genre.findUnique({
      where: { id: Number(id) },
    });

    if (!genre) return res.status(404).json({ error: "Genre not found" });
    res.json(genre);
  } catch (err) {
    console.error("Error fetching genre:", err);
    res.status(500).json({ error: "Failed to fetch genre" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const existing = await prisma.genre.findUnique({ where: { name } });
    if (existing)
      return res.status(400).json({ error: "Genre already exists" });

    const newGenre = await prisma.genre.create({ data: { name } });
    res.status(201).json(newGenre);
  } catch (err) {
    console.error("Error creating genre:", err);
    res.status(500).json({ error: "Failed to create genre" });
  }
});

export default router;
