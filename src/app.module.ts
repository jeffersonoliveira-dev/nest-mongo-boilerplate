import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database/database.service';
import * as Joi from 'joi';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGO_CONNECTION_STRING: Joi.string().required(),
        MONGODB_DATABASE: Joi.string().required(),
      }),
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_CONNECTION_STRING');
        const dbName = configService.get<string>('MONGODB_DATABASE');
        return {
          uri,
          dbName,
        };
      },
      inject: [ConfigService],
    }),
    HealthModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
