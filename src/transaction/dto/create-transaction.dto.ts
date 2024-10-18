import { IsNumber, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsUUID()
  reference_id: string;
}
