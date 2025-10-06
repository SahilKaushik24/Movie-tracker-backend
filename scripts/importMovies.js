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
    console.log("📄 Reading CSV...");

    const movies = [];
    const genresSet = new Set();

    // Step 1: Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          const title = row["Title"]?.trim();
          if (!title) return;

          const movieTags = row["Tags"]
            ? row["Tags"].split(",").map((t) => t.trim())
            : [];

          movieTags.forEach((t) => genresSet.add(t));

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
            tags: movieTags,
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(
      `✅ Parsed ${movies.length} movies and ${genresSet.size} unique genres`
    );

    // Step 2: Insert genres first
    const genresArray = Array.from(genresSet).map((name) => ({ name }));
    await prisma.genre.createMany({
      data: genresArray,
      skipDuplicates: true, // avoid duplicate inserts
    });

    const allGenres = await prisma.genre.findMany();
    const genreMap = {};
    allGenres.forEach((g) => (genreMap[g.name] = g.id));

    // Step 3: Insert movies in bulk
    const moviesData = movies.map((m) => ({
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
    }));

    await prisma.movie.createMany({
      data: moviesData,
      skipDuplicates: true,
    });

    const allMovies = await prisma.movie.findMany();
    const movieMap = {};
    allMovies.forEach((m) => (movieMap[m.title] = m.id));

    // Step 4: Insert movie-genre relations
    const movieGenresData = [];
    movies.forEach((m) => {
      const movieId = movieMap[m.title];
      if (!movieId) return;

      m.tags.forEach((tag) => {
        const genreId = genreMap[tag];
        if (!genreId) return;
        movieGenresData.push({ movieId, genreId });
      });
    });

    // Remove duplicates
    const uniqueMovieGenres = Array.from(
      new Map(
        movieGenresData.map((x) => [`${x.movieId}_${x.genreId}`, x])
      ).values()
    );

    await prisma.movieGenre.createMany({
      data: uniqueMovieGenres,
      skipDuplicates: true,
    });

    console.log("🎬 All movies and genres imported successfully!");
  } catch (err) {
    console.error("Error importing movies:", err);
  } finally {
    await prisma.$disconnect();
  }
}

await importMovies();
