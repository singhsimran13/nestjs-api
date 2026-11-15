import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { User } from '../auth/custom-decorators';
import { UserResponseDto } from '../auth/dto';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('user')
  getUser(@User() user: UserResponseDto) {
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Patch()
  editUser(@User('id') userId: number, @Body() editUserDto: EditUserDto) {
    return this.userService.editUser(userId, editUserDto);
  }
}
