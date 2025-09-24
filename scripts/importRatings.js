import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const csvFilePath = path.resolve(
  "/home/sahil/Downloads/archive/imdb-top-rated-movies-user-rated.csv"
);

async function updateRatings() {
  const moviesToUpdate = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const title = row["Title"]?.trim();
      const imdbRating = parseFloat(row["IMDb Rating"]) || null;
      const metaScore = parseInt(row["MetaScore"]) || null;

      if (title) {
        moviesToUpdate.push({ title, imdbRating, metaScore });
      }
    })
    .on("end", async () => {
      console.log(`Parsed ${moviesToUpdate.length} movies from CSV.`);

      for (const m of moviesToUpdate) {
        try {
          const updated = await prisma.movie.updateMany({
            where: { title: m.title },
            data: {
              imdbRating: m.imdbRating,
              metaScore: m.metaScore,
            },
          });

          if (updated.count > 0) {
            console.log(
              `Updated "${m.title}" -> IMDB: ${m.imdbRating}, MetaScore: ${m.metaScore}`
            );
          } else {
            console.log(`Movie not found in DB: "${m.title}"`);
          }
        } catch (err) {
          console.error(`Error updating "${m.title}":`, err);
        }
      }

      await prisma.$disconnect();
      console.log("All done!");
    })
    .on("error", (err) => {
      console.error("Error reading CSV:", err);
    });
}

updateRatings();
