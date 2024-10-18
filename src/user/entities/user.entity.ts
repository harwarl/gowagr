import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from 'src/account/entities/account.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: '',
    type: 'varchar',
    length: 45,
  })
  first_name: string;

  @Column({
    default: '',
    type: 'varchar',
    length: 45,
  })
  last_name: string;

  @Column({ type: 'varchar', length: 45 })
  email: string;

  @Column({ type: 'varchar', length: 45 })
  password: string;

  @Column({ type: 'varchar', unique: true, length: 20 })
  username: string;

  @Column({ type: 'varchar', length: 13 })
  phone_number: string;

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
