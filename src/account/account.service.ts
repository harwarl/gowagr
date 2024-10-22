import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from '../account/entities/transaction.entity';
import { UserService } from '../user/user.service';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { CacheKeys, ITransactions, TransactionStatus } from '../utils/types';
import { TransferQueryDto } from './dto/transferQuery.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AccountService {
  private accountRepository: Repository<Account>;
  private transactionRepository: Repository<Transaction>;

  constructor(
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.accountRepository = this.dataSource.getRepository(Account);
    this.transactionRepository = this.dataSource.getRepository(Transaction);
  }

  /**
   * @description Create a new Transfer
   * @param createTransferDto
   * @returns
   */
  async createTransfer(createTransferDto: CreateTransferDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the sender's Account using the sender's user ID.
      const sendersAccount: Account = await this.getAccountByUserId(
        createTransferDto.sender_id,
      );

      // Get the recipient Account using the recipient account number.
      const recipientAccount: Account = await this.accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.user', 'user')
        .where('account.account_number = :account_number', {
          account_number: createTransferDto.recipient_account_number,
        })
        .getOne();

      if (!recipientAccount) {
        throw new NotFoundException('Recipient account not found');
      }

      // Prevent self-transfer
      if (sendersAccount.account_number === recipientAccount.account_number) {
        throw new BadRequestException('You cannot transfer to yourself');
      }

      // Check if the sender has sufficient balance
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

      // Deduct amount from the sender and add to the recipient
      sendersAccount.balance =
        parseFloat(sendersAccount.balance.toString()) -
        createTransferDto.amount;

      recipientAccount.balance =
        parseFloat(recipientAccount.balance.toString()) +
        createTransferDto.amount;

      // Update sender and recipient accounts
      await queryRunner.manager.update(
        Account,
        { id: sendersAccount.id },
        { balance: sendersAccount.balance },
      );
      await queryRunner.manager.update(
        Account,
        { id: recipientAccount.id },
        { balance: recipientAccount.balance },
      );

      // Invalidate caches
      const cacheKey = `account_${createTransferDto.sender_id}`;
      await this.cacheManager.del(cacheKey);

      // Save the successful transaction
      const transaction = await this.createTransaction({
        sender: sendersAccount,
        receiver: recipientAccount,
        status: TransactionStatus.COMPLETED,
        reference_id: uuidv4(),
        amount: createTransferDto.amount,
        created_at: new Date(),
      });

      // Commit the transaction
      await queryRunner.commitTransaction();
      return { success: true, transaction };
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      console.log('Transfer Failed:', error.message);
      throw error;
    } finally {
      // Release the queryRunner after transaction completes or fails
      await queryRunner.release();
    }
  }

  /**
   * @description gets the user Transactions
   * @param userId
   * @param query
   * @returns
   */
  async getUserTransactions(
    userId: number,
    query?: TransferQueryDto,
  ): Promise<ITransactions> {
    const { page = 1, limit = 10, filters } = query || {};

    // Get User Account
    const userAccount = await this.getAccountByUserId(userId);
    if (!userAccount) {
      throw new NotFoundException('User Account not found');
    }

    // Construct cache key
    const cacheKey = `${CacheKeys.GET_TRANSACTION_KEY}_${userId}_${page}_${limit}_${JSON.stringify(filters)}`;

    // Attempt to retrieve cached value
    const cachedValue = await this.cacheManager.get<ITransactions>(cacheKey);

    if (cachedValue) {
      return cachedValue;
    }

    // Start Query
    const transactionQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.sender', 'sender')
      .leftJoinAndSelect('transaction.receiver', 'receiver')
      .where('sender.id = :accountId OR receiver.id = :accountId', {
        accountId: userAccount.id,
      });

    // Apply filters
    if (filters) {
      const { status, startDate, endDate } = filters;

      if (status) {
        transactionQuery.andWhere('transaction.status = :status', { status });
      }

      if (startDate) {
        transactionQuery.andWhere('transaction.created_at >= :startDate', {
          startDate,
        });
      }

      if (endDate) {
        transactionQuery.andWhere('transaction.created_at <= :endDate', {
          endDate,
        });
      }
    }

    // Pagination
    const [transactions, totalTransactions] = await transactionQuery
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.created_at', 'DESC')
      .getManyAndCount();

    // Cache the result before returning
    const result = {
      transactions,
      totalTransactions,
      pages: Math.ceil(totalTransactions / limit),
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 60 * 1);
    return result;
  }

  /**
   * @description gets the user account using the user Id
   * @param userId
   * @returns
   */
  async getAccountByUserId(userId: number): Promise<any> {
    // Create a cache key
    const cacheKey = `account_${userId}`;

    const cachedAccount = await this.cacheManager.get(cacheKey);
    if (cachedAccount) {
      return cachedAccount;
    }

    // If not in cache, query the database
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .where('account.userId = :userId', { userId })
      .getOne();

    if (!account) {
      throw new NotFoundException(`Account for User Id ${userId} not found`);
    }

    // Cache the account before returning
    await this.cacheManager.set(cacheKey, account, 10);

    return account;
  }

  /**
   * @description creates and saves a transaction
   * @param createTransactionDto
   * @returns
   */
  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.save(createTransactionDto);
  }
}
