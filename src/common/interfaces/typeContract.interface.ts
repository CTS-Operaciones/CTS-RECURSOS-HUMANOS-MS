import { ITypeContract } from 'cts-entities';

export interface ICreateTypeContract extends Omit<ITypeContract, 'employees'> {}
