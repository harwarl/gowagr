import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransferDto {
  @IsNumber()
  @IsOptional()
  sender_id?: number;

  @IsNumber()
  @IsNotEmpty()
  recipient_id: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
