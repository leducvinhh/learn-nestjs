import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // passport will call this function with username and password parameters
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) return null;

    const isValid = this.usersService.isValidPassword(pass, user.password);
    if (!isValid) return null;

    return user;
  }

  createRefreshToken(payload: Record<string, string>) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')) / 1000,
    });
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token login',
          iss: 'from server',
          _id: _id.toString(),
          name,
          email,
          role,
        };
        const refreshToken = this.createRefreshToken(payload);
        await this.usersService.updateUserToken(refreshToken, _id.toString());

        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
          },
        };
      } else {
        throw new BadRequestException(
          'refresh_token is not valid, please login again!',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'refresh_token is not valid, please login again!',
      );
    }
  };

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id: _id.toString(),
      name,
      email,
      role,
    };
    const refreshToken = this.createRefreshToken(payload);
    await this.usersService.updateUserToken(refreshToken, _id);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  async register(user: RegisterUserDto) {
    const newUser = await this.usersService.register(user);

    return {
      _id: newUser._id,
      createdAt: newUser.createdAt,
    };
  }

  async logout(userId: string, response: Response) {
    const user = await this.usersService.findOne(userId);

    if (user) {
      const { _id } = user;
      await this.usersService.updateUserToken(null, _id.toString());

      response.clearCookie('refresh_token');

      return 'ok';
    }
  }
}
