/*
  Warnings:

  - You are about to drop the column `status` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MovieGenre` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[movieId,genreId]` on the table `MovieGenre` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Genre" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "public"."MovieGenre" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
DROP COLUMN "role";

-- AlterTable
ALTER TABLE "public"."Watched" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "public"."Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MovieGenre_movieId_genreId_key" ON "public"."MovieGenre"("movieId", "genreId");
