import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from './types/user.type';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Account } from '../account/entities/account.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SearchUserDto } from './dto/searchUser.dto';
import { IUserResponse } from '../utils/types';

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
   * @returns user
   */
  async findUserById(id: number): Promise<UserType> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    delete user.password;

    return user;
  }

  /**
   * @description find User by email
   * @param username
   * @returns user
   */
  async findUserByUsername(
    searchUserDto: SearchUserDto,
  ): Promise<IUserResponse> {
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
    return {
      success: true,
      user: users,
    };
  }

  /**
   * @description creates a new user
   * @param createUserDto
   * @returns user details
   */
  async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
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
   * @returns user
   */
  async updateUser(
    updateUserDto: UpdateUserDto,
    currentUserId: number,
  ): Promise<IUserResponse> {
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

    const updatedUser = await this.findUserById(currentUserId);

    return this.userResponse(updatedUser);
  }

  /**
   * @description Get the User details with balance using the user Id
   * @param userId
   * @returns UserWithAccountBalance
   */
  async getUserDetailsWithBalance(userId: number): Promise<IUserResponse> {
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
   * @returns adjustedPhoneNumber +2349122323233
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
   * @returns account_number
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
   * @returns IUserReponse
   */
  userResponse(user: UserType): IUserResponse {
    delete user.password;
    return { success: true, user };
  }
}
