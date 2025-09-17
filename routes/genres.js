import express from "express";
import { PrismaClient } from "../generated/prisma/index.js";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let where = {};

    if (status === "active") where.status = true;
    if (status === "inactive") where.status = false;

    const genres = await prisma.genre.findMany({ where });
    res.json(genres);
  } catch (error) {
    console.log("Error fetching genres", error);
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
  } catch (error) {
    console.error("Error fetching genre", error);
    res.status(500).json({ error: "Failed to fetch genre" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const existing = await prisma.genre.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Genre already exists", genre: existing });
    }

    const newGenre = await prisma.genre.create({ data: { name } });
    res.status(201).json(newGenre);
  } catch (error) {
    console.error("Error creating genre:", error);
    res.status(500).json({ error: "Failed to create genre" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.genre.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating genre:", error);
    res.status(500).json({ error: "Failed to update genre" });
  }
});

export default router;
