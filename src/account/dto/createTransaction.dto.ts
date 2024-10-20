import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Account } from '../entities/account.entity';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  sender: Account;

  @IsNotEmpty()
  receiver: Account;

  @IsDateString()
  @IsNotEmpty()
  created_at: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsUUID()
  @IsNotEmpty()
  reference_id: string;
}
