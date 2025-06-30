import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            format:winston.format.json(),
            transports: [new winston.transports.Console()]
        }),
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    controllers: [],
    providers: [PrismaService,ValidationService],
    exports: [PrismaService, ValidationService]
})
export class CommonModule {}
