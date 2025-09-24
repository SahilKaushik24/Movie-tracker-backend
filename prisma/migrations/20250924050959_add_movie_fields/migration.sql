/*
  Warnings:

  - You are about to drop the column `rating` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "rating",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imdbRating" DOUBLE PRECISION,
ADD COLUMN     "videoURL" TEXT;
