import 'dotenv/config';
import * as joi from 'joi';

interface EnvsVars {
  DB_TYPE: string;
  DB_NAME: string;
  DB_SERVER: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  PORT_APP: number;
  NATS_SERVERS: string[];
}

const envsSchema = joi
  .object({
    DB_TYPE: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_SERVER: joi.string().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_PORT: joi.number().required().positive(),
    PORT_APP: joi.number().required().positive(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Envs invalidos: ${error.message}`);
}

const envsVars: EnvsVars = value;

export const envs = {
  DB_TYPE: envsVars.DB_TYPE,
  DB_NAME: envsVars.DB_NAME,
  DB_SERVER: envsVars.DB_SERVER,
  DB_USER: envsVars.DB_USER,
  DB_PASSWORD: envsVars.DB_PASSWORD,
  DB_PORT: envsVars.DB_PORT,
  PORT_APP: envsVars.PORT_APP,
  NATS_SERVERS: envsVars.NATS_SERVERS,
};
