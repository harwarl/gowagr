import { IsOptional, IsInt, Min } from 'class-validator';
import { TransactionStatus } from 'src/utils/types';

export class TransferQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page number must be at least 1' })
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @IsOptional()
  filters?: {
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
  };
}
