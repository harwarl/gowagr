import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserType } from './types/user.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from './decorators/currentUser.decorator';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBalance(
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserType> {
    return await this.userService.getUserDetailsWithBalance(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchUserByUsername(
    @Query('username') username: string,
  ): Promise<UserType[]> {
    return await this.userService.findUserByUsername(username);
  }
}
