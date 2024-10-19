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
  amount: number;
  @IsNotEmpty()
  sender: Account;
  @IsNotEmpty()
  receiver: Account;
  @IsDateString()
  created_at: Date;
  @IsString()
  status: string;
  @IsUUID()
  reference_id: string;
  @IsString()
  transaction_type: string;
}
