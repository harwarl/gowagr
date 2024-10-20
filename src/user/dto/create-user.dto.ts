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
    description: 'The user first name',
    example: 'John',
    required: true,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The user last name',
    example: 'Doe',
    required: true,
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The user email address',
    example: 'JohnDoe@JohnDoe.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The user unique username',
    example: 'JohnDoe',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description:
      'The user password. Must be strong, with a minimum length of 8 characters, including a combination of letters, numbers, and special characters.',
    example: 'JohnDoe1232@!',
    required: true,
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'The user phone number',
    example: '08123456789',
    required: true,
  })
  @IsNumberString()
  @Length(11, 14)
  phone_number: string;
}
