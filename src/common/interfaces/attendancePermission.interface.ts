import {
  ATTENDANCE_PERMISSION_TYPE,
  STATUS_VACATIONS_PERMISSION,
} from 'cts-entities';

export interface ICreateAttendancePermission {
  permission_type: ATTENDANCE_PERMISSION_TYPE;
  start_date: Date;
  end_date: Date;
  reason: string;
  status: STATUS_VACATIONS_PERMISSION;
  requested_at: number;
}
