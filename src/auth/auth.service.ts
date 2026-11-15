import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  SignInDto,
  SignInResponseDto,
  SignUpDto,
  SignUpResponseDto,
} from './dto';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from '../config/env.keys';
import { AUTH_CONSTANTS, AUTH_ERROR_MESSAGES } from './constants';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    try {
      //generate the password hash
      const hash = await argon.hash(signUpDto.password);

      // save the user in the db
      const user = await this.prismaService.user.create({
        data: {
          email: signUpDto.email,
          hash,
        },
      });

      const access_token = await this.signedToken(user.id, user.email);
      // return the saved user
      return plainToInstance(SignUpResponseDto, { ...user, ...access_token });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(AUTH_ERROR_MESSAGES.USER_ALREADY_EXIST);
        }
      }
      throw error;
    }
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    // find the user by and email

    const user = await this.prismaService.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });

    // if user does not exist throw an exception
    if (!user) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // comapare password
    const pwdMatches = await argon.verify(user.hash, signInDto.password);

    if (!pwdMatches) {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return plainToInstance(
      SignInResponseDto,
      this.signedToken(user.id, user.email),
    );
  }

  async signedToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: AUTH_CONSTANTS.JWT_EXPIRATION,
      secret: this.configService.get(EnvKeys.JWT_SECRET),
    });

    return { access_token };
  }
}
