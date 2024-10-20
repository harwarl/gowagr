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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getUserBalance(
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserType> {
    return await this.userService.getUserDetailsWithBalance(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('')
  async searchUserByUsername(
    @Query('username') username: string,
  ): Promise<UserType[]> {
    return await this.userService.findUserByUsername(username);
  }

  // @Get('test')
  // testEndpoint() {
  //   return { ping: 'Pong' };
  // }
}
