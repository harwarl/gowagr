import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

const ormconfig = (configService: ConfigService): PostgresConnectionOptions => {
  return {
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
  };
};

export default ormconfig;
