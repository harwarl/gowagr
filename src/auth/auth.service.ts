import { BadRequestException, Injectable } from '@nestjs/common';
import { UserType } from 'src/user/types/user.type';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IAuthResponse, IUserResponse } from 'src/utils/types';

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid Credentials');
    }

    return this.userService.userResponse(user);
  }

  async register(createUserDto: CreateUserDto): Promise<IAuthResponse> {
    const user: UserType = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    const newUser: IUserResponse =
      await this.userService.createUser(createUserDto);
    return this.login(newUser.user);
  }

  async login(user: any): Promise<IAuthResponse> {
    const payload = { email: user.email, id: user.id };
    return this.authResponse(this.getToken(payload));
  }

  getToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  authResponse(access_token: string): IAuthResponse {
    return {
      success: true,
      access_token,
    };
  }
}
