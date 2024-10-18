import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../user/entities/user.entity';

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