import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocuments1748642938826 implements MigrationInterface {
    name = 'AddDocuments1748642938826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "type_document" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" character varying(100) NOT NULL, CONSTRAINT "PK_a89fb9f22e15824ce89c11c5a1b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "url_file" text NOT NULL, "size" integer DEFAULT '0', "name" character varying(100) NOT NULL, "typeId" integer, "employeeId" integer, CONSTRAINT "REL_79168b6c01d01766f5b99dcd74" UNIQUE ("employeeId"), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_223b99e6db415bac3c9e04f1e5a" FOREIGN KEY ("typeId") REFERENCES "type_document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_79168b6c01d01766f5b99dcd741" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_79168b6c01d01766f5b99dcd741"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_223b99e6db415bac3c9e04f1e5a"`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`DROP TABLE "type_document"`);
    }

}
