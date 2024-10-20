import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from 'src/account/entities/transaction.entity';
import { UserService } from 'src/user/user.service';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionStatus, TransactionType } from 'src/utils/types';
import { TransferQueryDto } from './dto/transferQuery.dto';

@Injectable()
export class AccountService {
  private accountRepository: Repository<Account>;
  private transactionRepository: Repository<Transaction>;
  constructor(
    private dataSource: DataSource,
    private userService: UserService,
  ) {
    this.accountRepository = this.dataSource.getRepository(Account);
    this.transactionRepository = this.dataSource.getRepository(Transaction);
  }

  async createTransfer(createTransferDto: CreateTransferDto): Promise<any> {
    if (createTransferDto.sender_id === createTransferDto.recipient_id) {
      throw new BadRequestException('You can transfer to yourself');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the senders Account.
      const sendersAccount = await this.getAccountByUserId(
        createTransferDto.sender_id,
      );

      // Get the recipient Account.
      const recipientAccount = await this.getAccountByUserId(
        createTransferDto.recipient_id,
      );

      //   check if the sender has sufficient Balance and save a failed transaction
      if (sendersAccount.balance < createTransferDto.amount) {
        await this.createTransaction({
          sender: sendersAccount,
          receiver: recipientAccount,
          status: TransactionStatus.FAILED,
          reference_id: uuidv4(),
          amount: createTransferDto.amount,
          created_at: new Date(),
        });
        throw new BadRequestException('Insufficient Balance');
      }

      //Deduct Amount from the sender
      sendersAccount.balance -= createTransferDto.amount;

      //Add Amount to the recipient
      recipientAccount.balance =
        parseFloat(recipientAccount.balance) + createTransferDto.amount;

      //update the senders Account
      await queryRunner.manager.update(
        Account,
        { id: sendersAccount.balance },
        {
          balance: sendersAccount.balance,
        },
      );

      // Update the recipient balance
      await queryRunner.manager.update(
        Account,
        { id: recipientAccount.id },
        {
          balance: recipientAccount.balance,
        },
      );

      //save the transaction
      const transaction = await this.createTransaction({
        sender: sendersAccount,
        receiver: recipientAccount,
        status: TransactionStatus.COMPLETED,
        reference_id: uuidv4(),
        amount: createTransferDto.amount,
        created_at: new Date(),
      });

      // commit the transaction
      await queryRunner.commitTransaction();
      return { success: true, transaction };
    } catch (error) {
      //rollback the transaction
      await queryRunner.rollbackTransaction();
      console.log('Transfer Failed:', error);
      throw new Error(`Failed to execute transaction`);
    } finally {
      await queryRunner.release();
    }
  }

  //Get User Transactions
  async getAccountTransactions(
    userId: number,
    query: TransferQueryDto,
  ): Promise<any> {
    let page = query?.page || 1;
    let limit = query?.limit || 10;

    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.sent_transactions', 'sent_transaction')
      .leftJoinAndSelect(
        'account.recieved_transactions',
        'received_transaction',
      )
      .where('account.userId = :userId', { userId })
      .getOne();

    if (!account) {
      throw new NotFoundException(`Account not found for userId: ${userId}`);
    }

    let transactions = [
      ...account.sent_transactions.map((transaction) => {
        return { ...transaction, transaction_type: TransactionType.DEBIT };
      }),
      ...account.recieved_transactions.map((transaction) => {
        return { ...transaction, transaction_type: TransactionType.CREDIT };
      }),
    ].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    let totalTransactions = transactions.length;

    //Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    delete account.sent_transactions;
    delete account.recieved_transactions;

    return {
      ...account,
      transactions: paginatedTransactions,
      totalTransactions: totalTransactions,
      pages: Math.ceil(totalTransactions / limit),
      page,
      limit,
    };
  }

  async getUserTransactions(
    userId: number,
    query?: TransferQueryDto,
  ): Promise<any> {
    let page = query?.page || 1;
    let limit = query?.limit || 10;
    let filters = query?.filters;

    //Get User Account
    const userAccount = await this.getAccountByUserId(userId);
    if (!userAccount) {
      throw new NotFoundException('User Account not found');
    }

    console.log(userAccount);

    const transactionQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.sender', 'sender')
      .leftJoinAndSelect('transaction.receiver', 'receiver')
      .where('sender.id = :accountId OR receiver.id = :accountId', {
        accountId: userAccount.id,
      });

    if (query) {
    }

    const [transactions, totalTransactions] = await transactionQuery
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.created_at', 'DESC')
      .getManyAndCount();

    return {
      transactions: transactions,
      totalTransactions: totalTransactions,
      pages: Math.ceil(totalTransactions / limit),
      page,
      limit,
    };
  }

  //Get UserID get user Account
  async getAccountByUserId(userId: number): Promise<any> {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .where('account.userId = :userId', { userId })
      .getOne();

    if (!account) {
      throw new NotFoundException(`Account for User Id ${userId} not found`);
    }
    return account;
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.save(createTransactionDto);
  }

  accountReponse(account: Account) {
    return {
      success: true,
      account,
    };
  }
}
