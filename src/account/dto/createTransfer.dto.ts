import { IsNumber } from 'class-validator';

export class CreateTransferDto {
  @IsNumber()
  sender_id?: number;

  @IsNumber()
  recipient_id: number;

  @IsNumber()
  amount: number;
}
