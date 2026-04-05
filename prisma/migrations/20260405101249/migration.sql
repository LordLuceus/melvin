-- AlterTable
ALTER TABLE "_RollGroupToroll" ADD CONSTRAINT "_RollGroupToroll_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RollGroupToroll_AB_unique";

-- AlterTable
ALTER TABLE "_guildTouser" ADD CONSTRAINT "_guildTouser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_guildTouser_AB_unique";
