import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTransactionType1729375212862 implements MigrationInterface {
    name = 'RemoveTransactionType1729375212862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_type" character varying(6) NOT NULL`);
    }

}
