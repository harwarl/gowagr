import { TransactionStatus } from 'src/utils/types';

export class TransferQueryDto {
  page?: number;
  limit?: number;
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}
