import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host:
    process.env['NODE_ENV'] === 'DEV' ? '127.0.0.1' : process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'], 10) || 5432,
  username:
    process.env['NODE_ENV'] === 'DEV' ? 'postgres' : process.env['DB_USERNAME'],
  password:
    process.env['NODE_ENV'] === 'DEV' ? 'root' : process.env['DB_PASSWORD'],
  database:
    process.env['NODE_ENV'] === 'DEV'
      ? 'gowagr_dev'
      : process.env['DB_DATABASE'],
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migration_table',
  // logging: true,
  // cache: {
  //   type: 'redis',
  //   options: {
  //     host:
  //       process.env['NODE_ENV'] === 'DEV'
  //         ? '127.0.0.1'
  //         : process.env['REDIS_HOST'],
  //     port: parseInt(process.env['REDIS_PORT'], 10) ?? 6379,
  //     username:
  //       process.env['NODE_ENV'] === 'DEV' ? '' : process.env['REDIS_USERNAME'],
  //     password:
  //       process.env['NODE_ENV'] === 'DEV'
  //         ? 'gowagr'
  //         : process.env['REDIS_PASS'],
  //   },
  // },
};

const PostgresDataSource = new DataSource(dataSourceOptions);

PostgresDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default PostgresDataSource;
