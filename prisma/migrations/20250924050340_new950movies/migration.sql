/*
  Warnings:

  - You are about to drop the column `budget` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster_path` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseYear` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "budget",
DROP COLUMN "language",
DROP COLUMN "overview",
DROP COLUMN "poster_path",
DROP COLUMN "releaseDate",
DROP COLUMN "releaseYear",
DROP COLUMN "runtime",
ADD COLUMN     "metaScore" INTEGER,
ADD COLUMN     "posterURL" TEXT,
ADD COLUMN     "stars" TEXT,
ADD COLUMN     "votes" INTEGER,
ADD COLUMN     "writers" TEXT;
