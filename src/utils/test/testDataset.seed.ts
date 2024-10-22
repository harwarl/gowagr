import { getConnection } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Account } from '../../account/entities/account.entity';
import { Transaction } from '../../account/entities/transaction.entity';
import { v4 as uuidv4 } from 'uuid';

export const testDatasetSeed = async () => {
  const connection = await getConnection();
  const entityManager = connection.createEntityManager();

  const users = await entityManager.save(User, [
    {
      first_name: 'Ade',
      last_name: 'olu',
      username: 'AdeOlu',
      password: 'AdeOlu@2131',
      email: 'Adeolu@gmail.com',
      phone_number: '+2348173432322',
      created_at: new Date(),
    },
    {
      first_name: 'Akin',
      last_name: 'Smith',
      username: 'AkinSmith',
      password: 'AkinSmith@2131',
      email: 'akin.smith@gmail.com',
      phone_number: '+2348123456789',
      created_at: new Date(),
    },
    {
      first_name: 'Zainab',
      last_name: 'Abubakar',
      username: 'ZainabA',
      password: 'ZainabA@2131',
      email: 'zainab.abubakar@gmail.com',
      phone_number: '+2348109876543',
      created_at: new Date(),
    },
  ]);

  const accounts = [];
  for (const user of users) {
    accounts.push(
      await entityManager.save(Account, {
        account_number: `${user.phone_number.substring(4)}`,
        balance: 5000,
        user,
        created_at: new Date(),
      }),
    );
  }

  const transactions = [];
  for (let i = 0; i < 5; i++) {
    const sender = accounts[Math.floor(Math.random() * accounts.length)];
    const receiver = accounts[Math.floor(Math.random() * accounts.length)];

    if (sender.id !== receiver.id) {
      transactions.push(
        await entityManager.save(Transaction, {
          reference_id: uuidv4(),
          sender,
          receiver,
          amount: Math.floor(Math.random() * 1000) + 100,
          status: 'COMPLETED',
          created_at: new Date(),
        }),
      );
    }
  }
};
