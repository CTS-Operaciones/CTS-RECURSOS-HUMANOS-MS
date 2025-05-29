import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalary1748548761736 implements MigrationInterface {
    name = 'AddSalary1748548761736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_fcd10472f9672df7c0ab8d77f88"`);
        await queryRunner.query(`CREATE TABLE "salary" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "amount" money NOT NULL, "salary_in_words" character varying(100) NOT NULL, CONSTRAINT "PK_3ac75d9585433a6264e618a6503" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "salary_in_words"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "departmentIdId"`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "salaryId" integer`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "departmentId" integer`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_62824c8d2533250af8ef22ee13d" FOREIGN KEY ("salaryId") REFERENCES "salary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_bfd9f2db257475ee3a759cfcff6" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_bfd9f2db257475ee3a759cfcff6"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_62824c8d2533250af8ef22ee13d"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "departmentId"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "salaryId"`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "departmentIdId" integer`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "salary_in_words" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "salary" money NOT NULL`);
        await queryRunner.query(`DROP TABLE "salary"`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_fcd10472f9672df7c0ab8d77f88" FOREIGN KEY ("departmentIdId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
