import { ITypeContract } from 'cts-entities';

export interface ICreateTypeContract
  extends Omit<
    ITypeContract,
    | 'employees'
    | 'id'
    | 'created_at'
    | 'available'
    | 'updated_at'
    | 'deleted_at'
  > {}
