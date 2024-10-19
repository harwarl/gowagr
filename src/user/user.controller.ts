import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserType } from './types/user.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from './decorators/currentUser.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserBalance(
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserType> {
    return await this.userService.getUserDetailsWithBalance(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async searchUserByUsername(
    @Query('username') username: string,
  ): Promise<UserType[]> {
    return await this.userService.findUserByUsername(username);
  }

  @Get('test')
  testEndpoint() {
    return { ping: 'Pong' };
  }
}
