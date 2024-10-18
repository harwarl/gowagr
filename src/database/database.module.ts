import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host:
              configService.get('NODE_ENV') === 'DEV'
                ? '127.0.0.1'
                : configService.get('DB_HOST'),
            port: parseInt(configService.get('DB_PORT'), 10) || 5432,
            username:
              configService.get('NODE_ENV') === 'DEV'
                ? 'postgres'
                : configService.get('DB_USERNAME'),
            password:
              configService.get('NODE_ENV') === 'DEV'
                ? 'root'
                : configService.get('DB_PASSWORD'),
            database:
              configService.get('NODE_ENV') === 'DEV'
                ? 'gowagr_dev'
                : configService.get('DB_DATABASE'),
            entities: [join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: true,
            // migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
            logging: true,
          });

          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          return error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
