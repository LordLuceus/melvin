import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGuildAddGMChannel1682809414090 implements MigrationInterface {
    name = 'UpdateGuildAddGMChannel1682809414090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild" ADD "gmChannel" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "roll" DROP CONSTRAINT "FK_070cea5d3d74c77d89c10d3afd9"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_268c9c41599a74c789453b8f418"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "roll" DROP CONSTRAINT "FK_ccf7a0c45ed6b60227ad72792e9"`);
        await queryRunner.query(`ALTER TABLE "roll" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "roll" ADD "userId" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "roll" DROP COLUMN "guildId"`);
        await queryRunner.query(`ALTER TABLE "roll" ADD "guildId" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e"`);
        await queryRunner.query(`ALTER TABLE "guild" DROP CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3"`);
        await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "guild" ADD "id" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild" ADD CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_dacabc915cb73d02369d2d8d72e" PRIMARY KEY ("guildId")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_268c9c41599a74c789453b8f41"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD "userId" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_dacabc915cb73d02369d2d8d72e"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd" PRIMARY KEY ("guildId", "userId")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_268c9c41599a74c789453b8f418" PRIMARY KEY ("userId")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dacabc915cb73d02369d2d8d72"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP COLUMN "guildId"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD "guildId" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_268c9c41599a74c789453b8f418"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd" PRIMARY KEY ("userId", "guildId")`);
        await queryRunner.query(`CREATE INDEX "IDX_268c9c41599a74c789453b8f41" ON "user_guilds_guild" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dacabc915cb73d02369d2d8d72" ON "user_guilds_guild" ("guildId") `);
        await queryRunner.query(`ALTER TABLE "roll" ADD CONSTRAINT "FK_070cea5d3d74c77d89c10d3afd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roll" ADD CONSTRAINT "FK_ccf7a0c45ed6b60227ad72792e9" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_268c9c41599a74c789453b8f418" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "FK_268c9c41599a74c789453b8f418"`);
        await queryRunner.query(`ALTER TABLE "roll" DROP CONSTRAINT "FK_ccf7a0c45ed6b60227ad72792e9"`);
        await queryRunner.query(`ALTER TABLE "roll" DROP CONSTRAINT "FK_070cea5d3d74c77d89c10d3afd9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dacabc915cb73d02369d2d8d72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_268c9c41599a74c789453b8f41"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_268c9c41599a74c789453b8f418" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP COLUMN "guildId"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD "guildId" character varying(18) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_dacabc915cb73d02369d2d8d72" ON "user_guilds_guild" ("guildId") `);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_268c9c41599a74c789453b8f418"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd" PRIMARY KEY ("guildId", "userId")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_dacabc915cb73d02369d2d8d72e" PRIMARY KEY ("guildId")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD "userId" character varying(18) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_268c9c41599a74c789453b8f41" ON "user_guilds_guild" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" DROP CONSTRAINT "PK_dacabc915cb73d02369d2d8d72e"`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "PK_1ff217cdbcda40e548b011abcbd" PRIMARY KEY ("userId", "guildId")`);
        await queryRunner.query(`ALTER TABLE "guild" DROP CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3"`);
        await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "guild" ADD "id" character varying(18) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild" ADD CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_dacabc915cb73d02369d2d8d72e" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roll" DROP COLUMN "guildId"`);
        await queryRunner.query(`ALTER TABLE "roll" ADD "guildId" character varying(18)`);
        await queryRunner.query(`ALTER TABLE "roll" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "roll" ADD "userId" character varying(18)`);
        await queryRunner.query(`ALTER TABLE "roll" ADD CONSTRAINT "FK_ccf7a0c45ed6b60227ad72792e9" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" character varying(18) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_guilds_guild" ADD CONSTRAINT "FK_268c9c41599a74c789453b8f418" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roll" ADD CONSTRAINT "FK_070cea5d3d74c77d89c10d3afd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "gmChannel"`);
    }

}
