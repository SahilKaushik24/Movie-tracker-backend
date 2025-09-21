/*
  Warnings:

  - You are about to drop the column `posterPath` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "posterPath",
ADD COLUMN     "poster_path" TEXT;
