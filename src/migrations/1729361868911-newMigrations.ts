import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1729361868911 implements MigrationInterface {
    name = 'NewMigrations1729361868911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "transaction_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "transaction_type" character varying(6) NOT NULL`);
    }

}
