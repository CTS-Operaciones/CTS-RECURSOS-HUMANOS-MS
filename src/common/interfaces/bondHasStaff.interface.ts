import { IStaff, IBond } from 'cts-entities';

export interface IBoundHasStaff {
  staff: IStaff;
  bond: IBond;
}

export interface ICreateBondHasStaff {
  staff: number;
  bond: number;
}
