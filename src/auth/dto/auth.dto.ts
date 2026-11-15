import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Exclude()
export class SignUpResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  access_token: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Exclude()
export class SignInResponseDto {
  @Expose()
  access_token: string;
}

export class UserResponseDto {
  @Exclude()
  hash: string;
}
