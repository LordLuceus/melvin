/*
  Warnings:

  - You are about to drop the `user_guilds_guild` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropForeignKey
ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_268c9c41599a74c789453b8f418";

-- DropForeignKey
ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e";

-- RenameTable
ALTER TABLE "user_guilds_guild" RENAME TO "user_guilds_guild_old";

-- CreateTable
CREATE TABLE "_guildTouser" (
    "A" VARCHAR(20) NOT NULL,
    "B" VARCHAR(20) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_guildTouser_AB_unique" ON "_guildTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_guildTouser_B_index" ON "_guildTouser"("B");

-- AddForeignKey
ALTER TABLE "_guildTouser" ADD CONSTRAINT "_guildTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_guildTouser" ADD CONSTRAINT "_guildTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy data from old table to new table
INSERT INTO "_guildTouser" ("A", "B")
SELECT "guildId", "userId" FROM "user_guilds_guild_old";

-- Drop the old table
DROP TABLE "user_guilds_guild_old";
