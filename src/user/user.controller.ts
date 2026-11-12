import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '../auth/custom-decorators';
import { UserResponseDto } from '../auth/dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('user')
  getUser(@User() user: UserResponseDto) {
    return user;
  }
}
