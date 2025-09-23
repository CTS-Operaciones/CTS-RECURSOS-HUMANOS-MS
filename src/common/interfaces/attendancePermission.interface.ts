import {
  ATTENDANCE_PERMISSION_TYPE,
  STATUS_VACATIONS_PERMISSION,
} from 'cts-entities';

export interface ICreateAttendancePermission {
  employee_id: number;
  permission_type: ATTENDANCE_PERMISSION_TYPE;
  start_date: Date;
  end_date: Date;
  time_start?: string;
  time_end?: string;
  reason: string;
  status?: STATUS_VACATIONS_PERMISSION;
  requested_at?: number;
}
