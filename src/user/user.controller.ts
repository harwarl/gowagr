import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UserType } from './types/user.type';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from './decorators/currentUser.decorator';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SearchUserDto } from './dto/searchUser.dto';
import { BackendValidationPipe } from '../utils/pipes/backendValidation.pipes';
import { IUserResponse } from '../utils/types';

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
  ): Promise<IUserResponse> {
    return await this.userService.getUserDetailsWithBalance(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(BackendValidationPipe)
  @Get('')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchUserByUsername(
    @Query() searchUserDto: SearchUserDto,
  ): Promise<IUserResponse> {
    return await this.userService.findUserByUsername(searchUserDto);
  }
}
