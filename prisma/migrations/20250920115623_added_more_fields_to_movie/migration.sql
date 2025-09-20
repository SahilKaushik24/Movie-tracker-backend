/*
  Warnings:

  - You are about to drop the column `description` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "description",
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "posterPath" TEXT,
ADD COLUMN     "runtime" INTEGER;
