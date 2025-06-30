import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    name: string;
    description: string;
    version: string;
    status: string;
  } {
    return {
      name: 'Nest Zero',
      description: 'Clean and minimal NestJS starter template.',
      version: '1.0.0',
      status: '🟢 Server is running',
    };
  }
}
