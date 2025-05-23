import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748016042452 implements MigrationInterface {
    name = 'Init1748016042452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "departments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "abreviation" character varying(10), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employees_gender_enum" AS ENUM('Femenino', 'Masculino')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_nacionality_enum" AS ENUM('Mexicana', 'Extranjera')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'PERMISSION')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_blood_type_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_status_civil_enum" AS ENUM('Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Separado/a', 'Concubino/a')`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "names" character varying(100) NOT NULL, "first_last_name" character varying(100) NOT NULL, "second_last_name" character varying(100), "date_birth" date NOT NULL, "year_old" integer NOT NULL DEFAULT '0', "email" character varying(100) NOT NULL, "telephone" character varying(15), "address" character varying(200), "gender" "public"."employees_gender_enum" NOT NULL, "curp" character varying(18) NOT NULL, "rfc" character varying(13) NOT NULL, "nss" character varying(11) NOT NULL, "ine_number" character varying(13) NOT NULL, "alergy" character varying(200), "emergency_contact" json, "nacionality" "public"."employees_nacionality_enum" NOT NULL DEFAULT 'Mexicana', "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ACTIVE', "blood_type" "public"."employees_blood_type_enum", "status_civil" "public"."employees_status_civil_enum", "position_id" integer NOT NULL, CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "REL_8b14204e8af5e371e36b8c11e1" UNIQUE ("position_id"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "positions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "available" boolean NOT NULL DEFAULT true, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "salary" money NOT NULL, "salary_in_words" character varying(100), "departmentIdId" integer, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_8b14204e8af5e371e36b8c11e1b" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_fcd10472f9672df7c0ab8d77f88" FOREIGN KEY ("departmentIdId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_fcd10472f9672df7c0ab8d77f88"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_8b14204e8af5e371e36b8c11e1b"`);
        await queryRunner.query(`DROP TABLE "positions"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TYPE "public"."employees_status_civil_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_blood_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_nacionality_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_gender_enum"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
