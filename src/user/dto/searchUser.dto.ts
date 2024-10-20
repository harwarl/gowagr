import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchUserDto {
  @ApiProperty({
    description: 'Username of user to get',
  })
  @IsString()
  username: string;
}
