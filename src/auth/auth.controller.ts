import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/user.interface';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/account')
  @ResponseMessage('Get user information')
  getAccount(@User() user: IUser) {
    return { user };
  }

  @Public()
  @ResponseMessage('Get user by refresh token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, res);
  }

  @Public()
  @ResponseMessage('User login')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(
    @Req() req: Request & { user: IUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req.user, res);
  }

  @Post('register')
  @ResponseMessage('Register a new user')
  @Public()
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
}
