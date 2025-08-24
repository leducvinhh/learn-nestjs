import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // passport will call this function with username and password parameters
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) return null;

    const isValid = this.usersService.isValidPassword(pass, user.password);
    if (!isValid) return null;

    const { password, ...result } = user;

    return result;
  }
}
