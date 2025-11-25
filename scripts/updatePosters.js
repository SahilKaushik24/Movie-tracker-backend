import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OMDB_API_KEY = process.env.OMDB_API_KEY;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPoster(title) {
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(
      title
    )}&apikey=${OMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
      return data.Poster;
    }
  } catch (err) {
    console.error(`Error fetching poster for "${title}":`, err);
  }
  return null;
}

async function updatePosters() {
  try {
    const movies = await prisma.movie.findMany();

    console.log(`🖼 Updating posters for ${movies.length} movies...`);

    // Limit concurrent requests to avoid rate-limiting
    const CONCURRENCY = 10;
    for (let i = 0; i < movies.length; i += CONCURRENCY) {
      const batch = movies.slice(i, i + CONCURRENCY);

      await Promise.all(
        batch.map(async (movie) => {
          if (!movie.posterURL) {
            const poster = await fetchPoster(movie.title);
            if (poster) {
              await prisma.movie.update({
                where: { id: movie.id },
                data: { posterURL: poster },
              });
              console.log(`✅ Updated poster for "${movie.title}"`);
            } else {
              console.log(`⚠ Poster not found for "${movie.title}"`);
            }
          }
        })
      );

      // Optional: small delay to avoid hitting OMDb API limits
      await delay(300);
    }

    console.log("🎬 Poster update complete!");
  } catch (err) {
    console.error("Error updating posters:", err);
  } finally {
    await prisma.$disconnect();
  }
}

updatePosters();
