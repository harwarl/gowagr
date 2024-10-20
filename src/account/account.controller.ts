import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/user/decorators/currentUser.decorator';
import { TransferQueryDto } from './dto/transferQuery.dto';

@Controller('transfers')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
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
