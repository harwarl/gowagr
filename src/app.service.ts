import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * @returns string
   */
  getHello(): string {
    return 'Hello World!';
  }
}
