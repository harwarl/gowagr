import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  // @ApiProperty({
  //   description:
  //     'ID of the sender. Optional for transfers where the sender is inferred from the context.',
  //   example: 123,
  //   required: false,
  // })
  @IsNumber()
  @IsOptional()
  sender_id?: number;

  @ApiProperty({
    description: 'ID of the recipient. This is required for any transfer.',
    example: 456,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  recipient_account_number: string;

  @ApiProperty({
    description: 'The amount of money to transfer.',
    example: 100.5,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
