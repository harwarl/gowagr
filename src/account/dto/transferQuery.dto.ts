import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from 'src/utils/types';

export class TransferQueryDto {
  @ApiProperty({
    description: 'Page number for pagination, must be at least 1',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page number must be at least 1' })
  page?: number;

  @ApiProperty({
    description: 'Limit for the number of results per page, must be at least 1',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @ApiProperty({
    description: 'Optional filters for the transaction search',
    example: {
      status: 'completed || failed',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    required: false,
  })
  @IsOptional()
  filters?: {
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
  };
}
