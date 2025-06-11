import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationsDocumentoEmployee1749683747284 implements MigrationInterface {
    name = 'RelationsDocumentoEmployee1749683747284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_79168b6c01d01766f5b99dcd741"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "REL_79168b6c01d01766f5b99dcd74"`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_79168b6c01d01766f5b99dcd741" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_79168b6c01d01766f5b99dcd741"`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "REL_79168b6c01d01766f5b99dcd74" UNIQUE ("employeeId")`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_79168b6c01d01766f5b99dcd741" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
