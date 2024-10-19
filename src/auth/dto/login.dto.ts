import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'JohnDoe@JohnDoe.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'JohnDoe1232@!',
    required: true,
  })
  password: string;
}
