import { STATUS_VACATIONS_PERMISSION } from 'cts-entities';

export interface ICreateVacation {
  employee: number;
  dateRange: IDatesRange[];
  requested_day: number;
  status: STATUS_VACATIONS_PERMISSION;
  reason?: string;
  comment?: string;
}

export interface IDatesRange {
  start: Date;
  end: Date;
}
