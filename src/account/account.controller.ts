import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/user/decorators/currentUser.decorator';
import { TransferQueryDto } from './dto/transferQuery.dto';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { BackendValidationPipe } from 'src/utils/pipes/backendValidation.pipes';

@ApiTags('Tranfer')
@ApiBearerAuth()
@Controller('transfers')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(BackendValidationPipe)
  @Post('')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTransfer(
    @CurrentUser('id') currentUserId: number,
    @Body() createTransferDto: CreateTransferDto,
  ): Promise<any> {
    return await this.accountService.createTransfer({
      ...createTransferDto,
      sender_id: currentUserId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @CurrentUser('id') currentUserId: number,
    @Query() paginationQuery: TransferQueryDto,
  ): Promise<any> {
    return await this.accountService.getUserTransactions(
      currentUserId,
      paginationQuery,
    );
  }
}
