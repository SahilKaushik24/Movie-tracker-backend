-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "releaseDate" TIMESTAMP(3),
ALTER COLUMN "releaseYear" DROP NOT NULL;
