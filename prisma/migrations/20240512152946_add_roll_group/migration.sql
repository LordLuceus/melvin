-- CreateTable
CREATE TABLE "RollGroup" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "userId" VARCHAR(20) NOT NULL,
    "guildId" VARCHAR(20) NOT NULL,

    CONSTRAINT "RollGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RollGroupToroll" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RollGroupToroll_AB_unique" ON "_RollGroupToroll"("A", "B");

-- CreateIndex
CREATE INDEX "_RollGroupToroll_B_index" ON "_RollGroupToroll"("B");

-- AddForeignKey
ALTER TABLE "RollGroup" ADD CONSTRAINT "RollGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RollGroup" ADD CONSTRAINT "RollGroup_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_RollGroupToroll" ADD CONSTRAINT "_RollGroupToroll_A_fkey" FOREIGN KEY ("A") REFERENCES "RollGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RollGroupToroll" ADD CONSTRAINT "_RollGroupToroll_B_fkey" FOREIGN KEY ("B") REFERENCES "roll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
