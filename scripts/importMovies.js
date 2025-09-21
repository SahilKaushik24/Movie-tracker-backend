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
        try {
          let releaseDate = null;
          let releaseYear = null;
          if (row.release_date && !isNaN(Date.parse(row.release_date))) {
            releaseDate = new Date(row.release_date);
            releaseYear = releaseDate.getFullYear();
          }

          const rating =
            row.vote_average && !isNaN(row.vote_average)
              ? parseFloat(row.vote_average)
              : null;
          const runtime =
            row.runtime && !isNaN(row.runtime) ? parseInt(row.runtime) : null;
          const budget =
            row.budget && !isNaN(row.budget) ? parseInt(row.budget) : null;

          const movie = {
            title: row.title?.slice(0, 255) || "Untitled",
            overview: row.overview || null,
            releaseDate: releaseDate,
            releaseYear: releaseYear,
            posterPath: row.poster_path || null,
            rating,
            runtime,
            language: row.original_language || null,
            budget,
            director: row.director || null,
          };

          movies.push(movie);
        } catch (err) {
          console.error("Error parsing row:", err);
        }
      })
      .on("end", async () => {
        console.log(`Parsed ${movies.length} movies, inserting into DB...`);
        try {
          const batchSize = 200;
          for (let i = 0; i < movies.length; i += batchSize) {
            const batch = movies.slice(i, i + batchSize);
            await prisma.movie.createMany({
              data: batch,
              skipDuplicates: true,
            });
            console.log(`Inserted batch ${i / batchSize + 1}`);
          }
          console.log("Import completed!");
          resolve();
        } catch (err) {
          console.error("Error inserting movies:", err);
          reject(err);
        } finally {
          await prisma.$disconnect();
        }
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
}

importMovies().catch((err) => {
  console.error("Script failed:", err);
});
