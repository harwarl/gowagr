import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../account/entities/account.entity';
import { Transaction } from '../../account/entities/transaction.entity';
import { User } from '../../user/entities/user.entity';

export const TypeOrmPGTestingModule = () => [
  TypeOrmModule.forRoot({
    type: 'postgres',
    database: 'memory',
    dropSchema: true,
    entities: [User, Account, Transaction],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([User, Account, Transaction]),
];
