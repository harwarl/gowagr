import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from './types/user.type';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Account } from 'src/account/entities/account.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SearchUserDto } from './dto/searchUser.dto';

@Injectable()
export class UserService {
  private userRepository: Repository<User>;
  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  /**
   * @description find user by email
   * @param email
   * @returns
   */
  async findUserByEmail(email: string): Promise<UserType> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
    return user;
  }

  /**
   * @description find User by Id
   * @param id
   * @returns
   */
  async findUserById(id: number): Promise<UserType> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    return this.userResponse(user);
  }

  /**
   * @description find User by email
   * @param username
   * @returns
   */
  async findUserByUsername(searchUserDto: SearchUserDto): Promise<UserType[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.first_name',
        'user.last_name',
        'user.phone_number',
      ])
      .where('user.username LIKE :username', {
        username: `${searchUserDto.username}%`,
      })
      .getMany();
    if (!users) {
      throw new NotFoundException('User Not found');
    }
    return users;
  }

  /**
   * @description creates a new user
   * @param createUserDto
   * @returns
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserType> {
    createUserDto.phone_number = this.adjustPhoneNumber(
      createUserDto.phone_number,
    );
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newAccount = await queryRunner.manager.save(Account, {
        account_number: this.getAccountNumber(createUserDto.phone_number),
        balance: 0.0,
      });
      const newUser = await queryRunner.manager.save(User, {
        ...createUserDto,
        account: newAccount,
      });
      await queryRunner.commitTransaction();
      return this.userResponse(newUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed:', error);
      if (error.code === '23505') {
        throw new ConflictException('Username / Phone number already exist');
      }
      throw new Error('Failed to create user and account');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description updates the users information
   * @param updateUserDto
   * @param currentUserId
   * @returns
   */
  async updateUser(
    updateUserDto: UpdateUserDto,
    currentUserId: number,
  ): Promise<UserType> {
    const user = await this.findUserById(currentUserId);
    if (!user) {
      throw new NotFoundException(`User with ID ${currentUserId} not found`);
    }
    await this.userRepository
      .createQueryBuilder('user')
      .update(User)
      .set(updateUserDto)
      .where('user.id = :id', { id: currentUserId })
      .execute();

    return this.findUserById(currentUserId);
  }

  /**
   * @description Get the User details with balance using the user Id
   * @param userId
   * @returns
   */
  async getUserDetailsWithBalance(userId: number): Promise<UserType> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.account', 'account')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userResponse(user);
  }

  /**
   * @description Converts phone number to +234 format
   * @param phoneNumber
   * @returns
   */
  adjustPhoneNumber(phoneNumber: string): string {
    //if phonenumber does not starts with 234
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+234' + phoneNumber.slice(1);
    }
    return phoneNumber;
  }

  /**
   * @description creates an account number for the user using their phone numbers
   * @param phoneNumber
   * @returns
   */
  getAccountNumber(phoneNumber: string): string {
    let account_number: string;
    if (!phoneNumber.startsWith('+')) {
      account_number = phoneNumber.slice(1);
    } else {
      account_number = phoneNumber.slice(4);
    }
    return account_number;
  }

  /**
   * @description cleans the user object by removing the password
   * @param user
   * @returns
   */
  userResponse(user: UserType): UserType {
    delete user.password;
    return user;
  }
}
