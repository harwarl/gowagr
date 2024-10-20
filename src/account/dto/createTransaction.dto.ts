import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Account } from '../entities/account.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The amount of the transaction',
    example: 100.0,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'The sender account information',
    type: () => Account,
  })
  @IsNotEmpty()
  sender: Account;

  @ApiProperty({
    description: 'The receiver account information',
    type: () => Account,
  })
  @IsNotEmpty()
  receiver: Account;

  @ApiProperty({
    description: 'The date and time when the transaction was created',
    example: '2023-10-20T12:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty({
    description: 'The current status of the transaction',
    example: 'COMPLETED',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'A unique identifier for the transaction reference',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  reference_id: string;
}
