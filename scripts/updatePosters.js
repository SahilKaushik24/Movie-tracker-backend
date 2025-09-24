// updatePosters.js
import prisma from "./generated/prisma/index.js"; // Adjust path if needed
import fetch from "node-fetch";

const OMDB_API_KEY = "YOUR_OMDB_API_KEY"; // Replace with your key

async function updatePosters() {
  const movies = await prisma.movie.findMany();

  for (const movie of movies) {
    try {
      const title = encodeURIComponent(movie.title);
      const res = await fetch(
        `https://www.omdbapi.com/?t=${title}&apikey=${OMDB_API_KEY}`
      );
      const data = await res.json();

      if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
        await prisma.movie.update({
          where: { id: movie.id },
          data: { posterURL: data.Poster },
        });
        console.log(`Updated poster for "${movie.title}"`);
      } else {
        console.log(`Poster not found for "${movie.title}"`);
      }
    } catch (err) {
      console.error(`Error updating poster for "${movie.title}":`, err);
    }
  }

  console.log("Poster update complete!");
  process.exit(0);
}

updatePosters();
