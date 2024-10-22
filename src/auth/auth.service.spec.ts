import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TypeOrmPGTestingModule } from 'src/utils/test/TypeOrmPGTestingModule';
import { testDatasetSeed } from 'src/utils/test/testDataset.seed';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService],
      imports: [...TypeOrmPGTestingModule()],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    await testDatasetSeed();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate and return the user if credentials are correct', async () => {
      const mockUser = {
        id: 1,
        password: await bcrypt.hash('Adeolu@2341', 10),
        first_name: 'Ade',
        last_name: 'olu',
        username: 'AdeOlu',
        email: 'Adeolu@gmail.com',
        phone_number: '08173432322',
        created_at: new Date(),
        account: {
          id: 1,
          account_number: '123456789',
          balance: 1000,
          user: null,
          sent_transactions: [],
          recieved_transactions: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await authService.validateUser(
        'Adeolu@gmail.com',
        'Adeolu@2341',
      );

      expect(result.success).toBe(true);
      expect(result).toEqual({
        success: true,
        user: {
          id: mockUser.id,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          username: mockUser.username,
          email: mockUser.email,
          phone_number: mockUser.phone_number,
          created_at: mockUser.created_at,
          account: mockUser.account,
        },
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return JWT token', async () => {
      const createUserDto = {
        first_name: 'AkinOlu',
        last_name: 'Emmanuel',
        email: 'geegees@gmail.com',
        username: 'AdeAkin',
        password: 'AdeAkinTheMan',
        phone_number: '08131121212',
      };

      const mockCreatedUser = {
        id: 2,
        first_name: 'AkinOlu',
        last_name: 'Emmanuel',
        email: 'geegees@gmail.com',
        username: 'AdeAkin',
        password: 'AdeAkinTheMan',
        phone_number: '08131121212',
        created_at: new Date(),
        account: {
          id: 2,
          account_number: '123456789',
          balance: 1000,
          user: null,
          sent_transactions: [],
          recieved_transactions: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      const mockCreatedResponse = {
        success: true,
        user: mockCreatedUser,
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);
      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(mockCreatedResponse);
      jest.spyOn(jwtService, 'sign').mockReturnValue('signed-token');

      const result = await authService.register(createUserDto);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed-token');
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto = {
        first_name: 'AkinOlu',
        last_name: 'Emmanuel',
        email: 'geegees@gmail.com',
        username: 'AdeAkin',
        password: 'AdeAkinTheMan',
        phone_number: '08131121212',
      };

      const mockExistingUser = {
        id: 2,
        first_name: 'AkinOlu',
        last_name: 'Emmanuel',
        email: 'geegees@gmail.com',
        username: 'AdeAkin',
        password: await bcrypt.hash('AdeAkinTheMan', 10),
        phone_number: '08131121212',
        created_at: new Date(),
        account: {
          id: 2,
          account_number: '123456789',
          balance: 1000,
          user: null,
          sent_transactions: [],
          recieved_transactions: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockExistingUser);

      await expect(authService.register(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
    });
  });

  describe('login', () => {
    it('should return JWT token for valid user', async () => {
      const mockUser = {
        id: 1,
        email: 'Adeolu@gmail.com',
        password: 'hashedPassword',
      };

      jest.spyOn(jwtService, 'sign').mockReturnValue('signed-token');

      const result = await authService.login(mockUser);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed-token');
    });
  });
});
