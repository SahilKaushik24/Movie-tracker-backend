import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const filePath = path.resolve(
  "/home/sahil/Downloads/archive/imdb-top-rated-movies-user-rated.csv"
);

async function importMovies() {
  try {
    console.log("Importing movies...");

    const movies = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          const title = row["Title"]?.trim();
          if (!title) return;

          movies.push({
            title,
            description: row["Description"]?.trim() || null,
            posterURL: row["Poster URL"]?.trim() || null,
            videoURL: row["Video URL"]?.trim() || null,
            imdbRating: row["IMDB Rating"]
              ? parseFloat(row["IMDB Rating"])
              : null,
            votes: row["Votes"]
              ? parseInt(row["Votes"].replace(/,/g, ""))
              : null,
            metaScore: row["MetaScore"] ? parseInt(row["MetaScore"]) : null,
            director: row["Director"]?.trim() || null,
            writers: row["Writers"]?.trim() || null,
            stars: row["Stars"]?.trim() || null,
            tags: row["Tags"]
              ? row["Tags"].split(",").map((t) => t.trim())
              : [],
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`📄 Parsed ${movies.length} movies`);

    for (const m of movies) {
      try {
        const movie = await prisma.movie.create({
          data: {
            title: m.title,
            description: m.description,
            posterURL: m.posterURL,
            videoURL: m.videoURL,
            imdbRating: m.imdbRating,
            votes: m.votes,
            metaScore: m.metaScore,
            director: m.director,
            writers: m.writers,
            stars: m.stars,
          },
        });

        for (const tag of [...new Set(m.tags)]) {
          const genre = await prisma.genre.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          });

          await prisma.movieGenre.upsert({
            where: {
              movieId_genreId: { movieId: movie.id, genreId: genre.id },
            },
            update: {},
            create: { movieId: movie.id, genreId: genre.id },
          });
        }
      } catch (err) {
        console.log(`⚠ Skipped duplicate movie: ${m.title}`);
      }
    }

    console.log("✅ Import finished!");
  } catch (err) {
    console.error("Error importing movies:", err);
  } finally {
    await prisma.$disconnect();
  }
}

await importMovies();
