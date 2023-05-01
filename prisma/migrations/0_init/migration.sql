-- CreateTable
CREATE TABLE "guild" (
    "id" VARCHAR(20) NOT NULL,
    "gmChannel" VARCHAR(20),

    CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roll" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "userId" VARCHAR(20),
    "guildId" VARCHAR(20),

    CONSTRAINT "PK_91319c8ec656321a667986a83c7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(20) NOT NULL,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_guilds_guild" (
    "userId" VARCHAR(20) NOT NULL,
    "guildId" VARCHAR(20) NOT NULL,

    CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd" PRIMARY KEY ("userId","guildId")
);

-- CreateIndex
CREATE INDEX "IDX_268c9c41599a74c789453b8f41" ON "user_guilds_guild"("userId");

-- CreateIndex
CREATE INDEX "IDX_dacabc915cb73d02369d2d8d72" ON "user_guilds_guild"("guildId");

-- AddForeignKey
ALTER TABLE "roll" ADD CONSTRAINT "FK_070cea5d3d74c77d89c10d3afd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roll" ADD CONSTRAINT "FK_ccf7a0c45ed6b60227ad72792e9" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_268c9c41599a74c789453b8f418" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

