import { IRelationsEnable } from './pagination.interface';

export interface IFindOne extends IRelationsEnable {
  term: string | number;
}

export interface IFindByIds extends IRelationsEnable {
  ids: number[];
}
