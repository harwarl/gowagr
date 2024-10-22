import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { testDatasetSeed } from '../utils/test/testDataset.seed';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AccountService', () => {
  let accountService: AccountService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn().mockImplementation((entity) => {
              return {
                save: jest.fn(),
                findOne: jest.fn(),
                createQueryBuilder: jest.fn(),
              };
            }),
            createQueryRunner: jest.fn().mockImplementation(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
            })),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    accountService = module.get<AccountService>(AccountService);
    dataSource = module.get<DataSource>(DataSource);

    await testDatasetSeed();
  });

  describe('createTransfer', () => {
    it('should successfully transfer funds', async () => {
      const transferDto: CreateTransferDto = {
        sender_id: 1,
        recipient_account_number: '9876543210',
        amount: 500,
      };

      const result = await accountService.createTransfer(transferDto);

      expect(result).toHaveProperty('success', true);
      expect(result.transaction).toBeDefined();
      expect(result.transaction.status).toBe('COMPLETED');
    });

    it('should throw an error for insufficient balance', async () => {
      const transferDto: CreateTransferDto = {
        sender_id: 1,
        recipient_account_number: '9876543210',
        amount: 10000,
      };

      await expect(accountService.createTransfer(transferDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the recipient account is not found', async () => {
      const transferDto: CreateTransferDto = {
        sender_id: 1,
        recipient_account_number: '9872398739',
        amount: 500,
      };

      await expect(accountService.createTransfer(transferDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if the sender tries to transfer to themselves', async () => {
      const transferDto: CreateTransferDto = {
        sender_id: 1,
        recipient_account_number: '1234567890',
        amount: 500,
      };

      await expect(accountService.createTransfer(transferDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserTransactions', () => {
    it('should retrieve user transactions', async () => {
      const transactions = await accountService.getUserTransactions(1);
      expect(transactions).toBeDefined();
      expect(transactions).toHaveProperty('transactions');
      expect(transactions.transactions.length).toBeGreaterThan(0);
    });

    it('should throw an error if the user account is not found', async () => {
      await expect(accountService.getUserTransactions(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAccountByUserId', () => {
    it('should return an account for a valid user ID', async () => {
      const account = await accountService.getAccountByUserId(1);
      expect(account).toBeDefined();
      expect(account).toHaveProperty('id', 1);
    });

    it('should throw an error for an invalid user ID', async () => {
      await expect(accountService.getAccountByUserId(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
