import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    required: true,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
  })
  @IsString()
  last_name: string;
  
  @ApiProperty({
    example: 'JohnDoe@JohnDoe.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'JohnDoe',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'JohnDoe1232@!',
    required: true,
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: '08123456789',
    required: true,
  })
  @IsString()
  @IsNumberString()
  @Length(11, 13)
  phone_number: string;
}
