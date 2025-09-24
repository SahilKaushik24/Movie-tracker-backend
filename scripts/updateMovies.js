import fetch from "node-fetch";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

function extractImdbId(posterUrl) {
  const match = posterUrl.match(/tt\d+/);
  return match ? match[0] : null;
}

async function fetchMovieFromOMDB(imdbID) {
  const apiKey = process.env.OMDB_API_KEY;
  const url = `http://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
  const res = await fetch(url);
  return res.json();
}

async function updateMovies() {
  const movies = await prisma.movie.findMany();

  for (const movie of movies) {
    const imdbID = extractImdbId(movie.poster || movie.videoURL || "");
    if (!imdbID) {
      console.log(`No IMDb ID found for ${movie.title}`);
      continue;
    }

    const movieData = await fetchMovieFromOMDB(imdbID);

    if (!movieData || movieData.Response === "False") {
      console.log(`Skipping ${movie.title}, not found in OMDb`);
      continue;
    }

    const imdbRating =
      movieData.imdbRating && movieData.imdbRating !== "N/A"
        ? parseFloat(movieData.imdbRating)
        : null;

    const metaScore =
      movieData.Metascore && movieData.Metascore !== "N/A"
        ? parseInt(movieData.Metascore)
        : null;

    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        imdbRating,
        metaScore,
      },
    });

    console.log(
      `Updated ${movie.title}: imdbRating=${imdbRating}, metaScore=${metaScore}`
    );
  }
}

updateMovies()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
