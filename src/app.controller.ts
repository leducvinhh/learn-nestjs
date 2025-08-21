import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private envConfig: ConfigService,
  ) {}

  @Get()
  @Render('home')
  getHello() {
    const message = this.appService.getHello();
    const port = this.envConfig.get('PORT');

    return { message, port };
  }
}
