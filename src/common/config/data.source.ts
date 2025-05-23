import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';

import { envs } from './envs.validate';

export const ConfigDataSource: PostgresConnectionOptions = {
  type: 'postgres',
  host: envs.DB_SERVER,
  port: envs.DB_PORT,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DB_NAME,
  entities: [join(__dirname, '/../../**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '/../../../migrations/*.{ts,js}')],
  synchronize: false,
  logging: true,
};

export const AppDS = new DataSource(ConfigDataSource);
