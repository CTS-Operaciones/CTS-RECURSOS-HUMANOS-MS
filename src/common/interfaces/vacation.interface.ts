import { STATUS_VACATIONS_PERMISSION } from 'cts-entities';

export interface ICreateVacation {
  employee: number;
  startDate: Date;
  endDate: Date;
  requested_day: number;
  status: STATUS_VACATIONS_PERMISSION;
  reason?: string;
  comment?: string;
}
