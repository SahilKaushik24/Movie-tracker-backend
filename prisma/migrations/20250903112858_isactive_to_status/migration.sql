/*
  Warnings:

  - You are about to drop the column `isActive` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "isActive",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
