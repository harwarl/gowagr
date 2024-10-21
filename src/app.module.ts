import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UserModule,
    AccountModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (
        configService: ConfigService,
      ): Promise<CacheOptions<any>> => {
        const redisConfig = {
          url: `redis://${configService.get<string>('REDIS_USERNAME')}:${configService.get<string>('REDIS_PASS')}@${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}`,
        };
        try {
          const store = await redisStore(redisConfig);
          return {
            store,
            ttl: 60 * 5,
          };
        } catch (error) {
          console.error('Failed to initialize Redis store:', error);
          throw error;
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
