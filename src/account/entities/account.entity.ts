import { Transaction } from '../../transaction/entities/transaction.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  account_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @OneToOne(() => User, (user) => user.account)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sent_transactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.receiver)
  recieved_transactions: Transaction[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
