import { Account } from '../../account/entities/account.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'uuid',
  })
  reference_id: string;

  @ManyToOne(() => Account, (account) => account.sent_transactions)
  sender: Account;

  @ManyToOne(() => Account, (account) => account.recieved_transactions)
  receiver: Account;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;
}
