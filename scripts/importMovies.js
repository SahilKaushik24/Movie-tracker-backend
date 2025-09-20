import fs from "fs";
import csvParser from "csv-parser";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function importMovies() {
  const movies = [];
  const filePath = "/home/sahil/Downloads/movies_metadata.csv";

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (movies.length < 500) {
          try {
            const movie = {
              title: row.title || "Untitled",
              overview: row.overview || null,
              releaseDate: row.release_date ? new Date(row.release_date) : null,
              posterPath: row.poster_path || null,
              rating: row.vote_average ? parseFloat(row.vote_average) : null,
              runtime:
                row.runtime && !isNaN(row.runtime)
                  ? parseInt(row.runtime)
                  : null,
              language: row.original_language || null,
              budget:
                row.budget && !isNaN(row.budget) ? parseInt(row.budget) : null,
              director: row.director || null, // optional field
            };
            movies.push(movie);
          } catch (err) {
            console.error("Error parsing row:", err);
          }
        }
      })
      .on("end", async () => {
        console.log(`Parsed ${movies.length} movies, inserting into DB...`);
        try {
          for (const movie of movies) {
            await prisma.movie.create({ data: movie });
          }
          console.log("✅ Import completed!");
          resolve();
        } catch (err) {
          console.error("Error inserting movies:", err);
          reject(err);
        } finally {
          await prisma.$disconnect();
        }
      });
  });
}

importMovies().catch((err) => {
  console.error("Script failed:", err);
});
