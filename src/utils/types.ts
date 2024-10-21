import { Account } from 'src/account/entities/account.entity';
import { Transaction } from 'src/account/entities/transaction.entity';

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  password: string;
  username: string;
  phone_number: string;
  account: IAccount;
  email: string;
  created_at: Date;
}

export interface IAccount {
  id: number;
  account_number: string;
  balance: number;
  sent_transactions: Transaction[];
  received_transactions: Transaction[];
  created_at: Date;
}

export interface ITransaction {
  id: number;
  amount: number;
  reference_id: string;
  sender: IAccount;
  receiver: IAccount;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum CacheKeys {
  GET_TRANSACTION_KEY = 'get:transactions',
  GET_USER_BALANCE = 'get:balance',
}

export interface ITransactions {
  transactions: Transaction[];
  totalTransactions: number;
  pages: number;
  page: number;
  limit: number;
}
