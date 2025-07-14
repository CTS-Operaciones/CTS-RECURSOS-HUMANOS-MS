import { EmployeeHasPositions } from 'cts-entities';
import { QueryRunner } from 'typeorm';

export interface IUpdateForCahngesInEmployeeHasPositions {
  eHp_deletes: EmployeeHasPositions[];
  eHp_creates: EmployeeHasPositions[];
  queryRunner?: QueryRunner;
}
