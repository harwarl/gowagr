import { BadRequestException, Injectable } from '@nestjs/common';
import { UserType } from 'src/user/types/user.type';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user: UserType = await this.userService.findUserByEmail(username);
    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }

    const isPasswordValid = await bcrypt.compare(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid Credentials');
    }

    return this.userService.userResponse(user);
  }

  async register(createUserDto: CreateUserDto): Promise<UserType> {
    const user: UserType = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    const newUser: UserType = await this.userService.createUser(createUserDto);
    return newUser;
  }

  async login(user: any) {
    const payload = { email: user.email, id: user.id };
    return this.getToken(payload);
  }

  getToken(payload: any) {
    return this.jwtService.sign(payload);
  }
}
